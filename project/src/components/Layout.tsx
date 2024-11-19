import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Image } from 'lucide-react';

export function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <Image className="w-8 h-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">Møllebakken Art</span>
            </Link>
            <nav className="flex items-center gap-6">
              <Link
                to="/"
                className={`flex items-center gap-2 text-sm font-medium ${
                  pathname === '/' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Home className="w-5 h-5" />
                Home
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}