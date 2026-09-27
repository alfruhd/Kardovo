import React, { useState, useRef, useEffect } from 'react';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import KardovoAppLayout from '@/Layouts/KardovoAppLayout';
import Pagination from '@/Components/Pagination';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import ConfirmationModal from '@/Components/ConfirmationModal';
import {
    Ticket,
    Tag,
    Plus,
    Search,
    ExternalLink,
    Copy,
    Check,
    Settings,
    Edit,
    Trash2,
    Clock,
    DollarSign,
    Users,
    QrCode,
    CheckCircle2,
    AlertCircle,
    ShoppingBag,
    Eye,
    Printer,
    Download,
    MessageSquare,
    Phone,
    Mail,
    ChevronDown,
    ChevronUp,
    Sparkles,
    Calendar,
    MapPin,
    ArrowRight,
    Plane,
    Hotel,
    Music,
    PartyPopper,
    Trophy,
    Globe,
    Upload,
    Image as ImageIcon,
    Share2,
    Layers,
    TrendingUp,
    Palette,
    X
} from 'lucide-react';

export default function TicketingPortal({
    events = [],
    selectedEvent = null,
    selectedEventStats = null,
    selectedEventTiers = [],
    selectedEventOrders = [],
    selectedEventTickets = { data: [], total: 0, links: [] },
    globalStats = {},
    filters = {},
}) {
    const { auth, selectedEvent: liveSelectedEvent } = usePage().props;
    const user = auth?.user;
    const isAdmin = user?.role === 'admin' || user?.is_admin;

    const [activeTab, setActiveTab] = useState('tiers'); // 'tiers' | 'tickets' | 'orders'
    const [eventDropdownOpen, setEventDropdownOpen] = useState(false);
    const eventDropdownRef = useRef(null);
    const [tierModalOpen, setTierModalOpen] = useState(false);
    const [editingTier, setEditingTier] = useState(null);
    const [settingsModalOpen, setSettingsModalOpen] = useState(false);
    const [occasionModalOpen, setOccasionModalOpen] = useState(false);
    const [passDesignerOpen, setPassDesignerOpen] = useState(false);
    const [designerTab, setDesignerTab] = useState('card'); // 'card' | 'stub' | 'details'
    const [coverUploadPreview, setCoverUploadPreview] = useState(null);
    const [expandedOrderId, setExpandedOrderId] = useState(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (eventDropdownRef.current && !eventDropdownRef.current.contains(event.target)) {
                setEventDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Search and filter state
    const [search, setSearch] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');
    const [tierFilter, setTierFilter] = useState(filters?.tier_id || 'all');

    // Multi-channel dispatch modals for individual tickets
    const [dispatchModal, setDispatchModal] = useState({
        show: false,
        channel: null, // 'whatsapp' | 'sms' | 'email'
        ticket: null,
        recipient: '',
        loading: false,
        successMessage: '',
        errorMessage: '',
    });

    // Delete tier modal
    const [deleteModal, setDeleteModal] = useState({
        show: false,
        tier: null,
        loading: false,
    });

    const publicUrl = selectedEvent && typeof window !== 'undefined'
        ? `${window.location.origin}/e/${selectedEvent.id}/tickets`
        : (selectedEvent ? `/e/${selectedEvent.id}/tickets` : '');

    // Tier Form
    const tierForm = useForm({
        name: '',
        description: '',
        price: 0,
        capacity: 100,
        max_per_order: 10,
        status: 'active',
        sales_start_at: '',
        sales_end_at: '',
        color: '#10b981',
    });

    // Settings Form
    const settingsForm = useForm({
        ticketing_enabled: Boolean(selectedEvent?.ticketing_enabled),
        ticket_currency: selectedEvent?.ticket_currency || 'TZS',
        ticket_instructions: selectedEvent?.ticket_instructions || '',
        ticket_sales_end_at: selectedEvent?.ticket_sales_end_at
            ? (typeof selectedEvent.ticket_sales_end_at === 'string' ? selectedEvent.ticket_sales_end_at.slice(0, 16) : '')
            : '',
        is_public: selectedEvent?.is_public !== false,
        occasion_type: selectedEvent?.occasion_type || 'event',
        cover_photo: selectedEvent?.cover_photo || '',
        cover_image: null,
    });

    const [customDesignPreview, setCustomDesignPreview] = useState(null);

    // Pass Designer Form (Simple Customizer for Left Design & Right QR Stub)
    const currentTemplateConfig = selectedEvent?.ticket_template_config || {};
    const passDesignForm = useForm({
        accent_color: currentTemplateConfig.accent_color || '#FABF24',
        right_bg_color: currentTemplateConfig.right_bg_color || '#FFFFFF',
        right_overlay: currentTemplateConfig.right_overlay || 'none',
        left_design_mode: currentTemplateConfig.left_design_mode || 'default',
        left_bg_color: currentTemplateConfig.left_bg_color || currentTemplateConfig.bg_color || '#241645',
        left_bg_image: currentTemplateConfig.left_bg_image || '',
        custom_design_file: null,
        badge_text: currentTemplateConfig.badge_text || '',
        custom_instructions: currentTemplateConfig.custom_instructions || '',
        show_confetti: currentTemplateConfig.show_confetti !== false,
        show_barcode: currentTemplateConfig.show_barcode !== false,
    });

    // Sync form state whenever selectedEvent.ticket_template_config changes from server
    const prevConfigRef = useRef(null);
    useEffect(() => {
        const liveEvent = liveSelectedEvent || selectedEvent;
        const configStr = JSON.stringify(liveEvent?.ticket_template_config);
        if (configStr === prevConfigRef.current) return; // no change, skip
        prevConfigRef.current = configStr;
        const config = liveEvent?.ticket_template_config || {};
        if (!config || Object.keys(config).length === 0) return;
        passDesignForm.reset();
        passDesignForm.setData({
            accent_color: config.accent_color || '#FABF24',
            right_bg_color: config.right_bg_color || '#FFFFFF',
            right_overlay: config.right_overlay || 'none',
            left_design_mode: config.left_design_mode || 'default',
            left_bg_color: config.left_bg_color || config.bg_color || '#241645',
            left_bg_image: config.left_bg_image || '',
            custom_design_file: null,
            badge_text: config.badge_text || '',
            custom_instructions: config.custom_instructions || '',
            show_confetti: config.show_confetti !== false,
            show_barcode: config.show_barcode !== false,
        });
    });

    const formatTicketDate = (dateStr) => {
        if (!dateStr) return 'Sunday, 25 October 2026';
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
        } catch {
            return dateStr;
        }
    };
    const openPassDesigner = () => {
        if (!selectedEvent) return;
        const config = (liveSelectedEvent || selectedEvent)?.ticket_template_config || {};
        passDesignForm.setData({
            accent_color: config.accent_color || '#FABF24',
            right_bg_color: config.right_bg_color || '#FFFFFF',
            right_overlay: config.right_overlay || 'none',
            left_design_mode: config.left_design_mode || 'default',
            left_bg_color: config.left_bg_color || config.bg_color || '#241645',
            left_bg_image: config.left_bg_image || '',
            custom_design_file: null,
            badge_text: config.badge_text || '',
            custom_instructions: config.custom_instructions || '',
            show_confetti: config.show_confetti !== false,
            show_barcode: config.show_barcode !== false,
        });
        setCustomDesignPreview(config.left_bg_image || null);
        setDesignerTab('card');
        setPassDesignerOpen(true);
    };

    const handleCustomDesignFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        passDesignForm.setData('custom_design_file', file);
        const reader = new FileReader();
        reader.onload = (ev) => {
            setCustomDesignPreview(ev.target?.result);
        };
        reader.readAsDataURL(file);
    };

    const handlePassDesignSubmit = (e) => {
        e.preventDefault();
        if (!selectedEvent) return;
        passDesignForm
            .transform((data) => ({
                ...data,
                show_confetti: data.show_confetti ? 1 : 0,
                show_barcode: data.show_barcode ? 1 : 0,
                custom_design_file: data.custom_design_file instanceof File ? data.custom_design_file : null,
            }))
            .post(route('events.ticketTemplate.update', selectedEvent.id), {
            preserveScroll: true,
            preserveState: false,
            forceFormData: true,
            onSuccess: () => {
                setPassDesignerOpen(false);
                // Partial reload: fetch only the selectedEvent prop with fresh DB data
                router.reload({ only: ['selectedEvent', 'selectedEventTiers', 'selectedEventStats'], preserveScroll: true });
            },
            onError: (errors) => {
                console.error('[PassDesign] Save FAILED with errors:', errors);
                alert('Save failed: ' + JSON.stringify(errors));
            },
        });
    };

    // Occasion Form
    const occasionForm = useForm({
        title: '',
        occasion_type: 'event',
        event_date: '',
        event_time: '',
        venue: '',
        city: 'Dar es Salaam',
        description: '',
        ticket_currency: 'TZS',
        ticket_instructions: '',
        is_public: true,
        cover_photo: '',
        cover_image: null,
        initial_tier_name: 'Standard Admission',
        initial_tier_price: 25000,
        initial_tier_capacity: 150,
    });

    const occasionCategories = [
        { id: 'event', label: 'Festival / Event', icon: PartyPopper, placeholder: 'Serengeti Safari & Cultural Festival 2026', presetVenue: 'Mlimani City Conference Hall' },
        { id: 'concert', label: 'Concert / Music', icon: Music, placeholder: 'Nandy Live in Concert: Dar Tour', presetVenue: 'Warehouse Arena Dar' },
        { id: 'flight', label: 'Flight / Air Travel', icon: Plane, placeholder: 'Precision Air: DAR to JRO Express Flight', presetVenue: "Julius Nyerere Int'l Airport (JNIA)" },
        { id: 'hotel', label: 'Hotel & Getaway', icon: Hotel, placeholder: 'Serena Zanzibar Weekend Luxury Retreat', presetVenue: 'Zanzibar Serena Hotel' },
        { id: 'nightlife', label: 'Nightlife & Cruise', icon: Sparkles, placeholder: 'All White Sunset Yacht Party', presetVenue: 'Slipway Waterfront Marina' },
        { id: 'sports', label: 'Sports & Marathon', icon: Trophy, placeholder: 'Kilimanjaro Half Marathon 2026', presetVenue: 'Moshi Sports Stadium' },
        { id: 'conference', label: 'Conference / Summit', icon: Users, placeholder: 'Tanzania Tech & Investment Forum', presetVenue: 'JNICC Dar es Salaam' },
    ];

    const curatedCovers = [
        { type: 'concert', label: 'Live Arena', url: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1200&q=80' },
        { type: 'flight', label: 'Air Wing / Plane', url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80' },
        { type: 'hotel', label: 'Serena Resort', url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80' },
        { type: 'nightlife', label: 'Nightlife Vibes', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80' },
        { type: 'sports', label: 'Marathon Runners', url: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1200&q=80' },
        { type: 'conference', label: 'Auditorium Hall', url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80' },
    ];

    const handleOccasionSubmit = (e) => {
        e.preventDefault();
        occasionForm.post(route('ticketing.occasions.store'), {
            forceFormData: true,
            onSuccess: () => {
                setOccasionModalOpen(false);
                occasionForm.reset();
                setCoverUploadPreview(null);
            },
        });
    };

    const handleCopyLink = () => {
        if (navigator.clipboard && publicUrl) {
            navigator.clipboard.writeText(publicUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };

    const handleEventChange = (eventId) => {
        router.get(route('ticketing.index'), { event_id: eventId }, { preserveState: true });
    };

    const handleFilterSubmit = (e) => {
        if (e) e.preventDefault();
        router.get(route('ticketing.index'), {
            event_id: selectedEvent?.id,
            search,
            status: statusFilter,
            tier_id: tierFilter,
        }, { preserveState: true, replace: true });
    };

    const openCreateTier = () => {
        if (!selectedEvent) return;
        setEditingTier(null);
        tierForm.setData({
            name: '',
            description: '',
            price: 0,
            capacity: 100,
            max_per_order: 10,
            status: 'active',
            sales_start_at: '',
            sales_end_at: '',
            color: '#10b981',
        });
        tierForm.clearErrors();
        setTierModalOpen(true);
    };

    const openEditTier = (tier) => {
        setEditingTier(tier);
        tierForm.setData({
            name: tier.name || '',
            description: tier.description || '',
            price: tier.price || 0,
            capacity: tier.capacity || 100,
            max_per_order: tier.max_per_order || 10,
            status: tier.status || 'active',
            sales_start_at: tier.sales_start_at ? String(tier.sales_start_at).slice(0, 16) : '',
            sales_end_at: tier.sales_end_at ? String(tier.sales_end_at).slice(0, 16) : '',
            color: tier.color || '#10b981',
        });
        tierForm.clearErrors();
        setTierModalOpen(true);
    };

    const handleTierSubmit = (e) => {
        e.preventDefault();
        if (!selectedEvent) return;

        if (editingTier) {
            tierForm.put(route('events.ticketTiers.update', [selectedEvent.id, editingTier.id]), {
                preserveScroll: true,
                onSuccess: () => {
                    setTierModalOpen(false);
                    setEditingTier(null);
                },
            });
        } else {
            tierForm.post(route('events.ticketTiers.store', selectedEvent.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setTierModalOpen(false);
                },
            });
        }
    };

    const confirmDeleteTier = (tier) => {
        setDeleteModal({
            show: true,
            tier,
            loading: false,
        });
    };

    const handleDeleteTier = () => {
        if (!deleteModal.tier || !selectedEvent) return;
        setDeleteModal(prev => ({ ...prev, loading: true }));
        router.delete(route('events.ticketTiers.destroy', [selectedEvent.id, deleteModal.tier.id]), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteModal({ show: false, tier: null, loading: false });
            },
            onError: () => {
                setDeleteModal(prev => ({ ...prev, loading: false }));
            }
        });
    };

    const handleSettingsSubmit = (e) => {
        e.preventDefault();
        if (!selectedEvent) return;
        settingsForm.post(route('events.ticketingSettings', selectedEvent.id), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setSettingsModalOpen(false);
            },
        });
    };

    // Open multi-channel dispatch modal
    const openDispatchModal = (channel, ticket) => {
        const defaultRecipient = channel === 'email'
            ? (ticket.attendee_email || '')
            : (ticket.attendee_phone || '');

        setDispatchModal({
            show: true,
            channel,
            ticket,
            recipient: defaultRecipient,
            loading: false,
            successMessage: '',
            errorMessage: '',
        });
    };

    const handleSendDispatch = async (e) => {
        e.preventDefault();
        const { channel, ticket, recipient } = dispatchModal;
        if (!ticket || !recipient) return;

        setDispatchModal(prev => ({ ...prev, loading: true, errorMessage: '', successMessage: '' }));

        const endpoint = channel === 'whatsapp'
            ? route('tickets.sendWhatsApp', ticket.ticket_number)
            : channel === 'sms'
            ? route('tickets.sendSms', ticket.ticket_number)
            : route('tickets.sendEmail', ticket.ticket_number);

        const payload = channel === 'email' ? { email: recipient } : { phone: recipient };

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setDispatchModal(prev => ({
                    ...prev,
                    loading: false,
                    successMessage: data.message || `Ticket sent successfully via ${channel.toUpperCase()}!`,
                }));
                setTimeout(() => {
                    setDispatchModal({ show: false, channel: null, ticket: null, recipient: '', loading: false, successMessage: '', errorMessage: '' });
                }, 2000);
            } else {
                setDispatchModal(prev => ({
                    ...prev,
                    loading: false,
                    errorMessage: data.error || 'Failed to dispatch ticket. Please try again.',
                }));
            }
        } catch (err) {
            setDispatchModal(prev => ({
                ...prev,
                loading: false,
                errorMessage: 'Network error occurred while sending ticket.',
            }));
        }
    };

    const currency = selectedEvent?.ticket_currency || 'TZS';
    const activeOccasionCat = occasionCategories.find(c => c.id === selectedEvent?.occasion_type) || occasionCategories[0];
    const OccasionIcon = activeOccasionCat.icon;

    return (
        <KardovoAppLayout
            title="Ticketing"
            headerActions={
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setOccasionModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 text-xs font-bold text-white bg-[#16A34A] hover:bg-[#15803D] active:bg-[#117534] rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">New Occasion</span>
                        <span className="sm:hidden">New</span>
                    </button>

                    <a
                        href={route('tickets.marketplace')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 text-xs font-semibold text-slate-200 hover:text-white bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] rounded-xl transition active:scale-95"
                        title="View Public Marketplace"
                    >
                        <Globe className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="hidden md:inline">Marketplace</span>
                    </a>
                </div>
            }
        >
            <Head title="Ticketing Portal - Kardovo" />

            <div className="max-w-7xl mx-auto space-y-6 pb-12">
                {/* 1. MINIMAL UNIFIED EVENT HEADER BAR */}
                <div className="bg-white dark:bg-[#0B1524] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-4 sm:p-5 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {/* Left: Custom Occasion Dropdown & Badges */}
                        <div className="space-y-2 min-w-0">
                            <div className="flex items-center gap-2.5 flex-wrap">
                                {events.length > 0 ? (
                                    <div className="relative" ref={eventDropdownRef}>
                                        <button
                                            type="button"
                                            onClick={() => setEventDropdownOpen((prev) => !prev)}
                                            className="inline-flex items-center justify-between gap-2.5 px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200/90 dark:border-white/10 text-slate-900 dark:text-white text-sm sm:text-base font-bold transition cursor-pointer max-w-xs sm:max-w-md shadow-2xs"
                                        >
                                            <span className="truncate">
                                                {selectedEvent?.title || 'Select Occasion'}
                                            </span>
                                            <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${eventDropdownOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        {eventDropdownOpen && (
                                            <div className="absolute left-0 top-full mt-2 w-72 sm:w-80 bg-white dark:bg-[#0B1524] rounded-2xl border border-slate-200 dark:border-white/10 shadow-xl py-1.5 z-50 overflow-hidden">
                                                <div className="px-3.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-white/[0.06]">
                                                    Switch Occasion ({events.length})
                                                </div>
                                                <div className="max-h-60 overflow-y-auto py-1">
                                                    {events.map((ev) => {
                                                        const isSelected = ev.id === selectedEvent?.id;
                                                        return (
                                                            <button
                                                                key={ev.id}
                                                                type="button"
                                                                onClick={() => {
                                                                    setEventDropdownOpen(false);
                                                                    handleEventChange(ev.id);
                                                                }}
                                                                className={`w-full px-3.5 py-2 text-left text-xs flex items-center justify-between gap-2 transition cursor-pointer ${
                                                                    isSelected
                                                                        ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 font-bold'
                                                                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04]'
                                                                }`}
                                                            >
                                                                <div className="min-w-0 flex-1">
                                                                    <div className="truncate font-semibold">{ev.title}</div>
                                                                    {ev.event_date && (
                                                                        <div className="text-[10px] text-slate-400 mt-0.5">
                                                                            {new Date(ev.event_date).toLocaleDateString()}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-1.5 shrink-0">
                                                                    <span className={`w-2 h-2 rounded-full ${ev.ticketing_enabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                                                                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                                <div className="p-1.5 border-t border-slate-100 dark:border-white/[0.06]">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setEventDropdownOpen(false);
                                                            setOccasionModalOpen(true);
                                                        }}
                                                        className="w-full px-3 py-1.5 text-xs font-bold text-[#16A34A] hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-xl transition flex items-center gap-1.5 justify-center cursor-pointer"
                                                    >
                                                        <Plus className="w-3.5 h-3.5" />
                                                        <span>New Occasion</span>
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-display">
                                        Ticketing Portal
                                    </h1>
                                )}

                                {selectedEvent && (
                                    <div className="flex items-center gap-2">
                                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                                            selectedEvent.ticketing_enabled
                                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${selectedEvent.ticketing_enabled ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                                            <span>{selectedEvent.ticketing_enabled ? 'Sales Active' : 'Sales Paused'}</span>
                                        </span>

                                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/[0.05] px-2.5 py-1 rounded-full capitalize">
                                            <OccasionIcon className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                            <span>{selectedEvent.occasion_type || 'Event'}</span>
                                        </span>
                                    </div>
                                )}
                            </div>

                            {selectedEvent && (
                                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap pt-0.5">
                                    {selectedEvent.event_date && (
                                        <span className="inline-flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                            <span>{new Date(selectedEvent.event_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        </span>
                                    )}
                                    {selectedEvent.event_date && selectedEvent.venue && (
                                        <span className="text-slate-300 dark:text-slate-600">•</span>
                                    )}
                                    {selectedEvent.venue && (
                                        <span className="inline-flex items-center gap-1.5">
                                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                            <span>{selectedEvent.venue}{selectedEvent.city ? `, ${selectedEvent.city}` : ''}</span>
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Right: Storefront, Pass Design & Settings buttons */}
                        {selectedEvent && (
                            <div className="flex items-center gap-2 shrink-0">
                                <a
                                    href={route('events.publicTickets', selectedEvent.id)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#16A34A] hover:bg-[#15803D] active:bg-[#117534] shadow-xs transition active:scale-95"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    <span>Storefront</span>
                                </a>

                                <button
                                    type="button"
                                    onClick={openPassDesigner}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition cursor-pointer shadow-xs active:scale-95"
                                    title="Customize Ticket Pass Theme & Layout"
                                >
                                    <Palette className="w-3.5 h-3.5 text-[#16A34A] dark:text-emerald-400" />
                                    <span>Pass Design</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        settingsForm.setData({
                                            ticketing_enabled: Boolean(selectedEvent.ticketing_enabled),
                                            ticket_currency: selectedEvent.ticket_currency || 'TZS',
                                            ticket_instructions: selectedEvent.ticket_instructions || '',
                                            ticket_sales_end_at: selectedEvent.ticket_sales_end_at
                                                ? String(selectedEvent.ticket_sales_end_at).slice(0, 16)
                                                : '',
                                            is_public: selectedEvent.is_public !== false,
                                            occasion_type: selectedEvent.occasion_type || 'event',
                                            cover_photo: selectedEvent.cover_photo || '',
                                            cover_image: null,
                                        });
                                        setSettingsModalOpen(true);
                                    }}
                                    className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] transition cursor-pointer"
                                    title="Occasion Settings"
                                >
                                    <Settings className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. NO OCCASION EMPTY STATE */}
                {!selectedEvent ? (
                    <div className="bg-white dark:bg-[#0B1524] rounded-2xl p-10 sm:p-14 text-center border border-slate-200/80 dark:border-white/[0.08] shadow-xs space-y-4">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-[#16A34A] dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
                            <Ticket className="w-7 h-7" />
                        </div>
                        <div className="space-y-1 max-w-sm mx-auto">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                                No Ticketed Occasion Yet
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                Create your first event, concert, flight, or hotel getaway to start selling tickets and digital passes.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setOccasionModalOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] active:bg-[#117534] text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Create Ticketed Occasion</span>
                        </button>
                    </div>
                ) : (
                    <>
                        {/* 3. CLEAN 4-METRIC GRID (No Duplicate Cards) */}
                        {selectedEventStats && (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                                {/* Metric 1: Revenue */}
                                <div className="bg-white dark:bg-[#0B1524] p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs transition hover:border-emerald-500/30">
                                    <div className="flex items-center justify-between text-slate-400 mb-2">
                                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Gross Revenue</span>
                                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                            <DollarSign className="w-3.5 h-3.5" />
                                        </div>
                                    </div>
                                    <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight">
                                        {currency} {(selectedEventStats.total_revenue || 0).toLocaleString()}
                                    </div>
                                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                                        Completed ticket sales
                                    </p>
                                </div>

                                {/* Metric 2: Tickets Sold */}
                                <div className="bg-white dark:bg-[#0B1524] p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs transition hover:border-emerald-500/30">
                                    <div className="flex items-center justify-between text-slate-400 mb-2">
                                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tickets Issued</span>
                                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-[#16A34A] dark:text-emerald-400 flex items-center justify-center">
                                            <Ticket className="w-3.5 h-3.5" />
                                        </div>
                                    </div>
                                    <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight">
                                        {selectedEventStats.total_sold}
                                        <span className="text-xs font-normal text-slate-400 ml-1">/ {selectedEventStats.total_capacity || '∞'}</span>
                                    </div>
                                    <div className="mt-2 w-full h-1.5 bg-slate-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-emerald-500 rounded-full"
                                            style={{
                                                width: `${selectedEventStats.total_capacity > 0 ? Math.min(100, Math.round((selectedEventStats.total_sold / selectedEventStats.total_capacity) * 100)) : 0}%`
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Metric 3: Gate Checked-In */}
                                <div className="bg-white dark:bg-[#0B1524] p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs transition hover:border-emerald-500/30">
                                    <div className="flex items-center justify-between text-slate-400 mb-2">
                                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Admitted at Gate</span>
                                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                            <QrCode className="w-3.5 h-3.5" />
                                        </div>
                                    </div>
                                    <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight">
                                        {selectedEventStats.total_checked_in}
                                    </div>
                                    <p className="text-[11px] text-slate-400 font-medium mt-1">
                                        {selectedEventStats.total_sold > 0
                                            ? `${Math.round((selectedEventStats.total_checked_in / selectedEventStats.total_sold) * 100)}% attendance rate`
                                            : '0% attendance'}
                                    </p>
                                </div>

                                {/* Metric 4: Total Orders */}
                                <div className="bg-white dark:bg-[#0B1524] p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs transition hover:border-emerald-500/30">
                                    <div className="flex items-center justify-between text-slate-400 mb-2">
                                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Orders Placed</span>
                                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-[#16A34A] dark:text-emerald-400 flex items-center justify-center">
                                            <ShoppingBag className="w-3.5 h-3.5" />
                                        </div>
                                    </div>
                                    <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight">
                                        {selectedEventOrders.length}
                                    </div>
                                    <p className="text-[11px] text-slate-400 font-medium mt-1">
                                        {selectedEventTiers.length} tier{selectedEventTiers.length === 1 ? '' : 's'} active
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* 4. CLEAN SEGMENTED TAB SWITCHER */}
                        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/[0.08] pb-2">
                            <button
                                type="button"
                                onClick={() => setActiveTab('tiers')}
                                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    activeTab === 'tiers'
                                        ? 'bg-[#16A34A] text-white shadow-xs'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20'
                                }`}
                            >
                                <Tag className="w-3.5 h-3.5" />
                                <span>Ticket Tiers & Pricing</span>
                                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                                    activeTab === 'tiers' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-white/[0.08] text-slate-500 dark:text-slate-400'
                                }`}>
                                    {selectedEventTiers.length}
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('tickets')}
                                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    activeTab === 'tickets'
                                        ? 'bg-[#16A34A] text-white shadow-xs'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20'
                                }`}
                            >
                                <Ticket className="w-3.5 h-3.5" />
                                <span>Attendees & Issued Passes</span>
                                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                                    activeTab === 'tickets' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-white/[0.08] text-slate-500 dark:text-slate-400'
                                }`}>
                                    {selectedEventTickets?.total || 0}
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('orders')}
                                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    activeTab === 'orders'
                                        ? 'bg-[#16A34A] text-white shadow-xs'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20'
                                }`}
                            >
                                <ShoppingBag className="w-3.5 h-3.5" />
                                <span>Recent Orders</span>
                                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                                    activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-white/[0.08] text-slate-500 dark:text-slate-400'
                                }`}>
                                    {selectedEventOrders.length}
                                </span>
                            </button>
                        </div>

                        {/* ── TAB 1: TICKET TIERS & PRICING ── */}
                        {activeTab === 'tiers' && (
                            <div className="bg-white dark:bg-[#0B1524] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs overflow-hidden">
                                <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/[0.08] flex items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                                            Ticket Packages & Quotas
                                        </h2>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            Manage your pricing tiers, capacity, and sales status.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={openCreateTier}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#16A34A] hover:bg-[#15803D] active:bg-[#117534] rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Add Tier</span>
                                    </button>
                                </div>

                                {selectedEventTiers.length === 0 ? (
                                    <div className="p-10 text-center space-y-3">
                                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
                                            <Tag className="w-6 h-6" />
                                        </div>
                                        <div className="space-y-1 max-w-sm mx-auto">
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Tiers Configured</h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                Add your first tier (e.g. Regular, VIP, Early Bird) to enable ticket sales.
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={openCreateTier}
                                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#16A34A] hover:bg-[#15803D] rounded-xl transition cursor-pointer"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>Create First Tier</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 sm:p-5">
                                        {selectedEventTiers.map((tier) => {
                                            const percentSold = tier.capacity > 0 ? Math.min(100, Math.round((tier.sold_count / tier.capacity) * 100)) : 0;
                                            const remaining = Math.max(0, tier.capacity - tier.sold_count);

                                            return (
                                                <div
                                                    key={tier.id}
                                                    className="rounded-xl border border-slate-200/80 dark:border-white/[0.08] p-4 bg-slate-50/50 dark:bg-white/[0.02] flex flex-col justify-between gap-3.5 transition hover:border-emerald-500/40"
                                                >
                                                    <div className="space-y-2.5">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex items-center gap-2">
                                                                <span
                                                                    className="w-2.5 h-2.5 rounded-full shrink-0"
                                                                    style={{ backgroundColor: tier.color || '#10b981' }}
                                                                />
                                                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                                                    {tier.name}
                                                                </h4>
                                                            </div>
                                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                                                tier.status === 'active'
                                                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                                    : tier.status === 'sold_out'
                                                                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                                                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                                            }`}>
                                                                {tier.status}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-baseline gap-1">
                                                            <span className="text-lg font-black text-slate-900 dark:text-white font-display">
                                                                {Number(tier.price) === 0 ? 'Free' : `${currency} ${Number(tier.price).toLocaleString()}`}
                                                            </span>
                                                            {Number(tier.price) > 0 && (
                                                                <span className="text-[11px] text-slate-400">/ ticket</span>
                                                            )}
                                                        </div>

                                                        {tier.description && (
                                                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                                                {tier.description}
                                                            </p>
                                                        )}

                                                        <div className="space-y-1 pt-1">
                                                            <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 font-mono">
                                                                <span>{tier.sold_count} sold / {tier.capacity} cap</span>
                                                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{remaining} left</span>
                                                            </div>
                                                            <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                                                                <div
                                                                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                                                                    style={{ width: `${percentSold}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="pt-2.5 border-t border-slate-200/60 dark:border-white/[0.06] flex items-center justify-between text-xs">
                                                        <span className="text-[10px] text-slate-400">
                                                            Max {tier.max_per_order || 10} per order
                                                        </span>
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => openEditTier(tier)}
                                                                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-white/[0.08] transition cursor-pointer"
                                                                title="Edit"
                                                            >
                                                                <Edit className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => confirmDeleteTier(tier)}
                                                                className="p-1 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition cursor-pointer"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── TAB 2: ATTENDEES & ISSUED PASSES ── */}
                        {activeTab === 'tickets' && (
                            <div className="bg-white dark:bg-[#0B1524] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs overflow-hidden">
                                {/* Search & Filters Toolbar */}
                                <div className="p-4 border-b border-slate-100 dark:border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-3">
                                    <form onSubmit={handleFilterSubmit} className="flex flex-wrap items-center gap-2.5 flex-1">
                                        <div className="relative min-w-[220px] flex-1 max-w-sm">
                                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                            <input
                                                type="text"
                                                placeholder="Search attendee, phone, pass #..."
                                                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#08121E] text-slate-900 dark:text-white focus:ring-emerald-500 focus:border-emerald-500"
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                onBlur={handleFilterSubmit}
                                            />
                                        </div>

                                        <select
                                            className="text-xs py-1.5 pl-3 pr-8 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-700 dark:text-slate-300 focus:ring-emerald-500"
                                            value={statusFilter}
                                            onChange={(e) => {
                                                setStatusFilter(e.target.value);
                                                router.get(route('ticketing.index'), {
                                                    event_id: selectedEvent.id,
                                                    search,
                                                    status: e.target.value,
                                                    tier_id: tierFilter,
                                                }, { preserveState: true });
                                            }}
                                        >
                                            <option value="all">All Statuses</option>
                                            <option value="valid">Valid (Unscanned)</option>
                                            <option value="checked_in">Checked In</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>

                                        <select
                                            className="text-xs py-1.5 pl-3 pr-8 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-700 dark:text-slate-300 focus:ring-emerald-500"
                                            value={tierFilter}
                                            onChange={(e) => {
                                                setTierFilter(e.target.value);
                                                router.get(route('ticketing.index'), {
                                                    event_id: selectedEvent.id,
                                                    search,
                                                    status: statusFilter,
                                                    tier_id: e.target.value,
                                                }, { preserveState: true });
                                            }}
                                        >
                                            <option value="all">All Tiers</option>
                                            {selectedEventTiers.map(t => (
                                                <option key={t.id} value={t.id}>{t.name}</option>
                                            ))}
                                        </select>
                                    </form>

                                    <div className="text-xs text-slate-400 font-mono self-end md:self-auto">
                                        Total: <strong className="text-slate-700 dark:text-slate-200">{selectedEventTickets?.total || 0}</strong>
                                    </div>
                                </div>

                                {!selectedEventTickets?.data || selectedEventTickets.data.length === 0 ? (
                                    <div className="p-10 text-center text-xs text-slate-500 dark:text-slate-400">
                                        No tickets found matching your query.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/[0.06] text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                                                <tr>
                                                    <th className="py-3 px-4">Attendee & Pass</th>
                                                    <th className="py-3 px-4">Contact</th>
                                                    <th className="py-3 px-4">Tier & Paid</th>
                                                    <th className="py-3 px-4">Gate Status</th>
                                                    <th className="py-3 px-4 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                                                {selectedEventTickets.data.map((ticket) => (
                                                    <tr key={ticket.id} className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition">
                                                        <td className="py-3 px-4">
                                                            <div className="font-bold text-slate-900 dark:text-white">
                                                                {ticket.attendee_name}
                                                            </div>
                                                            <div className="font-mono text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                                                <span>{ticket.ticket_number}</span>
                                                                <span>•</span>
                                                                <span>Code: {ticket.unique_code}</span>
                                                            </div>
                                                        </td>

                                                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                                                            <div>{ticket.attendee_phone || '—'}</div>
                                                            {ticket.attendee_email && (
                                                                <div className="text-[11px] text-slate-400">{ticket.attendee_email}</div>
                                                            )}
                                                        </td>

                                                        <td className="py-3 px-4">
                                                            <div className="font-semibold text-slate-900 dark:text-white">
                                                                {ticket.ticket_tier?.name || 'General Admission'}
                                                            </div>
                                                            <div className="font-mono text-[11px] text-slate-400">
                                                                {currency} {Number(ticket.price_paid).toLocaleString()}
                                                            </div>
                                                        </td>

                                                        <td className="py-3 px-4">
                                                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                                ticket.status === 'checked_in'
                                                                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                                                    : ticket.status === 'cancelled'
                                                                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                                                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                            }`}>
                                                                {ticket.status === 'checked_in' ? 'Admitted' : ticket.status}
                                                            </span>
                                                            {ticket.checked_in_at && (
                                                                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                                                    {new Date(ticket.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </div>
                                                            )}
                                                        </td>

                                                        <td className="py-3 px-4 text-right">
                                                            <div className="flex items-center justify-end gap-1">
                                                                <a
                                                                    href={route('tickets.publicPass', ticket.ticket_number)}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] transition"
                                                                    title="View Digital Pass"
                                                                >
                                                                    <Printer className="w-3.5 h-3.5" />
                                                                </a>

                                                                <a
                                                                    href={route('tickets.downloadPdf', ticket.ticket_number)}
                                                                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] transition"
                                                                    title="Download PDF"
                                                                >
                                                                    <Download className="w-3.5 h-3.5" />
                                                                </a>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => openDispatchModal('whatsapp', ticket)}
                                                                    className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition cursor-pointer"
                                                                    title="Send WhatsApp"
                                                                >
                                                                    <Phone className="w-3.5 h-3.5" />
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => openDispatchModal('sms', ticket)}
                                                                    className="p-1.5 rounded-lg text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 transition cursor-pointer"
                                                                    title="Send SMS"
                                                                >
                                                                    <MessageSquare className="w-3.5 h-3.5" />
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => openDispatchModal('email', ticket)}
                                                                    className="p-1.5 rounded-lg text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition cursor-pointer"
                                                                    title="Send Email"
                                                                >
                                                                    <Mail className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {selectedEventTickets?.links && (
                                    <div className="p-3 border-t border-slate-100 dark:border-white/[0.06]">
                                        <Pagination
                                            links={selectedEventTickets.links}
                                            from={selectedEventTickets.from}
                                            to={selectedEventTickets.to}
                                            total={selectedEventTickets.total}
                                            itemName="passes"
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── TAB 3: RECENT ORDERS ── */}
                        {activeTab === 'orders' && (
                            <div className="bg-white dark:bg-[#0B1524] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs overflow-hidden">
                                <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/[0.08]">
                                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                                        Recent Orders & Payments
                                    </h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        Completed ticket sales processed via AzamPay.
                                    </p>
                                </div>

                                {selectedEventOrders.length === 0 ? (
                                    <div className="p-10 text-center text-slate-500 dark:text-slate-400 text-xs">
                                        No orders placed yet for this event.
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                                        {selectedEventOrders.map((order) => {
                                            const isExpanded = expandedOrderId === order.id;
                                            const ticketCount = order.tickets ? order.tickets.length : 0;

                                            return (
                                                <div key={order.id} className="p-4 transition hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                                                <ShoppingBag className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                                                                        {order.order_number}
                                                                    </span>
                                                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                                                        {order.payment_status}
                                                                    </span>
                                                                </div>
                                                                <div className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                                                                    {order.buyer_name} • {order.buyer_phone}
                                                                </div>
                                                                <div className="text-[11px] text-slate-400">
                                                                    {new Date(order.created_at).toLocaleString()}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-3 self-end sm:self-center">
                                                            <div className="text-right">
                                                                <div className="text-sm font-black text-slate-900 dark:text-white font-display">
                                                                    {currency} {Number(order.total_amount).toLocaleString()}
                                                                </div>
                                                                <div className="text-[11px] text-slate-400">
                                                                    {ticketCount} {ticketCount === 1 ? 'pass' : 'passes'}
                                                                </div>
                                                            </div>

                                                            <button
                                                                type="button"
                                                                onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                                                                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
                                                            >
                                                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Expanded tickets list */}
                                                    {isExpanded && order.tickets && order.tickets.length > 0 && (
                                                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/[0.06] space-y-2">
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                {order.tickets.map((t) => (
                                                                    <div
                                                                        key={t.id}
                                                                        className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#08121E] border border-slate-200/60 dark:border-white/[0.06] flex items-center justify-between text-xs"
                                                                    >
                                                                        <div>
                                                                            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                                                                                <span>{t.attendee_name || order.buyer_name}</span>
                                                                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded font-mono">
                                                                                    {t.ticket_tier?.name || 'Ticket'}
                                                                                </span>
                                                                            </div>
                                                                            <div className="font-mono text-[11px] text-slate-400">
                                                                                {t.ticket_number}
                                                                            </div>
                                                                        </div>

                                                                        <a
                                                                            href={route('tickets.publicPass', t.ticket_number)}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="p-1 rounded text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition"
                                                                            title="View Pass"
                                                                        >
                                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                                        </a>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* ── MODALS ── */}

            {/* Modal: Add / Edit Tier */}
            <Modal show={tierModalOpen} onClose={() => setTierModalOpen(false)} maxWidth="md">
                <form onSubmit={handleTierSubmit} className="p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] pb-3">
                        <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                {editingTier ? 'Edit Ticket Tier' : 'Create Ticket Tier'}
                            </h3>
                        </div>
                        <button
                            type="button"
                            onClick={() => setTierModalOpen(false)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm cursor-pointer"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <InputLabel htmlFor="tier_name" value="Tier Name *" className="text-xs font-bold" />
                            <TextInput
                                id="tier_name"
                                type="text"
                                className="w-full text-xs mt-1"
                                placeholder="e.g. VIP, Early Bird, Regular"
                                value={tierForm.data.name}
                                onChange={(e) => tierForm.setData('name', e.target.value)}
                                required
                            />
                            <InputError message={tierForm.errors.name} className="mt-1" />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <InputLabel htmlFor="tier_price" value={`Price (${currency}) *`} className="text-xs font-bold" />
                                <TextInput
                                    id="tier_price"
                                    type="number"
                                    min="0"
                                    step="100"
                                    className="w-full text-xs mt-1 font-mono"
                                    placeholder="0 for free"
                                    value={tierForm.data.price}
                                    onChange={(e) => tierForm.setData('price', e.target.value)}
                                    required
                                />
                                <InputError message={tierForm.errors.price} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="tier_capacity" value="Capacity (Seats) *" className="text-xs font-bold" />
                                <TextInput
                                    id="tier_capacity"
                                    type="number"
                                    min="1"
                                    className="w-full text-xs mt-1 font-mono"
                                    value={tierForm.data.capacity}
                                    onChange={(e) => tierForm.setData('capacity', e.target.value)}
                                    required
                                />
                                <InputError message={tierForm.errors.capacity} className="mt-1" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <InputLabel htmlFor="max_per_order" value="Max per Order" className="text-xs font-bold" />
                                <TextInput
                                    id="max_per_order"
                                    type="number"
                                    min="1"
                                    max="50"
                                    className="w-full text-xs mt-1 font-mono"
                                    value={tierForm.data.max_per_order}
                                    onChange={(e) => tierForm.setData('max_per_order', e.target.value)}
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="tier_status" value="Sales Status" className="text-xs font-bold" />
                                <select
                                    id="tier_status"
                                    className="w-full text-xs mt-1 rounded-xl border-slate-300 dark:border-white/10 dark:bg-[#08121E] dark:text-white"
                                    value={tierForm.data.status}
                                    onChange={(e) => tierForm.setData('status', e.target.value)}
                                >
                                    <option value="active">Active (On Sale)</option>
                                    <option value="paused">Paused</option>
                                    <option value="sold_out">Sold Out</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="tier_desc" value="Perks & Description" className="text-xs font-bold" />
                            <textarea
                                id="tier_desc"
                                rows={2}
                                className="w-full text-xs mt-1 rounded-xl border-slate-300 dark:border-white/10 dark:bg-[#08121E] dark:text-white"
                                placeholder="e.g. Front row seating, complimentary welcome drink, VIP gate access."
                                value={tierForm.data.description}
                                onChange={(e) => tierForm.setData('description', e.target.value)}
                            />
                        </div>

                        <div>
                            <InputLabel value="Accent Color" className="text-xs font-bold" />
                            <div className="flex items-center gap-2 mt-1.5">
                                {['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'].map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => tierForm.setData('color', c)}
                                        className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                                            tierForm.data.color === c ? 'scale-125 ring-2 ring-offset-2 ring-slate-400' : 'hover:scale-110'
                                        }`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
                        <SecondaryButton
                            type="button"
                            onClick={() => setTierModalOpen(false)}
                            className="text-xs"
                        >
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton
                            type="submit"
                            disabled={tierForm.processing}
                            className="text-xs bg-[#16A34A] hover:bg-[#15803D]"
                        >
                            {tierForm.processing ? 'Saving...' : editingTier ? 'Save Changes' : 'Create Tier'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal: Storefront Settings */}
            <Modal show={settingsModalOpen} onClose={() => setSettingsModalOpen(false)} maxWidth="md">
                <form onSubmit={handleSettingsSubmit} className="p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] pb-3">
                        <div className="flex items-center gap-2">
                            <Settings className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                Occasion Settings
                            </h3>
                        </div>
                        <button
                            type="button"
                            onClick={() => setSettingsModalOpen(false)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm cursor-pointer"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="space-y-3.5 max-h-[72vh] overflow-y-auto pr-1">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.08]">
                            <div>
                                <div className="text-xs font-bold text-slate-900 dark:text-white">
                                    Enable Ticket Storefront
                                </div>
                                <div className="text-[11px] text-slate-400">
                                    Allow attendees to buy tickets online
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={settingsForm.data.ticketing_enabled}
                                    onChange={(e) => settingsForm.setData('ticketing_enabled', e.target.checked)}
                                />
                                <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#16A34A]"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.08]">
                            <div>
                                <div className="text-xs font-bold text-slate-900 dark:text-white">
                                    Public Marketplace Discovery
                                </div>
                                <div className="text-[11px] text-slate-400">
                                    List on Kardovo public tickets directory
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={settingsForm.data.is_public}
                                    onChange={(e) => settingsForm.setData('is_public', e.target.checked)}
                                />
                                <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#16A34A]"></div>
                            </label>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <InputLabel htmlFor="setting_occasion_type" value="Category" className="text-xs font-bold" />
                                <select
                                    id="setting_occasion_type"
                                    className="w-full text-xs mt-1 rounded-xl border-slate-300 dark:border-white/10 dark:bg-[#08121E] dark:text-white"
                                    value={settingsForm.data.occasion_type}
                                    onChange={(e) => settingsForm.setData('occasion_type', e.target.value)}
                                >
                                    <option value="event">Festival / Event</option>
                                    <option value="concert">Concert / Music</option>
                                    <option value="flight">Flight / Travel</option>
                                    <option value="hotel">Hotel & Getaway</option>
                                    <option value="nightlife">Nightlife & Cruise</option>
                                    <option value="sports">Sports & Match</option>
                                    <option value="conference">Conference / Summit</option>
                                </select>
                            </div>

                            <div>
                                <InputLabel htmlFor="setting_currency" value="Currency" className="text-xs font-bold" />
                                <select
                                    id="setting_currency"
                                    className="w-full text-xs mt-1 rounded-xl border-slate-300 dark:border-white/10 dark:bg-[#08121E] dark:text-white font-mono"
                                    value={settingsForm.data.ticket_currency}
                                    onChange={(e) => settingsForm.setData('ticket_currency', e.target.value)}
                                >
                                    <option value="TZS">TZS (Tanzanian Shilling)</option>
                                    <option value="USD">USD (US Dollar)</option>
                                    <option value="KES">KES (Kenyan Shilling)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="setting_deadline" value="Sales Close Deadline" className="text-xs font-bold" />
                            <TextInput
                                id="setting_deadline"
                                type="datetime-local"
                                className="w-full text-xs mt-1"
                                value={settingsForm.data.ticket_sales_end_at}
                                onChange={(e) => settingsForm.setData('ticket_sales_end_at', e.target.value)}
                            />
                        </div>

                        <div>
                            <InputLabel htmlFor="setting_instructions" value="Buyer Note / Instructions" className="text-xs font-bold" />
                            <textarea
                                id="setting_instructions"
                                rows={2}
                                className="w-full text-xs mt-1 rounded-xl border-slate-300 dark:border-white/10 dark:bg-[#08121E] dark:text-white"
                                placeholder="e.g. Please arrive with valid national ID. Gates open 1 hour before showtime."
                                value={settingsForm.data.ticket_instructions}
                                onChange={(e) => settingsForm.setData('ticket_instructions', e.target.value)}
                            />
                        </div>

                        {/* Ticket Pass Customizer Shortcut Tile */}
                        <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/70 dark:bg-white/[0.02] hover:border-emerald-500/40 transition-all">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-[#16A34A] dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                                    <Palette className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                                        Ticket Pass Customizer
                                    </div>
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                        Customize pass colors, flyer artwork, and entry QR stub
                                    </div>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setSettingsModalOpen(false);
                                    openPassDesigner();
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#16A34A] dark:text-emerald-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 hover:border-emerald-500/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 shadow-2xs transition active:scale-95 cursor-pointer shrink-0"
                            >
                                <span>Customize</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
                        <SecondaryButton
                            type="button"
                            onClick={() => setSettingsModalOpen(false)}
                            className="text-xs"
                        >
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton
                            type="submit"
                            disabled={settingsForm.processing}
                            className="text-xs bg-[#16A34A] hover:bg-[#15803D]"
                        >
                            {settingsForm.processing ? 'Saving...' : 'Save Settings'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal: Ticket Pass Design & Theming Customizer */}
            <Modal show={passDesignerOpen} onClose={() => setPassDesignerOpen(false)} maxWidth="5xl">
                <form onSubmit={handlePassDesignSubmit} className="flex flex-col max-h-[92vh]">

                    {/* Kardovo Studio Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/[0.08] shrink-0 bg-white dark:bg-[#0B1524]">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-[#16A34A] dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                                <Palette className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                                    Ticket Pass Customizer
                                </h3>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                    Personalize the authentic gate pass for attendee downloads and mobile display
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setPassDesignerOpen(false)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Studio Body: Left Preview Stage + Right Kardovo Inspector */}
                    <div className="flex flex-col lg:flex-row flex-1 overflow-y-auto lg:overflow-hidden">

                        {/* LEFT: Ticket Pass Preview Stage (Kardovo Theme Canvas, No Black Background, No extra text) */}
                        <div className="w-full lg:w-[54%] p-6 sm:p-8 bg-slate-100/90 dark:bg-[#070E1A] flex items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-200/80 dark:border-white/[0.08] relative overflow-hidden shrink-0">
                            {/* Subtle Ambient Radial Glow */}
                            <div
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-15 pointer-events-none transition-colors duration-500"
                                style={{ backgroundColor: passDesignForm.data.accent_color || '#16A34A' }}
                            />

                            {/* The Ticket Pass Card */}
                            <div className="w-full max-w-md relative z-10">
                                <div
                                    className="relative rounded-2xl flex flex-row items-stretch overflow-hidden border border-slate-300/80 dark:border-white/15 shadow-xl transition-all duration-300 select-none"
                                    style={{ backgroundColor: passDesignForm.data.left_bg_color || '#241645' }}
                                >
                                    {/* Left: Main Pass Body */}
                                    <div
                                        className="flex-1 p-4 sm:p-5 relative overflow-hidden flex flex-col justify-between"
                                        style={{ backgroundColor: passDesignForm.data.left_bg_color || '#241645' }}
                                    >
                                        {/* Artwork Flyer Layer */}
                                        {passDesignForm.data.left_design_mode === 'custom' && customDesignPreview && (
                                            <div
                                                className="absolute inset-0 bg-cover bg-center opacity-35 pointer-events-none"
                                                style={{ backgroundImage: `url(${customDesignPreview})` }}
                                            />
                                        )}
                                        {customDesignPreview && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/50 to-transparent pointer-events-none" />
                                        )}

                                        {/* Confetti Geometric Accents */}
                                        {passDesignForm.data.show_confetti && (
                                            <>
                                                <div className="w-7 h-7 rounded-br-2xl bg-[#DF1C47] absolute top-0 left-0 pointer-events-none opacity-95" />
                                                <div className="w-5 h-5 rounded-full bg-[#FABF24] absolute -top-1 right-4 pointer-events-none" />
                                                <div className="w-3.5 h-3.5 rounded-full bg-[#DF1C47] absolute top-[55%] right-7 pointer-events-none opacity-90" />
                                                <div className="w-6 h-6 rounded-full bg-[#12B780] absolute -bottom-2 right-2 pointer-events-none" />
                                            </>
                                        )}

                                        <div className="relative z-10 space-y-2">
                                            {/* Occasion & Valid Badge */}
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-[9px] font-bold uppercase tracking-widest font-mono text-white/70">
                                                    KARDOVO • {selectedEvent?.occasion_type || 'SPORTS'}
                                                </span>
                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8.5px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                                    <CheckCircle2 className="w-2.5 h-2.5" /> VALID PASS
                                                </span>
                                            </div>

                                            {/* Event Title */}
                                            <h4 className="text-sm sm:text-base font-black tracking-tight text-white uppercase leading-snug font-display line-clamp-2">
                                                {selectedEvent?.title || 'Kilimanjaro Premium Lager Marathon 2026'}
                                            </h4>

                                            {/* Tier Badge */}
                                            <div className="inline-flex items-center gap-1.5 bg-[#2F234E]/80 backdrop-blur-xs p-0.5 rounded-lg w-fit">
                                                <span
                                                    className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider text-slate-950"
                                                    style={{ backgroundColor: passDesignForm.data.accent_color || '#FABF24' }}
                                                >
                                                    {passDesignForm.data.badge_text || 'TIER'}
                                                </span>
                                                <span className="text-[10px] font-bold text-white pr-2">
                                                    {selectedEventTiers?.[0]?.name || '21km Half Marathon Entry'}
                                                </span>
                                            </div>

                                            {/* Date & Venue */}
                                            <div className="space-y-0.5 text-[9.5px] font-mono font-bold pt-0.5">
                                                <div className="flex items-center gap-1.5" style={{ color: passDesignForm.data.accent_color || '#FABF24' }}>
                                                    <Calendar className="w-3 h-3 shrink-0" />
                                                    <span>{formatTicketDate(selectedEvent?.event_date)}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-slate-300 font-sans font-medium">
                                                    <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                                                    <span className="truncate">AT {selectedEvent?.venue || 'Moshi Stadium'}{selectedEvent?.city ? `, ${selectedEvent.city}` : ''}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Bottom 4-column attendee row */}
                                        <div className="relative z-10 pt-2.5 mt-2.5 border-t border-white/10 grid grid-cols-4 gap-1 text-[8.5px] font-mono">
                                            <div>
                                                <span className="text-[7px] uppercase text-[#A285C6] font-semibold block">PASS HOLDER</span>
                                                <span className="font-bold text-white truncate block">Alfred M.</span>
                                            </div>
                                            <div>
                                                <span className="text-[7px] uppercase text-[#A285C6] font-semibold block">PRICE</span>
                                                <span className="font-bold text-[#34C392] block">
                                                    {selectedEventTiers?.[0]?.price ? Number(selectedEventTiers[0].price).toLocaleString() + ' ' + (selectedEvent?.ticket_currency || 'TZS') : '35,000 TZS'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-[7px] uppercase text-[#A285C6] font-semibold block">GATE / ENTRY</span>
                                                <span className="font-medium text-white truncate block">Main Gate</span>
                                            </div>
                                            <div>
                                                <span className="text-[7px] uppercase text-[#A285C6] font-semibold block">TICKET CODE</span>
                                                <span className="font-bold block truncate" style={{ color: passDesignForm.data.accent_color || '#FABF24' }}>#TK-176050</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Perforated Tear Divider */}
                                    <div className="relative flex flex-col items-center justify-between shrink-0 select-none bg-slate-900/30">
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-slate-100 dark:bg-[#070E1A] border border-slate-300/80 dark:border-white/15 z-30" />
                                        <div className="w-[1.5px] h-full border-r border-dashed border-white/30 mx-1" />
                                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-slate-100 dark:bg-[#070E1A] border border-slate-300/80 dark:border-white/15 z-30" />
                                    </div>

                                    {/* Right: QR Code Stub */}
                                    <div
                                        className="w-32 sm:w-36 p-3 flex flex-col justify-between items-center text-center relative overflow-hidden shrink-0"
                                        style={{ backgroundColor: passDesignForm.data.right_bg_color || '#FFFFFF' }}
                                    >


                                        <div className="w-full relative z-10 pt-0.5">
                                            <span className="text-[7.5px] font-bold uppercase tracking-widest text-slate-400 block font-mono">
                                                SCAN AT GATE
                                            </span>
                                        </div>

                                        <div className="my-auto py-1 relative z-10 flex flex-col items-center">
                                            <div className="p-1 rounded-lg inline-block">
                                                <QrCode className="w-16 h-16 text-[#242C3D]" />
                                            </div>
                                            <div className="mt-0.5 text-xs font-mono font-black tracking-widest text-[#242C3D]">
                                                56648880
                                            </div>
                                        </div>

                                        <div className="w-full relative z-10 pb-0.5">
                                            <span className="text-[7.5px] font-mono text-slate-400 block">
                                                Pass #TK-176050
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Kardovo Inspector with Tabs */}
                        <div className="w-full lg:w-[46%] flex flex-col justify-between bg-white dark:bg-[#0B1524] overflow-hidden">

                            {/* Inspector Segmented Tabs */}
                            <div className="p-4 border-b border-slate-100 dark:border-white/[0.08] shrink-0">
                                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.06]">
                                    <button
                                        type="button"
                                        onClick={() => setDesignerTab('card')}
                                        className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
                                            designerTab === 'card'
                                                ? 'bg-white dark:bg-slate-800 text-[#16A34A] dark:text-emerald-400 shadow-xs ring-1 ring-black/5 dark:ring-white/10'
                                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                                        }`}
                                    >
                                        <Layers className="w-3.5 h-3.5" />
                                        <span>Left Pass</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setDesignerTab('stub')}
                                        className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
                                            designerTab === 'stub'
                                                ? 'bg-white dark:bg-slate-800 text-[#16A34A] dark:text-emerald-400 shadow-xs ring-1 ring-black/5 dark:ring-white/10'
                                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                                        }`}
                                    >
                                        <QrCode className="w-3.5 h-3.5" />
                                        <span>QR Stub</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setDesignerTab('details')}
                                        className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
                                            designerTab === 'details'
                                                ? 'bg-white dark:bg-slate-800 text-[#16A34A] dark:text-emerald-400 shadow-xs ring-1 ring-black/5 dark:ring-white/10'
                                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                                        }`}
                                    >
                                        <Sparkles className="w-3.5 h-3.5" />
                                        <span>Details</span>
                                    </button>
                                </div>
                            </div>

                            {/* Inspector Tab Content */}
                            <div className="p-5 space-y-5 overflow-y-auto flex-1">

                                {/* TAB 1: LEFT PASS CARD */}
                                {designerTab === 'card' && (
                                    <div className="space-y-5 animate-in fade-in duration-200">
                                        {/* Artwork Mode */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                                                Artwork Style
                                            </label>
                                            <div className="grid grid-cols-2 gap-2.5">
                                                <button
                                                    type="button"
                                                    onClick={() => passDesignForm.setData('left_design_mode', 'default')}
                                                    className={`p-3 rounded-xl border text-left cursor-pointer transition flex flex-col justify-between ${
                                                        passDesignForm.data.left_design_mode === 'default'
                                                            ? 'border-[#16A34A] bg-emerald-500/5 dark:bg-emerald-500/10 ring-1 ring-[#16A34A] text-emerald-800 dark:text-emerald-300 font-bold'
                                                            : 'border-slate-200 dark:border-white/10 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                                                    }`}
                                                >
                                                    <span className="text-xs font-bold">Default Pass</span>
                                                    <span className="text-[10px] text-slate-400 font-normal mt-0.5">
                                                        Styled event details & typography
                                                    </span>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => passDesignForm.setData('left_design_mode', 'custom')}
                                                    className={`p-3 rounded-xl border text-left cursor-pointer transition flex flex-col justify-between ${
                                                        passDesignForm.data.left_design_mode === 'custom'
                                                            ? 'border-[#16A34A] bg-emerald-500/5 dark:bg-emerald-500/10 ring-1 ring-[#16A34A] text-emerald-800 dark:text-emerald-300 font-bold'
                                                            : 'border-slate-200 dark:border-white/10 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                                                    }`}
                                                >
                                                    <span className="text-xs font-bold flex items-center gap-1.5">
                                                        <Upload className="w-3.5 h-3.5 text-[#16A34A]" />
                                                        Import Flyer
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-normal mt-0.5">
                                                        Upload custom poster/flyer
                                                    </span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Upload area if custom */}
                                        {passDesignForm.data.left_design_mode === 'custom' && (
                                            <div className="p-3.5 rounded-xl border border-dashed border-emerald-300 dark:border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-2">
                                                {customDesignPreview ? (
                                                    <div className="relative h-20 rounded-lg overflow-hidden border border-slate-200 dark:border-white/10">
                                                        <img src={customDesignPreview} alt="Flyer" className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-between px-3">
                                                            <label className="text-[11px] font-bold text-white hover:underline cursor-pointer">
                                                                Replace Image
                                                                <input type="file" accept="image/*" onChange={handleCustomDesignFile} className="hidden" />
                                                            </label>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    passDesignForm.setData({ ...passDesignForm.data, custom_design_file: null, left_bg_image: '' });
                                                                    setCustomDesignPreview(null);
                                                                }}
                                                                className="text-[11px] font-bold text-rose-300 hover:text-rose-100 cursor-pointer"
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <label className="flex flex-col items-center justify-center py-4 rounded-lg border border-dashed border-emerald-300 dark:border-emerald-500/30 hover:border-[#16A34A] cursor-pointer transition bg-white dark:bg-slate-900/40">
                                                        <Upload className="w-5 h-5 text-[#16A34A] mb-1" />
                                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                                            Click to Upload Pass Flyer
                                                        </span>
                                                        <span className="text-[10px] text-slate-400">
                                                            PNG, JPG, WebP up to 10MB
                                                        </span>
                                                        <input type="file" accept="image/*" onChange={handleCustomDesignFile} className="hidden" />
                                                    </label>
                                                )}
                                            </div>
                                        )}

                                        {/* Colorful Pass Background Color Presets */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                                    Pass Background Color
                                                </label>
                                                <span className="text-[11px] font-mono text-slate-400 uppercase">
                                                    {passDesignForm.data.left_bg_color || '#241645'}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2.5">
                                                {[
                                                    { color: '#241645', label: 'Imperial Purple' },
                                                    { color: '#065F46', label: 'Kardovo Emerald' },
                                                    { color: '#1E3A8A', label: 'Sapphire Blue' },
                                                    { color: '#991B1B', label: 'Crimson Wine' },
                                                    { color: '#D97706', label: 'Sunset Amber' },
                                                    { color: '#701A75', label: 'Berry Magenta' },
                                                    { color: '#0D9488', label: 'Teal Ocean' },
                                                    { color: '#0F172A', label: 'Obsidian Slate' },
                                                ].map(({ color, label }) => (
                                                    <button
                                                        key={color}
                                                        type="button"
                                                        title={label}
                                                        onClick={() => passDesignForm.setData('left_bg_color', color)}
                                                        className={`w-7 h-7 rounded-full border border-white/20 cursor-pointer transition transform ${
                                                            (passDesignForm.data.left_bg_color || '#241645').toLowerCase() === color.toLowerCase()
                                                                ? 'ring-2 ring-[#16A34A] scale-110 shadow-xs'
                                                                : 'hover:scale-105'
                                                        }`}
                                                        style={{ backgroundColor: color }}
                                                    />
                                                ))}
                                                <label title="Custom Color" className="relative flex items-center justify-center w-7 h-7 rounded-full border border-slate-300 dark:border-white/20 cursor-pointer hover:border-[#16A34A] transition bg-white dark:bg-slate-800">
                                                    <Palette className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                                                    <input
                                                        type="color"
                                                        value={passDesignForm.data.left_bg_color || '#241645'}
                                                        onChange={(e) => passDesignForm.setData('left_bg_color', e.target.value)}
                                                        className="sr-only"
                                                    />
                                                </label>
                                            </div>
                                        </div>

                                        {/* Geometric Confetti Accents */}
                                        <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02]">
                                            <div>
                                                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                                    Geometric Confetti Accents
                                                </p>
                                                <p className="text-[10px] text-slate-400">
                                                    Playful corner shapes & colorful aesthetic dots
                                                </p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={passDesignForm.data.show_confetti}
                                                    onChange={(e) => passDesignForm.setData('show_confetti', e.target.checked)}
                                                />
                                                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#16A34A]" />
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 2: RIGHT QR STUB */}
                                {designerTab === 'stub' && (
                                    <div className="space-y-5 animate-in fade-in duration-200">
                                        {/* Colorful QR Stub Background Presets */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                                    QR Stub Background Color
                                                </label>
                                                <span className="text-[11px] font-mono text-slate-400 uppercase">
                                                    {passDesignForm.data.right_bg_color || '#FFFFFF'}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                                Choose a clean background tone for the attendee entry QR code tear-off stub.
                                            </p>
                                            <div className="flex flex-wrap items-center gap-2.5 pt-1">
                                                {[
                                                    { color: '#FFFFFF', label: 'Clean White' },
                                                    { color: '#FFFBEB', label: 'Warm Champagne' },
                                                    { color: '#ECFDF5', label: 'Soft Mint Green' },
                                                    { color: '#EFF6FF', label: 'Ice Sky Blue' },
                                                    { color: '#FAF5FF', label: 'Lilac Lavender' },
                                                    { color: '#FFF1F2', label: 'Soft Blush Rose' },
                                                    { color: '#0F172A', label: 'Midnight Slate' },
                                                    { color: '#241645', label: 'Royal Purple' },
                                                ].map(({ color, label }) => (
                                                    <button
                                                        key={color}
                                                        type="button"
                                                        title={label}
                                                        onClick={() => passDesignForm.setData('right_bg_color', color)}
                                                        className={`w-8 h-8 rounded-full border border-slate-300/80 dark:border-white/20 cursor-pointer transition transform ${
                                                            (passDesignForm.data.right_bg_color || '#FFFFFF').toLowerCase() === color.toLowerCase()
                                                                ? 'ring-2 ring-[#16A34A] scale-110 shadow-xs'
                                                                : 'hover:scale-105'
                                                        }`}
                                                        style={{ backgroundColor: color }}
                                                    />
                                                ))}
                                                <label title="Custom Color" className="relative flex items-center justify-center w-8 h-8 rounded-full border border-slate-300 dark:border-white/20 cursor-pointer hover:border-[#16A34A] transition bg-white dark:bg-slate-800">
                                                    <Palette className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                                    <input
                                                        type="color"
                                                        value={passDesignForm.data.right_bg_color || '#FFFFFF'}
                                                        onChange={(e) => passDesignForm.setData('right_bg_color', e.target.value)}
                                                        className="sr-only"
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 3: DETAILS & ACCENTS */}
                                {designerTab === 'details' && (
                                    <div className="space-y-5 animate-in fade-in duration-200">
                                        {/* Accent Color */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                                    Accent & Highlight Color
                                                </label>
                                                <span className="text-[11px] font-mono text-slate-400 uppercase">
                                                    {passDesignForm.data.accent_color || '#FABF24'}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2.5">
                                                {[
                                                    { color: '#FABF24', label: 'Marathon Gold' },
                                                    { color: '#10B981', label: 'Kardovo Emerald' },
                                                    { color: '#F59E0B', label: 'Warm Amber' },
                                                    { color: '#EF4444', label: 'Ruby Red' },
                                                    { color: '#38BDF8', label: 'Sky Blue' },
                                                    { color: '#8B5CF6', label: 'Violet Glow' },
                                                ].map(({ color, label }) => (
                                                    <button
                                                        key={color}
                                                        type="button"
                                                        title={label}
                                                        onClick={() => passDesignForm.setData('accent_color', color)}
                                                        className={`w-7 h-7 rounded-full border border-white/20 cursor-pointer transition transform ${
                                                            (passDesignForm.data.accent_color || '#FABF24').toLowerCase() === color.toLowerCase()
                                                                ? 'ring-2 ring-[#16A34A] scale-110 shadow-xs'
                                                                : 'hover:scale-105'
                                                        }`}
                                                        style={{ backgroundColor: color }}
                                                    />
                                                ))}
                                                <label title="Custom Color" className="relative flex items-center justify-center w-7 h-7 rounded-full border border-slate-300 dark:border-white/20 cursor-pointer hover:border-[#16A34A] transition bg-white dark:bg-slate-800">
                                                    <Palette className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                                                    <input
                                                        type="color"
                                                        value={passDesignForm.data.accent_color || '#FABF24'}
                                                        onChange={(e) => passDesignForm.setData('accent_color', e.target.value)}
                                                        className="sr-only"
                                                    />
                                                </label>
                                            </div>
                                        </div>

                                        {/* Tier Badge Text */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                                                Tier Badge Label (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                value={passDesignForm.data.badge_text}
                                                onChange={(e) => passDesignForm.setData('badge_text', e.target.value)}
                                                className="w-full text-xs uppercase rounded-xl border border-slate-300 dark:border-white/10 dark:bg-[#070D18] dark:text-white px-3 py-2.5 focus:border-[#16A34A] focus:ring-[#16A34A]"
                                                placeholder="e.g. TIER, VIP PASS, ADMIT ONE"
                                            />
                                        </div>

                                        {/* Gate Instructions */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                                                Gate Instructions / Notes (Optional)
                                            </label>
                                            <textarea
                                                rows={2}
                                                value={passDesignForm.data.custom_instructions}
                                                onChange={(e) => passDesignForm.setData('custom_instructions', e.target.value)}
                                                className="w-full text-xs rounded-xl border border-slate-300 dark:border-white/10 dark:bg-[#070D18] dark:text-white px-3 py-2 focus:border-[#16A34A] focus:ring-[#16A34A]"
                                                placeholder="e.g. Please present valid ID at Gate 3. Doors open at 6:00 AM."
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Inspector Footer with Kardovo Brand Styling */}
                            <div className="p-4 border-t border-slate-100 dark:border-white/[0.08] flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-white/[0.02]">
                                <SecondaryButton
                                    type="button"
                                    onClick={() => setPassDesignerOpen(false)}
                                    className="text-xs"
                                >
                                    Cancel
                                </SecondaryButton>
                                <PrimaryButton
                                    type="submit"
                                    disabled={passDesignForm.processing}
                                    className="text-xs bg-[#16A34A] hover:bg-[#15803D] active:bg-[#117534] shadow-xs"
                                >
                                    {passDesignForm.processing ? 'Saving...' : 'Save Pass Design'}
                                </PrimaryButton>
                            </div>
                        </div>
                    </div>
                </form>
            </Modal>

            {/* Modal: Create Ticketed Occasion */}
            <Modal show={occasionModalOpen} onClose={() => setOccasionModalOpen(false)} maxWidth="2xl">
                <form onSubmit={handleOccasionSubmit} className="p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] pb-3">
                        <div className="flex items-center gap-2">
                            <Ticket className="w-4 h-4 text-[#16A34A]" />
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                Create Ticketed Occasion
                            </h3>
                        </div>
                        <button
                            type="button"
                            onClick={() => setOccasionModalOpen(false)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm cursor-pointer"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="space-y-3.5 max-h-[72vh] overflow-y-auto pr-1">
                        {/* 1. Occasion Category Grid */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                                1. Select Occasion Category *
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {occasionCategories.map((cat) => {
                                    const IconComp = cat.icon;
                                    const isSelected = occasionForm.data.occasion_type === cat.id;
                                    return (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => {
                                                occasionForm.setData({
                                                    ...occasionForm.data,
                                                    occasion_type: cat.id,
                                                    venue: occasionForm.data.venue || cat.presetVenue,
                                                });
                                            }}
                                            className={`p-2 rounded-xl border text-left transition-all flex items-center gap-2 cursor-pointer ${
                                                isSelected
                                                    ? 'bg-[#16A34A] text-white border-[#16A34A] shadow-xs'
                                                    : 'bg-slate-50 dark:bg-white/[0.03] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-emerald-400'
                                            }`}
                                        >
                                            <IconComp className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-[#16A34A]'}`} />
                                            <span className="text-xs font-bold truncate">{cat.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 2. Title */}
                        <div>
                            <InputLabel htmlFor="occasion_title" value="Occasion Title *" className="text-xs font-bold" />
                            <TextInput
                                id="occasion_title"
                                type="text"
                                className="w-full text-xs mt-1"
                                placeholder={
                                    occasionCategories.find(c => c.id === occasionForm.data.occasion_type)?.placeholder ||
                                    'e.g. Serengeti Safari & Cultural Festival 2026'
                                }
                                value={occasionForm.data.title}
                                onChange={(e) => occasionForm.setData('title', e.target.value)}
                                required
                            />
                            <InputError message={occasionForm.errors.title} className="mt-1" />
                        </div>

                        {/* 3. Schedule & Location */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <InputLabel htmlFor="event_date" value="Date *" className="text-xs font-bold" />
                                <TextInput
                                    id="event_date"
                                    type="date"
                                    className="w-full text-xs mt-1"
                                    value={occasionForm.data.event_date}
                                    onChange={(e) => occasionForm.setData('event_date', e.target.value)}
                                    required
                                />
                                <InputError message={occasionForm.errors.event_date} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="event_time" value="Time" className="text-xs font-bold" />
                                <TextInput
                                    id="event_time"
                                    type="text"
                                    placeholder="e.g. 7:00 PM - 11:30 PM"
                                    className="w-full text-xs mt-1"
                                    value={occasionForm.data.event_time}
                                    onChange={(e) => occasionForm.setData('event_time', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <InputLabel htmlFor="occasion_venue" value="Venue / Departure *" className="text-xs font-bold" />
                                <TextInput
                                    id="occasion_venue"
                                    type="text"
                                    placeholder="e.g. Mlimani City Conference Hall"
                                    className="w-full text-xs mt-1"
                                    value={occasionForm.data.venue}
                                    onChange={(e) => occasionForm.setData('venue', e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="occasion_city" value="City / Region" className="text-xs font-bold" />
                                <TextInput
                                    id="occasion_city"
                                    type="text"
                                    className="w-full text-xs mt-1"
                                    value={occasionForm.data.city}
                                    onChange={(e) => occasionForm.setData('city', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* 4. Initial Tier Setup */}
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.08] space-y-3">
                            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                Initial Ticket Tier
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                <div>
                                    <InputLabel htmlFor="init_tier_name" value="Tier Name" className="text-[11px] font-bold" />
                                    <TextInput
                                        id="init_tier_name"
                                        type="text"
                                        className="w-full text-xs mt-1"
                                        value={occasionForm.data.initial_tier_name}
                                        onChange={(e) => occasionForm.setData('initial_tier_name', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <InputLabel htmlFor="init_tier_price" value={`Price (${currency})`} className="text-[11px] font-bold" />
                                    <TextInput
                                        id="init_tier_price"
                                        type="number"
                                        min="0"
                                        className="w-full text-xs mt-1 font-mono"
                                        value={occasionForm.data.initial_tier_price}
                                        onChange={(e) => occasionForm.setData('initial_tier_price', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <InputLabel htmlFor="init_tier_cap" value="Capacity" className="text-[11px] font-bold" />
                                    <TextInput
                                        id="init_tier_cap"
                                        type="number"
                                        min="1"
                                        className="w-full text-xs mt-1 font-mono"
                                        value={occasionForm.data.initial_tier_capacity}
                                        onChange={(e) => occasionForm.setData('initial_tier_capacity', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 5. Cover Image */}
                        <div>
                            <InputLabel value="Cover Image (Optional)" className="text-xs font-bold" />
                            <div className="mt-1 flex items-center gap-2">
                                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.05] cursor-pointer">
                                    <Upload className="w-3.5 h-3.5" />
                                    <span>Upload Image</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                occasionForm.setData('cover_image', file);
                                                setCoverUploadPreview(URL.createObjectURL(file));
                                            }
                                        }}
                                    />
                                </label>
                                {coverUploadPreview && (
                                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Image attached</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
                        <SecondaryButton
                            type="button"
                            onClick={() => setOccasionModalOpen(false)}
                            className="text-xs"
                        >
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton
                            type="submit"
                            disabled={occasionForm.processing}
                            className="text-xs bg-[#16A34A] hover:bg-[#15803D]"
                        >
                            {occasionForm.processing ? 'Creating...' : 'Create Occasion'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal: Delete Tier Confirmation */}
            <ConfirmationModal
                show={deleteModal.show}
                title={`Delete ${deleteModal.tier?.name}?`}
                message="Are you sure you want to delete this ticket tier? This will remove it from the public storefront."
                warning={deleteModal.tier?.sold_count > 0 ? `Notice: ${deleteModal.tier?.sold_count} tickets have already been issued under this tier.` : ''}
                confirmText="Yes, Delete Tier"
                cancelText="Cancel"
                onConfirm={handleDeleteTier}
                loading={deleteModal.loading}
                variant="danger"
                onClose={() => setDeleteModal({ show: false, tier: null, loading: false })}
            />

            {/* Modal: Multi-Channel Dispatch (WhatsApp, SMS, Email) */}
            <Modal show={dispatchModal.show} onClose={() => setDispatchModal(prev => ({ ...prev, show: false }))} maxWidth="sm">
                <form onSubmit={handleSendDispatch} className="p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] pb-3">
                        <div className="flex items-center gap-2">
                            {dispatchModal.channel === 'whatsapp' ? <Phone className="w-4 h-4 text-emerald-600" /> : dispatchModal.channel === 'sms' ? <MessageSquare className="w-4 h-4 text-cyan-600" /> : <Mail className="w-4 h-4 text-purple-600" />}
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                                Send via {dispatchModal.channel}
                            </h3>
                        </div>
                        <button
                            type="button"
                            onClick={() => setDispatchModal(prev => ({ ...prev, show: false }))}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm cursor-pointer"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="space-y-3">
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.08] text-xs">
                            <div className="font-bold text-slate-900 dark:text-white">
                                {dispatchModal.ticket?.attendee_name}
                            </div>
                            <div className="font-mono text-slate-400 text-[11px] mt-0.5">
                                Pass #{dispatchModal.ticket?.ticket_number} • {dispatchModal.ticket?.ticket_tier?.name}
                            </div>
                        </div>

                        <div>
                            <InputLabel
                                htmlFor="dispatch_recipient"
                                value={dispatchModal.channel === 'email' ? 'Email Address *' : 'Phone Number (with country code) *'}
                                className="text-xs font-bold"
                            />
                            <TextInput
                                id="dispatch_recipient"
                                type={dispatchModal.channel === 'email' ? 'email' : 'text'}
                                className="w-full text-xs mt-1 font-mono"
                                placeholder={dispatchModal.channel === 'email' ? 'attendee@example.com' : '2557XXXXXXXX'}
                                value={dispatchModal.recipient}
                                onChange={(e) => setDispatchModal(prev => ({ ...prev, recipient: e.target.value }))}
                                required
                            />
                        </div>

                        {dispatchModal.successMessage && (
                            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 shrink-0" />
                                <span>{dispatchModal.successMessage}</span>
                            </div>
                        )}

                        {dispatchModal.errorMessage && (
                            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs font-medium flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{dispatchModal.errorMessage}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
                        <SecondaryButton
                            type="button"
                            onClick={() => setDispatchModal(prev => ({ ...prev, show: false }))}
                            className="text-xs"
                        >
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton
                            type="submit"
                            disabled={dispatchModal.loading}
                            className="text-xs bg-[#16A34A] hover:bg-[#15803D]"
                        >
                            {dispatchModal.loading ? 'Sending...' : `Send ${dispatchModal.channel?.toUpperCase()}`}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </KardovoAppLayout>
    );
}
