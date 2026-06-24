import {
    format,
    parseISO,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isWithinInterval
} from 'date-fns'
import type { Session } from '@/lib/supabase'
import { getDurationSeconds } from '@/lib/utils'
import { TIME, DEFAULTS } from '@/constants'
import { ProgressTable } from './ProgressTable'

interface WeeklyProgressProps {
    sessions: Session[]
}

export function WeeklyProgress({ sessions }: WeeklyProgressProps) {
    const now = new Date()
    const weekStart = startOfWeek(now, { weekStartsOn: DEFAULTS.WEEK_STARTS_ON })
    const weekEnd = endOfWeek(now, { weekStartsOn: DEFAULTS.WEEK_STARTS_ON })

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
            const duration = getDurationSeconds(session.start_at, session.end_at!)
            totalSeconds += duration
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
            goalSeconds={TIME.DAILY_GOAL}
        />
    )
}