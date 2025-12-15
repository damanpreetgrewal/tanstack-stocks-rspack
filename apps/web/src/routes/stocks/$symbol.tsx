import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { watchlistHelpers } from '../../lib/store'
import { notify } from '../../lib/notifications'
import { useState } from 'react'
import { apiClient } from '../../lib/api-client'
import { z } from 'zod'

type Quote = {
  c: number;
  pc: number;
  h: number;
  l: number;
  t: number;
};

type Profile = {
  name: string;
  finnhubIndustry?: string;
  marketCapitalization?: number;
  country?: string;
  weburl?: string;
};

type HistoricalData = {
  c: number[];
};

const searchSchema = z.object({ tab: z.enum(['overview', 'chart', 'news']).optional().default('overview') })
type SearchParams = z.infer<typeof searchSchema>;

export const Route = createFileRoute('/stocks/$symbol')({
  validateSearch: searchSchema,
  loader: async ({ params: { symbol } }) => {
    const [quote, profile] = await Promise.all([
      apiClient.getQuote({ params: { symbol } }).then((r) => r.body),
      apiClient.getProfile({ params: { symbol } }).then((r) => r.body),
    ])
    return { quote, profile }
  },
  component: StockDetail,
})

/**
 * Stock Detail Page
 * Uses loader for initial data + Query for real-time updates
 * Shows advanced patterns: getRouteApi, tabs, real-time sync
 */
function StockDetail() {
  const { symbol } = Route.useParams()
  const search = Route.useSearch() as SearchParams
  const loaderData = Route.useLoaderData() as { quote: Quote; profile: Profile }
  const navigate = Route.useNavigate()
  const [isInWatchlist, setIsInWatchlist] = useState(watchlistHelpers.has(symbol))

  const { quote: initialQuote, profile: initialProfile } = loaderData

  // Real-time quote updates (polls every 10s)
  const { data: liveQuote = initialQuote } = useQuery({
    queryKey: ['stock', 'quote', symbol],
    queryFn: () =>
      apiClient.getQuote({ params: { symbol } }).then((res) => res.body as Quote),
    refetchInterval: 10000,
    initialData: initialQuote,
  })

  // Historical data for chart (lazy loaded)
  const { data: historicalData, isLoading: historyLoading, error: historyError } = useQuery({
    queryKey: ['stock', 'historical', symbol],
    queryFn: () =>
      apiClient.getHistorical({
        params: { symbol },
        query: { resolution: 'D', count: '30' },
      }).then((res) => res.body as HistoricalData),
    enabled: search.tab === 'chart',
    retry: false,
  })

  const handleWatchlistToggle = () => {
    if (isInWatchlist) {
      watchlistHelpers.remove(symbol)
      notify.success(`${symbol} removed from watchlist`)
    } else {
      watchlistHelpers.add(symbol)
      notify.success(`${symbol} added to watchlist`)
    }
    setIsInWatchlist(!isInWatchlist)
  }

  if (!liveQuote || !initialProfile) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 border-4 border-gray-200 dark:border-gray-800 border-t-blue-500 rounded-full animate-spin" />
      </div>
    )
  }

  const change = ((liveQuote.c - liveQuote.pc) / (liveQuote.pc || 1)) * 100
  const changeClass =
    change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{symbol}</h1>
          <p className="text-gray-600 dark:text-gray-400">{initialProfile.name}</p>
        </div>
        <button
          onClick={handleWatchlistToggle}
          className={`px-6 py-2 rounded-lg font-semibold transition ${
            isInWatchlist
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isInWatchlist ? '❌ Remove' : '⭐ Add to Watchlist'}
        </button>
      </div>

      {/* Price Info */}
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Current Price</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              ${liveQuote.c.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Change (24h)</p>
            <p className={`text-3xl font-bold ${changeClass}`}>{change.toFixed(2)}%</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">High</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              ${liveQuote.h.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Low</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              ${liveQuote.l.toFixed(2)}
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">
          Updated every 10 seconds • Loaded at {new Date(liveQuote.t * 1000).toLocaleTimeString()}
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <nav className="flex gap-4">
          {(['overview', 'chart', 'news'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                navigate({
                  search: { tab },
                })
              }}
              className={`py-3 px-4 border-b-2 font-medium transition ${
                search.tab === tab
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {search.tab === 'overview' && (
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Company Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Industry</p>
              <p className="text-gray-900 dark:text-white">
                {initialProfile.finnhubIndustry || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Market Cap (Millions)</p>
              <p className="text-gray-900 dark:text-white">
                ${(initialProfile.marketCapitalization || 0).toFixed(0)}
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Country</p>
              <p className="text-gray-900 dark:text-white">{initialProfile.country || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Website</p>
              {initialProfile.weburl ? (
                <a
                  href={initialProfile.weburl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Visit Website →
                </a>
              ) : (
                <p className="text-gray-900 dark:text-white">N/A</p>
              )}
            </div>
          </div>
        </div>
      )}

      {search.tab === 'chart' && (
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Historical Data (30 Days)
          </h2>
          {historyLoading ? (
            <p className="text-gray-600 dark:text-gray-400">Loading chart...</p>
          ) : historyError ? (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-yellow-800 dark:text-yellow-200 font-semibold mb-2">
                📊 Historical Chart Data Unavailable
              </p>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                Historical candle data requires a paid Finnhub plan. The free tier only supports real-time quotes and company profiles.
              </p>
            </div>
          ) : historicalData?.c ? (
            <div className="space-y-4">
              <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <p className="text-gray-600 dark:text-gray-400">
                  📊 Chart component can be integrated here using Recharts
                </p>
              </div>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Highest Close</p>
                  <p className="font-bold text-gray-900 dark:text-white">
                    ${Math.max(...historicalData.c).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Lowest Close</p>
                  <p className="font-bold text-gray-900 dark:text-white">
                    ${Math.min(...historicalData.c).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Avg Close</p>
                  <p className="font-bold text-gray-900 dark:text-white">
                    ${(historicalData.c.reduce((a: number, b: number) => a + b) / historicalData.c.length).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Data Points</p>
                  <p className="font-bold text-gray-900 dark:text-white">{historicalData.c.length}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">No data available</p>
          )}
        </div>
      )}

      {search.tab === 'news' && (
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">News & Updates</h2>
          <p className="text-gray-600 dark:text-gray-400">
            📰 News integration can be added here
          </p>
        </div>
      )}
    </div>
  )
}