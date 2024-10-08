import fs from "node:fs";
import tap from "tap";
import { _, from, not, anyOf, allOf, asc, desc, sum, avg, count, max, min, one, many, first } from '@muze-nl/jaqt'

//rootURL is the URL to compare data to. 
//To work properly you need to have run getData.mjs in the test/data folder. 
//This will fill the pages/localhost folder with data to compare to.

let rootURL = "http://localhost:4500/";
//let remoteData = "https://opendata.slo.nl/curriculum/api-dev/v1/"

let discardKeyArray = ['deprecated', 'replacedBy' ,'schema', '@references', '@isPartOf', '@context', '$ref', 'prefix', '@context']; //['@context', '@references', '$ref', 'replacedBy', 'replaces', 'deprecated', '@isPartOf','ce_se', 'bron', 'reference', 'prefix', 'count', '@isPartOf', '@references', 'page', 'schema', 'replaces', '@type', 'replacedBy']; //['Examenprogramma', 'ExamenprogrammaBgProfiel', 'erk_categorie_id', 'ExamenprogrammaDomein', 'LdkVakkern', 'type', 'RefOnderwerp','erk_candobeschrijving_id', 'erk_schaal_id', 'erk_taalactiviteit_id','isempty', 'unreleased', 'niveau_id', 'erk_voorbeeld_id', 'NiveauIndex', 'RefDomein', 'RefSubdomein', 'RefVakleergebied', 'erk_lesidee_id', '@context', '@id', 'sloID', 'error', '@type', 'deprecated' , '@ref', 'ce_se', 'Doel', 'description', 'bron', 'reference', 'prefix', 'count', '@isPartOf', '@references', 'page', 'schema', 'replaces', '@type', 'replacedBy', 'Niveau', 'SyllabusSpecifiekeEindterm', 'Syllabus', 'Vakleergebied'];

let APIcallsSLO = JSON.parse(fs.readFileSync("test/data/REST_API_TEST_URLs.json"));

let referenceDataFolder = "/referenceData-SLO-2024";

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

function removeURLSFromObject(subject) {
    Object.keys(subject).forEach(key => {
      if(typeof subject[key] == "string" ){
        subject[key] = subject[key].replace("https://opendata.slo.nl/curriculum/2024/api/v1/", "rootURL/");
        subject[key] = subject[key].replace("https://opendata.slo.nl/curriculum/", "rootURL/");
        subject[key] = subject[key].replace("http://localhost:4500/", "rootURL/");
        subject[key] = subject[key].replace("https://localhost:4500/", "rootURL/");
      }  else if ((typeof subject[key] === 'object' || Array.isArray(subject[key])) && subject[key] !== null) {
        removeURLSFromObject(subject[key])
      }
    })
    return subject;
}

function replaceUndefined(subject){
  Object.keys(subject).forEach(key => {
    if(subject[key] == undefined ){
      subject[key] = ""; // see doelniveau.json where the graphql version has "undefined" and the new version has "".
    }  else if ((typeof subject[key] === 'object' || Array.isArray(subject[key])) && subject[key] !== null) {
      replaceUndefined(subject[key])
    }
  })
  return subject;
}


function removeKeysFromObject(subject, discardKeyArray) {
  Object.keys(subject).forEach(key => {
    if (discardKeyArray.includes(key)) {
      delete subject[key];
    } else if ((typeof subject[key] === 'object' || Array.isArray(subject[key])) && subject[key] !== null) {
      removeKeysFromObject(subject[key], discardKeyArray)
    }
  })
  return subject;
}

// @TODO : WARNING: This is a temporary fix for known issues, made to pass tests, needs to be comented out for FULL tests!
function removeMISCFromObject(subject) {
  Object.keys(subject).forEach(key => {
    if (key == "count" || key == "page" || key == "root"){
      subject[key] = "key removed for testing purposes";
    }  else if ((typeof subject[key] === 'object' || Array.isArray(subject[key])) && subject[key] !== null) {
      removeMISCFromObject(subject[key])
    }
  })
  return subject;
}

function replaceNull(subject) {
  Object.keys(subject).forEach(key => {
    if (subject[key] == null ){
      subject[key] = [];
    }  else if ((typeof subject[key] === 'object' || Array.isArray(subject[key])) && subject[key] !== null) {
      replaceNull(subject[key])
    }
  })
  return subject;
}

function orderSelectedKeys(subject){
    subject = from(subject.data).orderBy({'@id': asc}).select({ '@id': _ , '@references': _, uuid: _,'@type': _, prefix: _,title: _, deprecated:_, Vakleergebied: _ })
    return subject
}

function updateSelectedKeys(subject){
  
  Object.keys(subject).forEach(key => {
    if (subject[key] === null || subject[key] === "undefined") {
      subject[key] = "";
    }

    if (subject[key] == "DoelNiveau" || subject[key] == "Doelniveau"){
      subject[key] = "Doelniveau";
    }

    if ((typeof subject[key] === 'object' || Array.isArray(subject[key])) && subject[key] !== null) {
      updateSelectedKeys(subject[key])
    }
  })
  return subject;
}



// function warns of known errors where the new data should be correct.

let DoelniveauFailed = false;
function keyWarningsDoelniveau(subject){
  Object.keys(subject).forEach(key => {
    if (subject[key] == "DoelNiveau"){
      DoelniveauFailed = true;
    } else if ((typeof subject[key] === 'object' || Array.isArray(subject[key])) && subject[key] !== null) {
      DoelniveauFailed = keyWarningsDoelniveau(subject[key]);
    }
  })
  return DoelniveauFailed;
}



tap.test("API calls", async t => {

  for (let call of APIcallsSLO){
    
    //get the data
    let APICallData= JSON.parse(fs.readFileSync("test/data" + referenceDataFolder + "/" +  call + ".json"));
    let found = await getData(rootURL + call + "/" + "?pageSize=1000&page=0");
    let wanted = APICallData;
    
    found = removeURLSFromObject(found);
    wanted = removeURLSFromObject(wanted);


  //checking if known issues with new data being correct don't resurface
    if(keyWarningsDoelniveau(found)){
      t.fail("Found DoelNiveau, should be Doelniveau: " + call);
    };

    // remove differences where the new data is known to be correct
    found = updateSelectedKeys(found); 
    wanted = updateSelectedKeys(wanted); 

    // order the data for comparison
    found = orderSelectedKeys(found);
    wanted = orderSelectedKeys(wanted);

    // check if the data matches
    t.match(found, wanted, ("Call results don't match in: " + call ));

    if(found != null && wanted != null){
      t.equal(found.length, wanted.length, ("Found different amount of items in: " + call ));
    }
    else {
      t.fail("Found a NULL item in: " + call )
    }
  }
})


