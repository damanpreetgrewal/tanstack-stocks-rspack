import { createAuthClient } from "better-auth/react"

// better-auth client configured for cookie-based authentication
// Cookies are automatically sent with credentials across different ports
export const authClient = createAuthClient({
  baseURL: import.meta.env.API_URL || "http://localhost:3000",
  fetchOptions: {
    credentials: "include", // Ensure cookies are sent with every request
  },
})

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  $Infer,
} = authClient
