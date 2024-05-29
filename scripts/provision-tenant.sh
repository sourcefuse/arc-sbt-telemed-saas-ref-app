# Install runtime dependencies
sudo yum update -y
sudo yum install -y nodejs
sudo yum install -y jq
sudo yum install -y python3-pip
sudo yum install -y npm
sudo npm install -g aws-cdk
sudo python3 -m pip install --upgrade setuptools
sudo python3 -m pip install git-remote-codecommit

##############################################
####### Set Environment Variables ############
##############################################

SAAS_CONFIG_SECRET_NAME="/telemed-saas/config" ## Modify this secret name with the secret you created and stored saas config in.

## Tenant Inputs

# remove starting and closing quotes from the values
export TENANT_ID=$(echo "$tenantId" | sed -e 's/^"//' -e 's/"$//')
export TENANT_NAME=$(echo "$tenantName" | sed -e 's/^"//' -e 's/"$//')
export TENANT_EMAIL=$(echo "$email" | sed -e 's/^"//' -e 's/"$//')
export TENANT_TIER=$(echo "$tier" | sed -e 's/^"//' -e 's/"$//')
export TENANT_APP_TITLE=$(echo "$siteTitle" | sed -e 's/^"//' -e 's/"$//')
export TENANT_SLUG=$(echo "$tenantSlug" | sed -e 's/^"//' -e 's/"$//')
export SITE_TITLE=$TENANT_APP_TITLE


SAAS_CONFIG_SECRET_VALUE=$(aws secretsmanager get-secret-value --secret-id $SAAS_CONFIG_SECRET_NAME --query SecretString --output text)

PROJECT_ROOT=$PWD
REGION=$AWS_REGION

STACK_NAME_PREFIX=$(echo "$SAAS_CONFIG_SECRET_VALUE" | jq -r '.cloudformationStackPrefix')

## SBT_PARAMS
SYSTEM_ADMIN_EMAIL=$(echo "$SAAS_CONFIG_SECRET_VALUE" | jq -r '.systemAdminEmail')
CODE_COMMIT_REPOSITORY_NAME=$(echo "$SAAS_CONFIG_SECRET_VALUE" | jq -r '.codeCommitRepoName')
CODE_COMMIT_REPOSITORY_DESCRIPTION=$(echo "$SAAS_CONFIG_SECRET_VALUE" | jq -r '.codeCommitRepoDescription')
CONTROL_PLANE_STACK_NAME="$STACK_NAME_PREFIX-ControlPlane"
APP_PLANE_STACK_NAME="$STACK_NAME_PREFIX-AppPlane"

## App Specific Params
### Custom Domain Config
APP_PARAM_HOSTED_ZONE_NAME=$(echo "$SAAS_CONFIG_SECRET_VALUE" | jq -r '.hostedZoneName')
APP_PARAM_CUSTOM_DOMAIN=$(echo "$SAAS_CONFIG_SECRET_VALUE" | jq -r '.customDomain')
APP_PARAM_CUSTOM_DOMAIN_CERT_ARN=$(echo "$SAAS_CONFIG_SECRET_VALUE" | jq -r '.customDomainCertificateArn') # certificate for *.$APP_PARAM_CUSTOM_DOMAIN (eg. *.example.com)
APP_PARAM_SAAS_ADMIN_FRONTEND_CUSTOM_DOMAIN="saas-admin.$APP_PARAM_CUSTOM_DOMAIN"
APP_PARAM_APP_CUSTOM_DOMAIN="$TENANT_SLUG.$APP_PARAM_CUSTOM_DOMAIN"
APP_PARAM_FRONTEND_WILDCARD_DOMAIN="*.$APP_PARAM_CUSTOM_DOMAIN"
APP_PARAM_AUTH_SERVICE_CUSTOM_DOMAIN="auth-service-$TENANT_SLUG.$APP_PARAM_CUSTOM_DOMAIN"
APP_PARAM_VIDEO_SERVICE_CUSTOM_DOMAIN="video-service-$TENANT_SLUG.$APP_PARAM_CUSTOM_DOMAIN"
APP_PARAM_NOTIFICATION_SERVICE_CUSTOM_DOMAIN="notification-service-$TENANT_SLUG.$APP_PARAM_CUSTOM_DOMAIN"

### Stack Name Config
APP_PARAM_SAAS_ADMIN_UI_STACK_NAME="$STACK_NAME_PREFIX-SaaSAdminUI"
APP_PARAM_DB_STACK_NAME="$STACK_NAME_PREFIX-Database"
APP_PARAM_AUTH_SERVICE_STACK_NAME="$STACK_NAME_PREFIX-AuthService-$TENANT_SLUG"
APP_PARAM_AUTH_SERVICE_MIGRATIONS_STACK_NAME="$STACK_NAME_PREFIX-AuthService-DBMigrations"
APP_PARAM_VIDEO_SERVICE_MIGRATIONS_STACK_NAME="$STACK_NAME_PREFIX-VideoService-DBMigrations"
APP_PARAM_NOTIFICATION_SERVICE_MIGRATIONS_STACK_NAME="$STACK_NAME_PREFIX-NotificationService-DBMigrations"
APP_PARAM_AUTH_SERVICE_POOLED_STACK_NAME="$STACK_NAME_PREFIX-AuthService-Pooled"
APP_PARAM_VIDEO_SERVICE_STACK_NAME="$STACK_NAME_PREFIX-VideoService-$TENANT_SLUG"
APP_PARAM_VIDEO_SERVICE_POOLED_STACK_NAME="$STACK_NAME_PREFIX-VideoService-Pooled"
APP_PARAM_NOTIFICATION_SERVICE_STACK_NAME="$STACK_NAME_PREFIX-NotificationService-$TENANT_SLUG"
APP_PARAM_NOTIFICATION_SERVICE_POOLED_STACK_NAME="$STACK_NAME_PREFIX-NotificationService-Pooled"
APP_PARAM_FRONTEND_STACK_NAME="$STACK_NAME_PREFIX-Frontend-$TENANT_SLUG"
APP_PARAM_FRONTEND_POOLED_STACK_NAME="$STACK_NAME_PREFIX-Frontend-Pooled"

# VPC Config
APP_PARAM_VPC_STACK_NAME="$STACK_NAME_PREFIX-Vpc"
APP_PARAM_VPC_CIDR=$(echo "$SAAS_CONFIG_SECRET_VALUE" | jq -r '.vpcCidr')

## Secrets Manager
APP_PARAM_SECRETS_PREFIX=$(echo "$SAAS_CONFIG_SECRET_VALUE" | jq -r '.secretsPrefix')
APP_PARAM_SECRETS_PREFIX="$APP_PARAM_SECRETS_PREFIX/$TENANT_SLUG"

### Database Name Config
APP_PARAM_AUTH_SERVICE_DB_NAME="authentication-service-$TENANT_SLUG"
APP_PARAM_AUTH_SERVICE_POOLED_DB_NAME="authentication-service-pooled"
APP_PARAM_VIDEO_SERVICE_DB_NAME="video-service-$TENANT_SLUG"
APP_PARAM_VIDEO_SERVICE_POOLED_DB_NAME="video-service-pooled"
APP_PARAM_NOTIFICATION_SERVICE_DB_NAME="notification-service-$TENANT_SLUG"
APP_PARAM_NOTIFICATION_SERVICE_POOLED_DB_NAME="notification-service-pooled"

### App Config
APP_PARAM_VONAGE_API_KEY=$(echo "$SAAS_CONFIG_SECRET_VALUE" | jq -r '.vonageApiKey')
APP_PARAM_VONAGE_API_SECRET=$(echo "$SAAS_CONFIG_SECRET_VALUE" | jq -r '.vonageApiSecret')

APP_PARAM_PUBNUB_SUBSCRIBE_KEY=$(echo "$SAAS_CONFIG_SECRET_VALUE" | jq -r '.pubnubSubscribeKey')
APP_PARAM_PUBNUB_PUBLISH_KEY=$(echo "$SAAS_CONFIG_SECRET_VALUE" | jq -r '.pubnubPublishKey')
APP_PARAM_PUBNUB_SECRET_KEY=$(echo "$SAAS_CONFIG_SECRET_VALUE" | jq -r '.pubnubSecretKey')

### JWT Config
APP_PARAM_JWT_SECRET=$(echo "$SAAS_CONFIG_SECRET_VALUE" | jq -r '.jwtSecret')
APP_PARAM_JWT_ISSUER="$TENANT_SLUG.$APP_PARAM_CUSTOM_DOMAIN"

# Export Common ENV Vars for CDK Scripts 
export CERTIFICATE_ARN=$APP_PARAM_CUSTOM_DOMAIN_CERT_ARN 
export HOSTED_ZONE_NAME=$APP_PARAM_HOSTED_ZONE_NAME

# Clone Repository
git clone codecommit://$CODE_COMMIT_REPOSITORY_NAME $PROJECT_ROOT

cd $PROJECT_ROOT

if [ ! -f "cdk.json" ]; then
    echo "Error: Please run provisioning script from repository root."
    exit 1
fi 

echo "tenantName: $TENANT_NAME"
echo "tenantId: $TENANT_ID"
echo "email: $TENANT_EMAIL"
echo "tier: $TENANT_TIER"
echo "siteTitle: $TENANT_APP_TITLE"
echo "tenantSlug: $TENANT_SLUG"

npm install

export SBT_PARAM_COMMIT_ID=$(git log --format="%H" -n 1)

echo "Latest Commit ID: $SBT_PARAM_COMMIT_ID"

if [[ $TENANT_TIER == "PREMIUM" ]]; then
    source $PROJECT_ROOT/scripts/src/app-infra/deploy-vpc.sh

    # Deploy Database Stack
    source $PROJECT_ROOT/scripts/src/app-infra/deploy-database.sh

    # Deploy Microservices
    ## Authentication Service
    source $PROJECT_ROOT/scripts/src/app-infra/deploy-microservices/authentication-service-migrations.sh

    source $PROJECT_ROOT/scripts/src/app-infra/deploy-microservices/authentication-service.sh

    ## Video Service
    source $PROJECT_ROOT/scripts/src/app-infra/deploy-microservices/video-service-migrations.sh

    source $PROJECT_ROOT/scripts/src/app-infra/deploy-microservices/video-service.sh


    ## Notification Service
    source $PROJECT_ROOT/scripts/src/app-infra/deploy-microservices/notification-service-migrations.sh

    source $PROJECT_ROOT/scripts/src/app-infra/deploy-microservices/notification-service.sh

    # Deploy Telemed Frontend
    APP_PARAM_FRONTEND_WILDCARD_DOMAIN=$APP_PARAM_APP_CUSTOM_DOMAIN # no wildcards for premiums
    source $PROJECT_ROOT/scripts/src/app-infra/deploy-application-frontend.sh
fi


if [[ $TENANT_TIER == "STANDARD" ]]; then
    # Deploy vpc if not present already
    source $PROJECT_ROOT/scripts/src/app-infra/deploy-vpc.sh

    # Deploy Database Stack
    source $PROJECT_ROOT/scripts/src/app-infra/deploy-database.sh # this will deploy the database stack if not already present

    # Deploy Microservices
    # Only databases are created for standard tier, no new microservices deployment will happen for standard tier

    ## Authentication Service
    source $PROJECT_ROOT/scripts/src/app-infra/deploy-microservices/authentication-service-migrations.sh
    
    # just add the tenant config in the master db
    APP_PARAM_AUTH_SERVICE_DB_NAME=$APP_PARAM_AUTH_SERVICE_POOLED_DB_NAME
    ADD_USERS="false"
    ADD_WEB_APP_CLIENT="false"
    ADD_ROLES="false"
    TENANT_KEY=$TENANT_SLUG
    source $PROJECT_ROOT/scripts/src/app-infra/deploy-microservices/authentication-service-migrations.sh

    ## Video Service
    # Run Migrations
    source $PROJECT_ROOT/scripts/src/app-infra/deploy-microservices/video-service-migrations.sh
    
    # Use the pooled service
    APP_PARAM_VIDEO_SERVICE_STACK_NAME=$APP_PARAM_VIDEO_SERVICE_POOLED_STACK_NAME # use the database cluster deployed in pooled stack
    export SBT_OUTPUT_VIDEO_SERVICE_URL=$(aws cloudformation describe-stacks --stack-name $APP_PARAM_VIDEO_SERVICE_STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='DomainName'].OutputValue" --output text)

    ## Notification Service
    # Run Migrations
    source $PROJECT_ROOT/scripts/src/app-infra/deploy-microservices/notification-service-migrations.sh
    APP_PARAM_NOTIFICATION_SERVICE_STACK_NAME=$APP_PARAM_NOTIFICATION_SERVICE_POOLED_STACK_NAME
    export SBT_OUTPUT_NOTIFICATION_SERVICE_URL=$(aws cloudformation describe-stacks --stack-name $APP_PARAM_NOTIFICATION_SERVICE_STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='DomainName'].OutputValue" --output text)
    
    # Telemed Frontend
    # get the pooled distribution domain name
    export SBT_OUTPUT_POOLED_FRONTEND_DISTRIBUTION_URL=$(aws cloudformation describe-stacks --stack-name $APP_PARAM_FRONTEND_POOLED_STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='DistributionDomainName'].OutputValue" --output text)

    APP_PARAM_ROUTE53_STACK_NAME=$APP_PARAM_FRONTEND_STACK_NAME
    APP_PARAM_ROUTE53_HOSTED_ZONE=$APP_PARAM_HOSTED_ZONE_NAME
    APP_PARAM_ROUTE53_RECORD_NAME=$APP_PARAM_APP_CUSTOM_DOMAIN
    APP_PARAM_ROUTE53_TARGET_DOMAIN_NAME=$SBT_OUTPUT_POOLED_FRONTEND_DISTRIBUTION_URL

    source $PROJECT_ROOT/scripts/src/app-infra/add-cname-record.sh
fi


if [[ $TENANT_TIER == "BASIC" ]]; then
    # Deploy VPC Stack if not present already
    source $PROJECT_ROOT/scripts/src/app-infra/deploy-vpc.sh

    # Deploy Database Stack is not already present
    source $PROJECT_ROOT/scripts/src/app-infra/deploy-database.sh

    ## Authentication Service
    APP_PARAM_AUTH_SERVICE_STACK_NAME=$APP_PARAM_AUTH_SERVICE_POOLED_STACK_NAME # use the database cluster deployed in pooled stack

    export SBT_OUTPUT_AUTH_SERVICE_URL=$(aws cloudformation describe-stacks --stack-name $APP_PARAM_AUTH_SERVICE_STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='DomainName'].OutputValue" --output text)

    APP_PARAM_AUTH_SERVICE_DB_NAME=$APP_PARAM_AUTH_SERVICE_POOLED_DB_NAME # use pooled auth db
    APP_PARAM_VIDEO_SERVICE_DB_NAME=$APP_PARAM_VIDEO_SERVICE_POOLED_DB_NAME # use the pooled microservice
    APP_PARAM_NOTIFICATION_SERVICE_DB_NAME=$APP_PARAM_NOTIFICATION_SERVICE_POOLED_DB_NAME
    # add tenant data in pooled db
    ADD_ROLES="false"
    ADD_WEB_APP_CLIENT="false"
    TENANT_KEY=$TENANT_SLUG
    source $PROJECT_ROOT/scripts/src/app-infra/deploy-microservices/authentication-service-migrations.sh

    ## Video Service
    APP_PARAM_VIDEO_SERVICE_STACK_NAME=$APP_PARAM_VIDEO_SERVICE_POOLED_STACK_NAME # use the pooled microservice
    export SBT_OUTPUT_VIDEO_SERVICE_URL=$(aws cloudformation describe-stacks --stack-name $APP_PARAM_VIDEO_SERVICE_STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='DomainName'].OutputValue" --output text)

    ## Notification Service
    APP_PARAM_NOTIFICATION_SERVICE_STACK_NAME=$APP_PARAM_NOTIFICATION_SERVICE_POOLED_STACK_NAME
    export SBT_OUTPUT_NOTIFICATION_SERVICE_URL=$(aws cloudformation describe-stacks --stack-name $APP_PARAM_NOTIFICATION_SERVICE_STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='DomainName'].OutputValue" --output text)

fi

export tenantStatus="Active"