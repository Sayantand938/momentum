import { useState, useEffect, useRef } from "react"

interface UseTimerReturn {
    time: number
    isRunning: boolean
    start: () => void
    stop: () => void
    reset: () => void
    formatTime: (seconds: number) => string
}

export function useTimer(): UseTimerReturn {
    const [time, setTime] = useState(0)
    const [isRunning, setIsRunning] = useState(false)
    const intervalRef = useRef<number | null>(null)

    // Format time as MM:SS or HH:MM:SS
    const formatTime = (totalSeconds: number): string => {
        const hours = Math.floor(totalSeconds / 3600)
        const minutes = Math.floor((totalSeconds % 3600) / 60)
        const seconds = totalSeconds % 60

        if (hours > 0) {
            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        }
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    }

    // Start the timer
    const start = () => {
        if (isRunning) return
        setIsRunning(true)
        intervalRef.current = window.setInterval(() => {
            setTime(prev => prev + 1)
        }, 1000)
    }

    // Stop the timer
    const stop = () => {
        if (!isRunning) return
        setIsRunning(false)
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
        }
    }

    // Reset the timer
    const reset = () => {
        stop()
        setTime(0)
    }

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [])

    return {
        time,
        isRunning,
        start,
        stop,
        reset,
        formatTime,
    }
}