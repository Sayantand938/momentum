// src/constants/index.ts

// ============ TIME CONSTANTS ============
export const TIME = {
    // Goals (in seconds)
    HOURLY_GOAL: 30 * 60,          // 30 minutes
    DAILY_GOAL: 8 * 3600,           // 8 hours
    WEEKLY_GOAL: 56 * 3600,         // 56 hours (7 days × 8 hours)
    FOCUS_POINT_THRESHOLD: 30 * 60, // 30 minutes for 1 focus point

    // Sync intervals (in milliseconds)
    SYNC_INTERVAL: 10000,           // 10 seconds
    TIMER_INTERVAL: 1000,           // 1 second

    // Display limits
    MAX_HOURS_DISPLAY: 99,
} as const

// ============ ROUTE CONSTANTS ============
export const ROUTES = {
    HOME: '/',
    DASHBOARD: '/dashboard',
    HISTORY: '/history',
    SETTINGS: '/settings',
} as const

// ============ DATE FORMAT PATTERNS (date-fns format strings) ============
export const DATE_FORMATS = {
    SHORT_DATE: 'MMM d, yyyy',
    COMPACT_DATE: 'MMM d',
    TIME: 'h:mm a',
    TIME_24H: 'HH:mm',
    DAY_NAME: 'EEE',
    FULL_DAY_NAME: 'EEEE',
    FULL_DATE: 'EEEE, MMMM d, yyyy',
    DATE_WITH_WEEKDAY: 'EEE, MMM d',
    ISO_DATE: 'yyyy-MM-dd',
    MONTH_YEAR: 'MMMM yyyy',
    YEAR_MONTH: 'yyyy-MM',
    TIME_WITH_SECONDS: 'h:mm:ss a',
    DATE_TIME: 'MMM d, yyyy h:mm a',
    DATE_TIME_SHORT: 'MMM d, h:mm a',
} as const

// ============ SHIFT CONSTANTS ============
// Define as regular array instead of const to avoid readonly issues
export const SHIFTS: readonly { name: string; hours: number[] }[] = [
    { name: 'Morning', hours: [8, 9, 10, 11] },
    { name: 'Afternoon', hours: [12, 13, 14, 15] },
    { name: 'Evening', hours: [16, 17, 18, 19] },
    { name: 'Night', hours: [20, 21, 22, 23] }
] as const

// ============ STORAGE KEYS ============
export const STORAGE_KEYS = {
    THEME: 'theme',
    SIDEBAR_STATE: 'sidebar-state',
} as const

// ============ DEFAULT VALUES ============
export const DEFAULTS = {
    THEME: 'light' as const,
    LANGUAGE: 'en-US' as const,
    WEEK_STARTS_ON: 1 as const, // Monday
} as const

// ============ ERROR MESSAGES ============
export const ERROR_MESSAGES = {
    SESSION: {
        NOT_FOUND: 'Session not found',
        ACTIVE_EXISTS: 'An active session already exists',
        CREATE_FAILED: 'Failed to create session',
        STOP_FAILED: 'Failed to stop session',
        DELETE_FAILED: 'Failed to delete session',
    },
    DATABASE: {
        CONNECTION_FAILED: 'Database connection failed',
        QUERY_FAILED: 'Query execution failed',
    },
    VALIDATION: {
        INVALID_DATE: 'Invalid date provided',
        INVALID_DURATION: 'Invalid duration value',
    }
} as const

// ============ SUCCESS MESSAGES ============
export const SUCCESS_MESSAGES = {
    SESSION: {
        CREATED: 'Session created successfully',
        STOPPED: 'Session stopped successfully',
        DELETED: 'Session deleted successfully',
    }
} as const