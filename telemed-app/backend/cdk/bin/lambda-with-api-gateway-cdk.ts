#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { LambdaStack } from "../lib/lambda.stack";

if (!process.env.SOURCE_CODE_PATH) {
  throw Error("SOURCE_CODE_PATH is required to deploy the lambda stack.");
}

const app = new cdk.App();
new LambdaStack(app, process.env.STACK_NAME ?? "LambdaStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  customDomain: process.env.DOMAIN_NAME ?? "",
  customDomainCertArn: process.env.CERTIFICATE_ARN ?? "",
  hostedZoneName: process.env.HOSTED_ZONE_NAME ?? "",
  absoluteCodePath: process.env.SOURCE_CODE_PATH ?? "",
  lambdaEnvs: process.env.LAMBDA_ENVS
    ? JSON.parse(process.env.LAMBDA_ENVS)
    : {},
});
