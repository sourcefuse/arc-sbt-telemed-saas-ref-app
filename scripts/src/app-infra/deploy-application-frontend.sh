# Step 1. Build the app
cd $PROJECT_ROOT
cd ./telemed-app/frontend
npm install

## Set environment variables
export VITE_CLIENT_ID="webapp"
export VITE_AUTH_API_BASE_URL="https://$SBT_OUTPUT_AUTH_SERVICE_URL"
export VITE_NOTIFICATION_API_BASE_URL="https://$SBT_OUTPUT_NOTIFICATION_SERVICE_URL"
export VITE_VIDEO_API_BASE_URL="https://$SBT_OUTPUT_VIDEO_SERVICE_URL"
export VITE_PUBNUB_PUBLISH_KEY="$APP_PARAM_PUBNUB_PUBLISH_KEY"
export VITE_PUBNUB_SUBSCRIBE_KEY="$APP_PARAM_PUBNUB_SUBSCRIBE_KEY"
export VITE_NOTIFICATION_CHANNEL_UUID="59e3dc79-cdbe-4225-ad1b-309d2a87084b" # any random uuid can be used
export VITE_CHAT_CHANNEL_UUID="1a95a1a9-5779-4966-8058-6655c63c5119" # any random uuid can be used
export VITE_VONAGE_API_KEY="$APP_PARAM_VONAGE_API_KEY"
export VITE_LOGIN_TITLE="Welcome to the Telemed App"

npm run build

# Step 2. Deploy using CDK
cd $PROJECT_ROOT
cd ./telemed-app/frontend-cdk
npm install

export STACK_NAME=$APP_PARAM_FRONTEND_STACK_NAME
export CUSTOM_DOMAIN=$APP_PARAM_APP_CUSTOM_DOMAIN
export CUSTOM_DOMAIN_WILDCARD=$APP_PARAM_FRONTEND_WILDCARD_DOMAIN

npx cdk deploy --all --require-approval never

export SBT_OUTPUT_POOLED_FRONTEND_APP_URL=$(aws cloudformation describe-stacks --stack-name $APP_PARAM_FRONTEND_STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='CustomDomainName'].OutputValue" --output text)

unset STACK_NAME 
unset CUSTOM_DOMAIN