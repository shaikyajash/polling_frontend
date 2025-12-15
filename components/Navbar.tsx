'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { logout } from '@/lib/auth-actions'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Loader2, LogOut, Plus, User, BarChart2 } from 'lucide-react'

export default function Navbar() {
  const { user, isLoading } = useAuthStore()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      useAuthStore.getState().logout()
      await logout()
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl"><img src="/favicon.png" alt="logo" className="w-8 h-8" /></span>
              <span className="text-xl font-heading font-bold tracking-tight">Polls</span>
            </Link>

            <div className="hidden md:flex gap-1">
              <Link href="/polls">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                  All Polls
                </Button>
              </Link>
              {user && (
                <Link href="/polls/new">
                  <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                    Create Poll
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : user ? (
              <div className="flex items-center gap-4">
                <Link href="/polls/new" className="hidden sm:block">
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create
                  </Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                      <Avatar className="h-9 w-9 border-2 border-primary/20 hover:border-primary transition-colors">
                        <AvatarImage src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user.username}`} alt={user.username} />
                        <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.username}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          Logged in with passkey
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/my-polls" className="cursor-pointer">
                        <BarChart2 className="mr-2 h-4 w-4" />
                        <span>My Polls</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/polls/new" className="cursor-pointer">
                        <Plus className="mr-2 h-4 w-4" />
                        <span>Create New</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost">Sign in</Button>
                </Link>
                <Link href="/register">
                  <Button>Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
