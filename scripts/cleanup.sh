#!/bin/bash -e

if [ ! -f "cdk.json" ]; then
    echo "Error: Please run this script from project root."
    exit 1
fi

PROJECT_ROOT=$PWD

source $PROJECT_ROOT/scripts/env.sh

STACK_NAME_PREFIX=$(echo "$SAAS_CONFIG_SECRET_VALUE" | jq -r '.cloudformationStackPrefix')

# Function to list CloudFormation stacks
list_stacks() {
    stacks=$(aws cloudformation list-stacks --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE --query "StackSummaries[?starts_with(StackName, \`$STACK_NAME_PREFIX\`)].[StackName]" --output text)
    echo "$stacks"
}

# Function to display stacks as a numbered list
display_stacks() {
    stack_list=$(echo "$stacks" | awk -v max_length=120 '{name=$1; if (length(name) > max_length) name=substr(name,1,max_length-3)"..."; print NR ". " name}' | tr '\n' '\n')
    echo "$stack_list"
}

# Function to delete CloudFormation stacks
delete_stacks() {
    read -p "Type 'yes' to delete the above listed stacks: " confirm
    if [[ "$confirm" == "yes" ]]; then
        while IFS= read -r stack; do
            echo "Deleting stack: $stack"
            aws cloudformation delete-stack --stack-name "$stack"
        done <<< "$stacks"
    else
        echo "Stack deletion canceled."
    fi
}

# List stacks
stacks=$(list_stacks)

# Check if there are stacks to delete
if [[ -n "$stacks" ]]; then
    display_stacks
    delete_stacks
else
    echo "No CloudFormation stacks found starting with '$STACK_NAME_PREFIX'."
fi