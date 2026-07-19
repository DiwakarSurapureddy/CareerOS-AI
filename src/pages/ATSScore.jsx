import React, { useState, useEffect } from 'react';

const ATSScore = () => {
  const [score, setScore] = useState(0);
  const targetScore = 84;
  
  useEffect(() => {
    // Animate score from 0 to targetScore
    const duration = 1500; // ms
    const steps = 60;
    const stepTime = duration / steps;
    let currentStep = 0;
    
    const timer = setInterval(() => {
      currentStep++;
      const easeOutQuart = 1 - Math.pow(1 - currentStep / steps, 4);
      setScore(Math.round(targetScore * easeOutQuart));
      
      if (currentStep >= steps) {
        clearInterval(timer);
        setScore(targetScore);
      }
    }, stepTime);
    
    return () => clearInterval(timer);
  }, []);

  const circumference = 2 * Math.PI * 100;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const tips = [
    {
      id: 1,
      title: 'Quantify Achievement in Experience',
      desc: 'Change "Managed a team" to "Led a high-performance team of 12, increasing quarterly output by 24%."',
      icon: 'trending_up',
      iconBg: 'bg-primary/10 text-primary hover:bg-primary hover:text-white',
    },
    {
      id: 2,
      title: 'Missing Technical Keywords',
      desc: 'ATS parsing expects "AWS MLOps" and "MLflow Pipelines" keywords matching your target position requirements.',
      icon: 'key',
      iconBg: 'bg-tertiary/10 text-tertiary hover:bg-tertiary hover:text-white',
    },
    {
      id: 3,
      title: 'Formatting Layout Alignment',
      desc: 'Ensure your section headers use single-column tables or simple paragraph breaks. Multi-column divs can parse incorrectly.',
      icon: 'grid_view',
      iconBg: 'bg-secondary/10 text-secondary hover:bg-secondary hover:text-white',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="font-headline text-2xl font-bold text-on-surface">ATS Optimization Dashboard</h2>
          <p className="text-sm text-on-surface-variant">Real-time analysis of your resume against industry-standard parsing algorithms.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-outline-variant/50 rounded-lg hover:bg-surface-container transition-colors font-semibold text-xs cursor-pointer">
            <span className="material-symbols-outlined text-[16px]">file_upload</span>
            Update Resume
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity font-semibold text-xs cursor-pointer">
            <span className="material-symbols-outlined text-[16px]">download</span>
            Export PDF
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* ATS Score Main Card */}
        <div className="col-span-12 lg:col-span-5">
          <div className="glass-card rounded-xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group h-full">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-6">Overall Match Score</h3>
            
            {/* Circular Score */}
            <div className="relative w-56 h-56 flex items-center justify-center mb-6">
              <svg className="w-full h-full transform -rotate-90">
                <circle className="text-surface-container" cx="50%" cy="50%" r="100" fill="transparent" stroke="currentColor" strokeWidth="10"></circle>
                <circle 
                  className="text-primary transition-all duration-100 ease-out" 
                  cx="50%" cy="50%" r="100" fill="transparent" stroke="currentColor" strokeWidth="10" 
                  strokeDasharray={circumference} 
                  strokeDashoffset={strokeDashoffset} 
                  strokeLinecap="round"
                ></circle>
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-6xl font-extrabold text-primary leading-none">{score}</span>
                <span className="text-sm text-on-surface-variant font-bold mt-1">/ 100</span>
              </div>
              <div className="absolute w-40 h-40 bg-primary/5 rounded-full blur-2xl animate-pulse pointer-events-none"></div>
            </div>

            <div className="bg-success-container/10 px-4 py-2 rounded-full border border-primary/20 flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
              <span className="text-primary font-bold text-xs">Strong Competitor Rank</span>
            </div>
            
            <p className="text-xs text-on-surface-variant max-w-xs leading-relaxed">
              Your resume is highly optimized for technical roles. Improving <span className="font-bold text-on-surface">Experience phrasing</span> could boost you to the top 2%.
            </p>
          </div>
        </div>

        {/* AI Improvement Tips (Bento Top) */}
        <div className="col-span-12 lg:col-span-7">
          <div className="glass-card rounded-xl p-6 ai-pulse-bar h-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">auto_awesome</span>
                <h3 className="font-headline text-lg font-bold text-on-surface">AI Improvement Tips</h3>
              </div>
              <span className="text-[10px] font-bold text-on-surface-variant bg-surface-container px-3 py-1 rounded-full uppercase tracking-wider">3 Urgent Tasks</span>
            </div>
            
            <div className="space-y-4">
              {tips.map((tip) => (
                <div
                  key={tip.id}
                  className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 hover:scale-[1.01] transition-transform cursor-pointer group"
                >
                  <div className="flex gap-4">
                    <div className={`p-3 rounded-lg h-fit transition-colors ${tip.iconBg}`}>
                      <span className="material-symbols-outlined">{tip.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-on-surface text-sm">{tip.title}</h4>
                      <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">{tip.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ATSScore;
