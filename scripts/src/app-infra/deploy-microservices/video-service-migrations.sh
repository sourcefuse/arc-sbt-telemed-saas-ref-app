export STACK_NAME=$APP_PARAM_VIDEO_SERVICE_MIGRATIONS_STACK_NAME

# Deploy Migrations Lambda Function
cd $PROJECT_ROOT
cd ./telemed-app/backend/video-conferencing-service/migrations
export MIGRATION_SOURCE_PATH=$PWD # used in cdk to build docker image

cd $PROJECT_ROOT
cd ./telemed-app/backend/migrations-cdk
export DB_SECRET_ARN=$SBT_OUTPUT_DB_SECRET_ARN
export VPC_ID=$SBT_OUTPUT_VPC_ID

npm install

npx cdk deploy --all --require-approval never

export SBT_OUTPUT_VIDEO_DB_MIGRATION_FUNCTION_NAME=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='FunctionName'].OutputValue" --output text)

export MIGRATION_PARAMS=$(cat <<EOF
{
  "params": {
    "dbSecret": {
      "name": "$(echo $SBT_OUTPUT_DB_SECRET_NAME)",
      "region": "$(echo $REGION)"
    },
    "rdsProxyEndpoint": "$(echo $SBT_OUTPUT_DB_PROXY_ENDPOINT)",
    "dbName": "$(echo $APP_PARAM_VIDEO_SERVICE_DB_NAME)"
  }
}
EOF
)

# ENCODED_PARAMS=$(echo $MIGRATION_PARAMS | base64)

aws lambda invoke --function-name $SBT_OUTPUT_VIDEO_DB_MIGRATION_FUNCTION_NAME --invocation-type RequestResponse --region $REGION --cli-binary-format raw-in-base64-out --payload "$MIGRATION_PARAMS" responses.json

unset STACK_NAME