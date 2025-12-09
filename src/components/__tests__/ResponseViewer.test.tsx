import { render, screen } from '@testing-library/react'
import ResponseViewer from '../ResponseViewer'
import { useStore } from '../../store/useStore'

jest.mock('../../store/useStore')

describe('ResponseViewer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows loading state', () => {
    ;(useStore as unknown as jest.Mock).mockReturnValue({
      response: null,
      loading: true,
      error: null,
    })

    render(<ResponseViewer />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('shows error state', () => {
    ;(useStore as unknown as jest.Mock).mockReturnValue({
      response: null,
      loading: false,
      error: 'Network error',
    })

    render(<ResponseViewer />)

    expect(screen.getByText('Error')).toBeInTheDocument()
    expect(screen.getByText('Network error')).toBeInTheDocument()
  })

  it('shows empty state when no response', () => {
    ;(useStore as unknown as jest.Mock).mockReturnValue({
      response: null,
      loading: false,
      error: null,
    })

    render(<ResponseViewer />)

    expect(screen.getByText(/No response yet/)).toBeInTheDocument()
  })

  it('displays response data', () => {
    const mockResponse = {
      status: 200,
      statusText: 'OK',
      headers: { 'content-type': 'application/json' },
      data: { message: 'Success' },
      time: 150,
    }

    ;(useStore as unknown as jest.Mock).mockReturnValue({
      response: mockResponse,
      loading: false,
      error: null,
    })

    render(<ResponseViewer />)

    expect(screen.getByText('200 OK')).toBeInTheDocument()
    expect(screen.getByText('Time: 150ms')).toBeInTheDocument()
    expect(screen.getByText('Headers')).toBeInTheDocument()
    expect(screen.getByText('Body')).toBeInTheDocument()
  })

  it('displays error status correctly', () => {
    const mockResponse = {
      status: 404,
      statusText: 'Not Found',
      headers: {},
      data: { error: 'Not found' },
      time: 50,
    }

    ;(useStore as unknown as jest.Mock).mockReturnValue({
      response: mockResponse,
      loading: false,
      error: null,
    })

    render(<ResponseViewer />)

    expect(screen.getByText('404 Not Found')).toBeInTheDocument()
  })
})

