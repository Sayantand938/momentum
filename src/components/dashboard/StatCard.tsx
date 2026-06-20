import { Card, CardContent } from '@/components/ui/card'

interface StatCardProps {
    title: string
    value: string | number
    icon: React.ElementType
    color?: string
}

export function StatCard({ title, value, icon: Icon, color = 'text-primary' }: StatCardProps) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">{title}</p>
                        <p className="text-2xl font-bold mt-1">{value}</p>
                    </div>
                    <div className={`p-2 rounded-full bg-primary/10 ${color}`}>
                        <Icon className="h-5 w-5" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}