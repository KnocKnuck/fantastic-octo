import React, { ReactElement } from 'react'
import { render, RenderOptions, RenderResult } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

/**
 * Custom render function that wraps components with common providers
 * Add your app providers here (ThemeProvider, AuthProvider, etc.)
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  // Add any custom options here
}

export function renderWithProviders(
  ui: ReactElement,
  options?: CustomRenderOptions
): RenderResult {
  function Wrapper({ children }: { children: React.ReactNode }) {
    // Add your providers here
    // Example:
    // return (
    //   <ThemeProvider>
    //     <AuthProvider>
    //       {children}
    //     </AuthProvider>
    //   </ThemeProvider>
    // )
    return <>{children}</>
  }

  return render(ui, { wrapper: Wrapper, ...options })
}

/**
 * Setup user event for user interactions
 * This provides a more realistic way to simulate user interactions
 */
export function setupUser() {
  return userEvent.setup()
}

/**
 * Helper to wait for an element to be removed
 */
export { waitForElementToBeRemoved } from '@testing-library/react'

/**
 * Helper to create mock props for components
 */
export function createMockProps<T extends Record<string, any>>(
  overrides?: Partial<T>
): T {
  return { ...overrides } as T
}

/**
 * Helper to get by test id
 */
export function getByTestId(container: HTMLElement, id: string): HTMLElement {
  const element = container.querySelector(`[data-testid="${id}"]`)
  if (!element) {
    throw new Error(`Unable to find element with data-testid="${id}"`)
  }
  return element as HTMLElement
}

/**
 * Helper to query by test id (returns null if not found)
 */
export function queryByTestId(
  container: HTMLElement,
  id: string
): HTMLElement | null {
  return container.querySelector(`[data-testid="${id}"]`)
}

/**
 * Helper to get all by test id
 */
export function getAllByTestId(container: HTMLElement, id: string): HTMLElement[] {
  return Array.from(container.querySelectorAll(`[data-testid="${id}"]`))
}

/**
 * Mock Next.js router push function
 */
export function mockRouterPush() {
  const push = jest.fn()
  jest.mock('next/navigation', () => ({
    useRouter: () => ({
      push,
      replace: jest.fn(),
      prefetch: jest.fn(),
    }),
  }))
  return push
}

/**
 * Mock fetch responses
 */
export function mockFetch(response: any, status = 200) {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: async () => response,
      text: async () => JSON.stringify(response),
      headers: new Headers(),
    } as Response)
  )
}

/**
 * Clear all mocks between tests
 */
export function clearAllMocks() {
  jest.clearAllMocks()
}

// Re-export everything from React Testing Library
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
