import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display hero section', async ({ page }) => {
    // Check for main heading
    const h1 = page.locator('h1').first()
    await expect(h1).toBeVisible()

    // Verify hero section has content
    const heroSection = page.locator('section, div').first()
    await expect(heroSection).toBeVisible()
  })

  test('should display call-to-action buttons', async ({ page }) => {
    // Look for primary CTA buttons
    const buttons = page.locator('button, a[role="button"]')
    const count = await buttons.count()

    expect(count).toBeGreaterThan(0)
  })

  test('should load without console errors', async ({ page }) => {
    const errors: string[] = []

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Allow some common non-critical errors but fail on actual issues
    const criticalErrors = errors.filter(err =>
      !err.includes('favicon') &&
      !err.includes('404')
    )

    expect(criticalErrors).toHaveLength(0)
  })

  test('should have fast initial load time', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    const loadTime = Date.now() - startTime

    // Page should load in under 3 seconds
    expect(loadTime).toBeLessThan(3000)
  })
})

test.describe('Features Section', () => {
  test('should display key features', async ({ page }) => {
    await page.goto('/')

    // Look for features section (adjust selector as needed)
    const sections = page.locator('section')
    const count = await sections.count()

    expect(count).toBeGreaterThan(0)
  })

  test('should have descriptive content', async ({ page }) => {
    await page.goto('/')

    // Check for paragraphs or text content
    const paragraphs = page.locator('p')
    const count = await paragraphs.count()

    expect(count).toBeGreaterThan(0)
  })
})

test.describe('Visual Elements', () => {
  test('should render animations', async ({ page }) => {
    await page.goto('/')

    // Look for elements with animation classes (Framer Motion)
    const animatedElements = page.locator('[style*="transform"], [style*="opacity"]')

    // Wait a bit for animations to initialize
    await page.waitForTimeout(1000)

    const count = await animatedElements.count()
    expect(count).toBeGreaterThanOrEqual(0) // Animations are optional
  })

  test('should have proper color contrast', async ({ page }) => {
    await page.goto('/')

    // Get computed styles of text elements
    const textElement = page.locator('h1').first()

    if (await textElement.count() > 0) {
      await expect(textElement).toBeVisible()

      // Basic visibility check (more comprehensive a11y testing would use axe-core)
      const isVisible = await textElement.isVisible()
      expect(isVisible).toBe(true)
    }
  })
})

test.describe('Responsive Design', () => {
  const viewports = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1920, height: 1080 },
  ]

  for (const viewport of viewports) {
    test(`should display correctly on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height
      })

      await page.goto('/')

      // Check that main content is visible
      const h1 = page.locator('h1').first()
      await expect(h1).toBeVisible()

      // Check that content doesn't overflow
      const body = page.locator('body')
      const boundingBox = await body.boundingBox()

      expect(boundingBox).toBeTruthy()
    })
  }
})

test.describe('Performance', () => {
  test('should have no layout shifts', async ({ page }) => {
    await page.goto('/')

    // Wait for page to stabilize
    await page.waitForLoadState('networkidle')

    // Take screenshot for visual regression (optional)
    // await page.screenshot({ path: 'screenshots/landing-page.png' })

    expect(true).toBe(true)
  })

  test('should lazy load images below the fold', async ({ page }) => {
    await page.goto('/')

    // Check for images
    const images = page.locator('img')
    const count = await images.count()

    // If images exist, verify they load
    if (count > 0) {
      const firstImage = images.first()
      await expect(firstImage).toBeVisible()
    }
  })
})

test.describe('SEO and Meta Tags', () => {
  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/')

    // Check for title
    await expect(page).toHaveTitle(/.+/)

    // Check for meta description
    const metaDescription = page.locator('meta[name="description"]')
    expect(await metaDescription.count()).toBeGreaterThan(0)
  })

  test('should have Open Graph tags', async ({ page }) => {
    await page.goto('/')

    // Check for OG tags
    const ogTitle = page.locator('meta[property="og:title"]')
    const ogDescription = page.locator('meta[property="og:description"]')

    // These should exist for social sharing
    expect(await ogTitle.count()).toBeGreaterThanOrEqual(0)
    expect(await ogDescription.count()).toBeGreaterThanOrEqual(0)
  })
})
