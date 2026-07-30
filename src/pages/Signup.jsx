import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const navigate = useNavigate();
  const { signup, loginWithGoogle } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [college, setCollege] = useState('');
  const [department, setDepartment] = useState('');
  const [gradYear, setGradYear] = useState('2026');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await signup({
      name,
      fullName: name,
      email,
      password,
      college,
      department,
      gradYear
    });
    setLoading(false);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message || 'Failed to create account.');
    }
  };

  const handleGoogleSignup = async () => {
    setError(null);
    setGoogleLoading(true);
    const result = await loginWithGoogle();
    setGoogleLoading(false);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message || 'Failed to sign up with Google.');
    }
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row font-body-md text-on-surface">
      {/* Left Side: Hero Illustration Section */}
      <section className="hidden md:flex md:w-1/2 relative overflow-hidden bg-primary items-center justify-center p-12">
        {/* Background Decoration */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-secondary/20 blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-tertiary/20 blur-[120px]"></div>
        </div>
        
        <div className="relative z-10 max-w-lg text-center">
          <div className="mb-8 inline-block p-2 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20">
            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center text-primary shadow-lg">
              <span className="material-symbols-outlined text-[40px]">psychology</span>
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-6">
            Empower Your <span className="text-secondary-fixed">Future Self</span>
          </h1>
          <p className="text-lg text-on-primary/80 mb-8">
            The ultimate AI-driven professional co-pilot designed to streamline your career journey from student to industry leader.
          </p>
          
          {/* High-End UI Component Preview (Glassmorphic) */}
          <div className="glass-panel p-4 rounded-xl text-left shadow-xl animate-float">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
              <span className="text-xs uppercase font-bold tracking-widest text-primary">AI Prediction</span>
            </div>
            <div className="h-2 w-full bg-surface-variant rounded-full mb-2 overflow-hidden">
              <div className="h-full bg-primary w-[85%] transition-all duration-1000"></div>
            </div>
            <p className="text-xs text-on-surface-variant italic">"92% match found for Senior Software Architect role based on your current trajectory."</p>
          </div>
        </div>
      </section>

      {/* Right Side: Signup Form Section */}
      <section className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-slate-50 dark:bg-gray-900 overflow-y-auto">
        <div className="w-full max-w-md glass-panel p-8 rounded-2xl shadow-2xl relative">
          {/* Mobile Logo & Switch */}
          <div className="flex items-center justify-between gap-2 mb-6">
            <div className="text-left">
              <h2 className="text-2xl font-bold text-on-surface mb-1">Create your account</h2>
              <p className="text-xs text-on-surface-variant">Start your professional transformation today.</p>
            </div>
            <Link
              to="/login"
              className="px-3.5 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-primary/20 shrink-0 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">login</span>
              Log In
            </Link>
          </div>

          {error && (
            <div className="p-3 mb-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 text-xs rounded-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">error</span>
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-3.5" onSubmit={handleSubmit}>
            {/* Full Name Field */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-on-surface-variant px-1" htmlFor="name">Full Name</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">person</span>
                <input
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/60 dark:bg-gray-800 border border-outline-variant/50 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-sm text-on-surface"
                  id="name"
                  placeholder="John Doe"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
            
            {/* Academic Info Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-on-surface-variant px-1" htmlFor="college">College/University</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">school</span>
                  <input
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white/60 dark:bg-gray-800 border border-outline-variant/50 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-sm text-on-surface"
                    id="college"
                    placeholder="Stanford University"
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-on-surface-variant px-1" htmlFor="dept">Department</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">account_tree</span>
                  <input
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white/60 dark:bg-gray-800 border border-outline-variant/50 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-sm text-on-surface"
                    id="dept"
                    placeholder="Computer Science"
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            {/* Graduation Year & Email in structured inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1 sm:col-span-1">
                <label className="block text-xs font-bold text-on-surface-variant px-1" htmlFor="grad">Grad Year</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">calendar_today</span>
                  <select
                    className="w-full pl-10 pr-3 py-3 bg-white/60 dark:bg-gray-800 border border-outline-variant/50 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-sm text-on-surface appearance-none cursor-pointer"
                    id="grad"
                    value={gradYear}
                    onChange={(e) => setGradYear(e.target.value)}
                  >
                    <option>2024</option>
                    <option>2025</option>
                    <option>2026</option>
                    <option>2027</option>
                    <option>2028</option>
                  </select>
                </div>
              </div>
              
              {/* Email Field */}
              <div className="space-y-1 sm:col-span-2">
                <label className="block text-xs font-bold text-on-surface-variant px-1" htmlFor="email">Email Address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">mail</span>
                  <input
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white/60 dark:bg-gray-800 border border-outline-variant/50 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-sm text-on-surface"
                    id="email"
                    placeholder="john@example.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            {/* Password Field */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-on-surface-variant px-1" htmlFor="password">Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">lock</span>
                <input
                  required
                  className="w-full pl-10 pr-10 py-3 bg-white/60 dark:bg-gray-800 border border-outline-variant/50 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-sm text-on-surface"
                  id="password"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors" type="button">
                  <span className="material-symbols-outlined">visibility</span>
                </button>
              </div>
            </div>
            
            {/* Terms checkbox */}
            <div className="flex items-center gap-2 py-1">
              <input required className="w-4 h-4 text-primary rounded border-outline-variant focus:ring-primary" id="terms" type="checkbox" />
              <label className="text-xs text-on-surface-variant cursor-pointer select-none" htmlFor="terms">
                I agree to the <a className="text-primary hover:underline font-semibold" href="#/terms">Terms of Service</a> and <a className="text-primary hover:underline font-semibold" href="#/privacy">Privacy Policy</a>.
              </label>
            </div>
            
            {/* Submit Button */}
            <button
              disabled={loading || googleLoading}
              className="w-full bg-primary hover:bg-primary/95 text-white py-3.5 px-6 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center gap-4 py-4">
            <div className="flex-grow border-t border-outline-variant/30"></div>
            <span className="text-xs text-outline uppercase tracking-widest px-2">or sign up with</span>
            <div className="flex-grow border-t border-outline-variant/30"></div>
          </div>

          {/* Google Sign Up (GitHub removed) */}
          <div className="w-full">
            <button
              type="button"
              disabled={loading || googleLoading}
              onClick={handleGoogleSignup}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl bg-white dark:bg-gray-800 border border-outline-variant/50 hover:bg-slate-100 transition-all hover:scale-[1.01] cursor-pointer shadow-sm disabled:opacity-60"
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
                {googleLoading ? 'Connecting to Google...' : 'Sign up with Google'}
              </span>
            </button>
          </div>
          
          <p className="text-center text-sm text-on-surface-variant mt-6">
            Already have an account?{' '}
            <Link className="text-primary font-bold hover:underline inline-flex items-center gap-0.5 ml-1" to="/login">
              Log In <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
};

export default Signup;
