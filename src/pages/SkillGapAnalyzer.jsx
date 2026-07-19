import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const SkillGapAnalyzer = () => {
  const [skills, setSkills] = useState([
    {
      id: 1,
      name: 'AWS ML Ops',
      status: 'Critical Gap',
      statusColor: 'bg-error-container text-on-error-container border-error/15',
      icon: 'cloud_sync',
      iconColor: 'bg-error-container/40 text-error',
      percent: 0,
      estimate: '~40 Hours',
      buttonText: 'Start Learning',
      isPrimaryButton: true,
    },
    {
      id: 2,
      name: 'PySpark Optimization',
      status: 'Learning',
      statusColor: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: 'data_object',
      iconColor: 'bg-yellow-100 text-yellow-700',
      percent: 60,
      estimate: '12 Hours remaining',
      buttonText: 'Resume Course',
      isPrimaryButton: false,
    },
    {
      id: 3,
      name: 'Advanced Python',
      status: 'Mastered',
      statusColor: 'bg-green-100 text-green-800 border-green-200',
      icon: 'terminal',
      iconColor: 'bg-green-100 text-green-700',
      percent: 100,
      estimate: 'Completed',
      buttonText: 'Review Material',
      isPrimaryButton: false,
    },
    {
      id: 4,
      name: 'MLflow Pipelines',
      status: 'Critical Gap',
      statusColor: 'bg-error-container text-on-error-container border-error/15',
      icon: 'schema',
      iconColor: 'bg-error-container/40 text-error',
      percent: 10,
      estimate: '~25 Hours',
      buttonText: 'Start Learning',
      isPrimaryButton: true,
    },
    {
      id: 5,
      name: 'Docker & Kubernetes',
      status: 'Learning',
      statusColor: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: 'layers',
      iconColor: 'bg-yellow-100 text-yellow-700',
      percent: 45,
      estimate: '8 Hours remaining',
      buttonText: 'Resume Course',
      isPrimaryButton: false,
    },
  ]);

  const [activeFilter, setActiveFilter] = useState('All');

  const handleAction = (id) => {
    setSkills(
      skills.map((skill) => {
        if (skill.id === id) {
          if (skill.status === 'Critical Gap') {
            return {
              ...skill,
              status: 'Learning',
              statusColor: 'bg-yellow-100 text-yellow-800 border-yellow-200',
              iconColor: 'bg-yellow-100 text-yellow-700',
              percent: 10,
              estimate: '36 Hours remaining',
              buttonText: 'Resume Course',
              isPrimaryButton: false,
            };
          } else if (skill.status === 'Learning') {
            return {
              ...skill,
              status: 'Mastered',
              statusColor: 'bg-green-100 text-green-800 border-green-200',
              iconColor: 'bg-green-100 text-green-700',
              percent: 100,
              estimate: 'Completed',
              buttonText: 'Review Material',
              isPrimaryButton: false,
            };
          }
        }
        return skill;
      })
    );
  };

  const filteredSkills = skills.filter((skill) => {
    if (activeFilter === 'Only Gaps') return skill.status === 'Critical Gap';
    if (activeFilter === 'In Progress') return skill.status === 'Learning';
    return true;
  });

  // Calculate stats dynamically
  const masteredCount = skills.filter((s) => s.status === 'Mastered').length + 11; // Offsetting baseline count
  const learningCount = skills.filter((s) => s.status === 'Learning').length;
  const gapCount = skills.filter((s) => s.status === 'Critical Gap').length;

  const totalReadiness = Math.round(
    (skills.reduce((acc, curr) => acc + curr.percent, 0) + 11 * 100) / (skills.length + 11)
  );

  return (
    <div className="space-y-6">
      {/* Page Header Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-primary mb-1">
            <span className="material-symbols-outlined text-sm">target</span>
            <span className="text-xs font-bold uppercase tracking-widest">Target Analysis</span>
          </div>
          <h2 className="font-display-lg text-3xl md:text-4xl font-extrabold text-on-surface">Data Scientist</h2>
          <p className="text-on-surface-variant font-body-lg max-w-2xl mt-1">
            A comprehensive comparison of your current capabilities against the industry-standard requirements for high-level Data Science roles.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="bg-surface-container-high text-on-surface px-6 py-3 rounded-xl font-bold hover:bg-outline-variant/30 transition-all cursor-pointer">
            Update Resume
          </button>
          <button className="bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer">
            Download Report
          </button>
        </div>
      </section>

      {/* Bento Grid Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Overall Readiness Score (Bento Small) */}
        <div className="col-span-12 lg:col-span-4 glass rounded-[2rem] border border-outline-variant/30 p-6 flex flex-col items-center justify-center relative overflow-hidden ai-glow">
          <div className="relative z-10 text-center flex flex-col items-center">
            <span className="text-on-surface-variant font-bold text-xs uppercase tracking-wider mb-2 block">Readiness Score</span>
            <div className="text-[72px] font-extrabold text-primary leading-none mb-2">
              {totalReadiness}%
            </div>
            <div className="w-32 h-2 bg-surface-container-highest rounded-full overflow-hidden mb-4">
              <div className="h-full bg-primary transition-all duration-500" style={{ width: `${totalReadiness}%` }}></div>
            </div>
            <p className="text-xs text-on-surface-variant px-4">
              You're on the right track. Closing {gapCount} critical gaps will put you in the top 10% of applicants.
            </p>
          </div>
        </div>

        {/* Skill Gaps Summary (Bento Large) */}
        <div className="col-span-12 lg:col-span-8 glass rounded-[2rem] border border-outline-variant/30 p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-3 justify-between">
            <div className="flex items-center gap-2 text-green-600">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              <span className="font-bold text-xs uppercase tracking-wider">{masteredCount} MASTERED</span>
            </div>
            <div className="bg-green-50 rounded-2xl p-4 border border-green-100 flex-1">
              <p className="text-xs text-green-800 leading-relaxed font-medium">Your core Python and Statistics foundations are exceptionally strong.</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 justify-between">
            <div className="flex items-center gap-2 text-yellow-600">
              <span className="material-symbols-outlined text-[20px]">pending</span>
              <span className="font-bold text-xs uppercase tracking-wider">{learningCount} IN PROGRESS</span>
            </div>
            <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-100 flex-1">
              <p className="text-xs text-yellow-800 leading-relaxed font-medium">Currently bridging gaps in Deep Learning and Spark optimization.</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 justify-between">
            <div className="flex items-center gap-2 text-error">
              <span className="material-symbols-outlined text-[20px]">warning</span>
              <span className="font-bold text-xs uppercase tracking-wider">{gapCount} CRITICAL GAPS</span>
            </div>
            <div className="bg-error-container rounded-2xl p-4 border border-error/10 flex-1">
              <p className="text-xs text-on-error-container leading-relaxed font-medium">Missing specialized AWS ML Ops and MLOps Pipeline experience.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart View */}
      <div className="glass rounded-[2rem] border border-outline-variant/30 p-6 space-y-4">
        <h3 className="font-headline text-lg font-bold text-on-surface mb-2">Competency Overview Chart</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={skills} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barSize={40}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis hide={true} domain={[0, 100]} />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              />
              <Bar dataKey="percent" radius={[8, 8, 8, 8]}>
                {skills.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.percent === 0 ? '#ef4444' : entry.percent === 100 ? '#22c55e' : '#004ac6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Comparison View */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
          <h3 className="font-headline text-lg font-bold text-on-surface">Comprehensive Gap Analysis</h3>
          <div className="flex bg-surface-container-high p-1 rounded-lg">
            {['All', 'Only Gaps', 'In Progress'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  activeFilter === filter
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredSkills.map((skill) => (
            <div
              key={skill.id}
              className="glass border border-outline-variant/30 rounded-2xl p-6 hover:scale-[1.01] transition-transform duration-200 relative"
            >
              <div className="grid grid-cols-12 items-center gap-6">
                <div className="col-span-12 md:col-span-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${skill.iconColor}`}>
                      <span className="material-symbols-outlined">{skill.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-on-surface text-base">{skill.name}</h4>
                      <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border mt-1 ${skill.statusColor}`}>
                        {skill.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="col-span-12 md:col-span-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-on-surface-variant">Competency Levels</span>
                    <span className={`text-xs font-bold ${skill.percent === 0 ? 'text-error' : skill.percent === 100 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {skill.percent === 0 ? 'Missing' : `${skill.percent}% Complete`}
                    </span>
                  </div>
                  <div className="flex gap-1 h-2 relative">
                    <div className={`flex-1 rounded-l-full ${skill.percent >= 20 ? 'bg-primary' : 'bg-surface-container-highest'}`}></div>
                    <div className={`flex-1 ${skill.percent >= 40 ? 'bg-primary' : 'bg-surface-container-highest'}`}></div>
                    <div className={`flex-1 ${skill.percent >= 60 ? 'bg-primary' : 'bg-surface-container-highest'}`}></div>
                    <div className={`flex-1 ${skill.percent >= 80 ? 'bg-primary' : 'bg-surface-container-highest'}`}></div>
                    <div className={`flex-1 rounded-r-full ${skill.percent >= 100 ? 'bg-primary' : 'bg-surface-container-highest'}`}></div>
                    <div className="absolute -top-1 ml-[60%] w-0.5 h-4 bg-primary/70 z-10" title="Target Level"></div>
                  </div>
                </div>

                <div className="col-span-6 md:col-span-2">
                  <span className="text-on-surface-variant text-[11px] font-bold block uppercase tracking-wider">Est. Time</span>
                  <p className="font-bold text-on-surface mt-0.5">{skill.estimate}</p>
                </div>

                <div className="col-span-6 md:col-span-2 flex justify-end">
                  <button
                    onClick={() => handleAction(skill.id)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all group cursor-pointer ${
                      skill.isPrimaryButton
                        ? 'bg-primary text-white hover:bg-primary/95 shadow-md shadow-primary/10'
                        : 'border border-primary text-primary hover:bg-primary-container/10'
                    }`}
                  >
                    {skill.buttonText}
                    <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">
                      arrow_forward
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkillGapAnalyzer;
