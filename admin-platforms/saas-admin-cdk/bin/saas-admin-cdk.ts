#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { StaticWebsiteStack } from "./../lib/static-website-stack";

const app = new cdk.App();

new StaticWebsiteStack(app, process.env.STACK_NAME ?? "SaaSAdminUI", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  hostedZoneName: process.env.HOSTED_ZONE_NAME ?? "",
  customDomain: process.env.CUSTOM_DOMAIN ?? "",
  customDomainCertArn: process.env.CERTIFICATE_ARN ?? "",
});
