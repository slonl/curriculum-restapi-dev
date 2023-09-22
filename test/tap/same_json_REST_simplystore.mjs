import tap from "tap";
import fs from "node:fs";

let rootURL = "http://localhost:4500/";
//let rootURL = "https://opendata.slo.nl/curriculum/2022/api/v1/";
//let rootURL = "https://opendata.slo.nl/curriculum/api-acpt/v1/"; // do not use

let discardKeyArray = ['Examenprogramma', 'ExamenprogrammaBgProfiel', 'erk_categorie_id', 'ExamenprogrammaDomein', 'LdkVakkern', 'type', 'RefOnderwerp','erk_candobeschrijving_id', 'erk_schaal_id', 'erk_taalactiviteit_id','isempty', 'unreleased', 'niveau_id', 'erk_voorbeeld_id', 'NiveauIndex', 'RefDomein', 'RefSubdomein', 'RefVakleergebied', 'erk_lesidee_id', '@context', '@id', 'sloID', 'error', '@type', 'deprecated' , '@ref', 'ce_se', 'Doel', 'description', 'bron', 'reference', 'prefix', 'count', '@isPartOf', '@references', 'page', 'schema', 'replaces', '@type', 'replacedBy', 'Niveau', 'SyllabusSpecifiekeEindterm', 'Syllabus', 'Vakleergebied'];
//for backup purposes: let discardKeyArray = ['Examenprogramma', 'ExamenprogrammaBgProfiel', 'erk_categorie_id', 'ExamenprogrammaDomein', 'LdkVakkern', 'type', 'RefOnderwerp','erk_candobeschrijving_id', 'erk_schaal_id', 'erk_taalactiviteit_id','isempty', 'unreleased', 'niveau_id', 'erk_voorbeeld_id', 'NiveauIndex', 'RefDomein', 'RefSubdomein', 'RefVakleergebied', 'erk_lesidee_id', '@context', '@id', 'sloID', 'error', '@type', 'deprecated' , '@ref', 'ce_se', 'Doel', 'description', 'bron', 'reference', 'prefix', 'count', '@isPartOf', '@references', 'page', 'schema', 'replaces', '@type', 'replacedBy', 'Niveau', 'SyllabusSpecifiekeEindterm', 'Syllabus', 'Vakleergebied'];

let keepKeyArray = ['uuid'];

let APIcallsSLO = JSON.parse(fs.readFileSync("../data/REST_API_URLs.json"));

let yescounter = 0; //counters for reporting if the files are identical
let nocounter = 0;

for (let call of APIcallsSLO){
  let APICallData= JSON.parse(fs.readFileSync(process.cwd() + '/../data/pages/' +  call + ".json"));
  
  let found = await getData(rootURL + call + "/");
  let wanted = APICallData;
  
  
  if(typeof found === 'object' && found != null){
    found = keepKeysFromObject(found, keepKeyArray);
  }
  if(typeof wanted === 'object' && wanted != null){
    wanted = keepKeysFromObject(wanted, keepKeyArray);
  }

  if(typeof found === 'object' && found != null){
    found = removeKeysFromObject(found, discardKeyArray);
  }
  if(typeof wanted === 'object' && found != null){
    wanted = removeKeysFromObject(wanted, discardKeyArray);
  }
  

  if(deepEqual(wanted, found)){
    //console.log("YES FOR: " + call);
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
  }
  
  //for verbose differences using TAP:
  /*
  tap.test((call + ' comparison check'), async t => {
      t.same(found, wanted)
      t.end();
  })
  */

}

console.log("DeepEqual sanity check finds " + yescounter  + " identical files, and " + nocounter + " files being different.")

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

function keepKeysFromObject(subject, keepKeyArray) {
  Object.keys(subject).forEach(key => {
    if (keepKeyArray.includes(key)) {
      //console.log("keeping key: " + subject[key]);
      keepKeysFromObject(subject[key], keepKeyArray);
    } else if (typeof subject[key] === 'object' && subject[key] !== null) {
      delete subject[key];
      //console.log("deleting key: " + key);
    }
  })
  return subject;
}


  function removeKeysFromObject(subject, discardKeyArray) {
    Object.keys(subject).forEach(key => {
      if (discardKeyArray.includes(key)) {
        delete subject[key];
        //console.log("deleting key: " + key);
      } else if (typeof subject[key] === 'object' && subject[key] !== null) {
        removeKeysFromObject(subject[key], discardKeyArray)
        //console.log("Moving deeper: " + removingKeysCounter++);
      }
    })
    return subject;
  }


