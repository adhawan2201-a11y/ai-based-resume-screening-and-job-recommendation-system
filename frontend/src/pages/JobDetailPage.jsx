import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobAPI, matchingAPI } from '../services/api';
import ScoreRing from '../components/ScoreRing';
import { FiArrowLeft, FiMapPin, FiClock, FiDollarSign, FiBriefcase, FiTarget } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function JobDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scoreResult, setScoreResult] = useState(null);
  const [scoring, setScoring] = useState(false);

  useEffect(() => {
    loadJob();
  }, [id]);

  const loadJob = async () => {
    try {
      const res = await jobAPI.get(id);
      setJob(res.data);
    } catch {
      toast.error('Job not found');
    } finally {
      setLoading(false);
    }
  };

  const handleScore = async () => {
    setScoring(true);
    try {
      const res = await matchingAPI.scoreJob(id);
      setScoreResult(res.data);
      toast.success(`Match Score: ${Math.round(res.data.score_breakdown.total_score)}%`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to calculate score');
    } finally {
      setScoring(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-white text-xl">Job not found</p>
        <Link to="/jobs" className="gradient-btn mt-4 inline-block">Back to Jobs</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/jobs" className="inline-flex items-center gap-2 text-dark-400 hover:text-white mb-6 transition-colors">
        <FiArrowLeft /> Back to Jobs
      </Link>

      <div className="glass-card p-6 sm:p-8 mb-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{job.title}</h1>
            <p className="text-dark-400 text-lg mt-1">{job.company}</p>
          </div>
          {user?.role === 'candidate' && (
            <button
              onClick={handleScore}
              disabled={scoring}
              className="gradient-btn flex items-center gap-2 shrink-0 h-fit"
            >
              {scoring ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <><FiTarget /> Calculate Match Score</>
              )}
            </button>
          )}
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-4 mb-6 text-sm text-dark-400">
          {job.location && (
            <span className="flex items-center gap-1.5">
              <FiMapPin className="text-primary-400" /> {job.location}
            </span>
          )}
          <span className="flex items-center gap-1.5 capitalize">
            <FiClock className="text-primary-400" /> {job.experience_level} level
          </span>
          {job.salary_range && (
            <span className="flex items-center gap-1.5">
              <FiDollarSign className="text-primary-400" /> {job.salary_range}
            </span>
          )}
          <span className="flex items-center gap-1.5 capitalize">
            <FiBriefcase className="text-primary-400" /> {job.job_type}
          </span>
          {job.min_experience_years > 0 && (
            <span>Min {job.min_experience_years} years experience</span>
          )}
        </div>

        {/* Description */}
        <div className="mb-6">
          <h2 className="text-white font-semibold mb-3">Job Description</h2>
          <p className="text-dark-300 leading-relaxed whitespace-pre-line">{job.description}</p>
        </div>

        {/* Skills */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-white font-semibold mb-3">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {(job.skills_required || []).map((s, i) => (
                <span key={i} className="badge-primary">{s}</span>
              ))}
            </div>
          </div>
          {job.preferred_skills?.length > 0 && (
            <div>
              <h3 className="text-white font-semibold mb-3">Preferred Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.preferred_skills.map((s, i) => (
                  <span key={i} className="badge-accent">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Score Result */}
      {scoreResult && (
        <div className="glass-card p-6 sm:p-8 animate-slide-up">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <FiTarget className="text-primary-400" /> Your Match Analysis
          </h2>

          <div className="flex flex-col sm:flex-row items-center gap-8 mb-6">
            <ScoreRing score={scoreResult.score_breakdown.total_score} size={140} strokeWidth={10} />
            <div className="grid grid-cols-2 gap-4 flex-1">
              {[
                { label: 'Skills (40%)', value: scoreResult.score_breakdown.skills_score },
                { label: 'Experience (25%)', value: scoreResult.score_breakdown.experience_score },
                { label: 'Semantic (20%)', value: scoreResult.score_breakdown.semantic_score },
                { label: 'Education (15%)', value: scoreResult.score_breakdown.education_score },
              ].map((item, i) => (
                <div key={i} className="bg-dark-900/50 rounded-xl p-3 border border-white/5">
                  <p className="text-2xl font-bold text-white">{Math.round(item.value)}</p>
                  <p className="text-xs text-dark-400">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Explanation */}
          <div className="space-y-4">
            {scoreResult.explanation?.matched_skills?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-accent-400 mb-2">✓ Matched Skills</h3>
                <div className="flex flex-wrap gap-1.5">
                  {scoreResult.explanation.matched_skills.map((s, i) => (
                    <span key={i} className="badge-accent">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {scoreResult.explanation?.missing_skills?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-amber-400 mb-2">✗ Missing Skills</h3>
                <div className="flex flex-wrap gap-1.5">
                  {scoreResult.explanation.missing_skills.map((s, i) => (
                    <span key={i} className="badge-warning">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {scoreResult.explanation?.experience_analysis && (
              <div className="bg-dark-900/50 rounded-xl p-4 border border-white/5">
                <h3 className="text-sm font-medium text-primary-400 mb-1">Experience Analysis</h3>
                <p className="text-dark-300 text-sm">{scoreResult.explanation.experience_analysis}</p>
              </div>
            )}

            {scoreResult.explanation?.education_analysis && (
              <div className="bg-dark-900/50 rounded-xl p-4 border border-white/5">
                <h3 className="text-sm font-medium text-primary-400 mb-1">Education Analysis</h3>
                <p className="text-dark-300 text-sm">{scoreResult.explanation.education_analysis}</p>
              </div>
            )}

            {scoreResult.explanation?.overall_assessment && (
              <div className="bg-primary-500/5 rounded-xl p-4 border border-primary-500/10">
                <h3 className="text-sm font-medium text-white mb-1">Overall Assessment</h3>
                <p className="text-dark-300 text-sm">{scoreResult.explanation.overall_assessment}</p>
              </div>
            )}

            {scoreResult.explanation?.improvement_suggestions?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-white mb-2">💡 Suggestions</h3>
                {scoreResult.explanation.improvement_suggestions.map((s, i) => (
                  <p key={i} className="text-dark-300 text-sm mb-1 flex items-start gap-2">
                    <span className="text-primary-400">•</span> {s}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
