import { Timer, LayoutDashboard, History, Settings, type LucideIcon } from "lucide-react"
import { ROUTES } from './index'

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
        path: ROUTES.HOME,
        description: "Focus & track time"
    },
    {
        icon: LayoutDashboard,
        label: "Dashboard",
        id: "dashboard",
        path: ROUTES.DASHBOARD,
        description: "Overview of progress"
    },
    {
        icon: History,
        label: "History",
        id: "history",
        path: ROUTES.HISTORY,
        description: "Past sessions"
    },
    {
        icon: Settings,
        label: "Settings",
        id: "settings",
        path: ROUTES.SETTINGS,
        description: "Customize your experience"
    },
]