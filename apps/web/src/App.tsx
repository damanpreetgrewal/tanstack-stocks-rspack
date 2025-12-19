import { QueryClient } from '@tanstack/react-query';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { useEffect } from 'react';
import { router } from './router';
import { initializeWatchlist } from './lib/store';
import { Toaster } from 'sonner';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 1 * 60 * 60 * 1000,
      retry: 1,
    },
  },
});

const App = () => {
  useEffect(() => {
    initializeWatchlist().catch((error) => {
      console.error('Failed to initialize watchlist:', error);
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

export default App;
