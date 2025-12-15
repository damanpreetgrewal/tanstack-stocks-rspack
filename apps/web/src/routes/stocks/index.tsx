import { useRef, useCallback } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { apiClient } from '../../lib/api-client'
import { useMemo } from 'react'

const stocksSearchParamsSchema = z.object({
  q: z.string().optional().default(''),
  sortBy: z.enum(['symbol', 'name']).optional().default('symbol'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  page: z.number().optional().default(1),
})

type Stock = {
  symbol: string;
  description: string;
};

type LoaderData = {
  results: {
    results: Stock[];
    total: number;
  };
};

type SearchParams = z.infer<typeof stocksSearchParamsSchema>;

export const Route = createFileRoute('/stocks/')({
  validateSearch: stocksSearchParamsSchema,
  loaderDeps: ({ search: { q, sortBy, sortOrder } }) => ({ q, sortBy, sortOrder }),
  loader: async ({ deps: { q, sortBy, sortOrder } }) => {
    // Avoid hitting the API when no query is provided; show empty state instead
    if (!q?.trim()) {
      return { results: { results: [], total: 0 } }
    }

    const response = await apiClient.searchStocks({
      query: { q, sortBy, sortOrder },
    })
    return { results: response.body }
  },
  component: StocksList,
})

function StocksList() {
  const navigate = Route.useNavigate()
  const search = Route.useSearch() as SearchParams
  const loaderData = Route.useLoaderData() as LoaderData

  const parentRef = useRef<HTMLDivElement>(null)

  // Form for search params
  const form = useForm({
    defaultValues: {
      q: search.q,
      sortBy: search.sortBy,
      sortOrder: search.sortOrder,
    },
    onSubmit: async (values) => {
      // Navigate with new search params
      navigate({
        to: '/stocks',
        search: {
          q: values.value.q,
          sortBy: values.value.sortBy,
          sortOrder: values.value.sortOrder,
          page: 1,
        },
      })
    },
  })

  const stocks = loaderData.results.results || []

  const sortedStocks = useMemo(() => {
    const items = [...stocks]
    const key = search.sortBy === 'name' ? 'description' : 'symbol'
    const direction = search.sortOrder === 'desc' ? -1 : 1

    items.sort((a, b) => {
      const av = key === 'description' ? a.description.toLowerCase() : a.symbol.toLowerCase()
      const bv = key === 'description' ? b.description.toLowerCase() : b.symbol.toLowerCase()
      if (av < bv) return -1 * direction
      if (av > bv) return 1 * direction
      return 0
    })

    return items
  }, [stocks, search.sortBy, search.sortOrder])

  const virtualizer = useVirtualizer({
    count: sortedStocks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => 80, []),
    overscan: 10,
  })

  const virtualItems = virtualizer.getVirtualItems()
  const totalSize = virtualizer.getTotalSize()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          🔍 Search Stocks
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Found {loaderData.results.total || 0} stocks
        </p>
      </div>

      {/* Advanced form with TanStack Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
        className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800 space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Input */}
          <form.Field
            name="q"
            children={(field) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Stock Symbol or Name
                </label>
                <input
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g., AAPL, Apple..."
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            )}
          />

          {/* Sort By */}
          <form.Field
            name="sortBy"
            children={(field) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sort By
                </label>
                <select
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value as 'symbol' | 'name')}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="symbol">Symbol (A-Z)</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>
            )}
          />

          {/* Sort Order */}
          <form.Field
            name="sortOrder"
            children={(field) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Order
                </label>
                <select
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value as 'asc' | 'desc')}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            )}
          />
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          Search
        </button>
      </form>

      {/* Results */}
      {stocks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            {search.q ? `No results for "${search.q}"` : 'Enter a search term'}
          </p>
        </div>
      ) : (
        <div
          ref={parentRef}
          className="h-[600px] overflow-y-auto border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900"
        >
          <div style={{ height: `${totalSize}px`, width: '100%', position: 'relative' }}>
            {virtualItems.map((virtualItem) => {
              const stock = sortedStocks[virtualItem.index]
              return (
                <div
                  key={stock.symbol}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <div
                    className="p-4 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition"
                    onClick={() =>
                      navigate({ to: '/stocks/$symbol', params: { symbol: stock.symbol } })
                    }
                  >
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {stock.symbol}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {stock.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}