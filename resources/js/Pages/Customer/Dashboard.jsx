import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import KardovoAppLayout from '@/Layouts/KardovoAppLayout';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { 
    Calendar, CalendarPlus, 
    Plus, 
    Users, 
    CheckCircle2, 
    ArrowRight, 
    Palette, 
    Send, 
    MapPin, 
    CheckCheck, 
    TrendingUp, 
    ChevronRight,
    Zap,
    Sparkles,
    Wallet,
} from 'lucide-react';

export default function CustomerDashboard({ 
    events = [], 
    overviewStats = {}, 
    templates = [] 
}) {
    const { auth } = usePage().props;
    const user = auth?.user || {};
    const [createModalOpen, setCreateModalOpen] = useState(false);

    const today = new Date();
    const todayFormatted = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const greeting = (() => {
        const hour = today.getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    })();
    const firstName = user?.name ? user.name.split(' ')[0] : 'alfruhd';
    const isNewUser = events.length === 0;

    // Form: Create Event
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        event_type: 'Wedding Reception',
        event_date: '',
        event_time: '',
        venue: '',
        city: '',
        description: '',
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

    const quota = user?.message_quotas || {};
    const isUnrestrictedQuota = user?.is_unrestricted_quota || user?.role === 'admin';

    return (
        <KardovoAppLayout
            title="Organizer Dashboard"
            headerActions={
                <button
                    type="button"
                    onClick={() => setCreateModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#16A34A] hover:bg-[#15803D] border border-[#16A34A] rounded-xl shadow-sm transition active:scale-95 cursor-pointer"
                >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Create Event</span>
                </button>
            }
        >
            <Head title="Organizer Dashboard — Kardovo" />

            <div className="max-w-7xl mx-auto space-y-6">

                {/* 1. TOP HEADER (COMPLEMENTARY SYSTEM THEME) */}
                <div className="rounded-3xl bg-white/80 dark:bg-[#0B1524] border border-slate-200/90 dark:border-white/[0.08] p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 shadow-2xs">
                            <Sparkles className="w-6 h-6 stroke-[2]" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight flex items-center gap-2">
                                <span>{greeting}, {firstName}</span>
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                                Select or create an event to get started
                            </p>
                        </div>
                    </div>
                </div>


                {/* 2. PLAIN DASHBOARD FOR NEW USER (COMPLEMENTARY SYSTEM THEME) */}
                {isNewUser ? (
                    <div className="space-y-6 animate-fadeIn">
                        {/* Empty Dashed Box */}
                        <div className="rounded-3xl border-2 border-dashed border-emerald-500/20 dark:border-emerald-500/30 bg-white/80 dark:bg-[#0B1524] py-16 sm:py-20 px-6 text-center space-y-3 shadow-xs hover:border-emerald-500/40 transition">
                            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-2xs">
                                <Calendar className="w-8 h-8 stroke-[1.75]" />
                            </div>
                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight">
                                No Event Selected
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                                Select an existing event or create a new one to view your dashboard
                            </p>
                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={() => setCreateModalOpen(true)}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] border border-[#16A34A] text-white font-bold text-xs sm:text-sm shadow-xs transition active:scale-95 cursor-pointer"
                                >
                                    <Plus className="w-4 h-4 stroke-[2.5]" />
                                    <span>Create New Event</span>
                                </button>
                            </div>
                        </div>

                        {/* How to use Kardovo Section */}
                        <div className="rounded-3xl border border-slate-200/90 dark:border-white/[0.08] bg-white/80 dark:bg-[#0B1524] p-5 sm:p-6 shadow-xs space-y-5">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                    <Sparkles className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-display">
                                        How to use Kardovo
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Follow 5 simple steps to set up and send your event passes
                                    </p>
                                </div>
                            </div>

                                                        {/* 5 Minimalist Steps Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                                {/* Step 1: Create Event */}
                                <div 
                                    
                                    className="p-3 rounded-2xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] transition flex items-center gap-3"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex flex-shrink-0 items-center justify-center relative">
                                        <CalendarPlus className="w-4 h-4" />
                                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-emerald-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-[#0B1524]">1</span>
                                    </div>
                                    <div>
                                        <h4 className="text-[12px] font-bold text-slate-900 dark:text-white transition leading-tight">Create Event</h4>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Create now</p>
                                    </div>
                                </div>

                                {/* Step 2: Payment */}
                                <div
                                    
                                    className="p-3 rounded-2xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] transition flex items-center gap-3"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex flex-shrink-0 items-center justify-center relative">
                                        <Wallet className="w-4 h-4" />
                                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-emerald-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-[#0B1524]">2</span>
                                    </div>
                                    <div>
                                        <h4 className="text-[12px] font-bold text-slate-900 dark:text-white transition leading-tight">Make Payment</h4>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Go to Payment</p>
                                    </div>
                                </div>

                                {/* Step 3: Choose Card Template */}
                                <div
                                    
                                    className="p-3 rounded-2xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] transition flex items-center gap-3"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex flex-shrink-0 items-center justify-center relative">
                                        <Palette className="w-4 h-4" />
                                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-emerald-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-[#0B1524]">3</span>
                                    </div>
                                    <div>
                                        <h4 className="text-[12px] font-bold text-slate-900 dark:text-white transition leading-tight">Card Template</h4>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">View templates</p>
                                    </div>
                                </div>

                                {/* Step 4: Import Guests */}
                                <div
                                    
                                    className="p-3 rounded-2xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] transition flex items-center gap-3"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex flex-shrink-0 items-center justify-center relative">
                                        <Users className="w-4 h-4" />
                                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-emerald-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-[#0B1524]">4</span>
                                    </div>
                                    <div>
                                        <h4 className="text-[12px] font-bold text-slate-900 dark:text-white transition leading-tight">Import Guests</h4>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">My Events</p>
                                    </div>
                                </div>

                                {/* Step 5: Send Passes */}
                                <div
                                    
                                    className="p-3 rounded-2xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] transition flex items-center gap-3"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex flex-shrink-0 items-center justify-center relative">
                                        <Send className="w-4 h-4" />
                                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-emerald-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-[#0B1524]">5</span>
                                    </div>
                                    <div>
                                        <h4 className="text-[12px] font-bold text-slate-900 dark:text-white transition leading-tight">Send Passes</h4>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Messaging Hub</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 animate-fadeIn">
                        {/* Executive Metrics KPI Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                            {/* Total Events */}
                            <div className="group rounded-2xl p-4 bg-white dark:bg-[#0B1524] border border-slate-200/80 dark:border-white/[0.08] shadow-xs hover:shadow-card hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-all duration-200 flex flex-col justify-between">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">Events</span>
                                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-colors">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">{overviewStats.total_events || 0}</div>
                                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">{overviewStats.active_events || 0} active</div>
                                </div>
                            </div>

                            {/* Total Guests */}
                            <div className="group rounded-2xl p-4 bg-white dark:bg-[#0B1524] border border-slate-200/80 dark:border-white/[0.08] shadow-xs hover:shadow-card hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-all duration-200 flex flex-col justify-between">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">Guests</span>
                                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-colors">
                                        <Users className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">{Number(overviewStats.total_guests || 0).toLocaleString()}</div>
                                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">Invited guests</div>
                                </div>
                            </div>

                            {/* Confirmed RSVPs */}
                            <div className="group rounded-2xl p-4 bg-white dark:bg-[#0B1524] border border-slate-200/80 dark:border-white/[0.08] shadow-xs hover:shadow-card hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-all duration-200 flex flex-col justify-between">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">Attending</span>
                                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-colors">
                                        <CheckCircle2 className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">{Number(overviewStats.total_will_attend || 0).toLocaleString()}</div>
                                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">{overviewStats.overall_attendance_rate || 0}% confirmed</div>
                                </div>
                            </div>

                            {/* Admitted at Gate */}
                            <div className="group rounded-2xl p-4 bg-white dark:bg-[#0B1524] border border-slate-200/80 dark:border-white/[0.08] shadow-xs hover:shadow-card hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-all duration-200 flex flex-col justify-between">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">Checked In</span>
                                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-colors">
                                        <CheckCheck className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">{Number(overviewStats.total_checkins || 0).toLocaleString()}</div>
                                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">Gate entries</div>
                                </div>
                            </div>

                            {/* Passes Dispatched */}
                            <div className="group rounded-2xl p-4 bg-white dark:bg-[#0B1524] border border-slate-200/80 dark:border-white/[0.08] shadow-xs hover:shadow-card hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-all duration-200 flex flex-col justify-between">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">Passes Sent</span>
                                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-colors">
                                        <Send className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">{Number(overviewStats.total_messages || 0).toLocaleString()}</div>
                                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">Dispatched</div>
                                </div>
                            </div>

                            {/* Message Quota */}
                            <div className="group rounded-2xl p-4 bg-white dark:bg-[#0B1524] border border-slate-200/80 dark:border-white/[0.08] shadow-xs hover:shadow-card hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-all duration-200 flex flex-col justify-between">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">Quota</span>
                                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-colors">
                                        <Zap className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                                        {isUnrestrictedQuota ? '∞' : (quota.whatsapp_remaining ?? '1,000')}
                                    </div>
                                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                                        {isUnrestrictedQuota ? 'Unlimited balance' : `${quota.whatsapp_used || 0} sent`}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Grid: Your Events & RSVP Status */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                            {/* Left Column: Your Events (8 cols) */}
                            <div className="lg:col-span-8 space-y-6">
                                <div className="rounded-3xl bg-white dark:bg-[#0B1524] border border-slate-200/90 dark:border-white/[0.08] p-5 sm:p-6 shadow-xs">
                                    <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/[0.06]">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                                                <Calendar className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h2 className="text-base font-black text-slate-900 dark:text-white font-display">
                                                    Your Events
                                                </h2>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                    Active event campaigns and guest tallies.
                                                </p>
                                            </div>
                                        </div>
                                        <Link
                                            href={route('events.index')}
                                            className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] border border-slate-200/60 dark:border-white/[0.08] transition group shadow-2xs"
                                        >
                                            <span>View All ({events.length})</span>
                                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                        </Link>
                                    </div>

                                    <div className="mt-4 divide-y divide-slate-100 dark:divide-white/[0.06]">
                                        {events.slice(0, 5).map((event) => {
                                            const dateObj = event.event_date ? new Date(event.event_date) : null;
                                            const dayStr = dateObj ? dateObj.toLocaleDateString('en-GB', { day: 'numeric' }) : '--';
                                            const monthStr = dateObj ? dateObj.toLocaleDateString('en-GB', { month: 'short' }) : 'TBD';

                                            return (
                                                <div 
                                                    key={event.id}
                                                    className="py-3.5 first:pt-1 last:pb-1 flex items-center justify-between gap-3 group transition-colors"
                                                >
                                                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                                        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-slate-100/90 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.08] flex flex-col items-center justify-center flex-shrink-0 text-center shadow-2xs">
                                                            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400 leading-none">
                                                                {monthStr}
                                                            </span>
                                                            <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white font-mono leading-tight mt-0.5">
                                                                {dayStr}
                                                            </span>
                                                        </div>

                                                        <div className="min-w-0 flex-1">
                                                            <Link 
                                                                href={route('events.show', event.id)}
                                                                className="font-bold text-sm sm:text-[15px] text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate block hover:underline"
                                                            >
                                                                {event.title}
                                                            </Link>

                                                            <div className="flex items-center gap-2 sm:gap-2.5 mt-1 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                                                                {event.event_type && (
                                                                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold border border-emerald-500/20 flex-shrink-0">
                                                                        {event.event_type}
                                                                    </span>
                                                                )}
                                                                {(event.venue || event.city) && (
                                                                    <span className="flex items-center gap-1 truncate max-w-[200px] sm:max-w-xs">
                                                                        <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                                                                        <span className="truncate">{event.venue || event.city}</span>
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                                        <Link
                                                            href={route('events.show', event.id)}
                                                            className="px-3 py-1.5 rounded-xl bg-slate-100/90 hover:bg-[#16A34A] text-slate-700 dark:text-slate-300 hover:text-white dark:bg-white/[0.05] dark:hover:bg-[#16A34A] dark:hover:text-white font-bold text-xs border border-slate-200/70 dark:border-white/[0.08] hover:border-transparent shadow-2xs transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                                                        >
                                                            <span>Manage</span>
                                                            <ChevronRight className="w-3.5 h-3.5" />
                                                        </Link>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: RSVP Status (4 cols) */}
                            <div className="lg:col-span-4 space-y-6">
                                <div className="rounded-3xl bg-white dark:bg-[#0B1524] border border-slate-200/90 dark:border-white/[0.08] p-5 sm:p-6 shadow-xs space-y-5">
                                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
                                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                                            <TrendingUp className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h2 className="text-sm font-black text-slate-900 dark:text-white font-display">
                                                RSVP Status
                                            </h2>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                Overall guest responses.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Attending */}
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between text-xs font-bold">
                                                <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                                                    <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                                                    <span>Attending</span>
                                                </span>
                                                <span className="text-slate-900 dark:text-white font-mono">
                                                    {overviewStats.total_will_attend || 0} <span className="text-slate-400 font-normal">({overviewStats.overall_attendance_rate || 0}%)</span>
                                                </span>
                                            </div>
                                            <div className="h-2 rounded-full bg-slate-100 dark:bg-white/[0.06] overflow-hidden">
                                                <div 
                                                    className="h-full rounded-full bg-[#16A34A] transition-all duration-500"
                                                    style={{ width: `${Math.min(overviewStats.overall_attendance_rate || 0, 100)}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Pending */}
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between text-xs font-bold">
                                                <span className="text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                                                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                                                    <span>Pending RSVP</span>
                                                </span>
                                                <span className="text-slate-900 dark:text-white font-mono">
                                                    {overviewStats.total_pending_rsvp || 0}
                                                </span>
                                            </div>
                                            <div className="h-2 rounded-full bg-slate-100 dark:bg-white/[0.06] overflow-hidden">
                                                <div 
                                                    className="h-full rounded-full bg-amber-500 transition-all duration-500"
                                                    style={{ 
                                                        width: overviewStats.total_guests > 0 
                                                            ? `${Math.min(Math.round(((overviewStats.total_pending_rsvp || 0) / overviewStats.total_guests) * 100), 100)}%` 
                                                            : '0%' 
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Declined */}
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between text-xs font-bold">
                                                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                                                    <span>Declined</span>
                                                </span>
                                                <span className="text-slate-900 dark:text-white font-mono">
                                                    {overviewStats.total_will_not_attend || 0}
                                                </span>
                                            </div>
                                            <div className="h-2 rounded-full bg-slate-100 dark:bg-white/[0.06] overflow-hidden">
                                                <div 
                                                    className="h-full rounded-full bg-slate-400 transition-all duration-500"
                                                    style={{ 
                                                        width: overviewStats.total_guests > 0 
                                                            ? `${Math.min(Math.round(((overviewStats.total_will_not_attend || 0) / overviewStats.total_guests) * 100), 100)}%` 
                                                            : '0%' 
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick Summary Pill Box */}
                                    <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] grid grid-cols-2 gap-2 text-center">
                                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.05]">
                                            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Response Rate</div>
                                            <div className="text-sm font-black font-mono text-slate-900 dark:text-white mt-0.5">
                                                {overviewStats.total_guests > 0 
                                                    ? Math.round((((overviewStats.total_will_attend || 0) + (overviewStats.total_will_not_attend || 0)) / overviewStats.total_guests) * 100)
                                                    : 0}%
                                            </div>
                                        </div>
                                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.05]">
                                            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Check-in Rate</div>
                                            <div className="text-sm font-black font-mono text-slate-900 dark:text-white mt-0.5">
                                                {overviewStats.total_guests > 0
                                                    ? Math.round(((overviewStats.total_checkins || 0) / overviewStats.total_guests) * 100)
                                                    : 0}%
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {/* ═══════════ CREATE EVENT MODAL ═══════════ */}
            <Modal show={createModalOpen} onClose={() => setCreateModalOpen(false)} maxWidth="md">
                <form onSubmit={handleCreateSubmit} className="p-6">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/[0.08]">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                <Plus className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">Create New Event</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Launch a new invitation portfolio</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 space-y-4">
                        <div>
                            <InputLabel htmlFor="create_title" value="Event Title *" />
                            <TextInput
                                id="create_title"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                className="mt-1 block w-full text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                placeholder="e.g. Neema & Baraka — Wedding Reception"
                                required
                            />
                            <InputError message={errors.title} className="mt-1" />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <InputLabel htmlFor="create_type" value="Event Type *" />
                                <select
                                    id="create_type"
                                    value={data.event_type}
                                    onChange={(e) => setData('event_type', e.target.value)}
                                    className="mt-1 block w-full text-xs rounded-xl border-slate-300 dark:border-slate-700 dark:bg-[#0B1524] dark:text-white shadow-xs focus:border-emerald-500 focus:ring-emerald-500"
                                >
                                    <option value="Wedding Reception">Wedding Reception</option>
                                    <option value="Send Off Party">Send Off Party</option>
                                    <option value="Engagement">Engagement</option>
                                    <option value="Birthday Gala">Birthday Gala</option>
                                    <option value="Corporate Gala">Corporate Gala</option>
                                    <option value="VIP Concert">VIP Concert</option>
                                    <option value="Alumni Reunion">Alumni Reunion</option>
                                    <option value="Private Dinner">Private Dinner</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <InputLabel htmlFor="create_date" value="Event Date *" />
                                <TextInput
                                    id="create_date"
                                    type="date"
                                    min={todayFormatted}
                                    value={data.event_date}
                                    onChange={(e) => setData('event_date', e.target.value)}
                                    className="mt-1 block w-full text-xs focus:border-emerald-500 focus:ring-emerald-500"
                                    required
                                />
                                <InputError message={errors.event_date} className="mt-1" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <InputLabel htmlFor="create_time" value="Event Time" />
                                <TextInput
                                    id="create_time"
                                    value={data.event_time}
                                    onChange={(e) => setData('event_time', e.target.value)}
                                    className="mt-1 block w-full text-xs focus:border-emerald-500 focus:ring-emerald-500"
                                    placeholder="4:00 PM — Reception & Dinner"
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="create_city" value="City / Location" />
                                <TextInput
                                    id="create_city"
                                    value={data.city}
                                    onChange={(e) => setData('city', e.target.value)}
                                    className="mt-1 block w-full text-xs focus:border-emerald-500 focus:ring-emerald-500"
                                    placeholder="Dar es Salaam"
                                />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="create_venue" value="Venue Name *" />
                            <TextInput
                                id="create_venue"
                                value={data.venue}
                                onChange={(e) => setData('venue', e.target.value)}
                                className="mt-1 block w-full text-xs focus:border-emerald-500 focus:ring-emerald-500"
                                placeholder="e.g. Kunduchi Beach Gardens"
                                required
                            />
                            <InputError message={errors.venue} className="mt-1" />
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/[0.08] flex items-center justify-end gap-2.5">
                        <SecondaryButton type="button" onClick={() => setCreateModalOpen(false)}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton type="submit" disabled={processing} className="bg-[#16A34A] hover:bg-[#15803D] text-white border border-[#16A34A]">
                            {processing ? 'Creating Event...' : 'Create Event Portfolio'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

        </KardovoAppLayout>
    );
}
