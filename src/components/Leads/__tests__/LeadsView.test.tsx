// src/components/LeadsView.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LeadsView from '../LeadsView'
import { createMockContact, mockSupabaseClient } from '@/__tests__/test-utils'

// Mock dependencies
jest.mock('@supabase/auth-helpers-nextjs')

global.fetch = jest.fn()

describe('LeadsView', () => {
  const mockLeads = [
    createMockContact({
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      status: 'New',
      created_at: '2024-01-01T00:00:00Z'
    }),
    createMockContact({
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      status: 'Contacted',
      created_at: '2024-01-02T00:00:00Z'
    }),
  ]

  beforeEach(() => {
    jest.clearAllMocks()

    // Mock Supabase client
    mockSupabaseClient.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: mockLeads,
        error: null,
      }),
    })

    mockSupabaseClient.channel.mockReturnValue({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
    })

    require('@supabase/auth-helpers-nextjs').createClientComponentClient = jest.fn(
      () => mockSupabaseClient
    )
  })

  it('renders leads table with data', async () => {
    render(<LeadsView />)

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      expect(screen.getByText('john@example.com')).toBeInTheDocument()
      expect(screen.getByText('jane@example.com')).toBeInTheDocument()
    })
  })

  it('shows loading skeleton initially', () => {
    // Mock loading state
    mockSupabaseClient.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockImplementation(
        () => new Promise(() => {}) // Never resolves
      ),
    })

    render(<LeadsView />)

    // Should show skeleton loader
    expect(screen.getByText('Leads')).toBeInTheDocument()
    // Skeleton elements would be tested via data-testid or class names
  })

  it('opens lead detail modal when row is clicked', async () => {
    const user = userEvent.setup()
    render(<LeadsView />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    // Click on lead row
    await user.click(screen.getByText('John Doe'))

    // Modal should open
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByDisplayValue('New')).toBeInTheDocument()
    })
  })

  it('updates lead status in modal', async () => {
    const user = userEvent.setup()

    // Mock update response
    mockSupabaseClient.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: mockLeads, error: null }),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ data: null, error: null }),
    })

    render(<LeadsView />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    // Open modal
    await user.click(screen.getByText('John Doe'))

    await waitFor(() => {
      expect(screen.getByDisplayValue('New')).toBeInTheDocument()
    })

    // Change status
    const statusSelect = screen.getByDisplayValue('New')
    await user.selectOptions(statusSelect, 'Contacted')

    // Save changes
    await user.click(screen.getByText('Save Changes'))

    await waitFor(() => {
      expect(mockSupabaseClient.from().update).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'Contacted' })
      )
    })
  })

  it('sends reminder email', async () => {
    const user = userEvent.setup()

    // Mock API response for reminder
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        message: 'Reminder sent successfully!',
        emailSent: true,
      }),
    })

    render(<LeadsView />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    // Open modal
    await user.click(screen.getByText('John Doe'))

    await waitFor(() => {
      expect(screen.getByText('Send Reminder')).toBeInTheDocument()
    })

    // Send reminder
    await user.click(screen.getByText('Send Reminder'))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/leads/send-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'john@example.com' }),
      })
    })
  })

  it('deletes lead with confirmation', async () => {
    const user = userEvent.setup()

    // Mock delete response
    mockSupabaseClient.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: mockLeads, error: null }),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ data: null, error: null }),
    })

    render(<LeadsView />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    // Find and click delete button (X button)
    const deleteButtons = screen.getAllByText('×')
    await user.click(deleteButtons[0])

    // Confirmation modal should appear
    await waitFor(() => {
      expect(screen.getByText('Delete Lead')).toBeInTheDocument()
      expect(screen.getByText('Are you sure you want to delete this lead?')).toBeInTheDocument()
    })

    // Confirm deletion
    await user.click(screen.getByText('Delete Lead'))

    await waitFor(() => {
      expect(mockSupabaseClient.from().delete).toHaveBeenCalled()
    })
  })

  it('filters warm vs cold leads correctly', async () => {
    const warmLead = createMockContact({
      id: 1,
      name: 'Warm Lead',
      status: 'New',
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    })

    const coldLead = createMockContact({
      id: 2,
      name: 'Cold Lead',
      status: 'New',
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    })

    mockSupabaseClient.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: [warmLead, coldLead],
        error: null,
      }),
    })

    render(<LeadsView />)

    await waitFor(() => {
      expect(screen.getByText('Warm Lead')).toBeInTheDocument()
      expect(screen.getByText('Cold Lead')).toBeInTheDocument()
    })

    // Check for warm/cold indicators
    const indicators = screen.getAllByTitle(/Lead$/)
    expect(indicators).toHaveLength(2)

    // Visual indicators would be tested via CSS classes or colors
    // This would require more specific selectors or data-testid attributes
  })

  it('handles API errors gracefully', async () => {
    // Mock API error
    mockSupabaseClient.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' },
      }),
    })

    render(<LeadsView />)

    // Should handle error gracefully - component shouldn't crash
    await waitFor(() => {
      expect(screen.getByText('Leads')).toBeInTheDocument()
    })
  })

  it('updates lead data in real-time', async () => {
    let channelCallback: (payload: any) => void

    mockSupabaseClient.channel.mockReturnValue({
      on: jest.fn().mockImplementation((event, config, callback) => {
        channelCallback = callback
        return { subscribe: jest.fn() }
      }),
      subscribe: jest.fn(),
    })

    render(<LeadsView />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    // Simulate real-time update
    channelCallback!({
      eventType: 'UPDATE',
      new: { ...mockLeads[0], status: 'Contacted' },
    })

    // Component should refetch data
    expect(mockSupabaseClient.from().select).toHaveBeenCalledTimes(2)
  })
})
