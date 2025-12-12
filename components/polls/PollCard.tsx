import Link from 'next/link'
import type { Poll } from '@/lib/poll-actions'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Users, Clock } from 'lucide-react'

export default function PollCard({ poll }: { poll: Poll }) {
  const createdDate = new Date(poll.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const closedDate = poll.closed_at
    ? new Date(poll.closed_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    : null

  return (
    <Link href={`/polls/${poll.id}`}>
      <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-muted group cursor-pointer bg-card">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-heading font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight">
            {poll.title}
          </CardTitle>
          <Badge
            variant={poll.is_live ? "default" : "secondary"}
            className={`${poll.is_live
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border-emerald-500/20"
              : "bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20"} 
              whitespace-nowrap ml-2`}
          >
            {poll.is_live && (
              <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse mr-1.5" />
            )}
            {poll.is_live ? 'Live' : 'Closed'}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span className="font-medium">{poll.total_votes} {poll.total_votes === 1 ? 'vote' : 'votes'}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{createdDate}</span>
            </div>
          </div>
        </CardContent>
        {!poll.is_live && closedDate && (
          <CardFooter className="pt-0 pb-4">
            <div className="pt-3 border-t w-full">
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                Closed on {closedDate}
              </p>
            </div>
          </CardFooter>
        )}
      </Card>
    </Link>
  )
}
