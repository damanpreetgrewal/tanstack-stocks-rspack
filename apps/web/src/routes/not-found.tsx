import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/not-found')({
  component: NotFound,
})

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">Page not found</p>
      <Link
        to="/"
        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
      >
        Go Home
      </Link>
    </div>
  )
}
