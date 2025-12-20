import { createAuthClient } from "better-auth/react";
import { config } from './config';

export const authClient = createAuthClient({
  baseURL: config.baseUrl,
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  $Infer,
} = authClient;
