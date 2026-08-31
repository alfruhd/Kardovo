import React from 'react';
import { Link } from '@inertiajs/react';
import KardovoLogo from '@/Components/KardovoLogo';
import { useTheme } from '@/Hooks/useTheme';
import { Sun, Moon } from 'lucide-react';

export default function GuestLayout({ children }) {
    const { isDark, toggleTheme } = useTheme();

    return (
        <div className="min-h-screen bg-[#F4F6F9] dark:bg-[#070D18] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-10 font-sans text-slate-800 dark:text-slate-100 relative overflow-hidden selection:bg-cyan-500 selection:text-white transition-colors duration-300">
            
            {/* 🌓 Floating Light / Dark Mode Toggle Button */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50">
                <button
                    type="button"
                    onClick={toggleTheme}
                    className="px-3.5 py-2 rounded-2xl bg-white/80 dark:bg-[#0B1524]/80 backdrop-blur-xl border border-slate-200/90 dark:border-white/[0.08] text-slate-700 dark:text-slate-200 transition-all duration-200 active:scale-95 flex items-center gap-2 shadow-lg hover:shadow-xl group cursor-pointer"
                    title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                    {isDark ? (
                        <>
                            <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
                            <span className="text-xs font-bold font-mono">Light Mode</span>
                        </>
                    ) : (
                        <>
                            <Moon className="w-4 h-4 text-cyan-600 group-hover:-rotate-12 transition-transform duration-300" />
                            <span className="text-xs font-bold font-mono">Dark Mode</span>
                        </>
                    )}
                </button>
            </div>

            {/* Ambient Background Radial Glows */}
            <div className="absolute -top-40 -left-40 w-[550px] h-[550px] bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-40 -right-40 w-[550px] h-[550px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

            {/* Header Brand Logo */}
            <div className="mb-6 relative z-10">
                <Link href="/" className="inline-block transition active:scale-95">
                    <KardovoLogo light={isDark} showText={true} />
                </Link>
            </div>

            {/* Main Luxury Glassmorphic Card */}
            <div className="w-full sm:max-w-md rounded-[28px] overflow-hidden backdrop-blur-2xl bg-white dark:bg-[#0B1524]/95 border border-slate-200/80 dark:border-white/[0.08] p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.08)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.6)] relative z-10 transition-colors duration-300">
                {children}
            </div>

            {/* Bottom Security Badge */}
            <div className="mt-6 text-center text-[11px] font-mono text-slate-400 dark:text-slate-500 relative z-10 flex items-center justify-center gap-2">
                <span>KARDOVO ACCESS &amp; SECURITY</span>
                <span>&bull;</span>
                <span>ENCRYPTED</span>
            </div>
        </div>
    );
}
