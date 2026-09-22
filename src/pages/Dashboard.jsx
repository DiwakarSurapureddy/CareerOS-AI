import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import resumeService from '../services/resumeService';
import DocumentViewer from '../components/DocumentViewer';

const API_DOMAIN = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace('/api', '');
const getFullAvatarUrl = (path) => path ? (path.startsWith('http') ? path : `${API_DOMAIN}${path}`) : null;

const Dashboard = () => {
  const navigate = useNavigate();
  const { resumeId } = useParams();
  const { currentUser, loading: authLoading } = useAuth();
  
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        let currentId = resumeId || localStorage.getItem('current_resume_id');
        
        // If no active ID, check if user has any resumes
        if (!currentId) {
          const res = await resumeService.getResumes();
          if (res.success && res.data?.resumes?.length > 0) {
            currentId = res.data.resumes[0].id || res.data.resumes[0]._id;
            localStorage.setItem('current_resume_id', currentId);
            navigate(`/dashboard/${currentId}`, { replace: true });
            return;
          } else {
            setLoading(false);
            return; // Show empty state
          }
        }
        
        if (currentId && !resumeId) {
           navigate(`/dashboard/${currentId}`, { replace: true });
           return;
        }

        const data = await resumeService.getResume(currentId);
        if (data.success && data.data) {
          setResumeData(data.data);
          localStorage.setItem('current_resume_id', currentId); // Ensure local storage is in sync
        } else {
           throw new Error(data.message || 'Resume not found.');
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError(err.userMessage || 'Unable to load this resume.');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchDashboardData();
    }
  }, [authLoading, resumeId, navigate]);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const userInitials = currentUser?.name ? getInitials(currentUser.name) : 'U';

  // Helper for safe nested properties
  const parsed = resumeData?.parsed_data || {};
  const candidateName = parsed?.name || currentUser?.name || (currentUser?.email ? currentUser.email.split('@')[0] : '') || 'Not available';

  let welcomeMessage = "Welcome back 👋";
  if (parsed?.name) {
    welcomeMessage = `Welcome back, ${parsed.name} 👋`;
  } else if (currentUser?.name) {
    welcomeMessage = `Welcome back, ${currentUser.name} 👋`;
  } else if (currentUser?.email) {
    welcomeMessage = `Welcome back, ${currentUser.email.split('@')[0]} 👋`;
  }

  // Display professional empty state if no resume
  if (!loading && !resumeData && !error) {
    return (
      <div className="space-y-6">
        <section className="relative overflow-hidden glass-panel rounded-2xl p-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="relative z-10">
            <h2 className="font-display-lg text-3xl md:text-4xl font-extrabold text-on-surface mb-2">{welcomeMessage}</h2>
            <p className="text-lg text-on-surface-variant">No resume uploaded yet.</p>
            <p className="text-sm text-on-surface-variant/80 mt-1 mb-6">Upload your resume to unlock personalized AI career insights.</p>
            <button 
              onClick={() => navigate('/resume-analyzer')}
              className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-transform cursor-pointer"
            >
              Upload Resume
            </button>
          </div>
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-secondary/5 rounded-full blur-2xl"></div>
        </section>
      </div>
    );
  }

  if (error) {
     return (
       <div className="space-y-6">
         <section className="relative overflow-hidden glass-panel rounded-2xl p-8 text-center flex flex-col items-center gap-4">
           <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center text-error mb-2">
             <span className="material-symbols-outlined text-3xl">error</span>
           </div>
           <h2 className="font-display-lg text-2xl font-bold text-on-surface">Resume not found</h2>
           <p className="text-on-surface-variant max-w-md">{error}</p>
           <p className="text-sm text-on-surface-variant/80 mb-2">Please try again or select another resume.</p>
           
           <div className="flex gap-4">
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 bg-surface text-on-surface border border-outline-variant font-bold rounded-xl shadow-sm hover:bg-surface-container-high transition-transform cursor-pointer"
              >
                Retry
              </button>
              <button 
                onClick={() => navigate('/resume-analyzer')}
                className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-transform cursor-pointer"
              >
                Back to Resume Analyzer
              </button>
           </div>
         </section>
       </div>
     );
  }
   const renderSkills = () => {
      const rawSkills = Array.isArray(parsed?.skills) ? parsed.skills : [];
      if (rawSkills.length === 0) return <span className="text-sm text-on-surface-variant italic">No skills extracted.</span>;
      
      // Check if it's the categorized format
      if (rawSkills[0] && typeof rawSkills[0] === 'object' && rawSkills[0].category) {
          return (
              <div className="flex flex-col gap-3 w-full">
                 {rawSkills.map((cat, i) => (
                     <div key={i}>
                         <p className="text-xs font-bold text-on-surface-variant mb-1">{cat.category}</p>
                         <div className="flex flex-wrap gap-1.5">
                             {(cat.items || []).map((skill, j) => (
                                 <span key={j} className="px-2 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-bold border border-primary/20">
                                     {skill}
                                 </span>
                             ))}
                         </div>
                     </div>
                 ))}
              </div>
          );
      }
      
      // Fallback to flat list
      return (
          <div className="flex flex-wrap gap-1.5">
             {rawSkills.slice(0, 15).map((skill, i) => {
                 const skillName = typeof skill === 'string' ? skill : (skill.name || skill.skill || '');
                 if (!skillName) return null;
                 return (
                     <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-bold border border-primary/20">
                         {skillName}
                     </span>
                 );
             })}
             {rawSkills.length > 15 && (
                <span className="px-2 py-0.5 bg-surface-container text-on-surface-variant rounded text-[10px] font-bold">
                  +{rawSkills.length - 15} more
                </span>
             )}
          </div>
      )
   };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Hero Welcome */}
      <section className="relative overflow-hidden glass-panel rounded-2xl p-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="relative z-10 text-center md:text-left">
          <h2 className="font-display-lg text-3xl md:text-4xl font-extrabold text-on-surface mb-2">{welcomeMessage}</h2>
          <p className="text-lg text-on-surface-variant">Continue building your career with expert AI guidance.</p>
          {currentUser?.email && (
            <p className="text-sm text-on-surface-variant/80 mt-1">{currentUser.email}</p>
          )}
        </div>
        <div className="relative z-10 flex items-center gap-4 bg-surface/50 p-4 rounded-xl border border-outline-variant/30 backdrop-blur-sm">
          <div className="flex -space-x-2">
            {currentUser?.profile_image ? (
              <img 
                src={getFullAvatarUrl(currentUser.profile_image)} 
                alt="Profile"
                className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm z-10"
              />
            ) : (
              <div className="w-10 h-10 rounded-full border-2 border-white bg-primary flex items-center justify-center text-white text-[12px] font-bold z-10">{userInitials}</div>
            )}
            <div className="w-10 h-10 rounded-full border-2 border-white bg-secondary flex items-center justify-center text-white text-[12px] font-bold relative z-0">AI</div>
          </div>
          <div className="text-sm text-on-surface-variant flex flex-col">
            <span className="font-bold text-primary">Currently Analyzing:</span>
            {loading ? (
                <div className="w-24 h-4 bg-surface-variant rounded animate-pulse mt-1"></div>
            ) : (
                <span className="font-medium truncate max-w-[200px]" title={resumeData?.filename}>
                   {resumeData?.filename || 'Unknown File'}
                </span>
            )}
          </div>
          <button 
             onClick={() => navigate('/resume-analyzer')}
             className="ml-2 w-8 h-8 rounded-full hover:bg-surface-variant/50 flex items-center justify-center transition-colors group cursor-pointer"
             title="Change Resume"
          >
             <span className="material-symbols-outlined text-[18px] text-on-surface-variant group-hover:text-primary">swap_horiz</span>
          </button>
        </div>
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-secondary/5 rounded-full blur-2xl"></div>
      </section>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <h3 className="font-bold text-on-surface text-lg">Loading your resume analysis...</h3>
            <p className="text-on-surface-variant text-sm mt-1">Fetching metrics and extracting skills.</p>
        </div>
      ) : (
      <>
        {/* Quick Actions Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => navigate('/resume-analyzer')}
            className="glass-panel p-6 rounded-2xl flex items-center gap-6 group hover:bg-primary transition-all duration-300 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <span className="material-symbols-outlined text-primary group-hover:text-white transition-colors">upload_file</span>
            </div>
            <div className="text-left">
              <p className="font-bold text-on-surface group-hover:text-white transition-colors">Upload / Manage Resume</p>
              <p className="text-xs text-on-surface-variant group-hover:text-white/80 transition-colors">Upload or change context</p>
            </div>
          </button>
          <button
            onClick={() => navigate(`/ats-score/${resumeId}`)}
            className="glass-panel p-6 rounded-2xl flex items-center gap-6 group hover:bg-secondary transition-all duration-300 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <span className="material-symbols-outlined text-secondary group-hover:text-white transition-colors">query_stats</span>
            </div>
            <div className="text-left">
              <p className="font-bold text-on-surface group-hover:text-white transition-colors">ATS Score</p>
              <p className="text-xs text-on-surface-variant group-hover:text-white/80 transition-colors">Analyze Resume ATS Compatibility</p>
            </div>
          </button>
          <button
            onClick={() => navigate(`/ai-career-mentor/${resumeId}`)}
            className="glass-panel p-6 rounded-2xl flex items-center gap-6 group hover:bg-inverse-surface transition-all duration-300 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-inverse-surface/5 flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <span className="material-symbols-outlined text-on-surface group-hover:text-white transition-colors">forum</span>
            </div>
            <div className="text-left">
              <p className="font-bold text-on-surface group-hover:text-white transition-colors">Chat with AI</p>
              <p className="text-xs text-on-surface-variant group-hover:text-white/80 transition-colors">Get instant career advice</p>
            </div>
          </button>
        </section>

        {/* Main Stats / Resume Snapshot */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Resume Snapshot */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-6 border-b border-outline-variant/30 pb-4">
              <span className="material-symbols-outlined text-primary">contact_page</span>
              <h4 className="text-lg font-bold text-on-surface">Resume Snapshot</h4>
            </div>
            
            <div className="space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Candidate</p>
                  <p className="text-sm font-semibold text-on-surface">{candidateName}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Experience</p>
                  <p className="text-sm font-semibold text-on-surface">{(parsed?.experience || []).length === 1 ? '1 Role' : `${(parsed?.experience || []).length} Roles`}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Education</p>
                  <p className="text-sm font-semibold text-on-surface">{(parsed?.education || []).length === 1 ? '1 Degree' : `${(parsed?.education || []).length} Degrees`}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Projects</p>
                  <p className="text-sm font-semibold text-on-surface">{(parsed?.projects || []).length === 1 ? '1 Project' : `${(parsed?.projects || []).length} Projects`}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Certifications</p>
                  {(parsed?.certifications || []).length > 0 ? (
                    <p className="text-sm font-semibold text-on-surface">
                      {(parsed?.certifications || []).length === 1 ? '1 Certification' : `${(parsed?.certifications || []).length} Certifications`}
                    </p>
                  ) : (
                    <div className="flex flex-col mt-0.5">
                      <span className="text-xs text-on-surface-variant italic leading-tight">No certifications detected</span>
                      <span className="text-primary text-[10px] font-bold cursor-pointer hover:underline mt-1 inline-block" onClick={() => navigate('/resume-analyzer')}>
                        Update from Resume
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="pt-2">
                <p className="text-xs text-on-surface-variant uppercase tracking-wider font-bold mb-3">Skills Detected</p>
                {renderSkills()}
              </div>
            </div>
          </div>

          {/* Document Viewer Gateway */}
          <div className="h-full min-h-[500px]">
             <DocumentViewer resume={resumeData} />
          </div>
        </div>
      </>
      )}
    </div>
  );
};

export default Dashboard;
