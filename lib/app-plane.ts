import {
  CoreApplicationPlane,
  DetailType,
  EventManager,
} from "@cdklabs/sbt-aws";
import * as cdk from "aws-cdk-lib";
import * as fs from "node:fs";
import * as path from "node:path";
import { PolicyDocument } from "aws-cdk-lib/aws-iam";

export interface AppPlaneProps extends cdk.StackProps {
  eventBusArn: string;
}
export class AppPlaneStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: AppPlaneProps) {
    super(scope, id, props);
    const provisioningJobRunnerProps = {
      name: "provisioning",
      permissions: PolicyDocument.fromJson(
        JSON.parse(`
        {
          "Version":"2012-10-17",
          "Statement":[
              {
                "Action":[
                    "*"
                ],
                "Resource":"*",
                "Effect":"Allow"
              }
          ]
        }
  `)
      ),
      script: fs.readFileSync(
        path.resolve(__dirname, "..", "scripts", "provision-tenant.sh"),
        "utf8"
      ),
      postScript: "",
      environmentJSONVariablesFromIncomingEvent: [
        "tenantId",
        "tier",
        "tenantName",
        "email",
        "tenantStatus",
        "siteTitle",
        "tenantSlug",
      ],
      environmentVariablesToOutgoingEvent: ["tenantStatus"],
      scriptEnvironmentVariables: {
        TEST: "test",
      },
      outgoingEvent: DetailType.PROVISION_SUCCESS,
      incomingEvent: DetailType.ONBOARDING_REQUEST,
    };

    new CoreApplicationPlane(this, "CoreApplicationPlane", {
      eventBusArn: props.eventBusArn,
      jobRunnerPropsList: [provisioningJobRunnerProps],
    });
  }
}
