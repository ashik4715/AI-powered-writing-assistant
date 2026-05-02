import { render, screen } from '@testing-library/react'
import { Navbar } from '@/components/layout/navbar'
import { usePathname } from 'next/navigation'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn()
}))

describe('Navbar', () => {
  beforeEach(() => {
    (usePathname as jest.Mock).mockReturnValue('/dashboard')
  })

  it('renders navigation links', () => {
    render(<Navbar />)
    
    expect(screen.getByText('AI Testing Platform')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Test Suites')).toBeInTheDocument()
    expect(screen.getByText('Download Results')).toBeInTheDocument()
  })

  it('renders API Docs link', () => {
    render(<Navbar />)
    expect(screen.getByText('API Docs')).toBeInTheDocument()
  })

  it('highlights active route', () => {
    render(<Navbar />)
    const dashboardLink = screen.getByText('Dashboard')
    expect(dashboardLink).toHaveClass('text-foreground')
  })
})
