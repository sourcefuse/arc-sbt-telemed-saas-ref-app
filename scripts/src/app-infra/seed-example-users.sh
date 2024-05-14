cd $PROJECT_ROOT
cd ./telemed-app/backend/authentication-service

npm install

export DB_HOST=$DB_HOST
export DB_USER=$DB_USER
export DB_DATABASE=$APP_PARAM_AUTH_SERVICE_DB_NAME
export DB_PASSWORD=$DB_PASSWORD
export DB_PORT=$DB_PORT
export ADD_WEB_APP_CLIENT="no"
export ADD_ROLES="no"
export TENANT_NAME=$TENANT_NAME
export TENANT_STATUS='1'
export TENANT_KEY=$TENANT_SLUG
export DOCTOR_FIRST_NAME="Demo"
export DOCTOR_LAST_NAME="Doctor"
export DOCTOR_EMAIL="doctor@$TENANT_SLUG.com"
export PATIENT_FIRST_NAME="Demo"
export PATIENT_LAST_NAME="Patient"
export PATIENT_EMAIL="patient@$TENANT_SLUG.com"

node src/dynamic-user-seed.js