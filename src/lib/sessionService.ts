import { supabase, type Session } from './supabase'
import { createLogger } from './logger'

const log = createLogger('SessionService')

export const sessionService = {
    // Get active session (where end_at is null)
    async getActiveSession(): Promise<Session | null> {
        log.debug('🔍 Getting active session...')

        try {
            const { data, error } = await supabase
                .from('sessions')
                .select('*')
                .filter('end_at', 'is', null)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle()

            if (error) {
                log.error('❌ Error fetching active session:', error)
                return null
            }

            if (!data) {
                log.debug('✅ No active session found')
                return null
            }

            log.info('✅ Active session found:', data.id)
            log.debug(`📊 Session started at: ${data.start_at}`)
            return data
        } catch (error) {
            log.error('❌ Unexpected error in getActiveSession:', error)
            return null
        }
    },

    // Create a new session
    async createSession(startAt: Date = new Date()): Promise<Session | null> {
        const startAtISO = startAt.toISOString()
        log.debug(`🆕 Creating new session with start_at: ${startAtISO}`)

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
                log.error('❌ Error creating session:', error)
                return null
            }

            log.info(`✅ Session created successfully: ${data.id}`)
            return data
        } catch (error) {
            log.error('❌ Unexpected error in createSession:', error)
            return null
        }
    },

    // Stop an active session
    async stopSession(sessionId: string, endAt: Date = new Date()): Promise<Session | null> {
        const endAtISO = endAt.toISOString()
        log.debug(`⏹️ Stopping session ${sessionId} at: ${endAtISO}`)

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
                log.error('❌ Error stopping session:', error)
                return null
            }

            const elapsed = sessionService.getElapsedSeconds(data.start_at)
            log.info(`✅ Session stopped successfully: ${sessionId} (duration: ${formatDuration(elapsed)})`)
            return data
        } catch (error) {
            log.error('❌ Unexpected error in stopSession:', error)
            return null
        }
    },

    // Delete a session
    async deleteSession(sessionId: string): Promise<boolean> {
        log.debug(`🗑️ Deleting session ${sessionId}...`)

        try {
            const { error } = await supabase
                .from('sessions')
                .delete()
                .eq('id', sessionId)

            if (error) {
                log.error('❌ Error deleting session:', error)
                return false
            }

            log.info(`✅ Session deleted successfully: ${sessionId}`)
            return true
        } catch (error) {
            log.error('❌ Unexpected error in deleteSession:', error)
            return false
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