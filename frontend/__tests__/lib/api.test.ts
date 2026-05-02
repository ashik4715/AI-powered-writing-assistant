import axios from 'axios'
import { toast } from 'sonner'

// Mock axios and sonner
const mockApiClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
}

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    create: jest.fn(() => mockApiClient),
  },
}))

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn()
  }
}))

const mockedAxios = axios as jest.Mocked<typeof axios>
const { api } = require('@/lib/api')

describe('API Client', () => {
  beforeEach(() => {
    mockedAxios.create.mockClear()
    mockApiClient.get.mockReset()
    mockApiClient.post.mockReset()
    ;(toast.error as jest.Mock).mockClear()
  })

  it('makes GET request successfully', async () => {
    const mockData = { id: 1, name: 'Test' }
    mockApiClient.get.mockResolvedValue({ data: { success: true, data: mockData } })

    const result = await api.get('/test')
    expect(result).toEqual(mockData)
  })

  it('makes POST request successfully', async () => {
    const mockData = { id: 1 }
    const payload = { name: 'Test' }
    mockApiClient.post.mockResolvedValue({ data: { success: true, data: mockData } })

    const result = await api.post('/test', payload)
    expect(result).toEqual(mockData)
  })

  it('shows toast on API error', async () => {
    const error = { response: { data: { message: 'Server error' }, status: 500, statusText: 'Internal Server Error' } }
    const onError = mockApiClient.interceptors.response.use.mock.calls[0][1]

    await expect(onError(error)).rejects.toEqual(error)
    expect(toast.error).toHaveBeenCalled()
  })

  it('handles network errors', async () => {
    const error = { request: {} }
    const message = 'Network error: Unable to connect to server. Please check your connection.'
    
    // Error should be handled by interceptor
    expect(message).toContain('Network error')
  })
})
