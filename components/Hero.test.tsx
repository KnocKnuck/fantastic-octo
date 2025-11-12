import { render, screen, setupUser } from '@/__tests__/utils/test-utils'
import Hero from './Hero'

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
}))

describe('Hero Component', () => {
  beforeEach(() => {
    // Mock scrollIntoView
    Element.prototype.scrollIntoView = jest.fn()
  })

  it('should render the hero section', () => {
    render(<Hero />)

    // Check for main heading
    expect(screen.getByText(/Plan your day without thinking/i)).toBeInTheDocument()
  })

  it('should display the beta badge', () => {
    render(<Hero />)

    expect(screen.getByText(/Now in Private Beta/i)).toBeInTheDocument()
  })

  it('should display the hero description', () => {
    render(<Hero />)

    const description = screen.getByText(/Connect your Google or Outlook calendar/i)
    expect(description).toBeInTheDocument()
  })

  it('should render call-to-action buttons', () => {
    render(<Hero />)

    expect(screen.getByText('Try for free')).toBeInTheDocument()
    expect(screen.getByText('Join the private beta')).toBeInTheDocument()
  })

  it('should display benefits below CTAs', () => {
    render(<Hero />)

    expect(screen.getByText(/No credit card required/i)).toBeInTheDocument()
    expect(screen.getByText(/Free for 3 months/i)).toBeInTheDocument()
  })

  it('should render calendar mockup section', () => {
    render(<Hero />)

    expect(screen.getByText(/Today's Schedule/i)).toBeInTheDocument()
  })

  it('should display sample calendar items', () => {
    render(<Hero />)

    expect(screen.getByText(/Review project proposals/i)).toBeInTheDocument()
    expect(screen.getByText(/Team standup meeting/i)).toBeInTheDocument()
    expect(screen.getByText(/Lunch break/i)).toBeInTheDocument()
    expect(screen.getByText(/Deep work: Feature development/i)).toBeInTheDocument()
    expect(screen.getByText(/Client presentation/i)).toBeInTheDocument()
  })

  it('should display time for each calendar item', () => {
    render(<Hero />)

    expect(screen.getByText('09:00')).toBeInTheDocument()
    expect(screen.getByText('10:30')).toBeInTheDocument()
    expect(screen.getByText('12:00')).toBeInTheDocument()
    expect(screen.getByText('14:00')).toBeInTheDocument()
    expect(screen.getByText('16:00')).toBeInTheDocument()
  })

  describe('Button interactions', () => {
    it('should scroll to CTA section when "Try for free" is clicked', async () => {
      // Create a mock CTA section
      const mockCtaSection = document.createElement('div')
      mockCtaSection.id = 'cta'
      document.body.appendChild(mockCtaSection)

      render(<Hero />)
      const user = setupUser()

      const tryFreeButton = screen.getByText('Try for free')
      await user.click(tryFreeButton)

      expect(mockCtaSection.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
      })

      // Cleanup
      document.body.removeChild(mockCtaSection)
    })

    it('should scroll to CTA section when "Join the private beta" is clicked', async () => {
      // Create a mock CTA section
      const mockCtaSection = document.createElement('div')
      mockCtaSection.id = 'cta'
      document.body.appendChild(mockCtaSection)

      render(<Hero />)
      const user = setupUser()

      const joinBetaButton = screen.getByText('Join the private beta')
      await user.click(joinBetaButton)

      expect(mockCtaSection.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
      })

      // Cleanup
      document.body.removeChild(mockCtaSection)
    })

    it('should handle missing CTA section gracefully', async () => {
      render(<Hero />)
      const user = setupUser()

      const tryFreeButton = screen.getByText('Try for free')

      // Should not throw error when CTA section doesn't exist
      await expect(user.click(tryFreeButton)).resolves.not.toThrow()
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<Hero />)

      const mainHeading = screen.getByText(/Plan your day without thinking/i)
      expect(mainHeading.tagName).toBe('H1')
    })

    it('should render buttons with proper roles', () => {
      render(<Hero />)

      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(2)
    })
  })

  describe('Responsive Design', () => {
    it('should apply responsive classes', () => {
      render(<Hero />)

      const mainHeading = screen.getByText(/Plan your day without thinking/i)
      expect(mainHeading).toHaveClass('text-4xl', 'md:text-5xl', 'lg:text-6xl')
    })
  })
})
