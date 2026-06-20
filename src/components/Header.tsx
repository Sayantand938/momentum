import { Button } from "@/components/ui/button"
import { Sidebar } from "./Sidebar"
import { RotateCw } from "lucide-react"
import { useNavigate } from '@tanstack/react-router' // Add this

export function Header() {
    const navigate = useNavigate() // Add this

    const handleRefresh = () => {
        // More graceful refresh
        navigate({ to: window.location.pathname, replace: true })
    }

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md">
            <div className="flex h-16 items-center justify-between px-4">
                <Sidebar />
                <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={handleRefresh} // Use graceful refresh
                >
                    <RotateCw className="h-5 w-5" />
                    <span className="sr-only">Refresh</span>
                </Button>
            </div>
        </header>
    )
}