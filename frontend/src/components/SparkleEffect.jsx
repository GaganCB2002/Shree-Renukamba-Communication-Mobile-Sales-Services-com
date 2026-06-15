const SparkleEffect = ({ count = 8, className = '' }) => {
  return (
    <div className={`sparkle-container ${className}`} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="sparkle" style={{
          left: `${10 + Math.random() * 80}%`,
          top: `${10 + Math.random() * 80}%`,
          width: `${2 + Math.random() * 4}px`,
          height: `${2 + Math.random() * 4}px`,
          animationDelay: `${Math.random() * 2}s`,
          animationDuration: `${2.5 + Math.random() * 2}s`,
          background: ['rgba(79,70,229,0.6)', 'rgba(99,102,241,0.5)', 'rgba(167,139,250,0.5)'][Math.floor(Math.random() * 3)]
        }} />
      ))}
    </div>
  );
};

export default SparkleEffect;
