import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [college, setCollege] = useState('');
  const [department, setDepartment] = useState('');
  const [gradYear, setGradYear] = useState('2026');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard');
    }, 1500);
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
      <section className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-slate-50">
        <div className="w-full max-w-md glass-panel p-8 rounded-2xl shadow-2xl relative">
          {/* Mobile Logo */}
          <div className="md:hidden flex justify-center mb-6">
            <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-md">
              <span className="material-symbols-outlined text-3xl">psychology</span>
            </div>
          </div>
          
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-on-surface mb-1">Create your account</h2>
            <p className="text-xs text-on-surface-variant">Start your professional transformation today.</p>
          </div>
          
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Full Name Field */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-on-surface-variant px-1" htmlFor="name">Full Name</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">person</span>
                <input
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/50 border border-outline-variant/50 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-sm"
                  id="name"
                  placeholder="John Doe"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
            
            {/* Academic Info Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-on-surface-variant px-1" htmlFor="college">College/University</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">school</span>
                  <input
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white/50 border border-outline-variant/50 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-sm"
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
                    className="w-full pl-10 pr-4 py-3 bg-white/50 border border-outline-variant/50 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-sm"
                    id="dept"
                    placeholder="Computer Science"
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            {/* Graduation Year */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-on-surface-variant px-1" htmlFor="grad">Graduation Year</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">calendar_today</span>
                <select
                  className="w-full pl-10 pr-4 py-3 bg-white/50 border border-outline-variant/50 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-sm appearance-none cursor-pointer"
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
            <div className="space-y-1">
              <label className="block text-xs font-bold text-on-surface-variant px-1" htmlFor="email">Email Address</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">mail</span>
                <input
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/50 border border-outline-variant/50 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-sm"
                  id="email"
                  placeholder="john@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            
            {/* Password Field */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-on-surface-variant px-1" htmlFor="password">Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">lock</span>
                <input
                  required
                  className="w-full pl-10 pr-10 py-3 bg-white/50 border border-outline-variant/50 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-sm"
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
            <div className="flex items-center gap-2 py-2">
              <input required className="w-4 h-4 text-primary rounded border-outline-variant focus:ring-primary" id="terms" type="checkbox" />
              <label className="text-xs text-on-surface-variant cursor-pointer select-none" htmlFor="terms">
                I agree to the <a className="text-primary hover:underline font-semibold" href="#/terms">Terms of Service</a> and <a className="text-primary hover:underline font-semibold" href="#/privacy">Privacy Policy</a>.
              </label>
            </div>
            
            {/* Submit Button */}
            <button
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/95 text-white py-3 px-6 rounded-lg font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
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
          
          <p className="text-center text-xs text-on-surface-variant mt-6">
            Already have an account?{' '}
            <Link className="text-primary font-bold hover:underline" to="/login">
              Log In
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
};

export default Signup;
