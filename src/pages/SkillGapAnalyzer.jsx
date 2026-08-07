import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import skillGapService from '../services/skillGapService';
import resumeService from '../services/resumeService';
import {
  generateFullReportPDF,
  generateSkillGapPDF,
  generateRoadmapPDF,
  generateAtsPDF,
  generateCareerGuidancePDF,
  exportLiveComponentToPDF
} from '../services/pdfReportGenerator';

/* ─────────────── Animated Circular Progress Ring ─────────────── */
const CircularRing = ({ value = 0, size = 120, strokeWidth = 10, color = '#6366f1', label, sublabel }) => {
  const [animatedVal, setAnimatedVal] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedVal / 100) * circumference;

  useEffect(() => {
    const timeout = setTimeout(() => {
      let start = 0;
      const step = value / 60;
      const timer = setInterval(() => {
        start += step;
        if (start >= value) { setAnimatedVal(value); clearInterval(timer); }
        else setAnimatedVal(Math.round(start));
      }, 16);
      return () => clearInterval(timer);
    }, 200);
    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            stroke="rgba(255,255,255,0.08)" strokeWidth={strokeWidth} fill="none"
          />
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            stroke={color} strokeWidth={strokeWidth} fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.05s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold text-white leading-none">{animatedVal}<span className="text-sm opacity-60">%</span></span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-bold text-white/80 uppercase tracking-widest">{label}</p>
        {sublabel && <p className="text-[10px] text-white/50 mt-0.5">{sublabel}</p>}
      </div>
    </div>
  );
};

/* ─────────────── Skeleton Loader ─────────────── */
const SkeletonBlock = ({ className = '' }) => (
  <div className={`animate-pulse bg-white/5 rounded-xl ${className}`} />
);

const LoadingSkeleton = () => (
  <div className="space-y-6">
    <div className="rounded-2xl bg-gradient-to-r from-indigo-900/60 to-blue-900/60 border border-white/10 p-8">
      <div className="flex gap-8 items-center flex-wrap">
        <SkeletonBlock className="w-48 h-16 rounded-xl" />
        <div className="flex gap-10">
          {[1,2,3].map(i => <SkeletonBlock key={i} className="w-28 h-28 rounded-full" />)}
        </div>
      </div>
    </div>
    <SkeletonBlock className="w-full h-32 rounded-2xl" />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {[1,2,3].map(i => <SkeletonBlock key={i} className="h-64 rounded-2xl" />)}
    </div>
    <SkeletonBlock className="w-full h-64 rounded-2xl" />
  </div>
);

/* ─────────────── Priority & Level Badges ─────────────── */
const PriorityBadge = ({ level }) => {
  const map = {
    High: 'bg-red-500/20 text-red-400 border-red-500/30',
    Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    Low: 'bg-green-500/20 text-green-400 border-green-500/30',
    Critical: 'bg-red-600/25 text-red-300 border-red-600/40',
    Important: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    'Nice to Have': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Very High': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    Moderate: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    Easy: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    Hard: 'bg-red-500/20 text-red-300 border-red-500/30',
    Beginner: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    Intermediate: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    Advanced: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${map[level] || 'bg-white/10 text-white/60 border-white/20'}`}>
      {level}
    </span>
  );
};

/* ─────────────── Confidence Bar ─────────────── */
const ConfidenceBar = ({ value, color = 'bg-indigo-500' }) => (
  <div className="flex items-center gap-2 mt-1">
    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${value}%` }} />
    </div>
    <span className="text-[10px] font-bold text-white/60 w-8">{value}%</span>
  </div>
);

/* ─────────────── Animated Horizontal Progress ─────────────── */
const AnimatedProgressBar = ({ label, value = 0, color = 'from-indigo-500 to-blue-500' }) => {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 150);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-semibold">
        <span className="text-white/80">{label}</span>
        <span className="text-white font-bold">{value}%</span>
      </div>
      <div className="h-2.5 bg-white/10 rounded-full overflow-hidden p-0.5">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-1000 ease-out`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
};

/* ─────────────── Doughnut Chart Custom Tooltip ─────────────── */
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900/95 backdrop-blur border border-white/10 rounded-xl px-3 py-2 shadow-xl">
        <p className="text-xs font-bold text-white">{payload[0].name}: <span style={{ color: payload[0].payload.fill }}>{payload[0].value}</span></p>
      </div>
    );
  }
  return null;
};

/* ─────────────── ROLE OPTIONS ─────────────── */
const ROLE_OPTIONS = [
  'Data Scientist', 'Machine Learning Engineer', 'Software Engineer',
  'Full Stack Developer', 'Cloud Solutions Architect', 'DevOps Specialist',
  'Backend Developer', 'Frontend Developer', 'Data Engineer',
  'AI/ML Researcher', 'Python Developer', 'React Developer',
];

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════ */
const SkillGapAnalyzer = () => {
  const navigate = useNavigate();
  const { resumeId } = useParams();
  const dashboardRef = useRef(null);

  const [targetRole, setTargetRole] = useState('Data Scientist');
  const [loading, setLoading] = useState(true);
  const [analyzingRole, setAnalyzingRole] = useState(false);
  const [error, setError] = useState(null);
  const [apiData, setApiData] = useState(null);
  const [activeSkillTab, setActiveSkillTab] = useState('strong');
  const [downloadingReport, setDownloadingReport] = useState(null);

  /* ── Fetch or analyze ── */
  const fetchOrAnalyzeGap = async (roleToAnalyze, forceRefresh = false) => {
    setError(null);
    try {
      let currentId = resumeId || localStorage.getItem('current_resume_id');
      if (!currentId) {
        const resumeRes = await resumeService.getResumes();
        if (resumeRes.success && resumeRes.data?.resumes?.length > 0) {
          const r = resumeRes.data.resumes[0];
          currentId = r.id || r._id || r.resume_id;
          localStorage.setItem('current_resume_id', currentId);
          navigate(`/skill-gap-analyzer/${currentId}`, { replace: true });
        } else {
          setLoading(false);
          setAnalyzingRole(false);
          return;
        }
      } else if (!resumeId) {
        navigate(`/skill-gap-analyzer/${currentId}`, { replace: true });
      }

      let data = null;
      if (!forceRefresh) {
        try {
          const latestRes = await skillGapService.getLatestAnalysis(currentId);
          if (latestRes.success && latestRes.data) {
            data = latestRes.data;
            if (data.target_role && data.target_role !== roleToAnalyze && !forceRefresh) {
              setTargetRole(data.target_role);
            }
          }
        } catch (fetchErr) {
          console.warn('Could not fetch cached analysis, will run fresh:', fetchErr.message);
        }
      }

      if (!data || forceRefresh) {
        const analyzeRes = await skillGapService.analyzeSkillGap(currentId, roleToAnalyze, forceRefresh);
        if (analyzeRes.success && analyzeRes.data) {
          data = analyzeRes.data;
        } else {
          throw new Error(analyzeRes.message || 'Analysis failed. Please try again.');
        }
      }

      if (data) {
        setApiData(data);
        if (data.target_role) setTargetRole(data.target_role);
      }
    } catch (err) {
      console.error('Skill gap error:', err);
      setError(err.message || err.userMessage || 'Unable to generate skill gap analysis. Please try again.');
    } finally {
      setLoading(false);
      setAnalyzingRole(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchOrAnalyzeGap(targetRole);
    // eslint-disable-next-line
  }, [resumeId]);

  const handleRoleChange = async (newRole) => {
    setTargetRole(newRole);
    setAnalyzingRole(true);
    await fetchOrAnalyzeGap(newRole, true);
  };

  /* ── Download Report Generator ── */
  const handleDownload = async (reportType) => {
    console.log('[SkillGapAnalyzer UI Debug] handleDownload triggered for reportType:', reportType, 'apiData:', apiData);
    if (!apiData) {
      alert("Analysis data is not available. Please analyze a resume before downloading.");
      return;
    }
    setDownloadingReport(reportType);
    try {
      if (reportType === 'full') {
        const success = await exportLiveComponentToPDF(dashboardRef.current, 'CareerOS_AI_Skill_Gap_Full_Report.pdf');
        if (!success) {
          console.warn('[SkillGapAnalyzer UI Debug] Live DOM capture returned false, invoking template generator fallback');
          await generateFullReportPDF(apiData);
        }
      } else if (reportType === 'skillgap') {
        await generateSkillGapPDF(apiData);
      } else if (reportType === 'roadmap') {
        await generateRoadmapPDF(apiData);
      } else if (reportType === 'ats') {
        await generateAtsPDF(apiData);
      } else if (reportType === 'recommendations' || reportType === 'guidance') {
        await generateCareerGuidancePDF(apiData);
      }
    } catch (e) {
      console.error('PDF Download Error:', e);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setTimeout(() => setDownloadingReport(null), 500);
    }
  };

  /* ── Empty state ── */
  const hasResume = resumeId || localStorage.getItem('current_resume_id');
  if (!loading && !hasResume) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-indigo-500/20">
            <span className="material-symbols-outlined text-indigo-400 text-[40px]">analytics</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">No Resume Found</h2>
          <p className="text-white/60 mb-6">Upload a resume first to unlock your personalized AI Skill Gap Analysis dashboard.</p>
          <button
            onClick={() => navigate('/resume-analyzer')}
            className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-500 hover:scale-[1.02] transition-all cursor-pointer"
          >
            Upload Resume
          </button>
        </div>
      </div>
    );
  }

  /* ── Derived values from API Response ── */
  const d = apiData || {};
  const candidateInfo = d.candidate_info || {};
  const resumeMatchScore = d.resume_match_score ?? d.skill_match_percentage ?? 0;
  const aiReadinessScore = d.ai_readiness_score ?? d.career_readiness?.percentage ?? 0;
  const hiringProbability = d.hiring_probability ?? 0;
  const skillMatchPct = d.skill_match_percentage ?? 0;
  const matchedSkills = d.matched_skills || [];
  const missingSkills = d.missing_skills || [];
  const strongSkills = d.strong_skills || [];
  const partialSkills = d.partial_skills || [];
  const prioritySkills = d.priority_skills || [];
  const industryBenchmark = d.industry_benchmark || [];
  const learningRoadmap = d.learning_roadmap || [];
  const recommendedCertifications = d.recommended_certifications || [];
  const recommendedProjects = d.recommended_projects || [];
  const recommendedResources = d.recommended_resources || [];
  const atsReport = d.ats_improvement_report || {};
  const interviewReadiness = d.interview_readiness || {};
  const aiRecommendations = d.ai_recommendations || {};
  const summary = d.skill_gap_summary || '';
  const totalRequired = matchedSkills.length + missingSkills.length;
  const skillGapPct = totalRequired > 0 ? Math.round((missingSkills.length / totalRequired) * 100) : 0;

  /* Doughnut chart data */
  const doughnutData = [
    { name: 'Available', value: matchedSkills.length, fill: '#6366f1' },
    { name: 'Partial', value: partialSkills.length, fill: '#eab308' },
    { name: 'Missing', value: missingSkills.length, fill: '#ef4444' },
  ].filter(d => d.value > 0);

  const readinessLevel = d.career_readiness?.level || 'Intermediate';
  const readinessColor = {
    'Job Ready': 'text-emerald-400',
    Advanced: 'text-purple-400',
    Intermediate: 'text-indigo-400',
    Beginner: 'text-red-400',
  }[readinessLevel] || 'text-white/60';

  /* ─────────────── RENDER ─────────────── */
  return (
    <div className="space-y-8 pb-12">

      {/* ── Page Header ── */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 mb-1">
            <span className="material-symbols-outlined text-sm">target</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">AI Skill Gap & Career Roadmap</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={targetRole}
              onChange={(e) => handleRoleChange(e.target.value)}
              disabled={analyzingRole || loading}
              className="font-extrabold text-2xl md:text-3xl text-white bg-transparent border-b-2 border-indigo-500/40 hover:border-indigo-400 focus:outline-none cursor-pointer pr-4 pb-1 disabled:opacity-60"
            >
              {ROLE_OPTIONS.map(r => <option key={r} value={r} className="bg-gray-900 text-white">{r}</option>)}
            </select>
            {analyzingRole && <span className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />}
          </div>
          <p className="text-white/50 text-sm mt-1 max-w-2xl">
            AI-powered skill gap evaluation, 5-phase learning roadmap, ATS report, salary prediction & interview readiness.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap flex-shrink-0">
          <button
            onClick={() => handleDownload('full')}
            disabled={!!downloadingReport}
            className="px-3.5 py-2 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold rounded-xl hover:bg-indigo-500/30 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">download_for_offline</span>
            {downloadingReport === 'full' ? 'Generating PDF...' : 'Download Full PDF'}
          </button>
          <button
            onClick={() => navigate('/resume-analyzer')}
            className="px-3.5 py-2 bg-white/5 border border-white/10 text-white/80 text-xs font-bold rounded-xl hover:bg-white/10 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">upload_file</span>
            Upload New
          </button>
          <button
            onClick={() => { setLoading(true); fetchOrAnalyzeGap(targetRole, true); }}
            disabled={loading || analyzingRole}
            className="px-3.5 py-2 bg-indigo-600/80 border border-indigo-500/50 text-white text-xs font-bold rounded-xl hover:bg-indigo-500 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            Re-analyze
          </button>
        </div>
      </section>

      {/* ── Error Banner ── */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">error</span>
            <span className="text-sm font-semibold">{error}</span>
          </div>
          <button
            onClick={() => { setError(null); setLoading(true); fetchOrAnalyzeGap(targetRole, true); }}
            className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors border border-red-500/20"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Loading Skeleton ── */}
      {(loading || analyzingRole) && !apiData && <LoadingSkeleton />}

      {/* ── MAIN MODULE 2B DASHBOARD ── */}
      {!loading && !analyzingRole && apiData && (
        <div ref={dashboardRef} className="space-y-8 animate-fadeIn">

          {/* ════════════════════════════════════════
              HERO SECTION — Candidate + Score Rings
          ════════════════════════════════════════ */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-950/80 via-blue-950/60 to-slate-900/80 backdrop-blur-xl p-8 shadow-2xl">
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
              <div className="space-y-4 min-w-0">
                <div>
                  {candidateInfo.name ? (
                    <h2 className="text-3xl font-extrabold text-white truncate">{candidateInfo.name}</h2>
                  ) : (
                    <h2 className="text-3xl font-extrabold text-white/40 italic">Candidate Profile</h2>
                  )}
                  <p className="text-indigo-400 font-semibold mt-0.5">{targetRole}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {candidateInfo.current_role && (
                    <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2 border border-white/10">
                      <span className="material-symbols-outlined text-indigo-400 text-sm">work</span>
                      <div>
                        <p className="text-[9px] text-white/40 uppercase font-bold tracking-wider">Current Role</p>
                        <p className="text-xs text-white font-semibold truncate">{candidateInfo.current_role}</p>
                      </div>
                    </div>
                  )}
                  {candidateInfo.email && (
                    <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2 border border-white/10">
                      <span className="material-symbols-outlined text-indigo-400 text-sm">mail</span>
                      <div>
                        <p className="text-[9px] text-white/40 uppercase font-bold tracking-wider">Email</p>
                        <p className="text-xs text-white font-semibold truncate">{candidateInfo.email}</p>
                      </div>
                    </div>
                  )}
                  {candidateInfo.phone && (
                    <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2 border border-white/10">
                      <span className="material-symbols-outlined text-indigo-400 text-sm">phone</span>
                      <div>
                        <p className="text-[9px] text-white/40 uppercase font-bold tracking-wider">Phone</p>
                        <p className="text-xs text-white font-semibold">{candidateInfo.phone}</p>
                      </div>
                    </div>
                  )}
                  {candidateInfo.resume_last_updated && (
                    <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2 border border-white/10">
                      <span className="material-symbols-outlined text-indigo-400 text-sm">update</span>
                      <div>
                        <p className="text-[9px] text-white/40 uppercase font-bold tracking-wider">Last Updated</p>
                        <p className="text-xs text-white font-semibold">
                          {(() => { try { return new Date(candidateInfo.resume_last_updated).toLocaleDateString(); } catch { return candidateInfo.resume_last_updated; } })()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-400 text-sm">verified</span>
                  <span className={`text-sm font-bold ${readinessColor}`}>{readinessLevel}</span>
                  <span className="text-white/30 text-xs">Career Readiness Level</span>
                </div>
              </div>

              <div className="flex gap-8 flex-wrap">
                <CircularRing value={resumeMatchScore} color="#6366f1" label="Resume Match" sublabel="vs Target Role" />
                <CircularRing value={aiReadinessScore} color="#10b981" label="AI Readiness" sublabel="Gemini Analysis" />
                <CircularRing value={hiringProbability} color="#f59e0b" label="Hiring Prob." sublabel="Estimated Chance" />
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════════
              AI SUMMARY CARD
          ════════════════════════════════════════ */}
          {summary && (
            <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/50 to-slate-900/50 backdrop-blur-xl p-6 shadow-lg">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-blue-500 rounded-l-2xl" />
              <div className="flex items-start gap-4 pl-4">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-indigo-500/30">
                  <span className="material-symbols-outlined text-indigo-400 text-[20px]">psychology</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-2">AI Career Assessment Summary</h3>
                  <p className="text-white/80 text-sm leading-relaxed">{summary}</p>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════
              5-PHASE LEARNING ROADMAP
          ════════════════════════════════════════ */}
          <div className="rounded-2xl border border-white/10 bg-gray-900/50 backdrop-blur-xl p-6 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-indigo-400 text-2xl">route</span>
                <div>
                  <h3 className="text-lg font-bold text-white">5-Phase Personalized Learning Roadmap</h3>
                  <p className="text-xs text-white/50">Structured learning trajectory to master missing target competencies</p>
                </div>
              </div>
              <button
                onClick={() => handleDownload('roadmap')}
                className="px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-300 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                Export Roadmap
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {learningRoadmap.slice(0, 5).map((phase, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-white/10 bg-white/3 p-4 flex flex-col justify-between hover:border-indigo-500/30 transition-all space-y-3 relative group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-md text-[10px] font-extrabold uppercase">
                        {phase.phase || `Phase ${idx + 1}`}
                      </span>
                      <PriorityBadge level={phase.difficulty || 'Intermediate'} />
                    </div>

                    <h4 className="text-sm font-bold text-white leading-snug line-clamp-2">
                      {phase.phase_name || phase.title || `Phase ${idx + 1}`}
                    </h4>

                    <div className="flex items-center gap-1 text-[11px] text-white/50">
                      <span className="material-symbols-outlined text-xs text-indigo-400">schedule</span>
                      <span>{phase.duration || '3 Weeks'}</span>
                    </div>

                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[10px] font-semibold text-white/60">
                        <span>Progress</span>
                        <span className="text-indigo-400">{phase.completion_pct ?? (idx === 0 ? 60 : 15)}%</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-700"
                          style={{ width: `${phase.completion_pct ?? (idx === 0 ? 60 : 15)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Skills to Learn</p>
                    <div className="flex flex-wrap gap-1">
                      {(Array.isArray(phase.skills) ? phase.skills : [phase.skills]).map((sk, sidx) => (
                        <span key={sidx} className="px-1.5 py-0.5 bg-white/5 text-white/80 border border-white/10 rounded text-[10px]">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ════════════════════════════════════════
              MISSING SKILLS DETAILS
          ════════════════════════════════════════ */}
          <div className="rounded-2xl border border-white/10 bg-gray-900/50 backdrop-blur-xl p-6 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-red-400 text-2xl">pending_actions</span>
                <div>
                  <h3 className="text-lg font-bold text-white">Missing Skills & Competency Breakdown</h3>
                  <p className="text-xs text-white/50">Detailed breakdown of learning difficulty, hiring demand, and priority</p>
                </div>
              </div>
              <span className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-xl">
                {prioritySkills.length} Skills Required
              </span>
            </div>

            {prioritySkills.length === 0 ? (
              <p className="text-xs text-white/40 italic text-center py-6">No critical missing skills detected — your resume matches all core role requirements!</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {prioritySkills.map((sk, idx) => (
                  <div key={idx} className="rounded-xl border border-white/10 bg-white/3 p-4 space-y-3 hover:border-red-500/30 transition-all">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                        <h4 className="text-sm font-bold text-white">{sk.skill || sk.name}</h4>
                      </div>
                      <PriorityBadge level={sk.priority || 'High'} />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center py-1">
                      <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                        <p className="text-[8px] text-white/40 uppercase font-bold">Importance</p>
                        <p className="text-[11px] font-bold text-orange-300 mt-0.5">{sk.importance || 'Critical'}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                        <p className="text-[8px] text-white/40 uppercase font-bold">Hiring Demand</p>
                        <p className="text-[11px] font-bold text-emerald-300 mt-0.5">{sk.hiring_demand || 'High'}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                        <p className="text-[8px] text-white/40 uppercase font-bold">Difficulty</p>
                        <p className="text-[11px] font-bold text-yellow-300 mt-0.5">{sk.learning_difficulty || 'Moderate'}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                        <p className="text-[8px] text-white/40 uppercase font-bold">Est. Time</p>
                        <p className="text-[11px] font-bold text-indigo-300 mt-0.5">{sk.estimated_time || '2 Weeks'}</p>
                      </div>
                    </div>

                    {sk.reason && (
                      <p className="text-[11px] text-white/60 leading-relaxed pl-2 border-l-2 border-red-500/40">
                        {sk.reason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ════════════════════════════════════════
              RECOMMENDED CERTIFICATIONS
          ════════════════════════════════════════ */}
          {recommendedCertifications.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-gray-900/50 backdrop-blur-xl p-6 space-y-6">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <span className="material-symbols-outlined text-purple-400 text-2xl">workspace_premium</span>
                <div>
                  <h3 className="text-lg font-bold text-white">Recommended Industry Certifications</h3>
                  <p className="text-xs text-white/50">Certifications to validate expertise for {targetRole}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recommendedCertifications.map((cert, idx) => (
                  <div key={idx} className="rounded-xl border border-purple-500/20 bg-purple-950/10 p-4 space-y-3 flex flex-col justify-between hover:border-purple-500/40 transition-all">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">{cert.provider || 'Industry Standard'}</span>
                        <PriorityBadge level={cert.difficulty || 'Intermediate'} />
                      </div>
                      <h4 className="text-sm font-bold text-white leading-snug">{cert.name}</h4>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5 text-white/60">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs text-purple-400">schedule</span>
                        {cert.duration || '2 Months'}
                      </span>
                      <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-[10px] font-bold border border-purple-500/30">
                        {cert.industry_value || 'High'} Value
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════
              RECOMMENDED PORTFOLIO PROJECTS
          ════════════════════════════════════════ */}
          {recommendedProjects.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-gray-900/50 backdrop-blur-xl p-6 space-y-6">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <span className="material-symbols-outlined text-blue-400 text-2xl">code_blocks</span>
                <div>
                  <h3 className="text-lg font-bold text-white">Recommended Capstone Portfolio Projects</h3>
                  <p className="text-xs text-white/50">Build real-world projects to demonstrate missing technical competencies</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recommendedProjects.map((proj, idx) => (
                  <div key={idx} className="rounded-xl border border-white/10 bg-white/3 p-5 space-y-4 hover:border-blue-500/30 transition-all flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-base font-bold text-white leading-snug">{proj.project_name}</h4>
                        <PriorityBadge level={proj.difficulty || 'Advanced'} />
                      </div>

                      <p className="text-xs text-white/70 leading-relaxed">{proj.description}</p>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(proj.technologies_used || proj.skills_practiced || []).map((tech, tidx) => (
                          <span key={tidx} className="px-2 py-0.5 bg-blue-500/10 text-blue-300 border border-blue-500/20 rounded-md text-[10px] font-bold">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5 text-center text-xs">
                      <div className="bg-white/5 rounded-lg p-2">
                        <p className="text-[8px] text-white/40 uppercase font-bold">Duration</p>
                        <p className="text-[11px] font-bold text-white mt-0.5">{proj.estimated_duration || '3 Weeks'}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2">
                        <p className="text-[8px] text-white/40 uppercase font-bold">Resume Impact</p>
                        <p className="text-[11px] font-bold text-emerald-400 mt-0.5">{proj.resume_impact || 'Very High'}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2">
                        <p className="text-[8px] text-white/40 uppercase font-bold">Hiring Value</p>
                        <p className="text-[11px] font-bold text-purple-400 mt-0.5">{proj.hiring_value || 'Very High'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════
              ATS IMPROVEMENT REPORT (FULL WIDTH REBALANCED)
          ════════════════════════════════════════ */}
          <div className="rounded-2xl border border-emerald-500/20 bg-gray-900/50 backdrop-blur-xl p-6 space-y-5 w-full">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-400 text-2xl">analytics</span>
                <div>
                  <h3 className="text-base font-bold text-white">ATS Score Optimization Report</h3>
                  <p className="text-xs text-white/50">How to boost parser compatibility for target role</p>
                </div>
              </div>
              <button
                onClick={() => handleDownload('ats')}
                disabled={!!downloadingReport}
                className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 text-[11px] font-bold rounded-lg border border-emerald-500/30 hover:bg-emerald-500/30 transition-all cursor-pointer"
              >
                {downloadingReport === 'ats' ? 'Generating PDF...' : 'Download ATS Report'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <p className="text-2xl font-extrabold text-white">{atsReport.current_ats_score || skillMatchPct}%</p>
                <p className="text-[10px] text-white/40 uppercase font-bold mt-0.5">Current ATS Match</p>
              </div>
              <div className="bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/30">
                <p className="text-2xl font-extrabold text-emerald-400">{atsReport.expected_ats_score || 92}%</p>
                <p className="text-[10px] text-emerald-300/80 uppercase font-bold mt-0.5">Potential ATS Match</p>
              </div>
            </div>

            {atsReport.missing_keywords && atsReport.missing_keywords.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-white/80">Missing Key ATS Match Words:</p>
                <div className="flex flex-wrap gap-1.5">
                  {atsReport.missing_keywords.map((kw, i) => (
                    <span key={i} className="px-2 py-0.5 bg-red-500/15 text-red-300 border border-red-500/30 rounded text-[11px] font-semibold">
                      + {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {atsReport.improvement_suggestions && (
              <div className="space-y-2 pt-2 border-t border-white/5">
                <p className="text-xs font-bold text-white/80">Actionable Resume Suggestions:</p>
                <ul className="space-y-1 text-xs text-white/70">
                  {atsReport.improvement_suggestions.map((sug, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-emerald-400 text-xs mt-0.5">check_circle</span>
                      <span>{sug}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* ════════════════════════════════════════
              INTERVIEW READINESS SCORECARD
          ════════════════════════════════════════ */}
          <div className="rounded-2xl border border-white/10 bg-gray-900/50 backdrop-blur-xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-yellow-400 text-2xl">record_voice_over</span>
                <div>
                  <h3 className="text-lg font-bold text-white">Interview Readiness Scorecard</h3>
                  <p className="text-xs text-white/50">Comprehensive evaluation across key interview performance dimensions</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/40">Overall Readiness:</span>
                <span className="text-lg font-extrabold text-emerald-400">{interviewReadiness.overall_interview_readiness || 65}%</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatedProgressBar label="Technical Skills & Syntax" value={interviewReadiness.technical_skills || 60} color="from-indigo-500 to-blue-500" />
              <AnimatedProgressBar label="Portfolio Projects Depth" value={interviewReadiness.projects || 55} color="from-purple-500 to-pink-500" />
              <AnimatedProgressBar label="Resume Quality & Impact" value={interviewReadiness.resume_quality || 70} color="from-emerald-500 to-teal-500" />
              <AnimatedProgressBar label="Technical Communication" value={interviewReadiness.communication || 75} color="from-blue-500 to-cyan-500" />
              <AnimatedProgressBar label="Problem Solving & Algorithms" value={interviewReadiness.problem_solving || 65} color="from-yellow-500 to-orange-500" />
              <AnimatedProgressBar label="Overall Interview Preparedness" value={interviewReadiness.overall_interview_readiness || 65} color="from-emerald-400 to-indigo-500" />
            </div>
          </div>

          {/* ════════════════════════════════════════
              AI CAREER RECOMMENDATIONS
          ════════════════════════════════════════ */}
          <div className="rounded-2xl border border-indigo-500/20 bg-gray-900/50 backdrop-blur-xl p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <span className="material-symbols-outlined text-indigo-400 text-2xl">auto_awesome</span>
              <div>
                <h3 className="text-lg font-bold text-white">AI Actionable Career Recommendations</h3>
                <p className="text-xs text-white/50">Tailored advice generated directly from your resume and target role</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {aiRecommendations.top_skills_to_learn_first && (
                <div className="bg-white/3 rounded-xl p-4 border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <span className="material-symbols-outlined text-sm">priority_high</span>
                    <h4 className="text-xs font-bold uppercase tracking-wider">Top Skills to Master First</h4>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {aiRecommendations.top_skills_to_learn_first.map((sk, i) => (
                      <span key={i} className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-bold">
                        {i + 1}. {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {aiRecommendations.best_next_learning_path && (
                <div className="bg-white/3 rounded-xl p-4 border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <span className="material-symbols-outlined text-sm">alt_route</span>
                    <h4 className="text-xs font-bold uppercase tracking-wider">Best Recommended Trajectory</h4>
                  </div>
                  <p className="text-xs text-white/80 leading-relaxed">{aiRecommendations.best_next_learning_path}</p>
                </div>
              )}

              {aiRecommendations.resume_improvement_tips && (
                <div className="bg-white/3 rounded-xl p-4 border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-blue-400">
                    <span className="material-symbols-outlined text-sm">description</span>
                    <h4 className="text-xs font-bold uppercase tracking-wider">Resume Polish Tips</h4>
                  </div>
                  <ul className="space-y-1 text-xs text-white/70">
                    {aiRecommendations.resume_improvement_tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-blue-400 font-bold">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {aiRecommendations.interview_preparation_tips && (
                <div className="bg-white/3 rounded-xl p-4 border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-purple-400">
                    <span className="material-symbols-outlined text-sm">forum</span>
                    <h4 className="text-xs font-bold uppercase tracking-wider">Interview Preparation Tips</h4>
                  </div>
                  <ul className="space-y-1 text-xs text-white/70">
                    {aiRecommendations.interview_preparation_tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-purple-400 font-bold">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* ════════════════════════════════════════
              DOWNLOAD & QUICK ACTIONS CENTER
          ════════════════════════════════════════ */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-indigo-950/80 via-slate-900 to-blue-950/80 backdrop-blur-xl p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <span
                onClick={() => handleDownload('full')}
                title="Download Full Page PDF"
                className="material-symbols-outlined text-indigo-400 text-2xl cursor-pointer hover:text-indigo-300 transition-colors"
              >
                download_for_offline
              </span>
              <div>
                <h3 className="text-lg font-bold text-white">Download Reports & Next Steps</h3>
                <p className="text-xs text-white/50">Export custom reports or improve your resume with CareerOS AI tools</p>
              </div>
            </div>

            {/* Export Report Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={() => handleDownload('skillgap')}
                disabled={!!downloadingReport}
                className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="material-symbols-outlined text-indigo-400 group-hover:scale-110 transition-transform">picture_as_pdf</span>
                  <span className="text-[10px] text-white/40 font-bold uppercase">Report</span>
                </div>
                <p className="text-xs font-bold text-white">Skill Gap Analysis</p>
                <p className="text-[10px] text-white/50 mt-0.5">Full candidate evaluation</p>
              </button>

              <button
                onClick={() => handleDownload('roadmap')}
                disabled={!!downloadingReport}
                className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="material-symbols-outlined text-blue-400 group-hover:scale-110 transition-transform">map</span>
                  <span className="text-[10px] text-white/40 font-bold uppercase">Plan</span>
                </div>
                <p className="text-xs font-bold text-white">Learning Roadmap</p>
                <p className="text-[10px] text-white/50 mt-0.5">5-Phase action timeline</p>
              </button>

              <button
                onClick={() => handleDownload('ats')}
                disabled={!!downloadingReport}
                className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="material-symbols-outlined text-emerald-400 group-hover:scale-110 transition-transform">fact_check</span>
                  <span className="text-[10px] text-white/40 font-bold uppercase">ATS</span>
                </div>
                <p className="text-xs font-bold text-white">ATS Improvement</p>
                <p className="text-[10px] text-white/50 mt-0.5">Keywords & score report</p>
              </button>

              <button
                onClick={() => handleDownload('recommendations')}
                disabled={!!downloadingReport}
                className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="material-symbols-outlined text-purple-400 group-hover:scale-110 transition-transform">auto_awesome</span>
                  <span className="text-[10px] text-white/40 font-bold uppercase">Career</span>
                </div>
                <p className="text-xs font-bold text-white">Career Guidance</p>
                <p className="text-[10px] text-white/50 mt-0.5">AI recommendations</p>
              </button>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => navigate('/resume-analyzer')}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg transition-all cursor-pointer flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">auto_fix_high</span>
                  Improve Resume with AI
                </button>
                <button
                  onClick={() => navigate('/resume-analyzer')}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">upload_file</span>
                  Upload New Resume
                </button>
              </div>

              <button
                onClick={() => { setLoading(true); fetchOrAnalyzeGap(targetRole, true); }}
                disabled={loading || analyzingRole}
                className="px-4 py-2.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
                Re-analyze Resume
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ── Overlay spinner during role re-analysis ── */}
      {analyzingRole && apiData && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-8 text-center shadow-2xl">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white font-bold">Analyzing for <span className="text-indigo-400">{targetRole}</span>...</p>
            <p className="text-white/50 text-xs mt-1">Generating 5-Phase Roadmap & Career Report</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillGapAnalyzer;
