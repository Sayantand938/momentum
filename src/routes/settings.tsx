import { createFileRoute } from '@tanstack/react-router'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/settings')({
    component: () => (
        <div className="container max-w-2xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">⚙️ Settings</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Appearance</CardTitle>
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

            {/* You can add more settings sections here */}
        </div>
    ),
})