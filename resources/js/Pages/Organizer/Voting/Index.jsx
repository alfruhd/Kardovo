import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { 
    Trophy, Plus, DollarSign, BarChart3, 
    ExternalLink, MapPin, X, ChevronRight,
    Search, Wallet, Trash2, Receipt
} from 'lucide-react';
import KardovoAppLayout from '@/Layouts/KardovoAppLayout';
import ConfirmationModal from '@/Components/ConfirmationModal';

const COMPETITION_TYPES = [
    'Beauty Pageant',
    'Music & Entertainment Awards',
    'Talent Show Contest',
    'Campus & School Election',
    'Sports & Fitness Awards',
    'Fashion & Modeling Awards',
    'Corporate Gala',
    'Public Opinion Poll',
];

export default function VotingIndex({ competitions = [], stats = {}, recentVoteOrders = [], isAdmin = false }) {
    const [activeTab, setActiveTab] = useState('competitions');
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState('all');
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

    const form = useForm({
        title: '',
        event_type: 'Beauty Pageant',
        city: 'Dar es Salaam',
        description: '',
        voting_start_at: '',
        voting_end_at: '',
        voting_visible_tallies: true,
        voting_instructions: 'Support your favorite nominee. Mobile money payments via M-Pesa, Tigo Pesa, Airtel Money, and HaloPesa are supported.',
        banner: null,
    });

    const submitCreate = (e) => {
        e.preventDefault();
        form.post(route('voting.portal.store'), {
            onSuccess: () => {
                setCreateModalOpen(false);
                form.reset();
            },
        });
    };

    const handleDeleteCompetition = (comp) => {
        setConfirmModal({
            show: true,
            title: 'Delete Competition?',
            message: `Delete "${comp.title}"? All categories, nominees, and vote logs will be removed.`,
            warning: 'This action cannot be undone.',
            confirmText: 'Delete Competition',
            type: 'danger',
            loading: false,
            onConfirm: () => {
                setConfirmModal(prev => ({ ...prev, loading: true }));
                router.delete(route('voting.portal.destroy', comp.id), {
                    onFinish: () => setConfirmModal(prev => ({ ...prev, show: false, loading: false })),
                });
            }
        });
    };

    const filteredCompetitions = competitions.filter((c) => {
        const matchesSearch = c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.event_type?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = selectedType === 'all' || c.event_type === selectedType;
        return matchesSearch && matchesType;
    });

    return (
        <KardovoAppLayout
            title="Voting Portal"
            headerActions={
                <div className="flex items-center gap-2">
                    <Link
                        href={route('voting.index')}
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
                        <span>New Competition</span>
                    </button>
                </div>
            }
        >
            <Head title="Voting Portal - Kardovo" />

            <div className="max-w-7xl mx-auto space-y-6">
                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* 1. CALM, MINIMALIST STAT CARDS                                  */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                <section
                    aria-label="Voting statistics"
                    className="grid grid-cols-2 lg:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-slate-200/80 dark:border-white/[0.08] bg-slate-200/80 dark:bg-white/[0.08] shadow-xs"
                >
                    <div className="bg-white dark:bg-[#0B1524] p-5">
                        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Competitions</div>
                        <div className="mt-1.5 text-xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums">
                            {(stats?.total_competitions ?? competitions.length).toLocaleString()}
                        </div>
                        <div className="mt-1 text-xs text-slate-400 tabular-nums">
                            Active campaigns
                        </div>
                    </div>
                    <div className="bg-white dark:bg-[#0B1524] p-5">
                        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Votes Cast</div>
                        <div className="mt-1.5 text-xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums">
                            {(stats?.total_votes ?? 0).toLocaleString()}
                        </div>
                        <div className="mt-1 text-xs text-slate-400 tabular-nums">
                            Official verified tallies
                        </div>
                    </div>
                    <div className="bg-white dark:bg-[#0B1524] p-5">
                        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Gross Revenue</div>
                        <div className="mt-1.5 text-xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums truncate">
                            TZS {Number(stats?.gross_revenue ?? stats?.total_revenue ?? 0).toLocaleString()}
                        </div>
                        <div className="mt-1 text-xs text-slate-400 tabular-nums">
                            Total volume collected
                        </div>
                    </div>
                    <div className="bg-white dark:bg-[#0B1524] p-5">
                        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Net Payout (94%)</div>
                        <div className="mt-1.5 text-xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums truncate">
                            TZS {Number(stats?.net_revenue ?? 0).toLocaleString()}
                        </div>
                        <div className="mt-1 text-xs text-slate-400 tabular-nums">
                            6% Kardovo fee: TZS {Number(stats?.platform_fees ?? 0).toLocaleString()}
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* 2. TAB SWITCHER (COMPETITIONS VS AUDIT LEDGER)                 */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-white/[0.08] pb-3">
                    <button
                        type="button"
                        onClick={() => setActiveTab('competitions')}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition cursor-pointer ${
                            activeTab === 'competitions'
                                ? 'bg-gradient-to-r from-[#154F7C] to-[#327FB5] text-white shadow-xs shadow-[#154F7C]/20 border border-sky-400/25'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-transparent'
                        }`}
                    >
                        <Trophy className="w-3.5 h-3.5" />
                        <span>Active Competitions</span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                            activeTab === 'competitions' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-white/[0.08] text-slate-700 dark:text-slate-300'
                        }`}>
                            {competitions.length}
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
                        <span>Recent Vote Orders</span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                            activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-white/[0.08] text-slate-700 dark:text-slate-300'
                        }`}>
                            {recentVoteOrders.length}
                        </span>
                    </button>
                </div>

                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* 3. TAB 1: COMPETITIONS DIRECTORY                                */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                {activeTab === 'competitions' && (
                <div className="space-y-4 pt-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                                Competitions Portfolio
                            </h2>
                            <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/[0.06] px-2 py-0.5 rounded-full">
                                {filteredCompetitions.length}
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
                                    placeholder="Search competitions..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full text-xs pl-8 pr-3 py-2 rounded-xl bg-white dark:bg-[#0B1524] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#154F7C] outline-hidden"
                                />
                            </div>

                            <select
                                value={selectedType}
                                onChange={e => setSelectedType(e.target.value)}
                                className="text-xs py-2 px-3 rounded-xl bg-white dark:bg-[#0B1524] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 font-medium"
                            >
                                <option value="all">All Categories</option>
                                {COMPETITION_TYPES.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* How It Works Explainer Banner */}
                    {showGuide && (
                        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0B1524] border border-slate-200/80 dark:border-white/[0.08] shadow-2xs space-y-3 animate-in fade-in duration-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                    How Voting Campaigns Work on Kardovo
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
                                        <span className="text-xs font-bold text-slate-900 dark:text-white">Create & Set Nominees</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                                        Set up award categories, nominee voting codes, photos, and free or paid pricing (e.g. TZS 500/vote).
                                    </p>
                                </div>
                                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.05]">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="w-5 h-5 rounded-full bg-[#154F7C] text-white text-[11px] font-bold flex items-center justify-center shrink-0">2</span>
                                        <span className="text-xs font-bold text-slate-900 dark:text-white">Mobile Money Voting</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                                        Voters cast ballots via public link or QR code with instant M-Pesa, Tigo, Airtel & HaloPesa checkout.
                                    </p>
                                </div>
                                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.05]">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="w-5 h-5 rounded-full bg-[#154F7C] text-white text-[11px] font-bold flex items-center justify-center shrink-0">3</span>
                                        <span className="text-xs font-bold text-slate-900 dark:text-white">Live Tallies & 94% Net</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                                        Votes are verified with fraud protection and tamper-proof ledgers, and you receive 94% net payout.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ═══════════════════════════════════════════════════════════════ */}
                    {/* 3. COMPETITIONS: CLEAN MINIMALIST LIST (MATCHING MYEVENTS.JSX)  */}
                    {/* ═══════════════════════════════════════════════════════════════ */}
                    {filteredCompetitions.length === 0 ? (
                        searchQuery ? (
                            <div className="text-center py-16 bg-white dark:bg-[#0B1524] rounded-2xl border border-dashed border-slate-200 dark:border-white/[0.08] p-8 space-y-3">
                                <div className="w-12 h-12 mx-auto rounded-xl bg-slate-100 dark:bg-white/[0.05] flex items-center justify-center text-slate-400">
                                    <Trophy className="w-6 h-6" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    No matching competitions found
                                </h3>
                                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                    Try adjusting your search keywords or filter option.
                                </p>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-[#0B1524] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-6 sm:p-10 shadow-xs max-w-2xl mx-auto space-y-6 text-center">
                                <div className="w-12 h-12 mx-auto rounded-2xl bg-sky-50 dark:bg-sky-500/10 text-[#154F7C] dark:text-sky-400 flex items-center justify-center">
                                    <Trophy className="w-6 h-6 stroke-[2]" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                        Launch your first voting campaign
                                    </h3>
                                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
                                        Kardovo makes awards, pageants, and talent contests simple, verified, and profitable.
                                    </p>
                                </div>

                                <ol className="text-left space-y-4 max-w-md mx-auto">
                                    {[
                                        {
                                            title: '1. Create your competition',
                                            body: 'Choose category (Awards, Pageant, Elections), title, and campaign dates.',
                                        },
                                        {
                                            title: '2. Add categories & nominees',
                                            body: 'Upload contestant portraits and assign short voting codes (e.g. #01).',
                                        },
                                        {
                                            title: '3. Collect mobile money & get paid',
                                            body: 'Voters pay seamlessly with M-Pesa, Tigo, Airtel & HaloPesa. You receive 94% net payout.',
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
                                    <span>Create Competition</span>
                                </button>
                            </div>
                        )
                    ) : (
                        /* CALM, ELEGANT LIST ROWS (MATCHING MYEVENTS.JSX) */
                        <div className="space-y-2.5">
                            {filteredCompetitions.map((comp) => {
                                const dateToUse = comp.voting_end_at || comp.event_date || comp.created_at;

                                return (
                                    <div
                                        key={comp.id}
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

                                            {/* Competition Title & Context */}
                                            <div className="min-w-0 flex-1 space-y-0.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9.5px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
                                                        {comp.event_type}
                                                    </span>
                                                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${comp.voting_enabled ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                                    <span className="text-[10px] text-slate-400 font-medium">
                                                        {comp.voting_enabled ? 'Active' : 'Paused'}
                                                    </span>
                                                </div>

                                                <Link
                                                    href={route('voting.portal.show', comp.id)}
                                                    className="text-sm sm:text-base font-bold text-slate-900 dark:text-white hover:text-[#154F7C] dark:hover:text-sky-400 transition block truncate"
                                                >
                                                    {comp.title}
                                                </Link>

                                                <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 flex-wrap">
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3 text-slate-400" />
                                                        <span className="truncate">{comp.venue || comp.city || 'Tanzania'}</span>
                                                    </span>
                                                    <span>•</span>
                                                    <span>{comp.voting_categories_count ?? comp.voting_categories?.length ?? 0} categories</span>
                                                    <span>•</span>
                                                    <span>{comp.voting_candidates_count ?? comp.voting_candidates?.length ?? 0} nominees</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Actions */}
                                        <div className="flex items-center gap-2 self-start md:self-center flex-shrink-0">
                                            <Link
                                                href={route('voting.portal.show', comp.id)}
                                                className="py-2 px-3.5 rounded-xl bg-[#154F7C] hover:bg-[#124268] text-white font-bold text-xs flex items-center gap-1.5 transition shadow-2xs"
                                            >
                                                <span>Manage Hub</span>
                                                <ChevronRight className="w-3.5 h-3.5" />
                                            </Link>

                                            <a
                                                href={route('events.publicVoting', comp.id)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-2 rounded-xl border border-slate-200 dark:border-white/[0.08] text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.05] transition"
                                                title="View Public Voting Hub"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </a>

                                            <button
                                                type="button"
                                                onClick={() => handleDeleteCompetition(comp)}
                                                className="p-2 rounded-xl border border-slate-200 dark:border-white/[0.08] text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                                                title="Delete Competition"
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
                {/* 4. TAB 2: AUDIT LEDGER & LIVE VOTE ORDERS                       */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                {activeTab === 'orders' && (
                    <div className="bg-white dark:bg-[#0B1524] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] overflow-hidden shadow-2xs">
                        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/[0.05] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Receipt className="w-4 h-4 text-[#154F7C] dark:text-sky-400" />
                                    <span>Recent Vote Orders &amp; Audit Ledger</span>
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Real-time transaction feed with automatic 6% platform fee deduction and host net payout reconciliation.
                                </p>
                            </div>
                            <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/[0.06] px-2.5 py-1 rounded-full self-start sm:self-auto">
                                {recentVoteOrders.length} records
                            </span>
                        </div>

                        {recentVoteOrders.length === 0 ? (
                            <div className="text-center py-16 p-8 space-y-2 text-slate-400 text-xs">
                                <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40 stroke-[1.5]" />
                                <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">No voter transactions recorded yet</p>
                                <p className="text-xs text-slate-400">Transactions processed via mobile money or cards will appear here in real time.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                                    <thead>
                                        <tr className="border-b border-slate-100 dark:border-white/[0.06] bg-slate-50/70 dark:bg-white/[0.02] text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                                            <th className="py-3 px-4">Order #</th>
                                            <th className="py-3 px-4">Date</th>
                                            <th className="py-3 px-4">Competition</th>
                                            <th className="py-3 px-4">Contestant</th>
                                            <th className="py-3 px-4">Voter</th>
                                            <th className="py-3 px-4 text-center">Votes</th>
                                            <th className="py-3 px-4 text-right">Gross (TZS)</th>
                                            <th className="py-3 px-4 text-right">Fee (6%)</th>
                                            <th className="py-3 px-4 text-right">Net (94%)</th>
                                            <th className="py-3 px-4">Channel</th>
                                            <th className="py-3 px-4 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-white/[0.03]">
                                        {recentVoteOrders.map((vo) => (
                                            <tr key={vo.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition">
                                                <td className="py-3 px-4 font-mono font-semibold text-slate-900 dark:text-white text-[11px]">
                                                    {vo.order_number}
                                                </td>
                                                <td className="py-3 px-4 text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                    {vo.created_at}
                                                </td>
                                                <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                                                    {vo.event_title}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="font-semibold text-slate-900 dark:text-white">
                                                        {vo.candidate_name}
                                                    </span>
                                                    {vo.category_name && (
                                                        <span className="text-[10px] text-slate-400 ml-1">
                                                            ({vo.category_name})
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-[11px] font-mono text-slate-600 dark:text-slate-300">
                                                    {vo.voter_phone}
                                                </td>
                                                <td className="py-3 px-4 text-center font-semibold text-slate-900 dark:text-white tabular-nums">
                                                    {vo.quantity}
                                                </td>
                                                <td className="py-3 px-4 text-right font-medium text-slate-800 dark:text-slate-200 tabular-nums">
                                                    TZS {Number(vo.amount || 0).toLocaleString()}
                                                </td>
                                                <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-400 tabular-nums">
                                                    TZS {Number(vo.platform_fee || 0).toLocaleString()}
                                                </td>
                                                <td className="py-3 px-4 text-right font-semibold text-slate-900 dark:text-white tabular-nums">
                                                    TZS {Number(vo.organizer_net || 0).toLocaleString()}
                                                </td>
                                                <td className="py-3 px-4 font-medium text-[11px] text-slate-500 dark:text-slate-400">
                                                    {vo.provider}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                                        vo.status === 'completed'
                                                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                                                            : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                                                    }`}>
                                                        {vo.status === 'completed' ? 'Paid' : (vo.status || 'Pending')}
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
            {/* CREATE COMPETITION MODAL                                        */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {createModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
                    <div className="w-full max-w-lg bg-white dark:bg-[#0B1524] rounded-2xl p-6 border border-slate-200 dark:border-white/[0.08] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.08]">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                Launch Voting Competition
                            </h3>
                            <button
                                type="button"
                                onClick={() => setCreateModalOpen(false)}
                                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={submitCreate} className="space-y-4 text-xs">
                            <div>
                                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                    Competition Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.data.title}
                                    onChange={e => form.setData('title', e.target.value)}
                                    placeholder="e.g. Tanzania Fashion Awards 2026, Miss Campus Gala"
                                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-white/[0.12] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white focus:ring-2 focus:ring-[#154F7C] outline-hidden"
                                />
                                {form.errors.title && <div className="text-rose-500 mt-1">{form.errors.title}</div>}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                        Category Format
                                    </label>
                                    <select
                                        value={form.data.event_type}
                                        onChange={e => form.setData('event_type', e.target.value)}
                                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-white/[0.12] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white"
                                    >
                                        {COMPETITION_TYPES.map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                        City / Location
                                    </label>
                                    <input
                                        type="text"
                                        value={form.data.city}
                                        onChange={e => form.setData('city', e.target.value)}
                                        placeholder="e.g. Dar es Salaam, Arusha"
                                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-white/[0.12] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                        Voting Opens (Optional)
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={form.data.voting_start_at}
                                        onChange={e => form.setData('voting_start_at', e.target.value)}
                                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-white/[0.12] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                        Voting Closes (Deadline)
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={form.data.voting_end_at}
                                        onChange={e => form.setData('voting_end_at', e.target.value)}
                                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-white/[0.12] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                    Description (Optional)
                                </label>
                                <textarea
                                    rows={2}
                                    value={form.data.description}
                                    onChange={e => form.setData('description', e.target.value)}
                                    placeholder="Brief background about the awards gala or pageant..."
                                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-white/[0.12] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white"
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08]">
                                <div>
                                    <div className="font-bold text-slate-900 dark:text-white">Public Live Tallies</div>
                                    <div className="text-[11px] text-slate-500">Show real-time vote count on contestant cards to voters</div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={form.data.voting_visible_tallies}
                                    onChange={e => form.setData('voting_visible_tallies', e.target.checked)}
                                    className="w-4 h-4 rounded text-[#154F7C] focus:ring-[#154F7C]"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/[0.08]">
                                <button
                                    type="button"
                                    onClick={() => setCreateModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="px-4 py-2 rounded-xl bg-[#154F7C] hover:bg-[#124268] text-white font-bold transition shadow-xs disabled:opacity-50"
                                >
                                    {form.processing ? 'Creating...' : 'Create Competition'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
