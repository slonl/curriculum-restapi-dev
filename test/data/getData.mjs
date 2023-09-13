import tap from "tap";
import fs from "node:fs";

let rootURL = "http://localhost:4500/"; //https://opendata.slo.nl/curriculum/api-acpt/v1/   // "https://opendata.slo.nl/curriculum/2022/api/v1/"; // 
let dummyData = { "dummyData" : "dummyData" }; // used when the returned JSON is incorrect/missing/empty

let APIcallsSLO = JSON.parse(fs.readFileSync(process.cwd() + "/REST_API_URLs.json"));

async function getData(url = "", data = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "Authorization": "Basic b3BlbmRhdGFAc2xvLm5sOjM1ODUwMGQzLWNmNzktNDQwYi04MTdkLTlmMGVmOWRhYTM5OQ=="
      },
    });
    return await response.json(); 
  } catch (error){
    console.log("did not get a correct JSON from: " + url + " -> error: " + error);
    return dummyData;
  }
}

async function gettheJSONData(call){
  let data = await getData(rootURL + call + "/");
  JSON.stringify(data);
  console.log("busy with " + call);
  fs.writeFileSync((process.cwd() + "/pages/" + call + ".json"), JSON.stringify(data)); 
}

// go get the files using the rest API
for (let call of APIcallsSLO){
  gettheJSONData(call);
}
