# 🧑‍🍳 TanStack Patterns Cookbook

Copy-paste ready patterns for common scenarios.

---

## 📖 Table of Contents
1. [Route Loaders](#route-loaders)
2. [Data Loading Patterns](#data-loading-patterns)
3. [Form Patterns](#form-patterns)
4. [Search & Filtering](#search--filtering)
5. [Real-time Updates](#real-time-updates)
6. [Error Handling](#error-handling)
7. [Navigation Patterns](#navigation-patterns)

---

## Route Loaders

### Basic Loader (Single Data Fetch)
```typescript
// router.tsx
const myRoute = new Route({
  path: '/my-page',
  component: MyPage,
  loader: async () => {
    const response = await apiClient.getData();
    return { data: response.body };
  },
});

// myPage.tsx
const routeApi = getRouteApi('/my-page');

export default function MyPage() {
  const { data } = routeApi.useLoaderData();
  return <div>{data.name}</div>;
}
```

### Parallel Loaders (Multiple Data Fetches)
```typescript
// router.tsx
loader: async () => {
  const [users, posts, comments] = await Promise.all([
    apiClient.getUsers(),
    apiClient.getPosts(),
    apiClient.getComments(),
  ]);
  
  return {
    users: users.body,
    posts: posts.body,
    comments: comments.body,
  };
},
```

### Loader with Error Handling
```typescript
loader: async () => {
  try {
    const response = await apiClient.getData();
    return { data: response.body };
  } catch (error) {
    throw new Error(`Failed to load data: ${error.message}`);
  }
},

errorComponent: ({ error }) => (
  <div className="error">
    <h2>Error: {error.message}</h2>
    <button onClick={() => location.reload()}>Retry</button>
  </div>
),
```

---

## Data Loading Patterns

### Pattern 1: Loader + Query (Initial + Real-time)

**Best for:** Stock quotes, live updates
```typescript
// router.tsx
loader: async ({ deps }) => {
  const response = await apiClient.getQuote({ params: { symbol: deps.symbol } });
  return { initialQuote: response.body };
},

// page.tsx
export default function Page() {
  const { initialQuote } = routeApi.useLoaderData();
  
  // Real-time updates
  const { data: liveQuote = initialQuote } = useQuery({
    queryKey: ['quote', symbol],
    queryFn: () => apiClient.getQuote({ params: { symbol } }),
    refetchInterval: 10000,
    initialData: initialQuote,
  });
  
  return <Price price={liveQuote.c} />;
}
```

### Pattern 2: Lazy Loading on User Interaction

**Best for:** Tabs, modals, expandable sections
```typescript
const search = routeApi.useSearch();

// Only load when tab is active
const { data: chart } = useQuery({
  queryKey: ['chart', symbol],
  queryFn: () => apiClient.getChart({ params: { symbol } }),
  enabled: search.tab === 'chart',
});

return (
  <>
    <Tabs value={search.tab}>
      <Tab value="overview">Overview</Tab>
      <Tab value="chart">Chart</Tab>
    </Tabs>
    
    {search.tab === 'chart' && <Chart data={chart} />}
  </>
);
```

### Pattern 3: Infinite Scroll (Pagination)

**Best for:** Feed, search results
```typescript
const search = routeApi.useSearch();

const { data, hasNextPage, fetchNextPage } = useInfiniteQuery({
  queryKey: ['posts', search.q],
  queryFn: ({ pageParam = 1 }) =>
    apiClient.searchPosts({
      query: { q: search.q, page: pageParam },
    }),
  getNextPageParam: (lastPage, _pages) =>
    lastPage.hasMore ? lastPage.nextPage : undefined,
});

return (
  <>
    {data?.pages.map(page =>
      page.posts.map(post => <Post key={post.id} {...post} />)
    )}
    {hasNextPage && (
      <button onClick={() => fetchNextPage()}>Load More</button>
    )}
  </>
);
```

---

## Form Patterns

### Pattern 1: Search Form with URL Sync

**Best for:** Search pages with filters
```typescript
// router.tsx
validateSearch: z.object({
  q: z.string().optional().default(''),
  filter: z.string().optional(),
  page: z.coerce.number().optional().default(1),
}),

// page.tsx
const routeApi = getRouteApi('/search');
const search = routeApi.useSearch();
const navigate = routeApi.useNavigate();

const form = useForm({
  defaultValues: {
    q: search.q,
    filter: search.filter,
  },
  onSubmit: async (values) => {
    navigate({
      to: '/search',
      search: {
        q: values.value.q,
        filter: values.value.filter,
        page: 1,
      },
    });
  },
});

return (
  <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}>
    <form.Field name="q">
      {(field) => (
        <input
          value={field.state.value}
          onChange={e => field.handleChange(e.target.value)}
          placeholder="Search..."
        />
      )}
    </form.Field>
    <button type="submit">Search</button>
  </form>
);
```

### Pattern 2: Multi-step Form

**Best for:** Onboarding, complex forms
```typescript
const search = routeApi.useSearch();

const form = useForm({
  defaultValues: {
    step: search.step || 1,
    name: '',
    email: '',
  },
});

const handleNext = () => {
  navigate({ search: { step: 2 } });
};

return (
  <>
    {search.step === 1 && <StepOne form={form} onNext={handleNext} />}
    {search.step === 2 && <StepTwo form={form} />}
  </>
);
```

---

## Search & Filtering

### Pattern 1: Validated Search Params

```typescript
// router.tsx
const searchSchema = z.object({
  q: z.string().optional().default(''),
  sortBy: z.enum(['relevance', 'date', 'popularity']).optional().default('relevance'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(10).max(100).optional().default(20),
});

validateSearch: searchSchema,

loaderDeps: ({ search }) => ({ search }),

loader: async ({ deps }) => {
  const results = await apiClient.search({
    query: deps.search,
  });
  return { results: results.body };
},
```

### Pattern 2: Filter with Dropdown

```typescript
const routeApi = getRouteApi('/products');
const search = routeApi.useSearch();
const navigate = routeApi.useNavigate();

return (
  <select
    value={search.category || 'all'}
    onChange={(e) =>
      navigate({
        search: { category: e.target.value, page: 1 },
      })
    }
  >
    <option value="all">All Categories</option>
    <option value="electronics">Electronics</option>
    <option value="books">Books</option>
  </select>
);
```

---

## Real-time Updates

### Pattern 1: Polling (Every N seconds)

**Best for:** Stock prices, notification counts
```typescript
const { data: quote } = useQuery({
  queryKey: ['stock', symbol],
  queryFn: () => apiClient.getQuote({ params: { symbol } }),
  refetchInterval: 10000, // Poll every 10 seconds
  refetchIntervalInBackground: true, // Keep polling even when tab inactive
});
```

### Pattern 2: Stale Time + Manual Refetch

**Best for:** User-triggered updates
```typescript
const { data: profile, refetch } = useQuery({
  queryKey: ['profile'],
  queryFn: () => apiClient.getProfile(),
  staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
});

return (
  <button onClick={() => refetch()}>
    Refresh Profile
  </button>
);
```

### Pattern 3: WebSocket-style Updates (Simulated)

**Best for:** Live notifications
```typescript
useEffect(() => {
  const interval = setInterval(async () => {
    // Simulated WebSocket data push
    const updates = await apiClient.getUpdates();
    
    // Update cache without showing loader
    queryClient.setQueryData(['notifications'], updates.body);
  }, 1000);
  
  return () => clearInterval(interval);
}, []);
```

---

## Error Handling

### Pattern 1: Route-level Error Boundary

```typescript
const myRoute = new Route({
  path: '/stocks/$symbol',
  errorComponent: ({ error, reset }) => (
    <div className="error-container">
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try Again</button>
    </div>
  ),
  pendingComponent: () => <LoadingSpinner />,
});
```

### Pattern 2: Error Toast Notification

```typescript
const { data, isError, error } = useQuery({
  queryFn: () => apiClient.getData(),
});

useEffect(() => {
  if (isError) {
    notify.error(error.message);
  }
}, [isError, error]);
```

### Pattern 3: Fallback UI

```typescript
const { data, isError } = useQuery({
  queryFn: () => apiClient.getData(),
});

return (
  <div>
    {isError ? (
      <div className="bg-red-50 p-4 rounded">
        <p>Failed to load data</p>
        <button onClick={() => refetch()}>Retry</button>
      </div>
    ) : (
      <DataDisplay data={data} />
    )}
  </div>
);
```

---

## Navigation Patterns

### Pattern 1: Type-Safe Link Navigation

```typescript
const routeApi = getRouteApi('/');
const navigate = routeApi.useNavigate();

return (
  <button
    onClick={() =>
      navigate({
        to: '/stocks/$symbol',
        params: { symbol: 'AAPL' },
        search: { tab: 'chart' },
      })
    }
  >
    View Stock Chart
  </button>
);
```

### Pattern 2: Breadcrumb Navigation

```typescript
const routeApi = getRouteApi('/');
const navigate = routeApi.useNavigate();

return (
  <nav>
    <button onClick={() => navigate({ to: '/' })}>
      Home
    </button>
    <span>/</span>
    <button onClick={() => navigate({ to: '/stocks' })}>
      Stocks
    </button>
    <span>/</span>
    <span>AAPL</span>
  </nav>
);
```

### Pattern 3: Modal Navigation

```typescript
const search = routeApi.useSearch();

return (
  <>
    {search.modal === 'settings' && (
      <Modal
        onClose={() =>
          navigate({ search: { modal: undefined } })
        }
      >
        <Settings />
      </Modal>
    )}
    
    <button
      onClick={() =>
        navigate({ search: { modal: 'settings' } })
      }
    >
      Open Settings
    </button>
  </>
);
```

### Pattern 4: Back Navigation

```typescript
const navigate = routeApi.useNavigate();

return (
  <button onClick={() => navigate({ to: -1 })}>
    ← Back
  </button>
);
```

---

## Optimization Patterns

### Pattern 1: Prefetch on Hover

```typescript
const queryClient = useQueryClient();

return (
  <button
    onMouseEnter={() =>
      queryClient.prefetchQuery({
        queryKey: ['stock', 'AAPL'],
        queryFn: () => apiClient.getQuote({ params: { symbol: 'AAPL' } }),
      })
    }
  >
    View AAPL
  </button>
);
```

### Pattern 2: Code Splitting by Route

```typescript
// router.tsx
const stockDetailRoute = new Route({
  path: '/stocks/$symbol',
  component: lazy(() => import('./routes/stocks/$symbol')),
});
```

### Pattern 3: Virtual Scrolling

```typescript
const virtualizer = useVirtualizer({
  count: items.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 50,
  overscan: 10,
});

const virtualItems = virtualizer.getVirtualItems();
const totalSize = virtualizer.getTotalSize();

return (
  <div ref={parentRef} style={{ height: '500px', overflow: 'auto' }}>
    <div style={{ height: totalSize, position: 'relative' }}>
      {virtualItems.map(virtualItem => (
        <div
          key={items[virtualItem.index].id}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            transform: `translateY(${virtualItem.start}px)`,
          }}
        >
          {items[virtualItem.index].name}
        </div>
      ))}
    </div>
  </div>
);
```

---

## Copy-Paste Quick Starts

### New Route with Loader
```typescript
const newRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/my-page',
  component: MyPage,
  
  loader: async () => {
    // TODO: Fetch data
    return { data: {} };
  },
});

// MyPage.tsx
const routeApi = getRouteApi('/my-page');
export default function MyPage() {
  const { data } = routeApi.useLoaderData();
  return <div>{/* TODO: Render data */}</div>;
}
```

### Search Page with Validation
```typescript
// router.tsx
validateSearch: z.object({
  q: z.string().optional().default(''),
  page: z.coerce.number().optional().default(1),
}),

// page.tsx
const routeApi = getRouteApi('/search');
const search = routeApi.useSearch();
const navigate = routeApi.useNavigate();

// Now use search.q and search.page with full type safety
```

### Real-time Query
```typescript
const { data } = useQuery({
  queryKey: ['key'],
  queryFn: () => apiClient.getData(),
  refetchInterval: 5000,
  refetchIntervalInBackground: true,
});
```

---

**Keep this file open while building!** 🚀
