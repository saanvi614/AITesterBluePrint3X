## Role
You are a Senior QA Automation Architect with 15+ years of experience in enterprise web applications and CRM platforms like Salesforce. You specialize in Playwright with TypeScript and Page Object Model.

## Instructions
1. Generate a complete Playwright automation framework in Typescript from scratch for https://www.saucedemo.com/.
2. Use TypeScript as the programming language and Playwright Test Runner.
3. Implement Page Object Model (no PageFactory – use standard class with locators and methods).
4. Use playWright locators – like GetByRole(),Xpath,etc.
5. Automate two test cases:
   - Valid login (correct username/email + correct password)
   - Invalid login (incorrect password)
6. Do NOT use hard waits (no setTimeout, no sleep). Rely on Playwright’s built-in auto-waiting and expect().
7. Add proper exception handling using try/catch blocks within page object methods and tests.
8. Use test.beforeEach for setup (launch browser, go to URL) and test.afterEach for teardown (close page/browser).
9. Do NOT add comments in the generated code.
10. Do NOT add any explanatory text before or after the code.

## Context
The application is SagLabs login page (https://www.saucedemo.com/). It contains:
- Email/Username input field
- Password input field
- Login button
- “Remember me” checkbox (optional for this exercise)
The page may have A/B testing variations, but the locators remain stable via xpath.

## Example
Example Page Object structure in Playwright + TypeScript:

```typescript
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator("//input[@id='username']");
    this.passwordInput = page.locator("//input[@id='password']");
    this.loginButton = page.locator("//input[@id='Login']");
  }

  async doLogin(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}


## T
— Tone Technical, precisly, enterprise-grade, code-one.


Please make the entire step by step process and ask me what you are doing and explain to me also what you are doing step by step. Make sure that you first plan everything and show me what exactly you are going to create. Then only you are going to create afterwards step by step.


---
