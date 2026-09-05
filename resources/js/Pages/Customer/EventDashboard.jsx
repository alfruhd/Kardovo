import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import KardovoAppLayout from '@/Layouts/KardovoAppLayout';
import StatCard from '@/Components/StatCard';
import StatusBadge from '@/Components/StatusBadge';
import PersonalisedCard from '@/Components/PersonalisedCard';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import { 
    validateEmail, 
    validatePhone, 
    validateFileSize, 
    validateFileExtension, 
    validateRequired 
} from '@/Utils/validation';
import { 
    X,
    Globe,
    Copy,
    Palette,
    Utensils,
    AlertTriangle,
    Camera,
    MessageSquareHeart,
    Heart,
    Users, 
    Send, 
    CheckCircle2, 
    QrCode, 
    Upload, 
    Plus, 
    Search, 
    Filter, 
    Download, 
    ExternalLink, 
    Eye, 
    Edit, 
    Trash2, 
    MessageSquare,
    Sparkles,
    Calendar,
    MapPin,
    Clock,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Smartphone,
    FileSpreadsheet,
    FileText,
    Check,
    AlertCircle,
    Info,
    Ticket,
    ShieldCheck,
    User,
    Hash,
    KeyRound,
    Crown,
    FileCheck,
    Settings,
    Lock
} from 'lucide-react';

export default function EventDashboard({ 
    event = {}, 
    guests = { data: [], total: 0, links: [] }, 
    filters = {}, 
    stats = {}, 
    recentScanLogs = [],
    templates = []
}) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const isAdmin = user?.role === 'admin' || user?.is_admin;
    const canImport = isAdmin || (user?.status !== 'suspended' && user?.effective_permissions?.can_import_guests !== false);
    const canExport = isAdmin || (user?.status !== 'suspended' && user?.effective_permissions?.can_export_data !== false);
    const canBroadcast = isAdmin || (user?.status !== 'suspended' && user?.effective_permissions?.can_send_broadcasts !== false);
    const canCustomize = isAdmin || (user?.status !== 'suspended' && user?.effective_permissions?.can_customize_templates !== false);
    const canManageScanners = isAdmin || (user?.status !== 'suspended' && user?.effective_permissions?.can_manage_scanners !== false);
    const [search, setSearch] = useState(filters?.search || '');
    const [deliveryFilter, setDeliveryFilter] = useState(filters?.delivery || 'all');
    const [rsvpFilter, setRsvpFilter] = useState(filters?.rsvp || 'all');
    const [categoryFilter, setCategoryFilter] = useState(filters?.category || 'all');

    // Modals
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [importMode, setImportMode] = useState('excel'); // 'excel' | 'paste'
    const [addGuestModalOpen, setAddGuestModalOpen] = useState(false);
    const [editGuestModalOpen, setEditGuestModalOpen] = useState(false);
    const [selectedGuest, setSelectedGuest] = useState(null);
    const [cardPreviewModalOpen, setCardPreviewModalOpen] = useState(false);
    const [previewGuest, setPreviewGuest] = useState(null);
    const [editEventModalOpen, setEditEventModalOpen] = useState(false);
    const [clearGuestsModalOpen, setClearGuestsModalOpen] = useState(false);
    const [clearLogsModalOpen, setClearLogsModalOpen] = useState(false);
    const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
    const exportDropdownRef = useRef(null);

    // Close export dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target)) {
                setExportDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);


    // Edit Event Form
    const editEventForm = useForm({
        title: event?.title || '',
        event_type: event?.event_type || 'Wedding Reception',
        event_date: typeof event?.event_date === 'string' ? event.event_date.split('T')[0] : (event?.event_date || ''),
        event_time: event?.event_time || '',
        venue: event?.venue || '',
        city: event?.city || 'Dar es Salaam',
        description: event?.description || '',
        card_template_id: event?.card_template_id || '',
        status: event?.status || 'active',
    });

    // Add Guest Form
    const addForm = useForm({
        name: '',
        phone: '',
        email: '',
        category: 'Single Entry',
        max_entries: 1,
        notes: '',
    });

    // Import Form
    const importForm = useForm({
        raw_text: '',
        default_category: 'Single Entry',
        default_max_entries: 1,
        file: null,
    });

    // Edit Form
    const editForm = useForm({
        name: '',
        phone: '',
        email: '',
        category: 'Single Entry',
        max_entries: 1,
        entries_used: 0,
        delivery_status: 'draft',
        rsvp_status: 'pending',
        notes: '',
    });

    const [addClientErrors, setAddClientErrors] = useState({});
    const [editClientErrors, setEditClientErrors] = useState({});
    const [importClientErrors, setImportClientErrors] = useState({});

    // Real-time background listener: Polls for live RSVP updates & check-in events every 4 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            if (
                !addGuestModalOpen && 
                !editGuestModalOpen && 
                !importModalOpen && 
                !editEventModalOpen && 
                !cardPreviewModalOpen && 
                typeof document !== 'undefined' && 
                document.visibilityState === 'visible'
            ) {
                router.reload({
                    only: ['guests', 'stats', 'recentScanLogs'],
                    preserveScroll: true,
                    preserveState: true,
                });
            }
        }, 4000);

        return () => clearInterval(interval);
    }, [addGuestModalOpen, editGuestModalOpen, importModalOpen, editEventModalOpen, cardPreviewModalOpen]);

    const handleEditEventSubmit = (e) => {
        e.preventDefault();
        editEventForm.put(route('events.update', event?.id || 1), {
            onSuccess: () => {
                setEditEventModalOpen(false);
            }
        });
    };

    const handleDeleteEvent = () => {
        if (confirm(`Are you sure you want to permanently delete event "${event?.title || 'this event'}"?\n\nWARNING: This will permanently delete all guests (${stats?.total_guests || 0}), scannable passes, messages, and gate scan records.`)) {
            router.delete(route('events.destroy', event?.id));
        }
    };

    const handleFilterSubmit = (e) => {
        if (e) e.preventDefault();
        router.get(route('events.show', event?.id || 1), {
            search,
            delivery: deliveryFilter,
            rsvp: rsvpFilter,
            category: categoryFilter,
        }, { preserveState: true, replace: true });
    };

    const handleAddGuestSubmit = (e) => {
        e.preventDefault();

        const errs = {};
        if (!validateRequired(addForm.data.name, 2)) {
            errs.name = 'Attendee name must be at least 2 characters.';
        }
        if (!validatePhone(addForm.data.phone)) {
            errs.phone = 'Please enter a valid telephone number (at least 9 digits, e.g. +255 712 345 678).';
        }
        if (addForm.data.email && !validateEmail(addForm.data.email)) {
            errs.email = 'Please enter a valid email address.';
        }
        if (Object.keys(errs).length > 0) {
            setAddClientErrors(errs);
            return;
        }

        setAddClientErrors({});
        addForm.post(route('guests.store', event?.id || 1), {
            onSuccess: () => {
                setAddGuestModalOpen(false);
                addForm.reset();
            }
        });
    };

    const handleImportSubmit = (e) => {
        e.preventDefault();
        const errs = {};

        if (importMode === 'excel') {
            if (!importForm.data.file) {
                errs.file = 'Please select a spreadsheet file (.xlsx, .csv, .xls) to import.';
            } else {
                const extCheck = validateFileExtension(importForm.data.file, ['xlsx', 'xls', 'csv', 'tsv', 'txt']);
                if (!extCheck.isValid) errs.file = extCheck.message;
                const sizeCheck = validateFileSize(importForm.data.file, 10);
                if (!sizeCheck.isValid) errs.file = sizeCheck.message;
            }
        } else {
            if (!importForm.data.raw_text || !importForm.data.raw_text.trim()) {
                errs.raw_text = 'Please paste at least one line with attendee names to import.';
            }
        }

        if (Object.keys(errs).length > 0) {
            setImportClientErrors(errs);
            return;
        }

        setImportClientErrors({});
        importForm.post(route('guests.import', event?.id || 1), {
            forceFormData: true,
            onSuccess: () => {
                setImportModalOpen(false);
                importForm.reset();
            }
        });
    };

    const openEditModal = (guest) => {
        setSelectedGuest(guest);
        setEditClientErrors({});
        editForm.setData({
            name: guest.name,
            phone: guest.phone,
            email: guest.email || '',
            category: guest.category,
            max_entries: guest.max_entries,
            entries_used: guest.entries_used,
            delivery_status: guest.delivery_status,
            rsvp_status: guest.rsvp_status,
            notes: guest.notes || '',
        });
        setEditGuestModalOpen(true);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!selectedGuest) return;

        const errs = {};
        if (!validateRequired(editForm.data.name, 2)) {
            errs.name = 'Attendee name must be at least 2 characters.';
        }
        if (!validatePhone(editForm.data.phone)) {
            errs.phone = 'Please enter a valid telephone number (at least 9 digits, e.g. +255 712 345 678).';
        }
        if (editForm.data.email && !validateEmail(editForm.data.email)) {
            errs.email = 'Please enter a valid email address.';
        }
        if (Object.keys(errs).length > 0) {
            setEditClientErrors(errs);
            return;
        }

        setEditClientErrors({});
        editForm.put(route('guests.update', [event?.id, selectedGuest?.id]), {
            onSuccess: () => {
                setEditGuestModalOpen(false);
                setSelectedGuest(null);
            }
        });
    };

    const handleDeleteGuest = (guest) => {
        if (confirm(`Are you sure you want to remove ${guest.name} from this event?`)) {
            router.delete(route('guests.destroy', [event?.id, guest?.id]));
        }
    };

    const handleDeleteScanLog = (log) => {
        const guestName = log.guest?.name || 'Unregistered Guest';
        if (confirm(`Are you sure you want to delete this gate activity log entry for "${guestName}"?`)) {
            router.delete(route('events.destroyScanLog', [event?.id, log.id]), {
                preserveScroll: true,
            });
        }
    };

    const handleClearGuests = () => {
        const totalCount = guests?.total || 0;
        if (totalCount === 0) {
            alert('There are no guests in this event to clear.');
            return;
        }
        setClearGuestsModalOpen(true);
    };

    const handleClearScanLogs = () => {
        if (!recentScanLogs || recentScanLogs.length === 0) {
            alert('There are no gate activity logs to clear.');
            return;
        }
        setClearLogsModalOpen(true);
    };

    const handleOpenPreview = (guest) => {
        setPreviewGuest(guest);
        setCardPreviewModalOpen(true);
    };

    const handleSendSingle = (guest) => {
        if (!guest?.id) return;
        router.post(route('messaging.sendSingle', guest.id), {
            channel: 'whatsapp',
        });
    };

    return (
        <KardovoAppLayout
            title={event?.title || 'Event Dashboard'}
            headerActions={
                <div className="flex items-center gap-2 sm:gap-2.5">
                    {/* 1. Import Excel / CSV */}
                    {canImport && (
                        <button
                            type="button"
                            onClick={() => setImportModalOpen(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-white/[0.06] hover:bg-slate-50 dark:hover:bg-white/[0.12] border border-slate-200/90 dark:border-white/[0.08] rounded-xl shadow-2xs transition active:scale-95 cursor-pointer"
                            title="Bulk Import Excel or CSV Guest List"
                        >
                            <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                            <span className="hidden md:inline">Import Excel / CSV</span>
                            <span className="md:hidden">Import</span>
                        </button>
                    )}

                    {/* 2. + Add Guest */}
                    {canImport ? (
                        <button
                            type="button"
                            onClick={() => setAddGuestModalOpen(true)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 text-xs font-black text-white bg-kardovo-navy hover:bg-slate-900 dark:bg-cyan-600 dark:hover:bg-cyan-500 rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5 stroke-[3]" />
                            <span>+ Add Guest</span>
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => alert('Guest registration and bulk spreadsheet import permissions are locked for your organizer account by platform governance.')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-200/70 dark:bg-white/[0.06] border border-slate-300 dark:border-white/[0.08] rounded-xl cursor-not-allowed opacity-80 shadow-2xs"
                            title="Guest imports locked by administration"
                        >
                            <Lock className="w-3.5 h-3.5 text-slate-500" />
                            <span>Guest Reg. (Locked)</span>
                        </button>
                    )}

                    {/* 3. Event Settings Button */}
                    <button
                        type="button"
                        onClick={() => setEditEventModalOpen(true)}
                        className="p-1.5 sm:p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-white/[0.06] hover:bg-slate-50 dark:hover:bg-white/[0.12] border border-slate-200/90 dark:border-white/[0.08] rounded-xl shadow-2xs transition active:scale-95 cursor-pointer"
                        title="Edit Event Details & Settings"
                    >
                        <Edit className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    </button>
                </div>
            }
        >
            <Head title={`${event?.title || 'Event'} - Kardovo`} />

            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
                {/* 1. Stat Cards (Responsive 2-col on Mobile) */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
                    <StatCard
                        title="Total Guests"
                        value={stats?.total_guests || 0}
                        subtitle="Invited attendees"
                        icon={Users}
                        titleColor="text-slate-900 dark:text-white"
                        subtitleColor="text-cyan-600 dark:text-cyan-400 font-semibold"
                        iconColor="text-cyan-600 dark:text-cyan-400"
                        iconBg="bg-cyan-500/10 dark:bg-cyan-500/15 border-cyan-500/20"
                        hoverBorder="hover:border-cyan-500/40 dark:hover:border-cyan-500/40"
                    />
                    <StatCard
                        title="Messages Sent"
                        value={stats?.messages_sent || 0}
                        subtitle={`${stats?.messages_sent || 0} dispatched passes`}
                        icon={Send}
                        titleColor="text-slate-900 dark:text-white"
                        subtitleColor="text-cyan-600 dark:text-cyan-400 font-semibold"
                        iconColor="text-cyan-600 dark:text-cyan-400"
                        iconBg="bg-cyan-500/10 dark:bg-cyan-500/15 border-cyan-500/20"
                        hoverBorder="hover:border-cyan-500/40 dark:hover:border-cyan-500/40"
                    />
                    <StatCard
                        title="RSVP 'Will Attend'"
                        value={stats?.will_attend || 0}
                        subtitle={`${stats?.attendance_percent || 0}% response rate`}
                        icon={CheckCircle2}
                        titleColor="text-slate-900 dark:text-white"
                        subtitleColor="text-cyan-600 dark:text-cyan-400 font-semibold"
                        iconColor="text-cyan-600 dark:text-cyan-400"
                        iconBg="bg-cyan-500/10 dark:bg-cyan-500/15 border-cyan-500/20"
                        hoverBorder="hover:border-cyan-500/40 dark:hover:border-cyan-500/40"
                    />
                    <StatCard
                        title="Checked In"
                        value={stats?.live_checkins || 0}
                        subtitle="Live gate check-ins"
                        icon={QrCode}
                        titleColor="text-slate-900 dark:text-white"
                        subtitleColor="text-cyan-600 dark:text-cyan-400 font-semibold"
                        iconColor="text-cyan-600 dark:text-cyan-400"
                        iconBg="bg-cyan-500/10 dark:bg-cyan-500/15 border-cyan-500/20"
                        hoverBorder="hover:border-cyan-500/40 dark:hover:border-cyan-500/40"
                    />
                </div>

                {/* 📱 Mobile-First Quick Action Dock */}
                <div className="sm:hidden grid grid-cols-2 gap-2 p-2 rounded-2xl bg-white dark:bg-[#0B1524] border border-slate-200/90 dark:border-white/[0.08] shadow-xs">
                    {canImport ? (
                        <>
                            <button
                                type="button"
                                onClick={() => setAddGuestModalOpen(true)}
                                className="py-2.5 px-3 rounded-xl bg-kardovo-navy dark:bg-cyan-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>+ Add Guest</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setImportModalOpen(true)}
                                className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-white/[0.08] text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition border border-slate-200 dark:border-white/[0.08]"
                            >
                                <Upload className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                                <span>Import Excel</span>
                            </button>
                        </>
                    ) : null}

                    {canBroadcast && (
                        <Link
                            href={route('messaging.index', { event_id: event.id })}
                            className="py-2.5 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
                        >
                            <Send className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Broadcast</span>
                        </Link>
                    )}

                    {canManageScanners && (
                        <Link
                            href={route('scanner.index', { event_id: event.id })}
                            className="py-2.5 px-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-200 dark:border-cyan-800/40 text-cyan-800 dark:text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
                        >
                            <QrCode className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                            <span>Gate Scanner</span>
                        </Link>
                    )}
                </div>

                {/* 2. Main Guest List Card with Filters & Table (Figure 4.1) */}
                <div className="bg-white dark:bg-[#0B1524] rounded-3xl border border-slate-200/90 dark:border-white/[0.08] shadow-card overflow-hidden">
                    {/* Filter & Action Toolbar */}
                    <div className="p-5 border-b border-slate-100 dark:border-white/[0.08] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center justify-between gap-3 w-full md:w-auto">
                            <h2 className="text-base font-black text-slate-900 dark:text-white font-display flex items-center gap-2">
                                <span>Guest List</span>
                                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.08] text-slate-600 dark:text-slate-300 font-mono">
                                    {(guests?.total || 0).toLocaleString()} passes
                                </span>
                            </h2>
                        </div>

                        {/* Search & Filters */}
                        <form onSubmit={handleFilterSubmit} className="flex flex-wrap items-center gap-2.5">
                            {/* Search Input */}
                            <div className="relative min-w-[200px]">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search name, phone, card #..."
                                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/70 dark:bg-[#08121E] text-slate-900 dark:text-white focus:ring-cyan-500 focus:border-cyan-500"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onBlur={handleFilterSubmit}
                                />
                            </div>

                            {/* Delivery Filter */}
                            <select
                                className="text-xs py-2 pl-2.5 pr-7 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/70 dark:bg-[#08121E] text-slate-800 dark:text-slate-200 focus:ring-cyan-500 focus:border-cyan-500 font-medium"
                                value={deliveryFilter}
                                onChange={(e) => {
                                    setDeliveryFilter(e.target.value);
                                    router.get(route('events.show', event?.id || 1), {
                                        search,
                                        delivery: e.target.value,
                                        rsvp: rsvpFilter,
                                        category: categoryFilter,
                                    }, { preserveState: true });
                                }}
                            >
                                <option value="all">Delivery: All</option>
                                <option value="delivered">Delivered</option>
                                <option value="sent">Sent</option>
                                <option value="draft">Draft</option>
                                <option value="failed">Failed</option>
                            </select>

                            {/* RSVP Filter */}
                            <select
                                className="text-xs py-2 pl-2.5 pr-7 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/70 dark:bg-[#08121E] text-slate-800 dark:text-slate-200 focus:ring-cyan-500 focus:border-cyan-500 font-medium"
                                value={rsvpFilter}
                                onChange={(e) => {
                                    setRsvpFilter(e.target.value);
                                    router.get(route('events.show', event?.id || 1), {
                                        search,
                                        delivery: deliveryFilter,
                                        rsvp: e.target.value,
                                        category: categoryFilter,
                                    }, { preserveState: true });
                                }}
                            >
                                <option value="all">RSVP: All</option>
                                <option value="attending">Will Attend</option>
                                <option value="pending">Pending</option>
                                <option value="declined">Will Not Attend</option>
                            </select>

                            {/* Export Options (CSV & PDF) */}
                            {canExport ? (
                                <div className="relative" ref={exportDropdownRef}>
                                    <button
                                        type="button"
                                        onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.12] border border-slate-200/80 dark:border-white/[0.08] rounded-xl transition cursor-pointer shadow-2xs"
                                        title="Export Attendee Manifest"
                                    >
                                        <Download className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                                        <span>Export</span>
                                        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${exportDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {exportDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#0C1729] rounded-2xl shadow-xl border border-slate-200 dark:border-white/[0.08] p-1.5 z-50 animate-fadeIn space-y-0.5">
                                            <a
                                                href={route('guests.export', event?.id || 1)}
                                                onClick={() => setExportDropdownOpen(false)}
                                                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-xl transition text-left cursor-pointer"
                                            >
                                                <FileSpreadsheet className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                                <div>
                                                    <div className="font-bold">Export as CSV (.csv)</div>
                                                    <div className="text-[10px] text-slate-400 font-normal">Spreadsheet for Excel & Sheets</div>
                                                </div>
                                            </a>
                                            <a
                                                href={route('guests.exportPdf', event?.id || 1)}
                                                onClick={() => setExportDropdownOpen(false)}
                                                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-xl transition text-left cursor-pointer"
                                            >
                                                <FileText className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
                                                <div>
                                                    <div className="font-bold">Export as PDF (.pdf)</div>
                                                    <div className="text-[10px] text-slate-400 font-normal">Printable manifest & ledger</div>
                                                </div>
                                            </a>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => alert('Data and attendee manifest exporting is locked for your organizer account by platform governance.')}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.06] rounded-xl cursor-not-allowed opacity-75 shadow-2xs"
                                    title="Data Exporting Locked"
                                >
                                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Export (Locked)</span>
                                </button>
                            )}

                            {/* Clear All Guests (Far Right with Visual Boundary & Protection) */}
                            {canImport && (guests?.total || 0) > 0 && (
                                <div className="pl-2.5 border-l border-slate-200 dark:border-white/10 ml-auto xl:ml-2">
                                    <button
                                        type="button"
                                        onClick={handleClearGuests}
                                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-white hover:bg-rose-600 dark:hover:bg-rose-600 border border-rose-200 dark:border-rose-900/50 rounded-xl transition active:scale-95 shadow-2xs cursor-pointer group"
                                        title="Permanently clear all attendees from this event"
                                    >
                                        <Trash2 className="w-3.5 h-3.5 text-rose-500 group-hover:text-white transition" />
                                        <span>Clear All Guests</span>
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Zebra Striped Data Table with Sticky Header */}
                    <div className="overflow-x-auto overflow-y-auto max-h-[520px] lg:max-h-[580px] scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                        <table className="w-full text-left text-xs border-collapse min-w-[760px]">
                            <thead>
                                <tr className="bg-slate-50/95 dark:bg-[#08121E]/95 text-[10.5px] uppercase font-extrabold tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/[0.08] sticky top-0 z-20 backdrop-blur-md shadow-xs">
                                    <th className="py-3 px-4 font-extrabold">Guest Name</th>
                                    <th className="py-3 px-4 font-extrabold">Phone Number</th>
                                    <th className="py-3 px-4 font-extrabold">Category</th>
                                    <th className="py-3 px-4 font-extrabold">Card Number</th>
                                    <th className="py-3 px-4 font-extrabold">Delivery</th>
                                    <th className="py-3 px-4 font-extrabold">RSVP</th>
                                    <th className="py-3 px-4 font-extrabold">Entries</th>
                                    <th className="py-3 px-4 font-extrabold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                                {(guests?.data || []).length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-12 text-slate-400 dark:text-slate-500">
                                            <Users className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                                            <p className="font-semibold text-slate-700 dark:text-slate-300">No guests found matching filters</p>
                                            <p className="text-[11px] mt-1">Try resetting filters or click "+ Add Guest" / "Import Excel" to add attendees.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    (guests?.data || []).map((guest, idx) => (
                                        <tr 
                                            key={guest.id}
                                            className={`hover:bg-cyan-50/30 dark:hover:bg-white/[0.04] transition-colors ${idx % 2 === 1 ? 'bg-slate-50/40 dark:bg-white/[0.02]' : 'bg-white dark:bg-transparent'}`}
                                        >
                                            {/* Name */}
                                            <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                                                <button
                                                    onClick={() => handleOpenPreview(guest)}
                                                    className="hover:text-cyan-600 dark:hover:text-cyan-400 text-left flex items-center gap-1.5 group cursor-pointer"
                                                >
                                                    <span>{guest.name}</span>
                                                    <ExternalLink className="w-3 h-3 text-slate-300 dark:text-slate-600 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition" />
                                                </button>
                                            </td>

                                            {/* Phone */}
                                            <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-mono">
                                                {guest.phone}
                                            </td>

                                            {/* Category */}
                                            <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-semibold">
                                                {guest.category}
                                            </td>

                                            {/* Card Number & Code */}
                                            <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                                                <div className="font-bold">{guest.card_number}</div>
                                                <div className="text-[10px] text-slate-400 dark:text-slate-500">Code: {guest.unique_code}</div>
                                            </td>

                                            {/* Delivery Status Badge */}
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <StatusBadge status={guest.delivery_status} />
                                            </td>

                                            {/* RSVP Status Badge */}
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <StatusBadge status={guest.rsvp_status} />
                                            </td>

                                            {/* Entries Used / Max */}
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`font-mono font-bold text-xs ${guest.entries_used >= guest.max_entries ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                                                        {guest.entries_used}/{guest.max_entries}
                                                    </span>
                                                    {guest.entries_used > 0 && (
                                                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold">
                                                            In
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => handleOpenPreview(guest)}
                                                        className="p-1.5 text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.08] transition"
                                                        title="View Personalised Pass"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleSendSingle(guest)}
                                                        className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.08] transition"
                                                        title="Send WhatsApp Invitation"
                                                    >
                                                        <MessageSquare className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => openEditModal(guest)}
                                                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.08] transition"
                                                        title="Edit Guest"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteGuest(guest)}
                                                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                                                        title="Delete Guest"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Bar */}
                    {guests?.links?.length > 3 && (
                        <div className="p-4 border-t border-slate-100 dark:border-white/[0.08] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                            <div>
                                Showing <strong className="text-slate-900 dark:text-white">{guests?.from || 0}</strong> to <strong className="text-slate-900 dark:text-white">{guests?.to || 0}</strong> of <strong className="text-slate-900 dark:text-white">{guests?.total || 0}</strong> results
                            </div>
                            <div className="flex items-center gap-1">
                                {(guests?.links || []).map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                                            link.active 
                                                ? 'bg-cyan-600 text-white border-cyan-600' 
                                                : (!link.url ? 'text-slate-300 dark:text-slate-600 border-slate-200 dark:border-white/[0.08] cursor-not-allowed' : 'text-slate-700 dark:text-slate-200 border-slate-200 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/[0.06]')
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. Recent Gate Check-in Logs */}
                {recentScanLogs.length > 0 && (
                    <div className="bg-white dark:bg-[#0B1524] rounded-3xl border border-slate-200/90 dark:border-white/[0.08] p-5 sm:p-6 shadow-card">
                        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white font-display flex items-center gap-2">
                                <QrCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                <span>Live Gate Activity Log</span>
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.08]">
                                    Showing all {recentScanLogs.length} {recentScanLogs.length === 1 ? 'scan' : 'scans'}
                                </span>
                                <button
                                    type="button"
                                    onClick={handleClearScanLogs}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-white hover:bg-rose-600 dark:hover:bg-rose-600 border border-rose-200 dark:border-rose-900/50 rounded-xl transition active:scale-95 shadow-xs cursor-pointer"
                                    title="Clear all gate activity scan logs for this event"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Clear All Logs</span>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2 max-h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 pr-1">
                            {recentScanLogs.map((log) => (
                                <div key={log.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.08] text-xs">
                                    <div className="flex items-center gap-3">
                                        <StatusBadge status={log.status} />
                                        <div>
                                            <span className="font-bold text-slate-900 dark:text-white">
                                                {log.guest?.name || 'Unknown / Unregistered Guest'}
                                            </span>
                                            <span className="text-slate-500 dark:text-slate-400 ml-2 font-medium">
                                                ({log.gate_label} by {log.scanner_name || 'Gate Scanner'})
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                                            {new Date(log.scanned_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteScanLog(log)}
                                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition active:scale-95 cursor-pointer"
                                            title="Delete gate activity entry"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal: Import Guests */}
            <Modal show={importModalOpen} onClose={() => setImportModalOpen(false)} maxWidth="2xl">
                <form onSubmit={handleImportSubmit} className="p-6 sm:p-7 space-y-5">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/[0.08] pb-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2.5 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/40 text-cyan-800 dark:text-cyan-300 text-[10.5px] font-mono font-extrabold uppercase">
                                    Excel &amp; CSV Bulk Ingestion
                                </span>
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white font-display">
                                Import Attendees into {event?.title || 'Event'}
                            </h3>
                        </div>

                        {/* Download Sample Templates */}
                        <div className="flex items-center gap-2">
                            <a
                                href={route('guests.sampleTemplate') + '?format=xlsx'}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 border border-emerald-300 dark:border-emerald-800/50 rounded-xl transition shadow-xs"
                                title="Download sample Excel spreadsheet template"
                            >
                                <FileSpreadsheet className="w-3.5 h-3.5" />
                                <span>.xlsx Template</span>
                            </a>
                            <a
                                href={route('guests.sampleTemplate') + '?format=csv'}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 border border-slate-200 dark:border-white/[0.08] rounded-xl transition shadow-xs"
                                title="Download sample CSV template"
                            >
                                <Download className="w-3.5 h-3.5" />
                                <span>.csv Template</span>
                            </a>
                        </div>
                    </div>

                    {/* Mode Switcher Tabs */}
                    <div className="flex rounded-2xl bg-slate-100 dark:bg-white/[0.04] p-1 border border-slate-200/80 dark:border-white/[0.08]">
                        <button
                            type="button"
                            onClick={() => setImportMode('excel')}
                            className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                                importMode === 'excel'
                                    ? 'bg-white dark:bg-[#0B1524] text-cyan-800 dark:text-cyan-300 shadow-sm border border-slate-200/90 dark:border-cyan-500/40'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                            }`}
                        >
                            <FileSpreadsheet className="w-4 h-4" />
                            <span>Upload Excel / CSV Spreadsheet</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setImportMode('paste')}
                            className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                                importMode === 'paste'
                                    ? 'bg-white dark:bg-[#0B1524] text-cyan-800 dark:text-cyan-300 shadow-sm border border-slate-200/90 dark:border-cyan-500/40'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                            }`}
                        >
                            <FileText className="w-4 h-4" />
                            <span>Paste Table / CSV Text</span>
                        </button>
                    </div>

                    {/* System Acceptance Conditions Notice */}
                    <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-cyan-950/30 border border-blue-200/80 dark:border-cyan-800/40 text-xs text-slate-700 dark:text-slate-300 space-y-2">
                        <div className="font-bold text-kardovo-blue-dark dark:text-cyan-300 flex items-center gap-1.5">
                            <Info className="w-4 h-4 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
                            <span>System Acceptance Conditions:</span>
                        </div>
                        <ul className="text-[11px] space-y-1 text-slate-600 dark:text-slate-300 list-disc list-inside">
                            <li><strong className="text-slate-900 dark:text-white">Required Column:</strong> <code>Guest Name</code> (e.g. <em>Name</em>, <em>Full Name</em>, <em>Attendee</em>). Rows with blank names are skipped.</li>
                            <li><strong className="text-slate-900 dark:text-white">Phone Normalization:</strong> Numbers with <code>+</code> or spaces (e.g. <code>+255 712 345 678</code> or <code>0712 345 678</code>) are automatically sanitized into digits-only API format (<code>255712345678</code>).</li>
                            <li><strong className="text-slate-900 dark:text-white">Supported Columns:</strong> <code>Guest Name</code>, <code>Phone</code>, <code>Category</code>, <code>Max Entries</code>.</li>
                            <li><strong className="text-slate-900 dark:text-white">Supported Formats:</strong> <code>.xlsx</code>, <code>.xls</code>, <code>.csv</code>, <code>.tsv</code>, <code>.txt</code> (max 10MB).</li>
                        </ul>
                    </div>

                    {/* Import Inputs */}
                    {importMode === 'excel' ? (
                        <div className="space-y-3">
                            <InputLabel value="Select Excel (.xlsx, .xls) or CSV File *" />
                            <div className="relative border-2 border-dashed border-slate-300 dark:border-white/[0.08] hover:border-cyan-500 dark:hover:border-cyan-400 rounded-2xl p-6 text-center transition bg-slate-50/50 dark:bg-white/[0.02]">
                                <input
                                    type="file"
                                    accept=".xlsx,.xls,.csv,.tsv,.txt"
                                    onChange={(e) => importForm.setData('file', e.target.files[0])}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    required={!importForm.data.file}
                                />
                                <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                                        <FileSpreadsheet className="w-6 h-6" />
                                    </div>
                                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        {importForm.data.file ? (
                                            <span className="text-cyan-700 dark:text-cyan-300 flex items-center gap-1.5 justify-center">
                                                <FileCheck className="w-4 h-4 text-emerald-500" />
                                                <span>{importForm.data.file.name}</span>
                                                <span className="text-[10.5px] font-mono text-slate-400">({(importForm.data.file.size / 1024).toFixed(1)} KB)</span>
                                            </span>
                                        ) : (
                                            <span>Click to choose or drag &amp; drop an Excel (.xlsx, .xls) or CSV file</span>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-slate-400">
                                        Accepts Microsoft Excel (.xlsx, .xls) and Comma-Separated Values (.csv)
                                    </p>
                                </div>
                            </div>
                            <InputError message={importForm.errors.file} className="mt-1" />
                        </div>
                    ) : (
                        <div>
                            <InputLabel value="Paste Guest List (Format: Name, Phone, Category, Max Entries)" />
                            <textarea
                                rows={6}
                                className="mt-1 block w-full border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white rounded-2xl text-xs font-mono shadow-xs focus:border-cyan-500 focus:ring-cyan-500"
                                placeholder={`Alfred Mashauri, +255 754 123 456, VIP Pass, 2
Neema Mbwana, 0712 345 678, Double Entry, 2
Baraka Simba, 255765112233, Single Entry, 1`}
                                value={importForm.data.raw_text}
                                onChange={(e) => importForm.setData('raw_text', e.target.value)}
                                required={importMode === 'paste'}
                            />
                            <InputError message={importForm.errors.raw_text} className="mt-1" />
                        </div>
                    )}

                    {/* Defaults for Missing Columns */}
                    <div className="pt-2 border-t border-slate-100 dark:border-white/[0.08] space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Option 1: Default Category */}
                            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.08] flex flex-col justify-between gap-3">
                                <div>
                                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                        <span>Default Category</span>
                                        <span className="text-[10px] text-slate-400 font-normal">(Fallback)</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                                        Applied if your file only contains names and phone numbers.
                                    </p>
                                </div>
                                <select
                                    className="block w-full border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white rounded-xl text-xs font-bold py-2.5 px-3 focus:border-cyan-500 focus:ring-cyan-500 shadow-2xs cursor-pointer"
                                    value={importForm.data.default_category}
                                    onChange={(e) => importForm.setData('default_category', e.target.value)}
                                >
                                    <option value="Single Entry">Single Entry</option>
                                    <option value="Double Entry">Double Entry</option>
                                    <option value="VIP Pass">VIP Pass</option>
                                    <option value="VVIP Pass">VVIP Pass</option>
                                    <option value="Special Guest">Special Guest</option>
                                </select>
                            </div>

                            {/* Option 2: Default Allowed Entries */}
                            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.08] flex flex-col justify-between gap-3">
                                <div>
                                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                        <span>Default Allowed Entries</span>
                                        <span className="text-[10px] text-slate-400 font-normal">(Fallback)</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                                        Scans allowed at gate (1 = Single Entry, 2 = Double Entry).
                                    </p>
                                </div>
                                <input
                                    type="number"
                                    min="1"
                                    max="20"
                                    className="block w-full border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white rounded-xl text-xs font-bold py-2.5 px-3 focus:border-cyan-500 focus:ring-cyan-500 shadow-2xs font-mono"
                                    value={importForm.data.default_max_entries}
                                    onChange={(e) => importForm.setData('default_max_entries', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/[0.08]">
                        <SecondaryButton onClick={() => setImportModalOpen(false)}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton 
                            disabled={importForm.processing || (importMode === 'excel' && !importForm.data.file) || (importMode === 'paste' && !importForm.data.raw_text.trim())} 
                            className="bg-kardovo-navy hover:bg-slate-900 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-xs font-black uppercase tracking-wider gap-2 cursor-pointer"
                        >
                            <Upload className="w-3.5 h-3.5" />
                            <span>{importForm.processing ? 'Processing Import...' : 'Execute Import'}</span>
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal: Add Single Guest Portal */}
            <Modal show={addGuestModalOpen} onClose={() => setAddGuestModalOpen(false)} maxWidth="lg">
                <form onSubmit={handleAddGuestSubmit} className="p-6 sm:p-7 space-y-5">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.08] pb-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2.5 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/40 text-cyan-800 dark:text-cyan-300 text-[10.5px] font-mono font-extrabold uppercase flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" />
                                    <span>Pass Provisioning Portal</span>
                                </span>
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white font-display">
                                Add Attendee Pass
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Generates a unique 4K invitation pass, scannable QR token &amp; security gate code.
                            </p>
                        </div>

                        <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center flex-shrink-0">
                            <Plus className="w-5 h-5 stroke-[2.5]" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* 1. Guest Name */}
                        <div>
                            <InputLabel value="Attendee Full Name *" />
                            <div className="relative mt-1">
                                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <TextInput
                                    type="text"
                                    className="block w-full text-xs font-bold pl-10 py-2.5 rounded-2xl"
                                    placeholder="e.g. Neema Mbwana"
                                    value={addForm.data.name}
                                    onChange={(e) => {
                                        addForm.setData('name', e.target.value);
                                        if (addClientErrors.name) setAddClientErrors(prev => ({ ...prev, name: undefined }));
                                    }}
                                    hasError={Boolean(addClientErrors.name || addForm.errors.name)}
                                    isValid={Boolean(addForm.data.name.trim().length >= 2)}
                                    required
                                    autoFocus
                                />
                            </div>
                            <InputError message={addClientErrors.name || addForm.errors.name} className="mt-1" />
                        </div>

                        {/* 2. Phone Number with Auto-Sanitization Indicator */}
                        <div>
                            <div className="flex items-center justify-between">
                                <InputLabel value="Phone Number (WhatsApp & SMS) *" />
                                {addForm.data.phone && validatePhone(addForm.data.phone) ? (
                                    <span className="text-[10.5px] font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                                        <Check className="w-3 h-3 stroke-[3]" />
                                        <span>Verified phone format</span>
                                    </span>
                                ) : (
                                    <span className="text-[10px] font-mono text-slate-400">
                                        E.164 or local format
                                    </span>
                                )}
                            </div>
                            <div className="relative mt-1">
                                <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <TextInput
                                    type="text"
                                    className="block w-full text-xs font-mono font-bold pl-10 py-2.5 rounded-2xl"
                                    placeholder="0712 345 678 or +255 712 345 678"
                                    value={addForm.data.phone}
                                    onChange={(e) => {
                                        addForm.setData('phone', e.target.value);
                                        if (addClientErrors.phone) setAddClientErrors(prev => ({ ...prev, phone: undefined }));
                                    }}
                                    hasError={Boolean(addClientErrors.phone || addForm.errors.phone)}
                                    isValid={Boolean(addForm.data.phone.trim() && validatePhone(addForm.data.phone))}
                                    required
                                />
                            </div>
                            {addForm.data.phone && (
                                <p className="text-[10.5px] text-slate-500 dark:text-slate-400 font-mono mt-1">
                                    Normalized Destination: <span className="font-bold text-cyan-600 dark:text-cyan-400">{addForm.data.phone.replace(/[^0-9]/g, '').replace(/^0/, '255') || '---'}</span>
                                </p>
                            )}
                            <InputError message={addClientErrors.phone || addForm.errors.phone} className="mt-1" />
                        </div>

                        {/* 3. Pass Category Quick Select Capsules */}
                        <div className="space-y-2">
                            <InputLabel value="Invitation Pass Category *" />
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { name: 'Single Entry', entries: 1, label: 'Single Entry (1x)' },
                                    { name: 'Double Entry', entries: 2, label: 'Double Entry (2x)' },
                                    { name: 'VIP Pass', entries: 2, label: 'VIP Pass (2x)' },
                                    { name: 'VVIP Pass', entries: 3, label: 'VVIP Pass (3x)' },
                                    { name: 'Special Guest', entries: 1, label: 'Special Guest' },
                                    { name: 'Custom', entries: addForm.data.max_entries || 1, label: 'Custom Category' },
                                ].map((cat) => {
                                    const isSelected = addForm.data.category === cat.name;
                                    return (
                                        <button
                                            key={cat.name}
                                            type="button"
                                            onClick={() => {
                                                addForm.setData({
                                                    ...addForm.data,
                                                    category: cat.name === 'Custom' ? (addForm.data.category || 'Special Pass') : cat.name,
                                                    max_entries: cat.entries
                                                });
                                            }}
                                            className={`p-2.5 rounded-xl border text-xs font-bold text-center transition cursor-pointer active:scale-95 flex flex-col items-center justify-center ${
                                                isSelected
                                                    ? 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-500 dark:border-cyan-400 text-cyan-900 dark:text-cyan-100 shadow-sm ring-1 ring-cyan-500/30'
                                                    : 'bg-white dark:bg-[#0B1524] border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 hover:border-slate-300'
                                            }`}
                                        >
                                            <span className="truncate">{cat.name}</span>
                                            <span className="text-[10px] font-mono text-slate-400 mt-0.5">{cat.entries}x scan</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 4. Category Name Text & Allowed Gate Entries */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            <div>
                                <InputLabel value="Category Label (Printed on Pass)" />
                                <TextInput
                                    type="text"
                                    className="block w-full text-xs font-bold py-2.5 rounded-xl mt-1"
                                    value={addForm.data.category}
                                    onChange={(e) => addForm.setData('category', e.target.value)}
                                    placeholder="e.g. Single Entry, VIP Pass"
                                    required
                                />
                            </div>
                            <div>
                                <InputLabel value="Allowed Gate Entries (1 - 20) *" />
                                <TextInput
                                    type="number"
                                    min="1"
                                    max="20"
                                    className="block w-full text-xs font-bold font-mono py-2.5 rounded-xl mt-1"
                                    value={addForm.data.max_entries}
                                    onChange={(e) => addForm.setData('max_entries', parseInt(e.target.value) || 1)}
                                    required
                                />
                            </div>
                        </div>

                        {/* 5. Live Pass Preview Capsule */}
                        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] flex items-center justify-between">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-xl bg-kardovo-navy dark:bg-cyan-600 text-white font-black text-sm flex items-center justify-center flex-shrink-0 shadow-xs">
                                    {(addForm.data.name || 'G').charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <div className="text-xs font-black text-slate-900 dark:text-white truncate">
                                        {addForm.data.name || 'Guest Name Preview'}
                                    </div>
                                    <div className="text-[10.5px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2 mt-0.5">
                                        <span className="text-cyan-700 dark:text-cyan-400 font-bold">{addForm.data.category || 'Single Entry'}</span>
                                        <span>•</span>
                                        <span>{addForm.data.max_entries || 1}x Admittance</span>
                                    </div>
                                </div>
                            </div>

                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 flex-shrink-0">
                                <ShieldCheck className="w-3 h-3" />
                                <span>Secured Pass</span>
                            </span>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/[0.08]">
                        <SecondaryButton onClick={() => setAddGuestModalOpen(false)}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton 
                            disabled={addForm.processing || !addForm.data.name.trim() || !addForm.data.phone.trim()} 
                            className="bg-kardovo-navy hover:bg-slate-900 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-xs font-black uppercase tracking-wider gap-2 cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>{addForm.processing ? 'Provisioning Pass...' : 'Create & Issue Pass'}</span>
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal: Edit Guest Pass */}
            <Modal show={editGuestModalOpen} onClose={() => setEditGuestModalOpen(false)} maxWidth="lg">
                <form onSubmit={handleEditSubmit} className="p-6 sm:p-7 space-y-5">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.08] pb-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2.5 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/40 text-cyan-800 dark:text-cyan-300 text-[10.5px] font-mono font-extrabold uppercase flex items-center gap-1">
                                    <Edit className="w-3 h-3" />
                                    <span>Manage Guest Pass</span>
                                </span>
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white font-display">
                                Edit: {selectedGuest?.name}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                                Pass Code: <span className="font-bold text-slate-700 dark:text-slate-200">{selectedGuest?.unique_code}</span> • Card: <span className="font-bold text-slate-700 dark:text-slate-200">{selectedGuest?.card_number}</span>
                            </p>
                        </div>

                        <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-200 flex items-center justify-center flex-shrink-0">
                            <QrCode className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* 1. Name */}
                        <div>
                            <InputLabel value="Attendee Full Name *" />
                            <div className="relative mt-1">
                                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <TextInput
                                    type="text"
                                    className="block w-full text-xs font-bold pl-10 py-2.5 rounded-2xl"
                                    value={editForm.data.name}
                                    onChange={(e) => {
                                        editForm.setData('name', e.target.value);
                                        if (editClientErrors.name) setEditClientErrors(prev => ({ ...prev, name: undefined }));
                                    }}
                                    hasError={Boolean(editClientErrors.name || editForm.errors.name)}
                                    isValid={Boolean(editForm.data.name.trim().length >= 2)}
                                    required
                                />
                            </div>
                            <InputError message={editClientErrors.name || editForm.errors.name} className="mt-1" />
                        </div>

                        {/* 2. Phone */}
                        <div>
                            <div className="flex items-center justify-between">
                                <InputLabel value="Phone Number (WhatsApp & SMS) *" />
                                {editForm.data.phone && validatePhone(editForm.data.phone) && (
                                    <span className="text-[10.5px] font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                                        <Check className="w-3 h-3 stroke-[3]" />
                                        <span>Verified</span>
                                    </span>
                                )}
                            </div>
                            <div className="relative mt-1">
                                <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <TextInput
                                    type="text"
                                    className="block w-full text-xs font-mono font-bold pl-10 py-2.5 rounded-2xl"
                                    value={editForm.data.phone}
                                    onChange={(e) => {
                                        editForm.setData('phone', e.target.value);
                                        if (editClientErrors.phone) setEditClientErrors(prev => ({ ...prev, phone: undefined }));
                                    }}
                                    hasError={Boolean(editClientErrors.phone || editForm.errors.phone)}
                                    isValid={Boolean(editForm.data.phone.trim() && validatePhone(editForm.data.phone))}
                                    required
                                />
                            </div>
                            <InputError message={editClientErrors.phone || editForm.errors.phone} className="mt-1" />
                        </div>

                        {/* 3. Category & Max Entries */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <InputLabel value="Category Label *" />
                                <TextInput
                                    type="text"
                                    className="block w-full text-xs font-bold py-2.5 rounded-xl mt-1"
                                    value={editForm.data.category}
                                    onChange={(e) => editForm.setData('category', e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <InputLabel value="Max Entries (Allowance) *" />
                                <TextInput
                                    type="number"
                                    min="1"
                                    max="20"
                                    className="block w-full text-xs font-bold font-mono py-2.5 rounded-xl mt-1"
                                    value={editForm.data.max_entries}
                                    onChange={(e) => editForm.setData('max_entries', parseInt(e.target.value) || 1)}
                                    required
                                />
                            </div>
                        </div>

                        {/* 4. Status Tracking */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08]">
                            <div>
                                <InputLabel value="Delivery Status" />
                                <select
                                    className="mt-1 block w-full border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white rounded-xl text-xs font-bold py-2"
                                    value={editForm.data.delivery_status}
                                    onChange={(e) => editForm.setData('delivery_status', e.target.value)}
                                >
                                    <option value="draft">Draft (Unsent)</option>
                                    <option value="sent">Sent</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="failed">Failed</option>
                                </select>
                            </div>

                            <div>
                                <InputLabel value="RSVP Status" />
                                <select
                                    className="mt-1 block w-full border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white rounded-xl text-xs font-bold py-2"
                                    value={editForm.data.rsvp_status}
                                    onChange={(e) => editForm.setData('rsvp_status', e.target.value)}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="attending">Will Attend</option>
                                    <option value="declined">Declined</option>
                                </select>
                            </div>

                            <div>
                                <InputLabel value="Entries Scanned" />
                                <TextInput
                                    type="number"
                                    min="0"
                                    max={editForm.data.max_entries || 20}
                                    className="block w-full text-xs font-bold font-mono py-2 rounded-xl mt-1"
                                    value={editForm.data.entries_used}
                                    onChange={(e) => editForm.setData('entries_used', parseInt(e.target.value) || 0)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/[0.08]">
                        <SecondaryButton onClick={() => setEditGuestModalOpen(false)}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton 
                            disabled={editForm.processing || !editForm.data.name.trim() || !editForm.data.phone.trim()} 
                            className="bg-kardovo-navy hover:bg-slate-900 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-xs font-black uppercase tracking-wider gap-2 cursor-pointer"
                        >
                            <Check className="w-3.5 h-3.5" />
                            <span>{editForm.processing ? 'Saving Changes...' : 'Update Guest Pass'}</span>
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal: Live Card Artefact Preview */}
            <Modal show={cardPreviewModalOpen} onClose={() => setCardPreviewModalOpen(false)} maxWidth="lg">
                <div className="p-6 sm:p-7 space-y-4">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/[0.08]">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2.5 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/40 text-cyan-800 dark:text-cyan-300 text-[10.5px] font-mono font-extrabold uppercase flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" />
                                    <span>Live Pass Rendering</span>
                                </span>
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white font-display">
                                Invitation Pass Preview
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Real-time generated pass artifact for <span className="font-bold text-slate-700 dark:text-slate-200">{previewGuest?.name}</span>
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setCardPreviewModalOpen(false)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] transition cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {previewGuest && (
                        <div className="space-y-4">
                            <PersonalisedCard
                                guest={previewGuest}
                                event={event}
                                template={event?.card_template || event?.cardTemplate}
                                interactive={true}
                            />
                            
                            <div className="p-3.5 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <span className="text-slate-600 dark:text-slate-400 font-medium">Direct Public Pass URL:</span>
                                <a
                                    href={`/card/${previewGuest?.qr_token || ''}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-mono text-cyan-600 dark:text-cyan-400 font-bold hover:underline flex items-center gap-1"
                                >
                                    <span>/card/{(previewGuest?.qr_token || '').substring(0, 16)}...</span>
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Modal: Edit Event Details & Settings */}
            <Modal show={editEventModalOpen} onClose={() => setEditEventModalOpen(false)} maxWidth="lg">
                <form onSubmit={handleEditEventSubmit} className="p-6 sm:p-7 space-y-5">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.08] pb-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2.5 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/40 text-cyan-800 dark:text-cyan-300 text-[10.5px] font-mono font-extrabold uppercase flex items-center gap-1">
                                    <Settings className="w-3 h-3" />
                                    <span>Event Governance</span>
                                </span>
                                <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                                    #{event?.id || ''}
                                </span>
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white font-display">
                                Edit Event Details
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Modify event schedule, venue location, status, and artwork template.
                            </p>
                        </div>

                        <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-200 flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Event Title */}
                        <div>
                            <InputLabel htmlFor="edit_event_title" value="Event Title *" />
                            <TextInput
                                id="edit_event_title"
                                type="text"
                                className="block w-full text-xs font-bold py-2.5 rounded-2xl mt-1"
                                value={editEventForm.data.title}
                                onChange={(e) => editEventForm.setData('title', e.target.value)}
                                required
                            />
                            <InputError message={editEventForm.errors.title} className="mt-1" />
                        </div>

                        {/* Event Type & Date */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <InputLabel htmlFor="edit_event_type" value="Event Type *" />
                                <select
                                    id="edit_event_type"
                                    className="mt-1 block w-full rounded-2xl border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white text-xs font-bold py-2.5 px-3 focus:border-cyan-500 focus:ring-cyan-500 shadow-2xs cursor-pointer"
                                    value={editEventForm.data.event_type}
                                    onChange={(e) => editEventForm.setData('event_type', e.target.value)}
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
                                    className="block w-full text-xs font-bold py-2 rounded-2xl mt-1"
                                    value={editEventForm.data.event_date}
                                    onChange={(e) => editEventForm.setData('event_date', e.target.value)}
                                    required
                                />
                                <InputError message={editEventForm.errors.event_date} className="mt-1" />
                            </div>
                        </div>

                        {/* Time & Status */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <InputLabel htmlFor="edit_event_time" value="Time Label" />
                                <TextInput
                                    id="edit_event_time"
                                    type="text"
                                    className="block w-full text-xs font-semibold py-2.5 rounded-2xl mt-1"
                                    placeholder="e.g. 4:00 PM — Reception &amp; Dinner"
                                    value={editEventForm.data.event_time}
                                    onChange={(e) => editEventForm.setData('event_time', e.target.value)}
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="edit_event_status" value="Event Status" />
                                <select
                                    id="edit_event_status"
                                    className="mt-1 block w-full rounded-2xl border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white text-xs font-bold py-2.5 px-3 focus:border-cyan-500 focus:ring-cyan-500 shadow-2xs cursor-pointer"
                                    value={editEventForm.data.status}
                                    onChange={(e) => editEventForm.setData('status', e.target.value)}
                                >
                                    <option value="active">Active (Live)</option>
                                    <option value="draft">Draft</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>

                        {/* Venue & City */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <InputLabel htmlFor="edit_venue" value="Venue Location *" />
                                <TextInput
                                    id="edit_venue"
                                    type="text"
                                    className="block w-full text-xs font-semibold py-2.5 rounded-2xl mt-1"
                                    value={editEventForm.data.venue}
                                    onChange={(e) => editEventForm.setData('venue', e.target.value)}
                                    required
                                />
                                <InputError message={editEventForm.errors.venue} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="edit_city" value="City" />
                                <TextInput
                                    id="edit_city"
                                    type="text"
                                    className="block w-full text-xs font-semibold py-2.5 rounded-2xl mt-1"
                                    value={editEventForm.data.city}
                                    onChange={(e) => editEventForm.setData('city', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Template Selection */}
                        {templates && templates.length > 0 && (
                            <div>
                                <InputLabel value="Assigned Pass Artwork Template" />
                                <select
                                    className="mt-1 block w-full rounded-2xl border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white text-xs font-bold py-2.5 px-3 focus:border-cyan-500 focus:ring-cyan-500 shadow-2xs cursor-pointer"
                                    value={editEventForm.data.card_template_id}
                                    onChange={(e) => editEventForm.setData('card_template_id', e.target.value)}
                                >
                                    <option value="">Default System Pass</option>
                                    {templates.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.name} ({t.template_type === 'custom_art' ? 'Uploaded Artwork' : t.template_type})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Description */}
                        <div>
                            <InputLabel htmlFor="edit_description" value="Description / Notes" />
                            <textarea
                                id="edit_description"
                                rows={2}
                                className="mt-1 block w-full rounded-2xl border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white text-xs font-medium p-3 focus:border-cyan-500 focus:ring-cyan-500 shadow-2xs"
                                placeholder="Additional details or notes..."
                                value={editEventForm.data.description}
                                onChange={(e) => editEventForm.setData('description', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Modal Footer with Danger Delete Option */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-white/[0.08]">
                        <button
                            type="button"
                            onClick={() => {
                                setEditEventModalOpen(false);
                                handleDeleteEvent();
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition cursor-pointer self-start sm:self-auto"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Event</span>
                        </button>

                        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                            <SecondaryButton onClick={() => setEditEventModalOpen(false)}>
                                Cancel
                            </SecondaryButton>
                            <PrimaryButton 
                                disabled={editEventForm.processing || !editEventForm.data.title.trim()} 
                                className="bg-kardovo-navy hover:bg-slate-900 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-xs font-black uppercase tracking-wider gap-2 cursor-pointer"
                            >
                                <Check className="w-3.5 h-3.5" />
                                <span>{editEventForm.processing ? 'Saving...' : 'Save Event Changes'}</span>
                            </PrimaryButton>
                        </div>
                    </div>
                </form>
            </Modal>

            {/* Modal: Safety Confirmation for Clear All Guests */}
            <Modal show={clearGuestsModalOpen} onClose={() => setClearGuestsModalOpen(false)} maxWidth="md">
                <div className="p-6 space-y-4">
                    <div className="flex items-center gap-3.5 text-rose-600 dark:text-rose-400">
                        <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white font-display">
                                Clear All Attendees?
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                This action is permanent and cannot be undone.
                            </p>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-900 dark:text-rose-200 space-y-2">
                        <p className="font-semibold">
                            You are about to permanently delete all <strong className="font-mono text-rose-700 dark:text-rose-300 font-black">{(guests?.total || 0).toLocaleString()}</strong> attendee pass(es) from <span className="font-bold">"{event?.title}"</span>.
                        </p>
                        <p className="text-[11px] text-rose-700/90 dark:text-rose-300/90">
                            This will also revoke all scannable QR codes, gate entry passes, and clear associated gate scan records.
                        </p>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/[0.08]">
                        <SecondaryButton onClick={() => setClearGuestsModalOpen(false)}>
                            Cancel
                        </SecondaryButton>
                        <DangerButton
                            onClick={() => {
                                router.delete(route('guests.clearAll', event?.id), {
                                    preserveScroll: true,
                                    onSuccess: () => setClearGuestsModalOpen(false),
                                });
                            }}
                            className="text-xs font-black uppercase tracking-wider gap-2 cursor-pointer"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Yes, Permanently Clear All</span>
                        </DangerButton>
                    </div>
                </div>
            </Modal>

            {/* Modal: Safety Confirmation for Clear Gate Activity Logs */}
            <Modal show={clearLogsModalOpen} onClose={() => setClearLogsModalOpen(false)} maxWidth="md">
                <div className="p-6 space-y-4">
                    <div className="flex items-center gap-3.5 text-rose-600 dark:text-rose-400">
                        <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white font-display">
                                Clear Gate Activity Logs?
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Reset scan history and admission audit logs for this event.
                            </p>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] text-xs text-slate-700 dark:text-slate-300 space-y-1.5">
                        <p>
                            This will remove all <strong className="font-mono text-slate-900 dark:text-white">{recentScanLogs.length}</strong> gate audit scan entries from the live gate activity stream for <span className="font-bold">"{event?.title}"</span>.
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Note: Attendee pass limits and check-in counts remain stored on the guest records.
                        </p>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/[0.08]">
                        <SecondaryButton onClick={() => setClearLogsModalOpen(false)}>
                            Cancel
                        </SecondaryButton>
                        <DangerButton
                            onClick={() => {
                                router.delete(route('events.clearScanLogs', event?.id), {
                                    preserveScroll: true,
                                    onSuccess: () => setClearLogsModalOpen(false),
                                });
                            }}
                            className="text-xs font-black uppercase tracking-wider gap-2 cursor-pointer"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Clear Gate Logs</span>
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </KardovoAppLayout>
    );
}
