#!/bin/bash
set -e

echo "Adding service hosts records"

# These should match the services you are creating in your docker-compose file
declare -a arr=("mysql" "localstack" "snowplow")

for i in "${arr[@]}"; do
    echo 127.0.0.1 "$i" | sudo tee -a /etc/hosts
done
