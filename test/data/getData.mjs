import fs from "node:fs";

let localRootURL = "http://localhost:4500/"; //https://opendata.slo.nl/curriculum/api-acpt/v1/ 
//let remoteRootURL = "https://opendata.slo.nl/curriculum/2022/api/v1/";
let remoteRootURL = "https://opendata.slo.nl/curriculum/api-acpt/v1/"; 

let dummyData = { "dummyData" : "dummyData" }; // used when the returned JSON is incorrect/missing/empty

let APIcallsSLO = JSON.parse(fs.readFileSync(process.cwd() + "/REST_API_URLs.json"));


let localDataFolder = "/pages/localhost";
let remoteDatafolder = "/pages/remote";

//Folders are needed as the calls are built to use the array from REST_API_URLS.json and save the files according to the paths from the call.
let createFolders = ["/pages","/pages/localhost","/pages/remote","/pages/localhost/uuid", "/pages/remote/uuid", "/pages/localhost/doel", "/pages/remote/doel","/pages/localhost/doelniveau", "/pages/remote/doelniveau"];

for(let folder in createFolders){
  try {
    if (!fs.existsSync(process.cwd() + folder)) {
      fs.mkdirSync(process.cwd() + folder);
    }
  } catch (err) {
    console.error(err);
  }
}


async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 15000 } = options;
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const response = await fetch(resource, {
    ...options,
    signal: controller.signal  
  });
  clearTimeout(id);

  return response;
}

async function getData(url = "", data = {}) {
  try {
    const response = await fetchWithTimeout(url, {
      headers: {
        "Accept": "application/json",
        "Authorization": "Basic b3BlbmRhdGFAc2xvLm5sOjM1ODUwMGQzLWNmNzktNDQwYi04MTdkLTlmMGVmOWRhYTM5OQ=="
      },
      timeout: 15000
    });
    return await response.json();

  } catch (error){
    console.log("did not get a correct JSON from: " + url + " -> error: " + error);
    return dummyData;
  }
}

async function getLocalJSONData(call){
  let data = await getData(localRootURL + call + "/");
  JSON.stringify(data);
  console.log("busy with " + call);
  fs.writeFileSync((process.cwd() + localDataFolder + "/" + call + ".json"), JSON.stringify(data, null, "\t")); 
}

async function getRemoteJSONData(call){
  let data = await getData(remoteRootURL + call + "/");
  JSON.stringify(data);
  console.log("busy with " + call);
  fs.writeFileSync((process.cwd() + remoteDatafolder + "/" + call + ".json"), JSON.stringify(data, null, "\t")); 
}

// go get the files using the rest API
for (let call of APIcallsSLO){
  getLocalJSONData(call);
  getRemoteJSONData(call);
}