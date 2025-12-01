import { Link, useLocation } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { clsx } from 'clsx';
import { HomeIcon, TrackerIcon, NewsIcon, AIIcon, AdvancedIcon } from './icons/FeatureIcons';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'AI Analysis', href: '/analysis', icon: AIIcon },
  { name: 'News & Insights', href: '/news', icon: NewsIcon },
];

export const Layout = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-crypto-bg bg-chart-pattern">
      {/* Navigation */}
      <nav className="glass-card rounded-none border-x-0 border-t-0 mb-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <Activity className="w-8 h-8 text-crypto-lime" />
              <span className="text-xl font-bold neon-text">
                Crypto Insight Hub
              </span>
            </Link>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={clsx(
                      'flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200',
                      isActive 
                        ? 'bg-crypto-lime/20 text-crypto-lime' 
                        : 'text-gray-400 hover:text-crypto-lime hover:bg-crypto-lime/10'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden text-crypto-lime p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-crypto-lime/10 px-4 py-2">
          <div className="flex flex-col gap-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={clsx(
                    'flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200',
                    isActive 
                      ? 'bg-crypto-lime/20 text-crypto-lime' 
                      : 'text-gray-400 hover:text-crypto-lime hover:bg-crypto-lime/10'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="glass-card rounded-none border-x-0 border-b-0 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              © 2025 Crypto Insight Hub. For informational purposes only.
            </p>
            <p className="text-gray-500 text-sm">
              Data provided by CoinGecko API
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
