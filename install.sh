#!/bin/bash
git submodule update --init
docker compose exec rest-api sh -c 'cd /home/node/app && npm install'
docker compose exec search-server sh -c 'cd /home/node/app && npm install'
docker compose exec curriculum-store sh -c 'cd /home/node/app && npm install'
docker compose exec curriculum-registration sh -c 'cd /home/node/app && npm install'
docker compose exec rest-api sh -c 'cd /home/node/app && cp apiKeys.start.json apiKeys.json'