
# Tests

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
