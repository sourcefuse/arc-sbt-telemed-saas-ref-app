#!/bin/bash

# Retrieve the secret value from AWS Secrets Manager
secret_value=$(aws secretsmanager get-secret-value --secret-id DatabaseSecret3B817195-XymelDduz7xp --query SecretString --output text)

# Extract the required fields from the secret value
host=$(echo "$secret_value" | jq -r '.host')
username=$(echo "$secret_value" | jq -r '.username')
port=$(echo "$secret_value" | jq -r '.port')
password=$(echo "$secret_value" | jq -r '.password')

# Set the environment variables
export DB_HOST="$host"
export DB_USER="$username"
export DB_PORT="$port"
export DB_PASSWORD="$password"

# Print the environment variables for verification
echo "DB_HOST: $DB_HOST"
echo "DB_USER: $DB_USER"
echo "DB_PORT: $DB_PORT"
echo "DB_PASSWORD: $DB_PASSWORD"
