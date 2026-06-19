# Test Plan — VWO Digital Experience Optimization Platform

---

### 1. TEST PLAN OVERVIEW

| Field | Value |
|-------|-------|
| Test Plan ID | TP-VWO-001 |
| Project Name | VWO – Digital Experience Optimization Platform |
| Feature / Module | Login & Dashboard |
| Application URL | https://app.vwo.com/ |
| Prepared By | QA Team |
| Date | 2026-06-18 |
| Version | 1.0 |
| Review Status | Draft |

---

### 2. OBJECTIVE

This test plan validates the functional correctness, security, usability, and performance of the **VWO Login Page** and **Dashboard** module at `https://app.vwo.com/`. The goal is to ensure that:

- Authenticated users can log in with valid credentials and are correctly redirected to the Dashboard.
- Invalid login attempts are gracefully rejected with clear, accurate error messages.
- The Dashboard renders all critical UI elements and navigation components after a successful login.
- The login flow is secure against common web vulnerabilities (SQL injection, XSS, brute-force).
- All test scenarios are automated using Playwright with TypeScript for regression coverage.

---

### 3. SCOPE

#### 3.1 In Scope

| # | Feature | Description |
|---|---------|-------------|
| 1 | Login Form | Email field, password field, Login button |
| 2 | Valid Authentication | Successful login → Dashboard redirect |
| 3 | Invalid Authentication | Error messages for wrong email/password |
| 4 | Field Validations | Empty fields, format validation, boundary values |
| 5 | UI Elements | Placeholders, labels, error banners, Forgot Password link |
| 6 | Keyboard Navigation | Tab order, Enter key submission |
| 7 | Security | SQL injection, XSS, invalid input handling |
| 8 | Dashboard Load | Page title, navigation menu, user profile menu, VWO branding |
| 9 | Session Handling | Session persists on refresh; logout clears session |
| 10 | Cross-Browser | Chrome, Firefox, Edge (latest stable) |

#### 3.2 Out of Scope

| # | Feature | Reason |
|---|---------|--------|
| 1 | A/B Testing creation flow | Covered by a separate test plan |
| 2 | Heatmaps & Session Recordings | Not part of this sprint |
| 3 | Personalization Engine | Out of sprint scope |
| 4 | Third-party integrations (Shopify, Salesforce) | Separate integration test plan |
| 5 | Mobile native app | Web-only scope |
| 6 | API / backend performance | Covered by dedicated performance plan |
| 7 | Forgot Password email flow | Separate email flow test plan |
| 8 | SSO / Social Login | Not in current release |

---

### 4. TEST STRATEGY

#### Testing Types

| Type | Description | Applicable |
|------|-------------|-----------|
| Functional | Verify login/dashboard features work as specified | ✅ |
| Smoke | Quick sanity check: login flow end-to-end | ✅ |
| Regression | Automated re-run of all existing tests after each deployment | ✅ |
| Security | SQL injection, XSS, brute-force resistance | ✅ |
| Usability | Error messaging clarity, keyboard navigation | ✅ |
| Cross-Browser | Chrome, Firefox, Edge | ✅ |
| Performance | Page load < 2 seconds (per NFR) | ✅ (basic load check) |

#### Testing Approach

- **Manual Testing**: Exploratory sessions for UX, edge-case discovery, and visual verification.
- **Automated Testing**: Playwright with TypeScript for regression, happy path, and security test cases.
- **Automation Tool**: Playwright v1.x with TypeScript
- **Framework Pattern**: Page Object Model (POM) for maintainability
- **CI Integration**: Run automation suite on every PR merge to `main` branch

---

### 5. TEST ENVIRONMENT

| Category | Details |
|----------|---------|
| **Application URL** | https://app.vwo.com/ |
| **Browsers** | Google Chrome (latest), Mozilla Firefox (latest), Microsoft Edge (latest) |
| **Operating Systems** | Windows 11 Pro, macOS Ventura 13.x |
| **Screen Resolutions** | Desktop 1920×1080, Tablet 768×1024, Mobile 375×812 |
| **Test Data** | Valid credentials (from QA vault), invalid email variations, boundary-value inputs |
| **Environment Type** | Staging / QA environment |
| **Node.js Version** | 20.x LTS |
| **Playwright Version** | 1.44+ |

#### Test Data Requirements

| Category | Details |
|----------|---------|
| Valid Credentials | QA account with active VWO subscription |
| Invalid Email | notanemail, test@, @domain.com, user name@test.com |
| Invalid Password | any incorrect string for a valid email |
| SQL Injection | `' OR '1'='1`, `admin'--` |
| XSS | `<script>alert(1)</script>`, `"><img src=x onerror=alert(1)>` |
| Boundary Email | 255-character email address |
| Boundary Password | 1-character password, 255-character password |

---

### 6. ENTRY CRITERIA

- [ ] Application is deployed and accessible at `https://app.vwo.com/`
- [ ] Login page UI is code-complete and design-reviewed
- [ ] Dashboard page is navigable after successful authentication
- [ ] Valid QA test credentials have been provisioned and shared via password vault
- [ ] Playwright test framework is set up (`playwright.config.ts` configured)
- [ ] Environment variables `VWO_TEST_EMAIL` and `VWO_TEST_PASSWORD` are set
- [ ] All previously logged blockers for this sprint are resolved
- [ ] Build has passed CI compilation checks

---

### 7. EXIT CRITERIA

- [ ] 100% of P1 (Critical) test cases have been executed
- [ ] 95% of all test cases executed (P1 + P2 + P3)
- [ ] 0 open Critical or Major defects with no workaround
- [ ] All automated Playwright tests pass in CI pipeline
- [ ] Cross-browser execution completed on Chrome, Firefox, and Edge
- [ ] Test results signed off by QA Lead
- [ ] All defects logged in defect management tool with severity/priority assigned

---

### 8. TEST SCENARIOS (High-Level)

| Scenario ID | Scenario Description | Priority | Type |
|-------------|---------------------|----------|------|
| TS-001 | User logs in with valid credentials and reaches Dashboard | P1 | Happy Path |
| TS-002 | User enters invalid email format and sees error | P1 | Negative |
| TS-003 | User enters wrong password and sees error | P1 | Negative |
| TS-004 | User submits empty email field | P1 | Validation |
| TS-005 | User submits empty password field | P1 | Validation |
| TS-006 | User submits both fields empty | P1 | Validation |
| TS-007 | SQL injection attempt in email field | P1 | Security |
| TS-008 | XSS injection in login fields | P1 | Security |
| TS-009 | Login using Enter key | P2 | UX / Keyboard |
| TS-010 | Forgot Password link is clickable | P2 | Navigation |
| TS-011 | Remember Me checkbox persists session | P2 | Session |
| TS-012 | Dashboard: page title is correct after login | P1 | Happy Path |
| TS-013 | Dashboard: main navigation menu is visible | P1 | Happy Path |
| TS-014 | Dashboard: user profile / account menu is visible | P1 | Happy Path |
| TS-015 | Dashboard: VWO logo / branding is present | P2 | UI Validation |
| TS-016 | Logout clears session (back button does not re-enter) | P2 | Security |
| TS-017 | Session persists across page refresh | P2 | Session |
| TS-018 | Tab navigation follows correct field order | P3 | Accessibility |
| TS-019 | Boundary: email at max length (255 chars) | P2 | Boundary |
| TS-020 | Boundary: password at minimum length | P2 | Boundary |

---

### 9. RISK ASSESSMENT

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Login page is unavailable or returns 5xx during test execution | Low | Critical | Add retry logic in tests; escalate to DevOps immediately |
| Valid test credentials expire or get locked out | Medium | High | Use dedicated QA service account; reset via admin before each test cycle |
| Third-party auth provider outage affects login | Low | High | Detect and skip dependent tests; raise P1 incident |
| Dashboard widgets render slowly, causing timeout failures | Medium | Medium | Set Playwright timeout to 30s; use `waitForLoadState('networkidle')` |
| Cross-browser inconsistencies in CSS/JS cause false failures | Medium | Medium | Run cross-browser suite nightly; treat as separate bug tracking |
| SQL/XSS payloads accidentally trigger WAF blocking QA IP | Low | High | Pre-approve QA IP with Security team; use sanitized payloads |
| Test environment mirrors production inaccurately | Low | High | Validate environment parity with DevOps before test execution starts |

---

### 10. DEFECT MANAGEMENT

- **Tool**: Jira (project: VWO-QA)
- **Bug Template Fields**: Summary, Steps to Reproduce, Expected Result, Actual Result, Environment, Attachments (screenshot/video), Playwright test name

#### Severity Levels

| Severity | Definition | Example |
|----------|-----------|---------|
| Critical | Feature is completely broken; no workaround | Login button does nothing |
| Major | Core functionality broken; workaround exists | Error message not displayed |
| Minor | Non-critical defect; UX impact only | Wrong error message wording |
| Trivial | Cosmetic / typo | Label alignment off by 2px |

#### Bug Lifecycle

`New` → `Assigned` → `In Fix` → `Ready for QA` → `Verified` → `Closed`

Regression re-test required before closing all Critical and Major bugs.

---

### 11. TEST SCHEDULE

| Phase | Activity | Start Date | End Date | Owner |
|-------|----------|-----------|---------|-------|
| Preparation | Test plan review & sign-off | 2026-06-18 | 2026-06-19 | QA Lead |
| Setup | Test environment validation; credential provisioning | 2026-06-20 | 2026-06-20 | QA Engineer |
| Manual Testing | Exploratory + manual execution of all test cases | 2026-06-21 | 2026-06-23 | QA Engineer |
| Automation | Playwright script development & execution | 2026-06-21 | 2026-06-25 | Automation QA |
| Defect Reporting | Log and triage all found defects | 2026-06-21 | 2026-06-26 | QA Engineer |
| Regression | Re-test fixed defects; final automation run | 2026-06-26 | 2026-06-27 | QA Engineer |
| Sign-off | Final review and approval | 2026-06-28 | 2026-06-28 | QA Lead |

---

### 12. SIGN-OFF

| Role | Name | Signature | Date |
|------|------|-----------|------|
| QA Lead | | | |
| Dev Lead | | | |
| Product Owner | | | |
| Security Review | | | |

---

*Generated by STLC Agent — VWO Testing Pipeline | n8n Workflow: STLC_VWO_Testing_Pipeline*
