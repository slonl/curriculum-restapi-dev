#!/bin/bash
cd ./curriculum-graphql-server
git submodule update --init
git submodule foreach 'git checkout editor'
cd ..

docker-compose exec graphql sh -c 'cd json-graphql-server && npm install'
docker-compose exec graphql sh -c 'npm run combine'

docker-compose exec rest-api sh -c 'npm install'