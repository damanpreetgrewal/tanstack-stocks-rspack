import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useSession } from '../../lib/auth-client';
import {
  usePortfolio,
  usePortfolioHoldings,
  usePortfolioTransactions,
  useDeletePortfolio,
  useDeleteTransaction,
} from '../../lib/portfolio-queries';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import type { Holding, Transaction } from '@stocks/contracts';
import { TransactionForm } from '../../components/TransactionForm';

const searchSchema = z.object({
  tab: z.enum(['holdings', 'transactions', 'performance']).optional().default('holdings'),
});

type SearchParams = z.infer<typeof searchSchema>;

export const Route = createFileRoute('/portfolios/$portfolioId')({
  validateSearch: searchSchema,
  component: PortfolioDetailPage,
});

function PortfolioDetailPage() {
  const { portfolioId } = Route.useParams();
  const search = Route.useSearch() as SearchParams;
  const navigate = Route.useNavigate();
  const { data: session, isPending: sessionPending } = useSession();

  const { data: portfolioData, isLoading: portfolioLoading } = usePortfolio(portfolioId);
  const { data: holdingsData, isLoading: holdingsLoading } = usePortfolioHoldings(
    portfolioId,
    { enabled: search.tab === 'holdings' }
  );
  const { data: transactionsData, isLoading: transactionsLoading } = usePortfolioTransactions(
    portfolioId,
    { enabled: search.tab === 'transactions' }
  );

  const deletePortfolio = useDeletePortfolio();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!sessionPending && !session?.user) {
      window.location.href = '/auth';
    }
  }, [session, sessionPending]);

  const handleDeletePortfolio = async () => {
    if (confirm('Are you sure you want to delete this portfolio? This action cannot be undone.')) {
      try {
        await deletePortfolio.mutateAsync(portfolioId);
        navigate({ to: '/portfolios' });
      } catch (error) {
        console.error('Error deleting portfolio:', error);
      }
    }
  };

  if (sessionPending || portfolioLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!session?.user) {
    return null; // Will redirect
  }

  if (!portfolioData) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">Portfolio not found</p>
      </div>
    );
  }

  const { portfolio, metrics } = portfolioData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{portfolio.name}</h1>
          {portfolio.description && (
            <p className="text-gray-600 dark:text-gray-400 mt-1">{portfolio.description}</p>
          )}
        </div>
        <button
          onClick={handleDeletePortfolio}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Delete Portfolio
        </button>
      </div>

      {/* Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Value"
          value={`$${metrics.totalValue.toFixed(2)}`}
          className="text-gray-900 dark:text-white"
        />
        <MetricCard
          title="Total Invested"
          value={`$${metrics.totalCost.toFixed(2)}`}
          className="text-gray-900 dark:text-white"
        />
        <MetricCard
          title="Total P&L"
          value={`$${metrics.totalGainLoss.toFixed(2)}`}
          subtitle={`${metrics.totalGainLossPercent.toFixed(2)}%`}
          className={
            metrics.totalGainLoss >= 0
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }
        />
        <MetricCard
          title="Day Change"
          value={`$${metrics.dayChange.toFixed(2)}`}
          subtitle={`${metrics.dayChangePercent.toFixed(2)}%`}
          className={
            metrics.dayChange >= 0
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <nav className="flex gap-4">
          {(['holdings', 'transactions', 'performance'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                navigate({ search: { tab } });
              }}
              className={`py-3 px-4 border-b-2 font-medium transition capitalize ${
                search.tab === tab
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {search.tab === 'holdings' && (
        <HoldingsTab
          holdings={holdingsData?.holdings || []}
          isLoading={holdingsLoading}
          portfolioId={portfolioId}
        />
      )}

      {search.tab === 'transactions' && (
        <TransactionsTab
          transactions={transactionsData?.transactions || []}
          isLoading={transactionsLoading}
          portfolioId={portfolioId}
        />
      )}

      {search.tab === 'performance' && (
        <PerformanceTab metrics={metrics} holdings={holdingsData?.holdings || []} />
      )}
    </div>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  className,
}: {
  title: string;
  value: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
      <p className={`text-2xl font-bold ${className}`}>{value}</p>
      {subtitle && <p className={`text-sm ${className}`}>{subtitle}</p>}
    </div>
  );
}

function HoldingsTab({
  holdings,
  isLoading,
}: {
  holdings: Holding[];
  isLoading: boolean;
  portfolioId: string;
}) {
  const navigate = useNavigate();

  if (isLoading) {
    return <div className="text-gray-600 dark:text-gray-400">Loading holdings...</div>;
  }

  if (holdings.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No Holdings Yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Add your first transaction to start tracking stocks
        </p>
        <button
          onClick={() => navigate({ search: (prev) => ({ ...prev, tab: 'transactions' }) })}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Add Transaction
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => navigate({ search: (prev) => ({ ...prev, tab: 'transactions' }) })}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          + Add Transaction
        </button>
      </div>
      
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Symbol
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Avg Cost
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Current Price
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Total Value
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Gain/Loss
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Weight
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {holdings.map((holding) => (
              <tr key={holding.symbol} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-6 py-4 whitespace-nowrap">
                  <a
                    href={`/stocks/${holding.symbol}`}
                    className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                  >
                    {holding.symbol}
                  </a>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900 dark:text-white">
                  {holding.quantity.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900 dark:text-white">
                  ${holding.averageCost.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900 dark:text-white">
                  ${holding.currentPrice.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900 dark:text-white">
                  ${holding.currentValue.toFixed(2)}
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-right font-semibold ${
                    holding.gainLoss >= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  ${holding.gainLoss.toFixed(2)}
                  <div className="text-xs">({holding.gainLossPercent.toFixed(2)}%)</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900 dark:text-white">
                  {holding.portfolioWeight.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
}

function TransactionsTab({
  transactions,
  isLoading,
  portfolioId,
}: {
  transactions: Transaction[];
  isLoading: boolean;
  portfolioId: string;
}) {
  const [showForm, setShowForm] = useState(false);
  const deleteTransaction = useDeleteTransaction();

  const handleDelete = async (transactionId: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      try {
        await deleteTransaction.mutateAsync({ portfolioId, transactionId });
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    }
  };

  if (isLoading) {
    return <div className="text-gray-600 dark:text-gray-400">Loading transactions...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {showForm ? 'Cancel' : '+ Add Transaction'}
        </button>
      </div>

      {showForm && (
        <TransactionForm
          portfolioId={portfolioId}
          onSuccess={() => setShowForm(false)}
          onCancel={() => setShowForm(false)}
        />
      )}

      {transactions.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Transactions Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Start by adding your first buy or sell transaction
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Symbol
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Notes
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {transactions.map((tx) => {
                  const total = tx.quantity * tx.price + tx.commission;
                  return (
                    <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                        {new Date(tx.transactionDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded ${
                            tx.type === 'BUY'
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                              : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <a
                          href={`/stocks/${tx.symbol}`}
                          className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                        >
                          {tx.symbol}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900 dark:text-white">
                        {tx.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900 dark:text-white">
                        ${tx.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900 dark:text-white">
                        ${total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400 max-w-xs truncate">
                        {tx.notes || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function PerformanceTab({
  metrics,
  holdings,
}: {
  metrics: {
    totalValue: number;
    totalCost: number;
    totalGainLoss: number;
    totalGainLossPercent: number;
    dayChange: number;
    dayChangePercent: number;
  };
  holdings: Holding[];
}) {
  // Sort holdings by gain/loss
  const sortedByGain = [...holdings].sort((a, b) => b.gainLoss - a.gainLoss);
  const topGainers = sortedByGain.slice(0, 5);
  const topLosers = sortedByGain.slice(-5).reverse();

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Portfolio Performance
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Value:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                ${metrics.totalValue.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Invested:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                ${metrics.totalCost.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total P&L:</span>
              <span
                className={`font-semibold ${
                  metrics.totalGainLoss >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                ${metrics.totalGainLoss.toFixed(2)} ({metrics.totalGainLossPercent.toFixed(2)}%)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Day Change:</span>
              <span
                className={`font-semibold ${
                  metrics.dayChange >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                ${metrics.dayChange.toFixed(2)} ({metrics.dayChangePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Diversification
          </h3>
          <div className="space-y-2">
            {holdings.slice(0, 5).map((holding) => (
              <div key={holding.symbol} className="flex items-center justify-between">
                <span className="text-gray-900 dark:text-white">{holding.symbol}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${Math.min(holding.portfolioWeight, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                    {holding.portfolioWeight.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Gainers and Losers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {topGainers.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              🚀 Top Gainers
            </h3>
            <div className="space-y-2">
              {topGainers.map((holding) => (
                <div key={holding.symbol} className="flex justify-between">
                  <span className="text-gray-900 dark:text-white">{holding.symbol}</span>
                  <span className="text-green-600 dark:text-green-400 font-semibold">
                    +${holding.gainLoss.toFixed(2)} ({holding.gainLossPercent.toFixed(2)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {topLosers.length > 0 && topLosers[0].gainLoss < 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              📉 Top Losers
            </h3>
            <div className="space-y-2">
              {topLosers.map((holding) => (
                <div key={holding.symbol} className="flex justify-between">
                  <span className="text-gray-900 dark:text-white">{holding.symbol}</span>
                  <span className="text-red-600 dark:text-red-400 font-semibold">
                    ${holding.gainLoss.toFixed(2)} ({holding.gainLossPercent.toFixed(2)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
