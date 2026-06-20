import { Button } from "@/components/ui/button"
import { Play, Square, RotateCcw, Loader2 } from "lucide-react"
import { useTimer } from "@/hooks/useTimer"

// Enable/disable debug logs
const DEBUG = true

function log(...args: any[]) {
    if (DEBUG) {
        console.log('[Timer Component]', ...args)
    }
}

export function Timer() {
    const { time, isRunning, start, stop, reset, formatTime, isLoading } = useTimer()

    log(`🔄 Render: time=${formatTime(time)}, running=${isRunning}, loading=${isLoading}`)

    const handleStart = () => {
        log('🖱️ User clicked Start')
        start()
    }

    const handleStop = () => {
        log('🖱️ User clicked Stop')
        stop()
    }

    const handleReset = () => {
        log('🖱️ User clicked Reset')
        reset()
    }

    if (isLoading) {
        log('⏳ Showing loading state...')
        return (
            <div className="flex flex-col items-center gap-8">
                <div className="text-7xl font-bold tracking-wider font-mono tabular-nums opacity-50">
                    00:00
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading session...
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center gap-10">
            {/* Timer Display */}
            <div className="text-8xl font-bold tracking-wider font-mono tabular-nums">
                {formatTime(time)}
            </div>

            {/* Controls - Icon only with larger buttons */}
            <div className="flex items-center gap-4">
                {!isRunning ? (
                    <Button
                        onClick={handleStart}
                        size="icon"
                        className="h-16 w-16 rounded-full bg-primary hover:bg-primary/90 transition-all hover:scale-105"
                    >
                        <Play className="h-8 w-8 fill-current" />
                        <span className="sr-only">Start</span>
                    </Button>
                ) : (
                    <Button
                        onClick={handleStop}
                        size="icon"
                        variant="destructive"
                        className="h-16 w-16 rounded-full transition-all hover:scale-105"
                    >
                        <Square className="h-8 w-8" />
                        <span className="sr-only">Stop</span>
                    </Button>
                )}

                <Button
                    onClick={handleReset}
                    size="icon"
                    variant="outline"
                    className="h-16 w-16 rounded-full transition-all hover:scale-105"
                    disabled={time === 0 && !isRunning}
                >
                    <RotateCcw className="h-8 w-8" />
                    <span className="sr-only">Reset</span>
                </Button>
            </div>

            {/* Session status */}
            {isRunning && (
                <div className="text-sm text-green-500 flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                    </span>
                    Session active
                </div>
            )}
        </div>
    )
}