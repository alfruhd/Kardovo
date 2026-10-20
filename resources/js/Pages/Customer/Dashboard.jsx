import React, { useState, useMemo } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
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
    CheckCheck, 
    TrendingUp, 
    Zap,
    Sparkles,
    Ticket,
    Search
} from 'lucide-react';

export default function CustomerDashboard({ 
    events = [], 
    overviewStats = {}, 
    templates = [] 
}) {
    const { auth } = usePage().props;
    const user = auth?.user || {};

    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [createType, setCreateType] = useState('invitation'); // 'invitation' | 'occasion'
    const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'invitations' | 'occasions'
    const [searchQuery, setSearchQuery] = useState('');

    const today = new Date();
    const todayFormatted = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const greeting = (() => {
        const hour = today.getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    })();

    const firstName = user?.name ? user.name.split(' ')[0] : 'there';
    const isNewUser = events.length === 0;

    // Form: Create Digital Invitation Event
    const invitationForm = useForm({
        title: '',
        event_type: 'Wedding Reception',
        event_date: '',
        event_time: '',
        venue: '',
        city: 'Dar es Salaam',
        description: '',
    });

    // Form: Create Ticketed Occasion
    const occasionForm = useForm({
        title: '',
        occasion_type: 'concert',
        event_date: '',
        event_time: '',
        venue: '',
        city: 'Dar es Salaam',
        description: '',
        ticket_currency: 'TZS',
        initial_tier_name: 'Standard Admission',
        initial_tier_price: 25000,
        initial_tier_capacity: 100,
        is_public: true,
    });

    const handleCreateInvitationSubmit = (e) => {
        e.preventDefault();
        invitationForm.post(route('events.store'), {
            onSuccess: () => {
                setCreateModalOpen(false);
                invitationForm.reset();
            }
        });
    };

    const handleCreateOccasionSubmit = (e) => {
        e.preventDefault();
        occasionForm.post(route('ticketing.occasions.store'), {
            forceFormData: true,
            onSuccess: () => {
                setCreateModalOpen(false);
                occasionForm.reset();
            }
        });
    };

    const quota = user?.message_quotas || {};
    const isUnrestrictedQuota = user?.is_unrestricted_quota || user?.role === 'admin';

    // Filter events by tab and search
    const filteredEvents = useMemo(() => {
        return events.filter((ev) => {
            const matchesTab = 
                activeFilter === 'all' || 
                (activeFilter === 'invitations' && !ev.is_occasion) || 
                (activeFilter === 'occasions' && ev.is_occasion);

            const matchesSearch = !searchQuery.trim() || 
                ev.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                ev.venue?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                ev.city?.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesTab && matchesSearch;
        });
    }, [events, activeFilter, searchQuery]);

    const openModalWithTab = (tab) => {
        setCreateType(tab);
        setCreateModalOpen(true);
    };

    return (
        <KardovoAppLayout
            title="Organizer Dashboard"
            headerActions={
                <button
                    type="button"
                    onClick={() => setCreateModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#154F7C] to-[#327FB5] hover:from-[#1A5C91] hover:to-[#3D8EC7] border border-sky-400/25 rounded-xl shadow-xs shadow-[#154F7C]/20 transition active:scale-95 cursor-pointer"
                >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create</span>
                </button>
            }
        >
            <Head title="Organizer Dashboard — Kardovo" />

            <div className="max-w-7xl mx-auto space-y-6">

                {/* 1. GREETING */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight">
                            {greeting}, {firstName}
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            Overview of your digital invitations and ticketed occasions.
                        </p>
                    </div>

                    {!isNewUser && (
                        <div className="flex items-center gap-2 flex-wrap text-xs">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 text-sky-800 dark:text-sky-300 border border-sky-500/20 font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                                <span>{overviewStats.invitation_events_count || 0} Invitations</span>
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-white/[0.08] font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                <span>{overviewStats.occasion_events_count || 0} Occasions</span>
                            </span>
                        </div>
                    )}
                </div>

                {/* 2. NEW USER ONBOARDING: DUAL INVITATION & TICKETING INTRO */}
                {isNewUser ? (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Card A: Digital Invitations */}
                            <div className="rounded-3xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0B1524] p-6 sm:p-8 shadow-xs flex flex-col justify-between hover:border-sky-500/40 transition group">
                                <div className="space-y-4">
                                    <div className="w-12 h-12 rounded-2xl bg-sky-500/10 dark:bg-sky-500/15 border border-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shadow-2xs">
                                        <Sparkles className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] uppercase font-bold tracking-wider text-sky-600 dark:text-sky-400">Personal & Private</div>
                                        <h3 className="text-lg font-black text-slate-900 dark:text-white font-display mt-0.5">Digital Invitations & RSVPs</h3>
                                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                                             Craft bespoke animated invitation cards, upload guest lists, track attendance with real-time RSVPs, and distribute passes via WhatsApp & SMS.
                                        </p>
                                    </div>
                                </div>
                                <div className="pt-6">
                                    <button
                                        type="button"
                                        onClick={() => openModalWithTab('invitation')}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#154F7C] to-[#327FB5] hover:from-[#1A5C91] hover:to-[#3D8EC7] border border-sky-400/25 text-white text-xs font-bold transition active:scale-95 cursor-pointer shadow-xs shadow-[#154F7C]/20"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>Create Digital Invitation</span>
                                    </button>
                                </div>
                            </div>

                            {/* Card B: Ticketed Occasions */}
                            <div className="rounded-3xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0B1524] p-6 sm:p-8 shadow-xs flex flex-col justify-between hover:border-sky-500/40 transition group">
                                <div className="space-y-4">
                                    <div className="w-12 h-12 rounded-2xl bg-sky-500/10 dark:bg-sky-500/15 border border-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shadow-2xs">
                                        <Ticket className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] uppercase font-bold tracking-wider text-sky-600 dark:text-sky-400">Public & Commercial</div>
                                        <h3 className="text-lg font-black text-slate-900 dark:text-white font-display mt-0.5">Ticketed Occasions & Sales</h3>
                                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                                             Launch ticket sales for concerts, summits, festivals, or sports. Accept Mobile Money (M-Pesa, Airtel, Tigo), issue passes, and verify at the gate.
                                        </p>
                                    </div>
                                </div>
                                <div className="pt-6">
                                    <button
                                        type="button"
                                        onClick={() => openModalWithTab('occasion')}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#154F7C] to-[#327FB5] hover:from-[#1A5C91] hover:to-[#3D8EC7] border border-sky-400/25 text-white text-xs font-bold transition active:scale-95 cursor-pointer shadow-xs shadow-[#154F7C]/20"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>Launch Ticketed Occasion</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-5 animate-fadeIn">

                        {/* STATS STRIP — 4 key numbers in one quiet row */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-200/60 dark:bg-white/[0.06] rounded-2xl overflow-hidden border border-slate-200/60 dark:border-white/[0.06]">
                            {[
                                {
                                    label: 'Events',
                                    value: overviewStats.total_events || 0,
                                    sub: `${overviewStats.invitation_events_count || 0} inv · ${overviewStats.occasion_events_count || 0} occ`,
                                },
                                {
                                    label: 'Attending',
                                    value: Number(overviewStats.total_will_attend || 0).toLocaleString(),
                                    sub: `${overviewStats.overall_attendance_rate || 0}% rate`,
                                    accent: true,
                                },
                                {
                                    label: 'Tickets Sold',
                                    value: Number(overviewStats.total_tickets_sold || 0).toLocaleString(),
                                    sub: `TZS ${Number(overviewStats.total_ticket_revenue || 0).toLocaleString()}`,
                                },
                                {
                                    label: 'Gate Verified',
                                    value: Number(overviewStats.total_checkins || 0).toLocaleString(),
                                    sub: `${overviewStats.overall_checkin_rate || 0}% entry`,
                                },
                            ].map(({ label, value, sub, accent }) => (
                                <div key={label} className="bg-white dark:bg-[#0B1524] px-3.5 sm:px-5 py-3 sm:py-4 min-w-0">
                                    <div className="text-[9.5px] sm:text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 truncate">{label}</div>
                                    <div className={`text-lg sm:text-xl font-black font-mono mt-0.5 sm:mt-1 truncate ${accent ? 'text-[#154F7C] dark:text-sky-400' : 'text-slate-900 dark:text-white'}`}>{value}</div>
                                    <div className="text-[9.5px] sm:text-[10px] text-slate-400 mt-0.5 truncate">{sub}</div>
                                </div>
                            ))}
                        </div>

                        {/* MAIN: events list (left) + compact sidebar (right) */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

                            {/* EVENTS LIST */}
                            <div className="lg:col-span-8 bg-white dark:bg-[#0B1524] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] overflow-hidden">

                                {/* List header */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-4 sm:px-5 py-3.5 border-b border-slate-100 dark:border-white/[0.06]">
                                    <div className="flex items-center gap-1 text-xs overflow-x-auto scrollbar-none pb-0.5 -mx-1 px-1 sm:mx-0 sm:px-0">
                                        {[
                                            { key: 'all', label: `All (${events.length})` },
                                            { key: 'invitations', label: `Invitations (${overviewStats.invitation_events_count || 0})` },
                                            { key: 'occasions', label: `Occasions (${overviewStats.occasion_events_count || 0})` },
                                        ].map(({ key, label }) => (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => setActiveFilter(key)}
                                                className={`shrink-0 px-2.5 sm:px-3 py-1 rounded-lg font-bold transition-all cursor-pointer text-xs ${
                                                    activeFilter === key
                                                        ? 'bg-gradient-to-r from-[#154F7C] to-[#327FB5] text-white shadow-xs'
                                                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                                                }`}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="relative w-full sm:w-auto">
                                        <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search…"
                                            className="text-xs pl-7 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.02] text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:border-sky-500 focus:ring-0 w-full sm:w-36"
                                        />
                                    </div>
                                </div>

                                {/* Rows */}
                                {filteredEvents.length === 0 ? (
                                    <div className="py-14 text-center text-sm text-slate-400">No events found.</div>
                                ) : (
                                    <div className="divide-y divide-slate-100 dark:divide-white/[0.05]">
                                        {filteredEvents.map((event) => {
                                            const dateObj = event.event_date ? new Date(event.event_date) : null;
                                            const day   = dateObj ? dateObj.toLocaleDateString('en-GB', { day: 'numeric' }) : '--';
                                            const month = dateObj ? dateObj.toLocaleDateString('en-GB', { month: 'short' }) : '---';
                                            const manageUrl = event.is_occasion
                                                ? route('ticketing.index', { event_id: event.id })
                                                : route('events.show', event.id);

                                            return (
                                                <div key={event.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                                                    {/* Date */}
                                                    <div className="w-10 text-center flex-shrink-0">
                                                        <div className="text-[9px] uppercase font-bold text-[#154F7C] dark:text-sky-400 leading-none">{month}</div>
                                                        <div className="text-base font-black font-mono text-slate-900 dark:text-white leading-tight">{day}</div>
                                                    </div>

                                                    {/* Divider */}
                                                    <div className="w-px h-8 bg-slate-100 dark:bg-white/[0.06] flex-shrink-0" />

                                                    {/* Title */}
                                                    <div className="min-w-0 flex-1">
                                                        <Link
                                                            href={manageUrl}
                                                            className="text-sm font-bold text-slate-900 dark:text-white hover:text-[#154F7C] dark:hover:text-sky-400 transition-colors truncate block"
                                                        >
                                                            {event.title}
                                                        </Link>
                                                        <span className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold">
                                                            {event.is_occasion ? 'Occasion' : 'Invitation'}
                                                        </span>
                                                    </div>

                                                    {/* Action */}
                                                    <Link
                                                        href={manageUrl}
                                                        className="flex-shrink-0 text-xs font-bold text-slate-500 dark:text-slate-400 group-hover:text-[#154F7C] dark:group-hover:text-sky-400 transition-colors"
                                                    >
                                                        Manage →
                                                    </Link>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* COMPACT SIDEBAR */}
                            <div className="lg:col-span-4 space-y-4">

                                {/* RSVP Snapshot */}
                                <div className="bg-white dark:bg-[#0B1524] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-5 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">RSVP Snapshot</span>
                                        <span className="text-xs font-bold text-[#154F7C] dark:text-sky-400">{overviewStats.overall_attendance_rate || 0}%</span>
                                    </div>
                                    {[
                                        { label: 'Attending',    value: overviewStats.total_will_attend || 0,     total: overviewStats.total_guests, color: 'bg-gradient-to-r from-[#154F7C] to-[#327FB5]' },
                                        { label: 'Pending',      value: overviewStats.total_pending_rsvp || 0,    total: overviewStats.total_guests, color: 'bg-amber-400' },
                                        { label: 'Declined',     value: overviewStats.total_will_not_attend || 0, total: overviewStats.total_guests, color: 'bg-slate-300 dark:bg-slate-600' },
                                    ].map(({ label, value, total, color }) => (
                                        <div key={label} className="space-y-1">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-slate-500 dark:text-slate-400 font-medium">{label}</span>
                                                <span className="font-bold font-mono text-slate-900 dark:text-white">{Number(value).toLocaleString()}</span>
                                            </div>
                                            <div className="h-1 rounded-full bg-slate-100 dark:bg-white/[0.06] overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${color} transition-all`}
                                                    style={{ width: total > 0 ? `${Math.min(Math.round((value / total) * 100), 100)}%` : '0%' }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Ticketing Revenue */}
                                <div className="bg-white dark:bg-[#0B1524] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">Ticket Revenue</span>
                                        <Link href={route('ticketing.index')} className="text-[10px] font-bold text-[#154F7C] dark:text-sky-400 hover:underline">
                                            Portal →
                                        </Link>
                                    </div>
                                    <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                                        TZS {Number(overviewStats.total_ticket_revenue || 0).toLocaleString()}
                                    </div>
                                    <div className="text-[10px] text-slate-400 mt-1">
                                        {Number(overviewStats.total_tickets_sold || 0).toLocaleString()} tickets · {overviewStats.total_ticket_checkins || 0} verified
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ═══════════ UNIVERSAL CREATION MODAL ═══════════ */}
            <Modal show={createModalOpen} onClose={() => setCreateModalOpen(false)} maxWidth="lg">
                <div className="p-6 space-y-5">
                    
                    {/* Modal Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/[0.08]">
                        <div>
                            <h3 className="text-base font-black text-slate-900 dark:text-white font-display">
                                Create New Portfolio
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Launch an invitation campaign or public ticketed occasion.
                            </p>
                        </div>
                        
                        {/* Selector Tabs (Kardovo Theme) */}
                        <div className="flex items-center p-1 bg-slate-100 dark:bg-white/[0.06] rounded-xl text-xs font-bold self-start sm:self-auto">
                            <button
                                type="button"
                                onClick={() => setCreateType('invitation')}
                                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                                    createType === 'invitation'
                                        ? 'bg-white dark:bg-white/10 text-[#154F7C] dark:text-sky-400 shadow-2xs font-extrabold'
                                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                                }`}
                            >
                                Digital Invitation
                            </button>
                            <button
                                type="button"
                                onClick={() => setCreateType('occasion')}
                                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                                    createType === 'occasion'
                                        ? 'bg-white dark:bg-white/10 text-[#154F7C] dark:text-sky-400 shadow-2xs font-extrabold'
                                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                                }`}
                            >
                                Ticketed Occasion
                            </button>
                        </div>
                    </div>

                    {/* FORM A: DIGITAL INVITATION */}
                    {createType === 'invitation' && (
                        <form onSubmit={handleCreateInvitationSubmit} className="space-y-4">
                            <div>
                                <InputLabel htmlFor="inv_title" value="Event Title *" />
                                <TextInput
                                    id="inv_title"
                                    value={invitationForm.data.title}
                                    onChange={(e) => invitationForm.setData('title', e.target.value)}
                                    className="mt-1 block w-full text-xs"
                                    placeholder="e.g. Neema & Baraka — Wedding Reception"
                                    required
                                />
                                <InputError message={invitationForm.errors.title} className="mt-1" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <InputLabel htmlFor="inv_type" value="Event Category *" />
                                    <select
                                        id="inv_type"
                                        value={invitationForm.data.event_type}
                                        onChange={(e) => invitationForm.setData('event_type', e.target.value)}
                                        className="mt-1 block w-full text-xs rounded-xl border-slate-300 dark:border-white/[0.08] dark:bg-[#0B1524] dark:text-white shadow-xs focus:border-[#154F7C] dark:focus:border-sky-400 focus:ring-sky-500"
                                    >
                                        <option value="Wedding Reception">Wedding Reception</option>
                                        <option value="Send Off Party">Send Off Party</option>
                                        <option value="Engagement">Engagement</option>
                                        <option value="Birthday Celebration">Birthday Celebration</option>
                                        <option value="Corporate Gala">Corporate Gala</option>
                                        <option value="Private Dinner">Private Dinner</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <InputLabel htmlFor="inv_date" value="Event Date *" />
                                    <TextInput
                                        id="inv_date"
                                        type="date"
                                        min={todayFormatted}
                                        value={invitationForm.data.event_date}
                                        onChange={(e) => invitationForm.setData('event_date', e.target.value)}
                                        className="mt-1 block w-full text-xs"
                                        required
                                    />
                                    <InputError message={invitationForm.errors.event_date} className="mt-1" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <InputLabel htmlFor="inv_time" value="Schedule / Time" />
                                    <TextInput
                                        id="inv_time"
                                        value={invitationForm.data.event_time}
                                        onChange={(e) => invitationForm.setData('event_time', e.target.value)}
                                        className="mt-1 block w-full text-xs"
                                        placeholder="e.g. 4:00 PM — Reception"
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="inv_city" value="City / Location *" />
                                    <TextInput
                                        id="inv_city"
                                        value={invitationForm.data.city}
                                        onChange={(e) => invitationForm.setData('city', e.target.value)}
                                        className="mt-1 block w-full text-xs"
                                        placeholder="Dar es Salaam"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <InputLabel htmlFor="inv_venue" value="Venue Name *" />
                                <TextInput
                                    id="inv_venue"
                                    value={invitationForm.data.venue}
                                    onChange={(e) => invitationForm.setData('venue', e.target.value)}
                                    className="mt-1 block w-full text-xs"
                                    placeholder="e.g. Serena Hotel, Kibo Hall"
                                    required
                                />
                                <InputError message={invitationForm.errors.venue} className="mt-1" />
                            </div>

                            <div className="pt-3 border-t border-slate-100 dark:border-white/[0.08] flex items-center justify-end gap-2.5">
                                <SecondaryButton type="button" onClick={() => setCreateModalOpen(false)}>
                                    Cancel
                                </SecondaryButton>
                                <PrimaryButton type="submit" disabled={invitationForm.processing}>
                                    {invitationForm.processing ? 'Creating...' : 'Create Digital Invitation'}
                                </PrimaryButton>
                            </div>
                        </form>
                    )}

                    {/* FORM B: TICKETED OCCASION (KARDOVO THEME) */}
                    {createType === 'occasion' && (
                        <form onSubmit={handleCreateOccasionSubmit} className="space-y-4">
                            <div>
                                <InputLabel htmlFor="occ_title" value="Occasion / Event Title *" />
                                <TextInput
                                    id="occ_title"
                                    value={occasionForm.data.title}
                                    onChange={(e) => occasionForm.setData('title', e.target.value)}
                                    className="mt-1 block w-full text-xs"
                                    placeholder="e.g. Diamond Platnumz — Wasafi Festival 2026"
                                    required
                                />
                                <InputError message={occasionForm.errors.title} className="mt-1" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <InputLabel htmlFor="occ_type" value="Occasion Category *" />
                                    <select
                                        id="occ_type"
                                        value={occasionForm.data.occasion_type}
                                        onChange={(e) => occasionForm.setData('occasion_type', e.target.value)}
                                        className="mt-1 block w-full text-xs rounded-xl border-slate-300 dark:border-white/[0.08] dark:bg-[#0B1524] dark:text-white shadow-xs focus:border-sky-500 focus:ring-sky-500"
                                    >
                                        <option value="concert">Concert / Live Music</option>
                                        <option value="event">Festival / Public Event</option>
                                        <option value="fashion">Fashion / Runway Show</option>
                                        <option value="corporate">Corporate Event / Summit</option>
                                        <option value="sports">Sports / Marathon</option>
                                        <option value="conference">Conference / Summit</option>
                                        <option value="nightlife">Nightlife / Party</option>
                                        <option value="hotel">Resort / Retreat</option>
                                        <option value="other">Other Occasion</option>
                                    </select>
                                </div>

                                <div>
                                    <InputLabel htmlFor="occ_date" value="Occasion Date *" />
                                    <TextInput
                                        id="occ_date"
                                        type="date"
                                        min={todayFormatted}
                                        value={occasionForm.data.event_date}
                                        onChange={(e) => occasionForm.setData('event_date', e.target.value)}
                                        className="mt-1 block w-full text-xs"
                                        required
                                    />
                                    <InputError message={occasionForm.errors.event_date} className="mt-1" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <InputLabel htmlFor="occ_venue" value="Venue / Gate Location *" />
                                    <TextInput
                                        id="occ_venue"
                                        value={occasionForm.data.venue}
                                        onChange={(e) => occasionForm.setData('venue', e.target.value)}
                                        className="mt-1 block w-full text-xs"
                                        placeholder="e.g. Warehouse Arena"
                                        required
                                    />
                                    <InputError message={occasionForm.errors.venue} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="occ_city" value="City *" />
                                    <TextInput
                                        id="occ_city"
                                        value={occasionForm.data.city}
                                        onChange={(e) => occasionForm.setData('city', e.target.value)}
                                        className="mt-1 block w-full text-xs"
                                        placeholder="Dar es Salaam"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-2">
                                    <InputLabel htmlFor="occ_tier" value="Initial Ticket Tier Name" />
                                    <TextInput
                                        id="occ_tier"
                                        value={occasionForm.data.initial_tier_name}
                                        onChange={(e) => occasionForm.setData('initial_tier_name', e.target.value)}
                                        className="mt-1 block w-full text-xs"
                                        placeholder="e.g. Regular Pass / VIP Admission"
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="occ_price" value="Price (TZS)" />
                                    <TextInput
                                        id="occ_price"
                                        type="number"
                                        min="0"
                                        step="1000"
                                        value={occasionForm.data.initial_tier_price}
                                        onChange={(e) => occasionForm.setData('initial_tier_price', e.target.value)}
                                        className="mt-1 block w-full text-xs"
                                        placeholder="25000"
                                    />
                                </div>
                            </div>

                            <div className="pt-3 border-t border-slate-100 dark:border-white/[0.08] flex items-center justify-end gap-2.5">
                                <SecondaryButton type="button" onClick={() => setCreateModalOpen(false)}>
                                    Cancel
                                </SecondaryButton>
                                <button
                                    type="submit"
                                    disabled={occasionForm.processing}
                                    className="px-4 py-2.5 bg-gradient-to-r from-[#154F7C] to-[#327FB5] hover:from-[#1A5C91] hover:to-[#3D8EC7] border border-sky-400/25 text-white text-xs font-bold rounded-xl transition active:scale-95 cursor-pointer shadow-xs shadow-[#154F7C]/20"
                                >
                                    {occasionForm.processing ? 'Launching...' : 'Launch Ticketed Occasion'}
                                </button>
                            </div>
                        </form>
                    )}

                </div>
            </Modal>

        </KardovoAppLayout>
    );
}
