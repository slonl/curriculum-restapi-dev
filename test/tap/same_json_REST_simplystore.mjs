import tap from "tap";
import fs from "node:fs";

let rootURL = "http://localhost:4500/";

// @TODO : some data was not retrievable, check if that still apllies, if not, add the following fields to REST_API_URLs.json
  // "syllabus",// curriculum-syllabus // does not give a compatible JSON file
  // "inh_subcluster", // does not give a compatible json file.
  //niveau hierarchie
  let APIcallsSLO = JSON.parse(fs.readFileSync("../data/REST_API_URLs.json"));

async function getData(url = "", data = {}) {
  const response = await fetch(url, {
    headers: {
      "Accept": "application/json",
      "Authorization": "Basic b3BlbmRhdGFAc2xvLm5sOjM1ODUwMGQzLWNmNzktNDQwYi04MTdkLTlmMGVmOWRhYTM5OQ=="
    },
  });
  
  return await response.json(); 
}

//Check whether the API call and resulting files are identical
for (let call of APIcallsSLO){
  let APICallData= JSON.parse(fs.readFileSync(process.cwd() + "/test/data/" + call + ".json"));

  tap.test((call + 'identical json check'), async t => {
      let found = await getData(rootURL + call + "/");
      let wanted =  APICallData; 
      t.same(found, wanted)
      t.end();
  })
}
