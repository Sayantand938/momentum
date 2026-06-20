// src/lib/logger.ts

// Log levels as union type
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'none'

// Configuration
interface LoggerConfig {
    level: LogLevel
    enabled: boolean
    prefix?: string
    timestamps?: boolean
}

// Default config - Auto-disable in production
const isDev = import.meta.env.DEV

const defaultConfig: LoggerConfig = {
    level: isDev ? 'debug' : 'none',
    enabled: isDev,
    prefix: '🔵 Momentum',
    timestamps: true,
}

// Log level priority mapping
const levelPriority: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    none: 4,
}

// Logger class
class Logger {
    private config: LoggerConfig

    constructor(config: Partial<LoggerConfig> = {}) {
        this.config = { ...defaultConfig, ...config }
    }

    // Update configuration
    configure(config: Partial<LoggerConfig>) {
        this.config = { ...this.config, ...config }
    }

    // Check if a log level should be shown
    private shouldLog(level: LogLevel): boolean {
        if (!this.config.enabled) return false
        const currentPriority = levelPriority[this.config.level]
        const targetPriority = levelPriority[level]
        return targetPriority >= currentPriority
    }

    // Format message with prefix and timestamp
    private formatMessage(level: string, message: string): string {
        const parts: string[] = []

        if (this.config.prefix) {
            parts.push(this.config.prefix)
        }

        if (this.config.timestamps) {
            parts.push(`[${new Date().toISOString().slice(11, 19)}]`)
        }

        parts.push(`[${level}]`)

        return `${parts.join(' ')} ${message}`
    }

    // Debug level logs
    debug(...args: any[]) {
        if (!this.shouldLog('debug')) return
        const message = args.map(arg =>
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ')
        console.debug(this.formatMessage('DEBUG', message), ...args)
    }

    // Info level logs
    info(...args: any[]) {
        if (!this.shouldLog('info')) return
        const message = args.map(arg =>
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ')
        console.info(this.formatMessage('ℹ️ INFO', message), ...args)
    }

    // Warn level logs
    warn(...args: any[]) {
        if (!this.shouldLog('warn')) return
        const message = args.map(arg =>
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ')
        console.warn(this.formatMessage('⚠️ WARN', message), ...args)
    }

    // Error level logs
    error(...args: any[]) {
        if (!this.shouldLog('error')) return
        const message = args.map(arg =>
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ')
        console.error(this.formatMessage('❌ ERROR', message), ...args)
    }

    // Group logs for better organization
    group(label: string) {
        console.group(`${this.config.prefix} [${label}]`)
    }

    groupEnd() {
        console.groupEnd()
    }

    // Create a child logger with a specific scope
    child(scope: string): Logger {
        return new Logger({
            ...this.config,
            prefix: `${this.config.prefix} [${scope}]`,
        })
    }
}

// Create singleton instance
export const logger = new Logger()

// Helper to create scoped loggers
export function createLogger(scope: string): Logger {
    return logger.child(scope)
}