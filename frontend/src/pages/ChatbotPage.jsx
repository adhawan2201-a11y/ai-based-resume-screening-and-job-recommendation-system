import { useState, useRef, useEffect } from 'react';
import { chatAPI } from '../services/api';
import ReactMarkdown from 'react-markdown';
import { FiSend, FiUser, FiCpu, FiPlus, FiArrowRight, FiZap, FiMessageSquare } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function ChatbotPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial Greeting
  useEffect(() => {
    if (messages.length === 0) {
      const timer = setTimeout(() => {
        setMessages([{ 
          role: 'bot', 
          content: '👋 **Hello! I am your AI Career Oracle.**\n\nI have cross-referenced your profile with live market data. I am ready to identify your career bottlenecks, suggest strategic skill acquisitions, or find high-match roles. Where should we begin?',
          suggestions: ['Recommended Jobs', 'Analyze skill gaps', 'Audit my resume', 'Explain match score']
        }]);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const quickActions = [
    { label: 'Recommended Jobs', icon: <FiArrowRight /> },
    { label: 'Analyze skill gaps', icon: <FiPlus /> },
    { label: 'Audit my resume', icon: <FiSend /> },
    { label: 'Explain match score', icon: <FiCpu /> }
  ];

  const handleSend = async (text = input) => {
    const messageText = text.trim();
    if (!messageText) return;

    const userMessage = { role: 'user', content: messageText };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const history = newMessages.slice(-6).map(m => ({ role: m.role, content: m.content }));
      const res = await chatAPI.send(messageText, history);
      const botMessage = { 
        role: 'bot', 
        content: res.data.reply,
        suggestions: ['Recommended Jobs', 'Analyze skill gaps', 'Audit my resume', 'Explain match score']
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      toast.error('Neural Link Interrupted');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#03050d] text-slate-300 relative overflow-hidden font-sans selection:bg-indigo-500/30">
      {/* 🌌 BALANCED ATMOSPHERIC BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] brightness-125"></div>
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '48px 48px' }}></div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-12 h-screen relative z-10 flex flex-col">
        
        {/* 👑 PREMIUM HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-3xl shadow-2xl shadow-indigo-900/40 border border-white/10 group animate-float">
              <FiCpu />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Career Intelligence <span className="text-indigo-400">Oracle</span></h1>
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                 <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Neural Processing Online</p>
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-white/[0.02] border border-white/5 rounded-xl backdrop-blur-xl">
             <FiZap className="text-amber-500 text-xs" />
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">v2.4 Core Analysis</span>
          </div>
        </div>

        {/* 💬 CHAT INTERFACE */}
        <div className="flex-1 overflow-hidden bg-white/[0.02] rounded-[2.5rem] border border-white/10 shadow-2xl backdrop-blur-3xl flex flex-col mb-6 relative group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-[80px] pointer-events-none"></div>
          
          <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
            {messages.length === 1 && messages[0].role === 'bot' ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-8 relative z-10">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-24 h-24 rounded-[2.5rem] bg-indigo-500/10 flex items-center justify-center mb-8 border border-indigo-500/10 shadow-inner"
                >
                  <FiMessageSquare className="text-4xl text-indigo-400" />
                </motion.div>
                <h3 className="text-2xl font-black text-white mb-4 tracking-tight">Direct Intelligence Link</h3>
                <p className="text-slate-500 text-sm max-w-md leading-relaxed mb-10 font-medium">
                  I can interpret complex resume data, explain job matching logic, and suggest high-impact career pivots.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
                  {quickActions.map((action, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSend(action.label)}
                      className="flex items-center justify-between p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.04] transition-all text-left shadow-lg"
                    >
                      <span className="text-xs font-black text-slate-300 uppercase tracking-widest">{action.label}</span>
                      <span className="text-indigo-400 p-2 bg-indigo-500/10 rounded-lg">{action.icon}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-10">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                        msg.role === 'user' ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-900/30' : 'bg-slate-900 border-white/5 shadow-lg'
                      }`}>
                        {msg.role === 'user' ? <FiUser className="text-white text-lg" /> : <FiCpu className="text-indigo-400 text-lg" />}
                      </div>
                      <div className="space-y-3">
                        <div className={`p-6 rounded-[2rem] border ${
                          msg.role === 'user' 
                            ? 'bg-indigo-600/10 border-indigo-500/20 text-white rounded-tr-none shadow-xl' 
                            : 'bg-white/[0.03] border-white/10 text-slate-200 rounded-tl-none shadow-xl'
                        }`}>
                          <ReactMarkdown className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-strong:text-indigo-400 prose-strong:font-black">
                            {msg.content.replace(/JOB_ID:[a-f\d]{24}/g, '')}
                          </ReactMarkdown>
                          
                          {msg.role === 'bot' && msg.content.includes('JOB_ID:') && (
                            <div className="mt-6 p-5 rounded-3xl bg-black/40 border border-white/10 flex items-center justify-between group/job">
                              <div>
                                <p className="text-[9px] text-indigo-400 font-black uppercase tracking-widest mb-1">Intelligence Match Found</p>
                                <p className="text-xs font-black text-white tracking-tight">Direct Access to Job Parameters</p>
                              </div>
                              <button
                                onClick={() => window.location.href = `/jobs?id=${msg.content.match(/JOB_ID:([a-f\d]{24})/)[1]}`}
                                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-900/20 flex items-center gap-2"
                              >
                                View Specs <FiArrowRight className="group-hover/job:translate-x-1 transition-transform" />
                              </button>
                            </div>
                          )}
                        </div>
                        
                        {msg.role === 'bot' && msg.suggestions && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {msg.suggestions.map((opt, j) => (
                              <button
                                key={j}
                                onClick={() => handleSend(opt)}
                                className="px-4 py-2 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-[10px] font-black uppercase tracking-widest text-indigo-300 hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all shadow-sm"
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center">
                        <FiCpu className="text-indigo-400 text-lg animate-pulse" />
                      </div>
                      <div className="bg-white/[0.03] border border-white/10 p-6 rounded-[2rem] rounded-tl-none flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* ✍️ INPUT ENGINE */}
          <div className="p-8 border-t border-white/5 bg-white/[0.01]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="relative group/form"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-[2rem] blur-xl opacity-0 group-focus-within/form:opacity-100 transition-opacity"></div>
              <div className="relative">
                 <input
                   type="text"
                   value={input}
                   onChange={(e) => setInput(e.target.value)}
                   placeholder="Prompt the Oracle for career insights..."
                   className="w-full bg-white/[0.03] border border-white/10 rounded-[2rem] pl-8 pr-16 py-6 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all font-medium placeholder:text-slate-600"
                 />
                 <button
                   type="submit"
                   disabled={loading || !input.trim()}
                   className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-900/40 disabled:opacity-50 group/btn"
                 >
                   <FiSend className="text-xl group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                 </button>
              </div>
            </form>
            <p className="text-center text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] mt-6">
              Neural Processing Architecture • Optimized for Career Intelligence
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
