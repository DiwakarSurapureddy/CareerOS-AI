import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import atsService from '../services/atsService';
import resumeService from '../services/resumeService';

const ATSScore = () => {
  const navigate = useNavigate();
  const { resumeId } = useParams();
  
  const [score, setScore] = useState(0);
  const [targetScore, setTargetScore] = useState(0);
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const fetchOrAnalyzeATS = async () => {
    setLoading(true);
    setError(null);
    try {
      let currentId = resumeId || localStorage.getItem('current_resume_id');
      if (!currentId) {
        // If no active resume ID in storage, check if user has uploaded resumes
        const resumeRes = await resumeService.getResumes();
        if (resumeRes.success && resumeRes.data?.resumes?.length > 0) {
          currentId = resumeRes.data.resumes[0].id || resumeRes.data.resumes[0]._id;
          localStorage.setItem('current_resume_id', currentId);
          navigate(`/ats-score/${currentId}`, { replace: true });
        } else {
          setLoading(false);
          return; // Let the empty state render
        }
      } else if (!resumeId) {
         navigate(`/ats-score/${currentId}`, { replace: true });
      }

      // Try getting existing analysis or trigger a new analysis
      let data = null;
      try {
        const res = await atsService.getATSByResume(currentId);
        if (res.success && res.data) {
          if (res.data.history && res.data.history.length > 0) {
            data = res.data.history[0].analysis || res.data.history[0];
          } else if (!res.data.history) {
            data = res.data.analysis || res.data;
          }
        }
      } catch (err) {
        // Analysis might not exist yet; proceed to analyze
      }

      if (!data) {
        setAnalyzing(true);
        const analyzeRes = await atsService.analyzeATS(currentId);
        if (analyzeRes.success && analyzeRes.data) {
          data = analyzeRes.data.analysis || analyzeRes.data;
        } else {
          throw new Error(analyzeRes.message || 'Failed to analyze ATS score.');
        }
      }

      setAnalysisData(data);
      const calcScore = data.overall_score !== undefined ? data.overall_score : (data.ats_score || data.score || data.total_score || 0);
      setTargetScore(Math.round(calcScore));
    } catch (err) {
      console.error('ATS API error:', err);
      setError(err.userMessage || 'Could not generate ATS analysis. Please try again.');
    } finally {
      setLoading(false);
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    fetchOrAnalyzeATS();
    // eslint-disable-next-line
  }, [resumeId]);

  useEffect(() => {
    if (targetScore <= 0 || loading || analyzing) return;
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
  }, [targetScore, loading, analyzing]);

  // EMPTY STATE for missing resume
  if (!loading && !resumeId && !localStorage.getItem('current_resume_id')) {
    return (
      <div className="space-y-6">
        <section className="relative overflow-hidden glass-panel rounded-2xl p-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="relative z-10">
            <h2 className="font-display-lg text-3xl md:text-4xl font-extrabold text-on-surface mb-2">ATS Optimization Dashboard</h2>
            <p className="text-lg text-on-surface-variant mb-6">Select or upload a resume to view your ATS parse readiness.</p>
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

  const circumference = 2 * Math.PI * 100;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Derive tips from API breakdown or recommendations
  const rawTips = analysisData?.suggestions || analysisData?.recommendations || analysisData?.improvements || [];

  const tips = rawTips.map((t, index) => {
    if (typeof t === 'string') {
      const icons = ['trending_up', 'key', 'grid_view', 'auto_awesome'];
      const colors = [
        'bg-primary/10 text-primary hover:bg-primary hover:text-white',
        'bg-tertiary/10 text-tertiary hover:bg-tertiary hover:text-white',
        'bg-secondary/10 text-secondary hover:bg-secondary hover:text-white'
      ];
      return {
        id: index + 1,
        title: `Optimization Suggestion #${index + 1}`,
        desc: t,
        icon: icons[index % icons.length],
        iconBg: colors[index % colors.length]
      };
    }
    return {
      id: index + 1,
      title: t.title || t.category || `Improvement Area #${index + 1}`,
      desc: t.desc || t.suggestion || t.description || JSON.stringify(t),
      icon: t.icon || 'trending_up',
      iconBg: t.iconBg || 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
    };
  });

  // Additional match breakdowns if returned by backend
  const keywordMatch = analysisData?.keyword_matching || analysisData?.keyword_match || null;
  const skillsMatch = analysisData?.skills_matching || analysisData?.skills_match || null;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="font-headline text-2xl font-bold text-on-surface">ATS Optimization Dashboard</h2>
          <p className="text-sm text-on-surface-variant">Real-time analysis of your resume against industry-standard parsing algorithms.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/resume-analyzer')}
            className="flex items-center gap-2 px-4 py-2.5 border border-outline-variant/50 rounded-lg hover:bg-surface-container transition-colors font-semibold text-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">file_upload</span>
            Update Resume
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity font-semibold text-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            Export PDF
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
          {!analysisData && (
             <button onClick={fetchOrAnalyzeATS} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-xs cursor-pointer hover:bg-red-700 transition-colors">
               Retry Analysis
             </button>
          )}
        </div>
      )}

      {loading || analyzing ? (
        <div className="glass-card rounded-xl p-16 flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-bold text-on-surface">{analyzing ? 'Evaluating ATS keyword algorithms...' : 'Loading analysis...'}</p>
          <p className="text-xs text-on-surface-variant mt-1">Cross-referencing resume formatting and skill syntax.</p>
        </div>
      ) : analysisData ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch animate-fadeIn">
          {/* ATS Score Main Card */}
          <div className="col-span-12 lg:col-span-5">
            <div className="glass-card rounded-xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group h-full">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              
              <h3 className="font-bold text-on-surface uppercase tracking-widest text-xs mb-6 relative z-10">Overall ATS Score</h3>
              
              <div className="relative w-48 h-48 flex items-center justify-center mb-6 relative z-10 ai-glow">
                <svg className="w-full h-full transform -rotate-90">
                  <circle className="text-surface-container-highest transition-all" cx="96" cy="96" fill="transparent" r="80" stroke="currentColor" strokeWidth="12"></circle>
                  <circle 
                    className="text-primary transition-all duration-100 ease-linear" 
                    cx="96" cy="96" fill="transparent" r="80" 
                    stroke="currentColor" 
                    strokeDasharray={circumference} 
                    strokeDashoffset={strokeDashoffset} 
                    strokeWidth="12" 
                    strokeLinecap="round"
                  ></circle>
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-5xl font-extrabold text-on-surface leading-none">{score}<span className="text-xl text-on-surface-variant/50 ml-1">%</span></span>
                </div>
              </div>

              <div className="relative z-10">
                {score >= 80 ? (
                  <p className="text-sm text-green-600 dark:text-green-400 font-bold flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">check_circle</span>
                    Highly optimized for ATS screening
                  </p>
                ) : score >= 60 ? (
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 font-bold flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">warning</span>
                    Needs some optimization
                  </p>
                ) : (
                  <p className="text-sm text-error font-bold flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">error</span>
                    Requires significant improvements
                  </p>
                )}
                <p className="text-xs text-on-surface-variant mt-2 max-w-[250px] mx-auto">
                  Based on keyword frequency, structural parsing consistency, and metadata extraction accuracy.
                </p>
              </div>
            </div>
          </div>

          {/* Breakdown & Tips */}
          <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">
            
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-4 rounded-xl flex items-center gap-4">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined">spellcheck</span>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant font-bold uppercase">Formatting</p>
                  <p className="text-lg font-bold text-on-surface">{analysisData?.score_breakdown?.formatting !== undefined ? `${analysisData.score_breakdown.formatting}/5` : 'Passed'}</p>
                </div>
              </div>
              <div className="glass-card p-4 rounded-xl flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined">manage_search</span>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant font-bold uppercase">Keyword Match</p>
                  <p className="text-lg font-bold text-on-surface">
                    {analysisData?.matched_keywords ? `${analysisData.matched_keywords.length}/${analysisData.matched_keywords.length + (analysisData.missing_keywords?.length || 0)}` : 'Analyzed'}
                  </p>
                </div>
              </div>
            </div>

            {/* Suggestions List */}
            <div className="glass-card p-6 rounded-xl flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-4 border-b border-outline-variant/30 pb-3">
                <h3 className="font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">build</span>
                  Required Fixes
                </h3>
                <span className="text-xs font-bold text-on-surface-variant bg-surface-container px-2 py-1 rounded">
                  {tips.length} Items Found
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                {tips.length > 0 ? (
                  tips.map(tip => (
                    <div key={tip.id} className="p-4 bg-surface-container-low border border-outline-variant/20 rounded-xl hover:border-primary/30 transition-colors flex gap-4 group">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${tip.iconBg}`}>
                        <span className="material-symbols-outlined text-[18px]">{tip.icon}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-on-surface text-sm mb-1">{tip.title}</h4>
                        <p className="text-xs text-on-surface-variant leading-relaxed">{tip.desc}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-60">
                    <span className="material-symbols-outlined text-4xl mb-2">verified</span>
                    <p className="text-sm font-bold">No major issues found</p>
                    <p className="text-xs">Your resume parsed perfectly.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ATSScore;
