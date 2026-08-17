# Project Context

## Status

Confirmed by human during initial Spiral Developer brownfield intake on 2026-08-12.

## Intake State

Status: **Complete**

Human-confirmed complete on: 2026-08-12.

| Required topic | Disposition | Notes / source |
|---|---|---|
| Purpose, users/stakeholders, goals | Complete | Local code-development environment for opendata.slo.nl website/API; used by maintainer, colleagues, and SLO technical contact. |
| Current posture | Complete | Shared local code-development environment for a production-adjacent system with historical deployed versions and a hosted data-editing development version. |
| Important outcomes / metrics | Complete | Tests where available, Docker startup, website behavior, login/edit/commit workflow, valid persisted `od-jsontag`, restart/readback. |
| Consequential prior decisions / reversibility | Complete | Data-format compatibility, REST API contract, registration authorization-header behavior, Excel import/export shape, and Docker as local-only plumbing. |
| Invariants / commitments | Complete | `schema.jsontag`/`context.json` validation, `jsontag`/`od-jsontag` backwards compatibility, import/export caution, API authorization stability. |
| Known / tolerated problems | Complete | Uneven maturity across repos; `niveauIndex` was first-cycle priority; future `metro` incorporation and `simplyedit` to `simplyflow` transition; tooling/test gaps. |
| Reliable feedback / reality sources | Complete | Dataset tests, `curriculum-utils`, service/unit tests where available, Docker/manual workflows, data-folder inspection, restart/readback checks. |
| Knowledge gaps / affinity needs | Complete | Early handholding expected around data formats, SLO editing workflows, import/export, and repo-specific maturity differences. |
| Relevant future direction | Complete | `niveauIndex` first; later `metro` into `curriculum-rest-api`, frontend cleanup, and `simplyedit` to `simplyflow`. No durable multi-cycle roadmap is confirmed yet. |
| Risk-discovery / metric-profile disposition | Complete | Use `brownfield-general`; defer/consider other metric and interaction profiles only when relevant. |

This repository is the local code-development environment for the
opendata.slo.nl website and API. The public website contains multiple deployed
versions of this environment, each pinned to a historical codebase and dataset,
plus one hosted development version used by authenticated users to edit and
update the dataset. This local environment exists specifically for working on
the code.

## People And Systems Depending On It

- The primary maintainer.
- Colleagues who help develop the system.
- A technical contact at SLO who uses the environment to change the shape of
  the dataset, import new data, validate that new data works, and sometimes make
  small code changes.
- Third parties that use the API authorization-header flow exposed through the
  registration app.

## Healthy Outcomes

The project is considered healthy when:

- available unit tests are green;
- the Docker development environment starts successfully;
- the website works and shows the expected data;
- authenticated users can log in, make dataset changes, and commit those
  changes to the `curriculum-store` database;
- relevant standalone services, such as `curriculum-store`, registration, or
  search, can be tested directly when work touches them;
- committed data changes result in valid `od-jsontag` files;
- the system can restart and read the persisted data back successfully.

## Important Constraints And Invariants

Data formats are the primary safety concern.

- Strong invariants are encoded in `schema.jsontag`, which is derived from
  dataset repositories and a `context.json` JSON Schema file.
- Dataset repositories provide `npm test` validation against multiple possible
  failure modes.
- `curriculum-utils` is not included in this repository yet, but it contains the
  complete set of data repositories as submodules and can run the same tests
  across the complete dataset.
- `jsontag` and `od-jsontag` formats are beta but important. Changes to those
  formats should be discouraged unless there is a real problem; backwards
  compatibility is important.
- The REST API has a well-specified API derived directly from the
  `curriculum-rest-api` code. API changes require confirmation, though they can
  be allowed.
- The registration app supports an authorization-header API flow used by third
  parties. Changing that flow would require helping people migrate, so it should
  not be changed casually.
- Login/auth is used by only a few people, so changing it is lower consequence.
- Docker is only local development plumbing and may be changed when useful.

## Import And Export Caution

SLO personnel may upload an Excel sheet containing a new dataset: not a new Git
repository, but a consistent set of entries that form a graph belonging to one
or more global datasets.

The system also exports the same Excel sheet structure so people can edit data
outside the environment and upload it again. This import/export format is an
easy failure point and must be handled carefully. If touched, it currently needs
manual testing and should gain focused unit coverage.

## Current Posture And Known Fragility

The maturity and risk profile differs across repositories.

- `simplystore` is a prototype that went into production, but has been solid so
  far.
- `curriculum-store` is a thin layer and is relatively manageable.
- The current major near-term aim is fixing an incompatibility and likely bug in
  `niveauIndex` indexing, especially create/update behavior.
- `jsontag` and `od-jsontag` are beta but have behaved well so far.
- The search server and registration app are simplistic and currently working;
  they should not need near-term changes.
- `metro` is new for this project and is intended to be incorporated into
  `curriculum-rest-api` as part of cleanup and refactoring.
- A future frontend shift is planned from `simplyedit` to `simplyflow`, including
  replacing the custom datatable renderer with a simpler `simplyflow` version.
- There are many broader concerns in the `curriculum-rest-api` frontend and SLO
  editing environment. The API itself is relatively stable.
- `jaqt` is used throughout and is relatively stable.

## Evidence Sources

Useful safety evidence includes:

- dataset validation through `curriculum-utils` and dataset-level `npm test`
  commands based on `context.json` JSON Schema files;
- unit tests where available;
- REST API tests, though coverage is currently below the desired level;
- Docker environment startup and manual UI workflows;
- standalone `curriculum-store` tests where possible;
- `simplystore` command/query tests where available, though that work is not
  complete yet;
- manual tests for Excel import/export when touched;
- manual tests of changes made through the UI;
- inspection of the `curriculum-store/data` folder for new `jsontag` and index
  files;
- restart/readback checks after persisted data changes.

## Adopted Intake Profiles

- `brownfield-general` risk-discovery profile is adopted for the initial reality
  assessment.

Other profiles may be considered later, but are not globally active merely
because they are available.

## Intake Metric Profiles

- No metric profile is globally adopted yet.
- `established-service` may be useful when evaluating API/service reliability or
  compatibility work.
- `user-facing-interaction` should be considered only for work that touches
  directly used registration or SLO editing workflows.

## Governing Plans / Roadmaps

No durable multi-cycle roadmap is confirmed yet. Known future directions are
recorded as project context, not as a binding cycle sequence.

## Repository Branch Policy

- For `curriculum-store`, use `spiral-development` for project changes instead
  of `main` or `master` where that branch exists.
- The maintainer will merge `spiral-development` to `main` later.

## Cycle History / Current State

- Cycle 1 in `curriculum-store` addressed the `NiveauIndex` create/update
  invariant and was accepted into `spiral-development` on 2026-08-17.
- The cycle/evidence currently lives in `curriculum-store` rather than at the
  `curriculum-restapi-dev` system level. This is a known process limitation to
  address separately, not something to restructure inside the accepted cycle.
- Discovered concerns carried forward from Cycle 1:
  - `npm test` assertions passed, but the coverage policy made the command exit
    1.
  - `npm run lint` was blocked by missing ESLint v9 flat configuration.
  - No full Docker/manual or production-like dataset performance check was done.

## Near-Term Priority

The first normal Spiral cycle focused on fixing the `niveauIndex` issue and has
been accepted into `curriculum-store` `spiral-development`. The planned `metro`
incorporation, frontend cleanup, and `simplyedit` to `simplyflow` transition can
wait until selected through the next Analyze/Plan step.

## NiveauIndex Intended Invariant

`NiveauIndex` exists as derived data for efficient filtering by materialized
`Niveau`.

- Entities form a graph.
- Not every entity has its own `Niveau`.
- If an entity has `Niveau`, its `NiveauIndex` should be exactly that
  de-duplicated `Niveau` list.
- A node's own `Niveau` is authoritative from that node upwards: descendants do
  not contribute additional levels through that node.
- If an entity has no `Niveau`, its `NiveauIndex` should be the de-duplicated
  union of relevant child `NiveauIndex` values.
- `Vakleergebied` is a related relation rather than a child relation for this
  purpose. It should not contribute to parent/child propagation and should not
  receive parent links from this relation.
- During `create`, `NiveauIndex` is derived data and must not be used as source
  state. It should be rebuilt from `Niveau` and graph relations.
- During `update`, existing `NiveauIndex` may be used as a performance shortcut
  when possible, because full recalculation would take too long.
