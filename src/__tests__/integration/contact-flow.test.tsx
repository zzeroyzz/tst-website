// src/__tests__/integration/contact-flow.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ContactPageClient from '@/components/Contact/ContactPageClient'
import { mockApiResponse, mockApiError } from '@/__tests__/test-utils'

// Mock dependencies
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }) => children,
  useInView: () => true,
}))

global.fetch = jest.fn()

describe('Contact Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('completes full contact submission flow', async () => {
    const user = userEvent.setup()

    // Mock successful API response
    ;(global.fetch as jest.Mock).mockResolvedValue(
      mockApiResponse({ message: 'Successfully submitted!', emailSent: true })
    )

    render(<ContactPageClient />)

    // Verify initial page state
    expect(screen.getByText('A Space to Be Seen and Heard')).toBeInTheDocument()
    expect(screen.getByText('Reach out to start therapy.')).toBeInTheDocument()

    // Fill out the contact form
    const nameInput = screen.getByPlaceholderText('Your name')
    const emailInput = screen.getByPlaceholderText('Your email')
    const phoneInput = screen.getByPlaceholderText('Phone number')
    const submitButton = screen.getByRole('button', { name: /submit/i })

    await user.type(nameInput, 'Jane Smith')
    await user.type(emailInput, 'jane.smith@example.com')
    await user.type(phoneInput, '555-0199')

    // Submit the form
    await user.click(submitButton)

    // Verify API call
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          phone: '555-0199',
        }),
      })
    })

    // Verify success state
    await waitFor(() => {
      expect(screen.getByText('Thank You!')).toBeInTheDocument()
      expect(screen.getByText(/Here's what to expect next:/)).toBeInTheDocument()
      expect(screen.getByText(/You'll receive a personal email from me/)).toBeInTheDocument()
    })

    // Verify FAQ section appears (since isContactPage is false by default)
    expect(screen.getByText('Answers to common questions')).toBeInTheDocument()
  })

  it('handles API errors gracefully', async () => {
    const user = userEvent.setup()

    // Mock API error
    ;(global.fetch as jest.Mock).mockResolvedValue(
      mockApiError('Server temporarily unavailable', 503)
    )

    render(<ContactPageClient />)

    // Fill and submit form
    await user.type(screen.getByPlaceholderText('Your name'), 'Jane Smith')
    await user.type(screen.getByPlaceholderText('Your email'), 'jane@example.com')
    await user.type(screen.getByPlaceholderText('Phone number'), '555-0199')
    await user.click(screen.getByRole('button', { name: /submit/i }))

    // Verify error handling
    await waitFor(() => {
      expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument()
    })

    // Form should still be visible for retry
    expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument()
  })

  it('shows loading states during submission', async () => {
    const user = userEvent.setup()

    // Mock slow API response
    let resolvePromise: (value: any) => void
    ;(global.fetch as jest.Mock).mockImplementation(
      () => new Promise(resolve => {
        resolvePromise = resolve
        setTimeout(() => resolve(mockApiResponse({ message: 'Success' })), 2000)
      })
    )

    render(<ContactPageClient />)

    // Fill and submit form
    await user.type(screen.getByPlaceholderText('Your name'), 'Jane Smith')
    await user.type(screen.getByPlaceholderText('Your email'), 'jane@example.com')
    await user.type(screen.getByPlaceholderText('Phone number'), '555-0199')
    await user.click(screen.getByRole('button', { name: /submit/i }))

    // Verify loading state
    expect(screen.getByText('Submitting...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submitting/i })).toBeDisabled()

    // Resolve the promise
    resolvePromise!(mockApiResponse({ message: 'Success' }))

    // Verify final state
    await waitFor(() => {
      expect(screen.getByText('Thank You!')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(<ContactPageClient />)

    // Try to submit empty form
    const submitButton = screen.getByRole('button', { name: /submit/i })
    await user.click(submitButton)

    // HTML5 validation should prevent submission
    expect(global.fetch).not.toHaveBeenCalled()

    // Fill partial form
    await user.type(screen.getByPlaceholderText('Your name'), 'Jane')
    await user.click(submitButton)

    // Still shouldn't submit
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('handles network failures', async () => {
    const user = userEvent.setup()

    // Mock network failure
    ;(global.fetch as jest.Mock).mockRejectedValue(
      new Error('Failed to fetch')
    )

    render(<ContactPageClient />)

    // Fill and submit form
    await user.type(screen.getByPlaceholderText('Your name'), 'Jane Smith')
    await user.type(screen.getByPlaceholderText('Your email'), 'jane@example.com')
    await user.type(screen.getByPlaceholderText('Phone number'), '555-0199')
    await user.click(screen.getByRole('button', { name: /submit/i }))

    // Should show generic error message
    await waitFor(() => {
      expect(screen.getByText('An unexpected error occurred.')).toBeInTheDocument()
    })
  })

  it('displays trust indicators correctly', () => {
    render(<ContactPageClient />)

    // Check for trust indicators
    expect(screen.getByText('Phone and Video')).toBeInTheDocument()
    expect(screen.getByText('No waitlist')).toBeInTheDocument()
    expect(screen.getByText('11 A.M. to 5 P.M.')).toBeInTheDocument()
  })

  it('shows benefit cards with correct content', () => {
    render(<ContactPageClient />)

    // Check for benefit cards
    expect(screen.getByText('Start Where You Are, Not Where You Think You Should Be')).toBeInTheDocument()
    expect(screen.getByText('A Space Free of Judgment')).toBeInTheDocument()
    expect(screen.getByText('One Conversation, Zero Commitment')).toBeInTheDocument()
  })
})
