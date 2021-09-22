#!/bin/bash
set -e

# Install the aws cli
sudo apt-get update && sudo apt-get install -y python3-pip
pip3 install awscli-local awscli

# Execute localstack setup files
for Script in .docker/localstack/*.sh ; do
    bash "$Script"
done
