import { supabase, type Session } from './supabase'

// Enable/disable debug logs
const DEBUG = true

function log(...args: any[]) {
    if (DEBUG) {
        console.log('[SessionService]', ...args)
    }
}

function logError(...args: any[]) {
    if (DEBUG) {
        console.error('[SessionService Error]', ...args)
    }
}

export const sessionService = {
    // Get active session (where end_at is null)
    async getActiveSession(): Promise<Session | null> {
        log('🔍 Getting active session...')

        try {
            // Use filter with null check using the filter syntax
            const { data, error } = await supabase
                .from('sessions')
                .select('*')
                .filter('end_at', 'is', null)  // Changed from .eq to .filter
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle()

            if (error) {
                logError('❌ Error fetching active session:', error)
                return null
            }

            if (!data) {
                log('✅ No active session found')
                return null
            }

            log('✅ Active session found:', data)
            log(`📊 Session started at: ${data.start_at}`)
            return data
        } catch (error) {
            logError('❌ Unexpected error in getActiveSession:', error)
            return null
        }
    },

    // Create a new session
    async createSession(startAt: Date = new Date()): Promise<Session | null> {
        const startAtISO = startAt.toISOString()
        log(`🆕 Creating new session with start_at: ${startAtISO}`)

        try {
            const { data, error } = await supabase
                .from('sessions')
                .insert({
                    start_at: startAtISO,
                    end_at: null,
                })
                .select()
                .single()

            if (error) {
                logError('❌ Error creating session:', error)
                return null
            }

            log('✅ Session created successfully:', data)
            return data
        } catch (error) {
            logError('❌ Unexpected error in createSession:', error)
            return null
        }
    },

    // Stop an active session
    async stopSession(sessionId: string, endAt: Date = new Date()): Promise<Session | null> {
        const endAtISO = endAt.toISOString()
        log(`⏹️ Stopping session ${sessionId} at: ${endAtISO}`)

        try {
            const { data, error } = await supabase
                .from('sessions')
                .update({
                    end_at: endAtISO,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', sessionId)
                .select()
                .single()

            if (error) {
                logError('❌ Error stopping session:', error)
                return null
            }

            log('✅ Session stopped successfully:', data)
            const elapsed = sessionService.getElapsedSeconds(data.start_at)
            log(`📊 Session duration: ${formatDuration(elapsed)}`)
            return data
        } catch (error) {
            logError('❌ Unexpected error in stopSession:', error)
            return null
        }
    },

    // Calculate elapsed time in seconds from a start timestamp
    getElapsedSeconds(startAt: string): number {
        const start = new Date(startAt).getTime()
        const now = Date.now()
        const elapsed = Math.floor((now - start) / 1000)
        return elapsed
    },
}

// Helper function to format duration
function formatDuration(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`
    }
    if (minutes > 0) {
        return `${minutes}m ${seconds}s`
    }
    return `${seconds}s`
}