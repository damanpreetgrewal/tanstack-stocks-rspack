# ⚡ TanStack Quick Reference

## Router

### Create a route with loader
```typescript
new Route({
  path: '/stocks/$symbol',
  loader: async ({ deps }) => ({ quote: await getQuote() }),
})
```

### Access loader data
```typescript
const routeApi = getRouteApi('/stocks/$symbol');
const { quote } = routeApi.useLoaderData();
```

### Validate search params
```typescript
validateSearch: z.object({
  q: z.string(),
  page: z.coerce.number(),
})

// Usage
const { q, page } = routeApi.useSearch();
```

### Navigate type-safely
```typescript
const navigate = routeApi.useNavigate();
navigate({
  to: '/stocks/$symbol',
  params: { symbol: 'AAPL' },
  search: { tab: 'chart' },
});
```

### Error boundary
```typescript
errorComponent: ({ error }) => <ErrorUI error={error} />,
pendingComponent: () => <Spinner />,
```

---

## Query

### Basic query
```typescript
const { data } = useQuery({
  queryKey: ['key'],
  queryFn: () => apiClient.getData(),
});
```

### Real-time polling
```typescript
useQuery({
  queryKey: ['quote', symbol],
  queryFn: () => getQuote(),
  refetchInterval: 10000, // Every 10s
})
```

### Lazy load on demand
```typescript
const { data } = useQuery({
  queryKey: ['chart'],
  queryFn: () => getChart(),
  enabled: activeTab === 'chart', // Only fetch when needed
})
```

### Loader + Query combo
```typescript
const { initialData } = routeApi.useLoaderData();

const { data = initialData } = useQuery({
  initialData,
  refetchInterval: 10000,
});
```

---

## Form

### Basic form
```typescript
const form = useForm({
  defaultValues: { name: '' },
});

<form.Field name="name">
  {(field) => (
    <input
      value={field.state.value}
      onChange={e => field.handleChange(e.target.value)}
    />
  )}
</form.Field>
```

### With validation
```typescript
<form.Field
  name="email"
  validate={(value) => {
    if (!value.includes('@')) return 'Invalid email';
  }}
>
```

### On submit
```typescript
onSubmit: async (values) => {
  navigate({ to: '/page', search: values.value });
}
```

---

## Virtual

### Setup
```typescript
const virtualizer = useVirtualizer({
  count: items.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 50,
});

const virtualItems = virtualizer.getVirtualItems();
const totalSize = virtualizer.getTotalSize();
```

### Render
```typescript
<div style={{ height: `${totalSize}px`, position: 'relative' }}>
  {virtualItems.map(vItem => (
    <div
      key={items[vItem.index].id}
      style={{ transform: `translateY(${vItem.start}px)` }}
    >
      {items[vItem.index].name}
    </div>
  ))}
</div>
```

---

## Store

### Create
```typescript
const store = new Store({ count: 0 });
```

### Update
```typescript
store.setState(() => ({ count: 5 }));
```

### Subscribe
```typescript
store.subscribe(
  (state) => state.count,
  (count) => console.log(count)
);
```

### Helpers
```typescript
watchlistStore.subscribe(
  (state) => state.items,
  (items) => localStorage.setItem('watchlist', JSON.stringify(items))
);
```

---

## Notifications

```typescript
notify.success('Added to watchlist');
notify.error('Failed to load');
notify.info('Loading...');
notify.warning('Are you sure?');
```

---

## API Client

```typescript
const response = await apiClient.getQuote({
  params: { symbol: 'AAPL' },
});

const response = await apiClient.searchStocks({
  query: { q: 'apple' },
});
```

---

## Performance

### Track API call
```typescript
WebVitals.trackApiCall('GET', '/api/stocks', 150);
```

### Prefetch data
```typescript
queryClient.prefetchQuery({
  queryKey: ['stock', symbol],
  queryFn: () => getQuote(),
});
```

---

## Navigation

### Type-safe links
```typescript
<Link to="/stocks/$symbol" params={{ symbol: 'AAPL' }}>
  View Stock
</Link>
```

### Programmatic
```typescript
navigate({ to: '/stocks/$symbol', params: { symbol } });
```

### Back button
```typescript
navigate({ to: -1 });
```

---

## Common Patterns

### Poll every 10 seconds
```typescript
refetchInterval: 10000,
refetchIntervalInBackground: true,
```

### Load on tab click
```typescript
const { data } = useQuery({
  enabled: search.tab === 'chart',
})
```

### Form with URL sync
```typescript
onSubmit: async (values) => {
  navigate({ search: values.value });
}
```

### Virtual scroll 5000 items
```typescript
useVirtualizer({
  count: 5000,
  estimateSize: () => 80,
})
```

### Add to watchlist
```typescript
watchlistHelpers.add('AAPL');
notify.success('Added');
```

---

## File Locations

- Routes: `src/router.tsx`
- Pages: `src/routes/`
- Queries: `src/lib/queries.ts`
- Store: `src/lib/store.ts`
- Notifications: `src/lib/notifications.ts`
- API: `src/lib/api-client.ts`
- Contracts: `packages/contracts/`

---

**Print this page for quick reference while building!** 🚀
