import { Builder, By, Key, until, Browser } from 'selenium-webdriver';
import tap from "tap";
import * as fs from 'fs';
import Chrome from 'selenium-webdriver/chrome.js';

let localRootURL = 'http://localhost:4500/';
let APIcallsSLO = JSON.parse(fs.readFileSync(process.cwd() + "/test/data/REST_API_TEST_URLs.json"));

(async function firstTest() {
  let driver;
  
  try {
    const screen = {
      width: 1024,
      height: 786
    };

    driver = new Builder()
        .forBrowser(Browser.CHROME)
        .setChromeOptions(new Chrome.Options().addArguments('--headless').windowSize(screen))
        .build();

    await driver.get(localRootURL);
    
    // making sure to start from a clean slate
    //driver.get('javascript:localStorage.clear();')

    tap.test("Website online", async t => {
      
      //Check website online
      let title = await driver.getTitle();
      t.equal("SLO Curriculum Browser", title);
      
      //document weergave flow check


      //spreadsheet weergave flow check


      //Edit and save weergave flow check

      
    })

    tap.test("Api Calls: Checking known curricula are online", async t => {
      for(let call of APIcallsSLO){
        //console.log(call);
        let data = await getData(localRootURL + call + "/");
        //console.log(data);
        t.ok(data, ( "Response for: " +  call) )
      }
    })

  } catch (e) {
    console.log(e)
  } finally {
    await driver.quit();
  }
}())


// API tests
async function getData(url = "", data = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "Authorization": "Basic b3BlbmRhdGFAc2xvLm5sOjM1ODUwMGQzLWNmNzktNDQwYi04MTdkLTlmMGVmOWRhYTM5OQ=="
      },
      timeout: 1000 // @TODO : find out why this timeout doesn't seem to work.
    });
    return response.ok

  } catch (error){
    console.log("did not get a correct JSON from: " + url + " -> error: " + error);
    return false
  }
}