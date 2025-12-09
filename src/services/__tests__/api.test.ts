import { sendRequest } from '../api'
import axios from 'axios'

jest.mock('axios')
const mockedAxios = axios as jest.MockedFunction<typeof axios>

describe('api service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('sends GET request successfully', async () => {
    const mockResponse = {
      status: 200,
      statusText: 'OK',
      headers: { 'content-type': 'application/json' },
      data: { message: 'Success' },
    }

    mockedAxios.mockResolvedValue(mockResponse as any)

    const result = await sendRequest({
      method: 'GET',
      url: 'https://api.example.com/test',
    })

    expect(result.status).toBe(200)
    expect(result.data).toEqual({ message: 'Success' })
    expect(mockedAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'get',
        url: 'https://api.example.com/test',
      })
    )
  })

  it('sends POST request with body', async () => {
    const mockResponse = {
      status: 201,
      statusText: 'Created',
      headers: {},
      data: { id: 1 },
    }

    mockedAxios.mockResolvedValue(mockResponse as any)

    const result = await sendRequest({
      method: 'POST',
      url: 'https://api.example.com/test',
      body: JSON.stringify({ name: 'Test' }),
    })

    expect(result.status).toBe(201)
    expect(mockedAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'post',
        url: 'https://api.example.com/test',
        data: JSON.stringify({ name: 'Test' }),
      })
    )
  })

  it('includes headers in request', async () => {
    const mockResponse = {
      status: 200,
      statusText: 'OK',
      headers: {},
      data: {},
    }

    mockedAxios.mockResolvedValue(mockResponse as any)

    await sendRequest({
      method: 'GET',
      url: 'https://api.example.com/test',
      headers: { Authorization: 'Bearer token' },
    })

    expect(mockedAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: { Authorization: 'Bearer token' },
      })
    )
  })

  it('handles error responses', async () => {
    const mockErrorResponse = {
      status: 404,
      statusText: 'Not Found',
      headers: {},
      data: { error: 'Not found' },
    }

    const error = {
      isAxiosError: true,
      response: mockErrorResponse,
      message: 'Request failed',
    }

    Object.defineProperty(axios, 'isAxiosError', {
      value: jest.fn().mockReturnValue(true),
      writable: true,
      configurable: true,
    })
    mockedAxios.mockRejectedValue(error as any)

    const result = await sendRequest({
      method: 'GET',
      url: 'https://api.example.com/test',
    })

    expect(result.status).toBe(404)
    expect(result.data).toEqual({ error: 'Not found' })
  })
})

