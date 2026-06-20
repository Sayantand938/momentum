import { format, parseISO, startOfMonth, endOfMonth, endOfWeek, eachWeekOfInterval, isWithinInterval } from 'date-fns'
import type { Session } from '@/lib/supabase'
import { sessionService } from '@/lib/sessionService'
import { ProgressTable } from './ProgressTable'
import { formatCompactTime } from '@/lib/utils'

interface WeeklyRecordsProps {
    sessions: Session[]
}

const WEEKLY_GOAL_SECONDS = 56 * 3600 // 56 hours (7 days × 8 hours)

export function WeeklyRecords({ sessions }: WeeklyRecordsProps) {
    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)

    const weeks = eachWeekOfInterval(
        { start: monthStart, end: monthEnd },
        { weekStartsOn: 1 }
    )

    const items = weeks.map((weekStart) => {
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })

        const weekSessions = sessions.filter(session =>
            isWithinInterval(parseISO(session.start_at), { start: weekStart, end: weekEnd })
        )

        let totalSeconds = 0
        weekSessions.forEach(session => {
            totalSeconds += sessionService.getElapsedSeconds(session.start_at)
        })

        const isCurrentWeek = isWithinInterval(now, { start: weekStart, end: weekEnd })

        return {
            id: format(weekStart, 'w'),
            label: `Week ${format(weekStart, 'w')}`,
            subLabel: format(weekStart, 'MMM d'),
            totalSeconds,
            isHighlighted: isCurrentWeek,
        }
    })

    const totalMonthSeconds = items.reduce((sum, week) => sum + week.totalSeconds, 0)

    return (
        <ProgressTable
            title="Monthly Progress"
            items={items}
            totalSeconds={totalMonthSeconds}
            goalSeconds={WEEKLY_GOAL_SECONDS}
        />
    )
}