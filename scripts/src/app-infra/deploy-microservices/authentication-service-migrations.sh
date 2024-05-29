export STACK_NAME=$APP_PARAM_AUTH_SERVICE_MIGRATIONS_STACK_NAME

# Deploy Migrations Lambda Function
cd $PROJECT_ROOT
cd ./telemed-app/backend/authentication-service/migrations
export MIGRATION_SOURCE_PATH=$PWD # used in cdk to build docker image

cd $PROJECT_ROOT
cd ./telemed-app/backend/migrations-cdk
export DB_SECRET_ARN=$SBT_OUTPUT_DB_SECRET_ARN
export VPC_ID=$SBT_OUTPUT_VPC_ID

npm install

npx cdk deploy --all --require-approval never

export SBT_OUTPUT_AUTH_DB_MIGRATION_FUNCTION_NAME=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='FunctionName'].OutputValue" --output text)

TENANT_SLUG="${TENANT_SLUG:-pooled}"
TENANT_NAME="${TENANT_NAME:-pooled}"
TENANT_KEY="${TENANT_KEY:-pooled}"
SKIP_IF_TENANT_EXISTS="${SKIP_IF_TENANT_EXISTS:-true}"
ADD_WEB_APP_CLIENT="${ADD_WEB_APP_CLIENT:-true}"
ADD_ROLES="${ADD_ROLES:-true}"
ADD_TENANT_CONFIG="${ADD_TENANT_CONFIG:-true}"
ADD_USERS="${ADD_USERS:-true}"

export MIGRATION_PARAMS=$(cat <<EOF
{
  "params": {
    "dbSecret": {
      "name": "$(echo $SBT_OUTPUT_DB_SECRET_NAME)",
      "region": "$(echo $REGION)"
    },
    "rdsProxyEndpoint": "$(echo $SBT_OUTPUT_DB_PROXY_ENDPOINT)",
    "dbName": "$(echo $APP_PARAM_AUTH_SERVICE_DB_NAME)",
    "seedParams": {
      "skipIfTenantExists": $(echo $SKIP_IF_TENANT_EXISTS),
      "addWebAppClient": $(echo $ADD_WEB_APP_CLIENT),
      "addRoles": $(echo $ADD_ROLES),
      "addTenantConfig": $(echo $ADD_TENANT_CONFIG),
      "addUsers": $(echo $ADD_USERS),
      "tenant": {
        "name": "$(echo $TENANT_NAME)",
        "status": 1,
        "key": "$(echo $TENANT_KEY)",
        "slug": "$(echo $TENANT_SLUG)"
      },
      "dbNames": {
        "authentication": "$(echo $APP_PARAM_AUTH_SERVICE_DB_NAME)",
        "videoConferencing": "$(echo $APP_PARAM_VIDEO_SERVICE_DB_NAME)",
        "notification": "$(echo $APP_PARAM_NOTIFICATION_SERVICE_DB_NAME)"
      },
      "doctor": {
        "firstName": "Demo",
        "lastName": "Doctor",
        "email": "doctor@$(echo $TENANT_SLUG).com"
      },
      "patient": {
        "firstName": "Demo",
        "lastName": "Patient",
        "email": "patient@$(echo $TENANT_SLUG).com"
      }
    }
  }
}
EOF
)

# ENCODED_PARAMS=$(echo -n $MIGRATION_PARAMS | base64)

# echo "base 64 encoded params $ENCODED_PARAMS"

# aws lambda invoke --function-name $SBT_OUTPUT_AUTH_DB_MIGRATION_FUNCTION_NAME --invocation-type RequestResponse --region $REGION --payload $ENCODED_PARAMS responses.json

aws lambda invoke --function-name $SBT_OUTPUT_AUTH_DB_MIGRATION_FUNCTION_NAME --invocation-type RequestResponse --region $REGION --cli-binary-format raw-in-base64-out --payload "$MIGRATION_PARAMS" responses.json


unset STACK_NAME
unset SKIP_IF_TENANT_EXISTS
unset ADD_WEB_APP_CLIENT
unset ADD_ROLES
unset ADD_TENANT_CONFIG
unset ADD_USERS