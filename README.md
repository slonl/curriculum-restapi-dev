# Curriculum Rest API Development 

This repository contains a development environment for the opendata.slo.nl curriculum rest api. 

## Setup

```bash
git submodule update --init
docker compose up -d
./install.sh
```

## Usage

```bash
docker-compose up
```

This starts four docker images
- rest-api, available on localhost:4500
- curriculum-store, available on localhost:3000
- search-server, available on localhost:3001
- curriculum-registration, available on localhost:4930

