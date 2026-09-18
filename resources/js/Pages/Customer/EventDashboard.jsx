import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import KardovoAppLayout from '@/Layouts/KardovoAppLayout';
import EmptyEventState from '@/Components/EmptyEventState';
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
import ConfirmationModal from '@/Components/ConfirmationModal';
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
    Palette, TrendingUp, Zap,
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
    const [channelFilter, setChannelFilter] = useState(filters?.channel || 'all');
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
    const [selectTemplateModalOpen, setSelectTemplateModalOpen] = useState(false);
    const [selectedTemplateId, setSelectedTemplateId] = useState(event?.card_template_id || '');
    const [savingTemplate, setSavingTemplate] = useState(false);
    const [clearGuestsModalOpen, setClearGuestsModalOpen] = useState(false);
    const [clearLogsModalOpen, setClearLogsModalOpen] = useState(false);
    const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
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
    const [editEventTab, setEditEventTab] = useState('details'); // 'details' | 'microsite'
    const editEventForm = useForm({
        title: event?.title || '',
        event_type: event?.event_type || 'Wedding Reception',
        event_date: typeof event?.event_date === 'string' ? event.event_date.split('T')[0] : (event?.event_date || ''),
        event_time: event?.event_time || '',
        venue: event?.venue || '',
        city: event?.city || '',
        description: event?.description || '',
        card_template_id: event?.card_template_id || '',
        status: event?.status || 'active',
        microsite_config: {
            accent_color: event?.microsite_config?.accent_color || '#10b981',
            cover_photo: event?.microsite_config?.cover_photo || '',
            tagline: event?.microsite_config?.tagline || '',
            dress_code: event?.microsite_config?.dress_code || '',
            font_style: event?.microsite_config?.font_style || 'script',
            show_countdown: event?.microsite_config?.show_countdown !== false,
            rsvp_prompt: event?.microsite_config?.rsvp_prompt || 'Kindly confirm your attendance',
            music_url: event?.microsite_config?.music_url || '',
            programme: event?.microsite_config?.programme || [],
        },
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
                !selectTemplateModalOpen &&
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
    }, [addGuestModalOpen, editGuestModalOpen, importModalOpen, editEventModalOpen, selectTemplateModalOpen, cardPreviewModalOpen]);

    const handleApplyTemplate = (templateId) => {
        setSavingTemplate(true);
        router.put(route('events.update', event?.id || 1), {
            title: event?.title,
            event_type: event?.event_type,
            event_date: typeof event?.event_date === 'string' ? event.event_date.split('T')[0] : event?.event_date,
            event_time: event?.event_time,
            venue: event?.venue,
            city: event?.city,
            description: event?.description,
            status: event?.status || 'active',
            card_template_id: templateId || null,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setSelectTemplateModalOpen(false);
                setSavingTemplate(false);
                editEventForm.setData('card_template_id', templateId || '');
            },
            onError: () => {
                setSavingTemplate(false);
            }
        });
    };

    const handleEditEventSubmit = (e) => {
        e.preventDefault();
        editEventForm.put(route('events.update', event?.id || 1), {
            onSuccess: () => {
                setEditEventModalOpen(false);
            }
        });
    };

    const handleDeleteEvent = () => {
        setConfirmModal({
            show: true,
            title: 'Delete Event?',
            message: `Delete "${event?.title || 'this event'}"? All guests and passes will be removed.`,
            warning: 'This cannot be undone.',
            confirmText: 'Delete',
            type: 'danger',
            loading: false,
            onConfirm: () => {
                setConfirmModal(prev => ({ ...prev, loading: true }));
                router.delete(route('events.destroy', event?.id), {
                    onFinish: () => setConfirmModal(prev => ({ ...prev, show: false, loading: false })),
                });
            }
        });
    };

    const handleFilterSubmit = (e) => {
        if (e) e.preventDefault();
        router.get(route('events.show', event?.id || 1), {
            search,
            delivery: deliveryFilter,
            channel: channelFilter,
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
        setConfirmModal({
            show: true,
            title: 'Remove Guest?',
            message: `Remove "${guest.name}" from this event?`,
            warning: 'Their pass will no longer work.',
            confirmText: 'Remove',
            type: 'danger',
            loading: false,
            onConfirm: () => {
                setConfirmModal(prev => ({ ...prev, loading: true }));
                router.delete(route('guests.destroy', [event?.id, guest?.id]), {
                    preserveScroll: true,
                    onFinish: () => setConfirmModal(prev => ({ ...prev, show: false, loading: false })),
                });
            }
        });
    };

    const handleDeleteScanLog = (log) => {
        const guestName = log.guest?.name || 'Unregistered Guest';
        setConfirmModal({
            show: true,
            title: 'Delete Scan Log?',
            message: `Delete scan record for "${guestName}"?`,
            confirmText: 'Delete',
            type: 'danger',
            loading: false,
            onConfirm: () => {
                setConfirmModal(prev => ({ ...prev, loading: true }));
                router.delete(route('events.destroyScanLog', [event?.id, log.id]), {
                    preserveScroll: true,
                    onFinish: () => setConfirmModal(prev => ({ ...prev, show: false, loading: false })),
                });
            }
        });
    };

    const handleClearGuests = () => {
        const totalCount = guests?.total || 0;
        if (totalCount === 0) {
            setConfirmModal({
                show: true,
                title: 'No Guests',
                message: 'There are no guests to clear.',
                confirmText: 'OK',
                type: 'info',
                onConfirm: () => setConfirmModal(prev => ({ ...prev, show: false })),
            });
            return;
        }
        setClearGuestsModalOpen(true);
    };

    const handleClearScanLogs = () => {
        if (!recentScanLogs || recentScanLogs.length === 0) {
            setConfirmModal({
                show: true,
                title: 'No Scan Logs',
                message: 'There are no scan records to clear.',
                confirmText: 'OK',
                type: 'info',
                onConfirm: () => setConfirmModal(prev => ({ ...prev, show: false })),
            });
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

    if (!event || !event.id) {
        return (
            <KardovoAppLayout title="Event Details">
                <Head title="Event Details - Kardovo" />
                <div className="max-w-7xl mx-auto py-12 px-4">
                    <EmptyEventState
                        title="No Event Selected"
                        description="Please select an event from the dashboard to view its details."
                        buttonText="Go to Dashboard"
                        buttonHref={route('dashboard')}
                    />
                </div>
            </KardovoAppLayout>
        );
    }

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
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 text-xs font-bold text-slate-100 hover:text-white bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] rounded-xl shadow-2xs transition active:scale-95 cursor-pointer"
                            title="Bulk Import Excel or CSV Guest List"
                        >
                            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="hidden md:inline">Import Excel / CSV</span>
                            <span className="md:hidden">Import</span>
                        </button>
                    )}

                    {/* 2. + Add Guest */}
                    {canImport ? (
                        <button
                            type="button"
                            onClick={() => setAddGuestModalOpen(true)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 text-xs font-bold text-white bg-[#16A34A] hover:bg-[#15803D] border border-[#16A34A] rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Add Guest</span>
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setConfirmModal({
                                show: true,
                                title: 'Feature Locked',
                                message: 'Guest registration is currently disabled for this account.',
                                confirmText: 'OK',
                                type: 'warning',
                                onConfirm: () => setConfirmModal(prev => ({ ...prev, show: false })),
                            })}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 text-xs font-bold text-slate-400 bg-white/[0.08] border border-white/[0.12] rounded-xl cursor-not-allowed opacity-80 shadow-2xs"
                            title="Guest imports locked by administration"
                        >
                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Guest Reg. (Locked)</span>
                        </button>
                    )}

                    {/* 3. Template Picker Button */}
                    {canCustomize && (
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedTemplateId(event?.card_template_id || '');
                                setSelectTemplateModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 text-xs font-bold text-slate-100 hover:text-white bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] rounded-xl shadow-2xs transition active:scale-95 cursor-pointer"
                            title="Select / Change Card Template"
                        >
                            <Palette className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="hidden md:inline">Card Template</span>
                            <span className="md:hidden">Template</span>
                        </button>
                    )}

                    {/* 4. Event Settings Button */}
                    <button
                        type="button"
                        onClick={() => setEditEventModalOpen(true)}
                        className="p-1.5 sm:p-2 text-slate-200 hover:text-white bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] rounded-xl shadow-2xs transition active:scale-95 cursor-pointer"
                        title="Edit Event Details & Settings"
                    >
                        <Edit className="w-4 h-4 text-emerald-400" />
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
                        subtitleColor="text-emerald-600 dark:text-emerald-400 font-semibold"
                        iconColor="text-emerald-600 dark:text-emerald-400"
                        iconBg="bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/20"
                        hoverBorder="hover:border-emerald-500/40 dark:hover:border-emerald-500/40"
                    />
                    <StatCard
                        title="Messages Sent"
                        value={stats?.messages_sent || 0}
                        subtitle={`${stats?.messages_sent || 0} dispatched passes`}
                        icon={Send}
                        titleColor="text-slate-900 dark:text-white"
                        subtitleColor="text-emerald-600 dark:text-emerald-400 font-semibold"
                        iconColor="text-emerald-600 dark:text-emerald-400"
                        iconBg="bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/20"
                        hoverBorder="hover:border-emerald-500/40 dark:hover:border-emerald-500/40"
                    />
                    <StatCard
                        title="RSVP 'Will Attend'"
                        value={stats?.will_attend || 0}
                        subtitle={`${stats?.attendance_percent || 0}% response rate`}
                        icon={CheckCircle2}
                        titleColor="text-slate-900 dark:text-white"
                        subtitleColor="text-emerald-600 dark:text-emerald-400 font-semibold"
                        iconColor="text-emerald-600 dark:text-emerald-400"
                        iconBg="bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/20"
                        hoverBorder="hover:border-emerald-500/40 dark:hover:border-emerald-500/40"
                    />
                    <StatCard
                        title="Checked In"
                        value={stats?.live_checkins || 0}
                        subtitle="Live gate check-ins"
                        icon={QrCode}
                        titleColor="text-slate-900 dark:text-white"
                        subtitleColor="text-emerald-600 dark:text-emerald-400 font-semibold"
                        iconColor="text-emerald-600 dark:text-emerald-400"
                        iconBg="bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/20"
                        hoverBorder="hover:border-emerald-500/40 dark:hover:border-emerald-500/40"
                    />
                </div>

                {/* 📱 Mobile-First Quick Action Dock */}
                <div className="sm:hidden grid grid-cols-2 gap-2 p-2 rounded-2xl bg-white dark:bg-[#0B1524] border border-slate-200/90 dark:border-white/[0.08] shadow-xs">
                    {canImport ? (
                        <>
                            <button
                                type="button"
                                onClick={() => setAddGuestModalOpen(true)}
                                className="py-2.5 px-3 rounded-xl bg-[#16A34A] hover:bg-[#15803D] border border-[#16A34A] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add Guest</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setImportModalOpen(true)}
                                className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-white/[0.08] text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition border border-slate-200 dark:border-white/[0.08] cursor-pointer"
                            >
                                <Upload className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span>Import Excel</span>
                            </button>
                        </>
                    ) : null}

                    {canCustomize && (
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedTemplateId(event?.card_template_id || '');
                                setSelectTemplateModalOpen(true);
                            }}
                            className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-white/[0.08] border border-slate-200 dark:border-white/[0.08] text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition cursor-pointer"
                        >
                            <Palette className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Card Template</span>
                        </button>
                    )}

                    {canBroadcast && (
                        <Link
                            href={route('messaging.index', { event_id: event.id })}
                            className="py-2.5 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition col-span-2 sm:col-span-1"
                        >
                            <Send className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Broadcast</span>
                        </Link>
                    )}
                </div>

                {/* 🎨 Assigned Card Template Banner */}
                <div className="bg-white dark:bg-[#0B1524] rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 border border-slate-200/90 dark:border-white/[0.08] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                            <Palette className="w-4 h-4" />
                        </div>
                        <div className="flex items-center gap-2 min-w-0 text-xs">
                            <span className="text-slate-500 dark:text-slate-400 font-medium">Pass Template:</span>
                            <span className="font-bold text-slate-900 dark:text-white truncate font-display">
                                {event?.card_template?.name || event?.cardTemplate?.name || 'Default System Pass'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
                        {canCustomize && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedTemplateId(event?.card_template_id || '');
                                    setSelectTemplateModalOpen(true);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs active:scale-95 transition cursor-pointer"
                            >
                                <Palette className="w-3.5 h-3.5" />
                                <span>Change Template</span>
                            </button>
                        )}
                        <Link
                            href={route('templates.index')}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.12] text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-1 transition"
                            title="Open Pass Studio"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Pass Studio</span>
                        </Link>
                    </div>
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
                        <form onSubmit={handleFilterSubmit} className="flex flex-wrap items-center justify-end gap-3 w-full md:w-auto mt-3 md:mt-0">
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

                            
                            {/* Channel Filter */}
                            <select
                                className="text-sm py-2 pl-3 pr-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm cursor-pointer hover:border-slate-300 outline-none"
                                value={channelFilter}
                                onChange={(e) => {
                                    setChannelFilter(e.target.value);
                                    router.get(route('events.show', event?.id || 1), {
                                        search,
                                        delivery: deliveryFilter,
                                        channel: e.target.value,
                                        rsvp: rsvpFilter,
                                        category: categoryFilter,
                                    }, { preserveState: true });
                                }}
                            >
                                <option value="all">Channel: All</option>
                                <option value="whatsapp">WhatsApp</option>
                                <option value="sms">SMS</option>
                            </select>


                            {/* Delivery Filter */}
                            <select
                                className="text-sm py-2 pl-3 pr-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm cursor-pointer hover:border-slate-300 outline-none"
                                value={deliveryFilter}
                                onChange={(e) => {
                                    setDeliveryFilter(e.target.value);
                                    router.get(route('events.show', event?.id || 1), {
                                        search,
                                        delivery: e.target.value,
                                        channel: channelFilter,
                                        rsvp: rsvpFilter,
                                        category: categoryFilter,
                                    }, { preserveState: true });
                                }}
                            >
                                <option value="all">Delivery: All</option>
                                <option value="read">Read</option>
                                <option value="delivered">Delivered</option>
                                <option value="sent">Sent</option>
                                <option value="draft">Draft</option>
                                <option value="failed">Failed</option>
                            </select>

                            {/* RSVP Filter */}
                            <div className="w-full sm:w-36">
                                <select
                                    value={rsvpFilter}
                                    onChange={(e) => {
                                        setRsvpFilter(e.target.value);
                                        router.get(route('events.show', event?.id || 1), {
                                            search,
                                            delivery: deliveryFilter,
                                            channel: channelFilter,
                                            rsvp: e.target.value,
                                            category: categoryFilter,
                                        }, { preserveState: true });
                                    }}
                                    className="text-xs py-2 pl-2.5 pr-7 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/70 dark:bg-[#08121E] text-slate-800 dark:text-slate-200 focus:ring-emerald-500 focus:border-emerald-500 font-medium"
                                >
                                    <option value="all">All RSVP</option>
                                    <option value="attending">Will Attend</option>
                                    <option value="declined">Declined</option>
                                    <option value="pending">Pending</option>
                                </select>
                            </div>

                            {/* Secondary Actions (Export & Clear) */}
                            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                                {/* Export Dropdown */}
                                {canExport ? (
                                    <div className="relative" ref={exportDropdownRef}>
                                        <button
                                            type="button"
                                            onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.12] border border-slate-200/80 dark:border-white/[0.08] rounded-xl transition cursor-pointer shadow-2xs"
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                            <span>Export</span>
                                            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${exportDropdownOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        {exportDropdownOpen && (
                                            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#0C1729] rounded-2xl shadow-xl border border-slate-200 dark:border-white/[0.08] p-1.5 z-50 animate-fadeIn space-y-0.5">
                                                <a
                                                    href={route('guests.export', event.id)}
                                                    onClick={() => setExportDropdownOpen(false)}
                                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-xl transition text-left cursor-pointer"
                                                >
                                                    <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                                    <div className="flex flex-col">
                                                        <span>Export as CSV</span>
                                                        <span className="text-[10px] text-slate-400 font-normal">Standard comma-separated format</span>
                                                    </div>
                                                </a>
                                                <a
                                                    href={route('guests.exportPdf', event.id)}
                                                    onClick={() => setExportDropdownOpen(false)}
                                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-xl transition text-left cursor-pointer"
                                                >
                                                    <FileText className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                                                    <div className="flex flex-col">
                                                        <span>Export Printable PDF</span>
                                                        <span className="text-[10px] text-slate-400 font-normal">Formatted attendee roster</span>
                                                    </div>
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        disabled
                                        title="Export disabled by admin"
                                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.06] rounded-xl cursor-not-allowed opacity-75 shadow-2xs"
                                    >
                                        <Lock className="w-3.5 h-3.5" />
                                        <span>Export</span>
                                    </button>
                                )}

                                {/* Clear All Guests Button */}
                                {isAdmin && guests?.total > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setClearGuestsModalOpen(true)}
                                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-white hover:bg-rose-600 dark:hover:bg-rose-600 border border-rose-200 dark:border-rose-900/50 rounded-xl transition active:scale-95 shadow-2xs cursor-pointer group"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span className="hidden sm:inline">Clear List</span>
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Table View */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/95 dark:bg-[#08121E]/95 text-[10.5px] uppercase font-extrabold tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/[0.08] sticky top-0 z-20 backdrop-blur-md shadow-xs">
                                    <th className="py-3 px-4 sm:px-6">Guest Info</th>
                                    <th className="py-3 px-4 sm:px-6">Pass Category</th>
                                    <th className="py-3 px-4 sm:px-6">Card #</th>
                                    <th className="py-3 px-4 sm:px-6">Pass Status</th>
                                    <th className="py-3 px-4 sm:px-6">RSVP Status</th>
                                    <th className="py-3 px-4 sm:px-6">Gate Access</th>
                                    <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06] text-xs">
                                {guests?.data?.length > 0 ? (
                                    guests.data.map((guest, idx) => (
                                        <tr 
                                            key={guest.id} 
                                            className={`hover:bg-emerald-50/30 dark:hover:bg-white/[0.04] transition-colors ${idx % 2 === 1 ? 'bg-slate-50/40 dark:bg-white/[0.02]' : 'bg-white dark:bg-transparent'}`}
                                        >
                                            {/* Column 1: Guest Info */}
                                            <td className="py-3.5 px-4 sm:px-6">
                                                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                    <span>{guest.name}</span>
                                                </div>
                                                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                                                    {guest.phone}
                                                </div>
                                            </td>

                                            {/* Column 2: Category Badge */}
                                            <td className="py-3.5 px-4 sm:px-6">
                                                <span className="font-semibold text-slate-700 dark:text-slate-300">
                                                    {guest.category || 'Single Entry'}
                                                </span>
                                            </td>

                                            {/* Column 3: Card # */}
                                            <td className="py-3.5 px-4 sm:px-6 font-mono text-[11px] font-bold text-slate-600 dark:text-slate-400">
                                                {guest.card_number || '---'}
                                            </td>

                                            {/* Column 4: Pass Status */}
                                            <td className="py-3.5 px-4 sm:px-6">
                                                <StatusBadge status={guest.delivery_status} />
                                            </td>

                                            {/* Column 5: RSVP Status */}
                                            <td className="py-3.5 px-4 sm:px-6">
                                                <StatusBadge status={guest.rsvp_status} />
                                            </td>

                                            {/* Column 6: Gate Access Scans */}
                                            <td className="py-3.5 px-4 sm:px-6 font-mono">
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`font-black ${guest.entries_used >= guest.max_entries ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                                                        {guest.entries_used || 0}
                                                    </span>
                                                    <span className="text-slate-400">/</span>
                                                    <span className="text-slate-500 dark:text-slate-400 font-bold">{guest.max_entries || 1}</span>
                                                    {guest.entries_used >= guest.max_entries && (
                                                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 font-bold">Max</span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Column 7: Actions */}
                                            <td className="py-3.5 px-4 sm:px-6 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setPreviewGuest(guest);
                                                            setCardPreviewModalOpen(true);
                                                        }}
                                                        className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.08] transition cursor-pointer"
                                                        title="Live Preview Pass"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedGuest(guest);
                                                            editForm.setData({
                                                                name: guest.name,
                                                                phone: guest.phone,
                                                                email: guest.email || '',
                                                                category: guest.category || 'Single Entry',
                                                                max_entries: guest.max_entries || 1,
                                                                entries_used: guest.entries_used || 0,
                                                                delivery_status: guest.delivery_status || 'draft',
                                                                rsvp_status: guest.rsvp_status || 'pending',
                                                                notes: guest.notes || '',
                                                            });
                                                            setEditGuestModalOpen(true);
                                                        }}
                                                        className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.08] transition cursor-pointer"
                                                        title="Edit Guest Pass"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    {guest.qr_token && (
                                                        <a
                                                            href={`/card/${guest.qr_token}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.08] transition"
                                                            title="Direct Pass URL"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteGuest(guest.id, guest.name)}
                                                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                                                        title="Revoke & Delete Pass"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="py-12 text-center text-slate-500 dark:text-slate-400">
                                            <Users className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2 stroke-[1.5]" />
                                            <p className="font-bold text-sm text-slate-700 dark:text-slate-300">No guests found</p>
                                            <p className="text-xs mt-1">Try changing filters or import guests to populate the roster.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {guests?.links && guests.links.length > 3 && (
                        <div className="p-4 border-t border-slate-100 dark:border-white/[0.08] flex items-center justify-between">
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                Showing <span className="font-bold text-slate-900 dark:text-white">{guests.from || 0}</span> to <span className="font-bold text-slate-900 dark:text-white">{guests.to || 0}</span> of <span className="font-bold text-slate-900 dark:text-white">{guests.total || 0}</span> passes
                            </div>
                            <div className="flex items-center gap-1">
                                {guests.links.map((link, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        disabled={!link.url}
                                        onClick={() => link.url && router.visit(link.url, { preserveScroll: true })}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1.5 text-xs rounded-xl border transition cursor-pointer ${
                                            link.active 
                                                ? 'bg-[#16A34A] text-white border-[#16A34A] font-bold' 
                                                : (!link.url ? 'text-slate-300 dark:text-slate-600 border-slate-200 dark:border-white/[0.08] cursor-not-allowed' : 'text-slate-700 dark:text-slate-200 border-slate-200 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/[0.06]')
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. Live Gate Activity Log Stream */}
                {recentScanLogs && recentScanLogs.length > 0 && (
                    <div className="bg-white dark:bg-[#0B1524] rounded-3xl border border-slate-200/90 dark:border-white/[0.08] p-5 sm:p-6 shadow-card">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-white/[0.08]">
                            <div className="flex items-center gap-2">
                                <QrCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                <h3 className="text-sm font-black text-slate-900 dark:text-white font-display">
                                    Live Gate Admission Feed
                                </h3>
                                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.08]">
                                    {recentScanLogs.length} scans
                                </span>
                            </div>

                            {isAdmin && (
                                <button
                                    type="button"
                                    onClick={() => setClearLogsModalOpen(true)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-white hover:bg-rose-600 dark:hover:bg-rose-600 border border-rose-200 dark:border-rose-900/50 rounded-xl transition active:scale-95 shadow-xs cursor-pointer"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Clear Logs</span>
                                </button>
                            )}
                        </div>

                        <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                            {recentScanLogs.map((log) => (
                                <div key={log.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.08] text-xs">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                            log.status === 'valid' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                                        }`}>
                                            {log.status === 'valid' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900 dark:text-white">
                                                {log.guest_name || 'Guest'}
                                            </div>
                                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-2">
                                                <span>Scanner: {log.scanner_name || 'Gate Scanner'}</span>
                                                <span>•</span>
                                                <span>{log.scanned_at ? new Date(log.scanned_at).toLocaleString() : 'Just now'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <StatusBadge status={log.status === 'valid' ? 'admitted' : 'rejected'} />
                                        {isAdmin && (
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteLog(log.id)}
                                                className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition active:scale-95 cursor-pointer"
                                                title="Delete this scan log"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            
            
            {/* Modal: Import Excel / Paste Roster Portal */}
            <Modal show={importModalOpen} onClose={() => setImportModalOpen(false)} maxWidth="md">
                <form onSubmit={handleImportSubmit} className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Import Guests</h3>
                        <button type="button" onClick={() => setImportModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex gap-2 mb-6">
                        <button type="button" onClick={() => setImportMode('excel')} className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${importMode === 'excel' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-500/50 dark:bg-emerald-500/10 dark:text-emerald-400' : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800'}`}>Upload File</button>
                        <button type="button" onClick={() => setImportMode('paste')} className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${importMode === 'paste' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-500/50 dark:bg-emerald-500/10 dark:text-emerald-400' : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800'}`}>Paste Text</button>
                    </div>

                    {importMode === 'excel' ? (
                        <div className="space-y-4">
                            <div>
                                <InputLabel value="Select Excel or CSV File" />
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 mb-3 leading-relaxed">
                                    Please upload an Excel (.xlsx, .xls) or CSV file. The file should have columns for <strong>Name</strong> and <strong>Phone</strong> (other columns like Category are optional).
                                </p>
                                <input type="file" className="block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 dark:file:bg-emerald-500/10 dark:file:text-emerald-400 dark:hover:file:bg-emerald-500/20 transition-colors cursor-pointer" accept=".xlsx,.xls,.csv" onChange={(e) => importForm.setData('file', e.target.files[0])} />
                                <InputError message={importForm.errors.file} className="mt-1" />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <InputLabel value="Paste Guest List (Name, Phone)" />
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 mb-3 leading-relaxed">
                                    Paste your guest list with one guest per line. Separate the name and phone number using a comma.
                                </p>
                                <textarea className="w-full border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 focus:border-emerald-500 dark:focus:border-emerald-500 rounded-lg shadow-sm min-h-[120px] text-sm p-3" placeholder="e.g.&#10;Neema Mbwana, 0712 345 678&#10;Baraka Juma, +255 789 123 456" value={importForm.data.raw_text} onChange={(e) => importForm.setData('raw_text', e.target.value)}></textarea>
                                <InputError message={importForm.errors.raw_text} className="mt-1" />
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <div>
                            <InputLabel value="Default Category" />
                            <TextInput type="text" className="block w-full mt-1 text-sm py-2 px-3 rounded-lg" placeholder="e.g. Regular" value={importForm.data.default_category} onChange={(e) => importForm.setData('default_category', e.target.value)} />
                        </div>
                        <div>
                            <InputLabel value="Allowed Entries" />
                            <TextInput type="number" min="1" className="block w-full mt-1 text-sm py-2 px-3 rounded-lg" value={importForm.data.default_max_entries} onChange={(e) => importForm.setData('default_max_entries', e.target.value)} />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-8">
                        <SecondaryButton onClick={() => setImportModalOpen(false)} className="!rounded-lg !py-2 !px-4 text-sm cursor-pointer">Cancel</SecondaryButton>
                        <PrimaryButton disabled={importForm.processing} className="!rounded-lg !py-2 !px-4 text-sm gap-1.5 cursor-pointer">
                            <Check className="w-4 h-4" />
                            <span>Import Guests</span>
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
{/* Modal: Add Single Guest Portal */}
            <Modal show={addGuestModalOpen} onClose={() => setAddGuestModalOpen(false)} maxWidth="sm">
                <form onSubmit={handleAddGuestSubmit} className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Guest</h3>
                        <button type="button" onClick={() => setAddGuestModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <InputLabel value="Full Name" />
                            <TextInput type="text" className="block w-full mt-1 text-sm py-2 px-3 rounded-lg" placeholder="e.g. John Doe" value={addForm.data.name} onChange={(e) => { addForm.setData('name', e.target.value); if (addClientErrors.name) setAddClientErrors(prev => ({ ...prev, name: undefined })); }} required autoFocus />
                            <InputError message={addClientErrors.name || addForm.errors.name} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel value="Phone Number" />
                            <TextInput type="text" className="block w-full mt-1 text-sm py-2 px-3 rounded-lg" placeholder="e.g. 0712345678" value={addForm.data.phone} onChange={(e) => { addForm.setData('phone', e.target.value); if (addClientErrors.phone) setAddClientErrors(prev => ({ ...prev, phone: undefined })); }} required />
                            <InputError message={addClientErrors.phone || addForm.errors.phone} className="mt-1" />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <InputLabel value="Category" />
                                <TextInput type="text" className="block w-full mt-1 text-sm py-2 px-3 rounded-lg" placeholder="e.g. VIP" value={addForm.data.category} onChange={(e) => addForm.setData('category', e.target.value)} />
                            </div>
                            <div>
                                <InputLabel value="Entries" />
                                <TextInput type="number" min="1" className="block w-full mt-1 text-sm py-2 px-3 rounded-lg" value={addForm.data.max_entries} onChange={(e) => addForm.setData('max_entries', parseInt(e.target.value) || 1)} />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-8">
                        <SecondaryButton onClick={() => setAddGuestModalOpen(false)} className="!rounded-lg !py-2 !px-4 text-sm cursor-pointer">Cancel</SecondaryButton>
                        <PrimaryButton disabled={addForm.processing} className="!rounded-lg !py-2 !px-4 text-sm gap-1.5 cursor-pointer">
                            <Plus className="w-4 h-4" />
                            <span>Save Guest</span>
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
{/* Modal: Edit Guest Pass */}
            <Modal show={editGuestModalOpen} onClose={() => setEditGuestModalOpen(false)} maxWidth="lg">
                <form onSubmit={handleEditSubmit} className="p-6 sm:p-7 space-y-5 overflow-y-auto max-h-[90vh]">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.08] pb-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-[10.5px] font-mono font-extrabold uppercase flex items-center gap-1">
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
                                    <option value="read">Read</option>
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
                            className="text-xs font-black uppercase tracking-wider gap-2 cursor-pointer"
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
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-[10.5px] font-mono font-extrabold uppercase flex items-center gap-1">
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
                                    className="font-mono text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
                                >
                                    <span>/card/{(previewGuest?.qr_token || '').substring(0, 16)}...</span>
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Modal: Select Card Template */}
            <Modal show={selectTemplateModalOpen} onClose={() => setSelectTemplateModalOpen(false)} maxWidth="md">
                <div className="p-5 sm:p-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.08] pb-3.5">
                        <div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white font-display">
                                Select Template
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Choose a card template for this event.
                            </p>
                        </div>

                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                            <Palette className="w-4 h-4" />
                        </div>
                    </div>

                    {/* Template List: Just list the titles */}
                    <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                        {/* 1. Default System Pass */}
                        <div
                            onClick={() => setSelectedTemplateId('')}
                            className={`px-4 py-3 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                                selectedTemplateId === '' || selectedTemplateId === null || selectedTemplateId === undefined
                                    ? 'border-[#16A34A] bg-emerald-500/5 dark:bg-emerald-500/10'
                                    : 'border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#08121E] hover:border-slate-300 dark:hover:border-white/[0.15]'
                            }`}
                        >
                            <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                                Default System Pass
                            </span>
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center border transition flex-shrink-0 ${
                                selectedTemplateId === '' || selectedTemplateId === null || selectedTemplateId === undefined
                                    ? 'bg-[#16A34A] border-[#16A34A] text-white'
                                    : 'border-slate-300 dark:border-slate-600'
                            }`}>
                                {(selectedTemplateId === '' || selectedTemplateId === null || selectedTemplateId === undefined) && (
                                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                                )}
                            </div>
                        </div>

                        {/* 2. Custom & Preset Templates */}
                        {templates && templates.map((tmpl) => {
                            const isSelected = String(selectedTemplateId) === String(tmpl.id);
                            return (
                                <div
                                    key={tmpl.id}
                                    onClick={() => setSelectedTemplateId(tmpl.id)}
                                    className={`px-4 py-3 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                                        isSelected
                                            ? 'border-[#16A34A] bg-emerald-500/5 dark:bg-emerald-500/10'
                                            : 'border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#08121E] hover:border-slate-300 dark:hover:border-white/[0.15]'
                                    }`}
                                >
                                    <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                                        {tmpl.name}
                                    </span>
                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center border transition flex-shrink-0 ${
                                        isSelected
                                            ? 'bg-[#16A34A] border-[#16A34A] text-white'
                                            : 'border-slate-300 dark:border-slate-600'
                                    }`}>
                                        {isSelected && (
                                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pass Studio Link Helper */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.06] text-xs">
                        <span className="text-slate-500 dark:text-slate-400">
                            Need a new template?
                        </span>
                        <Link
                            href={route('templates.index')}
                            className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline inline-flex items-center gap-1"
                        >
                            <span>Open Pass Studio</span>
                            <ExternalLink className="w-3 h-3" />
                        </Link>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/[0.08]">
                        <SecondaryButton onClick={() => setSelectTemplateModalOpen(false)}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton
                            onClick={() => handleApplyTemplate(selectedTemplateId)}
                            disabled={savingTemplate}
                            className="text-xs font-bold gap-1.5 cursor-pointer"
                        >
                            <Check className="w-3.5 h-3.5" />
                            <span>{savingTemplate ? 'Saving...' : 'Save'}</span>
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>

            {/* Modal: Edit Event Details & Settings */}
            <Modal show={editEventModalOpen} onClose={() => setEditEventModalOpen(false)} maxWidth="lg">
                <form onSubmit={handleEditEventSubmit} className="p-6 sm:p-7 space-y-5 overflow-y-auto max-h-[85vh]">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.08] pb-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-[10.5px] font-mono font-extrabold uppercase flex items-center gap-1">
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

                    {/* Tab Switcher */}
                    <div className="flex gap-1 bg-slate-100 dark:bg-white/[0.05] rounded-xl p-1">
                        {[{ key: 'details', label: 'Event Details', icon: Settings }, { key: 'microsite', label: 'Microsite', icon: Sparkles }].map(({ key, label, icon: Icon }) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setEditEventTab(key)}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${editEventTab === key ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {label}
                            </button>
                        ))}
                    </div>

                    {editEventTab === 'details' && (
                    <div className="space-y-4">
                        {/* Event Title */}
                        <div>
                            <InputLabel htmlFor="edit_event_title" value="Event Title *" />
                            <TextInput
                                id="edit_event_title"
                                type="text"
                                className="block w-full text-xs font-bold py-2.5 rounded-2xl mt-1"
                                placeholder="e.g. Neema & Baraka — Wedding Reception"
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
                                    className="mt-1 block w-full rounded-2xl border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white text-xs font-bold py-2.5 px-3 focus:border-emerald-500 focus:ring-emerald-500 shadow-2xs cursor-pointer"
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
                                    className="mt-1 block w-full rounded-2xl border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white text-xs font-bold py-2.5 px-3 focus:border-emerald-500 focus:ring-emerald-500 shadow-2xs cursor-pointer"
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
                                    placeholder="e.g. Serena Hotel, Kibo Hall"
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
                                    placeholder="e.g. Dar es Salaam"
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
                                    className="mt-1 block w-full rounded-2xl border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white text-xs font-bold py-2.5 px-3 focus:border-emerald-500 focus:ring-emerald-500 shadow-2xs cursor-pointer"
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
                                className="mt-1 block w-full rounded-2xl border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white text-xs font-medium p-3 focus:border-emerald-500 focus:ring-emerald-500 shadow-2xs"
                                placeholder="Additional details or notes..."
                                value={editEventForm.data.description}
                                onChange={(e) => editEventForm.setData('description', e.target.value)}
                            />
                        </div>
                    </div>
                    )}

                    {/* ── Microsite Tab ── */}
                    {editEventTab === 'microsite' && (
                    <div className="space-y-5">
                        {/* Info Banner */}
                        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                <Palette className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Customise Your Microsite</h4>
                                <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 mt-0.5 leading-relaxed">
                                    Personalize the interactive landing page your guests will see.
                                </p>
                            </div>
                        </div>

                        {/* Visuals & Branding */}
                        <div className="space-y-4 p-4 rounded-2xl border border-slate-200/80 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.01]">
                            <div className="flex items-center gap-2 mb-1">
                                <Sparkles className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                <h4 className="text-[11px] font-bold text-slate-800 dark:text-white uppercase tracking-wider">Visuals & Branding</h4>
                            </div>

                            <div>
                                <InputLabel htmlFor="ms_cover_photo" value="Hero Background URL" />
                                <TextInput
                                    id="ms_cover_photo"
                                    type="url"
                                    className="block w-full text-xs py-2.5 rounded-xl mt-1 bg-white dark:bg-[#0B1524]"
                                    placeholder="https://example.com/wedding-photo.jpg"
                                    value={editEventForm.data.microsite_config.cover_photo}
                                    onChange={(e) => editEventForm.setData('microsite_config', { ...editEventForm.data.microsite_config, cover_photo: e.target.value })}
                                />
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <InputLabel value="Accent Color" />
                                    <div className="flex items-center gap-2 mt-1 relative">
                                        <input
                                            type="color"
                                            value={editEventForm.data.microsite_config.accent_color}
                                            onChange={(e) => editEventForm.setData('microsite_config', { ...editEventForm.data.microsite_config, accent_color: e.target.value })}
                                            className="w-10 h-10 rounded-xl border border-slate-200 dark:border-white/10 cursor-pointer p-0.5 bg-white dark:bg-[#0B1524]"
                                        />
                                        <TextInput
                                            type="text"
                                            className="flex-1 text-xs font-mono py-2.5 rounded-xl bg-white dark:bg-[#0B1524] uppercase"
                                            value={editEventForm.data.microsite_config.accent_color}
                                            onChange={(e) => editEventForm.setData('microsite_config', { ...editEventForm.data.microsite_config, accent_color: e.target.value })}
                                            placeholder="#10B981"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <InputLabel value="Typography" />
                                    <select
                                        className="mt-1 block w-full rounded-xl border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#0B1524] text-slate-900 dark:text-white text-xs py-2.5 px-3 focus:border-emerald-500 focus:ring-emerald-500 shadow-2xs cursor-pointer"
                                        value={editEventForm.data.microsite_config.font_style}
                                        onChange={(e) => editEventForm.setData('microsite_config', { ...editEventForm.data.microsite_config, font_style: e.target.value })}
                                    >
                                        <option value="script">Script / Elegant</option>
                                        <option value="serif">Classic Serif</option>
                                        <option value="modern">Modern Sans</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Content & Settings */}
                        <div className="space-y-4 p-4 rounded-2xl border border-slate-200/80 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.01]">
                            <div className="flex items-center gap-2 mb-1">
                                <TrendingUp className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                <h4 className="text-[11px] font-bold text-slate-800 dark:text-white uppercase tracking-wider">Content & Copy</h4>
                            </div>

                            <div>
                                <InputLabel htmlFor="ms_tagline" value="Tagline / Subtitle" />
                                <TextInput
                                    id="ms_tagline"
                                    type="text"
                                    className="block w-full text-xs py-2.5 rounded-xl mt-1 bg-white dark:bg-[#0B1524]"
                                    placeholder="e.g. Together with their families..."
                                    value={editEventForm.data.microsite_config.tagline}
                                    onChange={(e) => editEventForm.setData('microsite_config', { ...editEventForm.data.microsite_config, tagline: e.target.value })}
                                />
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <InputLabel htmlFor="ms_dress_code" value="Dress Code" />
                                    <TextInput
                                        id="ms_dress_code"
                                        type="text"
                                        className="block w-full text-xs py-2.5 rounded-xl mt-1 bg-white dark:bg-[#0B1524]"
                                        placeholder="e.g. Black Tie"
                                        value={editEventForm.data.microsite_config.dress_code}
                                        onChange={(e) => editEventForm.setData('microsite_config', { ...editEventForm.data.microsite_config, dress_code: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <InputLabel htmlFor="ms_rsvp_prompt" value="RSVP Prompt" />
                                    <TextInput
                                        id="ms_rsvp_prompt"
                                        type="text"
                                        className="block w-full text-xs py-2.5 rounded-xl mt-1 bg-white dark:bg-[#0B1524]"
                                        placeholder="Confirm Attendance"
                                        value={editEventForm.data.microsite_config.rsvp_prompt}
                                        onChange={(e) => editEventForm.setData('microsite_config', { ...editEventForm.data.microsite_config, rsvp_prompt: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Special Features */}
                        <div className="space-y-4 p-4 rounded-2xl border border-slate-200/80 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.01]">
                            <div className="flex items-center gap-2 mb-1">
                                <Zap className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                <h4 className="text-[11px] font-bold text-slate-800 dark:text-white uppercase tracking-wider">Special Features</h4>
                            </div>
                            
                            <div>
                                <InputLabel htmlFor="ms_music" value="Background Music URL (Optional)" />
                                <TextInput
                                    id="ms_music"
                                    type="url"
                                    className="block w-full text-xs py-2.5 rounded-xl mt-1 bg-white dark:bg-[#0B1524]"
                                    placeholder="https://example.com/song.mp3"
                                    value={editEventForm.data.microsite_config.music_url}
                                    onChange={(e) => editEventForm.setData('microsite_config', { ...editEventForm.data.microsite_config, music_url: e.target.value })}
                                />
                            </div>
                            
                            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-[#0B1524] border border-slate-200 dark:border-white/[0.06]">
                                <div>
                                    <div className="text-xs font-bold text-slate-800 dark:text-white">Countdown Timer</div>
                                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Show live timer on hero banner</div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={editEventForm.data.microsite_config.show_countdown}
                                        onChange={(e) => editEventForm.setData('microsite_config', { ...editEventForm.data.microsite_config, show_countdown: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:bg-emerald-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
                                </label>
                            </div>
                        </div>

                        {/* Programme / Timeline */}
                        <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.01]">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                    <h4 className="text-[11px] font-bold text-slate-800 dark:text-white uppercase tracking-wider">Programme / Timeline</h4>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const prog = [...(editEventForm.data.microsite_config.programme || []), { time: '', title: '', note: '' }];
                                        editEventForm.setData('microsite_config', { ...editEventForm.data.microsite_config, programme: prog });
                                    }}
                                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline cursor-pointer flex items-center gap-1 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg transition"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Add Item
                                </button>
                            </div>
                            
                            {(editEventForm.data.microsite_config.programme || []).length === 0 && (
                                <div className="flex flex-col items-center justify-center p-6 text-center bg-white dark:bg-[#0B1524] rounded-xl border border-slate-200 dark:border-white/[0.06] border-dashed">
                                    <Calendar className="w-6 h-6 text-slate-300 dark:text-slate-600 mb-2" />
                                    <p className="text-xs text-slate-500 font-medium">No timeline items yet.</p>
                                    <p className="text-[10px] text-slate-400 mt-1">Add your event schedule to guide your guests.</p>
                                </div>
                            )}
                            
                            <div className="space-y-4">
                                {(editEventForm.data.microsite_config.programme || []).map((item, i) => (
                                    <div key={i} className="flex flex-col gap-3 bg-white dark:bg-[#0B1524] rounded-xl p-3 border border-slate-200 dark:border-white/[0.06] shadow-sm relative">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const prog = editEventForm.data.microsite_config.programme.filter((_, idx) => idx !== i);
                                                editEventForm.setData('microsite_config', { ...editEventForm.data.microsite_config, programme: prog });
                                            }}
                                            className="absolute top-2 right-2 text-slate-400 hover:text-rose-500 bg-slate-50 hover:bg-rose-50 dark:bg-white/[0.02] dark:hover:bg-rose-500/10 p-1.5 rounded-lg transition cursor-pointer"
                                            title="Remove item"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                        
                                        <div className="w-full pr-8">
                                            <InputLabel value="Time" className="!text-[10px] uppercase mb-1" />
                                            <input
                                                type="text"
                                                className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-xs font-mono font-bold px-2.5 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-emerald-500 focus:border-emerald-500"
                                                placeholder="6:00 PM"
                                                value={item.time}
                                                onChange={(e) => {
                                                    const prog = editEventForm.data.microsite_config.programme.map((it, idx) => idx === i ? { ...it, time: e.target.value } : it);
                                                    editEventForm.setData('microsite_config', { ...editEventForm.data.microsite_config, programme: prog });
                                                }}
                                            />
                                        </div>
                                        <div className="w-full">
                                            <InputLabel value="Activity" className="!text-[10px] uppercase mb-1" />
                                            <input
                                                type="text"
                                                className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-xs font-bold px-2.5 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-emerald-500 focus:border-emerald-500"
                                                placeholder="Reception & Dinner"
                                                value={item.title}
                                                onChange={(e) => {
                                                    const prog = editEventForm.data.microsite_config.programme.map((it, idx) => idx === i ? { ...it, title: e.target.value } : it);
                                                    editEventForm.setData('microsite_config', { ...editEventForm.data.microsite_config, programme: prog });
                                                }}
                                            />
                                        </div>
                                        <div className="w-full">
                                            <input
                                                type="text"
                                                className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-transparent text-xs px-2.5 py-2 text-slate-600 dark:text-slate-300 placeholder-slate-400 focus:ring-emerald-500 focus:border-emerald-500"
                                                placeholder="Optional extra details..."
                                                value={item.note}
                                                onChange={(e) => {
                                                    const prog = editEventForm.data.microsite_config.programme.map((it, idx) => idx === i ? { ...it, note: e.target.value } : it);
                                                    editEventForm.setData('microsite_config', { ...editEventForm.data.microsite_config, programme: prog });
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    )}

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
                                className="text-xs font-black uppercase tracking-wider gap-2 cursor-pointer"
                            >
                                <Check className="w-3.5 h-3.5" />
                                <span>{editEventForm.processing ? 'Saving...' : 'Save Event Changes'}</span>
                            </PrimaryButton>
                        </div>
                    </div>
                </form>
            </Modal>

            {/* Modal: Safety Confirmation for Clear All Guests */}
            <Modal show={clearGuestsModalOpen} onClose={() => setClearGuestsModalOpen(false)} maxWidth="sm">
                <div className="p-5 sm:p-6 space-y-4">
                    <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 flex items-center justify-center flex-shrink-0 border border-rose-500/20">
                            <Trash2 className="w-5 h-5" />
                        </div>
                        <div className="flex-1 pt-0.5">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                                Clear All Guests?
                            </h3>
                            <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                Delete all {(guests?.total || 0).toLocaleString()} guest passes from "{event?.title}"?
                            </p>
                            <p className="mt-2 text-xs font-medium text-rose-600 dark:text-rose-400">
                                This cannot be undone.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
                        <SecondaryButton onClick={() => setClearGuestsModalOpen(false)} className="!rounded-xl !py-2 !px-4 text-xs font-semibold cursor-pointer">
                            Cancel
                        </SecondaryButton>
                        <DangerButton
                            onClick={() => {
                                router.delete(route('guests.clearAll', event?.id), {
                                    preserveScroll: true,
                                    onSuccess: () => setClearGuestsModalOpen(false),
                                });
                            }}
                            className="!rounded-xl !py-2 !px-4 text-xs font-bold gap-1.5 cursor-pointer"
                        >
                            <span>Clear All</span>
                        </DangerButton>
                    </div>
                </div>
            </Modal>

            {/* Modal: Safety Confirmation for Clear Gate Activity Logs */}
            <Modal show={clearLogsModalOpen} onClose={() => setClearLogsModalOpen(false)} maxWidth="sm">
                <div className="p-5 sm:p-6 space-y-4">
                    <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 flex items-center justify-center flex-shrink-0 border border-rose-500/20">
                            <Trash2 className="w-5 h-5" />
                        </div>
                        <div className="flex-1 pt-0.5">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                                Clear Gate Logs?
                            </h3>
                            <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                Delete all {recentScanLogs.length} scan records for "{event?.title}"?
                            </p>
                            <p className="mt-2 text-xs font-medium text-rose-600 dark:text-rose-400">
                                This cannot be undone.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
                        <SecondaryButton onClick={() => setClearLogsModalOpen(false)} className="!rounded-xl !py-2 !px-4 text-xs font-semibold cursor-pointer">
                            Cancel
                        </SecondaryButton>
                        <DangerButton
                            onClick={() => {
                                router.delete(route('events.clearScanLogs', event?.id), {
                                    preserveScroll: true,
                                    onSuccess: () => setClearLogsModalOpen(false),
                                });
                            }}
                            className="!rounded-xl !py-2 !px-4 text-xs font-bold gap-1.5 cursor-pointer"
                        >
                            <span>Clear Logs</span>
                        </DangerButton>
                    </div>
                </div>
            </Modal>

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
