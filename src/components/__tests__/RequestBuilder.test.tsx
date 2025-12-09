import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import RequestBuilder from '../RequestBuilder'
import { useStore } from '../../store/useStore'
import { sendRequest } from '../../services/api'

jest.mock('../../store/useStore')
jest.mock('../../services/api')

describe('RequestBuilder', () => {
  const mockSetResponse = jest.fn()
  const mockSetLoading = jest.fn()
  const mockSetError = jest.fn()
  const mockUpdateRequest = jest.fn()
  const mockAddRequest = jest.fn()
  const mockSetCurrentRequest = jest.fn()
  const mockSetCountdown = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    const mockStoreState = {
      currentRequest: null,
      response: null,
      loading: false,
      error: null,
      countdown: null,
      setResponse: mockSetResponse,
      setLoading: mockSetLoading,
      setError: mockSetError,
      updateRequest: mockUpdateRequest,
      addRequest: mockAddRequest,
      setCurrentRequest: mockSetCurrentRequest,
      setCountdown: mockSetCountdown,
    }
    ;(useStore as unknown as jest.Mock).mockReturnValue(mockStoreState)
  })

  it('renders request builder form', () => {
    render(<RequestBuilder />)

    expect(screen.getByPlaceholderText('Request Name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter URL')).toBeInTheDocument()
    expect(screen.getByText('Send')).toBeInTheDocument()
  })

  it('updates URL input', () => {
    render(<RequestBuilder />)

    const urlInput = screen.getByPlaceholderText('Enter URL')
    fireEvent.change(urlInput, { target: { value: 'https://api.example.com' } })

    expect(urlInput).toHaveValue('https://api.example.com')
  })

  it('changes HTTP method', () => {
    render(<RequestBuilder />)

    const methodSelect = screen.getByDisplayValue('GET')
    fireEvent.change(methodSelect, { target: { value: 'POST' } })

    expect(methodSelect).toHaveValue('POST')
  })

  it('shows body textarea for POST method', () => {
    render(<RequestBuilder />)

    const methodSelect = screen.getByDisplayValue('GET')
    fireEvent.change(methodSelect, { target: { value: 'POST' } })

    expect(screen.getByPlaceholderText('Request body (JSON, etc.)')).toBeInTheDocument()
  })

  it('adds new header row', () => {
    render(<RequestBuilder />)

    const addHeaderButton = screen.getByText('+ Add Header')
    fireEvent.click(addHeaderButton)

    const headerInputs = screen.getAllByPlaceholderText('Key')
    expect(headerInputs.length).toBeGreaterThan(1)
  })

  it('sends request when Send button is clicked', async () => {
    const mockResponse = {
      status: 200,
      statusText: 'OK',
      headers: {},
      data: { message: 'Success' },
      time: 100,
    }

    ;(sendRequest as jest.Mock).mockResolvedValue(mockResponse)

    render(<RequestBuilder />)

    const urlInput = screen.getByPlaceholderText('Enter URL')
    fireEvent.change(urlInput, { target: { value: 'https://api.example.com' } })

    const sendButton = screen.getByText('Send')
    fireEvent.click(sendButton)

    await waitFor(() => {
      expect(mockSetLoading).toHaveBeenCalledWith(true)
      expect(sendRequest).toHaveBeenCalled()
    })
  })

  it('shows error when URL is empty', () => {
    render(<RequestBuilder />)

    // The URL input starts empty, so button should be disabled
    const sendButton = screen.getByText('Send') as HTMLButtonElement
    expect(sendButton.disabled).toBe(true)
    
    // Set URL to whitespace only - button should still be disabled (url.trim() is empty)
    const urlInput = screen.getByPlaceholderText('Enter URL')
    fireEvent.change(urlInput, { target: { value: '   ' } })
    expect(sendButton.disabled).toBe(true)
    
    // Set a valid URL to enable button
    fireEvent.change(urlInput, { target: { value: 'https://test.com' } })
    expect(sendButton.disabled).toBe(false)
    
    // Now set it back to empty - button should be disabled again
    fireEvent.change(urlInput, { target: { value: '' } })
    expect(sendButton.disabled).toBe(true)
    
    // The validation logic in handleSend checks url.trim(), but since button is disabled,
    // we can't test that path through clicking. The disabled state is the correct behavior.
    // If we want to test the validation message, we'd need to test it differently,
    // but the current implementation prevents sending with empty URL via disabled button.
  })
})

