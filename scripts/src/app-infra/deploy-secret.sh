cd $PROJECT_ROOT
cd ./telemed-app/secret-manager-cdk
npm install

export STACK_NAME=$STACK_NAME
export SECRET_NAME=$SECRET_NAME
export SECRET_VALUE_OBJECT=$SECRET_VALUE_OBJECT

npx cdk deploy --all --require-approval never

SBT_OUTPUT_SECRET_ARN=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='SecretArn'].OutputValue" --output text)
SBT_OUTPUT_SECRET_NAME=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='SecretName'].OutputValue" --output text)

unset STACK_NAME
unset SECRET_NAME
unset SECRET_VALUE_OBJECT
 