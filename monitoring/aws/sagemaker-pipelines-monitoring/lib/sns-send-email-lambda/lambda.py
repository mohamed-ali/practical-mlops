import json
import os
import boto3
from datetime import datetime

sns_client = boto3.client("sns")
sagemaker_client = boto3.client("sagemaker")
session = boto3.Session()
region = session.region_name


EMAIL_TEMPLATE = """
Subject: SageMaker Pipeline Execution Status

Detail Type: {detail_type}
Pipeline Name: {pipeline_name}
Pipeline Execution Status: {pipeline_status}
{failure_message}

Execution Details:
Start Time: {execution_start_time}
End Time: {execution_end_time}

Pipeline ARN: {pipeline_arn}
Pipeline Execution ARN: {pipeline_execution_arn}

First Failed Step:
{first_failed_step}

CloudWatch Log Link:
{cloudwatch_log_link}
"""


def get_job_name_and_log_group(step_metadata):
    job_name = None
    if "ProcessingJob" in step_metadata:
        job_name = step_metadata["ProcessingJob"]["Arn"].split("/")[-1]
        log_group = "/aws/sagemaker/ProcessingJobs"
    elif "TrainingJob" in step_metadata:
        job_name = step_metadata["TrainingJob"]["Arn"].split("/")[-1]
        log_group = "/aws/sagemaker/TrainingJobs"
    elif "TransformJob" in step_metadata:
        job_name = step_metadata["TransformJob"]["Arn"].split("/")[-1]
        log_group = "/aws/sagemaker/TransformJobs"
    elif "TuningJob" in step_metadata:
        job_name = step_metadata["TuningJob"]["Arn"].split("/")[-1]
        log_group = "/aws/sagemaker/TuningJobs"
    elif "AutoMLJob" in step_metadata:
        job_name = step_metadata["AutoMLJob"]["Arn"].split("/")[-1]
        log_group = "/aws/sagemaker/AutoMLJobs"
    return job_name, log_group


def handler(event, context):
    print(event)
    topic_arn = os.environ["TOPIC_ARN"]
    # In case of different teams managing different projects,
    # the separation of notifications. can be done using different topics.
    # the same lambda function can be used, with a mapping configuration as below
    # to decide to whom the notification should be sent for a current pipeline.
    # topic_to_team_mapping = [
    #     {"topic_id": "id", "teams_email": "team-forecasting@jumia.com", "pipelines": ["p1"]}
    # ]
    topic_to_team_mapping = [
        {
            "topic_id": "id",
            "teams_email": "team-forecasting@jumia.com",
            "pipelines": ["p1"],
        }
    ]

    pipeline_execution_arn = event["detail"]["pipelineExecutionArn"]
    detail_type = event["detail-type"]
    execution_details = sagemaker_client.describe_pipeline_execution(
        PipelineExecutionArn=pipeline_execution_arn
    )

    print(execution_details)

    pipeline_arn = execution_details["PipelineArn"]
    pipeline_name = pipeline_arn.split("/")[-1]
    pipeline_status = execution_details["PipelineExecutionStatus"]
    execution_start_time = execution_details["CreationTime"].strftime(
        "%Y-%m-%d %H:%M:%S"
    )
    execution_end_time = execution_details["LastModifiedTime"].strftime(
        "%Y-%m-%d %H:%M:%S"
    )
    pipeline_execution_arn = execution_details["PipelineExecutionArn"]

    first_failed_step = None
    cloudwatch_log_link = None
    if pipeline_status == "Failed":
        failure_reason = execution_details.get(
            "FailureReason", "Unknown failure reason"
        )
        failure_message = f"Failure Reason: {failure_reason}"

        # Find the first failed step and construct its CloudWatch log link
        response = sagemaker_client.list_pipeline_execution_steps(
            PipelineExecutionArn=pipeline_execution_arn,
            MaxResults=100,  # Adjust as needed
        )
        print(response)

        for step in response["PipelineExecutionSteps"]:
            if step["StepStatus"] == "Failed":
                first_failed_step = f"Step Name: {step['StepName']}\nStep Failure Reason: {step['FailureReason']}"
                job_name, log_group = get_job_name_and_log_group(step["Metadata"])
                if job_name:
                    cloudwatch_log_link = f"https://{region}.console.aws.amazon.com/cloudwatch/home?region={region}#logStream:group={log_group};prefix={job_name}"
                break
    else:
        failure_message = ""

    email_body = EMAIL_TEMPLATE.format(
        pipeline_name=pipeline_name,
        detail_type=detail_type,
        pipeline_status=pipeline_status,
        failure_message=failure_message,
        execution_start_time=execution_start_time,
        execution_end_time=execution_end_time,
        pipeline_arn=pipeline_arn,
        pipeline_execution_arn=pipeline_execution_arn,
        first_failed_step=first_failed_step or "No failed steps",
        cloudwatch_log_link=cloudwatch_log_link or "No CloudWatch log link available",
    )

    try:
        response = sns_client.publish(
            TopicArn=topic_arn,
            Message=email_body,
            Subject="SageMaker Pipeline Execution Status",
        )
        print("Email notification sent successfully:", response)
    except Exception as e:
        print("Error sending email notification:", e)
