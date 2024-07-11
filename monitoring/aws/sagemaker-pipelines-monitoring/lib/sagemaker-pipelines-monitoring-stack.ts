import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as path from 'path';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as yaml from 'js-yaml';
import * as fs from 'fs';

interface EmailsData {
  emails: string[];
}

export class SagemakerPipelinesMonitoringStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const topic = new sns.Topic(this, 'NotificationTopic');

    const sendEmailFunction = new lambda.Function(this, 'SendEmailFunction', {
      runtime: lambda.Runtime.PYTHON_3_12,
      code: lambda.Code.fromAsset(path.join(__dirname, 'sns-send-email-lambda')),
      handler: 'lambda.handler',
      environment: {
        TOPIC_ARN: topic.topicArn,
      },
    });

    // Grant the Lambda function permission to publish to the SNS topic
    topic.grantPublish(sendEmailFunction);
    
    sendEmailFunction.role?.attachInlinePolicy(
      new iam.Policy(this, 'SageMakerPipelineAccess', {
        statements: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
              'sagemaker:DescribePipelineExecution',
              'sagemaker:ListPipelineExecutionSteps'
              ],
            resources: ['*'],
          }),
        ],
      })
    );

    // Load the email addresses from the YAML file
    const emailsYamlFilePath = path.join(__dirname, '..', 'emails.yaml');
    const emailsYamlFile = fs.readFileSync(emailsYamlFilePath, 'utf8');
    const emailsData = yaml.load(emailsYamlFile) as EmailsData;
    const emails = emailsData.emails;

    // Subscribe each email address to the SNS topic
    for (const email of emails) {
      topic.addSubscription(new subscriptions.EmailSubscription(email));
    }
    // Create an EventBridge rule to capture SageMaker pipeline failures
    const pipelineFailureRule = new events.Rule(this, 'PipelineFailureRule', {
      eventPattern: {
        source: ['aws.sagemaker'],
        detailType: ['SageMaker Model Building Pipeline Execution Status Change'],
        detail: {
          'currentPipelineExecutionStatus': ['Failed', 'Stopped'],
        },
      },
    });

    // Add the Lambda function as a target for the EventBridge rule
    pipelineFailureRule.addTarget(new targets.LambdaFunction(sendEmailFunction));

    // Grant the necessary permissions for the EventBridge service to invoke the Lambda function
    sendEmailFunction.grantInvoke(new iam.ServicePrincipal('events.amazonaws.com'));

  }
}