import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import * as ec2 from "aws-cdk-lib/aws-ec2";

import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";

export interface LambdaStackProps extends cdk.StackProps {
  absoluteCodePath: string;
  dbSecretArn: string;
  vpcId: string;
}

export class LambdaStack extends cdk.Stack {
  private lambdaFunction: cdk.aws_lambda.DockerImageFunction;
  private dbSecretArn: string;
  private vpcId: string;
  constructor(scope: cdk.App, id: string, props: LambdaStackProps) {
    super(scope, id, props);
    const codeDirectory = props.absoluteCodePath;
    this.vpcId = props.vpcId;
    this.dbSecretArn = props.dbSecretArn;

    // Create the Lambda function
    this.createLambdaFunction(codeDirectory);

    new cdk.CfnOutput(this, "FunctionName", {
      value: this.lambdaFunction?.functionName ?? "",
      description: "The name of the migration lambda function.",
    });
    new cdk.CfnOutput(this, "FunctionArn", {
      value: this.lambdaFunction?.functionArn ?? "",
      description: "The function arn of the migration lambda function.",
    });
  }

  createLambdaFunction(
    codeDirectory: string,
    lambdaEnvs?: { [key: string]: string }
  ) {
    const vpc = ec2.Vpc.fromLookup(this, "LambdaVPC", {
      vpcId: this.vpcId,
    });
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
        vpc,
        vpcSubnets: {
          subnets: vpc.privateSubnets,
        },
        environment: lambdaEnvs,
      }
    );

    // grant the permission to access ECR
    this.lambdaFunction.role?.addManagedPolicy(
      cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
        "AmazonEC2ContainerRegistryReadOnly"
      )
    );

    // grant the permission to create network interface for vpc access
    this.lambdaFunction.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        resources: ["*"],
        actions: [
          "ec2:CreateNetworkInterface",
          "ec2:DeleteNetworkInterface",
          "ec2:DescribeNetworkInterfaces",
        ],
      })
    );

    // grant the permission to connect to rds proxy using iam authentication
    this.lambdaFunction.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        resources: ["*"],
        actions: ["rds-db:connect"],
      })
    );

    // grant the permission to access the db secret value
    this.lambdaFunction.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        resources: [this.dbSecretArn],
        actions: ["secretsmanager:GetSecretValue"],
      })
    );
  }
}
