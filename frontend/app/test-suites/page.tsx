'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { FlaskConical, Play, FileText, ChevronRight, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

interface TestSuite {
  id: string
  name: string
  description: string
  category: string
  testCases: TestCase[]
}

interface TestCase {
  id: string
  name: string
  description: string
  prompt: string
  testType: string
}

export default function TestSuitesPage() {
  const [expandedSuite, setExpandedSuite] = useState<string | null>(null)

  const { data: testSuites, isLoading, error } = useQuery<TestSuite[]>({
    queryKey: ['test-suites'],
    queryFn: () => api.get('/test-suites'),
  })

  const runTest = async (testCaseId: string) => {
    try {
      toast.info('Starting test execution...')
      await api.post(`/test-executions`, { testCaseId })
      toast.success('Test execution started successfully')
    } catch (error) {
      // Error is handled by API interceptor
    }
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
          <h2 className="text-lg font-semibold mb-2">Failed to load test suites</h2>
          <p className="text-muted-foreground">Please try refreshing the page</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Test Suites</h1>
          <p className="text-muted-foreground mt-1">
            Manage and execute AI test cases
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testSuites?.map((suite) => (
            <Card key={suite.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-md ${
                    suite.category === 'functional' ? 'bg-blue-50' :
                    suite.category === 'non-functional' ? 'bg-green-50' :
                    'bg-purple-50'
                  }`}>
                    <FlaskConical className={`h-5 w-5 ${
                      suite.category === 'functional' ? 'text-blue-600' :
                      suite.category === 'non-functional' ? 'text-green-600' :
                      'text-purple-600'
                    }`} />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground uppercase">
                    {suite.category}
                  </span>
                </div>
                <CardTitle className="mt-2">{suite.name}</CardTitle>
                <CardDescription>{suite.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Test Cases:</span>
                    <span className="font-medium">{suite.testCases?.length || 0}</span>
                  </div>
                  
                  <Button
                    variant="ghost"
                    className="w-full justify-between"
                    onClick={() => setExpandedSuite(
                      expandedSuite === suite.id ? null : suite.id
                    )}
                  >
                    <span>View Test Cases</span>
                    <ChevronRight className={`h-4 w-4 transition-transform ${
                      expandedSuite === suite.id ? 'rotate-90' : ''
                    }`} />
                  </Button>

                  {expandedSuite === suite.id && (
                    <div className="space-y-2 pt-2 border-t">
                      {suite.testCases?.map((testCase) => (
                        <div
                          key={testCase.id}
                          className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                        >
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{testCase.name}</span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => runTest(testCase.id)}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
