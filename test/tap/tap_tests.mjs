import tap from "tap";
import fs from "node:fs";

//rootURL is the URL to compare data to. 
//To work properly you need to have run getData.mjs in the test/data folder. 
//This will fill the pages/localhost folder with data to compare to.

let rootURL = "http://localhost:4500/";
//let rootURL = "https://opendata.slo.nl/curriculum/2022/api/v1/";
//let rootURL = "https://opendata.slo.nl/curriculum/api-acpt/v1/";

let discardKeyArray = ['@context', '@references', '$ref', 'replacedBy', 'replaces', 'deprecated', '@isPartOf']; //['ce_se', 'bron', 'reference', 'prefix', 'count', '@isPartOf', '@references', 'page', 'schema', 'replaces', '@type', 'replacedBy']; //['Examenprogramma', 'ExamenprogrammaBgProfiel', 'erk_categorie_id', 'ExamenprogrammaDomein', 'LdkVakkern', 'type', 'RefOnderwerp','erk_candobeschrijving_id', 'erk_schaal_id', 'erk_taalactiviteit_id','isempty', 'unreleased', 'niveau_id', 'erk_voorbeeld_id', 'NiveauIndex', 'RefDomein', 'RefSubdomein', 'RefVakleergebied', 'erk_lesidee_id', '@context', '@id', 'sloID', 'error', '@type', 'deprecated' , '@ref', 'ce_se', 'Doel', 'description', 'bron', 'reference', 'prefix', 'count', '@isPartOf', '@references', 'page', 'schema', 'replaces', '@type', 'replacedBy', 'Niveau', 'SyllabusSpecifiekeEindterm', 'Syllabus', 'Vakleergebied'];

let APIcallsSLO = JSON.parse(fs.readFileSync("../data/REST_API_URLs.json"));

let localDataFolder = "/pages/localhost";

for (let call of APIcallsSLO){
    //get the data
    let APICallData= JSON.parse(fs.readFileSync("../data" + localDataFolder + "/" +  call + ".json"));
    let found = await getData(rootURL + call + "/");
    let wanted = APICallData;
  
    //remove unwanted keys
    if(typeof found === 'object' && found != null){
        found = removeKeysFromObject(found, discardKeyArray);
    }

    if(typeof wanted === 'object' && wanted != null){
        wanted = removeKeysFromObject(wanted, discardKeyArray);
    }

    //test if found and wanted match with tap
    tap.test((call + ' comparison check'), async t => {
      t.match(await found, wanted);
      t.end();
    })

}

console.log("");
console.log("Removed keys " + discardKeyArray);
console.log("");
console.log("Compared " + rootURL  + " to the data contained in test/data/pages/localhost using tap.");
console.log("");

async function getData(url = "", data = {}) {
  try {
    const response = await fetchWithTimeout(url, {
      headers: {
        "Accept": "application/json",
        "Authorization": "Basic b3BlbmRhdGFAc2xvLm5sOjM1ODUwMGQzLWNmNzktNDQwYi04MTdkLTlmMGVmOWRhYTM5OQ=="
      }
    });
    
    return await response.json();
  
  } catch (error){
    console.log("Did not get correct response.json, or timed out for: " + url);
  }
}

async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 1000 } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const response = await fetch(resource, {
    ...options,
    signal: controller.signal  
  });
  
  clearTimeout(id);

  return response;
}

  function removeKeysFromObject(subject, discardKeyArray) {
    Object.keys(subject).forEach(key => {
      if (discardKeyArray.includes(key)) {
        delete subject[key];
        //console.log("deleting key: " + key);
      } else if ((typeof subject[key] === 'object' || typeof subject[key] === 'array') && subject[key] !== null) {
        removeKeysFromObject(subject[key], discardKeyArray)
        //console.log("Moving deeper: " + removingKeysCounter++);
      }
    })
    return subject;
  }