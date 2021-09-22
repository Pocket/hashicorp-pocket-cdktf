# Setup

1. Create folders for services to spin up in docker-compose file (examples include a mysql database and localstack)
2. Rename `local.example.env` to `local.env` and add any required environment variables to configure your application
3. Rename `../docker-compose.example.yml` to `../docker-compose.yml` and include any services you're configuring in this file
4. Update `scripts/local-start.sh` as needed. This script will be the entrypoint for your application service.
