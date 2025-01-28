#!/usr/bin/env bash

set -o errexit  # Exit script when a command exits with non-zero status.
set -o errtrace # Exit on error inside any functions or sub-shells.
set -o nounset  # Exit script on use of an undefined variable.
set -o pipefail # Return exit status of the last command in the pipe that exited with a non-zero exit code

git clone https://github.com/slonl/curriculum-rest-api.git
cd curriculum-rest-api
git pull
npm update
cd  ..
git clone https://github.com/slonl/curriculum-search-server.git
cd curriculum-search-server
git pull
npm update
cd ..
git clone https://github.com/slonl/curriculum-store.git
cd curriculum-store
git pull
cd scripts
./init.sh
cd ..
npm update
cd scripts
node tojsontag.mjs
node convert.mjs ../data/curriculum.jsontag ../data/data.json
cd ..
npm update
echo project installation completed succesfully, please add apikeys.json
echo after adding the apikeys and editors, you can now start docker with "docker compose up"