import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Activity, TrendingUp, TrendingDown } from 'lucide-react'

interface StatsCardProps {
    title: string
    value: string | number | React.ReactNode
    icon: 'Clock' | 'Activity' | 'TrendingUp' | 'TrendingDown'
    color?: string
}

const iconMap = {
    Clock: Clock,
    Activity: Activity,
    TrendingUp: TrendingUp,
    TrendingDown: TrendingDown,
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
                        {/* Optional: Add badge for new records */}
                        {title === 'Focus Points' && typeof value === 'number' && value > 10 && (
                            <Badge
                                variant="default"
                                className="absolute -top-2 -right-2 text-[10px] px-1.5 py-0.5"
                            >
                                🔥
                            </Badge>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}