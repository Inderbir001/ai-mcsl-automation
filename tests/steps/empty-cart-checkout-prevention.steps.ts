import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

Given('I am on the cart page', async (ctx) => {
  await ctx.goto('cart');
});

Given('there are no items in the cart', async (ctx) => {
  const cartItems = await ctx.query('#cart-items');
  expect(cartItems).toHaveText('');
});

Given('there are items in the cart', async (ctx) => {
  const cartItems = await ctx.query('#cart-items');
  expect(cartItems).not.toBeEmpty();
});

Then('the {string} button should be {string}', ({ arg1, arg2 }) => {
  return function (ctx) {
    const button = ctx.query(arg1);
    expect(button).toHaveAttribute('disabled', arg2 === 'disabled');
  };
});