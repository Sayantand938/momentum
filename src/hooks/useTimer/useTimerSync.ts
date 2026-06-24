// src/hooks/useTimer/useTimerSync.ts
import { useEffect } from 'react'
import { getElapsedSeconds } from '@/lib/utils'
import { formatTimerDisplay } from '@/lib/utils'
import { createLogger } from '@/lib/logger'
import type { Session } from '@/lib/supabase'
import { TIME } from '@/constants'

const log = createLogger('useTimerSync')

interface UseTimerSyncProps {
    isRunning: boolean
    activeSession: Session | null
    time: number
    setTime: (value: number) => void
    syncIntervalRef: React.MutableRefObject<number | null>
}

export function useTimerSync({
    isRunning,
    activeSession,
    time,
    setTime,
    syncIntervalRef
}: UseTimerSyncProps) {
    useEffect(() => {
        if (isRunning && activeSession) {
            log.debug('🔄 Starting sync interval (every 10 seconds)')
            syncIntervalRef.current = window.setInterval(() => {
                if (activeSession) {
                    const elapsed = getElapsedSeconds(activeSession.start_at)
                    const currentTime = time
                    const diff = Math.abs(elapsed - currentTime)

                    if (diff > 5) {
                        log.warn(`⚠️ Time drift detected: UI=${formatTimerDisplay(currentTime)}, DB=${formatTimerDisplay(elapsed)}, diff=${diff}s`)
                        log.debug(`🔄 Syncing timer with database...`)
                        setTime(elapsed)
                    }
                }
            }, TIME.SYNC_INTERVAL)
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
    }, [isRunning, activeSession, time, setTime, syncIntervalRef])
}