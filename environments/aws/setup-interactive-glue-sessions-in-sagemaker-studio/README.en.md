As per the [official documentation](https://docs.aws.amazon.com/glue/latest/dg/interactive-sessions-sagemaker-studio.html):

> AWS Glue Interactive Sessions is an on-demand, serverless, Apache Spark runtime environment that data scientists and engineers can use to rapidly build, test, and run data preparation and analytics applications. You can initiate an AWS Glue interactive session by starting an Amazon SageMaker Studio Classic notebook.

In a nutshell, these interactive sessions are quite suitable for writing and debugging your PySpark code faster.

To use these sessions in JupyterLab notebooks within SageMaker Studio, the SageMaker Execution Role needs to be extended with extra IAM permissions. The additional IAM permissions are outlined in the [documentation](https://docs.aws.amazon.com/sagemaker/latest/dg/getting-started-glue-sm.html).

Follow these steps to add the required permissions:

1. **Identify the SageMaker Execution Role**

Identify the SageMaker Execution Role of the SageMaker domain where you want to use the Glue interactive sessions. Then, open AWS CloudShell and export it as an environment variable:

```bash
export SAGEMAKER_ROLE_NAME=AmazonSageMaker-ExecutionRole-XXXXXXXXXXXXX
```

2. **Attach a Managed Policy**

Next, run the following command in AWS CloudShell to extend the SageMaker Execution Role with the managed policy `AwsGlueSessionUserRestrictedServiceRole`:

```bash
aws iam attach-role-policy \
    --role-name $SAGEMAKER_ROLE_NAME \
    --policy-arn arn:aws:iam::aws:policy/service-role/AwsGlueSessionUserRestrictedServiceRole
```

3. **Add Inline Policy**

```bash
aws iam put-role-policy \
    --role-name $SAGEMAKER_ROLE_NAME \
    --policy-name glue-sagemaker-interactive-sessions-setup \
    --policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":["iam:GetRole","iam:PassRole","sts:GetCallerIdentity"],"Resource":"*"}]}'
```

4. **Update Trust Policy**

```bash
aws iam update-assume-role-policy \
    --role-name $SAGEMAKER_ROLE_NAME \
    --policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":["glue.amazonaws.com","sagemaker.amazonaws.com"]},"Action":"sts:AssumeRole"}]}'
```

5. **Use the Glue PySpark Kernel**

Now, you can copy the notebook `notebook-with-glue-interactive-sessions-in-sagemaker.ipynb`, open it using the `Glue PySpark` kernel, and start using the session to develop your PySpark code.