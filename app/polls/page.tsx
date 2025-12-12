import { Suspense } from 'react'
import PollsList from '@/components/polls/PollsList'
import { PollsGridSkeleton } from '@/components/polls/PollSkeleton'
import PollFilters from '@/components/polls/PollFilters'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function PollsPage({ searchParams }: { searchParams: SearchParams }) {
  // In Next.js 15+, searchParams is a Promise
  const params = await searchParams
  const filterParam = typeof params.filter === 'string' ? params.filter : 'open'
  const filter = ['all', 'open', 'closed'].includes(filterParam)
    ? (filterParam as 'all' | 'open' | 'closed')
    : 'open'

  let title = 'Active Polls'
  let subtitle = 'Browse active polls and cast your vote'

  if (filter === 'closed') {
    title = 'Closed Polls'
    subtitle = 'View results of past polls'
  } else if (filter === 'all') {
    title = 'All Polls'
    subtitle = 'Browse all polls'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between border-b pb-6">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">
            {title}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {subtitle}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <PollFilters />
          <Link href="/polls/new">
            <Button className="shadow-lg hover:shadow-primary/25">
              <Plus className="mr-2 h-4 w-4" />
              Create Poll
            </Button>
          </Link>
        </div>
      </div>

      <Suspense key={filter} fallback={<PollsGridSkeleton />}>
        <PollsList filter={filter} />
      </Suspense>
    </div>
  )
}
