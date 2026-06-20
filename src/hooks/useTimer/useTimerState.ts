// src/hooks/useTimer/useTimerState.ts
import { useState, useRef } from 'react'
import type { Session } from '@/lib/supabase'

export function useTimerState() {
    const [time, setTime] = useState(0)
    const [isRunning, setIsRunning] = useState(false)
    const [isStarting, setIsStarting] = useState(false)
    const [activeSession, setActiveSession] = useState<Session | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const intervalRef = useRef<number | null>(null)
    const syncIntervalRef = useRef<number | null>(null)
    const hasLoadedRef = useRef(false)

    return {
        // State
        time,
        isRunning,
        isStarting,
        activeSession,
        isLoading,
        // Setters
        setTime,
        setIsRunning,
        setIsStarting,
        setActiveSession,
        setIsLoading,
        // Refs
        intervalRef,
        syncIntervalRef,
        hasLoadedRef,
    }
}