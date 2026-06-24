import { ErrorBoundarySmall } from './ErrorBoundarySmall'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Spinner } from '@/components/ui/spinner'
import {
    History as HistoryIcon,
    Calendar as CalendarIcon,
    Table,
    LayoutGrid,
    Sparkles
} from 'lucide-react'
import { format } from 'date-fns'
import { HistoryTable } from './history/HistoryTable'
import { NormalizedTableView } from './history/NormalizedTableView'
import { useHistory } from './history/useHistory'
import { DATE_FORMATS } from '@/constants'

function HistoryContent() {
    const {
        loading,
        filteredSessions,
        selectedDate,
        isCalendarOpen,
        viewMode,
        setViewMode,
        setIsCalendarOpen,
        handleDateSelect,
        formatDate,
        formatTime,
        formatDuration,
        getNormalizedData,
        formatStatsTime,
        formatHourLabel,
    } = useHistory()

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
                <Spinner className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    const normalizedData = getNormalizedData()

    return (
        <div className="container max-w-4xl mx-auto p-4 pt-2">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <HistoryIcon className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold">History</h1>
                <span className="text-xs text-muted-foreground ml-auto">
                    {format(selectedDate, DATE_FORMATS.SHORT_DATE)}
                </span>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-0.5">
                    <Button
                        variant={viewMode === 'normalized' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('normalized')}
                        className="h-8 px-3 text-xs gap-1.5"
                    >
                        <LayoutGrid className="h-3.5 w-3.5" />
                        Normalized
                    </Button>
                    <Button
                        variant={viewMode === 'actual' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('actual')}
                        className="h-8 px-3 text-xs gap-1.5"
                    >
                        <Table className="h-3.5 w-3.5" />
                        Actual
                    </Button>
                </div>

                {/* Date Picker */}
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

            {/* Content */}
            {viewMode === 'normalized' ? (
                normalizedData.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                            <Sparkles className="h-12 w-12 mb-4 text-muted-foreground/50" />
                            <p className="text-lg font-medium text-foreground">
                                No normalized data for {format(selectedDate, DATE_FORMATS.SHORT_DATE)}
                            </p>
                            <p className="text-sm mt-1">Study at least 30 minutes in an hour to see normalized view!</p>
                        </CardContent>
                    </Card>
                ) : (
                    <NormalizedTableView
                        data={normalizedData}
                        formatTime={formatStatsTime}
                        formatHourLabel={formatHourLabel}
                    />
                )
            ) : (
                filteredSessions.length === 0 ? (
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
                        showDate={false}
                    />
                )
            )}
        </div>
    )
}

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