#!/usr/bin/env bash
set -o errexit -o errtrace -o nounset -o pipefail

git submodule update --init
cd curriculum-rest-api
cp apiKeys.start.json apiKeys.json
cd ..
echo "done";