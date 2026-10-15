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
docker compose up
```

This starts four docker images
- rest-api, available on localhost:4500
- curriculum-store, available on localhost:3000
- search-server, available on localhost:3001
- curriculum-registration, available on localhost:4930

## Verification

Run the complete component and isolated integration verification with:

```bash
node scripts/verify.mjs
```

Useful narrower checks are:

```bash
node scripts/verify.mjs --fast
node scripts/verify.mjs --smoke-only
node scripts/verify.mjs --coverage-target
```

`--fast` runs the REST and Store behavioral suites, REST lint, and Compose
configuration validation without starting containers. The default command also
runs all four services against temporary Store data, performs an authenticated
edit, verifies its object history and restart persistence, and then removes
only its own Compose project.

The behavioral suites report coverage without treating incomplete coverage as
a behavioral failure. `--coverage-target` separately enforces the project goal
of at least 90% statements, branches, functions, and lines. It currently
reports the known gap and is expected to fail until that target is reached.

The smoke test never uses `docker-clean.sh` and never writes to the development
Store data. On failure it retains its temporary directory and prints its path
for inspection.

