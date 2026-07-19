import React, { useState, useRef, useEffect } from 'react';

const AICareerMentor = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "Hello Diwakar! I'm your Career Mentor. I've analyzed your recent resume update and the job market trends in Data Science and Product Management. How can I help you accelerate your growth today?",
      suggestions: ['Resume Feedback', 'Interview Prep', 'Skill Mapping'],
    },
    {
      id: 2,
      sender: 'user',
      text: 'I want to transition into a Senior Product Manager role at a tier-1 tech company. What specific skills am I missing from my current profile?',
    },
    {
      id: 3,
      sender: 'ai',
      text: 'Based on current "Senior PM" listings at companies like Google, Stripe, and Meta, your experience in Agile Orchestration is strong, but you have two critical gaps:',
      bullets: [
        'Advanced Product Analytics: You need more exposure to SQL and data-driven decision frameworks (A/B testing at scale).',
        'Go-to-Market (GTM) Strategy: Senior roles require experience leading cross-functional launches beyond just the engineering phase.',
      ],
      note: "I've generated a 4-week roadmap to bridge these gaps. Would you like to see it?",
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const handleSend = (textToSend = inputText) => {
    if (!textToSend.trim()) return;

    const newUserMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: textToSend,
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response after 2 seconds
    setTimeout(() => {
      setIsTyping(false);
      const newAiMessage = {
        id: messages.length + 2,
        sender: 'ai',
        text: `That's a great question! For a Senior PM transition, we should focus on building a portfolio that demonstrates GTM strategy. I recommend you look into the 'ATS Score' analyzer to see how your profile parses, or check the 'Skill Gap Analyzer' where we have mapped your course timeline. Would you like me to recommend some mock interview cases?`,
      };
      setMessages((prev) => [...prev, newAiMessage]);
    }, 2000);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const suggestedQuestions = [
    'How do I answer "What is your favorite product?" in a Meta interview?',
    'What is the typical salary range for a Lead Data Scientist in New York?',
    'Review my resume for GTM keyword optimization.',
    'Create a 4-week study plan for system design.',
  ];

  return (
    <div className="flex h-[calc(100vh-120px)] border border-outline-variant/30 rounded-2xl overflow-hidden glass bg-white">
      {/* Chat Window */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-outline-variant/30 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-sm">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-primary">AI Career Mentor</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-ai-pulse"></span>
                <span className="text-[10px] text-outline font-bold tracking-wider uppercase">READY TO ASSIST</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 custom-scrollbar">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-4 max-w-3xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              {msg.sender === 'ai' ? (
                <div className="w-10 h-10 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white shadow-lg">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                </div>
              ) : (
                <img
                  className="w-10 h-10 rounded-full flex-shrink-0 object-cover border border-primary/20"
                  alt="User Profile"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCarTJulv0u346vguiunsBsyM9dCBrrPCEgKCCQq9yV7ZT4pagbeVgvLUYq3NCVJ9a4EgLgA7beiwqdLTghTmoNcvc_2QaoYSpVqW7T2fSyqYDZJywfPsOG2Jufwf7K3P-WQfH6N08lk2dSbrBZBep8FjJTGA1CdX0AKcE3xGEkVw0YkDMg5uEwxhfc7O9oIKul7oYtzonMymz10hVFDP4FzgAuhhbis5La_hbE7YNTh2sVJgfI6EM9h8XPmslyGYvLrn1GN1BlO9w4"
                />
              )}

              <div
                className={`p-5 rounded-2xl shadow-sm leading-relaxed text-sm ${
                  msg.sender === 'user'
                    ? 'bg-primary text-on-primary rounded-tr-none'
                    : 'bg-slate-50 border border-outline-variant/20 rounded-tl-none text-on-surface'
                }`}
              >
                {msg.sender === 'ai' && msg.bullets && (
                  <div className="inline-flex items-center gap-1.5 text-primary font-bold text-xs mb-3">
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    ANALYZING MARKET DATA
                  </div>
                )}
                <p>{msg.text}</p>

                {msg.bullets && (
                  <ul className="list-disc ml-5 mt-3 space-y-2 font-medium">
                    {msg.bullets.map((bullet, idx) => (
                      <li key={idx}>{bullet}</li>
                    ))}
                  </ul>
                )}

                {msg.note && (
                  <div className="mt-4 p-4 bg-white rounded-xl border border-outline-variant/30 flex items-center gap-3">
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

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-4 max-w-3xl">
              <div className="w-10 h-10 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white shadow-lg">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
              </div>
              <div className="bg-slate-50 border border-outline-variant/20 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                <div className="w-2 h-2 bg-outline rounded-full animate-typing"></div>
                <div className="w-2 h-2 bg-outline rounded-full animate-typing" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-outline rounded-full animate-typing" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-outline-variant/30">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-end gap-2 bg-surface-container-low border border-primary/20 rounded-2xl p-2 shadow-sm focus-within:ring-2 ring-primary/20 transition-all"
          >
            <button type="button" className="p-3 text-outline hover:text-primary transition-colors hover:bg-surface-container rounded-xl cursor-pointer">
              <span className="material-symbols-outlined text-xl">attach_file</span>
            </button>
            <textarea
              className="flex-1 bg-transparent border-none focus:ring-0 py-3 px-2 resize-none max-h-32 text-sm placeholder:text-outline-variant outline-none"
              placeholder="Ask your career mentor anything..."
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <div className="flex items-center gap-1 mb-1">
              <button type="button" className="p-3 text-outline hover:text-primary transition-colors hover:bg-surface-container rounded-xl cursor-pointer">
                <span className="material-symbols-outlined text-xl">mic</span>
              </button>
              <button
                type="submit"
                className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">send</span>
              </button>
            </div>
          </form>
          <p className="text-center text-[10px] text-outline mt-3 font-semibold tracking-tight">
            AI-generated advice should be verified against professional standards.
          </p>
        </div>
      </div>

      {/* Right Panel: Suggested Questions */}
      <aside className="hidden xl:flex w-80 flex-col border-l border-outline-variant/30 bg-slate-50 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>tips_and_updates</span>
          <h3 className="font-bold text-on-surface">Suggested Questions</h3>
        </div>
        <div className="space-y-2">
          {suggestedQuestions.map((q) => (
            <button
              key={q}
              onClick={() => handleSend(q)}
              className="w-full text-left p-4 bg-white border border-outline-variant/20 rounded-xl hover:bg-primary/5 hover:border-primary/40 text-xs font-semibold text-on-surface-variant transition-all hover:scale-[1.01] cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
};

export default AICareerMentor;
