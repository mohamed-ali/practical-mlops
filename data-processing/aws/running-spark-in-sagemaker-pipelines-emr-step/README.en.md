# Using EMR to run Spark application within SageMaker Pipelines

This example demonstrates how to set up the necessary IAM permissions to integrate Amazon EMR with SageMaker, allowing you to use the [EMRStep](https://docs.aws.amazon.com/sagemaker/latest/dg/build-and-manage-steps.html#step-type-emr) in SageMaker Pipelines to run Spark applications.

SageMaker Pipelines is a high-level Amazon SageMaker capability that allows you to create, automate, and manage end-to-end machine learning workflows. One of the steps in a SageMaker Pipeline is the `EMRStep`, which enables you to run Apache Spark applications on an Amazon EMR cluster directly from your SageMaker Pipeline.

To use the `EMRStep`, you need to configure the required IAM permissions and roles. This example provides the instructions to set up these permissions using an AWS Cloud Development Kit (CDK) application. The CDK app creates and configures the necessary IAM entities, such as the EMR service role, EC2 instance profile, and a managed policy for the SageMaker execution role.

By following the instructions in this example, you will be able to integrate Amazon EMR with SageMaker Pipelines, allowing you to leverage the power of Apache Spark within your machine learning workflows seamlessly.

## Instructions

1. Copy the folder `sagemaker-pipelines-emr-setup` which contains the CDK stack into AWS CloudShell.

2. Install the required dependencies by following these steps:
   - Navigate into the folder using `cd sagemaker-pipelines-emr-setup`
   - Run `npm clean-install` to install the required Node.js packages
   - Run `npx cdk bootstrap` to bootstrap the AWS CDK environment
   - Run `npx cdk deploy` to deploy the CDK stack

3. Once the stack is installed, find the SageMaker execution role of your domain. You can locate this role by following these steps:
   - Run the cell in the notebook to identify the SageMaker execution role (e.g., `AmazonSageMaker-ExecutionRole-XXXXXX`).
   - Go to the IAM console and search for the role name printed above in the search bar.
   - Click on the role to open its details.

4. Attach the required IAM policies to the SageMaker execution role:
   - Click "Add permissions" on the right side of the role details page.
   - Search for the policy named `EMRSageMakerPipelinesIntegration` (created by the CDK app), select it, and click "Add permissions".
   - Repeat the same process to add the AWS managed policy `AmazonSageMakerPipelinesIntegrations` to the role.

5. After attaching the necessary policies, you can run the notebook end-to-end. SageMaker will create an EMR cluster and run the Spark application on it. The cluster will automatically terminate once the application finishes running.

The CDK app sets up the following IAM entities required for this integration:

- **Service role for Amazon EMR (EMR role)**: This role is passed as the `ServiceRole` parameter. The role is named `arn:aws:iam::{account}:role/service-role/AmazonEMR-ServiceRole-ForSageMakerPipelines` and is referenced in the notebook.
- **Instance profile for cluster EC2 instances (EC2 instance profile)**: This is passed as the `JobFlowRole` parameter. The instance profile is named `arn:aws:iam::{account}:instance-profile/service-role/AmazonEMR-InstanceProfile-ForSageMakerPipelines` and is referenced in the notebook.
- **Managed policy for the SageMaker Execution role**: This policy needs to be attached to the SageMaker Execution role used by the SageMaker Pipeline.

For more details on the service role and instance profile, refer to the [EMR IAM roles](https://docs.aws.amazon.com/emr/latest/ManagementGuide/emr-iam-roles.html) documentation.