import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_DOMAIN = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace('/api', '');
const getFullAvatarUrl = (path) => path ? (path.startsWith('http') ? path : `${API_DOMAIN}${path}`) : null;

const Header = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <header className="fixed top-0 right-0 left-64 h-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-outline-variant/30 dark:border-gray-800 shadow-sm z-40 flex justify-end items-center px-lg transition-colors">
      <div className="flex items-center gap-sm">
        <button 
          onClick={toggleTheme}
          className="hover:bg-surface-variant/10 dark:hover:bg-gray-700 rounded-full p-2 transition-all text-on-surface-variant dark:text-gray-300 cursor-pointer"
        >
          <span className="material-symbols-outlined">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
        </button>
        <div className="h-8 w-[1px] bg-outline-variant dark:bg-gray-700 mx-2"></div>
        <button 
          onClick={() => navigate('/ai-career-mentor')}
          className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-full font-label-md flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          AI Assistant
        </button>
        {currentUser?.profile_image ? (
          <img
            onClick={() => navigate('/profile')}
            className="w-10 h-10 rounded-full object-cover border-2 border-primary/20 cursor-pointer"
            alt="User Profile"
            src={getFullAvatarUrl(currentUser.profile_image)}
          />
        ) : (
          <div 
            onClick={() => navigate('/profile')}
            className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center border-2 border-primary/20 cursor-pointer text-on-surface-variant"
          >
            <span className="material-symbols-outlined text-[20px]">person</span>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
