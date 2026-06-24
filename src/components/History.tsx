import { ErrorBoundarySmall } from './ErrorBoundarySmall'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Spinner } from '@/components/ui/spinner'
import {
    History as HistoryIcon,
    Calendar as CalendarIcon,
    Search,
    X
} from 'lucide-react'
import { format } from 'date-fns'
import { HistoryTable } from './history/HistoryTable'
import { useHistory } from './history/useHistory'
import { DATE_FORMATS } from '@/constants'

function HistoryContent() {
    const {
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
    } = useHistory()

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
                <Spinner className="h-8 w-8 animate-spin" />
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

            {/* Search and Date Picker */}
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
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                        <HistoryIcon className="h-12 w-12 mb-4 text-muted-foreground/50" />
                        <p className="text-lg font-medium text-foreground">
                            No sessions found for {format(selectedDate, DATE_FORMATS.SHORT_DATE)}
                        </p>
                        <p className="text-sm mt-1">Start a focus session to track your progress!</p>
                    </CardContent>
                </Card>
            ) : (
                <HistoryTable
                    sessions={filteredSessions}
                    formatDate={formatDate}
                    formatTime={formatTime}
                    formatDuration={formatDuration}
                />
            )}
        </div>
    )
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