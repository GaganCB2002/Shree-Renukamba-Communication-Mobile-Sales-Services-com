import { useMemo } from 'react';

const COLORS = ['rgba(79,70,229,0.6)', 'rgba(99,102,241,0.5)', 'rgba(167,139,250,0.5)'];

const rng = () => Math.random();

const SparkleEffect = ({ count = 8, className = '' }) => {
  const sparkles = useMemo(() => Array.from({ length: count }).map(() => ({
    left: `${10 + rng() * 80}%`,
    top: `${10 + rng() * 80}%`,
    width: `${2 + rng() * 4}px`,
    height: `${2 + rng() * 4}px`,
    animationDelay: `${rng() * 2}s`,
    animationDuration: `${2.5 + rng() * 2}s`,
    background: COLORS[Math.floor(rng() * COLORS.length)],
  })), [count]);

  return (
    <div className={`sparkle-container ${className}`} aria-hidden="true">
      {sparkles.map((style, i) => (
        <div key={i} className="sparkle" style={style} />
      ))}
    </div>
  );
};

export default SparkleEffect;
