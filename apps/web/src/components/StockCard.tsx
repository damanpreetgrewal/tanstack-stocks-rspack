import { Link } from '@tanstack/react-router';
import { StockQuote } from '@stocks/contracts';
import { watchlistHelpers } from '../lib/store';
import { notify } from '../lib/notifications';
import { useState } from 'react';

interface StockCardProps {
  symbol: string;
  quote: StockQuote;
  onViewDetails?: () => void;
}

export function StockCard({ symbol, quote, onViewDetails }: StockCardProps) {
  const [isInWatchlist, setIsInWatchlist] = useState(
    watchlistHelpers.has(symbol)
  );

  const change = ((quote.c - quote.pc) / quote.pc) * 100;
  const changeClass =
    change >= 0
      ? 'text-green-600 dark:text-green-400'
      : 'text-red-600 dark:text-red-400';

  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isInWatchlist) {
      watchlistHelpers.remove(symbol);
      notify.success(`${symbol} removed from watchlist`);
    } else {
      watchlistHelpers.add(symbol);
      notify.success(`${symbol} added to watchlist`);
    }
    setIsInWatchlist(!isInWatchlist);
  };

  return (
    // @ts-ignore - Dynamic route path
    <Link to={`/stocks/${symbol}`} onClick={(e) => {
      if (onViewDetails) {
        e.preventDefault();
        onViewDetails();
      }
    }}>
      <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition cursor-pointer h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">
            {symbol}
          </h3>
          <button
            onClick={handleWatchlistToggle}
            className={`text-lg transition ${
              isInWatchlist
                ? 'text-yellow-500 hover:text-yellow-600'
                : 'text-gray-400 hover:text-yellow-500'
            }`}
          >
            ⭐
          </button>
        </div>

        <div className="flex-1">
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            ${quote.c.toFixed(2)}
          </p>
          <p className={`text-lg font-semibold ${changeClass}`}>
            {change >= 0 ? '+' : ''}{change.toFixed(2)}%
          </p>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-gray-800 space-y-1">
          <p>H: ${quote.h.toFixed(2)}</p>
          <p>L: ${quote.l.toFixed(2)}</p>
        </div>
      </div>
    </Link>
  );
}
