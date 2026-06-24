import { ErrorBoundarySmall } from './ErrorBoundarySmall'
import { Card, CardContent } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { LayoutDashboard, Timer } from 'lucide-react'
import { StatsGrid } from './dashboard/StatsGrid'  // Changed from StatsSection
import { useDashboardStats } from '@/hooks/useDashboardStats'  // Changed path
import { getShiftStats } from './dashboard/shiftUtils'
import type { Session } from '@/lib/supabase'

function DashboardContent() {
    const { loading, todayStats, weekStats, monthStats, todaySessions, weekSessions, monthSessions, formatTime } = useDashboardStats()

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
                <Spinner className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    const hasData = todayStats || weekStats || monthStats

    // Calculate shift stats
    const todayShiftStats = todaySessions ? getShiftStats(todaySessions) : null
    const weekShiftStats = weekSessions ? getShiftStats(weekSessions) : null
    const monthShiftStats = monthSessions ? getShiftStats(monthSessions) : null

    // Calculate Focus Score for Today (percentage of sessions that reached 30 minutes)
    const todayFocusScore = todaySessions && todaySessions.length > 0 ?
        Math.round((todaySessions.filter((s: Session) => {
            const duration = Math.floor((new Date(s.end_at!).getTime() - new Date(s.start_at).getTime()) / 1000)
            return duration >= 1800
        }).length / todaySessions.length) * 100) : 0

    // Find best day this week
    const getBestDay = (sessions: Session[]): string => {
        if (!sessions || sessions.length === 0) return 'No data'
        const dayMap: Record<string, number> = {}
        sessions.forEach(s => {
            const day = new Date(s.start_at).toLocaleDateString('en-US', { weekday: 'short' })
            const duration = Math.floor((new Date(s.end_at!).getTime() - new Date(s.start_at).getTime()) / 1000)
            dayMap[day] = (dayMap[day] || 0) + duration
        })
        let bestDay = ''
        let bestTime = 0
        Object.entries(dayMap).forEach(([day, time]) => {
            if (time > bestTime) {
                bestTime = time
                bestDay = day
            }
        })
        return bestDay || 'No data'
    }

    // Calculate streak (consecutive days with sessions)
    const getStreak = (sessions: Session[]): number => {
        if (!sessions || sessions.length === 0) return 0
        const days = new Set(sessions.map(s => new Date(s.start_at).toDateString()))
        let streak = 0
        const today = new Date()
        for (let i = 0; i < 30; i++) {
            const d = new Date(today)
            d.setDate(d.getDate() - i)
            if (days.has(d.toDateString())) {
                streak++
            } else {
                break
            }
        }
        return streak
    }

    const weekBestDay = weekSessions ? getBestDay(weekSessions) : 'No data'
    const monthStreak = monthSessions ? getStreak(monthSessions) : 0

    return (
        <div className="container max-w-4xl mx-auto p-4 pt-2">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <LayoutDashboard className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <span className="text-xs text-muted-foreground ml-auto">
                    {new Date().toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric'
                    })}
                </span>
            </div>

            {/* Today Section */}
            <StatsGrid
                title="Today"
                stats={todayStats}
                formatTime={formatTime}
                shiftStats={todayShiftStats}
                showBonus={true}
                extraCards={{
                    extra1: {
                        id: 'completion-rate',
                        title: 'Completion Rate',
                        value: todayStats ? `${Math.round((todayStats.totalTime / (8 * 3600)) * 100)}%` : '0%',
                        icon: 'TrendingUp',
                        color: 'text-green-500',
                        tooltip: 'Progress toward 8-hour daily goal'
                    },
                    extra2: {
                        id: 'focus-score',
                        title: 'Focus Score',
                        value: `${todayFocusScore}%`,
                        icon: 'Activity',
                        color: 'text-primary',
                        tooltip: 'Percentage of sessions that reached 30 minutes'
                    }
                }}
            />

            {/* This Week Section */}
            <div className="mt-8">
                <StatsGrid
                    title="This Week"
                    stats={weekStats}
                    formatTime={formatTime}
                    shiftStats={weekShiftStats}
                    showBonus={true}
                    extraCards={{
                        extra1: {
                            id: 'avg-daily',
                            title: 'Avg Daily',
                            value: weekStats ? formatTime(Math.round(weekStats.totalTime / 7)) : '0m',
                            icon: 'Clock',
                            color: 'text-primary',
                            tooltip: 'Average time per day this week'
                        },
                        extra2: {
                            id: 'best-day',
                            title: 'Best Day',
                            value: weekBestDay,
                            icon: 'TrendingUp',
                            color: 'text-green-500',
                            tooltip: 'Most productive day this week'
                        }
                    }}
                />
            </div>

            {/* This Month Section */}
            <div className="mt-8">
                <StatsGrid
                    title="This Month"
                    stats={monthStats}
                    formatTime={formatTime}
                    shiftStats={monthShiftStats}
                    showBonus={true}
                    extraCards={{
                        extra1: {
                            id: 'days-active',
                            title: 'Active Days',
                            value: monthSessions ? new Set(monthSessions.map((s: Session) => new Date(s.start_at).toDateString())).size : 0,
                            icon: 'CalendarDays',
                            color: 'text-primary',
                            tooltip: 'Number of days with at least one session'
                        },
                        extra2: {
                            id: 'streak',
                            title: 'Streak',
                            value: `${monthStreak} day${monthStreak !== 1 ? 's' : ''}`,
                            icon: 'Activity',
                            color: 'text-primary',
                            tooltip: 'Consecutive days with sessions'
                        }
                    }}
                />
            </div>

            {/* No Data Message */}
            {!hasData && (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                        <Timer className="h-12 w-12 mb-4 text-muted-foreground/50" />
                        <p className="text-lg font-medium text-foreground">No session data available yet</p>
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