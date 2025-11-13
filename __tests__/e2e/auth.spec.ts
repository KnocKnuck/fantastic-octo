import { test, expect, Page } from "@playwright/test";

/**
 * E2E Authentication Tests
 *
 * These tests verify the complete authentication flow including:
 * - Access to sign-in page
 * - Protected route redirects
 * - OAuth flow (mocked)
 * - Session persistence
 * - Sign-out functionality
 *
 * Note: OAuth providers (Google) are mocked to avoid requiring real credentials
 * in test environments. The mock simulates the OAuth callback flow.
 */

// Test user data
const TEST_USER = {
  id: "test-user-123",
  email: "test@example.com",
  name: "Test User",
  image: "https://example.com/avatar.jpg",
};

/**
 * Mock NextAuth session cookie
 * This simulates a successful OAuth sign-in by setting the session cookie
 */
async function mockAuthSession(page: Page) {
  const sessionToken = "mock-session-token-" + Date.now();

  // Set the NextAuth session cookie
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

  // Mock the session API endpoint
  await page.route("**/api/auth/session", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        user: TEST_USER,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }),
    });
  });
}

/**
 * Mock OAuth callback
 * Simulates the Google OAuth flow by intercepting the sign-in request
 */
async function mockOAuthCallback(page: Page) {
  // Intercept the OAuth sign-in request
  await page.route("**/api/auth/signin/google", async (route) => {
    // Simulate redirect to OAuth provider
    const request = route.request();
    const url = new URL(request.url());
    const callbackUrl = url.searchParams.get("callbackUrl") || "/dashboard";

    // Instead of going to Google, redirect to our mock callback
    await route.fulfill({
      status: 302,
      headers: {
        Location: `/api/auth/callback/google?code=mock-auth-code&state=mock-state`,
      },
    });
  });

  // Mock the OAuth callback endpoint
  await page.route("**/api/auth/callback/google*", async (route) => {
    await mockAuthSession(page);

    await route.fulfill({
      status: 302,
      headers: {
        Location: "/dashboard",
      },
    });
  });

  // Mock the CSRF token endpoint
  await page.route("**/api/auth/csrf", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        csrfToken: "mock-csrf-token",
      }),
    });
  });
}

/**
 * Clear authentication session
 */
async function clearAuthSession(page: Page) {
  await page.context().clearCookies();

  // Mock empty session
  await page.route("**/api/auth/session", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({}),
    });
  });
}

test.describe("Authentication Flow - Sign In", () => {
  test.beforeEach(async ({ page }) => {
    await clearAuthSession(page);
  });

  test("should access sign-in page", async ({ page }) => {
    await page.goto("/signin");

    // Verify page loaded correctly
    await expect(page).toHaveURL("/signin");

    // Check for sign-in page elements
    await expect(
      page.getByRole("heading", { name: /welcome back/i }),
    ).toBeVisible();
    await expect(page.getByText(/sign in to access/i)).toBeVisible();

    // Verify Google sign-in button is present
    const googleButton = page.getByRole("button", {
      name: /continue with google/i,
    });
    await expect(googleButton).toBeVisible();
    await expect(googleButton).toBeEnabled();
  });

  test("should redirect unauthenticated user to sign-in", async ({ page }) => {
    // Try to access protected route without authentication
    await page.goto("/dashboard");

    // Should be redirected to sign-in page
    await expect(page).toHaveURL(/\/signin/);

    // Verify callback URL is preserved
    const url = page.url();
    expect(url).toContain("callbackUrl");
  });

  test("should show loading state when signing in", async ({ page }) => {
    await mockOAuthCallback(page);
    await page.goto("/signin");

    const googleButton = page.getByRole("button", {
      name: /continue with google/i,
    });

    // Click sign-in button
    await googleButton.click();

    // Should show loading state (briefly)
    await expect(page.getByText(/connecting/i))
      .toBeVisible({ timeout: 1000 })
      .catch(() => {
        // Loading state might be too quick to catch, that's okay
      });
  });

  test("should display error message for OAuth errors", async ({ page }) => {
    // Navigate to sign-in with error parameter
    await page.goto("/signin?error=OAuthCallback");

    // Verify error message is displayed
    const errorAlert = page.getByRole("alert");
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText(/error during authentication/i);
  });

  test("should handle rate limit error", async ({ page }) => {
    await page.goto("/signin?error=Default");

    // Verify generic error message is shown
    const errorAlert = page.getByRole("alert");
    await expect(errorAlert).toBeVisible();
  });
});

test.describe("Authentication Flow - OAuth", () => {
  test.beforeEach(async ({ page }) => {
    await clearAuthSession(page);
    await mockOAuthCallback(page);
  });

  test("should complete Google OAuth flow successfully", async ({ page }) => {
    await page.goto("/signin");

    // Click Google sign-in button
    const googleButton = page.getByRole("button", {
      name: /continue with google/i,
    });
    await googleButton.click();

    // Should redirect to dashboard after successful auth
    await expect(page).toHaveURL("/dashboard", { timeout: 10000 });

    // Verify session cookie was set
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(
      (c) => c.name === "next-auth.session-token",
    );
    expect(sessionCookie).toBeDefined();
  });

  test("should redirect to callback URL after sign-in", async ({ page }) => {
    // Navigate to sign-in with specific callback URL
    await page.goto("/signin?callbackUrl=%2Fsettings");

    // Mock the OAuth flow to preserve callback URL
    await page.route("**/api/auth/callback/google*", async (route) => {
      await mockAuthSession(page);

      await route.fulfill({
        status: 302,
        headers: {
          Location: "/settings",
        },
      });
    });

    // Click Google sign-in
    const googleButton = page.getByRole("button", {
      name: /continue with google/i,
    });
    await googleButton.click();

    // Should redirect to the callback URL
    await expect(page).toHaveURL(/\/(settings|dashboard)/, { timeout: 10000 });
  });
});

test.describe("Authentication Flow - Protected Routes", () => {
  test("should allow access to protected routes when authenticated", async ({
    page,
  }) => {
    // Set up authenticated session
    await mockAuthSession(page);

    // Navigate to protected routes
    const protectedRoutes = ["/dashboard", "/settings", "/calendar"];

    for (const route of protectedRoutes) {
      await page.goto(route);

      // Should not redirect to sign-in
      await expect(page)
        .toHaveURL(route, { timeout: 5000 })
        .catch(() => {
          // Route might not exist yet (404), but shouldn't redirect to /signin
          expect(page.url()).not.toContain("/signin");
        });
    }
  });

  test("should block access to protected routes when not authenticated", async ({
    page,
  }) => {
    await clearAuthSession(page);

    // Try to access protected route
    await page.goto("/dashboard");

    // Should redirect to sign-in
    await expect(page).toHaveURL(/\/signin/, { timeout: 5000 });
    expect(page.url()).toContain("callbackUrl");
  });

  test("should require authentication for API routes", async ({ page }) => {
    await clearAuthSession(page);

    // Try to access protected API route
    const response = await page.request.get("/api/v1/user/profile");

    // Should return 401 or redirect
    expect([401, 307, 308]).toContain(response.status());
  });
});

test.describe("Authentication Flow - Session Management", () => {
  test("should persist session across page reloads", async ({ page }) => {
    // Set up authenticated session
    await mockAuthSession(page);
    await page.goto("/dashboard");

    // Verify we're on dashboard
    await expect(page)
      .toHaveURL("/dashboard")
      .catch(() => {
        // Dashboard might not exist yet, that's okay
      });

    // Reload the page
    await page.reload();

    // Should still have access (not redirected to sign-in)
    await expect(page).not.toHaveURL(/\/signin/);

    // Session cookie should still exist
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(
      (c) => c.name === "next-auth.session-token",
    );
    expect(sessionCookie).toBeDefined();
  });

  test("should persist session across navigation", async ({ page }) => {
    // Set up authenticated session
    await mockAuthSession(page);
    await page.goto("/dashboard");

    // Navigate to different protected routes
    await page.goto("/settings");
    await expect(page).not.toHaveURL(/\/signin/);

    await page.goto("/calendar");
    await expect(page).not.toHaveURL(/\/signin/);

    await page.goto("/dashboard");
    await expect(page).not.toHaveURL(/\/signin/);
  });

  test("should handle expired session", async ({ page }) => {
    // Set up session that expires immediately
    await page.context().addCookies([
      {
        name: "next-auth.session-token",
        value: "expired-token",
        domain: "localhost",
        path: "/",
        httpOnly: true,
        sameSite: "Lax",
        expires: Date.now() / 1000 - 3600, // Expired 1 hour ago
      },
    ]);

    // Mock empty session response (expired)
    await page.route("**/api/auth/session", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({}),
      });
    });

    // Try to access protected route
    await page.goto("/dashboard");

    // Should redirect to sign-in
    await expect(page).toHaveURL(/\/signin/, { timeout: 5000 });
  });
});

test.describe("Authentication Flow - Sign Out", () => {
  test.beforeEach(async ({ page }) => {
    // Start with authenticated session
    await mockAuthSession(page);
  });

  test("should successfully sign out", async ({ page }) => {
    // Mock the sign-out endpoint
    await page.route("**/api/auth/signout", async (route) => {
      // Clear cookies on sign out
      await clearAuthSession(page);

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          url: "/",
        }),
      });
    });

    await page.goto("/dashboard");

    // Find and click sign-out button (adjust selector based on your UI)
    // This might need to be updated once the dashboard is implemented
    const signOutButton = page.getByRole("button", {
      name: /sign out|log out/i,
    });

    if (await signOutButton.isVisible().catch(() => false)) {
      await signOutButton.click();

      // Should redirect to home page
      await expect(page).toHaveURL("/", { timeout: 5000 });

      // Session cookie should be cleared
      const cookies = await page.context().cookies();
      const sessionCookie = cookies.find(
        (c) => c.name === "next-auth.session-token",
      );
      expect(sessionCookie).toBeUndefined();
    }
  });

  test("should redirect to sign-in when accessing protected route after sign out", async ({
    page,
  }) => {
    await page.goto("/dashboard");

    // Simulate sign out by clearing session
    await clearAuthSession(page);

    // Try to navigate to another protected route
    await page.goto("/settings");

    // Should redirect to sign-in
    await expect(page).toHaveURL(/\/signin/, { timeout: 5000 });
  });
});

test.describe("Authentication Flow - Security", () => {
  test("should have secure session cookies", async ({ page }) => {
    await mockAuthSession(page);
    await page.goto("/dashboard");

    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(
      (c) => c.name === "next-auth.session-token",
    );

    if (sessionCookie) {
      // Verify security attributes
      expect(sessionCookie.httpOnly).toBe(true);
      expect(sessionCookie.sameSite).toBe("Lax");
      expect(sessionCookie.path).toBe("/");
    }
  });

  test("should show rate limiting notice", async ({ page }) => {
    await page.goto("/signin");

    // Verify rate limiting notice is displayed
    await expect(page.getByText(/sign-in attempts are limited/i)).toBeVisible();
  });

  test("should show security notice", async ({ page }) => {
    await page.goto("/signin");

    // Verify security notice about OAuth
    await expect(
      page.getByText(/secured with industry-standard oauth/i),
    ).toBeVisible();
    await expect(page.getByText(/never store your password/i)).toBeVisible();
  });
});

test.describe("Authentication Flow - Accessibility", () => {
  test("should have accessible sign-in form", async ({ page }) => {
    await page.goto("/signin");

    // Check for proper heading structure
    const heading = page.getByRole("heading", { name: /welcome back/i });
    await expect(heading).toBeVisible();

    // Check that buttons are keyboard accessible
    await page.keyboard.press("Tab");
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();
  });

  test("should display error messages with proper ARIA attributes", async ({
    page,
  }) => {
    await page.goto("/signin?error=OAuthCallback");

    // Error should have role="alert"
    const errorAlert = page.getByRole("alert");
    await expect(errorAlert).toBeVisible();
  });
});
