import { createFileRoute } from '@tanstack/react-router'
import { StockCard } from '../components/StockCard'
import { apiClient } from '../lib/api-client'
import { StockQuote } from '@stocks/contracts'

type PopularStocksResponse = Awaited<ReturnType<typeof apiClient.getPopular>>['body'];

interface StockItem {
  symbol: string;
  quote: StockQuote;
}

interface PopularStocksData {
  stocks: StockItem[];
}

export const Route = createFileRoute('/')({
  component: Dashboard,
  loader: async () => {
    const response = await apiClient.getPopular({
      query: { limit: '8' },
    })
    return {
      popularStocks: response.body,
    }
  },
})

/**
 * Dashboard Route
 * Uses loader data pre-fetched from loader function
 * Demonstrates: getRouteApi, loader data, type safety
 */
function Dashboard() {
  // Access pre-loaded data with full type safety
  const loaderData = Route.useLoaderData() as { popularStocks: PopularStocksResponse }
  const navigate = Route.useNavigate()

  const { popularStocks } = loaderData

  const handleViewStock = (symbol: string) => {
    // Type-safe navigation
    navigate({ to: '/stocks/$symbol', params: { symbol } })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          📊 Popular Stocks
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Real-time market data updated every 10 seconds
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          ℹ️ Data loaded server-side via route loader • No waterfall loading
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {(popularStocks as PopularStocksData)?.stocks?.map((item: StockItem) => (
          <StockCard
            key={item.symbol}
            symbol={item.symbol}
            quote={item.quote}
            onViewDetails={() => handleViewStock(item.symbol)}
          />
        ))}
      </div>

      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400 mb-4">Want to see more stocks?</p>
        <button
          onClick={() => navigate({ to: '/stocks' })}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Search Stocks
        </button>
      </div>
    </div>
  )
}
