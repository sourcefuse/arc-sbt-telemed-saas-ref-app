#!/bin/bash -e

if [ ! -f "cdk.json" ]; then
    echo "Error: Please run this script from project root."
    exit 1
fi

##############################################
####### Set Environment Variables ############
##############################################

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
APP_PARAM_APP_CUSTOM_DOMAIN="app.$APP_PARAM_CUSTOM_DOMAIN"
APP_PARAM_FRONTEND_WILDCARD_DOMAIN="*.$APP_PARAM_CUSTOM_DOMAIN"
APP_PARAM_AUTH_SERVICE_CUSTOM_DOMAIN="auth-service.$APP_PARAM_CUSTOM_DOMAIN"
APP_PARAM_VIDEO_SERVICE_CUSTOM_DOMAIN="video-service.$APP_PARAM_CUSTOM_DOMAIN"
APP_PARAM_NOTIFICATION_SERVICE_CUSTOM_DOMAIN="notification-service.$APP_PARAM_CUSTOM_DOMAIN"

### Stack Name Config
APP_PARAM_SAAS_ADMIN_UI_STACK_NAME="$STACK_NAME_PREFIX-SaaSAdminUI"
APP_PARAM_DB_STACK_NAME="$STACK_NAME_PREFIX-Database"
APP_PARAM_AUTH_SERVICE_STACK_NAME="$STACK_NAME_PREFIX-AuthService-Pooled"
APP_PARAM_VIDEO_SERVICE_STACK_NAME="$STACK_NAME_PREFIX-VideoService-Pooled"
APP_PARAM_NOTIFICATION_SERVICE_STACK_NAME="$STACK_NAME_PREFIX-NotificationService-Pooled"
APP_PARAM_FRONTEND_STACK_NAME="$STACK_NAME_PREFIX-Frontend-Pooled"

### Database Name Config
APP_PARAM_AUTH_SERVICE_DB_NAME="authentication-service-pooled"
APP_PARAM_VIDEO_SERVICE_DB_NAME="video-service-pooled"
APP_PARAM_NOTIFICATION_SERVICE_DB_NAME="notification-service-pooled"

### App Config
APP_PARAM_VONAGE_API_KEY="12345678"
APP_PARAM_VONAGE_API_SECRET="xyzabc"

APP_PARAM_PUBNUB_SUBSCRIBE_KEY="sub-c-xyz-abc"
APP_PARAM_PUBNUB_PUBLISH_KEY="pub-c-xyz-abc"
APP_PARAM_PUBNUB_SECRET_KEY="sec-c-xyz-abc"

### JWT Config
APP_PARAM_JWT_SECRET="secret"
APP_PARAM_JWT_ISSUER="$APP_PARAM_CUSTOM_DOMAIN"

# Export Common ENV Vars for CDK Scripts 
export CERTIFICATE_ARN=$APP_PARAM_CUSTOM_DOMAIN_CERT_ARN 
export HOSTED_ZONE_NAME=$APP_PARAM_HOSTED_ZONE_NAME

# Validate Required Params
source $PROJECT_ROOT/scripts/src/app-infra/validate-variables.sh

# Push Repo to Code Commit
source $PROJECT_ROOT/scripts/src/app-infra/push-to-code-commit.sh

# Deploy SBT Stacks
source $PROJECT_ROOT/scripts/src/app-infra/deploy-sbt-stacks.sh

# Deploy SaaS Admin UI
source $PROJECT_ROOT/scripts/src/app-infra/deploy-saas-admin-ui.sh

# Deploy Database Stack
source $PROJECT_ROOT/scripts/src/app-infra/deploy-database.sh

# Deploy Microservices
## Authentication Service
source $PROJECT_ROOT/scripts/src/app-infra/deploy-microservices/authentication-service.sh

## Video Service
source $PROJECT_ROOT/scripts/src/app-infra/deploy-microservices/video-service.sh

## Notification Service
source $PROJECT_ROOT/scripts/src/app-infra/deploy-microservices/notification-service.sh

# Deploy Telemed Frontend
source $PROJECT_ROOT/scripts/src/app-infra/deploy-application-frontend.sh

###############################################################################
# SaaS Deploy Complete
echo "The Saas App Has Been Deployed Successfully! ✅"
echo "SaaS Admin: $SBT_OUTPUT_SAAS_ADMIN_APP_URL"
echo "Pooled Telemedicine App: $SBT_OUTPUT_POOLED_FRONTEND_APP_URL"
###############################################################################