import { Builder, By, Key, until, Browser } from 'selenium-webdriver';
import tap from "tap";
import * as fs from 'fs';
import Chrome from 'selenium-webdriver/chrome.js';
import Firefox from 'selenium-webdriver/firefox.js';
import { clear } from 'console';


let localRootURL = 'http://localhost:4500/';
let APIcallsSLO = JSON.parse(fs.readFileSync(process.cwd() + "/test/data/REST_API_TEST.json"));
let delayWaiting = 2000


tap.setTimeout(500000);


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

    tap.test("Api Calls: Checking known curricula are online", async t => {
      for(let call of APIcallsSLO){
        let data = await getData(localRootURL + call + "/");
        t.ok(data, ("Response for: " +  call))
      }
    })
    
    //CRUD tests      
    for(let call of APIcallsSLO){

      tap.test("Test Entiteiten CRUD", async t => {

        try{
          await driver.navigate().to(localRootURL + call + "/");     
        } catch (error){
          t.fail(('Could not navigate to: ' + call))
        }

        try {
          await driver.wait(
            until.elementLocated(By.css("h1[data-simply-field='listTitle']")),
            delayWaiting // Maximum wait time in milliseconds
          );
        } catch (error) {
          t.fail(('Timeout loading page for: ' + call))
        }

        let browserURL = await driver.getCurrentUrl()
        console.log("URL: ", browserURL)
        let linkElements = await driver.findElements(By.css('a.slo-relatie'));
        console.log("First element to click on: ", await linkElements[0].id_)

        try{
          await linkElements[0].click()
        } catch (error) {
          t.fail(('Could not click on first link element on page as it was: ' + linkElements[0]))
        }   
        
        let spreadsheetButtonElement = await driver.findElement(By.css('[data-simply-command="switchView"][data-simply-value="spreadsheet"]'));
      
        await spreadsheetButtonElement.click()
        

        try {
          await driver.wait(
            until.elementLocated(By.css("tbody")),
            delayWaiting // Maximum wait time in milliseconds
          );
        } catch (error) {
          t.fail(('Timeout loading page for tbody: ' + call))
        }

        const bodyText = await driver.findElement(By.css('tbody')).getText();

        let svgElement = await driver.findElements(By.css(`svg[data-simply-command="insertRow"]`))[0]
      
        let actions = driver.actions({ bridge: true});
        await actions.move({ origin: svgElement}).click().perform()
          
         //await driver.executeScript("arguments[0].scrollIntoView({ behavior: 'smooth', block: 'center' });", svgElement[0]);
          
          //await svgElement[0].click()
        //let addRowButton = await driver.findElement(By.css(`svg[data-simply-command="insertRow"]`))

        // console.log("add row button?:", await addRowButton )
      })
      
    } 
    
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
      timeout: delayWaiting // @TODO : find out why this timeout doesn't seem to work.
    });
    return response.ok

  } catch (error){
    console.log("did not get a correct JSON from: " + url + " -> error: " + error);
    return false
  }
}