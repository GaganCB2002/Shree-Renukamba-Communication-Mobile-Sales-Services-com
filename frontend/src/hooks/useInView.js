import { useRef, useState, useEffect, useCallback } from 'react';

export default function useInView(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  const [highlight, setHighlight] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (options.highlight !== false) {
            setHighlight(true);
            setTimeout(() => setHighlight(false), 1200);
          }
          if (options.once !== false) observer.unobserve(el);
        } else if (options.once === false) {
          setInView(false);
        }
      },
      { threshold: options.threshold || 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const resetHighlight = useCallback(() => setHighlight(false), []);

  return [ref, inView, highlight, resetHighlight];
}
