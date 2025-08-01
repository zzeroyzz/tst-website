/* eslint-disable @typescript-eslint/no-explicit-any */
// src/__tests__/integration/contact-flow.test.tsx
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Use the same import path as your contact page
import ContactPageClient from '@/components/clients/ContactPageClient/ContactPageClient'

import { mockApiResponse } from '@/__tests__/test-utils'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: any) => children,
  useInView: () => true,
  Variants: {},
}))

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />
  },
}))

// Mock the components that ContactPageClient depends on
jest.mock('@/components/Section/Section', () => {
  return function MockSection({ children, className }: any) {
    return <section className={className}>{children}</section>
  }
})

jest.mock('@/components/Contact/ContactForm', () => {
  return function MockContactForm({}: any) {
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [submitStatus, setSubmitStatus] = React.useState<'idle' | 'success' | 'error'>('idle')

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setIsSubmitting(true)

      const formData = new FormData(e.target as HTMLFormElement)
      const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
      }

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })

        if (response.ok) {
          setSubmitStatus('success')
        } else {
          setSubmitStatus('error')
        }
      } catch (error) {
        setSubmitStatus(error, 'error')
      } finally {
        setIsSubmitting(false)
      }
    }

    if (submitStatus === 'success') {
      return (
        <div data-testid="contact-form">
          <h2>Thank You!</h2>
          <p>Here&apos;s what to expect next:</p>
          <p>You&apos;ll receive a personal email from me</p>
        </div>
      )
    }

    return (
      <div data-testid="contact-form">
        <form onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="Your name"
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Your email"
            required
          />
          <input
            name="phone"
            placeholder="Phone number"
          />
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </form>
        {submitStatus === 'error' && (
          <p>Something went wrong. Please try again.</p>
        )}
      </div>
    )
  }
})

jest.mock('@/components/FAQ/FAQ', () => {
  return function MockFAQ() {
    return <div data-testid="faq">FAQ Component</div>
  }
})

jest.mock('@/components/CircleIcon/CircleIcon', () => {
  return function MockCircleIcon({ size, bgColor, iconUrl }: any) {
    return <div className={`circle-icon ${bgColor}`} data-size={size}>Icon</div>
  }
})

// Mock CSS modules
jest.mock('@/components/TherapyCard/TherapyCard.module.css', () => ({
  wrapper: 'therapy-card-wrapper',
  shadow: 'therapy-card-shadow',
  card: 'therapy-card',
}))

jest.mock('@/components/Contact/modules/ContactForm.module.css', () => ({
  animatedItem: 'animated-item',
}))

// Mock the data imports
jest.mock('@/data/contactData', () => ({
  trustIndicators: [
    { id: 1, text: 'Phone and Video', iconUrl: '/icon1.svg' },
    { id: 2, text: 'No waitlist', iconUrl: '/icon2.svg' },
    { id: 3, text: '11 A.M. to 5 P.M.', iconUrl: '/icon3.svg' },
  ],
  benefitCards: [
    {
      id: 1,
      title: 'Start Where You Are, Not Where You Think You Should Be',
      description: 'Test description',
      icon: '/benefit1.svg',
      alt: 'Benefit 1',
      bgColor: 'bg-blue-100',
    },
    {
      id: 2,
      title: 'A Space Free of Judgment',
      description: 'Test description',
      icon: '/benefit2.svg',
      alt: 'Benefit 2',
      bgColor: 'bg-green-100',
    },
    {
      id: 3,
      title: 'One Conversation, Zero Commitment',
      description: 'Test description',
      icon: '/benefit3.svg',
      alt: 'Benefit 3',
      bgColor: 'bg-yellow-100',
    },
  ],
  heroContent: {
    title: 'A Space to Be Seen and Heard',
    subtitle: 'Reach out to start therapy.',
  },
  benefitsSection: {
    title: 'Why Choose This Approach',
    subtitle: 'Benefits of our therapy approach',
  },
}))

describe('Contact Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('displays trust indicators correctly', () => {
    render(<ContactPageClient />)

    // Check for trust indicators
    expect(screen.getByText('Phone and Video')).toBeInTheDocument()
    expect(screen.getByText('No waitlist')).toBeInTheDocument()
    expect(screen.getByText('11 A.M. to 5 P.M.')).toBeInTheDocument()
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

    // Since there are two forms (mobile and desktop), get all inputs and use the first one
    const nameInputs = screen.getAllByPlaceholderText('Your name')
    const emailInputs = screen.getAllByPlaceholderText('Your email')
    const phoneInputs = screen.getAllByPlaceholderText('Phone number')
    const submitButtons = screen.getAllByRole('button', { name: /submit/i })

    // Use the first form (mobile version)
    await user.type(nameInputs[0], 'Jane Smith')
    await user.type(emailInputs[0], 'jane.smith@example.com')
    await user.type(phoneInputs[0], '555-0199')

    // Submit the first form
    await user.click(submitButtons[0])

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

    // Verify success state appears in at least one of the forms
    await waitFor(() => {
      expect(screen.getByText('Thank You!')).toBeInTheDocument()
      expect(screen.getByText(/Here's what to expect next:/)).toBeInTheDocument()
      expect(screen.getByText(/You'll receive a personal email from me/)).toBeInTheDocument()
    })
  })
  it('handles API errors gracefully', async () => {
    const user = userEvent.setup()

    // Mock API error
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 503,
      json: () => Promise.resolve({ error: 'Server temporarily unavailable' })
    })

    render(<ContactPageClient />)

    // Fill and submit form
    const nameInputs = screen.getAllByPlaceholderText('Your name')
    const emailInputs = screen.getAllByPlaceholderText('Your email')
    const phoneInputs = screen.getAllByPlaceholderText('Phone number')
    const submitButtons = screen.getAllByRole('button', { name: /submit/i })

    await user.type(nameInputs[0], 'Jane Smith')
    await user.type(emailInputs[0], 'jane@example.com')
    await user.type(phoneInputs[0], '555-0199')
    await user.click(submitButtons[0])

    // Verify error handling
    await waitFor(() => {
      expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument()
    })

    // Form should still be visible for retry
    expect(screen.getAllByPlaceholderText('Your name')[0]).toBeInTheDocument()
  })

  it('shows loading states during submission', async () => {
    const user = userEvent.setup()

    // Mock slow API response
    let resolvePromise: (value: any) => void
    ;(global.fetch as jest.Mock).mockImplementation(
      () => new Promise(resolve => {
        resolvePromise = resolve
      })
    )

    render(<ContactPageClient />)

    // Fill and submit form
    const nameInputs = screen.getAllByPlaceholderText('Your name')
    const emailInputs = screen.getAllByPlaceholderText('Your email')
    const phoneInputs = screen.getAllByPlaceholderText('Phone number')
    const submitButtons = screen.getAllByRole('button', { name: /submit/i })

    await user.type(nameInputs[0], 'Jane Smith')
    await user.type(emailInputs[0], 'jane@example.com')
    await user.type(phoneInputs[0], '555-0199')
    await user.click(submitButtons[0])

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

  it('shows benefit cards with correct content', () => {
    render(<ContactPageClient />)

    // Check for benefit cards
    expect(screen.getByText('Start Where You Are, Not Where You Think You Should Be')).toBeInTheDocument()
    expect(screen.getByText('A Space Free of Judgment')).toBeInTheDocument()
    expect(screen.getByText('One Conversation, Zero Commitment')).toBeInTheDocument()
  })

  it('renders both mobile and desktop forms', () => {
    render(<ContactPageClient />)

    // Should have 2 contact forms (mobile and desktop)
    const contactForms = screen.getAllByTestId('contact-form')
    expect(contactForms).toHaveLength(2)

    // Should have 2 of each input
    expect(screen.getAllByPlaceholderText('Your name')).toHaveLength(2)
    expect(screen.getAllByPlaceholderText('Your email')).toHaveLength(2)
    expect(screen.getAllByPlaceholderText('Phone number')).toHaveLength(2)
  })
})
