
# Tests

## Aquiring test data:

**All ```npm run``` type commands are to be run from the root in ```curriculum-restapi-dev```** 

### getTestData.js
* run ```npm run getTestData```
* uses the list in ```/test/data/REST_API_TEST_URLs.json``` to generate the api calls
* retrieves data from https://localhost:4500 and puts it in ```/test/data/testData```.

### getReferenceData.js
* run ```npm run getReferenceData```
* uses the list in ```/test/data/REST_API_ALL_URLs.json``` to generate the api calls
* retrieves data from https://opendata.slo.nl/curriculum/2024/api/v1/ and puts it in ```/test/data/referenceData/```.

## Running tests
### Pre tests
* comparing the file uses a lot of memory. By default node uses max 4GB, should the tests fail due to timeouts changing the setting to 6G might help: using ```export NODE_OPTIONS="--max-old-space-size=6144"``` in terminal/console to change the global settings.
  * Note: to check how much memory you currently have available: ```node -e 'console.log(v8.getHeapStatistics().heap_size_limit/(1024*1024))'```
  * Note: might be ```Set NODE_OPTIONS="--max-old-space-size=6144"``` under windows.

### Tests
#### Comparing old and new database
* Run the test using ```npm run compareData``` from the root (curriculum-restapi-dev) folder.
  * It will compare the data from test/data/referenceData-SLO-2024 with the current data running on http://localhost:4500.
  * It will use the file ```REST_API_TEST_URLs.json``` for the list of api calls to be performed.
  * The current full list of calls used for testing is in ```REST_API_ALL_URLS.json```.
* Currently a lot of keys are being filterd out for the tests to succeed, these filters are in ```test/tap/compare_referenceData_to_server.mjs```:
  * The ```orderSelectedKeys()``` function contains a shortlist of key-values that are being tested on, and orders them by id. This can be modified for testing purposes, see the https://github.com/muze-nl/jaqt documentation on how to do so.
  * Sometimes values will be known to be different but are acceptable discrepencies. In such cases a specific function is made to manage these.
  * ```removeURLSFromObject()```: the local api calls generate to a URL starting with http://localhost:4500 while the remote calls usually have a different URL, this function replaces part of the URL string to make sure the subsequent URL strings are identical where it matters.
  * 


## Selenium IDE:
* use selenium IDE and import the tests from test/Selenium/SLO_tests.side

### Tests:
* A1 Connection: tests wether the local hosted website is up and running 
* A2a CRUD document weergave: checks whether data can be added to the documentweergave
* A2b CRUD spreadsheet weergave: checks whether data can be added to the spreadsheetweergave

-----
# Future testing:
Depending on the wanted "code coverage" level there might be more tests performed in the future. For now we are concentrating on making sure the "new" API using curriculum-store gives acceptable results.

# Note:
**For future reference the following part of this ```readme.md``` contains notes on possible tests that might speed up deployment or refactoring:**

------

## Checking simply store data pipeline:
### GITHUB CI/CD
- run the github CI it will convert the data to data parseable by Simply Store. This can also be done manually by following the same steps as (tbd file, probably yaml on github).

## complete deploy pipeline:
- checks the complete installation of all packages and processes starting from a clean checkout, verifies the data and runs test scripts, halts on any error found.

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
