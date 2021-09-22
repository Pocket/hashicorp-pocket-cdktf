# Backend Starter repository

This repository can be used as a template to spin up a new service. 

Note: please change all reference to `Acme` to your service name. There are `Todo`s in this repository
that points to name changes to your new service name, please address them before spinning up the service.

## Folder structure
- the infrastructure code is present in `.aws`
- the application code is in `src`
- `.docker` contains local setup
- `.circleci` contains circleCI setup

## Develop Locally
```bash
npm install
npm start:dev
```

## Start docker
```bash
# npm ci not required if already up-to-date
npm ci
docker compose up
```
