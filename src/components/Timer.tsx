import { Button } from "@/components/ui/button"
import { Play, Square, RotateCcw } from "lucide-react"
import { useTimer } from "@/hooks/useTimer"

export function Timer() {
    const { time, isRunning, start, stop, reset, formatTime } = useTimer()

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
                        onClick={start}
                        size="icon"
                        className="h-16 w-16 rounded-full bg-primary hover:bg-primary/90 transition-all hover:scale-105"
                    >
                        <Play className="h-8 w-8 fill-current" />
                        <span className="sr-only">Start</span>
                    </Button>
                ) : (
                    <Button
                        onClick={stop}
                        size="icon"
                        variant="destructive"
                        className="h-16 w-16 rounded-full transition-all hover:scale-105"
                    >
                        <Square className="h-8 w-8" />
                        <span className="sr-only">Stop</span>
                    </Button>
                )}

                <Button
                    onClick={reset}
                    size="icon"
                    variant="outline"
                    className="h-16 w-16 rounded-full transition-all hover:scale-105"
                    disabled={time === 0}
                >
                    <RotateCcw className="h-8 w-8" />
                    <span className="sr-only">Reset</span>
                </Button>
            </div>
        </div>
    )
}