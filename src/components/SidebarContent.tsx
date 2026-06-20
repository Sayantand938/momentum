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
        <>
            {/* Header with gradient accent */}
            <div className="relative flex h-20 items-center px-6 border-b border-border/40 bg-gradient-to-r from-primary/5 via-transparent to-transparent">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <span className="text-lg font-bold tracking-wider">MOMENTUM</span>
                        <p className="text-xs text-muted-foreground">Stay focused, stay ahead</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-4">
                <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Menu
                </p>
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
                                    "group relative flex w-full items-center justify-start gap-3 px-3 py-6 h-auto transition-all duration-200 rounded-lg",
                                    "hover:bg-muted/50 hover:scale-[1.02]",
                                    isActive
                                        ? "bg-primary/10 hover:bg-primary/15 text-primary"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {/* Active indicator bar */}
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                                )}

                                <div className={cn(
                                    "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "bg-muted/50 text-muted-foreground group-hover:bg-muted"
                                )}>
                                    <Icon className="h-4 w-4" />
                                </div>

                                <div className="flex flex-col items-start">
                                    <span className={cn(
                                        "text-sm font-medium",
                                        isActive && "text-primary"
                                    )}>
                                        {item.label}
                                    </span>
                                    <span className="text-xs text-muted-foreground/70">
                                        {item.description}
                                    </span>
                                </div>

                                {/* Active checkmark */}
                                {isActive && (
                                    <div className="ml-auto">
                                        <div className="h-2 w-2 rounded-full bg-primary" />
                                    </div>
                                )}
                            </div>
                        </Link>
                    )
                })}
            </nav>

            {/* Footer */}
            <div className="border-t border-border/40 p-4">
                <div className="rounded-lg bg-muted/30 px-4 py-3">
                    <p className="text-xs text-muted-foreground">
                        ⚡ Today's focus: 2h 34m
                    </p>
                </div>
            </div>
        </>
    )
}