import { useState, useEffect } from 'react'
import { supabase, type Session } from '@/lib/supabase'
import { createLogger } from '@/lib/logger'
import { format, parseISO, isSameDay } from 'date-fns'
import { formatShortDate, formatTimeString, getDurationSeconds, formatDuration } from '@/lib/utils'

const log = createLogger('useHistory')

export function useHistory() {
    const [allSessions, setAllSessions] = useState<Session[]>([])
    const [filteredSessions, setFilteredSessions] = useState<Session[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedDate, setSelectedDate] = useState<Date>(new Date())
    const [searchTerm, setSearchTerm] = useState('')
    const [isCalendarOpen, setIsCalendarOpen] = useState(false)

    useEffect(() => {
        fetchSessions()
    }, [])

    useEffect(() => {
        filterSessions()
    }, [allSessions, selectedDate, searchTerm])

    const fetchSessions = async () => {
        try {
            log.debug('📜 Fetching session history...')
            const { data, error } = await supabase
                .from('sessions')
                .select('*')
                .not('end_at', 'is', null)
                .order('start_at', { ascending: false })

            if (error) throw error

            const completed = data as Session[]
            log.info(`✅ Fetched ${completed.length} completed sessions`)
            setAllSessions(completed)
        } catch (error) {
            log.error('❌ Error fetching sessions:', error)
        } finally {
            setLoading(false)
        }
    }

    const filterSessions = () => {
        let filtered = allSessions.filter(session => {
            const sessionDate = parseISO(session.start_at)
            const isSameDate = isSameDay(sessionDate, selectedDate)
            if (!isSameDate) return false

            if (searchTerm) {
                const dateStr = formatShortDate(session.start_at)
                const duration = formatDuration(getDurationSeconds(session.start_at, session.end_at!))
                const searchLower = searchTerm.toLowerCase()
                return dateStr.toLowerCase().includes(searchLower) ||
                    duration.toLowerCase().includes(searchLower)
            }

            return true
        })

        setFilteredSessions(filtered)
    }

    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            setSelectedDate(date)
            setIsCalendarOpen(false)
        }
    }

    const clearSearch = () => {
        setSearchTerm('')
    }

    return {
        loading,
        filteredSessions,
        selectedDate,
        searchTerm,
        isCalendarOpen,
        setSearchTerm,
        setIsCalendarOpen,
        handleDateSelect,
        clearSearch,
        formatDate: formatShortDate,
        formatTime: formatTimeString,
        formatDuration: (startAt: string, endAt: string) => {
            const seconds = getDurationSeconds(startAt, endAt)
            return formatDuration(seconds)
        },
    }
}