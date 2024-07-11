# Monitor Amazon SageMaker Pipelines

In this example, we create an [AWS CDK](https://docs.aws.amazon.com/cdk/v2/guide/home.html) application to write infra-structure as code that allow as to create a solution to monitor the states of [Amazon SageMaker Pipelines](https://docs.aws.amazon.com/sagemaker/latest/dg/pipelines-sdk.html) within an AWS Account.
This allows the machine learning and data science team maintaining using these pipelines to training their models to get notified when any pipeline execution fails or is stopped.

Since Amazon SageMaker pipeline is a popular option for orchestrating ML workflow on AWS, this solution will enhance the experience of using it by automitcally informing the ML team about states.
