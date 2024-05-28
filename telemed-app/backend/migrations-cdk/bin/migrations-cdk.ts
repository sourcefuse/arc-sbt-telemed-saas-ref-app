#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { LambdaStack } from "../lib/lambda.stack";

if (!process.env.MIGRATION_SOURCE_PATH) {
  throw Error(
    "MIGRATION_SOURCE_PATH is required to deploy the migrations stack."
  );
}

if (!process.env.DB_SECRET_ARN) {
  throw Error("DB_SECRET_ARN is required to deploy the migrations stack.");
}

if (!process.env.VPC_ID) {
  throw Error("VPC_ID is required to deploy the migrations stack.");
}

const app = new cdk.App();
new LambdaStack(app, process.env.STACK_NAME ?? "MigrationsCdkStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  absoluteCodePath: process.env.MIGRATION_SOURCE_PATH,
  dbSecretArn: process.env.DB_SECRET_ARN,
  vpcId: process.env.VPC_ID,
});
