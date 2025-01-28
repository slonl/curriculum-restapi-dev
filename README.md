# Curriculum Rest API Development 

This repository contains a development environment for the opendata.slo.nl curriculum rest api.

## Setup

Requires: node and git to be installed.

from the root folder (curriculum-restapi-dev):

```bash
./install.sh
```

Once the install script is run, the apiKeys.json and editors.json need to be added in the curriculum-rest-api folder.

## Usage

Requires: docker installed.

from the root folder (curriculum-restapi-dev):

```bash
docker compose up
```

This starts two docker images, one for the rest api on localhost:4500. And one for the simplystore server on localhost:3500.

## Todo
