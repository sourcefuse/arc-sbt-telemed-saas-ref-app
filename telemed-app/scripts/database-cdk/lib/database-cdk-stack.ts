import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as rds from "aws-cdk-lib/aws-rds";

export class AuroraServerlessPostgresStack extends cdk.Stack {
  private vpcId: string;
  constructor(
    scope: cdk.App,
    id: string,
    props: cdk.StackProps & { vpcId: string }
  ) {
    super(scope, id, props);
    this.vpcId = props.vpcId;
    const vpc = ec2.Vpc.fromLookup(this, "VPC", {
      vpcId: this.vpcId,
    });

    // Create a security group that allows inbound traffic on port 5432 from vpc cidr¸
    const securityGroup = new ec2.SecurityGroup(this, "AuroraSecurityGroup", {
      vpc,
      description: "Allow inbound traffic on port 5432",
      allowAllOutbound: true,
    });
    securityGroup.addIngressRule(
      ec2.Peer.ipv4(vpc.vpcCidrBlock),
      ec2.Port.tcp(5432),
      "Allow inbound traffic on port 5432 from any IP"
    );

    const cluster = new rds.DatabaseCluster(this, "Database", {
      engine: rds.DatabaseClusterEngine.AURORA_POSTGRESQL,
      parameterGroup: rds.ParameterGroup.fromParameterGroupName(
        this,
        "ParameterGroup",
        "default.aurora-postgresql15"
      ),
      writer: rds.ClusterInstance.serverlessV2("writer"),
      readers: [
        rds.ClusterInstance.serverlessV2("reader1", {
          scaleWithWriter: true,
        }),
      ],
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      monitoringInterval: cdk.Duration.seconds(0),
      securityGroups: [securityGroup],
      iamAuthentication: true,
    });

    const proxy = cluster.addProxy("mainproxy", {
      vpc,
      secrets: [cluster.secret!],
      iamAuth: true,
      securityGroups: [securityGroup],
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
    });

    // Output the cluster endpoint
    new cdk.CfnOutput(this, "ClusterEndpoint", {
      value: cluster.clusterEndpoint.hostname,
      description: "Aurora Serverless PostgreSQL Cluster Endpoint",
    });
    new cdk.CfnOutput(this, "RDSProxyEndpoint", {
      value: proxy.endpoint,
      description: "RDS Proxy Endpoint",
    });
    new cdk.CfnOutput(this, "ClusterSecretName", {
      value: cluster.secret?.secretName ?? "",
      description: "Cluster Secrets Name",
    });
    new cdk.CfnOutput(this, "ClusterSecretArn", {
      value: cluster.secret?.secretArn ?? "",
      description: "Cluster Secrets Arn",
    });
  }
}
