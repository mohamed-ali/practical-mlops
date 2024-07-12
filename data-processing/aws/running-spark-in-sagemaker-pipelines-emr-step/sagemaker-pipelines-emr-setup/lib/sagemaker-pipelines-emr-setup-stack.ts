import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';

export class SagemakerPipelinesEmrSetupStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // read more about EMR service linked roles
    // https://docs.aws.amazon.com/emr/latest/ManagementGuide/emr-iam-roles.html
    // using iceberg with EMR
    // https://docs.aws.amazon.com/emr/latest/ReleaseGuide/emr-iceberg-use-spark-cluster.html
    const accountId = this.account;
    const region = this.region;

    // -------------------------------------------------------------------------
    // Create a managed IAM policy to attach to SageMaker Execution Role
    // -------------------------------------------------------------------------
    const sageMakerExecutionRolePolicy = new iam.ManagedPolicy(this, 'SageMakerExecutionRolePolicy', {
      managedPolicyName: "EMRSageMakerPipelinesIntegration",
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ["iam:CreateServiceLinkedRole"],
          resources: [
            "arn:aws:iam::*:role/aws-service-role/elasticmapreduce.amazonaws.com/AWSServiceRoleForEMRCleanup"
          ]
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ["elasticmapreduce:AddTags"],
          resources: [
            `arn:aws:elasticmapreduce:*:${accountId}:cluster/*`
          ]
        })
      ],
      description: 'IAM policy for EMR and SageMaker pipeline integration to be attached to SageMaker execution role',
    });

    // -------------------------------------------------------------------------
    // Create the instance profile role
    // -------------------------------------------------------------------------
    const EMRInstanceProfileRoleName = 'AmazonEMR-InstanceProfile-Role-ForSageMakerPipelines';
    const emr_instance_profile_role = new iam.Role(this, 'InstanceProfileRole', {
      roleName: EMRInstanceProfileRoleName,
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
    });

    // Create the custom managed policy
    const policyName = 'AmazonEMR-InstanceProfile-Policy-ForSageMakerPipelines';
    const policy = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            's3:AbortMultipartUpload',
            's3:CreateBucket',
            's3:DeleteObject',
            's3:ListBucket',
            's3:ListBucketMultipartUploads',
            's3:ListBucketVersions',
            's3:ListMultipartUploadParts',
            's3:PutBucketVersioning',
            's3:PutObject',
            's3:PutObjectTagging',
          ],
          resources: [
            `arn:aws:s3:::aws-logs-${accountId}-${region}/elasticmapreduce/*`,
          ],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            's3:GetBucketVersioning',
            's3:GetObject',
            's3:GetObjectTagging',
            's3:GetObjectVersion',
            's3:ListBucket',
            's3:ListBucketMultipartUploads',
            's3:ListBucketVersions',
            's3:ListMultipartUploadParts',
          ],
          resources: [
            'arn:aws:s3:::elasticmapreduce/*',
            'arn:aws:s3:::*.elasticmapreduce/*',
          ],
        }),
        // New policy statement for S3 buckets containing "sagemaker"
        // You need to update this role to grant access to any other s3 bucket you may need to use.
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            's3:GetObject',
            's3:PutObject',
            's3:DeleteObject',
            's3:ListBucket',
          ],
          resources: [
            '*',
          ],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            'glue:*',
          ],
          resources: [
            '*',
          ],
        }),
      ],
    });

    const customPolicy = new iam.ManagedPolicy(this, 'InstanceProfilePolicy', {
      managedPolicyName: policyName,
      document: policy,
    });

    // Attach the custom policy to the role
    emr_instance_profile_role.addManagedPolicy(customPolicy);

    // Create the instance profile and associate the role
    const instanceProfile = new iam.InstanceProfile(this, 'InstanceProfile', {
      instanceProfileName: 'AmazonEMR-InstanceProfile-ForSageMakerPipelines',
      role: emr_instance_profile_role,
      path: "/service-role/",
    });

    // -------------------------------------------------------------------------
    // Create the EMR service role
    // -------------------------------------------------------------------------
    const serviceRoleName = 'AmazonEMR-ServiceRole-ForSageMakerPipelines';
    const emrServiceRole = new iam.Role(this, 'EMRServiceRole', {
      roleName: serviceRoleName,
      assumedBy: new iam.ServicePrincipal('elasticmapreduce.amazonaws.com'),
      path: "/service-role/",
      inlinePolicies: {
        PassRole: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ["iam:PassRole"],
              resources: ["*"],
              conditions: {
                StringLike: {
                  "iam:PassedToService": "ec2.amazonaws.com*",
                },
              },
            }),
          ],
        }),
      },
    });

    // Attach the AmazonEMRServicePolicy_v2 service-linked role policy by ARN
    emrServiceRole.addManagedPolicy(
      iam.ManagedPolicy.fromManagedPolicyArn(
        this,
        "AmazonEMRServicePolicy",
        'arn:aws:iam::aws:policy/service-role/AmazonEMRServicePolicy_v2'
      )
    );

    // Add permission to create the AWSServiceRoleForEMRCleanup service-linked role
    emrServiceRole.addToPrincipalPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["iam:CreateServiceLinkedRole"],
        resources: [
          "arn:aws:iam::*:role/aws-service-role/elasticmapreduce.amazonaws.com/AWSServiceRoleForEMRCleanup"],
      })
    );

    // Add the requested permissions to the EMR service role
    emrServiceRole.addToPrincipalPolicy(
      new iam.PolicyStatement({
        sid: "CreateInNetwork",
        effect: iam.Effect.ALLOW,
        actions: [
          "ec2:CreateNetworkInterface",
          "ec2:RunInstances",
          "ec2:CreateFleet",
          "ec2:CreateLaunchTemplate",
          "ec2:CreateLaunchTemplateVersion",
        ],
        resources: [
          "arn:aws:ec2:*:*:subnet/*",
          "arn:aws:ec2:*:*:security-group/*",
        ],
      })
    );

    emrServiceRole.addToPrincipalPolicy(
      new iam.PolicyStatement({
        sid: "ManageSecurityGroups",
        effect: iam.Effect.ALLOW,
        actions: [
          "ec2:AuthorizeSecurityGroupEgress",
          "ec2:AuthorizeSecurityGroupIngress",
          "ec2:RevokeSecurityGroupEgress",
          "ec2:RevokeSecurityGroupIngress",
        ],
        resources: ["arn:aws:ec2:*:*:security-group/*"],
      })
    );

    emrServiceRole.addToPrincipalPolicy(
      new iam.PolicyStatement({
        sid: "CreateDefaultSecurityGroupInVPC",
        effect: iam.Effect.ALLOW,
        actions: ["ec2:CreateSecurityGroup"],
        resources: ["arn:aws:ec2:*:*:vpc/*"],
      })
    );

    emrServiceRole.addToPrincipalPolicy(
      new iam.PolicyStatement({
        sid: "PassRoleForEC2",
        effect: iam.Effect.ALLOW,
        actions: ["iam:PassRole"],
        resources: [emr_instance_profile_role.roleArn],
        conditions: {
          StringLike: {
            "iam:PassedToService": "ec2.amazonaws.com",
          },
        },
      })
    );

    // -------------------------------------------------------------------------
    // Add stack outputs
    // -------------------------------------------------------------------------
    new cdk.CfnOutput(this, 'EMRServiceRoleArn', {
      value: emrServiceRole.roleArn,
      description: 'The ARN of the EMR service role',
    });

    new cdk.CfnOutput(this, 'InstanceProfileArn', {
      value: instanceProfile.instanceProfileArn,
      description: 'The ARN of the instance profile',
    });

    new cdk.CfnOutput(this, 'SageMakerExecutionRolePolicyArn', {
      value: sageMakerExecutionRolePolicy.managedPolicyArn ,
      description: 'The ARN of the sageMakerExecutionRolePolicy',
    });

  }
}