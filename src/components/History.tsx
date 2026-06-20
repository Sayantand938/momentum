import { useState, useEffect } from 'react'
import { supabase, type Session } from '@/lib/supabase'
import { createLogger } from '@/lib/logger'
import { ErrorBoundarySmall } from './ErrorBoundarySmall'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
    History as HistoryIcon,
    Loader2,
    Calendar as CalendarIcon,
    Clock,
    Search,
    X
} from 'lucide-react'
import { format, parseISO, isSameDay } from 'date-fns'

const log = createLogger('History')

function HistoryContent() {
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
            // Filter by date
            const sessionDate = parseISO(session.start_at)
            const isSameDate = isSameDay(sessionDate, selectedDate)
            if (!isSameDate) return false

            // Filter by search term (search in date or duration)
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
            setIsCalendarOpen(false) // 👈 Close calendar after selection
        }
    }

    const clearSearch = () => {
        setSearchTerm('')
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="container max-w-5xl mx-auto p-4 pt-2">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <HistoryIcon className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold">History</h1>
            </div>

            {/* Search and Date Picker - Same Row */}
            <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by date or duration..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-9 py-2 rounded-lg border border-border/40 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    {searchTerm && (
                        <button
                            onClick={clearSearch}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="icon" className="shrink-0">
                            <CalendarIcon className="h-4 w-4" />
                            <span className="sr-only">Select date</span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={handleDateSelect}
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {/* Sessions Table */}
            {filteredSessions.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        <p>No sessions found for {format(selectedDate, 'MMM d, yyyy')}</p>
                        <p className="text-sm mt-1">Start a focus session to track your progress!</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="rounded-lg border border-border/40 overflow-x-auto custom-scrollbar">
                    <table className="w-full min-w-[500px]">
                        <thead>
                            <tr className="border-b border-border/40 bg-muted/30">
                                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 w-16">
                                    #
                                </th>
                                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                                    Date
                                </th>
                                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                                    Start Time
                                </th>
                                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                                    End Time
                                </th>
                                <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                                    Duration
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSessions.map((session, index) => (
                                <tr
                                    key={session.id}
                                    className={cn(
                                        "border-b border-border/20 last:border-0 hover:bg-muted/20 transition-colors",
                                        index % 2 === 0 ? "bg-background" : "bg-muted/5"
                                    )}
                                >
                                    <td className="px-4 py-3 text-sm text-muted-foreground text-center">
                                        {index + 1}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-medium whitespace-nowrap">
                                        {formatDate(session.start_at)}
                                    </td>
                                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                                            {formatTime(session.start_at)}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                                        {formatTime(session.end_at!)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right font-medium text-foreground whitespace-nowrap">
                                        {formatDuration(session.start_at, session.end_at!)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

// Helper function for className merging
function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(' ')
}

// Main History export with error boundary
export default function History() {
    return (
        <ErrorBoundarySmall
            fallback={
                <div className="flex flex-col items-center gap-4 p-6">
                    <p className="text-sm text-muted-foreground">
                        ⚠️ History component encountered an error. Please refresh the page.
                    </p>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.reload()}
                    >
                        Refresh
                    </Button>
                </div>
            }
        >
            <HistoryContent />
        </ErrorBoundarySmall>
    )
}