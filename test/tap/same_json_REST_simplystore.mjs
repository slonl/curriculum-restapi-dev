import tap from "tap";
import fs from "node:fs";

let rootURL = "http://localhost:4500/";

let APIcallsSLO = [
  "doel", 
  "niveau", 
  "doelniveau",
  "vakleergebied"
  /*
  "kerndoel_vakleergebied",
  "kerndoel_domein",
  "kerndoel",
  "kerndoel_uitstroomprofiel",
  "examenprogramma",
  "syllabus",
  "leerdoelenkaarten",
  "inhoudslijnen",
  "referentiekader",
  "erk",
  "niveau_hierarchie"
  */
];

async function getData(url = "", data = {}) {
  const response = await fetch(url, {
    headers: {
      "Accept": "application/json",
      "Authorization": "Basic b3BlbmRhdGFAc2xvLm5sOjM1ODUwMGQzLWNmNzktNDQwYi04MTdkLTlmMGVmOWRhYTM5OQ=="
    },
  });
  
  return await response.json(); 
}

/* Check whether the API call and resulting files are identical
for (let call of APIcallsSLO){
  let APICallData= JSON.parse(fs.readFileSync(process.cwd() + "/test/data/" + call + ".json"));

  tap.test((call + 'identical json check'), async t => {
      let found = await getData(rootURL + call + "/");
      let wanted =  APICallData; 
      t.same(found, wanted)
      t.end();
  })
}
*/


async function gettheJSONData(call){
  let data = await getData(rootURL + call + "/");

  fs.writeFileSync((process.cwd() + "/test/data/" + call + ".json"), JSON.stringify(data));
}

// go get the files using the rest API
for (let call of APIcallsSLO){
  gettheJSONData(call);
}
