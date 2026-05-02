'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Download, FileJson, File as FilePdf, FileSpreadsheet, FileText, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function ResultsDownloadPage() {
  const [loading, setLoading] = useState(false)
  const [format, setFormat] = useState<'json' | 'csv' | 'pdf' | 'doc' | 'xls'>('json')
  const [limit, setLimit] = useState(1000)

  const handleDownload = async () => {
    setLoading(true)

    try {
      let url = ''
      let fileExt = ''
      
      if (format === 'json' || format === 'csv') {
        url = `${API_BASE_URL}/api/v1/results/export?format=${format}&limit=${limit}`
        fileExt = format
      } else {
        url = `${API_BASE_URL}/api/export/${format}`
        fileExt = format === 'xls' ? 'xls' : 'html'
      }
      
      const response = await fetch(url, { method: 'GET' })

      if (!response.ok) {
        throw new Error(`Failed to download: ${response.statusText}`)
      }

      const data = await response.text()
      
      let mimeType = 'application/json'
      if (format === 'csv') mimeType = 'text/csv'
      if (format === 'pdf') mimeType = 'text/html'
      if (format === 'doc') mimeType = 'application/msword'
      if (format === 'xls') mimeType = 'application/vnd.ms-excel'
      
      const blob = new Blob([data], { type: mimeType })
      
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `test-results-${new Date().toISOString().split('T')[0]}.${fileExt}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)

      toast.success(`Downloaded ${format.toUpperCase()} file`, {
        description: `Exported test results`,
      })
    } catch (error) {
      toast.error('Download failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchSummary = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/results/summary`)
      if (!response.ok) throw new Error('Failed to fetch summary')
      
      const data = await response.json()
      toast.info('Results Summary', {
        description: `Total: ${data.data?.summary?.totalExecutions || 0}, Pass Rate: ${data.data?.summary?.passRate || 0}%`,
      })
    } catch (error) {
      toast.error('Failed to fetch summary')
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Download Test Results</h1>
          <p className="text-muted-foreground mt-1">
            Export your test execution data for analysis and reporting
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Format Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Export Format</CardTitle>
              <CardDescription>Choose your preferred file format</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <button
                onClick={() => setFormat('json')}
                className={cn(
                  'flex items-center w-full p-4 rounded-lg border-2 transition-all text-left',
                  format === 'json'
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-muted-foreground'
                )}
              >
                <FileJson className="h-8 w-8 text-blue-600 mr-4" />
                <div>
                  <div className="font-medium">JSON Format</div>
                  <div className="text-sm text-muted-foreground">Full data with all metrics</div>
                </div>
              </button>

              <button
                onClick={() => setFormat('csv')}
                className={cn(
                  'flex items-center w-full p-4 rounded-lg border-2 transition-all text-left',
                  format === 'csv'
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-muted-foreground'
                )}
              >
                <FileSpreadsheet className="h-8 w-8 text-green-600 mr-4" />
                <div>
                  <div className="font-medium">CSV Format</div>
                  <div className="text-sm text-muted-foreground">Spreadsheet compatible</div>
                </div>
              </button>

              <button
                onClick={() => setFormat('pdf')}
                className={cn(
                  'flex items-center w-full p-4 rounded-lg border-2 transition-all text-left',
                  format === 'pdf'
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-muted-foreground'
                )}
              >
                <FilePdf className="h-8 w-8 text-red-600 mr-4" />
                <div>
                  <div className="font-medium">PDF Report</div>
                  <div className="text-sm text-muted-foreground">Formatted report with charts</div>
                </div>
              </button>

              <button
                onClick={() => setFormat('doc')}
                className={cn(
                  'flex items-center w-full p-4 rounded-lg border-2 transition-all text-left',
                  format === 'doc'
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-muted-foreground'
                )}
              >
                <FileText className="h-8 w-8 text-blue-600 mr-4" />
                <div>
                  <div className="font-medium">Word Document</div>
                  <div className="text-sm text-muted-foreground">DOC format for editing</div>
                </div>
              </button>

              <button
                onClick={() => setFormat('xls')}
                className={cn(
                  'flex items-center w-full p-4 rounded-lg border-2 transition-all text-left',
                  format === 'xls'
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-muted-foreground'
                )}
              >
                <FileSpreadsheet className="h-8 w-8 text-green-700 mr-4" />
                <div>
                  <div className="font-medium">Excel Spreadsheet</div>
                  <div className="text-sm text-muted-foreground">Detailed XLS export</div>
                </div>
              </button>
            </CardContent>
          </Card>

          {/* Options */}
          <Card>
            <CardHeader>
              <CardTitle>Export Options</CardTitle>
              <CardDescription>Configure your export settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Maximum Records</label>
                <input
                  type="number"
                  min={1}
                  max={10000}
                  value={limit}
                  onChange={(e) => setLimit(Math.min(10000, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="mt-1 w-full px-3 py-2 border rounded-md bg-background"
                />
                <p className="text-xs text-muted-foreground mt-1">Limit: 1-10,000 records</p>
              </div>

              <Button variant="outline" onClick={fetchSummary} className="w-full">
                View Summary Statistics
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Ready to Download</h2>
                <p className="text-sm text-muted-foreground">
                  Exporting test results in {format.toUpperCase()} format
                </p>
              </div>

              <Button onClick={handleDownload} disabled={loading} size="lg">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download Results
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* API Info */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle>API Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              You can also access these endpoints directly via the REST API:
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <code className="bg-muted px-2 py-1 rounded">GET /api/v1/results/export?format=json|csv&limit=N</code>
                <span className="text-muted-foreground ml-2">— Export test results</span>
              </li>
              <li>
                <code className="bg-muted px-2 py-1 rounded">GET /api/v1/results/summary</code>
                <span className="text-muted-foreground ml-2">— Get execution summary</span>
              </li>
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">
              Full API documentation available at{' '}
              <a
                href="http://localhost:3001/api-docs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Swagger UI
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
