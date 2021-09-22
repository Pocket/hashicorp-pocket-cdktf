These scripts are examples for setting up a docker container to run tests on circleci. If you don't need to set up services in a docker container to run your tests, you can delete this folder.

There are four example scripts:

* `setup_aws.sh` - sets up aws cli and starts localstack services
* `setup_db.sh` - sets up mysql db and runs data migrations from a folder
* `setup_hosts.sh` - maps the internal docker host names into /etc/hosts file; this essentially mimics how services are named in docker compose, so circleci can access them
* `setup.sh` - runs the scripts in this directory (based on options provided)

To use:

1. Rename folder from `scripts.example` to `scripts`
2. Make any required changes and ensure it's reflected in `setup_hosts.sh` and `setup.sh`
3. Update `setup.sh` options in circleci `config.yml` as required
