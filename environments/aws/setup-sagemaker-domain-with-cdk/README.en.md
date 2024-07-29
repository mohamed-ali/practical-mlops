# Set up a Minimal SageMaker Domain with AWS CDK

This AWS Cloud Development Kit (CDK) example demonstrates how to set up a minimal SageMaker Domain using TypeScript.
The SageMaker Domain will be configured to use the default VPC of the account and its associated public subnets.
Additionally, it creates a SageMaker execution role and sets it as the default role for user profiles within the domain.

## Overview

- Creates a SageMaker Domain named `CustomSageMakerDomain` using the `aws-sagemaker` construct.
- Imports the default VPC of the account and retrieves its public subnets.
- Creates a SageMaker execution role named `SageMakerExecutionRole` with the `AmazonSageMakerFullAccess` managed policy attached.
- Configures the SageMaker Domain to use the default VPC, public subnets, and the created execution role as the default user role.

## Installation

1. Copy the `setup-minimal-sagemaker-domain` folder to the AWS CloudShell environment.
2. Navigate to the folder:
   ```
   cd setup-minimal-sagemaker-domain
   ```
3. Install the required dependencies:
   ```
   npm install
   ```

## Deployment

1. Bootstrap the CDK environment (only required once per account/region):
   ```
   cdk bootstrap
   ```
2. Deploy the CDK stack:
   ```
   cdk deploy
   ```

After successful deployment, the CloudFormation output will include the Amazon Resource Name (ARN) of the created SageMaker Domain.

## Cleanup

To delete the created resources, run the following command:

```
cdk destroy
```

## Additional Notes

- The `AmazonSageMakerFullAccess` managed policy grants broad permissions to SageMaker. It is recommended to follow the principle of least privilege and create a custom policy with the minimum required permissions.
- The SageMaker Domain will use the default settings for user profiles, JupyterServer, and KernelGateway applications. You can customize these settings by modifying the `defaultUserSettings` property in the CDK code.
