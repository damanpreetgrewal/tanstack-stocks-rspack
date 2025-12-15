import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Suspense } from 'react';
import { Navigation } from '../components/Navigation';
import NotFound from './not-found';

function RootComponent() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <Suspense fallback={<LoadingSpinner />}>
          <Outlet />
        </Suspense>
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-800 py-4 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>© 2025 TanStack Stocks Dashboard • Built with React 18, TanStack, and Rsbuild</p>
          <p className="mt-1 text-xs">
            Featuring: Router • Query • Form • Virtual • Store
          </p>
        </div>
      </footer>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 border-4 border-gray-200 dark:border-gray-800 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFound,
});
