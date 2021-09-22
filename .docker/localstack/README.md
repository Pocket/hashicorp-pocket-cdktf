# Setup

This sets up localstack resources for integration testing with locally hosted AWS services. If your application does not need to use localstack resources, you can remove this folder.

1. Update setup scripts as needed to create resources (see examples for firehose, kinesis, and sqs)
2. Rename setup scripts to remove `.example` 
3. Ensure localstack is setup in circleci `test_integrations` job in `config.yml` (see example)
4. Ensure .circleci/scripts are configured appropriately (`setup_aws.sh`, `setup_hosts.sh`, `setup.sh`)
5. (Optional) Delete this README file
