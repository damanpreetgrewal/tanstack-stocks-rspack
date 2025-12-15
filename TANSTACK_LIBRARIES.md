# 🎯 Complete TanStack Implementation Guide

This project showcases **ALL TanStack libraries** working together in a production-grade application.

---

## 1️⃣ TanStack Router v1.x

### What it does
Type-safe, file-based routing with **loaders**, **search params validation**, and **error boundaries**.

### Key Features in This Project

✅ **Route Loaders** (`router.tsx`)
```typescript
loader: async () => {
  const response = await apiClient.getPopular();
  return { popularStocks: response.body };
}
```

✅ **Search Param Validation** (Zod schemas)
```typescript
validateSearch: z.object({
  q: z.string(),
  sortBy: z.enum(['symbol', 'name']),
})
```

✅ **Route Param Validation**
```typescript
params: {
  parse: (params) => stockDetailParamsSchema.parse(params),
}
```

✅ **Type-Safe Navigation**
```typescript
const navigate = routeApi.useNavigate();
navigate({ to: '/stocks/$symbol', params: { symbol: 'AAPL' } });
```

✅ **Error Boundaries**
```typescript
errorComponent: ({ error }) => <ErrorUI error={error} />
pendingComponent: () => <LoadingSpinner />
```

### Files
- [src/router.tsx](src/router.tsx) - All route definitions
- [src/routes/__root.tsx](src/routes/__root.tsx) - Root layout
- [src/routes/index.tsx](src/routes/index.tsx) - Dashboard with loader
- [src/routes/stocks/index.tsx](src/routes/stocks/index.tsx) - Search with validated params
- [src/routes/stocks/$symbol.tsx](src/routes/stocks/$symbol.tsx) - Detail with loader

---

## 2️⃣ TanStack Query v5.x

### What it does
**Server state management** with caching, refetching, and synchronization.

### Key Features in This Project

✅ **Configured QueryClient** (App.tsx)
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes
      gcTime: 1 * 60 * 60 * 1000,    // 1 hour
      retry: 1,
    },
  },
});
```

✅ **Query Hooks** (`lib/queries.ts`)
```typescript
function useStockQuote(symbol: string) {
  return useQuery({
    queryKey: ['stock', 'quote', symbol],
    queryFn: () => apiClient.getQuote({ params: { symbol } }),
    refetchInterval: 10000, // Poll every 10 seconds
  });
}
```

✅ **Real-time Updates**
```typescript
const { data: liveQuote } = useQuery({
  queryKey: ['stock', 'quote', symbol],
  refetchInterval: 10000, // 10-second polling
});
```

✅ **Loader + Query Combo** (stock detail page)
```typescript
// Loader provides initial data
const loaderData = routeApi.useLoaderData();

// Query provides real-time updates
const { data: liveQuote = loaderData.quote } = useQuery({
  initialData: loaderData.quote,
  refetchInterval: 10000,
});
```

### Files
- [src/lib/queries.ts](src/lib/queries.ts) - Query hooks
- [src/routes/stocks/$symbol.tsx](src/routes/stocks/$symbol.tsx) - Live updates example

---

## 3️⃣ TanStack Form

### What it does
**Advanced form state management** with validation, field subscriptions, and error handling.

### Key Features in This Project

✅ **Form Validation** (stocks search page)
```typescript
const form = useForm({
  defaultValues: {
    q: search.q,
    sortBy: search.sortBy,
    sortOrder: search.sortOrder,
  },
});

form.Field(
  name="q"
  validate={(value) => {
    if (!value) return 'Search term required';
  }}
)
```

✅ **Field Subscriptions**
```typescript
<form.Field
  name="q"
  children={(field) => (
    <input
      value={field.state.value}
      onChange={(e) => field.handleChange(e.target.value)}
    />
  )}
/>
```

✅ **Form Submission**
```typescript
onSubmit: async (values) => {
  navigate({
    to: '/stocks',
    search: {
      q: values.value.q,
      sortBy: values.value.sortBy,
    },
  });
}
```

### Files
- [src/routes/stocks/index.tsx](src/routes/stocks/index.tsx) - Search form with TanStack Form

---

## 4️⃣ TanStack Virtual

### What it does
**Virtualization** - Renders only visible items in long lists (5000+ items!).

### Key Features in This Project

✅ **Virtual Scroll Setup**
```typescript
const virtualizer = useVirtualizer({
  count: stocks.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 80,
  overscan: 10, // Pre-render 10 items outside viewport
});
```

✅ **Rendering Virtual Items**
```typescript
<div style={{ height: `${totalSize}px`, position: 'relative' }}>
  {virtualItems.map((virtualItem) => (
    <div
      key={stock.symbol}
      style={{
        transform: `translateY(${virtualItem.start}px)`,
      }}
    >
      {stock.symbol}
    </div>
  ))}
</div>
```

### Benefits
- 5000 stocks → only 20 DOM nodes at a time
- Smooth 60fps scrolling
- Memory efficient

### Files
- [src/routes/stocks/index.tsx](src/routes/stocks/index.tsx) - Virtual scrolling example

---

## 5️⃣ TanStack Store

### What it does
**Lightweight reactive state** - Perfect for watchlists, UI toggles, etc.

### Key Features in This Project

✅ **Store Setup** (`lib/store.ts`)
```typescript
const watchlistStore = new Store({
  items: new Set<string>(),
});
```

✅ **Subscription & Persistence**
```typescript
watchlistStore.subscribe(
  (state) => state.items,
  (items) => {
    localStorage.setItem('watchlist', JSON.stringify(Array.from(items)));
  }
);
```

✅ **Helper Functions**
```typescript
watchlistHelpers.add('AAPL');
watchlistHelpers.has('AAPL');
watchlistHelpers.getAll();
watchlistHelpers.remove('AAPL');
```

✅ **Usage in Components**
```typescript
const { isInWatchlist, setIsInWatchlist } = useState(
  watchlistHelpers.has(symbol)
);

const handleToggle = () => {
  watchlistHelpers.add(symbol);
};
```

### Files
- [src/lib/store.ts](src/lib/store.ts) - Store setup and helpers
- [src/components/StockCard.tsx](src/components/StockCard.tsx) - Watchlist toggle
- [src/routes/watchlist/index.tsx](src/routes/watchlist/index.tsx) - Watchlist page

---

## 🏗️ Supporting Libraries

### Notifications (Sonner)

✅ **Setup** (App.tsx)
```typescript
<Toaster position="top-right" />
```

✅ **Usage** (`lib/notifications.ts`)
```typescript
notify.success('Added to watchlist');
notify.error('API error');
notify.info('Loading...');
```

### Performance Monitoring

✅ **Web Vitals** (`lib/performance.ts`)
```typescript
WebVitals.init(); // Track LCP, FID, CLS
WebVitals.trackApiCall(method, path, duration);
```

### API Client (ts-rest + Zod)

✅ **Type-Safe Client** (`lib/api-client.ts`)
```typescript
const apiClient = initClient(stocksContract);

// Fully typed!
const response = await apiClient.getQuote({
  params: { symbol: 'AAPL' }
});
```

---

## 📊 Complete Data Flow Example

### Stock Detail Page

```
1. Router detects '/stocks/AAPL'
   ↓
2. Param validation (Zod)
   ↓
3. Loader runs (parallel requests)
   ├─ Quote
   └─ Profile
   ↓
4. Component renders with loader data
   ↓
5. Real-time Query starts polling
   ├─ 10s refresh interval
   └─ Uses initial loader data
   ↓
6. User toggles watchlist
   ├─ Store updated
   ├─ localStorage synced
   └─ Toast notification
   ↓
7. User clicks a tab
   ├─ Search params updated
   └─ Lazy Query loads chart data
```

---

## 🎓 Learning Path

### Day 1: Routes
- [ ] Understand file-based routing
- [ ] Create simple routes
- [ ] Add error boundaries

### Day 2: Loaders & Data
- [ ] Implement route loaders
- [ ] Pre-fetch data
- [ ] Handle loading states

### Day 3: Validation
- [ ] Validate route params (Zod)
- [ ] Validate search params
- [ ] Type-safe navigation

### Day 4: State
- [ ] Setup TanStack Query
- [ ] Configure caching
- [ ] Real-time updates

### Day 5: Forms & Store
- [ ] Add TanStack Form to search
- [ ] Setup TanStack Store watchlist
- [ ] Persist to localStorage

### Day 6: Performance
- [ ] Add virtual scrolling
- [ ] Implement error handling
- [ ] Monitor performance

### Day 7: Polish
- [ ] Notifications (Sonner)
- [ ] Loading skeletons
- [ ] Optimistic updates

---

## 🔍 Code Examples by Feature

### 1. Loading data server-side (no waterfall)
File: [src/router.tsx](src/router.tsx)
```typescript
loader: async () => {
  const response = await apiClient.getPopular();
  return { popularStocks: response.body };
}
```

### 2. Validated search params in URL
File: [src/router.tsx](src/router.tsx)
```typescript
validateSearch: z.object({
  q: z.string().optional(),
  sortBy: z.enum(['symbol', 'name']),
})
```

### 3. Real-time updates (10s polling)
File: [src/routes/stocks/$symbol.tsx](src/routes/stocks/$symbol.tsx)
```typescript
const { data: liveQuote } = useQuery({
  refetchInterval: 10000,
});
```

### 4. Virtual scroll (5000+ items)
File: [src/routes/stocks/index.tsx](src/routes/stocks/index.tsx)
```typescript
const virtualizer = useVirtualizer({
  count: stocks.length,
  getScrollElement: () => parentRef.current,
});
```

### 5. Watchlist management
File: [src/lib/store.ts](src/lib/store.ts)
```typescript
watchlistHelpers.add(symbol);
watchlistHelpers.has(symbol);
```

### 6. Toast notifications
File: [src/lib/notifications.ts](src/lib/notifications.ts)
```typescript
notify.success('Added to watchlist');
```

---

## 🚀 Advanced Patterns

### Pattern 1: Loader + Query (Best of both)
```typescript
// Loader for initial data
loader: async () => ({ quote: await getQuote() })

// Query for real-time updates
const { data: quote } = useQuery({
  initialData: loaderData.quote,
  refetchInterval: 10000,
})
```

### Pattern 2: Lazy Loading on Tab Click
```typescript
const search = routeApi.useSearch();

const { data: chart } = useQuery({
  enabled: search.tab === 'chart',
})
```

### Pattern 3: Type-Safe Search Navigation
```typescript
const navigate = routeApi.useNavigate();

navigate({
  to: '/stocks',
  search: stocksSearchParamsSchema.parse({
    q: 'apple',
    sortBy: 'symbol',
  }),
});
```

### Pattern 4: Form with Search Param Sync
```typescript
const form = useForm({
  onSubmit: (values) => {
    navigate({ to: '/stocks', search: values.value });
  },
});
```

---

## 📖 Documentation Files

- **[TANSTACK_ROUTER_GUIDE.md](TANSTACK_ROUTER_GUIDE.md)** - Router deep dive
- **[SETUP.md](SETUP.md)** - Installation & quickstart
- **[README.md](README.md)** - Project overview

---

## 🎯 Key Metrics This Project Demonstrates

✅ **Zero waterfalls** - Loaders pre-fetch data  
✅ **Type safety** - Zod + TypeScript everywhere  
✅ **Real-time** - 10s polling + streaming  
✅ **Performance** - Virtual scrolling for 5000+ items  
✅ **Scalability** - Modular, file-based routing  
✅ **Reactivity** - Store + Query updates  
✅ **DX** - Validations, error boundaries, loading states  

---

**This is a complete, production-ready example of modern TanStack development!** 🚀
