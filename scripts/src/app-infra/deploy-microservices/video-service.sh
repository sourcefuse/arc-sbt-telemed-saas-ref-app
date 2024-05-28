TENANT_SLUG="${TENANT_SLUG:-pooled}"

# store secrets required for service
STACK_NAME="$STACK_NAME_PREFIX-$TENANT_SLUG-video-service-config"
SECRET_NAME="$APP_PARAM_SECRETS_PREFIX/video-service/config"
SECRET_VALUE_OBJECT=$(cat <<EOF
    {
    "DB_HOST": "$(echo $SBT_OUTPUT_DB_PROXY_ENDPOINT)",
    "DB_PORT": "$(echo $DB_PORT)",
    "DB_USER": "$(echo $DB_USER)",
    "DB_DATABASE": "$(echo $APP_PARAM_VIDEO_SERVICE_DB_NAME)",
    "DB_SCHEMA": "videochatms",
    "JWT_SECRET": "$(echo $APP_PARAM_JWT_SECRET)",
    "JWT_ISSUER": "$(echo $APP_PARAM_JWT_ISSUER)",
    "VONAGE_API_KEY": "$(echo $APP_PARAM_VONAGE_API_KEY)",
    "VONAGE_API_SECRET": "$(echo $APP_PARAM_VONAGE_API_SECRET)"
    }
EOF
)

source $PROJECT_ROOT/scripts/src/app-infra/deploy-secret.sh


# Deploy Service Code
cd $PROJECT_ROOT
cd ./telemed-app/backend/video-conferencing-service
export SOURCE_CODE_PATH=$PWD # used in cdk to build docker image

cd $PROJECT_ROOT
cd ./telemed-app/backend/cdk
npm install

export STACK_NAME=$APP_PARAM_VIDEO_SERVICE_STACK_NAME
export DOMAIN_NAME=$APP_PARAM_VIDEO_SERVICE_CUSTOM_DOMAIN
export VPC_ID=$SBT_OUTPUT_VPC_ID
export SECRET_ARN=$SBT_OUTPUT_SECRET_ARN
SECRET_NAME=$SBT_OUTPUT_SECRET_NAME


export LAMBDA_ENVS=$(cat <<EOF
{
  "SECRET_NAME": "$(echo $SECRET_NAME)"
}
EOF
)

npx cdk deploy --all --require-approval never

export SBT_OUTPUT_VIDEO_SERVICE_URL=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='DomainName'].OutputValue" --output text)

unset STACK_NAME
unset DOMAIN_NAME
unset LAMBDA_ENVS
unset SECRET_NAME
unset VPC_ID
unset SOURCE_CODE_PATH
unset SBT_OUTPUT_SECRET_NAME