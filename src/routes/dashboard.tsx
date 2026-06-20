import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { supabase, type Session } from '@/lib/supabase'
import { ErrorBoundarySmall } from '@/components/ErrorBoundarySmall'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LayoutDashboard, Loader2 } from 'lucide-react'
import { sessionService } from '@/lib/sessionService'

export const Route = createFileRoute('/dashboard')({
    component: DashboardPage,
})

function DashboardPage() {
    const [stats, setStats] = useState({
        totalSessions: 0,
        totalTime: 0,
        todaySessions: 0,
        avgSessionTime: 0,
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data: sessions, error } = await supabase
                    .from('sessions')
                    .select('*')
                    .not('end_at', 'is', null)
                    .order('start_at', { ascending: false })

                if (error) throw error

                const completed = sessions as Session[]
                const total = completed.length

                let totalSeconds = 0
                let todaySeconds = 0
                const today = new Date()
                today.setHours(0, 0, 0, 0)

                completed.forEach(session => {
                    const duration = sessionService.getElapsedSeconds(session.start_at)
                    totalSeconds += duration

                    const sessionDate = new Date(session.start_at)
                    sessionDate.setHours(0, 0, 0, 0)
                    if (sessionDate.getTime() === today.getTime()) {
                        todaySeconds += duration
                    }
                })

                const avgSeconds = total > 0 ? Math.round(totalSeconds / total) : 0
                const hours = Math.floor(totalSeconds / 3600)
                const minutes = Math.floor((totalSeconds % 3600) / 60)

                setStats({
                    totalSessions: total,
                    totalTime: totalSeconds,
                    todaySessions: completed.filter(s => {
                        const date = new Date(s.start_at)
                        date.setHours(0, 0, 0, 0)
                        return date.getTime() === today.getTime()
                    }).length,
                    avgSessionTime: avgSeconds,
                })
            } catch (error) {
                console.error('Failed to fetch stats:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [])

    const formatTime = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        if (hours > 0) {
            return `${hours}h ${minutes}m`
        }
        return `${minutes}m`
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <ErrorBoundarySmall>
            <div className="container max-w-4xl mx-auto p-4">
                <div className="flex items-center gap-3 mb-6">
                    <LayoutDashboard className="h-8 w-8 text-primary" />
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Total Sessions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">{stats.totalSessions}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Total Time</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">{formatTime(stats.totalTime)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Today's Sessions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">{stats.todaySessions}</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ErrorBoundarySmall>
    )
}