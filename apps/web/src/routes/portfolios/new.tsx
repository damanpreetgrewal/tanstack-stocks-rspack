import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useForm } from '@tanstack/react-form';
import { useCreatePortfolio } from '../../lib/portfolio-queries';
import { useSession } from '../../lib/auth-client';
import { useEffect } from 'react';
import { portfolioHelpers } from '../../lib/portfolio-store';

export const Route = createFileRoute('/portfolios/new')({
  component: NewPortfolioPage,
});

function NewPortfolioPage() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();
  const createPortfolio = useCreatePortfolio();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!isPending && !session?.user) {
      window.location.href = '/auth';
    }
  }, [session, isPending]);

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      isDefault: false,
    },
    onSubmit: async ({ value }) => {
      try {
        const payload: { name: string; description?: string; isDefault: boolean } = {
          name: value.name,
          isDefault: value.isDefault,
        };
        
        // Only include description if it has a value
        if (value.description.trim()) {
          payload.description = value.description.trim();
        }
        
        const portfolio = await createPortfolio.mutateAsync(payload);

        // Set as active portfolio
        portfolioHelpers.setActivePortfolio(portfolio.id);

        // Navigate to the portfolio detail page
        navigate({ to: '/portfolios/$portfolioId', params: { portfolioId: portfolio.id } });
      } catch (error) {
        console.error('Error creating portfolio:', error);
      }
    },
  });

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!session?.user) {
    return null; // Will redirect
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Create New Portfolio
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Set up a new portfolio to track your investments
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-6"
        >
          {/* Portfolio Name */}
          <form.Field name="name">
            {(field) => (
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Portfolio Name *
                </label>
                <input
                  id="name"
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  required
                  maxLength={100}
                  placeholder="e.g., Tech Stocks, Retirement Portfolio"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {field.state.meta.errors && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {field.state.meta.errors}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Description */}
          <form.Field name="description">
            {(field) => (
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  maxLength={500}
                  rows={3}
                  placeholder="Add notes about this portfolio..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            )}
          </form.Field>

          {/* Set as Default */}
          <form.Field name="isDefault">
            {(field) => (
              <div className="flex items-center">
                <input
                  id="isDefault"
                  type="checkbox"
                  checked={field.state.value}
                  onChange={(e) => field.handleChange(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label
                  htmlFor="isDefault"
                  className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Set as default portfolio
                </label>
              </div>
            )}
          </form.Field>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={() => navigate({ to: '/portfolios' })}
              className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
            >
              Cancel
            </button>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Creating...' : 'Create Portfolio'}
                </button>
              )}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
