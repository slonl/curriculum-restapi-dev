import tap from "tap";
import fs from "node:fs";

//let rootURL = "http://localhost:4500/";
let rootURL = "https://opendata.slo.nl/curriculum/2022/api/v1/";
//let rootURL = "https://opendata.slo.nl/curriculum/api-acpt/v1/";

let APIcallsSLO = JSON.parse(fs.readFileSync("../data/REST_API_URLs.json"));

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

//Check whether the API call and resulting files are identical
for (let call of APIcallsSLO){
  let APICallData= JSON.parse(fs.readFileSync(process.cwd() + '/../data/pages/' +  call + ".json"));
  
  //console.log(APICallData);
  
  //let found = await getData(rootURL + call + "/");
  let wanted = APICallData;

  
  //console.log(found);
  //console.log("COMPARING TO: ")
  //console.log(wanted);

  console.log(APICallData);

  //let mappedFound = new Map(await getData(rootURL + call + "/")); //SLO
  //let mappedWanted = new Map(APICallData); //simplyStore

  //console.log(mappedWanted);

  //mappedFound =  removeKeys(mappedFound); //SLO
  //mappedWanted = removeKeys(mappedWanted); //simplyStore

  //found = Object.fromEntries(mappedFound);
  //wanted = Object.fromEntries(mappedWanted);

/*
  console.log(found);
  console.log("COMPARING TO: ")
  console.log(wanted);
  */

  wanted = removeKeys(wanted);
  
  //console.log("The objects for: " + call + " are identical? " + deepEqual(APICallData, found));

  //testing
  
  if(deepEqual(wanted, found)){
    console.log("yes for: " + call);
  }
  else{
    console.log("no for: " + call);
  }
  

  /*
  tap.test((call + ' comparison check'), async t => {

      //console.log(found);
      //console.log(wanted);
      //console.log("The objects for: " + call + " are identical? " + deepEqual(wanted, found));
      
      //t.same(found, wanted)
      //t.end();
  })
*/

}

function deepEqual(x, y) {
  const ok = Object.keys, tx = typeof x, ty = typeof y;
  return x && y && tx === 'object' && tx === ty ? (
    ok(x).length === ok(y).length &&
      ok(x).every(key => deepEqual(x[key], y[key]))
  ) : (x === y);
}


function removeKeys(object) {
  let map = new Map(object);

  if (map.has("error") ){
    //do nothing -> this avoids an endless loop
    console.log("incorrect file");
  }
  else {
    map.forEach(removeMappedKeys);
  }

  return (Object.fromEntries(map));
  
};


function removeMappedKeys(value, key, map){
  let discardKeyArray = ['@context', '@id', 'sloID', '$ref', 'description', 'bron', 'reference', 'prefix', 'deprecated', 'count', '@isPartOf', '@references', 'page', 'schema', 'replaces', '@type', 'replacedBy' ];
  
  for(let keys in discardKeyArray){
    if(key == discardKeyArray[keys]){
      //console.log("deleting key " + key);  
      map.delete(key);
    }
  }

  if(map.size >= 1){
    console.log(map.size);

    if (map instanceof Map){
      console.log("Moving down");
      let deeperMap = new Map(map);
      deeperMap.delete(key);
      removeKeys(deeperMap);
    }  
  }

  return (Object.fromEntries(map));
  
}