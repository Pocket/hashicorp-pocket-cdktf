#!/bin/bash

# Entrypoint for docker app service
cd /app
# Create a .npmrc file with a GitHub token
# Required for repos with a private key
echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}" >> ~/.npmrc
# Start the application
npm run start:dev
