
import React from 'react';

interface LogoProps {
    className?: string;
    iconColorClass?: string;
}

const Logo: React.FC<LogoProps> = ({ className = 'w-20 h-20', iconColorClass = 'text-primary' }) => {
  return (
    <svg 
      className={`${className} ${iconColorClass}`}
      viewBox="0 0 100 100" 
      fill="currentColor" 
      xmlns="http://www.w3.org/2000/svg"
    >
        <defs>
            <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor: '#a15cd3', stopOpacity:1}} />
            <stop offset="100%" style={{stopColor: '#8E44AD', stopOpacity:1}} />
            </linearGradient>
        </defs>
        <path d="M20 10 C14.477 10 10 14.477 10 20 L10 80 C10 85.523 14.477 90 20 90 L80 90 C85.523 90 90 85.523 90 80 L90 20 C90 14.477 85.523 10 80 10 L20 10 Z M20 15 L80 15 C82.761 15 85 17.239 85 20 L85 80 C85 82.761 82.761 85 80 85 L20 85 C17.239 85 15 82.761 15 80 L15 20 C15 17.239 17.239 15 20 15 Z" />
        
        {/* Rising bars */}
        <rect x="25" y="55" width="10" height="20" rx="2" opacity="0.8" />
        <rect x="45" y="40" width="10" height="35" rx="2" opacity="0.8" />
        <rect x="65" y="25" width="10" height="50" rx="2" opacity="0.8" />
        
        {/* Rupee Symbol */}
        <text x="50" y="55" fontFamily="Poppins, sans-serif" fontWeight="bold" fontSize="40" fill="currentColor" textAnchor="middle" dominantBaseline="central">₹</text>
    </svg>
  );
};

export default Logo;
