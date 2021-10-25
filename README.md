# Pocket + CDKTF workshop
In this workshop we'll apply the CDKTF constructs from
[Pocket's terraform-modules](https://www.npmjs.com/package/@pocket-tools/terraform-modules)
to spin up a production-ready application and database. Included are:

- **Auto-scaling** on both the application and database.
- **A dashboard** to monitor the application.
- **Alarms** that alert the team through PagerDuty.
- **Permissions** according to the [principle of least privilege](https://en.wikipedia.org/wiki/Principle_of_least_privilege). 

## Prerequisites
- AWS account
- Terraform cloud account
  - Workspace
- NodeJS/NPM

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

### 1. Create a VPC
Our first step is to create a VPC (Virtual Private Cloud)
that isolates our server, such that it can only be accessed
from the internet by going through our load balancer.

We'll spin up a VPC using a Terraform HCL module. 
It makes sense to create the VPC using HCL because 
typically dev-ops would have the expertise to set up
a VPC, and most application developers do not.


- Add VPC subnets to the Parameter Store

### 2. Change the container image
Change to the image from httpd to Unleash:
```typescript
containerImage: 'unleashorg/unleash-server:4.1.4'
```

This will load the [Unleash Server Docker image](https://hub.docker.com/r/unleashorg/unleash-server)
from Docker Hub.

### 3. Reorganize our code


### 4. Create a database

### 5. Grant our application access

### 6. Deploy
