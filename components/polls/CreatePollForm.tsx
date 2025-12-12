'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createPoll } from '@/lib/poll-actions'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, Plus, Trash2, Sparkles, ArrowLeft } from 'lucide-react'

const formSchema = z.object({
  title: z.string().min(5, {
    message: "Poll question must be at least 5 characters.",
  }),
  options: z.array(z.object({
    value: z.string().min(1, { message: "Option cannot be empty" })
  })).min(2, {
    message: "You must have at least 2 options.",
  }).max(10, {
    message: "You can have up to 10 options."
  })
})

export default function CreatePollForm() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({

    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      options: [{ value: "" }, { value: "" }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)

    try {
      const optionStrings = values.options.map(o => o.value)
      await createPoll(values.title, optionStrings)
      toast.success("Poll created successfully!")
      router.push('/polls')
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Failed to create poll')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="border-border/50 shadow-xl bg-card">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="-ml-2 h-8 w-8 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-2xl font-heading font-bold bg-linear-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Create New Poll
            </CardTitle>
          </div>
          <CardDescription>
            Ask a question and let your community vote.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Poll Question</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., What's your favorite framework?"
                        className="text-lg py-6"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This will be the main title of your poll.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Answer Options</Label>
                  <span className="text-xs text-muted-foreground">
                    {fields.length}/10 options
                  </span>
                </div>

                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <FormField
                      key={field.id}
                      control={form.control}
                      name={`options.${index}.value`}
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-medium text-muted-foreground bg-muted/50">
                              {index + 1}
                            </span>
                            <FormControl>
                              <Input placeholder={`Option ${index + 1}`} {...field} />
                            </FormControl>
                            {fields.length > 2 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => remove(index)}
                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <FormMessage className="ml-10" />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>

                {fields.length < 10 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="ml-10 w-[calc(100%-2.5rem)] border-dashed border-2 hover:border-primary/50 hover:bg-primary/5 text-muted-foreground"
                    onClick={() => append({ value: "" })}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Option
                  </Button>
                )}
              </div>

              <Separator />

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-linear-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg hover:shadow-primary/25 transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Create Poll
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
