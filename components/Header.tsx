import React from 'react';
import { SCC_WEBSITE } from '../constants';
import { ExternalLink } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-[#2E3192] shadow-lg sticky top-0 z-50 border-b border-blue-800">
      <div className="max-w-4xl mx-auto px-4 py-2 flex justify-between items-center">
        
        {/* Logo Section */}
        <div className="flex items-center gap-3 sm:gap-4">
            {/* Custom SVG Logo mimicking the user's image */}
            <div className="relative group transition-transform hover:scale-105 duration-300">
                <svg viewBox="0 0 100 100" className="w-14 h-14 sm:w-16 sm:h-16 drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FFED4A" />
                            <stop offset="50%" stopColor="#FFC107" />
                            <stop offset="100%" stopColor="#FF8F00" />
                        </linearGradient>
                        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="1" dy="2" stdDeviation="1" floodColor="#000" floodOpacity="0.3" />
                        </filter>
                    </defs>
                    
                    {/* Outer Ring */}
                    <circle cx="50" cy="50" r="40" stroke="url(#gold-gradient)" strokeWidth="8" />
                    
                    {/* Middle Ring */}
                    <circle cx="50" cy="50" r="24" stroke="url(#gold-gradient)" strokeWidth="8" />
                    
                    {/* Bullseye */}
                    <circle cx="50" cy="50" r="10" fill="url(#gold-gradient)" />
                    
                    {/* Arrow Shaft */}
                    {/* A thick line coming from top right (approx 85,15) towards center */}
                    <line x1="84" y1="16" x2="54" y2="46" stroke="url(#gold-gradient)" strokeWidth="8" strokeLinecap="round" />
                    
                    {/* Arrow Fletching (Tail) */}
                    <path d="M84 16 L88 6 L94 12 L84 16Z" fill="url(#gold-gradient)" />
                    <path d="M84 16 L94 12 L98 22 L84 16Z" fill="url(#gold-gradient)" />
                    
                    {/* Arrow Head (Tip) - overlapping the center */}
                    {/* The shaft covers most of the travel, just adding a small pointer feel if needed, 
                        but usually the shaft into bullseye is enough for this icon style. 
                        Let's add a small triangle at the impact point to simulate the head burying in. */}
                     <path d="M54 46 L46 54 L58 52 Z" fill="url(#gold-gradient)" />
                </svg>
            </div>

            {/* Text and Tagline */}
            <div className="flex flex-col justify-center">
                <h1 className="text-4xl sm:text-5xl font-black text-white leading-[0.8] tracking-widest drop-shadow-lg" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                SCC
                </h1>
                <p className="text-[10px] sm:text-[11px] font-bold text-white tracking-[0.15em] mt-1.5 uppercase drop-shadow-md opacity-90 pl-0.5">
                Your Success is our Aim!
                </p>
            </div>
        </div>
        
        {/* Call to Action Button */}
        <a 
          href={SCC_WEBSITE} 
          target="_blank" 
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-2 text-xs font-bold text-[#2E3192] bg-[#FFD700] hover:bg-white px-5 py-2.5 rounded-full transition-all duration-300 shadow-lg hover:shadow-yellow-500/30 transform hover:-translate-y-0.5 border border-[#FFC107]"
        >
          Visit Website <ExternalLink size={14} />
        </a>
      </div>
    </header>
  );
};

export default Header;