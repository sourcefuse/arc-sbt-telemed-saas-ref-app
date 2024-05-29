import * as cdk from "aws-cdk-lib";
import * as secrets from "aws-cdk-lib/aws-secretsmanager";

import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class SecretManagerCdkStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props: cdk.StackProps & {
      secretName: string;
      secretValueObject: Record<string, string | number>;
    }
  ) {
    super(scope, id, props);

    const secretName = props.secretName;
    const secretValueObject: Record<string, cdk.SecretValue> = {};

    for (let key in props.secretValueObject) {
      secretValueObject[key] = new cdk.SecretValue(
        props.secretValueObject[key]
      );
    }

    const secret = new secrets.Secret(this, "Secret", {
      secretName,
      secretObjectValue: secretValueObject,
    });

    // Output the cluster endpoint
    new cdk.CfnOutput(this, "SecretArn", {
      value: secret.secretArn,
      description: "Secret ARN",
    });
    new cdk.CfnOutput(this, "SecretName", {
      value: secret.secretName,
      description: "Secret Name",
    });
  }
}
