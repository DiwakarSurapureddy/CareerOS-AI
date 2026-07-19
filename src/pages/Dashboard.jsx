import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Hero Welcome */}
      <section className="relative overflow-hidden glass-panel rounded-2xl p-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="relative z-10 text-center md:text-left">
          <h2 className="font-display-lg text-3xl md:text-4xl font-extrabold text-on-surface mb-2">Welcome back, Diwakar 👋</h2>
          <p className="text-lg text-on-surface-variant">Continue building your career with expert AI guidance.</p>
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex -space-x-2">
            <div className="w-10 h-10 rounded-full border-2 border-white bg-primary flex items-center justify-center text-white text-[12px] font-bold">JD</div>
            <div className="w-10 h-10 rounded-full border-2 border-white bg-secondary flex items-center justify-center text-white text-[12px] font-bold">AI</div>
          </div>
          <div className="text-sm text-on-surface-variant">
            <span className="font-bold text-primary">Live Optimization:</span> 84% Ready
          </div>
        </div>
        {/* Subtle background decoration */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-secondary/5 rounded-full blur-2xl"></div>
      </section>

      {/* Quick Actions Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => navigate('/resume-analyzer')}
          className="glass-panel p-6 rounded-2xl flex items-center gap-6 group hover:bg-primary transition-all duration-300 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-white/20">
            <span className="material-symbols-outlined text-primary group-hover:text-white">upload_file</span>
          </div>
          <div className="text-left">
            <p className="font-bold text-on-surface group-hover:text-white">Upload Resume</p>
            <p className="text-xs text-on-surface-variant group-hover:text-white/80">Update your profile with AI</p>
          </div>
        </button>
        <button
          onClick={() => navigate('/skill-gap-analyzer')}
          className="glass-panel p-6 rounded-2xl flex items-center gap-6 group hover:bg-secondary transition-all duration-300 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center group-hover:bg-white/20">
            <span className="material-symbols-outlined text-secondary group-hover:text-white">bar_chart</span>
          </div>
          <div className="text-left">
            <p className="font-bold text-on-surface group-hover:text-white">Analyze Skills</p>
            <p className="text-xs text-on-surface-variant group-hover:text-white/80">Benchmark against market</p>
          </div>
        </button>
        <button
          onClick={() => navigate('/ai-career-mentor')}
          className="glass-panel p-6 rounded-2xl flex items-center gap-6 group hover:bg-inverse-surface transition-all duration-300 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-inverse-surface/5 flex items-center justify-center group-hover:bg-white/20">
            <span className="material-symbols-outlined text-on-surface group-hover:text-white">forum</span>
          </div>
          <div className="text-left">
            <p className="font-bold text-on-surface group-hover:text-white">Chat with AI</p>
            <p className="text-xs text-on-surface-variant group-hover:text-white/80">Get instant career advice</p>
          </div>
        </button>
      </section>

      {/* Stats & Bento Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Analytics Section (Bento Style) */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Stats Cards (Small) */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between hover:scale-[1.01] transition-transform duration-200">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Resume Score</span>
              <span className="text-primary font-bold text-sm">+12%</span>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <h3 className="text-4xl font-extrabold text-on-surface">84<span className="text-lg text-on-surface-variant/40">/100</span></h3>
              <div className="w-20 h-2 bg-surface-container overflow-hidden rounded-full mb-2">
                <div className="bg-primary h-full w-[84%]"></div>
              </div>
            </div>
          </div>
          <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between hover:scale-[1.01] transition-transform duration-200">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Job Readiness</span>
              <span className="material-symbols-outlined text-tertiary">rocket_launch</span>
            </div>
            <div className="mt-4">
              <div className="flex items-center gap-2">
                <h3 className="text-3xl font-extrabold text-on-surface">Elite</h3>
                <span className="bg-tertiary/10 text-tertiary px-2 py-1 rounded text-[10px] font-bold">TOP 5%</span>
              </div>
            </div>
          </div>

          {/* Skills Distribution (Radar Chart Placeholder) */}
          <div className="glass-panel p-6 rounded-2xl col-span-1 md:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-bold text-on-surface">Skill Distribution</h4>
              <button onClick={() => navigate('/skill-gap-analyzer')} className="text-xs text-primary font-bold hover:underline cursor-pointer">View Detailed Map</button>
            </div>
            <div className="h-64 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                  { subject: 'Technical', A: 120, fullMark: 150 },
                  { subject: 'Management', A: 98, fullMark: 150 },
                  { subject: 'Leadership', A: 86, fullMark: 150 },
                  { subject: 'Design', A: 99, fullMark: 150 },
                  { subject: 'Soft Skills', A: 85, fullMark: 150 },
                ]}>
                  <PolarGrid stroke="#cbd5e1" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                  <Radar name="Skills" dataKey="A" stroke="#004ac6" fill="#004ac6" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Progress Over Time (Bar Chart Placeholder) */}
          <div className="glass-panel p-6 rounded-2xl col-span-1 md:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-bold text-on-surface">Learning Velocity</h4>
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                  <span className="text-[10px] text-on-surface-variant font-bold">ACTUAL</span>
                </div>
              </div>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'MON', actual: 60 },
                  { name: 'TUE', actual: 80 },
                  { name: 'WED', actual: 70 },
                  { name: 'THU', actual: 95 },
                  { name: 'FRI', actual: 40 },
                  { name: 'SAT', actual: 30 },
                ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={32}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} />
                  <YAxis hide={true} domain={[0, 100]} />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Bar dataKey="actual" radius={[4, 4, 0, 0]}>
                    {[...Array(6)].map((_, index) => (
                      <Cell key={`cell-${index}`} fill="#004ac6" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Feed & Recommendations (Right Column) */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Circular Readiness */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col items-center text-center ai-glow border-primary/20">
            <div className="relative w-32 h-32 flex items-center justify-center mb-6">
              <svg className="w-full h-full transform -rotate-90">
                <circle className="text-surface-container-high" cx="64" cy="64" fill="transparent" r="50" stroke="currentColor" strokeWidth="8"></circle>
                <circle className="text-primary" cx="64" cy="64" fill="transparent" r="50" stroke="currentColor" strokeDasharray="314.15" strokeDashoffset="47.12" strokeWidth="8" strokeLinecap="round"></circle>
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-on-surface">85%</span>
                <span className="text-[9px] text-outline font-bold tracking-wider">READY</span>
              </div>
            </div>
            <h4 className="font-bold text-on-surface">Target: Sr. Product Designer</h4>
            <p className="text-xs text-on-surface-variant mt-2">You are only 3 certifications away from your goal position.</p>
            <button
              onClick={() => navigate('/career-prediction')}
              className="mt-6 w-full py-3 bg-primary text-white rounded-xl font-semibold shadow-lg hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              Optimize Profile
            </button>
          </div>

          {/* AI Suggestions Feed */}
          <div className="glass-panel rounded-2xl overflow-hidden border border-outline-variant/30">
            <div className="p-4 border-b border-outline-variant/30 flex items-center gap-2 bg-slate-50">
              <span className="material-symbols-outlined text-secondary animate-pulse">magic_button</span>
              <h4 className="font-bold text-on-surface">AI Suggestions</h4>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex gap-3 border-l-2 border-primary pl-3 py-1">
                <div>
                  <p className="text-xs font-bold text-on-surface">New Skill Gap Identified</p>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">Market trend: "Kubernetes" is now highly requested for your target role.</p>
                  <button onClick={() => navigate('/skill-gap-analyzer')} className="text-[11px] text-primary font-bold mt-1 inline-block hover:underline cursor-pointer">Add to Roadmap</button>
                </div>
              </div>
              <div className="flex gap-3 border-l-2 border-secondary pl-3 py-1">
                <div>
                  <p className="text-xs font-bold text-on-surface">Resume Tip</p>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">Quantify your achievements under TechFlow experience to increase ATS score.</p>
                  <button onClick={() => navigate('/ats-score')} className="text-[11px] text-secondary font-bold mt-1 inline-block hover:underline cursor-pointer">Fix Now</button>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;
