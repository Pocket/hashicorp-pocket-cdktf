# Pocket + CDKTF + TF Modules

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