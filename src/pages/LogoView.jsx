import React from 'react';

const LogoView = () => {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h2 className="font-headline text-2xl font-bold text-on-surface">CareerOS AI Logo Design</h2>
        <p className="font-body-md text-on-surface-variant max-w-2xl">
          Visual brand identity specifications for the CareerOS AI Copilot. Built with strict geometric roundness, vibrant contrast, and optical balance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Logo Primary Blue */}
        <div className="glass-card p-8 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 hover:scale-[1.01] transition-transform">
          <span className="text-[10px] font-bold tracking-widest text-outline uppercase">Primary Brand Logo</span>
          <div className="w-24 h-24 bg-primary rounded-[24px] flex items-center justify-center text-white shadow-xl hover:rotate-6 transition-transform cursor-pointer">
            <span className="material-symbols-outlined text-[64px]" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
          </div>
          <p className="font-bold text-on-surface text-sm">Deep Blue Primary</p>
          <code className="text-xs bg-slate-100 px-2.5 py-1 rounded">#004ac6</code>
        </div>

        {/* Card 2: Logo Secondary Purple */}
        <div className="glass-card p-8 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 hover:scale-[1.01] transition-transform">
          <span className="text-[10px] font-bold tracking-widest text-outline uppercase">AI Glow Variant</span>
          <div className="w-24 h-24 bg-gradient-to-tr from-primary to-secondary rounded-[24px] flex items-center justify-center text-white shadow-xl hover:scale-105 transition-transform cursor-pointer">
            <span className="material-symbols-outlined text-[64px]" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
          </div>
          <p className="font-bold text-on-surface text-sm">AI Power Gradient</p>
          <code className="text-xs bg-slate-100 px-2.5 py-1 rounded">#004ac6 → #712ae2</code>
        </div>

        {/* Card 3: Logo Dark Mode */}
        <div className="glass-card p-8 rounded-2xl bg-inverse-surface flex flex-col items-center justify-center text-center space-y-4 hover:scale-[1.01] transition-transform">
          <span className="text-[10px] font-bold tracking-widest text-white/50 uppercase">Inverse Dark Variant</span>
          <div className="w-24 h-24 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[24px] flex items-center justify-center text-white shadow-xl hover:-rotate-6 transition-transform cursor-pointer">
            <span className="material-symbols-outlined text-[64px]" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
          </div>
          <p className="font-bold text-white text-sm">Glassmorphic Dark</p>
          <code className="text-xs bg-white/5 text-white/70 px-2.5 py-1 rounded border border-white/10">rgba(255,255,255,0.1)</code>
        </div>
      </div>

      {/* Brand Specifications */}
      <section className="glass-panel p-6 rounded-2xl space-y-6">
        <h3 className="font-headline text-lg font-bold text-on-surface">Design Philosophy & Anatomy</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="space-y-2">
            <h4 className="font-bold text-primary">Symbolism</h4>
            <p className="text-on-surface-variant leading-relaxed text-xs">
              The brain icon (psychology symbol) represents intelligent automation, career strategy, and cognitive guidance. The geometric roundness reflects an approachable, human-centric design.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-primary">Typography</h4>
            <p className="text-on-surface-variant leading-relaxed text-xs">
              Built with **Inter Font Family** using tight letter-spacing for headings to maintain a modern, systematic developer tool appearance.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-primary">Color Balance</h4>
            <p className="text-on-surface-variant leading-relaxed text-xs">
              Primary brand blue enforces technical authority. Accent purple signifies AI power and intelligence. Surface low-contrast slate provides readability.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LogoView;
