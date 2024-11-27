import { Builder, By, Key, until, Browser } from 'selenium-webdriver';
import tap from "tap";
//import * as fs from 'fs';
import Chrome from 'selenium-webdriver/chrome.js';


(async function firstTest() {
  let driver;
  
  try {
    const screen = {
      width: 640,
      height: 480
    };

    driver = new Builder()
        .forBrowser(Browser.CHROME)
        .setChromeOptions(new Chrome.Options().addArguments('--headless').windowSize(screen))
        .build();

    await driver.get('http://localhost:4500');

    tap.test("Website online", async t => {
      
      //Check website online
      let title = await driver.getTitle();
      t.equal("SLO Curriculum Browser", title);
      //document weergave flow check


      //spreadsheet weergave flow check
      
    })

  } catch (e) {
    console.log(e)
  } finally {
    await driver.quit();
  }
}())
