export const DiscColorIcon = () => {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <defs>
        <radialGradient id="vinylGrad">
          <stop offset="0%" style={{ stopColor: '#1F2937', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#111827', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#030712', stopOpacity: 1 }} />
        </radialGradient>
        <linearGradient id="labelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#EC4899', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#F43F5E', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      
      {/* Vinyl Disc */}
      <circle cx="50" cy="50" r="38" fill="url(#vinylGrad)" />
      
      {/* Vinyl Grooves */}
      <circle cx="50" cy="50" r="36" fill="none" stroke="#374151" strokeWidth="0.5" opacity="0.6" />
      <circle cx="50" cy="50" r="34" fill="none" stroke="#374151" strokeWidth="0.5" opacity="0.5" />
      <circle cx="50" cy="50" r="32" fill="none" stroke="#374151" strokeWidth="0.5" opacity="0.4" />
      <circle cx="50" cy="50" r="30" fill="none" stroke="#374151" strokeWidth="0.5" opacity="0.3" />
      <circle cx="50" cy="50" r="28" fill="none" stroke="#374151" strokeWidth="0.5" opacity="0.3" />
      <circle cx="50" cy="50" r="26" fill="none" stroke="#374151" strokeWidth="0.5" opacity="0.3" />
      
      {/* Center Label */}
      <circle cx="50" cy="50" r="15" fill="url(#labelGrad)" />
      
      {/* Label Detail Ring */}
      <circle cx="50" cy="50" r="14" fill="none" stroke="#FCD34D" strokeWidth="0.5" opacity="0.8" />
      <circle cx="50" cy="50" r="12" fill="none" stroke="#FCD34D" strokeWidth="0.5" opacity="0.6" />
      
      {/* Center Hole */}
      <circle cx="50" cy="50" r="4" fill="#030712" />
      
      {/* Musical Note */}
      <g transform="translate(65, 28)">
        <ellipse cx="0" cy="12" rx="3.5" ry="3" fill="#FCD34D" />
        <rect x="-0.5" y="0" width="2" height="12" fill="#FCD34D" />
        <path d="M 1.5 0 Q 8 -2 8 3 L 8 8" stroke="#FCD34D" strokeWidth="2" fill="none" strokeLinecap="round" />
        <ellipse cx="8" cy="11" rx="3" ry="2.5" fill="#FCD34D" />
      </g>
    </svg>
  );
};
