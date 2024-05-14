cd $PROJECT_ROOT
npm install

export SBT_PARAM_SYSTEM_ADMIN_EMAIL=$SYSTEM_ADMIN_EMAIL
export SBT_PARAM_CONTROL_PLANE_STACK_NAME=$CONTROL_PLANE_STACK_NAME
export SBT_PARAM_APP_PLANE_STACK_NAME=$APP_PLANE_STACK_NAME
export SBT_PARAM_CODE_COMMIT_REPOSITORY_NAME=$CODE_COMMIT_REPOSITORY_NAME

npx cdk bootstrap
npx cdk deploy --all --require-approval never

export SBT_OUTPUT_API_GW_URL=$(aws cloudformation describe-stacks --stack-name $SBT_PARAM_CONTROL_PLANE_STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='controlPlaneAPIGatewayUrl'].OutputValue" --output text)
export SBT_OUTPUT_IDP_DETAILS=$(aws cloudformation describe-stacks --stack-name $SBT_PARAM_CONTROL_PLANE_STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='ControlPlaneIdpDetails'].OutputValue" --output text)

unset SBT_PARAM_SYSTEM_ADMIN_EMAIL
unset SBT_PARAM_CONTROL_PLANE_STACK_NAME
unset SBT_PARAM_APP_PLANE_STACK_NAME
unset SBT_PARAM_CODE_COMMIT_REPOSITORY_NAME

