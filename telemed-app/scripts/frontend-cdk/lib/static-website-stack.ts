import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3Deployment from "aws-cdk-lib/aws-s3-deployment";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as path from "node:path";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as certmgr from "aws-cdk-lib/aws-certificatemanager";
import * as targets from "aws-cdk-lib/aws-route53-targets";

export interface StaticWebsiteProps extends cdk.StackProps {
  hostedZoneName: string;
  customDomain: string;
  customDomainWildCard: string;
  customDomainCertArn: string;
  buildPath: string;
}

export class StaticWebsiteStack extends cdk.Stack {
  public readonly distributionDomainName: cdk.CfnOutput;
  public readonly customDomainName: cdk.CfnOutput;

  constructor(scope: cdk.App, id: string, props: StaticWebsiteProps) {
    super(scope, id, props);

    const hostedZoneDomainName = props.hostedZoneName;
    const customDomainName = props.customDomain;
    const customDomainNameWildCard = props.customDomainWildCard;
    const certificateArn = props.customDomainCertArn;
    const hostedZone = route53.HostedZone.fromLookup(this, "HostedZone", {
      domainName: hostedZoneDomainName,
    });

    // S3 bucket to host the static website
    const bucket = new s3.Bucket(this, "bucket", {
      publicReadAccess: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "404.html",
    });

    // Upload the local build files to the S3 bucket
    const deployment = new s3Deployment.BucketDeployment(
      this,
      "bucket-deployment",
      {
        sources: [s3Deployment.Source.asset(path.resolve(props.buildPath))],
        destinationBucket: bucket,
      }
    );

    // CloudFront distribution with the S3 bucket as the origin
    const distribution = new cloudfront.Distribution(
      this,
      "WebsiteDistribution",
      {
        comment: "ARC Pooled Telemed App Frontend",
        defaultBehavior: {
          origin: new origins.S3Origin(bucket),
        },
        defaultRootObject: "index.html",
        domainNames: [customDomainNameWildCard],
        certificate: certmgr.Certificate.fromCertificateArn(
          this,
          "Certificate",
          certificateArn // Replace with your ACM certificate ARN
        ),
        errorResponses: [
          {
            httpStatus: 404,
            responseHttpStatus: 200,
            responsePagePath: "/index.html",
            ttl: cdk.Duration.minutes(2),
          },
        ],
      }
    );

    // Invalidate the CloudFront distribution after the deployment
    deployment.node.addDependency(distribution);

    new route53.ARecord(this, "AliasRecord", {
      zone: hostedZone,
      target: route53.RecordTarget.fromAlias(
        new targets.CloudFrontTarget(distribution)
      ),
      recordName: customDomainName,
    });

    // Output the CloudFront distribution domain name
    this.distributionDomainName = new cdk.CfnOutput(
      this,
      "DistributionDomainName",
      {
        value: distribution.distributionDomainName,
        description: "The domain name of the CloudFront distribution",
      }
    );
    this.customDomainName = new cdk.CfnOutput(this, "CustomDomainName", {
      value: `https://${customDomainName}`,
      description:
        "The custom domain name added to the CloudFront distribution",
    });
  }
}
