import fs from "node:fs";

let RootURL = "https://opendata.slo.nl/curriculum/2024/api/v1/" //"http://localhost:4500/" // URL from which the reference data will be fetched.

let dummyData = { "data-missing" : "getReferenceData.mjs could not retrieve data" }; // used when the returned JSON is incorrect/missing/empty

// the reference data is fetched from a set of URLS defined in REST_API_URLs.json.
let APIcallsSLO = JSON.parse(fs.readFileSync(process.cwd() + "/REST_API_URLs.json"));

let referenceDataFolder = "/referenceData";

//Folders are created: as the calls are built to use the array from REST_API_URLS.json and save the files according to the paths from the call.
let createFolders = ["/referenceData","/referenceData/uuid"];

for(let folder in createFolders){
  try {
    if (!fs.existsSync(process.cwd() + createFolders[folder])) {
      fs.mkdirSync(process.cwd() + createFolders[folder]);
    }
  } catch (err) {
    console.error(err);
  }
}

// fetching the data
async function getData(url = "", data = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "Authorization": "Basic b3BlbmRhdGFAc2xvLm5sOjM1ODUwMGQzLWNmNzktNDQwYi04MTdkLTlmMGVmOWRhYTM5OQ=="
      },
      timeout: 1000 // @TODO : find out why this timeout doesn't seem to work.
    });
    return await response.json();

  } catch (error){
    console.log("did not get a correct JSON from: " + url + " -> error: " + error);
    return dummyData;
  }
}

async function getReferenceData(call){
  let data = await getData(RootURL + call + "/");
  JSON.stringify(data);
  console.log("busy with " + call);
  fs.writeFileSync((process.cwd() + referenceDataFolder + "/" + call + ".json"), JSON.stringify(data, null, "\t")); 
}

// go get the files using the rest API
for (let call of APIcallsSLO){
  getReferenceData(call);
}