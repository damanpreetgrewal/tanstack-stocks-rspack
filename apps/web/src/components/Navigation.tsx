import { Link, useNavigate } from '@tanstack/react-router';
import { useSession, signOut } from '../lib/auth-client';
import { getInitials, getAvatarColor } from '../lib/avatar-utils';
import { toast } from 'sonner';

export function Navigation() {
  const { data: session } = useSession();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate({ to: '/' });
  };

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
          
          {session?.user ? (
            <>
              <Link
                to="/portfolios"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
              >
                Portfolios
              </Link>
              <Link
                to="/watchlist"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                ⭐ Watchlist
              </Link>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {session.user.image ? (
                    <img 
                      src={session.user.image} 
                      alt={session.user.name || 'User'} 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className={`w-8 h-8 rounded-full ${getAvatarColor(session.user.name)} flex items-center justify-center text-white text-xs font-semibold`}>
                      {getInitials(session.user.name)}
                    </div>
                  )}
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {session.user.name || session.user.email}
                  </span>
                </div>
                
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <a
              href="/auth"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Sign In
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}
