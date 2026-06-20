import { createFileRoute } from '@tanstack/react-router'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings, Palette } from 'lucide-react'

export const Route = createFileRoute('/settings')({
    component: () => (
        <div className="container max-w-2xl mx-auto p-4">
            {/* Page Header */}
            <div className="flex items-center gap-3 mb-6">
                <Settings className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold">Settings</h1>
            </div>

            {/* Appearance */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Palette className="h-5 w-5 text-muted-foreground" />
                        <CardTitle>Appearance</CardTitle>
                    </div>
                    <CardDescription>
                        Customize how Momentum looks and feels
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Theme</p>
                            <p className="text-sm text-muted-foreground">
                                Switch between dark and light mode
                            </p>
                        </div>
                        <ThemeToggle />
                    </div>
                </CardContent>
            </Card>
        </div>
    ),
})