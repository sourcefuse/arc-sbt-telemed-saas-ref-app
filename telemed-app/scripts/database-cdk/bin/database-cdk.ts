#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { AuroraServerlessPostgresStack } from "../lib/database-cdk-stack";

if (!process.env.VPC_ID) {
  throw Error("VPC_ID is required to deploy the db stack.");
}

const app = new cdk.App();
new AuroraServerlessPostgresStack(
  app,
  process.env.DB_STACK_NAME ?? "DatabaseStack",
  {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
    },
    vpcId: process.env.VPC_ID,
  }
);
