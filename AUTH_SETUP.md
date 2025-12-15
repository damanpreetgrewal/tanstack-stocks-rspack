# Authentication Setup Guide

This project uses **better-auth** for authentication with support for:
- Email/Password authentication
- Google OAuth
- GitHub OAuth

## Quick Start

1. **Database Setup**: Prisma models are already configured in [schema.prisma](apps/api/prisma/schema.prisma)

2. **Generate Prisma Client**:
   ```bash
   cd apps/api
   npx prisma generate
   npx prisma db push
   ```

3. **Environment Variables**: Copy `.env.example` to `.env` and fill in the required values.

## Email/Password Authentication

Works out of the box! Users can:
- Sign up with email and password
- Sign in with their credentials
- Access protected routes (like watchlist)

No additional configuration needed.

## OAuth Setup (Optional)

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 Client ID:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
   - For production, add: `https://yourdomain.com/api/auth/callback/google`
5. Copy Client ID and Client Secret to `.env`:
   ```
   GOOGLE_CLIENT_ID=your_client_id_here
   GOOGLE_CLIENT_SECRET=your_client_secret_here
   ```

### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the details:
   - Application name: Your app name
   - Homepage URL: `http://localhost:4200`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
   - For production, use: `https://yourdomain.com/api/auth/callback/github`
4. Copy Client ID and generate Client Secret
5. Add to `.env`:
   ```
   GITHUB_CLIENT_ID=your_client_id_here
   GITHUB_CLIENT_SECRET=your_client_secret_here
   ```

## How It Works

### Backend

- **Auth Config**: [apps/api/src/auth.ts](apps/api/src/auth.ts) - better-auth configuration
- **Auth Routes**: [apps/api/src/routes/auth.ts](apps/api/src/routes/auth.ts) - handles all auth endpoints
- **Middleware**: [apps/api/src/middleware.ts](apps/api/src/middleware.ts) - authentication middleware
- **Protected Routes**: Watchlist endpoints require authentication

### Frontend

- **Auth Client**: [apps/web/src/lib/auth-client.ts](apps/web/src/lib/auth-client.ts) - better-auth React client
- **Auth Page**: [apps/web/src/routes/auth.tsx](apps/web/src/routes/auth.tsx) - login/register UI
- **Protected Routes**: Watchlist page redirects to login if not authenticated
- **Navigation**: Shows user info and sign out button when logged in

## User Flow

1. **Not Authenticated**: 
   - User sees "Sign In" button in navigation
   - Accessing watchlist redirects to `/auth`

2. **Sign Up/Sign In**:
   - Email/Password: Enter credentials and submit
   - OAuth: Click "Continue with Google/GitHub"

3. **Authenticated**:
   - User info shown in navigation
   - Can access watchlist (user-specific)
   - Sign out button available

## Database Schema

The Prisma schema includes:

- **User**: Stores user information
- **Session**: Active user sessions
- **Account**: OAuth provider accounts and password hashes
- **Verification**: Email verification tokens (if enabled)
- **Watchlist**: User-specific stock watchlists (linked to User)

## API Endpoints

Better-auth automatically creates these endpoints:

- `POST /api/auth/sign-up/email` - Sign up with email/password
- `POST /api/auth/sign-in/email` - Sign in with email/password
- `POST /api/auth/sign-out` - Sign out
- `GET /api/auth/session` - Get current session
- `GET /api/auth/signin/google` - OAuth with Google
- `GET /api/auth/signin/github` - OAuth with GitHub
- And more...

## Security Features

- ✅ Secure password hashing
- ✅ Session management
- ✅ CORS protection
- ✅ CSRF protection (via better-auth)
- ✅ OAuth state verification
- ✅ Cookie-based sessions with httpOnly flag

## Troubleshooting

### OAuth Not Working?

1. Check environment variables are set correctly
2. Verify callback URLs match exactly (including http/https)
3. Make sure OAuth app is not restricted to specific domains
4. Check browser console for errors

### Session Not Persisting?

1. Ensure `withCredentials: true` in axios config
2. Check CORS settings include `credentials: true`
3. Verify cookies are being set (check browser dev tools)

### Database Errors?

1. Run `npx prisma generate` after schema changes
2. Run `npx prisma db push` to sync with MongoDB
3. Check DATABASE_URL is correct

## Next Steps

- [ ] Enable email verification (set `requireEmailVerification: true` in auth.ts)
- [ ] Add password reset functionality
- [ ] Implement rate limiting
- [ ] Add 2FA (two-factor authentication)
- [ ] Set up social login with more providers (Twitter, Discord, etc.)
