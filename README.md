# arc-sbt-telemed-saas-ref-app

## Get Started

In order to deploy the Telemedicine Example SaaS app, first store the saas config secret in your target AWS Account.

Paste the following example config in the `Plaintext` tab when storing the secret, and modify it as per the requirement.

```JSON
{
    "systemAdminEmail": "shubham.prajapat+systemadmin@sourcefuse.com",
    "codeCommitRepoName": "aws-sbt-ref-solution-arc-telemed-serverless",
    "codeCommitRepoDescription": "ARC Serverless SaaS with AWS SBT Reference Architecture Repository.",
    "cloudformationStackPrefix": "TelemedSaaSPrivate",
    "hostedZoneName": "arc-poc.link",
    "customDomain": "telemed-saas.arc-poc.link",
    "customDomainCertificateArn": "arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/uuid",
    "vpcCidr": "10.0.0.0/16",
    "secretsPrefix": "/telemed-saas",
    "vonageApiKey": "12345678",
    "vonageApiSecret": "xyzabcd",
    "pubnubSubscribeKey":"sub-c-xxxx",
    "pubnubPublishKey": "pub-c-xxxx",
    "pubnubSecretKey": "sec-c-xxxx",
    "jwtSecret": "secret"
}
```

After storing the secret, copy its name from console and change it in the `scripts/env.sh` and `scripts/provision-tenant.sh` file in the `SAAS_CONFIG_SECRET_NAME` variable.

That's it.

Now run the `initial-deploy.sh` file from the root of this repository using the following command:

```sh
./scripts/initial-deploy.sh
```

This will deploy all of the required stacks containing the resources needed to run and operate the SaaS app. Check the logs it returns for more information.

When you want to clean up the resources run the following command from the project root:

```sh
./scripts/cleanup.sh
```
