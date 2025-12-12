'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import type { AuthenticationResponseJSON } from '@simplewebauthn/types'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { loginStart, loginFinish } from '@/lib/auth-actions'
import { useAuthStore } from '@/store/auth'
import { base64urlDecode, base64urlEncode } from '@/lib/webauthn-utils'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
})

export default function LoginForm() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const setUser = useAuthStore((state) => state.setUser)
  const registered = searchParams.get('registered')

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setError('')
    setLoading(true)

    try {
      const options = await loginStart(values.username)

      if (!options.public_key_options) {
        throw new Error('No public_key_options received from server')
      }

      const publicKeyOptions = options.public_key_options.publicKey || options.public_key_options

      const webAuthnOptions: PublicKeyCredentialRequestOptions = {
        ...publicKeyOptions,
        challenge: base64urlDecode(publicKeyOptions.challenge),
        allowCredentials: publicKeyOptions.allowCredentials?.map(cred => ({
          ...cred,
          id: base64urlDecode(cred.id)
        })) as PublicKeyCredentialDescriptor[]
      }

      const assertion = await navigator.credentials.get({
        publicKey: webAuthnOptions
      }) as PublicKeyCredential

      if (!assertion) {
        throw new Error('Authentication was cancelled')
      }

      const response = assertion.response as AuthenticatorAssertionResponse
      const credentialJSON: AuthenticationResponseJSON = {
        id: assertion.id,
        rawId: base64urlEncode(assertion.rawId),
        response: {
          authenticatorData: base64urlEncode(response.authenticatorData),
          clientDataJSON: base64urlEncode(response.clientDataJSON),
          signature: base64urlEncode(response.signature),
          userHandle: response.userHandle ? base64urlEncode(response.userHandle) : undefined,
        },
        type: 'public-key' as const,
        clientExtensionResults: {},
      }

      const user = await loginFinish(options.authentication_id, credentialJSON)
      setUser(user)

      router.push('/')
      router.refresh()

    } catch (error: any) {
      console.error('Login failed:', error)
      setError(error.message || 'Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md animate-fade-in">
      <Card className="border-slate-200/20 shadow-xl bg-card">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Sign in</CardTitle>
          <CardDescription className="text-center">
            Enter your username to sign in with passkey
          </CardDescription>
        </CardHeader>
        <CardContent>
          {registered === 'true' && (
            <Alert className="mb-6 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                Registration successful! Please log in.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button className="w-full" type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign in with Passkey
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 text-center text-sm text-muted-foreground">
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                New here?
              </span>
            </div>
          </div>
          <Link
            href="/register"
            className="hover:text-primary underline underline-offset-4 transition-colors"
          >
            Create an account
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
