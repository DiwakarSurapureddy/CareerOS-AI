import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import resumeService from '../services/resumeService';

const ResumeAnalyzer = () => {
  const navigate = useNavigate();
  const { resumeId } = useParams();
  
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const fileInputRef = useRef(null);

  // Fetch candidate resumes on component mount
  const fetchResumes = async () => {
    setLoadingList(true);
    try {
      const res = await resumeService.getResumes();
      if (res.success && res.data && res.data.resumes) {
        setResumes(res.data.resumes);
        
        // Auto-select logic if no URL param is given
        if (!resumeId) {
          const savedId = localStorage.getItem('current_resume_id');
          if (savedId && res.data.resumes.find(r => (r.id || r._id) === savedId)) {
            navigate(`/resume-analyzer/${savedId}`, { replace: true });
          } else if (res.data.resumes.length > 0) {
            navigate(`/resume-analyzer/${res.data.resumes[0].id || res.data.resumes[0]._id}`, { replace: true });
          }
        }
      }
    } catch (err) {
      console.warn('Could not load resumes:', err.userMessage || err.message);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchResumes();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (resumeId) {
      loadResumeDetails(resumeId);
    } else {
      setSelectedResume(null);
    }
  }, [resumeId]);

  const loadResumeDetails = async (id) => {
    setError(null);
    try {
      const res = await resumeService.getResume(id);
      if (res.success && res.data && res.data.data) {
        // Backend returns the resume under res.data.data
        const r = res.data.data;
        setSelectedResume(r);
        localStorage.setItem('current_resume_id', r.id || r._id);
        setFileName(r.original_filename || 'Uploaded Resume');
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to load resume details.');
    }
  };

  const handleSelectResume = (id) => {
    navigate(`/resume-analyzer/${id}`);
  };

  const handleDeleteResume = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this resume?')) return;
    setDeletingId(id);
    setError(null);
    try {
      const res = await resumeService.deleteResume(id);
      if (res.success) {
        setSuccessMsg('Resume deleted successfully.');
        setTimeout(() => setSuccessMsg(null), 3500);
        
        if (resumeId === id) {
          setSelectedResume(null);
          localStorage.removeItem('current_resume_id');
          navigate('/resume-analyzer', { replace: true });
        }
        await fetchResumes();
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to delete resume.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleFileSelect = async (file) => {
    const validExtensions = ['pdf', 'docx', 'txt'];
    const extension = file.name.split('.').pop().toLowerCase();
    
    if (!validExtensions.includes(extension)) {
      setError('Invalid file format. Please upload PDF, DOCX, or TXT document.');
      return;
    }

    setFileName(file.name);
    setUploading(true);
    setError(null);
    setSuccessMsg(null);
    setUploadProgress(10);

    try {
      const res = await resumeService.uploadResume(file, (progress) => {
        setUploadProgress(progress > 10 ? progress : 25);
      });

      if (res.success && res.data) {
        const uploadedId = res.data.resume_id;
        localStorage.setItem('current_resume_id', uploadedId);
        setUploadProgress(100);
        setSuccessMsg('Resume successfully parsed and added to your portfolio!');
        setTimeout(() => setSuccessMsg(null), 4000);
        await fetchResumes();
        navigate(`/resume-analyzer/${uploadedId}`);
      } else {
        setError(res.message || 'Upload analysis failed.');
      }
    } catch (err) {
      setError(err.userMessage || 'Upload error. Ensure the server is reachable and file is under 10MB.');
    } finally {
      setUploading(false);
    }
  };

  const handleStartAnalysis = () => {
    if (!selectedResume) {
      setError('Please upload or select an existing resume to analyze.');
      return;
    }
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      navigate(`/dashboard/${resumeId}`);
    }, 800);
  };

  // Helper getters for parsed resume data
  const parsed = selectedResume?.parsed_data || {};
  const extractedSkills = Array.isArray(parsed?.skills) ? parsed.skills.flatMap(s => typeof s === 'string' ? s : s.items || []) : [];
  const candidateName = parsed?.name || selectedResume?.filename?.replace(/\.[^/.]+$/, '');
  const candidateEmail = parsed?.email || '';
  const candidatePhone = parsed?.phone || '';
  const candidateLocation = parsed?.location || '';
  const education = parsed?.education || [];
  const experience = parsed?.experience || [];
  const projects = parsed?.projects || [];
  const certifications = parsed?.certifications || [];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="font-headline text-2xl font-bold text-on-surface">Resume Analyzer</h2>
          <p className="font-body-md text-on-surface-variant max-w-2xl">
            Upload your resume to receive a comprehensive AI-powered breakdown of your professional profile, ATS compatibility, and tailored career recommendations.
          </p>
        </div>
        {selectedResume && (
          <button
            onClick={() => navigate('/resume-analyzer')}
            className="px-4 py-2 bg-surface-container-high hover:bg-surface-variant text-on-surface text-sm font-semibold rounded-lg transition-all self-start cursor-pointer"
          >
            + Upload New Resume
          </button>
        )}
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">error</span>
            <span className="text-sm">{error}</span>
          </div>
          <button onClick={() => setError(null)} className="font-bold text-xs hover:opacity-75 cursor-pointer">✕</button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 rounded-xl flex items-center gap-2 animate-fadeIn">
          <span className="material-symbols-outlined text-sm">check_circle</span>
          <span className="text-sm font-medium">{successMsg}</span>
        </div>
      )}

      {/* Upload Zone & Saved Resumes Section */}
      {!selectedResume && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <section className="col-span-12 lg:col-span-8 transition-all duration-500">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => !uploading && fileInputRef.current?.click()}
              className={`glass-panel rounded-2xl p-16 flex flex-col items-center justify-center text-center border-2 border-dashed transition-all cursor-pointer group ai-glow ${
                dragActive ? 'border-primary bg-primary/5' : 'border-primary/20 hover:border-primary/40'
              }`}
            >
              <input 
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf,.docx,.txt"
                onChange={handleInputChange}
                disabled={uploading}
              />
              
              {!uploading ? (
                <>
                  <div className="w-20 h-20 bg-primary-container/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-primary text-[48px]">cloud_upload</span>
                  </div>
                  <h3 className="text-xl font-bold text-on-surface mb-2">Drag & drop your resume</h3>
                  <p className="text-sm text-on-surface-variant mb-6">Supports PDF, DOCX, and TXT up to 10MB</p>
                  <button 
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 shadow-md transition-all cursor-pointer"
                  >
                    Browse Files
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center w-full max-w-md">
                  <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary animate-bounce">
                    <span className="material-symbols-outlined text-[32px]">description</span>
                  </div>
                  <h3 className="text-lg font-bold text-on-surface mb-4">{fileName || 'Processing Document...'}</h3>
                  <div className="w-full bg-surface-container-highest rounded-full h-2 mb-2 overflow-hidden">
                    <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                  <p className="text-xs text-on-surface-variant font-semibold">Extracting unstructured career data... {uploadProgress}%</p>
                </div>
              )}
            </div>
          </section>

          {/* Saved Resumes List Card */}
          <aside className="col-span-12 lg:col-span-4 glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-sm">folder</span>
                Your Saved Resumes ({resumes.length})
              </h4>
            </div>

            {loadingList ? (
              <div className="py-8 text-center text-on-surface-variant text-sm flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                Loading documents...
              </div>
            ) : resumes.length === 0 ? (
              <div className="py-8 text-center text-on-surface-variant text-xs italic">
                No saved resumes found. Upload your first document to unlock AI Career tools!
              </div>
            ) : (
              <ul className="space-y-2 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
                {resumes.map((r) => {
                  const id = r.id || r._id;
                  const isDeleting = deletingId === id;
                  const isActive = id === resumeId;
                  const pData = r.parsed_data || {};
                  
                  return (
                    <li
                      key={id}
                      onClick={() => handleSelectResume(id)}
                      className={`p-3 bg-surface-container-low hover:bg-surface-container rounded-xl flex flex-col justify-between cursor-pointer transition-all border group ${
                        isActive ? 'border-primary shadow-sm bg-primary/5' : 'border-transparent hover:border-primary/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 truncate pr-2">
                          <span className="material-symbols-outlined text-primary text-lg">description</span>
                          <div className="truncate">
                            <p className="text-sm font-bold text-on-surface truncate">{r.filename || r.original_filename}</p>
                            <p className="text-[10px] text-on-surface-variant font-medium mt-0.5 uppercase tracking-wider">
                              {r.file_type || 'PDF'} &bull; {new Date(r.uploaded_at || r.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleDeleteResume(e, id)}
                          disabled={isDeleting}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors flex-shrink-0 cursor-pointer"
                          title="Delete Resume"
                        >
                          {isDeleting ? (
                            <span className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></span>
                          ) : (
                            <span className="material-symbols-outlined text-sm">delete</span>
                          )}
                        </button>
                      </div>
                      
                      {/* Parsed Data Preview if exists */}
                      <div className="mt-3 pt-3 border-t border-outline-variant/20 flex flex-col gap-1">
                        <p className="text-[11px] text-on-surface-variant font-semibold">
                          <span className="text-on-surface">Candidate:</span> {pData.full_name || pData.name || 'Unknown'}
                        </p>
                        <p className="text-[11px] text-on-surface-variant font-semibold truncate">
                          <span className="text-on-surface">Target Role:</span> {pData.current_role || pData.target_role || 'Not set'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-[9px] font-bold uppercase tracking-wider">
                            Ready for AI Analysis
                          </span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </aside>
        </div>
      )}

      {/* Selected Resume Analysis Overview */}
      {selectedResume && (
        <div className="space-y-6 animate-fadeIn">
          {/* Action Header */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 border border-primary/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-[24px]">verified</span>
              </div>
              <div>
                <h3 className="font-bold text-lg text-on-surface">Data Extracted Successfully</h3>
                <p className="text-sm text-on-surface-variant flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  Ready for AI Career OS pipelines
                </p>
              </div>
            </div>
            <button
              onClick={handleStartAnalysis}
              disabled={analyzing}
              className="px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg hover:bg-primary/90 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 disabled:opacity-70 disabled:hover:scale-100 cursor-pointer"
            >
              {analyzing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Generating Career Profile...
                </>
              ) : (
                <>
                  Generate AI Dashboard <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Parsed Document Details */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Personal Info Card */}
              <div className="glass-panel p-6 rounded-2xl">
                <h4 className="text-sm font-bold uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">person</span>
                  Personal Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-outline">Full Name</p>
                    <p className="text-on-surface font-semibold">{candidateName || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-outline">Email Address</p>
                    <p className="text-on-surface font-semibold">{candidateEmail || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-outline">Phone Number</p>
                    <p className="text-on-surface font-semibold">{candidatePhone || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-outline">Location</p>
                    <p className="text-on-surface font-semibold">{candidateLocation || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Professional Summary */}
              <div className="glass-panel p-6 rounded-2xl">
                <h4 className="text-sm font-bold uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">article</span>
                  Professional Summary
                </h4>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {parsed.professional_summary || parsed.summary || 'No professional summary found in document.'}
                </p>
              </div>

              {/* Experience */}
              <div className="glass-panel p-6 rounded-2xl">
                <h4 className="text-sm font-bold uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">work</span>
                  Experience ({experience.length})
                </h4>
                {experience.length > 0 ? (
                  <div className="space-y-6">
                    {experience.map((exp, idx) => (
                      <div key={idx} className="relative pl-4 border-l-2 border-outline-variant/30">
                        <div className="absolute w-2 h-2 rounded-full bg-primary -left-[5px] top-1.5"></div>
                        <h5 className="font-bold text-on-surface">{exp.title || exp.job_title}</h5>
                        <p className="text-xs font-semibold text-primary">{exp.company || exp.company_name} <span className="text-on-surface-variant">| {exp.duration || exp.date || exp.dates}</span></p>
                        {Array.isArray(exp.responsibilities) && exp.responsibilities.length > 0 && (
                          <ul className="mt-3 space-y-1">
                            {exp.responsibilities.map((res, rIdx) => (
                              <li key={rIdx} className="text-xs text-on-surface-variant flex items-start gap-2">
                                <span className="material-symbols-outlined text-[12px] text-primary mt-0.5">arrow_right</span>
                                <span>{res}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        {typeof exp.description === 'string' && (
                           <p className="mt-2 text-xs text-on-surface-variant">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-on-surface-variant italic">No experience entries successfully extracted.</p>
                )}
              </div>

              {/* Education & Projects */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-panel p-6 rounded-2xl">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">school</span>
                    Education
                  </h4>
                  {education.length > 0 ? (
                    <div className="space-y-4">
                      {education.map((edu, idx) => (
                        <div key={idx}>
                          <h5 className="text-sm font-bold text-on-surface">{edu.degree}</h5>
                          <p className="text-xs text-on-surface-variant">{edu.institution || edu.university}</p>
                          <p className="text-[10px] font-semibold text-primary">{edu.year || edu.date}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-on-surface-variant italic">No education extracted.</p>
                  )}
                </div>

                <div className="glass-panel p-6 rounded-2xl">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
                    Projects
                  </h4>
                  {projects.length > 0 ? (
                    <div className="space-y-4">
                      {projects.map((proj, idx) => (
                        <div key={idx}>
                          <h5 className="text-sm font-bold text-on-surface">{proj.name || proj.project_name || 'Project'}</h5>
                          <p className="text-xs text-on-surface-variant line-clamp-2 mt-1">{proj.description}</p>
                          {proj.technologies && (
                             <p className="text-[10px] font-semibold text-primary mt-1">{Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-on-surface-variant italic">No projects extracted.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Skills & Meta Data */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Document Meta */}
              <div className="glass-panel p-6 rounded-2xl bg-surface-container-low">
                <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface mb-4">File Details</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-outline-variant/30 pb-2">
                    <span className="text-xs font-medium text-on-surface-variant">File Name</span>
                    <span className="text-xs font-bold text-on-surface truncate max-w-[150px]" title={selectedResume.original_filename}>{selectedResume.original_filename}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-outline-variant/30 pb-2">
                    <span className="text-xs font-medium text-on-surface-variant">Type</span>
                    <span className="text-xs font-bold text-on-surface uppercase">{selectedResume.file_type || 'PDF'}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-outline-variant/30 pb-2">
                    <span className="text-xs font-medium text-on-surface-variant">Size</span>
                    <span className="text-xs font-bold text-on-surface">{(selectedResume.file_size / 1024).toFixed(1)} KB</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-on-surface-variant">Uploaded</span>
                    <span className="text-xs font-bold text-on-surface">{new Date(selectedResume.uploaded_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Skills Card */}
              <div className="glass-panel p-6 rounded-2xl">
                <h4 className="text-sm font-bold uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">build</span>
                  Extracted Skills ({extractedSkills.length})
                </h4>
                {extractedSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {extractedSkills.map((skill, idx) => (
                      <span key={idx} className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-[11px] font-bold">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-on-surface-variant italic">No explicit skills detected.</p>
                )}
              </div>
              
              {/* Certifications Card */}
              <div className="glass-panel p-6 rounded-2xl">
                <h4 className="text-sm font-bold uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
                  Certifications ({certifications.length})
                </h4>
                {certifications.length > 0 ? (
                  <ul className="space-y-3">
                    {certifications.map((cert, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-tertiary text-sm mt-0.5">verified</span>
                        <div>
                          <p className="text-xs font-bold text-on-surface">{cert.name || cert.certification_name}</p>
                          <p className="text-[10px] text-on-surface-variant">{cert.issuer || cert.issuing_organization} {cert.date ? `(${cert.date})` : ''}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-on-surface-variant italic">No certifications detected.</p>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeAnalyzer;
