import { QueryClient } from '@tanstack/react-query'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { useEffect } from 'react'
import { router } from './router'
import { initializeWatchlist } from './lib/store'
import { Toaster } from 'sonner'
import './index.css'

// Create a client for react-query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 1 * 60 * 60 * 1000, // 1 hour
      retry: 1,
    },
  },
})

function App() {
  useEffect(() => {
    // Initialize watchlist from database on app load
    initializeWatchlist().catch((error) => {
      console.error('Failed to initialize watchlist:', error)
    })
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </QueryClientProvider>
  )
}

export default App
