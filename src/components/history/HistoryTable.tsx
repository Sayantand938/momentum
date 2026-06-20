import { type Session } from '@/lib/supabase'

interface HistoryTableProps {
    sessions: Session[]
    formatDate: (timestamp: string) => string
    formatTime: (timestamp: string) => string
    formatDuration: (startAt: string, endAt: string) => string
}

export function HistoryTable({ sessions, formatDate, formatTime, formatDuration }: HistoryTableProps) {
    return (
        <div className="rounded-lg border border-border/40 overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[500px]">
                <thead>
                    <tr className="border-b border-border/40 bg-muted/30">
                        <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 w-16">
                            #
                        </th>
                        <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                            Date
                        </th>
                        <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                            Start Time
                        </th>
                        <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                            End Time
                        </th>
                        <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                            Duration
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {sessions.map((session, index) => (
                        <tr
                            key={session.id}
                            className={cn(
                                "border-b border-border/20 last:border-0 hover:bg-muted/20 transition-colors",
                                index % 2 === 0 ? "bg-background" : "bg-muted/5"
                            )}
                        >
                            <td className="px-4 py-3 text-sm text-muted-foreground text-center">
                                {index + 1}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium whitespace-nowrap">
                                {formatDate(session.start_at)}
                            </td>
                            <td className="px-4 py-3 text-sm whitespace-nowrap">
                                {formatTime(session.start_at)}
                            </td>
                            <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                                {formatTime(session.end_at!)}
                            </td>
                            <td className="px-4 py-3 text-sm text-right font-medium text-foreground whitespace-nowrap">
                                {formatDuration(session.start_at, session.end_at!)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(' ')
}