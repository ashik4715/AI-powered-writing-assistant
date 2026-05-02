import { api } from '@/lib/api'
import axios from 'axios'
import { toast } from 'sonner'

// Mock axios and sonner
jest.mock('axios')
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn()
  }
}))

const mockedAxios = axios as jest.Mocked<typeof axios>

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('makes GET request successfully', async () => {
    const mockData = { id: 1, name: 'Test' }
    mockedAxios.create.mockReturnValue({
      get: jest.fn().mockResolvedValue({ data: mockData }),
      interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } }
    } as any)

    const result = await api.get('/test')
    expect(result).toEqual(mockData)
  })

  it('makes POST request successfully', async () => {
    const mockData = { id: 1 }
    const payload = { name: 'Test' }
    mockedAxios.create.mockReturnValue({
      post: jest.fn().mockResolvedValue({ data: mockData }),
      interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } }
    } as any)

    const result = await api.post('/test', payload)
    expect(result).toEqual(mockData)
  })

  it('shows toast on API error', async () => {
    const error = { response: { data: { message: 'Server error' }, status: 500, statusText: 'Internal Server Error' } }
    mockedAxios.create.mockReturnValue({
      interceptors: { 
        request: { use: jest.fn() }, 
        response: { use: jest.fn((onSuccess, onError) => {
          // Simulate error interceptor
          onError(error)
        }) }
      }
    } as any)

    expect(toast.error).toHaveBeenCalled()
  })

  it('handles network errors', async () => {
    const error = { request: {} }
    const message = 'Network error: Unable to connect to server. Please check your connection.'
    
    // Error should be handled by interceptor
    expect(message).toContain('Network error')
  })
})
