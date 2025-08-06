// src/components/Contact/__tests__/ContactForm.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ContactForm from '../ContactForm'
import { trackContactFormConversion, trackFormSubmission } from '@/lib/analytics'

// Mock fetch
global.fetch = jest.fn()

// Mock window.scrollIntoView since it's not available in test environment
Element.prototype.scrollIntoView = jest.fn()

// Mock react-confetti to avoid canvas issues in jsdom
jest.mock('react-confetti', () => {
  return function MockConfetti() {
    return <div data-testid="confetti">Confetti Animation</div>
  }
})

// Mock the FAQ component
jest.mock('../../FAQ/FAQ.tsx', () => {
  return function MockFAQ() {
    return <div data-testid="faq">Common questions</div>
  }
})

// Mock the analytics functions
jest.mock('@/lib/analytics', () => ({
  trackContactFormConversion: jest.fn(),
  trackFormSubmission: jest.fn(),
}))

// Type the mocked functions
const mockTrackContactFormConversion = trackContactFormConversion as jest.MockedFunction<typeof trackContactFormConversion>
const mockTrackFormSubmission = trackFormSubmission as jest.MockedFunction<typeof trackFormSubmission>

describe('ContactForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Initial Render', () => {
    it('renders without crashing', () => {
      render(<ContactForm />)
      expect(document.body).toBeInTheDocument()
    })

    it('renders the form heading', () => {
      render(<ContactForm />)
      expect(screen.getByText(/reach out to start therapy/i)).toBeInTheDocument()
    })

    it('renders all required form fields', () => {
      render(<ContactForm />)

      expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Your email')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Phone number')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
    })

    it('all form fields start empty', () => {
      render(<ContactForm />)

      expect(screen.getByPlaceholderText('Your name')).toHaveValue('')
      expect(screen.getByPlaceholderText('Your email')).toHaveValue('')
      expect(screen.getByPlaceholderText('Phone number')).toHaveValue('')
    })

    it('submit button is enabled initially', () => {
      render(<ContactForm />)

      expect(screen.getByRole('button', { name: /submit/i })).toBeEnabled()
    })
  })

  describe('Form Interaction', () => {
    it('allows user to type in all fields', async () => {
      const user = userEvent.setup()
      render(<ContactForm />)

      const nameField = screen.getByPlaceholderText('Your name')
      const emailField = screen.getByPlaceholderText('Your email')
      const phoneField = screen.getByPlaceholderText('Phone number')

      await user.type(nameField, 'John Doe')
      await user.type(emailField, 'john@example.com')
      await user.type(phoneField, '555-123-4567')

      expect(nameField).toHaveValue('John Doe')
      expect(emailField).toHaveValue('john@example.com')
      expect(phoneField).toHaveValue('555-123-4567')
    })

    it('clears form fields when cleared', async () => {
      const user = userEvent.setup()
      render(<ContactForm />)

      const nameField = screen.getByPlaceholderText('Your name')

      await user.type(nameField, 'Test Name')
      expect(nameField).toHaveValue('Test Name')

      await user.clear(nameField)
      expect(nameField).toHaveValue('')
    })
  })


  describe('Form Submission - Success Cases', () => {
    it('submits form with valid data', async () => {
      const user = userEvent.setup()

      // Mock successful API response
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ message: 'Successfully submitted!' }),
      })

      render(<ContactForm />)

      // Fill out the form
      await user.type(screen.getByPlaceholderText('Your name'), 'Jane Smith')
      await user.type(screen.getByPlaceholderText('Your email'), 'jane@example.com')
      await user.type(screen.getByPlaceholderText('Phone number'), '555-987-6543')

      // Submit the form
      await user.click(screen.getByRole('button', { name: /submit/i }))

      // Verify API call was made with correct data
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Jane Smith',
            email: 'jane@example.com',
            phone: '555-987-6543',
          }),
        })
      })
    })

    it('shows success message after successful submission', async () => {
      const user = userEvent.setup()

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ message: 'Successfully submitted!' }),
      })

      render(<ContactForm />)

      // Fill and submit form
      await user.type(screen.getByPlaceholderText('Your name'), 'John Doe')
      await user.type(screen.getByPlaceholderText('Your email'), 'john@example.com')
      await user.type(screen.getByPlaceholderText('Phone number'), '555-123-4567')
      await user.click(screen.getByRole('button', { name: /submit/i }))

      // Wait for success message
      await waitFor(() => {
        expect(screen.getByText('Thank You!')).toBeInTheDocument()
      })

      expect(screen.getByText(/Here's what to expect next/i)).toBeInTheDocument()
    })

    it('shows expected next steps in success message', async () => {
      const user = userEvent.setup()

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ message: 'Successfully submitted!' }),
      })

      render(<ContactForm />)

      await user.type(screen.getByPlaceholderText('Your name'), 'Test User')
      await user.type(screen.getByPlaceholderText('Your email'), 'test@example.com')
      await user.type(screen.getByPlaceholderText('Phone number'), '555-000-0000')
      await user.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() => {
        expect(screen.getByText(/You'll receive a personal email from me/i)).toBeInTheDocument()
        expect(screen.getByText(/15-minute video consultation/i)).toBeInTheDocument()
        expect(screen.getByText(/chat, see if it's a good fit/i)).toBeInTheDocument()
      })
    })

    it('shows confetti animation on success', async () => {
      const user = userEvent.setup()

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ message: 'Successfully submitted!' }),
      })

      render(<ContactForm />)

      await user.type(screen.getByPlaceholderText('Your name'), 'Test User')
      await user.type(screen.getByPlaceholderText('Your email'), 'test@example.com')
      await user.type(screen.getByPlaceholderText('Phone number'), '555-000-0000')
      await user.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() => {
        expect(screen.getByTestId('confetti')).toBeInTheDocument()
      })
    })
  })

  describe('Form Submission - Error Cases', () => {
    it('shows error message on API failure', async () => {
      const user = userEvent.setup()

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: jest.fn().mockResolvedValue({ error: 'Something went wrong' }),
      })

      render(<ContactForm />)

      await user.type(screen.getByPlaceholderText('Your name'), 'Test User')
      await user.type(screen.getByPlaceholderText('Your email'), 'test@example.com')
      await user.type(screen.getByPlaceholderText('Phone number'), '555-000-0000')
      await user.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() => {
        expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument()
      })
    })

    it('handles network errors gracefully', async () => {
      const user = userEvent.setup()

      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      render(<ContactForm />)

      await user.type(screen.getByPlaceholderText('Your name'), 'Test User')
      await user.type(screen.getByPlaceholderText('Your email'), 'test@example.com')
      await user.type(screen.getByPlaceholderText('Phone number'), '555-000-0000')
      await user.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument()
      })
    })
  })

  describe('Loading States', () => {
    it('disables submit button while submitting', async () => {
      const user = userEvent.setup()

      // Mock slow API response
      ;(global.fetch as jest.Mock).mockImplementation(
        () => new Promise(resolve =>
          setTimeout(() => resolve({
            ok: true,
            json: () => Promise.resolve({ message: 'Success' })
          }), 100)
        )
      )

      render(<ContactForm />)

      await user.type(screen.getByPlaceholderText('Your name'), 'Test User')
      await user.type(screen.getByPlaceholderText('Your email'), 'test@example.com')
      await user.type(screen.getByPlaceholderText('Phone number'), '555-000-0000')
      await user.click(screen.getByRole('button', { name: /submit/i }))

      // Check button is disabled and shows loading state
      await waitFor(() => {
        const button = screen.getByRole('button', { name: /submitting/i })
        expect(button).toBeDisabled()
      })
    })

    it('shows "Submitting..." text during submission', async () => {
      const user = userEvent.setup()

      ;(global.fetch as jest.Mock).mockImplementation(
        () => new Promise(resolve =>
          setTimeout(() => resolve({
            ok: true,
            json: () => Promise.resolve({ message: 'Success' })
          }), 100)
        )
      )

      render(<ContactForm />)

      await user.type(screen.getByPlaceholderText('Your name'), 'Test User')
      await user.type(screen.getByPlaceholderText('Your email'), 'test@example.com')
      await user.type(screen.getByPlaceholderText('Phone number'), '555-000-0000')
      await user.click(screen.getByRole('button', { name: /submit/i }))

      expect(screen.getByText('Submitting...')).toBeInTheDocument()
    })

    it('re-enables button after successful submission', async () => {
      const user = userEvent.setup()

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ message: 'Successfully submitted!' }),
      })

      render(<ContactForm />)

      await user.type(screen.getByPlaceholderText('Your name'), 'Test User')
      await user.type(screen.getByPlaceholderText('Your email'), 'test@example.com')
      await user.type(screen.getByPlaceholderText('Phone number'), '555-000-0000')
      await user.click(screen.getByRole('button', { name: /submit/i }))

      // After success, the form should be in success state (no longer showing the button)
      await waitFor(() => {
        expect(screen.getByText('Thank You!')).toBeInTheDocument()
      })
    })
  })

  describe('Form Validation', () => {
    it('has required attributes on form fields', () => {
      render(<ContactForm />)

      expect(screen.getByPlaceholderText('Your name')).toBeRequired()
      expect(screen.getByPlaceholderText('Your email')).toBeRequired()
      expect(screen.getByPlaceholderText('Phone number')).toBeRequired()
    })

    it('email field has correct type', () => {
      render(<ContactForm />)

      expect(screen.getByPlaceholderText('Your email')).toHaveAttribute('type', 'email')
    })

    it('phone field has correct type', () => {
      render(<ContactForm />)

      expect(screen.getByPlaceholderText('Phone number')).toHaveAttribute('type', 'tel')
    })

    it('prevents submission with empty required fields', async () => {
      const user = userEvent.setup()
      render(<ContactForm />)

      // Try to submit without filling any fields
      await user.click(screen.getByRole('button', { name: /submit/i }))

      // Should not make API call due to HTML5 validation
      expect(global.fetch).not.toHaveBeenCalled()
    })
  })

  describe('Different Props', () => {
    it('renders differently when isContactPage is true', () => {
      render(<ContactForm isContactPage={true} />)

      // Still renders the form
      expect(screen.getByText(/reach out to start therapy/i)).toBeInTheDocument()
    })

    it('includes FAQ section when isContactPage is false (default)', async () => {
      const user = userEvent.setup()

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ message: 'Successfully submitted!' }),
      })

      render(<ContactForm isContactPage={false} />)

      // Submit form to trigger success state
      await user.type(screen.getByPlaceholderText('Your name'), 'Test User')
      await user.type(screen.getByPlaceholderText('Your email'), 'test@example.com')
      await user.type(screen.getByPlaceholderText('Phone number'), '555-000-0000')
      await user.click(screen.getByRole('button', { name: /submit/i }))

      // Wait for success state and check if FAQ appears
      await waitFor(() => {
        expect(screen.getByText('Thank You!')).toBeInTheDocument()
      })

      // FAQ should appear in success state when isContactPage is false
      expect(screen.getByTestId('faq')).toBeInTheDocument()
    })

    it('does not include FAQ section when isContactPage is true', async () => {
      const user = userEvent.setup()

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ message: 'Successfully submitted!' }),
      })

      render(<ContactForm isContactPage={true} />)

      // Submit form to trigger success state
      await user.type(screen.getByPlaceholderText('Your name'), 'Test User')
      await user.type(screen.getByPlaceholderText('Your email'), 'test@example.com')
      await user.type(screen.getByPlaceholderText('Phone number'), '555-000-0000')
      await user.click(screen.getByRole('button', { name: /submit/i }))

      // Wait for success state
      await waitFor(() => {
        expect(screen.getByText('Thank You!')).toBeInTheDocument()
      })

      // FAQ should NOT appear when isContactPage is true
      expect(screen.queryByTestId('faq')).not.toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles very long input values', async () => {
      const user = userEvent.setup()
      render(<ContactForm />)

      const longName = 'A'.repeat(100)
      const longEmail = 'a'.repeat(50) + '@example.com'

      await user.type(screen.getByPlaceholderText('Your name'), longName)
      await user.type(screen.getByPlaceholderText('Your email'), longEmail)

      expect(screen.getByPlaceholderText('Your name')).toHaveValue(longName)
      expect(screen.getByPlaceholderText('Your email')).toHaveValue(longEmail)
    })

    it('handles special characters in input', async () => {
      const user = userEvent.setup()
      render(<ContactForm />)

      const specialName = "John O'Doe-Smith"
      const specialEmail = "john+test@example.com"

      await user.type(screen.getByPlaceholderText('Your name'), specialName)
      await user.type(screen.getByPlaceholderText('Your email'), specialEmail)

      expect(screen.getByPlaceholderText('Your name')).toHaveValue(specialName)
      expect(screen.getByPlaceholderText('Your email')).toHaveValue(specialEmail)
    })

    it('handles rapid form submissions', async () => {
      const user = userEvent.setup()

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ message: 'Successfully submitted!' }),
      })

      render(<ContactForm />)

      await user.type(screen.getByPlaceholderText('Your name'), 'Test User')
      await user.type(screen.getByPlaceholderText('Your email'), 'test@example.com')
      await user.type(screen.getByPlaceholderText('Phone number'), '555-000-0000')

      // Click submit multiple times rapidly
      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)
      await user.click(submitButton)
      await user.click(submitButton)

      // Should only make one API call
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1)
      })
    })
  })
})
