import { useState, useEffect } from 'react'
import { supabase, type Session } from '@/lib/supabase'
import { createLogger } from '@/lib/logger'
import { format, parseISO, isSameDay } from 'date-fns'

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
                const dateStr = format(sessionDate, 'MMM d, yyyy')
                const duration = formatDuration(session.start_at, session.end_at!)
                const searchLower = searchTerm.toLowerCase()
                return dateStr.toLowerCase().includes(searchLower) ||
                    duration.toLowerCase().includes(searchLower)
            }

            return true
        })

        setFilteredSessions(filtered)
    }

    const formatDate = (timestamp: string) => {
        return format(parseISO(timestamp), 'MMM d, yyyy')
    }

    const formatTime = (timestamp: string) => {
        return format(parseISO(timestamp), 'h:mm a')
    }

    const formatDuration = (startAt: string, endAt: string) => {
        const start = parseISO(startAt).getTime()
        const end = parseISO(endAt).getTime()
        const seconds = Math.floor((end - start) / 1000)

        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const remainingSeconds = seconds % 60

        if (hours > 0) {
            return `${hours}h ${minutes}m ${remainingSeconds}s`
        }
        if (minutes > 0) {
            return `${minutes}m ${remainingSeconds}s`
        }
        return `${remainingSeconds}s`
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
        formatDate,
        formatTime,
        formatDuration,
    }
}