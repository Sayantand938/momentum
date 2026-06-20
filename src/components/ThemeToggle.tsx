import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/context/ThemeContext"

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme()

    return (
        <Button
            variant="outline"
            size="default"
            onClick={toggleTheme}
            className="gap-2"
        >
            {theme === "dark" ? (
                <>
                    <Sun className="h-4 w-4" />
                    Light Mode
                </>
            ) : (
                <>
                    <Moon className="h-4 w-4" />
                    Dark Mode
                </>
            )}
        </Button>
    )
}