import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ResumeAnalyzer = () => {
  const navigate = useNavigate();
  const [uploaded, setUploaded] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = React.useRef(null);

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

  const handleFileSelect = (file) => {
    const validExtensions = ['pdf', 'docx', 'txt'];
    const extension = file.name.split('.').pop().toLowerCase();
    
    if (!validExtensions.includes(extension)) {
      alert('Invalid file format. Please upload PDF, DOCX, or TXT.');
      return;
    }

    setFileName(file.name);
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => setUploaded(true), 500);
      }
    }, 100);
  };

  const handleStartAnalysis = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      navigate('/ats-score');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h2 className="font-headline text-2xl font-bold text-on-surface">Resume Analyzer</h2>
        <p className="font-body-md text-on-surface-variant max-w-2xl">
          Upload your resume to receive a comprehensive AI-powered breakdown of your professional profile, ATS compatibility, and tailored career recommendations.
        </p>
      </div>

      {/* Upload Zone (Toggle visibility based on state) */}
      {!uploaded ? (
        <section className="transition-all duration-500">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !fileName && fileInputRef.current?.click()}
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
            />
            
            {!fileName ? (
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
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary">
                  <span className="material-symbols-outlined text-[32px]">description</span>
                </div>
                <h3 className="text-lg font-bold text-on-surface mb-4">{fileName}</h3>
                <div className="w-full bg-surface-container-highest rounded-full h-2 mb-2">
                  <div className="bg-primary h-2 rounded-full transition-all duration-200" style={{ width: `${uploadProgress}%` }}></div>
                </div>
                <p className="text-xs text-on-surface-variant font-semibold">Uploading... {uploadProgress}%</p>
              </div>
            )}
          </div>
        </section>
      ) : (
        /* Analysis Dashboard (Hidden initially) */
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Resume Preview (Mock) */}
          <div className="col-span-12 lg:col-span-5 h-[calc(100vh-280px)] sticky top-[100px]">
            <div className="glass-panel rounded-2xl h-full overflow-hidden flex flex-col shadow-lg bg-white">
              <div className="p-4 bg-surface-container border-b border-outline-variant/30 flex justify-between items-center">
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Document Preview</span>
                <div className="flex gap-2">
                  <button className="p-1 hover:bg-white rounded transition-colors cursor-pointer">
                    <span className="material-symbols-outlined text-[18px]">zoom_in</span>
                  </button>
                  <button className="p-1 hover:bg-white rounded transition-colors cursor-pointer">
                    <span className="material-symbols-outlined text-[18px]">download</span>
                  </button>
                </div>
              </div>
              <div className="flex-1 bg-surface-container-low p-6 overflow-y-auto custom-scrollbar">
                {/* Mock Resume Content */}
                <div className="bg-white shadow-sm p-8 min-h-[700px] border border-outline-variant/20 mx-auto max-w-[500px] text-[10px] text-on-surface-variant space-y-4">
                  <div className="text-center border-b pb-4">
                    <h4 className="text-sm font-bold text-on-surface">ALEXANDER RIVERA</h4>
                    <p>Senior Software Engineer • New York, NY • alex.rivera@example.com</p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-bold border-b text-primary uppercase tracking-tighter">Experience</p>
                    <div className="space-y-1">
                      <div className="flex justify-between font-bold text-on-surface">
                        <span>TechFlow Solutions</span>
                        <span>2019 - Present</span>
                      </div>
                      <p className="italic">Senior Full Stack Developer</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Led the transition from monolithic architecture to microservices using Node.js and AWS, improving system reliability by 40%.</li>
                        <li>Developed and maintained high-traffic web applications serving 2M+ active monthly users using React and GraphQL.</li>
                        <li>Mentored a team of 6 junior developers, implementing code review best practices and automated testing workflows.</li>
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-2 opacity-50">
                    <p className="font-bold border-b text-primary uppercase tracking-tighter">Education</p>
                    <p className="font-semibold text-on-surface">M.S. in Computer Science</p>
                    <p>Georgia Institute of Technology</p>
                    <p className="font-semibold text-on-surface mt-1">B.S. in Software Engineering</p>
                    <p>University of Michigan</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Extracted Information */}
          <div className="col-span-12 lg:col-span-7 space-y-6">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 glass-panel rounded-2xl border-l-4 border-primary gap-4">
              <div>
                <span className="text-[10px] font-bold text-primary tracking-widest uppercase block">READY FOR DEEP ANALYSIS</span>
                <h4 className="text-lg font-bold text-on-surface mt-0.5">Resume Successfully Parsed</h4>
              </div>
              <button
                disabled={analyzing}
                onClick={handleStartAnalysis}
                className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/95 shadow-lg flex items-center gap-2 active:scale-95 transition-all cursor-pointer w-full sm:w-auto justify-center"
              >
                {analyzing ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">analytics</span>
                    Analyze Resume
                  </>
                )}
              </button>
            </div>

            {/* Information Bento Grid */}
            <div className="glass-panel p-6 rounded-2xl space-y-6">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold text-on-surface-variant tracking-wider flex items-center gap-2 uppercase">
                  <span className="material-symbols-outlined text-primary text-[18px]">person</span>
                  IDENTIFIED PROFILE
                </h5>
                <button className="text-primary hover:underline text-xs font-bold cursor-pointer">Edit Info</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-on-surface-variant">Full Name</p>
                  <p className="font-semibold text-on-surface text-sm mt-1">Alexander Rivera</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant">Location</p>
                  <p className="font-semibold text-on-surface text-sm mt-1">New York, NY</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant">Email</p>
                  <p className="font-semibold text-on-surface text-sm mt-1">alex.rivera@example.com</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant">Parsed Experience</p>
                  <p className="font-semibold text-on-surface text-sm mt-1">7 Years (Senior)</p>
                </div>
              </div>
            </div>

            {/* Extracted Skills Bento Card */}
            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <h5 className="text-xs font-bold text-on-surface-variant tracking-wider flex items-center gap-2 uppercase">
                <span className="material-symbols-outlined text-secondary text-[18px]">psychology</span>
                Extracted Skills
              </h5>
              <div className="flex flex-wrap gap-2 pt-2">
                {['React', 'Node.js', 'AWS', 'GraphQL', 'Microservices', 'Git', 'Agile', 'SQL', 'TypeScript'].map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 bg-surface-container-high text-on-surface text-xs font-semibold rounded-full border border-outline-variant/30"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default ResumeAnalyzer;
