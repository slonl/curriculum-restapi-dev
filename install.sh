#!/usr/bin/env bash

set -o errexit  # Exit script when a command exits with non-zero status.
set -o errtrace # Exit on error inside any functions or sub-shells.
set -o nounset  # Exit script on use of an undefined variable.
set -o pipefail # Return exit status of the last command in the pipe that exited with a non-zero exit code

install() {
    aggregateData() {
        local sPath
        readonly sPath="${1?One parameters required: <path>}"

        pushd "${sPath}/curriculum-store/scripts/"

        bash ./init.sh
        node tojsontag.mjs
        node convert.mjs "${sPath}/curriculum-store/data/schema.jsontag" "${sPath}/curriculum-store/data/curriculum.jsontag" "${sPath}/curriculum-store/data/data.jsontag"
    }

    installRepos(){
        local sPath
        readonly sPath="${1?One parameters required: <path>}"

        git -C "${sPath}"https://github.com/slonl/curriculum-registration-app.git
        npm --prefix "${sPath}/curriculum-registration-app" update

        git -C "${sPath}" clone https://github.com/slonl/curriculum-rest-api.git
        npm --prefix "${sPath}/curriculum-rest-api" update


        git  -C "${sPath}" clone https://github.com/slonl/curriculum-search-server.git
        npm --prefix "${sPath}/curriculum-search-server" update

        git  -C "${sPath}" clone https://github.com/slonl/curriculum-store.git
        npm --prefix "${sPath}/curriculum-store" update
    }

    local sRootPath
    readonly sRootPath="${1?One parameters required: <root-path>}"

    installRepos "${sRootPath}"
    aggregateData "${sRootPath}"

    echo 'Project installation completed successfully. Please take the following steps:'
    echo ''
    echo '1. Add "apikeys.json" in curriculum-rest-api folder'
    echo '2. If you want to edit data, add "editors.json" in curriculum-rest-api folder'
    echo '3. (optional) Make sure to select the correct branches in curriculum-rest-api'
    echo '4. Start docker using the "docker compose up" command from curriculum-restapi-dev folder'
}

if [ "${BASH_SOURCE[0]}" != "${0}" ]; then
  export -f install
else
  # Replace "${PWD}" with "${@}" to allow passing in a path to the script
  install "${PWD}"
fi
