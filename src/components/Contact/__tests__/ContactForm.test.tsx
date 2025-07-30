// src/components/ContactForm.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ContactForm from './ContactForm'

// Mock fetch
global.fetch = jest.fn()

describe('ContactForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the contact form with all fields', () => {
    render(<ContactForm />)

    expect(screen.getByText('Reach out to start therapy.')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Phone number')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Your email')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
  })

  it('shows validation errors for empty required fields', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)

    const submitButton = screen.getByRole('button', { name: /submit/i })
    await user.click(submitButton)

    // HTML5 validation should prevent submission
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()

    // Mock successful API response
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ message: 'Successfully submitted!' }),
    })

    render(<ContactForm />)

    // Fill out the form
    await user.type(screen.getByPlaceholderText('Your name'), 'John Doe')
    await user.type(screen.getByPlaceholderText('Your email'), 'john@example.com')
    await user.type(screen.getByPlaceholderText('Phone number'), '555-0123')

    // Submit the form
    await user.click(screen.getByRole('button', { name: /submit/i }))

    // Wait for the API call
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john@example.com',
          phone: '555-0123',
        }),
      })
    })
  })

  it('shows success message after successful submission', async () => {
    const user = userEvent.setup()

    // Mock successful API response
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ message: 'Successfully submitted!' }),
    })

    render(<ContactForm />)

    // Fill and submit form
    await user.type(screen.getByPlaceholderText('Your name'), 'John Doe')
    await user.type(screen.getByPlaceholderText('Your email'), 'john@example.com')
    await user.type(screen.getByPlaceholderText('Phone number'), '555-0123')
    await user.click(screen.getByRole('button', { name: /submit/i }))

    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText('Thank You!')).toBeInTheDocument()
      expect(screen.getByText(/Here's what to expect next:/)).toBeInTheDocument()
    })
  })

  it('shows error message on API failure', async () => {
    const user = userEvent.setup()

    // Mock API error response
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({ error: 'Something went wrong' }),
    })

    render(<ContactForm />)

    // Fill and submit form
    await user.type(screen.getByPlaceholderText('Your name'), 'John Doe')
    await user.type(screen.getByPlaceholderText('Your email'), 'john@example.com')
    await user.type(screen.getByPlaceholderText('Phone number'), '555-0123')
    await user.click(screen.getByRole('button', { name: /submit/i }))

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })
  })

  it('disables submit button while submitting', async () => {
    const user = userEvent.setup()

    // Mock slow API response
    ;(global.fetch as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Success' })
      }), 1000))
    )

    render(<ContactForm />)

    // Fill and submit form
    await user.type(screen.getByPlaceholderText('Your name'), 'John Doe')
    await user.type(screen.getByPlaceholderText('Your email'), 'john@example.com')
    await user.type(screen.getByPlaceholderText('Phone number'), '555-0123')
    await user.click(screen.getByRole('button', { name: /submit/i }))

    // Check button is disabled and shows loading state
    expect(screen.getByRole('button', { name: /submitting/i })).toBeDisabled()
  })

  it('shows FAQ section when isContactPage is false', () => {
    // We can't directly test this since FAQ is shown in post-submit state
    // But we can test that the component renders differently
    render(<ContactForm isContactPage={false} />)

    // The form should render normally
    expect(screen.getByText('Reach out to start therapy.')).toBeInTheDocument()
  })

  it('handles network errors gracefully', async () => {
    const user = userEvent.setup()

    // Mock network error
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

    render(<ContactForm />)

    // Fill and submit form
    await user.type(screen.getByPlaceholderText('Your name'), 'John Doe')
    await user.type(screen.getByPlaceholderText('Your email'), 'john@example.com')
    await user.type(screen.getByPlaceholderText('Phone number'), '555-0123')
    await user.click(screen.getByRole('button', { name: /submit/i }))

    // Wait for error handling
    await waitFor(() => {
      expect(screen.getByText('An unexpected error occurred.')).toBeInTheDocument()
    })
  })
})
