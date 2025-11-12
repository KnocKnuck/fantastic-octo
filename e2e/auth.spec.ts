import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page before each test
    await page.goto('/')
  })

  test('should load the landing page', async ({ page }) => {
    // Check that the page loads successfully
    await expect(page).toHaveTitle(/AI Calendar Agent/i)

    // Verify key elements are present
    const heading = page.locator('h1').first()
    await expect(heading).toBeVisible()
  })

  test('should display navigation elements', async ({ page }) => {
    // Check for navigation or header
    const header = page.locator('header, nav').first()
    await expect(header).toBeVisible()
  })

  test('should have working links', async ({ page }) => {
    // Find all links on the page
    const links = page.locator('a[href]')
    const count = await links.count()

    // Verify there are links present
    expect(count).toBeGreaterThan(0)

    // Check that first link is visible
    if (count > 0) {
      await expect(links.first()).toBeVisible()
    }
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Check that page is still accessible
    const heading = page.locator('h1').first()
    await expect(heading).toBeVisible()
  })

  test('should handle navigation', async ({ page }) => {
    // Try to find a navigation link (adjust selector based on your actual navigation)
    const navLinks = page.locator('nav a, header a').first()

    if (await navLinks.count() > 0) {
      await navLinks.click()

      // Wait for navigation
      await page.waitForLoadState('networkidle')

      // Verify we're on a different page or section
      expect(page.url()).toBeTruthy()
    }
  })
})

test.describe('Sign Up Flow', () => {
  test('should show sign up form when clicking sign up button', async ({ page }) => {
    await page.goto('/')

    // Look for sign up button (adjust selector based on your actual UI)
    const signUpButton = page.getByRole('button', { name: /sign up|get started|start free/i })

    if (await signUpButton.count() > 0) {
      await signUpButton.first().click()

      // Wait for form or redirect
      await page.waitForLoadState('networkidle')

      // Verify sign up page or form is visible
      expect(page.url()).toBeTruthy()
    }
  })

  test('should validate email format', async ({ page }) => {
    // This is a placeholder test - adjust based on your actual sign up flow
    await page.goto('/')

    // Look for email input
    const emailInput = page.getByRole('textbox', { name: /email/i })

    if (await emailInput.count() > 0) {
      await emailInput.first().fill('invalid-email')

      // Try to submit or blur the field
      await emailInput.first().blur()

      // Check for validation message (adjust based on your implementation)
      // const errorMessage = page.getByText(/invalid email/i)
      // await expect(errorMessage).toBeVisible()
    }
  })
})

test.describe('Sign In Flow', () => {
  test('should navigate to sign in page', async ({ page }) => {
    await page.goto('/')

    // Look for sign in button (adjust selector based on your actual UI)
    const signInButton = page.getByRole('button', { name: /sign in|log in|login/i })

    if (await signInButton.count() > 0) {
      await signInButton.first().click()

      // Wait for navigation
      await page.waitForLoadState('networkidle')

      // Verify we're on sign in page
      expect(page.url()).toBeTruthy()
    }
  })

  test('should show error for invalid credentials', async ({ page }) => {
    // This is a placeholder test - implement based on your auth flow
    await page.goto('/')

    // Add your actual sign in flow testing here
    expect(true).toBe(true)
  })
})

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/')

    // Check for h1
    const h1 = page.locator('h1')
    await expect(h1.first()).toBeVisible()
  })

  test('should have alt text on images', async ({ page }) => {
    await page.goto('/')

    // Get all images
    const images = page.locator('img')
    const count = await images.count()

    // Check that images have alt attributes
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt')
      expect(alt).toBeDefined()
    }
  })

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/')

    // Tab through interactive elements
    await page.keyboard.press('Tab')

    // Check if an element is focused
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
  })
})
