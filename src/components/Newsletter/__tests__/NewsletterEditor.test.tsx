// src/components/NewsletterEditor.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import NewsletterEditor from './NewsletterEditor'
import { createMockPost, mockSupabaseClient } from '@/__tests__/test-utils'

// Mock dependencies
jest.mock('next/navigation')
jest.mock('@supabase/auth-helpers-nextjs')

const mockPush = jest.fn()
const mockRefresh = jest.fn()

global.fetch = jest.fn()

describe('NewsletterEditor', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Mock Next.js router
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    })

    // Mock Supabase client
    require('@supabase/auth-helpers-nextjs').createClientComponentClient = jest.fn(
      () => mockSupabaseClient
    )

    // Mock successful API responses
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ html: '<html>Preview</html>' }),
    })
  })

  it('renders empty form for new post', () => {
    render(<NewsletterEditor post={null} />)

    expect(screen.getByText('Create New Newsletter')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Article Title')).toHaveValue('')
    expect(screen.getByPlaceholderText('Email Subject Line')).toHaveValue('')
    expect(screen.getByPlaceholderText('Main body content...')).toHaveValue('')
  })

  it('renders form with existing post data', () => {
    const mockPost = createMockPost({
      title: 'Existing Post',
      subject: 'Existing Subject',
      body: 'Existing body content',
    })

    render(<NewsletterEditor post={mockPost} />)

    expect(screen.getByText('Edit Newsletter')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Existing Post')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Existing Subject')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Existing body content')).toBeInTheDocument()
  })

  it('allows editing form fields', async () => {
    const user = userEvent.setup()
    render(<NewsletterEditor post={null} />)

    const titleInput = screen.getByPlaceholderText('Article Title')
    const subjectInput = screen.getByPlaceholderText('Email Subject Line')
    const bodyInput = screen.getByPlaceholderText('Main body content...')

    await user.type(titleInput, 'New Article Title')
    await user.type(subjectInput, 'New Subject')
    await user.type(bodyInput, 'New body content')

    expect(titleInput).toHaveValue('New Article Title')
    expect(subjectInput).toHaveValue('New Subject')
    expect(bodyInput).toHaveValue('New body content')
  })

  it('handles tag selection', async () => {
    const user = userEvent.setup()
    render(<NewsletterEditor post={null} />)

    // Find and click a tag checkbox
    const anxietyTag = screen.getByText('Anxiety & Overwhelm')
    await user.click(anxietyTag)

    // The tag should be selected (visual feedback would be tested via CSS classes)
    expect(anxietyTag.closest('label')).toHaveClass('bg-tst-purple')
  })

  it('handles archive post selection', async () => {
    const user = userEvent.setup()

    // Mock available posts
    mockSupabaseClient.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      mockResolvedValue: jest.fn().mockResolvedValue({
        data: [
          { id: '1', title: 'Archive Post 1' },
          { id: '2', title: 'Archive Post 2' },
        ],
        error: null,
      }),
    })

    render(<NewsletterEditor post={null} />)

    // Find archive post checkboxes
    await waitFor(() => {
      const archivePost1 = screen.getByText('Archive Post 1')
      expect(archivePost1).toBeInTheDocument()
    })
  })

  it('handles image upload', async () => {
    const user = userEvent.setup()

    // Mock successful upload response
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        url: 'https://example.com/uploaded-image.jpg',
        message: 'Upload successful',
      }),
    })

    render(<NewsletterEditor post={null} />)

    const fileInput = screen.getByLabelText(/upload image/i)
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

    await user.upload(fileInput, file)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/upload/image', {
        method: 'POST',
        body: expect.any(FormData),
      })
    })
  })

  it('saves draft successfully', async () => {
    const user = userEvent.setup()

    // Mock successful save response
    mockSupabaseClient.from.mockReturnValue({
      upsert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { id: '123', slug: 'test-post' },
        error: null,
      }),
    })

    render(<NewsletterEditor post={null} />)

    // Fill required fields
    await user.type(screen.getByPlaceholderText('Article Title'), 'Test Post')
    await user.type(screen.getByPlaceholderText('Email Subject Line'), 'Test Subject')
    await user.type(screen.getByPlaceholderText('Main body content...'), 'Test content')

    // Save draft
    await user.click(screen.getByText('Save for Later'))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard/newsletter/123')
      expect(mockRefresh).toHaveBeenCalled()
    })
  })

  it('generates preview successfully', async () => {
    const user = userEvent.setup()

    render(<NewsletterEditor post={null} />)

    // Fill required fields
    await user.type(screen.getByPlaceholderText('Article Title'), 'Test Post')
    await user.type(screen.getByPlaceholderText('Email Subject Line'), 'Test Subject')
    await user.type(screen.getByPlaceholderText('Main body content...'), 'Test content')

    // Generate preview
    await user.click(screen.getByText('Preview'))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/newsletter/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('Test Post'),
      })
    })
  })

  it('handles form validation errors', async () => {
    const user = userEvent.setup()
    render(<NewsletterEditor post={null} />)

    // Try to save without required fields
    await user.click(screen.getByText('Save for Later'))

    // HTML5 validation should prevent submission
    const titleInput = screen.getByPlaceholderText('Article Title')
    expect(titleInput).toBeRequired()
  })

  it('disables buttons during submission', async () => {
    const user = userEvent.setup()

    // Mock slow API response
    mockSupabaseClient.from.mockReturnValue({
      upsert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          data: { id: '123' },
          error: null,
        }), 1000))
      ),
    })

    render(<NewsletterEditor post={null} />)

    // Fill and submit
    await user.type(screen.getByPlaceholderText('Article Title'), 'Test')
    await user.type(screen.getByPlaceholderText('Email Subject Line'), 'Test')
    await user.type(screen.getByPlaceholderText('Main body content...'), 'Test')
    await user.click(screen.getByText('Save for Later'))

    // Buttons should be disabled
    expect(screen.getByText('Saving...')).toBeDisabled()
    expect(screen.getByText('Preview')).toBeDisabled()
  })

  it('handles archive post selection limits', async () => {
    const user = userEvent.setup()

    // Mock posts available for archive
    mockSupabaseClient.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      mockResolvedValue: jest.fn().mockResolvedValue({
        data: [
          { id: '1', title: 'Post 1' },
          { id: '2', title: 'Post 2' },
          { id: '3', title: 'Post 3' },
          { id: '4', title: 'Post 4' },
        ],
        error: null,
      }),
    })

    render(<NewsletterEditor post={null} />)

    await waitFor(() => {
      expect(screen.getByText('You have selected 0 of 3 posts.')).toBeInTheDocument()
    })
  })
})
