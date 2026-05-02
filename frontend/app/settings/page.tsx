'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings, Bell, Shield, Database, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure your AI Testing Platform
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-base">General Settings</CardTitle>
                <CardDescription>Platform configuration</CardDescription>
              </div>
              <Settings className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Dark Mode</span>
                <Button variant="outline" size="sm" disabled>Coming Soon</Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Language</span>
                <Button variant="outline" size="sm" disabled>English</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-base">Notifications</CardTitle>
                <CardDescription>Alert preferences</CardDescription>
              </div>
              <Bell className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Email Alerts</span>
                <Button variant="outline" size="sm" disabled>Coming Soon</Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Test Completion</span>
                <Button variant="outline" size="sm" disabled>Coming Soon</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-base">Security</CardTitle>
                <CardDescription>Access control</CardDescription>
              </div>
              <Shield className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">API Keys</span>
                <Button variant="outline" size="sm" disabled>Manage</Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">User Access</span>
                <Button variant="outline" size="sm" disabled>Coming Soon</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-base">Database</CardTitle>
                <CardDescription>Data management</CardDescription>
              </div>
              <Database className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Export Data</span>
                <Button variant="outline" size="sm" disabled>Export</Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Clear Test Data</span>
                <Button variant="outline" size="sm" disabled>Clear</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Full settings functionality will be available in a future update. 
              Current settings are managed through environment variables.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
