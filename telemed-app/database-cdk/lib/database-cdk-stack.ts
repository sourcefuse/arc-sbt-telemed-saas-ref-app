import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as rds from "aws-cdk-lib/aws-rds";

export class AuroraServerlessPostgresStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a new VPC with public and private subnets
    const vpc = new ec2.Vpc(this, "VPC", {
      ipAddresses: ec2.IpAddresses.cidr("10.0.0.0/16"),
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
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });

    // Create a security group that allows inbound traffic on port 5432 from any IP
    const securityGroup = new ec2.SecurityGroup(
      this,
      "AuroraPublicSecurityGroup",
      {
        vpc,
        description: "Allow inbound traffic on port 5432",
        allowAllOutbound: true,
      }
    );
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(5432),
      "Allow inbound traffic on port 5432 from any IP"
    );

    // public subnet group for the Aurora Serverless cluster
    /* const publicSubnetGroup = new rds.SubnetGroup(this, "PublicSubnetGroup", {
      subnetGroupName: "TelemedSaaS-SGN",
      vpc: vpc,
      description: "Public subnet group for Aurora Serverless PostgreSQL",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
    }); */

    const cluster = new rds.DatabaseCluster(this, "Database", {
      engine: rds.DatabaseClusterEngine.AURORA_POSTGRESQL,
      parameterGroup: rds.ParameterGroup.fromParameterGroupName(
        this,
        "ParameterGroup",
        "default.aurora-postgresql15"
      ),
      writer: rds.ClusterInstance.serverlessV2("writer", {
        publiclyAccessible: true,
      }),
      readers: [
        rds.ClusterInstance.serverlessV2("reader1", {
          publiclyAccessible: true,
        }),
        // rds.ClusterInstance.serverlessV2('reader2'),
      ],
      vpc,
      vpcSubnets: {
        // subnets: vpc.publicSubnets,
        subnetType: ec2.SubnetType.PUBLIC,
      },
      monitoringInterval: cdk.Duration.seconds(0),
      securityGroups: [securityGroup],
    });

    // Output the cluster endpoint
    new cdk.CfnOutput(this, "ClusterEndpoint", {
      value: cluster.clusterEndpoint.hostname,
      description: "Aurora Serverless PostgreSQL Cluster Endpoint",
    });
    new cdk.CfnOutput(this, "ClusterSecretName", {
      value: cluster.secret?.secretName ?? "",
      description: "Cluster Secrets Name",
    });
  }
}
