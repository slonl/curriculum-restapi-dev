import fs from "node:fs";
import t from "tap";

//rootURL is the URL to compare data to. 
//To work properly you need to have run getData.mjs in the test/data folder. 
//This will fill the pages/localhost folder with data to compare to.

let rootURL = "http://localhost:4500/";
//let remoteData = "https://opendata.slo.nl/curriculum/api-dev/v1/"

let discardKeyArray = ['schema', '@references', '@isPartOf', '@id', '@context', '$ref', 'prefix', '@context']; //['@context', '@references', '$ref', 'replacedBy', 'replaces', 'deprecated', '@isPartOf','ce_se', 'bron', 'reference', 'prefix', 'count', '@isPartOf', '@references', 'page', 'schema', 'replaces', '@type', 'replacedBy']; //['Examenprogramma', 'ExamenprogrammaBgProfiel', 'erk_categorie_id', 'ExamenprogrammaDomein', 'LdkVakkern', 'type', 'RefOnderwerp','erk_candobeschrijving_id', 'erk_schaal_id', 'erk_taalactiviteit_id','isempty', 'unreleased', 'niveau_id', 'erk_voorbeeld_id', 'NiveauIndex', 'RefDomein', 'RefSubdomein', 'RefVakleergebied', 'erk_lesidee_id', '@context', '@id', 'sloID', 'error', '@type', 'deprecated' , '@ref', 'ce_se', 'Doel', 'description', 'bron', 'reference', 'prefix', 'count', '@isPartOf', '@references', 'page', 'schema', 'replaces', '@type', 'replacedBy', 'Niveau', 'SyllabusSpecifiekeEindterm', 'Syllabus', 'Vakleergebied'];

let APIcallsSLO = JSON.parse(fs.readFileSync("../data/REST_API_URLs.json"));

let referenceDataFolder = "/referenceData";

let yescounter = 0; //counters for reporting if the files are identical
let nocounter = 0;
let callsGivingError = [];

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

function deepEqual(x, y) {
  const ok = Object.keys, tx = typeof x, ty = typeof y;
  return x && y && tx === 'object' && tx === ty ? (
    ok(x).length === ok(y).length &&
      ok(x).every(key => deepEqual(x[key], y[key]))
  ) : (x === y);
}

function removeURLSFromObject(subject, discardKeyArray) {
    Object.keys(subject).forEach(key => {
      if(typeof subject[key] === String ){
        subject[key].replace("https://opendata.slo.nl/curriculum/", "rootURL/");
        subject[key].replace("https://localhost:4500/", "rootURL/");
      }  else if ((typeof subject[key] === 'object' || typeof subject[key] === 'array') && subject[key] !== null) {
        removeURLSFromObject(subject[key], discardKeyArray)
        //console.log("Moving deeper: " + removingKeysCounter++);
      }
    })
    return subject;
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


for (let call of APIcallsSLO){
  //get the data
  let APICallData= JSON.parse(fs.readFileSync("../data" + referenceDataFolder + "/" +  call + ".json"));
  let found = await getData(rootURL + call + "/");
  let wanted = APICallData; //await getData(remoteData + call + "/");
  
  // remove unwanted keys
  if(typeof found === 'object' && found != null){
      found = removeKeysFromObject(found, discardKeyArray);
      found = removeURLSFromObject(found, discardKeyArray);
  }

  if(typeof wanted === 'object' && wanted != null){
      wanted = removeKeysFromObject(wanted, discardKeyArray);
      wanted = removeURLSFromObject(wanted, discardKeyArray);
  }

  //check with tap
  t.match(wanted, found, "matching")
  
  // give feedback
  if(deepEqual(wanted, found)){
      console.log("YES FOR: " + call);
      yescounter++;
  }
  else{
      nocounter++;
      console.log("FILES NOT EQUAL FOR: " + call)      
      /*
      console.log("FOUND:")
      console.log(found);
      console.log("WANTED:")
      console.log(wanted);
      console.log("");
      */
      callsGivingError.push(call)
  }
}

//display results:
console.log("");
console.log("After removing keys " + discardKeyArray);
console.log("");
console.log("When comparing " + rootURL  + " to the data contained in test/data/pages/localhost");
console.log("DeepEqual check finds " + yescounter  + " files with identical content, and " + nocounter + " files with content being different.");
console.log("");
console.log("calls not identical: ");
console.log(callsGivingError);