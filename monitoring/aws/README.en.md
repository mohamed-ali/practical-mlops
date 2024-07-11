# Monitor Amazon SageMaker Pipelines

In this example, we create an [AWS CDK](https://docs.aws.amazon.com/cdk/v2/guide/home.html) application to write infra-structure as code that allow as to create a solution to monitor the states of [Amazon SageMaker Pipelines](https://docs.aws.amazon.com/sagemaker/latest/dg/pipelines-sdk.html) within an AWS Account.
This allows the machine learning and data science team maintaining using these pipelines to training their models to get notified when any pipeline execution fails or is stopped.

Since Amazon SageMaker pipeline is a popular option for orchestrating ML workflow on AWS, this solution will enhance the experience of using it by automitcally informing the ML team about states.

To use this solution, download the folder `sagemaker-pipelines-monitoring` or clone this repo and go inside the folder, then add your emails to the file `sagemaker-pipelines-monitoring/emails.yaml` which has this format:

```yaml
emails:
    - ml-team-member-1@example.com
    - ml-team-member-2@example.com
    - ml-team-alias@example.com
```

Once done, install the solution by running the commands below in terminal with aws cdk installed. This can be done using a AWS Cloud9 environment or an AWS CloudShell or by setting up the AWS CDK cli in your local environment.

1. Navigate into the directory `cd sagemaker-pipelines-monitoring`.
2. Install the dependencies `npm clean-install`
3. Bootstrap cdk in the account `npx cdk bootstrap`
4. Deploy the solution `npx cdk deploy`

The recipients will receive an email to confirm they want to subscribe to the notifications, once confirmed they will receive emails automitcally upon SageMaker Pipelines failures.