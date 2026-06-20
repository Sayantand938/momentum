import { Button } from "@/components/ui/button"
import { Sidebar } from "./Sidebar"
import { RotateCw } from "lucide-react"
import { Link } from '@tanstack/react-router'

export function Header() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
            <div className="flex h-16 items-center justify-between px-4">
                {/* Left: Burger Menu */}
                <Sidebar />

                {/* Center: MOMENTUM - Link to home */}
                <Link to="/" className="absolute left-1/2 -translate-x-1/2">
                    <h1 className="text-xl font-bold tracking-wider hover:text-primary transition-colors">
                        MOMENTUM
                    </h1>
                </Link>

                {/* Right: Refresh Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={() => window.location.reload()}
                >
                    <RotateCw className="h-5 w-5" />
                    <span className="sr-only">Refresh</span>
                </Button>
            </div>
        </header>
    )
}