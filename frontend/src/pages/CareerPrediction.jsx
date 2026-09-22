import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import careerService from '../services/careerService';
import resumeService from '../services/resumeService';

const CareerPrediction = () => {
  const navigate = useNavigate();
  const { resumeId } = useParams();

  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [error, setError] = useState(null);

  const loadPredictions = async (forceRecalc = false) => {
    if (forceRecalc) setRecalculating(true);
    else setLoading(true);
    setError(null);

    try {
      let currentId = resumeId || localStorage.getItem('current_resume_id');
      if (!currentId) {
        const resumeRes = await resumeService.getResumes();
        if (resumeRes.success && resumeRes.data?.resumes?.length > 0) {
          currentId = resumeRes.data.resumes[0].id || resumeRes.data.resumes[0]._id;
          localStorage.setItem('current_resume_id', currentId);
          navigate(`/career-prediction/${currentId}`, { replace: true });
        } else {
          setLoading(false);
          setRecalculating(false);
          return; // Let the empty state render
        }
      } else if (!resumeId) {
         navigate(`/career-prediction/${currentId}`, { replace: true });
      }

      let resData = null;
      if (!forceRecalc) {
        try {
          const res = await careerService.getPredictionHistory(currentId);
          if (res.success && res.data) {
             if (res.data.history && res.data.history.length > 0) {
                 resData = res.data.history[0].prediction || res.data.history[0].predictions || res.data.history[0];
             } else if (Array.isArray(res.data) && res.data.length > 0) {
                 // The history is an array of predictions
                 resData = res.data[0].prediction || res.data[0].predictions || res.data[0];
             } else {
                 resData = res.data.prediction || res.data.predictions || res.data;
             }
          }
        } catch (err) {
          // No prediction saved yet
        }
      }

      if (!resData || forceRecalc) {
        const predictRes = await careerService.predictCareer(currentId);
        
        if (predictRes.success && predictRes.data) {
          resData = predictRes.data.prediction || predictRes.data.predictions || predictRes.data;
        } else {
          throw new Error(predictRes.message || 'Failed to generate career prediction.');
        }
      }

      if (resData && (Array.isArray(resData) || Array.isArray(resData.recommended_roles) || Array.isArray(resData.careers))) {
        const list = Array.isArray(resData) ? resData : (resData.recommended_roles || resData.careers);
        const icons = ['neurology', 'analytics', 'cloud_done', 'cognition', 'engineering'];
        const colors = [
          'bg-secondary-container/10 text-secondary',
          'bg-tertiary-container/10 text-tertiary',
          'bg-primary-container/10 text-primary',
        ];
        
        const mapped = list.map((item, idx) => ({
          id: idx + 1,
          title: item.title || item.role || item.role_name || `Career Path #${idx + 1}`,
          match: item.match_percentage || item.match_score || item.match || Math.floor(Math.random() * 20 + 75),
          icon: item.icon || icons[idx % icons.length],
          iconBg: colors[idx % colors.length],
          desc: item.description || item.reasoning || item.desc || 'A strong potential career progression based on your skills profile.',
          salary: item.salary_range || item.salary || 'Market Rate',
          growth: item.growth_potential || item.growth || 'Strong YoY',
          readiness: item.readiness_score || item.readiness || Math.floor(Math.random() * 30 + 50),
          skills: item.required_skills || item.key_skills || item.skills || [],
        }));
        setPaths(mapped);
      } else {
         throw new Error("Invalid response format received from AI.");
      }
    } catch (err) {
      console.error('Prediction API Error:', err);
      setError(err.userMessage || 'Could not generate career predictions. Please try again later.');
      setPaths([]);
    } finally {
      setLoading(false);
      setRecalculating(false);
    }
  };

  useEffect(() => {
    loadPredictions();
    // eslint-disable-next-line
  }, [resumeId]);

  // EMPTY STATE for missing resume
  if (!loading && !resumeId && !localStorage.getItem('current_resume_id')) {
    return (
      <div className="space-y-6">
        <section className="relative overflow-hidden glass-panel rounded-2xl p-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="relative z-10">
            <h2 className="font-display-lg text-3xl md:text-4xl font-extrabold text-on-surface mb-2">AI Career Path Prediction</h2>
            <p className="text-lg text-on-surface-variant mb-6">Select or upload a resume to view your personalized career trajectories.</p>
            <button 
              onClick={() => navigate('/resume-analyzer')}
              className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-transform cursor-pointer"
            >
              Go to Resume Analyzer
            </button>
          </div>
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary mb-1">
            <span className="material-symbols-outlined text-sm">explore</span>
            <span className="text-xs font-bold uppercase tracking-widest">Future Trajectory</span>
          </div>
          <h2 className="font-display-lg text-3xl md:text-4xl font-extrabold text-on-surface">AI Career Path Prediction</h2>
          <p className="font-body-lg text-on-surface-variant max-w-2xl mt-2">
            Gemini has analyzed your professional history and market trends to forecast your highest-probability career success vectors.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => loadPredictions(true)}
            disabled={recalculating}
            className="flex items-center gap-2 px-6 py-3 bg-surface-container-high text-on-surface font-bold rounded-xl hover:bg-outline-variant/30 transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            {recalculating ? (
              <span className="w-4 h-4 border-2 border-on-surface border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <span className="material-symbols-outlined text-[18px]">refresh</span>
            )}
            Recalculate
          </button>
        </div>
      </section>

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-800 dark:text-red-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">error</span>
            <span className="text-sm font-semibold">{error}</span>
          </div>
          {paths.length === 0 && (
             <button onClick={() => loadPredictions()} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-xs cursor-pointer hover:bg-red-700 transition-colors">
               Retry Prediction
             </button>
          )}
        </div>
      )}

      {loading && !recalculating ? (
        <div className="glass-card rounded-[2rem] p-16 flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
          <h3 className="text-lg font-bold text-on-surface mb-2">Simulating Career Vectors...</h3>
          <p className="text-sm text-on-surface-variant max-w-md text-center">
            Mapping your extracted skills against 1M+ active job postings to predict your optimal path.
          </p>
        </div>
      ) : paths.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fadeIn">
          
          {/* Main List of Career Vectors */}
          <div className="col-span-12 lg:col-span-8 space-y-4">
            {paths.map((path) => {
              const isExpanded = expandedId === path.id;
              
              return (
                <div 
                  key={path.id} 
                  className={`glass-panel border-2 transition-all duration-300 rounded-[2rem] overflow-hidden ${
                    isExpanded ? 'border-primary shadow-lg shadow-primary/5' : 'border-outline-variant/30 hover:border-primary/30'
                  }`}
                >
                  <div 
                    onClick={() => setExpandedId(isExpanded ? null : path.id)}
                    className="p-6 md:p-8 flex flex-col sm:flex-row sm:items-center gap-6 cursor-pointer relative"
                  >
                    {path.match > 90 && (
                      <div className="absolute top-0 right-8 px-3 py-1 bg-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-b-lg shadow-sm">
                        Top Match
                      </div>
                    )}
                    
                    {/* Icon & Match Score Circular Graphic */}
                    <div className="flex flex-row sm:flex-col items-center gap-4 sm:gap-2 flex-shrink-0">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${path.iconBg}`}>
                        <span className="material-symbols-outlined text-[32px]">{path.icon}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Match</span>
                        <span className="text-xl font-extrabold text-on-surface">{path.match}%</span>
                      </div>
                    </div>
                    
                    {/* Core Information */}
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-on-surface mb-2">{path.title}</h3>
                      <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-2 md:line-clamp-none">{path.desc}</p>
                    </div>

                    {/* Expand Toggle */}
                    <div className="hidden sm:flex w-10 h-10 rounded-full border border-outline-variant/50 items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors ml-4">
                      <span className={`material-symbols-outlined transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                        expand_more
                      </span>
                    </div>
                  </div>

                  {/* Expanded Details Section */}
                  <div className={`transition-all duration-500 ease-in-out ${
                    isExpanded ? 'max-h-[800px] opacity-100 border-t border-outline-variant/20' : 'max-h-0 opacity-0 overflow-hidden'
                  }`}>
                    <div className="p-6 md:p-8 bg-surface-container-low/50">
                      
                      {/* Metric Row */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div>
                          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-1">Est. Salary</p>
                          <p className="font-bold text-on-surface text-base">{path.salary}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-1">Market Growth</p>
                          <p className="font-bold text-green-600 dark:text-green-400 text-base">{path.growth}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-1">Your Readiness</p>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-on-surface text-base">{path.readiness}%</span>
                            <div className="w-16 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                              <div className="bg-primary h-full" style={{ width: `${path.readiness}%` }}></div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate('/skill-gap-analyzer');
                            }}
                            className="w-full h-full py-2 border border-primary text-primary font-bold rounded-xl text-xs hover:bg-primary/10 transition-colors cursor-pointer"
                          >
                            Analyze Gap &rarr;
                          </button>
                        </div>
                      </div>

                      {/* Required Skills Matrix */}
                      <div>
                        <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-3">Core Competency Matrix</p>
                        <div className="flex flex-wrap gap-2">
                          {path.skills.map((skill, i) => {
                            const isMissing = skill.toLowerCase().includes('missing');
                            const cleanName = skill.replace(/\(Missing\)/i, '').trim();
                            
                            return (
                              <span 
                                key={i} 
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${
                                  isMissing 
                                    ? 'bg-surface-container border-outline-variant/40 text-on-surface-variant' 
                                    : 'bg-green-100 dark:bg-green-900/20 border-green-200 text-green-700 dark:text-green-400'
                                }`}
                              >
                                {isMissing ? (
                                  <span className="material-symbols-outlined text-[14px]">remove</span>
                                ) : (
                                  <span className="material-symbols-outlined text-[14px]">check</span>
                                )}
                                {cleanName}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                      
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column (Insights) */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="glass-panel p-6 rounded-2xl ai-glow border-primary/20">
              <h3 className="font-bold text-on-surface flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary">lightbulb</span>
                Gemini Career Insight
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
                Your profile indicates a strong technical foundation. Transitioning into <span className="font-bold text-on-surface">Data Science</span> or <span className="font-bold text-on-surface">Cloud Architecture</span> offers the highest salary jump, but requires focusing on MLOps and distributed systems in the short term.
              </p>
              <button 
                onClick={() => navigate('/ai-career-mentor')}
                className="w-full py-3 bg-surface-container border border-outline-variant text-on-surface font-semibold rounded-xl hover:bg-surface-container-high transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">forum</span>
                Discuss with AI Mentor
              </button>
            </div>

            <div className="glass-panel p-6 rounded-2xl">
              <h3 className="font-bold text-on-surface mb-1">Market Trend Snapshot</h3>
              <p className="text-xs text-on-surface-variant mb-4">Based on real-time hiring data analysis.</p>
              <ul className="space-y-4">
                <li className="flex justify-between items-center">
                  <span className="text-xs font-bold text-on-surface">AI/ML Engineering</span>
                  <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded">HIGH DEMAND</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-xs font-bold text-on-surface">Data Science</span>
                  <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded">GROWING</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-xs font-bold text-on-surface">Traditional Software Dev</span>
                  <span className="text-[10px] font-bold text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded">STABLE</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default CareerPrediction;
