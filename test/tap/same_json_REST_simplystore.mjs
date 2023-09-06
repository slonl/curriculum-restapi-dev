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
  
  let found = await getData(rootURL + call + "/");
  let wanted = APICallData;

  //console.log(found);

  found =  removeKeys(found);
  wanted = removeKeys(APICallData); //APICallData; 

  //console.log("The objects for: " + call + " are identical? " + deepEqual(APICallData, found));

  tap.test((call + ' comparison check'), async t => {

      //console.log(found);
      //console.log(wanted);
      console.log("The objects for: " + call + " are identical? " + deepEqual(wanted, found));
      
      t.same(found, wanted)
      t.end();
  })


}

function deepEqual(x, y) {
  const ok = Object.keys, tx = typeof x, ty = typeof y;
  return x && y && tx === 'object' && tx === ty ? (
    ok(x).length === ok(y).length &&
      ok(x).every(key => deepEqual(x[key], y[key]))
  ) : (x === y);
}

function removeKeys(object) {
  let discardKeyArray = ['@context', '@id', 'sloID', '$ref', 'description', 'bron', 'reference', 'prefix', 'deprecated', 'count', '@isPartOf', '@references', 'page', 'schema', 'replaces', '@type', 'replacedBy' ];
  
  Object.keys(object).forEach(function(key, index){
    for(let keys in discardKeyArray){
           
      //console.log("This key: -" + key + "- Agains this array key: -" + discardKeyArray[keys] + "-");

      if(key == discardKeyArray[keys]){
        //console.log("deleting key " + key);  
        delete object[key];
      }
   
      if (typeof object[key] === 'object' && object[key] !== null){
        //console.log("Moving down");
        removeKeys(object[key]);
      }
    }
  }) 
  return object;
}