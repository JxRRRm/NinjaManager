const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');

// Function to take screenshots
async function takeScreenshot(driver, filename) {
    let image = await driver.takeScreenshot();
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

// Helper function to apply and capture filter state
async function applyFilterAndWait(driver, filterId, value, screenshotPath) {
    const filterElement = await driver.findElement(By.id(filterId));
    await filterElement.sendKeys(value, Key.RETURN);
    console.log(`Filter set to '${value}' for ${filterId}.`);

    // Wait for the page to update the results based on the filter
    await driver.sleep(5000); // Ensure results have loaded

    // Screenshot after applying filter
    await takeScreenshot(driver, screenshotPath);
    console.log(`Screenshot taken for ${filterId} set to '${value}'.`);
}

// The main test function
async function testHomePage() {
    let options = new chrome.Options();
    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    try {
        await clearBrowserData(driver);

        await driver.get('http://localhost:3000/login');
        console.log("Navigated to login page.");
        await driver.findElement(By.id('emailInput')).sendKeys('abhargava@csus.edu');
        await driver.findElement(By.id('passwordInput')).sendKeys('!1Testing', Key.RETURN);
        console.log("Credentials entered and submitted.");

        await driver.wait(until.urlIs('http://localhost:3000/'), 20000);
        console.log("Navigated to home page.");
        await takeScreenshot(driver,
             'C:\\Users\\Arjun\\Documents\\190\\CtrlAltDelete\\frontend\\screenshots\\successful-login.png');
        console.log("Screenshot taken after successful login.");

        // Status Filters: In Progress, Past Due, All
        await applyFilterAndWait(driver, 'status', 'In Progress',
         'C:\\Users\\Arjun\\Documents\\190\\CtrlAltDelete\\frontend\\screenshots\\status-InProgress.png');
        await applyFilterAndWait(driver, 'status', 'Past Due',
         'C:\\Users\\Arjun\\Documents\\190\\CtrlAltDelete\\frontend\\screenshots\\status-PastDue.png');
        await applyFilterAndWait(driver, 'status', 'All',
         'C:\\Users\\Arjun\\Documents\\190\\CtrlAltDelete\\frontend\\screenshots\\status-All.png');

        // Priority Filters: High, Medium, Low
        await applyFilterAndWait(driver, 'priority', 'High',
         'C:\\Users\\Arjun\\Documents\\190\\CtrlAltDelete\\frontend\\screenshots\\priority-High.png');
        await applyFilterAndWait(driver, 'priority', 'Medium',
         'C:\\Users\\Arjun\\Documents\\190\\CtrlAltDelete\\frontend\\screenshots\\priority-Medium.png');
        await applyFilterAndWait(driver, 'priority', 'Low',
         'C:\\Users\\Arjun\\Documents\\190\\CtrlAltDelete\\frontend\\screenshots\\priority-Low.png');

        // Reset filters before applying due date
        const resetButton = await driver.findElement(By.xpath("//button[text()='Reset Filters']"));
        await resetButton.click();
        console.log("Filters reset before due date application.");

        // Due Date Filter: Apply and take a screenshot
        const dueDateInput = await driver.findElement(By.id('due-date'));
        await dueDateInput.sendKeys('06/30/2024', Key.RETURN); // Adjust date format here
        console.log("Due date filter set.");
        await driver.sleep(5000);
        await takeScreenshot(driver,
             'C:\\Users\\Arjun\\Documents\\190\\CtrlAltDelete\\frontend\\screenshots\\due-date-set.png');

        // Reset and apply Search Filter
        await resetButton.click();
        console.log("Filters reset before applying search.");
        const searchBar = await driver.findElement(By.id('search'));
        await searchBar.sendKeys('Test', Key.RETURN);
        console.log("Search term 'Test' entered.");
        await driver.sleep(5000);
        await takeScreenshot(driver,
             'C:\\Users\\Arjun\\Documents\\190\\CtrlAltDelete\\frontend\\screenshots\\search-applied.png');

    } catch (error) {
        console.error('An error occurred:', error);
        await takeScreenshot(driver,
             'C:\\Users\\Arjun\\Documents\\190\\CtrlAltDelete\\frontend\\screenshots\\error-screenshot.png');
        console.log("Screenshot taken on error.");
    } finally {
        await driver.quit();
    }
}

testHomePage();
