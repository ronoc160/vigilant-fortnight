import type { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Skip to main content link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only sr-only-focusable bg-primary-600 text-white z-50 absolute top-2 left-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header
        className="bg-white border-b border-gray-200 sticky top-0 z-10"
        aria-label="Site header"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-gray-900" aria-hidden="true">
                Portfolio Dashboard
              </span>
            </div>

            <nav aria-label="User menu">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 hidden sm:block">
                  {user?.email}
                </span>
                <Button variant="ghost" size="sm" onClick={logout}>
                  Sign Out
                </Button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main
        id="main-content"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        aria-label="Dashboard content"
      >
        {children}
      </main>
    </div>
  );
}
