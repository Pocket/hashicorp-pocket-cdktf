# Setup

### For all services:

* Ensure project is configured in [pocket/shared-infrastructure](https://github.com/Pocket/shared-infrastructure/). This sets up CodeBuild, Terraform workspace, the user, and the project environment for CircleCI.

### For non-graphql services:
* Delete `graphql-config.yml`
* Uncomment jobs that are not configured for this repository e.g. `pocket/docker_build`, `pocket/execute_codepipeline`
* Configure `test_integrations` job

### For graphql services (in our federated subgraph):
* Delete `config.yml`
* Rename `graphql-config.yml` > `config.yml`
* Configure `test_integrations` job
* Note: Don't need to uncomment jobs (circlei doesn't execute `graphql-config.yml`)
