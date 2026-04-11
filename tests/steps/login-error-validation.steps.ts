import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { page, test } from './page-model';

Given('I navigate to {string}', async (url) => {
  await page.goto(url);
});

When('I enter invalid email for login', async () => {
  await page.locator('[data-test="login-email"]').fill("invalid_email");
});

When('I enter valid email for login', async () => {
  await page.locator('[data-test="login-email"]').fill('example@domain.com');
});

When('I enter password for login', async () => {
  await page.locator('[data-test="login-password"]').fill('password');
});

Then('error message {string} is displayed below the input field', async (errorMessage) => {
  const errorElement = page.locator('[data-test="login-error"]');
  await expect(errorElement).toContainText(errorMessage);
});

Then('error message {string} is not displayed', async (errorMessage) => {
  const errorElement = page.locator('[data-test="login-error"]');
  await expect(errorElement).not.toBeVisible();
});