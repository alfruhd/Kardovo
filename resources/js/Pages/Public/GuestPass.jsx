import React, { useState, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import PersonalisedCard from '@/Components/PersonalisedCard';
import KardovoLogo from '@/Components/KardovoLogo';
import confetti from 'canvas-confetti';
import { useTheme } from '@/Hooks/useTheme';
import { 
    Check, 
    X, 
    Calendar, 
    MapPin, 
    Clock, 
    ShieldCheck, 
    Download, 
    Printer, 
    Share2,
    CheckCircle2,
    AlertCircle,
    PartyPopper,
    Layers,
    Sparkles,
    Sun,
    Moon
} from 'lucide-react';

export default function GuestPass({ guest, event, template, allTemplates = [], isDemo = false }) {
    const templatesList = allTemplates.length > 0 ? allTemplates : (template ? [template] : []);
    const [selectedTemplate, setSelectedTemplate] = useState(template || templatesList[0] || null);
    const [isSwitching, setIsSwitching] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [rsvpSubmitted, setRsvpSubmitted] = useState(guest?.rsvp_status !== 'pending' ? guest?.rsvp_status : null);
    const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const { theme, isDark, toggleTheme } = useTheme();

    const isDemoMode = isDemo || (typeof window !== 'undefined' && (
        window.location.pathname.includes('/demo') || 
        new URLSearchParams(window.location.search).get('demo') === '1' ||
        guest?.qr_token === 'kdv_demo_pass_preview' ||
        guest?.qr_token === 'kdv_alfred_mashauri_29841872'
    ));

    const handleRsvp = (status) => {
        // Pure client-side interactive sandbox preview if in demo mode
        if (isDemoMode) {
            setRsvpSubmitted(status);
            if (status === 'attending') {
                confetti({
                    particleCount: 80,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }
            return;
        }

        setSubmitting(true);
        router.post(route('guest.rsvp', guest.qr_token), {
            status: status,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setSubmitting(false);
                setRsvpSubmitted(status);
                if (status === 'attending') {
                    confetti({
                        particleCount: 80,
                        spread: 70,
                        origin: { y: 0.6 }
                    });
                }
            },
            onError: () => setSubmitting(false),
        });
    };

    const handleSelectTemplate = (tpl) => {
        if (tpl.id === selectedTemplate?.id) return;
        setIsSwitching(true);
        setTimeout(() => {
            setSelectedTemplate(tpl);
            setIsSwitching(false);
        }, 160);
    };

    const handleMouseMove = (e) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const rotateX = -(y / (rect.height / 2)) * 7;
        const rotateY = (x / (rect.width / 2)) * 7;
        setTilt({ rotateX, rotateY });
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        setTilt({ rotateX: 0, rotateY: 0 });
    };

    return (
        <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-[#F4F6F9] dark:bg-[#070D18] py-6 sm:py-8 px-4 sm:px-6 lg:px-10 font-sans text-slate-800 dark:text-slate-100 flex flex-col justify-between relative overflow-x-hidden transition-colors duration-300">
            <Head title={`Invitation Pass: ${event?.title} - ${guest?.name}`} />

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
                            <span className="text-xs font-bold font-mono">Light</span>
                        </>
                    ) : (
                        <>
                            <Moon className="w-4 h-4 text-cyan-600 group-hover:-rotate-12 transition-transform duration-300" />
                            <span className="text-xs font-bold font-mono">Dark</span>
                        </>
                    )}
                </button>
            </div>

            {/* Ambient Background Radial Glows */}
            <div className="absolute -top-40 -left-40 w-[550px] h-[550px] bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-40 -right-40 w-[550px] h-[550px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />

            {/* Main Balanced 2-Column Responsive Container (Fits without scroll on desktop) */}
            <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col justify-center relative z-10 py-2">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
                    
                    {/* ═══════════════════════════════════════════════════════════ */}
                    {/* LEFT COLUMN: BRAND, 3D TEMPLATE SELECTOR & RSVP CONTROLS    */}
                    {/* ═══════════════════════════════════════════════════════════ */}
                    <div className="lg:col-span-6 space-y-4 sm:space-y-5">
                        
                        {/* Brand & Section Title */}
                        <div className="space-y-1 text-left">
                            <div className="flex flex-wrap items-center gap-2">
                                <KardovoLogo light={isDark} showText={true} />
                                {isDemoMode ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 font-mono text-[10.5px] font-extrabold uppercase tracking-wider">
                                        <Sparkles className="w-3 h-3" />
                                        <span>Demo Pass Template Sandbox</span>
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-mono text-[10.5px] font-extrabold uppercase tracking-wider">
                                        <Sparkles className="w-3 h-3" />
                                        <span>Interactive Invitation Pass</span>
                                    </span>
                                )}
                            </div>
                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight mt-1">
                                {event?.title || 'Exclusive Digital Pass'}
                            </h2>
                        </div>

                        {/* 1. FLOATING 3D TEMPLATE CAROUSEL DECK */}
                        {templatesList.length > 1 && (
                            <div className="bg-white/90 dark:bg-[#0B1524]/90 backdrop-blur-xl p-3.5 sm:p-4 rounded-3xl border border-slate-200/90 dark:border-white/[0.08] shadow-xl space-y-2.5 transition-colors duration-300">
                                <div className="flex items-center justify-between px-1">
                                    <div className="flex items-center gap-1.5 font-black text-slate-900 dark:text-white text-xs font-display">
                                        <Layers className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                                        <span>Select Pass Style (3D Preview)</span>
                                    </div>
                                    <span className="text-[10px] font-mono text-cyan-700 dark:text-cyan-300 font-bold bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/40 px-2 py-0.5 rounded-full">
                                        {templatesList.length} Variations
                                    </span>
                                </div>

                                {/* Floating 3D Cards Row */}
                                <div className="grid grid-cols-3 gap-2 pt-1">
                                    {templatesList.map((tpl, idx) => {
                                        const isSelected = selectedTemplate?.id === tpl.id;
                                        const isCustom = tpl.template_type === 'custom_art' && tpl.image_path;

                                        return (
                                            <button
                                                key={tpl.id || idx}
                                                type="button"
                                                onClick={() => handleSelectTemplate(tpl)}
                                                className={`relative group rounded-2xl p-1.5 transition-all duration-300 text-left cursor-pointer active:scale-95 flex flex-col justify-between ${
                                                    isSelected
                                                        ? 'ring-2 ring-cyan-500 dark:ring-cyan-400 bg-cyan-50/90 dark:bg-cyan-950/70 shadow-[0_12px_30px_rgba(6,182,212,0.3)] scale-[1.04] border border-cyan-300 dark:border-cyan-700 -translate-y-1'
                                                        : 'bg-slate-50 dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] border border-slate-200/80 dark:border-white/[0.08] hover:border-cyan-400/40 hover:-translate-y-0.5 hover:shadow-md'
                                                }`}
                                            >
                                                {/* Miniature Artwork */}
                                                <div className="w-full h-18 sm:h-20 rounded-xl overflow-hidden relative mb-1.5 shadow-sm bg-slate-950 border border-slate-200/80 dark:border-white/[0.08]">
                                                    {isCustom ? (
                                                        <img
                                                            src={tpl.image_path}
                                                            alt={tpl.name}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                    ) : (
                                                        <div
                                                            className="w-full h-full flex flex-col items-center justify-center p-1 text-center"
                                                            style={{
                                                                background: 'linear-gradient(170deg, #0D1B2A 0%, #0A1622 35%, #060E1A 65%, #0B1E35 100%)',
                                                            }}
                                                        >
                                                            <div className="w-4 h-4 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center mb-0.5">
                                                                <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                                                            </div>
                                                            <span className="text-[7.5px] font-black text-white uppercase tracking-wider leading-tight">
                                                                {tpl.headline || 'SIGNATURE'}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Active Checkmark Pill */}
                                                    {isSelected && (
                                                        <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-md animate-fadeIn">
                                                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                                                        </span>
                                                    )}

                                                    <span className="absolute bottom-1 left-1 px-1.5 py-0.2 rounded-md text-[6.5px] font-extrabold uppercase bg-black/80 text-white backdrop-blur-xs">
                                                        {isCustom ? 'Custom Art' : 'Signature'}
                                                    </span>
                                                </div>

                                                {/* Card Title */}
                                                <div className="text-[9.5px] font-bold text-slate-900 dark:text-white truncate leading-tight">
                                                    {tpl.name.split('(')[0].trim()}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* 2. RSVP INTERACTIVE ACTION CARD */}
                        <div className="bg-white dark:bg-[#0B1524] rounded-3xl p-4 sm:p-5 border border-slate-200/90 dark:border-white/[0.08] shadow-xl text-center space-y-2.5 transition-colors duration-300">
                            <div className="flex items-center justify-between text-xs font-black text-kardovo-navy dark:text-white uppercase tracking-wider font-display">
                                <span className="flex items-center gap-1.5">
                                    <PartyPopper className="w-4 h-4 text-emerald-500" />
                                    <span>Confirm Attendance</span>
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono font-bold capitalize">
                                    {guest?.allowance_label || 'Pass Issued'}
                                </span>
                            </div>

                            {/* Interactive RSVP Buttons */}
                            <div className="grid grid-cols-2 gap-2.5 pt-0.5">
                                <button
                                    type="button"
                                    disabled={submitting}
                                    onClick={() => handleRsvp('attending')}
                                    className={`py-2.5 px-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.98] cursor-pointer ${
                                        rsvpSubmitted === 'attending'
                                            ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 shadow-md'
                                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                    }`}
                                >
                                    <Check className="w-4 h-4" />
                                    <span>{rsvpSubmitted === 'attending' ? '✓ Will Attend' : 'Will Attend'}</span>
                                </button>

                                <button
                                    type="button"
                                    disabled={submitting}
                                    onClick={() => handleRsvp('declined')}
                                    className={`py-2.5 px-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.98] cursor-pointer ${
                                        rsvpSubmitted === 'declined'
                                            ? 'bg-red-700 text-white ring-2 ring-red-400 shadow-md'
                                            : 'bg-slate-100 dark:bg-white/[0.05] hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-700 dark:text-slate-300 hover:text-red-700 dark:hover:text-red-400 border border-slate-200 dark:border-white/[0.08]'
                                    }`}
                                >
                                    <X className="w-4 h-4" />
                                    <span>{rsvpSubmitted === 'declined' ? '✕ Will Not Attend' : 'Will Not Attend'}</span>
                                </button>
                            </div>

                            {/* Status Feedback Message */}
                            {rsvpSubmitted && (
                                <div className={`p-2 rounded-xl text-[11.5px] font-semibold mt-1 border ${
                                    rsvpSubmitted === 'attending' 
                                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50' 
                                        : 'bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                                }`}>
                                    {isDemoMode ? (
                                        rsvpSubmitted === 'attending'
                                            ? '🎉 Demo RSVP Simulated: Will Attend (Sandbox preview: no logs or notifications sent).'
                                            : 'Demo RSVP Simulated: Will Not Attend (Sandbox preview: no logs or notifications sent).'
                                    ) : (
                                        rsvpSubmitted === 'attending'
                                            ? '🎉 Attendance confirmed! Present your pass at the gate.'
                                            : 'Thank you for letting us know you cannot make it.'
                                    )}
                                </div>
                            )}
                        </div>

                        {/* 3. EVENT INFORMATION & DIRECTIONS */}
                        <div className="bg-white dark:bg-[#0B1524] rounded-3xl p-4 sm:p-4.5 border border-slate-200/90 dark:border-white/[0.08] shadow-card space-y-2 text-xs transition-colors duration-300">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600 dark:text-slate-300">
                                <div className="flex items-start gap-2">
                                    <Calendar className="w-4 h-4 text-cyan-600 dark:text-cyan-400 flex-shrink-0 mt-0.5" />
                                    <div className="truncate">
                                        <div className="font-bold text-slate-800 dark:text-slate-100 text-[11px]">Date &amp; Schedule</div>
                                        <div className="text-[11px] truncate">{event?.event_date ? new Date(event.event_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '14 Sep 2026'} • {event?.event_time || '4:00 PM'}</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                                    <div className="truncate">
                                        <div className="font-bold text-slate-800 dark:text-slate-100 text-[11px]">Venue Location</div>
                                        <div className="text-[11px] truncate">{event?.venue || 'Kunduchi Beach'}, {event?.city || 'Dar es Salaam'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ═══════════════════════════════════════════════════════════ */}
                    {/* RIGHT COLUMN: 3D FLOATING 4K PASS CANVAS STAGE              */}
                    {/* ═══════════════════════════════════════════════════════════ */}
                    <div className="lg:col-span-6 flex flex-col items-center justify-center">
                        <div 
                            className="w-full max-w-[400px] flex justify-center perspective-[1200px] select-none"
                            onMouseMove={(e) => {
                                setIsHovered(true);
                                handleMouseMove(e);
                            }}
                            onMouseLeave={handleMouseLeave}
                        >
                            <div 
                                className={`w-full flex justify-center transition-all duration-300 ease-out ${
                                    isSwitching ? 'opacity-0 scale-95 rotate-y-6' : 'opacity-100 scale-100 rotate-y-0'
                                }`}
                                style={{
                                    transform: isHovered 
                                        ? `perspective(1200px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) translateY(-4px) scale(1.01)` 
                                        : 'perspective(1200px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)',
                                    transformStyle: 'preserve-3d',
                                    filter: isHovered ? 'drop-shadow(0 25px 35px rgba(0,0,0,0.35))' : 'drop-shadow(0 15px 25px rgba(0,0,0,0.25))',
                                }}
                            >
                                <PersonalisedCard
                                    guest={guest}
                                    event={event}
                                    template={selectedTemplate}
                                    interactive={true}
                                />
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Public Footer */}
            <footer className="text-center text-[10.5px] text-slate-400 dark:text-slate-500 font-medium relative z-10 py-1">
                <p>Secured by KARDOVO Access Control Systems • Multi-Tenant Pass Engine</p>
            </footer>
        </div>
    );
}
