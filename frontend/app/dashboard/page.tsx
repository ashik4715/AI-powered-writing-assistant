'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import {
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/shadcn-ui'
import { api } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle, Clock, Download, FlaskConical, TrendingUp, XCircle } from 'lucide-react'

interface DashboardStats {
  totalTestSuites: number
  totalTestCases: number
  totalExecutions: number
  passRate: number
  recentExecutions: Array<{
    id: string
    testCaseName: string
    status: string
    verdict: string | null
    startedAt: string
  }>
}

const statsCards = [
  {
    title: 'Test Suites',
    icon: FlaskConical,
    key: 'totalTestSuites' as const,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    title: 'Test Cases',
    icon: CheckCircle,
    key: 'totalTestCases' as const,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    title: 'Executions',
    icon: Clock,
    key: 'totalExecutions' as const,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    title: 'Pass Rate',
    icon: TrendingUp,
    key: 'passRate' as const,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    format: (value: number) => `${value.toFixed(1)}%`,
  },
]

export default function DashboardPage() {
  const { data: stats, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/dashboard/stats'),
  })

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
          <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-lg font-semibold mb-2">Failed to load dashboard</h2>
          <p className="text-muted-foreground">Please try refreshing the page</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Overview of your AI testing platform metrics
            </p>
          </div>
          <Button onClick={() => window.location.href='/results/download'}>
            <Download className="mr-2 h-4 w-4" />
            Export Results
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((card) => {
            const Icon = card.icon
            const value = stats?.[card.key] ?? 0
            
            return (
              <Card key={card.key}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {card.title}
                  </CardTitle>
                  <div className={`${card.bgColor} p-2 rounded-lg`}>
                    <Icon className={`h-4 w-4 ${card.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {card.format ? card.format(value as number) : value}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Recent Executions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Test Executions</CardTitle>
            <CardDescription>
              Latest test runs and their results
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.recentExecutions && stats.recentExecutions.length > 0 ? (
              <div className="space-y-4">
                {stats.recentExecutions.map((execution) => (
                  <div
                    key={execution.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      {execution.verdict === 'pass' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : execution.verdict === 'fail' ? (
                        <XCircle className="h-5 w-5 text-red-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-yellow-500" />
                      )}
                      <div>
                        <p className="font-medium">{execution.testCaseName}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(execution.startedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          execution.verdict === 'pass'
                            ? 'default'
                            : execution.verdict === 'fail'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {execution.verdict || execution.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p>No recent executions found</p>
                <Button variant="outline" className="mt-4" onClick={() => window.location.href='/test-suites'}>
                  Run Tests
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
