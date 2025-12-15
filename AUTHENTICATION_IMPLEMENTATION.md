# Authentication Implementation

## Overview

This application uses **cookie-based authentication** with better-auth, following security best practices for cross-origin authentication between backend (port 3000) and frontend (port 4200).

## Key Features

### ✅ No localStorage for User Data
- User authentication data is **never stored in localStorage**
- Only watchlist data uses localStorage as an offline backup fallback
- All authentication state is managed via secure cookies

### ✅ No getUser Endpoint at Root
- There is **no `/user` or `/getUser` endpoint** at the URL root
- User information is obtained from the session cookie automatically
- Backend decodes user from the cookie using `auth.api.getSession()`

### ✅ Cookie-Based Authentication
- **httpOnly cookies** prevent XSS attacks (JavaScript cannot access them)
- **sameSite: "lax"** allows cookies in cross-site contexts
- **secure flag** enabled in production (HTTPS only)
- Cookies are automatically sent with every request

### ✅ Cross-Origin Support
- Backend runs on port **3000**
- Frontend runs on port **4200**
- CORS configured with `credentials: true` to allow cookies
- Trusted origins configured in better-auth

## Architecture

### Backend (apps/api)

#### Configuration (apps/api/src/auth.ts)
```typescript
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "mongodb" }),
  emailAndPassword: { enabled: true },
  socialProviders: { google: {...}, github: {...} },
  baseURL: "http://localhost:3000/api/auth",
  trustedOrigins: ["http://localhost:4200"],
  cookieOptions: {
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,  // Security: prevents JavaScript access
    path: "/",
  },
})
```

#### Middleware (apps/api/src/middleware.ts)
The `requireAuth` middleware decodes the user from the cookie:

```typescript
export async function requireAuth(req, res, next) {
  const session = await auth.api.getSession({
    headers: req.headers as Record<string, string>,
  })
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  
  req.user = session.user
  req.session = session.session
  next()
}
```

**How it works:**
1. Extract cookie from request headers
2. Validate and decode the session
3. Attach user information to request object
4. Continue to route handler

#### CORS Configuration (apps/api/src/main.ts)
```typescript
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
  credentials: true,  // Allow cookies across origins
}))
```

### Frontend (apps/web)

#### Auth Client (apps/web/src/lib/auth-client.ts)
```typescript
export const authClient = createAuthClient({
  baseURL: import.meta.env.API_URL || "http://localhost:3000",
  fetchOptions: {
    credentials: "include",  // Send cookies with every request
  },
})
```

#### API Requests (apps/web/src/lib/store.ts)
All API requests include credentials:

```typescript
const response = await fetch(`${API_URL}/watchlist`, {
  credentials: 'include',  // Send cookies to backend
})
```

## Authentication Flow

### 1. Sign In
```
User → Frontend (email/password) → POST /api/auth/sign-in/email
                                  ← Backend sets cookie
Frontend ← Session established   ← Cookie stored in browser
```

### 2. Subsequent Requests
```
User → Frontend (any action) → GET/POST /api/* (with cookie)
                              ← Backend: auth.api.getSession(headers)
                              ← Backend: validates session
                              ← Backend: returns user data
Frontend ← Response            ← Cookie maintained
```

### 3. Sign Out
```
User → Frontend → POST /api/auth/sign-out (with cookie)
                ← Backend clears cookie
Frontend ← Logged out
```

## Security Features

1. **httpOnly Cookies**
   - Cannot be accessed via JavaScript
   - Prevents XSS attacks

2. **CORS Protection**
   - Only trusted origins can make requests
   - Credentials only sent to allowed origins

3. **Session Validation**
   - Every protected route validates the session
   - Invalid/expired sessions are rejected

4. **No Token Exposure**
   - No auth tokens in localStorage
   - No auth tokens in sessionStorage
   - Cookies are managed by the browser

## Environment Variables

```env
# Backend
WEB_URL="http://localhost:4200"
CORS_ORIGIN="http://localhost:4200"
PORT=3000

# Frontend
API_URL="http://localhost:3000"
```

## Protected Routes

The following routes require authentication:

- `POST /api/watchlist` - Add to watchlist
- `GET /api/watchlist` - Get watchlist
- `DELETE /api/watchlist/:ticker` - Remove from watchlist
- `DELETE /api/watchlist` - Clear watchlist

## Session Management

- **Session Cookie Name**: Automatically managed by better-auth
- **Session Duration**: Configured in better-auth settings
- **Session Cache**: 5 minutes (configurable)
- **Session Storage**: MongoDB via Prisma

## Testing Authentication

### 1. Start the servers
```bash
npm run dev  # Starts both API and web
```

### 2. Test Sign Up
- Navigate to http://localhost:4200/auth
- Create an account
- Verify cookie is set in browser DevTools

### 3. Test Protected Routes
- Navigate to http://localhost:4200/watchlist
- Verify you can access the watchlist
- Sign out and verify redirect to auth page

### 4. Test Cross-Origin Cookies
- Open browser DevTools → Application → Cookies
- Verify cookie is set for the API domain
- Verify cookie is sent with API requests (Network tab)

## Troubleshooting

### Cookies not being sent?
- Check CORS configuration includes `credentials: true`
- Verify `credentials: 'include'` in fetch options
- Ensure API and frontend domains are in trusted origins

### Session not persisting?
- Check cookie settings (sameSite, secure, httpOnly)
- Verify DATABASE_URL is correctly configured
- Check Prisma schema includes Session model

### OAuth not working?
- Verify OAuth callback URLs match exactly
- Check environment variables are set
- Ensure OAuth apps are enabled in better-auth config

## References

- [Better-Auth Documentation](https://www.better-auth.com/)
- [MDN: HTTP Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [OWASP: Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
