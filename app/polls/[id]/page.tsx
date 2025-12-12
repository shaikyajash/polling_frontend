import { Suspense } from 'react'
import { getPollById } from '@/lib/poll-actions'
import PollVoting from '@/components/polls/PollVoting'
import PollDetailsSkeleton from '@/components/polls/PollDetailsSkeleton'
import { notFound } from 'next/navigation'

async function PollDetails({ id }: { id: string }) {
  let poll

  try {
    poll = await getPollById(id)
  } catch (error) {
    notFound()
  }

  return <PollVoting poll={poll} />
}

export default async function PollDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Suspense fallback={<PollDetailsSkeleton />}>
        <PollDetails id={id} />
      </Suspense>
    </div>
  )
}
