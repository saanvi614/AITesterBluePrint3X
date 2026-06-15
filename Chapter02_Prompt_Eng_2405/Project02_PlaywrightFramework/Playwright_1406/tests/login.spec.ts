import { test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('SauceDemo Login Tests', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigateTo();
  });

  test('TC-001: Valid login with standard_user', async () => {
    try {
      await loginPage.doLogin('standard_user', 'secret_sauce');
      await loginPage.verifySuccessfulLogin();
    } catch (error) {
      throw new Error(`Valid login test failed: ${error}`);
    }
  });

  test('TC-002: Invalid login with wrong password', async () => {
    const expectedError = 'Epic sadface: Username and password do not match any user in this service';
    
    try {
      await loginPage.doLogin('standard_user', 'wrong_password');
      await loginPage.verifyLoginError(expectedError);
    } catch (error) {
      throw new Error(`Invalid login test failed: ${error}`);
    }
  });

  test('TC-003: Locked out user cannot login', async () => {
    const expectedError = 'Epic sadface: Sorry, this user has been locked out.';
    
    try {
      await loginPage.doLogin('locked_out_user', 'secret_sauce');
      await loginPage.verifyLoginError(expectedError);
    } catch (error) {
      throw new Error(`Locked out user test failed: ${error}`);
    }
  });

  test('TC-004: Performance glitch user login succeeds', async () => {
    try {
      const startTime = Date.now();
      await loginPage.doLogin('performance_glitch_user', 'secret_sauce');
      await loginPage.verifySuccessfulLogin();
      const duration = Date.now() - startTime;
      console.log(`Performance glitch user login took ${duration}ms`);
    } catch (error) {
      throw new Error(`Performance glitch user test failed: ${error}`);
    }
  });
});
