import { useForm } from '@tanstack/react-form';
import { useAddTransaction } from '../lib/portfolio-queries';
import { useSearchStocks } from '../lib/queries';
import { useState, useEffect } from 'react';
import type { TransactionType } from '@stocks/contracts';

interface TransactionFormProps {
  portfolioId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TransactionForm({ portfolioId, onSuccess, onCancel }: TransactionFormProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const { data: searchResults } = useSearchStocks(searchQuery, { enabled: searchQuery.length > 0 });
  const addTransaction = useAddTransaction();

  const form = useForm({
    defaultValues: {
      symbol: '',
      type: 'BUY' as TransactionType,
      quantity: '',
      price: '',
      commission: '0',
      notes: '',
      transactionDate: new Date().toISOString().split('T')[0],
    },
    onSubmit: async ({ value }) => {
      try {
        await addTransaction.mutateAsync({
          portfolioId,
          data: {
            symbol: value.symbol.toUpperCase(),
            type: value.type,
            quantity: parseFloat(value.quantity),
            price: parseFloat(value.price),
            commission: parseFloat(value.commission) || 0,
            notes: value.notes || undefined,
            transactionDate: new Date(value.transactionDate).toISOString(),
          },
        });
        form.reset();
        onSuccess?.();
      } catch (error) {
        console.error('Error adding transaction:', error);
      }
    },
  });

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowResults(false);
    if (showResults) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showResults]);

  const handleSymbolSelect = (symbol: string) => {
    form.setFieldValue('symbol', symbol);
    setSearchQuery('');
    setShowResults(false);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add Transaction</h3>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        {/* Symbol Search */}
        <form.Field name="symbol">
          {(field) => (
            <div className="relative">
              <label
                htmlFor="symbol"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Stock Symbol *
              </label>
              <input
                id="symbol"
                type="text"
                value={field.state.value || searchQuery}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase();
                  field.handleChange(val);
                  setSearchQuery(val);
                  setShowResults(val.length > 0);
                }}
                onFocus={() => setShowResults(searchQuery.length > 0)}
                onClick={(e) => e.stopPropagation()}
                required
                placeholder="e.g., AAPL, TSLA, MSFT"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {showResults && searchResults && searchResults.results.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.results.slice(0, 10).map((stock) => (
                    <button
                      key={stock.symbol}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSymbolSelect(stock.symbol);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between"
                    >
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {stock.symbol}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400 truncate ml-2">
                        {stock.description}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </form.Field>

        {/* Transaction Type */}
        <form.Field name="type">
          {(field) => (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Transaction Type *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="BUY"
                    checked={field.state.value === 'BUY'}
                    onChange={(e) => field.handleChange(e.target.value as TransactionType)}
                    className="mr-2"
                  />
                  <span className="text-gray-900 dark:text-white">Buy</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="SELL"
                    checked={field.state.value === 'SELL'}
                    onChange={(e) => field.handleChange(e.target.value as TransactionType)}
                    className="mr-2"
                  />
                  <span className="text-gray-900 dark:text-white">Sell</span>
                </label>
              </div>
            </div>
          )}
        </form.Field>

        {/* Quantity and Price */}
        <div className="grid grid-cols-2 gap-4">
          <form.Field name="quantity">
            {(field) => (
              <div>
                <label
                  htmlFor="quantity"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Quantity *
                </label>
                <input
                  id="quantity"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  required
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </form.Field>

          <form.Field name="price">
            {(field) => (
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Price per Share *
                </label>
                <input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  required
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </form.Field>
        </div>

        {/* Commission and Date */}
        <div className="grid grid-cols-2 gap-4">
          <form.Field name="commission">
            {(field) => (
              <div>
                <label
                  htmlFor="commission"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Commission/Fees
                </label>
                <input
                  id="commission"
                  type="number"
                  step="0.01"
                  min="0"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </form.Field>

          <form.Field name="transactionDate">
            {(field) => (
              <div>
                <label
                  htmlFor="transactionDate"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Transaction Date *
                </label>
                <input
                  id="transactionDate"
                  type="date"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  required
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </form.Field>
        </div>

        {/* Notes */}
        <form.Field name="notes">
          {(field) => (
            <div>
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder="Add any additional notes..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          )}
        </form.Field>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
            >
              Cancel
            </button>
          )}
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Adding...' : 'Add Transaction'}
              </button>
            )}
          />
        </div>
      </form>
    </div>
  );
}
