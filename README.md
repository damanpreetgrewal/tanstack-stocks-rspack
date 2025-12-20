# 🚀 TanStack Stocks Dashboard

> **A production-grade monorepo showcasing the complete TanStack ecosystem** with real-time stock market data, authentication, and modern full-stack patterns.

<div align="center">

**React 19** • **TanStack Router** • **TanStack Query** • **TanStack Form** • **TanStack Virtual** • **TanStack Store**  
**Rspack** • **Better Auth** • **TypeScript** • **Prisma** • **MongoDB** • **Nx Monorepo**

[Quick Start](#-quick-start) • [Features](#-features) • [Documentation](#-documentation) • [Architecture](#-architecture)

</div>

---

## ✨ What Makes This Special

This isn't just another stock dashboard – it's a **comprehensive reference implementation** demonstrating:

- 🎯 **Complete TanStack ecosystem integration** in a real-world application
- 🏗️ **Nx monorepo architecture** with shared contracts and type safety
- 🔐 **Full authentication system** with OAuth providers (Google, GitHub)
- ⚡ **Rspack bundler** – 5x faster builds than Webpack
- 📡 **Real-time data** with optimistic updates and intelligent caching
- 🎨 **Modern UI/UX** with dark mode and responsive design
- 📚 **Learning-focused** – every pattern is documented and explained

---

## 🎯 Features

### Core Functionality
- **📊 Real-Time Stock Data** – Live price updates every 10 seconds via polling
- **🔍 Advanced Search** – Search 5000+ stocks with instant virtualized rendering
- **⭐ Personal Watchlist** – Track favorite stocks with localStorage persistence
- **📈 Stock Details** – Company profiles, historical charts, and market data
- **🔐 Authentication** – Secure login with email/password or OAuth providers
- **🌙 Dark Mode** – Fully responsive design with dark theme support

### TanStack Integrations

#### 🧭 TanStack Router
```typescript
// Route loaders pre-fetch data before rendering
loader: async () => {
  const response = await apiClient.getPopular({ query: { limit: '8' } });
  return { popularStocks: response.body };
}
```
- File-based routing with automatic code splitting
- Type-safe navigation and search params
- Route loaders eliminate waterfall loading
- Error boundaries and suspense integration

#### 🔄 TanStack Query
```typescript
// Seamless loader + query integration
const { data } = useQuery({
  queryKey: ['stock', symbol],
  queryFn: () => fetchStock(symbol),
  initialData: loaderData.stock,
  refetchInterval: 10000, // Real-time updates
});
```
- Intelligent caching and background refetching
- Optimistic UI updates
- Automatic request deduplication
- React Suspense support

#### 📝 TanStack Form
- Advanced form validation with Zod schemas
- Field-level subscriptions and updates
- URL-synchronized search state
- Type-safe form handling

#### 🚀 TanStack Virtual
- Smooth rendering of 5000+ stock items
- Only renders visible items (20 DOM nodes for 5000 items)
- 60fps scrolling performance
- Dynamic height calculations

#### 💾 TanStack Store
- Lightweight reactive state management
- localStorage persistence layer
- Cross-tab synchronization
- Zero boilerplate state updates

---

## 🏗️ Architecture

### Monorepo Structure
```
tanstack-stocks-rspack/
├── apps/
│   ├── api/              # Express backend (port 3000)
│   │   ├── src/
│   │   │   ├── routes/   # API endpoints
│   │   │   ├── auth.ts   # Better-auth config
│   │   │   └── main.ts   # Server entry
│   │   └── prisma/       # Database schema
│   │
│   └── web/              # React frontend (port 4200)
│       ├── src/
│       │   ├── routes/   # File-based routing
│       │   ├── components/
│       │   └── lib/      # Shared utilities
│       └── rsbuild.config.ts
│
└── packages/
    └── contracts/        # Shared TypeScript types
        └── src/          # ts-rest API contracts
```

### Tech Stack

**Frontend**
- React 19 with concurrent features
- TanStack Router for file-based routing
- TanStack Query for server state
- Rspack for lightning-fast builds
- Tailwind CSS for styling

**Backend**
- Node.js + Express REST API
- ts-rest for type-safe contracts
- Zod for runtime validation
- Prisma ORM with MongoDB
- Better-auth for authentication

**DevOps**
- Nx for monorepo orchestration
- TypeScript strict mode everywhere
- ESLint + Prettier formatting
- Hot module replacement (HMR)

---

## 🚀 Quick Start

### Prerequisites
```bash
Node.js 18+
MongoDB Atlas (free tier)
Finnhub API key (free at finnhub.io)
```

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd tanstack-stocks-rspack
   npm install
   ```

2. **Configure environment variables**
   ```bash
   # Copy example environment file
   cp .env.example .env
   
   # Edit .env with your credentials:
   # - MONGODB_URL (MongoDB Atlas connection string)
   # - FINNHUB_API_KEY (from finnhub.io)
   # - BETTER_AUTH_SECRET (generate with: openssl rand -base64 32)
   ```

3. **Setup database**
   ```bash
   cd apps/api
   npx prisma generate
   npx prisma db push
   cd ../..
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

**Access the application:**
- 🌐 Web UI: [http://localhost:4200](http://localhost:4200)
- 🔌 API: [http://localhost:3000](http://localhost:3000)

---

## 📚 Documentation

| Guide | Description |
|-------|-------------|
| [**SETUP.md**](docs/SETUP.md) | Detailed installation and configuration |
| [**AUTH_SETUP.md**](docs/AUTH_SETUP.md) | Configure OAuth providers (Google, GitHub) |
| [**TANSTACK_ROUTER_GUIDE.md**](docs/TANSTACK_ROUTER_GUIDE.md) | Deep dive into routing patterns |
| [**TANSTACK_LIBRARIES.md**](docs/TANSTACK_LIBRARIES.md) | Complete guide to all TanStack libraries |
| [**PATTERNS_COOKBOOK.md**](docs/PATTERNS_COOKBOOK.md) | Copy-paste ready code patterns |
| [**QUICK_REFERENCE.md**](docs/QUICK_REFERENCE.md) | Quick command and API reference |

---

## 💡 Key Patterns

### Pattern 1: Loader + Query Fusion
Combine route loaders for initial data with queries for real-time updates:

```typescript
// Pre-fetch on route load
export const Route = createFileRoute('/stocks/$symbol')({
  loader: async ({ params }) => {
    const response = await apiClient.getQuote({ params });
    return { quote: response.body };
  },
});

// Component uses loader data + live updates
function StockDetail() {
  const { quote: initialQuote } = Route.useLoaderData();
  
  const { data: quote } = useQuery({
    queryKey: ['quote', symbol],
    initialData: initialQuote,
    refetchInterval: 10000, // Real-time sync
  });
}
```

### Pattern 2: Type-Safe API Contracts
End-to-end type safety from frontend to backend:

```typescript
// Shared contract (packages/contracts)
export const stocksContract = initContract().router({
  getQuote: {
    method: 'GET',
    path: '/stocks/:symbol/quote',
    responses: { 200: StockQuoteSchema },
  },
});

// Backend implements contract
const router = tsr.router(stocksContract, { 
  getQuote: async ({ params }) => {...} 
});

// Frontend gets full type safety
const response = await apiClient.getQuote({ params: { symbol: 'AAPL' } });
// response.body is fully typed!
```

### Pattern 3: Virtual Scrolling for Performance
```typescript
const virtualizer = useVirtualizer({
  count: stocks.length, // 5000+ items
  getScrollElement: () => parentRef.current,
  estimateSize: () => 80,
});

// Only renders visible items
{virtualizer.getVirtualItems().map((virtualRow) => (
  <div key={virtualRow.index}>
    {stocks[virtualRow.index]}
  </div>
))}
```

---

## 🎨 Application Features

### 📊 Dashboard
Real-time overview of popular stocks with instant price updates.
- Pre-fetched data via route loaders
- Live polling every 10 seconds
- Responsive grid layout

### 🔍 Stock Search
Powerful search across 5000+ stocks with virtualized rendering.
- TanStack Form for search state
- TanStack Virtual for smooth scrolling
- URL-synchronized filters
- Zod-validated search params

### 📈 Stock Details
Comprehensive stock information with real-time data.
- Company profiles and financial data
- Historical price charts
- Add to personal watchlist
- Optimistic UI updates

### ⭐ Watchlist
Personal stock tracking with cross-tab synchronization.
- TanStack Store for reactive state
- localStorage persistence
- Real-time price updates
- User-specific lists with MongoDB

---

## 🛠️ Available Commands

```bash
# Development
npm run dev          # Start both API and web servers
npm run api          # Start API server only
npm run web          # Start web server only

# Build
npm run build        # Build all projects for production

# Database
npm run db:studio    # Open Prisma Studio (database GUI)
npm run db:reset-data # Reset database with sample data

# Code Quality
npm run lint         # Run ESLint on all projects
npm run type-check   # TypeScript type checking
```

---

## 📊 Data Flow Example

```
User navigates to /stocks/AAPL
    ↓
Router validates param: symbol = 'AAPL'
    ↓
Loader pre-fetches data in parallel:
    ├─ getQuote('AAPL')
    └─ getProfile('AAPL')
    ↓
Component renders immediately (no loading state!)
    ↓
Query starts polling every 10s
    ├─ Real-time price updates
    └─ Toast notifications on changes
    ↓
User clicks "Add to Watchlist"
    ├─ Store updated reactively
    ├─ localStorage synced
    ├─ API call sent
    └─ Toast confirmation
```

---

## 🚦 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/stocks/:symbol/quote` | Current stock price |
| GET | `/api/stocks/search?q=...` | Search stocks by symbol/name |
| GET | `/api/stocks/popular?limit=8` | Popular stocks list |
| GET | `/api/stocks/:symbol/profile` | Company information |
| GET | `/api/stocks/:symbol/historical` | Historical price data |
| GET | `/api/watchlist` | User's watchlist |
| POST | `/api/watchlist` | Add stock to watchlist |
| DELETE | `/api/watchlist/:symbol` | Remove from watchlist |

---

## 📈 Performance

This project delivers exceptional performance:
- ⚡ **5x faster builds** with Rspack vs Webpack
- 🚀 **Zero waterfall loading** with route loaders
- 💾 **5000 items @ 60fps** with virtual scrolling
- 🎯 **100% TypeScript coverage** for type safety
- 📦 **Code splitting** per route for optimal bundles

---

## 🔗 Resources

**TanStack Ecosystem**
- [TanStack Router](https://tanstack.com/router/latest)
- [TanStack Query](https://tanstack.com/query/latest)
- [TanStack Form](https://tanstack.com/form/latest)
- [TanStack Virtual](https://tanstack.com/virtual/latest)
- [TanStack Store](https://tanstack.com/store/latest)

**Build Tools**
- [Rspack](https://rspack.dev)
- [ts-rest](https://ts-rest.com)
- [Nx](https://nx.dev)

---

## 🤝 Contributing

This is a learning and reference implementation. Feel free to:
- 🎓 Study the patterns and implementations
- 🔧 Adapt code for your own projects
- 🐛 Report issues or suggest improvements
- 💡 Share your own patterns and ideas

---

## 📄 License

MIT License - Use freely for learning and commercial projects

---

## 🎉 Next Steps

1. ✅ [Setup the project](docs/SETUP.md)
2. 📖 [Learn TanStack Router](docs/TANSTACK_ROUTER_GUIDE.md)
3. 🧑‍🍳 [Copy useful patterns](docs/PATTERNS_COOKBOOK.md)
4. 🚀 Build something amazing!

**Happy coding!** 🚀

---

<div align="center">
Made using the TanStack ecosystem
</div>

