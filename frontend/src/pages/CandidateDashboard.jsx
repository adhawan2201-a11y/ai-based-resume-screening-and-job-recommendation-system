import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { candidateAPI, matchingAPI } from '../services/api';
import ResumeUploader from '../components/ResumeUploader';
import ScoreRing from '../components/ScoreRing';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiTrendingUp, FiBriefcase, FiAlertCircle, FiCheckCircle, 
  FiBook, FiTarget, FiZap, FiFileText, FiUploadCloud, FiAward, FiStar, FiCpu, FiChevronDown, FiChevronUp, FiMaximize2, FiExternalLink, FiArrowRight
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function CandidateDashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const [dashRes, recRes] = await Promise.all([
        candidateAPI.getDashboard(),
        matchingAPI.getRecommendations()
      ]);
      const data = dashRes.data;
      data.matches = recRes.data.recommendations;
      setDashboardData(data);
    } catch (err) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = async () => {
    toast.success('Resume uploaded!');
    await fetchDashboard();
  };

  const handleScoreJob = async (jobId) => {
    try {
      await matchingAPI.scoreJob(jobId);
      await fetchDashboard();
    } catch (err) {
      toast.error('Scoring failed');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-72px)] gap-4 bg-[#03050d]">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="text-slate-400 font-medium animate-pulse tracking-wide">Syncing professional profile...</p>
      </div>
    );
  }

  const resume = dashboardData?.latest_resume;
  const matches = dashboardData?.matches || [];
  const skillGap = dashboardData?.skill_gap;
  
  const technicalSkills = resume?.parsed_data?.technical_skills || dashboardData?.skills || [];
  const softSkills = resume?.parsed_data?.soft_skills || dashboardData?.soft_skills || [];
  const category = resume?.parsed_data?.category || dashboardData?.category || 'tech';
  const education = resume?.parsed_data?.education || dashboardData?.education || [];
  const experience = resume?.parsed_data?.total_experience_years || dashboardData?.experience || 0;

  return (
    <div className="min-h-screen bg-[#03050d] text-slate-300 relative overflow-hidden font-sans selection:bg-indigo-500/30 pb-20">
      {/* 🌌 BALANCED ATMOSPHERIC BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E')] opacity-[0.03] brightness-125"></div>
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '48px 48px' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12 relative z-10">
        
        {/* 👑 PREMIUM HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">AI Career Engine Active</p>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">
              Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">{user?.name || 'Candidate'}</span> 👋
            </h1>
            <p className="text-slate-400 font-medium max-w-xl text-lg leading-relaxed opacity-80">
              Manage your AI-powered career growth, skill alignment, and global opportunities from one dashboard.
            </p>
          </div>
          
          <div className="flex p-1.5 bg-white/[0.02] backdrop-blur-3xl rounded-2xl border border-white/5 shadow-2xl">
            {['overview', 'recommendations', 'skill-gap'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all relative ${
                  activeTab === tab ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {activeTab === tab && (
                  <motion.div layoutId="tabMarker" className="absolute inset-0 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20" />
                )}
                <span className="relative z-10">{tab.replace('-', ' ')}</span>
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {activeTab === 'overview' && (
              <div className="space-y-10">
                
                {/* 🔳 ROW 1: CORE STATS & UPLOAD */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                  
                  {/* Profile Strength (Refined) */}
                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    className="md:col-span-3 bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-3xl flex flex-col items-center justify-center text-center relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem]"></div>
                    <ScoreRing 
                      score={skillGap?.skill_match_percentage || 0} 
                      size={110} 
                      strokeWidth={10}
                      label=""
                    />
                    <div className="mt-6 space-y-2">
                      <h3 className="text-white font-black text-2xl">{skillGap?.skill_match_percentage || 0}%</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Market Alignment Score</p>
                    </div>
                    <div className="mt-8 flex gap-6 text-[11px] font-bold border-t border-white/5 pt-6 w-full justify-center">
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-500 uppercase text-[9px]">Experience</span>
                        <span className="text-white">{experience} Years</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-500 uppercase text-[9px]">Skills</span>
                        <span className="text-white">{technicalSkills.length} Verified</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Resume Upload (Refined) */}
                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    className="md:col-span-6 bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-10 shadow-2xl backdrop-blur-3xl relative overflow-hidden group"
                  >
                     <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/5 rounded-full blur-[60px]"></div>
                     <div className="relative z-10 flex flex-col h-full justify-between">
                        <div className="flex items-center gap-4 mb-6">
                           <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shadow-inner border border-indigo-500/10">
                              <FiUploadCloud size={24} />
                           </div>
                           <div>
                              <h3 className="text-white font-black text-lg">Professional DNA</h3>
                              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Upload Resume for AI Analysis</p>
                           </div>
                        </div>
                        <ResumeUploader onUploadSuccess={handleUploadSuccess} />
                     </div>
                  </motion.div>

                  {/* Profile Type (Refined) */}
                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    className="md:col-span-3 bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-3xl flex flex-col items-center justify-center text-center relative overflow-hidden"
                  >
                    <div className={`w-16 h-16 rounded-3xl mb-6 flex items-center justify-center text-3xl shadow-inner border ${
                      category === 'tech' ? 'bg-blue-500/10 text-blue-400 border-blue-500/10' : 'bg-purple-500/10 text-purple-400 border-purple-500/10'
                    }`}>
                      {category === 'tech' ? <FiCpu /> : <FiStar />}
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mb-2">Primary Sector</span>
                    <h3 className="text-white font-black text-xl uppercase tracking-tight">{category}</h3>
                    <div className={`absolute bottom-0 left-0 w-full h-1.5 opacity-50 ${
                      category === 'tech' ? 'bg-blue-500' : 'bg-purple-500'
                    }`}></div>
                  </motion.div>

                </div>

                {/* 🔳 ROW 2: SKILLS (GRID) */}
                {!resume ? (
                  <div className="bg-white/[0.01] border border-dashed border-white/10 rounded-[2.5rem] p-20 text-center">
                    <FiFileText className="text-5xl text-slate-700 mx-auto mb-6" />
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Your AI Profile is empty. Please upload your resume.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Technical DNA */}
                      <motion.div whileHover={{ y: -5 }} className="lg:col-span-2 bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-3xl border-l-4 border-l-indigo-500">
                        <div className="flex items-center justify-between mb-8">
                           <h3 className="text-white font-black text-sm uppercase tracking-widest flex items-center gap-3">
                             <FiCpu className="text-indigo-400" /> Technical DNA
                           </h3>
                           <span className="text-[10px] text-slate-500 font-black tracking-widest">{technicalSkills.length} CORE SKILLS</span>
                        </div>
                        <SkillCloud skills={technicalSkills} color="indigo" />
                      </motion.div>

                      {/* Adaptive Strengths */}
                      <motion.div whileHover={{ y: -5 }} className="lg:col-span-1 bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-3xl border-l-4 border-l-purple-500">
                        <h3 className="text-white font-black text-sm uppercase tracking-widest mb-8 flex items-center gap-3">
                          <FiStar className="text-purple-400" /> Human Factors
                        </h3>
                        <SkillCloud skills={softSkills} color="purple" limit={6} />
                      </motion.div>
                    </div>

                    {/* 🔳 ROW 3: ACADEMICS & INSIGHTS */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      
                      {/* Academic Background */}
                      <motion.div whileHover={{ y: -5 }} className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-3xl">
                         <h3 className="text-white font-black text-sm uppercase tracking-widest mb-8 flex items-center gap-3">
                           <FiBook className="text-blue-400" /> Academic Journey
                         </h3>
                         <div className="grid grid-cols-1 gap-4">
                           {education.slice(0, 2).map((edu, i) => (
                             <div key={i} className="flex items-center justify-between p-6 bg-white/[0.01] border border-white/5 rounded-3xl hover:bg-white/[0.03] hover:border-white/10 transition-all group cursor-default">
                               <div className="flex items-center gap-5">
                                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-lg font-black border border-indigo-500/10 group-hover:scale-110 transition-transform">
                                    {edu.degree.charAt(0)}
                                  </div>
                                  <div>
                                    <h4 className="text-white text-sm font-black">{edu.degree}</h4>
                                    <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">{edu.field} • {edu.institute}</p>
                                  </div>
                               </div>
                               <span className="text-[10px] font-black text-indigo-500/60 bg-indigo-500/5 px-3 py-1 rounded-full">{edu.year || 'N/A'}</span>
                             </div>
                           ))}
                         </div>
                      </motion.div>

                      {/* Smart Insights */}
                      <motion.div whileHover={{ y: -5 }} className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-3xl relative overflow-hidden">
                         <div className="absolute top-[-10%] right-[-5%] w-40 h-40 bg-emerald-500/5 rounded-full blur-[50px]"></div>
                         <h3 className="text-white font-black text-sm uppercase tracking-widest mb-8 flex items-center gap-3">
                           <FiTrendingUp className="text-emerald-400" /> Strategic Insights
                         </h3>
                         <div className="space-y-6">
                            <div className="flex items-start gap-4 p-5 rounded-3xl bg-emerald-500/5 border border-emerald-500/10">
                               <FiCheckCircle className="text-emerald-500 mt-1 shrink-0" size={16} />
                               <div>
                                  <p className="text-white text-sm font-bold">Superior role compatibility</p>
                                  <p className="text-slate-400 text-[11px] leading-relaxed">Your professional DNA shows a 90%+ match for high-growth {category} roles.</p>
                               </div>
                            </div>
                            <div className="flex items-start gap-4 p-5 rounded-3xl bg-amber-500/5 border border-amber-500/10">
                               <FiZap className="text-amber-500 mt-1 shrink-0" size={16} />
                               <div>
                                  <p className="text-white text-sm font-bold">{skillGap?.missing_skills?.length || 0} Competency Gaps</p>
                                  <p className="text-slate-400 text-[11px] leading-relaxed">Addressing these missing skills could increase your market value by up to 25%.</p>
                               </div>
                            </div>
                         </div>
                      </motion.div>

                    </div>

                    {/* 🔳 BOTTOM: PREMIUM JOB CARDS */}
                    <div className="pt-10">
                      <div className="flex items-center justify-between mb-10">
                         <div className="space-y-1">
                            <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                              <FiTarget className="text-rose-500" /> Top AI Job Matches
                            </h2>
                            <p className="text-slate-600 text-[11px] font-medium">Ranked by deep ATS intelligence</p>
                         </div>
                         <button onClick={() => setActiveTab('recommendations')} className="px-6 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-[10px] font-black text-indigo-400 hover:text-white hover:bg-indigo-600 transition-all flex items-center gap-2 group">
                           VIEW GLOBAL ROLES <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                         </button>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {matches.slice(0, 4).map((job, i) => (
                          <PremiumJobCard key={i} job={job} onScore={handleScoreJob} />
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'recommendations' && (
              <div className="space-y-10">
                <div className="space-y-2">
                   <h2 className="text-3xl font-black text-white">Global Career Opportunities</h2>
                   <p className="text-slate-500 text-lg font-medium opacity-80">Personalized roles matched with your {category} specialization.</p>
                </div>
                {!resume ? (
                  <div className="bg-white/[0.01] border border-dashed border-white/10 rounded-[3rem] p-32 text-center">
                    <FiAlertCircle className="text-6xl text-amber-500/20 mx-auto mb-6" />
                    <p className="text-white font-black text-lg">Resume Intelligence Required</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {matches.map((job, i) => (
                      <PremiumJobCard key={i} job={job} onScore={handleScoreJob} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'skill-gap' && (
              <div className="space-y-10">
                 {!resume || !skillGap ? (
                    <div className="bg-white/[0.01] border border-dashed border-white/10 rounded-[3rem] p-32 text-center">
                      <FiAlertCircle className="text-6xl text-amber-500/20 mx-auto mb-6" />
                      <p className="text-white font-black text-lg">Please upload a resume first</p>
                    </div>
                 ) : (
                    <div className="space-y-10">
                       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          <motion.div whileHover={{ scale: 1.01 }} className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-10 shadow-2xl backdrop-blur-3xl border-l-4 border-l-emerald-500">
                             <h3 className="text-white font-black text-[11px] uppercase tracking-widest mb-10 flex items-center gap-3">
                                <FiCheckCircle className="text-emerald-400" /> Market Ready Skills
                             </h3>
                             <SkillCloud skills={skillGap.matched_skills} color="emerald" limit={20} />
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.01 }} className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-10 shadow-2xl backdrop-blur-3xl border-l-4 border-l-amber-500">
                             <h3 className="text-white font-black text-[11px] uppercase tracking-widest mb-10 flex items-center gap-3">
                                <FiAlertCircle className="text-amber-400" /> Competency Gaps
                             </h3>
                             <SkillCloud skills={skillGap.missing_skills} color="amber" limit={20} />
                          </motion.div>
                       </div>
                       
                       {skillGap.recommended_learning?.length > 0 && (
                          <div className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-12 shadow-2xl backdrop-blur-3xl">
                             <div className="flex items-center gap-4 mb-12">
                                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/10">
                                   <FiBook size={24} />
                                </div>
                                <div>
                                   <h3 className="text-white font-black text-xl uppercase tracking-tight">Career Growth Roadmap</h3>
                                   <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Personalized Learning Path</p>
                                </div>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                {skillGap.recommended_learning.slice(0, 3).map((item, i) => (
                                   <div key={i} className="p-8 rounded-[2rem] bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] hover:border-white/10 transition-all relative group overflow-hidden">
                                      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-[3rem] group-hover:bg-indigo-500/10 transition-colors"></div>
                                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-black text-sm mb-6 border border-indigo-500/10">
                                         {i+1}
                                      </div>
                                      <h4 className="text-white text-base font-black mb-4 capitalize leading-tight">{item.topic || item.split(':')[0]}</h4>
                                      <p className="text-slate-400 text-[13px] leading-relaxed opacity-80">{item.suggestion || item}</p>
                                   </div>
                                ))}
                             </div>
                          </div>
                       )}
                    </div>
                 )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/** 🌩️ REFINED SKILL CLOUD */
function SkillCloud({ skills = [], color = 'indigo', limit = 12 }) {
  const [showAll, setShowAll] = useState(false);
  const visibleSkills = showAll ? skills : skills.slice(0, limit);
  const hasMore = skills.length > limit;

  const colorStyles = {
    indigo: 'bg-indigo-500/5 text-indigo-300 border-indigo-500/10 hover:border-indigo-500/30 hover:bg-indigo-500/10',
    purple: 'bg-purple-500/5 text-purple-300 border-purple-500/10 hover:border-purple-500/30 hover:bg-purple-500/10',
    emerald: 'bg-emerald-500/5 text-emerald-300 border-emerald-500/10 hover:border-emerald-500/30 hover:bg-emerald-500/10',
    amber: 'bg-amber-500/5 text-amber-300 border-amber-500/10 hover:border-amber-500/30 hover:bg-amber-500/10',
  };

  return (
    <div className="flex flex-wrap gap-2.5">
      {visibleSkills.map((skill, i) => (
        <span key={i} className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all cursor-default shadow-sm ${colorStyles[color]}`}>
          {skill}
        </span>
      ))}
      {hasMore && (
        <button 
          onClick={() => setShowAll(!showAll)}
          className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 text-slate-500 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all flex items-center gap-2"
        >
          {showAll ? <><FiChevronUp /> COLLAPSE</> : <><FiChevronDown /> +{skills.length - limit} MORE</>}
        </button>
      )}
    </div>
  );
}

/** 📏 PREMIUM JOB CARD (BALANCED) */
function PremiumJobCard({ job, onScore }) {
  const score = job.score_breakdown?.total_score || job.score || 0;
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div 
      whileHover={{ y: -5, scale: 1.01 }}
      className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-3xl relative overflow-hidden group cursor-pointer"
      onClick={() => setIsExpanded(!isExpanded)}
    >
       <div className={`absolute top-0 right-0 w-32 h-32 opacity-[0.03] rounded-bl-full -mr-10 -mt-10 transition-all ${
         score >= 80 ? 'bg-emerald-500' : 'bg-indigo-500'
       }`}></div>

       <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-5">
             <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] flex items-center justify-center border border-white/10 text-2xl font-black text-slate-400 group-hover:scale-110 transition-transform shadow-inner">
                {job.company ? job.company.charAt(0).toUpperCase() : '🏢'}
             </div>
             <div>
                <h4 className="text-white text-lg font-black tracking-tight group-hover:text-indigo-400 transition-colors leading-tight mb-1">{job.title}</h4>
                <p className="text-slate-500 text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
                   {job.company} <span className="w-1 h-1 rounded-full bg-slate-700"></span> {job.location?.split(',')[0] || 'Remote'}
                </p>
             </div>
          </div>
          <div className="text-right">
             <div className={`text-3xl font-black ${
               score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-indigo-400' : 'text-amber-400'
             }`}>
                {Math.round(score)}<span className="text-xs opacity-50 ml-0.5">%</span>
             </div>
             <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.2em]">Match</p>
          </div>
       </div>

       {/* Progress Bar */}
       <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-8">
          <motion.div 
            initial={{ width: 0 }}
            whileInView={{ width: `${score}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full rounded-full ${
              score >= 80 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 
              score >= 60 ? 'bg-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.3)]' : 
              'bg-amber-500'
            }`}
          />
       </div>

       <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
             {job.skills_required?.slice(0, 3).map((s, i) => (
               <span key={i} className="px-3 py-1 rounded-lg bg-white/5 text-[9px] text-slate-400 font-black border border-white/5 uppercase tracking-widest">{s}</span>
             ))}
             {job.skills_required?.length > 3 && (
               <span className="text-[9px] text-slate-600 font-black self-center">+{job.skills_required.length - 3}</span>
             )}
          </div>
          <button className={`p-2 rounded-xl bg-white/5 border border-white/10 text-slate-500 group-hover:text-indigo-400 transition-all ${isExpanded ? 'rotate-180 text-indigo-400' : ''}`}>
             <FiChevronDown size={18} />
          </button>
       </div>

       {/* Expanded Panel */}
       <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-6"
              onClick={(e) => e.stopPropagation()}
            >
               <div className="pt-6 border-t border-white/5 space-y-6">
                  <div className="p-5 rounded-3xl bg-indigo-500/[0.03] border border-indigo-500/10">
                     <h5 className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-3">AI Deep Analysis</h5>
                     <p className="text-slate-400 text-[12px] leading-relaxed opacity-80 italic">
                        {job.explanation?.overall_assessment || "Analyzing your profile compatibility with this specific role based on technical skills and soft competencies."}
                     </p>
                  </div>
                  <div className="flex gap-4">
                     <button onClick={() => window.open(`/job/${job.id}`, '_blank')} className="flex-1 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-[11px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                        Details <FiMaximize2 size={14} />
                     </button>
                     <button className="flex-1 px-4 py-3 rounded-2xl bg-indigo-600 text-white text-[11px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-900/20">
                        Quick Apply
                     </button>
                  </div>
               </div>
            </motion.div>
          )}
       </AnimatePresence>
    </motion.div>
  );
}
