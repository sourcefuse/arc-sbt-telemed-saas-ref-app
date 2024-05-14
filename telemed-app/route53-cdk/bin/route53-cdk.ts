#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { Route53CdkStack } from "../lib/route53-cdk-stack";

if (
  [
    process.env.STACK_NAME,
    process.env.HOSTED_ZONE,
    process.env.RECORD_NAME,
    process.env.TARGET_DOMAIN_NAME,
  ].some((e) => !!e === false)
) {
  throw Error("Required environment variables are not set.");
}

const app = new cdk.App();
new Route53CdkStack(app, process.env.STACK_NAME ?? "Route53CdkStack-Unnamed", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  recordName: process.env.RECORD_NAME ?? "",
  hostedZoneName: process.env.HOSTED_ZONE ?? "",
  targetDomainName: process.env.TARGET_DOMAIN_NAME ?? "",
});
