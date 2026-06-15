import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByTestId('username');
    this.passwordInput = page.getByTestId('password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.errorMessage = page.locator("//h3[@data-test='error']");
  }

  async navigateTo(): Promise<void> {
    await this.page.goto('/');
  }

  async doLogin(username: string, password: string): Promise<void> {
    try {
      await this.usernameInput.fill(username);
      await this.passwordInput.fill(password);
      await this.loginButton.click();
    } catch (error) {
      throw new Error(`Login failed for user ${username}: ${error}`);
    }
  }

  async verifySuccessfulLogin(): Promise<void> {
    try {
      await expect(this.page).toHaveURL(/.*\/inventory.html/);
    } catch (error) {
      throw new Error(`Successful login verification failed: ${error}`);
    }
  }

  async verifyLoginError(expectedErrorMessage: string): Promise<void> {
    try {
      await expect(this.errorMessage).toBeVisible();
      await expect(this.errorMessage).toHaveText(expectedErrorMessage);
    } catch (error) {
      throw new Error(`Error message verification failed. Expected: "${expectedErrorMessage}". ${error}`);
    }
  }
}
