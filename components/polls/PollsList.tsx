import { getAllPolls } from '@/lib/poll-actions'
import PollCard from '@/components/polls/PollCard'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, BarChart3 } from 'lucide-react'

export default async function PollsList({ filter }: { filter: 'all' | 'open' | 'closed' }) {
    const polls = await getAllPolls(filter)

    if (polls.length === 0) {
        let message = 'No polls found'
        let description = 'There are no polls matching your criteria.'

        if (filter === 'open') {
            message = 'No active polls'
            description = 'There are no active polls at the moment. Be the first to start a conversation!'
        } else if (filter === 'closed') {
            message = 'No closed polls'
            description = 'There are no closed polls at the moment.'
        }

        return (
            <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in zoom-in duration-500">
                <div className="bg-muted p-4 rounded-full mb-4">
                    <BarChart3 className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-heading font-semibold text-foreground mb-2">
                    {message}
                </h3>
                <p className="text-muted-foreground max-w-sm mb-8">
                    {description}
                </p>
                {filter === 'open' && (
                    <Link href="/polls/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Poll
                        </Button>
                    </Link>
                )}
            </div>
        )
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {polls.map((poll) => (
                <PollCard key={poll.id} poll={poll} />
            ))}
        </div>
    )
}
