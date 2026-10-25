import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { 
    Tag, Plus, ExternalLink, MapPin, ChevronRight,
    Search, Receipt, Trash2, Calendar, Users, CheckCircle2,
    Ticket, ArrowRight, Clock, Sparkles
} from 'lucide-react';
import KardovoAppLayout from '@/Layouts/KardovoAppLayout';
import ConfirmationModal from '@/Components/ConfirmationModal';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

const OCCASION_CATEGORIES = [
    { value: 'all', label: 'All Categories' },
    { value: 'concert', label: 'Concert / Live Music' },
    { value: 'event', label: 'Festival / Public Event' },
    { value: 'fashion', label: 'Fashion / Runway Show' },
    { value: 'corporate', label: 'Corporate Event / Summit' },
    { value: 'sports', label: 'Sports / Marathon' },
    { value: 'conference', label: 'Conference / Summit' },
    { value: 'nightlife', label: 'Nightlife / Party' },
    { value: 'hotel', label: 'Resort / Retreat' },
    { value: 'other', label: 'Other Occasion' },
];

export default function TicketingIndex({ occasions = [], globalStats = {}, recentTicketOrders = [], isAdmin = false }) {
    const [activeTab, setActiveTab] = useState('occasions'); // 'occasions' | 'orders'
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showGuide, setShowGuide] = useState(false);

    const [confirmModal, setConfirmModal] = useState({
        show: false,
        title: '',
        message: '',
        warning: '',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger',
        loading: false,
        onConfirm: () => {},
    });

    const today = new Date();
    const todayFormatted = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // Occasion creation form
    const createForm = useForm({
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

    const handleCreateOccasion = (e) => {
        e.preventDefault();
        createForm.post(route('ticketing.occasions.store'), {
            forceFormData: true,
            onSuccess: () => {
                setCreateModalOpen(false);
                createForm.reset();
            },
        });
    };

    const handleDeleteOccasion = (occ) => {
        setConfirmModal({
            show: true,
            title: 'Delete Occasion?',
            message: `Delete "${occ.title}"? All ticket tiers, orders, and scanner check-in records will be permanently removed.`,
            warning: 'This action cannot be undone.',
            confirmText: 'Delete Occasion',
            type: 'danger',
            loading: false,
            onConfirm: () => {
                setConfirmModal(prev => ({ ...prev, loading: true }));
                router.delete(route('events.destroy', occ.id), {
                    onFinish: () => setConfirmModal(prev => ({ ...prev, show: false, loading: false })),
                });
            }
        });
    };

    const filteredOccasions = occasions.filter((occ) => {
        const matchesSearch = !searchQuery.trim() ||
            occ.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            occ.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            occ.venue?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || occ.occasion_type === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const getCategoryDisplay = (type) => {
        const found = OCCASION_CATEGORIES.find(c => c.value === type);
        return found ? found.label : (type ? type.toUpperCase() : 'OCCASION');
    };

    return (
        <KardovoAppLayout
            title="Ticketing Portal"
            headerActions={
                <div className="flex items-center gap-2">
                    <Link
                        href={route('tickets.marketplace')}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-slate-100 hover:text-white bg-white/[0.08] hover:bg-white/[0.15] border border-white/[0.15] text-xs font-semibold transition shadow-2xs active:scale-95 cursor-pointer"
                    >
                        <span>Public Directory</span>
                        <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                    </Link>

                    <button
                        type="button"
                        onClick={() => setCreateModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#154F7C] to-[#327FB5] hover:from-[#1A5C91] hover:to-[#3D8EC7] border border-sky-400/25 rounded-xl shadow-xs shadow-[#154F7C]/20 transition active:scale-95 cursor-pointer"
                    >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>New Occasion</span>
                    </button>
                </div>
            }
        >
            <Head title="Ticketing Portal - Kardovo" />

            <div className="max-w-7xl mx-auto space-y-6">

                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* 1. CALM, MINIMALIST STAT CARDS                                  */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                <section
                    aria-label="Ticketing statistics"
                    className="grid grid-cols-2 lg:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-slate-200/80 dark:border-white/[0.08] bg-slate-200/80 dark:bg-white/[0.08] shadow-xs"
                >
                    <div className="bg-white dark:bg-[#0B1524] p-5">
                        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Occasions</div>
                        <div className="mt-1.5 text-xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums">
                            {(globalStats?.total_occasions ?? occasions.length).toLocaleString()}
                        </div>
                        <div className="mt-1 text-xs text-slate-400 tabular-nums">
                            Active ticketed occasions
                        </div>
                    </div>
                    <div className="bg-white dark:bg-[#0B1524] p-5">
                        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tickets Sold</div>
                        <div className="mt-1.5 text-xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums">
                            {(globalStats?.total_tickets_sold ?? 0).toLocaleString()}
                        </div>
                        <div className="mt-1 text-xs text-slate-400 tabular-nums">
                            {(globalStats?.total_checked_in ?? 0).toLocaleString()} gate verified passes
                        </div>
                    </div>
                    <div className="bg-white dark:bg-[#0B1524] p-5">
                        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Gross Revenue</div>
                        <div className="mt-1.5 text-xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums truncate">
                            TZS {Number(globalStats?.total_revenue ?? 0).toLocaleString()}
                        </div>
                        <div className="mt-1 text-xs text-slate-400 tabular-nums">
                            Total volume collected
                        </div>
                    </div>
                    <div className="bg-white dark:bg-[#0B1524] p-5">
                        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Net Payout (94%)</div>
                        <div className="mt-1.5 text-xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums truncate">
                            TZS {Number(globalStats?.total_organizer_net ?? 0).toLocaleString()}
                        </div>
                        <div className="mt-1 text-xs text-slate-400 tabular-nums">
                            6% Kardovo fee: TZS {Number(globalStats?.total_platform_fee ?? 0).toLocaleString()}
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* 2. TAB SWITCHER (OCCASIONS VS RECENT AUDIT ORDERS)              */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-white/[0.08] pb-3">
                    <button
                        type="button"
                        onClick={() => setActiveTab('occasions')}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition cursor-pointer ${
                            activeTab === 'occasions'
                                ? 'bg-gradient-to-r from-[#154F7C] to-[#327FB5] text-white shadow-xs shadow-[#154F7C]/20 border border-sky-400/25'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-transparent'
                        }`}
                    >
                        <Tag className="w-3.5 h-3.5" />
                        <span>Ticketed Occasions</span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                            activeTab === 'occasions' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-white/[0.08] text-slate-700 dark:text-slate-300'
                        }`}>
                            {occasions.length}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('orders')}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition cursor-pointer ${
                            activeTab === 'orders'
                                ? 'bg-gradient-to-r from-[#154F7C] to-[#327FB5] text-white shadow-xs shadow-[#154F7C]/20 border border-sky-400/25'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-transparent'
                        }`}
                    >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Recent Ticket Orders</span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                            activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-white/[0.08] text-slate-700 dark:text-slate-300'
                        }`}>
                            {recentTicketOrders.length}
                        </span>
                    </button>
                </div>

                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* 3. TAB 1: OCCASIONS DIRECTORY                                   */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                {activeTab === 'occasions' && (
                    <div className="space-y-4 pt-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
                            <div className="flex items-center gap-2">
                                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                                    Occasions Portfolio
                                </h2>
                                <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/[0.06] px-2 py-0.5 rounded-full">
                                    {filteredOccasions.length}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setShowGuide(!showGuide)}
                                    className="text-xs font-semibold text-[#154F7C] dark:text-sky-400 hover:underline inline-flex items-center gap-1 cursor-pointer ml-1"
                                >
                                    <span>{showGuide ? 'Hide guide' : 'How it works'}</span>
                                </button>
                            </div>

                            {/* Search & Category Filter */}
                            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                                <div className="relative flex-1 sm:w-64">
                                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search occasions..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        className="w-full text-xs pl-8 pr-3 py-2 rounded-xl bg-white dark:bg-[#0B1524] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#154F7C] outline-hidden"
                                    />
                                </div>

                                <select
                                    value={selectedCategory}
                                    onChange={e => setSelectedCategory(e.target.value)}
                                    className="text-xs py-2 px-3 rounded-xl bg-white dark:bg-[#0B1524] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
                                >
                                    {OCCASION_CATEGORIES.map(c => (
                                        <option key={c.value} value={c.value}>{c.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* How It Works Explainer Banner */}
                        {showGuide && (
                            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0B1524] border border-slate-200/80 dark:border-white/[0.08] shadow-2xs space-y-3 animate-in fade-in duration-200">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                        How Ticketing Campaigns Work on Kardovo
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => setShowGuide(false)}
                                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs cursor-pointer"
                                    >
                                        ✕
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.05]">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="w-5 h-5 rounded-full bg-[#154F7C] text-white text-[11px] font-bold flex items-center justify-center shrink-0">1</span>
                                            <span className="text-xs font-bold text-slate-900 dark:text-white">Create Tiers & Pricing</span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                                            Configure Regular, VIP, and Early Bird tiers with custom prices in TZS, capacities, and sales windows.
                                        </p>
                                    </div>
                                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.05]">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="w-5 h-5 rounded-full bg-[#154F7C] text-white text-[11px] font-bold flex items-center justify-center shrink-0">2</span>
                                            <span className="text-xs font-bold text-slate-900 dark:text-white">Mobile Money Checkout</span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                                            Buyers pay seamlessly with M-Pesa, Airtel, Tigo, or HaloPesa. Tickets with anti-counterfeit QR passes issue instantly.
                                        </p>
                                    </div>
                                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.05]">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="w-5 h-5 rounded-full bg-[#154F7C] text-white text-[11px] font-bold flex items-center justify-center shrink-0">3</span>
                                            <span className="text-xs font-bold text-slate-900 dark:text-white">Gate Scanner & 94% Net</span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                                            Scan passes at the door with camera or handheld POS hardware. Receive 94% net payout to your bank or mobile wallet.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* OCCASIONS LIST */}
                        {filteredOccasions.length === 0 ? (
                            searchQuery ? (
                                <div className="text-center py-16 bg-white dark:bg-[#0B1524] rounded-2xl border border-dashed border-slate-200 dark:border-white/[0.08] p-8 space-y-3">
                                    <div className="w-12 h-12 mx-auto rounded-xl bg-slate-100 dark:bg-white/[0.05] flex items-center justify-center text-slate-400">
                                        <Tag className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                        No matching occasions found
                                    </h3>
                                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                        Try adjusting your search keywords or filter category.
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-[#0B1524] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-6 sm:p-10 shadow-xs max-w-2xl mx-auto space-y-6 text-center">
                                    <div className="w-12 h-12 mx-auto rounded-2xl bg-sky-50 dark:bg-sky-500/10 text-[#154F7C] dark:text-sky-400 flex items-center justify-center">
                                        <Tag className="w-6 h-6 stroke-[2]" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                            Launch your first ticketed occasion
                                        </h3>
                                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
                                            Kardovo makes ticketing simple, verified, and automated with mobile money checkout and gate verification.
                                        </p>
                                    </div>

                                    <ol className="text-left space-y-4 max-w-md mx-auto">
                                        {[
                                            {
                                                title: '1. Create your occasion',
                                                body: 'Choose category (Concert, Festival, Summit), event title, date, and venue.',
                                            },
                                            {
                                                title: '2. Add ticket tiers & capacity',
                                                body: 'Define pricing in TZS (Regular, VIP, Early Bird) and ticket capacities.',
                                            },
                                            {
                                                title: '3. Collect mobile money & get paid',
                                                body: 'Buyers pay instantly with M-Pesa, Airtel, Tigo & HaloPesa. You receive 94% net payout.',
                                            },
                                        ].map((step, idx) => (
                                            <li key={step.title} className="flex items-start gap-3.5">
                                                <span className="w-7 h-7 rounded-full bg-[#154F7C] text-white text-xs font-bold flex items-center justify-center shrink-0">
                                                    {idx + 1}
                                                </span>
                                                <div>
                                                    <div className="text-sm font-bold text-slate-900 dark:text-white">{step.title}</div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{step.body}</div>
                                                </div>
                                            </li>
                                        ))}
                                    </ol>

                                    <button
                                        type="button"
                                        onClick={() => setCreateModalOpen(true)}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#154F7C] hover:bg-[#114064] text-white text-xs sm:text-sm font-bold transition shadow-xs cursor-pointer active:scale-[0.98]"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>Create Ticketed Occasion</span>
                                    </button>
                                </div>
                            )
                        ) : (
                            /* CALM, ELEGANT LIST ROWS (MATCHING VOTING INDEX & MYEVENTS) */
                            <div className="space-y-2.5">
                                {filteredOccasions.map((occ) => {
                                    const dateToUse = occ.event_date || occ.created_at;
                                    const manageUrl = route('ticketing.index', { event_id: occ.id });
                                    const publicUrl = route('events.publicTickets', occ.id);

                                    return (
                                        <div
                                            key={occ.id}
                                            className="group rounded-2xl bg-white dark:bg-[#0B1524] hover:bg-slate-50/70 dark:hover:bg-[#0d1c33]/90 border border-slate-200/80 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.15] transition-all p-3.5 sm:p-4 text-slate-800 dark:text-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs"
                                        >
                                            {/* Left: Date Tile + Info */}
                                            <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                                {/* Minimalist Date Tile */}
                                                <div className="flex-shrink-0 text-center w-12 sm:w-14 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08]">
                                                    <span className="text-[9.5px] uppercase font-bold text-[#154F7C] dark:text-sky-400 block tracking-wider font-mono">
                                                        {new Date(dateToUse).toLocaleDateString('en-GB', { month: 'short' })}
                                                    </span>
                                                    <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-mono block leading-none my-0.5">
                                                        {new Date(dateToUse).toLocaleDateString('en-GB', { day: 'numeric' })}
                                                    </span>
                                                    <span className="text-[8.5px] text-slate-400 block font-mono">
                                                        {new Date(dateToUse).toLocaleDateString('en-GB', { year: 'numeric' })}
                                                    </span>
                                                </div>

                                                {/* Occasion Title & Context */}
                                                <div className="min-w-0 flex-1 space-y-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[9.5px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
                                                            {getCategoryDisplay(occ.occasion_type)}
                                                        </span>
                                                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${occ.ticketing_enabled ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                                        <span className="text-[10px] text-slate-400 font-medium">
                                                            {occ.ticketing_enabled ? 'Ticketing Active' : 'Paused'}
                                                        </span>
                                                    </div>

                                                    <Link
                                                        href={manageUrl}
                                                        className="text-sm sm:text-base font-bold text-slate-900 dark:text-white hover:text-[#154F7C] dark:hover:text-sky-400 transition block truncate"
                                                    >
                                                        {occ.title}
                                                    </Link>

                                                    <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 flex-wrap">
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="w-3 h-3 text-slate-400" />
                                                            <span className="truncate">{occ.venue || occ.city || 'Tanzania'}</span>
                                                        </span>
                                                        <span>•</span>
                                                        <span>{occ.ticket_tiers_count ?? 0} tiers</span>
                                                        <span>•</span>
                                                        <span>{occ.total_sold ?? 0} / {occ.total_capacity || '∞'} sold</span>
                                                        <span>•</span>
                                                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                                                            TZS {Number(occ.total_revenue || 0).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right: Actions */}
                                            <div className="flex items-center gap-2 self-start md:self-center flex-shrink-0">
                                                <Link
                                                    href={manageUrl}
                                                    className="py-2 px-3.5 rounded-xl bg-[#154F7C] hover:bg-[#124268] text-white font-bold text-xs flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
                                                >
                                                    <span>Manage Portal</span>
                                                    <ChevronRight className="w-3.5 h-3.5" />
                                                </Link>

                                                <a
                                                    href={publicUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="p-2 rounded-xl border border-slate-200 dark:border-white/[0.08] text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.05] transition cursor-pointer"
                                                    title="View Public Storefront"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </a>

                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteOccasion(occ)}
                                                    className="p-2 rounded-xl border border-slate-200 dark:border-white/[0.08] text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                                                    title="Delete Occasion"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* 4. TAB 2: RECENT TICKET ORDERS & AUDIT LEDGER                   */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                {activeTab === 'orders' && (
                    <div className="bg-white dark:bg-[#0B1524] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] overflow-hidden shadow-2xs">
                        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/[0.05] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Receipt className="w-4 h-4 text-[#154F7C] dark:text-sky-400" />
                                    <span>Recent Ticket Orders &amp; Audit Ledger</span>
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Real-time transaction feed with automatic 6% platform fee deduction and host 94% net payout reconciliation.
                                </p>
                            </div>
                            <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/[0.06] px-2.5 py-1 rounded-full self-start sm:self-auto">
                                {recentTicketOrders.length} records
                            </span>
                        </div>

                        {recentTicketOrders.length === 0 ? (
                            <div className="text-center py-16 p-8 space-y-2 text-slate-400 text-xs">
                                <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40 stroke-[1.5]" />
                                <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">No ticket orders recorded yet</p>
                                <p className="text-xs text-slate-400">Transactions processed via mobile money or cards will appear here in real time.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                                    <thead>
                                        <tr className="border-b border-slate-100 dark:border-white/[0.06] bg-slate-50/70 dark:bg-white/[0.02] text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                                            <th className="py-3 px-4">Order #</th>
                                            <th className="py-3 px-4">Date</th>
                                            <th className="py-3 px-4">Occasion</th>
                                            <th className="py-3 px-4">Customer</th>
                                            <th className="py-3 px-4">Tier</th>
                                            <th className="py-3 px-4 text-center">Qty</th>
                                            <th className="py-3 px-4 text-right">Gross (TZS)</th>
                                            <th className="py-3 px-4 text-right">Fee (6%)</th>
                                            <th className="py-3 px-4 text-right">Net (94%)</th>
                                            <th className="py-3 px-4">Channel</th>
                                            <th className="py-3 px-4 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-white/[0.03]">
                                        {recentTicketOrders.map((ord) => (
                                            <tr key={ord.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition">
                                                <td className="py-3 px-4 font-mono font-semibold text-slate-900 dark:text-white text-[11px]">
                                                    {ord.order_number}
                                                </td>
                                                <td className="py-3 px-4 text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                    {ord.created_at}
                                                </td>
                                                <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                                                    <Link
                                                        href={route('ticketing.index', { event_id: ord.event_id })}
                                                        className="hover:text-[#154F7C] dark:hover:text-sky-400 transition"
                                                    >
                                                        {ord.event_title}
                                                    </Link>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="font-semibold text-slate-900 dark:text-white">
                                                        {ord.customer_name}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 font-mono">
                                                        {ord.customer_phone}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="font-medium text-slate-800 dark:text-slate-200">
                                                        {ord.tier_name}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-center font-semibold text-slate-900 dark:text-white tabular-nums">
                                                    {ord.quantity}
                                                </td>
                                                <td className="py-3 px-4 text-right font-medium text-slate-800 dark:text-slate-200 tabular-nums">
                                                    TZS {Number(ord.total_amount || 0).toLocaleString()}
                                                </td>
                                                <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-400 tabular-nums">
                                                    TZS {Number(ord.platform_fee || 0).toLocaleString()}
                                                </td>
                                                <td className="py-3 px-4 text-right font-semibold text-slate-900 dark:text-white tabular-nums">
                                                    TZS {Number(ord.organizer_net_amount || 0).toLocaleString()}
                                                </td>
                                                <td className="py-3 px-4 uppercase text-[10px] font-mono text-slate-500">
                                                    {ord.payment_method}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                                                        ord.payment_status === 'paid'
                                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                                                            : ord.payment_status === 'cancelled'
                                                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                                                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                                                    }`}>
                                                        {ord.payment_status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* CREATE OCCASION MODAL                                           */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <Modal show={createModalOpen} onClose={() => setCreateModalOpen(false)} maxWidth="lg">
                <div className="p-6 space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.08]">
                        <div>
                            <h3 className="text-base font-black text-slate-900 dark:text-white font-display">
                                Launch Ticketed Occasion
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Set up public commercial tickets with instant mobile money checkout.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setCreateModalOpen(false)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs cursor-pointer p-1"
                        >
                            ✕
                        </button>
                    </div>

                    <form onSubmit={handleCreateOccasion} className="space-y-4">
                        <div>
                            <InputLabel htmlFor="create_occ_title" value="Occasion / Event Title *" />
                            <TextInput
                                id="create_occ_title"
                                value={createForm.data.title}
                                onChange={(e) => createForm.setData('title', e.target.value)}
                                className="mt-1 block w-full text-xs"
                                placeholder="e.g. Serengeti Sound Festival 2026"
                                required
                            />
                            <InputError message={createForm.errors.title} className="mt-1" />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <InputLabel htmlFor="create_occ_type" value="Occasion Category *" />
                                <select
                                    id="create_occ_type"
                                    value={createForm.data.occasion_type}
                                    onChange={(e) => createForm.setData('occasion_type', e.target.value)}
                                    className="mt-1 block w-full text-xs rounded-xl border-slate-300 dark:border-white/[0.08] dark:bg-[#0B1524] dark:text-white shadow-xs focus:border-[#154F7C] focus:ring-[#154F7C] cursor-pointer"
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
                                <InputLabel htmlFor="create_occ_date" value="Occasion Date *" />
                                <TextInput
                                    id="create_occ_date"
                                    type="date"
                                    min={todayFormatted}
                                    value={createForm.data.event_date}
                                    onChange={(e) => createForm.setData('event_date', e.target.value)}
                                    className="mt-1 block w-full text-xs"
                                    required
                                />
                                <InputError message={createForm.errors.event_date} className="mt-1" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <InputLabel htmlFor="create_occ_venue" value="Venue / Location *" />
                                <TextInput
                                    id="create_occ_venue"
                                    value={createForm.data.venue}
                                    onChange={(e) => createForm.setData('venue', e.target.value)}
                                    className="mt-1 block w-full text-xs"
                                    placeholder="e.g. Warehouse Arena"
                                    required
                                />
                                <InputError message={createForm.errors.venue} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="create_occ_city" value="City *" />
                                <TextInput
                                    id="create_occ_city"
                                    value={createForm.data.city}
                                    onChange={(e) => createForm.setData('city', e.target.value)}
                                    className="mt-1 block w-full text-xs"
                                    placeholder="Dar es Salaam"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="col-span-2">
                                <InputLabel htmlFor="create_occ_tier" value="Initial Ticket Tier Name" />
                                <TextInput
                                    id="create_occ_tier"
                                    value={createForm.data.initial_tier_name}
                                    onChange={(e) => createForm.setData('initial_tier_name', e.target.value)}
                                    className="mt-1 block w-full text-xs"
                                    placeholder="Standard Admission"
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="create_occ_price" value="Price (TZS)" />
                                <TextInput
                                    id="create_occ_price"
                                    type="number"
                                    min="0"
                                    step="1000"
                                    value={createForm.data.initial_tier_price}
                                    onChange={(e) => createForm.setData('initial_tier_price', e.target.value)}
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
                                disabled={createForm.processing}
                                className="px-4 py-2.5 bg-gradient-to-r from-[#154F7C] to-[#327FB5] hover:from-[#1A5C91] hover:to-[#3D8EC7] border border-sky-400/25 text-white text-xs font-bold rounded-xl transition active:scale-95 cursor-pointer shadow-xs shadow-[#154F7C]/20"
                            >
                                {createForm.processing ? 'Launching...' : 'Launch Ticketed Occasion'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* CONFIRMATION MODAL */}
            <ConfirmationModal
                show={confirmModal.show}
                title={confirmModal.title}
                message={confirmModal.message}
                warning={confirmModal.warning}
                confirmText={confirmModal.confirmText}
                cancelText={confirmModal.cancelText}
                type={confirmModal.type}
                loading={confirmModal.loading}
                onConfirm={confirmModal.onConfirm}
                onClose={() => setConfirmModal(prev => ({ ...prev, show: false }))}
            />
        </KardovoAppLayout>
    );
}
