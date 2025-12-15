import { Link } from '@tanstack/react-router';

export function Navigation() {
  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">📊</div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">Stocks</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
          >
            Dashboard
          </Link>
          <Link
            to="/stocks"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
          >
            Search
          </Link>
          <Link
            to="/watchlist"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            ⭐ Watchlist
          </Link>
        </div>
      </div>
    </nav>
  );
}
