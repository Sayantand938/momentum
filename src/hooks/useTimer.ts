// src/hooks/useTimer.ts
import { useState, useEffect, useRef } from 'react'
import { sessionService } from '@/lib/sessionService'
import type { Session } from '@/lib/supabase'
import { createLogger } from '@/lib/logger'

const log = createLogger('useTimer')

interface UseTimerReturn {
    time: number
    isRunning: boolean
    isStarting: boolean // 👈 ADD THIS
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
    const [isStarting, setIsStarting] = useState(false) // 👈 ADD THIS
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
            log.debug('⏭️ Skipping duplicate load (already loaded)')
            return
        }
        hasLoadedRef.current = true

        const loadActiveSession = async () => {
            log.debug('🚀 App loaded - checking for active session...')
            setIsLoading(true)

            const session = await sessionService.getActiveSession()

            if (session) {
                log.info('✅ Active session found on load!')
                setActiveSession(session)
                const elapsed = sessionService.getElapsedSeconds(session.start_at)
                log.debug(`⏱️ Setting initial time to: ${formatTime(elapsed)} (${elapsed} seconds)`)
                setTime(elapsed)
                setIsRunning(true)
                log.debug('▶️ Starting timer from loaded session')
                startTimer()
            } else {
                log.debug('ℹ️ No active session found on load - ready to start')
                setTime(0)
                setIsRunning(false)
            }

            setIsLoading(false)
            log.debug('✅ Initialization complete')
        }

        loadActiveSession()

        return () => {
            log.debug('🧹 Cleaning up timer intervals')
            if (intervalRef.current) clearInterval(intervalRef.current)
            if (syncIntervalRef.current) clearInterval(syncIntervalRef.current)
        }
    }, [])

    // Start the timer interval
    const startTimer = () => {
        log.debug('▶️ Starting timer interval')
        if (intervalRef.current) clearInterval(intervalRef.current)
        intervalRef.current = window.setInterval(() => {
            setTime(prev => {
                const newTime = prev + 1
                if (newTime % 30 === 0) {
                    log.debug(`⏱️ Timer tick: ${formatTime(newTime)}`)
                }
                return newTime
            })
        }, 1000)
    }

    // Sync timer with database every 10 seconds when running
    useEffect(() => {
        if (isRunning && activeSession) {
            log.debug('🔄 Starting sync interval (every 10 seconds)')
            syncIntervalRef.current = window.setInterval(() => {
                if (activeSession) {
                    const elapsed = sessionService.getElapsedSeconds(activeSession.start_at)
                    const currentTime = time
                    const diff = Math.abs(elapsed - currentTime)

                    if (diff > 5) {
                        log.warn(`⚠️ Time drift detected: UI=${formatTime(currentTime)}, DB=${formatTime(elapsed)}, diff=${diff}s`)
                        log.debug(`🔄 Syncing timer with database...`)
                        setTime(elapsed)
                    }
                }
            }, 10000)
        } else {
            if (syncIntervalRef.current) {
                log.debug('⏹️ Stopping sync interval')
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

    // 👇 UPDATED: Start the timer with loading state
    const start = async () => {
        log.info('🎯 Start button clicked')

        // Check if already running or starting
        if (isRunning) {
            log.warn('⚠️ Timer already running - ignoring start')
            return
        }

        if (isStarting) {
            log.warn('⚠️ Timer is already starting - ignoring duplicate request')
            return
        }

        setIsStarting(true) // 👈 Show loading state

        try {
            log.debug('📝 Creating new session in database...')
            const session = await sessionService.createSession()

            if (!session) {
                log.error('❌ Failed to create session - start aborted')
                setIsStarting(false)
                return
            }

            log.info(`✅ Session created successfully with ID: ${session.id}`)

            // 🔥 FIX: Calculate actual elapsed time from database timestamp
            const startTime = new Date(session.start_at).getTime()
            const now = Date.now()
            const initialElapsed = Math.floor((now - startTime) / 1000)

            setActiveSession(session)
            setTime(initialElapsed) // Use actual elapsed time
            setIsRunning(true)
            log.debug(`▶️ Timer started from ${formatTime(initialElapsed)}`)
            startTimer()

            setIsStarting(false) // 👈 Clear loading state

        } catch (error) {
            log.error('❌ Error starting timer:', error)
            setIsStarting(false) // 👈 Clear loading state on error
        }
    }

    // Stop the timer
    const stop = async () => {
        log.info('⏹️ Stop button clicked')

        if (!isRunning) {
            log.warn('⚠️ Timer not running - ignoring stop')
            return
        }

        if (!activeSession) {
            log.error('❌ No active session to stop')
            return
        }

        try {
            log.debug(`📝 Stopping session ${activeSession.id}...`)
            const stoppedSession = await sessionService.stopSession(activeSession.id)

            if (stoppedSession) {
                log.info('✅ Session stopped successfully')
                setActiveSession(stoppedSession)
            } else {
                log.error('❌ Failed to stop session')
            }

            setIsRunning(false)
            if (intervalRef.current) {
                log.debug('⏹️ Clearing timer interval')
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }

            log.debug('🔄 Auto-resetting UI after stop')
            setTime(0)
            setActiveSession(null)

        } catch (error) {
            log.error('❌ Error stopping timer:', error)
        }
    }

    // Reset the timer
    const reset = async () => {
        log.info('🔄 Reset button clicked')

        if (isRunning) {
            log.debug('⏹️ Stopping running timer before reset')
            setIsRunning(false)
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }
        }

        if (activeSession) {
            await sessionService.deleteSession(activeSession.id)
            setActiveSession(null)
        }

        setTime(0)
        log.info('🔄 Timer reset to 0, session deleted from database')
    }

    return {
        time,
        isRunning,
        isStarting, // 👈 EXPOSE THIS
        activeSession,
        start,
        stop,
        reset,
        formatTime,
        isLoading,
    }
}