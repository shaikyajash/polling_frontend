import CreatePollForm from '@/components/polls/CreatePollForm'

export default function NewPollPage() {
  // Don't check session here - let the form submission handle auth
  // This allows users to see the page, but they'll be redirected when they try to submit

  return (
    <div className="py-8">
      <CreatePollForm />
    </div>
  )
}
