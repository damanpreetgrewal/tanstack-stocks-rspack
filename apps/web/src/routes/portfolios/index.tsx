import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { usePortfolios } from '../../lib/portfolio-queries';
import { useSession } from '../../lib/auth-client';
import { useEffect } from 'react';
import type { Portfolio } from '@stocks/contracts';

export const Route = createFileRoute('/portfolios/')({
  component: PortfolioListPage,
});

function PortfolioListPage() {
  const { data: session, isPending } = useSession();
  const { data, isLoading, error } = usePortfolios();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!isPending && !session?.user) {
      window.location.href = '/auth';
    }
  }, [session, isPending]);

  if (isPending || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 dark:text-gray-400">Loading portfolios...</div>
      </div>
    );
  }

  if (!session?.user) {
    return null; // Will redirect
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600 dark:text-red-400">Error loading portfolios</div>
      </div>
    );
  }

  const portfolios = data?.portfolios || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Portfolios</h1>
        <Link
          to="/portfolios/new"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          + Create Portfolio
        </Link>
      </div>

      {portfolios.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            No Portfolios Yet
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create your first portfolio to start tracking your investments
          </p>
          <Link
            to="/portfolios/new"
            className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Create Your First Portfolio
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolios.map((portfolio) => (
            <PortfolioCard key={portfolio.id} portfolio={portfolio} />
          ))}
        </div>
      )}
    </div>
  );
}

function PortfolioCard({ portfolio }: { portfolio: Portfolio }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate({ to: '/portfolios/$portfolioId', params: { portfolioId: portfolio.id } });
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 transition cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
            {portfolio.name}
          </h3>
          {portfolio.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {portfolio.description}
            </p>
          )}
        </div>
        {portfolio.isDefault && (
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold rounded">
            Default
          </span>
        )}
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
          <span>Created</span>
          <span>{new Date(portfolio.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={handleClick}
          className="w-full py-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition"
        >
          View Details →
        </button>
      </div>
    </div>
  );
}
