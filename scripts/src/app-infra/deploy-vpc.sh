cd $PROJECT_ROOT
cd ./telemed-app/vpc-cdk
npm install
STACK_NAME=$APP_PARAM_VPC_STACK_NAME CIDR_BLOCK=$APP_PARAM_VPC_CIDR npx cdk deploy --all --require-approval never

SBT_OUTPUT_VPC_ID=$(aws cloudformation describe-stacks --stack-name $APP_PARAM_VPC_STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='VpcID'].OutputValue" --output text)
SBT_OUTPUT_VPC_AZS=$(aws cloudformation describe-stacks --stack-name $APP_PARAM_VPC_STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='availabilityZones'].OutputValue" --output text)
SBT_OUTPUT_VPC_PRIVATE_SUBNETS=$(aws cloudformation describe-stacks --stack-name $APP_PARAM_VPC_STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='privateSubnets'].OutputValue" --output text)
SBT_OUTPUT_VPC_PUBLIC_SUBNETS=$(aws cloudformation describe-stacks --stack-name $APP_PARAM_VPC_STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='publicSubnets'].OutputValue" --output text)
SBT_OUTPUT_VPC_CIDR_BLOCK=$(aws cloudformation describe-stacks --stack-name $APP_PARAM_VPC_STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='vpcCidrBlock'].OutputValue" --output text)
