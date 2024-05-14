#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ControlPlaneStack } from "../lib/control-plane";
import { AppPlaneStack } from "../lib/app-plane";

// required input parameters
if (!process.env.SBT_PARAM_SYSTEM_ADMIN_EMAIL) {
  throw new Error("Please provide system admin email");
}

const globalConfig = {
  systemAdminEmail: process.env.SBT_PARAM_SYSTEM_ADMIN_EMAIL,
  ctrlPlaneStackName:
    process.env.SBT_PARAM_CONTROL_PLANE_STACK_NAME ?? "ControlPlaneStack",
  appPlaneStackName:
    process.env.SBT_PARAM_APP_PLANE_STACK_NAME ?? "AppPlaneStack",
};

const app = new cdk.App();

const cp = new ControlPlaneStack(app, globalConfig.ctrlPlaneStackName, {
  systemAdminEmail: globalConfig.systemAdminEmail,
});
const ap = new AppPlaneStack(app, globalConfig.appPlaneStackName, {
  eventBusArn: cp.eventBusArn,
});
