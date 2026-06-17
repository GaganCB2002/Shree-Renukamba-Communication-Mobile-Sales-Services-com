import { useState } from 'react';

const FALLBACK_EMOJI = '📱';
const FALLBACK_ICON_CLASS = 'text-4xl text-gray-300';

const SafeImage = ({ src, alt, className = '', fallback = 'emoji', style, ...props }) => {
  const [failed, setFailed] = useState(false);
  const [hide, setHide] = useState(false);

  if (!src || failed) {
    if (hide) return null;
    if (fallback === 'emoji') {
      return (
        <div className={`flex items-center justify-center bg-gray-50 ${className}`} style={style}>
          <span className={FALLBACK_ICON_CLASS}>{FALLBACK_EMOJI}</span>
        </div>
      );
    }
    if (fallback === 'icon') {
      return (
        <div className={`flex items-center justify-center bg-gray-50 ${className}`} style={style}>
          <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      );
    }
    return null;
  }

  return (
    <img
      src={src}
      alt={alt || ''}
      className={className}
      style={style}
      loading="lazy"
      onError={() => {
        setFailed(true);
        setTimeout(() => setHide(true), 3000);
      }}
      {...props}
    />
  );
};

export default SafeImage;
