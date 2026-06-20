import { ErrorBoundarySmall } from './ErrorBoundarySmall'
import { Card, CardContent } from '@/components/ui/card'
import { LayoutDashboard, Loader2 } from 'lucide-react'
import { StatsSection } from './dashboard/StatsSection'
import { WeeklyProgress } from './dashboard/WeeklyProgress'
import { WeeklyRecords } from './dashboard/WeeklyRecords'
import { HourlyDistribution } from './dashboard/HourlyDistribution'
import { useDashboardStats } from './dashboard/useDashboardStats'
import { getShiftStats } from './dashboard/shiftUtils'
import { getFocusPoints } from '@/lib/hourlyUtils'

function DashboardContent() {
    const { loading, todayStats, weekStats, monthStats, weekSessions, monthSessions, todaySessions, formatTime } = useDashboardStats()

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    const hasData = todayStats || weekStats || monthStats

    // Calculate shift stats for each period
    const todayShiftStats = todaySessions ? getShiftStats(todaySessions) : null
    const weekShiftStats = weekSessions ? getShiftStats(weekSessions) : null
    const monthShiftStats = monthSessions ? getShiftStats(monthSessions) : null

    // 👇 Calculate Focus Points for each period (each 30m+ session = 1 point)
    const todayFocusPoints = getFocusPoints(todaySessions)
    const weekFocusPoints = getFocusPoints(weekSessions)
    const monthFocusPoints = getFocusPoints(monthSessions)

    return (
        <div className="container max-w-6xl mx-auto p-4 pt-2">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <LayoutDashboard className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold">Dashboard</h1>
            </div>

            {/* Today Section */}
            <StatsSection
                title="Today"
                stats={todayStats}
                formatTime={formatTime}
                shiftStats={todayShiftStats}
                focusPoints={todayFocusPoints}
            />

            {/* Hourly Distribution - Today */}
            {todaySessions && todaySessions.length > 0 && (
                <div className="mt-4">
                    <HourlyDistribution sessions={todaySessions} />
                </div>
            )}

            {/* This Week Section */}
            <div className="mt-8">
                <StatsSection
                    title="This Week"
                    stats={weekStats}
                    formatTime={formatTime}
                    shiftStats={weekShiftStats}
                    focusPoints={weekFocusPoints}
                />

                {weekSessions && weekSessions.length > 0 && (
                    <div className="mt-4">
                        <WeeklyProgress sessions={weekSessions} />
                    </div>
                )}
            </div>

            {/* This Month Section */}
            <div className="mt-8">
                <StatsSection
                    title="This Month"
                    stats={monthStats}
                    formatTime={formatTime}
                    shiftStats={monthShiftStats}
                    focusPoints={monthFocusPoints}
                />

                {monthSessions && monthSessions.length > 0 && (
                    <div className="mt-4">
                        <WeeklyRecords sessions={monthSessions} />
                    </div>
                )}
            </div>

            {/* No Data Message */}
            {!hasData && (
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