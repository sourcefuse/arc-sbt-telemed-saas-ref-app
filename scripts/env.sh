SAAS_CONFIG_SECRET_NAME="/telemed-saas/config" ## Modify this secret name with the secret you created and stored saas config in.
SAAS_CONFIG_SECRET_VALUE=$(aws secretsmanager get-secret-value --secret-id $SAAS_CONFIG_SECRET_NAME --query SecretString --output text)
