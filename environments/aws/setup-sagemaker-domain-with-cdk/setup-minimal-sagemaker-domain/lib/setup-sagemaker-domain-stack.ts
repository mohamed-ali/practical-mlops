import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as sagemaker from 'aws-cdk-lib/aws-sagemaker';
import * as iam from 'aws-cdk-lib/aws-iam';

export class SetupSagemakerDomainStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    // import existing default VPC
    const existingDefaultVpc = ec2.Vpc.fromLookup(this, 'ExistingDefaultVPC', {isDefault: true});
    
     // Create a SageMaker execution role
    const sagemakerExecutionRole = new iam.Role(this, 'SageMakerExecutionRole', {
      assumedBy: new iam.ServicePrincipal('sagemaker.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSageMakerFullAccess'),
      ],
    });

    // Create a SageMaker Domain
    const domain = new sagemaker.CfnDomain(this, 'SageMakerDomain', {
      vpcId: existingDefaultVpc.vpcId,
      authMode: 'IAM',
      domainName: 'CustomSageMakerDomain',
      // Use private subnets
      subnetIds: existingDefaultVpc.publicSubnets.map(subnet => subnet.subnetId),
      defaultUserSettings: {
        executionRole: sagemakerExecutionRole.roleArn
      }
    });

    new cdk.CfnOutput(this, 'SageMakerDomainOutput', {
      value: domain.attrDomainArn,
      description: 'The ARN of the SageMaker Domain',
      exportName: 'SageMakerDomainARN',
    });

  }
}
