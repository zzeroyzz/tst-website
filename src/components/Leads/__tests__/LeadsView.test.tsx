/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/LeadsView.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LeadsView from '../LeadsView'
import { createMockContact, mockSupabaseClient } from '@/__tests__/test-utils'

// Mock dependencies
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: jest.fn(() => mockSupabaseClient)
}))

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

    // Reset Supabase client mocks
    jest.mocked(mockSupabaseClient.from).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: mockLeads,
        error: null,
      }),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ data: null, error: null }),
    })

    jest.mocked(mockSupabaseClient.channel).mockReturnValue({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
    })
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
  // Mock loading state - never resolving promise
  jest.mocked(mockSupabaseClient.from).mockReturnValue({
    select: jest.fn().mockReturnThis(),
    order: jest.fn().mockImplementation(
      () => new Promise(() => {}) // Never resolves
    ),
  })

  render(<LeadsView />)

  // Should show skeleton loader elements
  expect(screen.getByRole('table')).toBeInTheDocument()

  // Check for skeleton elements by their CSS classes
  const skeletonElements = document.querySelectorAll('.animate-pulse')
  expect(skeletonElements.length).toBeGreaterThan(0)
})

  it('opens lead detail modal when row is clicked', async () => {
  const user = userEvent.setup()
  render(<LeadsView />)

  await waitFor(() => {
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  // Click on lead row
  await user.click(screen.getByText('John Doe'))

  // Modal should open - check for the modal content that's actually rendered
  await waitFor(() => {
    // Check for the "Save Changes" button which is unique to the modal
    expect(screen.getByText('Save Changes')).toBeInTheDocument()
    // And check for the status select field
    expect(screen.getByDisplayValue('New')).toBeInTheDocument()
  })
})

  it('updates lead status in modal', async () => {
    const user = userEvent.setup()

    // Mock update response
    const mockUpdate = jest.fn().mockReturnThis()
    const mockEq = jest.fn().mockResolvedValue({ data: null, error: null })

    jest.mocked(mockSupabaseClient.from).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: mockLeads, error: null }),
      update: mockUpdate,
      eq: mockEq,
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
    const saveButton = screen.getByText('Save Changes')
    await user.click(saveButton)

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'Contacted' })
      )
    })
  })

  it('sends reminder email', async () => {
    const user = userEvent.setup()

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
  const mockDelete = jest.fn().mockReturnThis()
  const mockEq = jest.fn().mockResolvedValue({ data: null, error: null })

  jest.mocked(mockSupabaseClient.from).mockReturnValue({
    select: jest.fn().mockReturnThis(),
    order: jest.fn().mockResolvedValue({ data: mockLeads, error: null }),
    delete: mockDelete,
    eq: mockEq,
  })

  render(<LeadsView />)

  await waitFor(() => {
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  // Find delete button by its red background color class
  const deleteButton = document.querySelector('.bg-red-500')
  expect(deleteButton).toBeInTheDocument()
  await user.click(deleteButton!)

  // Confirmation modal should appear
  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Delete Lead' })).toBeInTheDocument()
    expect(screen.getByText('Are you sure you want to delete this lead?')).toBeInTheDocument()
  })

  // Confirm deletion - find the button specifically
  const confirmDeleteButton = screen.getByRole('button', { name: 'Delete Lead' })
  await user.click(confirmDeleteButton)

  await waitFor(() => {
    expect(mockDelete).toHaveBeenCalled()
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

    jest.mocked(mockSupabaseClient.from).mockReturnValue({
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

    // Check for warm/cold indicators - adjust based on your implementation
    // You might need to add data-testid attributes to make this more reliable
    const indicators = screen.getAllByTitle(/Lead$/)
    expect(indicators).toHaveLength(2)
  })

  it('handles API errors gracefully', async () => {
    // Mock API error
    jest.mocked(mockSupabaseClient.from).mockReturnValue({
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

    jest.mocked(mockSupabaseClient.channel).mockReturnValue({
      on: jest.fn().mockImplementation((event, config, callback) => {
        channelCallback = callback
        return { subscribe: jest.fn() }
      }),
      subscribe: jest.fn(),
    })

    const mockSelect = jest.fn().mockReturnThis()
    const mockOrder = jest.fn().mockResolvedValue({ data: mockLeads, error: null })

    jest.mocked(mockSupabaseClient.from).mockReturnValue({
      select: mockSelect,
      order: mockOrder,
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
    expect(mockSelect).toHaveBeenCalledTimes(2)
  })
})
