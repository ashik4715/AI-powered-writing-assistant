import { renderHook } from '@testing-library/react'
import { useToast } from '@/hooks/use-toast'
import { toast } from 'sonner'

// Mock sonner
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    info: jest.fn(),
    warning: jest.fn()
  }
}))

describe('useToast', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    console.error = jest.fn()
  })

  it('shows error toast with message', () => {
    const { result } = renderHook(() => useToast())
    result.current.showError('Error message')
    
    expect(toast.error).toHaveBeenCalledWith('Error message', {
      description: undefined,
      duration: 5000,
      dismissible: true
    })
  })

  it('shows error toast with Error object', () => {
    const { result } = renderHook(() => useToast())
    const error = new Error('Test error')
    result.current.showError('Error message', error)
    
    expect(toast.error).toHaveBeenCalledWith('Error message', {
      description: 'Test error',
      duration: 5000,
      dismissible: true
    })
  })

  it('shows success toast', () => {
    const { result } = renderHook(() => useToast())
    result.current.showSuccess('Success!', 'Operation completed')
    
    expect(toast.success).toHaveBeenCalledWith('Success!', {
      description: 'Operation completed',
      duration: 3000,
      dismissible: true
    })
  })

  it('shows info toast', () => {
    const { result } = renderHook(() => useToast())
    result.current.showInfo('Info', 'Some information')
    
    expect(toast.info).toHaveBeenCalledWith('Info', {
      description: 'Some information',
      duration: 4000,
      dismissible: true
    })
  })

  it('shows warning toast', () => {
    const { result } = renderHook(() => useToast())
    result.current.showWarning('Warning', 'Be careful')
    
    expect(toast.warning).toHaveBeenCalledWith('Warning', {
      description: 'Be careful',
      duration: 5000,
      dismissible: true
    })
  })
})
