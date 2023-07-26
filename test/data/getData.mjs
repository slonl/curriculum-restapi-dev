import tap from "tap";
import fs from "node:fs";

let rootURL = "http://localhost:4500/";

// @TODO : some data was not retrievable, check if that still apllies, if not, add the following fields to REST_API_URLs.json
  // "syllabus",// curriculum-syllabus // does not give a compatible JSON file
  // "inh_subcluster", // does not give a compatible json file.
let APIcallsSLO = JSON.parse(fs.readFileSync(process.cwd() + "/REST_API_URLs.json"));

async function getData(url = "", data = {}) {
  const response = await fetch(url, {
    headers: {
      "Accept": "application/json",
      "Authorization": "Basic b3BlbmRhdGFAc2xvLm5sOjM1ODUwMGQzLWNmNzktNDQwYi04MTdkLTlmMGVmOWRhYTM5OQ=="
    },
  });
  
  return await response.json(); 
}

async function gettheJSONData(call){
  let data = await getData(rootURL + call + "/");
  if(JSON.stringify(data)){
    console.log("busy with " + call);
    fs.writeFileSync((process.cwd() + "/pages/" + call + ".json"), JSON.stringify(data));
  }
  else {
    console.log("could not write " + call); 
  }
}

// go get the files using the rest API
for (let call of APIcallsSLO){
  gettheJSONData(call);
}
