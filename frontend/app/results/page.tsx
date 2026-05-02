'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Download, RefreshCw, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

interface TestExecution {
  id: string
  testCaseName: string
  status: string
  verdict: string | null
  startedAt: string
  completedAt: string | null
  durationMs: number | null
  promptUsed: string
  aiResponse: string
}

export default function ResultsPage() {
  const { data: executions, isLoading, error, refetch } = useQuery<TestExecution[]>({
    queryKey: ['test-executions'],
    queryFn: () => api.get('/test-executions'),
  })

  const getStatusIcon = (status: string, verdict: string | null) => {
    if (verdict === 'pass') return <CheckCircle className="h-5 w-5 text-green-500" />
    if (verdict === 'fail') return <XCircle className="h-5 w-5 text-red-500" />
    if (status === 'running') return <Clock className="h-5 w-5 text-yellow-500 animate-pulse" />
    return <AlertCircle className="h-5 w-5 text-gray-400" />
  }

  const getStatusBadge = (status: string, verdict: string | null) => {
    if (verdict === 'pass') return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Pass</Badge>
    if (verdict === 'fail') return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Fail</Badge>
    if (verdict === 'partial') return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Partial</Badge>
    if (status === 'running') return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Running</Badge>
    return <Badge variant="secondary">{status}</Badge>
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-lg font-semibold mb-2">Failed to load results</h2>
          <p className="text-muted-foreground mb-4">Please try refreshing the page</p>
          <Button onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Test Results</h1>
            <p className="text-muted-foreground mt-1">
              View and manage test execution results
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button asChild>
              <Link href="/results/download">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Link>
            </Button>
          </div>
        </div>

        {executions && executions.length > 0 ? (
          <div className="space-y-4">
            {executions.map((execution) => (
              <Card key={execution.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(execution.status, execution.verdict)}
                      <div>
                        <CardTitle className="text-base">{execution.testCaseName}</CardTitle>
                        <CardDescription>
                          {execution.startedAt && format(new Date(execution.startedAt), 'MMM d, yyyy HH:mm')}
                          {execution.durationMs && (
                            <span className="ml-2">({Math.round(execution.durationMs / 1000)}s)</span>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(execution.status, execution.verdict)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Prompt:</p>
                    <p className="text-sm bg-muted p-2 rounded">{execution.promptUsed}</p>
                  </div>
                  {execution.aiResponse && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">AI Response:</p>
                      <p className="text-sm bg-muted p-2 rounded line-clamp-3">{execution.aiResponse}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No results yet</h3>
              <p className="text-muted-foreground mb-4">
                Run some tests to see results here
              </p>
              <Button asChild>
                <Link href="/test-suites">Go to Test Suites</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
