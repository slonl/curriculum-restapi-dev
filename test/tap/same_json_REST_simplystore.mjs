import tap from "tap";
import fs from "node:fs";

//let rootURL = "http://localhost:4500/";
let rootURL = "https://opendata.slo.nl/curriculum/2022/api/v1/";
//let rootURL = "https://opendata.slo.nl/curriculum/api-acpt/v1/"; // do not use

let discardKeyArray = ['@context', '@id', 'sloID', '$ref', 'description', 'bron', 'reference', 'prefix', 'deprecated', 'count', '@isPartOf', '@references', 'page', 'schema', 'replaces', '@type', 'replacedBy', 'error' ];
let keepKeyArray = [];

let APIcallsSLO = JSON.parse(fs.readFileSync("../data/REST_API_URLs.json"));

//Check whether the API call and resulting files are identical
//Todo: check if this needs to be a function.
for (let call of APIcallsSLO){
  let APICallData= JSON.parse(fs.readFileSync(process.cwd() + '/../data/pages/' +  call + ".json"));
  
  let found = await getData(rootURL + call + "/");
  let wanted = APICallData;

  found = removeKeys(found, discardKeyArray);
  wanted = removeKeys(wanted, discardKeyArray);
  
  if(deepEqual(wanted, found)){
    console.log("yes for: " + call);
  }
  else{
    console.log("no for: " + call);
  }
   
  tap.test((call + ' comparison check'), async t => {
      t.same(found, wanted)
      t.end();
  })
}

async function getData(url = "", data = {}) {
  
  try {
    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "Authorization": "Basic b3BlbmRhdGFAc2xvLm5sOjM1ODUwMGQzLWNmNzktNDQwYi04MTdkLTlmMGVmOWRhYTM5OQ=="
      },
      //timeout: 1000,
      
    });
    
    return await response.json();
  
  } catch (error){
    console.log("did not get correct response.json, or timed oud");
  }
}

function deepEqual(x, y) {
  const ok = Object.keys, tx = typeof x, ty = typeof y;
  return x && y && tx === 'object' && tx === ty ? (
    ok(x).length === ok(y).length &&
      ok(x).every(key => deepEqual(x[key], y[key]))
  ) : (x === y);
}

function removeKeys(obj, discardKeyArray){
  var index;
  for (var prop in obj) {
      if(obj.hasOwnProperty(prop)){
          switch(typeof(obj[prop])){
              case 'string':
                index = discardKeyArray.indexOf(prop);
                  for (let key in discardKeyArray){
                  if(index > -1 && prop == discardKeyArray[key]){ 
                      delete obj[prop];
                  }
                }
                break;
              case 'object':
                index = discardKeyArray.indexOf(prop);
                for (let key in discardKeyArray){
                  if(index > -1 && prop == discardKeyArray[key]){ 
                      delete obj[prop];
                  }else{
                      removeKeys(obj[prop], discardKeyArray);
                  }
                } 
                break;
          }
      }
  }
  return obj;
}
