import {
    format,
    parseISO,
    startOfMonth,
    endOfMonth,
    endOfWeek,
    eachWeekOfInterval,
    isWithinInterval
} from 'date-fns'
import type { Session } from '@/lib/supabase'
import { getDurationSeconds } from '@/lib/utils'
import { TIME, DEFAULTS } from '@/constants'
import { ProgressTable } from './ProgressTable'

interface WeeklyRecordsProps {
    sessions: Session[]
}

export function WeeklyRecords({ sessions }: WeeklyRecordsProps) {
    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)

    const weeks = eachWeekOfInterval(
        { start: monthStart, end: monthEnd },
        { weekStartsOn: DEFAULTS.WEEK_STARTS_ON }
    )

    const items = weeks.map((weekStart) => {
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: DEFAULTS.WEEK_STARTS_ON })

        const weekSessions = sessions.filter(session =>
            isWithinInterval(parseISO(session.start_at), { start: weekStart, end: weekEnd })
        )

        let totalSeconds = 0
        weekSessions.forEach(session => {
            const duration = getDurationSeconds(session.start_at, session.end_at!)
            totalSeconds += duration
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
            goalSeconds={TIME.WEEKLY_GOAL}
        />
    )
}