# Pocket + CDKTF workshop
In this workshop we'll apply the CDKTF constructs from
[Pocket's terraform-modules](https://www.npmjs.com/package/@pocket-tools/terraform-modules)
to spin up a production-ready application and database, using the [Unleash](https://docs.getunleash.io/) 
server as our example. Unleash lets you turn new features on/off in production with no need for redeployment.
At Pocket, we use Unleash to
[run A/B test experiments](https://www.getunleash.io/blog/a-b-n-experiments-in-3-simple-steps).

The deployed service will have:

- **Auto-scaling** on both the application and database.
- **A dashboard** to monitor the application.
- **Alarms** that alert the team through PagerDuty.
- **Permissions** according to the [principle of least privilege](https://en.wikipedia.org/wiki/Principle_of_least_privilege).

## Prerequisites
- Clone the main branch of this repo:
  ```shell
  git clone git@github.com:Pocket/hashicorp-pocket-cdktf.git
  ```
- NodeJS/NPM
  - Required to synth the infrastructure code.
- AWS account, CLI, and Route53 hosted zone:
  - You can sign up for a free AWS account at https://aws.amazon.com/free.
  - For the purpose of this workshop, create an IAM user and attach the [AdministratorAccess](https://console.aws.amazon.com/iam/home#policies/arn:aws:iam::aws:policy/AdministratorAccess) policy.
    - Create an access key for the user
  - Install the AWS CLI, following instructions from the [AWS documentation](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html).
    - [Configure a profile](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html) using the AWS CLI.
      - Run `aws configure [--profile=<name>]` from your terminal.
      - Add the access key credentials for your admin user created above.
  - Create a Route53 hosted zone in your AWS account:
    - Register a domain or move an existing domain to Route53. This comes at a cost of ~$10 or typically less. Follow the instruction in the [AWS Documentation](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/domain-register.html#domain-register-procedure).
- Terraform CLI
  - Download and install the latest Terraform CLI for your operating system from https://www.terraform.io/downloads.html.
- (Optional, but recommended) Terraform cloud account
  - You can sign up for a free account at https://app.terraform.io/signup/account
- (Optional) Watch us write and explain the code that we'll use as the starting point for
this workshop:

  [![Watch the video](https://img.youtube.com/vi/pj6iEqtYVsQ/default.jpg)](https://youtu.be/pj6iEqtYVsQ)

## Workshop Steps
We'll spin up a production-ready application that uses a database
using [Unleash](https://docs.getunleash.io/) as our example.

### Step 1: Create a VPC
Our first step is to create a Virtual Private Cloud (VPC)
that isolates our server, such that it can only be accessed
from the internet by going through our load balancer.
We will use Terraform HCL to create the VPC because
this task is usually performed by dev-ops, who are more familiar
with HCL than with CDKTF.

1. Open the `main.tf` file in your IDE and update the AWS region in the provider, the availability zones of the subnets, and the name of the VPC. Run the following command to get the list of availability zones, replacing `<region>` with your region name:
    ```shell
    aws ec2 describe-availability-zones --query 'AvailabilityZones[].ZoneName' --region <region>
    ```
2. `cd vpc` - Get into the `vpc` directory
3. `terraform init` - Initialize terraform to download module and providers
4. `terraform plan` - To inspect the plan for the resources that will be created
5. `terraform apply` - To create/update the resources
6. Navigate to your [AWS VPC Dashboard](https://console.aws.amazon.com/vpc/home). Copy your VPC id, public subnet ids,
and private subnet ids. We will use them to in the Pocket custom construct.

### Step 2: Reorganize our code and add the VPC config
So far, all our application code is located in `src/main.ts`. That was ok for our 'hello world' example,
but now that we'll be adding some more code, let's split it up into multiple files.

1. Create a new file `src/config.ts`.
2. Cut and paste the `config` variable from `src/main.ts` to `src/config.ts`.
3. Add `export` in front of the `config` variable. It should now look like this:
    ```typescript
    const name = 'HashicorpPocketCdktf';
    const environment = 'Dev';

    export const config = {
      name,
      prefix: `${name}-${environment}`,
      shortName: 'CDKTF',
      environment,
      domain: 'your-domain.goes.here',
      vpcConfig: {
        vpcId: 'vpc-id-goes-here',
        privateSubnetIds: ['first-private-subnet-id-goes-here'],
        publicSubnetIds: ['first-public-subnet-id-goes-here'],
      },
      tags: {
        service: name,
        environment,
      },
      pagerDutyEscalationPolicy: 'PQNGU1N',
    };
    ```
4. Fill in the following config fields:
   1. Set `domain` to a subdomain of the domain in your [Route53 hosted zone](https://console.aws.amazon.com/route53/v2/hostedzones).
      For example, if you own `my-domain.com`, then you can choose `'unleash.my-domain.com'`.
   2. Set the `vpcConfig` to the values you copied in Step 1. You have to enter at least one private and public subnet,
      but you can choose to enter more to increase the availability of your service.
5. Import `config` in `src/main.ts`:
    ```typescript
    import { config } from './config';
    ```

### Step 3: Change the container image to Unleash
For our 'hello world' example, the `containerImage` was set to `httpd` in `src/main.ts` to start an Apache server
responding with "It works!" This time we will use [Unleash](https://docs.getunleash.io/), as an example of a
web application that uses a database.

1. In `src/main.ts`, change to the image from httpd to the [Unleash Server Docker image](https://hub.docker.com/r/unleashorg/unleash-server):
    ```typescript
    containerImage: 'unleashorg/unleash-server:4.1.4'
    ```
2. We will start Unleash on port 4242. In `src/config.ts`, add a config `unleashPort: 4242,` to the `config` object.
3. Back in `src/main.ts`, change all three port 80 references to `config.unleashPort`:
   1. `containerConfigs.portMappings.hostPort`
   2. `containerConfigs.portMappings.containerPort`
   3. `exposedContainer.port`
4. Add an environment variable telling Unleash what port to start on, by setting `containerConfigs.envVars`:
    ```typescript
    envVars: [
      {
        name: 'HTTP_PORT',
        value: `${config.unleashPort}`,
      },
    ],
    ```

### Step 4: Create a database
In this step, we'll create a Relational Database Service (RDS) to run a PostgreSQL database,
which Unleash will use to store its feature flags.

1. Create a new file `src/database.ts` and paste in the following code:
    ```typescript
    import { Construct } from 'constructs';
    import { ApplicationRDSCluster } from '@pocket-tools/terraform-modules';
    import { config } from './config';

    export function createUnleashRDS(scope: Construct) {
      return new ApplicationRDSCluster(scope, 'rds', {
        prefix: `${config.prefix}-database`,
        vpcId: config.vpcConfig.vpcId,
        subnetIds: config.vpcConfig.privateSubnetIds,
        rdsConfig: {
          databaseName: '',
          masterUsername: '',
          engine: '',
          engineMode: '',
          scalingConfiguration: [
            {
              minCapacity: 2,
              maxCapacity: 4,
              autoPause: false, // Prevent serverless Aurora from scaling down when there are no requests.
            },
          ],
        },
        tags: config.tags,
      });
    }
    ```
2. Fill in the `rdsConfig` with the following values:
   1. `databaseName: 'unleash'`, to set the name of the database.
   2. `masterUsername: 'demo_user'`, to set the username of the 'root' user.
   3. `engine: 'aurora-postgresql'`, to create an Aurora PostgreSQL database, which Unleash requires.
   4. `engineMode: 'serverless'`, to let Aurora manage and scale the database for us.
   5. (Optional) Increase `maxCapacity` in `scalingConfiguration` to have a higher ceiling for auto-scaling Aurora.
   6. (Optional) Change the `prefix` if you want a different name for the AWS RDS.

### Step 5: Connect the application with the database
In the previous step we defined our database, and now we'll use it. Make the following changes in `src/main.ts`:

1. Import `createUnleashRDS` in `src/main.ts`.
    ```typescript
    import { createUnleashRDS } from './database';
    ```
2. Add `const rds = createUnleashRDS(this);` to the constructor before the call to `this.createPocketAlbApplication`, to create the RDS. 
3. Add a new argument `rds: ApplicationRDSCluster` to the `createPocketAlbApplication` function definition, and pass in the `rds` const.
4. Database credentials are automatically created for us in the AWS Secrets Manager.
Give the ECS Task Execution Role permission to access to these credentials by changing `ecsIamConfig.taskExecutionRolePolicyStatements` as follows.  
    ```typescript
    taskExecutionRolePolicyStatements: [
      {
        actions: ['secretsmanager:GetSecretValue', 'kms:Decrypt'],
        resources: [`${rds.secretARN}`],
        effect: 'Allow',
      },
    ],
    ```
5. We'll now inject the database credentials into the Docker container, using environment variables that
[Unleash defines in its docs](https://docs.getunleash.io/deploy/configuring_unleash).
Our RDS secret is a JSON object with `host`, `post`, `username`, `password`, `dbname` keys.
AWS Secrets Manager allows these keys to be referenced using the syntax `secret-arn:key-name::`,
where _secret-arn_ is the ARN of the secret and _key-name_ is the JSON key.
Change `containerConfigs.secretEnvVars` to the following to provide Unleash with the database credentials:
    ```typescript
    secretEnvVars: [
      {
        name: 'DATABASE_HOST',
        valueFrom: `${rds.secretARN}:host::`,
      },
      {
        name: 'CONTENT_DATABASE_PORT',
        valueFrom: `${rds.secretARN}:port::`,
      },
      {
        name: 'DATABASE_USERNAME',
        valueFrom: `${rds.secretARN}:username::`,
      },
      {
        name: 'DATABASE_PASSWORD',
        valueFrom: `${rds.secretARN}:password::`,
      },
      {
        name: 'DATABASE_NAME',
        valueFrom: `${rds.secretARN}:dbname::`,
      },
    ],
    ```


### Step 6: Deploy
Run the following commands in your terminal to deploy the stack.

1. `npm ci` to install dependencies
2. `npm run build` to build and transpile typescript code to javascript and synthesize to terraform friendly JSON.
3. `cd cdktf.out/stacks/hashicorp-pocket-cdktf` to go to the directory with Terraform code.
4. `terraform init` to initialize Terraform.
5. `terraform apply` to deploy your stack to AWS.


## Destroying resources
1. Open the AWS Console, and navigate to RDS. Delete the database created for this workshop by selecting it, and
clicking on Actions > Delete. In the dialog that opens, you can opt-out of creating a snapshot. Wait until the RDS
is successfully deleted before proceeding.
2. In your terminal run `cd cdktf.out/stacks/hashicorp-pocket-cdktf` and then do `terraform destroy`.
