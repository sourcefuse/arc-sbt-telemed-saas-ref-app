import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as route53 from "aws-cdk-lib/aws-route53";

export interface Route53RecordStackProps extends cdk.StackProps {
  hostedZoneName: string;
  recordName: string;
  targetDomainName: string;
}

export class Route53CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: Route53RecordStackProps) {
    super(scope, id, props);

    const customDomainName = props.recordName;
    const hostedZoneName = props.hostedZoneName;
    const targetDomainName = props.targetDomainName;

    const hostedZone = route53.HostedZone.fromLookup(this, "HostedZone", {
      domainName: hostedZoneName,
    });

    new route53.CnameRecord(this, "AlternateDomainRecord", {
      recordName: customDomainName,
      zone: hostedZone,
      deleteExisting: true,
      domainName: targetDomainName,
      comment: "CNAME record for alternate domain",
    });
  }
}
