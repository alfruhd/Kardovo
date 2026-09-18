import React from 'react';

export default function WaveBackground() {
    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0 bg-[#f8fafc]">
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes aurora-1 {
                    0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
                    33% { transform: translate(50px, -50px) rotate(5deg) scale(1.1); }
                    66% { transform: translate(-40px, 30px) rotate(-3deg) scale(0.95); }
                }
                @keyframes aurora-2 {
                    0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
                    33% { transform: translate(-50px, 40px) rotate(-5deg) scale(1.05); }
                    66% { transform: translate(40px, -20px) rotate(3deg) scale(1.1); }
                }
                @keyframes flow-1 {
                    0%, 100% { transform: translateX(0) scaleY(1); }
                    50% { transform: translateX(-3%) scaleY(1.05); }
                }
                @keyframes flow-2 {
                    0%, 100% { transform: translateX(0) scaleY(1); }
                    50% { transform: translateX(2%) scaleY(0.95); }
                }
            `}} />
            
            {/* Soft mesh background blobs */}
            <div className="absolute inset-0 opacity-40">
                <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-blue-400/40 rounded-full blur-[120px]" style={{animation: 'aurora-1 20s ease-in-out infinite', willChange: 'transform'}} />
                <div className="absolute top-1/4 left-1/4 w-[700px] h-[700px] bg-indigo-400/30 rounded-full blur-[140px]" style={{animation: 'aurora-2 25s ease-in-out infinite', willChange: 'transform'}} />
                <div className="absolute bottom-0 right-1/3 w-[500px] h-[500px] bg-cyan-300/30 rounded-full blur-[100px]" style={{animation: 'aurora-1 15s ease-in-out infinite reverse', willChange: 'transform'}} />
            </div>

            {/* Elegant SVG Ribbons */}
            <svg 
                className="absolute inset-0 w-full h-full object-cover min-w-[1000px] opacity-80"
                viewBox="0 0 1440 800" 
                preserveAspectRatio="xMidYMid slice" 
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <linearGradient id="ribbon1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#818cf8" stopOpacity="0.2" />
                    </linearGradient>
                    <linearGradient id="ribbon2" x1="100%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.1" />
                    </linearGradient>
                    <linearGradient id="ribbon-glow" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                        <stop offset="50%" stopColor="#e0f2fe" stopOpacity="1" />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
                    </linearGradient>
                    
                    
                </defs>

                {/* Ribbon Back */}
                <g style={{animation: 'flow-1 18s ease-in-out infinite', willChange: 'transform'}}>
                    <path 
                        d="M-200,800 C150,750 400,450 750,550 C1100,650 1350,200 1600,300 L1600,800 L-200,800 Z" 
                        fill="url(#ribbon1)" 
                        
                    />
                    <path 
                        d="M-200,800 C150,750 400,450 750,550 C1100,650 1350,200 1600,300" 
                        fill="none" 
                        stroke="url(#ribbon-glow)" 
                        strokeWidth="1.5"
                    />
                </g>

                {/* Ribbon Front */}
                <g style={{animation: 'flow-2 22s ease-in-out infinite', willChange: 'transform'}}>
                    <path 
                        d="M0,800 C350,600 650,850 1000,550 C1250,350 1450,450 1600,300 L1600,800 L0,800 Z" 
                        fill="url(#ribbon2)" 
                        
                    />
                    <path 
                        d="M0,800 C350,600 650,850 1000,550 C1250,350 1450,450 1600,300" 
                        fill="none" 
                        stroke="url(#ribbon-glow)" 
                        strokeWidth="2"
                    />
                </g>
            </svg>
            
            {/* Bottom seamless fade to page content */}
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#f8fafc] to-transparent z-10" />
        </div>
    );
}
