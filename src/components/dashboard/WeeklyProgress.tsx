import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, isWithinInterval } from 'date-fns'
import type { Session } from '@/lib/supabase'
import { sessionService } from '@/lib/sessionService'
import { ProgressTable } from './ProgressTable'
import { formatCompactTime } from '@/lib/utils'

interface WeeklyProgressProps {
    sessions: Session[]
}

const DAILY_GOAL_SECONDS = 8 * 3600 // 8 hours

export function WeeklyProgress({ sessions }: WeeklyProgressProps) {
    const now = new Date()
    const weekStart = startOfWeek(now, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 })

    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

    const items = weekDays.map(day => {
        const dayStart = day
        const dayEnd = new Date(day)
        dayEnd.setHours(23, 59, 59, 999)

        const daySessions = sessions.filter(session =>
            isWithinInterval(parseISO(session.start_at), { start: dayStart, end: dayEnd })
        )

        let totalSeconds = 0
        daySessions.forEach(session => {
            totalSeconds += sessionService.getElapsedSeconds(session.start_at)
        })

        return {
            id: format(day, 'yyyy-MM-dd'),
            label: format(day, 'EEE'),
            subLabel: format(day, 'MMM d'),
            totalSeconds,
            isHighlighted: format(day, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd'),
        }
    })

    const totalWeekSeconds = items.reduce((sum, day) => sum + day.totalSeconds, 0)

    return (
        <ProgressTable
            title="Weekly Progress"
            items={items}
            totalSeconds={totalWeekSeconds}
            goalSeconds={DAILY_GOAL_SECONDS}
        />
    )
}