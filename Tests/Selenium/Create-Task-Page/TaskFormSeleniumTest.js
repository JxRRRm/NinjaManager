const { Builder, By, until } = require('selenium-webdriver');
const { Options } = require('selenium-webdriver/chrome');
const fs = require('fs');

async function clearBrowserData(driver) {
    await driver.manage().deleteAllCookies(); // Clear cookies
    await driver.executeScript("window.localStorage.clear();"); // Clear local storage
}

async function captureScreenshot(driver, filename) {
    let image = await driver.takeScreenshot();
    fs.writeFileSync(filename, image, 'base64');
}

async function runTest() {
    let options = new Options();
    options.addArguments('headless'); // Run headless Chrome

    let driver = new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    try {
        await driver.get('http://localhost:3000/login');
        await clearBrowserData(driver);

        // Login process
        let usernameInput = await driver.findElement(By.id('emailInput'));
        let passwordInput = await driver.findElement(By.id('passwordInput'));
        let loginButton = await driver.findElement(By.id('loginButton'));
        await usernameInput.sendKeys('person1@gmail.com');
        await passwordInput.sendKeys('Person1!');
        await driver.executeScript("arguments[0].scrollIntoView(true);", loginButton);
        await loginButton.click();


        // Wait for navigation to home page
        await driver.wait(until.elementLocated(By.id('homePage')), 10000);
        console.log('Logged in and navigated to home page.');

        // Navigate to Create Task page
        let createTaskLink = await driver.findElement(By.id('createTaskLink'));
        await createTaskLink.click();
        await driver.wait(until.elementLocated(By.id('taskForm')), 10000);
        console.log('Navigated to Create Task page.');

        // Fill out the task form
        let titleInput = await driver.findElement(By.id('title'));
        await titleInput.sendKeys('New Task');
        let dateInput = await driver.findElement(By.id('date'));
        await dateInput.sendKeys('2024-04-22T18:08'); // UTC
        let descriptionInput = await driver.findElement(By.id('description'));
        await descriptionInput.sendKeys('Complete this task soon.');
        let prioritySelect = await driver.findElement(By.id('priority'));
        await prioritySelect.sendKeys('High');
        let submitButton = await driver.findElement(By.id('submitButton'));
        await submitButton.click();
        console.log('Form submitted.');

        // Capture screenshot right before submission
        await driver.executeScript("document.body.style.zoom='50%'");
        await captureScreenshot(driver, 'pre-submission-screenshot.png');

        // Check for success message
        let successMessage = await driver.wait(until.elementLocated(By.id('successMessage')), 10000);
        console.log('Success message displayed:', successMessage ? true : false);

        //Capture screenshot right after submission
        await driver.executeScript("arguments[0].scrollIntoView(true);", submitButton);
        await captureScreenshot(driver, 'post-submission-screenshot.png');

    } catch (error) {
        console.error('An error occurred:', error);
        await captureScreenshot(driver, 'error-screenshot.png');
    } finally {
        await driver.quit();
    }
}

runTest();