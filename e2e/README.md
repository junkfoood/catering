# End-to-End Testing

This directory contains Playwright end-to-end tests for the Catering Compare application.

## Test Structure

- `home.spec.ts` - Tests for the home page functionality
- `auth.spec.ts` - Tests for authentication flows (login/logout)
- `dashboard.spec.ts` - Tests for the dashboard and caterer display functionality
- `utils/login.ts` - Helper functions for authentication testing

## Running Tests

### Prerequisites

1. Make sure your development server is running:
   ```bash
   pnpm dev
   ```

2. Ensure your database is set up and seeded:
   ```bash
   pnpm db:generate
   pnpm db:push
   ```

### Running Tests

#### All Tests
```bash
pnpm test
```

#### With UI (Interactive Mode)
```bash
pnpm test:ui
```

#### In Headed Mode (See Browser)
```bash
pnpm test:headed
```

#### Specific Test File
```bash
npx playwright test home.spec.ts
```

#### Specific Test
```bash
npx playwright test --grep "should load the home page"
```

## Test Utilities

### Mock Accounts

The tests use mock accounts defined in `utils/login.ts`:

- `admin` - Lim Yong Xiang (Lead Software Engineer)
- `user` - Song Chin Yong (Senior Software Engineer)
- Various other team members

### Login Helpers

```typescript
import { loginAs, logout } from "./utils/login";

// Login as admin
await loginAs.admin({ page });

// Login as regular user
await loginAs.user({ page });

// Logout
await logout({ page });
```

## Writing New Tests

1. Create a new `.spec.ts` file in the `e2e` directory
2. Import the necessary Playwright functions and utilities
3. Use the existing login helpers for authenticated tests
4. Follow the existing test patterns

### Example Test Structure

```typescript
import { test, expect } from "@playwright/test";
import { loginAs, logout } from "./utils/login";

test.describe("Feature Name", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs.admin({ page });
  });

  test.afterEach(async ({ page }) => {
    await logout({ page });
  });

  test("should do something", async ({ page }) => {
    await page.goto("/some-route");
    await expect(page.getByText("Expected Text")).toBeVisible();
  });
});
```

## Debugging Tests

### View Test Results
```bash
npx playwright show-report
```

### Debug Mode
```bash
npx playwright test --debug
```

### Trace Viewer
```bash
npx playwright show-trace trace.zip
```

## Configuration

Tests are configured in `playwright.config.ts` at the project root. The configuration includes:

- Test directory: `./e2e`
- Base URL: `http://localhost:3000`
- Browser: Chromium (Firefox and WebKit are commented out)
- Retry logic for CI
- Video and trace capture on failure

## CI/CD Integration

The tests are configured to run in CI environments with:
- Retries on failure
- Single worker to avoid conflicts
- Forbidden `test.only` usage 