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
    Users,
    QrCode,
    CheckCircle2,
    AlertCircle,
    ShoppingBag,
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
    Hotel,
    Music,
    PartyPopper,
    Trophy,
    Globe,
    Upload,
    Image as ImageIcon,
    Layers,
    Palette,
    Briefcase,
    Crown,
    CreditCard,
    Building2,
    ShieldCheck,
    Wallet,
    ArrowUpRight,
    X,
    Pause,
    Play,
    Percent,
    Store,
    Scissors,
    Truck,
    FileSpreadsheet,
    LayoutDashboard,
} from 'lucide-react';

export default function TicketingPortal({
    events = [],
    selectedEvent = null,
    selectedEventStats = null,
    selectedEventTiers = [],
    selectedEventOrders = [],
    selectedEventTickets = { data: [], total: 0, links: [] },
    selectedEventDiscountCodes = [],
    selectedEventWristbandOrders = [],
    selectedEventPosRequests = [],
    globalStats = {},
    filters = {},
}) {
    const { auth, selectedEvent: liveSelectedEvent } = usePage().props;
    const user = auth?.user;

    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'tiers' | 'discounts' | 'orders' | 'tickets' | 'pos' | 'wristbands' | 'payout'
    const [eventDropdownOpen, setEventDropdownOpen] = useState(false);
    const eventDropdownRef = useRef(null);
    const [tierModalOpen, setTierModalOpen] = useState(false);
    const [editingTier, setEditingTier] = useState(null);
    const [settingsModalOpen, setSettingsModalOpen] = useState(false);
    const [occasionModalOpen, setOccasionModalOpen] = useState(false);
    const [passDesignerOpen, setPassDesignerOpen] = useState(false);
    const [designerTab, setDesignerTab] = useState('card'); // 'card' | 'stub'
    const [coverUploadPreview, setCoverUploadPreview] = useState(null);
    const [settingsCoverPreview, setSettingsCoverPreview] = useState(null);
    const [expandedOrderId, setExpandedOrderId] = useState(null);

    // Discount Codes Modal & Form State
    const [discountModalOpen, setDiscountModalOpen] = useState(false);
    const [editingDiscount, setEditingDiscount] = useState(null);
    const discountForm = useForm({
        code: '',
        discount_type: 'percentage',
        discount_value: '',
        max_uses: '',
        min_order_amount: '',
        expires_at: '',
        is_active: true,
        description: '',
    });

    const openDiscountModal = (discount = null) => {
        setEditingDiscount(discount);
        if (discount) {
            discountForm.setData({
                code: discount.code,
                discount_type: discount.discount_type,
                discount_value: discount.discount_value,
                max_uses: discount.max_uses || '',
                min_order_amount: discount.min_order_amount || '',
                expires_at: discount.expires_at ? String(discount.expires_at).slice(0, 10) : '',
                is_active: Boolean(discount.is_active),
                description: discount.description || '',
            });
        } else {
            discountForm.reset();
            discountForm.setData({
                code: '',
                discount_type: 'percentage',
                discount_value: '',
                max_uses: '',
                min_order_amount: '',
                expires_at: '',
                is_active: true,
                description: '',
            });
        }
        setDiscountModalOpen(true);
    };

    const handleSaveDiscount = (e) => {
        e.preventDefault();
        if (!selectedEvent) return;
        if (editingDiscount) {
            discountForm.put(route('events.discountCodes.update', [selectedEvent.id, editingDiscount.id]), {
                onSuccess: () => setDiscountModalOpen(false),
            });
        } else {
            discountForm.post(route('events.discountCodes.store', selectedEvent.id), {
                onSuccess: () => {
                    setDiscountModalOpen(false);
                    discountForm.reset();
                },
            });
        }
    };

    const handleToggleDiscount = (discount) => {
        if (!selectedEvent) return;
        router.patch(route('events.discountCodes.toggle', [selectedEvent.id, discount.id]), {}, {
            preserveScroll: true,
        });
    };

    const handleDeleteDiscount = (discount) => {
        if (!selectedEvent) return;
        if (confirm(`Are you sure you want to delete discount code "${discount.code}"?`)) {
            router.delete(route('events.discountCodes.destroy', [selectedEvent.id, discount.id]), {
                preserveScroll: true,
            });
        }
    };

    // Wristband Ordering Modal & Form
    const [wristbandModalOpen, setWristbandModalOpen] = useState(false);
    const wristbandForm = useForm({
        material_type: 'tyvek',
        quantity: 100,
        color_scheme: '#154F7C',
        custom_text: selectedEvent?.title || '',
        contact_name: user?.name || '',
        contact_phone: user?.phone || '',
        contact_email: user?.email || '',
        delivery_address: '',
        notes: '',
    });

    const handleOrderWristbands = (e) => {
        e.preventDefault();
        if (!selectedEvent) return;
        wristbandForm.post(route('events.wristbands.order', selectedEvent.id), {
            onSuccess: () => {
                setWristbandModalOpen(false);
                wristbandForm.reset();
            },
        });
    };

    // Point of Sale (POS) Request Modal & Form
    const [posModalOpen, setPosModalOpen] = useState(false);
    const posForm = useForm({
        terminals_count: 1,
        required_from_date: selectedEvent?.event_date ? String(selectedEvent.event_date).slice(0, 10) : '',
        required_to_date: selectedEvent?.event_date ? String(selectedEvent.event_date).slice(0, 10) : '',
        venue_location: selectedEvent?.venue || '',
        contact_name: user?.name || '',
        contact_phone: user?.phone || '',
        contact_email: user?.email || '',
        notes: '',
    });

    const handleRequestPos = (e) => {
        e.preventDefault();
        if (!selectedEvent) return;
        posForm.post(route('events.posRequest.store', selectedEvent.id), {
            onSuccess: () => {
                setPosModalOpen(false);
                posForm.reset();
            },
        });
    };

    // Bulk Ticket / Wristband Stock Generator Modal & Form (Zero Guest Details Required)
    const [bulkModalOpen, setBulkModalOpen] = useState(false);
    const bulkForm = useForm({
        tier_id: selectedEventTiers[0]?.id || '',
        quantity: 50,
        distribution_label: '',
        attendee_prefix: '',
        redirect_to: 'print_tickets', // 'print_tickets' | 'print_wristbands' | 'portal'
    });

    const openBulkModal = (defaultFormat = 'print_tickets') => {
        if (!selectedEvent) return;
        if (!selectedEventTiers || selectedEventTiers.length === 0) {
            setActiveTab('tiers');
            openCreateTier();
            return;
        }
        bulkForm.clearErrors();
        bulkForm.setData({
            tier_id: bulkForm.data.tier_id || selectedEventTiers[0]?.id || '',
            quantity: bulkForm.data.quantity || 50,
            distribution_label: '',
            attendee_prefix: '',
            redirect_to: defaultFormat,
        });
        setBulkModalOpen(true);
    };

    const handleGenerateBulk = (e) => {
        e.preventDefault();
        if (!selectedEvent) return;
        bulkForm.post(route('events.tickets.batchGenerate', selectedEvent.id), {
            preserveScroll: true,
            onSuccess: () => {
                setBulkModalOpen(false);
            },
        });
    };

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

    const [copiedLink, setCopiedLink] = useState(false);

    const publicUrl = selectedEvent && typeof window !== 'undefined'
        ? `${window.location.origin}/e/${selectedEvent.id}/tickets`
        : (selectedEvent ? `/e/${selectedEvent.id}/tickets` : '');

    const handleCopyStorefrontLink = () => {
        if (!publicUrl) return;
        navigator.clipboard.writeText(publicUrl);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
    };

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
        color: '#154F7C',
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
        payout_method: selectedEvent?.payout_method || 'mobile_money',
        payout_provider: selectedEvent?.payout_provider || 'M-Pesa (Vodacom)',
        payout_account_number: selectedEvent?.payout_account_number || '',
        payout_account_name: selectedEvent?.payout_account_name || '',
        payout_bank_branch: selectedEvent?.payout_bank_branch || '',
    });

    const [customDesignPreview, setCustomDesignPreview] = useState(null);

    // Pass Designer Form
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
        show_barcode: currentTemplateConfig.show_barcode !== false,
        show_event_details: Boolean(currentTemplateConfig.show_event_details),
    });

    // Sync form state whenever selectedEvent.ticket_template_config changes from server
    const prevConfigRef = useRef(null);
    useEffect(() => {
        const liveEvent = liveSelectedEvent || selectedEvent;
        const configStr = JSON.stringify(liveEvent?.ticket_template_config);
        if (configStr === prevConfigRef.current) return;
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
            show_barcode: config.show_barcode !== false,
            show_event_details: Boolean(config.show_event_details),
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
            show_barcode: config.show_barcode !== false,
            show_event_details: Boolean(config.show_event_details),
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
                show_confetti: 0,
                show_barcode: data.show_barcode ? 1 : 0,
                show_event_details: data.show_event_details ? 1 : 0,
                custom_design_file: data.custom_design_file instanceof File ? data.custom_design_file : null,
            }))
            .post(route('events.ticketTemplate.update', selectedEvent.id), {
                preserveScroll: true,
                preserveState: false,
                forceFormData: true,
                onSuccess: () => {
                    setPassDesignerOpen(false);
                    router.reload({ only: ['selectedEvent', 'selectedEventTiers', 'selectedEventStats'], preserveScroll: true });
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
        { id: 'fashion', label: 'Fashion & Runway', icon: Crown, placeholder: 'Swahili Fashion Week & Awards 2026', presetVenue: 'The Warehouse Arena Masaki' },
        { id: 'corporate', label: 'Corporate Event', icon: Briefcase, placeholder: 'Tanzania CEO Leadership & Investment Summit', presetVenue: 'JNICC Conference Centre Dar' },
        { id: 'hotel', label: 'Hotel & Getaway', icon: Hotel, placeholder: 'Serena Zanzibar Weekend Luxury Retreat', presetVenue: 'Zanzibar Serena Hotel' },
        { id: 'nightlife', label: 'Nightlife & Cruise', icon: Sparkles, placeholder: 'All White Sunset Yacht Party', presetVenue: 'Slipway Waterfront Marina' },
        { id: 'sports', label: 'Sports & Marathon', icon: Trophy, placeholder: 'Kilimanjaro Half Marathon 2026', presetVenue: 'Moshi Sports Stadium' },
        { id: 'conference', label: 'Conference / Summit', icon: Users, placeholder: 'Tanzania Tech & Investment Forum', presetVenue: 'JNICC Dar es Salaam' },
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
            color: '#154F7C',
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
            color: tier.color || '#154F7C',
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

    const handleTogglePauseTier = (tier) => {
        if (!selectedEvent || !tier) return;
        const newStatus = tier.status === 'paused' ? 'active' : 'paused';
        router.put(
            route('events.ticketTiers.update', [selectedEvent.id, tier.id]),
            {
                name: tier.name,
                description: tier.description || '',
                price: tier.price,
                capacity: tier.capacity,
                max_per_order: tier.max_per_order || 10,
                status: newStatus,
                sales_start_at: tier.sales_start_at || '',
                sales_end_at: tier.sales_end_at || '',
                color: tier.color || '#154F7C',
            },
            {
                preserveScroll: true,
            }
        );
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

    const syncSettingsFormFromEvent = () => {
        if (!selectedEvent) return;
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
            payout_method: selectedEvent.payout_method || 'mobile_money',
            payout_provider: selectedEvent.payout_provider || (selectedEvent.payout_method === 'bank' ? 'CRDB Bank' : 'M-Pesa (Vodacom)'),
            payout_account_number: selectedEvent.payout_account_number || '',
            payout_account_name: selectedEvent.payout_account_name || '',
            payout_bank_branch: selectedEvent.payout_bank_branch || '',
        });
        setSettingsCoverPreview(selectedEvent.cover_photo || null);
    };

    const openSettingsModal = () => {
        if (!selectedEvent) return;
        syncSettingsFormFromEvent();
        setSettingsModalOpen(true);
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
        } catch {
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

    // ── Setup progress ──────────────────────────────────────────────
    const hasTiers = selectedEventTiers.length > 0;
    const hasCustomDesign = Boolean(selectedEvent?.cover_photo || selectedEvent?.ticket_template_config);
    const hasPayoutConnected = Boolean(selectedEvent?.payout_account_number);
    const isStorefrontLive = Boolean(selectedEvent?.ticketing_enabled && hasTiers);
    const payoutLastDigits = String(selectedEvent?.payout_account_number || '').slice(-4);

    const [salesUpdating, setSalesUpdating] = useState(false);

    /**
     * Opens or closes ticket sales in one click, preserving every other setting.
     * Opening sales without any ticket type sends the organizer to create one first.
     */
    const setSalesEnabled = (enabled) => {
        if (!selectedEvent || salesUpdating) return;

        if (enabled && !hasTiers) {
            setActiveTab('tiers');
            openCreateTier();
            return;
        }

        router.post(
            route('events.ticketingSettings', selectedEvent.id),
            {
                ticketing_enabled: enabled,
                ticket_currency: selectedEvent.ticket_currency || 'TZS',
                ticket_instructions: selectedEvent.ticket_instructions || '',
                ticket_sales_end_at: selectedEvent.ticket_sales_end_at
                    ? String(selectedEvent.ticket_sales_end_at).slice(0, 16)
                    : '',
                is_public: selectedEvent.is_public !== false,
            },
            {
                preserveScroll: true,
                onStart: () => setSalesUpdating(true),
                onFinish: () => setSalesUpdating(false),
            },
        );
    };

    const goToTab = (tabId) => {
        if (tabId === 'payout') syncSettingsFormFromEvent();
        setActiveTab(tabId);
    };

    const setupSteps = [
        {
            id: 'tickets',
            title: 'Add your tickets',
            description: 'Create a ticket type such as Regular, VIP or Free.',
            doneText: `${selectedEventTiers.length} ticket type${selectedEventTiers.length === 1 ? '' : 's'} added`,
            done: hasTiers,
            actionLabel: hasTiers ? 'Manage' : 'Add ticket',
            disabled: false,
            onAction: () => {
                setActiveTab('tiers');
                if (!hasTiers) openCreateTier();
            },
        },
        {
            id: 'payout',
            title: 'Add your payout account',
            description: 'Tell us where to send your earnings. You receive 94% of every sale.',
            doneText: `${selectedEvent?.payout_provider || 'Account'} ending ${payoutLastDigits}`,
            done: hasPayoutConnected,
            actionLabel: hasPayoutConnected ? 'Edit' : 'Add account',
            disabled: false,
            onAction: () => goToTab('payout'),
        },
        {
            id: 'sales',
            title: 'Open sales and share your link',
            description: hasTiers
                ? 'Turn sales on, then send your ticket link to buyers.'
                : 'Add a ticket type first.',
            doneText: 'Sales are open',
            done: isStorefrontLive,
            actionLabel: 'Open sales',
            disabled: !hasTiers,
            onAction: () => setSalesEnabled(true),
        },
    ];
    const completedSetupSteps = setupSteps.filter((step) => step.done).length;
    const nextSetupStep = setupSteps.find((step) => !step.done && !step.disabled) || null;
    const isSetupComplete = completedSetupSteps === setupSteps.length;
    const recentOrders = selectedEventOrders.slice(0, 5);

    // ── Navigation: 5 sections, some with sub-tabs ───────────────────
    const sections = [
        {
            id: 'overview',
            label: 'Overview',
            icon: LayoutDashboard,
            todo: isSetupComplete ? 0 : setupSteps.length - completedSetupSteps,
            tabs: [{ id: 'overview', label: 'Overview' }],
        },
        {
            id: 'tickets',
            label: 'Tickets',
            icon: Ticket,
            tabs: [
                { id: 'tiers', label: 'Ticket Types', count: selectedEventTiers.length },
                { id: 'discounts', label: 'Promo Codes', count: selectedEventDiscountCodes.length },
            ],
        },
        {
            id: 'sales',
            label: 'Sales',
            icon: ShoppingBag,
            tabs: [
                { id: 'orders', label: 'Orders', count: selectedEventOrders.length },
                { id: 'tickets', label: 'Attendees', count: selectedEventTickets?.total || 0 },
            ],
        },
        {
            id: 'event-day',
            label: 'Event Day',
            icon: QrCode,
            tabs: [
                { id: 'pos', label: 'Scanner & Door Sales' },
                { id: 'wristbands', label: 'Wristbands' },
            ],
        },
        {
            id: 'payouts',
            label: 'Payouts',
            icon: Wallet,
            tabs: [{ id: 'payout', label: 'Payouts' }],
        },
    ];
    const activeSection = sections.find((section) => section.tabs.some((tab) => tab.id === activeTab)) || sections[0];

    return (
        <KardovoAppLayout
            title="Ticketing"
            headerActions={
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setOccasionModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-bold text-white bg-[#154F7C] hover:bg-[#114064] rounded-xl shadow-xs transition active:scale-[0.98] cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        <span>New Event</span>
                    </button>
                </div>
            }
        >
            <Head title="Ticketing Portal - Kardovo" />

            <div className="max-w-7xl mx-auto space-y-5 pb-12">
                {selectedEvent ? (
                    <>
                        {/* ══════════════════════════════════════════════════════════════
                            EVENT HEADER: who, status, and the 3 things you do most
                           ══════════════════════════════════════════════════════════════ */}
                        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                            <div className="flex items-center gap-4 min-w-0">
                                <button
                                    type="button"
                                    onClick={openSettingsModal}
                                    aria-label="Change event poster"
                                    title="Change poster"
                                    className="relative w-12 h-16 rounded-lg overflow-hidden bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 shrink-0 group cursor-pointer"
                                >
                                    {selectedEvent.cover_photo ? (
                                        <img
                                            src={selectedEvent.cover_photo}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <OccasionIcon className="w-5 h-5 text-[#154F7C] dark:text-sky-400" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-slate-950/55 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                                        <Upload className="w-4 h-4" />
                                    </div>
                                </button>

                                <div className="min-w-0">
                                    <div className="relative" ref={eventDropdownRef}>
                                        <button
                                            type="button"
                                            onClick={() => events.length > 1 && setEventDropdownOpen((prev) => !prev)}
                                            aria-haspopup={events.length > 1 ? 'listbox' : undefined}
                                            aria-expanded={events.length > 1 ? eventDropdownOpen : undefined}
                                            className={`flex items-center gap-1.5 max-w-full text-left ${events.length > 1 ? 'cursor-pointer' : 'cursor-default'}`}
                                        >
                                            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
                                                {selectedEvent.title}
                                            </h1>
                                            {events.length > 1 && (
                                                <ChevronDown
                                                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                                                        eventDropdownOpen ? 'rotate-180' : ''
                                                    }`}
                                                />
                                            )}
                                        </button>

                                        {eventDropdownOpen && (
                                            <div
                                                role="listbox"
                                                className="absolute left-0 top-full mt-2 w-80 max-w-[85vw] bg-white dark:bg-[#0B1524] rounded-xl border border-slate-200 dark:border-white/10 shadow-xl py-1 z-50 overflow-hidden"
                                            >
                                                <div className="px-4 py-2 text-xs font-semibold text-slate-500 border-b border-slate-100 dark:border-white/[0.06]">
                                                    Switch event
                                                </div>
                                                <div className="max-h-64 overflow-y-auto">
                                                    {events.map((ev) => {
                                                        const isSelected = ev.id === selectedEvent?.id;
                                                        return (
                                                            <button
                                                                key={ev.id}
                                                                type="button"
                                                                role="option"
                                                                aria-selected={isSelected}
                                                                onClick={() => {
                                                                    setEventDropdownOpen(false);
                                                                    handleEventChange(ev.id);
                                                                }}
                                                                className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between gap-2 transition cursor-pointer ${
                                                                    isSelected
                                                                        ? 'bg-sky-50 dark:bg-sky-500/10 text-[#154F7C] dark:text-sky-300 font-bold'
                                                                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.03]'
                                                                }`}
                                                            >
                                                                <span className="min-w-0">
                                                                    <span className="block truncate">{ev.title}</span>
                                                                    <span className="block text-xs text-slate-400 font-normal truncate">
                                                                        {ev.venue || 'No venue yet'}
                                                                    </span>
                                                                </span>
                                                                {isSelected && <Check className="w-4 h-4 shrink-0" />}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-1 flex items-center gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400 flex-wrap">
                                        {selectedEvent.event_date && (
                                            <span className="inline-flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                {new Date(selectedEvent.event_date).toLocaleDateString(undefined, {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })}
                                            </span>
                                        )}
                                        {selectedEvent.venue && (
                                            <span className="inline-flex items-center gap-1.5 min-w-0">
                                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                <span className="truncate max-w-[16rem]">
                                                    {selectedEvent.venue}
                                                    {selectedEvent.city ? `, ${selectedEvent.city}` : ''}
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
                                    aria-checked={Boolean(selectedEvent.ticketing_enabled)}
                                    disabled={salesUpdating}
                                    onClick={() => setSalesEnabled(!selectedEvent.ticketing_enabled)}
                                    title={selectedEvent.ticketing_enabled ? 'Click to pause ticket sales' : 'Click to open ticket sales'}
                                    className="inline-flex items-center justify-center gap-2 pl-2.5 pr-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0B1524] border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.05] transition disabled:opacity-60 cursor-pointer"
                                >
                                    <span
                                        className={`relative w-8 h-[18px] rounded-full transition-colors shrink-0 ${
                                            selectedEvent.ticketing_enabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-white/20'
                                        }`}
                                    >
                                        <span
                                            className={`absolute top-[2px] left-[2px] w-[14px] h-[14px] rounded-full bg-white shadow transition-transform ${
                                                selectedEvent.ticketing_enabled ? 'translate-x-[14px]' : ''
                                            }`}
                                        />
                                    </span>
                                    <span>{selectedEvent.ticketing_enabled ? 'Sales open' : 'Sales closed'}</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={handleCopyStorefrontLink}
                                    className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0B1524] border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.05] transition cursor-pointer"
                                >
                                    {copiedLink ? (
                                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                                    ) : (
                                        <Copy className="w-4 h-4 text-slate-400 shrink-0" />
                                    )}
                                    <span>{copiedLink ? 'Copied' : 'Copy link'}</span>
                                </button>

                                <a
                                    href={route('events.publicTickets', selectedEvent.id)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0B1524] border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.05] transition"
                                >
                                    <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
                                    <span>Preview</span>
                                </a>

                                <button
                                    type="button"
                                    onClick={openSettingsModal}
                                    aria-label="Event settings"
                                    title="Event settings"
                                    className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-slate-500 dark:text-slate-300 bg-white dark:bg-[#0B1524] border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.05] transition cursor-pointer ml-auto sm:ml-0"
                                >
                                    <Settings className="w-4 h-4" />
                                </button>
                            </div>
                        </header>

                        {/* ══════════════════════════════════════════════════════════════
                            NAVIGATION: 5 sections, plain words
                           ══════════════════════════════════════════════════════════════ */}
                        <nav
                            aria-label="Ticketing sections"
                            className="border-b border-slate-200 dark:border-white/10 flex items-center gap-1 overflow-x-auto scrollbar-none"
                        >
                            {sections.map((section) => {
                                const SectionIcon = section.icon;
                                const isActive = activeSection.id === section.id;
                                return (
                                    <button
                                        key={section.id}
                                        type="button"
                                        aria-current={isActive ? 'page' : undefined}
                                        onClick={() => goToTab(section.tabs[0].id)}
                                        className={`flex items-center gap-2 px-4 py-3 -mb-px text-sm font-semibold whitespace-nowrap border-b-2 transition cursor-pointer ${
                                            isActive
                                                ? 'border-[#154F7C] dark:border-sky-400 text-[#154F7C] dark:text-sky-300'
                                                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                    >
                                        <SectionIcon className="w-4 h-4 shrink-0" />
                                        <span>{section.label}</span>
                                        {section.todo > 0 && (
                                            <span className="text-[11px] leading-none px-1.5 py-1 rounded-full font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400">
                                                {section.todo} to do
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </nav>

                        {activeSection.tabs.length > 1 && (
                            <div
                                role="tablist"
                                aria-label={`${activeSection.label} views`}
                                className="inline-flex p-1 gap-1 rounded-xl bg-slate-100 dark:bg-white/[0.05] max-w-full overflow-x-auto scrollbar-none"
                            >
                                {activeSection.tabs.map((tab) => {
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            type="button"
                                            role="tab"
                                            aria-selected={isActive}
                                            onClick={() => goToTab(tab.id)}
                                            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap transition cursor-pointer ${
                                                isActive
                                                    ? 'bg-white dark:bg-[#111D30] text-slate-900 dark:text-white shadow-xs'
                                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                            }`}
                                        >
                                            <span>{tab.label}</span>
                                            {tab.count !== undefined && tab.count !== null && (
                                                <span className="text-xs font-mono text-slate-400">{tab.count}</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* ══════════════════════════════════════════════════════════════
                            OVERVIEW: what to do next, then how it is going
                           ══════════════════════════════════════════════════════════════ */}
                        {activeTab === 'overview' && (
                            <div className="space-y-5">
                                {!isSetupComplete && (
                                    <section className="bg-white dark:bg-[#0B1524] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs overflow-hidden">
                                        <div className="p-6 border-b border-slate-100 dark:border-white/[0.08]">
                                            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                                                {isStorefrontLive ? 'Finish setup' : 'Get ready to sell'}
                                            </h2>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                Complete these {setupSteps.length} steps to start selling tickets.
                                            </p>
                                            <div className="mt-4 flex items-center gap-3">
                                                <div
                                                    className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-white/[0.08] overflow-hidden"
                                                    role="progressbar"
                                                    aria-valuemin={0}
                                                    aria-valuemax={setupSteps.length}
                                                    aria-valuenow={completedSetupSteps}
                                                >
                                                    <div
                                                        className="h-full bg-[#154F7C] dark:bg-sky-400 rounded-full transition-all"
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
                                                        className={`px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4 ${
                                                            isNext ? 'bg-sky-50/60 dark:bg-sky-500/[0.05]' : ''
                                                        }`}
                                                    >
                                                        <div className="flex items-start gap-4 flex-1 min-w-0">
                                                            <span
                                                                className={`w-8 h-8 rounded-full text-sm font-bold flex items-center justify-center shrink-0 ${
                                                                    step.done
                                                                        ? 'bg-emerald-500 text-white'
                                                                        : isNext
                                                                        ? 'bg-[#154F7C] text-white'
                                                                        : 'bg-slate-100 dark:bg-white/[0.08] text-slate-500'
                                                                }`}
                                                            >
                                                                {step.done ? <Check className="w-4 h-4" /> : index + 1}
                                                            </span>
                                                            <div className="min-w-0">
                                                                <div className="text-sm font-bold text-slate-900 dark:text-white">
                                                                    {step.title}
                                                                </div>
                                                                <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                                                    {step.done ? step.doneText : step.description}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            disabled={step.disabled || (step.id === 'sales' && salesUpdating)}
                                                            onClick={step.onAction}
                                                            className={`sm:w-36 shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
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

                                        <div className="px-6 py-4 bg-slate-50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                <span className="font-semibold text-slate-700 dark:text-slate-200">Optional:</span>{' '}
                                                choose the colors and poster on the ticket your guests receive.
                                            </p>
                                            <button
                                                type="button"
                                                onClick={openPassDesigner}
                                                className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#111D30] border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 transition cursor-pointer"
                                            >
                                                <Palette className="w-4 h-4 text-[#154F7C] dark:text-sky-400" />
                                                <span>Design ticket</span>
                                            </button>
                                        </div>
                                    </section>
                                )}

                                {isStorefrontLive && (
                                    <section className="bg-white dark:bg-[#0B1524] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs p-6">
                                        <h2 className="text-sm font-bold text-slate-900 dark:text-white">Your ticket link</h2>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                            Send this link to buyers on WhatsApp, Instagram or SMS.
                                        </p>
                                        <div className="mt-4 flex flex-col sm:flex-row gap-2">
                                            <div className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#08121E] border border-slate-200 dark:border-white/10 font-mono text-sm text-slate-700 dark:text-slate-300 truncate">
                                                {publicUrl}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleCopyStorefrontLink}
                                                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#154F7C] hover:bg-[#114064] shadow-xs transition active:scale-[0.98] cursor-pointer"
                                            >
                                                {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                <span>{copiedLink ? 'Copied' : 'Copy link'}</span>
                                            </button>
                                        </div>
                                    </section>
                                )}

                                {selectedEventStats && (isStorefrontLive || selectedEventStats.total_sold > 0) && (
                                    <section
                                        aria-label="Sales summary"
                                        className="grid grid-cols-2 lg:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-slate-200/80 dark:border-white/[0.08] bg-slate-200/80 dark:bg-white/[0.08] shadow-xs"
                                    >
                                        <div className="bg-white dark:bg-[#0B1524] p-5">
                                            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Your earnings (94%)</div>
                                            <div className="mt-1.5 text-xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums">
                                                {currency} {(selectedEventStats.total_organizer_net || 0).toLocaleString()}
                                            </div>
                                            <div className="mt-1 text-xs text-slate-400 tabular-nums">
                                                From {currency} {(selectedEventStats.total_revenue || 0).toLocaleString()} sold
                                            </div>
                                        </div>
                                        <div className="bg-white dark:bg-[#0B1524] p-5">
                                            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tickets sold</div>
                                            <div className="mt-1.5 text-xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums">
                                                {selectedEventStats.total_sold}
                                                <span className="text-sm font-medium text-slate-400"> / {selectedEventStats.total_capacity || '∞'}</span>
                                            </div>
                                            <div className="mt-2 h-1.5 rounded-full bg-slate-100 dark:bg-white/[0.08] overflow-hidden">
                                                <div
                                                    className="h-full bg-[#154F7C] dark:bg-sky-400 rounded-full"
                                                    style={{
                                                        width: `${
                                                            selectedEventStats.total_capacity > 0
                                                                ? Math.min(100, Math.round((selectedEventStats.total_sold / selectedEventStats.total_capacity) * 100))
                                                                : 0
                                                        }%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="bg-white dark:bg-[#0B1524] p-5">
                                            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Checked in</div>
                                            <div className="mt-1.5 text-xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums">
                                                {selectedEventStats.total_checked_in}
                                            </div>
                                            <div className="mt-1 text-xs text-slate-400">
                                                {selectedEventStats.total_sold > 0
                                                    ? `${Math.round((selectedEventStats.total_checked_in / selectedEventStats.total_sold) * 100)}% of guests`
                                                    : 'Nobody yet'}
                                            </div>
                                        </div>
                                        <div className="bg-white dark:bg-[#0B1524] p-5">
                                            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Orders</div>
                                            <div className="mt-1.5 text-xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums">
                                                {selectedEventOrders.length}
                                            </div>
                                            <div className="mt-1 text-xs text-slate-400">
                                                {selectedEventTiers.length} ticket type{selectedEventTiers.length === 1 ? '' : 's'}
                                            </div>
                                        </div>
                                    </section>
                                )}

                                {recentOrders.length > 0 && (
                                    <section className="bg-white dark:bg-[#0B1524] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs overflow-hidden">
                                        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08]">
                                            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Latest orders</h2>
                                            <button
                                                type="button"
                                                onClick={() => goToTab('orders')}
                                                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#154F7C] dark:text-sky-400 hover:underline cursor-pointer"
                                            >
                                                <span>View all</span>
                                                <ArrowRight className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <ul className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                                            {recentOrders.map((order) => (
                                                <li key={order.id} className="px-6 py-3.5 flex items-center justify-between gap-4">
                                                    <div className="min-w-0">
                                                        <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                                            {order.buyer_name}
                                                        </div>
                                                        <div className="text-xs text-slate-400 font-mono">{order.order_number}</div>
                                                    </div>
                                                    <div className="text-sm font-bold text-slate-900 dark:text-white tabular-nums shrink-0">
                                                        {currency} {Number(order.total_amount).toLocaleString()}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </section>
                                )}
                            </div>
                        )}

                        {/* ══════════════════════════════════════════════════════════════
                            TAB 1: TICKET TIERS & PRICING
                           ══════════════════════════════════════════════════════════════ */}
                        {activeTab === 'tiers' && (
                            <div className="bg-white dark:bg-[#0B1524] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs overflow-hidden">
                                <div className="p-5 border-b border-slate-100 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div>
                                        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                                            Ticket Types
                                        </h2>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            Create ticket packages (e.g., Regular, VIP, Early Bird) and set seat limits.
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            type="button"
                                            onClick={openPassDesigner}
                                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                                        >
                                            <Palette className="w-3.5 h-3.5 text-[#154F7C] dark:text-sky-400" />
                                            <span>Customize Ticket Design</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={openCreateTier}
                                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#154F7C] hover:bg-[#114064] rounded-xl shadow-2xs transition active:scale-95 cursor-pointer"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>Add Ticket Type</span>
                                        </button>
                                    </div>
                                </div>

                                {selectedEventTiers.length === 0 ? (
                                    <div className="p-10 text-center space-y-3">
                                        <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-[#154F7C] dark:text-sky-400 flex items-center justify-center mx-auto border border-sky-500/20">
                                            <Tag className="w-6 h-6" />
                                        </div>
                                        <div className="space-y-1 max-w-sm mx-auto">
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                                Start by Adding Your First Ticket Type
                                            </h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                Set up Regular, VIP, or Free RSVP packages so buyers can start ordering tickets on your storefront.
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={openCreateTier}
                                            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#154F7C] hover:bg-[#114064] rounded-xl shadow-xs transition cursor-pointer"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>Create First Tier</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-slate-100 dark:border-white/[0.06] bg-slate-50/60 dark:bg-white/[0.02] text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                    <th className="py-3 px-5">Tier Name</th>
                                                    <th className="py-3 px-4">Price</th>
                                                    <th className="py-3 px-4">Sold / Capacity</th>
                                                    <th className="py-3 px-4">Status</th>
                                                    <th className="py-3 px-5 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06] text-xs">
                                                {selectedEventTiers.map((tier) => {
                                                    const percentSold = tier.capacity > 0
                                                        ? Math.min(100, Math.round((tier.sold_count / tier.capacity) * 100))
                                                        : 0;

                                                    return (
                                                        <tr key={tier.id} className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition">
                                                            <td className="py-3.5 px-5">
                                                                <div className="flex items-center gap-2.5">
                                                                    <span
                                                                        className="w-3 h-3 rounded-full shrink-0"
                                                                        style={{ backgroundColor: tier.color || '#154F7C' }}
                                                                    />
                                                                    <div>
                                                                        <div className="font-bold text-slate-900 dark:text-white">
                                                                            {tier.name}
                                                                        </div>
                                                                        {tier.description && (
                                                                            <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                                                                                {tier.description}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                                                                {Number(tier.price) === 0 ? (
                                                                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-sans font-bold uppercase">
                                                                        Free
                                                                    </span>
                                                                ) : (
                                                                    `${currency} ${Number(tier.price).toLocaleString()}`
                                                                )}
                                                            </td>

                                                            <td className="py-3.5 px-4">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                                                                        {tier.sold_count}
                                                                    </span>
                                                                    <span className="text-slate-400 font-mono">/ {tier.capacity}</span>
                                                                    <span className="text-[10px] text-slate-400">({percentSold}%)</span>
                                                                </div>
                                                                <div className="w-28 h-1.5 bg-slate-100 dark:bg-white/[0.06] rounded-full overflow-hidden mt-1">
                                                                    <div
                                                                        className="h-full rounded-full"
                                                                        style={{
                                                                            width: `${percentSold}%`,
                                                                            backgroundColor: tier.color || '#154F7C',
                                                                        }}
                                                                    />
                                                                </div>
                                                            </td>

                                                            <td className="py-3.5 px-4">
                                                                <span
                                                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
                                                                        tier.status === 'active'
                                                                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                                                            : tier.status === 'sold_out'
                                                                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                                                            : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                                                                    }`}
                                                                >
                                                                    {(tier.status || '').replace('_', ' ')}
                                                                </span>
                                                            </td>

                                                            <td className="py-3.5 px-5 text-right">
                                                                <div className="flex items-center justify-end gap-1.5">
                                                                    {tier.status !== 'sold_out' && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleTogglePauseTier(tier)}
                                                                            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition inline-flex items-center gap-1 cursor-pointer"
                                                                        >
                                                                            {tier.status === 'paused' ? (
                                                                                <>
                                                                                    <Play className="w-3 h-3 text-emerald-600" />
                                                                                    <span>Resume</span>
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <Pause className="w-3 h-3 text-amber-600" />
                                                                                    <span>Pause</span>
                                                                                </>
                                                                            )}
                                                                        </button>
                                                                    )}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => openEditTier(tier)}
                                                                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#154F7C] dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer"
                                                                        title="Edit Tier"
                                                                    >
                                                                        <Edit className="w-3.5 h-3.5" />
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => confirmDeleteTier(tier)}
                                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition cursor-pointer"
                                                                        title="Delete Tier"
                                                                    >
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ══════════════════════════════════════════════════════════════
                            TAB 2: DISCOUNT & PROMO CODES
                           ══════════════════════════════════════════════════════════════ */}
                        {activeTab === 'discounts' && (
                            <div className="bg-white dark:bg-[#0B1524] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs overflow-hidden">
                                <div className="p-5 border-b border-slate-100 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div>
                                        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                                            Discount &amp; Promo Codes
                                        </h2>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            Create promo codes (percentage or fixed discount) to reward early buyers and boost sales.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => openDiscountModal()}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#154F7C] hover:bg-[#114064] text-white text-xs font-bold shadow-2xs transition cursor-pointer self-start sm:self-center"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Create Promo Code</span>
                                    </button>
                                </div>

                                {selectedEventDiscountCodes.length === 0 ? (
                                    <div className="p-10 text-center space-y-3">
                                        <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-[#154F7C] dark:text-sky-400 flex items-center justify-center mx-auto border border-sky-500/20">
                                            <Percent className="w-5 h-5" />
                                        </div>
                                        <div className="space-y-1 max-w-sm mx-auto">
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                                No Promo Codes Yet
                                            </h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                Create codes like <span className="font-mono font-bold">EARLYBIRD10</span> or <span className="font-mono font-bold">VIP5000</span> that buyers can apply at checkout.
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => openDiscountModal()}
                                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#154F7C] hover:bg-[#114064] text-white text-xs font-bold transition cursor-pointer"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>Add First Promo Code</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead>
                                                <tr className="border-b border-slate-100 dark:border-white/[0.06] bg-slate-50/60 dark:bg-white/[0.02] text-slate-400 uppercase tracking-wider text-[10px]">
                                                    <th className="py-3 px-5 font-bold">Code</th>
                                                    <th className="py-3 px-4 font-bold">Discount</th>
                                                    <th className="py-3 px-4 font-bold">Redemptions</th>
                                                    <th className="py-3 px-4 font-bold">Min. Order</th>
                                                    <th className="py-3 px-4 font-bold">Expires</th>
                                                    <th className="py-3 px-4 font-bold">Status</th>
                                                    <th className="py-3 px-5 font-bold text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                                                {selectedEventDiscountCodes.map((d) => (
                                                    <tr key={d.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition">
                                                        <td className="py-3.5 px-5 font-mono font-black text-slate-900 dark:text-white">
                                                            <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10">
                                                                {d.code}
                                                            </span>
                                                        </td>
                                                        <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                                                            {d.formatted_discount}
                                                        </td>
                                                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-mono">
                                                            <span className="font-bold">{d.used_count || 0}</span>
                                                            <span className="text-slate-400"> / {d.max_uses ? d.max_uses : '∞'}</span>
                                                        </td>
                                                        <td className="py-3.5 px-4 text-slate-500 font-mono">
                                                            {d.min_order_amount ? `${Number(d.min_order_amount).toLocaleString()} ${currency}` : '—'}
                                                        </td>
                                                        <td className="py-3.5 px-4 text-slate-500">
                                                            {d.expires_at ? String(d.expires_at).slice(0, 10) : 'Never'}
                                                        </td>
                                                        <td className="py-3.5 px-4">
                                                            <span
                                                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                                    !d.is_active
                                                                        ? 'bg-slate-100 dark:bg-white/10 text-slate-500'
                                                                        : d.is_expired
                                                                        ? 'bg-rose-500/10 text-rose-600'
                                                                        : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                                                }`}
                                                            >
                                                                {!d.is_active ? 'Paused' : d.is_expired ? 'Expired' : 'Active'}
                                                            </span>
                                                        </td>
                                                        <td className="py-3.5 px-5 text-right">
                                                            <div className="flex items-center justify-end gap-1.5">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleToggleDiscount(d)}
                                                                    className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/10 text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition cursor-pointer"
                                                                >
                                                                    {d.is_active ? 'Pause' : 'Activate'}
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openDiscountModal(d)}
                                                                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 hover:text-[#154F7C] transition cursor-pointer"
                                                                    title="Edit Code"
                                                                >
                                                                    <Edit className="w-3.5 h-3.5" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDeleteDiscount(d)}
                                                                    className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                                                                    title="Delete Code"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ══════════════════════════════════════════════════════════════
                            TAB 3: ATTENDEES & ISSUED PASSES
                           ══════════════════════════════════════════════════════════════ */}
                        {activeTab === 'tickets' && (
                            <div className="bg-white dark:bg-[#0B1524] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs overflow-hidden">
                                <div className="p-5 border-b border-slate-100 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div>
                                        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                                            Attendees &amp; Digital Passes ({selectedEventTickets?.total || 0})
                                        </h2>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            Search ticket holders, verify gate check-in status, or resend passes via WhatsApp, SMS, and Email.
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => openBulkModal('print_tickets')}
                                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#154F7C] to-[#327FB5] hover:from-[#1A5C91] hover:to-[#3D8EC7] text-white text-xs font-bold shadow-xs transition cursor-pointer"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>Generate Bulk Stock</span>
                                        </button>

                                        <a
                                            href={route('events.tickets.printSheet', selectedEvent.id)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-50 dark:bg-sky-500/10 text-[#154F7C] dark:text-sky-300 border border-sky-200/70 dark:border-sky-500/20 hover:bg-sky-100 text-xs font-bold transition"
                                        >
                                            <Printer className="w-3.5 h-3.5" />
                                            <span>Print Tickets</span>
                                        </a>

                                        <a
                                            href={route('events.wristbands.print', selectedEvent.id)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-50 dark:bg-sky-500/10 text-[#154F7C] dark:text-sky-300 border border-sky-200/70 dark:border-sky-500/20 hover:bg-sky-100 text-xs font-bold transition"
                                        >
                                            <Printer className="w-3.5 h-3.5" />
                                            <span>Print Wristbands</span>
                                        </a>

                                        <a
                                            href={route('events.tickets.exportCsv', { event: selectedEvent.id, tier_id: tierFilter })}
                                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
                                        >
                                            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
                                            <span>Export CSV</span>
                                        </a>
                                    </div>
                                </div>

                                {/* Search & Filters Toolbar */}
                                <div className="p-4 border-b border-slate-100 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.01]">
                                    <form onSubmit={handleFilterSubmit} className="flex flex-wrap items-center gap-2.5">
                                        <div className="relative w-full sm:w-auto sm:min-w-[260px] flex-1 max-w-sm">
                                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                            <input
                                                type="text"
                                                placeholder="Search attendee name, phone, or pass #..."
                                                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white focus:ring-sky-500 focus:border-[#154F7C]"
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                onBlur={handleFilterSubmit}
                                            />
                                        </div>

                                        <select
                                            className="text-xs py-1.5 pl-3 pr-8 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-700 dark:text-slate-300"
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
                                            <option value="all">All Gate Statuses</option>
                                            <option value="valid">Unscanned (Valid)</option>
                                            <option value="checked_in">Admitted at Gate</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>

                                        <select
                                            className="text-xs py-1.5 pl-3 pr-8 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-700 dark:text-slate-300"
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
                                            <option value="all">All Ticket Types</option>
                                            {selectedEventTiers.map(t => (
                                                <option key={t.id} value={t.id}>{t.name}</option>
                                            ))}
                                        </select>
                                    </form>
                                </div>

                                {!selectedEventTickets?.data || selectedEventTickets.data.length === 0 ? (
                                    <div className="p-10 text-center text-xs text-slate-500 dark:text-slate-400">
                                        No attendee passes found matching your filter.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-slate-50/60 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/[0.06] text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                                                <tr>
                                                    <th className="py-3 px-5">Attendee &amp; Pass #</th>
                                                    <th className="py-3 px-4">Contact</th>
                                                    <th className="py-3 px-4">Tier &amp; Paid</th>
                                                    <th className="py-3 px-4">Gate Status</th>
                                                    <th className="py-3 px-5 text-right">Pass &amp; Resend</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                                                {selectedEventTickets.data.map((ticket) => (
                                                    <tr key={ticket.id} className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition">
                                                        <td className="py-3.5 px-5">
                                                            <div className="font-bold text-slate-900 dark:text-white">
                                                                {ticket.attendee_name}
                                                            </div>
                                                            <div className="font-mono text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                                                <span>{ticket.ticket_number}</span>
                                                                <span>•</span>
                                                                <span>PIN: {ticket.unique_code}</span>
                                                            </div>
                                                        </td>

                                                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                                                            <div>{ticket.attendee_phone || '—'}</div>
                                                            {ticket.attendee_email && (
                                                                <div className="text-[11px] text-slate-400">{ticket.attendee_email}</div>
                                                            )}
                                                        </td>

                                                        <td className="py-3.5 px-4">
                                                            <div className="font-semibold text-slate-900 dark:text-white">
                                                                {ticket.ticket_tier?.name || 'General Admission'}
                                                            </div>
                                                            <div className="font-mono text-[11px] text-slate-400">
                                                                {currency} {Number(ticket.price_paid).toLocaleString()}
                                                            </div>
                                                        </td>

                                                        <td className="py-3.5 px-4">
                                                            <span
                                                                className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                                                    ticket.status === 'checked_in'
                                                                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                                                        : ticket.status === 'cancelled'
                                                                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                                                        : 'bg-sky-500/10 text-[#154F7C] dark:text-sky-400'
                                                                }`}
                                                            >
                                                                {ticket.status === 'checked_in' ? 'Admitted' : ticket.status}
                                                            </span>
                                                            {ticket.checked_in_at && (
                                                                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                                                    {new Date(ticket.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </div>
                                                            )}
                                                        </td>

                                                        <td className="py-3.5 px-5 text-right">
                                                            <div className="flex items-center justify-end gap-1.5">
                                                                <a
                                                                    href={route('tickets.publicPass', ticket.ticket_number)}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] text-slate-700 dark:text-slate-200 text-[11px] font-semibold transition inline-flex items-center gap-1"
                                                                    title="Open Digital Pass"
                                                                >
                                                                    <span>Pass</span>
                                                                    <ExternalLink className="w-3 h-3" />
                                                                </a>

                                                                <a
                                                                    href={route('tickets.downloadPdf', ticket.ticket_number)}
                                                                    className="p-1.5 rounded-lg text-slate-500 hover:text-[#154F7C] hover:bg-slate-100 dark:hover:bg-white/10 transition"
                                                                    title="Download PDF Ticket"
                                                                >
                                                                    <Download className="w-3.5 h-3.5" />
                                                                </a>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => openDispatchModal('whatsapp', ticket)}
                                                                    className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition cursor-pointer"
                                                                    title="Send via WhatsApp"
                                                                >
                                                                    <Phone className="w-3.5 h-3.5" />
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => openDispatchModal('sms', ticket)}
                                                                    className="p-1.5 rounded-lg text-slate-500 hover:text-[#154F7C] hover:bg-sky-50 dark:hover:bg-sky-500/10 transition cursor-pointer"
                                                                    title="Send via SMS"
                                                                >
                                                                    <MessageSquare className="w-3.5 h-3.5" />
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => openDispatchModal('email', ticket)}
                                                                    className="p-1.5 rounded-lg text-slate-500 hover:text-[#154F7C] hover:bg-sky-50 dark:hover:bg-sky-500/10 transition cursor-pointer"
                                                                    title="Send via Email"
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

                        {/* ══════════════════════════════════════════════════════════════
                            TAB 4: RECENT ORDERS
                           ══════════════════════════════════════════════════════════════ */}
                        {activeTab === 'orders' && (
                            <div className="bg-white dark:bg-[#0B1524] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs overflow-hidden">
                                <div className="p-5 border-b border-slate-100 dark:border-white/[0.08]">
                                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                                        Orders
                                    </h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        Click any order to expand and view the individual tickets issued to that buyer.
                                    </p>
                                </div>

                                {selectedEventOrders.length === 0 ? (
                                    <div className="p-10 text-center space-y-2">
                                        <ShoppingBag className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Orders Yet</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                                            Share your storefront link to start receiving Mobile Money and Card ticket orders.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                                        {selectedEventOrders.map((order) => {
                                            const isExpanded = expandedOrderId === order.id;
                                            const ticketCount = order.tickets ? order.tickets.length : 0;

                                            return (
                                                <div key={order.id} className="p-4 sm:px-5 transition hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                                                    <div
                                                        onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                                                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-[#154F7C] dark:text-sky-400 flex items-center justify-center shrink-0">
                                                                <ShoppingBag className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                                                                        {order.order_number}
                                                                    </span>
                                                                    <span
                                                                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                                                            order.payment_status === 'completed' || order.payment_status === 'paid'
                                                                                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                                                                : order.payment_status === 'pending'
                                                                                ? 'bg-amber-500/10 text-amber-700'
                                                                                : 'bg-rose-500/10 text-rose-600'
                                                                        }`}
                                                                    >
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
                                                                <div className="text-sm font-black text-slate-900 dark:text-white">
                                                                    {currency} {Number(order.total_amount).toLocaleString()}
                                                                </div>
                                                                <div className="text-[11px] text-[#154F7C] dark:text-sky-400 font-mono font-semibold">
                                                                    {ticketCount} {ticketCount === 1 ? 'pass' : 'passes'}
                                                                </div>
                                                            </div>
                                                            {isExpanded ? (
                                                                <ChevronUp className="w-4 h-4 text-slate-400" />
                                                            ) : (
                                                                <ChevronDown className="w-4 h-4 text-slate-400" />
                                                            )}
                                                        </div>
                                                    </div>

                                                    {isExpanded && order.tickets && order.tickets.length > 0 && (
                                                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/[0.06] space-y-2.5">
                                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                                <span className="text-[11px] font-bold text-slate-500">
                                                                    Passes in this order ({order.tickets.length})
                                                                </span>
                                                                <div className="flex items-center gap-2">
                                                                    <a
                                                                        href={route('events.tickets.printSheet', { event: selectedEvent.id, order_id: order.id })}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-500/10 text-[#154F7C] dark:text-sky-300 border border-sky-200/70 dark:border-sky-500/20 text-[11px] font-bold hover:bg-sky-100 transition"
                                                                    >
                                                                        <Printer className="w-3 h-3" />
                                                                        <span>Print Tickets (A4)</span>
                                                                    </a>
                                                                    <a
                                                                        href={route('events.wristbands.print', { event: selectedEvent.id, order_id: order.id })}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-500/10 text-[#154F7C] dark:text-sky-300 border border-sky-200/70 dark:border-sky-500/20 text-[11px] font-bold hover:bg-sky-100 transition"
                                                                    >
                                                                        <Printer className="w-3 h-3" />
                                                                        <span>Print Wristbands (A4)</span>
                                                                    </a>
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                {order.tickets.map((t) => (
                                                                    <div
                                                                        key={t.id}
                                                                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#08121E] border border-slate-200/60 dark:border-white/[0.06] flex items-center justify-between text-xs"
                                                                    >
                                                                        <div>
                                                                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                                                                <span>{t.attendee_name || order.buyer_name}</span>
                                                                                <span className="text-[10px] text-[#154F7C] dark:text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full font-mono">
                                                                                    {t.ticket_tier?.name || 'Ticket'}
                                                                                </span>
                                                                            </div>
                                                                            <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                                                                                {t.ticket_number}
                                                                            </div>
                                                                        </div>

                                                                        <a
                                                                            href={route('tickets.publicPass', t.ticket_number)}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="px-2 py-1 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:text-[#154F7C] inline-flex items-center gap-1"
                                                                        >
                                                                            <span>View</span>
                                                                            <ExternalLink className="w-3 h-3" />
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

                        {/* ══════════════════════════════════════════════════════════════
                            TAB 5: WRISTBAND PRINTING (CLEAN 2-CHOICE LAYOUT)
                           ══════════════════════════════════════════════════════════════ */}
                        {activeTab === 'wristbands' && (
                            <div className="bg-white dark:bg-[#0B1524] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs p-5 sm:p-6 space-y-6">
                                <div className="border-b border-slate-100 dark:border-white/[0.08] pb-4">
                                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                                        Wristbands
                                    </h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        Choose between printing instant A4 Tyvek wristband sheets yourself or ordering factory-manufactured bands delivered to your venue.
                                    </p>
                                </div>

                                {/* 2 Clear Side-by-Side Options (Kardovo Theme & Colors) */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Option A: DIY Print Studio */}
                                    <div className="p-6 rounded-2xl bg-white dark:bg-[#111D30] border border-slate-200/80 dark:border-white/[0.08] shadow-xs hover:shadow-md hover:border-[#154F7C]/30 transition-all duration-200 flex flex-col justify-between">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="w-11 h-11 rounded-xl bg-sky-500/10 dark:bg-sky-500/20 text-[#154F7C] dark:text-sky-300 flex items-center justify-center border border-sky-500/20">
                                                    <Printer className="w-5 h-5" />
                                                </div>
                                                <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#154F7C] dark:text-sky-400">
                                                    Instant · DIY Print
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                                                    Print wristbands yourself
                                                </h3>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                                                    Open the Wristband Design Studio to pick festival themes, upload custom artwork, set role badges (VIP, Artist, Staff), and print 10 QR strips per A4 sheet.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="pt-5 mt-5 border-t border-slate-100 dark:border-white/[0.06]">
                                            <a
                                                href={route('events.wristbands.print', selectedEvent.id)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#154F7C] to-[#327FB5] hover:from-[#1A5C91] hover:to-[#3D8EC7] text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-md shadow-[#154F7C]/20 border border-sky-400/25 active:scale-[0.98] cursor-pointer"
                                            >
                                                <Palette className="w-4 h-4 text-white" />
                                                <span>Open Wristband Studio &amp; Print</span>
                                                <ArrowUpRight className="w-3.5 h-3.5 text-white/80" />
                                            </a>
                                        </div>
                                    </div>

                                    {/* Option B: Factory Production Order */}
                                    <div className="p-6 rounded-2xl bg-white dark:bg-[#111D30] border border-slate-200/80 dark:border-white/[0.08] shadow-xs hover:shadow-md hover:border-[#154F7C]/30 transition-all duration-200 flex flex-col justify-between">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="w-11 h-11 rounded-xl bg-sky-500/10 dark:bg-sky-500/20 text-[#154F7C] dark:text-sky-300 flex items-center justify-center border border-sky-500/20">
                                                    <Truck className="w-5 h-5" />
                                                </div>
                                                <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#154F7C] dark:text-sky-400">
                                                    Venue Delivery
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                                                    Order factory-printed wristbands
                                                </h3>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                                                    Order custom-branded Tyvek, waterproof Vinyl, debossed Silicone, or smart RFID woven fabric bands manufactured and delivered to your door.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="pt-5 mt-5 border-t border-slate-100 dark:border-white/[0.06]">
                                            <button
                                                type="button"
                                                onClick={() => setWristbandModalOpen(true)}
                                                className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-[#111D30] hover:bg-slate-50 dark:hover:bg-white/[0.05] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-xs font-bold flex items-center justify-center gap-2 transition shadow-2xs active:scale-[0.98] cursor-pointer"
                                            >
                                                <Plus className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                                <span>Order Custom Factory Wristbands</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Pre-Printed Bulk Wristband Stock Strip */}
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div>
                                        <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                                            Need pre-printed wristbands to sell at the door (no guest details needed)?
                                        </h3>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                            Generate a numbered batch (e.g. #001 – #100) with unique, gate-scannable QR codes in one click.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => openBulkModal('print_wristbands')}
                                        className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#111D30] hover:bg-slate-100 border border-slate-200 dark:border-white/10 text-xs font-bold text-[#154F7C] dark:text-sky-300 inline-flex items-center gap-1.5 shrink-0 transition cursor-pointer"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Generate Bulk Wristbands</span>
                                    </button>
                                </div>

                                {/* Only show orders table if orders exist */}
                                {selectedEventWristbandOrders.length > 0 && (
                                    <div className="pt-4 border-t border-slate-100 dark:border-white/[0.06]">
                                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                                            Your Factory Wristband Orders ({selectedEventWristbandOrders.length})
                                        </h3>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-xs">
                                                <thead>
                                                    <tr className="border-b border-slate-100 dark:border-white/[0.06] text-slate-400 uppercase tracking-wider text-[10px]">
                                                        <th className="pb-2.5 font-bold">Order #</th>
                                                        <th className="pb-2.5 font-bold">Material</th>
                                                        <th className="pb-2.5 font-bold">Quantity</th>
                                                        <th className="pb-2.5 font-bold">Est. Cost</th>
                                                        <th className="pb-2.5 font-bold">Contact</th>
                                                        <th className="pb-2.5 font-bold">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                                                    {selectedEventWristbandOrders.map((o) => (
                                                        <tr key={o.id}>
                                                            <td className="py-3 font-mono font-bold text-slate-900 dark:text-white">{o.order_number}</td>
                                                            <td className="py-3 font-semibold text-slate-700 dark:text-slate-300">{o.material_label}</td>
                                                            <td className="py-3 font-mono font-bold text-slate-900 dark:text-white">{Number(o.quantity).toLocaleString()} pcs</td>
                                                            <td className="py-3 font-mono font-bold text-[#154F7C] dark:text-sky-400">{Number(o.estimated_cost).toLocaleString()} TZS</td>
                                                            <td className="py-3 text-slate-500">{o.contact_name} ({o.contact_phone})</td>
                                                            <td className="py-3">
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-[#154F7C] dark:text-sky-300">
                                                                    {o.status_label}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ══════════════════════════════════════════════════════════════
                            TAB 6: DOOR POS & GATE SCANNER (CLEAN 2-CHOICE LAYOUT)
                           ══════════════════════════════════════════════════════════════ */}
                        {activeTab === 'pos' && (
                            <div className="bg-white dark:bg-[#0B1524] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs p-5 sm:p-6 space-y-6">
                                <div className="border-b border-slate-100 dark:border-white/[0.08] pb-4">
                                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                                        Scanner &amp; Door Sales
                                    </h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        Scan guest QR passes at the entrance or sell walk-up tickets at the door using any smartphone or rented 4G POS terminal.
                                    </p>
                                </div>

                                {/* 2 Clear Side-by-Side Options (Kardovo Theme & Colors) */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Option A: Instant Web/Mobile Gate Scanner & Cashier */}
                                    <div className="p-6 rounded-2xl bg-white dark:bg-[#111D30] border border-slate-200/80 dark:border-white/[0.08] shadow-xs hover:shadow-md hover:border-[#154F7C]/30 transition-all duration-200 flex flex-col justify-between">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="w-11 h-11 rounded-xl bg-sky-500/10 dark:bg-sky-500/20 text-[#154F7C] dark:text-sky-300 flex items-center justify-center border border-sky-500/20">
                                                    <QrCode className="w-5 h-5" />
                                                </div>
                                                <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#154F7C] dark:text-sky-400">
                                                    Instant · Any Phone/Laptop
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                                                    Scan tickets and sell at the door
                                                </h3>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                                                    Use any smartphone camera to scan QR codes at the gate, verify PIN codes, and issue instant walk-up tickets paid via Cash or Mobile Money.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="pt-5 mt-5 border-t border-slate-100 dark:border-white/[0.06]">
                                            <Link
                                                href={route('scanner.index', { event_id: selectedEvent.id })}
                                                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#154F7C] to-[#327FB5] hover:from-[#1A5C91] hover:to-[#3D8EC7] text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-md shadow-[#154F7C]/20 border border-sky-400/25 active:scale-[0.98] cursor-pointer"
                                            >
                                                <QrCode className="w-4 h-4 text-white" />
                                                <span>Open Gate Scanner &amp; Cashier</span>
                                                <ArrowUpRight className="w-3.5 h-3.5 text-white/80" />
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Option B: Physical 4G POS Terminal Request */}
                                    <div className="p-6 rounded-2xl bg-white dark:bg-[#111D30] border border-slate-200/80 dark:border-white/[0.08] shadow-xs hover:shadow-md hover:border-[#154F7C]/30 transition-all duration-200 flex flex-col justify-between">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="w-11 h-11 rounded-xl bg-sky-500/10 dark:bg-sky-500/20 text-[#154F7C] dark:text-sky-300 flex items-center justify-center border border-sky-500/20">
                                                    <Store className="w-5 h-5" />
                                                </div>
                                                <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#154F7C] dark:text-sky-400">
                                                    Hardware Rental
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                                                    Rent POS terminals
                                                </h3>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                                                    Need dedicated box-office terminals with built-in thermal receipt printers, 4G SIM connectivity, and card tap readers delivered to your venue?
                                                </p>
                                            </div>
                                        </div>
                                        <div className="pt-5 mt-5 border-t border-slate-100 dark:border-white/[0.06]">
                                            <button
                                                type="button"
                                                onClick={() => setPosModalOpen(true)}
                                                className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-[#111D30] hover:bg-slate-50 dark:hover:bg-white/[0.05] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-xs font-bold flex items-center justify-center gap-2 transition shadow-2xs active:scale-[0.98] cursor-pointer"
                                            >
                                                <Plus className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                                <span>Request POS Terminal Hardware</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Pre-Printed Door Ticket Stock Strip */}
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div>
                                        <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                                            Prefer pre-printed physical tickets or wristbands for cash sales at the door?
                                        </h3>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                            Generate 20, 50, or 100 numbered passes with unique QR codes — no guest names or phone numbers required.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => openBulkModal('print_tickets')}
                                        className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#111D30] hover:bg-slate-100 border border-slate-200 dark:border-white/10 text-xs font-bold text-[#154F7C] dark:text-sky-300 inline-flex items-center gap-1.5 shrink-0 transition cursor-pointer"
                                    >
                                        <Printer className="w-3.5 h-3.5" />
                                        <span>Generate &amp; Print Bulk Stock</span>
                                    </button>
                                </div>

                                {/* Only show requests table if requests exist */}
                                {selectedEventPosRequests.length > 0 && (
                                    <div className="pt-4 border-t border-slate-100 dark:border-white/[0.06]">
                                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                                            Your POS Hardware Requests ({selectedEventPosRequests.length})
                                        </h3>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-xs">
                                                <thead>
                                                    <tr className="border-b border-slate-100 dark:border-white/[0.06] text-slate-400 uppercase tracking-wider text-[10px]">
                                                        <th className="pb-2.5 font-bold">Request #</th>
                                                        <th className="pb-2.5 font-bold">Terminals</th>
                                                        <th className="pb-2.5 font-bold">Dates</th>
                                                        <th className="pb-2.5 font-bold">Venue</th>
                                                        <th className="pb-2.5 font-bold">Contact</th>
                                                        <th className="pb-2.5 font-bold">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                                                    {selectedEventPosRequests.map((r) => (
                                                        <tr key={r.id}>
                                                            <td className="py-3 font-mono font-bold text-slate-900 dark:text-white">{r.request_number}</td>
                                                            <td className="py-3 font-bold text-slate-800 dark:text-slate-200">{r.terminals_count} device{r.terminals_count === 1 ? '' : 's'}</td>
                                                            <td className="py-3 text-slate-500">{r.required_from_date ? String(r.required_from_date).slice(0, 10) : ''}</td>
                                                            <td className="py-3 text-slate-700 dark:text-slate-300">{r.venue_location}</td>
                                                            <td className="py-3 text-slate-500">{r.contact_name} ({r.contact_phone})</td>
                                                            <td className="py-3">
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300">
                                                                    {r.status_label}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ══════════════════════════════════════════════════════════════
                            TAB 7: PAYOUT ACCOUNT & 94% REVENUE SPLIT
                           ══════════════════════════════════════════════════════════════ */}
                        {activeTab === 'payout' && (
                            <div className="bg-white dark:bg-[#0B1524] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs p-5 sm:p-6">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                    {/* Left Column (5 cols): Revenue Summary & 94% Split */}
                                    <div className="lg:col-span-5 space-y-4">
                                        <div className="flex items-center justify-between gap-2">
                                            <h2 className="text-base font-bold text-slate-900 dark:text-white">
                                                Payouts &amp; Earnings
                                            </h2>
                                            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-500/10 text-[#154F7C] dark:text-sky-300 border border-sky-500/20">
                                                <ShieldCheck className="w-3.5 h-3.5" />
                                                <span>94% Share</span>
                                            </span>
                                        </div>

                                        <div className="space-y-2.5">
                                            <div className="p-4 rounded-xl bg-sky-50/60 dark:bg-sky-500/10 border border-sky-500/25 flex items-center justify-between">
                                                <div>
                                                    <div className="text-xs font-bold text-[#154F7C] dark:text-sky-300">Net Payout (94%)</div>
                                                    <div className="text-xl font-black text-[#154F7C] dark:text-sky-300 mt-0.5">
                                                        {currency} {(selectedEventStats?.total_organizer_net || 0).toLocaleString()}
                                                    </div>
                                                </div>
                                                <span className="text-xs font-mono font-black text-[#154F7C] dark:text-sky-300 bg-sky-500/15 px-2.5 py-1 rounded-lg">
                                                    94%
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2.5">
                                                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.06]">
                                                    <div className="text-[11px] font-semibold text-slate-500">Gross Sales (100%)</div>
                                                    <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                                                        {currency} {(selectedEventStats?.total_revenue || 0).toLocaleString()}
                                                    </div>
                                                </div>

                                                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.06]">
                                                    <div className="text-[11px] font-semibold text-slate-500">Platform Fee (6%)</div>
                                                    <div className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                                                        {currency} {(selectedEventStats?.total_platform_fee || 0).toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column (7 cols): Payout Destination Form */}
                                    <form
                                        onSubmit={handleSettingsSubmit}
                                        className="lg:col-span-7 p-5 rounded-2xl bg-slate-50/60 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.08] space-y-4 flex flex-col justify-between"
                                    >
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-white/[0.06] pb-3">
                                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                                    Payout Account
                                                </h3>
                                                {selectedEvent?.payout_account_number && (
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                        <span>Saved</span>
                                                    </span>
                                                )}
                                            </div>

                                            {/* Method Selector */}
                                            <div className="grid grid-cols-2 gap-2.5">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        settingsForm.setData({
                                                            ...settingsForm.data,
                                                            payout_method: 'mobile_money',
                                                            payout_provider: 'M-Pesa (Vodacom)',
                                                        })
                                                    }
                                                    className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                                                        settingsForm.data.payout_method === 'mobile_money'
                                                            ? 'bg-white dark:bg-[#111D30] border-[#154F7C] ring-2 ring-[#154F7C]/15 font-bold text-slate-900 dark:text-white'
                                                            : 'bg-white/60 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400'
                                                    }`}
                                                >
                                                    <Phone className="w-4 h-4 text-[#154F7C] dark:text-sky-400 shrink-0" />
                                                    <span className="text-xs font-bold">Mobile Money</span>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        settingsForm.setData({
                                                            ...settingsForm.data,
                                                            payout_method: 'bank',
                                                            payout_provider: 'CRDB Bank',
                                                        })
                                                    }
                                                    className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                                                        settingsForm.data.payout_method === 'bank'
                                                            ? 'bg-white dark:bg-[#111D30] border-[#154F7C] ring-2 ring-[#154F7C]/15 font-bold text-slate-900 dark:text-white'
                                                            : 'bg-white/60 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400'
                                                    }`}
                                                >
                                                    <Building2 className="w-4 h-4 text-[#154F7C] dark:text-sky-400 shrink-0" />
                                                    <span className="text-xs font-bold">Bank Account</span>
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div>
                                                    <InputLabel
                                                        value={settingsForm.data.payout_method === 'bank' ? 'Select Bank *' : 'Mobile Network *'}
                                                        className="text-xs font-bold"
                                                    />
                                                    <select
                                                        className="w-full text-xs mt-1 rounded-xl border-slate-300 dark:border-white/10 dark:bg-[#08121E] dark:text-white"
                                                        value={settingsForm.data.payout_provider}
                                                        onChange={(e) => settingsForm.setData('payout_provider', e.target.value)}
                                                    >
                                                        {settingsForm.data.payout_method === 'bank' ? (
                                                            <>
                                                                <option value="CRDB Bank">CRDB Bank</option>
                                                                <option value="NMB Bank">NMB Bank</option>
                                                                <option value="Stanbic Bank">Stanbic Bank</option>
                                                                <option value="Standard Chartered">Standard Chartered</option>
                                                                <option value="Absa Bank">Absa Bank</option>
                                                                <option value="KCB Bank">KCB Bank</option>
                                                                <option value="Exim Bank">Exim Bank</option>
                                                                <option value="Other Bank">Other Bank</option>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <option value="M-Pesa (Vodacom)">M-Pesa (Vodacom)</option>
                                                                <option value="TigoPesa (Yas)">TigoPesa (Yas)</option>
                                                                <option value="Airtel Money">Airtel Money</option>
                                                                <option value="HaloPesa">HaloPesa</option>
                                                            </>
                                                        )}
                                                    </select>
                                                </div>

                                                <div>
                                                    <InputLabel
                                                        value={settingsForm.data.payout_method === 'bank' ? 'Account Number *' : 'Phone Number *'}
                                                        className="text-xs font-bold"
                                                    />
                                                    <TextInput
                                                        type="text"
                                                        className="w-full text-xs mt-1 font-mono"
                                                        placeholder={settingsForm.data.payout_method === 'bank' ? '0150XXXXXXXXX' : '0754XXXXXX'}
                                                        value={settingsForm.data.payout_account_number}
                                                        onChange={(e) => settingsForm.setData('payout_account_number', e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div>
                                                    <InputLabel value="Registered Account Name *" className="text-xs font-bold" />
                                                    <TextInput
                                                        type="text"
                                                        className="w-full text-xs mt-1"
                                                        placeholder="Full Name or Company Name"
                                                        value={settingsForm.data.payout_account_name}
                                                        onChange={(e) => settingsForm.setData('payout_account_name', e.target.value)}
                                                        required
                                                    />
                                                </div>

                                                {settingsForm.data.payout_method === 'bank' && (
                                                    <div>
                                                        <InputLabel value="Bank Branch (Optional)" className="text-xs font-bold" />
                                                        <TextInput
                                                            type="text"
                                                            className="w-full text-xs mt-1"
                                                            placeholder="e.g. Azikiwe Branch"
                                                            value={settingsForm.data.payout_bank_branch}
                                                            onChange={(e) => settingsForm.setData('payout_bank_branch', e.target.value)}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="pt-3 border-t border-slate-200/70 dark:border-white/[0.06] flex items-center justify-end">
                                            <PrimaryButton type="submit" disabled={settingsForm.processing} className="text-xs px-5 py-2.5">
                                                {settingsForm.processing ? 'Saving...' : 'Save Payout Account'}
                                            </PrimaryButton>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    /* ══════════════════════════════════════════════════════════════
                       FIRST-TIME USER ONBOARDING EMPTY STATE
                       ══════════════════════════════════════════════════════════════ */
                    <div className="bg-white dark:bg-[#0B1524] rounded-2xl p-8 sm:p-14 border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
                        <div className="max-w-xl mx-auto space-y-8">
                            <div className="space-y-2">
                                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                    Sell tickets for your event
                                </h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                    Set up in about five minutes. Buyers pay by mobile money or card and receive a QR ticket instantly.
                                </p>
                            </div>

                            <ol className="space-y-4">
                                {[
                                    { title: 'Create your event', body: 'Name, date, venue and poster.' },
                                    { title: 'Add tickets and a payout account', body: 'Set prices, then tell us where to send your 94% share.' },
                                    { title: 'Open sales and share your link', body: 'Scan guests in at the gate on the day.' },
                                ].map((step, index) => (
                                    <li key={step.title} className="flex items-start gap-3.5">
                                        <span className="w-7 h-7 rounded-full bg-[#154F7C] text-white text-xs font-bold flex items-center justify-center shrink-0">
                                            {index + 1}
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
                                onClick={() => setOccasionModalOpen(true)}
                                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#154F7C] hover:bg-[#114064] text-white font-bold text-sm shadow-sm transition active:scale-[0.98] cursor-pointer"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Create Event</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ══════════════════════════════════════════════════════════════
                MODALS
               ══════════════════════════════════════════════════════════════ */}

            {/* Modal 1: Add / Edit Ticket Type */}
            <Modal show={tierModalOpen} onClose={() => setTierModalOpen(false)} maxWidth="md">
                <form onSubmit={handleTierSubmit} className="p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] pb-3">
                        <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-[#154F7C] dark:text-sky-400" />
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                {editingTier ? 'Edit Ticket Type' : 'Create Ticket Type'}
                            </h3>
                        </div>
                        <button
                            type="button"
                            onClick={() => setTierModalOpen(false)}
                            className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
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
                                placeholder="e.g. Regular, VIP, Early Bird"
                                value={tierForm.data.name}
                                onChange={(e) => tierForm.setData('name', e.target.value)}
                                required
                            />
                            <InputError message={tierForm.errors.name} className="mt-1" />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <div className="flex items-center justify-between">
                                    <InputLabel htmlFor="tier_price" value={`Price (${currency}) *`} className="text-xs font-bold" />
                                    <button
                                        type="button"
                                        onClick={() => tierForm.setData('price', Number(tierForm.data.price) === 0 ? 15000 : 0)}
                                        className="text-[10px] font-bold text-[#154F7C] dark:text-sky-400 hover:underline cursor-pointer"
                                    >
                                        {Number(tierForm.data.price) === 0 ? '✓ Free Ticket' : 'Set as Free'}
                                    </button>
                                </div>
                                <TextInput
                                    id="tier_price"
                                    type="number"
                                    min="0"
                                    step="100"
                                    className="w-full text-xs font-mono mt-1"
                                    value={tierForm.data.price}
                                    onChange={(e) => tierForm.setData('price', e.target.value)}
                                    required
                                />
                                <InputError message={tierForm.errors.price} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="tier_capacity" value="Total Capacity (Seats) *" className="text-xs font-bold" />
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
                                    <option value="hidden">Hidden</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="tier_desc" value="Included Perks / Description (Optional)" className="text-xs font-bold" />
                            <textarea
                                id="tier_desc"
                                rows={2}
                                className="w-full text-xs mt-1 rounded-xl border-slate-300 dark:border-white/10 dark:bg-[#08121E] dark:text-white"
                                placeholder="e.g. Front-row access + complimentary welcome drink"
                                value={tierForm.data.description}
                                onChange={(e) => tierForm.setData('description', e.target.value)}
                            />
                        </div>

                        <div>
                            <InputLabel value="Badge Color" className="text-xs font-bold mb-1.5" />
                            <div className="flex items-center gap-2">
                                {['#154F7C', '#0284C7', '#059669', '#D97706', '#E11D48', '#7C3AED', '#0F172A'].map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => tierForm.setData('color', c)}
                                        className={`w-6 h-6 rounded-full transition cursor-pointer ${
                                            tierForm.data.color === c ? 'ring-2 ring-offset-2 ring-[#154F7C] scale-110' : 'opacity-75 hover:opacity-100'
                                        }`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
                        <SecondaryButton type="button" onClick={() => setTierModalOpen(false)} className="text-xs">
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton type="submit" disabled={tierForm.processing} className="text-xs">
                            {tierForm.processing ? 'Saving...' : editingTier ? 'Save Changes' : 'Create Tier'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal 2: Event & Storefront Settings (Focused & Without Duplicate Payout Form) */}
            <Modal show={settingsModalOpen} onClose={() => setSettingsModalOpen(false)} maxWidth="xl">
                <form onSubmit={handleSettingsSubmit} className="bg-white dark:bg-[#0B1524] text-slate-900 dark:text-white overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/[0.08]">
                        <div className="flex items-center gap-2.5">
                            <Settings className="w-4 h-4 text-[#154F7C] dark:text-sky-400" />
                            <div>
                                <h3 className="text-sm font-bold">Event &amp; Storefront Settings</h3>
                                <p className="text-[11px] text-slate-500">Poster artwork, sales status, currency, and buyer notes.</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setSettingsModalOpen(false)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                        {/* Visibility Switches */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.08]">
                                <div className="pr-3">
                                    <div className="text-xs font-bold">Enable Ticket Sales</div>
                                    <div className="text-[11px] text-slate-500">Allow buyers to purchase online</div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={settingsForm.data.ticketing_enabled}
                                        onChange={(e) => settingsForm.setData('ticketing_enabled', e.target.checked)}
                                    />
                                    <div className="w-10 h-5 bg-slate-300 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#154F7C]" />
                                </label>
                            </div>

                            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.08]">
                                <div className="pr-3">
                                    <div className="text-xs font-bold">Public Marketplace</div>
                                    <div className="text-[11px] text-slate-500">Show on Kardovo public directory</div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={settingsForm.data.is_public}
                                        onChange={(e) => settingsForm.setData('is_public', e.target.checked)}
                                    />
                                    <div className="w-10 h-5 bg-slate-300 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#154F7C]" />
                                </label>
                            </div>
                        </div>

                        {/* Category, Currency & Deadline */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                                    <option value="fashion">Fashion &amp; Runway</option>
                                    <option value="corporate">Corporate Event</option>
                                    <option value="hotel">Hotel &amp; Getaway</option>
                                    <option value="nightlife">Nightlife &amp; Cruise</option>
                                    <option value="sports">Sports &amp; Match</option>
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
                                    <option value="TZS">TZS (Shilling)</option>
                                    <option value="USD">USD (Dollar)</option>
                                    <option value="KES">KES (Shilling)</option>
                                </select>
                            </div>

                            <div>
                                <InputLabel htmlFor="setting_deadline" value="Sales Close At" className="text-xs font-bold" />
                                <TextInput
                                    id="setting_deadline"
                                    type="datetime-local"
                                    className="w-full text-xs mt-1"
                                    value={settingsForm.data.ticket_sales_end_at}
                                    onChange={(e) => settingsForm.setData('ticket_sales_end_at', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Poster Upload */}
                        <div>
                            <InputLabel value="Event Poster / Flyer (3:4 Portrait)" className="text-xs font-bold mb-2" />
                            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.08] flex items-center gap-4">
                                {settingsCoverPreview ? (
                                    <div className="relative w-16 aspect-[3/4] rounded-lg overflow-hidden border border-slate-200 shrink-0">
                                        <img src={settingsCoverPreview} alt="Poster" className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="w-16 aspect-[3/4] rounded-lg border border-dashed border-slate-300 dark:border-white/15 flex items-center justify-center text-slate-400 shrink-0">
                                        <ImageIcon className="w-5 h-5" />
                                    </div>
                                )}
                                <div className="space-y-1.5">
                                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#08121E] text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 cursor-pointer">
                                        <Upload className="w-3.5 h-3.5 text-[#154F7C] dark:text-sky-400" />
                                        <span>{settingsCoverPreview ? 'Replace Poster' : 'Upload Poster'}</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    settingsForm.setData('cover_image', file);
                                                    setSettingsCoverPreview(URL.createObjectURL(file));
                                                }
                                            }}
                                        />
                                    </label>
                                    <p className="text-[11px] text-slate-500">
                                        Displayed on your public ticket storefront and marketplace listing.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Buyer Instructions */}
                        <div>
                            <InputLabel htmlFor="setting_instructions" value="Buyer Instructions / Gate Note" className="text-xs font-bold" />
                            <textarea
                                id="setting_instructions"
                                rows={2}
                                className="w-full text-xs mt-1 rounded-xl border-slate-300 dark:border-white/10 dark:bg-[#08121E] dark:text-white"
                                placeholder="e.g. Gates open at 6:00 PM. Please have your QR code ready for scanning."
                                value={settingsForm.data.ticket_instructions}
                                onChange={(e) => settingsForm.setData('ticket_instructions', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 dark:border-white/[0.08] bg-slate-50/70 dark:bg-white/[0.01]">
                        <SecondaryButton type="button" onClick={() => setSettingsModalOpen(false)} className="text-xs">
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton type="submit" disabled={settingsForm.processing} className="text-xs">
                            {settingsForm.processing ? 'Saving...' : 'Save Settings'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal 3: Ticket Pass Design Studio */}
            <Modal show={passDesignerOpen} onClose={() => setPassDesignerOpen(false)} maxWidth="5xl">
                <form onSubmit={handlePassDesignSubmit} className="flex flex-col max-h-[90vh] bg-white dark:bg-[#0B1524]">
                    <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-100 dark:border-white/[0.08] shrink-0">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-500/10 text-[#154F7C] dark:text-sky-400 flex items-center justify-center border border-sky-100 dark:border-sky-500/20">
                                <Palette className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Ticket Pass Design Studio
                                </h3>
                                <p className="text-[11px] text-slate-500">
                                    Customize your digital pass colors, flyer background, and QR gate stub.
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setPassDesignerOpen(false)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex flex-col lg:flex-row flex-1 overflow-y-auto lg:overflow-hidden">
                        {/* Left Preview */}
                        <div className="w-full lg:w-[55%] p-6 sm:p-8 bg-slate-100/80 dark:bg-[#070D18] flex items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-200/80 dark:border-white/[0.08] shrink-0">
                            {(() => {
                                const hex = (passDesignForm.data.right_bg_color || '#FFFFFF').replace('#', '');
                                let isDesignerStubDark = false;
                                if (hex.length === 6) {
                                    const r = parseInt(hex.substring(0, 2), 16);
                                    const g = parseInt(hex.substring(2, 4), 16);
                                    const b = parseInt(hex.substring(4, 6), 16);
                                    isDesignerStubDark = (r * 299 + g * 587 + b * 114) / 1000 < 140;
                                }

                                return (
                                    <div className="w-full max-w-md">
                                        <div
                                            className="relative rounded-[22px] flex flex-row items-stretch overflow-hidden shadow-xl select-none min-h-[180px]"
                                            style={{ backgroundColor: passDesignForm.data.left_bg_color || '#1e1b4b' }}
                                        >
                                            <div
                                                className="flex-1 p-4 sm:p-5 relative overflow-hidden flex flex-col justify-between"
                                                style={{ backgroundColor: passDesignForm.data.left_bg_color || '#1e1b4b' }}
                                            >
                                                {passDesignForm.data.left_design_mode === 'custom' && customDesignPreview && (
                                                    <div
                                                        className="absolute inset-0 bg-cover bg-center pointer-events-none"
                                                        style={{ backgroundImage: `url(${customDesignPreview})` }}
                                                    />
                                                )}

                                                {(passDesignForm.data.left_design_mode === 'default' || Boolean(passDesignForm.data.show_event_details)) && (
                                                    <>
                                                        <div className="relative z-10 space-y-2">
                                                            <h4 className="text-sm sm:text-base font-black tracking-tight text-white uppercase leading-snug line-clamp-2">
                                                                {selectedEvent?.title || 'Event Title'}
                                                            </h4>

                                                            <div className="inline-flex items-center gap-1.5 bg-black/25 backdrop-blur-md p-1 rounded-lg w-fit border border-white/10">
                                                                <span
                                                                    className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider text-slate-950"
                                                                    style={{ backgroundColor: passDesignForm.data.accent_color || '#FABF24' }}
                                                                >
                                                                    {passDesignForm.data.badge_text || 'OFFICIAL PASS'}
                                                                </span>
                                                                <span className="text-[10px] font-bold text-white pr-2">
                                                                    {selectedEventTiers?.[0]?.name || 'Standard'}
                                                                </span>
                                                            </div>

                                                            <div className="space-y-0.5 text-[9.5px] font-mono font-bold pt-0.5">
                                                                <div className="flex items-center gap-1.5" style={{ color: passDesignForm.data.accent_color || '#FABF24' }}>
                                                                    <Calendar className="w-3 h-3 shrink-0" />
                                                                    <span>{formatTicketDate(selectedEvent?.event_date)}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1.5 text-slate-300 font-sans font-medium">
                                                                    <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                                                                    <span className="truncate">{selectedEvent?.venue || 'Main Venue'}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="relative z-10 pt-2.5 mt-3 border-t border-white/10 grid grid-cols-3 gap-2 text-[8.5px] font-mono">
                                                            <div>
                                                                <span className="text-[7px] uppercase text-white/50 font-semibold block">PRICE</span>
                                                                <span className="font-bold text-emerald-300 block">
                                                                    {selectedEventTiers?.[0]?.price ? `${Number(selectedEventTiers[0].price).toLocaleString()} ${currency}` : '25,000 TZS'}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span className="text-[7px] uppercase text-white/50 font-semibold block">ACCESS</span>
                                                                <span className="font-medium text-white truncate block">Main Gate</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-[7px] uppercase text-white/50 font-semibold block">PASS #</span>
                                                                <span className="font-bold block truncate" style={{ color: passDesignForm.data.accent_color || '#FABF24' }}>#TK-1001</span>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            {/* Perforation */}
                                            <div className="relative w-0 self-stretch border-r-2 border-dotted border-slate-300 shrink-0 z-20" />

                                            {/* Right QR Stub */}
                                            <div
                                                className="w-32 sm:w-36 p-3 flex flex-col justify-center items-center text-center shrink-0"
                                                style={{ backgroundColor: passDesignForm.data.right_bg_color || '#FFFFFF' }}
                                            >
                                                <div className="flex flex-col items-center w-full gap-1.5">
                                                    <div className={`w-full px-2 py-1 rounded-lg border text-center ${
                                                        isDesignerStubDark ? 'bg-white/10 border-white/10 text-white' : 'bg-slate-50 border-slate-100 text-slate-900'
                                                    }`}>
                                                        <span className="text-[6.5px] font-mono font-bold tracking-widest text-slate-400 uppercase block">
                                                            PASS HOLDER
                                                        </span>
                                                        <span className="text-[10px] font-black truncate block">
                                                            Sample Guest
                                                        </span>
                                                    </div>

                                                    <div className="p-1.5 bg-white rounded-xl border border-slate-100">
                                                        <QrCode className="w-12 h-12 text-slate-900" />
                                                    </div>

                                                    <div>
                                                        <span className="text-[6.5px] font-mono tracking-widest text-slate-400 uppercase block">
                                                            PIN CODE
                                                        </span>
                                                        <div className={`text-xs font-mono font-black ${isDesignerStubDark ? 'text-white' : 'text-slate-900'}`}>
                                                            56648880
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Right Controls */}
                        <div className="w-full lg:w-[45%] flex flex-col justify-between bg-white dark:bg-[#0B1524]">
                            <div className="p-4 border-b border-slate-100 dark:border-white/[0.08]">
                                <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-white/[0.04]">
                                    <button
                                        type="button"
                                        onClick={() => setDesignerTab('card')}
                                        className={`py-1.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
                                            designerTab === 'card'
                                                ? 'bg-white dark:bg-[#111C2E] text-slate-900 dark:text-white shadow-2xs'
                                                : 'text-slate-500 hover:text-slate-800'
                                        }`}
                                    >
                                        1. Left Pass Body
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDesignerTab('stub')}
                                        className={`py-1.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
                                            designerTab === 'stub'
                                                ? 'bg-white dark:bg-[#111C2E] text-slate-900 dark:text-white shadow-2xs'
                                                : 'text-slate-500 hover:text-slate-800'
                                        }`}
                                    >
                                        2. Right QR Stub
                                    </button>
                                </div>
                            </div>

                            <div className="p-5 space-y-4 overflow-y-auto flex-1">
                                {designerTab === 'card' ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-2.5">
                                            <button
                                                type="button"
                                                onClick={() => passDesignForm.setData('left_design_mode', 'default')}
                                                className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                                                    passDesignForm.data.left_design_mode === 'default'
                                                        ? 'border-[#154F7C] bg-sky-50/40 dark:bg-sky-500/10 font-bold'
                                                        : 'border-slate-200 dark:border-white/10'
                                                }`}
                                            >
                                                <div className="text-xs font-bold">Solid Theme</div>
                                                <div className="text-[10px] text-slate-400 font-normal">Clean color &amp; details</div>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => passDesignForm.setData('left_design_mode', 'custom')}
                                                className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                                                    passDesignForm.data.left_design_mode === 'custom'
                                                        ? 'border-[#154F7C] bg-sky-50/40 dark:bg-sky-500/10 font-bold'
                                                        : 'border-slate-200 dark:border-white/10'
                                                }`}
                                            >
                                                <div className="text-xs font-bold">Custom Flyer</div>
                                                <div className="text-[10px] text-slate-400 font-normal">Upload artwork image</div>
                                            </button>
                                        </div>

                                        {passDesignForm.data.left_design_mode === 'custom' && (
                                            <div className="p-3 rounded-xl border border-dashed border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-white/[0.02]">
                                                <label className="flex items-center justify-center gap-2 text-xs font-bold text-[#154F7C] dark:text-sky-400 cursor-pointer py-2">
                                                    <Upload className="w-4 h-4" />
                                                    <span>{customDesignPreview ? 'Change Uploaded Flyer' : 'Upload Pass Artwork'}</span>
                                                    <input type="file" accept="image/*" className="hidden" onChange={handleCustomDesignFile} />
                                                </label>
                                            </div>
                                        )}

                                        <div>
                                            <label className="text-xs font-bold block mb-1.5">Pass Background Color</label>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {['#1e1b4b', '#154F7C', '#0f172a', '#064e3b', '#7c2d12', '#701a75', '#881337'].map((c) => (
                                                    <button
                                                        key={c}
                                                        type="button"
                                                        onClick={() => passDesignForm.setData('left_bg_color', c)}
                                                        className={`w-7 h-7 rounded-lg border transition cursor-pointer ${
                                                            passDesignForm.data.left_bg_color === c ? 'ring-2 ring-[#154F7C] scale-110' : 'border-black/10'
                                                        }`}
                                                        style={{ backgroundColor: c }}
                                                    />
                                                ))}
                                                <input
                                                    type="color"
                                                    value={passDesignForm.data.left_bg_color || '#1e1b4b'}
                                                    onChange={(e) => passDesignForm.setData('left_bg_color', e.target.value)}
                                                    className="w-7 h-7 rounded border-0 cursor-pointer p-0"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold block mb-1.5">Badge &amp; Accent Color</label>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {['#FABF24', '#38BDF8', '#34D399', '#F472B6', '#A78BFA', '#FB923C', '#FFFFFF'].map((c) => (
                                                    <button
                                                        key={c}
                                                        type="button"
                                                        onClick={() => passDesignForm.setData('accent_color', c)}
                                                        className={`w-7 h-7 rounded-lg border transition cursor-pointer ${
                                                            passDesignForm.data.accent_color === c ? 'ring-2 ring-[#154F7C] scale-110' : 'border-black/15'
                                                        }`}
                                                        style={{ backgroundColor: c }}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <InputLabel value="Badge Label" className="text-xs font-bold" />
                                            <TextInput
                                                type="text"
                                                className="w-full text-xs mt-1"
                                                placeholder="OFFICIAL PASS"
                                                value={passDesignForm.data.badge_text}
                                                onChange={(e) => passDesignForm.setData('badge_text', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-bold block mb-1.5">QR Stub Background</label>
                                            <div className="flex items-center gap-2">
                                                {[
                                                    { hex: '#FFFFFF', label: 'White' },
                                                    { hex: '#F8FAFC', label: 'Slate' },
                                                    { hex: '#0F172A', label: 'Dark' },
                                                ].map((s) => (
                                                    <button
                                                        key={s.hex}
                                                        type="button"
                                                        onClick={() => passDesignForm.setData('right_bg_color', s.hex)}
                                                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer ${
                                                            passDesignForm.data.right_bg_color === s.hex
                                                                ? 'border-[#154F7C] ring-2 ring-[#154F7C]/20'
                                                                : 'border-slate-200'
                                                        }`}
                                                    >
                                                        {s.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 border-t border-slate-100 dark:border-white/[0.08] bg-slate-50/60 dark:bg-white/[0.02] flex items-center justify-end gap-2">
                                <SecondaryButton type="button" onClick={() => setPassDesignerOpen(false)} className="text-xs">
                                    Cancel
                                </SecondaryButton>
                                <PrimaryButton type="submit" disabled={passDesignForm.processing} className="text-xs">
                                    {passDesignForm.processing ? 'Saving...' : 'Save Pass Design'}
                                </PrimaryButton>
                            </div>
                        </div>
                    </div>
                </form>
            </Modal>

            {/* Modal 4: Create New Ticketed Event / Occasion */}
            <Modal show={occasionModalOpen} onClose={() => setOccasionModalOpen(false)} maxWidth="lg">
                <form onSubmit={handleOccasionSubmit} className="p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] pb-3">
                        <div className="flex items-center gap-2">
                            <Ticket className="w-4 h-4 text-[#154F7C] dark:text-sky-400" />
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                Create New Ticketed Event
                            </h3>
                        </div>
                        <button
                            type="button"
                            onClick={() => setOccasionModalOpen(false)}
                            className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="space-y-3.5 max-h-[72vh] overflow-y-auto pr-1">
                        <div>
                            <InputLabel htmlFor="occasion_title" value="Event Title *" className="text-xs font-bold" />
                            <TextInput
                                id="occasion_title"
                                type="text"
                                className="w-full text-xs mt-1"
                                placeholder="e.g. Serengeti Music & Cultural Festival 2026"
                                value={occasionForm.data.title}
                                onChange={(e) => occasionForm.setData('title', e.target.value)}
                                required
                            />
                            <InputError message={occasionForm.errors.title} className="mt-1" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <InputLabel value="Event Category *" className="text-xs font-bold" />
                                <select
                                    className="w-full text-xs mt-1 rounded-xl border-slate-300 dark:border-white/10 dark:bg-[#08121E] dark:text-white"
                                    value={occasionForm.data.occasion_type}
                                    onChange={(e) => occasionForm.setData('occasion_type', e.target.value)}
                                >
                                    {occasionCategories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <InputLabel htmlFor="event_date" value="Event Date *" className="text-xs font-bold" />
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
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <InputLabel htmlFor="occasion_venue" value="Venue *" className="text-xs font-bold" />
                                <TextInput
                                    id="occasion_venue"
                                    type="text"
                                    placeholder="e.g. Mlimani City Hall"
                                    className="w-full text-xs mt-1"
                                    value={occasionForm.data.venue}
                                    onChange={(e) => occasionForm.setData('venue', e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="occasion_city" value="City" className="text-xs font-bold" />
                                <TextInput
                                    id="occasion_city"
                                    type="text"
                                    className="w-full text-xs mt-1"
                                    value={occasionForm.data.city}
                                    onChange={(e) => occasionForm.setData('city', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* First Ticket Type */}
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.08] space-y-2.5">
                            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                First Ticket Type (You can add more later)
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
                                        className="w-full text-xs font-mono mt-1"
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

                        {/* Poster Upload */}
                        <div>
                            <InputLabel value="Event Poster (Optional)" className="text-xs font-bold mb-1.5" />
                            <div className="flex items-center gap-3">
                                {coverUploadPreview && (
                                    <img src={coverUploadPreview} alt="Poster" className="w-14 aspect-[3/4] object-cover rounded-lg border" />
                                )}
                                <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 cursor-pointer">
                                    <Upload className="w-3.5 h-3.5 text-[#154F7C] dark:text-sky-400" />
                                    <span>{coverUploadPreview ? 'Change Poster' : 'Upload Poster Image'}</span>
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
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
                        <SecondaryButton type="button" onClick={() => setOccasionModalOpen(false)} className="text-xs">
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton type="submit" disabled={occasionForm.processing} className="text-xs">
                            {occasionForm.processing ? 'Creating...' : 'Create Event'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal 5: Delete Tier Confirmation */}
            <ConfirmationModal
                show={deleteModal.show}
                title={deleteModal.tier?.sold_count > 0 ? `Pause Sales for ${deleteModal.tier?.name}?` : `Delete ${deleteModal.tier?.name}?`}
                message={
                    deleteModal.tier?.sold_count > 0
                        ? `${deleteModal.tier?.sold_count} attendees already hold passes under this tier. This will pause future sales while keeping existing passes valid.`
                        : 'Are you sure you want to permanently delete this ticket tier?'
                }
                confirmText={deleteModal.tier?.sold_count > 0 ? 'Pause Sales' : 'Yes, Delete Tier'}
                cancelText="Cancel"
                onConfirm={handleDeleteTier}
                loading={deleteModal.loading}
                variant={deleteModal.tier?.sold_count > 0 ? 'warning' : 'danger'}
                onClose={() => setDeleteModal({ show: false, tier: null, loading: false })}
            />

            {/* Modal 6: Multi-Channel Dispatch (WhatsApp, SMS, Email) */}
            <Modal show={dispatchModal.show} onClose={() => setDispatchModal(prev => ({ ...prev, show: false }))} maxWidth="sm">
                <form onSubmit={handleSendDispatch} className="p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] pb-3">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                            Send Pass via {dispatchModal.channel}
                        </h3>
                        <button
                            type="button"
                            onClick={() => setDispatchModal(prev => ({ ...prev, show: false }))}
                            className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="space-y-3">
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.08] text-xs">
                            <div className="font-bold text-slate-900 dark:text-white">{dispatchModal.ticket?.attendee_name}</div>
                            <div className="font-mono text-slate-400 text-[11px] mt-0.5">
                                #{dispatchModal.ticket?.ticket_number} • {dispatchModal.ticket?.ticket_tier?.name}
                            </div>
                        </div>

                        <div>
                            <InputLabel
                                htmlFor="dispatch_recipient"
                                value={dispatchModal.channel === 'email' ? 'Email Address *' : 'Phone Number *'}
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
                            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-medium flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 shrink-0" />
                                <span>{dispatchModal.successMessage}</span>
                            </div>
                        )}

                        {dispatchModal.errorMessage && (
                            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{dispatchModal.errorMessage}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
                        <SecondaryButton type="button" onClick={() => setDispatchModal(prev => ({ ...prev, show: false }))} className="text-xs">
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton type="submit" disabled={dispatchModal.loading} className="text-xs">
                            {dispatchModal.loading ? 'Sending...' : `Send ${dispatchModal.channel?.toUpperCase()}`}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal 7: Create / Edit Promo Code */}
            <Modal show={discountModalOpen} onClose={() => setDiscountModalOpen(false)} maxWidth="md">
                <form onSubmit={handleSaveDiscount} className="p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] pb-3">
                        <div className="flex items-center gap-2">
                            <Percent className="w-4 h-4 text-[#154F7C] dark:text-sky-400" />
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                {editingDiscount ? `Edit Promo Code: ${editingDiscount.code}` : 'Create Promo Code'}
                            </h3>
                        </div>
                        <button
                            type="button"
                            onClick={() => setDiscountModalOpen(false)}
                            className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="space-y-3 text-xs">
                        <div>
                            <InputLabel htmlFor="discount_code" value="Promo Code *" className="font-bold" />
                            <TextInput
                                id="discount_code"
                                type="text"
                                className="w-full text-xs font-mono uppercase mt-1 font-bold"
                                placeholder="e.g. EARLYBIRD20 or VIP10K"
                                value={discountForm.data.code}
                                onChange={(e) => discountForm.setData('code', e.target.value.toUpperCase())}
                                required
                            />
                            {discountForm.errors.code && <p className="text-[11px] text-red-500 mt-1">{discountForm.errors.code}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <InputLabel htmlFor="discount_type" value="Discount Type *" className="font-bold" />
                                <select
                                    id="discount_type"
                                    className="w-full text-xs mt-1 rounded-xl border-slate-300 dark:border-white/10 dark:bg-[#08121E] dark:text-white"
                                    value={discountForm.data.discount_type}
                                    onChange={(e) => discountForm.setData('discount_type', e.target.value)}
                                >
                                    <option value="percentage">Percentage (% Off)</option>
                                    <option value="fixed">Fixed Amount ({currency} Off)</option>
                                </select>
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="discount_value"
                                    value={discountForm.data.discount_type === 'percentage' ? 'Percentage (% Off) *' : `Amount (${currency} Off) *`}
                                    className="font-bold"
                                />
                                <TextInput
                                    id="discount_value"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    className="w-full text-xs mt-1 font-mono"
                                    placeholder={discountForm.data.discount_type === 'percentage' ? '20' : '5000'}
                                    value={discountForm.data.discount_value}
                                    onChange={(e) => discountForm.setData('discount_value', e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <InputLabel htmlFor="max_uses" value="Max Redemptions (Optional)" className="font-bold" />
                                <TextInput
                                    id="max_uses"
                                    type="number"
                                    min="1"
                                    className="w-full text-xs mt-1 font-mono"
                                    placeholder="Unlimited"
                                    value={discountForm.data.max_uses}
                                    onChange={(e) => discountForm.setData('max_uses', e.target.value)}
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="discount_expires_at" value="Expiry Date (Optional)" className="font-bold" />
                                <TextInput
                                    id="discount_expires_at"
                                    type="date"
                                    className="w-full text-xs mt-1 font-mono"
                                    value={discountForm.data.expires_at}
                                    onChange={(e) => discountForm.setData('expires_at', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
                        <SecondaryButton type="button" onClick={() => setDiscountModalOpen(false)} className="text-xs">
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton type="submit" disabled={discountForm.processing} className="text-xs">
                            {discountForm.processing ? 'Saving...' : editingDiscount ? 'Update Code' : 'Create Code'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal 8: Order Factory-Printed Wristbands */}
            <Modal show={wristbandModalOpen} onClose={() => setWristbandModalOpen(false)} maxWidth="md">
                <form onSubmit={handleOrderWristbands} className="p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] pb-3">
                        <div className="flex items-center gap-2">
                            <Scissors className="w-4 h-4 text-[#154F7C] dark:text-sky-400" />
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                Order Factory-Printed Wristbands
                            </h3>
                        </div>
                        <button
                            type="button"
                            onClick={() => setWristbandModalOpen(false)}
                            className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="space-y-3 text-xs">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <InputLabel htmlFor="wb_material" value="Material Type *" className="font-bold" />
                                <select
                                    id="wb_material"
                                    className="w-full text-xs mt-1 rounded-xl border-slate-300 dark:border-white/10 dark:bg-[#08121E] dark:text-white"
                                    value={wristbandForm.data.material_type}
                                    onChange={(e) => wristbandForm.setData('material_type', e.target.value)}
                                >
                                    <option value="tyvek">Tyvek (Tamper-evident) ~ 350 TZS</option>
                                    <option value="fabric_woven">Woven Fabric (RFID) ~ 1,200 TZS</option>
                                    <option value="vinyl">Vinyl Waterproof ~ 800 TZS</option>
                                    <option value="silicone">Silicone Debossed ~ 1,500 TZS</option>
                                </select>
                            </div>

                            <div>
                                <InputLabel htmlFor="wb_qty" value="Quantity (Pcs) *" className="font-bold" />
                                <TextInput
                                    id="wb_qty"
                                    type="number"
                                    min="50"
                                    step="50"
                                    className="w-full text-xs mt-1 font-mono font-bold"
                                    value={wristbandForm.data.quantity}
                                    onChange={(e) => wristbandForm.setData('quantity', e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="wb_text" value="Custom Printed Text *" className="font-bold" />
                            <TextInput
                                id="wb_text"
                                type="text"
                                className="w-full text-xs mt-1 font-bold"
                                placeholder="e.g. SERENGETI MUSIC FESTIVAL 2026 • VIP"
                                value={wristbandForm.data.custom_text}
                                onChange={(e) => wristbandForm.setData('custom_text', e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <InputLabel htmlFor="wb_name" value="Contact Name *" className="font-bold" />
                                <TextInput
                                    id="wb_name"
                                    type="text"
                                    className="w-full text-xs mt-1"
                                    value={wristbandForm.data.contact_name}
                                    onChange={(e) => wristbandForm.setData('contact_name', e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="wb_phone" value="Phone Number *" className="font-bold" />
                                <TextInput
                                    id="wb_phone"
                                    type="tel"
                                    className="w-full text-xs mt-1 font-mono"
                                    placeholder="0754XXXXXX"
                                    value={wristbandForm.data.contact_phone}
                                    onChange={(e) => wristbandForm.setData('contact_phone', e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="wb_address" value="Venue / Delivery Address *" className="font-bold" />
                            <TextInput
                                id="wb_address"
                                type="text"
                                className="w-full text-xs mt-1"
                                placeholder="e.g. Mlimani City Conference Centre, Dar es Salaam"
                                value={wristbandForm.data.delivery_address}
                                onChange={(e) => wristbandForm.setData('delivery_address', e.target.value)}
                                required
                            />
                        </div>

                        <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-500/20 flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">Estimated Total:</span>
                            <span className="font-mono font-black text-[#154F7C] dark:text-sky-400 text-sm">
                                {(
                                    Number(wristbandForm.data.quantity || 0) *
                                    (wristbandForm.data.material_type === 'fabric_woven' ? 1200 : wristbandForm.data.material_type === 'vinyl' ? 800 : wristbandForm.data.material_type === 'silicone' ? 1500 : 350)
                                ).toLocaleString()}{' '}
                                TZS
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
                        <SecondaryButton type="button" onClick={() => setWristbandModalOpen(false)} className="text-xs">
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton type="submit" disabled={wristbandForm.processing} className="text-xs">
                            {wristbandForm.processing ? 'Submitting...' : 'Submit Wristband Order'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal 9: Request Point of Sale (POS) Hardware Terminal */}
            <Modal show={posModalOpen} onClose={() => setPosModalOpen(false)} maxWidth="md">
                <form onSubmit={handleRequestPos} className="p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] pb-3">
                        <div className="flex items-center gap-2">
                            <Store className="w-4 h-4 text-[#154F7C] dark:text-sky-400" />
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                Request Handheld POS Hardware
                            </h3>
                        </div>
                        <button
                            type="button"
                            onClick={() => setPosModalOpen(false)}
                            className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="space-y-3 text-xs">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <InputLabel htmlFor="pos_count" value="Number of Terminals *" className="font-bold" />
                                <TextInput
                                    id="pos_count"
                                    type="number"
                                    min="1"
                                    max="20"
                                    className="w-full text-xs mt-1 font-mono font-bold"
                                    value={posForm.data.terminals_count}
                                    onChange={(e) => posForm.setData('terminals_count', e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="pos_date" value="Event Date *" className="font-bold" />
                                <TextInput
                                    id="pos_date"
                                    type="date"
                                    className="w-full text-xs mt-1 font-mono"
                                    value={posForm.data.required_from_date}
                                    onChange={(e) => {
                                        posForm.setData({
                                            ...posForm.data,
                                            required_from_date: e.target.value,
                                            required_to_date: e.target.value,
                                        });
                                    }}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="pos_venue" value="Venue / Gate Location *" className="font-bold" />
                            <TextInput
                                id="pos_venue"
                                type="text"
                                className="w-full text-xs mt-1"
                                placeholder="e.g. Diamond Jubilee Hall, Main Gate"
                                value={posForm.data.venue_location}
                                onChange={(e) => posForm.setData('venue_location', e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <InputLabel htmlFor="pos_name" value="Contact Person *" className="font-bold" />
                                <TextInput
                                    id="pos_name"
                                    type="text"
                                    className="w-full text-xs mt-1"
                                    value={posForm.data.contact_name}
                                    onChange={(e) => posForm.setData('contact_name', e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="pos_phone" value="Contact Phone *" className="font-bold" />
                                <TextInput
                                    id="pos_phone"
                                    type="tel"
                                    className="w-full text-xs mt-1 font-mono"
                                    placeholder="0754XXXXXX"
                                    value={posForm.data.contact_phone}
                                    onChange={(e) => posForm.setData('contact_phone', e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="pos_notes" value="Setup Notes (Optional)" className="font-bold" />
                            <TextInput
                                id="pos_notes"
                                type="text"
                                className="w-full text-xs mt-1"
                                placeholder="e.g. Extra thermal receipt rolls"
                                value={posForm.data.notes}
                                onChange={(e) => posForm.setData('notes', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
                        <SecondaryButton type="button" onClick={() => setPosModalOpen(false)} className="text-xs">
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton type="submit" disabled={posForm.processing} className="text-xs">
                            {posForm.processing ? 'Submitting...' : 'Submit POS Request'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal 10: Generate & Print Bulk Tickets or Wristbands (No Guest Details Needed) */}
            <Modal show={bulkModalOpen} onClose={() => setBulkModalOpen(false)} maxWidth="md">
                <form onSubmit={handleGenerateBulk} className="p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] pb-3">
                        <div className="flex items-center gap-2">
                            <Printer className="w-4 h-4 text-[#154F7C] dark:text-sky-400" />
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Generate &amp; Print Bulk Stock
                                </h3>
                                <p className="text-[11px] text-slate-500">
                                    No guest names or phone numbers needed — auto-numbered with unique QR codes.
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setBulkModalOpen(false)}
                            className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="space-y-4 text-xs">
                        {/* 1. Ticket Type */}
                        <div>
                            <InputLabel htmlFor="bulk_tier_id" value="1. Choose Ticket Type *" className="font-bold" />
                            <select
                                id="bulk_tier_id"
                                className="w-full text-xs mt-1 rounded-xl border-slate-300 dark:border-white/10 dark:bg-[#08121E] dark:text-white font-semibold"
                                value={bulkForm.data.tier_id}
                                onChange={(e) => bulkForm.setData('tier_id', e.target.value)}
                                required
                            >
                                {selectedEventTiers.map((tr) => (
                                    <option key={tr.id} value={tr.id}>
                                        {tr.name} — {currency} {Number(tr.price || 0).toLocaleString()} ({tr.remaining_count ?? tr.capacity} remaining)
                                    </option>
                                ))}
                            </select>
                            <InputError message={bulkForm.errors.tier_id} className="mt-1" />
                        </div>

                        {/* 2. Quantity */}
                        <div>
                            <InputLabel htmlFor="bulk_quantity" value="2. How Many Passes? *" className="font-bold" />
                            <div className="grid grid-cols-5 gap-1.5 mt-1 mb-2">
                                {[10, 20, 50, 100, 200].map((n) => (
                                    <button
                                        key={n}
                                        type="button"
                                        onClick={() => bulkForm.setData('quantity', n)}
                                        className={`py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                                            Number(bulkForm.data.quantity) === n
                                                ? 'border-[#154F7C] bg-[#154F7C] text-white'
                                                : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] text-slate-700 dark:text-slate-300 hover:border-slate-300'
                                        }`}
                                    >
                                        {n}
                                    </button>
                                ))}
                            </div>
                            <TextInput
                                id="bulk_quantity"
                                type="number"
                                min="1"
                                max="500"
                                className="w-full text-xs font-mono font-bold"
                                value={bulkForm.data.quantity}
                                onChange={(e) => bulkForm.setData('quantity', e.target.value)}
                                required
                            />
                            <InputError message={bulkForm.errors.quantity} className="mt-1" />
                        </div>

                        {/* 3. Print Format */}
                        <div>
                            <InputLabel value="3. What Would You Like to Print?" className="font-bold mb-1.5" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => bulkForm.setData('redirect_to', 'print_tickets')}
                                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                                        bulkForm.data.redirect_to === 'print_tickets'
                                            ? 'border-[#154F7C] bg-sky-50/70 dark:bg-sky-500/10 ring-2 ring-[#154F7C]/15'
                                            : 'border-slate-200 dark:border-white/10 bg-white dark:bg-[#08121E]'
                                    }`}
                                >
                                    <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                                        <span>Normal Ticket Sheets</span>
                                        {bulkForm.data.redirect_to === 'print_tickets' && (
                                            <Check className="w-3.5 h-3.5 text-[#154F7C] dark:text-sky-400" />
                                        )}
                                    </div>
                                    <div className="text-[11px] text-slate-500 mt-0.5">
                                        Perforated A4 paper vouchers with tear-off QR stub
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => bulkForm.setData('redirect_to', 'print_wristbands')}
                                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                                        bulkForm.data.redirect_to === 'print_wristbands'
                                            ? 'border-[#154F7C] bg-sky-50/70 dark:bg-sky-500/10 ring-2 ring-[#154F7C]/15'
                                            : 'border-slate-200 dark:border-white/10 bg-white dark:bg-[#08121E]'
                                    }`}
                                >
                                    <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                                        <span>Wristband Sheets</span>
                                        {bulkForm.data.redirect_to === 'print_wristbands' && (
                                            <Check className="w-3.5 h-3.5 text-[#154F7C] dark:text-sky-400" />
                                        )}
                                    </div>
                                    <div className="text-[11px] text-slate-500 mt-0.5">
                                        10 horizontal Tyvek wristband strips per A4 sheet
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* 4. Optional Batch Note */}
                        <div>
                            <InputLabel htmlFor="bulk_label" value="Batch Note (Optional)" className="font-bold" />
                            <TextInput
                                id="bulk_label"
                                type="text"
                                className="w-full text-xs mt-1"
                                placeholder="e.g. Gate A Cash Box or Mlimani Outlet"
                                value={bulkForm.data.distribution_label}
                                onChange={(e) => bulkForm.setData('distribution_label', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
                        <SecondaryButton type="button" onClick={() => setBulkModalOpen(false)} className="text-xs">
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton type="submit" disabled={bulkForm.processing} className="text-xs">
                            {bulkForm.processing
                                ? 'Generating…'
                                : bulkForm.data.redirect_to === 'print_wristbands'
                                ? `Generate & Open Wristband Print (${bulkForm.data.quantity || 0})`
                                : `Generate & Open Ticket Print (${bulkForm.data.quantity || 0})`}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </KardovoAppLayout>
    );
}
