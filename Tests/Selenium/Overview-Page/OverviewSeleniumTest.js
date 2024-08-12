const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');

// Helper function to take screenshots
async function takeScreenshot(driver, filename) {
    let image = await driver.takeScreenshot();
    fs.writeFileSync(`C:\\Users\\Mutat\\OneDrive\\Desktop\\CtrlAltDelete\\CtrlAltDelete\\frontend\\screenshots\\${filename}`, image, 'base64');
}

// Helper function to clear browser data
async function clearBrowserData(driver) {
    await driver.manage().deleteAllCookies();
    try {
        await driver.executeScript("window.sessionStorage.clear();");
        await driver.executeScript("window.localStorage.clear();");
    } catch (error) {
        console.log("Could not clear sessionStorage or localStorage");
    }
}

// Main test function for the Overview component
async function testOverviewComponent() {
    let options = new chrome.Options();
    let driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

    try {
        await clearBrowserData(driver);
        await driver.get('http://localhost:3000/login');
        console.log("Navigated to login page.");

        await driver.findElement(By.id('emailInput')).sendKeys('Navid1.Baghaei@gmail.com');
        await driver.findElement(By.id('passwordInput')).sendKeys('Abc123!!', Key.RETURN);
        console.log("Credentials entered and submitted.");

        await driver.wait(until.urlIs('http://localhost:3000/'), 30000);
        console.log("Navigated to home page.");

        await driver.findElement(By.linkText('Overview')).click();
        await driver.wait(until.urlIs('http://localhost:3000/overview'), 30000);
        console.log("Navigated to Overview page.");

        // Wait for tasks to be visible and fully loaded
        await driver.wait(until.elementLocated(By.className('task-box')), 30000);
        console.log("Confirmed tasks are visible.");

        // Take a screenshot immediately after confirming tasks are loaded
        takeScreenshot(driver, 'InitialOverviewPage.png');

        // Test the Priority filter for "High"
        let prioritySelect = await driver.findElement(By.id('priority-select'));
        await prioritySelect.sendKeys('High', Key.RETURN);
        await driver.sleep(2000); // Allow filter to apply
        takeScreenshot(driver, 'HighPriorityTasks.png');

        // Test the Status filter for "In Progress"
        let statusSelect = await driver.findElement(By.id('status-select'));
        await statusSelect.sendKeys('In Progress', Key.RETURN);
        await driver.sleep(2000); // Allow filter to apply
        takeScreenshot(driver, 'InProgressTasks.png');

        // Test the Search filter for "Search filter"
        let searchBar = await driver.findElement(By.id('searchBar'));
        await searchBar.sendKeys('Search filter', Key.RETURN);
        await driver.sleep(2000); // Allow search to process
        takeScreenshot(driver, 'SearchResults.png');

    } catch (error) {
        console.error('An error occurred:', error);
        takeScreenshot(driver, 'error_screenshot.png');
    } finally {
        await driver.quit();
    }
}

testOverviewComponent();
