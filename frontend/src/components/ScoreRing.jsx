/**
 * Circular score ring component for ATS scores.
 */
export default function ScoreRing({ score, size = 120, strokeWidth = 8, label = 'ATS Score' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s) => {
    if (s >= 80) return { stroke: '#22c55e', text: 'text-accent-400', glow: 'rgba(34,197,94,0.3)' };
    if (s >= 60) return { stroke: '#6366f1', text: 'text-primary-400', glow: 'rgba(99,102,241,0.3)' };
    if (s >= 40) return { stroke: '#f59e0b', text: 'text-amber-400', glow: 'rgba(245,158,11,0.3)' };
    return { stroke: '#ef4444', text: 'text-red-400', glow: 'rgba(239,68,68,0.3)' };
  };

  const color = getColor(score);

  return (
    <div className="score-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Score arc */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={color.stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 1s ease-out',
            filter: `drop-shadow(0 0 6px ${color.glow})`,
          }}
        />
      </svg>
      <div className="score-value flex flex-col items-center">
        <span className={`text-2xl font-extrabold ${color.text}`}>
          {Math.round(score)}
        </span>
        <span className="text-[10px] text-dark-400 uppercase tracking-wider">{label}</span>
      </div>
    </div>
  );
}
