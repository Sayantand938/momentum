import { useState, useEffect } from 'react'
import { supabase, type Session } from '@/lib/supabase'
import { sessionService } from '@/lib/sessionService'
import { createLogger } from '@/lib/logger'
import { ErrorBoundarySmall } from './ErrorBoundarySmall'
import { Card, CardContent } from '@/components/ui/card'
import {
    LayoutDashboard,
    Loader2,
    Clock,
    Calendar,
    TrendingUp,
    TrendingDown,
    Target,
    BarChart3,
    Activity
} from 'lucide-react'
import { parseISO, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'

const log = createLogger('Dashboard')

interface Stats {
    totalTime: number
    totalSessions: number
    mostProductiveSlot: string
    leastProductiveSlot: string
    avgSessionTime: number
}

function DashboardContent() {
    const [loading, setLoading] = useState(true)
    const [todayStats, setTodayStats] = useState<Stats | null>(null)
    const [weekStats, setWeekStats] = useState<Stats | null>(null)
    const [monthStats, setMonthStats] = useState<Stats | null>(null)

    useEffect(() => {
        fetchSessions()
    }, [])

    const fetchSessions = async () => {
        try {
            log.debug('📊 Fetching sessions for dashboard...')
            const { data, error } = await supabase
                .from('sessions')
                .select('*')
                .not('end_at', 'is', null)
                .order('start_at', { ascending: false })

            if (error) throw error

            const completed = data as Session[]
            log.info(`✅ Fetched ${completed.length} completed sessions`)
            calculateStats(completed)
        } catch (error) {
            log.error('❌ Error fetching sessions:', error)
        } finally {
            setLoading(false)
        }
    }

    const calculateStats = (sessions: Session[]) => {
        const now = new Date()

        // Define date ranges
        const todayStart = startOfDay(now)
        const todayEnd = endOfDay(now)
        const weekStart = startOfWeek(now, { weekStartsOn: 1 })
        const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
        const monthStart = startOfMonth(now)
        const monthEnd = endOfMonth(now)

        // Filter sessions by date range
        const todaySessions = sessions.filter(s =>
            isWithinInterval(parseISO(s.start_at), { start: todayStart, end: todayEnd })
        )
        const weekSessions = sessions.filter(s =>
            isWithinInterval(parseISO(s.start_at), { start: weekStart, end: weekEnd })
        )
        const monthSessions = sessions.filter(s =>
            isWithinInterval(parseISO(s.start_at), { start: monthStart, end: monthEnd })
        )

        setTodayStats(calculateStatsForSessions(todaySessions))
        setWeekStats(calculateStatsForSessions(weekSessions))
        setMonthStats(calculateStatsForSessions(monthSessions))
    }

    const calculateStatsForSessions = (sessions: Session[]): Stats => {
        if (sessions.length === 0) {
            return {
                totalTime: 0,
                totalSessions: 0,
                mostProductiveSlot: 'No data',
                leastProductiveSlot: 'No data',
                avgSessionTime: 0
            }
        }

        let totalTime = 0
        const durations: number[] = []

        sessions.forEach(session => {
            const duration = sessionService.getElapsedSeconds(session.start_at)
            totalTime += duration
            durations.push(duration)
        })

        const avgSessionTime = Math.round(totalTime / sessions.length)

        // Find most and least productive slots (by hour of day)
        const hourMap: Record<number, number> = {}
        sessions.forEach(session => {
            const hour = parseISO(session.start_at).getHours()
            hourMap[hour] = (hourMap[hour] || 0) + 1
        })

        let mostHour = -1
        let leastHour = -1
        let maxCount = -1
        let minCount = Infinity

        Object.entries(hourMap).forEach(([hour, count]) => {
            const h = parseInt(hour)
            if (count > maxCount) {
                maxCount = count
                mostHour = h
            }
            if (count < minCount) {
                minCount = count
                leastHour = h
            }
        })

        const formatHour = (hour: number) => {
            if (hour === -1) return 'No data'
            const ampm = hour >= 12 ? 'PM' : 'AM'
            const h12 = hour % 12 || 12
            return `${h12}:00 ${ampm}`
        }

        return {
            totalTime,
            totalSessions: sessions.length,
            mostProductiveSlot: mostHour !== -1 ? formatHour(mostHour) : 'No data',
            leastProductiveSlot: leastHour !== -1 ? formatHour(leastHour) : 'No data',
            avgSessionTime
        }
    }

    const formatTime = (seconds: number): string => {
        if (seconds === 0) return '0s'
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const remainingSeconds = seconds % 60

        if (hours > 0) {
            return `${hours}h ${minutes}m`
        }
        if (minutes > 0) {
            return `${minutes}m ${remainingSeconds}s`
        }
        return `${remainingSeconds}s`
    }

    const StatCard = ({ title, value, icon: Icon, color = 'text-primary' }: {
        title: string,
        value: string | number,
        icon: React.ElementType,
        color?: string
    }) => (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">{title}</p>
                        <p className="text-2xl font-bold mt-1">{value}</p>
                    </div>
                    <div className={`p-2 rounded-full bg-primary/10 ${color}`}>
                        <Icon className="h-5 w-5" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )

    const renderStatsSection = (title: string, stats: Stats | null, Icon: React.ElementType) => {
        if (!stats) return null

        return (
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">{title}</h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Time"
                        value={formatTime(stats.totalTime)}
                        icon={Clock}
                    />
                    <StatCard
                        title="Total Sessions"
                        value={stats.totalSessions}
                        icon={Activity}
                    />
                    <StatCard
                        title="Most Productive"
                        value={stats.mostProductiveSlot}
                        icon={TrendingUp}
                        color="text-green-500"
                    />
                    <StatCard
                        title="Least Productive"
                        value={stats.leastProductiveSlot}
                        icon={TrendingDown}
                        color="text-red-500"
                    />
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="container max-w-6xl mx-auto p-4 pt-2">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <LayoutDashboard className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold">Dashboard</h1>
            </div>

            {/* Today Section */}
            {renderStatsSection('Today', todayStats, Calendar)}

            {/* This Week Section */}
            <div className="mt-8">
                {renderStatsSection('This Week', weekStats, BarChart3)}
            </div>

            {/* This Month Section */}
            <div className="mt-8">
                {renderStatsSection('This Month', monthStats, Target)}
            </div>

            {/* No Data Message */}
            {!todayStats && !weekStats && !monthStats && (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        <p>No session data available yet</p>
                        <p className="text-sm mt-1">Start your first focus session to see statistics!</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

// Main Dashboard export with error boundary
export default function Dashboard() {
    return (
        <ErrorBoundarySmall
            fallback={
                <div className="flex flex-col items-center gap-4 p-6">
                    <p className="text-sm text-muted-foreground">
                        ⚠️ Dashboard encountered an error. Please refresh the page.
                    </p>
                    <button
                        className="px-4 py-2 text-sm rounded-lg border border-border/40 hover:bg-muted transition-colors"
                        onClick={() => window.location.reload()}
                    >
                        Refresh
                    </button>
                </div>
            }
        >
            <DashboardContent />
        </ErrorBoundarySmall>
    )
}