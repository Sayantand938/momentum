import { Timer, LayoutDashboard, History, Settings, type LucideIcon } from "lucide-react"

export interface MenuItem {
    icon: LucideIcon
    label: string
    id: string
    path: string
    description: string
}

export const menuItems: MenuItem[] = [
    {
        icon: Timer,
        label: "Timer",
        id: "timer",
        path: "/",
        description: "Focus & track time"
    },
    {
        icon: LayoutDashboard,
        label: "Dashboard",
        id: "dashboard",
        path: "/dashboard",
        description: "Overview of progress"
    },
    {
        icon: History,
        label: "History",
        id: "history",
        path: "/history",
        description: "Past sessions"
    },
    {
        icon: Settings,
        label: "Settings",
        id: "settings",
        path: "/settings",
        description: "Customize your experience"
    },
]