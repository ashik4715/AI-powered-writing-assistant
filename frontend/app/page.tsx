import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'AI Testing Platform',
  description: 'Test AI-powered features with comprehensive quality metrics',
}

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">AI Testing Platform</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/results/download"
            className="block p-6 bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow gradient-card"
          >
            <h2 className="text-xl font-semibold mb-2">Download Results</h2>
            <p className="text-muted-foreground">Export test results in JSON or CSV format</p>
          </Link>

          <Link
            href="/test-suites"
            className="block p-6 bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow gradient-card"
          >
            <h2 className="text-xl font-semibold mb-2">Test Suites</h2>
            <p className="text-muted-foreground">Manage and execute test suites</p>
          </Link>

          <Link
            href="/dashboard"
            className="block p-6 bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow gradient-card"
          >
            <h2 className="text-xl font-semibold mb-2">Dashboard</h2>
            <p className="text-muted-foreground">View test execution metrics and trends</p>
          </Link>
        </div>
        
        <div className="mt-12 p-6 bg-primary/5 rounded-lg border border-primary/10">
          <h3 className="text-lg font-semibold mb-2">API Documentation</h3>
          <p className="text-muted-foreground mb-4">
            Explore the full API documentation using Swagger UI. View all available endpoints,
            request/response schemas, and test the API directly from the browser.
          </p>
          <a
            href="http://localhost:3001/api-docs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Open Swagger Docs
          </a>
        </div>
      </div>
    </main>
  )
}
