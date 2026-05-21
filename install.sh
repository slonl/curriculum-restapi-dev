#!/bin/bash
git submodule update --init
cd curriculum-rest-api
cp apiKeys.start.json apiKeys.json
cd ..
