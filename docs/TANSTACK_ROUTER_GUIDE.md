# 🚀 Advanced TanStack Router v1.x Implementation Guide

This project demonstrates **ALL modern TanStack Router patterns** for production-grade applications.

## 📚 Table of Contents

1. [Route Loaders](#route-loaders)
2. [Type-Safe Search Params](#type-safe-search-params)
3. [Type-Safe Route Params](#type-safe-route-params)
4. [getRouteApi() - The Advanced Pattern](#getrouteapi---the-advanced-pattern)
5. [Suspense & Error Boundaries](#suspense--error-boundaries)
6. [Advanced Data Patterns](#advanced-data-patterns)
7. [Navigation & Prefetching](#navigation--prefetching)

---

## Route Loaders

### What are loaders?

Loaders fetch data **before** rendering a route component. This prevents the waterfall loading problem.

### Example: Dashboard with Loader

**router.tsx**
```typescript
const dashboardRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Dashboard,
  
  // This runs before Dashboard renders
  loader: async () => {
    const response = await apiClient.getPopular({
      query: { limit: '8' },
    });
    return {
      popularStocks: response.body,
    };
  },
});
```

**routes/index.tsx**
```typescript
const routeApi = getRouteApi('/');

export default function Dashboard() {
  // Access loader data with full type safety
  const loaderData = routeApi.useLoaderData();
  
  // No loading state needed - data already loaded!
  return (
    <div>
      {loaderData.popularStocks.stocks.map(stock => (
        <StockCard key={stock.symbol} {...stock} />
      ))}
    </div>
  );
}
```

### Parallel Loaders

Load multiple things at once:

```typescript
loader: async ({ deps }) => {
  const [quoteRes, profileRes, historicalRes] = await Promise.all([
    apiClient.getQuote({ params: { symbol } }),
    apiClient.getProfile({ params: { symbol } }),
    apiClient.getHistorical({ params: { symbol } }),
  ]);

  return {
    quote: quoteRes.body,
    profile: profileRes.body,
    historical: historicalRes.body,
  };
},
```

---

## Type-Safe Search Params

### Validate and type search parameters with Zod

**router.tsx**
```typescript
import { z } from 'zod';

// Define schema
const searchParamsSchema = z.object({
  q: z.string().optional().default(''),
  sortBy: z.enum(['symbol', 'name']).optional().default('symbol'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(20),
});

const stocksRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/stocks',
  
  // Validate search params
  validateSearch: searchParamsSchema,
  
  // Use search params in loader
  loaderDeps: ({ search }) => ({ search }),
  loader: async ({ deps }) => {
    const { search } = deps;
    if (!search.q) return { results: { results: [], total: 0 } };
    
    const response = await apiClient.searchStocks({
      query: { q: search.q },
    });
    return { results: response.body };
  },
});
```

**routes/stocks/index.tsx**
```typescript
const routeApi = getRouteApi('/stocks');

export default function StocksList() {
  // Type-safe search params!
  const search = routeApi.useSearch();
  
  // Navigate with validated params
  const navigate = routeApi.useNavigate();
  
  navigate({
    to: '/stocks',
    search: {
      q: 'apple',
      sortBy: 'symbol',
      sortOrder: 'asc',
      page: 1,
    },
  });
  
  return (
    <div>
      Current search: {search.q}
      Sort by: {search.sortBy}
    </div>
  );
}
```

---

## Type-Safe Route Params

### Validate route parameters (`:symbol`)

**router.tsx**
```typescript
import { z } from 'zod';

const stockDetailParamsSchema = z.object({
  symbol: z.string().min(1).max(5).regex(/^[A-Z0-9]+$/),
});

const stockDetailRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/stocks/$symbol',
  
  // Validate params with Zod
  params: {
    parse: (params) => stockDetailParamsSchema.parse(params),
    stringify: (params) => params,
  },
  
  // Access params in loader
  loaderDeps: ({ params }) => ({ symbol: params.symbol }),
  loader: async ({ deps }) => {
    const response = await apiClient.getQuote({
      params: { symbol: deps.symbol },
    });
    return { quote: response.body };
  },
});
```

**routes/stocks/$symbol.tsx**
```typescript
const routeApi = getRouteApi('/stocks/$symbol');

export default function StockDetail() {
  // Type-safe params
  const { symbol } = routeApi.useParams();
  
  // Navigate with validated params
  const navigate = routeApi.useNavigate();
  
  navigate({
    to: '/stocks/$symbol',
    params: { symbol: 'AAPL' },
  });
}
```

---

## getRouteApi() - The Advanced Pattern

### Why getRouteApi() instead of hooks?

`getRouteApi()` provides **type-safe access** to route data, params, search, and navigation.

```typescript
const routeApi = getRouteApi('/stocks/$symbol');

// Type-safe!
const { symbol } = routeApi.useParams();     // ✅ correct
const search = routeApi.useSearch();         // ✅ validated
const loaderData = routeApi.useLoaderData(); // ✅ typed
const navigate = routeApi.useNavigate();     // ✅ all routes available

// Type errors caught at compile time:
// routeApi.useParams().invalidParam // ❌ Error: property doesn't exist
```

### Complete Pattern

```typescript
// Create API once per route file
const routeApi = getRouteApi('/stocks/$symbol');

export default function Page() {
  // All strongly typed
  const { symbol } = routeApi.useParams();
  const search = routeApi.useSearch();
  const loaderData = routeApi.useLoaderData();
  const navigate = routeApi.useNavigate();
  
  return (
    <button onClick={() => navigate({ to: '/' })}>
      Go Home
    </button>
  );
}
```

---

## Suspense & Error Boundaries

### Route-level Suspense

```typescript
const stockDetailRoute = new Route({
  // ...
  
  // Show loading UI while loader runs
  pendingComponent: () => (
    <div className="animate-pulse">
      <div className="h-12 bg-gray-200 rounded" />
      <div className="h-64 bg-gray-200 rounded mt-4" />
    </div>
  ),
  
  // Show error UI if loader fails
  errorComponent: ({ error }) => (
    <div className="p-4 bg-red-50 border border-red-200 rounded">
      <h2 className="font-bold text-red-600">Failed to load stock</h2>
      <p className="text-red-700">{error.message}</p>
    </div>
  ),
});
```

### Global Suspense in Root

```typescript
// Root layout with Suspense
export default function Root() {
  return (
    <div>
      <Navigation />
      <Suspense fallback={<LoadingSpinner />}>
        <Outlet />
      </Suspense>
    </div>
  );
}
```

---

## Advanced Data Patterns

### Loader with Dependencies

```typescript
const stockDetailRoute = new Route({
  path: '/stocks/$symbol',
  
  // Loader depends on params
  loaderDeps: ({ params }) => ({ symbol: params.symbol }),
  
  loader: async ({ deps }) => {
    const { symbol } = deps;
    // Load data using the param
    const response = await apiClient.getQuote({
      params: { symbol },
    });
    return { quote: response.body };
  },
});
```

### Combining Loader + Query

Use loaders for initial data, Query for real-time updates:

```typescript
export default function StockDetail() {
  const loaderData = routeApi.useLoaderData();
  
  // Initial data from loader
  const { data: liveQuote = loaderData.quote } = useQuery({
    queryKey: ['stock', 'quote', symbol],
    queryFn: () => apiClient.getQuote({ params: { symbol } }),
    refetchInterval: 10000, // Update every 10s
    initialData: loaderData.quote,
  });
  
  return <p>Price: ${liveQuote.c}</p>;
}
```

### Lazy Loading with Conditional Queries

```typescript
export default function StockDetail() {
  const search = routeApi.useSearch();
  
  // Only load chart data when tab is active
  const { data: historical } = useQuery({
    queryKey: ['stock', 'historical', symbol],
    queryFn: () => apiClient.getHistorical({ params: { symbol } }),
    enabled: search.tab === 'chart', // Lazy load!
  });
  
  return (
    <>
      {search.tab === 'chart' && <Chart data={historical} />}
    </>
  );
}
```

---

## Navigation & Prefetching

### Type-Safe Navigation

```typescript
const navigate = routeApi.useNavigate();

// Navigate with full type checking
navigate({
  to: '/stocks/$symbol',
  params: { symbol: 'AAPL' },
  search: { tab: 'chart' },
});

// Compile-time errors for invalid routes
navigate({
  to: '/invalid-route', // ❌ Error: route doesn't exist
});
```

### Search Param Navigation

```typescript
const navigate = routeApi.useNavigate();

navigate({
  to: '/stocks',
  search: {
    q: 'apple',
    sortBy: 'symbol',
    sortOrder: 'asc',
  },
});
```

### Prefetching Data

```typescript
const queryClient = useQueryClient();
const navigate = routeApi.useNavigate();

const handleHover = async (symbol: string) => {
  // Prefetch data when user hovers
  await queryClient.prefetchQuery({
    queryKey: ['stock', 'quote', symbol],
    queryFn: () => apiClient.getQuote({ params: { symbol } }),
  });
};

return (
  <div onMouseEnter={() => handleHover('AAPL')}>
    Hover to prefetch
  </div>
);
```

---

## File Structure

```
src/
├── router.tsx              # All route definitions with loaders
├── routes/
│   ├── __root.tsx         # Root layout (suspense, error boundary)
│   ├── index.tsx          # Dashboard with loader
│   ├── stocks/
│   │   ├── index.tsx      # Search with validated search params
│   │   └── $symbol.tsx    # Detail with loader + live updates
│   └── watchlist/
│       └── index.tsx
└── lib/
    ├── api-client.ts      # API client
    ├── queries.ts         # Query hooks
    └── notifications.ts   # Toast system
```

---

## Key Takeaways

✅ **Loaders** - Load data before rendering (no waterfall)  
✅ **Search Params** - Validate with Zod, URL-safe  
✅ **Route Params** - Type-safe dynamic segments  
✅ **getRouteApi()** - Type-safe data + navigation  
✅ **Error Boundaries** - Handle failures gracefully  
✅ **Suspense** - Show loading states  
✅ **Lazy Loading** - Load data on-demand  
✅ **Real-time** - Combine loaders + Query for live updates

---

## Learning Path

1. **Start simple** - Create a route with a loader
2. **Add validation** - Use Zod for search/route params
3. **Combine patterns** - Loaders + Query for real-time data
4. **Error handling** - Add error boundaries and pending components
5. **Advanced** - Prefetching, deferred data, route transitions

---

## Resources

- [TanStack Router Docs](https://tanstack.com/router/latest)
- [Route Loaders Guide](https://tanstack.com/router/latest/docs/guide/route-loaders)
- [Search Params](https://tanstack.com/router/latest/docs/guide/search-params)
- [Data Loading](https://tanstack.com/router/latest/docs/guide/data-loading)

---

**This is a learning project! Experiment with each pattern.** 🚀
