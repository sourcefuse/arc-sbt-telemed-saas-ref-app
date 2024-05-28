cd $PROJECT_ROOT
cd ./telemed-app/database-cdk
npm install
DB_STACK_NAME=$APP_PARAM_DB_STACK_NAME VPC_ID=$SBT_OUTPUT_VPC_ID npx cdk deploy --all --require-approval never

# Retrieve the secret value from AWS Secrets Manager
SBT_OUTPUT_DB_SECRET_NAME=$(aws cloudformation describe-stacks --stack-name $APP_PARAM_DB_STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='ClusterSecretName'].OutputValue" --output text)
SBT_OUTPUT_DB_SECRET_ARN=$(aws cloudformation describe-stacks --stack-name $APP_PARAM_DB_STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='ClusterSecretArn'].OutputValue" --output text)
SBT_OUTPUT_DB_PROXY_ENDPOINT=$(aws cloudformation describe-stacks --stack-name $APP_PARAM_DB_STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='RDSProxyEndpoint'].OutputValue" --output text)
SECRET_VALUE=$(aws secretsmanager get-secret-value --secret-id $SBT_OUTPUT_DB_SECRET_NAME --query SecretString --output text)

# Extract the required fields from the secret value
export DB_HOST=$(echo "$SECRET_VALUE" | jq -r '.host')
export DB_USER=$(echo "$SECRET_VALUE" | jq -r '.username')
export DB_PORT=$(echo "$SECRET_VALUE" | jq -r '.port')

unset SECRET_VALUE