#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { SecretManagerCdkStack } from "../lib/secret-manager-cdk-stack";

// required input parameters
if (!process.env.SECRET_NAME) {
  throw new Error("SECRET_NAME is required.");
}

if (!process.env.SECRET_VALUE_OBJECT) {
  throw new Error("SECRET_VALUE_OBJECT is required.");
}

const app = new cdk.App();
new SecretManagerCdkStack(
  app,
  process.env.STACK_NAME ?? "SecretManagerCdkStack",
  {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
    },
    secretName: process.env.SECRET_NAME,
    secretValueObject: JSON.parse(process.env.SECRET_VALUE_OBJECT),
  }
);
