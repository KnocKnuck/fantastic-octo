# Testing Documentation

Comprehensive testing guide for the AI Calendar Agent project.

## Table of Contents

- [Overview](#overview)
- [Testing Stack](#testing-stack)
- [Getting Started](#getting-started)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Test Coverage](#test-coverage)
- [CI/CD Pipeline](#cicd-pipeline)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

This project uses a comprehensive testing strategy to ensure code quality, reliability, and maintainability:

- **Unit Tests**: Test individual functions, utilities, and components in isolation
- **Integration Tests**: Test API routes, database operations, and component interactions
- **E2E Tests**: Test complete user flows and critical paths
- **Coverage Target**: 80%+ for critical paths

## Testing Stack

### Core Testing Frameworks

- **Jest**: Unit and integration testing framework
- **Vitest**: Fast alternative to Jest with native ESM support
- **React Testing Library**: Component testing with user-centric approach
- **Playwright**: Cross-browser E2E testing

### Additional Tools

- **@testing-library/jest-dom**: Custom Jest matchers for DOM elements
- **@testing-library/user-event**: Simulates user interactions
- **Husky**: Git hooks for pre-commit testing
- **lint-staged**: Run linters on staged files

## Getting Started

### Installation

All testing dependencies are already installed. If you need to reinstall:

```bash
npm install
```

### IDE Setup

#### VS Code Extensions (Recommended)

- Jest Runner
- Playwright Test for VS Code
- ESLint
- Prettier

#### Configuration

Add to your VS Code settings:

```json
{
  "jest.autoRun": "off",
  "playwright.reuseBrowser": true
}
```

## Running Tests

### Unit & Integration Tests

```bash
# Run all tests with Jest
npm test

# Run tests in watch mode (recommended during development)
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- path/to/test.test.ts

# Run tests matching a pattern
npm test -- --testNamePattern="should render"
```

### Unit Tests with Vitest (Alternative)

```bash
# Run all tests with Vitest
npm run test:vitest

# Run with UI
npm run test:vitest:ui

# Run with coverage
npm run test:vitest -- --coverage
```

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run in debug mode
npm run test:e2e:debug

# Run with UI mode
npm run test:e2e:ui

# Run specific test file
npm run test:e2e -- e2e/auth.spec.ts

# Run tests on specific browser
npm run test:e2e -- --project=chromium
npm run test:e2e -- --project=firefox
npm run test:e2e -- --project=webkit
```

### All Tests

```bash
# Run all tests (lint, unit, e2e)
npm run test:all
```

### Type Checking

```bash
# Run TypeScript type check
npm run type-check
```

## Writing Tests

### Unit Tests

Create test files next to the source code with `.test.ts` or `.test.tsx` extension.

#### Example: Testing a Utility Function

```typescript
// lib/utils.test.ts
import { formatDate, calculateDuration } from "./utils";

describe("Date Utils", () => {
  describe("formatDate", () => {
    it("should format date correctly", () => {
      const date = new Date("2024-01-15");
      expect(formatDate(date)).toBe("January 15, 2024");
    });

    it("should handle invalid dates", () => {
      expect(formatDate(null)).toBe("Invalid Date");
    });
  });

  describe("calculateDuration", () => {
    it("should calculate duration between dates", () => {
      const start = new Date("2024-01-15T10:00:00");
      const end = new Date("2024-01-15T11:30:00");
      expect(calculateDuration(start, end)).toBe(90); // minutes
    });
  });
});
```

### Component Tests

#### Example: Testing a React Component

```typescript
// components/Button.test.tsx
import { render, screen } from '@/__tests__/utils/test-utils'
import { Button } from './Button'

describe('Button Component', () => {
  it('should render button with text', () => {
    render(<Button>Click Me</Button>)
    expect(screen.getByText('Click Me')).toBeInTheDocument()
  })

  it('should call onClick handler', async () => {
    const handleClick = jest.fn()
    const { user } = render(<Button onClick={handleClick}>Click</Button>)

    await user.click(screen.getByText('Click'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByText('Disabled')).toBeDisabled()
  })

  it('should have correct variant class', () => {
    render(<Button variant="primary">Primary</Button>)
    expect(screen.getByText('Primary')).toHaveClass('btn-primary')
  })
})
```

#### Using Test Utilities

```typescript
import { renderWithProviders, setupUser, createMockUser } from '@/__tests__/utils/test-utils'
import { createMockTask } from '@/__tests__/utils/mock-data'

describe('TaskList Component', () => {
  it('should render list of tasks', () => {
    const tasks = [
      createMockTask({ title: 'Task 1' }),
      createMockTask({ title: 'Task 2' }),
    ]

    renderWithProviders(<TaskList tasks={tasks} />)

    expect(screen.getByText('Task 1')).toBeInTheDocument()
    expect(screen.getByText('Task 2')).toBeInTheDocument()
  })
})
```

### API Route Tests

```typescript
// app/api/tasks/route.test.ts
import { GET, POST } from "./route";
import { NextRequest } from "next/server";

describe("Tasks API", () => {
  describe("GET /api/tasks", () => {
    it("should return list of tasks", async () => {
      const request = new NextRequest("http://localhost:3000/api/tasks");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });
  });

  describe("POST /api/tasks", () => {
    it("should create a new task", async () => {
      const taskData = {
        title: "New Task",
        description: "Task description",
      };

      const request = new NextRequest("http://localhost:3000/api/tasks", {
        method: "POST",
        body: JSON.stringify(taskData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.title).toBe("New Task");
    });
  });
});
```

### E2E Tests

E2E tests are located in the `e2e/` directory.

#### Example: Testing User Flow

```typescript
// e2e/task-management.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Task Management", () => {
  test.beforeEach(async ({ page }) => {
    // Sign in before each test
    await page.goto("/signin");
    await page.fill('[name="email"]', "test@example.com");
    await page.fill('[name="password"]', "password123");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");
  });

  test("should create a new task", async ({ page }) => {
    // Navigate to tasks
    await page.click("text=Tasks");

    // Click create task button
    await page.click('button:has-text("New Task")');

    // Fill in task details
    await page.fill('[name="title"]', "My Test Task");
    await page.fill('[name="description"]', "Task description");
    await page.selectOption('[name="priority"]', "high");

    // Submit form
    await page.click('button[type="submit"]');

    // Verify task was created
    await expect(page.locator("text=My Test Task")).toBeVisible();
  });

  test("should complete a task", async ({ page }) => {
    await page.goto("/tasks");

    // Find a task and mark as complete
    const task = page.locator(".task-item").first();
    await task.locator('input[type="checkbox"]').check();

    // Verify task is marked as completed
    await expect(task).toHaveClass(/completed/);
  });
});
```

## Test Coverage

### Viewing Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# Open HTML coverage report
open coverage/lcov-report/index.html
```

### Coverage Requirements

- **Overall**: 80% minimum
- **Critical paths**: 90%+ (auth, payments, core features)
- **Utilities**: 85%+
- **Components**: 75%+

### Coverage in CI

Coverage reports are automatically generated and uploaded in CI/CD:

- **Codecov**: Uploaded to Codecov for tracking trends
- **PR Comments**: Coverage changes commented on PRs
- **Artifacts**: Full HTML reports available in GitHub Actions

## CI/CD Pipeline

### GitHub Actions Workflows

#### Main CI Workflow (`.github/workflows/ci.yml`)

Runs on push to `main` and `develop`:

1. **Install Dependencies**: Cache and install npm packages
2. **Lint**: Run ESLint
3. **Type Check**: Run TypeScript compiler
4. **Tests**: Run unit and integration tests with coverage
5. **E2E Tests**: Run Playwright tests
6. **Security Audit**: Check for vulnerabilities
7. **Build**: Build production bundle
8. **Deploy**: Deploy to staging (develop) or production (main)

#### PR Checks Workflow (`.github/workflows/pr-checks.yml`)

Runs on pull requests:

1. **PR Metadata**: Check title and description
2. **Code Quality**: Lint and type check
3. **Test Coverage**: Run tests and comment coverage on PR
4. **Security Scan**: npm audit and secret scanning
5. **Build Verification**: Ensure build succeeds
6. **E2E Critical Paths**: Run critical E2E tests (chromium only)
7. **Performance Check**: Analyze bundle size

### Pre-commit Hooks

Husky runs automatically before commits:

```bash
# Runs automatically on git commit
1. lint-staged: Lint and format staged files
2. Type check: TypeScript compiler
3. Tests: Run tests for changed files
```

### Commit Message Format

Commits must follow Conventional Commits format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer]
```

**Types**:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes
- `build`: Build system changes
- `revert`: Revert previous commit

**Examples**:

```bash
git commit -m "feat: add task filtering"
git commit -m "fix(api): resolve CORS issue"
git commit -m "docs: update testing guide"
git commit -m "test: add unit tests for auth service"
```

## Best Practices

### General Testing Principles

1. **Test Behavior, Not Implementation**
   - Focus on what the code does, not how it does it
   - Test from the user's perspective

2. **Keep Tests Isolated**
   - Each test should be independent
   - Use setup/teardown for shared state
   - Avoid test interdependencies

3. **Use Descriptive Test Names**
   - Use "should" or "it should" format
   - Describe the expected behavior clearly
   - Include context when necessary

4. **Follow AAA Pattern**
   - **Arrange**: Set up test data and conditions
   - **Act**: Execute the code being tested
   - **Assert**: Verify the results

5. **Mock External Dependencies**
   - Mock API calls, databases, third-party services
   - Use provided mock data generators
   - Keep mocks simple and realistic

### Component Testing

1. **Query Priority** (React Testing Library):
   - `getByRole` (preferred)
   - `getByLabelText`
   - `getByPlaceholderText`
   - `getByText`
   - `getByTestId` (last resort)

2. **User Interactions**:
   - Use `@testing-library/user-event` over `fireEvent`
   - Simulate real user behavior
   - Wait for async updates

3. **Accessibility**:
   - Test with screen readers in mind
   - Verify ARIA attributes
   - Check keyboard navigation

### E2E Testing

1. **Test Critical User Flows**:
   - Authentication (sign up, sign in, sign out)
   - Core features (create task, schedule event)
   - Payment flows
   - User onboarding

2. **Keep Tests Stable**:
   - Use reliable selectors (roles, labels)
   - Add proper waits for dynamic content
   - Handle race conditions
   - Avoid hard-coded waits

3. **Use Page Object Model**:
   - Encapsulate page interactions
   - Make tests maintainable
   - Reuse common actions

4. **Test Data Management**:
   - Use isolated test data
   - Clean up after tests
   - Use test-specific accounts

#### Mocking OAuth Providers

When testing authentication flows with OAuth providers (Google, Microsoft, etc.), use request interception to mock the OAuth flow:

```typescript
import { test, expect, Page } from "@playwright/test";

// Mock NextAuth session
async function mockAuthSession(page: Page) {
  const sessionToken = "mock-session-token-" + Date.now();

  // Set session cookie
  await page.context().addCookies([
    {
      name: "next-auth.session-token",
      value: sessionToken,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
      expires: Date.now() / 1000 + 30 * 24 * 60 * 60, // 30 days
    },
  ]);

  // Mock session API endpoint
  await page.route("**/api/auth/session", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        user: {
          id: "test-user-123",
          email: "test@example.com",
          name: "Test User",
        },
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }),
    });
  });
}

// Mock OAuth callback
async function mockOAuthCallback(page: Page) {
  await page.route("**/api/auth/signin/google", async (route) => {
    await route.fulfill({
      status: 302,
      headers: {
        Location: `/api/auth/callback/google?code=mock-auth-code`,
      },
    });
  });

  await page.route("**/api/auth/callback/google*", async (route) => {
    await mockAuthSession(page);
    await route.fulfill({
      status: 302,
      headers: {
        Location: "/dashboard",
      },
    });
  });
}

test("should complete OAuth flow", async ({ page }) => {
  await mockOAuthCallback(page);
  await page.goto("/signin");

  await page.getByRole("button", { name: /continue with google/i }).click();

  await expect(page).toHaveURL("/dashboard");
});
```

**Benefits of Mocking OAuth**:

- Tests run without real OAuth credentials
- Faster test execution
- Deterministic behavior
- No rate limiting from OAuth providers
- Works in CI/CD environments

#### Testing Protected Routes

Test that authentication middleware properly protects routes:

```typescript
test.describe("Protected Routes", () => {
  test("should redirect unauthenticated users", async ({ page }) => {
    // Clear any existing session
    await page.context().clearCookies();

    // Try to access protected route
    await page.goto("/dashboard");

    // Should redirect to sign-in with callback URL
    await expect(page).toHaveURL(/\/signin/);
    expect(page.url()).toContain("callbackUrl");
  });

  test("should allow authenticated users", async ({ page }) => {
    await mockAuthSession(page);

    await page.goto("/dashboard");

    // Should not redirect to sign-in
    await expect(page).toHaveURL("/dashboard");
  });

  test("should persist session across reloads", async ({ page }) => {
    await mockAuthSession(page);
    await page.goto("/dashboard");

    await page.reload();

    // Should still have access
    await expect(page).not.toHaveURL(/\/signin/);
  });

  test("should handle expired sessions", async ({ page }) => {
    // Set expired session
    await page.context().addCookies([
      {
        name: "next-auth.session-token",
        value: "expired",
        domain: "localhost",
        path: "/",
        expires: Date.now() / 1000 - 3600, // Expired
      },
    ]);

    await page.goto("/dashboard");

    // Should redirect to sign-in
    await expect(page).toHaveURL(/\/signin/);
  });
});
```

**Key Testing Patterns**:

- Test both authenticated and unauthenticated states
- Verify session persistence across page reloads
- Test session expiration handling
- Verify callback URL preservation
- Test protected API routes

### Performance

1. **Fast Feedback**:
   - Run unit tests frequently during development
   - Use watch mode for rapid iteration
   - Run E2E tests less frequently (CI/before commits)

2. **Parallel Execution**:
   - Tests run in parallel by default
   - Ensure tests are independent
   - Use appropriate worker count

3. **Selective Testing**:
   - Run related tests during development
   - Use test patterns to filter tests
   - Run full suite in CI

## Troubleshooting

### Common Issues

#### Tests Failing in CI but Passing Locally

- **Cause**: Environment differences, timing issues
- **Solution**:
  - Check CI logs carefully
  - Run tests in CI mode locally: `CI=true npm test`
  - Verify all dependencies are installed
  - Check for race conditions

#### Flaky E2E Tests

- **Cause**: Timing issues, network conditions, animations
- **Solution**:
  - Add proper waits (`waitForSelector`, `waitForLoadState`)
  - Disable animations in test environment
  - Use `toBeVisible()` instead of `toBeTruthy()`
  - Increase timeout for slow operations

#### Module Not Found Errors

- **Cause**: Path aliases not configured correctly
- **Solution**:
  - Verify `tsconfig.json` paths
  - Check Jest/Vitest `moduleNameMapper` configuration
  - Ensure imports use correct aliases (`@/`)

#### Coverage Not Meeting Threshold

- **Cause**: Uncovered code paths
- **Solution**:
  - View HTML coverage report to identify gaps
  - Add tests for uncovered branches
  - Review if thresholds are realistic
  - Exclude non-critical files if necessary

#### E2E Tests Not Finding Elements

- **Cause**: Timing issues, incorrect selectors, or elements not rendered
- **Solution**:
  - Use `waitForSelector()` before interacting with elements
  - Prefer accessible selectors: `getByRole()`, `getByLabel()`, `getByText()`
  - Check that the element is visible: `await expect(element).toBeVisible()`
  - Use Playwright Inspector to debug: `npm run test:e2e:debug`
  - Verify the element exists in the DOM with `page.locator().count()`

#### OAuth Mocking Not Working

- **Cause**: Routes not intercepted correctly or timing issues
- **Solution**:
  - Set up route mocking before navigating to the page
  - Use `page.route()` to intercept requests before they're made
  - Verify the route pattern matches: use `**/api/auth/**` for all auth routes
  - Check browser console for errors: `page.on('console', msg => console.log(msg))`
  - Ensure session cookies have correct domain (localhost for local testing)

#### Dev Server Not Starting for E2E Tests

- **Cause**: Port already in use or build errors
- **Solution**:
  - Check if port 3000 is already in use: `lsof -i :3000`
  - Kill existing process: `kill -9 <PID>`
  - Increase webServer timeout in `playwright.config.ts`
  - Check for build errors: `npm run build`
  - Set `reuseExistingServer: true` to use running dev server

### Getting Help

1. **Check Documentation**:
   - Jest: https://jestjs.io/docs
   - React Testing Library: https://testing-library.com/react
   - Playwright: https://playwright.dev/

2. **Team Resources**:
   - Ask in team Slack channel
   - Review existing tests for examples
   - Pair with QA team members

3. **Debugging**:
   - Use `screen.debug()` in React tests
   - Use Playwright inspector: `npm run test:e2e:debug`
   - Add console logs (remove before committing)
   - Use VS Code debugger with breakpoints

## Continuous Improvement

### Monitoring Test Health

- Review test execution times regularly
- Identify and fix flaky tests immediately
- Refactor duplicate test code
- Update tests when requirements change

### Test Metrics

Track these metrics over time:

- Test coverage percentage
- Test execution time
- Flaky test rate
- Number of tests per module
- CI/CD pipeline duration

### Regular Reviews

- Monthly test suite review
- Identify obsolete tests
- Refactor complex tests
- Update documentation
- Share learnings with team

---

## Quick Reference

### Essential Commands

```bash
# Development
npm run dev                 # Start dev server
npm run test:watch          # Run tests in watch mode

# Before Committing
npm run lint               # Check linting
npm run type-check         # Check types
npm test                   # Run unit tests

# CI/CD
npm run test:all           # Run all tests
npm run build              # Build production

# E2E Testing
npm run test:e2e:ui        # Interactive E2E testing
npm run test:e2e:headed    # See browser during tests
```

### File Structure

```
project/
├── __tests__/              # Test utilities and setup
│   ├── setup.ts           # Global test setup
│   ├── auth.test.ts       # Unit tests for auth
│   ├── e2e/               # E2E tests (comprehensive)
│   │   ├── auth.spec.ts   # Auth flow E2E tests
│   │   └── profile.spec.ts # Profile E2E tests
│   └── utils/             # Test helpers
│       ├── test-utils.tsx # React Testing Library helpers
│       └── mock-data.ts   # Mock data generators
├── e2e/                   # Legacy E2E tests
│   ├── auth.spec.ts       # Basic auth tests
│   └── landing-page.spec.ts # Landing page tests
├── app/                   # Next.js app directory
│   └── **/*.test.tsx      # Component tests
├── lib/                   # Utilities
│   └── **/*.test.ts       # Utility tests
├── jest.config.js         # Jest configuration
├── vitest.config.ts       # Vitest configuration
├── playwright.config.ts   # Playwright configuration
└── TESTING.md            # This file
```

**Note**: The Playwright config is set to look for tests in both `__tests__/e2e/` and `e2e/` directories. New E2E tests should be placed in `__tests__/e2e/` for better organization.

---

**Last Updated**: 2024-11-12
**Version**: 1.0.0
**Maintained By**: QA Team
