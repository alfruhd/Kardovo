import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import KardovoAppLayout from '@/Layouts/KardovoAppLayout';
import { 
    Calendar, 
    Plus, 
    Users, 
    CheckCircle2, 
    ArrowRight, 
    Upload, 
    Palette, 
    Send, 
    MapPin, 
    Clock, 
    MoreVertical,
    Sparkles,
    Edit,
    Trash2,
    ChevronLeft,
    ChevronRight,
    LayoutGrid,
    Layers,
    Play,
    Pause,
    ExternalLink,
    QrCode,
    ShieldCheck,
    Ticket,
    Lock,
    Eye,
    EyeOff
} from 'lucide-react';
import { router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import PersonalisedCard from '@/Components/PersonalisedCard';

export default function MyEvents({ 
    events = [], 
    overviewStats, 
    templates = [],
    organizers = [],
    isAdmin = false
}) {
    const { auth } = usePage().props;
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedEventForEdit, setSelectedEventForEdit] = useState(null);

    // Floating Animated Carousel state (Spam-proof bounded carousel)
    const [showFeaturedShowcase, setShowFeaturedShowcase] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isHovered, setIsHovered] = useState(false);

    const handleNext = () => {
        if (events.length <= 1) return;
        setCurrentIndex((prev) => (prev + 1) % events.length);
    };

    const handlePrev = () => {
        if (events.length <= 1) return;
        setCurrentIndex((prev) => (prev - 1 + events.length) % events.length);
    };

    const handleJump = (idx) => {
        if (events.length <= 1) return;
        setCurrentIndex(idx % events.length);
    };

    useEffect(() => {
        if (!isPlaying || isHovered || events.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % events.length);
        }, 6500);
        return () => clearInterval(timer);
    }, [isPlaying, isHovered, events.length]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft') {
                handlePrev();
            } else if (e.key === 'ArrowRight') {
                handleNext();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [events.length]);

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        event_type: 'Wedding Reception',
        event_date: '',
        event_time: '4:00 PM — Reception & Dinner',
        venue: '',
        city: 'Dar es Salaam',
        description: '',
        card_template_id: templates[0]?.id || '',
        user_id: '',
    });

    const editForm = useForm({
        title: '',
        event_type: 'Wedding Reception',
        event_date: '',
        event_time: '',
        venue: '',
        city: 'Dar es Salaam',
        description: '',
        card_template_id: '',
        status: 'active',
        user_id: '',
    });

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        post(route('events.store'), {
            onSuccess: () => {
                setCreateModalOpen(false);
                reset();
            }
        });
    };

    const openEditEventModal = (event) => {
        setSelectedEventForEdit(event);
        let dateVal = event.event_date;
        if (typeof dateVal === 'string' && dateVal.includes('T')) {
            dateVal = dateVal.split('T')[0];
        }
        editForm.setData({
            title: event.title,
            event_type: event.event_type || 'Wedding Reception',
            event_date: dateVal,
            event_time: event.event_time || '',
            venue: event.venue,
            city: event.city || 'Dar es Salaam',
            description: event.description || '',
            card_template_id: event.card_template_id || '',
            status: event.status || 'active',
            user_id: event.user_id || '',
        });
        setEditModalOpen(true);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!selectedEventForEdit) return;
        editForm.put(route('events.update', selectedEventForEdit.id), {
            onSuccess: () => {
                setEditModalOpen(false);
                setSelectedEventForEdit(null);
            }
        });
    };

    const handleDeleteEvent = (event) => {
        if (confirm(`Are you sure you want to permanently delete event "${event.title}"?\n\nWARNING: This will remove all associated guests (${event.total_guests || 0}), scannable passes, and check-in records.`)) {
            router.delete(route('events.destroy', event.id));
        }
    };

    const activeEvent = events[currentIndex] || events[0] || null;
    const canCreate = isAdmin || (auth?.user?.status !== 'suspended' && auth?.user?.effective_permissions?.can_create_events !== false);

    return (
        <KardovoAppLayout 
            title={isAdmin ? "All Events Portfolio" : "My Events"}
            headerActions={
                canCreate ? (
                    <button
                        onClick={() => setCreateModalOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-kardovo-navy hover:bg-slate-900 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white dark:text-slate-950 font-black text-xs shadow-md hover:shadow-xl hover:scale-[1.02] border border-white/20 dark:border-cyan-400/40 transition-all duration-200 active:scale-95 cursor-pointer"
                    >
                        <Plus className="w-4 h-4 text-cyan-400 dark:text-slate-950 stroke-[2.5]" />
                        <span>Create Event</span>
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={() => alert('Event creation privileges are currently locked for your organizer account by platform governance.')}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-200/80 dark:bg-white/[0.06] text-slate-500 dark:text-slate-400 font-bold text-xs border border-slate-300 dark:border-white/[0.08] cursor-not-allowed opacity-80 shadow-xs"
                        title="Event creation is locked by administration"
                    >
                        <Lock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 stroke-[2.5]" />
                        <span>Create Event (Locked)</span>
                    </button>
                )
            }
        >
            <Head title={isAdmin ? "All Events - Kardovo" : "My Events - Kardovo"} />

            <div className="max-w-7xl mx-auto space-y-6">
                {/* Welcome Header & Action Summary */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight font-display">
                            {isAdmin ? 'All Platform Events Portfolio' : 'My Events'}
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                            {isAdmin 
                                ? `Displaying all ${events.length} events across all organizers & customer accounts in the system.`
                                : `You're managing ${events.length} ${events.length === 1 ? 'event' : 'events'} in your portfolio.`}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {events.length > 0 && (
                            <button
                                type="button"
                                onClick={() => setShowFeaturedShowcase(!showFeaturedShowcase)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border text-xs font-bold transition active:scale-95 cursor-pointer shadow-xs ${
                                    showFeaturedShowcase 
                                        ? 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700 shadow-inner' 
                                        : 'bg-white/80 dark:bg-[#0B1524]/90 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border-slate-200/90 dark:border-white/[0.08]'
                                }`}
                                title={showFeaturedShowcase ? 'Hide Featured Event Showcase' : 'Show Featured Event Showcase'}
                            >
                                {showFeaturedShowcase ? (
                                    <>
                                        <EyeOff className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                                        <span>Hide Showcase</span>
                                    </>
                                ) : (
                                    <>
                                        <Eye className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                                        <span>Showcase Deck</span>
                                    </>
                                )}
                            </button>
                        )}

                        <div className="px-3.5 py-1.5 rounded-2xl bg-white/80 dark:bg-[#0B1524]/90 border border-slate-200/90 dark:border-white/[0.08] shadow-xs text-xs font-mono font-bold text-cyan-700 dark:text-cyan-300">
                            <span>{events.length} Active Events</span>
                        </div>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* 1. APPLE-STYLE 3D DEPTH CAROUSEL SHOWCASE                      */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                {events.length > 0 && activeEvent && showFeaturedShowcase && (
                    <div className="space-y-3 animate-fadeIn">
                        {/* Section Header (Isolated & Fully Visible) */}
                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400 animate-pulse" />
                                <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white font-display">
                                    Featured Event Showcase
                                </span>
                            </div>
                            <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-white/[0.06] px-2.5 py-0.5 rounded-full border border-slate-200/90 dark:border-white/[0.08] shadow-2xs">
                                {currentIndex + 1} of {events.length}
                            </span>
                        </div>

                        {/* 3D Depth Stage Container */}
                        <div 
                            className="relative pt-4 pb-2 space-y-4"
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                        >
                            {/* Ambient Apple Glow Canvas Behind Carousel */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-72 bg-gradient-to-r from-cyan-400/20 via-blue-500/15 to-violet-500/20 rounded-full blur-[110px] pointer-events-none" />

                            {/* Floating Outer Left Arrow Button (Desktop Side Navigation) */}
                            <button
                                type="button"
                                onClick={handlePrev}
                                className="hidden lg:flex absolute -left-5 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/80 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-white/[0.08] text-slate-800 dark:text-white items-center justify-center shadow-[0_10px_25px_rgba(0,0,0,0.08)] backdrop-blur-2xl transition active:scale-90 hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(0,210,255,0.3)] cursor-pointer"
                                title="Previous Event (Left Arrow)"
                            >
                                <ChevronLeft className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                            </button>

                            {/* Floating Outer Right Arrow Button (Desktop Side Navigation) */}
                            <button
                                type="button"
                                onClick={handleNext}
                                className="hidden lg:flex absolute -right-5 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/80 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-white/[0.08] text-slate-800 dark:text-white items-center justify-center shadow-[0_10px_25px_rgba(0,0,0,0.08)] backdrop-blur-2xl transition active:scale-90 hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(0,210,255,0.3)] cursor-pointer"
                                title="Next Event (Right Arrow)"
                            >
                                <ChevronRight className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                            </button>

                            {/* Behind Card Depth Layer 2 (Silhouette of 2nd Upcoming Event) */}
                            {events.length > 2 && (
                                <div 
                                    className="absolute inset-x-8 top-0 h-32 rounded-[40px] bg-white/40 dark:bg-slate-900/40 border border-slate-200/80 dark:border-white/[0.08] backdrop-blur-md transition-all duration-[1200ms] ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none transform scale-[0.92] opacity-50 dark:opacity-30 shadow-xl"
                                    style={{ zIndex: 1 }}
                                />
                            )}

                            {/* Behind Card Depth Layer 1 (Silhouette of Next Event Sliding In) */}
                            {events.length > 1 && (
                                <div 
                                    onClick={handleNext}
                                    className="absolute inset-x-4 top-2 h-32 rounded-[38px] bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/[0.08] backdrop-blur-xl transition-all duration-[1200ms] ease-[cubic-bezier(0.25,1,0.5,1)] cursor-pointer transform scale-[0.96] opacity-70 dark:opacity-60 shadow-xl hover:opacity-90 flex items-start justify-center pt-2"
                                    style={{ zIndex: 2 }}
                                    title={`Next: ${events[(currentIndex + 1) % events.length]?.title}`}
                                >
                                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400/80 tracking-widest uppercase">
                                        Up Next: {events[(currentIndex + 1) % events.length]?.title}
                                    </span>
                                </div>
                            )}

                            {/* Front Active Frosted Glass Card (Continuous Sliding Track Deck) */}
                            <div className="relative z-10 w-full rounded-[36px] overflow-hidden backdrop-blur-3xl backdrop-saturate-180 bg-white/75 dark:bg-[#091322]/85 border border-slate-200/80 dark:border-white/[0.08] shadow-[0_25px_70px_rgba(0,0,0,0.06)] dark:shadow-[0_30px_90px_rgba(0,0,0,0.6)] transition-colors duration-300">
                                {/* Ambient Inner Refraction Highlights */}
                                <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-cyan-400/10 blur-3xl pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

                            {/* Silky Smooth Horizontal Sliding Track (Spam-proof) */}
                            <div 
                                className="flex will-change-transform transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
                                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                            >
                                {events.map((evt, idx) => {
                                    return (
                                        <div 
                                            key={evt.id}
                                            className="w-full flex-shrink-0 min-w-full p-6 sm:p-9 text-slate-800 dark:text-slate-100 flex flex-col justify-between min-h-[460px] lg:h-[460px]"
                                        >
                                            {/* Top Header Bar */}
                                            <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/60 dark:border-white/[0.08] pb-4 flex-shrink-0">
                                                <div className="flex flex-wrap items-center gap-2.5">
                                                    <span className="px-3 py-1 rounded-full bg-white/80 dark:bg-white/[0.08] border border-slate-200/80 dark:border-white/[0.08] text-cyan-700 dark:text-cyan-300 font-mono text-[11px] font-black tracking-wider uppercase backdrop-blur-md ">
                                                        EVENT {String(idx + 1).padStart(2, '0')} / {String(events.length).padStart(2, '0')}
                                                    </span>
                                                    <span className="px-3 py-1 rounded-full bg-white/70 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.08] text-slate-800 dark:text-white text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-xs">
                                                        {evt.event_type}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 dark:bg-emerald-950/50 border border-emerald-500/20 dark:border-emerald-500/30 px-3 py-1 rounded-full backdrop-blur-md">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                                                        <span>Active Campaign</span>
                                                    </span>
                                                </div>

                                                {evt.user?.name && (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-amber-950/50 border border-amber-500/20 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-bold backdrop-blur-md">
                                                        <Users className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                                        <span>Organiser: {evt.user.name}</span>
                                                    </span>
                                                )}
                                            </div>

                                            {/* Middle Hero Block (Spacious, Minimalist, High-Impact Typography) */}
                                            <div className="relative z-10 flex flex-col justify-center space-y-3 py-2">
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/70 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.08] text-cyan-800 dark:text-cyan-300 text-xs font-semibold backdrop-blur-md ">
                                                        <Calendar className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                                                        <span>{new Date(evt.event_date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                                    </div>
                                                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/70 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 text-xs font-medium backdrop-blur-md ">
                                                        <Clock className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                                                        <span>{evt.event_time || 'Schedule Set'}</span>
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white font-display tracking-tight leading-tight drop-shadow-xs dark:drop-shadow-md line-clamp-2" title={evt.title}>
                                                        {evt.title}
                                                    </h1>
                                                    <p className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2 pt-0.5 truncate">
                                                        <MapPin className="w-4 h-4 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
                                                        <span className="font-semibold text-slate-800 dark:text-slate-200">{evt.venue}</span>
                                                        {evt.city && <span className="text-slate-500 dark:text-slate-400">• {evt.city}</span>}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Apple Glass Metrics Row (4 Wide Minimalist Cards) */}
                                            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                <div className="p-4 rounded-2xl bg-white/50 dark:bg-white/[0.04] hover:bg-white/70 dark:hover:bg-white/[0.07] border border-slate-200/80 dark:border-white/[0.08] backdrop-blur-xl shadow-[0_4px_15px_rgba(0,0,0,0.02)] transition flex flex-col justify-between">
                                                    <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                        <span>Total Guests</span>
                                                        <Users className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                                                    </div>
                                                    <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono mt-1">
                                                        {(evt.total_guests || 0).toLocaleString()}
                                                    </div>
                                                </div>
                                                <div className="p-4 rounded-2xl bg-white/50 dark:bg-white/[0.04] hover:bg-white/70 dark:hover:bg-white/[0.07] border border-slate-200/80 dark:border-white/[0.08] backdrop-blur-xl shadow-[0_4px_15px_rgba(0,0,0,0.02)] transition flex flex-col justify-between">
                                                    <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                                        <span>Will Attend (RSVP)</span>
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                                    </div>
                                                    <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                                                        {(evt.will_attend_count || 0).toLocaleString()}
                                                    </div>
                                                </div>
                                                <div className="p-4 rounded-2xl bg-white/50 dark:bg-white/[0.04] hover:bg-white/70 dark:hover:bg-white/[0.07] border border-slate-200/80 dark:border-white/[0.08] backdrop-blur-xl shadow-[0_4px_15px_rgba(0,0,0,0.02)] transition flex flex-col justify-between">
                                                    <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-cyan-600 dark:text-cyan-300">
                                                        <span>Response Rate</span>
                                                        <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                                                    </div>
                                                    <div className="text-2xl sm:text-3xl font-black text-cyan-700 dark:text-cyan-300 font-mono mt-1">
                                                        {evt.response_rate || 0}%
                                                    </div>
                                                </div>
                                                <div className="p-4 rounded-2xl bg-white/50 dark:bg-white/[0.04] hover:bg-white/70 dark:hover:bg-white/[0.07] border border-slate-200/80 dark:border-white/[0.08] backdrop-blur-xl shadow-[0_4px_15px_rgba(0,0,0,0.02)] transition flex flex-col justify-between">
                                                    <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-300">
                                                        <span>Gate Check-Ins</span>
                                                        <QrCode className="w-3.5 h-3.5 text-amber-600 dark:text-amber-300" />
                                                    </div>
                                                    <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-300 font-mono mt-1">
                                                        {(evt.checkins_count || 0).toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Minimalist Glass Progress Meter */}
                                            <div className="relative z-10 space-y-1.5 p-3 rounded-2xl bg-white/50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] backdrop-blur-md ">
                                                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                    <span>RSVP Confirmation Progress</span>
                                                    <span className="font-bold text-cyan-700 dark:text-cyan-300">{evt.response_rate || 0}% Confirmed</span>
                                                </div>
                                                <div className="w-full bg-slate-200/80 dark:bg-white/[0.08] rounded-full h-1.5 overflow-hidden">
                                                    <div 
                                                        className="bg-gradient-to-r from-cyan-500 via-blue-600 to-emerald-500 h-1.5 rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(0,210,255,0.8)]" 
                                                        style={{ width: `${Math.min(100, Math.max(6, evt.response_rate || 0))}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Bottom Action Bar */}
                                            <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-200/60 dark:border-white/[0.08] flex-shrink-0">
                                                <div className="flex flex-wrap items-center gap-2.5">
                                                    <Link
                                                        href={route('events.show', evt.id)}
                                                        className="px-5 py-2.5 rounded-full bg-kardovo-navy hover:bg-slate-900 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-black text-xs shadow-lg hover:shadow-xl transition active:scale-95 flex items-center gap-2"
                                                    >
                                                        <span>Open Event Hub &amp; Guests</span>
                                                        <ArrowRight className="w-4 h-4 text-cyan-400 dark:text-slate-950 stroke-[3]" />
                                                    </Link>
                                                    <Link
                                                        href={`${route('messaging.index')}?event_id=${evt.id}`}
                                                        className="px-4 py-2.5 rounded-full bg-white/70 hover:bg-white dark:bg-white/[0.08] dark:hover:bg-white/[0.14] border border-slate-200/80 dark:border-white/[0.08] text-slate-800 dark:text-white font-bold text-xs flex items-center gap-1.5 transition backdrop-blur-md shadow-xs"
                                                    >
                                                        <Send className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                                                        <span>Broadcast Hub</span>
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditEventModal(evt)}
                                                        className="px-3.5 py-2.5 rounded-full bg-white/70 hover:bg-white dark:bg-white/[0.08] dark:hover:bg-white/[0.14] border border-slate-200/80 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition backdrop-blur-md shadow-xs cursor-pointer"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                        <span>Edit</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteEvent(evt)}
                                                        className="p-2.5 rounded-full bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 transition backdrop-blur-md shadow-xs cursor-pointer"
                                                        title="Delete Event"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ═══════════════════════════════════════════════════════════════ */}
                        {/* EXTERNAL CENTERED MANUAL NAVIGATION DOCK (BELOW CONTAINER)     */}
                        {/* ═══════════════════════════════════════════════════════════════ */}
                        <div className="flex items-center justify-center gap-3 pt-2">
                            {/* Left Arrow Button */}
                            <button
                                type="button"
                                onClick={handlePrev}
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-[#0B1526] hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white border border-slate-200/80 dark:border-white/[0.08] shadow-[0_4px_15px_rgba(0,0,0,0.03)] backdrop-blur-xl transition duration-200 active:scale-95 text-xs font-bold group cursor-pointer"
                                title="Previous Event (Left Arrow)"
                            >
                                <ChevronLeft className="w-4 h-4 text-cyan-600 dark:text-cyan-400 group-hover:-translate-x-0.5 transition" />
                                <span>Previous</span>
                            </button>

                            {/* Center Indicator Dots & Track */}
                            <div className="flex items-center gap-2.5 bg-white/80 dark:bg-[#0B1526]/90 border border-slate-200/80 dark:border-white/[0.08] px-4 py-2 rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.03)] backdrop-blur-2xl">
                                <span className="text-[11px] font-mono font-black text-cyan-700 dark:text-cyan-400 tracking-wider uppercase pr-1">
                                    {String(currentIndex + 1).padStart(2, '0')} / {String(events.length).padStart(2, '0')}
                                </span>
                                <div className="h-3.5 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />
                                <div className="flex items-center gap-1.5">
                                    {events.map((evt, idx) => (
                                        <button
                                            key={evt.id}
                                            type="button"
                                            onClick={() => handleJump(idx)}
                                            className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                                                idx === currentIndex
                                                    ? 'w-8 bg-cyan-500 dark:bg-cyan-400 shadow-[0_0_12px_rgba(0,210,255,0.9)]'
                                                    : 'w-2.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-500'
                                            }`}
                                            title={`Switch to ${evt.title}`}
                                        />
                                    ))}
                                </div>
                                <div className="h-3.5 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />
                                {/* Auto-Play Toggle with Hover Pause Feedback */}
                                <button
                                    type="button"
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold flex items-center gap-1 transition cursor-pointer ${
                                        isPlaying 
                                            ? (isHovered 
                                                ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                                                : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]') 
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/[0.08]'
                                    }`}
                                    title={isPlaying ? (isHovered ? 'Auto-Play Paused (Hovering)' : 'Click to Pause Auto-Play') : 'Click to Resume Auto-Play'}
                                >
                                    {isPlaying ? (
                                        isHovered ? (
                                            <>
                                                <Pause className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                                <span>Auto: Paused</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                                                <span>Auto: ON</span>
                                            </>
                                        )
                                    ) : (
                                        <>
                                            <Play className="w-3 h-3" />
                                            <span>Auto: OFF</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Right Arrow Button */}
                            <button
                                type="button"
                                onClick={handleNext}
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-[#0B1526] hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white border border-slate-200/80 dark:border-white/[0.08] shadow-[0_4px_15px_rgba(0,0,0,0.03)] backdrop-blur-xl transition duration-200 active:scale-95 text-xs font-bold group cursor-pointer"
                                title="Next Event (Right Arrow)"
                            >
                                <span>Next</span>
                                <ChevronRight className="w-4 h-4 text-cyan-600 dark:text-cyan-400 group-hover:translate-x-0.5 transition" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* 2. COMPACT MODERN EVENTS GRID GALLERY                           */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                <div className="space-y-4 md:pt-4 md:border-t border-slate-200/80 dark:border-white/[0.08]">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                            <LayoutGrid className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                            <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white font-display">
                                All Events Portfolio Directory
                            </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-white/[0.05] px-2.5 py-1 rounded-full border border-slate-200 dark:border-white/[0.08]">
                            {events.length} {events.length === 1 ? 'Event' : 'Events'}
                        </span>
                    </div>

                    <div className="space-y-3">
                        {events.map((event) => {
                            const total = event.total_guests || 0;
                            const attending = event.will_attend_count || 0;
                            const responseRate = event.response_rate || 0;

                            return (
                                <div 
                                    key={event.id}
                                    className="group relative rounded-2xl overflow-hidden backdrop-blur-2xl backdrop-saturate-180 bg-white/70 dark:bg-[#091322]/85 hover:bg-white/90 dark:hover:bg-[#0d1c33]/95 border border-slate-200/80 dark:border-white/[0.08] hover:border-cyan-400/50 shadow-[0_8px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.35)] hover:shadow-[0_15px_40px_rgba(0,210,255,0.12)] transition-all duration-300 p-4 sm:p-5 text-slate-800 dark:text-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                                >
                                    {/* Ambient subtle glow on hover */}
                                    <div className="absolute top-0 right-0 w-64 h-full bg-cyan-400/[0.04] group-hover:bg-cyan-400/[0.08] blur-2xl pointer-events-none transition-all" />

                                    {/* Left: Date Badge + Title + Venue + Metadata */}
                                    <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1 relative z-10">
                                        {/* Compact Frosted Date Pill */}
                                        <div className="flex-shrink-0 text-center w-14 sm:w-16 py-2 rounded-xl bg-white/60 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/[0.08] group-hover:border-cyan-400/30 transition ">
                                            <span className="text-[10px] uppercase font-bold text-cyan-600 dark:text-cyan-400 block tracking-wider font-mono">
                                                {new Date(event.event_date).toLocaleDateString('en-GB', { month: 'short' })}
                                            </span>
                                            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono block leading-tight">
                                                {new Date(event.event_date).toLocaleDateString('en-GB', { day: 'numeric' })}
                                            </span>
                                            <span className="text-[9px] text-slate-500 dark:text-slate-400 block">
                                                {new Date(event.event_date).toLocaleDateString('en-GB', { year: 'numeric' })}
                                            </span>
                                        </div>

                                        {/* Title & Metadata */}
                                        <div className="min-w-0 flex-1 space-y-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="px-2.5 py-0.5 rounded-full bg-white/70 dark:bg-white/[0.08] border border-slate-200/80 dark:border-white/[0.08] text-cyan-800 dark:text-cyan-300 text-[10px] font-bold uppercase tracking-wider shadow-xs">
                                                    {event.event_type}
                                                </span>
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 dark:bg-emerald-950/50 border border-emerald-500/20 dark:border-emerald-500/30 px-2 py-0.5 rounded-full">
                                                    <span className="w-1 h-1 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                                                    <span>Active</span>
                                                </span>
                                                {event.user?.name && (
                                                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/[0.05] px-2 py-0.5 rounded-full">
                                                        Owner: {event.user.name}
                                                    </span>
                                                )}
                                            </div>

                                            <Link 
                                                href={route('events.show', event.id)} 
                                                className="text-base sm:text-lg font-black text-slate-900 dark:text-white hover:text-cyan-600 dark:hover:text-cyan-300 transition block truncate font-display"
                                            >
                                                {event.title}
                                            </Link>

                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400 font-medium">
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
                                                    <span className="truncate">{event.venue}</span>
                                                </span>
                                                {event.event_time && (
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
                                                        <span>{event.event_time}</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Middle: Progress Bar & Key Counts */}
                                    <div className="w-full lg:w-72 bg-slate-100/70 dark:bg-white/[0.03] p-3 rounded-xl border border-slate-200/80 dark:border-white/[0.06] flex-shrink-0 relative z-10 space-y-2">
                                        <div className="flex items-center justify-between text-xs font-mono font-bold">
                                            <span className="text-slate-600 dark:text-slate-400">Attending:</span>
                                            <span className="text-emerald-700 dark:text-emerald-400">{attending} / {total} passes ({responseRate}%)</span>
                                        </div>
                                        {/* Progress Bar Track */}
                                        <div className="w-full h-2 bg-slate-200/80 dark:bg-white/[0.08] rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 rounded-full transition-all duration-500" 
                                                style={{ width: `${Math.min(responseRate, 100)}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Right: Quick Action Buttons */}
                                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap relative z-10 flex-shrink-0">
                                        <Link
                                            href={route('events.show', event.id)}
                                            className="flex-1 sm:flex-none py-2 px-3.5 rounded-xl bg-kardovo-navy hover:bg-slate-900 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition"
                                        >
                                            <Layers className="w-3.5 h-3.5 text-cyan-400 dark:text-slate-950" />
                                            <span>Open Hub</span>
                                        </Link>

                                        <Link
                                            href={route('scanner.index', { event_id: event.id })}
                                            className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 transition active:scale-95"
                                            title="Launch Gate Scanner App"
                                        >
                                            <QrCode className="w-4 h-4" />
                                        </Link>

                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => openEditModal(event)}
                                                className="p-2 rounded-xl bg-white dark:bg-white/[0.06] hover:bg-slate-100 dark:hover:bg-white/[0.12] text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-white/[0.08] transition active:scale-95"
                                                title="Edit Event Configuration"
                                            >
                                                <Edit className="w-3.5 h-3.5" />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleDeleteEvent(event)}
                                                className="p-2 rounded-xl bg-white dark:bg-white/[0.06] hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 text-slate-400 border border-slate-200/80 dark:border-white/[0.08] transition active:scale-95"
                                                title="Delete Event"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Create Event Modal */}
            <Modal show={createModalOpen} onClose={() => setCreateModalOpen(false)} maxWidth="md">
                <form onSubmit={handleCreateSubmit} className="p-6 sm:p-7 space-y-5">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/[0.08]">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2.5 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/40 text-cyan-800 dark:text-cyan-300 text-[10.5px] font-mono font-extrabold uppercase flex items-center gap-1">
                                    <Plus className="w-3 h-3" />
                                    <span>New Event</span>
                                </span>
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white font-display">
                                Create New Event
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Enter basic event details to start generating personalized passes.
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="title" value="Event Title *" />
                            <TextInput
                                id="title"
                                type="text"
                                className="mt-1 block w-full text-xs font-bold py-2.5 rounded-2xl"
                                placeholder="e.g. Neema & Baraka — Wedding Reception"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                required
                            />
                            <InputError message={errors.title} className="mt-1" />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <InputLabel htmlFor="event_type" value="Event Type *" />
                                <select
                                    id="event_type"
                                    className="mt-1 block w-full rounded-2xl border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white text-xs font-bold py-2.5 px-3 focus:border-cyan-500 focus:ring-cyan-500 shadow-2xs cursor-pointer"
                                    value={data.event_type}
                                    onChange={(e) => setData('event_type', e.target.value)}
                                    required
                                >
                                    <option value="Wedding Reception">Wedding Reception</option>
                                    <option value="Alumni Gala">Alumni Gala</option>
                                    <option value="Corporate Conference">Corporate Conference</option>
                                    <option value="Birthday Party">Birthday Party</option>
                                    <option value="Concert / Festival">Concert / Festival</option>
                                    <option value="Private Dinner">Private Dinner</option>
                                </select>
                            </div>

                            <div>
                                <InputLabel htmlFor="event_date" value="Date *" />
                                <TextInput
                                    id="event_date"
                                    type="date"
                                    className="mt-1 block w-full text-xs font-bold py-2 rounded-2xl"
                                    value={data.event_date}
                                    onChange={(e) => setData('event_date', e.target.value)}
                                    required
                                />
                                <InputError message={errors.event_date} className="mt-1" />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="event_time" value="Time Label" />
                            <TextInput
                                id="event_time"
                                type="text"
                                className="mt-1 block w-full text-xs font-semibold py-2.5 rounded-2xl"
                                placeholder="e.g. 4:00 PM — Reception & Dinner"
                                value={data.event_time}
                                onChange={(e) => setData('event_time', e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <InputLabel htmlFor="venue" value="Venue *" />
                                <TextInput
                                    id="venue"
                                    type="text"
                                    className="mt-1 block w-full text-xs font-semibold py-2.5 rounded-2xl"
                                    placeholder="e.g. Kunduchi Beach Gardens"
                                    value={data.venue}
                                    onChange={(e) => setData('venue', e.target.value)}
                                    required
                                />
                                <InputError message={errors.venue} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="city" value="City" />
                                <TextInput
                                    id="city"
                                    type="text"
                                    className="mt-1 block w-full text-xs font-semibold py-2.5 rounded-2xl"
                                    value={data.city}
                                    onChange={(e) => setData('city', e.target.value)}
                                />
                            </div>
                        </div>

                        {isAdmin && organizers.length > 0 && (
                            <div>
                                <InputLabel htmlFor="create_user_id" value="Assign Event Organiser (Customer Account)" />
                                <select
                                    id="create_user_id"
                                    className="mt-1 block w-full rounded-2xl border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white text-xs font-bold py-2.5 px-3 focus:border-cyan-500 focus:ring-cyan-500 shadow-2xs cursor-pointer font-medium"
                                    value={data.user_id}
                                    onChange={(e) => setData('user_id', e.target.value)}
                                >
                                    <option value="">Myself (System Administrator)</option>
                                    {organizers.map(org => (
                                        <option key={org.id} value={org.id}>
                                            {org.name} ({org.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/[0.08]">
                        <SecondaryButton onClick={() => setCreateModalOpen(false)}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton disabled={processing} className="bg-kardovo-navy hover:bg-slate-900 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white dark:text-slate-950 font-bold text-xs uppercase tracking-wider">
                            Create Event
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal: Edit Event */}
            <Modal show={editModalOpen} onClose={() => setEditModalOpen(false)} maxWidth="lg">
                <form onSubmit={handleEditSubmit} className="p-6 sm:p-7 space-y-5">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/[0.08]">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2.5 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/40 text-cyan-800 dark:text-cyan-300 text-[10.5px] font-mono font-extrabold uppercase flex items-center gap-1">
                                    <Edit className="w-3 h-3" />
                                    <span>Event Governance</span>
                                </span>
                                {selectedEventForEdit && (
                                    <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                                        #{selectedEventForEdit.id}
                                    </span>
                                )}
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white font-display">
                                Edit Event Details
                            </h3>
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-200 flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="mt-4 space-y-4">
                        <div>
                            <InputLabel htmlFor="edit_event_title" value="Event Title *" />
                            <TextInput
                                id="edit_event_title"
                                type="text"
                                className="mt-1 block w-full text-sm font-semibold"
                                value={editForm.data.title}
                                onChange={(e) => editForm.setData('title', e.target.value)}
                                required
                            />
                            <InputError message={editForm.errors.title} className="mt-1" />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <InputLabel htmlFor="edit_event_type" value="Event Type *" />
                                <select
                                    id="edit_event_type"
                                    className="mt-1 block w-full rounded-2xl border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white text-xs font-bold py-2.5 px-3 focus:border-cyan-500 focus:ring-cyan-500 shadow-2xs cursor-pointer"
                                    value={editForm.data.event_type}
                                    onChange={(e) => editForm.setData('event_type', e.target.value)}
                                    required
                                >
                                    <option value="Wedding Reception">Wedding Reception</option>
                                    <option value="Engagement Party">Engagement Party</option>
                                    <option value="Alumni Gala">Alumni Gala</option>
                                    <option value="Corporate Conference">Corporate Conference</option>
                                    <option value="Birthday Party">Birthday Party</option>
                                    <option value="Concert / Festival">Concert / Festival</option>
                                    <option value="Private Dinner">Private Dinner</option>
                                </select>
                            </div>

                            <div>
                                <InputLabel htmlFor="edit_event_date" value="Date *" />
                                <TextInput
                                    id="edit_event_date"
                                    type="date"
                                    className="mt-1 block w-full text-sm"
                                    value={editForm.data.event_date}
                                    onChange={(e) => editForm.setData('event_date', e.target.value)}
                                    required
                                />
                                <InputError message={editForm.errors.event_date} className="mt-1" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <InputLabel htmlFor="edit_event_time" value="Time Label" />
                                <TextInput
                                    id="edit_event_time"
                                    type="text"
                                    className="mt-1 block w-full text-sm"
                                    placeholder="e.g. 4:00 PM — Reception & Dinner"
                                    value={editForm.data.event_time}
                                    onChange={(e) => editForm.setData('event_time', e.target.value)}
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="edit_event_status" value="Event Status" />
                                <select
                                    id="edit_event_status"
                                    className="mt-1 block w-full rounded-2xl border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white text-xs font-bold py-2.5 px-3 focus:border-cyan-500 focus:ring-cyan-500 shadow-2xs cursor-pointer"
                                    value={editForm.data.status}
                                    onChange={(e) => editForm.setData('status', e.target.value)}
                                >
                                    <option value="active">Active (Live)</option>
                                    <option value="draft">Draft</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <InputLabel htmlFor="edit_venue" value="Venue *" />
                                <TextInput
                                    id="edit_venue"
                                    type="text"
                                    className="mt-1 block w-full text-sm"
                                    value={editForm.data.venue}
                                    onChange={(e) => editForm.setData('venue', e.target.value)}
                                    required
                                />
                                <InputError message={editForm.errors.venue} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="edit_city" value="City" />
                                <TextInput
                                    id="edit_city"
                                    type="text"
                                    className="mt-1 block w-full text-sm"
                                    value={editForm.data.city}
                                    onChange={(e) => editForm.setData('city', e.target.value)}
                                />
                            </div>
                        </div>

                        {templates && templates.length > 0 && (
                            <div>
                                <InputLabel value="Assigned Invitation Card Template" />
                                <select
                                    className="mt-1 block w-full rounded-2xl border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white text-xs font-bold py-2.5 px-3 focus:border-cyan-500 focus:ring-cyan-500 shadow-2xs cursor-pointer"
                                    value={editForm.data.card_template_id}
                                    onChange={(e) => editForm.setData('card_template_id', e.target.value)}
                                >
                                    <option value="">Default System Pass</option>
                                    {templates.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.name} ({t.template_type})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {isAdmin && organizers.length > 0 && (
                            <div>
                                <InputLabel htmlFor="edit_user_id" value="Assigned Organiser (Customer Account)" />
                                <select
                                    id="edit_user_id"
                                    className="mt-1 block w-full rounded-2xl border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white text-xs font-bold py-2.5 px-3 focus:border-cyan-500 focus:ring-cyan-500 shadow-2xs cursor-pointer font-medium"
                                    value={editForm.data.user_id}
                                    onChange={(e) => editForm.setData('user_id', e.target.value)}
                                >
                                    <option value="">System Administrator</option>
                                    {organizers.map(org => (
                                        <option key={org.id} value={org.id}>
                                            {org.name} ({org.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div>
                            <InputLabel htmlFor="edit_description" value="Description / Notes" />
                            <textarea
                                id="edit_description"
                                rows={2}
                                className="mt-1 block w-full rounded-2xl border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white text-xs font-medium p-3 focus:border-cyan-500 focus:ring-cyan-500 shadow-2xs"
                                placeholder="Additional details or notes..."
                                value={editForm.data.description}
                                onChange={(e) => editForm.setData('description', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/[0.08]">
                        <SecondaryButton onClick={() => setEditModalOpen(false)}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton disabled={editForm.processing} className="bg-kardovo-navy hover:bg-slate-900 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white dark:text-slate-950 font-bold text-xs uppercase tracking-wider">
                            Save Changes
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </KardovoAppLayout>
    );
}
