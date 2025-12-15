# 🔐 Complete Authentication Setup

## ✅ What's Been Implemented

Your stocks dashboard now has a complete authentication system with:

### Backend (API)
- ✅ **better-auth** integration with MongoDB via Prisma
- ✅ Email/Password authentication
- ✅ Google OAuth support
- ✅ GitHub OAuth support
- ✅ Session management with cookies
- ✅ Auth middleware for protected routes
- ✅ User-specific watchlists

### Frontend (Web)
- ✅ Login/Register page with beautiful UI
- ✅ OAuth buttons for Google & GitHub
- ✅ Session state management
- ✅ Protected routes (watchlist requires login)
- ✅ Navigation showing user info when logged in
- ✅ Automatic redirect to login for unauthenticated users

### Database
- ✅ Updated Prisma schema with User, Session, Account, Verification models
- ✅ Watchlist linked to authenticated users

## 🚀 Next Steps to Get It Running

### Step 1: Generate Prisma Client & Push Schema

```bash
cd apps/api
npx prisma generate
npx prisma db push
```

This will:
- Generate the Prisma client with your new auth models
- Create the collections in MongoDB

### Step 2: Update Your `.env` File

Copy the example and fill in your credentials:

```bash
cp .env.example .env
```

**Required:**
```env
DATABASE_URL="your_mongodb_connection_string"
FINNHUB_API_KEY="your_finnhub_key"
```

**Optional (OAuth):**
```env
# Google OAuth
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# GitHub OAuth
GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"
```

### Step 3: Start the Development Servers

```bash
# From the root directory
npm run dev
```

Or start them separately:
```bash
# Terminal 1 - API
npm run api

# Terminal 2 - Web
npm run web
```

## 🔑 Setting Up OAuth (Optional)

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID
3. Add redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy Client ID and Secret to `.env`

### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create New OAuth App
3. Set callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Secret to `.env`

**Note:** OAuth will work automatically if you add the credentials. If you don't add them, users can still sign up/login with email and password!

## 📋 How It Works

### Authentication Flow

1. **Sign Up**: User creates account at `/auth`
   - Email/Password: Stored securely in MongoDB
   - OAuth: Creates user from Google/GitHub profile

2. **Sign In**: User logs in
   - Creates session stored in database
   - Sets httpOnly cookie in browser

3. **Protected Routes**: 
   - Watchlist requires authentication
   - Middleware checks session on each request
   - Redirects to `/auth` if not logged in

4. **Sign Out**: 
   - Destroys session
   - Clears cookie
   - Redirects to home

### User-Specific Watchlists

- Each watchlist item is now linked to a user ID
- Users only see their own watchlists
- Multiple users can have the same stock in their watchlist

## 🎨 Features Added

### Auth Page (`/auth`)
- Toggle between login and register
- Email/password form with validation
- Google sign-in button
- GitHub sign-in button
- Beautiful gradient background
- Responsive design

### Navigation
- Shows "Sign In" when not authenticated
- Shows user name/email and avatar when logged in
- "Sign Out" button
- Hides watchlist link when not logged in

### Watchlist Protection
- Redirects to `/auth` if not logged in
- Shows loading state while checking auth
- Fetches only current user's watchlist

## 🧪 Testing the Auth Flow

1. **Start the servers** (`npm run dev`)

2. **Create an account**:
   - Go to http://localhost:4200/auth
   - Enter name, email, password
   - Click "Sign Up"
   
3. **Add stocks to watchlist**:
   - Search for stocks
   - Add to watchlist
   - They're now saved to YOUR account

4. **Sign out and create another account**:
   - Different user
   - Their watchlist is separate!

5. **Test OAuth** (if configured):
   - Click "Continue with Google" or "Continue with GitHub"
   - Authorize the app
   - Automatically creates account and logs in

## 📁 Key Files Modified/Created

### Backend
- `apps/api/src/auth.ts` - better-auth configuration
- `apps/api/src/routes/auth.ts` - Auth endpoints
- `apps/api/src/middleware.ts` - Auth middleware
- `apps/api/src/routes/watchlist.ts` - Updated for user auth
- `apps/api/src/main.ts` - Added auth routes & middleware
- `apps/api/prisma/schema.prisma` - Added User, Session, Account models

### Frontend
- `apps/web/src/lib/auth-client.ts` - better-auth React client
- `apps/web/src/routes/auth.tsx` - Login/Register page
- `apps/web/src/components/Navigation.tsx` - Added auth state
- `apps/web/src/routes/watchlist/index.tsx` - Added route protection
- `apps/web/src/lib/api-client.ts` - Added `withCredentials`

### Documentation
- `AUTH_SETUP.md` - Detailed OAuth setup guide
- `NEXT_STEPS.md` - This file
- Updated `README.md` with auth features

## 🔒 Security Features

- ✅ Passwords hashed with bcrypt
- ✅ HttpOnly cookies (prevents XSS)
- ✅ CORS with credentials
- ✅ Session expiration
- ✅ CSRF protection (built into better-auth)
- ✅ OAuth state verification

## ❓ Troubleshooting

### "Cannot find module '@prisma/client'"
```bash
cd apps/api
npx prisma generate
```

### "Property 'user' does not exist on type 'PrismaClient'"
```bash
cd apps/api
npx prisma generate
npx prisma db push
```

### OAuth not working
1. Check env variables are set
2. Verify callback URLs match exactly
3. Check console for errors

### Session not persisting
1. Check cookies in browser DevTools
2. Verify `withCredentials: true` in axios
3. Check CORS settings

## 🎯 What's Next?

Your auth system is ready! You can now:

1. Add email verification (optional)
2. Add password reset functionality
3. Add user profile page
4. Add social login with more providers
5. Add role-based access control
6. Add 2FA (two-factor authentication)

For detailed OAuth setup instructions, see [AUTH_SETUP.md](AUTH_SETUP.md).

---

**Ready to test?** Run `npm run dev` and visit http://localhost:4200/auth 🚀
