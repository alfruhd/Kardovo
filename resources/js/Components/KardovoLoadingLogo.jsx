import React from 'react';

export default function KardovoLoadingLogo({ 
    size = 'md', // 'sm' | 'md' | 'lg' | 'fullscreen'
    label = 'Loading...', 
    variant = 'radar', // 'radar' | 'orbit' | 'mini'
    className = '' 
}) {
    const dimensions = {
        sm: { box: 'w-10 h-10', svg: 24, text: 'text-[11px]' },
        md: { box: 'w-16 h-16', svg: 32, text: 'text-xs' },
        lg: { box: 'w-24 h-24', svg: 44, text: 'text-sm' },
        fullscreen: { box: 'w-20 h-20', svg: 40, text: 'text-sm' },
    }[size] || { box: 'w-16 h-16', svg: 32, text: 'text-xs' };

    if (variant === 'radar') {
        return (
            <div className={`flex flex-col items-center justify-center gap-3 select-none ${className}`}>
                <div className={`relative flex items-center justify-center ${dimensions.box}`}>
                    <div className="absolute inset-0 rounded-full border border-cyan-400/40 animate-ping opacity-35 pointer-events-none" />
                    <div className="absolute -inset-2 rounded-full border border-blue-500/25 animate-pulse opacity-40 pointer-events-none" />

                    <div className="w-full h-full rounded-2xl bg-gradient-to-br from-[#0B1E36] to-[#060D18] border border-cyan-400/40 shadow-[0_0_20px_rgba(0,163,255,0.3)] flex items-center justify-center relative z-10 transition-transform duration-300">
                        <svg width={dimensions.svg} height={dimensions.svg} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_8px_rgba(0,210,255,0.7)]">
                            <path d="M7 8L15 16L7 24" stroke="#00C4FF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse" />
                            <path d="M15 8L23 16L15 24" stroke="#0072CE" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
                        </svg>
                    </div>
                </div>

                {label && (
                    <div className="flex items-center gap-1.5 text-center">
                        <span className={`font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-cyan-300 ${dimensions.text}`}>
                            {label}
                        </span>
                        <span className="flex gap-0.5">
                            <span className="w-1 h-1 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1 h-1 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1 h-1 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </span>
                    </div>
                )}
            </div>
        );
    }

    if (variant === 'orbit') {
        return (
            <div className={`flex flex-col items-center justify-center gap-3 select-none ${className}`}>
                <div className={`relative flex items-center justify-center ${dimensions.box}`}>
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400 border-r-blue-500 animate-spin drop-shadow-[0_0_6px_rgba(0,210,255,0.7)]" />
                    
                    <div className="w-[82%] h-[82%] rounded-xl bg-white dark:bg-[#0A1626] border border-slate-200 dark:border-white/[0.1] flex items-center justify-center shadow-xs">
                        <svg width={dimensions.svg * 0.75} height={dimensions.svg * 0.75} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7 8L15 16L7 24" stroke="#00C4FF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M15 8L23 16L15 24" stroke="#0066AA" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.75" />
                        </svg>
                    </div>
                </div>

                {label && (
                    <span className={`font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-cyan-300 ${dimensions.text}`}>
                        {label}
                    </span>
                )}
            </div>
        );
    }

    // Mini variant
    return (
        <span className={`inline-flex items-center gap-2 select-none ${className}`}>
            <span className="relative flex items-center justify-center w-5 h-5 flex-shrink-0">
                <span className="absolute inset-0 rounded-full border border-cyan-400 animate-ping opacity-40" />
                <svg width="18" height="18" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-pulse">
                    <path d="M7 8L15 16L7 24" stroke="#00C4FF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M15 8L23 16L15 24" stroke="#0066AA" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
                </svg>
            </span>
            {label && <span>{label}</span>}
        </span>
    );
}
