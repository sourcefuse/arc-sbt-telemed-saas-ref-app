import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";

export class VpcCdkStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props: cdk.StackProps & { cidrBlock: string }
  ) {
    super(scope, id, props);

    // Create a new VPC with public and private subnets
    const cidr = props.cidrBlock;
    const vpc = new ec2.Vpc(this, "VPC", {
      ipAddresses: ec2.IpAddresses.cidr(cidr),
      maxAzs: 2,
      natGateways: 1,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "Public",
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: "Private",
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
      ],
    });

    new cdk.CfnOutput(this, "VpcID", {
      value: vpc.vpcId,
      description: "Identifier for this VPC",
    });
    new cdk.CfnOutput(this, "vpcCidrBlock", {
      value: vpc.vpcCidrBlock,
      description: "CIDR range for this VPC",
    });
    new cdk.CfnOutput(this, "privateSubnets", {
      value: JSON.stringify(vpc.privateSubnets.map((e) => e.subnetId)),
      description: "List of private subnets in this VPC",
    });
    new cdk.CfnOutput(this, "publicSubnets", {
      value: JSON.stringify(vpc.publicSubnets.map((e) => e.subnetId)),
      description: "List of public subnets in this VPC",
    });
    new cdk.CfnOutput(this, "availabilityZones", {
      value: JSON.stringify(vpc.availabilityZones),
      description: "AZs for this VPC",
    });
  }
}
