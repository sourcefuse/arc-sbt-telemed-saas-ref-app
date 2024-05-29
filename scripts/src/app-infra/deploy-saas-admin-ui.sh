# Step 1. Export the Static HTML Files
cd $PROJECT_ROOT
cd ./admin-platforms/saas-admin
npm install

export NEXT_PUBLIC_SITE_TITLE="ARC SaaS Admin"
export NEXT_PUBLIC_API_HOST=$SBT_OUTPUT_API_GW_URL
export NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID=$(echo "$SBT_OUTPUT_IDP_DETAILS" | jq -r '.idp.clientId')
export NEXT_PUBLIC_COGNITO_USER_POOL_ID=$(echo "$SBT_OUTPUT_IDP_DETAILS" | jq -r '.idp.userPoolId')

### Build and export static version
npm run export

unset NEXT_PUBLIC_SITE_TITLE
unset NEXT_PUBLIC_API_HOST
unset NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID
unset NEXT_PUBLIC_COGNITO_USER_POOL_ID

# Step 2. Deploy Using CDK
cd $PROJECT_ROOT
cd ./admin-platforms/saas-admin-cdk
npm install

export STACK_NAME=$APP_PARAM_SAAS_ADMIN_UI_STACK_NAME 
export CUSTOM_DOMAIN=$APP_PARAM_SAAS_ADMIN_FRONTEND_CUSTOM_DOMAIN

npx cdk deploy --all --require-approval never

export SBT_OUTPUT_SAAS_ADMIN_APP_URL=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='CustomDomainName'].OutputValue" --output text)

unset STACK_NAME
unset CUSTOM_DOMAIN