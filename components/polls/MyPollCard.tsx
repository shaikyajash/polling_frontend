'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Calendar, Users, XCircle, CheckCircle, RotateCcw } from 'lucide-react'
import { closePoll, resetPoll, type UserPoll } from '@/lib/poll-actions'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

type MyPollCardProps = {
    poll: UserPoll
}

export default function MyPollCard({ poll }: MyPollCardProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [showConfirm, setShowConfirm] = useState(false)
    const [showResetConfirm, setShowResetConfirm] = useState(false)

    const handleClosePoll = () => {
        startTransition(async () => {
            try {
                await closePoll(poll.id)
                toast.success('Poll closed successfully')
                router.refresh()
            } catch (error: any) {
                toast.error(error.message || 'Failed to close poll')
            }
        })
        setShowConfirm(false)
    }

    const handleResetPoll = () => {
        startTransition(async () => {
            try {
                await resetPoll(poll.id)
                toast.success('Poll reset successfully! All votes have been cleared.')
                router.refresh()
            } catch (error: any) {
                toast.error(error.message || 'Failed to reset poll')
            }
        })
        setShowResetConfirm(false)
    }

    return (
        <Card className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50">
            <CardHeader>
                <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                        <Link href={`/polls/${poll.id}`}>
                            {poll.title}
                        </Link>
                    </CardTitle>
                    {poll.is_closed ? (
                        <Badge variant="secondary" className="shrink-0">
                            <XCircle className="h-3 w-3 mr-1" />
                            Closed
                        </Badge>
                    ) : (
                        <Badge variant="default" className="shrink-0">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Open
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{poll.total_votes} {poll.total_votes === 1 ? 'vote' : 'votes'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDistanceToNow(new Date(poll.created_at), { addSuffix: true })}</span>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="flex gap-2">
                <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link href={`/polls/${poll.id}`}>View Results</Link>
                </Button>
                {!poll.is_closed && (
                    <>
                        {showResetConfirm ? (
                            <>
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={handleResetPoll}
                                    disabled={isPending}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    {isPending ? 'Resetting...' : 'Confirm Reset'}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowResetConfirm(false)}
                                    disabled={isPending}
                                >
                                    Cancel
                                </Button>
                            </>
                        ) : showConfirm ? (
                            <>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleClosePoll}
                                    disabled={isPending}
                                >
                                    {isPending ? 'Closing...' : 'Confirm Close'}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowConfirm(false)}
                                    disabled={isPending}
                                >
                                    Cancel
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => setShowResetConfirm(true)}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    <RotateCcw className="h-4 w-4 mr-1" />
                                    Reset
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setShowConfirm(true)}
                                >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Close
                                </Button>
                            </>
                        )}
                    </>
                )}
            </CardFooter>
        </Card>
    )
}
