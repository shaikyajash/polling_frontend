'use client'

import { useState, useTransition, useOptimistic, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { votePoll, type PollDetails } from '@/lib/poll-actions'
import { useAuthStore } from '@/store/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Check, BarChart2, Loader2, Info, Radio, RefreshCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

export default function PollVoting({ poll }: { poll: PollDetails }) {

  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const [isLiveMode, setIsLiveMode] = useState(false)
  const [livePollData, setLivePollData] = useState<PollDetails | null>(null)
  const prevLiveModeRef = useRef(false)

  // Optimistic state for smooth UI updates
  const [optimisticPoll, setOptimisticPoll] = useOptimistic(
    livePollData || poll,
    (state, votedOptionId: string) => {
      return {
        ...state,
        user_voted_option_id: votedOptionId,
        total_votes: state.total_votes + 1,
        options: state.options.map(opt =>
          opt.id === votedOptionId
            ? { ...opt, vote_count: opt.vote_count + 1 }
            : opt
        )
      }
    }
  )

  // Refresh when live mode is turned off to get latest data
  useEffect(() => {
    // If live mode was on and is now off, refresh to get latest data
    if (prevLiveModeRef.current && !isLiveMode) {
      router.refresh()
    }
    prevLiveModeRef.current = isLiveMode
  }, [isLiveMode, router])




  useEffect(() => {

    let eventSource: EventSource | null = null;

    if (isLiveMode && !optimisticPoll.is_closed) {

      const sseUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/polls/${poll.id}/results`;
      console.log('Connecting to SSE:', sseUrl);

      eventSource = new EventSource(sseUrl);

      eventSource.onopen = () => {
        console.log('SSE Connected');
        toast.info('Live updates connected');
      };

      eventSource.onmessage = (event) => {
        try {
          console.log('SSE Message:', event.data);

          const data = JSON.parse(event.data);

          // IMPORTANT: If user just voted (pending state), don't update immediately
          // This prevents the flash when optimistic update is still settling
          // We'll get the update after the vote completes via router.refresh()

          // Detect if poll has been reset (all votes = 0)
          const isPollReset = data.total_votes === 0 && data.options.every((opt: any) => opt.vote_count === 0);

          // Build the updated poll data
          const updatedPoll: PollDetails = {
            ...poll,
            ...data,
            options: data.options.map((opt: any) => ({
              ...opt,
            })),
            // If poll was reset, clear user's vote. Otherwise preserve it from optimistic state
            // The server doesn't send back user_voted_option_id in SSE, only counts
            user_voted_option_id: isPollReset
              ? null
              : (optimisticPoll.user_voted_option_id || data.user_voted_option_id)
          };

          // Only update if poll is not closed
          setLivePollData(updatedPoll);

          // If the poll is closed, turn off live mode
          if (updatedPoll.is_closed) {
            setIsLiveMode(false);
            toast.info('Poll has been closed');
            router.refresh();
          }

          // If poll was reset, notify user
          if (isPollReset && optimisticPoll.user_voted_option_id) {
            toast.info('Poll has been reset by the owner');
          }
        } catch (error) {
          console.error('Error parsing SSE data:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE Error:', error);
        // toast.error('Connection lost. Retrying...');
        // EventSource automatically retries
      };
    } else {
      if (eventSource) {
        (eventSource as EventSource).close();
      }
      setLivePollData(null);
    }

    return () => {
      if (eventSource) {
        (eventSource as EventSource).close();
      }
    };
  }, [isLiveMode, poll.id, optimisticPoll.is_closed]); // Re-run if mode changes

  const handleVote = async (optionId: string) => {
    if (!user) {
      router.push('/login')
      return
    }

    if (optimisticPoll.is_closed) {
      toast.error('This poll is closed')
      return
    }

    if (optimisticPoll.user_voted_option_id) {
      toast.error('You have already voted on this poll')
      return
    }

    // Optimistic update
    startTransition(async () => {
      setOptimisticPoll(optionId)

      try {
        await votePoll(poll.id, optionId)
        toast.success('Vote recorded!')
        // Always refresh after voting to get the latest server state
        // This ensures our client state matches server even in live mode
        router.refresh()
      } catch (err: any) {
        console.error(err)
        toast.error(err.message || 'Failed to vote')
        // On error, also refresh to reset state
        router.refresh()
      }
    })
  }

  const currentPoll = optimisticPoll // useOptimistic handles the toggle via the input prop

  const maxVotes = Math.max(...currentPoll.options.map(opt => opt.vote_count), 1)
  const totalVotes = currentPoll.total_votes || 1

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-500">
      {/* Poll Header */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="space-y-4">
          <div className="flex justify-between items-start">
            <CardTitle className="text-3xl sm:text-4xl font-heading font-extrabold leading-tight">
              {currentPoll.title}
            </CardTitle>
            <Badge
              variant={currentPoll.is_closed ? "secondary" : "default"}
              className={`${currentPoll.is_closed
                ? "bg-muted text-muted-foreground"
                : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"} 
                px-3 py-1 text-sm`}
            >
              {!currentPoll.is_closed && (
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mr-2" />
              )}
              {currentPoll.is_closed ? 'Closed' : 'Live'}
            </Badge>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-muted-foreground font-medium">
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <BarChart2 className="w-4 h-4" />
              )}
              <span>{currentPoll.total_votes} {currentPoll.total_votes === 1 ? 'vote' : 'votes'}</span>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="live-mode"
                checked={isLiveMode}
                onCheckedChange={setIsLiveMode}
                disabled={currentPoll.is_closed}
              />
              <Label htmlFor="live-mode" className="flex items-center gap-2 cursor-pointer">
                {isLiveMode ? (
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    Live Updates
                  </span>
                ) : (
                  <span className="text-muted-foreground">Live Updates Off</span>
                )}
              </Label>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Voted Confirmation Banner */}
      {currentPoll.user_voted_option_id && (
        <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg animate-in slide-in-from-top-2">
          <p className="text-sm text-primary font-medium flex items-center gap-2">
            <Info className="w-5 h-5" />
            You voted for: <span className="font-bold">{currentPoll.options.find(o => o.id === currentPoll.user_voted_option_id)?.option_text}</span>
          </p>
        </div>
      )}

      {/* Voting Options */}
      <div className="grid gap-4">
        {currentPoll.options
          .sort((a, b) => a.display_order - b.display_order)
          .map((option) => {
            const isUserVote = option.id === currentPoll.user_voted_option_id
            const isLeading = option.vote_count === maxVotes && option.vote_count > 0
            const percentage = totalVotes > 0 ? Math.round((option.vote_count / totalVotes) * 100) : 0

            // Dynamic Styles
            let borderColor = "border-border"
            let bgColor = "hover:bg-muted/50"
            let progressColor = "bg-muted"
            let textColor = "text-muted-foreground"

            if (isLeading) {
              borderColor = "border-emerald-500/50"
              bgColor = "bg-emerald-500/5"
              progressColor = "bg-emerald-500/20"
              textColor = "text-emerald-600 dark:text-emerald-400"
            } else if (isUserVote) {
              borderColor = "border-primary/50"
              bgColor = "bg-primary/5"
              progressColor = "bg-primary/20"
              textColor = "text-primary"
            }

            return (
              <button
                key={option.id}
                onClick={() => handleVote(option.id)}
                disabled={isPending || currentPoll.is_closed || !!currentPoll.user_voted_option_id}
                className={cn(
                  "relative w-full text-left p-4 sm:p-6 rounded-xl border-2 transition-all outline-nonering-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 overflow-hidden",
                  borderColor,
                  bgColor,
                  !currentPoll.is_closed && !currentPoll.user_voted_option_id && "hover:-translate-y-0.5 hover:shadow-md cursor-pointer",
                  (currentPoll.is_closed || currentPoll.user_voted_option_id) && "cursor-default"
                )}
              >
                {/* Progress Background */}
                <div
                  className={cn("absolute inset-0 transition-all duration-1000 ease-out", progressColor)}
                  style={{ width: `${percentage}%` }}
                />

                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg sm:text-xl text-foreground">
                        {option.option_text}
                      </span>

                      {/* Icons Logic */}
                      {isUserVote && isLeading && (
                        <div className="bg-emerald-500/20 p-1 rounded-full animate-in zoom-in">
                          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                      )}

                      {isUserVote && !isLeading && (
                        <div className="bg-primary/20 p-1 rounded-full animate-in zoom-in">
                          <Check className="w-4 h-4 text-primary" />
                        </div>
                      )}

                      {!isUserVote && isLeading && (
                        <div className="bg-emerald-500/20 p-1 rounded-full animate-in zoom-in">
                          <BarChart2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                      )}

                      {isPending && option.id === currentPoll.user_voted_option_id && (
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      )}
                    </div>

                    <div className={cn("text-sm font-medium", textColor)}>
                      {option.vote_count} {option.vote_count === 1 ? 'vote' : 'votes'}
                    </div>
                  </div>

                  <div className={cn("text-2xl sm:text-3xl font-black", textColor)}>
                    {percentage}%
                  </div>
                </div>
              </button>
            )
          })}
      </div>

      {/* Login Prompt */}
      {!user && !currentPoll.is_closed && (
        <Card className="border-amber-500/30 bg-amber-500/10 backdrop-blur-md">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <Info className="w-6 h-6 text-amber-500" />
            </div>
            <p className="text-amber-700 dark:text-amber-200 font-medium">
              Sign in to vote on this poll
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
