import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      const result = await signIn(email, password);
      if (result?.error) {
        setError(result.error.message || 'Failed to sign in. Please check your credentials.');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('demo@brandforge.ai');
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4">
      {/* Decorative bg */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-[400px] bg-brand-600/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-display font-bold tracking-tight text-surface-100 mb-2 hover:opacity-90 transition-opacity">
            <Sparkles className="w-6 h-6 text-brand-400" />
            BrandForge
          </Link>
          <p className="text-surface-400">Welcome back! Please enter your details.</p>
        </div>

        <div className="glass-card p-8 rounded-2xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="mb-6 p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-between">
            <div className="text-xs text-surface-300">
              <span className="font-semibold text-brand-400">Demo Account:</span><br />
              <code>demo@brandforge.ai</code> / <code>password123</code>
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-xs bg-brand-600 hover:bg-brand-500 text-white px-3 py-1.5 rounded-lg transition-colors font-medium cursor-pointer"
            >
              Auto Fill
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label block mb-1.5" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                className="input-field w-full"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label className="label block mb-1.5" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                className="input-field w-full"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary w-full py-3 mt-4"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-surface-400 text-sm">
            Don't have an account?{' '}
            <Link to="/signup" className="text-brand-400 hover:text-brand-300 font-medium">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
