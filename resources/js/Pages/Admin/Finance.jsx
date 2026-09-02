import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import KardovoAppLayout from '@/Layouts/KardovoAppLayout';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { 
    CircleDollarSign, 
    TrendingUp, 
    TrendingDown, 
    ArrowUpRight, 
    ArrowDownRight, 
    DollarSign, 
    CreditCard, 
    Calendar, 
    Users, 
    Plus, 
    Download, 
    Filter, 
    Search, 
    Trash2, 
    Sparkles, 
    Layers, 
    ShieldCheck, 
    Server, 
    MessageSquare, 
    CheckCircle2, 
    Clock, 
    AlertTriangle, 
    RefreshCw, 
    PieChart, 
    BarChart3, 
    Wallet, 
    Smartphone, 
    Building2,
    Eye,
    Receipt,
    Check,
    X,
    ChevronDown,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

const CATEGORY_MAP = {
    // Income Categories
    pass_sales: { label: 'Pass Quota Sales', badgeClass: 'bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-white/[0.08]' },
    sms_credits: { label: 'SMS Top-up Credits', badgeClass: 'bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-white/[0.08]' },
    design_service: { label: 'Custom 4K Artwork', badgeClass: 'bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-white/[0.08]' },
    subscription: { label: 'Enterprise Subscription', badgeClass: 'bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-white/[0.08]' },

    // Expense Categories
    carrier_sms_cogs: { label: 'Carrier SMS COGS', badgeClass: 'bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-white/[0.08]' },
    carrier_sms: { label: 'Carrier SMS COGS', badgeClass: 'bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-white/[0.08]' },
    whatsapp_api_cogs: { label: 'WhatsApp Cloud API', badgeClass: 'bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-white/[0.08]' },
    whatsapp_api: { label: 'WhatsApp Cloud API', badgeClass: 'bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-white/[0.08]' },
    server_infrastructure: { label: 'Server Infrastructure', badgeClass: 'bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-white/[0.08]' },
    payment_gateway_fee: { label: 'Payment Gateway Fee', badgeClass: 'bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-white/[0.08]' },
    payment_fees: { label: 'Payment Gateway Fee', badgeClass: 'bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-white/[0.08]' },
    operations: { label: 'Operations & Maintenance', badgeClass: 'bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-white/[0.08]' },
    general_expense: { label: 'General Overhead', badgeClass: 'bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-white/[0.08]' },
    other: { label: 'General / Other', badgeClass: 'bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-white/[0.08]' },
};

export default function Finance({ 
    metrics = {}, 
    income_by_category = {}, 
    expense_by_category = {}, 
    monthly_trend = [], 
    transactions = [], 
    organizers = [], 
    events = [], 
    filters = {} 
}) {
    const [period, setPeriod] = useState(filters.period || 'all');
    const [typeTab, setTypeTab] = useState(filters.type || 'all');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || 'all');
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('income'); // 'income' | 'expense'
    const [selectedTx, setSelectedTx] = useState(null);
    const [actionDropdownOpen, setActionDropdownOpen] = useState(false);
    const actionDropdownRef = useRef(null);

    // Close action dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (actionDropdownRef.current && !actionDropdownRef.current.contains(event.target)) {
                setActionDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Form: Record Transaction
    const txForm = useForm({
        type: 'income',
        category: 'pass_sales',
        title: '',
        amount: '',
        currency: 'TZS',
        payment_method: 'M-Pesa',
        reference: '',
        user_id: '',
        event_id: '',
        status: 'completed',
        notes: '',
        transaction_date: new Date().toISOString().split('T')[0],
    });

    const openCreateModal = (mode = 'income') => {
        setModalMode(mode);
        txForm.setData({
            type: mode,
            category: mode === 'income' ? 'pass_sales' : 'carrier_sms_cogs',
            title: '',
            amount: '',
            currency: 'TZS',
            payment_method: mode === 'income' ? 'M-Pesa' : 'Bank Wire',
            reference: '',
            user_id: '',
            event_id: '',
            status: 'completed',
            notes: '',
            transaction_date: new Date().toISOString().split('T')[0],
        });
        setModalOpen(true);
    };

    const handlePeriodChange = (newPeriod) => {
        setPeriod(newPeriod);
        router.get(route('admin.finance'), {
            period: newPeriod,
            type: typeTab,
            category: categoryFilter,
            search: searchTerm,
        }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const handleTypeChange = (newType) => {
        setTypeTab(newType);
    };

    const handleSubmitTransaction = (e) => {
        e.preventDefault();
        txForm.post(route('admin.finance.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setModalOpen(false);
                txForm.reset();
            }
        });
    };

    const handleDeleteTransaction = (tx) => {
        if (confirm(`Are you sure you want to permanently delete transaction ${tx.transaction_number} (${tx.title})?`)) {
            router.delete(route('admin.finance.destroy', tx.id), {
                preserveScroll: true
            });
        }
    };

    const formatTzs = (amount) => {
        return Number(amount || 0).toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }) + ' TZS';
    };

    const formatUsd = (amountTzs) => {
        const usdVal = Number(amountTzs || 0) / 2650;
        return '$' + usdVal.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Reset to page 1 whenever filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [typeTab, categoryFilter, searchTerm, period]);

    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            if (typeTab !== 'all' && t.type !== typeTab) return false;
            if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
            if (searchTerm.trim()) {
                const q = searchTerm.toLowerCase();
                const numMatch = t.transaction_number?.toLowerCase().includes(q);
                const titleMatch = t.title?.toLowerCase().includes(q);
                const refMatch = t.reference?.toLowerCase().includes(q);
                const userMatch = t.user?.name?.toLowerCase().includes(q) || t.user?.company?.toLowerCase().includes(q);
                const eventMatch = t.event?.title?.toLowerCase().includes(q);
                if (!numMatch && !titleMatch && !refMatch && !userMatch && !eventMatch) return false;
            }
            return true;
        });
    }, [transactions, typeTab, categoryFilter, searchTerm]);

    const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / itemsPerPage));

    const paginatedTransactions = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredTransactions.slice(start, start + itemsPerPage);
    }, [filteredTransactions, currentPage, itemsPerPage]);

    const maxMonthlyTrendAmount = useMemo(() => {
        return Math.max(...monthly_trend.map(m => Math.max(m.income, m.expense)), 100000);
    }, [monthly_trend]);

    return (
        <KardovoAppLayout
            title="Financial Analytics & P&L"
            headerActions={
                <div className="flex items-center gap-2">
                    <a
                        href={route('admin.finance.export', {
                            period: period,
                            type: typeTab,
                            category: categoryFilter,
                            search: searchTerm,
                        })}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-white/[0.06] hover:bg-slate-50 dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/[0.08] rounded-xl transition cursor-pointer"
                        title="Export CSV Statement"
                    >
                        <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                        <span className="hidden sm:inline">Export</span>
                    </a>

                    {/* Single Clean + Entry Dropdown */}
                    <div className="relative" ref={actionDropdownRef}>
                        <button
                            type="button"
                            onClick={() => setActionDropdownOpen(!actionDropdownOpen)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-cyan-600 dark:hover:bg-cyan-500 rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5 text-cyan-400 dark:text-white" />
                            <span>New Entry</span>
                            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${actionDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {actionDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#0C1729] rounded-2xl shadow-xl border border-slate-200 dark:border-white/[0.08] p-1.5 z-50 animate-fadeIn space-y-0.5">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActionDropdownOpen(false);
                                        openCreateModal('income');
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-xl transition text-left cursor-pointer"
                                >
                                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                    <span>Record Income</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActionDropdownOpen(false);
                                        openCreateModal('expense');
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-xl transition text-left cursor-pointer"
                                >
                                    <ArrowDownRight className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                                    <span>Log Expense</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            }
        >
            <Head title="Financial Analytics & Revenue — Kardovo Admin" />

            <div className="max-w-7xl mx-auto space-y-6">

                {/* ═══════════════ 1. SIMPLE PAGE TITLE HEADER ═══════════════ */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight">
                            Profit &amp; Loss, Revenue &amp; Cost Intelligence
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            Real-time cashflow ledger tracking pass quota sales, gateway COGS, and net margins.
                        </p>
                    </div>

                    {/* Period Filter Buttons */}
                    <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-white/80 dark:bg-[#0B1524] border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
                        {[
                            { id: 'all', label: 'All Time' },
                            { id: '30days', label: '30 Days' },
                            { id: '90days', label: '90 Days' },
                            { id: 'this_year', label: 'Year 2026' },
                        ].map((p) => (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => handlePeriodChange(p.id)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer ${
                                    period === p.id
                                        ? 'bg-slate-900 dark:bg-cyan-600 text-white shadow-xs font-bold'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06]'
                                }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ═══════════════ 2. FOUR HERO FINANCIAL KPI CARDS (DIFFERENTIATED & NEAT) ═══════════════ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1: Gross Revenue (Blue) */}
                    <div className="h-full rounded-3xl p-5 bg-white dark:bg-[#0B172A] border border-slate-200/90 dark:border-white/[0.08] shadow-xs hover:shadow-card hover:border-blue-300 dark:hover:border-blue-800/60 transition duration-200 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                                    Gross Revenue (Inflow)
                                </span>
                                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/40 shadow-2xs">
                                    <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                                </div>
                            </div>
                            <div className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono mt-3 tracking-tight">
                                {formatTzs(metrics.gross_revenue)}
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs">
                            <span className="text-slate-500 dark:text-slate-400 font-medium">USD Equiv.</span>
                            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-mono font-bold text-[11px] border border-blue-200/60 dark:border-blue-800/40">
                                {formatUsd(metrics.gross_revenue)}
                            </span>
                        </div>
                    </div>

                    {/* Card 2: Operating Expenses (Rose) */}
                    <div className="h-full rounded-3xl p-5 bg-white dark:bg-[#0B172A] border border-slate-200/90 dark:border-white/[0.08] shadow-xs hover:shadow-card hover:border-rose-300 dark:hover:border-rose-800/60 transition duration-200 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                                    Operating Expenses (Outflow)
                                </span>
                                <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200/60 dark:border-rose-800/40 shadow-2xs">
                                    <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
                                </div>
                            </div>
                            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono mt-3 tracking-tight">
                                {formatTzs(metrics.total_expenses)}
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs">
                            <span className="text-slate-500 dark:text-slate-400 font-medium">Direct Carrier COGS</span>
                            <span className="px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-mono font-bold text-[11px] border border-rose-200/60 dark:border-rose-800/40">
                                {formatTzs(metrics.direct_cogs)}
                            </span>
                        </div>
                    </div>

                    {/* Card 3: Gross Profit (Amber) */}
                    <div className="h-full rounded-3xl p-5 bg-white dark:bg-[#0B172A] border border-slate-200/90 dark:border-white/[0.08] shadow-xs hover:shadow-card hover:border-amber-300 dark:hover:border-amber-800/60 transition duration-200 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                                    Gross Profit (Pre-OpEx)
                                </span>
                                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200/60 dark:border-amber-800/40 shadow-2xs">
                                    <Layers className="w-4 h-4 stroke-[2.5]" />
                                </div>
                            </div>
                            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono mt-3 tracking-tight">
                                {formatTzs(metrics.gross_profit)}
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs">
                            <span className="text-slate-500 dark:text-slate-400 font-medium">Gross Margin</span>
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-mono font-bold text-[11px] border border-amber-200/60 dark:border-amber-800/40">
                                {metrics.gross_margin_pct}% Margin
                            </span>
                        </div>
                    </div>

                    {/* Card 4: Net Profit (Emerald) */}
                    <div className="h-full rounded-3xl p-5 bg-white dark:bg-[#0B172A] border border-slate-200/90 dark:border-white/[0.08] shadow-xs hover:shadow-card hover:border-emerald-300 dark:hover:border-emerald-800/60 transition duration-200 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                                    Net Profit (Bottom Line)
                                </span>
                                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-800/40 shadow-2xs">
                                    <TrendingUp className="w-4 h-4 stroke-[2.5]" />
                                </div>
                            </div>
                            <div className={`text-2xl font-black font-mono mt-3 tracking-tight ${
                                (metrics.net_profit || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                            }`}>
                                {formatTzs(metrics.net_profit)}
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs">
                            <span className="text-slate-500 dark:text-slate-400 font-medium">Net Profit Margin</span>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-[11px] border border-emerald-200/60 dark:border-emerald-800/40">
                                {metrics.net_margin_pct}% Net
                            </span>
                        </div>
                    </div>
                </div>

                {/* ═══════════════ 3. VISUAL ANALYTICS: CASHFLOW TRENDS & BREAKDOWNS ═══════════════ */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left: Monthly Inflow vs Outflow Visualizer (7 cols) */}
                    <div className="lg:col-span-7 bg-white dark:bg-[#0B172A] p-6 rounded-3xl border border-slate-200/90 dark:border-white/[0.08] shadow-card space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200/60 dark:border-white/[0.08] text-slate-700 dark:text-slate-200 flex items-center justify-center flex-shrink-0 shadow-2xs">
                                    <BarChart3 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-display">
                                        Cashflow &amp; P&amp;L Trajectory (Past 6 Months)
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        Comparative monthly revenue inflow vs operational expenditure.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] font-bold">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                    <span className="text-slate-600 dark:text-slate-300">Income</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                                    <span className="text-slate-600 dark:text-slate-300">Expense</span>
                                </div>
                            </div>
                        </div>

                        {/* Visual Bars Container */}
                        <div className="space-y-4 pt-2">
                            {monthly_trend.map((m, idx) => {
                                const incomeHeightPct = Math.min(100, Math.round((m.income / maxMonthlyTrendAmount) * 100));
                                const expenseHeightPct = Math.min(100, Math.round((m.expense / maxMonthlyTrendAmount) * 100));

                                return (
                                    <div key={idx} className="space-y-1.5">
                                        <div className="flex items-center justify-between text-xs font-bold">
                                            <span className="text-slate-800 dark:text-slate-200 font-mono">{m.month}</span>
                                            <div className="flex items-center gap-3 font-mono text-[11px]">
                                                <span className="text-emerald-600 dark:text-emerald-400">+{formatTzs(m.income)}</span>
                                                <span className="text-rose-600 dark:text-rose-400">-{formatTzs(m.expense)}</span>
                                                <span className={`font-bold px-2 py-0.5 rounded-md border text-[10.5px] ${
                                                    m.net >= 0 
                                                        ? 'bg-slate-100 dark:bg-white/[0.06] text-emerald-700 dark:text-emerald-400 border-slate-200/70 dark:border-white/[0.08]' 
                                                        : 'bg-slate-100 dark:bg-white/[0.06] text-rose-700 dark:text-rose-400 border-slate-200/70 dark:border-white/[0.08]'
                                                }`}>
                                                    Net: {m.net >= 0 ? '+' : ''}{formatTzs(m.net)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 h-3 bg-slate-100 dark:bg-white/[0.04] p-0.5 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${incomeHeightPct}%` }} />
                                            <div className="h-full bg-rose-500 rounded-full transition-all duration-500" style={{ width: `${expenseHeightPct}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right: Revenue Streams & Expense Center Breakdown (5 cols) */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Income Sources */}
                        <div className="bg-white dark:bg-[#0B172A] p-6 rounded-3xl border border-slate-200/90 dark:border-white/[0.08] shadow-card space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200/60 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 flex items-center justify-center shadow-2xs">
                                        <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-display">
                                        Revenue Streams
                                    </h3>
                                </div>
                                <span className="text-[11px] font-mono font-bold text-slate-900 dark:text-white">
                                    {formatTzs(metrics.gross_revenue)}
                                </span>
                            </div>

                            <div className="space-y-3">
                                {[
                                    { label: 'Pass Quota Packages', amount: income_by_category.pass_sales },
                                    { label: 'Bulk SMS Top-up Credits', amount: income_by_category.sms_credits },
                                    { label: 'Custom 4K Artwork & Branding', amount: income_by_category.design_service },
                                    { label: 'Enterprise Subscriptions', amount: income_by_category.subscription },
                                ].map((item, idx) => {
                                    const pct = metrics.gross_revenue > 0 ? Math.round((item.amount / metrics.gross_revenue) * 100) : 0;
                                    return (
                                        <div key={idx} className="space-y-1">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-semibold text-slate-700 dark:text-slate-300">{item.label}</span>
                                                <span className="font-mono font-bold text-slate-900 dark:text-white">{formatTzs(item.amount)} ({pct}%)</span>
                                            </div>
                                            <div className="w-full bg-slate-100 dark:bg-white/[0.06] h-2 rounded-full overflow-hidden">
                                                <div className="h-full bg-slate-900 dark:bg-cyan-500 rounded-full" style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Expense Centers */}
                        <div className="bg-white dark:bg-[#0B172A] p-6 rounded-3xl border border-slate-200/90 dark:border-white/[0.08] shadow-card space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200/60 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 flex items-center justify-center shadow-2xs">
                                        <TrendingDown className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                                    </div>
                                    <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-display">
                                        Expense Cost Centers
                                    </h3>
                                </div>
                                <span className="text-[11px] font-mono font-bold text-slate-900 dark:text-white">
                                    {formatTzs(metrics.total_expenses)}
                                </span>
                            </div>

                            <div className="space-y-3">
                                {[
                                    { label: 'Direct SMS Carrier Delivery (NextSMS / Beem)', amount: expense_by_category.carrier_sms },
                                    { label: 'Meta WhatsApp Cloud API Costs', amount: expense_by_category.whatsapp_api },
                                    { label: 'Redis & Cloud Production Hosting', amount: expense_by_category.server_infrastructure },
                                    { label: 'Payment Gateway & Merchant MDR', amount: expense_by_category.payment_fees },
                                    { label: 'Hardware Maintenance & Operations', amount: expense_by_category.operations },
                                ].map((item, idx) => {
                                    const pct = metrics.total_expenses > 0 ? Math.round((item.amount / metrics.total_expenses) * 100) : 0;
                                    return (
                                        <div key={idx} className="space-y-1">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">{item.label}</span>
                                                <span className="font-mono font-bold text-slate-900 dark:text-white">{formatTzs(item.amount)} ({pct}%)</span>
                                            </div>
                                            <div className="w-full bg-slate-100 dark:bg-white/[0.06] h-2 rounded-full overflow-hidden">
                                                <div className="h-full bg-slate-600 dark:bg-slate-400 rounded-full" style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ═══════════════ 4. FINANCIAL LEDGER TRANSACTIONS TABLE ═══════════════ */}
                <div className="bg-white dark:bg-[#0B172A] rounded-3xl border border-slate-200/90 dark:border-white/[0.08] shadow-card overflow-hidden">
                    {/* Filter & Controls Header */}
                    <div className="p-5 sm:p-6 border-b border-slate-200/80 dark:border-white/[0.08] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-2">
                            {[
                                { id: 'all', label: 'All Transactions' },
                                { id: 'income', label: 'Income Only (+)' },
                                { id: 'expense', label: 'Expenses Only (-)' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => handleTypeChange(tab.id)}
                                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer ${
                                        typeTab === tab.id
                                            ? 'bg-slate-900 dark:bg-cyan-600 text-white shadow-xs'
                                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06]'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Search & Category Filter */}
                        <div className="flex flex-wrap items-center gap-2.5">
                            <div className="relative">
                                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search by code, title, client..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-white dark:bg-[#08121E] border border-slate-200/80 dark:border-white/[0.08] text-slate-900 dark:text-slate-100 text-xs font-medium rounded-xl pl-8 pr-3 py-2 w-full sm:w-64 hover:border-slate-400 focus:border-slate-900 dark:focus:border-cyan-500 transition outline-none"
                                />
                            </div>

                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="bg-white dark:bg-[#08121E] border border-slate-200/80 dark:border-white/[0.08] text-slate-900 dark:text-slate-100 text-xs font-medium rounded-xl px-3 py-2 hover:border-slate-400 focus:border-slate-900 dark:focus:border-cyan-500 transition outline-none cursor-pointer"
                            >
                                <option value="all">All Categories</option>
                                <option value="pass_sales">Pass Quota Sales</option>
                                <option value="sms_credits">SMS Campaign Credits</option>
                                <option value="design_service">Design &amp; Studio</option>
                                <option value="subscription">Subscriptions</option>
                                <option value="carrier_sms_cogs">SMS Carrier COGS</option>
                                <option value="whatsapp_api_cogs">WhatsApp Cloud API</option>
                                <option value="server_infrastructure">Cloud Infrastructure</option>
                                <option value="payment_gateway_fee">Payment Gateway Fees</option>
                                <option value="operations">Operations &amp; Gear</option>
                            </select>

                            {/* Export Filtered CSV Button */}
                            <a
                                href={route('admin.finance.export', {
                                    period: period,
                                    type: typeTab,
                                    category: categoryFilter,
                                    search: searchTerm,
                                })}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] border border-slate-200/80 dark:border-white/[0.08] rounded-xl transition cursor-pointer shadow-2xs active:scale-95"
                                title={`Download ${typeTab === 'income' ? 'Income' : typeTab === 'expense' ? 'Expense' : 'Ledger'} report`}
                            >
                                <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                                <span>Export {typeTab === 'income' ? 'Income' : typeTab === 'expense' ? 'Expenses' : 'CSV'}</span>
                            </a>
                        </div>
                    </div>

                    {/* Clean Table View with 10 Items Per Page */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-slate-50/95 dark:bg-[#0A1424]/95 border-b border-slate-200/80 dark:border-white/[0.08] text-slate-500 dark:text-slate-400 font-mono uppercase text-[10.5px] font-bold tracking-wider sticky top-0 z-10 backdrop-blur-xs">
                                <tr>
                                    <th className="py-3.5 px-4 font-extrabold text-left">Transaction Code</th>
                                    <th className="py-3.5 px-4 font-extrabold text-left">Date</th>
                                    <th className="py-3.5 px-4 font-extrabold text-left">Description &amp; Category</th>
                                    <th className="py-3.5 px-4 font-extrabold text-left">Client / Event Reference</th>
                                    <th className="py-3.5 px-4 font-extrabold text-left">Payment Method</th>
                                    <th className="py-3.5 px-4 font-extrabold text-right">Amount (TZS)</th>
                                    <th className="py-3.5 px-4 font-extrabold text-center">Status</th>
                                    <th className="py-3.5 px-4 font-extrabold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200/70 dark:divide-white/[0.06]">
                                {paginatedTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-12 text-center text-slate-500 dark:text-slate-400 font-medium">
                                            No financial records found matching your filters.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedTransactions.map((tx) => {
                                        const isIncome = tx.type === 'income';
                                        const catInfo = CATEGORY_MAP[tx.category] || {
                                            label: tx.category ? tx.category.replace(/_/g, ' ') : 'General',
                                            badgeClass: 'bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-white/[0.08]'
                                        };

                                        return (
                                            <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.03] transition">
                                                {/* Code */}
                                                <td className="py-3.5 px-4 align-middle font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                                                    {tx.transaction_number}
                                                </td>

                                                {/* Date */}
                                                <td className="py-3.5 px-4 align-middle font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap text-xs">
                                                    {tx.transaction_date ? new Date(tx.transaction_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                                                </td>

                                                {/* Title & Category */}
                                                <td className="py-3.5 px-4 align-middle max-w-sm">
                                                    <div className="font-bold text-slate-900 dark:text-white text-xs truncate">
                                                        {tx.title}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 mt-1">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold font-mono border whitespace-nowrap shadow-2xs ${catInfo.badgeClass}`}>
                                                            {catInfo.label}
                                                        </span>
                                                        {tx.reference && (
                                                            <span className="inline-flex items-center text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100/80 dark:bg-white/[0.04] px-1.5 py-0.5 rounded border border-slate-200/60 dark:border-white/[0.06] truncate">
                                                                Ref: {tx.reference}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Client / Event */}
                                                <td className="py-3.5 px-4 align-middle">
                                                    <div className="font-medium text-slate-800 dark:text-slate-200 truncate">
                                                        {tx.user?.name || (tx.user?.company ? `${tx.user.company}` : 'Platform Direct')}
                                                    </div>
                                                    {tx.event && (
                                                        <div className="text-[10.5px] text-slate-500 dark:text-slate-400 truncate">
                                                            {tx.event.title}
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Payment Method */}
                                                <td className="py-3.5 px-4 align-middle font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/[0.08] text-[11px] font-bold shadow-2xs">
                                                        <CreditCard className="w-3 h-3 text-slate-500" />
                                                        <span>{tx.payment_method}</span>
                                                    </span>
                                                </td>

                                                {/* Amount */}
                                                <td className={`py-3.5 px-4 align-middle font-mono font-black text-right whitespace-nowrap text-xs ${
                                                    isIncome 
                                                        ? 'text-emerald-600 dark:text-emerald-400' 
                                                        : 'text-rose-600 dark:text-rose-400'
                                                }`}>
                                                    {isIncome ? '+' : '-'}{formatTzs(tx.amount)}
                                                </td>

                                                {/* Status */}
                                                <td className="py-3.5 px-4 align-middle text-center whitespace-nowrap">
                                                    <span className="inline-flex items-center gap-1.5 text-[10.5px] font-medium px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-white/[0.08]">
                                                        <span className={`w-1.5 h-1.5 rounded-full ${
                                                            tx.status === 'completed'
                                                                ? 'bg-emerald-500'
                                                                : tx.status === 'pending'
                                                                ? 'bg-amber-500'
                                                                : 'bg-rose-500'
                                                        }`} />
                                                        <span className="capitalize">{tx.status}</span>
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                <td className="py-3.5 px-4 align-middle text-right whitespace-nowrap">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteTransaction(tx)}
                                                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                                                        title="Delete record"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Minimalist Pagination Bar with Proper Spacing */}
                    <div className="px-5 sm:px-6 py-4 border-t border-slate-200/80 dark:border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-slate-50/40 dark:bg-white/[0.01]">
                        <div className="text-slate-500 dark:text-slate-400 font-medium">
                            {filteredTransactions.length === 0 ? (
                                <span>Showing 0 records</span>
                            ) : (
                                <span>
                                    Showing <strong className="text-slate-900 dark:text-white font-mono">{(currentPage - 1) * itemsPerPage + 1}</strong> to <strong className="text-slate-900 dark:text-white font-mono">{Math.min(currentPage * itemsPerPage, filteredTransactions.length)}</strong> of <strong className="text-slate-900 dark:text-white font-mono">{filteredTransactions.length}</strong> transactions
                                </span>
                            )}
                        </div>

                        {totalPages > 1 && (
                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0B172A] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.06] disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
                                    title="Previous Page"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>

                                <div className="flex items-center gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                                        // Condensed page numbers if more than 7 pages
                                        if (totalPages > 7) {
                                            if (pageNum !== 1 && pageNum !== totalPages && Math.abs(pageNum - currentPage) > 1) {
                                                if (pageNum === 2 || pageNum === totalPages - 1) {
                                                    return <span key={pageNum} className="px-1 text-slate-400">...</span>;
                                                }
                                                return null;
                                            }
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                type="button"
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`min-w-[32px] h-8 px-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                                                    currentPage === pageNum
                                                        ? 'bg-slate-900 dark:bg-cyan-600 text-white font-bold shadow-xs'
                                                        : 'border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0B172A] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.06]'
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0B172A] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.06] disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
                                    title="Next Page"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ═══════════════ MODAL: RECORD INCOME / LOG EXPENSE ═══════════════ */}
            <Modal show={modalOpen} onClose={() => setModalOpen(false)} maxWidth="lg">
                <form onSubmit={handleSubmitTransaction} className="p-6 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/[0.08]">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200/60 dark:border-white/[0.08] flex items-center justify-center text-slate-700 dark:text-slate-200 shadow-2xs">
                                {modalMode === 'income' ? <ArrowUpRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <ArrowDownRight className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
                            </div>
                            <h3 className="text-base font-black text-slate-900 dark:text-white font-display">
                                {modalMode === 'income' ? 'Record Revenue Inflow' : 'Log Operating Expense'}
                            </h3>
                        </div>

                        {/* Mode Switcher */}
                        <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.08]">
                            <button
                                type="button"
                                onClick={() => {
                                    setModalMode('income');
                                    txForm.setData('type', 'income');
                                    txForm.setData('category', 'pass_sales');
                                }}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                    modalMode === 'income' ? 'bg-slate-900 dark:bg-cyan-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                                }`}
                            >
                                Income
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setModalMode('expense');
                                    txForm.setData('type', 'expense');
                                    txForm.setData('category', 'carrier_sms_cogs');
                                }}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                    modalMode === 'expense' ? 'bg-slate-900 dark:bg-cyan-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                                }`}
                            >
                                Expense
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {/* Title */}
                        <div>
                            <InputLabel value="Description / Item Title *" />
                            <TextInput
                                type="text"
                                className="mt-1 block w-full text-xs font-bold"
                                placeholder={modalMode === 'income' ? 'e.g. VIP Pass Quota Package (1,000 passes)' : 'e.g. NextSMS Carrier Top-up invoice'}
                                value={txForm.data.title}
                                onChange={(e) => txForm.setData('title', e.target.value)}
                                required
                            />
                        </div>

                        {/* Category & Payment Method */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <InputLabel value="Category *" />
                                <select
                                    className="mt-1 block w-full border border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white rounded-xl text-xs font-bold px-3 py-2"
                                    value={txForm.data.category}
                                    onChange={(e) => txForm.setData('category', e.target.value)}
                                    required
                                >
                                    {modalMode === 'income' ? (
                                        <>
                                            <option value="pass_sales">Pass Quota Sales</option>
                                            <option value="sms_credits">Bulk SMS Campaign Credits</option>
                                            <option value="design_service">Design &amp; Studio Fee</option>
                                            <option value="subscription">Organizer Subscription</option>
                                            <option value="custom_invoice">Custom Enterprise Invoice</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="carrier_sms_cogs">SMS Carrier Delivery (COGS)</option>
                                            <option value="whatsapp_api_cogs">Meta WhatsApp Cloud API (COGS)</option>
                                            <option value="server_infrastructure">Redis &amp; Cloud Infrastructure</option>
                                            <option value="payment_gateway_fee">Payment Gateway Merchant Fees</option>
                                            <option value="operations">Operations &amp; Equipment</option>
                                            <option value="marketing">Marketing &amp; Sales</option>
                                            <option value="other">Other Overhead</option>
                                        </>
                                    )}
                                </select>
                            </div>

                            <div>
                                <InputLabel value="Payment Method *" />
                                <select
                                    className="mt-1 block w-full border border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white rounded-xl text-xs font-bold px-3 py-2"
                                    value={txForm.data.payment_method}
                                    onChange={(e) => txForm.setData('payment_method', e.target.value)}
                                    required
                                >
                                    <option value="M-Pesa">M-Pesa (Vodacom)</option>
                                    <option value="Tigo Pesa">Tigo Pesa</option>
                                    <option value="Airtel Money">Airtel Money</option>
                                    <option value="Bank Wire">Bank Wire Transfer</option>
                                    <option value="Stripe/Card">Credit / Debit Card (Stripe)</option>
                                    <option value="Cash / Invoice">Cash / Official Invoice</option>
                                    <option value="Internal Balance">Internal Balance / Auto Deduct</option>
                                </select>
                            </div>
                        </div>

                        {/* Amount & Reference */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <InputLabel value="Amount (TZS) *" />
                                <TextInput
                                    type="number"
                                    step="0.01"
                                    className="mt-1 block w-full text-xs font-mono font-bold"
                                    placeholder="e.g. 500000"
                                    value={txForm.data.amount}
                                    onChange={(e) => txForm.setData('amount', e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <InputLabel value="Reference Code" />
                                <TextInput
                                    type="text"
                                    className="mt-1 block w-full text-xs font-mono"
                                    placeholder="e.g. MPESA-92841"
                                    value={txForm.data.reference}
                                    onChange={(e) => txForm.setData('reference', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Customer & Event Reference */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <InputLabel value="Client / Organizer (Optional)" />
                                <select
                                    className="mt-1 block w-full border border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white rounded-xl text-xs font-bold px-3 py-2"
                                    value={txForm.data.user_id}
                                    onChange={(e) => txForm.setData('user_id', e.target.value)}
                                >
                                    <option value="">Platform / General</option>
                                    {organizers.map(org => (
                                        <option key={org.id} value={org.id}>{org.name} {org.company ? `(${org.company})` : ''}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <InputLabel value="Target Event (Optional)" />
                                <select
                                    className="mt-1 block w-full border border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white rounded-xl text-xs font-bold px-3 py-2"
                                    value={txForm.data.event_id}
                                    onChange={(e) => txForm.setData('event_id', e.target.value)}
                                >
                                    <option value="">No specific event</option>
                                    {events.map(ev => (
                                        <option key={ev.id} value={ev.id}>{ev.title}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Date & Status */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <InputLabel value="Transaction Date *" />
                                <TextInput
                                    type="date"
                                    className="mt-1 block w-full text-xs font-bold"
                                    value={txForm.data.transaction_date}
                                    onChange={(e) => txForm.setData('transaction_date', e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <InputLabel value="Status *" />
                                <select
                                    className="mt-1 block w-full border border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white rounded-xl text-xs font-bold px-3 py-2"
                                    value={txForm.data.status}
                                    onChange={(e) => txForm.setData('status', e.target.value)}
                                >
                                    <option value="completed">Completed (Settled)</option>
                                    <option value="pending">Pending Settlement</option>
                                    <option value="refunded">Refunded</option>
                                </select>
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <InputLabel value="Audit Notes (Optional)" />
                            <textarea
                                rows={2}
                                className="mt-1 block w-full border border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white rounded-xl text-xs font-medium p-2.5 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                                placeholder="Add invoice notes or settlement details..."
                                value={txForm.data.notes}
                                onChange={(e) => txForm.setData('notes', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200 dark:border-white/[0.08] flex items-center justify-end gap-2.5">
                        <SecondaryButton onClick={() => setModalOpen(false)}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton
                            type="submit"
                            disabled={txForm.processing}
                            className="bg-slate-900 hover:bg-slate-800 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white font-bold rounded-xl shadow-xs"
                        >
                            {modalMode === 'income' ? 'Save Income Record' : 'Save Expense Record'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </KardovoAppLayout>
    );
}

