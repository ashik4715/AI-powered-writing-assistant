import axios, { AxiosError, AxiosRequestConfig } from 'axios'
import { toast } from 'sonner'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // You can add auth tokens here
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor with toast notifications
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const message = getErrorMessage(error)

    // Show toast notification for API errors
    toast.error('API Error', {
      description: message,
      duration: 5000,
      dismissible: true,
    })

    return Promise.reject(error)
  }
)

function getErrorMessage(error: AxiosError): string {
  if (error.response) {
    // Server responded with error
    const data = error.response.data as { message?: string; error?: string }
    return data?.message || data?.error || `Error ${error.response.status}: ${error.response.statusText}`
  } else if (error.request) {
    // Request made but no response
    return 'Network error: Unable to connect to server. Please check your connection.'
  } else {
    // Error in request setup
    return error.message || 'An unexpected error occurred'
  }
}

// API methods with type safety
// Backend returns { success: true, data: [...] }, so we extract data property
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.get<{ success: boolean; data: T }>(url, config).then((res) => res.data.data),

  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.post<{ success: boolean; data: T }>(url, data, config).then((res) => res.data.data),

  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.put<{ success: boolean; data: T }>(url, data, config).then((res) => res.data.data),

  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.patch<{ success: boolean; data: T }>(url, data, config).then((res) => res.data.data),

  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<{ success: boolean; data: T }>(url, config).then((res) => res.data.data),
}

export default apiClient
