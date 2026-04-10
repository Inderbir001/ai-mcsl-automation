import { Given, When, Then, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, Browser, Page } from '@playwright/test';

// Give Playwright a bit more time to run steps
setDefaultTimeout(60 * 1000);

let browser: Browser;
let page: Page;

Given('the user is on the target page', async function () {
  // Launch the browser
  browser = await chromium.launch({ headless: false }); // headless: false so you can watch it!
  const context = await browser.newContext();
  page = await context.newPage();
  
  // For this example, let's just go to a dummy login page or even google
  await page.goto('https://example.com');
});

When('the user enters invalid data format', async function () {
  // Normally you would do: await page.fill('#email', 'bad-email');
  console.log("Simulating typing invalid data...");
});

Then('the system should display an inline error message', async function () {
  // Normally you would do: await expect(page.locator('.error')).toBeVisible();
  console.log("Simulating checking for error message...");
});

Then('the submit button should remain disabled', async function () {
  // Close the browser when the test is done
  await browser.close();
});