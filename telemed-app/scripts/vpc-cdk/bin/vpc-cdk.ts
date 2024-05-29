#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { VpcCdkStack } from "../lib/vpc-cdk-stack";

if (!process.env.CIDR_BLOCK) {
  throw Error("CIDR_BLOCK is required to deploy the vpc.");
}

const app = new cdk.App();
new VpcCdkStack(app, process.env.STACK_NAME ?? "VPCStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  cidrBlock: process.env.CIDR_BLOCK,
});
