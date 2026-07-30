import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './pages/Login';
import LoginV2 from './pages/LoginV2';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import SkillGapAnalyzer from './pages/SkillGapAnalyzer';
import AICareerMentor from './pages/AICareerMentor';
import CareerPrediction from './pages/CareerPrediction';
import ATSScore from './pages/ATSScore';
import LogoView from './pages/LogoView';
import Placeholder from './pages/Placeholder';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

const ShellLayout = () => {
  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <Header />
      <main className="ml-64 pt-[104px] lg:pt-[112px] p-6 lg:p-8 min-h-screen bg-surface">
        <div className="max-w-[1280px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/login-v2" element={<LoginV2 />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Dashboard and main pages inside shell */}
          <Route element={<ProtectedRoute />}>
            <Route element={<ShellLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/:resumeId" element={<Dashboard />} />
              <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
              <Route path="/resume-analyzer/:resumeId" element={<ResumeAnalyzer />} />
              <Route path="/skill-gap-analyzer" element={<SkillGapAnalyzer />} />
              <Route path="/skill-gap-analyzer/:resumeId" element={<SkillGapAnalyzer />} />
              <Route path="/ai-career-mentor" element={<AICareerMentor />} />
              <Route path="/ai-career-mentor/:resumeId" element={<AICareerMentor />} />
              <Route path="/career-prediction" element={<CareerPrediction />} />
              <Route path="/career-prediction/:resumeId" element={<CareerPrediction />} />
              <Route path="/ats-score" element={<ATSScore />} />
              <Route path="/ats-score/:resumeId" element={<ATSScore />} />
              <Route path="/logo-view" element={<LogoView />} />

              {/* Placeholders for sidebar paths without specialized screens */}
              <Route path="/job-match" element={<Placeholder />} />
              <Route path="/learning-roadmap" element={<Placeholder />} />
              <Route path="/interview-prep" element={<Placeholder />} />
              <Route path="/project-recommender" element={<Placeholder />} />
              <Route path="/certificates" element={<Placeholder />} />
              <Route path="/progress-tracker" element={<Placeholder />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>

          {/* Redirect empty paths to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
