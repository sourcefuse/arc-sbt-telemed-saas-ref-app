# Check out https://hub.docker.com/_/node to select a new base image
FROM public.ecr.aws/lambda/nodejs:20-x86_64 AS BUILD_IMAGE

# Create app directory
RUN mkdir -p ${LAMBDA_TASK_ROOT}

WORKDIR ${LAMBDA_TASK_ROOT}

# Install app dependencies
COPY package*.json ./

RUN npm install

# Bundle migrations code
COPY . .

CMD [ "./index-lambda.handler" ]
