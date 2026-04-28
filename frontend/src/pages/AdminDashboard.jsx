import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { 
  FiUsers, FiBriefcase, FiFileText, FiTarget, FiActivity, 
  FiTrash2, FiSlash, FiCheckCircle, FiSearch, FiFilter, FiBarChart2, FiTrendingUp, FiCpu, FiShield
} from 'react-icons/fi';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [userRes, jobRes, resRes, anaRes] = await Promise.all([
        adminAPI.getUsers().catch(e => ({ data: [] })),
        adminAPI.getJobs().catch(e => ({ data: [] })),
        adminAPI.getResumes().catch(e => ({ data: [] })),
        adminAPI.getAnalytics().catch(e => ({ data: null }))
      ]);
      setUsers(userRes.data || []);
      setJobs(jobRes.data || []);
      setResumes(resRes.data || []);
      setAnalytics(anaRes.data);
    } catch (err) {
      toast.error('System synchronization failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user? This will remove all their resumes and matches.')) return;
    try {
      await adminAPI.deleteUser(id);
      toast.success('User Purged');
      loadAllData();
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  const handleToggleBlock = async (id, isBlocked) => {
    try {
      await adminAPI.toggleBlock(id, !isBlocked);
      toast.success(isBlocked ? 'Access Restored' : 'Access Restricted');
      loadAllData();
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm('Delete this job?')) return;
    try {
      await adminAPI.deleteJob(id);
      toast.success('Job Removed');
      loadAllData();
    } catch (err) {
      toast.error('Failed to delete job');
    }
  };

  const handleDeleteResume = async (id) => {
    if (!window.confirm('Delete this resume?')) return;
    try {
      await adminAPI.deleteResume(id);
      toast.success('Resume Deleted');
      loadAllData();
    } catch (err) {
      toast.error('Failed to delete resume');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-72px)] gap-4 bg-[#03050d]">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="text-slate-400 font-medium animate-pulse tracking-wide uppercase text-[10px]">Syncing Command Center...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#03050d] text-slate-300 relative overflow-hidden font-sans pb-20 selection:bg-indigo-500/30">
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
              <FiShield className="text-indigo-500 animate-pulse" />
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">System Admin Privileges Active</p>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">
              Command <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Center</span>
            </h1>
            <p className="text-slate-400 font-medium max-w-xl text-lg leading-relaxed opacity-80">
              Complete system oversight: Monitor AI performance, manage global talent infrastructure, and analyze platform health.
            </p>
          </div>
          
          <div className="flex p-1.5 bg-white/[0.02] backdrop-blur-3xl rounded-2xl border border-white/5 shadow-2xl">
            {['overview', 'users', 'jobs', 'resumes', 'analytics'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all relative ${
                  activeTab === tab ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {activeTab === tab && (
                  <motion.div layoutId="adminTab" className="absolute inset-0 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20" />
                )}
                <span className="relative z-10">{tab}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 🔳 STATS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
          <StatCard label="Total Users" value={analytics?.total_users || 0} icon={<FiUsers />} color="indigo" />
          <StatCard label="Candidates" value={analytics?.total_candidates || 0} icon={<FiUsers />} color="purple" />
          <StatCard label="Recruiters" value={analytics?.total_recruiters || 0} icon={<FiUsers />} color="pink" />
          <StatCard label="Jobs Posted" value={analytics?.total_jobs || 0} icon={<FiBriefcase />} color="indigo" />
          <StatCard label="Resumes" value={analytics?.total_resumes || 0} icon={<FiFileText />} color="purple" />
          <StatCard label="AI Matches" value={analytics?.total_matches || 0} icon={<FiTarget />} color="emerald" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
          >
            {activeTab === 'overview' && (
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Distribution Chart */}
                <motion.div whileHover={{ scale: 1.005 }} className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-3xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-3xl"></div>
                  <h3 className="text-white font-black text-sm uppercase tracking-widest mb-10 flex items-center gap-3">
                    <FiBarChart2 className="text-indigo-400" /> User Distribution
                  </h3>
                  <div className="h-72 relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Candidates', value: analytics?.total_candidates || 0 },
                            { name: 'Recruiters', value: analytics?.total_recruiters || 0 }
                          ]}
                          innerRadius={70}
                          outerRadius={95}
                          paddingAngle={8}
                          dataKey="value"
                          stroke="none"
                        >
                          <Cell fill="#6366f1" />
                          <Cell fill="#a855f7" />
                        </Pie>
                        <Tooltip 
                          contentStyle={{ background: '#0a0d1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', backdropBlur: 'xl' }}
                          itemStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                        />
                        <Legend iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                {/* System Health */}
                <motion.div whileHover={{ scale: 1.005 }} className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-3xl relative overflow-hidden group">
                  <h3 className="text-white font-black text-sm uppercase tracking-widest mb-10 flex items-center gap-3">
                    <FiActivity className="text-emerald-400" /> System Integrity
                  </h3>
                  <div className="space-y-8 relative z-10">
                    <div className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10">
                       <div className="flex justify-between items-end mb-4">
                          <div>
                             <p className="text-white font-black text-2xl">{Math.round(analytics?.avg_ats_score || 0)}%</p>
                             <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Average ATS Score Accuracy</p>
                          </div>
                          <FiTrendingUp className="text-emerald-500 mb-1" />
                       </div>
                       <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: `${analytics?.avg_ats_score || 0}%` }}
                            className="h-full bg-indigo-500 rounded-full"
                          />
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                       <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                          <p className="text-white font-black text-2xl">{analytics?.total_matches || 0}</p>
                          <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1">Global AI Matches</p>
                       </div>
                       <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                          <p className="text-white font-black text-2xl">{analytics?.total_resumes || 0}</p>
                          <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1">Parsed Profiles</p>
                       </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-3xl">
                <div className="p-8 border-b border-white/5 flex flex-wrap gap-6 items-center justify-between">
                  <div className="relative group">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Search System Users..." 
                      className="bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all w-80 font-medium"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select 
                    className="bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all font-black uppercase tracking-widest"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <option value="all">ALL ROLES</option>
                    <option value="candidate">CANDIDATES</option>
                    <option value="recruiter">RECRUITERS</option>
                  </select>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-white/[0.01] text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                      <tr>
                        <th className="px-8 py-5">Identity</th>
                        <th className="px-8 py-5">Role</th>
                        <th className="px-8 py-5">Registered</th>
                        <th className="px-8 py-5 text-right">Administrative Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {users
                        .filter(u => u.role !== 'admin')
                        .filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()))
                        .filter(u => roleFilter === 'all' || u.role === roleFilter)
                        .map(user => (
                        <tr key={user.id} className="hover:bg-white/[0.03] transition-colors group">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-black text-sm border border-indigo-500/10">
                                  {user.name.charAt(0)}
                               </div>
                               <div>
                                  <p className="text-white font-black text-sm tracking-tight">{user.name}</p>
                                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">{user.email}</p>
                               </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border ${
                              user.role === 'recruiter' ? 'bg-purple-500/10 text-purple-400 border-purple-500/10' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/10'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-slate-400 text-[11px] font-black uppercase tracking-widest">
                            {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => handleToggleBlock(user.id, user.is_blocked)}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border ${user.is_blocked ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}
                                title={user.is_blocked ? 'Unblock' : 'Block Access'}
                              >
                                <FiSlash size={16} />
                              </button>
                              <button 
                                onClick={() => handleDeleteUser(user.id)}
                                className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 transition-all hover:text-white"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-10">
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Top Candidates */}
                  <motion.div whileHover={{ scale: 1.005 }} className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-10 shadow-2xl backdrop-blur-3xl">
                    <h3 className="text-white font-black text-sm uppercase tracking-widest mb-10 flex items-center gap-3">
                      <FiCheckCircle className="text-emerald-400" /> High-Performance Talent
                    </h3>
                    <div className="space-y-4">
                      {analytics?.top_candidates?.map((c, i) => (
                        <div key={i} className="flex items-center justify-between bg-white/[0.02] p-6 rounded-3xl border border-white/5 group hover:border-indigo-500/30 transition-all">
                          <div className="flex items-center gap-4">
                            <span className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-black text-xs border border-indigo-500/10">#{i+1}</span>
                            <span className="text-white font-black text-sm tracking-tight">{c.name}</span>
                          </div>
                          <div className="text-right">
                             <span className="text-indigo-400 font-black text-lg">{Math.round(c.score)}%</span>
                             <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest">Match Score</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Market Demand */}
                  <motion.div whileHover={{ scale: 1.005 }} className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-10 shadow-2xl backdrop-blur-3xl">
                    <h3 className="text-white font-black text-sm uppercase tracking-widest mb-10 flex items-center gap-3">
                      <FiTrendingUp className="text-indigo-400" /> Global Market Demand
                    </h3>
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics?.top_skills || []}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="skill" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                          <Tooltip 
                            contentStyle={{ background: '#0a0d1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                            itemStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                            cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                          />
                          <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={40}>
                             {analytics?.top_skills?.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                             ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>
                </div>
              </div>
            )}
            
            {(activeTab === 'jobs' || activeTab === 'resumes') && (
               <div className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-3xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-white/[0.01] text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                        <tr>
                          <th className="px-8 py-5">{activeTab === 'jobs' ? 'Campaign Info' : 'Candidate'}</th>
                          <th className="px-8 py-5">{activeTab === 'jobs' ? 'Recruiter' : 'Intelligence File'}</th>
                          <th className="px-8 py-5">{activeTab === 'jobs' ? 'Launch Date' : 'Identified Skills'}</th>
                          <th className="px-8 py-5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {(activeTab === 'jobs' ? jobs : resumes).map(item => (
                          <tr key={item.id} className="hover:bg-white/[0.03] transition-colors group">
                            <td className="px-8 py-6">
                               {activeTab === 'jobs' ? (
                                  <div>
                                     <p className="text-white font-black text-sm tracking-tight">{item.title}</p>
                                     <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">{item.company}</p>
                                  </div>
                               ) : (
                                  <p className="text-white font-black text-sm tracking-tight">{item.candidate.name}</p>
                               )}
                            </td>
                            <td className="px-8 py-6">
                               {activeTab === 'jobs' ? (
                                  <div>
                                     <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">{item.recruiter.name}</p>
                                     <p className="text-slate-600 text-[9px] font-black uppercase">ID: {item.recruiter.id}</p>
                                  </div>
                               ) : (
                                  <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">{item.filename}</p>
                               )}
                            </td>
                            <td className="px-8 py-6">
                               {activeTab === 'jobs' ? (
                                  <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                                     {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
                                  </span>
                               ) : (
                                  <div className="flex flex-wrap gap-1.5 max-w-xs">
                                     {item.skills.slice(0, 4).map((s, i) => (
                                       <span key={i} className="px-2 py-0.5 rounded-lg bg-indigo-500/5 text-indigo-400 text-[8px] font-black border border-indigo-500/10 uppercase">{s}</span>
                                     ))}
                                     {item.skills.length > 4 && <span className="text-[8px] text-slate-600 font-black self-center">+{item.skills.length - 4}</span>}
                                  </div>
                               )}
                            </td>
                            <td className="px-8 py-6 text-right">
                              <button 
                                onClick={() => activeTab === 'jobs' ? handleDeleteJob(item.id) : handleDeleteResume(item.id)}
                                className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 transition-all hover:text-white opacity-0 group-hover:opacity-100"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
               </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <motion.div 
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-white/[0.02] border border-white/10 rounded-[2rem] p-6 backdrop-blur-3xl shadow-xl flex flex-col items-center justify-center text-center group"
    >
       <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center text-lg ${
         color === 'indigo' ? 'bg-indigo-500/10 text-indigo-400' :
         color === 'purple' ? 'bg-purple-500/10 text-purple-400' :
         color === 'pink' ? 'bg-pink-500/10 text-pink-400' :
         color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400' :
         'bg-blue-500/10 text-blue-400'
       }`}>
          {icon}
       </div>
       <span className="text-white font-black text-2xl mb-1">{value || 0}</span>
       <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{label}</span>
    </motion.div>
  );
}
