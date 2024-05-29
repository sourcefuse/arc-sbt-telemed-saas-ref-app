# ARC + AWS SBT: Telemedicine SaaS Reference Solution

This repository contains a reference solution for building a multi-tenant Telemedicine SaaS application using AWS SaaS Builder Toolkit (SBT) and ARC by SourceFuse. The solution demonstrates how to leverage these powerful tools to rapidly develop and deploy a scalable, secure, and efficient Telemedicine SaaS application.

## Architecture Overview

The Telemedicine SaaS application is built using a combination of AWS SBT and ARC by SourceFuse. The architecture consists of two main components:

![Solution Architecture](https://i.imgur.com/yMFMenS.png)

1. **Control Plane**: Powered by AWS SBT, the Control Plane is responsible for managing the multi-tenant aspects of the SaaS application, such as tenant onboarding, offboarding, user management, billing, and metrics. The SBT establishes a clear separation of concerns between these two planes and provides a framework for communication between them through Amazon EventBridge, a serverless event bus.

2. **Application Plane**: Built using ARC by SourceFuse, the Application Plane handles the core functionality of the Telemedicine application. The Telemedicine SaaS App is built using ARC UI's Angular Boilerplate and leverages various Prebuilt ARC Backend Services, such as Authentication Service, Notification Service, Video Conferencing Service etc. These services are deployed as AWS Lambda functions.

The communication between the Control Plane and the Application Plane is facilitated by Amazon EventBridge, which triggers Tenant Operation Workflows (AWS CodeBuild) to provision or deprovision tenant-specific resources based on the selected tier (Basic, Standard, or Premium).

## Getting Started

To deploy the Telemedicine Example SaaS app, follow these steps:

1. Store the required configuration as a secret inside AWS Secrets Manager in your target AWS Account. Use the following example config in the `Plaintext` tab when storing the secret, and modify it as per your requirements:

   ```json
   {
     "systemAdminEmail": "admin@example.com",
     "codeCommitRepoName": "aws-sbt-ref-solution-arc-telemed-serverless",
     "codeCommitRepoDescription": "ARC Serverless SaaS with AWS SBT Reference Architecture Repository.",
     "cloudformationStackPrefix": "TelemedSaaS",
     "hostedZoneName": "example.com",
     "customDomain": "telemed-saas.example.com",
     "customDomainCertificateArn": "arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/uuid",
     "vpcCidr": "10.0.0.0/16",
     "secretsPrefix": "/telemed-saas",
     "vonageApiKey": "12345678",
     "vonageApiSecret": "xyzabcd",
     "pubnubSubscribeKey": "sub-c-xxxx",
     "pubnubPublishKey": "pub-c-xxxx",
     "pubnubSecretKey": "sec-c-xxxx",
     "jwtSecret": "secret"
   }
   ```

2. Copy the secret name from the console and update it in the `scripts/env.sh` and `scripts/provision-tenant.sh` files in the `SAAS_CONFIG_SECRET_NAME` variable.

3. Run the `initial-deploy.sh` script from the root of this repository using the following command:

   ```sh
   ./scripts/initial-deploy.sh
   ```

   This will deploy all the required stacks containing the resources needed to run and operate the SaaS app.

## Cleanup

To clean up the deployed resources, run the following command from the project root:

```sh
./scripts/cleanup.sh
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request.
