import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Play, Square, RotateCcw, Loader2 } from "lucide-react"
import { useTimer } from "@/hooks/useTimer"
import { createLogger } from "@/lib/logger"
import { ErrorBoundarySmall } from "./ErrorBoundarySmall"

const log = createLogger('Timer')

function TimerContent() {
    const { time, isRunning, isStarting, start, stop, reset, formatTime, isLoading } = useTimer()

    log.debug(`🔄 Render: time=${formatTime(time)}, running=${isRunning}, starting=${isStarting}, loading=${isLoading}`)

    const handleStart = () => {
        log.debug('🖱️ User clicked Start')
        start()
    }

    const handleStop = () => {
        log.debug('🖱️ User clicked Stop')
        stop()
    }

    const handleReset = () => {
        log.debug('🖱️ User clicked Reset')
        reset()
    }

    if (isLoading) {
        log.debug('⏳ Showing loading state...')
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
                <Spinner className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center gap-10">
            <div className="flex items-center gap-4">
                <div className="text-8xl font-bold tracking-wider font-mono tabular-nums">
                    {formatTime(time)}
                </div>
                {isRunning && (
                    <Badge variant="default" className="animate-pulse">
                        ● Live
                    </Badge>
                )}
            </div>

            <div className="flex items-center gap-4">
                {!isRunning ? (
                    <Button
                        onClick={handleStart}
                        size="icon"
                        className="h-16 w-16 rounded-full bg-primary hover:bg-primary/90 transition-all hover:scale-105"
                        disabled={isStarting}
                    >
                        {isStarting ? (
                            <Loader2 className="h-8 w-8 animate-spin" />
                        ) : (
                            <Play className="h-8 w-8 fill-current" />
                        )}
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

                <Dialog>
                    <DialogTrigger asChild>
                        <Button
                            size="icon"
                            variant="outline"
                            className="h-16 w-16 rounded-full transition-all hover:scale-105"
                            disabled={time === 0 && !isRunning}
                        >
                            <RotateCcw className="h-8 w-8" />
                            <span className="sr-only">Reset</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Reset Timer?</DialogTitle>
                            <DialogDescription>
                                This will delete your current session. Your progress will be lost.
                                This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button variant="destructive" onClick={handleReset}>
                                Reset Session
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}

// Main Timer export with error boundary
export function Timer() {
    return (
        <ErrorBoundarySmall
            fallback={
                <div className="flex flex-col items-center gap-4 p-6">
                    <p className="text-sm text-muted-foreground">
                        ⚠️ Timer component encountered an error. Please refresh the page.
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
            <TimerContent />
        </ErrorBoundarySmall>
    )
}