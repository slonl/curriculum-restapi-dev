import { Builder, By, Key, until, Browser } from 'selenium-webdriver';
import tap from "tap";
import * as fs from 'fs';
import Chrome from 'selenium-webdriver/chrome.js';
import Firefox from 'selenium-webdriver/firefox.js';
import { clear } from 'console';


let localRootURL = 'http://localhost:4500/';
let APIcallsSLO = JSON.parse(fs.readFileSync(process.cwd() + "/test/data/REST_API_TEST_URLs.json"));


const options = new Firefox.Options();

(async function firstTest() {
  var driver;
  
  try {
    const screen = {
      width: 1024,
      height: 786
    };

    driver = new Builder()
    .forBrowser(Browser.FIREFOX)
    .setFirefoxOptions(options.addArguments('--headless').windowSize(screen))
    .build();

    //chrome driver
    /*
    driver = new Builder()
        .forBrowser(Browser.CHROME)
        .setChromeOptions(new Chrome.Options()
          .addArguments('--headless')
          .windowSize(screen)
          //.setPageLoadStrategy('eager') 
        )
        .build();
    */
    
    await driver.get(localRootURL);
    
    
    tap.test("Website online", async t => {
      let title = await driver.getTitle();
      t.equal("SLO Curriculum Browser", title)   
    })
    

    tap.test("Test Entiteiten CRUD", async t => {
      
      for(let call of APIcallsSLO){
        console.log(call)

        try{
          await driver.navigate().to(localRootURL + call + "/");     
        } catch (error){
          t.fail(('Could not navigate to: ' + call)) // @TODO: should get triggered on timeout in navigations 
        }

        try {
          await driver.wait(
            until.elementLocated(By.css("h1[data-simply-field='listTitle']")),
            2000 // Maximum wait time in milliseconds
          );
        } catch (error) {
          t.fail(('Timeout loading page for: ' + call))
        }
      }
    })

    
    
    tap.test("Api Calls: Checking known curricula are online", async t => {
      for(let call of APIcallsSLO){
        let data = await getData(localRootURL + call + "/");
        t.ok(data, ("Response for: " +  call))
      }
    })
    

  } catch (e) {
    console.log(e)
  } finally {
    console.log("quitting!")
    //await driver.quit();
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