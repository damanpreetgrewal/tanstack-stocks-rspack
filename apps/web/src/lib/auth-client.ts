import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: import.meta.env.API_URL || 'http://localhost:3000',
})

export const { signIn, signUp, signOut, useSession, $Infer } = authClient
