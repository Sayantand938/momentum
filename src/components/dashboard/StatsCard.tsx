import { Card, CardContent } from '@/components/ui/card'
import { Clock, Activity, TrendingUp, TrendingDown, Banknote, Sparkles } from 'lucide-react'

interface StatsCardProps {
    title: string
    value: string | number | React.ReactNode
    icon: 'Clock' | 'Activity' | 'TrendingUp' | 'TrendingDown' | 'Banknote' | 'Sparkles'
    color?: string
}

const iconMap = {
    Clock: Clock,
    Activity: Activity,
    TrendingUp: TrendingUp,
    TrendingDown: TrendingDown,
    Banknote: Banknote,
    Sparkles: Sparkles,
}

const colorMap: Record<string, string> = {
    'text-primary': 'text-primary',
    'text-green-500': 'text-green-500',
    'text-red-500': 'text-red-500',
}

export function StatsCard({ title, value, icon, color = 'text-primary' }: StatsCardProps) {
    const Icon = iconMap[icon]
    const colorClass = colorMap[color] || color

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">{title}</p>
                        <div className="text-2xl font-bold mt-1">{value}</div>
                    </div>
                    <div className="relative">
                        <div className={`p-2 rounded-full bg-primary/10 ${colorClass}`}>
                            <Icon className="h-5 w-5" />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}