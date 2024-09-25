
# Tests

## Aquiring test data:
### getTestData.js
* run ```npm run getTestData```
* uses the list in REST_API_TEST_URLs.json to generate the api calls
* retrieves data from https://localhost:4500 and puts it in data/testData.

### getReferenceData.js
* run using node
* retrieves data from https://opendata.slo.nl/curriculum/2024/api/v1/ and puts it in data/referenceData/

## Running tests
### Pre tests
* comparing the file uses a lot of memory. By default node uses max 4GB, recommend changing the setting to 6G using ```export NODE_OPTIONS="--max-old-space-size=6144"``` in terminal/console to change the global settings.
  * Note: to check how much memory you currently have available: ```node -e 'console.log(v8.getHeapStatistics().heap_size_limit/(1024*1024))'```
  * Note: might be ```Set NODE_OPTIONS="--max-old-space-size=6144"``` under windows.
### Tests
#### Comparing old and new database
* Run the test using ```npm run compareData``` from the root (curriculum-restapi-dev) folder.
  * It will compare the data from test/data/referenceData-SLO-2024 with the current data running on http://localhost:4500.
  * It will use the file REST_API_TEST_URLs.json for the list of api calls to be performed.
* NOTES : currently a lot of keys are being filterd out for the tests to succeed, the list of these filters is in test/tap/compare_referenceData_to_server.mjs in the ```discardKeyArray```.

-------
#### WIP documentation, do not reed further:
--------

# Current keys being ignored:
* discardKeyArray = ['schema', '@references', '$ref', '@context', 'unreleased', 'page', 'root'].
* Note: removing prefix adds 8 succeding tests.

# Easy to check call:
* "erk_taalprofieltekst"

## curriculum-rest-api
* routes
* commands
* actions

## curriculum-store
* jsontag
* jaqt

## integration
* import
  * correct data import
  * code injection
* export
* CRUD

# WIP ->

# Selenium testing

## Selenium IDE:
* use selenium IDE and import the tests from test/Selenium/SLO_tests.side

## Tests:
### A1 Connection
tests wether the local hosted website is up and running 

### A2a CRUD document weergave
checks whether data can be added to the documentweergave

### A2b CRUD spreadsheet weergave
checks whether data can be added to the dspreadsheetweergave

### A3 Data integrity:
#### A3a control data
retrieving control test data script:
```bash
node getdata.mjs
```
in test/data/ the data from localhost:4500 server is retrieved and saved to pages/localhost @Todo needs better name
Note this step is only needed when the datasets are changed on purpose and a new "control" dataset needs to be generated.

#### A3b checking the data
checking the data against the saved test data:
```bash
node compare_localData_to_server.mjs
```
in test/tap/ will check the data using both tap and a simple script to compare the control .json file to what is comming from the server.

## checking simply store data pipeline:
### GITHUB CI/CD
- run the github CI it will convert the data to data parseable by Simply Store. This can also be done manually by following the same steps as (tbd file, probably yaml on github).

## complete deploy pipeline:
- checks the complete installation of all packages and processes starting from a clean checkout, verifies the data and runs test scripts, halts on any error found.



# Notes - TODO - WIP -
notes for clarifying the test documentation. WIP.

### Unit tests:
* check all the routes
* check all keyboards
* check all actions
* check functions in changes
* ...


### Functional tests:

### Cross browser tests

### Cross-Platform tests:

### Regression tests:

### User flows/ end to end:

## Notes:
Explanation on tests to be performed: https://www.browserstack.com/selenium "When to use Selenium WebDriver"
