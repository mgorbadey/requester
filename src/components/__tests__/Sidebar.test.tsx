import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestRouter } from '../../test-utils'
import Sidebar from '../Sidebar'
import { useStore } from '../../store/useStore'

// Mock the store
jest.mock('../../store/useStore')

describe('Sidebar', () => {
  const mockAddCollection = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useStore as unknown as jest.Mock).mockReturnValue({
      collections: [
        { id: '1', name: 'Test Collection', requests: [] },
        { id: '2', name: 'Another Collection', requests: [] },
      ],
      addCollection: mockAddCollection,
    })
  })

  it('renders the sidebar with title', () => {
    render(
      <TestRouter>
        <Sidebar />
      </TestRouter>
    )

    expect(screen.getByText('Requester')).toBeInTheDocument()
  })

  it('renders collections', () => {
    render(
      <TestRouter>
        <Sidebar />
      </TestRouter>
    )

    expect(screen.getByText('Test Collection')).toBeInTheDocument()
    expect(screen.getByText('Another Collection')).toBeInTheDocument()
  })

  it('calls addCollection when button is clicked and form is submitted', async () => {
    const user = userEvent.setup()

    render(
      <TestRouter>
        <Sidebar />
      </TestRouter>
    )

    const addButton = screen.getByText('+ New Collection')
    await user.click(addButton)

    // Modal should be open
    expect(screen.getByText('Create New Collection')).toBeInTheDocument()

    // Enter collection name
    const input = screen.getByPlaceholderText('Enter collection name')
    await user.type(input, 'New Collection')

    // Submit form
    const submitButton = screen.getByText('Create')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockAddCollection).toHaveBeenCalledWith('New Collection')
    })
  })

  it('does not call addCollection when modal is cancelled', async () => {
    const user = userEvent.setup()

    render(
      <TestRouter>
        <Sidebar />
      </TestRouter>
    )

    const addButton = screen.getByText('+ New Collection')
    await user.click(addButton)

    // Modal should be open
    expect(screen.getByText('Create New Collection')).toBeInTheDocument()

    // Click cancel
    const cancelButton = screen.getByText('Cancel')
    await user.click(cancelButton)

    // Modal should be closed
    await waitFor(() => {
      expect(screen.queryByText('Create New Collection')).not.toBeInTheDocument()
    })

    expect(mockAddCollection).not.toHaveBeenCalled()
  })
})

