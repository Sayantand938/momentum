// src/hooks/useTimer.ts
import { useEffect } from 'react' // 👈 Added
import type { Session } from '@/lib/supabase' // 👈 Added
import { useTimerState } from './useTimer/useTimerState'
import { useTimerSync } from './useTimer/useTimerSync'
import { sessionService } from '@/lib/sessionService'
import { createLogger } from '@/lib/logger'
import { formatTimerDisplay, getElapsedSeconds } from '@/lib/utils'

const log = createLogger('useTimer')

export interface UseTimerReturn {
    time: number
    isRunning: boolean
    isStarting: boolean
    activeSession: Session | null
    start: () => Promise<void>
    stop: () => Promise<void>
    reset: () => Promise<void>
    formatTime: (seconds: number) => string
    isLoading: boolean
}

export function useTimer(): UseTimerReturn {
    const {
        time,
        isRunning,
        isStarting,
        activeSession,
        isLoading,
        setTime,
        setIsRunning,
        setIsStarting,
        setActiveSession,
        setIsLoading,
        intervalRef,
        syncIntervalRef,
        hasLoadedRef,
    } = useTimerState()

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
                const elapsed = getElapsedSeconds(session.start_at)
                log.debug(`⏱️ Setting initial time to: ${formatTimerDisplay(elapsed)} (${elapsed} seconds)`)
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
                    log.debug(`⏱️ Timer tick: ${formatTimerDisplay(newTime)}`)
                }
                return newTime
            })
        }, 1000)
    }

    // Sync timer with database
    useTimerSync({
        isRunning,
        activeSession,
        time,
        setTime,
        syncIntervalRef,
    })

    // Start the timer
    const start = async () => {
        log.info('🎯 Start button clicked')

        if (isRunning) {
            log.warn('⚠️ Timer already running - ignoring start')
            return
        }

        if (isStarting) {
            log.warn('⚠️ Timer is already starting - ignoring duplicate request')
            return
        }

        setIsStarting(true)

        try {
            log.debug('📝 Creating new session in database...')
            const session = await sessionService.createSession()

            if (!session) {
                log.error('❌ Failed to create session - start aborted')
                setIsStarting(false)
                return
            }

            log.info(`✅ Session created successfully with ID: ${session.id}`)

            const startTime = new Date(session.start_at).getTime()
            const now = Date.now()
            const initialElapsed = Math.floor((now - startTime) / 1000)

            setActiveSession(session)
            setTime(initialElapsed)
            setIsRunning(true)
            log.debug(`▶️ Timer started from ${formatTimerDisplay(initialElapsed)}`)
            startTimer()

            setIsStarting(false)

        } catch (error) {
            log.error('❌ Error starting timer:', error)
            setIsStarting(false)
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
        isStarting,
        activeSession,
        start,
        stop,
        reset,
        formatTime: formatTimerDisplay,
        isLoading,
    }
}