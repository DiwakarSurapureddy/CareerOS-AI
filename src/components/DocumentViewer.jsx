import React, { useState, useEffect } from 'react';
import resumeService from '../services/resumeService';
import { useNavigate } from 'react-router-dom';

const DocumentViewer = ({ resume }) => {
  const navigate = useNavigate();
  const [fileUrl, setFileUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let objectUrl = null;

    const fetchFile = async () => {
      if (!resume || (!resume.id && !resume._id)) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const resumeId = resume.id || resume._id;
        const blob = await resumeService.downloadResumeFile(resumeId);
        objectUrl = URL.createObjectURL(blob);
        setFileUrl(objectUrl);
      } catch (err) {
        console.error('Failed to load document preview:', err);
        setError('Document preview is unavailable.');
      } finally {
        setLoading(false);
      }
    };

    fetchFile();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [resume]);

  if (!resume) {
    return (
      <div className="glass-panel p-8 rounded-2xl flex flex-col items-center justify-center text-center h-full min-h-[400px]">
        <span className="material-symbols-outlined text-[48px] text-outline mb-4">description</span>
        <h3 className="text-lg font-bold text-on-surface">No Document Selected</h3>
        <p className="text-sm text-on-surface-variant mt-2">Select a resume to view its contents.</p>
      </div>
    );
  }

  const isPdf = resume.file_type?.toLowerCase() === 'pdf' || resume.filename?.toLowerCase().endsWith('.pdf') || resume.original_filename?.toLowerCase().endsWith('.pdf');
  const isTxt = resume.file_type?.toLowerCase() === 'txt' || resume.filename?.toLowerCase().endsWith('.txt') || resume.original_filename?.toLowerCase().endsWith('.txt');
  const canPreview = isPdf || isTxt;
  const resumeId = resume.id || resume._id;

  const handleDownload = () => {
    if (fileUrl) {
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = resume.filename || resume.original_filename || 'resume';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="glass-panel rounded-2xl flex flex-col h-full overflow-hidden border border-primary/20">
      {/* Document Header */}
      <div className="bg-surface-container-low border-b border-outline-variant/30 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3 truncate">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined">{isPdf ? 'picture_as_pdf' : 'description'}</span>
          </div>
          <div className="truncate">
            <h4 className="font-bold text-sm text-on-surface truncate" title={resume.filename || resume.original_filename}>
              {resume.filename || resume.original_filename || 'Document Preview'}
            </h4>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
              {resume.file_type || 'PDF'} &bull; {resume.uploaded_at ? new Date(resume.uploaded_at).toLocaleDateString() : 'Just now'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {fileUrl && (
            <button 
              onClick={handleDownload}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-variant text-on-surface-variant transition-colors"
              title="Download Document"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
            </button>
          )}
        </div>
      </div>

      {/* Document Content Viewer */}
      <div className="flex-1 bg-surface-container-highest/30 relative min-h-[400px]">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-xs font-bold text-on-surface-variant">Loading document...</p>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
            <span className="material-symbols-outlined text-4xl text-error mb-2">error</span>
            <p className="text-sm font-bold text-on-surface">{error}</p>
          </div>
        ) : !canPreview ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-4">draft</span>
            <p className="text-sm font-bold text-on-surface">Preview Not Available</p>
            <p className="text-xs text-on-surface-variant mt-1 max-w-[250px]">
              This file format cannot be previewed natively in the browser. You can download the file to view it.
            </p>
            <button 
              onClick={handleDownload}
              className="mt-6 px-6 py-2 bg-primary text-white rounded-lg font-bold text-sm shadow-md hover:bg-primary/90 transition-colors"
            >
              Download File
            </button>
          </div>
        ) : (
          <iframe 
            src={`${fileUrl}#view=FitH`} 
            title="Resume Preview"
            className="w-full h-full border-none"
          />
        )}
      </div>
    </div>
  );
};

export default DocumentViewer;
