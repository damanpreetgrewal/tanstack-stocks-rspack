import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'

export function Component() {
  const navigate = useNavigate()

  useEffect(() => {
    // better-auth handles the OAuth callback automatically
    // Just redirect to home or dashboard after a brief delay
    const timer = setTimeout(() => {
      navigate({ to: '/' })
    }, 500)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-lg font-semibold">Completing sign-in...</p>
        <p className="text-gray-500 mt-2">You'll be redirected shortly</p>
      </div>
    </div>
  )
}
