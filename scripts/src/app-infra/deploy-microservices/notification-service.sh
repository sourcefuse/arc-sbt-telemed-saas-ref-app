export STACK_NAME=$APP_PARAM_NOTIFICATION_SERVICE_STACK_NAME
export DOMAIN_NAME=$APP_PARAM_NOTIFICATION_SERVICE_CUSTOM_DOMAIN 

# Run Migrations
cd $PROJECT_ROOT
cd ./telemed-app/backend/notification-service
export SOURCE_CODE_PATH=$PWD # used in cdk to build docker image

npm install


# Run the command and capture its output and exit code
output=$(npx db-migrate db:create $APP_PARAM_NOTIFICATION_SERVICE_DB_NAME --config ./migrations/database.json 2>&1) || exit_code=$?

# Check if the error message contains "already exists"
if [[ "$output" == *"already exists"* ]]; then
    echo "Database '$APP_PARAM_NOTIFICATION_SERVICE_DB_NAME' already exists, skipping creation."
else
    # If the error doesn't contain "already exists", exit with the original exit code
    if [[ $exit_code -ne 0 ]]; then
        echo "$output"
        exit $exit_code
    fi
fi

DB_DATABASE=$APP_PARAM_NOTIFICATION_SERVICE_DB_NAME npx db-migrate up --config ./migrations/database.json


if [ "$NO_SERVICE_DEPLOY" != "yes" ]; then
    # Deploy Service Code
    cd $PROJECT_ROOT
    cd ./telemed-app/backend/cdk
    npm install

    # Prepare an object to be used as the environment variables of the lambda function for this service
    export LAMBDA_ENVS=$(cat <<EOF
    {
    "DB_HOST": "$(echo $DB_HOST)",
    "DB_PORT": "$(echo $DB_PORT)",
    "DB_USER": "$(echo $DB_USER)",
    "DB_PASSWORD": "$(echo $DB_PASSWORD)",
    "DB_DATABASE": "$(echo $APP_PARAM_NOTIFICATION_SERVICE_DB_NAME)",
    "DB_SCHEMA": "main",
    "JWT_SECRET": "$(echo $APP_PARAM_JWT_SECRET)",
    "JWT_ISSUER": "$(echo $APP_PARAM_JWT_ISSUER)",
    "PUBNUB_SUBSCRIBE_KEY": "$(echo $APP_PARAM_PUBNUB_SUBSCRIBE_KEY)",
    "PUBNUB_PUBLISH_KEY": "$(echo $APP_PARAM_PUBNUB_PUBLISH_KEY)",
    "PUBNUB_SECRET_KEY": "$(echo $APP_PARAM_PUBNUB_SECRET_KEY)"
    }
EOF
)

    npx cdk deploy --all --require-approval never
else
  echo "Notification Service deployment skipped due to NO_SERVICE_DEPLOY=yes"
fi
export SBT_OUTPUT_NOTIFICATION_SERVICE_URL=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='DomainName'].OutputValue" --output text)

unset STACK_NAME
unset DOMAIN_NAME
unset LAMBDA_ENVS