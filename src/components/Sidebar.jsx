import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const location = useLocation();
  const pathParts = location.pathname.split('/');
  
  // Extract resumeId from URL or fallback to local storage
  let currentResumeId = null;
  if (pathParts.length > 2 && pathParts[2] && pathParts[2] !== '') {
    currentResumeId = pathParts[2];
  } else {
    currentResumeId = localStorage.getItem('current_resume_id');
  }

  const getPath = (basePath) => {
    // We do not append resumeId to generic non-resume-specific routes like LogoView if they shouldn't have one,
    // but the task states all these should maintain the selected resume context.
    // The routes we updated in App.jsx all support /:resumeId
    if (basePath === '/logo-view') return basePath;
    return currentResumeId ? `${basePath}/${currentResumeId}` : basePath;
  };

  const menuItems = [
    { name: 'Dashboard', path: getPath('/dashboard'), icon: 'dashboard' },
    { name: 'Import Resume', path: getPath('/resume-analyzer'), icon: 'description' },
    { name: 'Skill Gap Analyzer', path: getPath('/skill-gap-analyzer'), icon: 'analytics' },
    { name: 'AI Career Mentor', path: getPath('/ai-career-mentor'), icon: 'psychology' },
    { name: 'Career Prediction', path: getPath('/career-prediction'), icon: 'insights' },
    { name: 'ATS Score', path: getPath('/ats-score'), icon: 'query_stats' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 h-full fixed left-0 top-0 border-r border-outline-variant/30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm flex flex-col py-6 px-4 overflow-y-auto z-50 transition-colors">
      <NavLink to="/dashboard" className="h-12 mb-10 px-2 flex items-center gap-3 hover:opacity-80 transition-opacity">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-md">
          <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-primary tracking-tight">CareerOS AI</h1>
        </div>
      </NavLink>
      
      <nav className="flex-1 space-y-2 custom-scrollbar">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3.5 transition-all duration-200 ease-in-out group rounded-xl ${
                isActive
                  ? 'bg-primary/10 text-primary font-bold'
                  : 'text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface'
              }`
            }
          >
            <span className="material-symbols-outlined transition-colors group-hover:text-primary">
              {item.icon}
            </span>
            <span className="text-sm">{item.name}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="mt-auto pt-6 border-t border-outline-variant/30 space-y-1">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 transition-colors rounded-xl ${
              isActive ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface'
            }`
          }
        >
          <span className="material-symbols-outlined">account_circle</span>
          <span className="text-sm font-medium">Profile</span>
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 transition-colors rounded-xl ${
              isActive ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface'
            }`
          }
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="text-sm font-medium">Settings</span>
        </NavLink>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 rounded-xl transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
