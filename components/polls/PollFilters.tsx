'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function PollFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const currentFilter = searchParams.get('filter') || 'open'

    const handleTabChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value === 'open') {
            params.delete('filter') // Default
        } else {
            params.set('filter', value)
        }
        router.push(`/polls?${params.toString()}`)
    }

    return (
        <Tabs defaultValue={currentFilter} onValueChange={handleTabChange}>
            <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="open">Open</TabsTrigger>
                <TabsTrigger value="closed">Closed</TabsTrigger>
            </TabsList>
        </Tabs>
    )
}
