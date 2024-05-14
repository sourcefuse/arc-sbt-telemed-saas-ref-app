import { CognitoAuth, ControlPlane } from "@cdklabs/sbt-aws";
import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";

export class ControlPlaneStack extends Stack {
  public readonly regApiGatewayUrl: string;
  public readonly idpDetails: any;
  public readonly eventBusArn: string;
  public readonly cognitoClientId: string;

  constructor(
    scope: Construct,
    id: string,
    props: { systemAdminEmail: string } & StackProps
  ) {
    super(scope, id, props);
    const cognitoAuth = new CognitoAuth(this, "CognitoAuth", {
      idpName: "COGNITO",
      systemAdminRoleName: "SystemAdmin",
      systemAdminEmail: props.systemAdminEmail,
    });

    const controlPlane = new ControlPlane(this, "MyControlPlane", {
      auth: cognitoAuth,
    });

    this.eventBusArn = controlPlane.eventBusArn;
    this.idpDetails = cognitoAuth.controlPlaneIdpDetails;
    this.cognitoClientId = cognitoAuth.clientId;
    this.regApiGatewayUrl = controlPlane.controlPlaneAPIGatewayUrl;
  }
}
