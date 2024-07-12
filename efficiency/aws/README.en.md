# Use Lifecycle Configuration scripts on SageMaker Domains enhance development efficiency

Lifecycle configuration scripts in SageMaker Domains and Notebooks allow you to automate various tasks and introduce efficiencies into your machine learning workflows. These scripts can be executed during specific lifecycle events, such as the creation or start-up of a notebook instance. By leveraging lifecycle configuration scripts, you can achieve the following benefits:

1. **Cost Optimization**: Implement automatic shutdown of idle notebook instances to reduce costs associated with running resources when not in use. This can be particularly beneficial for scenarios where notebook instances are frequently idle, ensuring that you only pay for the resources you actually utilize.
2. **Increased Productivity**: Enable local Docker mode for faster debugging and testing of your code. By running Docker in local mode, you can significantly reduce the time required for debugging and testing iterations, allowing for more efficient development cycles and quicker turnaround times.
3. **Consistent Environments**: Preload dependencies, packages, or datasets required for your machine learning workflows. This ensures a consistent environment across different notebook instances, minimizing setup time and reducing the potential for errors or inconsistencies.
4. **Automated Setup**: Automate the installation and configuration of tools, libraries, or frameworks required for your specific use cases. This streamlines the setup process and reduces the manual effort required, allowing you to focus on your core machine learning tasks.
5. **Customization**: Tailor the notebook environment to your specific needs by executing custom scripts or commands during the lifecycle events. This flexibility enables you to adapt the environment to your unique requirements, enhancing productivity and efficiency.

## Lifecycle Configuration Scripts

These script are normal bash script that are run each time the notebook environment to which they are attached is started.
Therefore, they can be used to install dependencies, clone git repositories, configure the envoronement, etc.
Once run successfully the environment will be ready for the user with all the configuration within these scripts included.

The script `jupyterlab-setup-lcc-script.sh` configures:

1. Auto-shutdown of instances used by SageMaker Jupyterlab notebook if they are idle for more than 3600 seconds.
2. They also install docker dependencies to allow you to use the [SageMaker Local mode](https://docs.aws.amazon.com/sagemaker/latest/dg/pipelines-local-mode.html) when development your ML jobs and pipelines.


## Installing the lifecycle configuration script

### Option 1: Install using `install-lcc-script.sh`

You can install the script `jupyterlab-setup-lcc-script.sh` lifecycle configuration script using the installation script `install-lcc-script.sh` by upload both scripts to AWS CloudShell or Cloud9 and running the following command.

```
install-lcc-script.sh <domain_id> <lifecycle_config_name>
```

### Option 2: Install the LCC script step-by-step

To install the lifecycle configuration script step-by-step or understand the steps required to install it, follow the instruction below:

1. Identify the SageMaker Domain ID where you want to activate docker. You can do this through the SageMaker Console
    1. Go to [SageMaker Console](https://console.aws.amazon.com/sagemaker/home), make sure you are in the correct region.
    2. Click on **Domains** in the left navigation panel. You will see a list of domain, copy the Id of the relevant domain.
2. Replace `<DOMAIN_ID>` in the following command with your domain-id, then run it using AWS CloudShell to enable docker on the relevant domain
```
DOMAIN_ID="<DOMAIN_ID>"
aws --region $AWS_REGION sagemaker update-domain --domain-id $DOMAIN_ID \
    --domain-settings-for-update '{"DockerSettings": {"EnableDockerAccess": "ENABLED"}}'
```
Next we follow the process in the [official documentation](https://docs.aws.amazon.com/sagemaker/latest/dg/jl-lcc-create.html) to create and associate the lifecycle configuration script inside `jupyterlab-setup-lcc-script.sh`
to your domain of of choice. The steps are outlined below:

1. Upload the script `jupyterlab-setup-lcc-script.sh` to AWS CloudShell.
2. Run the command below to store a `base64` version of the script in the environment variable LCC_CONTENT
```
LCC_CONTENT=`openssl base64 -A -in jupyterlab-setup-lcc-script.sh`
```
3. Next, run the following command to create a lifecycle configuration that runs when you launch an associated JupyterLab application. The script will be created with the name `setup-jupyterlab-environment`.
```
aws sagemaker create-studio-lifecycle-config \
--region $AWS_REGION \
--studio-lifecycle-config-name setup-jupyterlab-environment \
--studio-lifecycle-config-content $LCC_CONTENT \
--studio-lifecycle-config-app-type JupyterLab
```
4. Finally attach the lifecycle configuration script to your domain, by updating the `<DOMAIN_ID>` in the following commands, then running them through AWS CloudShell.
```
AWS_ACCOUNT_ID=`aws sts get-caller-identity --query Account --output text`
LCC_ARN="arn:aws:sagemaker:$AWS_REGION:$AWS_ACCOUNT_ID:studio-lifecycle-config/setup-jupyterlab-environment"
aws sagemaker update-domain \
--domain-id $DOMAIN_ID \
--region $AWS_REGION \
--default-user-settings "{
  \"JupyterLabAppSettings\": {
    \"LifecycleConfigArns\":
      [\"$LCC_ARN\"]
  }
}"
```