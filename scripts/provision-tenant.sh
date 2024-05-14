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

## Tenant Inputs

# remove starting and closing quotes from the values
export TENANT_ID=$(echo "$tenantId" | sed -e 's/^"//' -e 's/"$//')
export TENANT_NAME=$(echo "$tenantName" | sed -e 's/^"//' -e 's/"$//')
export TENANT_EMAIL=$(echo "$email" | sed -e 's/^"//' -e 's/"$//')
export TENANT_TIER=$(echo "$tier" | sed -e 's/^"//' -e 's/"$//')
export TENANT_APP_TITLE=$(echo "$siteTitle" | sed -e 's/^"//' -e 's/"$//')
export TENANT_SLUG=$(echo "$tenantSlug" | sed -e 's/^"//' -e 's/"$//')

PROJECT_ROOT=$PWD
REGION=$(aws configure get region)
STACK_NAME_PREFIX="TelemedSaaS"
## SBT_PARAMS
SYSTEM_ADMIN_EMAIL="systemadmin@example.com"
CODE_COMMIT_REPOSITORY_NAME="aws-sbt-ref-solution-arc-telemed-serverless"
CODE_COMMIT_REPOSITORY_DESCRIPTION="ARC Serverless SaaS with AWS SBT Reference Architecture Repository."
CONTROL_PLANE_STACK_NAME="$STACK_NAME_PREFIX-ControlPlane"
APP_PLANE_STACK_NAME="$STACK_NAME_PREFIX-AppPlane"

## App Specific Params
### Custom Domain Config
APP_PARAM_HOSTED_ZONE_NAME="example.com"
APP_PARAM_CUSTOM_DOMAIN="telemed-saas.example.com"
APP_PARAM_CUSTOM_DOMAIN_CERT_ARN="arn:aws:acm:us-east-1:account:certificate/xyz-abc" # certificate for *.$APP_PARAM_CUSTOM_DOMAIN (eg. *.example.com)
APP_PARAM_SAAS_ADMIN_FRONTEND_CUSTOM_DOMAIN="saas-admin.$APP_PARAM_CUSTOM_DOMAIN"
APP_PARAM_APP_CUSTOM_DOMAIN="$TENANT_SLUG.$APP_PARAM_CUSTOM_DOMAIN"
APP_PARAM_AUTH_SERVICE_CUSTOM_DOMAIN="auth-service-$TENANT_SLUG.$APP_PARAM_CUSTOM_DOMAIN"
APP_PARAM_VIDEO_SERVICE_CUSTOM_DOMAIN="video-service-$TENANT_SLUG.$APP_PARAM_CUSTOM_DOMAIN"
APP_PARAM_NOTIFICATION_SERVICE_CUSTOM_DOMAIN="notification-service-$TENANT_SLUG.$APP_PARAM_CUSTOM_DOMAIN"

### Stack Name Config
APP_PARAM_SAAS_ADMIN_UI_STACK_NAME="$STACK_NAME_PREFIX-SaaSAdminUI"
APP_PARAM_DB_STACK_NAME="$STACK_NAME_PREFIX-Database"
APP_PARAM_AUTH_SERVICE_STACK_NAME="$STACK_NAME_PREFIX-AuthService-$TENANT_SLUG"
APP_PARAM_AUTH_SERVICE_POOLED_STACK_NAME="$STACK_NAME_PREFIX-AuthService-Pooled"
APP_PARAM_VIDEO_SERVICE_STACK_NAME="$STACK_NAME_PREFIX-VideoService-$TENANT_SLUG"
APP_PARAM_VIDEO_SERVICE_POOLED_STACK_NAME="$STACK_NAME_PREFIX-VideoService-Pooled"
APP_PARAM_NOTIFICATION_SERVICE_STACK_NAME="$STACK_NAME_PREFIX-NotificationService-$TENANT_SLUG"
APP_PARAM_NOTIFICATION_SERVICE_POOLED_STACK_NAME="$STACK_NAME_PREFIX-NotificationService-Pooled"
APP_PARAM_FRONTEND_STACK_NAME="$STACK_NAME_PREFIX-Frontend-$TENANT_SLUG"
APP_PARAM_FRONTEND_POOLED_STACK_NAME="$STACK_NAME_PREFIX-Frontend-Pooled"

### Database Name Config
APP_PARAM_AUTH_SERVICE_DB_NAME="authentication-service-$TENANT_SLUG"
APP_PARAM_AUTH_SERVICE_POOLED_DB_NAME="authentication-service-pooled"
APP_PARAM_VIDEO_SERVICE_DB_NAME="video-service-$TENANT_SLUG"
APP_PARAM_VIDEO_SERVICE_POOLED_DB_NAME="video-service-pooled"
APP_PARAM_NOTIFICATION_SERVICE_DB_NAME="notification-service-$TENANT_SLUG"
APP_PARAM_NOTIFICATION_SERVICE_POOLED_DB_NAME="notification-service-pooled"


### App Config
APP_PARAM_VONAGE_API_KEY="12345678"
APP_PARAM_VONAGE_API_SECRET="xyzabc"

APP_PARAM_PUBNUB_SUBSCRIBE_KEY="sub-c-xyz-abc"
APP_PARAM_PUBNUB_PUBLISH_KEY="pub-c-xyz-abc"
APP_PARAM_PUBNUB_SECRET_KEY="sec-c-xyz-abc"

### JWT Config
APP_PARAM_JWT_SECRET="secret"
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

    # Deploy Database Stack
    source $PROJECT_ROOT/scripts/src/app-infra/deploy-database.sh # this will deploy the database stack if not already present

    # Deploy Microservices
    ## Authentication Service
    source $PROJECT_ROOT/scripts/src/app-infra/deploy-microservices/authentication-service.sh

    ## Video Service
    source $PROJECT_ROOT/scripts/src/app-infra/deploy-microservices/video-service.sh

    ## Notification Service
    source $PROJECT_ROOT/scripts/src/app-infra/deploy-microservices/notification-service.sh

    # Deploy Telemed Frontend
    source $PROJECT_ROOT/scripts/src/app-infra/deploy-application-frontend.sh
fi


if [[ $TENANT_TIER == "STANDARD" ]]; then

    # Deploy Database Stack
    source $PROJECT_ROOT/scripts/src/app-infra/deploy-database.sh # this will deploy the database stack if not already present

    # Deploy Microservices
    NO_SERVICE_DEPLOY=yes # only dbs will be created, no new microservices deployment will happen for standard tier

    ## Authentication Service
    APP_PARAM_AUTH_SERVICE_STACK_NAME=$APP_PARAM_AUTH_SERVICE_POOLED_STACK_NAME # use the database cluster deployed in pooled stack
    source $PROJECT_ROOT/scripts/src/app-infra/deploy-microservices/authentication-service.sh

    ## Video Service
    APP_PARAM_VIDEO_SERVICE_STACK_NAME=$APP_PARAM_VIDEO_SERVICE_POOLED_STACK_NAME # use the database cluster deployed in pooled stack
    source $PROJECT_ROOT/scripts/src/app-infra/deploy-microservices/video-service.sh

    ## Notification Service
    APP_PARAM_NOTIFICATION_SERVICE_STACK_NAME=$APP_PARAM_NOTIFICATION_SERVICE_POOLED_STACK_NAME
    source $PROJECT_ROOT/scripts/src/app-infra/deploy-microservices/notification-service.sh

    unset NO_SERVICE_DEPLOY
    
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

    # Deploy Database Stack
    source $PROJECT_ROOT/scripts/src/app-infra/deploy-database.sh # this will deploy the database stack if not already present

    # Deploy Microservices
    NO_SERVICE_DEPLOY=yes # only dbs will be created, no new microservices deployment will happen for standard tier

    ## Authentication Service
    APP_PARAM_AUTH_SERVICE_STACK_NAME=$APP_PARAM_AUTH_SERVICE_POOLED_STACK_NAME # use the database cluster deployed in pooled stack
    APP_PARAM_AUTH_SERVICE_DB_NAME=$APP_PARAM_AUTH_SERVICE_POOLED_DB_NAME # use pooled auth db
    source $PROJECT_ROOT/scripts/src/app-infra/deploy-microservices/authentication-service.sh

    source $PROJECT_ROOT/scripts/src/app-infra/seed-example-users.sh

    ## Video Service
    APP_PARAM_VIDEO_SERVICE_STACK_NAME=$APP_PARAM_VIDEO_SERVICE_POOLED_STACK_NAME # use the database cluster deployed in pooled stack
    APP_PARAM_VIDEO_SERVICE_DB_NAME=$APP_PARAM_VIDEO_SERVICE_POOLED_DB_NAME # use pooled video service db db
    source $PROJECT_ROOT/scripts/src/app-infra/deploy-microservices/video-service.sh

    ## Notification Service
    APP_PARAM_NOTIFICATION_SERVICE_STACK_NAME=$APP_PARAM_NOTIFICATION_SERVICE_POOLED_STACK_NAME
    APP_PARAM_NOTIFICATION_SERVICE_DB_NAME=$APP_PARAM_NOTIFICATION_SERVICE_POOLED_DB_NAME # use pooled notification db
    source $PROJECT_ROOT/scripts/src/app-infra/deploy-microservices/notification-service.sh

    unset NO_SERVICE_DEPLOY
fi

export tenantStatus="Active"