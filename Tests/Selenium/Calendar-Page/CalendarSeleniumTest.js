const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');

// Function to take screenshots
async function takeScreenshot(driver, filename) {
    let image = await driver.takeScreenshot();
    //fs.writeFileSync(filename, image, 'base64');
    fs.writeFileSync(filename, image, 'base64');
}

// Function to clear browser data
async function clearBrowserData(driver) {
    await driver.manage().deleteAllCookies();
    try {
        await driver.executeScript("window.sessionStorage.clear();");
        await driver.executeScript("window.localStorage.clear();");
    } catch (error) {
        console.log("Could not clear sessionStorage or localStorage");
    }
}

// The main test function
async function testHomePage() {
    let options = new chrome.Options();
    let driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
    // Add other Chrome options as needed

    try {
        await clearBrowserData(driver);

        await driver.get('http://localhost:3000/login');
        console.log("Navigated to login page.");
        
        //await driver.wait(until.elementLocated(By.id('emailInput')), 10000); // waits up to 10 seconds

        await driver.findElement(By.id('emailInput')).sendKeys('nikolay.chkhaylo@yahoo.com');
        await driver.findElement(By.id('passwordInput')).sendKeys('TheColaman3@', Key.RETURN);
        console.log("Credentials entered and submitted.");

        await driver.wait(until.urlIs('http://localhost:3000/'), 30000);
        console.log("Navigated to home page.");

        // Take a screenshot after a successful login
        await takeScreenshot(driver, 'C:\\Users\\nikol\\Documents\\GitHub\\CtrlAltDelete\\frontend\\screenshots\\1loginSuccess.png');
        console.log("Screenshot taken after successful login.");

       //Navigate to Calendar page
       await driver.findElement(By.linkText('Calendar')).click();
       await driver.wait(until.urlIs('http://localhost:3000/calendar'), 30000);
       console.log("Navigated to Overview page.");
        await takeScreenshot(driver, 'C:\\Users\\nikol\\Documents\\GitHub\\CtrlAltDelete\\frontend\\screenshots\\2Calendarpage.png');
        console.log("Screenshot taken after successful login.");

       //Day view with a task on it
       await driver.findElement(By.xpath("//button[text()='Day']")).click();
       await driver.sleep(1000);
       await takeScreenshot(driver, 'C:\\Users\\nikol\\Documents\\GitHub\\CtrlAltDelete\\frontend\\screenshots\\3DayTaskView.png');
       console.log("Screenshot taken after successful view.");

       //Navigate to a day without task
       await driver.findElement(By.xpath("//button[text()='Next']")).click();
       await takeScreenshot(driver, 'C:\\Users\\nikol\\Documents\\GitHub\\CtrlAltDelete\\frontend\\screenshots\\4DayEmptyView.png');
       console.log("Screenshot taken after successful navigation.");

       //Week view
       await driver.findElement(By.xpath("//button[text()='Week']")).click();
       await takeScreenshot(driver, 'C:\\Users\\nikol\\Documents\\GitHub\\CtrlAltDelete\\frontend\\screenshots\\5WeekTaskView.png');
       console.log("Screenshot taken after successful view.");
        
       //Next week view
       await driver.findElement(By.xpath("//button[text()='Next']")).click();
       await takeScreenshot(driver, 'C:\\Users\\nikol\\Documents\\GitHub\\CtrlAltDelete\\frontend\\screenshots\\6WeekEmptyView.png');
       console.log("Screenshot taken after successful view.");
       
       //Month view
       await driver.findElement(By.xpath("//button[text()='Month']")).click();
       await takeScreenshot(driver, 'C:\\Users\\nikol\\Documents\\GitHub\\CtrlAltDelete\\frontend\\screenshots\\7MonthView.png');
       console.log("Screenshot taken after successful view.");
       
       //Next month view
       await driver.findElement(By.xpath("//button[text()='Next']")).click();
       await takeScreenshot(driver, 'C:\\Users\\nikol\\Documents\\GitHub\\CtrlAltDelete\\frontend\\screenshots\\8NextMonthView.png');
       console.log("Screenshot taken after successful view.");

       await driver.sleep(1000);

       await driver.findElement(By.xpath("//button[text()='Back']")).click();
       await driver.sleep(1000);

    // CSS selector that targets the div by its class and title attribute
        
        await driver.findElement(By.css("div.rbc-event-content[title='wef']")).click();
        await driver.findElement(By.xpath("//button[text()='Edit']")).click();
        await takeScreenshot(driver, 'C:\\Users\\nikol\\Documents\\GitHub\\CtrlAltDelete\\frontend\\screenshots\\9TaskView.png');

    } catch (error) {
        console.error('An error occurred:', error);
        await takeScreenshot(driver, 'C:\\Users\\nikol\\Documents\\GitHub\\CtrlAltDelete\\frontend\\screenshots\\9TaskView.png');
        console.log("Screenshot taken on error.");
    } finally {
        // Uncomment the line below if you want to close the browser after the tests
        //await driver.quit();
    }
}

testHomePage();

