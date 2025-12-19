# Setup Guide

## Prerequisites

- Node.js 18+ (download from [nodejs.org](https://nodejs.org))
- MongoDB Atlas account (free tier at [mongodb.com](https://cloud.mongodb.com))
- Finnhub API key (free at [finnhub.io](https://finnhub.io))

## Step 1: Get MongoDB Connection String

1. Go to [mongodb.com](https://cloud.mongodb.com)
2. Create a free account
3. Create a new project
4. Create a cluster (choose free tier)
5. Click "Connect" > "Drivers" > Copy connection string
6. Replace `<username>` and `<password>` with your database user credentials

## Step 2: Get Finnhub API Key

1. Go to [finnhub.io](https://finnhub.io)
2. Sign up for free account
3. Copy your API key from the dashboard

## Step 3: Setup Environment

```bash
# Copy example env file
cp .env.example .env.local

# Edit .env.local with your credentials
# DATABASE_URL="your_mongodb_connection_string"
# FINNHUB_API_KEY="your_api_key"
# VITE_FINNHUB_API_KEY="your_api_key"
```

## Step 4: Install Dependencies

```bash
npm install
```

## Step 5: Setup Prisma

```bash
# Generate Prisma client
npm run prisma:generate

# (Optional) View database in Prisma Studio
npm run prisma:studio
```

## Step 6: Run Development Servers

```bash
# Start both API (3000) and Web (4200)
npm run dev

# Or run separately:
npm run api    # API only
npm run web    # Web only
```

## Step 7: Open in Browser

- **Frontend**: http://localhost:4200
- **API Health**: http://localhost:3000/health
- **API Routes**: http://localhost:3000/api

## Troubleshooting

### "Cannot find module @stocks/contracts"
```bash
npm install
```

### "MongoDB connection failed"
- Check DATABASE_URL in .env.local
- Verify IP whitelist in MongoDB Atlas
- Confirm username/password are correct

### "Finnhub API key invalid"
- Get fresh key from [finnhub.io](https://finnhub.io)
- Add to both FINNHUB_API_KEY and VITE_FINNHUB_API_KEY

### "Port 3000 already in use"
```bash
# Change API port in apps/api/src/main.ts
# Or kill process: npx kill-port 3000
```

### "Port 4200 already in use"
```bash
npm run web -- --port 3001
```

## Project Structure

```
tanstack-stocks-rspack/
├── apps/
│   ├── api/              # Express backend
│   │   ├── src/
│   │   ├── prisma/       # Database schema
│   │   └── package.json
│   │
│   └── web/              # React frontend (Rspack)
│       ├── src/
│       ├── routes/       # Page components
│       └── package.json
│
└── packages/
    └── contracts/        # ts-rest + Zod contracts
```

## Development Workflow

### Start Development
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Type Check
```bash
npm run type-check
```

### Lint Code
```bash
npm run lint
```

# DB Reset Command
npm run db:reset-data

# Generate client
npm run prisma:generate

# View data
npm run prisma:studio
```

## Key Features

- ✅ **TanStack Router** - Type-safe routing
- ✅ **TanStack Query** - Server state with 10s polling
- ✅ **TanStack Virtual** - Virtualized lists
- ✅ **TanStack Store** - Reactive watchlist
- ✅ **Notifications** - Sonner toast system
- ✅ **Performance** - Web Vitals monitoring
- ✅ **TypeScript** - Full type safety
- ✅ **Rspack** - Lightning-fast bundler

## API Routes

### Stocks Contract

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/stocks/:symbol/quote` | Get current price |
| GET | `/api/stocks/search?q=...` | Search stocks |
| GET | `/api/stocks/popular?limit=8` | Popular stocks |
| GET | `/api/stocks/:symbol/profile` | Company info |
| GET | `/api/stocks/:symbol/historical` | Historical candles |

## Environment Variables

```env
# Database
DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/stocks

# Finnhub API
FINNHUB_API_KEY=your_api_key

# Backend
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:4200

# Frontend
API_URL=http://localhost:3000/api
```

## Learning Resources

- [TanStack Documentation](https://tanstack.com)
- [Rspack Guide](https://rspack.dev)
- [ts-rest Docs](https://ts-rest.com)
- [Prisma ORM](https://prisma.io)
- [React 19](https://react.dev)

## Next Steps

1. ✅ Get API key and MongoDB URL
2. ✅ Run `npm install`
3. ✅ Create `.env.local`
4. ✅ Run `npm run prisma:generate`
5. ✅ Run `npm run dev`
6. 🔜 Explore the app at http://localhost:4200

## Support

For issues:
1. Check troubleshooting section
2. Verify environment variables
3. Check API health: http://localhost:3000/health
4. View browser console for client errors
5. Check terminal for API errors

---

**Happy coding! 🚀**
