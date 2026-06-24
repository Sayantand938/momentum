import { createContext, useContext, useEffect, useState } from "react"
import { STORAGE_KEYS, DEFAULTS } from '@/constants'

type Theme = "dark" | "light"

interface ThemeContextType {
    theme: Theme
    toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>(() => {
        // Check localStorage first
        const stored = localStorage.getItem(STORAGE_KEYS.THEME) as Theme | null
        if (stored) return stored

        // Then check system preference
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            return "dark"
        }
        return DEFAULTS.THEME
    })

    useEffect(() => {
        const root = document.documentElement
        if (theme === "dark") {
            root.classList.add("dark")
        } else {
            root.classList.remove("dark")
        }
        localStorage.setItem(STORAGE_KEYS.THEME, theme)
    }, [theme])

    const toggleTheme = () => {
        setTheme(prev => prev === "dark" ? "light" : "dark")
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider")
    }
    return context
}