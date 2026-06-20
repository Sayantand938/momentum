import { cn } from "@/lib/utils"
import { menuItems } from "@/constants/menuItems"
import { Sparkles } from "lucide-react"
import { Link, useLocation } from '@tanstack/react-router'

interface SidebarContentProps {
    onClose?: () => void
}

export function SidebarContent({ onClose }: SidebarContentProps) {
    const location = useLocation()
    const currentPath = location.pathname

    const handlePageChange = () => {
        onClose?.()
    }

    return (
        <div className="flex h-full flex-col bg-background">
            {/* Slim Header */}
            <div className="flex h-16 items-center gap-3 px-4 border-b border-border/40">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-bold tracking-wider">MOMENTUM</span>
            </div>

            {/* Navigation - Slimmer items */}
            <nav className="flex-1 space-y-0.5 px-3 py-4">
                {menuItems.map((item) => {
                    const Icon = item.icon
                    const isActive = currentPath === item.path

                    return (
                        <Link
                            key={item.id}
                            to={item.path}
                            onClick={handlePageChange}
                            className="block w-full no-underline hover:no-underline"
                            style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            <div
                                className={cn(
                                    "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                                    "hover:bg-muted/50",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <div className={cn(
                                    "flex h-8 w-8 items-center justify-center rounded-lg transition-colors shrink-0",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground group-hover:text-foreground"
                                )}>
                                    <Icon className="h-4 w-4" />
                                </div>

                                <span className={cn(
                                    "text-sm flex-1",
                                    isActive ? "font-medium text-primary" : "font-normal"
                                )}>
                                    {item.label}
                                </span>

                                {/* Active dot on the right */}
                                {isActive && (
                                    <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                                )}
                            </div>
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}