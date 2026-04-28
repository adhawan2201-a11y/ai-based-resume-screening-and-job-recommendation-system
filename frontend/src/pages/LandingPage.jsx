import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiArrowRight, FiCpu, FiTarget, FiTrendingUp, FiCheckCircle, 
  FiBriefcase, FiUsers, FiBarChart2, FiMenu, FiX, FiStar, FiZap, 
  FiFileText, FiUploadCloud, FiSearch, FiCode
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [viewMode, setViewMode] = useState('candidate'); // 'candidate' | 'recruiter'

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetStarted = () => {
    if (user) {
      if (user.role === 'candidate') navigate('/candidate-dashboard');
      else if (user.role === 'recruiter') navigate('/recruiter-dashboard');
      else if (user.role === 'admin') navigate('/admin-dashboard');
    } else {
      setShowRoleModal(true);
    }
  };

  const selectRoleAndRegister = (selectedRole) => {
    setShowRoleModal(false);
    navigate(`/register?role=${selectedRole}`);
  };

  const handleAction = (path) => {
    if (user) {
      if (user.role === 'candidate') navigate('/candidate-dashboard');
      else if (user.role === 'recruiter') navigate('/recruiter-dashboard');
      else if (user.role === 'admin') navigate('/admin-dashboard');
    } else {
      navigate(path);
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="bg-[#03050d] text-slate-200 min-h-screen font-sans selection:bg-indigo-500/30 overflow-hidden relative">
      
      {/* 🌌 GLOBAL BACKGROUND LAYERS */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[#03050d]"></div>
        
        {/* Layer 1: Animated Gradient Blobs */}
        <motion.div 
          animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-indigo-600/10 blur-[120px]"
        ></motion.div>
        <motion.div 
          animate={{ x: [0, -100, 0], y: [0, 80, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-600/10 blur-[120px]"
        ></motion.div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.05)_0%,transparent_70%)]"></div>

        {/* Layer 2: Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)]"></div>

        {/* Layer 3: Noise Texture */}
        <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

        {/* Layer 4: Vignette Effect */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(3,5,13,0.4)_100%)]"></div>
      </div>

      {/* 🔮 ROLE SELECTION MODAL */}
      <AnimatePresence>
        {showRoleModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#03050d]/80 backdrop-blur-2xl"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-[#0a0e1a]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 max-w-md w-full shadow-[0_0_80px_rgba(79,70,229,0.15)] relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
              <button 
                onClick={() => setShowRoleModal(false)}
                className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <FiX size={18} />
              </button>
              <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Welcome</h2>
              <p className="text-slate-400 text-sm mb-8">Continue as:</p>
              
              <div className="space-y-4">
                <button 
                  onClick={() => selectRoleAndRegister('candidate')}
                  className="w-full text-left p-6 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all flex items-center gap-5 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500/30 transition-all shadow-[0_0_20px_rgba(79,70,229,0.2)]">
                    <FiUsers size={24} />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-white font-bold text-lg leading-tight">Candidate</h3>
                    <p className="text-slate-400 text-xs mt-1 font-medium group-hover:text-indigo-300 transition-colors">Upload resume • Get matched</p>
                  </div>
                  <FiArrowRight className="ml-auto text-indigo-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all relative z-10" />
                </button>
                
                <button 
                  onClick={() => selectRoleAndRegister('recruiter')}
                  className="w-full text-left p-6 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:bg-purple-500/10 hover:border-purple-500/30 transition-all flex items-center gap-5 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 group-hover:bg-purple-500/30 transition-all shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                    <FiBriefcase size={24} />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-white font-bold text-lg leading-tight">Recruiter</h3>
                    <p className="text-slate-400 text-xs mt-1 font-medium group-hover:text-purple-300 transition-colors">Post jobs • Screen talent</p>
                  </div>
                  <FiArrowRight className="ml-auto text-purple-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all relative z-10" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🌟 PREMIUM NAVBAR */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-[#03050d]/70 backdrop-blur-2xl border-b border-white/[0.05] py-4 shadow-[0_4px_30px_rgba(0,0,0,0.1)]' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo(0,0)}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] group-hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] transition-all duration-300 group-hover:scale-105">
              <FiZap className="text-white" size={20} />
            </div>
            <span className="text-xl font-black tracking-tight text-white hidden sm:block">AI Resume System</span>
            <span className="text-xl font-black tracking-tight text-white sm:hidden">ARSJRS</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => handleAction('/login')} 
              className="text-sm font-semibold text-slate-400 hover:text-white transition-all duration-300"
            >
              Login
            </button>
            <button 
              onClick={handleGetStarted} 
              className="px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all duration-300 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] active:scale-95"
            >
              Sign Up
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-slate-300" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden absolute top-full left-0 w-full bg-[#03050d]/95 backdrop-blur-2xl border-b border-white/10 p-6 flex flex-col gap-4 shadow-2xl overflow-hidden"
            >
              <button onClick={() => handleAction('/login')} className="w-full text-left py-2 font-bold text-slate-300">Login</button>
              <button onClick={handleGetStarted} className="w-full bg-white text-slate-900 font-bold py-3 rounded-xl mt-2">Sign Up</button>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* 🚀 CINEMATIC HERO SECTION */}
      <section className="relative pt-[160px] pb-24 md:pt-[200px] md:pb-32 px-6 z-10 perspective-1000">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
            
            {/* Glowing Aura Behind Text */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[50%] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none z-[-1]"></div>

            <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-black text-white tracking-tighter mb-4 leading-[1.1] drop-shadow-2xl">
              Turn Your Resume into <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 animate-gradient-x inline-block">
                Real Job Opportunities
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-indigo-400 font-bold mb-8 uppercase tracking-widest">
              AI-Based Resume Screening & Job Recommendation System
            </p>

            <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-12 font-medium leading-relaxed drop-shadow-md">
              Upload your resume, get an ATS score, identify skill gaps, and receive AI-powered job recommendations tailored to you.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
              <button
                onClick={handleGetStarted}
                className="w-full sm:w-auto relative group overflow-hidden rounded-full p-[1px] transition-transform hover:scale-105 active:scale-95"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-full animate-gradient-x"></span>
                <div className="relative bg-[#03050d] group-hover:bg-transparent transition-colors duration-300 rounded-full py-4 px-10 flex items-center justify-center gap-2">
                  <span className="font-bold text-white text-lg">Get Started</span>
                  <FiArrowRight className="text-indigo-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-40 blur-xl transition-opacity duration-500"></div>
              </button>

              <button
                onClick={() => handleAction('/register')}
                className="w-full sm:w-auto bg-white/[0.03] hover:bg-white/[0.08] text-white font-bold py-4 px-10 rounded-full border border-white/[0.1] backdrop-blur-xl transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Sign Up
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-slate-500 text-sm font-semibold opacity-80">
              <span className="flex items-center gap-2">
                <FiCheckCircle className="text-indigo-500" /> Instant ATS Score
              </span>
              <span className="flex items-center gap-2">
                <FiCheckCircle className="text-indigo-500" /> AI Job Matching
              </span>
              <span className="flex items-center gap-2">
                <FiCheckCircle className="text-indigo-500" /> Skill Gap Insights
              </span>
              <span className="flex items-center gap-2">
                <FiCheckCircle className="text-indigo-500" /> Career Guidance
              </span>
            </div>
          </motion.div>
        </div>

        {/* 🎬 INTERACTIVE LIVE DEMO HERO ELEMENT */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-6xl mx-auto mt-20 relative z-10"
        >
          {/* 💎 VIEW TOGGLE & LABEL */}
          <div className="flex flex-col items-center gap-6 mb-12">
            <div className="flex flex-col items-center gap-3">
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-400 text-[10px] font-bold tracking-[0.2em] uppercase flex items-center gap-3"
              >
                <div className={`w-1.5 h-1.5 rounded-full ${viewMode === 'candidate' ? 'bg-indigo-500 shadow-[0_0_8px_rgba(79,70,229,0.8)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'} transition-all`}></div>
                Live AI Analysis
              </motion.span>
              <p className="text-slate-400 text-sm font-medium">Real-time AI analysis based on {viewMode === 'candidate' ? 'your resume' : 'job requirements'}</p>
            </div>

            {/* Toggle Switch */}
            <div className="p-1.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-1 backdrop-blur-xl">
              <button 
                onClick={() => setViewMode('candidate')}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 relative overflow-hidden ${viewMode === 'candidate' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {viewMode === 'candidate' && (
                  <motion.div layoutId="toggleBg" className="absolute inset-0 bg-indigo-600 shadow-lg shadow-indigo-500/20" />
                )}
                <span className="relative z-10">For Candidates</span>
              </button>
              <button 
                onClick={() => setViewMode('recruiter')}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 relative overflow-hidden ${viewMode === 'recruiter' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {viewMode === 'recruiter' && (
                  <motion.div layoutId="toggleBg" className="absolute inset-0 bg-emerald-600 shadow-lg shadow-emerald-500/20" />
                )}
                <span className="relative z-10">For Recruiters</span>
              </button>
            </div>
          </div>

          <div className="relative rounded-[3rem] border border-white/10 bg-white/[0.02] backdrop-blur-3xl shadow-[0_30px_100px_rgba(0,0,0,0.4)] overflow-hidden">
            {/* Subtle Static Glows */}
            <div className={`absolute top-0 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent ${viewMode === 'candidate' ? 'via-indigo-500/30' : 'via-emerald-500/30'} to-transparent transition-all duration-500`}></div>
            
            <div className="aspect-[16/9] bg-[#0a0e1a]/40 flex items-center justify-center p-8 md:p-12 overflow-hidden">
               
               <AnimatePresence mode="wait">
                 <motion.div 
                   key={viewMode}
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   transition={{ duration: 0.4 }}
                   className="w-full h-full flex flex-col md:flex-row gap-8 items-center justify-between"
                 >
                    
                    {/* LEFT: PREVIEW */}
                    <motion.div 
                      whileHover={{ y: -5, borderColor: viewMode === 'candidate' ? 'rgba(99,102,241,0.3)' : 'rgba(16,185,129,0.3)' }}
                      className="w-full md:w-[260px] bg-white/[0.03] border border-white/10 rounded-[2rem] p-6 flex flex-col gap-4 relative transition-all duration-300"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-[10px] font-bold ${viewMode === 'candidate' ? 'text-indigo-400' : 'text-emerald-400'} uppercase tracking-widest`}>
                          {viewMode === 'candidate' ? 'Resume Uploaded' : 'Job Description'}
                        </span>
                        <FiCheckCircle className={viewMode === 'candidate' ? 'text-green-500' : 'text-emerald-500'} />
                      </div>
                      <div className="space-y-2.5">
                        <div className="h-1.5 w-full bg-white/10 rounded-full"></div>
                        <div className="h-1.5 w-5/6 bg-white/10 rounded-full"></div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full"></div>
                        <div className="h-1.5 w-4/6 bg-white/10 rounded-full"></div>
                      </div>
                      <div className="mt-2 p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                         <div className={`h-1 w-12 ${viewMode === 'candidate' ? 'bg-indigo-500/40' : 'bg-emerald-500/40'} rounded-full`}></div>
                         <div className="h-1 w-20 bg-white/10 rounded-full"></div>
                      </div>
                    </motion.div>

                    {/* CENTER: SCORE */}
                    <div className="flex flex-col items-center justify-center relative">
                      <div className={`absolute inset-0 ${viewMode === 'candidate' ? 'bg-indigo-500/5' : 'bg-emerald-500/5'} blur-[80px] rounded-full transition-all duration-500`}></div>
                      
                      <div className="relative w-48 h-48 md:w-56 md:h-56 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="50%" cy="50%" r="42%" stroke="rgba(255,255,255,0.03)" strokeWidth="10" fill="transparent" />
                          <motion.circle 
                            cx="50%" cy="50%" r="42%" stroke={viewMode === 'candidate' ? '#6366f1' : '#10b981'} strokeWidth="10" strokeLinecap="round" fill="transparent" 
                            initial={{ strokeDasharray: "264", strokeDashoffset: "264" }}
                            animate={{ strokeDashoffset: 264 * (1 - (viewMode === 'candidate' ? 0.94 : 0.88)) }}
                            transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className="text-5xl md:text-6xl font-black text-white flex items-baseline">
                            <AnimatedNumber value={viewMode === 'candidate' ? 94 : 88} />
                            <span className={`text-xl ${viewMode === 'candidate' ? 'text-indigo-400' : 'text-emerald-400'} ml-0.5`}>%</span>
                          </div>
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">
                            {viewMode === 'candidate' ? 'ATS Score' : 'Candidate Match'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT: CARDS */}
                    <div className="w-full md:w-[300px] flex flex-col gap-6">
                      
                      {/* TOP CARD */}
                      <motion.div 
                        whileHover={{ y: -5, backgroundColor: 'rgba(255,255,255,0.05)' }}
                        className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-6 transition-all duration-300 group/match"
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <div className={`w-12 h-12 rounded-xl ${viewMode === 'candidate' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-emerald-500/10 text-emerald-400'} flex items-center justify-center`}>
                            {viewMode === 'candidate' ? <FiBriefcase size={20} /> : <FiUsers size={20} />}
                          </div>
                          <div>
                            <h5 className="text-white font-bold text-sm">
                              {viewMode === 'candidate' ? 'Fullstack Engineer' : 'Abhishek Dhawan'}
                            </h5>
                            <p className={`${viewMode === 'candidate' ? 'text-indigo-400' : 'text-emerald-400'} text-[10px] font-bold uppercase tracking-wider`}>
                              {viewMode === 'candidate' ? '96% Match' : 'High Potential'}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {viewMode === 'candidate' ? (
                            <>
                              <span className="px-2.5 py-1 rounded-lg bg-white/5 text-[9px] text-slate-400 font-bold border border-white/5">React.js</span>
                              <span className="px-2.5 py-1 rounded-lg bg-white/5 text-[9px] text-slate-400 font-bold border border-white/5">Node.js</span>
                            </>
                          ) : (
                            <>
                              <span className="px-2.5 py-1 rounded-lg bg-white/5 text-[9px] text-slate-400 font-bold border border-white/5">Python</span>
                              <span className="px-2.5 py-1 rounded-lg bg-white/5 text-[9px] text-slate-400 font-bold border border-white/5">AWS</span>
                            </>
                          )}
                        </div>
                      </motion.div>

                      {/* BOTTOM CARD */}
                      <motion.div 
                        whileHover={{ y: -5, backgroundColor: 'rgba(255,255,255,0.05)' }}
                        className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-6 transition-all duration-300"
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <div className={`w-12 h-12 rounded-xl ${viewMode === 'candidate' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'} flex items-center justify-center`}>
                            {viewMode === 'candidate' ? <FiTrendingUp size={20} /> : <FiTarget size={20} />}
                          </div>
                          <h5 className="text-white font-bold text-sm">
                            {viewMode === 'candidate' ? 'Skill Gap Detected' : 'AI Insight'}
                          </h5>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-[10px] font-bold">
                            <span className="text-slate-400 uppercase">
                              {viewMode === 'candidate' ? 'AWS Cloud' : 'Match Analysis'}
                            </span>
                            <span className={viewMode === 'candidate' ? 'text-amber-400' : 'text-emerald-400'}>
                              {viewMode === 'candidate' ? 'Missing' : 'Strong Fit'}
                            </span>
                          </div>
                          {viewMode === 'candidate' ? (
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: "75%" }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className="h-full bg-amber-500/40 rounded-full"
                              ></motion.div>
                            </div>
                          ) : (
                            <p className="text-[10px] text-slate-500 leading-relaxed font-medium">Candidate exceeds expectations in cloud infrastructure and scalable systems.</p>
                          )}
                        </div>
                      </motion.div>

                    </div>
                 </motion.div>
               </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ✨ PREMIUM FEATURE CARDS (GLASSMORPHISM) */}
      <section className="py-40 px-6 relative z-10">
        <div className="max-w-7xl mx-auto relative">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            className="mb-24 text-center"
          >
            <h2 className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold tracking-wider uppercase text-xs mb-8 shadow-[0_0_20px_rgba(79,70,229,0.2)]">
              <FiStar className="inline mr-2" /> Premium Capabilities
            </h2>
            <h3 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight mb-6">
              A deeply intelligent platform.
            </h3>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Our advanced AI infrastructure handles the complexity, so you can focus on making the right career or hiring decisions.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <PremiumFeatureCard
              icon={<FiFileText />}
              title="Extract Skills Automatically"
              desc="Our advanced NLP engine instantly extracts technical skills, soft skills, and experience with zero manual entry required. Total accuracy, zero friction."
              color="indigo"
              delay={0}
            />
            <PremiumFeatureCard
              icon={<FiBarChart2 />}
              title="Understand Your Resume Score"
              desc="Get a transparent percentage score along with detailed, AI-generated explanations for exactly why you matched with a role. No more black boxes."
              color="purple"
              delay={0.1}
            />
            <PremiumFeatureCard
              icon={<FiTarget />}
              title="Get Jobs That Actually Fit You"
              desc="Context-aware algorithms pair candidates with the exact roles that truly fit their unique profile, experience level, and future potential."
              color="blue"
              delay={0.2}
            />
            <PremiumFeatureCard
              icon={<FiTrendingUp />}
              title="Know Exactly What You’re Missing"
              desc="Identify exactly which skills are missing for your target job and get immediate, actionable learning recommendations to level up."
              color="pink"
              delay={0.3}
            />
          </div>

          {/* ⚡ GLOWING DIVIDER */}
          <div className="my-32 relative h-px w-full max-w-4xl mx-auto bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-indigo-500/10 blur-2xl rounded-full"></div>
          </div>

          {/* 👥 DUAL-SIDED SECTION: CANDIDATES vs RECRUITERS */}
          <div className="mb-40">
            <div className="text-center mb-16">
              <h3 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">Built for Both Talent & Recruiters</h3>
              <p className="text-slate-400 font-medium max-w-2xl mx-auto text-lg">A unified ecosystem where candidates find their potential and recruiters find their stars.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* LEFT: CANDIDATES */}
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 relative group overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl"></div>
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 mb-8 shadow-xl">
                  <FiUsers size={32} />
                </div>
                <h4 className="text-3xl font-black text-white mb-6">For Candidates</h4>
                <ul className="space-y-4 mb-10">
                  {[
                    "Instant ATS Score & Breakdown",
                    "AI-Powered Job Matches",
                    "Detailed Skill Gap Analysis",
                    "Actionable Resume Insights"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-300 font-medium">
                      <FiCheckCircle className="text-indigo-500 shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={handleGetStarted}
                  className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-[0_10px_20px_rgba(79,70,229,0.2)] flex items-center justify-center gap-2 group/btn"
                >
                  Get Started <FiArrowRight className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </motion.div>

              {/* RIGHT: RECRUITERS */}
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 relative group overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl"></div>
                <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400 mb-8 shadow-xl">
                  <FiBriefcase size={32} />
                </div>
                <h4 className="text-3xl font-black text-white mb-6">For Recruiters</h4>
                <ul className="space-y-4 mb-10">
                  {[
                    "Automated Resume Screening",
                    "Smart Candidate Ranking",
                    "Advanced Skill Filtering",
                    "Streamlined Job Posting"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-300 font-medium">
                      <FiCheckCircle className="text-purple-500 shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => selectRoleAndRegister('recruiter')}
                  className="w-full py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all shadow-[0_10px_20px_rgba(168,85,247,0.2)] flex items-center justify-center gap-2 group/btn"
                >
                  Post a Job <FiArrowRight className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            </div>
          </div>

          {/* 🏁 HOW IT WORKS SECTION */}
          <div className="mt-40">
            <div className="text-center mb-16">
              <h3 className="text-3xl md:text-4xl font-black text-white mb-4">How it works</h3>
              <p className="text-slate-400 font-medium">Four simple steps to your dream role.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { step: "01", title: "Upload Resume", text: "Drop your PDF and let our AI parse every detail." },
                { step: "02", title: "Get ATS Score", text: "See how well your resume performs against top jobs." },
                { step: "03", title: "View Job Matches", text: "Instantly see roles tailored specifically to your skills." },
                { step: "04", title: "Improve Your Skills", text: "Get recommendations to close your skill gaps." }
              ].map((item, i) => (
                <div key={i} className="bg-white/[0.02] border border-white/[0.05] p-8 rounded-3xl relative group hover:bg-white/[0.04] transition-all duration-300">
                  <span className="text-4xl font-black text-indigo-500/20 group-hover:text-indigo-500/40 transition-colors mb-6 block">{item.step}</span>
                  <h4 className="text-white font-bold text-lg mb-2">{item.title}</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 🛡️ TRUST / CREDIBILITY SECTION */}
          <div className="mt-40 py-12 border-y border-white/[0.05] flex flex-wrap items-center justify-center gap-12 text-center">
            <div className="flex flex-col gap-1">
              <span className="text-white font-bold">Real-World Logic</span>
              <span className="text-slate-500 text-xs uppercase tracking-widest">Built for actual hiring</span>
            </div>
            <div className="w-px h-12 bg-white/[0.05] hidden md:block"></div>
            <div className="flex flex-col gap-1">
              <span className="text-white font-bold">AI-Powered</span>
              <span className="text-slate-500 text-xs uppercase tracking-widest">Driven by intelligent analysis</span>
            </div>
            <div className="w-px h-12 bg-white/[0.05] hidden md:block"></div>
            <div className="flex flex-col gap-1">
              <span className="text-white font-bold">Dual Role Design</span>
              <span className="text-slate-500 text-xs uppercase tracking-widest">Candidates & Recruiters</span>
            </div>
          </div>
        </div>
      </section>

      {/* 📣 CTA SECTION */}
      <section className="py-40 px-6 relative z-10">
        <div className="max-w-5xl mx-auto relative">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 backdrop-blur-3xl border border-white/10 p-16 md:p-24 rounded-[3rem] relative shadow-[0_30px_100px_rgba(0,0,0,0.5)] overflow-hidden group text-center"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.1)_0%,transparent_100%)]"></div>
            
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter">Start Your AI Career Journey</h2>
            <p className="text-slate-400 mb-12 text-xl font-medium max-w-2xl mx-auto leading-relaxed">
              Join users improving their resumes and finding better opportunities with AI-driven insights.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleGetStarted}
                className="w-full sm:w-auto bg-white text-slate-900 font-black py-4 px-12 rounded-full hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)]"
              >
                Get Started
              </button>
              <button
                onClick={() => handleAction('/register')}
                className="w-full sm:w-auto bg-white/10 text-white font-bold py-4 px-12 rounded-full border border-white/10 hover:bg-white/20 transition-all"
              >
                Sign Up
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 🏁 PROFESSIONAL SAAS FOOTER */}
      <footer className="pt-24 pb-12 px-6 border-t border-white/[0.05] relative z-10 bg-[#03050d]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
            
            {/* LEFT: BRANDING */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                  <FiZap size={20} />
                </div>
                <span className="text-white font-black text-lg tracking-tight">AI Resume System</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                AI-powered resume analysis and job matching platform for candidates and recruiters.
              </p>
            </div>

            {/* CENTER: QUICK LINKS */}
            <div className="flex flex-col md:items-center">
              <div className="space-y-6">
                <h4 className="text-white font-bold text-sm uppercase tracking-widest">Platform</h4>
                <div className="flex flex-col gap-4">
                  <button onClick={() => window.scrollTo(0, 1500)} className="text-slate-500 hover:text-white transition-colors text-sm font-medium text-left">Features</button>
                  <button onClick={() => window.scrollTo(0, 3000)} className="text-slate-500 hover:text-white transition-colors text-sm font-medium text-left">How it Works</button>
                  <button onClick={() => handleAction('/login')} className="text-slate-500 hover:text-white transition-colors text-sm font-medium text-left">Login</button>
                  <button onClick={handleGetStarted} className="text-slate-500 hover:text-white transition-colors text-sm font-medium text-left">Sign Up</button>
                </div>
              </div>
            </div>

            {/* RIGHT: CONTACT / DEVELOPERS */}
            <div className="flex flex-col md:items-end">
              <div className="space-y-6 text-left md:text-right">
                <h4 className="text-white font-bold text-sm uppercase tracking-widest">Developed & Designed by</h4>
                <div className="space-y-3 text-slate-500 text-sm font-medium">
                  <p className="hover:text-white transition-colors">Abhishek Dhawan</p>
                  <p className="hover:text-white transition-colors">Ammar Ahmad</p>
                  <p className="hover:text-white transition-colors">Abhinav Shukla</p>
                </div>
              </div>
            </div>

          </div>

          {/* BOTTOM LINE */}
          <div className="pt-8 border-t border-white/[0.05] flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-slate-600 text-xs font-medium">
              © 2026 AI-Based Resume Screening & Job Recommendation System. All rights reserved.
            </p>
            <div className="flex gap-8 text-slate-600 text-xs font-medium">
              <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
              <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// -------------------------------------------------------------
// PREMIUM FEATURE CARD (Glassmorphism + Lift)
// -------------------------------------------------------------
function PremiumFeatureCard({ icon, title, desc, color, delay }) {
  const colorMap = {
    indigo: 'from-indigo-500/10 border-indigo-500/20 group-hover:border-indigo-500/50 shadow-indigo-500/5 group-hover:shadow-indigo-500/20 text-indigo-400',
    purple: 'from-purple-500/10 border-purple-500/20 group-hover:border-purple-500/50 shadow-purple-500/5 group-hover:shadow-purple-500/20 text-purple-400',
    blue: 'from-blue-500/10 border-blue-500/20 group-hover:border-blue-500/50 shadow-blue-500/5 group-hover:shadow-blue-500/20 text-blue-400',
    pink: 'from-pink-500/10 border-pink-500/20 group-hover:border-pink-500/50 shadow-pink-500/5 group-hover:shadow-pink-500/20 text-pink-400',
  };

  const selectedColor = colorMap[color];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay: delay }}
      whileHover={{ y: -10, scale: 1.02 }}
      className={`p-10 rounded-[3rem] bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] transition-all duration-500 group relative overflow-hidden flex flex-col items-start text-left shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:bg-white/[0.06]`}
    >
      <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${selectedColor.split(' ')[0]} rounded-full blur-[100px] -mr-20 -mt-20 opacity-0 group-hover:opacity-40 transition-opacity duration-700`}></div>
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform duration-500 bg-[#03050d] border border-white/10 shadow-2xl relative z-10 ${selectedColor.split(' ').pop()}`}>
        {icon}
      </div>
      <h3 className="text-white font-black text-2xl mb-4 tracking-tight relative z-10 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-400 transition-all">{title}</h3>
      <p className="text-slate-400 text-lg leading-relaxed font-medium relative z-10 group-hover:text-slate-300 transition-colors">{desc}</p>
      <div className="absolute bottom-6 right-8 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300">
        <FiArrowRight className={selectedColor.split(' ').pop()} />
      </div>
    </motion.div>
  );
}

// -------------------------------------------------------------
// ANIMATED NUMBER COMPONENT
// -------------------------------------------------------------
function AnimatedNumber({ value }) {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 2000;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCurrentValue(end);
        clearInterval(timer);
      } else {
        setCurrentValue(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{currentValue}</span>;
}
