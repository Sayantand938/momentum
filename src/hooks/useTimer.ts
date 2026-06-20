import { supabase } from '@/lib/supabase'
import { useState, useEffect, useRef } from 'react'
import { sessionService } from '@/lib/sessionService'
import type { Session } from '@/lib/supabase'

// Enable/disable debug logs
const DEBUG = true

function log(...args: any[]) {
    if (DEBUG) {
        console.log('[useTimer]', ...args)
    }
}

function logError(...args: any[]) {
    if (DEBUG) {
        console.error('[useTimer Error]', ...args)
    }
}

interface UseTimerReturn {
    time: number
    isRunning: boolean
    activeSession: Session | null
    start: () => Promise<void>
    stop: () => Promise<void>
    reset: () => Promise<void>
    formatTime: (seconds: number) => string
    isLoading: boolean
}

export function useTimer(): UseTimerReturn {
    const [time, setTime] = useState(0)
    const [isRunning, setIsRunning] = useState(false)
    const [activeSession, setActiveSession] = useState<Session | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const intervalRef = useRef<number | null>(null)
    const syncIntervalRef = useRef<number | null>(null)
    const hasLoadedRef = useRef(false)

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

    // Load active session on mount
    useEffect(() => {
        if (hasLoadedRef.current) {
            log('⏭️ Skipping duplicate load (already loaded)')
            return
        }
        hasLoadedRef.current = true

        const loadActiveSession = async () => {
            log('🚀 App loaded - checking for active session...')
            setIsLoading(true)

            const session = await sessionService.getActiveSession()

            if (session) {
                log('✅ Active session found on load!')
                setActiveSession(session)
                const elapsed = sessionService.getElapsedSeconds(session.start_at)
                log(`⏱️ Setting initial time to: ${formatTime(elapsed)} (${elapsed} seconds)`)
                setTime(elapsed)
                setIsRunning(true)
                log('▶️ Starting timer from loaded session')
                startTimer()
            } else {
                log('ℹ️ No active session found on load - ready to start')
                setTime(0)
                setIsRunning(false)
            }

            setIsLoading(false)
            log('✅ Initialization complete')
        }

        loadActiveSession()

        return () => {
            log('🧹 Cleaning up timer intervals')
            if (intervalRef.current) clearInterval(intervalRef.current)
            if (syncIntervalRef.current) clearInterval(syncIntervalRef.current)
        }
    }, [])

    // Start the timer interval
    const startTimer = () => {
        log('▶️ Starting timer interval')
        if (intervalRef.current) clearInterval(intervalRef.current)
        intervalRef.current = window.setInterval(() => {
            setTime(prev => {
                const newTime = prev + 1
                if (newTime % 30 === 0) {
                    log(`⏱️ Timer tick: ${formatTime(newTime)}`)
                }
                return newTime
            })
        }, 1000)
    }

    // Sync timer with database every 10 seconds when running
    useEffect(() => {
        if (isRunning && activeSession) {
            log('🔄 Starting sync interval (every 10 seconds)')
            syncIntervalRef.current = window.setInterval(() => {
                if (activeSession) {
                    const elapsed = sessionService.getElapsedSeconds(activeSession.start_at)
                    const currentTime = time
                    const diff = Math.abs(elapsed - currentTime)

                    if (diff > 5) {
                        log(`⚠️ Time drift detected: UI=${formatTime(currentTime)}, DB=${formatTime(elapsed)}, diff=${diff}s`)
                        log(`🔄 Syncing timer with database...`)
                        setTime(elapsed)
                    }
                }
            }, 10000)
        } else {
            if (syncIntervalRef.current) {
                log('⏹️ Stopping sync interval')
                clearInterval(syncIntervalRef.current)
                syncIntervalRef.current = null
            }
        }

        return () => {
            if (syncIntervalRef.current) {
                clearInterval(syncIntervalRef.current)
                syncIntervalRef.current = null
            }
        }
    }, [isRunning, activeSession, time])

    // Delete a session from database
    const deleteSession = async (sessionId: string): Promise<boolean> => {
        log(`🗑️ Deleting session ${sessionId}...`)

        try {
            const { error } = await supabase
                .from('sessions')
                .delete()
                .eq('id', sessionId)

            if (error) {
                logError('❌ Error deleting session:', error)
                return false
            }

            log('✅ Session deleted successfully')
            return true
        } catch (error) {
            logError('❌ Unexpected error in deleteSession:', error)
            return false
        }
    }

    // Start the timer
    const start = async () => {
        log('🎯 Start button clicked')

        if (isRunning) {
            log('⚠️ Timer already running - ignoring start')
            return
        }

        try {
            log('📝 Creating new session in database...')
            const session = await sessionService.createSession()

            if (!session) {
                logError('❌ Failed to create session - start aborted')
                return
            }

            log('✅ Session created successfully with ID:', session.id)
            setActiveSession(session)
            setTime(0)
            setIsRunning(true)
            log('▶️ Timer started from 0')
            startTimer()
        } catch (error) {
            logError('❌ Error starting timer:', error)
        }
    }

    // Stop the timer
    const stop = async () => {
        log('⏹️ Stop button clicked')

        if (!isRunning) {
            log('⚠️ Timer not running - ignoring stop')
            return
        }

        if (!activeSession) {
            logError('❌ No active session to stop')
            return
        }

        try {
            log(`📝 Stopping session ${activeSession.id}...`)
            const stoppedSession = await sessionService.stopSession(activeSession.id)

            if (stoppedSession) {
                log('✅ Session stopped successfully')
                setActiveSession(stoppedSession)
            } else {
                logError('❌ Failed to stop session')
            }

            setIsRunning(false)
            if (intervalRef.current) {
                log('⏹️ Clearing timer interval')
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }

            // NEW: Auto reset after stop
            log('🔄 Auto-resetting UI after stop')
            setTime(0)
            setActiveSession(null)

        } catch (error) {
            logError('❌ Error stopping timer:', error)
        }
    }

    // Reset the timer - Delete active session from database
    const reset = async () => {
        log('🔄 Reset button clicked')

        if (isRunning) {
            log('⏹️ Stopping running timer before reset')
            setIsRunning(false)
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }
        }

        // Delete the active session from database
        if (activeSession) {
            await deleteSession(activeSession.id)
            setActiveSession(null)
        }

        setTime(0)
        log('🔄 Timer reset to 0, session deleted from database')
    }

    return {
        time,
        isRunning,
        activeSession,
        start,
        stop,
        reset,
        formatTime,
        isLoading,
    }
}