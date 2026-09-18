import React from 'react';
import { Link } from '@inertiajs/react';
import KardovoLogo from '@/Components/KardovoLogo';
import { Sun, Moon } from 'lucide-react';

export default function GuestLayout({ children }) {
    const isDark = false;

    return (
        <div className="min-h-screen bg-[#F4F6F9] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-10 font-sans text-slate-800 relative overflow-hidden selection:bg-emerald-500 selection:text-white transition-colors duration-300">
            
            {/* 🌓 Floating Light / Dark Mode Toggle Button */}
            {/* Ambient Background Radial Glows */}
            <div className="absolute -top-40 -left-40 w-[550px] h-[550px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-40 -right-40 w-[550px] h-[550px] bg-emerald-600/10 blur-[130px] rounded-full pointer-events-none" />
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

            {/* Header Brand Logo */}
            <div className="mb-6 relative z-10">
                <Link href="/" className="inline-block transition active:scale-95">
                    <KardovoLogo light={isDark} showText={true} />
                </Link>
            </div>

            {/* Main Luxury Glassmorphic Card */}
            <div className="w-full sm:max-w-md rounded-[28px] overflow-hidden backdrop-blur-2xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.08)] relative z-10 transition-colors duration-300">
                {children}
            </div>

            {/* Bottom Security Badge */}
            <div className="mt-6 text-center text-[11px] font-mono text-slate-400 relative z-10 flex items-center justify-center gap-2">
                <span>KARDOVO ACCESS &amp; SECURITY</span>
                <span>&bull;</span>
                <span>ENCRYPTED</span>
            </div>
        </div>
    );
}
