import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { jobAPI, seedAPI, recruiterAPI } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, FiUsers, FiBriefcase, FiTrash2, FiChevronDown, FiChevronUp, 
  FiX, FiCpu, FiTrendingUp, FiTarget, FiUploadCloud, FiAward, FiStar, FiFileText, FiMaximize2, FiExternalLink, FiSearch, FiCheckCircle
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPostForm, setShowPostForm] = useState(false);
  const [expandedJob, setExpandedJob] = useState(null);
  const [candidates, setCandidates] = useState({});
  const [candidateLoading, setCandidateLoading] = useState({});
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      try { await seedAPI.seed(); } catch {}
      await Promise.all([loadMyJobs(), loadAnalytics()]);
    } finally {
      setLoading(false);
    }
  };

  const loadMyJobs = async () => {
    try {
      const res = await recruiterAPI.getMyJobs();
      setMyJobs(res.data.jobs || []);
    } catch (err) {
      console.error('Error loading jobs:', err);
    }
  };

  const loadAnalytics = async () => {
    try {
      const res = await recruiterAPI.getAnalytics();
      setAnalytics(res.data);
    } catch (err) {
      console.error('Error loading analytics:', err);
    }
  };

  const loadCandidates = async (jobId) => {
    if (candidates[jobId]) {
      setExpandedJob(expandedJob === jobId ? null : jobId);
      return;
    }

    setCandidateLoading(prev => ({ ...prev, [jobId]: true }));
    try {
      const res = await recruiterAPI.getApplicants(jobId);
      setCandidates(prev => ({ ...prev, [jobId]: res.data.applicants || [] }));
      setExpandedJob(jobId);
    } catch (err) {
      toast.error('Failed to load candidates');
    } finally {
      setCandidateLoading(prev => ({ ...prev, [jobId]: false }));
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Delete this job posting?')) return;
    try {
      await jobAPI.delete(jobId);
      toast.success('Job deleted');
      loadMyJobs();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleStatusUpdate = async (matchId, jobId, newStatus) => {
    try {
      await recruiterAPI.updateStatus(matchId, newStatus);
      toast.success(`Candidate ${newStatus}`);
      setCandidates(prev => ({
        ...prev,
        [jobId]: prev[jobId].map(c => c.id === matchId ? { ...c, status: newStatus } : c)
      }));
    } catch {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-72px)] gap-4 bg-[#03050d]">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="text-slate-400 font-medium animate-pulse tracking-wide uppercase text-[10px]">Initializing Recruiter Engine...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#03050d] text-slate-300 relative overflow-hidden font-sans pb-20 selection:bg-indigo-500/30">
      {/* 🌌 BALANCED ATMOSPHERIC BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] brightness-125"></div>
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
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Hiring Engine Active</p>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">
              Recruiter <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Dashboard</span>
            </h1>
            <p className="text-slate-400 font-medium max-w-xl text-lg leading-relaxed opacity-80">
              Manage talent pipelines, analyze candidate fit, and scale your engineering teams with AI.
            </p>
          </div>
          
          <button
            onClick={() => setShowPostForm(true)}
            className="px-8 py-4 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-900/30 flex items-center gap-2 group"
          >
            <FiPlus className="text-lg group-hover:rotate-90 transition-transform" /> Post New Job
          </button>
        </div>

        {/* 🔳 STATS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
           {[
             { label: 'Active Roles', value: analytics?.total_jobs || 0, icon: <FiBriefcase />, color: 'indigo' },
             { label: 'Total Applicants', value: analytics?.total_applicants || 0, icon: <FiUsers />, color: 'purple' },
             { label: 'Avg Match', value: `${Math.round(analytics?.score_stats?.avg_score || 0)}%`, icon: <FiTarget />, color: 'emerald' },
             { label: 'High Match', value: `${Math.round(analytics?.score_stats?.max_score || 0)}%`, icon: <FiAward />, color: 'pink' }
           ].map((stat, i) => (
             <motion.div 
               key={i}
               whileHover={{ y: -5, scale: 1.02 }}
               className="bg-white/[0.02] border border-white/10 rounded-[2rem] p-6 backdrop-blur-3xl shadow-xl flex flex-col items-center justify-center text-center group"
             >
                <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center text-lg ${
                  stat.color === 'indigo' ? 'bg-indigo-500/10 text-indigo-400' :
                  stat.color === 'purple' ? 'bg-purple-500/10 text-purple-400' :
                  stat.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400' :
                  'bg-pink-500/10 text-pink-400'
                }`}>
                   {stat.icon}
                </div>
                <span className="text-white font-black text-2xl mb-1">{stat.value}</span>
                <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{stat.label}</span>
             </motion.div>
           ))}
        </div>

        {/* 🔳 SKILLS PIPELINE ANALYTICS */}
        {analytics?.top_skills?.length > 0 && (
          <motion.div 
            whileHover={{ scale: 1.005 }}
            className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-10 mb-12 backdrop-blur-3xl shadow-2xl relative overflow-hidden group"
          >
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-[80px]"></div>
             <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/10">
                   <FiTrendingUp size={20} />
                </div>
                <div>
                   <h3 className="text-white font-black text-xl tracking-tight">Talent Pipeline Analytics</h3>
                   <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Most In-Demand Skills Across Postings</p>
                </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {analytics.top_skills.slice(0, 4).map((s, i) => (
                  <div key={i} className="space-y-3">
                     <div className="flex justify-between items-end">
                        <span className="text-white text-xs font-black uppercase tracking-wide">{s.skill}</span>
                        <span className="text-[10px] text-indigo-400 font-black">{s.count} ROLE{s.count > 1 ? 'S' : ''}</span>
                     </div>
                     <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: `${(s.count / Math.max(analytics.total_jobs, 1)) * 100}%` }}
                          className="h-full bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.3)]"
                        />
                     </div>
                  </div>
                ))}
             </div>
          </motion.div>
        )}

        {/* 🔳 JOB POSTINGS GRID */}
        <div className="space-y-8">
           <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                <FiBriefcase className="text-indigo-400" /> Active Hiring Campaigns
              </h2>
           </div>

           {myJobs.length === 0 ? (
             <div className="bg-white/[0.01] border border-dashed border-white/10 rounded-[3rem] p-32 text-center">
                <FiBriefcase className="text-6xl text-slate-700 mx-auto mb-6" />
                <p className="text-white font-black text-lg mb-4">No active hiring campaigns</p>
                <button onClick={() => setShowPostForm(true)} className="px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-[11px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all">
                   Create First Posting
                </button>
             </div>
           ) : (
             <div className="grid grid-cols-1 gap-6">
                {myJobs.map((job) => (
                  <motion.div 
                    key={job.id} 
                    className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-3xl group overflow-hidden"
                  >
                     <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                        <div className="flex items-center gap-6 flex-1 min-w-0">
                           <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] flex items-center justify-center border border-white/10 text-3xl font-black text-slate-400 shadow-inner group-hover:scale-105 transition-transform shrink-0">
                              {job.title?.charAt(0) || 'J'}
                           </div>
                           <div className="min-w-0">
                              <h3 className="text-white text-xl font-black tracking-tight mb-1 truncate">{job.title}</h3>
                              <p className="text-slate-500 text-[11px] font-black uppercase tracking-widest flex items-center gap-3">
                                 {job.company} <span className="w-1 h-1 rounded-full bg-slate-700"></span> {job.location || 'Remote'}
                              </p>
                              <div className="flex flex-wrap gap-2 mt-4">
                                 {(job.skills_required || []).slice(0, 4).map((s, i) => (
                                   <span key={i} className="px-3 py-1 rounded-lg bg-indigo-500/5 text-indigo-400 text-[9px] font-black border border-indigo-500/10 uppercase tracking-widest">{s}</span>
                                 ))}
                              </div>
                           </div>
                        </div>

                        <div className="flex flex-col items-end gap-6 shrink-0">
                           <div className="flex items-center gap-6">
                              <div className="text-center px-6 border-r border-white/5">
                                 <p className="text-white font-black text-xl">{job.candidate_count || 0}</p>
                                 <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Applicants</p>
                              </div>
                              <button
                                onClick={() => loadCandidates(job.id)}
                                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                                  expandedJob === job.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'bg-white/5 text-indigo-400 hover:bg-white/10'
                                }`}
                              >
                                 {candidateLoading[job.id] ? (
                                   <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                 ) : (
                                   <>Pipeline {expandedJob === job.id ? <FiChevronUp /> : <FiChevronDown />}</>
                                 )}
                              </button>
                              <button
                                onClick={() => handleDeleteJob(job.id)}
                                className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 transition-all border border-white/5"
                              >
                                 <FiTrash2 size={18} />
                              </button>
                           </div>
                        </div>
                     </div>

                     {/* 🌊 EXPANDED PIPELINE */}
                     <AnimatePresence>
                        {expandedJob === job.id && candidates[job.id] && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden mt-8 pt-8 border-t border-white/5"
                          >
                             <div className="flex items-center justify-between mb-8">
                                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Ranked Talent Pipeline</h4>
                                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                                   <FiSearch className="text-slate-600" size={10} />
                                   <span className="text-[9px] text-slate-600 font-black">AI FILTER ACTIVE</span>
                                </div>
                             </div>

                             {candidates[job.id].length === 0 ? (
                               <div className="py-12 text-center bg-white/[0.01] rounded-3xl border border-dashed border-white/5">
                                  <p className="text-slate-500 text-xs font-medium italic">No candidates matched the criteria yet.</p>
                               </div>
                             ) : (
                               <div className="grid grid-cols-1 gap-4">
                                  {candidates[job.id].map((candidate, ci) => (
                                    <CandidateCard 
                                      key={ci} 
                                      candidate={candidate} 
                                      rank={ci + 1} 
                                      onStatusUpdate={(status) => handleStatusUpdate(candidate.id, job.id, status)}
                                    />
                                  ))}
                               </div>
                             )}
                          </motion.div>
                        )}
                     </AnimatePresence>
                  </motion.div>
                ))}
             </div>
           )}
        </div>
      </div>

      {/* 🔳 POST JOB MODAL */}
      <AnimatePresence>
        {showPostForm && (
          <PostJobModal
            onClose={() => setShowPostForm(false)}
            onSuccess={() => { setShowPostForm(false); loadMyJobs(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/** 👤 PREMIUM CANDIDATE CARD */
function CandidateCard({ candidate, rank, onStatusUpdate }) {
  const score = candidate.score_breakdown?.total_score || 0;
  const [expanded, setExpanded] = useState(false);
  const status = candidate.status || 'pending';

  return (
    <motion.div 
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: rank * 0.05 }}
      className={`bg-white/[0.02] hover:bg-white/[0.04] border rounded-3xl p-5 transition-all duration-300 relative group ${
        expanded ? 'border-indigo-500/30 ring-1 ring-indigo-500/10 shadow-2xl' : 'border-white/5 shadow-sm'
      }`}
    >
       <div className="flex items-center gap-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-base shadow-lg shadow-indigo-900/30">
             #{rank}
          </div>
          
          <div className="flex-1 min-w-0">
             <div className="flex items-center gap-3 mb-1">
                <h4 className="text-white font-black text-sm tracking-tight">{candidate.candidate_name}</h4>
                {status !== 'pending' && (
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-lg tracking-widest ${
                    status === 'shortlisted' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/30' : 'bg-rose-500 text-white'
                  }`}>
                    {status}
                  </span>
                )}
             </div>
             <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{candidate.candidate_email}</p>
          </div>

          <div className="flex items-center gap-8">
             <div className="text-right">
                <div className={`text-2xl font-black ${
                  score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-indigo-400' : 'text-amber-400'
                }`}>
                   {Math.round(score)}<span className="text-xs opacity-50 ml-0.5">%</span>
                </div>
                <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.2em]">Match</p>
             </div>

             <div className="flex gap-2 p-1 bg-black/20 rounded-xl border border-white/5">
                <button
                  onClick={() => onStatusUpdate('shortlisted')}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${status === 'shortlisted' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-slate-600 hover:text-emerald-400 hover:bg-white/5'}`}
                >
                   <FiCheckCircle size={18} />
                </button>
                <button
                  onClick={() => onStatusUpdate('rejected')}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${status === 'rejected' ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/20' : 'text-slate-600 hover:text-rose-400 hover:bg-white/5'}`}
                >
                   <FiX size={18} />
                </button>
             </div>

             <button
               onClick={() => setExpanded(!expanded)}
               className={`p-2 rounded-xl bg-white/5 text-slate-600 hover:text-white transition-all ${expanded ? 'rotate-180 text-indigo-400' : ''}`}
             >
                <FiChevronDown size={20} />
             </button>
          </div>
       </div>

       {/* 👤 CANDIDATE DEEP DIVE */}
       <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-6 pt-6 border-t border-white/5"
            >
               <div className="grid md:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: 'Technical', val: candidate.score_breakdown?.skills_score, color: 'indigo' },
                    { label: 'Experience', val: candidate.score_breakdown?.experience_score, color: 'purple' },
                    { label: 'Semantic', val: candidate.score_breakdown?.semantic_score, color: 'blue' },
                    { label: 'Culture', val: candidate.score_breakdown?.education_score, color: 'emerald' }
                  ].map((s, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 text-center">
                       <p className="text-white font-black text-lg mb-1">{Math.round(s.val || 0)}%</p>
                       <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">{s.label}</p>
                    </div>
                  ))}
               </div>

               <div className="space-y-6">
                  <div className="p-5 rounded-[2rem] bg-indigo-500/[0.03] border border-indigo-500/10">
                     <h5 className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-4">AI Recruiter Summary</h5>
                     <p className="text-slate-400 text-xs leading-relaxed italic opacity-90">
                        {candidate.explanation?.overall_assessment || "Analyzing candidate's long-term fit and potential within the organization based on deep resume parsing and job relevance matching."}
                     </p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                     <div className="space-y-3">
                        <h5 className="text-[9px] text-emerald-500 font-black uppercase tracking-widest">Matched Competencies</h5>
                        <div className="flex flex-wrap gap-1.5">
                           {candidate.explanation?.matched_skills?.map((s, i) => (
                             <span key={i} className="px-2.5 py-1 rounded-lg bg-emerald-500/5 text-emerald-400 text-[9px] font-black border border-emerald-500/10 uppercase">{s}</span>
                           ))}
                        </div>
                     </div>
                     <div className="space-y-3">
                        <h5 className="text-[9px] text-rose-500 font-black uppercase tracking-widest">Skill Gaps Detected</h5>
                        <div className="flex flex-wrap gap-1.5">
                           {candidate.explanation?.missing_skills?.map((s, i) => (
                             <span key={i} className="px-2.5 py-1 rounded-lg bg-rose-500/5 text-rose-400 text-[9px] font-black border border-rose-500/10 uppercase">{s}</span>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            </motion.div>
          )}
      </AnimatePresence>
    </motion.div>
  );
}

/** ➕ PREMIUM POST JOB MODAL */
function PostJobModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: '', company: '', description: '',
    skills_required: '', preferred_skills: '',
    experience_level: 'mid', min_experience_years: 2,
    location: '', salary_range: '', job_type: 'full-time',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await jobAPI.create({
        ...form,
        skills_required: form.skills_required.split(',').map(s => s.trim()).filter(Boolean),
        preferred_skills: form.preferred_skills.split(',').map(s => s.trim()).filter(Boolean),
        min_experience_years: parseFloat(form.min_experience_years) || 0,
      });
      toast.success('Campaign Launched!');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Launch Failed');
    } finally {
      setLoading(false);
    }
  };

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-[#0a0d1a] border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[3rem] p-10 shadow-2xl relative"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-bl-full blur-2xl"></div>
        <div className="flex items-center justify-between mb-10 relative z-10">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Launch Hiring Campaign</h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Configure AI Matching Parameters</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all border border-white/5">
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Campaign Title</label>
              <input value={form.title} onChange={update('title')} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all font-medium text-sm" placeholder="e.g. Senior Machine Learning Engineer" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Company</label>
              <input value={form.company} onChange={update('company')} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all font-medium text-sm" placeholder="Hiring Organization" required />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Mission Description</label>
            <textarea value={form.description} onChange={update('description')} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all font-medium text-sm min-h-[140px] resize-none" placeholder="Detail the role, mission, and impact..." required />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
             <div className="space-y-2">
               <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Required Skills (CSV)</label>
               <input value={form.skills_required} onChange={update('skills_required')} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all font-medium text-sm" placeholder="Python, PyTorch, SQL" />
             </div>
             <div className="space-y-2">
               <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Experience Years</label>
               <input type="number" value={form.min_experience_years} onChange={update('min_experience_years')} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all font-medium text-sm" min="0" />
             </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
             <div className="space-y-2">
               <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Location</label>
               <input value={form.location} onChange={update('location')} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all font-medium text-sm" placeholder="e.g. San Francisco, CA or Remote" />
             </div>
             <div className="space-y-2">
               <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Salary Range</label>
               <input value={form.salary_range} onChange={update('salary_range')} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all font-medium text-sm" placeholder="e.g. $120k - $160k" />
             </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 rounded-2xl border border-white/10 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-white hover:bg-white/5 transition-all">
              Abort
            </button>
            <button type="submit" disabled={loading} className="flex-[2] py-4 rounded-2xl bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-900/20 disabled:opacity-50">
              {loading ? 'Launching...' : 'Launch Campaign'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
