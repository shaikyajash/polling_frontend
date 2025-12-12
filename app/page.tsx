'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, BarChart3, Rocket, Activity, CheckCircle2 } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-background overflow-hidden relative selection:bg-primary/20">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] animate-pulse-slow pointer-events-none" style={{ animationDelay: '2s' }} />

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center w-full z-10">
        {/* Left Side - Hero Text */}
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <Badge variant="outline" className="px-3 py-1 border-primary/20 bg-primary/5 text-primary">
            <Rocket className="w-3 h-3 mr-2" />
            v2.0 Now Live
          </Badge>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-heading font-extrabold tracking-tight text-foreground leading-[1.1]">
            Instant feedback,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600 animate-gradient">
              effortless
            </span>{' '}
            decisions.
          </h1>

          <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
            Create live polls in seconds, gather opinions instantly, and visualize results with beautiful real-time analytics.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link href="/polls/new">
              <Button size="lg" className="w-full sm:w-auto text-base gap-2 h-14 px-8 shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-1">
                Start a Poll
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <Link href="/polls">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base gap-2 h-14 px-8 border-2 hover:bg-muted/50 transition-all hover:-translate-y-1">
                <BarChart3 className="w-4 h-4" />
                View Demo
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Instant results</span>
            </div>
          </div>
        </div>

        {/* Right Side - Animated Visual Elements */}
        <div className="relative h-[600px] hidden lg:block perspective-1000">
          {/* Poll Card - Floating */}
          <Card className="absolute top-10 left-10 w-80 animate-float shadow-2xl border-primary/10 bg-card/80 backdrop-blur-sm z-20" style={{ animationDelay: '0s' }}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <Badge variant="secondary" className="bg-primary/10 text-primary">Live Vote</Badge>
                <span className="text-xs text-muted-foreground font-mono">2m ago</span>
              </div>
              <CardTitle className="text-lg leading-tight">What's your favorite frontend framework?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>React</span>
                  <span className="font-bold">65%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full animate-width" style={{ width: '65%' }}></div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Vue</span>
                  <span>25%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full animate-width" style={{ width: '25%', animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Card - Floating */}
          <Card className="absolute top-40 right-10 w-64 animate-float shadow-2xl bg-gradient-to-br from-primary to-purple-600 text-white border-0 z-10" style={{ animationDelay: '1.5s' }}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <Activity className="w-6 h-6 opacity-80" />
                <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">+12%</span>
              </div>
              <div className="space-y-1">
                <div className="text-white/80 text-sm font-medium">Response Rate</div>
                <div className="text-4xl font-heading font-bold animate-pulse-slow">98.5%</div>
              </div>
            </CardContent>
          </Card>

          {/* Chart Card - Floating */}
          <Card className="absolute bottom-20 left-24 w-80 animate-float shadow-2xl border-primary/20 bg-background/90 backdrop-blur z-30" style={{ animationDelay: '0.8s' }}>
            <CardContent className="p-6 h-48 flex items-end justify-between gap-2">
              {[40, 70, 50, 90, 60].map((h, i) => (
                <div
                  key={i}
                  className="w-full bg-primary/20 rounded-t-sm relative group hover:bg-primary/40 transition-colors cursor-pointer"
                  style={{ height: `${h}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border">
                    {h}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
