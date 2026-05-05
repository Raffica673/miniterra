import AnimatedNumber from '../shared/AnimatedNumber';
import { getScoreColor, getClassification } from '../../utils/scoring';

export default function ScoreGauge({ score }) {
  const color = getScoreColor(score);
  const classification = getClassification(score);
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - score / 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
      <svg width={140} height={140} viewBox="0 0 140 140">
        {/* Background ring */}
        <circle
          cx={70} cy={70} r={radius}
          fill="none"
          stroke="var(--bg-surface)"
          strokeWidth={8}
        />
        {/* Score ring */}
        <circle
          cx={70} cy={70} r={radius}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 70 70)"
          style={{ transition: 'stroke-dashoffset 500ms ease-out, stroke 500ms' }}
        />
        {/* Score number */}
        <text
          x={70} y={66}
          textAnchor="middle"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 38,
            fontWeight: 700,
            fill: 'white',
          }}
        >
          {Math.round(score)}
        </text>
        {/* Classification */}
        <text
          x={70} y={86}
          textAnchor="middle"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 11,
            fill: color,
          }}
        >
          {classification}
        </text>
      </svg>
    </div>
  );
}
