// ============================================
// BrandForge AI — Navbar Component
// ============================================

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Palette,
  Wand2,
  Clock,
  LogOut,
  Menu,
  X,
  Sparkles,
  ChevronDown,
  Sun,
  Moon,
} from 'lucide-react';
import { useState, useEffect } from 'react';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/brand-kit', label: 'Brand Kit', icon: Palette },
  { to: '/generate', label: 'Generate', icon: Wand2 },
  { to: '/history', label: 'History', icon: Clock },
];

export default function Navbar() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-surface-950/80 backdrop-blur-xl border-b border-surface-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-brand-500/20 transition-all">
              <Sparkles className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-bold font-[Outfit] tracking-tight">
              Brand<span className="gradient-text">Forge</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-brand-600/15 text-brand-400'
                        : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center font-semibold text-sm border border-brand-500/30">
                    {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden sm:inline font-medium text-sm text-surface-200">
                    {user.full_name || user.email?.split('@')[0]}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="ml-2 btn-ghost !p-2 text-surface-400 hover:text-error"
                    title="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-surface-300">
                  Log in
                </Link>
                <Link to="/signup" className="btn-primary text-sm !py-2 !px-4">
                  Get Started
                </Link>
              </div>
            )}
            
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-surface-400 hover:bg-surface-800 hover:text-surface-200 transition-colors"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Mobile menu toggle */}
            {user && (
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-lg text-surface-400 hover:bg-surface-800"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {user && mobileOpen && (
        <div className="md:hidden border-t border-surface-800 bg-surface-950/95 backdrop-blur-xl">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-600/15 text-brand-400'
                      : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
