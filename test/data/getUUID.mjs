import tap from "tap";
import fs from "node:fs";

//fetch uuids from the data pages
// @TODO : some data was not retrievable, check if that still apllies, if not, add the following fields to REST_API_URLs.json
  // "syllabus",// curriculum-syllabus // does not give a compatible JSON file
  // "inh_subcluster", // does not give a compatible json file.
  //niveau hierarchie
  let APIcallsSLO = JSON.parse(fs.readFileSync(process.cwd() + "/REST_API_URLs.json"));

  // go get the files
  for (let call of APIcallsSLO){
    let APICallData= JSON.parse(fs.readFileSync(process.cwd() + "/pages/" + call + ".json"));

    //write out the data for each uuid
    for(let uuid in APICallData.data){
        let data = APICallData.data[uuid];
        
        //add the directory if it doesn't exist
        if (!fs.existsSync((process.cwd() + "/UUIDs/" + call))){
          fs.mkdirSync((process.cwd() + "/UUIDs/" + call));
        };

        // write out the uuid file
        fs.writeFileSync((process.cwd() + "/UUIDs/" + call + "/" + APICallData.data[uuid].uuid + ".json"), JSON.stringify(data));   

    }
  }