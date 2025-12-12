import { Suspense } from 'react'
import { getUserPolls } from '@/lib/poll-actions'
import MyPollCard from '@/components/polls/MyPollCard'
import { PollsGridSkeleton } from '@/components/polls/PollSkeleton'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, Pencil } from 'lucide-react'

// No props needed for the list component as we always fetch 'all'
async function MyPollsList() {
    // Fetch all polls for the user
    const polls = await getUserPolls('all')

    if (polls.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in zoom-in duration-500">
                <div className="bg-muted p-4 rounded-full mb-4">
                    <Pencil className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-heading font-semibold text-foreground mb-2">
                    No polls yet
                </h3>
                <p className="text-muted-foreground max-w-sm mb-8">
                    You haven't created any polls yet. Create your first poll to get started!
                </p>
                <Link href="/polls/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Poll
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {polls.map((poll) => (
                <MyPollCard key={poll.id} poll={poll} />
            ))}
        </div>
    )
}

export default async function MyPollsPage() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div className="flex items-center justify-between border-b pb-6">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-foreground">
                        My Polls
                    </h1>
                    <p className="mt-1 text-muted-foreground">
                        Manage all your polls
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/polls/new">
                        <Button className="shadow-lg hover:shadow-primary/25">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Poll
                        </Button>
                    </Link>
                </div>
            </div>

            <Suspense fallback={<PollsGridSkeleton />}>
                <MyPollsList />
            </Suspense>
        </div>
    )
}
