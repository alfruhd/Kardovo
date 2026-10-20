import React from 'react';
import { Link } from '@inertiajs/react';
import KardovoLogo from '@/Components/KardovoLogo';
import WaveBackground from '@/Components/WaveBackground';
import { Home } from 'lucide-react';

export default function GuestLayout({ children }) {
    return (
        <div className="fixed inset-0 h-screen h-[100dvh] max-h-screen max-h-[100dvh] w-screen w-[100dvw] max-w-full bg-white flex flex-col items-center justify-center lg:items-end p-3 sm:p-5 lg:p-6 lg:pr-14 xl:pr-24 2xl:pr-32 font-sans text-slate-800 overflow-y-auto overflow-x-hidden selection:bg-emerald-500 selection:text-white transition-colors duration-300">
            {/* Wave Animated SVG Background */}
            <WaveBackground />

            {/* 🏠 Floating Top Left Control */}
            <div className="absolute top-3.5 left-3.5 sm:top-6 sm:left-6 z-50">
                <Link
                    href="/"
                    className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl bg-white/70 hover:bg-white/95 backdrop-blur-xl border border-white/60 text-slate-700 hover:text-emerald-600 transition-all duration-200 active:scale-95 flex items-center gap-2 shadow-sm hover:shadow-md group cursor-pointer"
                    title="Back to Landing Page"
                >
                    <Home className="w-4 h-4 text-slate-600 group-hover:text-emerald-600 transition-colors" />
                    <span className="text-xs font-bold font-mono">Home</span>
                </Link>
            </div>

            {/* Single Unified Container Column (Locks perfect alignment between card and badge) */}
            <div className="w-full sm:max-w-lg flex flex-col items-center relative z-10 min-w-0 my-auto py-4 sm:py-6 px-1">
                {/* Main Luxury Card (Crisp White Card with Deep Wave Palette Shadow) */}
                <div className="w-full rounded-3xl sm:rounded-[32px] overflow-hidden bg-white/95 backdrop-blur-2xl border border-slate-100 shadow-[0_24px_50px_-12px_rgba(11,37,69,0.18),0_12px_24px_-6px_rgba(11,37,69,0.10),0_0_1px_rgba(11,37,69,0.15)] p-6 sm:p-8 relative transition-all duration-300 text-slate-800 min-w-0">
                    {children}
                </div>

                {/* Bottom Security Badge (Aligned with Container) */}
                <div className="mt-4 sm:mt-5 text-center text-[11px] font-mono text-slate-500 flex items-center justify-center gap-2 tracking-wider select-none shrink-0 relative z-20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>KARDOVO ACCESS &amp; SECURITY</span>
                    <span className="text-slate-400 font-bold">&bull;</span>
                    <span className="text-emerald-600 font-bold tracking-widest">ENCRYPTED</span>
                </div>
            </div>
        </div>
    );
}
