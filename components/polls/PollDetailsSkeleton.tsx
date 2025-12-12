import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardHeader, CardContent } from "@/components/ui/card"

export default function PollDetailsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader className="space-y-4">
          <Skeleton className="h-10 w-3/4 rounded-lg" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-5 w-32 rounded-lg" />
          </div>
        </CardHeader>
      </Card>

      {/* Options Skeleton */}
      <div className="grid gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="relative w-full p-4 sm:p-6 rounded-xl border-2 border-muted bg-card">
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-3">
                <Skeleton className="h-6 w-1/3 rounded" />
                <Skeleton className="h-4 w-20 rounded" />
              </div>
              <Skeleton className="h-8 w-16 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
