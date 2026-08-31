import React from 'react';
import { Head, Link } from '@inertiajs/react';
import KardovoLogo from '@/Components/KardovoLogo';
import { 
    QrCode, 
    Send, 
    CheckCircle2, 
    ShieldCheck, 
    Users, 
    ArrowRight, 
    Smartphone, 
    Sparkles, 
    Layers,
    FileCheck
} from 'lucide-react';

export default function Welcome({ auth }) {
    return (
        <div className="min-h-screen bg-[#F0F3F8] text-slate-800 font-sans flex flex-col justify-between selection:bg-kardovo-blue-dark selection:text-white">
            <Head title="Kardovo — Digital Event Invitation & Access Control Platform" />

            {/* Navigation Bar */}
            <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <KardovoLogo showText={true} />
                    
                    <nav className="flex items-center gap-3">
                        {auth?.user ? (
                            <Link
                                href={route('dashboard')}
                                className="px-5 py-2.5 rounded-xl bg-kardovo-blue-dark text-white font-bold text-xs shadow-md hover:bg-blue-800 transition"
                            >
                                Open Dashboard →
                            </Link>
                        ) : (
                            <Link
                                href={route('login')}
                                className="px-5 py-2.5 rounded-xl bg-kardovo-blue-dark text-white font-bold text-xs shadow-md hover:bg-blue-800 transition"
                            >
                                Sign In / Live Demo →
                            </Link>
                        )}
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-1 max-w-7xl mx-auto px-6 py-12 lg:py-16 space-y-16">
                <div className="text-center max-w-3xl mx-auto space-y-5">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-kardovo-blue-dark border border-blue-200/80 text-xs font-extrabold uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5 text-kardovo-blue-light" />
                        Next-Gen Event Access & Invitations
                    </div>

                    <h1 className="text-4xl sm:text-5xl font-black text-kardovo-navy tracking-tight font-display leading-[1.15]">
                        Digital Event Invitations, WhatsApp Delivery & Live Gate Access Control
                    </h1>

                    <p className="text-base text-slate-600 font-medium leading-relaxed">
                        Design personalized gradient invitation passes, dispatch 1-tap WhatsApp RSVP campaigns, and verify guests in 0.2s with dedicated single-screen mobile camera scanners.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                        <Link
                            href={route('login')}
                            className="px-6 py-3.5 rounded-xl bg-kardovo-blue-dark text-white font-black text-sm shadow-xl hover:bg-blue-800 active:scale-[0.98] transition flex items-center gap-2"
                        >
                            <span>Launch Live Platform Demo</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <a
                            href="/demo/pass"
                            target="_blank"
                            rel="noreferrer"
                            className="px-6 py-3.5 rounded-xl bg-white border border-slate-200 font-bold text-sm text-kardovo-navy shadow-sm hover:bg-slate-50 transition flex items-center gap-2"
                        >
                            <span>Sample 1-Tap Guest Pass</span>
                        </a>
                    </div>
                </div>

                {/* 3 Core Roles Architecture Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* 1. Organiser / Customer */}
                    <div className="bg-white p-6 rounded-card border border-slate-200 shadow-card flex flex-col justify-between">
                        <div>
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-kardovo-blue-dark flex items-center justify-center mb-3">
                                <Users className="w-5 h-5" />
                            </div>
                            <h3 className="text-base font-extrabold text-kardovo-navy font-display">
                                Event Organiser Studio
                            </h3>
                            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                                Import CSV/Excel guest lists with Single/Double entry rules, customize brand gradient passes, and monitor real-time RSVP & check-in metrics.
                            </p>
                        </div>
                        <div className="mt-6 pt-3 border-t border-slate-100">
                            <span className="text-[11px] font-bold text-kardovo-blue-dark">
                                Desktop First • Data Dense Tables
                            </span>
                        </div>
                    </div>

                    {/* 2. WhatsApp 1-Tap RSVP */}
                    <div className="bg-white p-6 rounded-card border border-slate-200 shadow-card flex flex-col justify-between">
                        <div>
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-kardovo-green flex items-center justify-center mb-3">
                                <Smartphone className="w-5 h-5" />
                            </div>
                            <h3 className="text-base font-extrabold text-kardovo-navy font-display">
                                Frictionless Guest RSVP
                            </h3>
                            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                                Guests receive high-res digital cards directly on WhatsApp with native Quick-Reply buttons ("Will Attend" / "Will Not Attend") with no app download required.
                            </p>
                        </div>
                        <div className="mt-6 pt-3 border-t border-slate-100">
                            <span className="text-[11px] font-bold text-kardovo-green">
                                Zero Login • Instant Sync
                            </span>
                        </div>
                    </div>

                    {/* 3. Single-Screen Mobile Gate Scanner */}
                    <div className="bg-white p-6 rounded-card border border-slate-200 shadow-card flex flex-col justify-between">
                        <div>
                            <div className="w-10 h-10 rounded-xl bg-slate-900 text-kardovo-blue-light flex items-center justify-center mb-3">
                                <QrCode className="w-5 h-5" />
                            </div>
                            <h3 className="text-base font-extrabold text-kardovo-navy font-display">
                                High-Speed Gate Scanner
                            </h3>
                            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                                Single-screen mobile PWA camera scanner with audio/vibration feedback, 1-tap "Scan Next Guest", and allowance counters (e.g. 1 of 2 entries used).
                            </p>
                        </div>
                        <div className="mt-6 pt-3 border-t border-slate-100">
                            <span className="text-[11px] font-bold text-slate-900">
                                Mobile First • Sub-Second Verification
                            </span>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-kardovo-navy text-slate-400 py-8 px-6 text-xs text-center border-t border-slate-800">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <KardovoLogo light showText={true} />
                    <p>© 2026 KARDOVO Platform. Dar es Salaam, Tanzania. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
