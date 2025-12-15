'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import type { RegistrationResponseJSON } from '@simplewebauthn/types'
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
import { registerStart, registerFinish } from '@/lib/auth-actions'
import { base64urlDecode, base64urlEncode } from '@/lib/webauthn-utils'
import { AlertCircle, Loader2 } from 'lucide-react'

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
})

export default function RegisterForm() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

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
      const options = await registerStart(values.username)

      if (!options.public_key_options) {
        throw new Error('No public_key_options received from server')
      }

      const publicKeyOptions = options.public_key_options.publicKey || options.public_key_options

      const webAuthnOptions: PublicKeyCredentialCreationOptions = {
        ...publicKeyOptions,
        challenge: base64urlDecode(publicKeyOptions.challenge),
        user: {
          ...publicKeyOptions.user,
          id: base64urlDecode(publicKeyOptions.user.id)
        },
        excludeCredentials: publicKeyOptions.excludeCredentials?.map(cred => ({
          ...cred,
          id: base64urlDecode(cred.id)
        })) as PublicKeyCredentialDescriptor[]
      }

      const credential = await navigator.credentials.create({
        publicKey: webAuthnOptions
      }) as PublicKeyCredential

      if (!credential) {
        throw new Error('Passkey creation was cancelled')
      }

      const response = credential.response as AuthenticatorAttestationResponse
      const credentialJSON: RegistrationResponseJSON = {
        id: credential.id,
        rawId: base64urlEncode(credential.rawId),
        response: {
          attestationObject: base64urlEncode(response.attestationObject),
          clientDataJSON: base64urlEncode(response.clientDataJSON),
        },
        type: 'public-key' as const,
        clientExtensionResults: {},
      }

      await registerFinish(values.username, options.registration_id, credentialJSON)

      router.push('/login?registered=true')

    } catch (error: any) {
      console.error('Registration failed:', error)

      // Handle WebAuthn-specific errors
      if (error.name === 'NotAllowedError') {
        setError('Passkey creation was cancelled. Please try again when ready.')
      } else if (error.message?.includes('timed out') || error.message?.includes('not allowed')) {
        setError('Passkey creation was cancelled or timed out. Please try again.')
      } else if (error.message?.includes('Passkey creation was cancelled')) {
        setError('Passkey creation was cancelled. Please try again when ready.')
      } else {
        setError(error.message || 'Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md animate-fade-in">
      <Card className="border-slate-200/20 shadow-xl bg-card">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create account</CardTitle>
          <CardDescription className="text-center">
            Choose a username to create your passkey
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                      <Input placeholder="Choose a username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button className="w-full" type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Passkey
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
                Already registered?
              </span>
            </div>
          </div>
          <Link
            href="/login"
            className="hover:text-primary underline underline-offset-4 transition-colors"
          >
            Sign in instead
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
