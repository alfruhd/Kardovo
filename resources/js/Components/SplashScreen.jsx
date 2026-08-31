import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function SplashScreen({
    onComplete,
    autoDismiss = true,
    duration = 2400,
    subtitle = 'SECURE VIP INVITATION & ACCESS VERIFICATION',
    showProgress = true,
    className = '',
}) {
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState('Initializing Secure Engine...');
    const [isExiting, setIsExiting] = useState(false);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        setIsReady(true);
        const startTime = Date.now();
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const currentPct = Math.min(100, Math.round((elapsed / duration) * 100));
            setProgress(currentPct);

            if (currentPct < 30) {
                setStatusText('Initializing Secure Engine...');
            } else if (currentPct < 65) {
                setStatusText('Validating Encryption Protocol...');
            } else if (currentPct < 90) {
                setStatusText('Loading Portfolio & Pass Studio...');
            } else {
                setStatusText('Access Granted — Welcome');
            }

            if (elapsed >= duration) {
                clearInterval(interval);
                if (autoDismiss) {
                    setIsExiting(true);
                    setTimeout(() => {
                        if (onComplete) onComplete();
                    }, 500);
                }
            }
        }, 30);

        return () => clearInterval(interval);
    }, [duration, autoDismiss, onComplete]);

    return (
        <div
            className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none overflow-hidden transition-all duration-700 ${
                isExiting ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
            } ${className}`}
            style={{
                background: 'radial-gradient(ellipse at 50% 40%, #0A192F 0%, #060F1E 45%, #03070D 100%)',
            }}
        >
            {/* Background Grid & Ambient Glows */}
            <div className="absolute inset-0 bg-[radial-gradient(#1E293B_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />
            
            {/* Cyan/Blue Neon Aurora */}
            <div
                className="absolute w-96 h-96 rounded-full animate-kardovo-glow pointer-events-none"
                style={{
                    background: 'radial-gradient(circle, rgba(0, 163, 255, 0.28) 0%, rgba(0, 102, 204, 0.12) 45%, transparent 70%)',
                    top: '25%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                }}
            />

            {/* Emerald/Green Neon Secondary Aurora */}
            <div
                className="absolute w-80 h-80 rounded-full animate-kardovo-glow pointer-events-none"
                style={{
                    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.22) 0%, rgba(4, 120, 87, 0.08) 50%, transparent 70%)',
                    top: '40%',
                    left: '52%',
                    transform: 'translate(-50%, -50%)',
                    animationDelay: '1.2s',
                }}
            />

            {/* Center Logo Canvas */}
            <div className="relative z-10 flex flex-col items-center max-w-sm px-6 text-center">
                {/* Logo Container with floating & glow effects */}
                <div className="relative flex items-center justify-center">
                    {/* Pulsing ring */}
                    <div className="absolute w-44 h-44 rounded-full border border-cyan-500/20 animate-ping opacity-25" style={{ animationDuration: '3s' }} />
                    <div className="absolute w-52 h-52 rounded-full border border-emerald-500/15 animate-pulse" />

                    {/* Logo Plate */}
                    <div className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-3xl p-4 flex items-center justify-center bg-gradient-to-b from-slate-800/80 via-slate-900/90 to-[#050D1A] border border-cyan-500/30 shadow-[0_0_50px_rgba(0,163,255,0.25)] backdrop-blur-xl animate-kardovo-float overflow-hidden">
                        
                        {/* Shimmer sweep */}
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent animate-kardovo-shimmer pointer-events-none" />

                        {/* Scanner light beam */}
                        <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#00A3FF] animate-kardovo-scan pointer-events-none" />

                        {/* Official Kardovo Logo Mark */}
                        <img
                            src="/images/kardovo_logo_transparent.png"
                            alt="Kardovo Logo"
                            className="w-full h-full object-contain filter drop-shadow-[0_4px_16px_rgba(0,163,255,0.4)] transition-transform duration-500 hover:scale-105"
                        />
                    </div>

                    {/* Dynamic Flying Energy Particles */}
                    <div className="absolute -top-3 -right-2 w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_#00A3FF] animate-ping" style={{ animationDuration: '2s' }} />
                    <div className="absolute top-4 -left-2 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981] animate-pulse" />
                    <div className="absolute -bottom-2 right-6 w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_8px_#3B82F6] animate-ping" style={{ animationDuration: '2.5s' }} />
                </div>

                {/* Typography Brand Block */}
                <div className="mt-8 space-y-2">
                    <div className="flex items-center justify-center gap-2">
                        <h1 className="text-3xl sm:text-4xl font-black font-display tracking-[0.25em] text-white drop-shadow-[0_2px_12px_rgba(0,163,255,0.5)]">
                            KARDOVO
                        </h1>
                    </div>

                    <p className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.28em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-emerald-400">
                        {subtitle}
                    </p>
                </div>

                {/* Loading Status Bar */}
                {showProgress && (
                    <div className="w-full max-w-xs mt-8 space-y-2.5">
                        {/* Progress Track */}
                        <div className="w-full h-1.5 bg-slate-800/90 rounded-full overflow-hidden border border-slate-700/50 p-0.5 shadow-inner">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 shadow-[0_0_12px_#00A3FF] transition-all duration-100 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        {/* Status Label & Percentage */}
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-0.5">
                            <span className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                                <span className="text-slate-300 font-medium">{statusText}</span>
                            </span>
                            <span className="font-bold text-cyan-400">{progress}%</span>
                        </div>
                    </div>
                )}

                {/* Bottom Security Badge */}
                <div className="mt-10 flex items-center gap-1.5 text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-500/80" />
                    <span>256-Bit Encrypted Pass Infrastructure</span>
                </div>
            </div>
        </div>
    );
}
