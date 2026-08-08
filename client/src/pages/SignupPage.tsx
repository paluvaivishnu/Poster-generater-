import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);
    
    try {
      const { error: signUpError } = await signUp(email, password, fullName);
      if (signUpError) {
        setError(signUpError.message || 'Failed to create account.');
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setIsLoading(false);
    }
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
          <p className="text-surface-400">Start creating stunning posters today.</p>
        </div>

        <div className="glass-card p-8 rounded-2xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {success ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-brand-500/20 text-brand-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-surface-100 mb-2">Check your email</h3>
              <p className="text-surface-300 mb-6">
                We've sent a verification link to {email}. Please verify your account to continue.
              </p>
              <Link to="/login" className="btn-secondary w-full py-3 inline-block">
                Go to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label block mb-1.5" htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  type="text"
                  required
                  className="input-field w-full"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isLoading}
                />
              </div>

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
                  placeholder="Create a strong password"
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
                {isLoading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}

          {!success && (
            <p className="mt-6 text-center text-surface-400 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">
                Log in
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
