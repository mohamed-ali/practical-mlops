#!/bin/bash

usage() {
    echo "Usage: $0 <domain_id> <lifecycle_config_name>"
    echo "Update the specified SageMaker Domain with Docker access and JupyterLab environment setup."
    exit 1
}

if [ -z "$1" ] || [ -z "$2" ]; then
    usage
fi

DOMAIN_ID="$1"
LIFECYCLE_CONFIG_NAME="$2"

# Get the current AWS region
AWS_REGION=$(aws configure get region)
if [ -z "$AWS_REGION" ]; then
    echo "Error: Unable to determine the current AWS region. Please set the AWS_REGION environment variable."
    exit 1
fi

echo "Using AWS Region: $AWS_REGION"

aws --region $AWS_REGION sagemaker update-domain --domain-id $DOMAIN_ID \
    --domain-settings-for-update '{"DockerSettings": {"EnableDockerAccess": "ENABLED"}}'

LCC_CONTENT=`openssl base64 -A -in jupyterlab-setup-lcc-script.sh`

aws sagemaker create-studio-lifecycle-config \
--region $AWS_REGION \
--studio-lifecycle-config-name $LIFECYCLE_CONFIG_NAME \
--studio-lifecycle-config-content $LCC_CONTENT \
--studio-lifecycle-config-app-type JupyterLab

AWS_ACCOUNT_ID=`aws sts get-caller-identity --query Account --output text`
LCC_ARN="arn:aws:sagemaker:$AWS_REGION:$AWS_ACCOUNT_ID:studio-lifecycle-config/$LIFECYCLE_CONFIG_NAME"
aws sagemaker update-domain \
--domain-id $DOMAIN_ID \
--region $AWS_REGION \
--default-user-settings "{
  \"JupyterLabAppSettings\": {
    \"LifecycleConfigArns\":
      [\"$LCC_ARN\"]
  }
}"