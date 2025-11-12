export const GameColorIcon = () => {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <defs>
        <linearGradient id="controllerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#3B82F6', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#2563EB', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      
      {/* Controller Body */}
      <rect x="15" y="35" width="70" height="30" rx="8" fill="url(#controllerGrad)" />
      
      {/* Left Grip */}
      <path d="M 20 65 L 15 75 Q 15 78 18 78 L 28 78 Q 30 78 30 75 L 28 65 Z" fill="#2563EB" />
      
      {/* Right Grip */}
      <path d="M 80 65 L 85 75 Q 85 78 82 78 L 72 78 Q 70 78 70 75 L 72 65 Z" fill="#2563EB" />
      
      {/* D-Pad */}
      <rect x="28" y="45" width="3" height="10" rx="1" fill="#1F2937" />
      <rect x="25" y="48" width="9" height="3" rx="1" fill="#1F2937" />
      
      {/* Action Buttons */}
      <circle cx="68" cy="42" r="3.5" fill="#EF4444" />
      <circle cx="75" cy="48" r="3.5" fill="#FCD34D" />
      <circle cx="68" cy="54" r="3.5" fill="#10B981" />
      <circle cx="61" cy="48" r="3.5" fill="#06B6D4" />
      
      {/* Analog Sticks */}
      <circle cx="42" cy="48" r="6" fill="#1F2937" />
      <circle cx="42" cy="48" r="4" fill="#374151" />
      
      <circle cx="58" cy="52" r="6" fill="#1F2937" />
      <circle cx="58" cy="52" r="4" fill="#374151" />
    </svg>
  );
};
