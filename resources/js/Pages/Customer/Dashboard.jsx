import React, { useState } from 'react';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import KardovoAppLayout from '@/Layouts/KardovoAppLayout';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { 
    Calendar, 
    Plus, 
    Users, 
    CheckCircle2, 
    ArrowRight, 
    Palette, 
    Send, 
    MapPin, 
    Clock, 
    QrCode, 
    Ticket, 
    MessageSquare, 
    Activity, 
    CheckCheck, 
    XCircle, 
    TrendingUp, 
    ChevronRight,
    Building2,
    Zap,
    Trash2
} from 'lucide-react';

export default function CustomerDashboard({ 
    events = [], 
    overviewStats = {}, 
    recentScanLogs = [], 
    recentGuests = [], 
    templates = [] 
}) {
    const { auth } = usePage().props;
    const user = auth?.user || {};
    const [createModalOpen, setCreateModalOpen] = useState(false);

    // Form: Create Event
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        event_type: 'Wedding Reception',
        event_date: '',
        event_time: '4:00 PM — Reception & Dinner',
        venue: '',
        city: 'Dar es Salaam',
        card_template_id: templates[0]?.id || '',
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

    const handleDeleteScanLog = (log) => {
        const guestName = log.guest?.name || 'Guest Pass Holder';
        const eventId = log.event_id || log.event?.id;
        if (!eventId) return;
        if (confirm(`Are you sure you want to delete this scan activity record for "${guestName}"?`)) {
            router.delete(route('events.destroyScanLog', [eventId, log.id]), {
                preserveScroll: true,
            });
        }
    };

    const quota = user?.message_quotas || {};
    const isUnrestrictedQuota = user?.is_unrestricted_quota || user?.role === 'admin';

    return (
        <KardovoAppLayout
            title="Organizer Dashboard"
            headerActions={
                <div className="flex items-center gap-2">
                    <Link
                        href={route('messaging.index')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-white/[0.06] hover:bg-slate-50 dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/[0.1] rounded-xl shadow-xs transition active:scale-95"
                    >
                        <MessageSquare className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                        <span className="hidden sm:inline">Send Passes</span>
                    </Link>
                    <Link
                        href={route('scanner.index')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30 rounded-xl shadow-xs transition active:scale-95"
                    >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Gate Scanner</span>
                    </Link>
                    <button
                        type="button"
                        onClick={() => setCreateModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-kardovo-navy hover:bg-slate-900 rounded-xl shadow-md transition active:scale-95 cursor-pointer"
                    >
                        <Plus className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Create Event</span>
                    </button>
                </div>
            }
        >
            <Head title="Organizer Dashboard — Kardovo" />

            <div className="max-w-7xl mx-auto space-y-6">

                {/* 1. HERO BANNER WITH FULL LIGHT & DARK MODE SUPPORT */}
                <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-gradient-to-br dark:from-[#091322] dark:via-[#0A182E] dark:to-[#07111D] border border-slate-200/90 dark:border-white/[0.12] p-6 sm:p-8 text-slate-900 dark:text-white shadow-xs dark:shadow-[0_20px_50px_rgba(0,0,0,0.35)] transition-colors">
                    {/* Ambient Glows (Dark Mode Only) */}
                    <div className="hidden dark:block absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 blur-3xl pointer-events-none" />
                    <div className="hidden dark:block absolute bottom-0 left-1/3 w-64 h-64 bg-emerald-500/10 blur-3xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="space-y-2 max-w-2xl">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-500/15 border border-cyan-200 dark:border-cyan-400/30 text-cyan-700 dark:text-cyan-300 font-mono text-[10.5px] font-extrabold uppercase tracking-wider">
                                    <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                                    <span>ORGANIZER PORTAL</span>
                                </span>
                                {user.company && (
                                    <span className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.06] px-2.5 py-1 rounded-full border border-slate-200 dark:border-white/10">
                                        <Building2 className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                                        <span>{user.company}</span>
                                    </span>
                                )}
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white font-display">
                                Welcome back, {user.name || 'Organizer'}
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                Manage events, guest passes, RSVPs, and gate check-ins.
                            </p>
                        </div>

                        {/* Quick Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2.5 lg:self-center">
                            <button
                                type="button"
                                onClick={() => setCreateModalOpen(true)}
                                className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Create Event</span>
                            </button>
                            <Link
                                href={route('templates.index')}
                                className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.08] dark:hover:bg-white/[0.14] border border-slate-200 dark:border-white/15 text-slate-800 dark:text-white font-semibold text-xs flex items-center gap-1.5 transition active:scale-95"
                            >
                                <Palette className="w-4 h-4 text-cyan-600 dark:text-cyan-300" />
                                <span>Pass Studio</span>
                            </Link>
                            <Link
                                href={route('messaging.index')}
                                className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.08] dark:hover:bg-white/[0.14] border border-slate-200 dark:border-white/15 text-slate-800 dark:text-white font-semibold text-xs flex items-center gap-1.5 transition active:scale-95"
                            >
                                <Send className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                <span>Send Passes</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* 2. EXECUTIVE METRICS KPI GRID */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                    {/* Total Events */}
                    <div className="group rounded-2xl p-4 bg-white dark:bg-[#0B1524] border border-slate-200/80 dark:border-white/[0.08] shadow-xs hover:shadow-card hover:border-cyan-500/40 dark:hover:border-cyan-500/40 transition-all duration-200 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">Events</span>
                            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 dark:bg-cyan-500/15 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center transition-colors">
                                <Calendar className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">{overviewStats.total_events || 0}</div>
                            <div className="text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold mt-1">{overviewStats.active_events || 0} active</div>
                        </div>
                    </div>

                    {/* Total Guests */}
                    <div className="group rounded-2xl p-4 bg-white dark:bg-[#0B1524] border border-slate-200/80 dark:border-white/[0.08] shadow-xs hover:shadow-card hover:border-cyan-500/40 dark:hover:border-cyan-500/40 transition-all duration-200 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">Guests</span>
                            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 dark:bg-cyan-500/15 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center transition-colors">
                                <Users className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">{Number(overviewStats.total_guests || 0).toLocaleString()}</div>
                            <div className="text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold mt-1">Invited guests</div>
                        </div>
                    </div>

                    {/* Confirmed RSVPs */}
                    <div className="group rounded-2xl p-4 bg-white dark:bg-[#0B1524] border border-slate-200/80 dark:border-white/[0.08] shadow-xs hover:shadow-card hover:border-cyan-500/40 dark:hover:border-cyan-500/40 transition-all duration-200 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">Attending</span>
                            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 dark:bg-cyan-500/15 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center transition-colors">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">{Number(overviewStats.total_will_attend || 0).toLocaleString()}</div>
                            <div className="text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold mt-1">{overviewStats.overall_attendance_rate || 0}% confirmed</div>
                        </div>
                    </div>

                    {/* Admitted at Gate */}
                    <div className="group rounded-2xl p-4 bg-white dark:bg-[#0B1524] border border-slate-200/80 dark:border-white/[0.08] shadow-xs hover:shadow-card hover:border-cyan-500/40 dark:hover:border-cyan-500/40 transition-all duration-200 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">Checked In</span>
                            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 dark:bg-cyan-500/15 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center transition-colors">
                                <CheckCheck className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">{Number(overviewStats.total_checkins || 0).toLocaleString()}</div>
                            <div className="text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold mt-1">Gate entries</div>
                        </div>
                    </div>

                    {/* Passes Dispatched */}
                    <div className="group rounded-2xl p-4 bg-white dark:bg-[#0B1524] border border-slate-200/80 dark:border-white/[0.08] shadow-xs hover:shadow-card hover:border-cyan-500/40 dark:hover:border-cyan-500/40 transition-all duration-200 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">Passes Sent</span>
                            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 dark:bg-cyan-500/15 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center transition-colors">
                                <Send className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">{Number(overviewStats.total_messages || 0).toLocaleString()}</div>
                            <div className="text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold mt-1">Dispatched</div>
                        </div>
                    </div>

                    {/* Message Quota */}
                    <div className="group rounded-2xl p-4 bg-white dark:bg-[#0B1524] border border-slate-200/80 dark:border-white/[0.08] shadow-xs hover:shadow-card hover:border-cyan-500/40 dark:hover:border-cyan-500/40 transition-all duration-200 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">Quota</span>
                            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 dark:bg-cyan-500/15 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center transition-colors">
                                <Zap className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                                {isUnrestrictedQuota ? '∞' : (quota.whatsapp_remaining ?? '1,000')}
                            </div>
                            <div className="text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold mt-1">
                                {isUnrestrictedQuota ? 'Unlimited balance' : `${quota.whatsapp_used || 0} sent`}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. MAIN DASHBOARD CONTENT GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* LEFT COLUMN: EVENTS & SCAN TELEMETRY (8 COLS) */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* Active Events Section */}
                        <div className="rounded-2xl bg-white dark:bg-[#0B1524] border border-slate-200/90 dark:border-white/[0.08] p-5 sm:p-6 shadow-xs">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/[0.06]">
                                <div>
                                    <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                                        <span>Your Events</span>
                                    </h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        Active event campaigns and guest tallies.
                                    </p>
                                </div>
                                <Link
                                    href={route('events.index')}
                                    className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center gap-1 group"
                                >
                                    <span>View All ({events.length})</span>
                                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                                </Link>
                            </div>

                            <div className="mt-4 space-y-3">
                                {events.length === 0 ? (
                                    <div className="text-center py-12 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/[0.08]">
                                        <Calendar className="w-10 h-10 text-slate-400 mx-auto mb-3 opacity-50" />
                                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No events yet</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                                            Create your first event to start generating personalized guest passes.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => setCreateModalOpen(true)}
                                            className="px-4 py-2 rounded-xl bg-kardovo-navy hover:bg-slate-900 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                                        >
                                            <Plus className="w-3.5 h-3.5 text-cyan-400" />
                                            <span>Create Event</span>
                                        </button>
                                    </div>
                                ) : (
                                    events.slice(0, 4).map((event) => {
                                        const total = event.total_guests || 0;
                                        const attending = event.will_attend_count || 0;
                                        const checkins = event.checkins_count || 0;
                                        const attendPct = total > 0 ? Math.round((attending / total) * 100) : 0;
                                        const checkinPct = total > 0 ? Math.round((checkins / total) * 100) : 0;
                                        const formattedDate = event.event_date ? new Date(event.event_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date TBD';

                                        return (
                                            <div 
                                                key={event.id}
                                                className="p-4 rounded-xl bg-slate-50/70 dark:bg-white/[0.03] hover:bg-slate-100/70 dark:hover:bg-white/[0.05] border border-slate-200/80 dark:border-white/[0.06] transition duration-150"
                                            >
                                                {/* Header: Type, Date, Title & Action */}
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className="px-2 py-0.5 rounded-md bg-white dark:bg-white/[0.08] text-slate-700 dark:text-slate-300 font-mono text-[10px] font-bold uppercase tracking-wider border border-slate-200 dark:border-white/[0.1] shadow-2xs">
                                                                {event.event_type || 'Event'}
                                                            </span>
                                                            <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                                                                <Clock className="w-3 h-3 text-slate-400" />
                                                                <span>{formattedDate}</span>
                                                            </span>
                                                        </div>

                                                        <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1.5 truncate">
                                                            <Link href={route('events.show', event.id)} className="hover:text-cyan-600 dark:hover:text-cyan-400 transition">
                                                                {event.title}
                                                            </Link>
                                                        </h3>

                                                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                                                            <MapPin className="w-3 h-3 flex-shrink-0 text-slate-400" />
                                                            <span className="truncate">{event.venue || event.city || 'Dar es Salaam'}</span>
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex items-center gap-2 flex-shrink-0">
                                                        <Link
                                                            href={route('events.show', event.id)}
                                                            className="px-3 py-1.5 rounded-lg bg-white dark:bg-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/[0.14] border border-slate-200 dark:border-white/[0.1] text-slate-700 dark:text-slate-200 font-bold text-xs shadow-2xs transition"
                                                        >
                                                            Manage
                                                        </Link>
                                                        <Link
                                                            href={route('messaging.index', { event_id: event.id })}
                                                            className="p-1.5 rounded-lg bg-white dark:bg-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/[0.14] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/[0.1] shadow-2xs transition"
                                                            title="Send Passes"
                                                        >
                                                            <Send className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                                                        </Link>
                                                    </div>
                                                </div>

                                                {/* Stats Pills Grid */}
                                                <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-white/[0.04] grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                                    <div className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.06] flex items-center justify-between">
                                                        <span className="text-[11px] text-slate-500 dark:text-slate-400">Guests</span>
                                                        <span className="font-mono font-bold text-slate-900 dark:text-white">{total}</span>
                                                    </div>
                                                    <div className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.06] flex items-center justify-between">
                                                        <span className="text-[11px] text-slate-500 dark:text-slate-400">Attending</span>
                                                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{attending} <span className="text-[10px] text-slate-400 font-normal">({attendPct}%)</span></span>
                                                    </div>
                                                    <div className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.06] flex items-center justify-between">
                                                        <span className="text-[11px] text-slate-500 dark:text-slate-400">Admitted</span>
                                                        <span className="font-mono font-bold text-teal-600 dark:text-teal-400">{checkins} <span className="text-[10px] text-slate-400 font-normal">({checkinPct}%)</span></span>
                                                    </div>
                                                    <div className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.06] flex items-center justify-between overflow-hidden">
                                                        <span className="text-[11px] text-slate-500 dark:text-slate-400 flex-shrink-0">Template</span>
                                                        <span className="font-medium text-slate-700 dark:text-slate-300 text-[11px] truncate ml-1.5" title={event.card_template?.name || 'Standard Pass'}>
                                                            {event.card_template?.name || 'Standard Pass'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Live Gate Check-in Telemetry Feed */}
                        <div className="rounded-2xl bg-white dark:bg-[#0B1524] border border-slate-200/90 dark:border-white/[0.08] p-5 sm:p-6 shadow-xs">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/[0.06]">
                                <div>
                                    <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                                        <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                        <span>Recent Gate Activity</span>
                                    </h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        Latest scanner admissions across your events.
                                    </p>
                                </div>
                                <Link
                                    href={route('scanner.index')}
                                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1 group"
                                >
                                    <span>Open Scanner</span>
                                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                                </Link>
                            </div>

                            <div className="mt-4">
                                {recentScanLogs.length === 0 ? (
                                    <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs">
                                        No recent scan logs yet. Scanned passes will appear here in real time.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-slate-100 dark:border-white/[0.06] text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                                                    <th className="pb-2.5 font-bold">Guest Attendee</th>
                                                    <th className="pb-2.5 font-bold">Event</th>
                                                    <th className="pb-2.5 font-bold">Status</th>
                                                    <th className="pb-2.5 font-bold">Gate Terminal</th>
                                                    <th className="pb-2.5 font-bold text-right">Time</th>
                                                    <th className="pb-2.5 font-bold text-center w-10">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04] text-xs">
                                                {recentScanLogs.map((log) => {
                                                    const isGranted = log.status === 'granted';
                                                    return (
                                                        <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition">
                                                            <td className="py-2.5 font-bold text-slate-900 dark:text-white">
                                                                {log.guest?.name || 'Guest Pass Holder'}
                                                            </td>
                                                            <td className="py-2.5 text-slate-600 dark:text-slate-300 truncate max-w-[140px]">
                                                                {log.event?.title || 'Event'}
                                                            </td>
                                                            <td className="py-2.5">
                                                                <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                                                                    isGranted
                                                                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                                                                        : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20'
                                                                }`}>
                                                                    {isGranted ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                                    <span>{isGranted ? 'GRANTED' : 'REJECTED'}</span>
                                                                </span>
                                                            </td>
                                                            <td className="py-2.5 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                                                                {log.gate_label || 'Gate 1 — Main VIP Entrance'}
                                                            </td>
                                                            <td className="py-2.5 text-right text-slate-400 dark:text-slate-500 font-mono text-[10.5px]">
                                                                {log.scanned_at ? new Date(log.scanned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                                                            </td>
                                                            <td className="py-2.5 text-center">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDeleteScanLog(log)}
                                                                    className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition active:scale-95 cursor-pointer"
                                                                    title="Delete scan record"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: QUICK TOOLS & RSVP (4 COLS) */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* RSVP Response Telemetry Card */}
                        <div className="rounded-2xl bg-white dark:bg-[#0B1524] border border-slate-200/90 dark:border-white/[0.08] p-5 shadow-xs">
                            <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                                <span>RSVP Status</span>
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Overall guest responses.
                            </p>

                            <div className="mt-4 space-y-3">
                                {/* Attending */}
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-1">
                                        <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                            <span>Attending</span>
                                        </span>
                                        <span className="text-slate-900 dark:text-white font-mono">
                                            {overviewStats.total_will_attend || 0} ({overviewStats.overall_attendance_rate || 0}%)
                                        </span>
                                    </div>
                                    <div className="h-2 rounded-full bg-slate-100 dark:bg-white/[0.06] overflow-hidden">
                                        <div 
                                            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                                            style={{ width: `${Math.min(overviewStats.overall_attendance_rate || 0, 100)}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Pending */}
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-1">
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
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-1">
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
                        </div>

                        {/* Quick Tools */}
                        <div className="rounded-2xl bg-white dark:bg-[#0B1524] border border-slate-200/90 dark:border-white/[0.08] p-5 shadow-xs space-y-3">
                            <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <Zap className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                                <span>Quick Tools</span>
                            </h2>

                            <Link
                                href={route('templates.index')}
                                className="group p-3 rounded-xl bg-slate-50/80 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-slate-200/70 dark:border-white/[0.06] flex items-center justify-between transition block"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center group-hover:scale-105 transition">
                                        <Palette className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-900 dark:text-white">4K Pass Studio</div>
                                        <div className="text-[11px] text-slate-500 dark:text-slate-400">Design custom pass templates</div>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition" />
                            </Link>

                            <Link
                                href={route('messaging.index')}
                                className="group p-3 rounded-xl bg-slate-50/80 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-slate-200/70 dark:border-white/[0.06] flex items-center justify-between transition block"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition">
                                        <Send className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-900 dark:text-white">Broadcast Passes</div>
                                        <div className="text-[11px] text-slate-500 dark:text-slate-400">WhatsApp & SMS dispatches</div>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition" />
                            </Link>

                            <Link
                                href={route('scanner.index')}
                                className="group p-3 rounded-xl bg-slate-50/80 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-slate-200/70 dark:border-white/[0.06] flex items-center justify-between transition block"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-105 transition">
                                        <QrCode className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-900 dark:text-white">Gate Scanner</div>
                                        <div className="text-[11px] text-slate-500 dark:text-slate-400">Scan passes with mobile camera</div>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition" />
                            </Link>
                        </div>

                        {/* Recent Passes Issued */}
                        <div className="rounded-2xl bg-white dark:bg-[#0B1524] border border-slate-200/90 dark:border-white/[0.08] p-5 shadow-xs">
                            <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <Ticket className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                                <span>Recent Guests</span>
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Latest passes created.
                            </p>

                            <div className="mt-3.5 space-y-2.5">
                                {recentGuests.length === 0 ? (
                                    <div className="text-center py-6 text-slate-400 text-xs">
                                        No guest passes created yet.
                                    </div>
                                ) : (
                                    recentGuests.map((g) => (
                                        <div 
                                            key={g.id}
                                            className="p-2.5 rounded-xl bg-slate-50/60 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.05] flex items-center justify-between gap-2.5"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                                                    {g.name}
                                                </div>
                                                <div className="text-[10.5px] text-slate-400 dark:text-slate-500 truncate">
                                                    {g.event?.title || 'Event'}
                                                </div>
                                            </div>
                                            <span className="inline-flex items-center text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-500/20 whitespace-nowrap flex-shrink-0">
                                                {g.category || 'Double Entry'}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                    </div>
                </div>

            </div>

            {/* ═══════════ CREATE EVENT MODAL ═══════════ */}
            <Modal show={createModalOpen} onClose={() => setCreateModalOpen(false)} maxWidth="md">
                <form onSubmit={handleCreateSubmit} className="p-6">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/[0.08]">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                                <Plus className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">Create New Event</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Launch a new invitation portfolio</p>
                            </div>
                        </div>
                        <button 
                            type="button" 
                            onClick={() => setCreateModalOpen(false)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-sm font-bold p-1 cursor-pointer"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="mt-5 space-y-4">
                        <div>
                            <InputLabel htmlFor="create_title" value="Event Title *" />
                            <TextInput
                                id="create_title"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                className="mt-1 block w-full text-sm"
                                placeholder="e.g. Neema & Baraka — Wedding Reception"
                                required
                            />
                            <InputError message={errors.title} className="mt-1" />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <InputLabel htmlFor="create_type" value="Event Type" />
                                <select
                                    id="create_type"
                                    value={data.event_type}
                                    onChange={(e) => setData('event_type', e.target.value)}
                                    className="mt-1 block w-full text-xs rounded-xl border-slate-300 dark:border-slate-700 dark:bg-[#0B1524] dark:text-white shadow-xs focus:border-cyan-500 focus:ring-cyan-500"
                                >
                                    <option value="Wedding Reception">Wedding Reception</option>
                                    <option value="Send Off Party">Send Off Party</option>
                                    <option value="Engagement">Engagement</option>
                                    <option value="Birthday Gala">Birthday Gala</option>
                                    <option value="Corporate Gala">Corporate Gala</option>
                                    <option value="VIP Concert">VIP Concert</option>
                                    <option value="Alumni Reunion">Alumni Reunion</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <InputLabel htmlFor="create_template" value="Pass Template" />
                                <select
                                    id="create_template"
                                    value={data.card_template_id}
                                    onChange={(e) => setData('card_template_id', e.target.value)}
                                    className="mt-1 block w-full text-xs rounded-xl border-slate-300 dark:border-slate-700 dark:bg-[#0B1524] dark:text-white shadow-xs focus:border-cyan-500 focus:ring-cyan-500"
                                >
                                    <option value="">Default Kardovo Pass</option>
                                    {templates.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <InputLabel htmlFor="create_date" value="Event Date *" />
                                <TextInput
                                    id="create_date"
                                    type="date"
                                    value={data.event_date}
                                    onChange={(e) => setData('event_date', e.target.value)}
                                    className="mt-1 block w-full text-xs"
                                    required
                                />
                                <InputError message={errors.event_date} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="create_time" value="Event Time" />
                                <TextInput
                                    id="create_time"
                                    value={data.event_time}
                                    onChange={(e) => setData('event_time', e.target.value)}
                                    className="mt-1 block w-full text-xs"
                                    placeholder="4:00 PM — Reception & Dinner"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <InputLabel htmlFor="create_venue" value="Venue Name *" />
                                <TextInput
                                    id="create_venue"
                                    value={data.venue}
                                    onChange={(e) => setData('venue', e.target.value)}
                                    className="mt-1 block w-full text-xs"
                                    placeholder="e.g. Kunduchi Beach Gardens"
                                    required
                                />
                                <InputError message={errors.venue} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="create_city" value="City / Location" />
                                <TextInput
                                    id="create_city"
                                    value={data.city}
                                    onChange={(e) => setData('city', e.target.value)}
                                    className="mt-1 block w-full text-xs"
                                    placeholder="Dar es Salaam"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/[0.08] flex items-center justify-end gap-2.5">
                        <SecondaryButton type="button" onClick={() => setCreateModalOpen(false)}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton type="submit" disabled={processing} className="bg-kardovo-navy hover:bg-slate-900">
                            {processing ? 'Creating Event...' : 'Create Event Portfolio'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </KardovoAppLayout>
    );
}
