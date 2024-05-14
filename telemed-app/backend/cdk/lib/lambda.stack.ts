import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigatewayv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as apigatewayv2Integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as path from "path";

import * as route53 from "aws-cdk-lib/aws-route53";
import * as certmgr from "aws-cdk-lib/aws-certificatemanager";
import * as targets from "aws-cdk-lib/aws-route53-targets";

export interface LambdaStackProps extends cdk.StackProps {
  hostedZoneName: string;
  customDomain: string;
  customDomainCertArn: string;
  absoluteCodePath: string;
  lambdaEnvs: { [key: string]: string };
}

export class LambdaStack extends cdk.Stack {
  private lambdaFunction: cdk.aws_lambda.DockerImageFunction;
  private customDomainName?: cdk.aws_apigatewayv2.DomainName;
  private hostedZone?: cdk.aws_route53.IHostedZone;
  private fullDomainName?: string;
  constructor(scope: cdk.App, id: string, props: LambdaStackProps) {
    super(scope, id, props);
    const lambdaEnvs = props.lambdaEnvs;
    const codeDirectory = props.absoluteCodePath;
    const config = {
      domainName: props.customDomain,
      certificateArn: props.customDomainCertArn,
      hostedZoneDomainName: props.hostedZoneName,
    };

    // console.log(config);
    // console.log(lambdaEnvs);

    // Create the Lambda function using the Docker image from ECR
    this.createLambdaFunction(codeDirectory, lambdaEnvs);

    this.createHttpApiWithLambda(id, {
      certificateArn: config.certificateArn,
      domainName: config.domainName,
      hostedZoneDomainName: config.hostedZoneDomainName,
    });

    new cdk.CfnOutput(this, "DomainName", {
      value: this.customDomainName?.name ?? "",
      description: "Custom Domain Name of the Backend Service.",
    });
  }

  createLambdaFunction(
    codeDirectory: string,
    lambdaEnvs?: { [key: string]: string }
  ) {
    this.lambdaFunction = new lambda.DockerImageFunction(
      this,
      "LambdaFunction",
      {
        code: lambda.DockerImageCode.fromImageAsset(
          path.resolve(codeDirectory)
        ),
        timeout: cdk.Duration.minutes(1),
        memorySize: 1024,
        architecture: lambda.Architecture.X86_64,
        ephemeralStorageSize: cdk.Size.gibibytes(2),
        environment: lambdaEnvs,
      }
    );

    // Grant the Lambda function permission to access ECR
    this.lambdaFunction.role?.addManagedPolicy(
      cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
        "AmazonEC2ContainerRegistryReadOnly"
      )
    );
  }

  createHttpApiWithLambda(
    apiName: string,
    customDomainConfig?: {
      domainName: string;
      hostedZoneDomainName?: string;
      certificateArn: string;
    }
  ) {
    if (customDomainConfig) {
      // Create a custom domain name for the API Gateway
      this.fullDomainName = customDomainConfig.domainName;
      this.hostedZone = route53.HostedZone.fromLookup(this, "HostedZone", {
        domainName:
          customDomainConfig.hostedZoneDomainName ??
          customDomainConfig.domainName,
      });

      const certificate = certmgr.Certificate.fromCertificateArn(
        this,
        "Certificate",
        customDomainConfig.certificateArn
      );

      this.customDomainName = new apigatewayv2.DomainName(
        this,
        "CustomDomainName",
        {
          domainName: this.fullDomainName,
          certificate: certificate,
        }
      );
    }

    // Create an HTTP API
    const lambdaIntegration =
      new apigatewayv2Integrations.HttpLambdaIntegration(
        "FnIntegration",
        this.lambdaFunction
      );
    const httpApi = new apigatewayv2.HttpApi(this, apiName, {
      defaultIntegration: lambdaIntegration,
      createDefaultStage: true,

      ...(this.customDomainName
        ? {
            defaultDomainMapping: {
              domainName: this.customDomainName,
            },
          }
        : {}),
    });

    if (customDomainConfig && this.customDomainName && this.hostedZone) {
      // Create an A record for the custom domain name
      new route53.ARecord(this, "ApiGatewayARecord", {
        recordName: this.fullDomainName,
        zone: this.hostedZone,
        target: route53.RecordTarget.fromAlias(
          new targets.ApiGatewayv2DomainProperties(
            this.customDomainName.regionalDomainName,
            this.customDomainName.regionalHostedZoneId
          )
        ),
        deleteExisting: true,
      });
    }
  }
}
