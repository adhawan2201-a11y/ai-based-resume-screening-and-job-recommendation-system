import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobAPI } from '../services/api';
import { FiBriefcase, FiSearch, FiMapPin, FiClock } from 'react-icons/fi';

export default function JobListPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadJobs();
  }, [level]);

  const loadJobs = async (searchTerm = '') => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm || search) params.search = searchTerm || search;
      if (level) params.experience_level = level;
      const res = await jobAPI.list(params);
      setJobs(res.data.jobs || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error('Error loading jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const isNewJob = (dateString) => {
    const diffTime = Math.abs(new Date() - new Date(dateString));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadJobs(search);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <FiBriefcase className="text-primary-400" /> Browse Jobs
        </h1>
        <p className="text-dark-400 mt-1">{total} positions available</p>
      </div>

      {/* Search & Filter */}
      <div className="glass-card p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field !pl-10"
              placeholder="Search by title, company, or skill..."
            />
          </div>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="input-field !w-auto min-w-[150px]"
          >
            <option value="">All Levels</option>
            <option value="entry">Entry</option>
            <option value="mid">Mid</option>
            <option value="senior">Senior</option>
            <option value="lead">Lead</option>
          </select>
          <button type="submit" className="gradient-btn">Search</button>
        </form>
      </div>

      {/* Job List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
        </div>
      ) : jobs.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <FiBriefcase className="text-4xl text-dark-500 mx-auto mb-4" />
          <p className="text-white font-medium">No jobs found</p>
          <p className="text-dark-400 text-sm mt-1">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs?.map((job) => (
            <Link key={job.id} to={`/jobs/${job.id}`} className="block">
              <div className="glass-card-hover p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg hover:text-primary-400 transition-colors flex items-center gap-2">
                      {isNewJob(job.created_at) && <span className="badge-accent !py-0.5 !text-[10px] animate-pulse">NEW</span>}
                      {job.title}
                    </h3>
                    <p className="text-dark-400 text-sm mt-0.5">{job.company}</p>

                    <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-dark-500">
                      {job.location && (
                        <span className="flex items-center gap-1">
                          <FiMapPin /> {job.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1 capitalize">
                        <FiClock /> {job.experience_level || 'mid'} level
                      </span>
                      {job.salary_range && <span>💰 {job.salary_range}</span>}
                      <span className="capitalize badge-primary">{job.job_type}</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {(job.skills_required || []).slice(0, 8).map((skill, i) => (
                        <span key={i} className="text-xs bg-dark-700/80 text-dark-300 px-2 py-0.5 rounded-md">
                          {skill}
                        </span>
                      ))}
                      {(job.skills_required || []).length > 8 && (
                        <span className="text-xs text-dark-500">+{job.skills_required.length - 8} more</span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs text-dark-500">
                      {new Date(job.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {job.description && (
                  <p className="text-dark-400 text-sm mt-3 line-clamp-2">{job.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
