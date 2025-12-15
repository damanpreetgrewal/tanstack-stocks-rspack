import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useStockQuote } from '../../lib/queries'
import { watchlistHelpers, watchlistStore } from '../../lib/store'
import { notify } from '../../lib/notifications'
import { useSession } from '../../lib/auth-client'

export const Route = createFileRoute('/watchlist/')({
  component: Watchlist,
})

function Watchlist() {
  const { data: session, isPending } = useSession()
  const [watchlist, setWatchlist] = useState<string[]>(watchlistHelpers.getAll())

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!isPending && !session?.user) {
      window.location.href = '/auth'
    }
  }, [session, isPending])

  useEffect(() => {
    // Subscribe to watchlist changes
    const unsubscribe = watchlistStore.subscribe(
      () => {
        setWatchlist(Array.from(watchlistStore.state.items))
      }
    )

    return unsubscribe
  }, [])

  const handleClear = () => {
    if (confirm('Are you sure you want to clear your watchlist?')) {
      watchlistHelpers.clear()
      notify.success('Watchlist cleared')
    }
  }

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    )
  }

  if (!session?.user) {
    return null // Will redirect
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Watchlist</h1>
        {watchlist.length > 0 && (
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Clear All
          </button>
        )}
      </div>

      {watchlist.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Your watchlist is empty
          </p>
          <a
            href="/stocks"
            className="inline-block mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Search Stocks
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {watchlist.map((symbol) => (
            <WatchlistCard key={symbol} symbol={symbol} />
          ))}
        </div>
      )}
    </div>
  )
}

function WatchlistCard({ symbol }: { symbol: string }) {
  const { data: quote } = useStockQuote(symbol)

  const handleRemove = () => {
    watchlistHelpers.remove(symbol)
    notify.success(`${symbol} removed from watchlist`)
  }

  if (!quote) return <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
      <div className="flex items-start justify-between mb-3">
        <a
          href={`/stocks/${symbol}`}
          className="font-bold text-lg text-blue-600 dark:text-blue-400 hover:underline"
        >
          {symbol}
        </a>
        <button
          onClick={handleRemove}
          className="text-red-500 hover:text-red-700 transition"
        >
          ✕
        </button>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">
        ${quote.c.toFixed(2)}
      </p>
      <p
        className={
          quote.c >= quote.pc
            ? 'text-green-600 dark:text-green-400'
            : 'text-red-600 dark:text-red-400'
        }
      >
        {((quote.c - quote.pc) / quote.pc * 100).toFixed(2)}%
      </p>
    </div>
  )
}
