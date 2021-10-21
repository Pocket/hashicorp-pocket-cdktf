# Pocket + CDKTF + TF Modules

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
  - Create a VPC in your for your AWS account. Follow the instructions in the [Creating a VPC](#creating-a-vpc) section of this readme.
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

## Creating a VPC  
To make this easy we have included a terraform HCL file in the `vpc` directory.

- Open the `main.tf` file in your IDE and update the AWS region in the provider, the availability zones of the subnets and the name of the VPC. To get the list of availability zones for a given region:
  - Run `aws ec2 describe-availability-zones --query 'AvailabilityZones[].ZoneName' --region <region>`. Ex. `aws ec2 describe-availability-zones --query 'AvailabilityZones[].ZoneName' region=us-east-1`
- From your favorite terminal:
  1. `cd vpc` - Get into the `vpc` directory
  2. `terraform init` - Initialize terraform to download module and providers
  3. `terraform plan` - To inspect the plan for the resources that will be created
  4. `terraform apply` - To create/update the resources
- Navigate to your [AWS VPC Dashboard](https://console.aws.amazon.com/vpc/home)
  - Copy your VPC id, public subnet ids and private subnet ids: We will use them to in the Pocket custom construct.

