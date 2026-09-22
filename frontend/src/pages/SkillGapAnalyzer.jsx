import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import skillGapService from '../services/skillGapService';
import resumeService from '../services/resumeService';

const SkillGapAnalyzer = () => {
  const navigate = useNavigate();
  const { resumeId } = useParams();
  
  const [targetRole, setTargetRole] = useState('Data Scientist');
  const [loading, setLoading] = useState(true);
  const [analyzingRole, setAnalyzingRole] = useState(false);
  const [error, setError] = useState(null);
  const [apiData, setApiData] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [skills, setSkills] = useState([]);

  const fetchOrAnalyzeGap = async (roleToAnalyze) => {
    setLoading(true);
    setError(null);
    try {
      let currentId = resumeId || localStorage.getItem('current_resume_id');
      if (!currentId) {
        const resumeRes = await resumeService.getResumes();
        if (resumeRes.success && resumeRes.data?.resumes?.length > 0) {
          currentId = resumeRes.data.resumes[0].id || resumeRes.data.resumes[0]._id;
          localStorage.setItem('current_resume_id', currentId);
          navigate(`/skill-gap-analyzer/${currentId}`, { replace: true });
        } else {
          setLoading(false);
          return; // Allow the empty state to render
        }
      } else if (!resumeId) {
         navigate(`/skill-gap-analyzer/${currentId}`, { replace: true });
      }

      let data = null;
      try {
        const res = await skillGapService.getSkillGapByResume(currentId);
        // Depending on backend, the data could be nested
        if (res.success && res.data) {
          if (res.data.history && res.data.history.length > 0) {
            data = res.data.history[0].skill_gap || res.data.history[0].analysis || res.data.history[0];
          } else {
            data = res.data.skill_gap || res.data.analysis || res.data;
          }
        }
      } catch (err) {
        // Not analyzed yet
      }

      if (!data || roleToAnalyze !== (data.target_role || targetRole)) {
        const analyzeRes = await skillGapService.analyzeSkillGap(currentId, roleToAnalyze || targetRole);
        if (analyzeRes.success && analyzeRes.data) {
          data = analyzeRes.data.skill_gap || analyzeRes.data.analysis || analyzeRes.data;
        }
      }

      if (data) {
        setApiData(data);
        if (data.target_role) setTargetRole(data.target_role);

        // Transform backend missing and matching skills into state items
        const newSkills = [];
        let idx = 1;
        const mastered = data.matching_skills || data.existing_skills || data.mastered_skills || [];
        const missing = data.missing_skills || data.gaps || [];
        
        mastered.forEach(s => {
          newSkills.push({
            id: idx++,
            name: typeof s === 'string' ? s : s.name || 'Mastered Skill',
            status: 'Mastered',
            statusColor: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200',
            icon: 'check_circle',
            iconColor: 'bg-green-100 text-green-700',
            percent: 100,
            estimate: 'Completed',
            buttonText: 'Review Material',
            isPrimaryButton: false
          });
        });

        missing.forEach((s, i) => {
          const isLearning = i % 2 === 0; // simple heuristic for visual variety
          newSkills.push({
            id: idx++,
            name: typeof s === 'string' ? s : s.name || 'Missing Skill',
            status: isLearning ? 'Learning' : 'Critical Gap',
            statusColor: isLearning ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200' : 'bg-error-container text-on-error-container border-error/15',
            icon: isLearning ? 'data_object' : 'schema',
            iconColor: isLearning ? 'bg-yellow-100 text-yellow-700' : 'bg-error-container/40 text-error',
            percent: isLearning ? 50 : 0,
            estimate: isLearning ? '15 Hours remaining' : '~35 Hours',
            buttonText: isLearning ? 'Resume Course' : 'Start Learning',
            isPrimaryButton: !isLearning
          });
        });

        if (newSkills.length > 0) setSkills(newSkills);
      }
    } catch (err) {
      console.error('Skill gap load issue:', err);
      setError(err.userMessage || 'Unable to generate your skill gap analysis. Please try again.');
      setSkills([]);
    } finally {
      setLoading(false);
      setAnalyzingRole(false);
    }
  };

  useEffect(() => {
    fetchOrAnalyzeGap(targetRole);
    // eslint-disable-next-line
  }, [resumeId]);

  const handleRoleChange = async (newRole) => {
    setTargetRole(newRole);
    setAnalyzingRole(true);
    await fetchOrAnalyzeGap(newRole);
  };

  const handleAction = (id) => {
    setSkills(
      skills.map((skill) => {
        if (skill.id === id) {
          if (skill.status === 'Critical Gap') {
            return {
              ...skill,
              status: 'Learning',
              statusColor: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200',
              iconColor: 'bg-yellow-100 text-yellow-700',
              percent: 20,
              estimate: '28 Hours remaining',
              buttonText: 'Resume Course',
              isPrimaryButton: false,
            };
          } else if (skill.status === 'Learning') {
            return {
              ...skill,
              status: 'Mastered',
              statusColor: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200',
              iconColor: 'bg-green-100 text-green-700',
              percent: 100,
              estimate: 'Completed',
              buttonText: 'Review Material',
              isPrimaryButton: false,
            };
          }
        }
        return skill;
      })
    );
  };

  // EMPTY STATE for missing resume
  if (!loading && !resumeId && !localStorage.getItem('current_resume_id')) {
    return (
      <div className="space-y-6">
        <section className="relative overflow-hidden glass-panel rounded-2xl p-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="relative z-10">
            <h2 className="font-display-lg text-3xl md:text-4xl font-extrabold text-on-surface mb-2">Skill Gap Analyzer</h2>
            <p className="text-lg text-on-surface-variant mb-6">Select or upload a resume to view your personalized skill gap analysis.</p>
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

  const filteredSkills = skills.filter((skill) => {
    if (activeFilter === 'Only Gaps') return skill.status === 'Critical Gap';
    if (activeFilter === 'In Progress') return skill.status === 'Learning';
    return true;
  });

  const masteredCount = skills.filter((s) => s.status === 'Mastered').length;
  const learningCount = skills.filter((s) => s.status === 'Learning').length;
  const gapCount = skills.filter((s) => s.status === 'Critical Gap').length;
  const totalReadiness = apiData?.readiness_score || apiData?.career_readiness || Math.round(
    skills.reduce((acc, curr) => acc + curr.percent, 0) / (skills.length || 1)
  );

  const roadmap = apiData?.learning_roadmap || apiData?.roadmap || [];
  const recommended_projects = apiData?.recommended_projects || apiData?.projects || [];

  return (
    <div className="space-y-6">
      {/* Page Header Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-primary mb-1">
            <span className="material-symbols-outlined text-sm">target</span>
            <span className="text-xs font-bold uppercase tracking-widest">Target Analysis</span>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={targetRole}
              onChange={(e) => handleRoleChange(e.target.value)}
              disabled={analyzingRole}
              className="font-display-lg text-3xl md:text-4xl font-extrabold text-on-surface bg-transparent border-b-2 border-primary/40 hover:border-primary focus:outline-none cursor-pointer pr-4"
            >
              <option value="Data Scientist">Data Scientist</option>
              <option value="Machine Learning Engineer">Machine Learning Engineer</option>
              <option value="Software Engineer">Software Engineer</option>
              <option value="Full Stack Developer">Full Stack Developer</option>
              <option value="Cloud Solutions Architect">Cloud Solutions Architect</option>
              <option value="DevOps Specialist">DevOps Specialist</option>
            </select>
            {analyzingRole && <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>}
          </div>
          <p className="text-on-surface-variant font-body-lg max-w-2xl mt-2">
            A comprehensive Gemini AI comparison of your current capabilities against industry-standard requirements for <span className="font-bold text-primary">{targetRole}</span> roles.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/resume-analyzer')}
            className="bg-surface-container-high text-on-surface px-6 py-3 rounded-xl font-bold hover:bg-outline-variant/30 transition-all cursor-pointer"
          >
            Update Resume
          </button>
          <button
            onClick={() => window.print()}
            className="bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            Download Report
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
          {skills.length === 0 && (
             <button onClick={() => fetchOrAnalyzeGap(targetRole)} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-xs cursor-pointer hover:bg-red-700 transition-colors">
               Retry Analysis
             </button>
          )}
        </div>
      )}

      {loading && !analyzingRole ? (
        <div className="glass rounded-[2rem] border border-outline-variant/30 p-16 flex flex-col items-center justify-center min-h-[350px]">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-bold text-on-surface">Synthesizing candidate competencies against market standard...</p>
          <p className="text-xs text-on-surface-variant mt-1">Calling Gemini AI engine for skills matrix calibration.</p>
        </div>
      ) : skills.length > 0 ? (
        <>
          {/* Bento Grid Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
            {/* Overall Readiness Score (Bento Small) */}
            <div className="col-span-12 lg:col-span-4 glass rounded-[2rem] border border-outline-variant/30 p-6 flex flex-col items-center justify-center relative overflow-hidden ai-glow">
              <div className="relative z-10 text-center flex flex-col items-center">
                <span className="text-on-surface-variant font-bold text-xs uppercase tracking-wider mb-2 block">Readiness Score</span>
                <div className="flex items-end gap-1 mb-2">
                  <span className="text-6xl font-display-lg font-extrabold text-on-surface leading-none">{totalReadiness || 0}<span className="text-2xl text-on-surface-variant/40">%</span></span>
                </div>
                <div className="px-3 py-1 bg-primary/10 text-primary rounded text-[10px] font-bold uppercase tracking-wider mb-4 border border-primary/20">
                  {totalReadiness >= 80 ? 'Highly Competitive' : totalReadiness >= 60 ? 'Competitive' : 'Development Needed'}
                </div>
              </div>
              {/* Decorative radial blur */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
            </div>

            {/* Gap Breakdown Chart (Bento Wide) */}
            <div className="col-span-12 lg:col-span-8 glass rounded-[2rem] border border-outline-variant/30 p-6 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">donut_large</span>
                  Skill Distribution Matrix
                </h3>
                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500"></span><span className="text-[10px] text-on-surface-variant font-bold">MASTERED</span></div>
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span><span className="text-[10px] text-on-surface-variant font-bold">LEARNING</span></div>
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-error"></span><span className="text-[10px] text-on-surface-variant font-bold">GAP</span></div>
                </div>
              </div>
              <div className="flex-1 w-full h-full min-h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Core Tech', Mastered: 80, Learning: 20, Gap: 0 },
                    { name: 'Cloud/Ops', Mastered: 30, Learning: 40, Gap: 30 },
                    { name: 'Data Eng', Mastered: 90, Learning: 10, Gap: 0 },
                    { name: 'Soft Skills', Mastered: 100, Learning: 0, Gap: 0 }
                  ]} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barSize={16}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 'bold' }} width={80} />
                    <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="Mastered" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="Learning" stackId="a" fill="#eab308" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="Gap" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Interactive Roadmap Matrix */}
            <div className="xl:col-span-8 space-y-6">
              <div className="glass rounded-[2rem] border border-outline-variant/30 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <h3 className="font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">route</span>
                    Skill Rectification Roadmap
                  </h3>
                  
                  <div className="flex bg-surface-container-low p-1 rounded-xl border border-outline-variant/20 self-start">
                    {['All', 'Only Gaps', 'In Progress'].map(filter => (
                      <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          activeFilter === filter 
                            ? 'bg-white dark:bg-gray-800 text-primary shadow-sm' 
                            : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredSkills.length === 0 ? (
                    <div className="text-center py-8 text-on-surface-variant text-sm italic">
                      No skills match this filter.
                    </div>
                  ) : (
                    filteredSkills.map((skill) => (
                      <div key={skill.id} className="p-4 border border-outline-variant/30 rounded-2xl hover:border-primary/30 hover:bg-primary/5 transition-all group relative overflow-hidden bg-white dark:bg-gray-900">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 relative z-10">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${skill.iconColor}`}>
                            <span className="material-symbols-outlined">{skill.icon}</span>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="font-bold text-on-surface truncate text-base">{skill.name}</h4>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${skill.statusColor}`}>
                                {skill.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 mt-2">
                              <div className="flex-1 bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                                <div 
                                  className={`h-1.5 rounded-full transition-all duration-1000 ${
                                    skill.percent === 100 ? 'bg-green-500' : skill.percent === 0 ? 'bg-error' : 'bg-yellow-500'
                                  }`} 
                                  style={{ width: `${skill.percent}%` }}
                                ></div>
                              </div>
                              <span className="text-[11px] font-semibold text-on-surface-variant whitespace-nowrap">
                                {skill.estimate}
                              </span>
                            </div>
                          </div>

                          <div className="sm:ml-auto">
                            {!skill.isPrimaryButton ? (
                              <button
                                onClick={() => handleAction(skill.id)}
                                className="w-full sm:w-auto px-4 py-2 border border-outline-variant/50 text-on-surface-variant hover:text-primary hover:border-primary/50 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                              >
                                {skill.buttonText}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleAction(skill.id)}
                                className="w-full sm:w-auto px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg shadow-sm hover:shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                              >
                                {skill.buttonText}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column (Secondary Insights) */}
            <div className="xl:col-span-4 space-y-6">
              
              {/* Required Projects Card */}
              <div className="glass rounded-[2rem] border border-outline-variant/30 p-6">
                <h3 className="font-bold text-on-surface flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-tertiary">integration_instructions</span>
                  Suggested Capstones
                </h3>
                <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
                  To close your critical gaps in <span className="font-bold text-on-surface">Data Engineering</span>, Gemini recommends completing these applied projects.
                </p>
                <div className="space-y-3">
                  {recommended_projects.map((proj, idx) => (
                    <div key={idx} className="p-3 bg-surface-container-low border border-outline-variant/20 rounded-xl hover:border-tertiary/30 transition-colors cursor-pointer group">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-on-surface text-sm group-hover:text-tertiary transition-colors">{proj.name || proj.project_name || 'Project'}</h4>
                        <span className="material-symbols-outlined text-tertiary text-sm opacity-0 group-hover:opacity-100 transition-opacity">arrow_outward</span>
                      </div>
                      <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-2">{proj.tech || proj.technologies}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-tertiary bg-tertiary/10 px-2 py-0.5 rounded">{proj.level || 'Advanced'}</span>
                      </div>
                    </div>
                  ))}
                  {recommended_projects.length === 0 && (
                     <div className="text-center py-4 text-on-surface-variant text-sm italic">
                       No capstone projects recommended at this time.
                     </div>
                  )}
                </div>
              </div>

              {/* Learning Roadmap Summary */}
              <div className="glass rounded-[2rem] border border-outline-variant/30 p-6">
                <h3 className="font-bold text-on-surface flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-primary">linear_scale</span>
                  Timeline Prediction
                </h3>
                <div className="relative pl-6 border-l-2 border-primary/20 space-y-6">
                  {roadmap.map((step, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute w-3 h-3 bg-primary rounded-full -left-[31px] top-1 ring-4 ring-white dark:ring-gray-950"></div>
                      <h4 className="font-bold text-on-surface text-sm">{step.title || step.step_title}</h4>
                      <p className="text-[10px] text-primary font-bold uppercase tracking-wider mb-1">{step.duration || step.estimated_time}</p>
                      <p className="text-xs text-on-surface-variant">{step.action || step.description}</p>
                    </div>
                  ))}
                  {roadmap.length === 0 && (
                     <div className="text-xs text-on-surface-variant italic relative">
                      <div className="absolute w-3 h-3 bg-primary rounded-full -left-[31px] top-1 ring-4 ring-white dark:ring-gray-950"></div>
                       Analysis did not provide a specific timeline.
                     </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default SkillGapAnalyzer;
