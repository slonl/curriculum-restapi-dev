import fs from "node:fs";

let localRootURL = "http://localhost:4500/"; //https://opendata.slo.nl/curriculum/api-acpt/v1/ 
let remoteRootURL = "https://opendata.slo.nl/curriculum/2022/api/v1/";
//let currentRootURL = https://opendata.slo.nl/curriculum/api-acpt/v1/ 

let dummyData = { "dummyData" : "dummyData" }; // used when the returned JSON is incorrect/missing/empty

let APIcallsSLO = JSON.parse(fs.readFileSync(process.cwd() + "/REST_API_URLs.json"));

let rootPagesFolder = "/pages"
let localDataFolder = "/pages/localhost";
let remoteDatafolder = "/pages/remote";
let localDataFolderUUIDS = "/pages/localhost/uuid";
let remoteDatafolderUUIDS = "/pages/remote/uuid";

try {
  if (!fs.existsSync(process.cwd() + rootPagesFolder)) {
    fs.mkdirSync(process.cwd() + rootPagesFolder);
  }
  if (!fs.existsSync(process.cwd() + localDataFolder)) {
    fs.mkdirSync(process.cwd() + localDataFolder);
  }
  if (!fs.existsSync(process.cwd() + remoteDatafolder)) {
    fs.mkdirSync(process.cwd() + remoteDatafolder);
  }
  if (!fs.existsSync(process.cwd() + localDataFolderUUIDS )) {
    fs.mkdirSync(process.cwd() + localDataFolderUUIDS);
  }
  if (!fs.existsSync(process.cwd() + remoteDatafolderUUIDS)) {
    fs.mkdirSync(process.cwd() + remoteDatafolderUUIDS);
  }
} catch (err) {
  console.error(err);
}

async function getData(url = "", data = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "Authorization": "Basic b3BlbmRhdGFAc2xvLm5sOjM1ODUwMGQzLWNmNzktNDQwYi04MTdkLTlmMGVmOWRhYTM5OQ=="
      }
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
  fs.writeFileSync((process.cwd() + localDataFolder + "/" + call + ".json"), JSON.stringify(data)); 
}

async function getRemoteJSONData(call){
  let data = await getData(remoteRootURL + call + "/");
  JSON.stringify(data);
  console.log("busy with " + call);
  fs.writeFileSync((process.cwd() + remoteDatafolder + "/" + call + ".json"), JSON.stringify(data)); 
}

// go get the files using the rest API
for (let call of APIcallsSLO){
  getLocalJSONData(call);
  getRemoteJSONData(call);
}