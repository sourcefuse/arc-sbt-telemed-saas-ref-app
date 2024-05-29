cd $PROJECT_ROOT
cd ./telemed-app/scripts/route53-cdk

npm install

export STACK_NAME=$APP_PARAM_ROUTE53_STACK_NAME
export HOSTED_ZONE=$APP_PARAM_ROUTE53_HOSTED_ZONE
export RECORD_NAME=$APP_PARAM_ROUTE53_RECORD_NAME
export TARGET_DOMAIN_NAME=$APP_PARAM_ROUTE53_TARGET_DOMAIN_NAME

npx cdk deploy --all --require-approval never
