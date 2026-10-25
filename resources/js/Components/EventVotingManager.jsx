import React, { useState } from 'react';
import { useForm, router, Link } from '@inertiajs/react';
import { 
    Trophy, Users, DollarSign, BarChart3, Plus, Settings, Download, 
    ExternalLink, Copy, Check, Trash2, Edit3, AlertCircle,
    Receipt, CheckCircle2, Clock, X, Wallet, ArrowLeft, Calendar, MapPin, Upload
} from 'lucide-react';

export default function EventVotingManager({ event, votingCategories = [], votingStats = {}, voteOrders = {} }) {
    const [activeTab, setActiveTab] = useState('categories'); // 'categories' | 'orders'
    const [copiedCandidateId, setCopiedCandidateId] = useState(null);
    const [copiedPublicUrl, setCopiedPublicUrl] = useState(false);
    const [activeCategoryModal, setActiveCategoryModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [activeCandidateModal, setActiveCandidateModal] = useState(false);
    const [targetCategoryId, setTargetCategoryId] = useState(null);
    const [editingCandidate, setEditingCandidate] = useState(null);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [votingUpdating, setVotingUpdating] = useState(false);

    // Calculate aggregated numbers
    const totalVotes = Number(votingStats.total_votes ?? votingCategories.reduce((acc, cat) => {
        return acc + (cat.candidates?.reduce((sum, c) => sum + (Number(c.total_votes) || 0), 0) || 0);
    }, 0));

    const totalRevenue = Number(votingStats.gross_revenue ?? votingCategories.reduce((acc, cat) => {
        return acc + (cat.candidates?.reduce((sum, c) => sum + (Number(c.revenue_collected) || 0), 0) || 0);
    }, 0));

    const platformFee = Number(votingStats.platform_fee ?? Math.round(totalRevenue * 0.06));
    const netRevenue = Number(votingStats.net_revenue ?? (totalRevenue - platformFee));

    const totalCandidates = votingCategories.reduce((acc, cat) => {
        return acc + (cat.candidates?.length || 0);
    }, 0);

    const ordersList = voteOrders?.data ?? (Array.isArray(voteOrders) ? voteOrders : []);
    const ordersCount = voteOrders?.total ?? ordersList.length;

    // ── Setup Journey Checklist (Matching TicketingPortal) ───────────────
    const [showFullChecklist, setShowFullChecklist] = useState(false);
    const hasCategories = votingCategories.length > 0;
    const hasNominees = totalCandidates > 0;
    const isVotingLive = Boolean(event.voting_enabled);

    const setupSteps = [
        {
            id: 'categories',
            title: 'Add voting categories',
            description: 'Create award categories such as Best Designer, Model of the Year, or Fan Favorite.',
            doneText: `${votingCategories.length} categor${votingCategories.length === 1 ? 'y' : 'ies'} created`,
            done: hasCategories,
            actionLabel: hasCategories ? 'Manage' : 'Add category',
            disabled: false,
            onAction: () => openAddCategory(),
        },
        {
            id: 'nominees',
            title: 'Add nominees and photos',
            description: hasCategories
                ? 'Register contestants with their voting codes, titles, and campaign portraits.'
                : 'Create at least one category first.',
            doneText: `${totalCandidates} nominee${totalCandidates === 1 ? '' : 's'} registered`,
            done: hasNominees,
            actionLabel: hasNominees ? 'Manage nominees' : 'Add nominee',
            disabled: !hasCategories,
            onAction: () => {
                if (hasCategories) {
                    openAddCandidate(votingCategories[0].id);
                }
            },
        },
        {
            id: 'rules',
            title: 'Configure rules & pricing',
            description: 'Set vote price (e.g. TZS 500), voting instructions, and mobile money rules.',
            doneText: 'Voting rules & mobile money active',
            done: hasCategories && votingCategories.some(c => c.is_paid ? Number(c.vote_price) > 0 : true),
            actionLabel: 'Rules & settings',
            disabled: false,
            onAction: () => setShowSettingsModal(true),
        },
        {
            id: 'launch',
            title: 'Open voting and share your link',
            description: hasNominees
                ? 'Turn voting on, then share your official public link on WhatsApp, Instagram & TikTok.'
                : 'Add nominees before launching public voting.',
            doneText: 'Voting is live and accepting official tallies',
            done: isVotingLive,
            actionLabel: isVotingLive ? 'Share link' : 'Open voting',
            disabled: !hasNominees,
            onAction: () => {
                if (isVotingLive) {
                    const url = `${window.location.origin}/e/${event.id}/voting`;
                    navigator.clipboard.writeText(url);
                    setCopiedPublicUrl(true);
                    setTimeout(() => setCopiedPublicUrl(false), 2000);
                } else {
                    setShowSettingsModal(true);
                }
            },
        },
    ];

    const completedSetupSteps = setupSteps.filter((s) => s.done).length;
    const nextSetupStep = setupSteps.find((s) => !s.done && !s.disabled) || null;
    const isSetupComplete = completedSetupSteps === setupSteps.length;

    // Manual Vote Form
    const [manualVoteModalOpen, setManualVoteModalOpen] = useState(false);
    const manualVoteForm = useForm({
        voting_category_id: '',
        voting_candidate_id: '',
        quantity: 1,
        amount: '',
        payment_method: 'Cash',
        voter_name: '',
        voter_phone: '',
        notes: '',
        record_financial_transaction: true,
    });

    const openManualVoteModal = (cand = null, catId = null) => {
        let initialCatId = catId;
        if (!initialCatId && votingCategories.length > 0) {
            initialCatId = votingCategories[0].id;
        }

        const cat = votingCategories.find(c => c.id === Number(initialCatId));
        let initialCandId = cand ? cand.id : (cat?.candidates?.[0]?.id || '');

        let initialAmount = 0;
        if (cat && cat.is_paid) {
            const tiers = cat.pricing_tiers || [{ quantity: 1, amount: 500 }];
            initialAmount = tiers[0]?.amount || 500;
        }

        manualVoteForm.setData({
            voting_category_id: initialCatId || '',
            voting_candidate_id: initialCandId || '',
            quantity: 1,
            amount: initialAmount,
            payment_method: 'Cash',
            voter_name: '',
            voter_phone: '',
            notes: '',
            record_financial_transaction: true,
        });

        setManualVoteModalOpen(true);
    };

    const handleManualCategoryChange = (newCatId) => {
        const cat = votingCategories.find(c => c.id === Number(newCatId));
        const candId = cat?.candidates?.[0]?.id || '';
        let amt = 0;
        if (cat && cat.is_paid) {
            const tiers = cat.pricing_tiers || [{ quantity: 1, amount: 500 }];
            const qty = manualVoteForm.data.quantity || 1;
            const matchTier = tiers.find(t => Number(t.quantity) === Number(qty));
            if (matchTier) {
                amt = matchTier.amount;
            } else {
                const baseTier = tiers[0] || { quantity: 1, amount: 500 };
                const unit = (Number(baseTier.amount) || 500) / (Number(baseTier.quantity) || 1);
                amt = qty * unit;
            }
        }
        manualVoteForm.setData(data => ({
            ...data,
            voting_category_id: newCatId,
            voting_candidate_id: candId,
            amount: amt,
        }));
    };

    const handleManualQuantityChange = (newQty) => {
        const qty = Math.max(1, parseInt(newQty, 10) || 1);
        const cat = votingCategories.find(c => c.id === Number(manualVoteForm.data.voting_category_id));
        let amt = 0;
        if (cat && cat.is_paid) {
            const tiers = cat.pricing_tiers || [{ quantity: 1, amount: 500 }];
            const matchTier = tiers.find(t => Number(t.quantity) === qty);
            if (matchTier) {
                amt = matchTier.amount;
            } else {
                const baseTier = tiers[0] || { quantity: 1, amount: 500 };
                const unit = (Number(baseTier.amount) || 500) / (Number(baseTier.quantity) || 1);
                amt = qty * unit;
            }
        }
        manualVoteForm.setData(data => ({
            ...data,
            quantity: qty,
            amount: amt,
        }));
    };

    const submitManualVote = (e) => {
        e.preventDefault();
        manualVoteForm.post(route('events.voting.manualVote', event.id), {
            preserveScroll: true,
            onSuccess: () => {
                setManualVoteModalOpen(false);
                manualVoteForm.reset();
            },
        });
    };

    // Category Form
    const categoryForm = useForm({
        name: '',
        description: '',
        is_paid: true,
        max_selections: 1,
        sort_order: 0,
    });

    // Candidate Form
    const candidateForm = useForm({
        name: '',
        candidate_number: '',
        bio: '',
        photo: null,
        sort_order: 0,
    });

    // Settings Form
    const settingsForm = useForm({
        voting_enabled: event.voting_enabled ?? false,
        voting_start_at: event.voting_start_at ? event.voting_start_at.substring(0, 16) : '',
        voting_end_at: event.voting_end_at ? event.voting_end_at.substring(0, 16) : '',
        voting_visible_tallies: event.voting_visible_tallies ?? true,
        voting_instructions: event.voting_instructions ?? '',
    });

    const openAddCategory = () => {
        setEditingCategory(null);
        categoryForm.setData({
            name: '',
            description: '',
            is_paid: true,
            max_selections: 1,
            sort_order: votingCategories.length,
        });
        setActiveCategoryModal(true);
    };

    const openEditCategory = (cat) => {
        setEditingCategory(cat);
        categoryForm.setData({
            name: cat.name,
            description: cat.description || '',
            is_paid: Boolean(cat.is_paid),
            max_selections: cat.max_selections || 1,
            sort_order: cat.sort_order || 0,
        });
        setActiveCategoryModal(true);
    };

    const submitCategory = (e) => {
        e.preventDefault();
        if (editingCategory) {
            categoryForm.put(route('events.votingCategories.update', [event.id, editingCategory.id]), {
                onSuccess: () => setActiveCategoryModal(false),
            });
        } else {
            categoryForm.post(route('events.votingCategories.store', event.id), {
                onSuccess: () => setActiveCategoryModal(false),
            });
        }
    };

    const deleteCategory = (catId) => {
        if (confirm('Are you sure you want to delete this category and all its contestants?')) {
            router.delete(route('events.votingCategories.destroy', [event.id, catId]));
        }
    };

    const openAddCandidate = (catId) => {
        setTargetCategoryId(catId);
        setEditingCandidate(null);
        candidateForm.setData({
            name: '',
            candidate_number: '',
            bio: '',
            photo: null,
            sort_order: 0,
        });
        setActiveCandidateModal(true);
    };

    const openEditCandidate = (cand, catId) => {
        setTargetCategoryId(catId);
        setEditingCandidate(cand);
        candidateForm.setData({
            name: cand.name,
            candidate_number: cand.candidate_number || '',
            bio: cand.bio || '',
            photo: null,
            sort_order: cand.sort_order || 0,
        });
        setActiveCandidateModal(true);
    };

    const submitCandidate = (e) => {
        e.preventDefault();
        if (editingCandidate) {
            candidateForm.post(route('events.votingCandidates.update', [event.id, editingCandidate.id]), {
                _method: 'put',
                onSuccess: () => setActiveCandidateModal(false),
            });
        } else {
            candidateForm.post(route('events.votingCandidates.store', [event.id, targetCategoryId]), {
                onSuccess: () => setActiveCandidateModal(false),
            });
        }
    };

    const deleteCandidate = (candId) => {
        if (confirm('Are you sure you want to remove this contestant?')) {
            router.delete(route('events.votingCandidates.destroy', [event.id, candId]));
        }
    };

    const submitSettings = (e) => {
        e.preventDefault();
        settingsForm.post(route('events.votingSettings', event.id), {
            onSuccess: () => setShowSettingsModal(false),
        });
    };

    const copyCandidateLink = (candId) => {
        const link = window.location.origin + `/vote-for-me/${event.id}/${candId}`;
        navigator.clipboard.writeText(link);
        setCopiedCandidateId(candId);
        setTimeout(() => setCopiedCandidateId(null), 2500);
    };

    const toggleVotingEnabled = () => {
        setVotingUpdating(true);
        router.post(
            route('events.votingSettings', event.id),
            {
                _method: 'put',
                voting_enabled: !event.voting_enabled,
                voting_visible_tallies: event.voting_visible_tallies ?? true,
            },
            {
                preserveScroll: true,
                onFinish: () => setVotingUpdating(false),
            }
        );
    };

    const handleCopyPublicLink = () => {
        const url = `${window.location.origin}/e/${event.id}/voting`;
        navigator.clipboard.writeText(url);
        setCopiedPublicUrl(true);
        setTimeout(() => setCopiedPublicUrl(false), 2000);
    };

    return (
        <div className="space-y-6">
            {/* ══════════════════════════════════════════════════════════════
                NAVIGATION: Back to All Competitions (Voting Landing Page)
               ══════════════════════════════════════════════════════════════ */}
            <div>
                <Link
                    href={route('voting.portal.index')}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#154F7C] dark:text-slate-400 dark:hover:text-sky-400 transition group cursor-pointer"
                >
                    <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                    <span>All Competitions</span>
                </Link>
            </div>

            {/* ══════════════════════════════════════════════════════════════
                COMPETITION HEADER: who, status, and primary actions
               ══════════════════════════════════════════════════════════════ */}
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                <div className="flex items-center gap-4 min-w-0">
                    <button
                        type="button"
                        onClick={() => setShowSettingsModal(true)}
                        aria-label="Change competition poster"
                        title="Change poster"
                        className="relative w-12 h-16 rounded-lg overflow-hidden bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 shrink-0 group cursor-pointer"
                    >
                        {event.voting_banner || event.cover_photo ? (
                            <img
                                src={event.voting_banner || event.cover_photo}
                                alt=""
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Trophy className="w-5 h-5 text-[#154F7C] dark:text-sky-400" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-slate-950/55 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                            <Upload className="w-4 h-4" />
                        </div>
                    </button>

                    <div className="min-w-0 flex-1">
                        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight break-words">
                            {event.title}
                        </h1>

                        <div className="mt-1 flex items-center gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400 flex-wrap">
                            {event.event_type && (
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                                    {event.event_type}
                                </span>
                            )}
                            {(event.voting_end_at || event.event_date) && (
                                <span className="inline-flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <span>
                                        {new Date(event.voting_end_at || event.event_date).toLocaleDateString(undefined, {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                    </span>
                                </span>
                            )}
                            {(event.venue || event.city) && (
                                <span className="inline-flex items-center gap-1.5 min-w-0">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <span className="truncate max-w-[16rem]">
                                        {event.venue || event.city}
                                        {event.venue && event.city ? `, ${event.city}` : ''}
                                    </span>
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="w-full sm:w-auto flex items-center gap-2 flex-wrap shrink-0">
                    <button
                        type="button"
                        role="switch"
                        aria-checked={Boolean(event.voting_enabled)}
                        disabled={votingUpdating}
                        onClick={toggleVotingEnabled}
                        title={event.voting_enabled ? 'Click to close public voting' : 'Click to open public voting'}
                        className="inline-flex items-center justify-center gap-2 pl-2.5 pr-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0B1524] border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.05] transition disabled:opacity-60 cursor-pointer"
                    >
                        <span
                            className={`relative w-8 h-[18px] rounded-full transition-colors shrink-0 ${
                                event.voting_enabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-white/20'
                            }`}
                        >
                            <span
                                className={`absolute top-[2px] left-[2px] w-[14px] h-[14px] rounded-full bg-white shadow transition-transform ${
                                    event.voting_enabled ? 'translate-x-[14px]' : ''
                                }`}
                            />
                        </span>
                        <span>{event.voting_enabled ? 'Voting open' : 'Voting closed'}</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleCopyPublicLink}
                        className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0B1524] border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.05] transition cursor-pointer"
                    >
                        {copiedPublicUrl ? (
                            <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                            <Copy className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <span>{copiedPublicUrl ? 'Copied' : 'Copy link'}</span>
                    </button>

                    <a
                        href={route('events.publicVoting', event.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0B1524] border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.05] transition"
                    >
                        <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>Preview</span>
                    </a>

                    <button
                        type="button"
                        onClick={() => setShowSettingsModal(true)}
                        aria-label="Competition settings"
                        title="Competition settings"
                        className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-slate-500 dark:text-slate-300 bg-white dark:bg-[#0B1524] border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.05] transition cursor-pointer ml-auto sm:ml-0"
                    >
                        <Settings className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* 2. CALM, MINIMALIST STAT CARDS                                  */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <section
                aria-label="Competition statistics"
                className="grid grid-cols-2 lg:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-slate-200/80 dark:border-white/[0.08] bg-slate-200/80 dark:bg-white/[0.08] shadow-xs"
            >
                <div className="bg-white dark:bg-[#0B1524] p-5">
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Votes</div>
                    <div className="mt-1.5 text-xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums">
                        {totalVotes.toLocaleString()}
                    </div>
                    <div className="mt-1 text-xs text-slate-400 tabular-nums">
                        Official verified tallies
                    </div>
                </div>
                <div className="bg-white dark:bg-[#0B1524] p-5">
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Gross Volume</div>
                    <div className="mt-1.5 text-xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums truncate">
                        TZS {totalRevenue.toLocaleString()}
                    </div>
                    <div className="mt-1 text-xs text-slate-400 tabular-nums">
                        Online & manual collection
                    </div>
                </div>
                <div className="bg-white dark:bg-[#0B1524] p-5">
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Net Payout (94%)</div>
                    <div className="mt-1.5 text-xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums truncate">
                        TZS {netRevenue.toLocaleString()}
                    </div>
                    <div className="mt-1 text-xs text-slate-400 tabular-nums">
                        6% Kardovo fee: TZS {platformFee.toLocaleString()}
                    </div>
                </div>
                <div className="bg-white dark:bg-[#0B1524] p-5">
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Structure</div>
                    <div className="mt-1.5 text-xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums truncate">
                        {votingCategories.length} Categories
                    </div>
                    <div className="mt-1 text-xs text-slate-400 tabular-nums">
                        {totalCandidates} registered nominees
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* 2.5 SETUP JOURNEY CHECKLIST (MATCHING TICKETINGPORTAL)          */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {!isSetupComplete || showFullChecklist ? (
                <section className="bg-white dark:bg-[#0B1524] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs overflow-hidden">
                    <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-white/[0.08]">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                                    {isVotingLive ? 'Finish campaign setup' : 'Get ready to accept votes'}
                                </h2>
                                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                    Complete these {setupSteps.length} steps to launch your official voting campaign.
                                </p>
                            </div>
                            {isSetupComplete && (
                                <button
                                    type="button"
                                    onClick={() => setShowFullChecklist(false)}
                                    className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 self-start sm:self-center cursor-pointer"
                                >
                                    Hide checklist
                                </button>
                            )}
                        </div>

                        <div className="mt-4 flex items-center gap-3">
                            <div
                                className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-white/[0.08] overflow-hidden"
                                role="progressbar"
                                aria-valuemin={0}
                                aria-valuemax={setupSteps.length}
                                aria-valuenow={completedSetupSteps}
                            >
                                <div
                                    className="h-full bg-[#154F7C] dark:bg-sky-400 rounded-full transition-all duration-300"
                                    style={{ width: `${(completedSetupSteps / setupSteps.length) * 100}%` }}
                                />
                            </div>
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
                                {completedSetupSteps} of {setupSteps.length} done
                            </span>
                        </div>
                    </div>

                    <ol className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                        {setupSteps.map((step, index) => {
                            const isNext = nextSetupStep?.id === step.id;
                            return (
                                <li
                                    key={step.id}
                                    className={`px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 transition-colors ${
                                        isNext ? 'bg-sky-50/50 dark:bg-sky-500/[0.05]' : ''
                                    }`}
                                >
                                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                                        <span
                                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-bold flex items-center justify-center shrink-0 ${
                                                step.done
                                                    ? 'bg-emerald-500 text-white'
                                                    : isNext
                                                    ? 'bg-[#154F7C] text-white shadow-xs'
                                                    : 'bg-slate-100 dark:bg-white/[0.08] text-slate-500 dark:text-slate-400'
                                            }`}
                                        >
                                            {step.done ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" /> : index + 1}
                                        </span>
                                        <div className="min-w-0">
                                            <div className="text-sm font-bold text-slate-900 dark:text-white">
                                                {step.title}
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                {step.done ? step.doneText : step.description}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        disabled={step.disabled}
                                        onClick={step.onAction}
                                        className={`sm:w-36 shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
                                            isNext
                                                ? 'bg-[#154F7C] hover:bg-[#114064] text-white shadow-xs'
                                                : 'bg-white dark:bg-[#111D30] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10'
                                        }`}
                                    >
                                        {step.actionLabel}
                                    </button>
                                </li>
                            );
                        })}
                    </ol>

                    <div className="px-5 sm:px-6 py-3 bg-slate-50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <p>
                            <span className="font-semibold text-slate-700 dark:text-slate-200">Kardovo 94% Net:</span>{' '}
                            Voters pay instantly with M-Pesa, Tigo, Airtel & HaloPesa. You receive 94% net payout with official verified tallies.
                        </p>
                        <a
                            href={`/e/${event.id}/voting`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 font-bold text-[#154F7C] dark:text-sky-400 hover:underline shrink-0"
                        >
                            <span>Preview Public Page</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                    </div>
                </section>
            ) : (
                <div className="bg-white dark:bg-[#0B1524] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                            <Check className="w-4 h-4 stroke-[2.5]" />
                        </span>
                        <div>
                            <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span>Campaign setup complete</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400">
                                    {isVotingLive ? 'Live & Accepting Votes' : 'Setup Ready'}
                                </span>
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Official voting link: <span className="font-mono text-[#154F7C] dark:text-sky-400">/e/{event.id}/voting</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-center">
                        <button
                            type="button"
                            onClick={() => setShowFullChecklist(true)}
                            className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-semibold px-2 py-1.5 cursor-pointer"
                        >
                            View checklist
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                const url = `${window.location.origin}/e/${event.id}/voting`;
                                navigator.clipboard.writeText(url);
                                setCopiedPublicUrl(true);
                                setTimeout(() => setCopiedPublicUrl(false), 2000);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-bold text-slate-700 dark:text-slate-200 transition cursor-pointer"
                        >
                            {copiedPublicUrl ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 opacity-60" />}
                            <span>{copiedPublicUrl ? 'Copied' : 'Share Link'}</span>
                        </button>
                        <a
                            href={`/e/${event.id}/voting`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#154F7C] hover:bg-[#114064] text-white text-xs font-bold shadow-xs transition"
                        >
                            <span>View Public Page</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* 3. SECTION TABS SWITCHER                                         */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-white/[0.08] pb-3">
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
                    <button
                        type="button"
                        onClick={() => setActiveTab('categories')}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition cursor-pointer ${
                            activeTab === 'categories'
                                ? 'bg-gradient-to-r from-[#154F7C] to-[#327FB5] text-white shadow-xs shadow-[#154F7C]/20 border border-sky-400/25'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-transparent'
                        }`}
                    >
                        <Trophy className="w-3.5 h-3.5" />
                        <span>Categories & Nominees</span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                            activeTab === 'categories' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-white/[0.08] text-slate-700 dark:text-slate-300'
                        }`}>
                            {votingCategories.length}
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
                        <span>Audit Ledger & Orders</span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                            activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-white/[0.08] text-slate-700 dark:text-slate-300'
                        }`}>
                            {ordersCount}
                        </span>
                    </button>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                    <button
                        type="button"
                        onClick={() => openManualVoteModal()}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0B1524] border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.05] transition cursor-pointer"
                    >
                        <Plus className="w-3.5 h-3.5 text-slate-500" />
                        <span>Record Vote</span>
                    </button>

                    <button
                        type="button"
                        onClick={openAddCategory}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#154F7C] hover:bg-[#114064] rounded-xl shadow-xs transition active:scale-[0.98] cursor-pointer whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        <span>Add Category</span>
                    </button>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* 4. TAB CONTENT: CATEGORIES & NOMINEES                           */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'categories' && (
                <div>
                    {votingCategories.length === 0 ? (
                        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800">
                            <Trophy className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                            <h4 className="text-base font-bold text-slate-900 dark:text-white">
                                No voting categories configured yet
                            </h4>
                            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                                Add categories like "Best Designer", "Female Model of the Year", or "Fan Favorite" to start accepting votes.
                            </p>
                            <button
                                onClick={openAddCategory}
                                className="px-4 py-2 rounded-xl bg-[#154F7C] text-white text-xs font-bold inline-flex items-center gap-1.5"
                            >
                                <Plus className="w-4 h-4" />
                                Create First Category
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {votingCategories.map((category) => (
                                <div
                                    key={category.id}
                                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] overflow-hidden shadow-2xs"
                                >
                                    {/* Category Header */}
                                    <div className="p-4 sm:px-5 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                                    {category.name}
                                                </h4>
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-400">
                                                    {category.is_paid ? 'Paid Voting' : 'Free Voting'}
                                                </span>
                                            </div>
                                            {category.description && (
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                    {category.description}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-1.5 self-end sm:self-center">
                                            <button
                                                type="button"
                                                onClick={() => openAddCandidate(category.id)}
                                                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition"
                                            >
                                                <Plus className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                                                <span>Add Nominee</span>
                                            </button>
                                            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />
                                            <button
                                                type="button"
                                                onClick={() => openEditCategory(category)}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                                title="Edit Category"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => deleteCategory(category.id)}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                                                title="Delete Category"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Contestants List */}
                                    {(!category.candidates || category.candidates.length === 0) ? (
                                        <div className="p-6 text-center text-xs text-slate-400">
                                            No contestants added to this category yet.
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {category.candidates.map((cand) => (
                                                <div
                                                    key={cand.id}
                                                    className="p-3 sm:px-5 flex items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition group"
                                                >
                                                    {/* Contestant Identity */}
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        {cand.photo_url ? (
                                                            <img
                                                                src={cand.photo_url}
                                                                alt={cand.name}
                                                                className="w-10 h-10 rounded-xl object-cover border border-slate-200/80 dark:border-slate-700 shrink-0"
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 dark:text-slate-400 shrink-0 text-sm">
                                                                {cand.name.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                                                                    #{cand.candidate_number || cand.id}
                                                                </span>
                                                                <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                                                    {cand.name}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Metrics & Actions */}
                                                    <div className="flex items-center gap-3.5 sm:gap-4 shrink-0">
                                                        <div className="text-right shrink-0">
                                                            <div className="text-sm font-semibold text-slate-900 dark:text-white tabular-nums">
                                                                {Number(cand.total_votes || 0).toLocaleString()} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">votes</span>
                                                            </div>
                                                            {category.is_paid && (
                                                                <div className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                                                                    TZS {Number(cand.revenue_collected || 0).toLocaleString()}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

                                                        <div className="flex items-center gap-0.5 sm:gap-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => openManualVoteModal(cand, category.id)}
                                                                className="p-1.5 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-950/40 transition cursor-pointer"
                                                                title="Record manual votes"
                                                            >
                                                                <Plus className="w-4 h-4" />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() => copyCandidateLink(cand.id)}
                                                                className={`p-1.5 rounded-lg transition cursor-pointer ${
                                                                    copiedCandidateId === cand.id
                                                                        ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
                                                                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                                }`}
                                                                title={copiedCandidateId === cand.id ? "Direct voting link copied!" : "Copy direct voting link"}
                                                            >
                                                                {copiedCandidateId === cand.id ? (
                                                                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                                                ) : (
                                                                    <Copy className="w-4 h-4" />
                                                                )}
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() => openEditCandidate(cand, category.id)}
                                                                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                                                                title="Edit nominee"
                                                            >
                                                                <Edit3 className="w-4 h-4" />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() => deleteCandidate(cand.id)}
                                                                className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                                                                title="Delete nominee"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* 5. TAB CONTENT: AUDIT LEDGER & ORDERS                           */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'orders' && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] overflow-hidden shadow-2xs">
                    <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Receipt className="w-4 h-4 text-[#154F7C] dark:text-sky-400" />
                                    <span>Vote Orders & Financial Audit Ledger</span>
                                </h3>
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold">
                                    {ordersCount} entries
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Real-time transaction log with automatic 6% platform fee deduction and organizer net payout reconciliation.
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => openManualVoteModal()}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
                            >
                                <Plus className="w-3.5 h-3.5 text-slate-500" />
                                <span>Record Manual Vote</span>
                            </button>
                            <a
                                href={route('events.voting.exportCsv', event.id)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
                            >
                                <Download className="w-3.5 h-3.5 text-slate-500" />
                                <span>Export CSV</span>
                            </a>
                        </div>
                    </div>

                    {ordersList.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 text-xs">
                            <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40" />
                            <p className="font-medium text-slate-600 dark:text-slate-400">No vote transactions recorded yet</p>
                            <p className="text-[11px] text-slate-400 mt-1">Votes submitted online or recorded manually will appear here in real time.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                        <th className="py-3 px-4">Order / ID</th>
                                        <th className="py-3 px-4">Contestant & Category</th>
                                        <th className="py-3 px-4 text-center">Votes</th>
                                        <th className="py-3 px-4">Channel / Payer</th>
                                        <th className="py-3 px-4 text-right">Gross Amount</th>
                                        <th className="py-3 px-4 text-right">Kardovo Fee (6%)</th>
                                        <th className="py-3 px-4 text-right">Organizer Net (94%)</th>
                                        <th className="py-3 px-4 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {ordersList.map((order) => {
                                        const grossAmt = Number(order.amount || 0);
                                        const fee = Number(order.platform_fee ?? Math.round(grossAmt * 0.06));
                                        const net = Number(order.organizer_net_amount ?? (grossAmt - fee));
                                        const isCompleted = order.status === 'completed';
                                        const isPending = order.status === 'pending';

                                        return (
                                            <tr key={order.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                                                <td className="py-3 px-4 font-mono font-medium text-slate-900 dark:text-white">
                                                    <div>#{order.order_number}</div>
                                                    <div className="text-[10px] font-sans text-slate-400">
                                                        {new Date(order.created_at).toLocaleDateString()} {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="font-bold text-slate-900 dark:text-white">
                                                        {order.candidate?.name || 'Nominee'}
                                                        {order.candidate?.candidate_number && (
                                                            <span className="ml-1.5 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-mono font-bold">
                                                                #{order.candidate.candidate_number}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-[11px] text-slate-500">
                                                        {order.category?.name || 'Category'}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-center font-bold text-slate-800 dark:text-slate-200">
                                                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                                                        +{order.quantity}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase">
                                                            {order.provider || 'AzamPay'}
                                                        </span>
                                                    </div>
                                                    {(order.voter_name || order.voter_phone) && (
                                                        <div className="text-[10px] text-slate-400 mt-0.5">
                                                            {order.voter_name} {order.voter_phone ? `(${order.voter_phone})` : ''}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900 dark:text-white">
                                                    TZS {grossAmt.toLocaleString()}
                                                </td>
                                                <td className="py-3 px-4 text-right font-mono text-slate-500 dark:text-slate-400">
                                                    - TZS {fee.toLocaleString()}
                                                    <span className="ml-1 text-[9px] px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">6%</span>
                                                </td>
                                                <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                                                    TZS {net.toLocaleString()}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    {isCompleted ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            <span>Paid</span>
                                                        </span>
                                                    ) : isPending ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 text-[10px] font-bold">
                                                            <Clock className="w-3 h-3" />
                                                            <span>Pending</span>
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 text-[10px] font-bold">
                                                            <AlertCircle className="w-3 h-3" />
                                                            <span>{order.status}</span>
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {voteOrders?.links && voteOrders.links.length > 3 && (
                        <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                            <span className="text-slate-400 text-[11px]">
                                Showing {voteOrders.from || 0} to {voteOrders.to || 0} of {voteOrders.total || 0} entries
                            </span>
                            <div className="flex items-center gap-1">
                                {voteOrders.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        preserveScroll
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                                            link.active
                                                ? 'bg-[#154F7C] text-white'
                                                : link.url
                                                ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                : 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* 6. MODALS                                                       */}
            {/* ═══════════════════════════════════════════════════════════════ */}

            {/* MODAL: CATEGORY CREATE/EDIT */}
            {activeCategoryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
                    <div className="relative w-full max-w-md max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                {editingCategory ? 'Edit Voting Category' : 'Create Voting Category'}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setActiveCategoryModal(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={submitCategory} className="flex flex-col min-h-0 flex-1 overflow-hidden">
                            <div className="p-4 sm:p-5 space-y-4 text-xs overflow-y-auto flex-1">
                                <div>
                                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                        Category Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={categoryForm.data.name}
                                        onChange={e => categoryForm.setData('name', e.target.value)}
                                        placeholder="e.g. Best Female Model, Song of the Year"
                                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                        Description / Eligibility
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={categoryForm.data.description}
                                        onChange={e => categoryForm.setData('description', e.target.value)}
                                        placeholder="Criteria or rules for nominees..."
                                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                    />
                                </div>

                                <div className="flex items-center gap-3">
                                    <label className="font-bold text-slate-700 dark:text-slate-300">
                                        Voting Type:
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <label className="flex items-center gap-1.5 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="is_paid"
                                                checked={categoryForm.data.is_paid === true}
                                                onChange={() => categoryForm.setData('is_paid', true)}
                                            />
                                            <span>Paid Voting</span>
                                        </label>
                                        <label className="flex items-center gap-1.5 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="is_paid"
                                                checked={categoryForm.data.is_paid === false}
                                                onChange={() => categoryForm.setData('is_paid', false)}
                                            />
                                            <span>Free (1 vote per person)</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="p-3.5 sm:px-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 bg-slate-50/70 dark:bg-slate-850/60 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setActiveCategoryModal(false)}
                                    className="px-3.5 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={categoryForm.processing}
                                    className="px-4 py-2 rounded-xl bg-[#154F7C] text-white font-bold hover:bg-[#124268] transition cursor-pointer shadow-xs active:scale-95"
                                >
                                    Save Category
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: CANDIDATE CREATE/EDIT */}
            {activeCandidateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
                    <div className="relative w-full max-w-md max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                {editingCandidate ? 'Edit Contestant' : 'Add Contestant'}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setActiveCandidateModal(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={submitCandidate} className="flex flex-col min-h-0 flex-1 overflow-hidden">
                            <div className="p-4 sm:p-5 space-y-4 text-xs overflow-y-auto flex-1">
                                <div>
                                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                        Full Name / Stage Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={candidateForm.data.name}
                                        onChange={e => candidateForm.setData('name', e.target.value)}
                                        placeholder="e.g. Vanessa Mdee, John Doe"
                                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                        Contestant Number (Code)
                                    </label>
                                    <input
                                        type="text"
                                        value={candidateForm.data.candidate_number}
                                        onChange={e => candidateForm.setData('candidate_number', e.target.value)}
                                        placeholder="e.g. 01, 14 (Leave empty for auto)"
                                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                        Contestant Photo
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={e => candidateForm.setData('photo', e.target.files[0])}
                                        className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                        Bio / Summary (Optional)
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={candidateForm.data.bio}
                                        onChange={e => candidateForm.setData('bio', e.target.value)}
                                        placeholder="Brief background..."
                                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="p-3.5 sm:px-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 bg-slate-50/70 dark:bg-slate-850/60 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setActiveCandidateModal(false)}
                                    className="px-3.5 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={candidateForm.processing}
                                    className="px-4 py-2 rounded-xl bg-[#154F7C] text-white font-bold hover:bg-[#124268] transition cursor-pointer shadow-xs active:scale-95"
                                >
                                    Save Contestant
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: VOTING SETTINGS */}
            {showSettingsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
                    <div className="relative w-full max-w-lg max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                Voting Competition Settings
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowSettingsModal(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={submitSettings} className="flex flex-col min-h-0 flex-1 overflow-hidden">
                            <div className="p-4 sm:p-5 space-y-4 text-xs overflow-y-auto flex-1">
                                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                                    <div>
                                        <div className="font-bold text-slate-900 dark:text-white">Enable Voting Engine</div>
                                        <div className="text-slate-500">Allow public visitors to view candidates and cast votes</div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={settingsForm.data.voting_enabled}
                                        onChange={e => settingsForm.setData('voting_enabled', e.target.checked)}
                                        className="w-4 h-4 rounded text-[#154F7C] focus:ring-[#154F7C] cursor-pointer"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                            Voting Starts At
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={settingsForm.data.voting_start_at}
                                            onChange={e => settingsForm.setData('voting_start_at', e.target.value)}
                                            className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                            Voting Closes At
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={settingsForm.data.voting_end_at}
                                            onChange={e => settingsForm.setData('voting_end_at', e.target.value)}
                                            className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                                    <div>
                                        <div className="font-bold text-slate-900 dark:text-white">Display Live Tallies</div>
                                        <div className="text-slate-500">Show real-time vote count on nominee cards to the public</div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={settingsForm.data.voting_visible_tallies}
                                        onChange={e => settingsForm.setData('voting_visible_tallies', e.target.checked)}
                                        className="w-4 h-4 rounded text-[#154F7C] focus:ring-[#154F7C] cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div className="p-3.5 sm:px-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 bg-slate-50/70 dark:bg-slate-850/60 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setShowSettingsModal(false)}
                                    className="px-3.5 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={settingsForm.processing}
                                    className="px-4 py-2 rounded-xl bg-[#154F7C] text-white font-bold hover:bg-[#124268] transition cursor-pointer shadow-xs active:scale-95"
                                >
                                    Save Settings
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: RECORD MANUAL VOTE / OFFLINE PAYMENT */}
            {manualVoteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
                    <div className="relative w-full max-w-lg max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        {/* Pinned Header */}
                        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Record Manual Vote
                                </h3>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                    Credit votes manually and sync with the financial ledger (6% platform fee applies).
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setManualVoteModalOpen(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Scrollable Form Body */}
                        <form onSubmit={submitManualVote} className="flex flex-col min-h-0 flex-1 overflow-hidden">
                            <div className="p-4 sm:p-5 space-y-4 text-xs overflow-y-auto flex-1">
                                {/* Category select */}
                                <div>
                                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                        Select Category *
                                    </label>
                                    <select
                                        value={manualVoteForm.data.voting_category_id}
                                        onChange={e => handleManualCategoryChange(e.target.value)}
                                        required
                                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                                    >
                                        <option value="">-- Choose Category --</option>
                                        {votingCategories.map(cat => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name} {cat.is_paid ? '(Paid Voting)' : '(Free Voting)'}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Candidate select */}
                                <div>
                                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                        Select Nominee / Contestant *
                                    </label>
                                    <select
                                        value={manualVoteForm.data.voting_candidate_id}
                                        onChange={e => manualVoteForm.setData('voting_candidate_id', e.target.value)}
                                        required
                                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                                    >
                                        <option value="">-- Choose Candidate --</option>
                                        {(() => {
                                            const selectedCat = votingCategories.find(c => c.id === Number(manualVoteForm.data.voting_category_id));
                                            return (selectedCat?.candidates || []).map(cand => (
                                                <option key={cand.id} value={cand.id}>
                                                    #{cand.candidate_number} - {cand.name}
                                                </option>
                                            ));
                                        })()}
                                    </select>
                                </div>

                                {/* Quantity & Amount */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                            Votes Quantity *
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={manualVoteForm.data.quantity}
                                            onChange={e => handleManualQuantityChange(e.target.value)}
                                            required
                                            className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                            Gross Amount (TZS)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={manualVoteForm.data.amount}
                                            onChange={e => manualVoteForm.setData('amount', e.target.value)}
                                            placeholder="0"
                                            className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                </div>

                                {/* Live 6% fee and Net revenue breakdown */}
                                {Number(manualVoteForm.data.amount) > 0 && (
                                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 space-y-1.5">
                                        <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
                                            <span>Gross Collection:</span>
                                            <span className="font-semibold text-slate-900 dark:text-white">
                                                TZS {Number(manualVoteForm.data.amount).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                                            <span>Kardovo Fee (6%):</span>
                                            <span>
                                                - TZS {Math.round(Number(manualVoteForm.data.amount) * 0.06).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-[11px] text-slate-900 dark:text-white font-bold pt-1 border-t border-slate-200/60 dark:border-slate-700">
                                            <span>Organizer Net Payout (94%):</span>
                                            <span>
                                                TZS {Math.round(Number(manualVoteForm.data.amount) * 0.94).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Payment Channel / Method */}
                                <div>
                                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                        Payment Method
                                    </label>
                                    <select
                                        value={manualVoteForm.data.payment_method}
                                        onChange={e => manualVoteForm.setData('payment_method', e.target.value)}
                                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                                    >
                                        <option value="Cash">Cash (Manual Collection)</option>
                                        <option value="Bank Transfer">Bank Transfer (Offline Direct)</option>
                                        <option value="Mobile Money (Offline)">Mobile Money (Offline / Manual)</option>
                                        <option value="Complimentary">Complimentary / Sponsored Vote</option>
                                    </select>
                                </div>

                                {/* Voter info */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                            Voter Name (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={manualVoteForm.data.voter_name}
                                            onChange={e => manualVoteForm.setData('voter_name', e.target.value)}
                                            placeholder="e.g. John Doe"
                                            className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                            Voter Phone (Optional)
                                        </label>
                                        <input
                                            type="tel"
                                            value={manualVoteForm.data.voter_phone}
                                            onChange={e => manualVoteForm.setData('voter_phone', e.target.value)}
                                            placeholder="e.g. 0712345678"
                                            className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                        Reference / Internal Notes (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={manualVoteForm.data.notes}
                                        onChange={e => manualVoteForm.setData('notes', e.target.value)}
                                        placeholder="e.g. Received cash at reception"
                                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                    />
                                </div>

                                {/* Sync with Financial Ledger Checkbox */}
                                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800">
                                    <div>
                                        <div className="font-bold text-slate-900 dark:text-white">Sync with Financial Ledger</div>
                                        <div className="text-[11px] text-slate-500">Record in general ledger and track in platform financial reports</div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={manualVoteForm.data.record_financial_transaction}
                                        onChange={e => manualVoteForm.setData('record_financial_transaction', e.target.checked)}
                                        className="w-4 h-4 rounded text-[#154F7C] focus:ring-[#154F7C] cursor-pointer"
                                    />
                                </div>
                            </div>

                            {/* Pinned Footer */}
                            <div className="p-3.5 sm:px-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 bg-slate-50/70 dark:bg-slate-850/60 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setManualVoteModalOpen(false)}
                                    className="px-3.5 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={manualVoteForm.processing}
                                    className="px-4 py-2 rounded-xl bg-[#154F7C] text-white font-bold hover:bg-[#124268] transition disabled:opacity-50 cursor-pointer shadow-xs active:scale-95"
                                >
                                    {manualVoteForm.processing ? 'Recording...' : 'Record & Credit Vote'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
