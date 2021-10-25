# Pocket + CDKTF workshop
In this workshop we'll apply the CDKTF constructs from
[Pocket's terraform-modules](https://www.npmjs.com/package/@pocket-tools/terraform-modules)
to spin up a production-ready application and database. Included are:

- **Auto-scaling** on both the application and database.
- **A dashboard** to monitor the application.
- **Alarms** that alert the team through PagerDuty.
- **Permissions** according to the [principle of least privilege](https://en.wikipedia.org/wiki/Principle_of_least_privilege). 

## Prerequisites
- NodeJS/NPM
  - Required to synth the infrastructure code.
- AWS account
  - You can sign up for a free AWS account at https://aws.amazon.com/free.
  - For the purpose of this workshop, create an IAM user and attach the [AdministratorAccess](https://console.aws.amazon.com/iam/home#policies/arn:aws:iam::aws:policy/AdministratorAccess) policy.
    - Create an access key for the user
  - Install the AWS cli, following instructions form the [AWS documentation](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html).
    - [Configure a profile](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html) using the AWS cli.
      - Run `aws configure [--profile=<name>]` from your terminal.
      - Add the access key credentials for your admin user created above.
  - Create a Route53 hosted zone in your AWS account:
    - Register a domain or move an existing domain to Route53. This comes at a cost of ~$10 or typically less. Follow the instruction in the [AWS Documentation](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/domain-register.html#domain-register-procedure).
- Terraform CLI
  - Download and install the latest terraform cli for your operating system from https://www.terraform.io/downloads.html.
- Terraform cloud account (This is not a requirement, but we recommended it)
  - You can sign up for a free account at https://app.terraform.io/signup/account
  
## Getting Started
- Install dependencies
  - `npm ci`
- Build - Transpile typescript code to javascript and synthesize to terraform friendly JSON.
  - `npm run build`
- Get into the directory with terraform JSON
  - `cd cdktf.out/stacks/pocket-cdktf`
- Initialize the remote backend
  - `terraform init`
- Plan and inspect the resources to be created/modified/deleted
  - `terraform plan`
- Apply changes
  - `terraform apply`

## Template
This workshop starts with a 'Hello World' template that previously created and explain here:

[![Watch the video](https://img.youtube.com/vi/pj6iEqtYVsQ/default.jpg)](https://youtu.be/pj6iEqtYVsQ)


## Workshop Steps
We'll spin up a production-ready application that uses a database
using [Unleash](https://docs.getunleash.io/) as our example.
Unleash lets you turn new features on/off in production with no need for redeployment.
At Pocket, we use Unleash to 
[run A/B test experiments](https://www.getunleash.io/blog/a-b-n-experiments-in-3-simple-steps).

### Step 1: Create a VPC
Our first step is to create a VPC (Virtual Private Cloud)
that isolates our server, such that it can only be accessed
from the internet by going through our load balancer. 
We will use Terraform HCL to create the VPC because 
this task is usually performed by dev-ops, who are more familiar
with HCL than with CDKTF.

1. Open the `main.tf` file in your IDE and update the AWS region in the provider, the availability zones of the subnets and the name of the VPC. Run the following command to get the list of availability zones, replacing `<region>` with your region name:
    ```shell
    aws ec2 describe-availability-zones --query 'AvailabilityZones[].ZoneName' --region <region>
    ```
2. `cd vpc` - Get into the `vpc` directory
3. `terraform init` - Initialize terraform to download module and providers
4. `terraform plan` - To inspect the plan for the resources that will be created
5. `terraform apply` - To create/update the resources
6. Navigate to your [AWS VPC Dashboard](https://console.aws.amazon.com/vpc/home). Copy your VPC id, public subnet ids and private subnet ids. We will use them to in the Pocket custom construct.

### Step 2: Change the container image
Change to the image from httpd to Unleash:
```typescript
containerImage: 'unleashorg/unleash-server:4.1.4'
```

This will load the [Unleash Server Docker image](https://hub.docker.com/r/unleashorg/unleash-server)
from Docker Hub.

### Step 3: Reorganize our code


### Step 4: Create a database

### Step 5: Grant our application access

### Step 6: Deploy
