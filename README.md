# Curriculum Rest API Development 

This repository contains a development environment for the opendata.slo.nl curriculum rest api. The rest api needs a working graphql server, so that is also included, but there should be no need for further development here.

## Setup

```bash
cd curriculum-graphql-server
git submodule update --init
git submodule foreach 'git checkout editor'
cd ..
```

## Usage

```bash
docker-compose up
```

This starts two docker images, one for the rest api on localhost:4500. And one for the graphql server on localhost:3500.

The startup of the graphql server can take a few minutes, it will also run npm install and fetch all the data from the submodules and combine them in a single json file for the graphql server.

## Todo

In production the rest api runs with an apache server as proxy. This server also provides the static assets (css, images, etc.) These are currently missing in this setup.

