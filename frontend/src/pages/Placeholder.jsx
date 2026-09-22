import React from 'react';
import { useLocation } from 'react-router-dom';

const Placeholder = () => {
  const location = useLocation();
  
  // Format pathname to display as page title
  const rawPath = location.pathname.substring(1);
  const title = rawPath
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div className="space-y-6">
      {/* Welcome Hero */}
      <section className="relative overflow-hidden glass-panel rounded-2xl p-8 flex flex-col items-center justify-center text-center py-16 gap-6 min-h-[400px] ai-glow">
        <div className="w-16 h-16 bg-primary-container/10 rounded-full flex items-center justify-center mb-2 animate-float">
          <span className="material-symbols-outlined text-primary text-[36px]">auto_awesome</span>
        </div>
        <div className="space-y-2 max-w-lg">
          <h2 className="font-display-lg text-2xl md:text-3xl font-extrabold text-on-surface">{title}</h2>
          <p className="text-on-surface-variant font-body-md leading-relaxed text-sm md:text-base">
            This module is being optimized by the CareerOS AI engine to fit your profile trajectory. We are benchmarking role criteria to provide quantified insights.
          </p>
        </div>
        <div className="flex gap-4 mt-2">
          <button className="px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-semibold shadow-md cursor-pointer hover:bg-primary/95 transition-all">
            Unlock Premium Analysis
          </button>
          <button className="px-6 py-2.5 border border-outline-variant rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-slate-50 cursor-pointer transition-all">
            Review Documentation
          </button>
        </div>
        {/* Subtle background decoration */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-secondary/5 rounded-full blur-2xl pointer-events-none"></div>
      </section>
    </div>
  );
};

export default Placeholder;
