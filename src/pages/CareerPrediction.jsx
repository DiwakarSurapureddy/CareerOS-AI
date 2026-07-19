import React, { useState } from 'react';

const CareerPrediction = () => {
  const [paths, setPaths] = useState([
    {
      id: 1,
      title: 'Senior AI Engineer',
      match: 98,
      icon: 'neurology',
      iconBg: 'bg-secondary-container/10 text-secondary',
      desc: 'Your expertise in Python and PyTorch, combined with your recent focus on LLM fine-tuning, makes this your strongest logical progression.',
      salary: '$160k - $240k',
      growth: '+34% YoY',
      readiness: 85,
    },
    {
      id: 2,
      title: 'Lead Data Scientist',
      match: 82,
      icon: 'analytics',
      iconBg: 'bg-tertiary-container/10 text-tertiary',
      desc: 'Strategic path leveraging your statistical background. Requires bridging gap in Big Data architectural knowledge (Spark/Hadoop).',
      salary: '$145k - $210k',
      growth: '+22% YoY',
      readiness: 72,
    },
    {
      id: 3,
      title: 'Product Manager (AI Solutions)',
      match: 75,
      icon: 'cognition',
      iconBg: 'bg-primary-container/10 text-primary',
      desc: 'High-growth career path blending technical knowledge with business strategy. Recommended due to strong communication score.',
      salary: '$150k - $220k',
      growth: '+28% YoY',
      readiness: 60,
    },
  ]);

  const [recalculating, setRecalculating] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const handleRecalculate = () => {
    setRecalculating(true);
    setTimeout(() => {
      setRecalculating(false);
      // Randomly adjust matches slightly for visual feedback
      setPaths(
        paths.map((p) => ({
          ...p,
          match: Math.min(100, Math.max(50, p.match + Math.floor(Math.random() * 5) - 2)),
          readiness: Math.min(100, Math.max(40, p.readiness + Math.floor(Math.random() * 5) - 2)),
        }))
      );
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Hero Header Section */}
      <section className="relative overflow-hidden rounded-3xl p-8 bg-white border border-outline-variant/30 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="relative z-10">
          <h2 className="font-display-lg text-3xl font-extrabold text-on-surface mb-2">Career Predictions</h2>
          <p className="font-body-lg text-on-surface-variant max-w-2xl mt-1 text-sm md:text-base">
            Based on your historical performance, skill acquisition velocity, and market trends, our AI has mapped out your most probable high-impact career trajectories.
          </p>
        </div>
        {/* Background Decorative Element */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <button
            disabled={recalculating}
            onClick={handleRecalculate}
            className="flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all cursor-pointer bg-primary/5 hover:bg-primary/10 px-5 py-3 rounded-2xl"
          >
            {recalculating ? 'Calculating...' : 'Recalculate Projections'}
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </section>

      {/* Career Path Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {paths.map((path) => (
          <div
            key={path.id}
            className="glass-card ai-glow rounded-2xl p-6 flex flex-col transition-all duration-300 hover:scale-[1.01] hover:shadow-xl group"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`p-3 rounded-xl ${path.iconBg}`}>
                <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {path.icon}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-2xl font-extrabold text-primary">{path.match}%</span>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">AI Match</span>
              </div>
            </div>
            <h3 className="font-headline text-lg font-bold text-on-surface mb-2">{path.title}</h3>
            <p className="text-xs text-on-surface-variant mb-6 leading-relaxed h-16 overflow-hidden">
              {path.desc}
            </p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/20">
                <p className="text-[9px] text-on-surface-variant uppercase font-bold mb-1">Salary Range</p>
                <p className="font-bold text-on-surface text-xs">{path.salary}</p>
              </div>
              <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/20">
                <p className="text-[9px] text-on-surface-variant uppercase font-bold mb-1">Growth Rate</p>
                <p className="font-bold text-tertiary text-xs">{path.growth}</p>
              </div>
            </div>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-bold text-on-surface">Career Readiness</span>
                <span className="text-xs text-primary font-bold">{path.readiness}%</span>
              </div>
              <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${path.readiness}%` }}
                ></div>
              </div>
            </div>
            <div className="mt-auto pt-4 border-t border-outline-variant/20 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setExpandedId(expandedId === path.id ? null : path.id)}
                  className="text-xs font-bold text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                >
                  {expandedId === path.id ? 'Hide Details' : 'View Details'}
                </button>
                <button className="bg-primary text-white p-2 rounded-lg hover:bg-primary-container transition-all cursor-pointer flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>

              {/* Expanded Required Skills Section */}
              {expandedId === path.id && (
                <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/20 animate-fade-in space-y-3">
                  <h4 className="text-[10px] font-bold text-on-surface uppercase tracking-wider">Required Skills & Roadmap</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded">Python</span>
                    <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded">LLMs</span>
                    <span className="px-2 py-1 bg-surface-container-high text-on-surface-variant text-[10px] font-bold rounded">MLOps (Missing)</span>
                  </div>
                  <button className="w-full mt-2 py-1.5 border border-primary text-primary text-xs font-bold rounded-lg hover:bg-primary hover:text-white transition-colors cursor-pointer">
                    View Learning Path
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CareerPrediction;
