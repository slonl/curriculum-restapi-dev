var test = require('tape');
const fs = require('fs');

//curl  -H "Accept: application/json" -H "Authorization: Basic b3BlbmRhdGFAc2xvLm5sOjM1ODUwMGQzLWNmNzktNDQwYi04MTdkLTlmMGVmOWRhYTM5OQ==" http://localhost:4500/vakleergebied/


// Example POST method implementation:
async function getData(url = "", data = {}) {
    // Default options are marked with *
    const response = await fetch(url, {
      //method: "GET", // *GET, POST, PUT, DELETE, etc.
      //mode: "cors", // no-cors, *cors, same-origin
      //cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      //credentials: "same-origin", // include, *same-origin, omit
      headers: {
        "Accept": "application/json",
        "Authorization": "Basic b3BlbmRhdGFAc2xvLm5sOjM1ODUwMGQzLWNmNzktNDQwYi04MTdkLTlmMGVmOWRhYTM5OQ=="
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      //redirect: "follow", // manual, *follow, error
      //referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      //body: JSON.stringify(data), // body data type must match "Content-Type" header
    });
    return await response.json(); // parses JSON response into native JavaScript objects
  }
  
getData("http://localhost:4500/vakleergebied/").then(console.log);

let jsonFromWebsite = getData("http://localhost:4500/vakleergebied/");
let jsonFromDisk = fs.readFile("test/response.json");

console.log(jsonFromWebsite);
console.log(jsonFromDisk);

test.equal(jsonFromWebsite, jsonFromDisk, "CHecked opteined json file");