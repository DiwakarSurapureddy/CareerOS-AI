import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await login({ email, password });
    setLoading(false);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message || 'Invalid email or password.');
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setGoogleLoading(true);
    const result = await loginWithGoogle();
    setGoogleLoading(false);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message || 'Failed to connect with Google.');
    }
  };

  return (
    <main className="flex min-h-screen font-body-md text-on-surface">
      {/* Left Side: Visual Hero (Desktop Only) */}
      <section className="hidden lg:flex lg:w-1/2 relative mesh-gradient overflow-hidden items-center justify-center p-12">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        {/* AI Visualization Component */}
        <div className="relative z-10 w-full max-w-lg">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-2xl animate-float">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-lg bg-primary-container flex items-center justify-center text-white shadow-lg">
                <span className="material-symbols-outlined text-3xl">psychology</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">AI Career Analysis</h2>
                <p className="text-sm text-blue-100">Analyzing professional trajectory...</p>
              </div>
            </div>
            
            {/* Abstract Data visualization */}
            <div className="space-y-4">
              <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white w-3/4 rounded-full"></div>
              </div>
              <div className="flex justify-between gap-4">
                <div className="flex-1 h-20 bg-white/5 rounded-lg border border-white/10 p-2">
                  <span className="block text-[10px] uppercase text-blue-200 font-bold mb-1">Growth</span>
                  <div className="flex items-end gap-1 h-8">
                    <div className="w-1 bg-white/60 h-2"></div>
                    <div className="w-1 bg-white/60 h-4"></div>
                    <div className="w-1 bg-white h-6"></div>
                    <div className="w-1 bg-white/80 h-3"></div>
                  </div>
                </div>
                <div className="flex-1 h-20 bg-white/5 rounded-lg border border-white/10 p-2">
                  <span className="block text-[10px] uppercase text-blue-200 font-bold mb-1">Impact</span>
                  <div className="flex items-center justify-center h-8">
                    <span className="text-white font-bold text-lg">+88%</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-sm text-white/90 leading-relaxed italic">
                "CareerOS AI helped me identify my hidden skill gaps and suggested a path that increased my market value by 40%."
              </p>
              <p className="mt-2 text-xs text-blue-200 font-semibold">— Sarah J., Senior Product Designer</p>
            </div>
          </div>
          
          {/* Floating Tags */}
          <div className="absolute -top-10 -right-10 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 text-white text-xs font-semibold shadow-lg animate-bounce" style={{ animationDuration: '4s' }}>
            #FutureOfWork
          </div>
          <div className="absolute -bottom-6 -left-10 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 text-white text-xs font-semibold shadow-lg animate-bounce" style={{ animationDelay: '1s', animationDuration: '5s' }}>
            #ProfessionalGrowth
          </div>
        </div>
        
        {/* Bottom Branding */}
        <div className="absolute bottom-10 left-10 flex items-center gap-2 text-white/60 text-xs font-semibold">
          <span className="material-symbols-outlined text-sm">verified</span>
          <span>Trusted by 50,000+ Professionals</span>
        </div>
      </section>

      {/* Right Side: Login Form */}
      <section className="w-full lg:w-1/2 bg-surface flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center lg:text-left">
            <div className="flex justify-between items-start mb-6">
              <div className="h-16 w-16 bg-primary rounded-xl flex items-center justify-center text-white shadow-md">
                <span className="material-symbols-outlined text-4xl">psychology</span>
              </div>
              <Link
                to="/signup"
                className="px-4 py-2.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-primary/20 shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">person_add</span>
                Create Account / Sign Up
              </Link>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-on-surface mb-2">Welcome back</h1>
            <p className="text-sm text-on-surface-variant">Sign in to continue your professional journey with AI.</p>
          </div>
          
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 text-xs rounded-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-2 ml-1" htmlFor="email">Email Address</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">mail</span>
                <input
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-2xl glass-input text-sm text-on-surface outline-none"
                  id="email"
                  placeholder="name@company.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2 ml-1">
                <label className="block text-xs font-bold text-on-surface-variant" htmlFor="password">Password</label>
                <a className="text-xs text-primary font-semibold hover:underline transition-all" href="#/forgot">Forgot password?</a>
              </div>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">lock</span>
                <input
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-2xl glass-input text-sm text-on-surface outline-none"
                  id="password"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors" type="button">
                  <span className="material-symbols-outlined">visibility</span>
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-2 pt-2">
              <input className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary/20" id="remember" type="checkbox" />
              <label className="text-xs text-on-surface-variant select-none cursor-pointer" htmlFor="remember">Remember me for 30 days</label>
            </div>
            
            <button
              disabled={loading || googleLoading}
              className="w-full bg-primary text-white py-4 px-6 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:opacity-95 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-6 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Signing in...
                </>
              ) : (
                <>
                  Log In
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </>
              )}
            </button>
          </form>
          
          {/* Divider */}
          <div className="relative flex items-center gap-4 py-4">
            <div className="flex-grow border-t border-outline-variant/30"></div>
            <span className="text-xs text-outline uppercase tracking-widest bg-surface px-2">or continue with</span>
            <div className="flex-grow border-t border-outline-variant/30"></div>
          </div>
          
          {/* Social Logins - GitHub removed, Google made full-width and interactive */}
          <div className="w-full">
            <button
              type="button"
              disabled={loading || googleLoading}
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl glass-input hover:bg-white dark:hover:bg-gray-800 transition-all hover:scale-[1.02] cursor-pointer shadow-sm border border-outline-variant/30 disabled:opacity-60"
            >
              {googleLoading ? (
                <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                </svg>
              )}
              <span className="text-sm font-semibold text-on-surface">
                {googleLoading ? 'Connecting to Google...' : 'Continue with Google'}
              </span>
            </button>
          </div>
          
          {/* Footer Text */}
          <p className="text-center text-sm text-on-surface-variant pt-4">
            Don't have an account?{' '}
            <Link className="text-primary font-bold hover:underline transition-all inline-flex items-center gap-0.5 ml-1" to="/signup">
              Sign up for free <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </p>
          
          {/* Micro-interaction hint */}
          <div className="flex justify-center pt-8">
            <div className="flex items-center gap-2 px-3 py-1 bg-surface-container-high rounded-full opacity-60">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface">Secure 256-bit Encryption</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Login;
