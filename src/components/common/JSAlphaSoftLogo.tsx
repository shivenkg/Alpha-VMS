import React, { useId } from 'react';

interface JSAlphaSoftLogoProps {
  className?: string;
  variant?: 'full' | 'icon' | 'badge';
  darkTheme?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const JSAlphaSoftLogo: React.FC<JSAlphaSoftLogoProps> = ({
  className = '',
  variant = 'full',
  darkTheme = false,
  size = 'md',
}) => {
  const idPrefix = useId().replace(/:/g, '');

  const [imgError, setImgError] = React.useState(false);

  // Proportional aspect ratio (320:210 ≈ 1.52)
  const emblemSizeMap = {
    sm: 'h-6 w-9',
    md: 'h-8 w-12',
    lg: 'h-11 w-17',
    xl: 'h-14 w-21',
  };

  const textTitleSizeMap = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-2xl',
  };

  const blueGradId = `blueGrad_${idPrefix}`;
  const orangeGradId = `orangeGrad_${idPrefix}`;
  const swooshGradId = `swooshGrad_${idPrefix}`;

  // High-Precision Brand Emblem SVG matching JS AlphaSoft asset
  const EmblemSvg = (
    <svg
      viewBox="0 -10 320 215"
      className={`${emblemSizeMap[size]} shrink-0 transition-transform duration-200 overflow-visible`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="JS AlphaSoft Emblem"
    >
      <defs>
        {/* Vibrant Blue Gradient for 'J' */}
        <linearGradient id={blueGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="25%" stopColor="#2563EB" />
          <stop offset="70%" stopColor="#1D4ED8" />
          <stop offset="100%" stopColor="#172554" />
        </linearGradient>

        {/* Fiery Sunset Orange Gradient for 'S' */}
        <linearGradient id={orangeGradId} x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#FDBA74" />
          <stop offset="20%" stopColor="#FB923C" />
          <stop offset="55%" stopColor="#F97316" />
          <stop offset="85%" stopColor="#EA580C" />
          <stop offset="100%" stopColor="#DC2626" />
        </linearGradient>

        {/* Dynamic Lower Orbital Swoosh (Deep Blue sweep to Radiant Orange) */}
        <linearGradient id={swooshGradId} x1="0%" y1="80%" x2="100%" y2="20%">
          <stop offset="0%" stopColor="#0284C7" />
          <stop offset="20%" stopColor="#1D4ED8" />
          <stop offset="42%" stopColor="#2563EB" />
          <stop offset="60%" stopColor="#DC2626" />
          <stop offset="80%" stopColor="#EA580C" />
          <stop offset="100%" stopColor="#F97316" />
        </linearGradient>

        <filter id={`glow_${idPrefix}`} x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodOpacity="0.2" />
        </filter>
      </defs>

      <g filter={`url(#glow_${idPrefix})`}>
        {/* 'J' Shape - Bold fluid curved glyph */}
        <path
          d="M 124 16 L 158 16 L 128 104 C 122 122 112 136 96 146 C 80 156 62 160 46 160 C 38 160 32 158 28 154 C 24 150 24 145 26 140 C 29 128 40 118 50 110 C 62 101 69 88 74 68 L 88 16 Z"
          fill={`url(#${blueGradId})`}
        />

        {/* 'S' Shape - Dynamic serpentine glyph */}
        <path
          d="M 166 66 C 166 44 180 16 222 16 C 248 16 268 28 274 48 L 236 56 C 234 44 228 38 216 38 C 204 38 198 44 198 52 C 198 62 208 67 226 73 L 242 78 C 268 87 282 102 282 122 C 282 144 264 166 224 166 C 192 166 168 152 162 130 L 200 122 C 202 132 210 138 222 138 C 234 138 244 131 244 121 C 244 112 236 106 218 100 L 202 94 C 178 86 166 76 166 66 Z"
          fill={`url(#${orangeGradId})`}
        />

        {/* Dynamic Lower Orbital Swoosh */}
        <path
          d="M 14 148 C 28 178 68 190 112 176 C 164 160 214 124 286 44 C 264 88 214 136 160 158 C 114 176 72 174 46 150 C 36 141 24 136 14 148 Z"
          fill={`url(#${swooshGradId})`}
        />

        {/* High-Tech Pixel Particle Dispersion (from upper 'S') */}
        <rect x="284" y="24" width="13" height="13" rx="2.5" fill="#EA580C" />
        <rect x="304" y="14" width="12" height="12" rx="2.5" fill="#F97316" />
        <rect x="294" y="0" width="11" height="11" rx="2" fill="#FB923C" />
        <rect x="274" y="8" width="12" height="12" rx="2.5" fill="#EA580C" />
        <rect x="300" y="42" width="10" height="10" rx="2" fill="#E11D48" />
        <rect x="286" y="56" width="9" height="9" rx="1.5" fill="#EA580C" />
        <rect x="272" y="72" width="8" height="8" rx="1.5" fill="#F97316" />
        <rect x="260" y="88" width="7" height="7" rx="1" fill="#FB923C" />
        <rect x="250" y="102" width="6" height="6" rx="1" fill="#F97316" />
      </g>
    </svg>
  );

  const LogoEmblem = !imgError ? (
    <img
      src="/logo.svg"
      alt="JS AlphaSoft"
      className={`${emblemSizeMap[size]} object-contain shrink-0`}
      onError={() => setImgError(true)}
    />
  ) : (
    EmblemSvg
  );

  if (variant === 'icon') {
    return <div className={`inline-flex items-center shrink-0 ${className}`}>{LogoEmblem}</div>;
  }

  return (
    <div className={`inline-flex items-center gap-2.5 select-none shrink-0 ${className}`}>
      {LogoEmblem}
      <div className="flex flex-col leading-none">
        <div className={`flex items-baseline gap-1 font-bold ${textTitleSizeMap[size]} tracking-tight`}>
          <span className={darkTheme ? 'text-[#60A5FA] font-black' : 'text-[#1D4ED8] font-black'}>
            JS
          </span>
          <span className={darkTheme ? 'text-white font-bold' : 'text-[#0F172A] font-bold'}>
            AlphaSoft
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-orange-500/15 text-orange-500 border border-orange-500/30 ml-1 leading-tight">
            VMS
          </span>
        </div>
        <span
          className={`text-[9px] tracking-wider uppercase font-semibold mt-1 ${
            darkTheme ? 'text-slate-300' : 'text-[#526575]'
          }`}
        >
          Visitor Management System
        </span>
      </div>
    </div>
  );
};
