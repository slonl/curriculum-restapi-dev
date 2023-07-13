import tap from "tap";
import fs from "node:fs";
import jsonTestFile from "../response.json" assert { type: "json"}


async function getData(url = "", data = {}) {

    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "Authorization": "Basic b3BlbmRhdGFAc2xvLm5sOjM1ODUwMGQzLWNmNzktNDQwYi04MTdkLTlmMGVmOWRhYTM5OQ=="
      },
    });
    
    return await response.json(); 
}


let newTest = await getData("http://localhost:4500/vakleergebied/");
//console.log(newTest);


tap.test('some async stuff', async t => {
    let found = await getData("http://localhost:4500/vakleergebied/");
    let wanted = JSON.parse(fs.readFileSync(process.cwd() + "/test/response.json")); //jsonTestFile;
    let message = "testing whether optained json is identical to reference json";

    t.same(found, wanted, message)
    t.end();
})

