import React, { useState, useEffect } from 'react';

const Settings = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    weeklyReport: true
  });

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

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2">
        <h2 className="font-display-lg text-3xl font-extrabold text-on-surface">Settings</h2>
        <p className="font-body-md text-on-surface-variant">Manage your account preferences, notifications, and application theme.</p>
      </div>

      <div className="space-y-6">
        {/* Theme Settings */}
        <section className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center gap-3 border-b border-outline-variant/30 pb-4 mb-4">
            <span className="material-symbols-outlined text-primary text-[24px]">palette</span>
            <h3 className="font-bold text-lg text-on-surface">Appearance</h3>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-on-surface">Dark Mode</p>
              <p className="text-sm text-on-surface-variant mt-1">Adjust the appearance of CareerOS to reduce glare.</p>
            </div>
            <button 
              onClick={toggleTheme}
              className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors ${theme === 'dark' ? 'bg-primary' : 'bg-surface-container-highest'}`}
            >
              <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </button>
          </div>
        </section>

        {/* Notification Settings */}
        <section className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center gap-3 border-b border-outline-variant/30 pb-4 mb-4">
            <span className="material-symbols-outlined text-secondary text-[24px]">notifications</span>
            <h3 className="font-bold text-lg text-on-surface">Notifications</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-on-surface">Email Alerts</p>
                <p className="text-sm text-on-surface-variant mt-1">Receive updates on job matches and resume tips via email.</p>
              </div>
              <button 
                onClick={() => handleNotificationChange('email')}
                className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors ${notifications.email ? 'bg-secondary' : 'bg-surface-container-highest'}`}
              >
                <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${notifications.email ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-on-surface">Push Notifications</p>
                <p className="text-sm text-on-surface-variant mt-1">Get real-time alerts in your browser.</p>
              </div>
              <button 
                onClick={() => handleNotificationChange('push')}
                className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors ${notifications.push ? 'bg-secondary' : 'bg-surface-container-highest'}`}
              >
                <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${notifications.push ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-on-surface">Weekly Report</p>
                <p className="text-sm text-on-surface-variant mt-1">Receive a weekly digest of your learning progress.</p>
              </div>
              <button 
                onClick={() => handleNotificationChange('weeklyReport')}
                className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors ${notifications.weeklyReport ? 'bg-secondary' : 'bg-surface-container-highest'}`}
              >
                <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${notifications.weeklyReport ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </button>
            </div>
          </div>
        </section>

        {/* Account Settings */}
        <section className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center gap-3 border-b border-outline-variant/30 pb-4 mb-4">
            <span className="material-symbols-outlined text-error text-[24px]">manage_accounts</span>
            <h3 className="font-bold text-lg text-on-surface">Account Management</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-on-surface">Export Data</p>
                <p className="text-sm text-on-surface-variant mt-1">Download all your parsed resume and skill gap data.</p>
              </div>
              <button className="px-4 py-2 border border-outline-variant/50 rounded-lg text-sm font-semibold hover:bg-surface-container-high transition-colors cursor-pointer">
                Download JSON
              </button>
            </div>
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-error/10">
              <div>
                <p className="font-semibold text-error">Danger Zone</p>
                <p className="text-sm text-on-surface-variant mt-1">Permanently delete your account and data.</p>
              </div>
              <button className="px-4 py-2 bg-error text-white rounded-lg text-sm font-semibold hover:bg-error/90 transition-colors shadow-sm cursor-pointer">
                Delete Account
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;
