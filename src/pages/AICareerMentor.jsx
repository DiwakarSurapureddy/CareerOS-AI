import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import chatService from '../services/chatService';
import resumeService from '../services/resumeService';
import { useAuth } from '../context/AuthContext';

const API_DOMAIN = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace('/api', '');
const getFullAvatarUrl = (path) => path ? (path.startsWith('http') ? path : `${API_DOMAIN}${path}`) : null;

const AICareerMentor = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { resumeId } = useParams();

  const defaultInitialMessage = {
    id: 1,
    sender: 'ai',
    text: "Hello! I am your Gemini AI Career Mentor. I've analyzed your resume credentials and active job market trends in software engineering and technology leadership. How can I help accelerate your career growth today?",
    suggestions: ['Resume Feedback', 'Interview Prep', 'Skill Mapping'],
  };

  const [messages, setMessages] = useState([defaultInitialMessage]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const initChat = async () => {
      setLoadingHistory(true);
      setError(null);
      try {
        let currentId = resumeId || localStorage.getItem('current_resume_id');
        if (!currentId) {
          const resumeRes = await resumeService.getResumes();
          if (resumeRes.success && resumeRes.data?.resumes?.length > 0) {
            currentId = resumeRes.data.resumes[0].id || resumeRes.data.resumes[0]._id;
            localStorage.setItem('current_resume_id', currentId);
            navigate(`/ai-career-mentor/${currentId}`, { replace: true });
          } else {
            setLoadingHistory(false);
            return;
          }
        } else if (!resumeId) {
          navigate(`/ai-career-mentor/${currentId}`, { replace: true });
        }

        if (currentId) {
          const historyRes = await chatService.getConversation(currentId);
          if (historyRes.success && historyRes.data && Array.isArray(historyRes.data.messages)) {
            const hist = historyRes.data.messages;
            if (hist.length > 0) {
              const formattedHist = [defaultInitialMessage];
              hist.forEach((m, idx) => {
                const role = m.sender || m.role || (m.is_user ? 'user' : 'ai');
                formattedHist.push({
                  id: idx + 2,
                  sender: role === 'user' ? 'user' : 'ai',
                  text: m.message || m.content || m.text || JSON.stringify(m)
                });
              });
              setMessages(formattedHist);
            } else {
              setMessages([defaultInitialMessage]);
            }
          } else {
             setMessages([defaultInitialMessage]);
          }
        }
      } catch (err) {
        console.warn('Could not load chat history:', err);
      } finally {
        setLoadingHistory(false);
      }
    };

    initChat();
    // eslint-disable-next-line
  }, [resumeId]);

  const handleSend = async (textToSend = inputText) => {
    if (!textToSend.trim() || isTyping || !resumeId) return;

    setError(null);
    const userMsgText = textToSend.trim();
    const newUserMessage = {
      id: Date.now(),
      sender: 'user',
      text: userMsgText,
    };

    setMessages((prev) => [...prev, newUserMessage]);
    if (textToSend === inputText) setInputText('');
    setIsTyping(true);

    try {
      const res = await chatService.sendMessage(userMsgText, resumeId);

      if (res.success && res.data) {
        const aiReply = res.data.assistant_message || res.data.reply || res.data.response || res.data.answer || "I have analyzed your career inquiry against our Gemini skill gap model. Feel free to explore the ATS and Skill Gap dashboards for detailed tactical advice.";
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'ai',
            text: aiReply,
          }
        ]);
      } else {
        throw new Error(res.message || 'AI mentor service unavailable.');
      }
    } catch (err) {
      console.error('Chat send error:', err);
      setError(err.userMessage || 'Could not reach Gemini AI mentor. Please try again.');
      // Revert the optimistic update if we want, or just leave it and show error.
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear your conversation history with the AI Mentor?')) return;
    setError(null);
    try {
      if (resumeId) {
        await chatService.deleteConversation(resumeId);
      }
      setMessages([defaultInitialMessage]);
    } catch (err) {
      console.error('Error clearing history:', err);
      setError('Could not clear conversation history on server.');
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const suggestedQuestions = [
    'How do I articulate leadership achievements in a technical systems interview?',
    'What is the typical salary range and growth trajectory for an AI Engineer?',
    'Review my parsed resume competencies for targeted keyword optimization.',
    'Create a structured 4-week study plan for conquering scalable distributed architecture.',
  ];

  // EMPTY STATE
  if (!loadingHistory && !resumeId && !localStorage.getItem('current_resume_id')) {
    return (
      <div className="space-y-6">
        <section className="relative overflow-hidden glass-panel rounded-2xl p-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="relative z-10">
            <h2 className="font-display-lg text-3xl md:text-4xl font-extrabold text-on-surface mb-2">AI Career Mentor</h2>
            <p className="text-lg text-on-surface-variant mb-6">Select or upload a resume to start chatting with your personalized mentor.</p>
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
    <div className="flex h-[calc(100vh-120px)] border border-outline-variant/30 rounded-2xl overflow-hidden glass bg-white dark:bg-gray-900">
      {/* Chat Window */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-outline-variant/30 flex items-center justify-between bg-slate-50 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-sm">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-primary">AI Career Mentor (Gemini Powered)</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-ai-pulse"></span>
                <span className="text-[10px] text-outline font-bold tracking-wider uppercase">READY TO ASSIST</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleClearHistory}
            className="px-3 py-1.5 bg-surface-container hover:bg-red-50 dark:hover:bg-red-950/20 text-on-surface-variant hover:text-red-600 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Clear Chat Transcript"
          >
            <span className="material-symbols-outlined text-sm">delete_sweep</span>
            Clear History
          </button>
        </div>

        {/* Notifications */}
        {error && (
          <div className="px-6 py-2 bg-red-100 dark:bg-red-900/30 border-b border-red-400 dark:border-red-700 text-red-800 dark:text-red-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">error</span>
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="font-bold hover:opacity-75 cursor-pointer">✕</button>
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 custom-scrollbar">
          {loadingHistory && (
            <div className="text-center text-xs text-on-surface-variant py-2 italic flex items-center justify-center gap-2">
              <span className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
              Loading conversational history...
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-4 max-w-3xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              {msg.sender === 'ai' ? (
                <div className="w-10 h-10 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white shadow-lg">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                </div>
              ) : currentUser?.profile_image ? (
                <img
                  className="w-10 h-10 rounded-full flex-shrink-0 object-cover border border-primary/20"
                  alt="User Profile"
                  src={getFullAvatarUrl(currentUser.profile_image)}
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center border-2 border-primary/20 flex-shrink-0 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[20px]">person</span>
                </div>
              )}

              <div
                className={`p-5 rounded-2xl shadow-sm leading-relaxed text-sm ${
                  msg.sender === 'user'
                    ? 'bg-primary text-on-primary rounded-tr-none'
                    : 'bg-slate-50 dark:bg-gray-800 border border-outline-variant/20 rounded-tl-none text-on-surface'
                }`}
              >
                {msg.sender === 'ai' && msg.bullets && (
                  <div className="inline-flex items-center gap-1.5 text-primary font-bold text-xs mb-3">
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    ANALYZING MARKET DATA
                  </div>
                )}
                <p className="whitespace-pre-wrap">{msg.text}</p>

                {msg.bullets && (
                  <ul className="list-disc ml-5 mt-3 space-y-2 font-medium">
                    {msg.bullets.map((bullet, idx) => (
                      <li key={idx}>{bullet}</li>
                    ))}
                  </ul>
                )}

                {msg.note && (
                  <div className="mt-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-outline-variant/30 flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">auto_graph</span>
                    <span className="text-xs font-semibold text-on-surface-variant">{msg.note}</span>
                  </div>
                )}

                {msg.suggestions && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {msg.suggestions.map((sug) => (
                      <button
                        key={sug}
                        onClick={() => handleSend(`Tell me more about ${sug}`)}
                        className="px-3 py-1 bg-primary/5 border border-primary/20 text-primary text-xs font-bold rounded-full hover:bg-primary hover:text-white transition-colors cursor-pointer"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-4 max-w-3xl">
              <div className="w-10 h-10 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white shadow-lg">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
              </div>
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-gray-800 border border-outline-variant/20 rounded-tl-none flex items-center gap-1.5">
                <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-white dark:bg-gray-900 border-t border-outline-variant/30">
          <div className="relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              placeholder="Ask for resume optimization tips, interview strategies, or market trends..."
              className="w-full bg-surface-container-highest border border-outline-variant/40 rounded-2xl py-4 pl-6 pr-16 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
              disabled={isTyping || loadingHistory}
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputText.trim() || isTyping}
              className="absolute right-3 top-2.5 w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 disabled:hover:bg-primary transition-all cursor-pointer shadow-md"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
            </button>
          </div>
          <div className="mt-3 flex items-center justify-between px-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
            <span>Powered by Gemini AI</span>
            <span className="flex items-center gap-1 hover:text-primary cursor-pointer transition-colors">
              <span className="material-symbols-outlined text-[14px]">history</span> View History
            </span>
          </div>
        </div>
      </div>

      {/* Recommended Topics Sidebar (Desktop only) */}
      <div className="hidden lg:flex w-80 bg-slate-50 dark:bg-gray-900 border-l border-outline-variant/30 flex-col p-6 overflow-y-auto custom-scrollbar">
        <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[18px]">lightbulb</span>
          Suggested Inquiries
        </h3>
        
        <div className="space-y-4">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              disabled={isTyping}
              className="w-full text-left p-4 bg-white dark:bg-gray-800 border border-outline-variant/30 hover:border-primary/40 rounded-xl text-xs text-on-surface-variant hover:text-on-surface transition-all shadow-sm cursor-pointer group disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px] text-primary mb-2 block group-hover:scale-110 transition-transform">chat_bubble</span>
              {q}
            </button>
          ))}
        </div>

        <div className="mt-auto pt-8">
          <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
            <h4 className="text-xs font-bold text-primary mb-1">Context Aware</h4>
            <p className="text-[10px] text-on-surface-variant leading-relaxed">
              Your AI Mentor automatically has context of your uploaded resume, ATS scores, and identified skill gaps.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICareerMentor;
