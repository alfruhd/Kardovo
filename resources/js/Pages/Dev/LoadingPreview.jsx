import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import KardovoAppLayout from '@/Layouts/KardovoAppLayout';
import KardovoLoadingLogo from '@/Components/KardovoLoadingLogo';
import { Sparkles, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function LoadingPreview() {
    const [simulating, setSimulating] = useState(false);
    const [simulatedComplete, setSimulatedComplete] = useState(false);

    const triggerSimulation = () => {
        setSimulating(true);
        setSimulatedComplete(false);
        setTimeout(() => {
            setSimulating(false);
            setSimulatedComplete(true);
            setTimeout(() => setSimulatedComplete(false), 3000);
        }, 2000);
    };

    return (
        <KardovoAppLayout
            title="Branded Loading Logo Showcase"
            headerActions={
                <button
                    onClick={triggerSimulation}
                    disabled={simulating}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-cyan-600 dark:hover:bg-cyan-500 rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${simulating ? 'animate-spin' : ''}`} />
                    <span>{simulating ? 'Simulating...' : 'Trigger Simulation'}</span>
                </button>
            }
        >
            <Head title="Branded Loading Animations - Kardovo" />

            <div className="max-w-5xl mx-auto space-y-6">
                
                {/* Intro Header */}
                <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0B1524] border border-slate-200/90 dark:border-white/[0.08] shadow-xs space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-600 dark:text-cyan-400 font-mono text-[10.5px] font-extrabold uppercase tracking-wider">
                            Live Interactive Preview
                        </span>
                        <span className="text-xs text-slate-400 font-mono">v2.4.0 Brand Suite</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display">
                        Kardovo Loading Logo Showcase
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-3xl">
                        Here you can see the animated Kardovo logo in action across all sizes, variants, and speeds. These can be embedded into any button, modal, or page view.
                    </p>
                </div>

                {/* 3 Main Variants Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Variant 1: Radar Scan */}
                    <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#0B1524] border border-slate-200/90 dark:border-white/[0.08] shadow-card flex flex-col items-center justify-between text-center min-h-[320px]">
                        <div className="w-full text-left">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                                Variant 1 • Radar Ripple
                            </span>
                            <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
                                Concentric Sonar
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Best for Gate Scanner QR verification and rapid API handshakes.
                            </p>
                        </div>

                        <div className="my-8 py-4">
                            <KardovoLoadingLogo variant="radar" size="lg" label="Verifying Pass..." />
                        </div>

                        <div className="w-full pt-4 border-t border-slate-100 dark:border-white/[0.06] text-[11px] text-slate-400 font-mono">
                            Used in: Scanner HUD & Global Sync
                        </div>
                    </div>

                    {/* Variant 2: Orbit Laser Arc */}
                    <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#0B1524] border border-slate-200/90 dark:border-white/[0.08] shadow-card flex flex-col items-center justify-between text-center min-h-[320px]">
                        <div className="w-full text-left">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                Variant 2 • Orbiting Laser
                            </span>
                            <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
                                Cyber Arc Rotation
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Best for session authentication, login, and tenant switching.
                            </p>
                        </div>

                        <div className="my-8 py-4">
                            <KardovoLoadingLogo variant="orbit" size="lg" label="Securing Session..." />
                        </div>

                        <div className="w-full pt-4 border-t border-slate-100 dark:border-white/[0.06] text-[11px] text-slate-400 font-mono">
                            Used in: Auth & Gateway Config
                        </div>
                    </div>

                    {/* Variant 3: Compact Button Mini */}
                    <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#0B1524] border border-slate-200/90 dark:border-white/[0.08] shadow-card flex flex-col items-center justify-between text-center min-h-[320px]">
                        <div className="w-full text-left">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                Variant 3 • Inline Mini
                            </span>
                            <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
                                Button Embedded
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Drop-in replacement for generic spinners inside action buttons.
                            </p>
                        </div>

                        <div className="my-8 py-4 flex flex-col gap-3 w-full max-w-[240px]">
                            <div className="w-full py-3 px-4 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs">
                                <KardovoLoadingLogo variant="mini" label="Rendering 4K Pass..." />
                            </div>
                            <div className="w-full py-3 px-4 rounded-xl bg-cyan-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs">
                                <KardovoLoadingLogo variant="mini" label="Broadcasting WhatsApp..." />
                            </div>
                        </div>

                        <div className="w-full pt-4 border-t border-slate-100 dark:border-white/[0.06] text-[11px] text-slate-400 font-mono">
                            Used in: 4K Pass Export & Login
                        </div>
                    </div>

                </div>

                {/* Simulation Banner */}
                {simulating && (
                    <div className="p-6 rounded-3xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center gap-4 text-center animate-fadeIn">
                        <KardovoLoadingLogo variant="radar" size="md" label="Simulating background sync..." />
                    </div>
                )}

                {simulatedComplete && (
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-2 font-bold text-xs animate-fadeIn">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Simulation complete! Pass telemetry successfully synced.</span>
                    </div>
                )}

            </div>
        </KardovoAppLayout>
    );
}
