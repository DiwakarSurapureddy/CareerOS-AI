import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginV2 = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
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
      setError(result.message || 'Invalid credentials');
    }
  };

  return (
    <main className="flex min-h-screen bg-inverse-surface items-center justify-center p-6 font-body-md relative overflow-hidden">
      {/* Background Decorative Mesh Glows */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-secondary/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '3s' }}></div>

      <div className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl space-y-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-lg">
              <span className="material-symbols-outlined text-[32px]">psychology</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">CareerOS AI</h1>
          <p className="text-xs text-outline tracking-wider uppercase mt-1">Professional Copilot</p>
          <h2 className="text-xl font-bold text-white/90 mt-6">Welcome Back (Alternative View)</h2>
          <p className="text-xs text-white/60 mt-1">Experience CareerOS AI in deep developer mode.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold text-white/70 mb-2 ml-1" htmlFor="email">Email Address</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/40">mail</span>
              <input
                required
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                id="email"
                placeholder="developer@company.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2 ml-1">
              <label className="block text-xs font-bold text-white/70" htmlFor="password">Password</label>
              <a className="text-xs text-primary font-semibold hover:underline" href="#/forgot">Forgot?</a>
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/40">lock</span>
              <input
                required
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                id="password"
                placeholder="••••••••"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors" type="button">
                <span className="material-symbols-outlined">visibility</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input className="w-4 h-4 rounded border-white/20 bg-white/5 text-primary focus:ring-primary/20" id="remember" type="checkbox" />
            <label className="text-xs text-white/60 select-none cursor-pointer" htmlFor="remember">Keep me signed in</label>
          </div>

          <button
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-secondary text-white py-4 px-6 rounded-2xl font-bold shadow-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-6 cursor-pointer"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Loading dashboard...
              </>
            ) : (
              <>
                Continue
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-white/40">
          Want the classic view?{' '}
          <Link className="text-primary font-bold hover:underline" to="/login">
            Switch back
          </Link>
        </p>
      </div>
    </main>
  );
};

export default LoginV2;
