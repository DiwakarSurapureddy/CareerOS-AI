import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { name: 'Resume Analyzer', path: '/resume-analyzer', icon: 'description' },
    { name: 'Skill Gap Analyzer', path: '/skill-gap-analyzer', icon: 'analytics' },
    { name: 'AI Career Mentor', path: '/ai-career-mentor', icon: 'psychology' },
    { name: 'Career Prediction', path: '/career-prediction', icon: 'insights' },
    { name: 'ATS Score', path: '/ats-score', icon: 'query_stats' },
    { name: 'CareerOS AI Logo', path: '/logo-view', icon: 'auto_awesome_motion' },
  ];

  return (
    <aside className="w-64 h-full fixed left-0 top-0 border-r border-outline-variant/30 bg-white/80 backdrop-blur-md shadow-sm flex flex-col py-md px-sm overflow-y-auto z-50">
      <div className="mb-xl px-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg">
          <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
        </div>
        <div>
          <h1 className="font-display-lg text-headline-md font-bold text-primary">CareerOS AI</h1>
          <p className="text-[10px] uppercase tracking-widest text-outline">Professional Copilot</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 custom-scrollbar">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 transition-all duration-200 ease-in-out hover:scale-[1.02] active:scale-95 group ${
                isActive
                  ? 'bg-primary-container text-on-primary-container rounded-lg border-l-2 border-primary font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-high rounded-lg'
              }`
            }
          >
            <span className="material-symbols-outlined transition-colors group-hover:text-primary">
              {item.icon}
            </span>
            <span className="font-body-md text-body-md">{item.name}</span>
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto pt-md border-t border-outline-variant/30">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 transition-colors ${
              isActive ? 'text-primary font-semibold' : 'text-on-surface-variant hover:bg-surface-container-high rounded-lg'
            }`
          }
        >
          <span className="material-symbols-outlined">account_circle</span>
          <span className="font-body-md text-body-md">Profile</span>
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 transition-colors ${
              isActive ? 'text-primary font-semibold' : 'text-on-surface-variant hover:bg-surface-container-high rounded-lg'
            }`
          }
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="font-body-md text-body-md">Settings</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
