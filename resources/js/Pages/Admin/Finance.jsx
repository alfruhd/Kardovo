import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import KardovoAppLayout from '@/Layouts/KardovoAppLayout';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import ConfirmationModal from '@/Components/ConfirmationModal';
import { 
    ResponsiveContainer, 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip 
} from 'recharts';
import { 
    TrendingUp, 
    TrendingDown, 
    ArrowUpRight, 
    ArrowDownRight, 
    Plus, 
    Download, 
    Search, 
    Trash2, 
    Layers, 
    RefreshCw, 
    BarChart3, 
    X, 
    ChevronDown, 
    ChevronLeft, 
    ChevronRight,
    FileText,
    FileSpreadsheet,
    Calendar,
    BellRing,
    AlertTriangle,
    AlertCircle,
    CheckCircle,
    Clock,
    Repeat,
    DollarSign,
    Send,
    Eye,
    SlidersHorizontal,
    ArrowUpDown,
    Building2,
    Landmark,
    Percent,
    PieChart,
    Wallet
} from 'lucide-react';

const CATEGORY_MAP = {
    // Inflow / Revenue Categories
    package_purchase: { label: 'Platform Packages', badgeClass: 'bg-emerald-100/90 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-300/80 dark:border-emerald-500/25' },
    pass_sales: { label: 'Pass Quota Sales', badgeClass: 'bg-blue-100/90 dark:bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-300/80 dark:border-blue-500/25' },
    sms_credits: { label: 'SMS Top-up Credits', badgeClass: 'bg-teal-100/90 dark:bg-teal-500/15 text-teal-800 dark:text-teal-300 border-teal-300/80 dark:border-teal-500/25' },
    design_service: { label: 'Custom 4K Artwork', badgeClass: 'bg-amber-100/90 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-300/80 dark:border-amber-500/25' },
    subscription: { label: 'Enterprise Subscription', badgeClass: 'bg-indigo-100/90 dark:bg-indigo-500/15 text-indigo-800 dark:text-indigo-300 border-indigo-300/80 dark:border-indigo-500/25' },
    other_income: { label: 'General Inflow', badgeClass: 'bg-slate-100 dark:bg-white/[0.08] text-slate-800 dark:text-slate-200 border-slate-300 dark:border-white/[0.12]' },

    // Expense / Outflow Categories
    carrier_sms_cogs: { label: 'Carrier SMS (COGS)', badgeClass: 'bg-rose-100/90 dark:bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-300/80 dark:border-rose-500/25' },
    carrier_sms: { label: 'Carrier SMS (COGS)', badgeClass: 'bg-rose-100/90 dark:bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-300/80 dark:border-rose-500/25' },
    whatsapp_api_cogs: { label: 'WhatsApp API (COGS)', badgeClass: 'bg-orange-100/90 dark:bg-orange-500/15 text-orange-800 dark:text-orange-300 border-orange-300/80 dark:border-orange-500/25' },
    whatsapp_api: { label: 'WhatsApp API (COGS)', badgeClass: 'bg-orange-100/90 dark:bg-orange-500/15 text-orange-800 dark:text-orange-300 border-orange-300/80 dark:border-orange-500/25' },
    server_infrastructure: { label: 'Server Infrastructure', badgeClass: 'bg-sky-100/90 dark:bg-sky-500/15 text-sky-800 dark:text-sky-300 border-sky-300/80 dark:border-sky-500/25' },
    payment_gateway_fee: { label: 'Payment Gateway Fee', badgeClass: 'bg-purple-100/90 dark:bg-purple-500/15 text-purple-800 dark:text-purple-300 border-purple-300/80 dark:border-purple-500/25' },
    payment_fees: { label: 'Payment Gateway Fee', badgeClass: 'bg-purple-100/90 dark:bg-purple-500/15 text-purple-800 dark:text-purple-300 border-purple-300/80 dark:border-purple-500/25' },
    operations: { label: 'Operations & Maintenance', badgeClass: 'bg-amber-100/90 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-300/80 dark:border-amber-500/25' },
    marketing: { label: 'Marketing & Outreach', badgeClass: 'bg-pink-100/90 dark:bg-pink-500/15 text-pink-800 dark:text-pink-300 border-pink-300/80 dark:border-pink-500/25' },
    office_rent: { label: 'Office & Facilities', badgeClass: 'bg-slate-100 dark:bg-white/[0.08] text-slate-800 dark:text-slate-200 border-slate-300 dark:border-white/[0.12]' },
    legal_compliance: { label: 'Legal & Compliance', badgeClass: 'bg-slate-100 dark:bg-white/[0.08] text-slate-800 dark:text-slate-200 border-slate-300 dark:border-white/[0.12]' },
    other: { label: 'General Overhead', badgeClass: 'bg-slate-100 dark:bg-white/[0.08] text-slate-800 dark:text-slate-200 border-slate-300 dark:border-white/[0.12]' },
};

export default function Finance({ 
    metrics = {}, 
    fx_rate = {},
    income_by_category = {}, 
    expense_by_category = {}, 
    monthly_trend = [], 
    yearly_cashflow = [], 
    monthly_cashflow = [], 
    available_years = [], 
    transactions = [], 
    bills = [], 
    reminders = {}, 
    organizers = [], 
    events = [], 
    filters = {} 
}) {
    // 4 Crisp Tabs: 'overview' | 'ledger' | 'bills' | 'cashflow'
    const [activeTab, setActiveTab] = useState('overview');

    // Period & Date Filters
    const [period, setPeriod] = useState(filters.period || 'all');
    const [selectedYear, setSelectedYear] = useState(filters.year || 'all');
    const [customFrom, setCustomFrom] = useState(filters.from || '');
    const [customTo, setCustomTo] = useState(filters.to || '');
    const [customDatePickerOpen, setCustomDatePickerOpen] = useState(Boolean(filters.from || filters.to));

    // Ledger Filters
    const [ledgerTypeFilter, setLedgerTypeFilter] = useState(filters.type || 'all');
    const [ledgerCategoryFilter, setLedgerCategoryFilter] = useState(filters.category || 'all');
    const [ledgerSearchTerm, setLedgerSearchTerm] = useState(filters.search || '');
    const [ledgerPage, setLedgerPage] = useState(1);
    const ledgerItemsPerPage = 12;

    // Bills Filters
    const [billStatusFilter, setBillStatusFilter] = useState('all');
    const [billSearchTerm, setBillSearchTerm] = useState('');

    // Modals
    const [txModalOpen, setTxModalOpen] = useState(false);
    const [billModalOpen, setBillModalOpen] = useState(false);
    const [editingBill, setEditingBill] = useState(null);
    const [payModalOpen, setPayModalOpen] = useState(false);
    const [activeBillToPay, setActiveBillToPay] = useState(null);
    const [viewingTx, setViewingTx] = useState(null);
    const [fxModalOpen, setFxModalOpen] = useState(false);
    const [isSyncingFx, setIsSyncingFx] = useState(false);
    const [actionDropdownOpen, setActionDropdownOpen] = useState(false);
    const actionDropdownRef = useRef(null);
    const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
    const exportDropdownRef = useRef(null);
    const [exportModalOpen, setExportModalOpen] = useState(false);
    const [alertBannerDismissed, setAlertBannerDismissed] = useState(false);

    const [exportConfig, setExportConfig] = useState({
        format: 'pdf',
        period: filters.period || 'all',
        from: filters.from || '',
        to: filters.to || '',
        type: 'all',
    });

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

    const activeFxRate = Number(fx_rate?.rate || 2650);

    const fxForm = useForm({
        rate: activeFxRate,
    });

    // Form: Record Direct Income Transaction
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

    // Form: Add / Edit Billed Expense
    const billForm = useForm({
        vendor_name: '',
        title: '',
        category: 'server_infrastructure',
        amount: '',
        currency: 'TZS',
        bill_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        is_recurring: false,
        recurrence_period: 'monthly',
        payment_method_intended: 'Bank Wire',
        vendor_account_reference: '',
        reminder_enabled: true,
        reminder_days_before: 3,
        notes: '',
    });

    // Form: Pay Billed Expense
    const payForm = useForm({
        payment_method: 'Bank Wire',
        reference: '',
        payment_date: new Date().toISOString().split('T')[0],
        notes: '',
    });

    useEffect(() => {
        if (filters.period) setPeriod(filters.period);
        if (filters.year) setSelectedYear(filters.year);
    }, [filters.period, filters.year]);

    useEffect(() => {
        if (fx_rate?.rate) fxForm.setData('rate', fx_rate.rate);
    }, [fx_rate]);

    // Close action and export dropdowns on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (actionDropdownRef.current && !actionDropdownRef.current.contains(event.target)) {
                setActionDropdownOpen(false);
            }
            if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target)) {
                setExportDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Currency Formatting Helpers
    const formatTzs = (amount) => {
        return Number(amount || 0).toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }) + ' TZS';
    };

    const formatUsd = (amountTzs) => {
        const usdVal = Number(amountTzs || 0) / (activeFxRate || 2650);
        return '$' + usdVal.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const formatCompactTzs = (val) => {
        const num = Number(val || 0);
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(0) + 'k';
        return num.toString();
    };

    // Period Change Handler
    const handlePeriodChange = (newPeriod, fromDate = customFrom, toDate = customTo) => {
        setPeriod(newPeriod);
        router.get(route('admin.finance'), {
            period: newPeriod,
            from: newPeriod === 'custom' ? fromDate : '',
            to: newPeriod === 'custom' ? toDate : '',
            year: selectedYear,
            type: ledgerTypeFilter,
            category: ledgerCategoryFilter,
            search: ledgerSearchTerm,
        }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const handleYearChange = (newYear) => {
        setSelectedYear(newYear);
        router.get(route('admin.finance'), {
            period: period,
            year: newYear,
            type: ledgerTypeFilter,
            category: ledgerCategoryFilter,
            search: ledgerSearchTerm,
        }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const handleSyncLiveFx = () => {
        setIsSyncingFx(true);
        router.post(route('admin.finance.exchangeRate.refresh'), {}, {
            preserveScroll: true,
            onFinish: () => {
                setIsSyncingFx(false);
                setFxModalOpen(false);
            }
        });
    };

    const handleSaveManualFx = (e) => {
        e.preventDefault();
        fxForm.post(route('admin.finance.exchangeRate.update'), {
            preserveScroll: true,
            onSuccess: () => setFxModalOpen(false),
        });
    };

    const handleExecuteExport = () => {
        const params = new URLSearchParams();
        params.set('period', exportConfig.period);
        if (exportConfig.period === 'custom') {
            if (exportConfig.from) params.set('from', exportConfig.from);
            if (exportConfig.to) params.set('to', exportConfig.to);
        }

        let url = '';
        if (exportConfig.format === 'pdf') {
            url = route('admin.finance.exportPdf') + '?' + params.toString();
        } else if (exportConfig.format === 'cashflow') {
            params.set('format', 'cashflow');
            url = route('admin.finance.export') + '?' + params.toString();
        } else {
            params.set('format', 'ledger');
            if (exportConfig.type !== 'all') params.set('type', exportConfig.type);
            if (ledgerCategoryFilter !== 'all') params.set('category', ledgerCategoryFilter);
            if (ledgerSearchTerm) params.set('search', ledgerSearchTerm);
            url = route('admin.finance.export') + '?' + params.toString();
        }

        window.location.href = url;
        setExportModalOpen(false);
    };

    // Open Create Billed Expense Modal
    const openCreateBillModal = () => {
        setEditingBill(null);
        billForm.reset();
        billForm.setData({
            vendor_name: '',
            title: '',
            category: 'server_infrastructure',
            amount: '',
            currency: 'TZS',
            bill_date: new Date().toISOString().split('T')[0],
            due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
            is_recurring: false,
            recurrence_period: 'monthly',
            payment_method_intended: 'Bank Wire',
            vendor_account_reference: '',
            reminder_enabled: true,
            reminder_days_before: 3,
            notes: '',
        });
        setBillModalOpen(true);
    };

    // Open Edit Billed Expense Modal
    const openEditBillModal = (bill) => {
        setEditingBill(bill);
        billForm.setData({
            vendor_name: bill.vendor_name || '',
            title: bill.title || '',
            category: bill.category || 'server_infrastructure',
            amount: bill.amount || '',
            currency: bill.currency || 'TZS',
            bill_date: bill.bill_date ? bill.bill_date.split('T')[0] : '',
            due_date: bill.due_date ? bill.due_date.split('T')[0] : '',
            is_recurring: Boolean(bill.is_recurring),
            recurrence_period: bill.recurrence_period || 'monthly',
            payment_method_intended: bill.payment_method_intended || 'Bank Wire',
            vendor_account_reference: bill.vendor_account_reference || '',
            reminder_enabled: bill.reminder_enabled !== false,
            reminder_days_before: bill.reminder_days_before || 3,
            notes: bill.notes || '',
        });
        setBillModalOpen(true);
    };

    const handleSubmitBill = (e) => {
        e.preventDefault();
        if (editingBill) {
            billForm.put(route('admin.finance.bills.update', editingBill.id), {
                preserveScroll: true,
                onSuccess: () => setBillModalOpen(false),
            });
        } else {
            billForm.post(route('admin.finance.bills.store'), {
                preserveScroll: true,
                onSuccess: () => setBillModalOpen(false),
            });
        }
    };

    // Open Pay Bill Modal
    const openPayBillModal = (bill) => {
        setActiveBillToPay(bill);
        payForm.setData({
            payment_method: bill.payment_method_intended || 'Bank Wire',
            reference: bill.vendor_account_reference ? `REF-${bill.vendor_account_reference}` : bill.bill_number,
            payment_date: new Date().toISOString().split('T')[0],
            notes: `Paid invoice for ${bill.vendor_name}.`,
        });
        setPayModalOpen(true);
    };

    const handleSubmitPayment = (e) => {
        e.preventDefault();
        if (!activeBillToPay) return;
        payForm.post(route('admin.finance.bills.pay', activeBillToPay.id), {
            preserveScroll: true,
            onSuccess: () => {
                setPayModalOpen(false);
                setActiveBillToPay(null);
            }
        });
    };

    const handleDeleteBill = (bill) => {
        setConfirmModal({
            show: true,
            title: 'Delete Billed Expense?',
            message: `Permanently delete bill ${bill.bill_number} (${bill.vendor_name}: ${bill.title})?`,
            warning: 'This will remove the bill record.',
            confirmText: 'Delete Bill',
            type: 'danger',
            loading: false,
            onConfirm: () => {
                setConfirmModal(prev => ({ ...prev, loading: true }));
                router.delete(route('admin.finance.bills.destroy', bill.id), {
                    preserveScroll: true,
                    onFinish: () => setConfirmModal(prev => ({ ...prev, show: false, loading: false })),
                });
            }
        });
    };

    const handleSendReminder = (bill) => {
        router.post(route('admin.finance.bills.remind', bill.id), {}, {
            preserveScroll: true,
        });
    };

    // Filtered Transactions
    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            if (ledgerTypeFilter !== 'all' && t.type !== ledgerTypeFilter) return false;
            if (ledgerCategoryFilter !== 'all' && t.category !== ledgerCategoryFilter) return false;
            if (ledgerSearchTerm.trim()) {
                const q = ledgerSearchTerm.toLowerCase();
                const numMatch = t.transaction_number?.toLowerCase().includes(q);
                const titleMatch = t.title?.toLowerCase().includes(q);
                const refMatch = t.reference?.toLowerCase().includes(q);
                const userMatch = t.user?.name?.toLowerCase().includes(q) || t.user?.company?.toLowerCase().includes(q);
                const eventMatch = t.event?.title?.toLowerCase().includes(q);
                if (!numMatch && !titleMatch && !refMatch && !userMatch && !eventMatch) return false;
            }
            return true;
        });
    }, [transactions, ledgerTypeFilter, ledgerCategoryFilter, ledgerSearchTerm]);

    // Filtered Bills
    const filteredBills = useMemo(() => {
        return bills.filter(b => {
            if (billStatusFilter !== 'all' && b.status !== billStatusFilter) return false;
            if (billSearchTerm.trim()) {
                const q = billSearchTerm.toLowerCase();
                const numMatch = b.bill_number?.toLowerCase().includes(q);
                const vendorMatch = b.vendor_name?.toLowerCase().includes(q);
                const titleMatch = b.title?.toLowerCase().includes(q);
                const refMatch = b.vendor_account_reference?.toLowerCase().includes(q);
                if (!numMatch && !vendorMatch && !titleMatch && !refMatch) return false;
            }
            return true;
        });
    }, [bills, billStatusFilter, billSearchTerm]);

    // Ledger Pagination
    const totalLedgerPages = Math.max(1, Math.ceil(filteredTransactions.length / ledgerItemsPerPage));
    const paginatedTransactions = useMemo(() => {
        const start = (ledgerPage - 1) * ledgerItemsPerPage;
        return filteredTransactions.slice(start, start + ledgerItemsPerPage);
    }, [filteredTransactions, ledgerPage, ledgerItemsPerPage]);

    const hasUrgentAlerts = (reminders?.overdue_count > 0 || reminders?.due_this_week_count > 0);

    // Format Monthly Trend for Recharts
    const trendChartData = useMemo(() => {
        return (monthly_trend || []).map(m => ({
            name: m.month,
            income: Number(m.income || 0),
            expense: Number(m.expense || 0),
            net: Number(m.net || 0),
        }));
    }, [monthly_trend]);

    // Revenue streams array for breakdown
    const revenueStreamsList = useMemo(() => [
        { key: 'package_purchase', label: 'Platform Packages (AzamPay)', amount: income_by_category?.package_purchase || 0, color: '#10b981' },
        { key: 'pass_sales', label: 'Pass Quota Packages', amount: income_by_category?.pass_sales || 0, color: '#3b82f6' },
        { key: 'sms_credits', label: 'Bulk SMS Top-up Credits', amount: income_by_category?.sms_credits || 0, color: '#06b6d4' },
        { key: 'design_service', label: 'Custom 4K Artwork & Branding', amount: income_by_category?.design_service || 0, color: '#f59e0b' },
        { key: 'subscription', label: 'Enterprise Subscriptions', amount: income_by_category?.subscription || 0, color: '#8b5cf6' },
        { key: 'other_income', label: 'Direct Wire & Other Income', amount: income_by_category?.other_income || 0, color: '#64748b' },
    ], [income_by_category]);

    // Expense cost centers array for breakdown
    const expenseCentersList = useMemo(() => [
        { key: 'carrier_sms', label: 'Carrier SMS Wholesale (COGS)', amount: expense_by_category?.carrier_sms || 0, color: '#f43f5e' },
        { key: 'whatsapp_api', label: 'Meta WhatsApp Cloud API (COGS)', amount: expense_by_category?.whatsapp_api || 0, color: '#f97316' },
        { key: 'server_infrastructure', label: 'Server & Cloud Hosting Nodes', amount: expense_by_category?.server_infrastructure || 0, color: '#0284c7' },
        { key: 'payment_fees', label: 'Payment Gateway & MDR Fees', amount: expense_by_category?.payment_fees || 0, color: '#a855f7' },
        { key: 'operations', label: 'Operations & Maintenance', amount: expense_by_category?.operations || 0, color: '#d97706' },
    ], [expense_by_category]);

    // Period Options
    const PERIOD_OPTIONS = [
        { id: 'all', label: 'All Time' },
        { id: '7days', label: '7 Days' },
        { id: '30days', label: '30 Days' },
        { id: '90days', label: '90 Days' },
        { id: 'half_year', label: 'Half-Year' },
        { id: 'this_year', label: 'Year 2026' },
        { id: 'custom', label: 'Custom' },
    ];

    return (
        <KardovoAppLayout
            title="Financial Analysis"
            headerActions={
                <div className="flex items-center gap-2">
                    {/* Live Spot FX Rate Button */}
                    <button
                        type="button"
                        onClick={() => setFxModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-200 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] rounded-xl shadow-xs transition cursor-pointer"
                        title="Live USD/TZS Spot Exchange Rate"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncingFx ? 'animate-spin' : ''}`} />
                        <span className="font-mono text-slate-100">1 USD ≈ {Number(activeFxRate).toLocaleString()} TZS</span>
                    </button>

                    {/* Consolidated Export Dropdown */}
                    <div className="relative" ref={exportDropdownRef}>
                        <button
                            type="button"
                            onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-200 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] rounded-xl shadow-xs transition cursor-pointer"
                        >
                            <Download className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Export</span>
                            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${exportDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {exportDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-64 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700/80 p-1.5 z-50 animate-fadeIn space-y-0.5">
                                <a
                                    href={route('admin.finance.exportPdf', { 
                                        period: period,
                                        from: period === 'custom' ? customFrom : '',
                                        to: period === 'custom' ? customTo : '',
                                    })}
                                    onClick={() => setExportDropdownOpen(false)}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/[0.08] hover:text-white rounded-xl transition text-left cursor-pointer"
                                >
                                    <FileText className="w-4 h-4 text-rose-400 shrink-0" />
                                    <div>
                                        <div className="font-bold">Executive Statement (PDF)</div>
                                        <div className="text-[10px] text-slate-400 font-normal">Formatted print-ready statement</div>
                                    </div>
                                </a>

                                <a
                                    href={route('admin.finance.export', {
                                        period: period,
                                        from: period === 'custom' ? customFrom : '',
                                        to: period === 'custom' ? customTo : '',
                                        format: 'ledger',
                                        type: ledgerTypeFilter,
                                        category: ledgerCategoryFilter,
                                        search: ledgerSearchTerm,
                                    })}
                                    onClick={() => setExportDropdownOpen(false)}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/[0.08] hover:text-white rounded-xl transition text-left cursor-pointer"
                                >
                                    <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                                    <div>
                                        <div className="font-bold">Transaction Ledger (CSV)</div>
                                        <div className="text-[10px] text-slate-400 font-normal">Line-by-line itemized ledger</div>
                                    </div>
                                </a>

                                <a
                                    href={route('admin.finance.export', { 
                                        format: 'cashflow',
                                        period: period,
                                        from: period === 'custom' ? customFrom : '',
                                        to: period === 'custom' ? customTo : '',
                                    })}
                                    onClick={() => setExportDropdownOpen(false)}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/[0.08] hover:text-white rounded-xl transition text-left cursor-pointer"
                                >
                                    <BarChart3 className="w-4 h-4 text-blue-400 shrink-0" />
                                    <div>
                                        <div className="font-bold">Cashflow Statement (CSV)</div>
                                        <div className="text-[10px] text-slate-400 font-normal">Monthly & annual matrix</div>
                                    </div>
                                </a>

                                <div className="border-t border-white/10 my-1"></div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setExportDropdownOpen(false);
                                        setExportConfig(prev => ({ ...prev, period: period, from: customFrom, to: customTo }));
                                        setExportModalOpen(true);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-emerald-400 hover:bg-white/[0.08] hover:text-emerald-300 rounded-xl transition text-left cursor-pointer"
                                >
                                    <SlidersHorizontal className="w-4 h-4 shrink-0" />
                                    <div>
                                        <div className="font-bold">Custom Report Wizard...</div>
                                        <div className="text-[10px] text-slate-400 font-normal">Custom date ranges & parameters</div>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* New Entry Action Dropdown */}
                    <div className="relative" ref={actionDropdownRef}>
                        <button
                            type="button"
                            onClick={() => setActionDropdownOpen(!actionDropdownOpen)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Record Entry</span>
                            <ChevronDown className={`w-3 h-3 transition-transform ${actionDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {actionDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700/80 p-1.5 z-50 animate-fadeIn space-y-0.5">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActionDropdownOpen(false);
                                        txForm.setData({
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
                                        setTxModalOpen(true);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/[0.08] hover:text-white rounded-xl transition text-left cursor-pointer"
                                >
                                    <ArrowUpRight className="w-4 h-4 text-emerald-400 shrink-0" />
                                    <div>
                                        <div className="font-bold">Record Income</div>
                                        <div className="text-[10px] text-slate-400 font-normal">Client payment, pass sales, top-ups</div>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setActionDropdownOpen(false);
                                        openCreateBillModal();
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/[0.08] hover:text-white rounded-xl transition text-left cursor-pointer"
                                >
                                    <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                                    <div>
                                        <div className="font-bold">Log Billed Expense</div>
                                        <div className="text-[10px] text-slate-400 font-normal">Vendor bill, rent, server, recurring</div>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            }
        >
            <Head title="Financial Analysis — Kardovo Admin" />

            <div className="max-w-7xl mx-auto space-y-5">

                {/* PERIOD SELECTOR */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
                    <div>
                        <h1 className="text-xl font-black text-slate-900 dark:text-white font-display tracking-tight">Financial Analysis</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Platform revenues, COGS, margins & payables.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <div className="inline-flex items-center gap-0.5 p-0.5 rounded-xl bg-slate-100 dark:bg-black/30 border border-slate-200/80 dark:border-white/[0.08]">
                            {PERIOD_OPTIONS.map((p) => (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => {
                                        if (p.id === 'custom') {
                                            setCustomDatePickerOpen(prev => !prev);
                                        } else {
                                            setCustomDatePickerOpen(false);
                                            handlePeriodChange(p.id);
                                        }
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition active:scale-95 cursor-pointer ${
                                        period === p.id
                                            ? 'bg-emerald-600 text-white shadow-xs'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/[0.06]'
                                    }`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                        {(customDatePickerOpen || period === 'custom') && (
                            <div className="inline-flex items-center gap-2 p-1.5 rounded-xl bg-slate-100 dark:bg-black/30 border border-slate-200/80 dark:border-white/[0.08] text-xs animate-fadeIn">
                                <span className="text-slate-500 text-[11px] font-medium pl-1">From:</span>
                                <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-[#0B1524] font-mono text-slate-800 dark:text-slate-200" />
                                <span className="text-slate-500 text-[11px] font-medium">To:</span>
                                <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-[#0B1524] font-mono text-slate-800 dark:text-slate-200" />
                                <button type="button" onClick={() => handlePeriodChange('custom', customFrom, customTo)} disabled={!customFrom && !customTo} className="px-3 py-1 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition cursor-pointer text-xs disabled:opacity-50">Apply</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* STAT STRIP */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-200/60 dark:bg-white/[0.06] rounded-2xl overflow-hidden border border-slate-200/60 dark:border-white/[0.06]">
                    {[
                        {
                            label: 'Revenue',
                            value: formatTzs(metrics.gross_revenue),
                            sub: formatUsd(metrics.gross_revenue),
                            accent: 'text-emerald-600 dark:text-emerald-400',
                        },
                        {
                            label: 'Expenses',
                            value: formatTzs(metrics.total_expenses),
                            sub: `COGS: ${formatTzs(metrics.direct_cogs)}`,
                            accent: 'text-rose-600 dark:text-rose-400',
                        },
                        {
                            label: 'Gross Profit',
                            value: formatTzs(metrics.gross_profit),
                            sub: `${metrics.gross_margin_pct || 0}% margin`,
                            accent: 'text-amber-600 dark:text-amber-400',
                        },
                        {
                            label: 'Net Profit',
                            value: formatTzs(metrics.net_profit),
                            sub: `${metrics.net_margin_pct || 0}% net`,
                            accent: (metrics.net_profit || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400',
                        },
                    ].map(({ label, value, sub, accent }) => (
                        <div key={label} className="bg-white dark:bg-[#0F172A] px-5 py-4">
                            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">{label}</div>
                            <div className={`text-lg font-black font-mono mt-1 ${accent}`}>{value}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{sub}</div>
                        </div>
                    ))}
                </div>

                {/* PAYABLES ALERT — slim inline strip */}
                {hasUrgentAlerts && !alertBannerDismissed && (
                    <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-amber-400/30 bg-amber-50 dark:bg-amber-950/20 text-xs animate-fadeIn">
                        <div className="flex items-center gap-2">
                            <BellRing className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span className="text-slate-700 dark:text-slate-300 font-medium">
                                <span className="font-bold text-rose-600 dark:text-rose-400">{formatTzs((reminders.overdue_amount || 0) + (reminders.due_this_week_amount || 0))}</span> in payables require attention —&nbsp;
                                {reminders.overdue_count > 0 && <span className="text-rose-600 font-bold">{reminders.overdue_count} overdue</span>}
                                {reminders.overdue_count > 0 && reminders.due_this_week_count > 0 && ', '}
                                {reminders.due_this_week_count > 0 && <span className="text-amber-600 font-bold">{reminders.due_this_week_count} due this week</span>}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <button type="button" onClick={() => setActiveTab('bills')} className="px-3 py-1 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition cursor-pointer">Review Bills</button>
                            <button type="button" onClick={() => setAlertBannerDismissed(true)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                        </div>
                    </div>
                )}

                {/* ═══════════════ MAIN STRUCTURED WORKSPACE TABS ═══════════════ */}
                <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.08] pb-px">
                    <div className="inline-flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-black/30 border border-slate-200/80 dark:border-white/[0.08]">
                        {[
                            { id: 'overview', label: 'Overview & P&L', icon: BarChart3 },
                            { 
                                id: 'ledger', 
                                label: 'Ledger & Transactions', 
                                icon: ArrowUpDown, 
                                count: transactions.length 
                            },
                            { 
                                id: 'bills', 
                                label: 'Accounts Payable & Bills', 
                                icon: Clock, 
                                count: bills.filter(b => b.status === 'pending' || b.status === 'overdue').length,
                                isWarning: reminders?.overdue_count > 0
                            },
                            { id: 'cashflow', label: 'Cash Flow Statement', icon: Calendar },
                        ].map((tab) => {
                            const IconComponent = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer ${
                                        isActive
                                            ? 'bg-emerald-600 text-white shadow-xs'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/[0.06]'
                                    }`}
                                >
                                    <IconComponent className="w-3.5 h-3.5 stroke-[2.2] shrink-0" />
                                    <span>{tab.label}</span>
                                    {typeof tab.count === 'number' && tab.count > 0 && (
                                        <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10.5px] font-mono font-bold leading-none ${
                                            isActive 
                                                ? 'bg-white/20 text-white' 
                                                : tab.isWarning
                                                    ? 'bg-rose-500 text-white'
                                                    : 'bg-slate-200 dark:bg-white/[0.1] text-slate-700 dark:text-slate-300'
                                        }`}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════════
                    TAB 1: OVERVIEW & P&L INTELLIGENCE
                ═══════════════════════════════════════════════════════════════ */}
                {activeTab === 'overview' && (
                    <div className="space-y-6 animate-fadeIn">
                        {/* Visual Analytics Grid: Recharts Trajectory & Revenue/Cost Distribution */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                            {/* Left: Recharts Trajectory (7 cols) */}
                            <div className="lg:col-span-7 bg-white dark:bg-[#0F172A] p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-display">6-Month Cashflow</h3>
                                        <p className="text-xs text-slate-400 mt-0.5">Revenue vs expenses over rolling months.</p>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs font-bold">
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                            <span className="text-slate-600 dark:text-slate-300">Revenue</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                                            <span className="text-slate-600 dark:text-slate-300">Expenses</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-72 w-full pt-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={trendChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                                                </linearGradient>
                                                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" strokeOpacity={0.15} />
                                            <XAxis 
                                                dataKey="name" 
                                                axisLine={false} 
                                                tickLine={false} 
                                                tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} 
                                                dy={8} 
                                            />
                                            <YAxis 
                                                axisLine={false} 
                                                tickLine={false} 
                                                tickFormatter={formatCompactTzs}
                                                tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'monospace' }} 
                                            />
                                            <Tooltip 
                                                content={({ active, payload, label }) => {
                                                    if (active && payload && payload.length) {
                                                        const inc = payload.find(p => p.dataKey === 'income')?.value || 0;
                                                        const exp = payload.find(p => p.dataKey === 'expense')?.value || 0;
                                                        const net = inc - exp;
                                                        return (
                                                            <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-3 shadow-xl text-xs space-y-1.5 font-mono">
                                                                <div className="font-sans font-bold text-white text-xs border-b border-slate-700 pb-1">{label}</div>
                                                                <div className="flex items-center justify-between gap-4 text-emerald-400">
                                                                    <span>Revenue:</span>
                                                                    <span className="font-bold">+{formatTzs(inc)}</span>
                                                                </div>
                                                                <div className="flex items-center justify-between gap-4 text-rose-400">
                                                                    <span>Expenses:</span>
                                                                    <span className="font-bold">-{formatTzs(exp)}</span>
                                                                </div>
                                                                <div className="pt-1 border-t border-slate-700 flex items-center justify-between gap-4 font-bold">
                                                                    <span className="text-slate-300">Net Profit:</span>
                                                                    <span className={net >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                                                                        {net >= 0 ? '+' : ''}{formatTzs(net)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                            <Area 
                                                type="monotone" 
                                                dataKey="income" 
                                                stroke="#10b981" 
                                                strokeWidth={2.5} 
                                                fillOpacity={1} 
                                                fill="url(#colorIncome)" 
                                            />
                                            <Area 
                                                type="monotone" 
                                                dataKey="expense" 
                                                stroke="#f43f5e" 
                                                strokeWidth={2.5} 
                                                fillOpacity={1} 
                                                fill="url(#colorExpense)" 
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Right: Revenue & Cost Distribution Breakdowns (5 cols) */}
                            <div className="lg:col-span-5 space-y-4">
                                {/* Revenue Breakdown Card */}
                                <div className="bg-white dark:bg-[#0F172A] p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                                <TrendingUp className="w-3.5 h-3.5" />
                                            </div>
                                            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-display">
                                                Revenue Streams
                                            </h3>
                                        </div>
                                        <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                            {formatTzs(metrics.gross_revenue)}
                                        </span>
                                    </div>

                                    <div className="space-y-2.5 pt-1">
                                        {revenueStreamsList.map((item) => {
                                            const pct = metrics.gross_revenue > 0 ? Math.round((item.amount / metrics.gross_revenue) * 100) : 0;
                                            return (
                                                <div key={item.key} className="space-y-1">
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5 truncate">
                                                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                                                            <span className="truncate">{item.label}</span>
                                                        </span>
                                                        <span className="font-mono font-bold text-slate-900 dark:text-white shrink-0 ml-2">
                                                            {formatTzs(item.amount)} ({pct}%)
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 dark:bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full rounded-full transition-all duration-500" 
                                                            style={{ width: `${pct}%`, backgroundColor: item.color }} 
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Expense Cost Centers Card */}
                                <div className="bg-white dark:bg-[#0F172A] p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                                                <TrendingDown className="w-3.5 h-3.5" />
                                            </div>
                                            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-display">
                                                Operating Cost Centers
                                            </h3>
                                        </div>
                                        <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                                            {formatTzs(metrics.total_expenses)}
                                        </span>
                                    </div>

                                    <div className="space-y-2.5 pt-1">
                                        {expenseCentersList.map((item) => {
                                            const pct = metrics.total_expenses > 0 ? Math.round((item.amount / metrics.total_expenses) * 100) : 0;
                                            return (
                                                <div key={item.key} className="space-y-1">
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5 truncate">
                                                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                                                            <span className="truncate">{item.label}</span>
                                                        </span>
                                                        <span className="font-mono font-bold text-slate-900 dark:text-white shrink-0 ml-2">
                                                            {formatTzs(item.amount)} ({pct}%)
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 dark:bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full rounded-full transition-all duration-500" 
                                                            style={{ width: `${pct}%`, backgroundColor: item.color }} 
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                )}

                {/* ═══════════════════════════════════════════════════════════════
                    TAB 2: TRANSACTIONS & FINANCIAL LEDGER
                ═══════════════════════════════════════════════════════════════ */}
                {activeTab === 'ledger' && (
                    <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs overflow-hidden space-y-4 animate-fadeIn">
                        {/* Header & Filter Controls */}
                        <div className="p-5 border-b border-slate-200/80 dark:border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-display">
                                    Reconciled Financial Ledger
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Line-by-line itemized ledger of platform customer inflows, carrier settlements, and operational expenses.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                {/* Type Scope Toggle */}
                                <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-black/30 border border-slate-200/80 dark:border-white/[0.08]">
                                    {[
                                        { id: 'all', label: 'All Entries' },
                                        { id: 'income', label: 'Inflows Only' },
                                        { id: 'expense', label: 'Outflows Only' },
                                    ].map(type => (
                                        <button
                                            key={type.id}
                                            type="button"
                                            onClick={() => {
                                                setLedgerTypeFilter(type.id);
                                                setLedgerPage(1);
                                            }}
                                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition active:scale-95 cursor-pointer ${
                                                ledgerTypeFilter === type.id
                                                    ? 'bg-emerald-600 text-white shadow-xs'
                                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                            }`}
                                        >
                                            {type.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Category Selector */}
                                <select
                                    value={ledgerCategoryFilter}
                                    onChange={(e) => {
                                        setLedgerCategoryFilter(e.target.value);
                                        setLedgerPage(1);
                                    }}
                                    className="text-xs rounded-xl bg-slate-100 dark:bg-black/30 border-slate-200/80 dark:border-white/[0.08] text-slate-900 dark:text-white px-3 py-1.5"
                                >
                                    <option value="all">All Categories</option>
                                    <optgroup label="Inflows / Revenue">
                                        <option value="package_purchase">Platform Packages (AzamPay)</option>
                                        <option value="pass_sales">Pass Quota Sales</option>
                                        <option value="sms_credits">SMS Top-up Credits</option>
                                        <option value="design_service">Custom 4K Artwork</option>
                                        <option value="subscription">Subscriptions</option>
                                        <option value="other_income">Other Inflow</option>
                                    </optgroup>
                                    <optgroup label="Outflows / Expenses">
                                        <option value="carrier_sms_cogs">Carrier SMS COGS</option>
                                        <option value="whatsapp_api_cogs">WhatsApp Cloud API</option>
                                        <option value="server_infrastructure">Server Hosting</option>
                                        <option value="payment_gateway_fee">Payment Gateway Fees</option>
                                        <option value="operations">General Operations</option>
                                    </optgroup>
                                </select>

                                {/* Search Bar */}
                                <div className="relative w-full sm:w-56">
                                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={ledgerSearchTerm}
                                        onChange={(e) => {
                                            setLedgerSearchTerm(e.target.value);
                                            setLedgerPage(1);
                                        }}
                                        placeholder="Search #, client, ref..."
                                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-black/30 border-slate-200/80 dark:border-white/[0.08] text-slate-900 dark:text-white placeholder-slate-400 focus:ring-emerald-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Transactions Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                                <thead className="bg-slate-50 dark:bg-white/[0.02] text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200/70 dark:border-white/[0.06]">
                                    <tr>
                                        <th className="px-5 py-3">Transaction #</th>
                                        <th className="px-5 py-3">Category</th>
                                        <th className="px-5 py-3">Client / Event</th>
                                        <th className="px-5 py-3">Method &amp; Ref</th>
                                        <th className="px-5 py-3 text-right">Amount (TZS)</th>
                                        <th className="px-5 py-3 text-center">Status</th>
                                        <th className="px-5 py-3">Date</th>
                                        <th className="px-5 py-3 text-right">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                                    {paginatedTransactions.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="px-5 py-12 text-center text-slate-400">
                                                No ledger transactions found matching filter criteria.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedTransactions.map((tx) => {
                                            const catInfo = CATEGORY_MAP[tx.category] || { label: tx.category, badgeClass: 'bg-slate-100 text-slate-700' };
                                            const isIncome = tx.type === 'income';

                                            return (
                                                <tr key={tx.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition">
                                                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                                                        {tx.transaction_number}
                                                    </td>
                                                    <td className="px-5 py-3.5 whitespace-nowrap">
                                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${catInfo.badgeClass}`}>
                                                            {catInfo.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <div className="font-bold text-slate-900 dark:text-white truncate max-w-[180px]">
                                                            {tx.user?.name || tx.user?.company || 'Direct System'}
                                                        </div>
                                                        <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                                                            {tx.event?.title || tx.title}
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3.5 font-mono text-[11px] whitespace-nowrap">
                                                        <div className="font-semibold text-slate-800 dark:text-slate-200">{tx.payment_method}</div>
                                                        <div className="text-[10px] text-slate-400">{tx.reference || 'None'}</div>
                                                    </td>
                                                    <td className="px-5 py-3.5 text-right font-mono font-bold whitespace-nowrap">
                                                        <span className={isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                                                            {isIncome ? '+' : '-'}{formatTzs(tx.amount)}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3.5 text-center whitespace-nowrap">
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                            tx.status === 'completed' 
                                                                ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400' 
                                                                : tx.status === 'pending'
                                                                    ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400'
                                                                    : 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400'
                                                        }`}>
                                                            {tx.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                                                        {tx.transaction_date ? new Date(tx.transaction_date).toLocaleDateString('en-GB') : 'N/A'}
                                                    </td>
                                                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                                        <button
                                                            type="button"
                                                            onClick={() => setViewingTx(tx)}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition cursor-pointer"
                                                            title="View Payment Audit Receipt"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalLedgerPages > 1 && (
                            <div className="p-4 border-t border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between text-xs text-slate-500">
                                <div>
                                    Showing page <strong className="font-mono text-slate-900 dark:text-white">{ledgerPage}</strong> of <strong className="font-mono text-slate-900 dark:text-white">{totalLedgerPages}</strong> ({filteredTransactions.length} entries)
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        disabled={ledgerPage <= 1}
                                        onClick={() => setLedgerPage(p => Math.max(1, p - 1))}
                                        className="p-1.5 rounded-xl border border-slate-200 dark:border-white/[0.08] disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition cursor-pointer"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        disabled={ledgerPage >= totalLedgerPages}
                                        onClick={() => setLedgerPage(p => Math.min(totalLedgerPages, p + 1))}
                                        className="p-1.5 rounded-xl border border-slate-200 dark:border-white/[0.08] disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition cursor-pointer"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════════════════
                    TAB 3: ACCOUNTS PAYABLE & BILLED EXPENSES
                ═══════════════════════════════════════════════════════════════ */}
                {activeTab === 'bills' && (
                    <div className="space-y-6 animate-fadeIn">
                        {/* Mini Summary Cards for AP */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-rose-300 dark:border-rose-900/50 shadow-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Overdue Payables</span>
                                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                                </div>
                                <div className="text-2xl font-black font-mono text-rose-600 dark:text-rose-400 mt-2">
                                    {formatTzs(reminders?.overdue_amount || 0)}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                    {reminders?.overdue_count || 0} critical bill(s) past payment deadline
                                </div>
                            </div>

                            <div className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-amber-300 dark:border-amber-900/50 shadow-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Due This Week</span>
                                    <Clock className="w-4 h-4 text-amber-500" />
                                </div>
                                <div className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400 mt-2">
                                    {formatTzs(reminders?.due_this_week_amount || 0)}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                    {reminders?.due_this_week_count || 0} bill(s) due within next 7 days
                                </div>
                            </div>

                            <div className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Unpaid Liabilities</span>
                                    <Building2 className="w-4 h-4 text-slate-400" />
                                </div>
                                <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-2">
                                    {formatTzs(reminders?.total_pending_payables || 0)}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                    Committed operational overhead
                                </div>
                            </div>
                        </div>

                        {/* Critical Alerts Banner List (if any) */}
                        {reminders?.critical_alerts && reminders.critical_alerts.length > 0 && (
                            <div className="bg-white dark:bg-[#0F172A] p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs space-y-3">
                                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-display">
                                    Action Required: Upcoming &amp; Past Due Liabilities
                                </h4>
                                <div className="space-y-2">
                                    {reminders.critical_alerts.map((alert) => (
                                        <div
                                            key={alert.id}
                                            className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                                alert.is_overdue
                                                    ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
                                                    : 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white ${
                                                    alert.is_overdue ? 'bg-rose-500' : 'bg-amber-500'
                                                }`}>
                                                    {alert.is_overdue ? <AlertCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">{alert.bill_number}</span>
                                                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200">— {alert.vendor_name}</span>
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 mt-0.5">{alert.title}</div>
                                                    <div className={`text-[10.5px] font-mono mt-0.5 font-bold ${alert.is_overdue ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                                        {alert.is_overdue ? `Overdue by ${Math.abs(alert.days_remaining)} day(s)` : `Due in ${alert.days_remaining} day(s)`} ({alert.due_date})
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 self-end sm:self-center">
                                                <div className="text-right font-mono font-bold text-sm text-slate-900 dark:text-white">
                                                    {formatTzs(alert.amount)}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const targetBill = bills.find(b => b.id === alert.id);
                                                        if (targetBill) openPayBillModal(targetBill);
                                                    }}
                                                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition cursor-pointer"
                                                >
                                                    Pay Now
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const targetBill = bills.find(b => b.id === alert.id);
                                                        if (targetBill) handleSendReminder(targetBill);
                                                    }}
                                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-white/[0.1] text-slate-600 dark:text-slate-300 hover:text-amber-500 transition cursor-pointer"
                                                    title="Re-send Email Alert"
                                                >
                                                    <Send className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Main Bills Table Card */}
                        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs overflow-hidden space-y-4">
                            {/* Table Header & Search Controls */}
                            <div className="p-5 border-b border-slate-200/80 dark:border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-display">
                                        Accounts Payable Register
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        Scheduled vendor invoices, recurring infrastructure costs, and direct settlement workflows.
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <div className="relative w-full sm:w-56">
                                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            value={billSearchTerm}
                                            onChange={(e) => setBillSearchTerm(e.target.value)}
                                            placeholder="Search vendor, bill #..."
                                            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-black/30 border-slate-200/80 dark:border-white/[0.08] text-slate-900 dark:text-white placeholder-slate-400 focus:ring-emerald-500"
                                        />
                                    </div>

                                    {/* Status Filter */}
                                    <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-black/30 border border-slate-200/80 dark:border-white/[0.08]">
                                        {[
                                            { id: 'all', label: 'All Bills' },
                                            { id: 'pending', label: 'Pending' },
                                            { id: 'overdue', label: 'Overdue' },
                                            { id: 'paid', label: 'Paid' },
                                        ].map((s) => (
                                            <button
                                                key={s.id}
                                                type="button"
                                                onClick={() => setBillStatusFilter(s.id)}
                                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition active:scale-95 cursor-pointer ${
                                                    billStatusFilter === s.id
                                                        ? 'bg-emerald-600 text-white shadow-xs'
                                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                                }`}
                                            >
                                                {s.label}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={openCreateBillModal}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Log Bill</span>
                                    </button>
                                </div>
                            </div>

                            {/* Bills Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                                    <thead className="bg-slate-50 dark:bg-white/[0.02] text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200/70 dark:border-white/[0.06]">
                                        <tr>
                                            <th className="px-5 py-3">Bill # &amp; Vendor</th>
                                            <th className="px-5 py-3">Category</th>
                                            <th className="px-5 py-3">Description</th>
                                            <th className="px-5 py-3">Due Date</th>
                                            <th className="px-5 py-3 text-right">Amount (TZS)</th>
                                            <th className="px-5 py-3 text-center">Recurrence</th>
                                            <th className="px-5 py-3 text-center">Status</th>
                                            <th className="px-5 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                                        {filteredBills.length === 0 ? (
                                            <tr>
                                                <td colSpan="8" className="px-5 py-12 text-center text-slate-400">
                                                    No billed expenses found matching filter criteria.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredBills.map((b) => {
                                                const catInfo = CATEGORY_MAP[b.category] || { label: b.category, badgeClass: 'bg-slate-100 text-slate-700' };
                                                const isOverdue = b.status === 'overdue';
                                                const isPaid = b.status === 'paid';
                                                const isPending = b.status === 'pending';

                                                return (
                                                    <tr key={b.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition">
                                                        <td className="px-5 py-3.5">
                                                            <div className="font-mono font-bold text-slate-900 dark:text-white">
                                                                {b.bill_number}
                                                            </div>
                                                            <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                                                                {b.vendor_name}
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-3.5 whitespace-nowrap">
                                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${catInfo.badgeClass}`}>
                                                                {catInfo.label}
                                                            </span>
                                                        </td>
                                                        <td className="px-5 py-3.5">
                                                            <div className="font-medium text-slate-800 dark:text-slate-200 max-w-[200px] truncate">
                                                                {b.title}
                                                            </div>
                                                            {b.vendor_account_reference && (
                                                                <div className="text-[10px] font-mono text-slate-400">
                                                                    Ref: {b.vendor_account_reference}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-5 py-3.5 whitespace-nowrap">
                                                            <div className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                                                                {b.due_date ? new Date(b.due_date).toLocaleDateString('en-GB') : 'N/A'}
                                                            </div>
                                                            {isOverdue && (
                                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                                                                    <AlertCircle className="w-3 h-3" /> Overdue
                                                                </span>
                                                            )}
                                                            {isPending && (
                                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                                                                    <Clock className="w-3 h-3" /> Pending
                                                                </span>
                                                            )}
                                                            {isPaid && (
                                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                                                    <CheckCircle className="w-3 h-3" /> Settled
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-5 py-3.5 text-right font-mono font-bold whitespace-nowrap text-slate-900 dark:text-white">
                                                            {formatTzs(b.amount)}
                                                        </td>
                                                        <td className="px-5 py-3.5 text-center whitespace-nowrap">
                                                            {b.is_recurring ? (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40">
                                                                    <Repeat className="w-3 h-3" /> {b.recurrence_period || 'Monthly'}
                                                                </span>
                                                            ) : (
                                                                <span className="text-[10px] text-slate-400">One-off</span>
                                                            )}
                                                        </td>
                                                        <td className="px-5 py-3.5 text-center whitespace-nowrap">
                                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                                isPaid 
                                                                    ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400'
                                                                    : isOverdue
                                                                        ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 animate-pulse'
                                                                        : 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400'
                                                            }`}>
                                                                {b.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                                            <div className="flex items-center justify-end gap-1.5">
                                                                {!isPaid && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => openPayBillModal(b)}
                                                                        className="px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-xs cursor-pointer"
                                                                        title="Settle Bill &amp; Record Outflow"
                                                                    >
                                                                        Pay Now
                                                                    </button>
                                                                )}
                                                                {!isPaid && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleSendReminder(b)}
                                                                        className="p-1 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition cursor-pointer"
                                                                        title="Send Reminder Notification"
                                                                    >
                                                                        <Send className="w-3.5 h-3.5" />
                                                                    </button>
                                                                )}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openEditBillModal(b)}
                                                                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition cursor-pointer"
                                                                    title="Edit Bill Details"
                                                                >
                                                                    <SlidersHorizontal className="w-3.5 h-3.5" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDeleteBill(b)}
                                                                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                                                                    title="Delete Bill"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════════════════
                    TAB 4: CASH FLOW STATEMENT MATRIX
                ═══════════════════════════════════════════════════════════════ */}
                {activeTab === 'cashflow' && (
                    <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs overflow-hidden animate-fadeIn space-y-4">
                        <div className="p-5 border-b border-slate-200/80 dark:border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-display">
                                    Monthly &amp; Annual Cash Flow Statement
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Audit-ready reconciliation of gross receipts, operational outflows, wholesale COGS, and operating margins.
                                </p>
                            </div>

                            {/* Year Switcher */}
                            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-black/30 border border-slate-200/80 dark:border-white/[0.08]">
                                <button
                                    type="button"
                                    onClick={() => handleYearChange('all')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition active:scale-95 cursor-pointer ${
                                        selectedYear === 'all'
                                            ? 'bg-emerald-600 text-white shadow-xs'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    All Recorded Months
                                </button>
                                {available_years.map((yr) => (
                                    <button
                                        key={yr}
                                        type="button"
                                        onClick={() => handleYearChange(String(yr))}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition active:scale-95 cursor-pointer ${
                                            String(selectedYear) === String(yr)
                                                ? 'bg-emerald-600 text-white shadow-xs'
                                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                    >
                                        Year {yr}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Cashflow Matrix Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                                <thead className="bg-slate-50 dark:bg-white/[0.02] text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200/70 dark:border-white/[0.06]">
                                    <tr>
                                        <th className="px-6 py-3.5">Month / Accounting Period</th>
                                        <th className="px-6 py-3.5 text-right text-emerald-600 dark:text-emerald-400">Inflows (Gross Rev)</th>
                                        <th className="px-6 py-3.5 text-right text-rose-600 dark:text-rose-400">Outflows (OpEx)</th>
                                        <th className="px-6 py-3.5 text-right text-amber-600 dark:text-amber-400">Direct Carrier COGS</th>
                                        <th className="px-6 py-3.5 text-right text-slate-900 dark:text-white">Net Cashflow</th>
                                        <th className="px-6 py-3.5 text-center">Net Margin</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04] font-mono">
                                    {monthly_cashflow.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-slate-400 font-sans">
                                                No cashflow data recorded for this period.
                                            </td>
                                        </tr>
                                    ) : (
                                        monthly_cashflow.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition">
                                                <td className="px-6 py-3.5 font-bold text-slate-900 dark:text-white">
                                                    {row.month_name}
                                                </td>
                                                <td className="px-6 py-3.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
                                                    +{formatTzs(row.inflow)}
                                                </td>
                                                <td className="px-6 py-3.5 text-right font-bold text-rose-600 dark:text-rose-400">
                                                    -{formatTzs(row.outflow)}
                                                </td>
                                                <td className="px-6 py-3.5 text-right text-amber-600 dark:text-amber-400">
                                                    {formatTzs(row.direct_cogs)}
                                                </td>
                                                <td className={`px-6 py-3.5 text-right font-black ${
                                                    row.net_cashflow >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                                                }`}>
                                                    {row.net_cashflow >= 0 ? '+' : ''}{formatTzs(row.net_cashflow)}
                                                </td>
                                                <td className="px-6 py-3.5 text-center font-bold">
                                                    <span className={`px-2 py-0.5 rounded-md text-[10.5px] ${
                                                        row.net_margin_pct >= 0 
                                                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                                            : 'bg-rose-500/10 text-rose-700 dark:text-rose-400'
                                                    }`}>
                                                        {row.net_margin_pct}%
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </div>

            {/* ═══════════════ MODAL: LOG / EDIT BILLED EXPENSE ═══════════════ */}
            <Modal show={billModalOpen} onClose={() => setBillModalOpen(false)} maxWidth="xl">
                <form onSubmit={handleSubmitBill} className="p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.08] pb-3">
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-amber-500" />
                            <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                                {editingBill ? 'Edit Billed Expense' : 'Log New Billed Expense (Accounts Payable)'}
                            </h3>
                        </div>
                        <button type="button" onClick={() => setBillModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <InputLabel value="Vendor / Creditor Name *" />
                            <TextInput
                                type="text"
                                value={billForm.data.vendor_name}
                                onChange={(e) => billForm.setData('vendor_name', e.target.value)}
                                placeholder="e.g. NextSMS, Contabo, Meta Cloud"
                                className="w-full mt-1"
                                required
                            />
                        </div>

                        <div>
                            <InputLabel value="Category *" />
                            <select
                                value={billForm.data.category}
                                onChange={(e) => billForm.setData('category', e.target.value)}
                                className="w-full mt-1 text-xs rounded-xl bg-slate-100 dark:bg-[#0B1524] border-slate-200/80 dark:border-white/[0.08] text-slate-900 dark:text-white"
                                required
                            >
                                <option value="carrier_sms_cogs">Carrier SMS Wholesale (COGS)</option>
                                <option value="whatsapp_api_cogs">Meta WhatsApp Cloud API (COGS)</option>
                                <option value="server_infrastructure">Cloud Server Infrastructure</option>
                                <option value="payment_gateway_fee">Payment Gateway &amp; Merchant Fees</option>
                                <option value="operations">General Operations &amp; Hardware</option>
                                <option value="marketing">Marketing &amp; Advertising</option>
                                <option value="office_rent">Office Rent &amp; Utilities</option>
                                <option value="legal_compliance">Legal &amp; Compliance</option>
                                <option value="other">Other Expense</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <InputLabel value="Bill Description / Title *" />
                        <TextInput
                            type="text"
                            value={billForm.data.title}
                            onChange={(e) => billForm.setData('title', e.target.value)}
                            placeholder="e.g. Monthly 20,000 SMS Delivery Quota"
                            className="w-full mt-1"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <InputLabel value="Amount (TZS) *" />
                            <TextInput
                                type="number"
                                min="1"
                                value={billForm.data.amount}
                                onChange={(e) => billForm.setData('amount', e.target.value)}
                                placeholder="150000"
                                className="w-full mt-1 font-mono"
                                required
                            />
                        </div>

                        <div>
                            <InputLabel value="Invoice / Bill Date *" />
                            <TextInput
                                type="date"
                                value={billForm.data.bill_date}
                                onChange={(e) => billForm.setData('bill_date', e.target.value)}
                                className="w-full mt-1 font-mono"
                                required
                            />
                        </div>

                        <div>
                            <InputLabel value="Payment Due Date *" />
                            <TextInput
                                type="date"
                                value={billForm.data.due_date}
                                onChange={(e) => billForm.setData('due_date', e.target.value)}
                                className="w-full mt-1 font-mono"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <InputLabel value="Intended Payment Method" />
                            <select
                                value={billForm.data.payment_method_intended}
                                onChange={(e) => billForm.setData('payment_method_intended', e.target.value)}
                                className="w-full mt-1 text-xs rounded-xl bg-slate-100 dark:bg-[#0B1524] border-slate-200/80 dark:border-white/[0.08] text-slate-900 dark:text-white"
                            >
                                <option value="Bank Wire">Bank Wire Transfer</option>
                                <option value="M-Pesa">M-Pesa (Till / Paybill)</option>
                                <option value="Tigo Pesa">Tigo Pesa</option>
                                <option value="Airtel Money">Airtel Money</option>
                                <option value="Credit Card">Corporate Credit Card</option>
                                <option value="Cash">Cash Voucher</option>
                            </select>
                        </div>

                        <div>
                            <InputLabel value="Vendor Account / Till / IBAN" />
                            <TextInput
                                type="text"
                                value={billForm.data.vendor_account_reference}
                                onChange={(e) => billForm.setData('vendor_account_reference', e.target.value)}
                                placeholder="e.g. Lipa No: 5821948"
                                className="w-full mt-1 font-mono"
                            />
                        </div>
                    </div>

                    {/* Recurring & Reminder Switches */}
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.08] space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-xs font-bold text-slate-900 dark:text-white">Auto-Recurring Cycle</div>
                                <div className="text-[11px] text-slate-500">Automatically spawn next cycle upon payment settlement</div>
                            </div>
                            <input
                                type="checkbox"
                                checked={billForm.data.is_recurring}
                                onChange={(e) => billForm.setData('is_recurring', e.target.checked)}
                                className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                            />
                        </div>

                        {billForm.data.is_recurring && (
                            <div className="pt-2 border-t border-slate-200/60 dark:border-white/[0.06]">
                                <InputLabel value="Recurrence Frequency" />
                                <select
                                    value={billForm.data.recurrence_period}
                                    onChange={(e) => billForm.setData('recurrence_period', e.target.value)}
                                    className="w-full mt-1 text-xs rounded-xl bg-white dark:bg-[#0B1524] border-slate-200/80 dark:border-white/[0.08] text-slate-900 dark:text-white"
                                >
                                    <option value="monthly">Monthly Recurring</option>
                                    <option value="quarterly">Quarterly (Every 3 Months)</option>
                                    <option value="yearly">Annually (Every Year)</option>
                                </select>
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-white/[0.06]">
                            <div>
                                <div className="text-xs font-bold text-slate-900 dark:text-white">Due-Date Reminder Alerts</div>
                                <div className="text-[11px] text-slate-500">Alert admin via notification hub &amp; email before due date</div>
                            </div>
                            <input
                                type="checkbox"
                                checked={billForm.data.reminder_enabled}
                                onChange={(e) => billForm.setData('reminder_enabled', e.target.checked)}
                                className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <SecondaryButton type="button" onClick={() => setBillModalOpen(false)}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton type="submit" disabled={billForm.processing} className="bg-emerald-600 hover:bg-emerald-700">
                            {billForm.processing ? 'Saving...' : editingBill ? 'Update Bill' : 'Save Billed Expense'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* ═══════════════ MODAL: SETTLE / PAY BILLED EXPENSE ═══════════════ */}
            <Modal show={payModalOpen} onClose={() => setPayModalOpen(false)} maxWidth="md">
                {activeBillToPay && (
                    <form onSubmit={handleSubmitPayment} className="p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.08] pb-3">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-emerald-500" />
                                <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                                    Settle Billed Expense &amp; Record Outflow
                                </h3>
                            </div>
                            <button type="button" onClick={() => setPayModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                            <div className="text-xs text-slate-500 font-medium">Payment Settlement For</div>
                            <div className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                                {activeBillToPay.bill_number} — {activeBillToPay.vendor_name}
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-300">{activeBillToPay.title}</div>
                            <div className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400 pt-1">
                                {formatTzs(activeBillToPay.amount)}
                            </div>
                        </div>

                        <div>
                            <InputLabel value="Settlement Payment Method *" />
                            <select
                                value={payForm.data.payment_method}
                                onChange={(e) => payForm.setData('payment_method', e.target.value)}
                                className="w-full mt-1 text-xs rounded-xl bg-slate-100 dark:bg-[#0B1524] border-slate-200/80 dark:border-white/[0.08] text-slate-900 dark:text-white"
                                required
                            >
                                <option value="Bank Wire">Bank Wire Transfer</option>
                                <option value="M-Pesa">M-Pesa (Till / Paybill)</option>
                                <option value="Tigo Pesa">Tigo Pesa</option>
                                <option value="Airtel Money">Airtel Money</option>
                                <option value="Stripe/Card">Corporate Credit Card</option>
                                <option value="Cash">Cash Voucher</option>
                            </select>
                        </div>

                        <div>
                            <InputLabel value="Bank / MNO Reference Code *" />
                            <TextInput
                                type="text"
                                value={payForm.data.reference}
                                onChange={(e) => payForm.setData('reference', e.target.value)}
                                placeholder="e.g. MPESA-Q998271829 or WIRE-09928"
                                className="w-full mt-1 font-mono text-xs"
                                required
                            />
                        </div>

                        <div>
                            <InputLabel value="Payment Date *" />
                            <TextInput
                                type="date"
                                value={payForm.data.payment_date}
                                onChange={(e) => payForm.setData('payment_date', e.target.value)}
                                className="w-full mt-1 font-mono text-xs"
                                required
                            />
                        </div>

                        {activeBillToPay.is_recurring && (
                            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-700 dark:text-indigo-300">
                                ℹ️ This is a recurring bill ({activeBillToPay.recurrence_period}). Settling now will automatically generate the next scheduled cycle.
                            </div>
                        )}

                        <div className="flex justify-end gap-2 pt-2">
                            <SecondaryButton type="button" onClick={() => setPayModalOpen(false)}>
                                Cancel
                            </SecondaryButton>
                            <PrimaryButton type="submit" disabled={payForm.processing} className="bg-emerald-600 hover:bg-emerald-700">
                                {payForm.processing ? 'Confirming...' : 'Confirm & Record to Ledger'}
                            </PrimaryButton>
                        </div>
                    </form>
                )}
            </Modal>

            {/* ═══════════════ MODAL: RECORD INCOME LEDGER ENTRY ═══════════════ */}
            <Modal show={txModalOpen} onClose={() => setTxModalOpen(false)} maxWidth="lg">
                <form onSubmit={(e) => {
                    e.preventDefault();
                    txForm.post(route('admin.finance.store'), {
                        preserveScroll: true,
                        onSuccess: () => setTxModalOpen(false),
                    });
                }} className="p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.08] pb-3">
                        <div className="flex items-center gap-2">
                            <ArrowUpRight className="w-5 h-5 text-emerald-500" />
                            <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                                Record Direct Income to Financial Ledger
                            </h3>
                        </div>
                        <button type="button" onClick={() => setTxModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <InputLabel value="Category *" />
                            <select
                                value={txForm.data.category}
                                onChange={(e) => txForm.setData('category', e.target.value)}
                                className="w-full mt-1 text-xs rounded-xl bg-slate-100 dark:bg-[#0B1524] border-slate-200/80 dark:border-white/[0.08] text-slate-900 dark:text-white"
                                required
                            >
                                <option value="package_purchase">Platform Packages (AzamPay)</option>
                                <option value="pass_sales">Pass Quota Sales</option>
                                <option value="sms_credits">Bulk SMS Top-up Credits</option>
                                <option value="design_service">Custom 4K Artwork</option>
                                <option value="subscription">Enterprise Subscription</option>
                                <option value="other_income">Other Income</option>
                            </select>
                        </div>

                        <div>
                            <InputLabel value="Amount (TZS) *" />
                            <TextInput
                                type="number"
                                min="1"
                                value={txForm.data.amount}
                                onChange={(e) => txForm.setData('amount', e.target.value)}
                                placeholder="500000"
                                className="w-full mt-1 font-mono"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <InputLabel value="Transaction Title *" />
                        <TextInput
                            type="text"
                            value={txForm.data.title}
                            onChange={(e) => txForm.setData('title', e.target.value)}
                            placeholder="e.g. VIP Pass Quota for Serena Gala"
                            className="w-full mt-1"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <InputLabel value="Payment Method *" />
                            <select
                                value={txForm.data.payment_method}
                                onChange={(e) => txForm.setData('payment_method', e.target.value)}
                                className="w-full mt-1 text-xs rounded-xl bg-slate-100 dark:bg-[#0B1524] border-slate-200/80 dark:border-white/[0.08] text-slate-900 dark:text-white"
                                required
                            >
                                <option value="M-Pesa">M-Pesa</option>
                                <option value="Tigo Pesa">Tigo Pesa</option>
                                <option value="Airtel Money">Airtel Money</option>
                                <option value="Bank Wire">Bank Wire Transfer</option>
                                <option value="Stripe/Card">Credit Card</option>
                                <option value="Cash">Cash</option>
                            </select>
                        </div>

                        <div>
                            <InputLabel value="Reference Code" />
                            <TextInput
                                type="text"
                                value={txForm.data.reference}
                                onChange={(e) => txForm.setData('reference', e.target.value)}
                                placeholder="e.g. MPESA-TX-9921"
                                className="w-full mt-1 font-mono text-xs"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <SecondaryButton type="button" onClick={() => setTxModalOpen(false)}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton type="submit" disabled={txForm.processing} className="bg-emerald-600 hover:bg-emerald-700">
                            {txForm.processing ? 'Saving...' : 'Record to Ledger'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* ═══════════════ MODAL: VIEW TRANSACTION RECEIPT ═══════════════ */}
            <Modal show={Boolean(viewingTx)} onClose={() => setViewingTx(null)} maxWidth="md">
                {viewingTx && (
                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.08] pb-3">
                            <div>
                                <span className="text-[10px] font-mono uppercase text-slate-400">Payment Audit Receipt</span>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white font-mono">
                                    {viewingTx.transaction_number}
                                </h3>
                            </div>
                            <button type="button" onClick={() => setViewingTx(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/[0.04]">
                                <span className="text-slate-500">Title / Purpose</span>
                                <span className="font-bold text-slate-900 dark:text-white text-right">{viewingTx.title}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/[0.04]">
                                <span className="text-slate-500">Amount (TZS)</span>
                                <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                                    {formatTzs(viewingTx.amount)}
                                </span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/[0.04]">
                                <span className="text-slate-500">Payment Method</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">{viewingTx.payment_method}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/[0.04]">
                                <span className="text-slate-500">External Reference</span>
                                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{viewingTx.reference || 'None'}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/[0.04]">
                                <span className="text-slate-500">Client / Customer</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">{viewingTx.user?.name || viewingTx.user?.company || 'Direct System'}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/[0.04]">
                                <span className="text-slate-500">Associated Event</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">{viewingTx.event?.title || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/[0.04]">
                                <span className="text-slate-500">Date Logged</span>
                                <span className="font-mono text-slate-800 dark:text-slate-200">{viewingTx.transaction_date ? new Date(viewingTx.transaction_date).toLocaleString('en-GB') : 'N/A'}</span>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <SecondaryButton type="button" onClick={() => setViewingTx(null)}>
                                Close
                            </SecondaryButton>
                        </div>
                    </div>
                )}
            </Modal>

            {/* ═══════════════ MODAL: SPOT FX EXCHANGE RATE ═══════════════ */}
            <Modal show={fxModalOpen} onClose={() => setFxModalOpen(false)} maxWidth="sm">
                <form onSubmit={handleSaveManualFx} className="p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.08] pb-3">
                        <div className="flex items-center gap-2">
                            <RefreshCw className="w-5 h-5 text-emerald-500" />
                            <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">USD / TZS Spot Rate</h3>
                        </div>
                        <button type="button" onClick={() => setFxModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-2">
                        <InputLabel value="Spot Rate (TZS per 1 USD)" />
                        <TextInput
                            type="number"
                            step="0.01"
                            value={fxForm.data.rate}
                            onChange={(e) => fxForm.setData('rate', e.target.value)}
                            className="w-full font-mono text-center text-lg font-bold"
                            required
                        />
                        <p className="text-[11px] text-slate-500 text-center">
                            Current active source: <span className="font-bold text-emerald-600 dark:text-emerald-400">{fx_rate?.source || 'ExchangeRate-API'}</span>
                        </p>
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                        <button
                            type="button"
                            onClick={handleSyncLiveFx}
                            disabled={isSyncingFx}
                            className="w-full py-2 px-3 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingFx ? 'animate-spin' : ''}`} />
                            <span>{isSyncingFx ? 'Syncing...' : 'Sync Live Central Bank / Market Spot'}</span>
                        </button>

                        <div className="flex justify-end gap-2 mt-2">
                            <SecondaryButton type="button" onClick={() => setFxModalOpen(false)}>
                                Cancel
                            </SecondaryButton>
                            <PrimaryButton type="submit" disabled={fxForm.processing} className="bg-emerald-600 hover:bg-emerald-700">
                                Save Rate
                            </PrimaryButton>
                        </div>
                    </div>
                </form>
            </Modal>

            {/* ═══════════════ MODAL: EXPORT CUSTOM FINANCIAL REPORT ═══════════════ */}
            <Modal show={exportModalOpen} onClose={() => setExportModalOpen(false)} maxWidth="xl">
                <div className="p-6 space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.08] pb-3">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                                <Download className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-slate-900 dark:text-white font-display">
                                    Export Financial Intelligence Reports
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Select report format, accounting interval, and audit filters.
                                </p>
                            </div>
                        </div>
                        <button type="button" onClick={() => setExportModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Step 1: Format Selection */}
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2 block">
                            1. Select Report Document Format
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            {[
                                {
                                    id: 'pdf',
                                    icon: FileText,
                                    iconColor: 'text-rose-500',
                                    badge: 'PDF',
                                    title: 'Executive Statement',
                                    desc: 'Branded PDF with KPIs, cashflow tables & audit trail',
                                },
                                {
                                    id: 'ledger',
                                    icon: FileSpreadsheet,
                                    iconColor: 'text-emerald-500',
                                    badge: 'CSV',
                                    title: 'Transaction Ledger',
                                    desc: 'Line-by-line detailed inflows & outflows CSV',
                                },
                                {
                                    id: 'cashflow',
                                    icon: BarChart3,
                                    iconColor: 'text-blue-500',
                                    badge: 'CSV',
                                    title: 'Cashflow Statement',
                                    desc: 'Month & annual net margin breakdown matrix',
                                },
                            ].map((fmt) => {
                                const IconComponent = fmt.icon;
                                const isSelected = exportConfig.format === fmt.id;
                                return (
                                    <button
                                        key={fmt.id}
                                        type="button"
                                        onClick={() => setExportConfig({ ...exportConfig, format: fmt.id })}
                                        className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                                            isSelected
                                                ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500'
                                                : 'border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.15] bg-white dark:bg-white/[0.02]'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <IconComponent className={`w-5 h-5 ${fmt.iconColor}`} />
                                            <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-white/[0.08] text-slate-700 dark:text-slate-300">
                                                {fmt.badge}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="text-xs font-black text-slate-900 dark:text-white">
                                                {fmt.title}
                                            </div>
                                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                                                {fmt.desc}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Step 2: Reporting Interval */}
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2 block">
                            2. Reporting Interval / Accounting Period
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {[
                                { id: 'all', label: 'All Time', sub: 'Complete history' },
                                { id: '7days', label: 'Weekly', sub: 'Past 7 days rolling' },
                                { id: '30days', label: 'Monthly', sub: 'Past 30 days rolling' },
                                { id: '90days', label: 'Quarterly', sub: 'Past 90 days (Qtr)' },
                                { id: 'half_year', label: 'Half-Year', sub: 'Past 180 days (6 Mos)' },
                                { id: 'this_year', label: 'Annual (2026)', sub: 'Calendar Year 2026' },
                                { id: 'custom', label: 'Custom Range', sub: 'Specific start & end' },
                            ].map((itv) => {
                                const isSelected = exportConfig.period === itv.id;
                                return (
                                    <button
                                        key={itv.id}
                                        type="button"
                                        onClick={() => setExportConfig({ ...exportConfig, period: itv.id })}
                                        className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                                            isSelected
                                                ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500'
                                                : 'border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.15] bg-white dark:bg-white/[0.02]'
                                        }`}
                                    >
                                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                                            {itv.label}
                                        </div>
                                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                                            {itv.sub}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Step 2b: Custom Date Range */}
                    {exportConfig.period === 'custom' && (
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] space-y-2 animate-fadeIn">
                            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                Define Custom Date Bounds
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <InputLabel value="From Date (Start) *" />
                                    <TextInput
                                        type="date"
                                        value={exportConfig.from}
                                        onChange={(e) => setExportConfig({ ...exportConfig, from: e.target.value })}
                                        className="w-full mt-1 font-mono text-xs"
                                        required
                                    />
                                </div>
                                <div>
                                    <InputLabel value="To Date (End) *" />
                                    <TextInput
                                        type="date"
                                        value={exportConfig.to}
                                        onChange={(e) => setExportConfig({ ...exportConfig, to: e.target.value })}
                                        className="w-full mt-1 font-mono text-xs"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Transaction Type Filter (if Ledger selected) */}
                    {exportConfig.format === 'ledger' && (
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2 block">
                                3. Transaction Type Scope
                            </label>
                            <div className="flex flex-wrap items-center gap-2">
                                {[
                                    { id: 'all', label: 'All Inflows & Expenses' },
                                    { id: 'income', label: 'Inflows / Revenue Only' },
                                    { id: 'expense', label: 'Expenses & COGS Only' },
                                ].map((scope) => (
                                    <button
                                        key={scope.id}
                                        type="button"
                                        onClick={() => setExportConfig({ ...exportConfig, type: scope.id })}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                                            exportConfig.type === scope.id
                                                ? 'bg-emerald-600 text-white shadow-xs'
                                                : 'border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                                        }`}
                                    >
                                        {scope.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Modal Footer Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-white/[0.08]">
                        <SecondaryButton type="button" onClick={() => setExportModalOpen(false)}>
                            Cancel
                        </SecondaryButton>

                        <button
                            type="button"
                            onClick={handleExecuteExport}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition active:scale-95 cursor-pointer"
                        >
                            <Download className="w-4 h-4" />
                            <span>Download {exportConfig.format.toUpperCase()} Report</span>
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Confirmation Modal */}
            <ConfirmationModal
                show={confirmModal.show}
                title={confirmModal.title}
                message={confirmModal.message}
                warning={confirmModal.warning}
                confirmText={confirmModal.confirmText}
                type={confirmModal.type}
                loading={confirmModal.loading}
                onConfirm={confirmModal.onConfirm}
                onClose={() => setConfirmModal(prev => ({ ...prev, show: false }))}
            />
        </KardovoAppLayout>
    );
}
