#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { StaticWebsiteStack } from "../lib/static-website-stack";

const app = new cdk.App();

// required input parameters
if (!process.env.STACK_NAME) {
  throw new Error("Please provide STACK_NAME environment variable.");
}
if (!process.env.BUILD_PATH) {
  throw new Error("Please provide BUILD_PATH environment variable.");
}

new StaticWebsiteStack(app, process.env.STACK_NAME, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  hostedZoneName: process.env.HOSTED_ZONE_NAME ?? "",
  customDomain: process.env.CUSTOM_DOMAIN ?? "",
  customDomainWildCard: process.env.CUSTOM_DOMAIN_WILDCARD ?? "",
  customDomainCertArn: process.env.CERTIFICATE_ARN ?? "",
  buildPath: process.env.BUILD_PATH ?? "",
});
