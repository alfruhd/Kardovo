import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import KardovoAppLayout from '@/Layouts/KardovoAppLayout';
import EmptyEventState from '@/Components/EmptyEventState';
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
    Trophy,
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
    Lock,
    Phone,
    Film,
    Play,
    Coins,
    Wallet,
    Receipt,
    Landmark,
    Share2
} from 'lucide-react';

const MediaInput = ({ id, label, placeholder, configKey, editEventForm, accept = "image/*", helper }) => {
    const file = editEventForm.data.microsite_config_files?.[configKey];
    const currentValue = editEventForm.data.microsite_config?.[configKey] || '';

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <InputLabel htmlFor={id} value={label} className="text-xs font-semibold text-slate-700 dark:text-slate-300" />
                {file ? (
                    <span className="text-[10.5px] font-bold text-[#154F7C] dark:text-sky-400 bg-sky-500/10 dark:bg-sky-500/15 border border-sky-500/20 px-2 py-0.5 rounded-full">
                        File Selected
                    </span>
                ) : (
                    <span className="text-[10.5px] text-slate-400 dark:text-slate-500">URL or Upload</span>
                )}
            </div>

            <div className="flex items-center gap-2">
                <div className="relative flex-1 min-w-0">
                    <TextInput
                        id={id}
                        type="text"
                        readOnly={Boolean(file)}
                        className={`block w-full text-xs py-2.5 px-3 rounded-xl bg-white dark:bg-[#08121E] transition-all ${
                            file ? 'bg-sky-500/5 dark:bg-sky-500/10 text-[#154F7C] dark:text-sky-300 font-medium border-sky-400/40 dark:border-sky-500/40 pr-8' : ''
                        }`}
                        placeholder={placeholder}
                        value={file ? file.name : currentValue}
                        onChange={(e) => {
                            editEventForm.setData('microsite_config', {
                                ...editEventForm.data.microsite_config,
                                [configKey]: e.target.value
                            });
                        }}
                    />
                    {file && (
                        <button
                            type="button"
                            onClick={() => {
                                editEventForm.setData('microsite_config_files', {
                                    ...(editEventForm.data.microsite_config_files || {}),
                                    [configKey]: null
                                });
                            }}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-200 dark:bg-white/10 hover:bg-rose-100 hover:text-rose-600 text-slate-500 flex items-center justify-center text-[10px] transition cursor-pointer"
                            title="Clear file selection"
                        >
                            ✕
                        </button>
                    )}
                </div>

                <label className="shrink-0 inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.12] text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-white/[0.08] cursor-pointer transition active:scale-95 shadow-2xs">
                    <Upload className="w-3.5 h-3.5 text-[#154F7C] dark:text-sky-400" />
                    <span>{file ? 'Change' : 'Import'}</span>
                    <input
                        type="file"
                        className="hidden"
                        accept={accept}
                        onChange={(e) => {
                            const selected = e.target.files?.[0];
                            if (selected) {
                                editEventForm.setData('microsite_config_files', {
                                    ...(editEventForm.data.microsite_config_files || {}),
                                    [configKey]: selected
                                });
                            }
                        }}
                    />
                </label>
            </div>
            {helper && <p className="text-[10px] text-slate-400 dark:text-slate-500">{helper}</p>}
        </div>
    );
};

export default function EventDashboard({ 
    event = {}, 
    guests = { data: [], total: 0, links: [] }, 
    filters = {}, 
    stats = {}, 
    pledgeStats = {},
    pledgePayments = [],
    recentScanLogs = [],
    templates = [],
    ticketTiers = [],
    ticketStats = {},
    ticketOrders = [],
    votingCategories = [],
    votingStats = {}
}) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const isAdmin = user?.role === 'admin' || user?.is_admin;
    const canImport = isAdmin || (user?.status !== 'suspended' && user?.effective_permissions?.can_import_guests !== false);
    const canExport = isAdmin || (user?.status !== 'suspended' && user?.effective_permissions?.can_export_data !== false);
    const canBroadcast = isAdmin || (user?.status !== 'suspended' && user?.effective_permissions?.can_send_broadcasts !== false);
    const canCustomize = isAdmin || (user?.status !== 'suspended' && user?.effective_permissions?.can_customize_templates !== false);
    const canManageScanners = isAdmin || (user?.status !== 'suspended' && user?.effective_permissions?.can_manage_scanners !== false);
    const canCustomizeMicrosite = isAdmin || (user?.status !== 'suspended' && (user?.effective_permissions?.can_customize_microsite === true || event?.microsite_config?.admin_override === true));

    const [activeTab, setActiveTab] = useState(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            if (params.get('tab') === 'pledges') return 'pledges';
        }
        return 'guests';
    });

    const [search, setSearch] = useState(filters?.search || '');
    const [deliveryFilter, setDeliveryFilter] = useState(filters?.delivery || 'all');
    const [channelFilter, setChannelFilter] = useState(filters?.channel || 'all');
    const [rsvpFilter, setRsvpFilter] = useState(filters?.rsvp || 'all');
    const [categoryFilter, setCategoryFilter] = useState(filters?.category || 'all');
    const [pledgeFilter, setPledgeFilter] = useState(filters?.pledge || 'all');

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

    // Pledges & Contributions Modals & States
    const [recordPaymentModalOpen, setRecordPaymentModalOpen] = useState(false);
    const [addPledgeModalOpen, setAddPledgeModalOpen] = useState(false);
    const [pledgeSettingsModalOpen, setPledgeSettingsModalOpen] = useState(false);
    const [pledgeHistoryModalOpen, setPledgeHistoryModalOpen] = useState(false);
    const [selectedPledgeGuest, setSelectedPledgeGuest] = useState(null);
    const [copiedWhatsAppReport, setCopiedWhatsAppReport] = useState(false);
    const [copiedBankDetails, setCopiedBankDetails] = useState(false);
    const [pledgeContributorType, setPledgeContributorType] = useState('existing'); // 'existing' | 'new'

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
            show_intro_animation: event?.microsite_config?.show_intro_animation !== false,
            intro_video_url: event?.microsite_config?.intro_video_url || '',
            intro_poster_url: event?.microsite_config?.intro_poster_url || '',
            gate_seal_color: event?.microsite_config?.gate_seal_color || '#5a0f1b',
            gate_seal_initials: event?.microsite_config?.gate_seal_initials || '',
            gate_seal_image_url: event?.microsite_config?.gate_seal_image_url || '',
            swans_video_url: event?.microsite_config?.swans_video_url || '',
            music_url: event?.microsite_config?.music_url || '',
            cover_photo: event?.microsite_config?.cover_photo || '',
            primary_name: event?.microsite_config?.primary_name || '',
            secondary_name: event?.microsite_config?.secondary_name || '',
            couple_title: event?.microsite_config?.couple_title || '',
            event_tagline: event?.microsite_config?.event_tagline || '',
            event_date_formatted: event?.microsite_config?.event_date_formatted || '',
            couple_verse: event?.microsite_config?.couple_verse || '',
            host_honor_text: event?.microsite_config?.host_honor_text || '',
            invitation_text: event?.microsite_config?.invitation_text || '',
            countdown_title: event?.microsite_config?.countdown_title || '',
            countdown_target_datetime: event?.microsite_config?.countdown_target_datetime || '',
            schedule_title: event?.microsite_config?.schedule_title || '',
            programme: event?.microsite_config?.programme || [
                { time: '5 PM', title: 'Guest Arrival', note: '' },
                { time: '6 PM', title: 'Nikkah Ceremony', note: '' },
                { time: '7 PM', title: 'Mocktail Hour', note: '' },
                { time: '8 PM', title: 'Dinner', note: '' },
                { time: '9 PM', title: 'Dance', note: '' },
            ],
            reception_title: event?.microsite_config?.reception_title || '',
            reception_subtitle: event?.microsite_config?.reception_subtitle || '',
            google_maps_embed_url: event?.microsite_config?.google_maps_embed_url || '',
            dress_code_title: event?.microsite_config?.dress_code_title || '',
            dress_code_note: event?.microsite_config?.dress_code_note || '',
            gift_preference_title: event?.microsite_config?.gift_preference_title || '',
            gift_preference_note: event?.microsite_config?.gift_preference_note || '',
            rsvp_heading: event?.microsite_config?.rsvp_heading || '',
            rsvp_subtext: event?.microsite_config?.rsvp_subtext || '',
            rsvp_deadline: event?.microsite_config?.rsvp_deadline || '',
            footer_quote: event?.microsite_config?.footer_quote || '',
            footer_names: event?.microsite_config?.footer_names || '',
            theme_color: event?.microsite_config?.theme_color || '#f9f0e0',
            accent_color: event?.microsite_config?.accent_color || '#a67d2b',
            intro_button_text: event?.microsite_config?.intro_button_text || 'Tap to open',
            scroll_down_text: event?.microsite_config?.scroll_down_text || 'Scroll down',
            venue_badge: event?.microsite_config?.venue_badge || 'Location',
            rsvp_open_label: event?.microsite_config?.rsvp_open_label || 'Click to open',
            wax_seal_image_url: event?.microsite_config?.wax_seal_image_url || '',
            rsvp_submit_label: event?.microsite_config?.rsvp_submit_label || 'Submit',
            rsvp_field_name: event?.microsite_config?.rsvp_field_name || 'Your name',
            rsvp_field_attending: event?.microsite_config?.rsvp_field_attending || 'Will you be attending?',
            rsvp_field_guest_count: event?.microsite_config?.rsvp_field_guest_count || 'Number of Guests Attending',
            rsvp_field_song: event?.microsite_config?.rsvp_field_song || 'A Song That Gets You Dancing',
            rsvp_field_children: event?.microsite_config?.rsvp_field_children || 'Children Attending',
            admin_override: event?.microsite_config?.admin_override || false,
        },
        microsite_config_files: {},
    });

    // Add Guest Form
    const addForm = useForm({
        name: '',
        phone: '',
        email: '',
        category: 'Single Entry',
        max_entries: 1,
        pledge_amount: '',
        pledge_deadline: '',
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
        pledge_amount: '',
        pledge_deadline: '',
        notes: '',
    });

    // Record Payment Form
    const recordPaymentForm = useForm({
        amount: '',
        payment_method: 'mpesa',
        reference: '',
        payment_date: new Date().toISOString().split('T')[0],
        notes: '',
    });

    // Add Pledge / Contributor Form
    const addPledgeForm = useForm({
        guest_id: '',
        name: '',
        phone: '',
        category: 'Contributor',
        pledge_amount: '',
        pledge_deadline: '',
        initial_paid: '',
        payment_method: 'mpesa',
        reference: '',
        notes: '',
    });

    // Pledge Settings Form
    const pledgeSettingsForm = useForm({
        pledge_target: event?.pledge_target || '',
        pledge_currency: event?.pledge_currency || 'TZS',
        pledges_enabled: event?.pledges_enabled ?? true,
        pledge_deadline: event?.pledge_deadline ? String(event.pledge_deadline).split('T')[0] : '',
        pledge_settings: {
            lipa_number: event?.pledge_settings?.lipa_number || '',
            bank_name: event?.pledge_settings?.bank_name || '',
            account_number: event?.pledge_settings?.account_number || '',
            account_name: event?.pledge_settings?.account_name || '',
            instructions: event?.pledge_settings?.instructions || '',
        }
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
                !recordPaymentModalOpen &&
                !addPledgeModalOpen &&
                !pledgeSettingsModalOpen &&
                !pledgeHistoryModalOpen &&
                typeof document !== 'undefined' && 
                document.visibilityState === 'visible'
            ) {
                router.reload({
                    only: ['guests', 'stats', 'pledgeStats', 'pledgePayments', 'recentScanLogs', 'ticketTiers', 'ticketStats', 'ticketOrders'],
                    preserveScroll: true,
                    preserveState: true,
                });
            }
        }, 4000);

        return () => clearInterval(interval);
    }, [
        addGuestModalOpen, 
        editGuestModalOpen, 
        importModalOpen, 
        editEventModalOpen, 
        selectTemplateModalOpen, 
        cardPreviewModalOpen,
        recordPaymentModalOpen,
        addPledgeModalOpen,
        pledgeSettingsModalOpen,
        pledgeHistoryModalOpen
    ]);

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
        const hasFiles = Object.values(editEventForm.data.microsite_config_files || {}).some(Boolean);
        if (hasFiles) {
            editEventForm.transform((data) => ({
                ...data,
                _method: 'put',
            })).post(route('events.update', event?.id || 1), {
                preserveScroll: true,
                onSuccess: () => {
                    setEditEventModalOpen(false);
                }
            });
        } else {
            editEventForm.put(route('events.update', event?.id || 1), {
                preserveScroll: true,
                onSuccess: () => {
                    setEditEventModalOpen(false);
                }
            });
        }
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

    const handleFilterSubmit = (e, newPledgeFilter = null) => {
        if (e && e.preventDefault) e.preventDefault();
        const activePledge = newPledgeFilter !== null ? newPledgeFilter : pledgeFilter;
        if (newPledgeFilter !== null) {
            setPledgeFilter(newPledgeFilter);
        }
        router.get(route('events.show', event?.id || 1), {
            search,
            delivery: deliveryFilter,
            channel: channelFilter,
            rsvp: rsvpFilter,
            category: categoryFilter,
            pledge: activePledge,
            tab: activeTab,
        }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const handleRecordPaymentSubmit = (e) => {
        e.preventDefault();
        if (!selectedPledgeGuest?.id) return;
        recordPaymentForm.post(route('pledges.recordPayment', [event.id, selectedPledgeGuest.id]), {
            preserveScroll: true,
            onSuccess: () => {
                setRecordPaymentModalOpen(false);
                recordPaymentForm.reset();
                setSelectedPledgeGuest(null);
            }
        });
    };

    const handleAddPledgeSubmit = (e) => {
        e.preventDefault();
        addPledgeForm.post(route('pledges.store', event.id), {
            preserveScroll: true,
            onSuccess: () => {
                setAddPledgeModalOpen(false);
                addPledgeForm.reset();
            }
        });
    };

    const handlePledgeSettingsSubmit = (e) => {
        e.preventDefault();
        pledgeSettingsForm.post(route('pledges.settings', event.id), {
            preserveScroll: true,
            onSuccess: () => {
                setPledgeSettingsModalOpen(false);
            }
        });
    };

    const handleDeletePayment = (payment) => {
        setConfirmModal({
            show: true,
            title: 'Delete Payment Installment?',
            message: `Are you sure you want to delete the payment of ${(pledgeStats?.currency || 'TZS')} ${Number(payment.amount).toLocaleString()} for ${payment.guest?.name || 'this contributor'}?`,
            warning: 'This will revert the contributor\'s balance and event total collected.',
            confirmText: 'Delete Payment',
            cancelText: 'Cancel',
            type: 'danger',
            loading: false,
            onConfirm: () => {
                setConfirmModal(prev => ({ ...prev, loading: true }));
                router.delete(route('pledges.deletePayment', [event.id, payment.id]), {
                    preserveScroll: true,
                    onSuccess: () => {
                        setConfirmModal(prev => ({ ...prev, show: false, loading: false }));
                    },
                    onError: () => {
                        setConfirmModal(prev => ({ ...prev, loading: false }));
                    }
                });
            }
        });
    };

    const generateWhatsAppReport = () => {
        const cur = pledgeStats?.currency || 'TZS';
        const target = Number(pledgeStats?.target || 0);
        const pledged = Number(pledgeStats?.total_pledged || 0);
        const collected = Number(pledgeStats?.total_collected || 0);
        const balance = Number(pledgeStats?.total_balance || 0);
        const count = Number(pledgeStats?.pledge_count || 0);
        const percent = Number(pledgeStats?.percent_of_target || 0);

        const lipaNumber = event?.pledge_settings?.lipa_number;
        const bankName = event?.pledge_settings?.bank_name;
        const accNumber = event?.pledge_settings?.account_number;
        const accName = event?.pledge_settings?.account_name;
        const instructions = event?.pledge_settings?.instructions;

        let lines = [];
        lines.push(`📊 *RIPOTI YA MICHANGO NA AHADI*`);
        lines.push(`🎉 *${event?.title || 'Tukio'}*`);
        if (event?.date) {
            lines.push(`📅 Tarehe: ${new Date(event.date).toLocaleDateString()}`);
        }
        lines.push(`------------------------------------`);
        if (target > 0) {
            lines.push(`🎯 Lengo la Bajeti: ${cur} ${target.toLocaleString()}`);
        }
        lines.push(`🤝 Jumla ya Ahadi: ${cur} ${pledged.toLocaleString()} (${count} Wachangiaji)`);
        lines.push(`💰 Zilizokusanywa: ${cur} ${collected.toLocaleString()}${target > 0 ? ` (${percent}%)` : ''}`);
        lines.push(`⏳ Salio Lililobaki: ${cur} ${balance.toLocaleString()}`);

        if (lipaNumber || (bankName && accNumber)) {
            lines.push(`------------------------------------`);
            lines.push(`💳 *MAELEZO YA MALIPO:*`);
            if (lipaNumber) lines.push(`📱 Lipa Namba: ${lipaNumber}`);
            if (bankName && accNumber) lines.push(`🏛 Benki: ${bankName} | A/C: ${accNumber}${accName ? ` (${accName})` : ''}`);
            if (instructions) lines.push(`ℹ️ ${instructions}`);
        }

        const contributors = (guests?.data || []).filter(g => Number(g.pledge_amount) > 0 || Number(g.paid_amount) > 0);
        if (contributors.length > 0) {
            lines.push(`------------------------------------`);
            lines.push(`📋 *ORODHA YA WACHANGIAJI:*`);
            contributors.forEach((c, idx) => {
                const p = Number(c.pledge_amount || 0);
                const pd = Number(c.paid_amount || 0);
                const bal = Math.max(0, p - pd);
                const statusTag = (pd >= p && p > 0) ? '✅ Imekamilika' : (pd > 0 ? `⏳ Salio: ${cur} ${bal.toLocaleString()}` : '⭕ Haijalipwa');
                lines.push(`${idx + 1}. ${c.name} - Ahadi: ${cur} ${p.toLocaleString()} | Imelipwa: ${cur} ${pd.toLocaleString()} (${statusTag})`);
            });
        }

        lines.push(`------------------------------------`);
        lines.push(`Asanteni sana kwa ushirikiano! 🙏`);
        lines.push(`Kardovo`);

        return lines.join('\n');
    };

    const handleCopyWhatsAppReport = () => {
        const text = generateWhatsAppReport();
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                setCopiedWhatsAppReport(true);
                setTimeout(() => setCopiedWhatsAppReport(false), 2500);
            });
        }
    };

    const handleCopyBankDetails = () => {
        const lipa = event?.pledge_settings?.lipa_number;
        const bank = event?.pledge_settings?.bank_name;
        const acc = event?.pledge_settings?.account_number;
        const name = event?.pledge_settings?.account_name;
        const instructions = event?.pledge_settings?.instructions;

        let lines = [];
        lines.push(`💳 *MAELEZO YA KUTUMA MCHANGO - ${event?.title}*`);
        if (lipa) lines.push(`📱 Lipa Namba: ${lipa}`);
        if (bank && acc) lines.push(`🏛 Benki: ${bank}\nNamba ya Akaunti: ${acc}${name ? `\nJina la Akaunti: ${name}` : ''}`);
        if (instructions) lines.push(`ℹ️ Maelezo: ${instructions}`);

        if (navigator.clipboard) {
            navigator.clipboard.writeText(lines.join('\n')).then(() => {
                setCopiedBankDetails(true);
                setTimeout(() => setCopiedBankDetails(false), 2500);
            });
        }
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
            pledge_amount: guest.pledge_amount || '',
            pledge_deadline: guest.pledge_deadline ? String(guest.pledge_deadline).split('T')[0] : '',
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
                <div className="flex items-center gap-1.5 sm:gap-2.5">
                    {activeTab === 'pledges' ? (
                        <>
                            <button
                                type="button"
                                onClick={() => setPledgeSettingsModalOpen(true)}
                                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-bold text-slate-100 hover:text-white bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] rounded-xl shadow-2xs transition active:scale-95 cursor-pointer"
                                title="Campaign Budget & Payment Settings"
                            >
                                <Settings className="w-3.5 h-3.5 text-sky-400" />
                                <span className="hidden sm:inline">Settings</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedPledgeGuest(null);
                                    setRecordPaymentModalOpen(true);
                                }}
                                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border border-emerald-400/25 rounded-xl shadow-xs shadow-emerald-600/20 transition active:scale-95 cursor-pointer"
                            >
                                <Wallet className="w-3.5 h-3.5 stroke-[2.5]" />
                                <span className="hidden xs:inline">Record Payment</span>
                                <span className="xs:hidden">Pay</span>
                            </button>
                        </>
                    ) : (
                        <>
                            {/* 1. Import Excel / CSV */}
                            {canImport && (
                                <button
                                    type="button"
                                    onClick={() => setImportModalOpen(true)}
                                    className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold text-slate-100 hover:text-white bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] rounded-xl shadow-2xs transition active:scale-95 cursor-pointer"
                                    title="Bulk Import Excel or CSV Guest List"
                                >
                                    <FileSpreadsheet className="w-3.5 h-3.5 text-sky-400" />
                                    <span className="hidden md:inline">Import Excel / CSV</span>
                                    <span className="hidden xs:inline md:hidden">Import</span>
                                </button>
                            )}

                            {/* 2. + Add Guest */}
                            {canImport ? (
                                <button
                                    type="button"
                                    onClick={() => setAddGuestModalOpen(true)}
                                    className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold text-white bg-gradient-to-r from-[#154F7C] to-[#327FB5] hover:from-[#1A5C91] hover:to-[#3D8EC7] border border-sky-400/25 rounded-xl shadow-xs shadow-[#154F7C]/20 transition active:scale-95 cursor-pointer"
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
                                    className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold text-slate-400 bg-white/[0.08] border border-white/[0.12] rounded-xl cursor-not-allowed opacity-80 shadow-2xs"
                                    title="Guest imports locked by administration"
                                >
                                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="hidden sm:inline">Guest Reg. (Locked)</span>
                                    <span className="sm:hidden">Locked</span>
                                </button>
                            )}
                        </>
                    )}

                    {/* Event Settings Button */}
                    <button
                        type="button"
                        onClick={() => setEditEventModalOpen(true)}
                        className="p-1.5 sm:p-2 text-slate-200 hover:text-white bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] rounded-xl shadow-2xs transition active:scale-95 cursor-pointer"
                        title="Edit Event Details & Settings"
                    >
                        <Edit className="w-4 h-4 text-sky-400" />
                    </button>
                </div>
            }
        >
            <Head title={`${event?.title || 'Event'} - Kardovo`} />

            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
                {/* Primary Section Switcher */}
                <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-white/[0.08] pb-3 overflow-x-auto no-scrollbar">
                    <button
                        type="button"
                        onClick={() => {
                            setActiveTab('guests');
                            if (typeof window !== 'undefined') {
                                const url = new URL(window.location);
                                url.searchParams.delete('tab');
                                window.history.replaceState({}, '', url);
                            }
                        }}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer shrink-0 ${
                            activeTab === 'guests'
                                ? 'bg-gradient-to-r from-[#154F7C] to-[#327FB5] text-white shadow-xs shadow-[#154F7C]/20 border border-sky-400/25'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-transparent'
                        }`}
                    >
                        <Users className="w-4 h-4" />
                        <span>Guests & Passes</span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                            activeTab === 'guests' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-white/[0.08] text-slate-700 dark:text-slate-300'
                        }`}>
                            {(guests?.total || 0).toLocaleString()}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setActiveTab('pledges');
                            if (typeof window !== 'undefined') {
                                const url = new URL(window.location);
                                url.searchParams.set('tab', 'pledges');
                                window.history.replaceState({}, '', url);
                            }
                        }}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer shrink-0 ${
                            activeTab === 'pledges'
                                ? 'bg-gradient-to-r from-[#154F7C] to-[#327FB5] text-white shadow-xs shadow-[#154F7C]/20 border border-sky-400/25'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-transparent'
                        }`}
                    >
                        <Coins className="w-4 h-4" />
                        <span>Pledges & Contributions</span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                            activeTab === 'pledges' ? 'bg-white/20 text-white' : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold'
                        }`}>
                            {pledgeStats?.pledge_count > 0 
                                ? `${pledgeStats?.currency || 'TZS'} ${Math.round(pledgeStats?.total_collected || 0).toLocaleString()}` 
                                : 'Michango'}
                        </span>
                    </button>

                </div>

                {activeTab === 'guests' && (
                    <>
                        {/* 1. Stat Cards (Responsive 2-col on Mobile, 4-col on Desktop) */}
                        <section
                            aria-label="Event guest statistics"
                            className="grid grid-cols-2 lg:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-slate-200/80 dark:border-white/[0.08] bg-slate-200/80 dark:bg-white/[0.08] shadow-xs"
                        >
                            <div className="bg-white dark:bg-[#0B1524] p-5">
                                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Guests</div>
                                <div className="mt-1.5 text-xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums">
                                    {(stats?.total_guests || 0).toLocaleString()}
                                </div>
                                <div className="mt-1 text-xs text-slate-400 tabular-nums">
                                    Invited attendees
                                </div>
                            </div>
                            <div className="bg-white dark:bg-[#0B1524] p-5">
                                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Messages Sent</div>
                                <div className="mt-1.5 text-xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums">
                                    {(stats?.messages_sent || 0).toLocaleString()}
                                </div>
                                <div className="mt-1 text-xs text-slate-400 tabular-nums">
                                    {stats?.messages_sent || 0} dispatched passes
                                </div>
                            </div>
                            <div className="bg-white dark:bg-[#0B1524] p-5">
                                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">RSVP 'Will Attend'</div>
                                <div className="mt-1.5 text-xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums">
                                    {(stats?.will_attend || 0).toLocaleString()}
                                </div>
                                <div className="mt-1 text-xs text-slate-400 tabular-nums">
                                    {stats?.attendance_percent || 0}% response rate
                                </div>
                            </div>
                            <div className="bg-white dark:bg-[#0B1524] p-5">
                                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Checked In</div>
                                <div className="mt-1.5 text-xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums">
                                    {(stats?.live_checkins || 0).toLocaleString()}
                                </div>
                                <div className="mt-1 text-xs text-slate-400 tabular-nums">
                                    Live gate check-ins
                                </div>
                            </div>
                        </section>

                {/* 📱 Mobile-First Quick Action Dock */}
                <div className="sm:hidden grid grid-cols-2 gap-2 p-2 rounded-2xl bg-white dark:bg-[#0B1524] border border-slate-200/90 dark:border-white/[0.08] shadow-xs">
                    {canImport ? (
                        <>
                            <button
                                type="button"
                                onClick={() => setAddGuestModalOpen(true)}
                                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#154F7C] to-[#327FB5] hover:from-[#1A5C91] hover:to-[#3D8EC7] border border-sky-400/25 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs shadow-[#154F7C]/20 active:scale-95 transition cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add Guest</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setImportModalOpen(true)}
                                className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-white/[0.08] text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition border border-slate-200 dark:border-white/[0.08] cursor-pointer"
                            >
                                <Upload className="w-3.5 h-3.5 text-[#154F7C] dark:text-sky-400" />
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
                            <Palette className="w-3.5 h-3.5 text-[#154F7C] dark:text-sky-400" />
                            <span>Card Template</span>
                        </button>
                    )}

                    {canBroadcast && (
                        <Link
                            href={route('messaging.index', { event_id: event.id })}
                            className="py-2.5 px-3 rounded-xl bg-sky-500/10 dark:bg-sky-500/15 border border-sky-500/20 text-[#154F7C] dark:text-sky-300 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition col-span-2 sm:col-span-1"
                        >
                            <Send className="w-3.5 h-3.5 text-[#154F7C] dark:text-sky-400" />
                            <span>Broadcast</span>
                        </Link>
                    )}
                </div>

                {/* 🎨 Assigned Card Template Banner */}
                <div className="bg-white dark:bg-[#0B1524] rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 border border-slate-200/90 dark:border-white/[0.08] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-[#154F7C] dark:bg-sky-500/15 dark:text-sky-400 flex items-center justify-center flex-shrink-0">
                            <Palette className="w-4 h-4" />
                        </div>
                        <div className="flex items-center gap-2 min-w-0 text-xs">
                            <span className="text-slate-500 dark:text-slate-400 font-medium">Pass Template:</span>
                            {(event?.card_template?.name || event?.cardTemplate?.name) ? (
                                <span className="font-bold text-slate-900 dark:text-white truncate font-display">
                                    {event?.card_template?.name || event?.cardTemplate?.name}
                                </span>
                            ) : (
                                <span className="font-medium text-slate-400 italic">
                                    None (Not Created)
                                </span>
                            )}
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
                                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#154F7C] to-[#327FB5] hover:from-[#1A5C91] hover:to-[#3D8EC7] border border-sky-400/25 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs shadow-[#154F7C]/20 active:scale-95 transition cursor-pointer"
                            >
                                <Palette className="w-3.5 h-3.5" />
                                <span>{(event?.card_template_id || event?.card_template || event?.cardTemplate) ? 'Change Template' : 'Assign Template'}</span>
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
                    <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-white/[0.08]">
                        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
                            {/* Left: Title & Passes Badge */}
                            <div className="flex items-center gap-2.5 shrink-0">
                                <h2 className="text-base font-black text-slate-900 dark:text-white font-display flex items-center gap-2">
                                    <span>Guest List</span>
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.08] text-slate-600 dark:text-slate-300 font-mono">
                                        {(guests?.total || 0).toLocaleString()} passes
                                    </span>
                                </h2>
                            </div>

                            {/* Right: Search, Filter Dropdowns, Export & Clear List */}
                            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 xl:justify-end flex-1 min-w-0">
                                {/* Search Input */}
                                <div className="relative w-full sm:w-44 lg:w-48 shrink-0">
                                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <input
                                        type="text"
                                        placeholder="Search name, phone, card #..."
                                        className="w-full h-8.5 pl-8 pr-7 text-xs rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/70 dark:bg-[#08121E] text-slate-900 dark:text-white placeholder-slate-400 focus:ring-1 focus:ring-sky-500 focus:border-[#154F7C] dark:focus:border-sky-400 shadow-2xs font-medium"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onBlur={handleFilterSubmit}
                                    />
                                    {search && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSearch('');
                                                router.get(route('events.show', event?.id || 1), {
                                                    search: '',
                                                    delivery: deliveryFilter,
                                                    channel: channelFilter,
                                                    rsvp: rsvpFilter,
                                                    category: categoryFilter,
                                                    pledge: pledgeFilter,
                                                    tab: activeTab,
                                                }, { preserveState: true, preserveScroll: true });
                                            }}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>

                                {/* Channel Filter */}
                                <select
                                    className="h-8.5 text-xs py-1 pl-2.5 pr-7 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/70 dark:bg-[#08121E] text-slate-700 dark:text-slate-300 font-medium focus:ring-1 focus:ring-sky-500 focus:border-[#154F7C] dark:focus:border-sky-400 shadow-2xs cursor-pointer hover:border-slate-300 dark:hover:border-white/20 transition outline-none shrink-0"
                                    value={channelFilter}
                                    onChange={(e) => {
                                        setChannelFilter(e.target.value);
                                        router.get(route('events.show', event?.id || 1), {
                                            search,
                                            delivery: deliveryFilter,
                                            channel: e.target.value,
                                            rsvp: rsvpFilter,
                                            category: categoryFilter,
                                        }, { preserveState: true, preserveScroll: true });
                                    }}
                                >
                                    <option value="all">Channel: All</option>
                                    <option value="whatsapp">WhatsApp</option>
                                    <option value="sms">SMS</option>
                                </select>

                                {/* Delivery Filter */}
                                <select
                                    className="h-8.5 text-xs py-1 pl-2.5 pr-7 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/70 dark:bg-[#08121E] text-slate-700 dark:text-slate-300 font-medium focus:ring-1 focus:ring-sky-500 focus:border-[#154F7C] dark:focus:border-sky-400 shadow-2xs cursor-pointer hover:border-slate-300 dark:hover:border-white/20 transition outline-none shrink-0"
                                    value={deliveryFilter}
                                    onChange={(e) => {
                                        setDeliveryFilter(e.target.value);
                                        router.get(route('events.show', event?.id || 1), {
                                            search,
                                            delivery: e.target.value,
                                            channel: channelFilter,
                                            rsvp: rsvpFilter,
                                            category: categoryFilter,
                                        }, { preserveState: true, preserveScroll: true });
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
                                        }, { preserveState: true, preserveScroll: true });
                                    }}
                                    className="h-8.5 text-xs py-1 pl-2.5 pr-7 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/70 dark:bg-[#08121E] text-slate-700 dark:text-slate-300 font-medium focus:ring-1 focus:ring-sky-500 focus:border-[#154F7C] dark:focus:border-sky-400 shadow-2xs cursor-pointer hover:border-slate-300 dark:hover:border-white/20 transition outline-none shrink-0"
                                >
                                    <option value="all">All RSVP</option>
                                    <option value="attending">Will Attend</option>
                                    <option value="declined">Declined</option>
                                    <option value="pending">Pending</option>
                                </select>

                                {/* Pledge Filter */}
                                <select
                                    value={pledgeFilter}
                                    onChange={(e) => {
                                        setPledgeFilter(e.target.value);
                                        router.get(route('events.show', event?.id || 1), {
                                            search,
                                            delivery: deliveryFilter,
                                            channel: channelFilter,
                                            rsvp: rsvpFilter,
                                            category: categoryFilter,
                                            pledge: e.target.value,
                                            tab: activeTab,
                                        }, { preserveState: true, preserveScroll: true });
                                    }}
                                    className="h-8.5 text-xs py-1 pl-2.5 pr-7 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/70 dark:bg-[#08121E] text-slate-700 dark:text-slate-300 font-medium focus:ring-1 focus:ring-sky-500 focus:border-[#154F7C] dark:focus:border-sky-400 shadow-2xs cursor-pointer hover:border-slate-300 dark:hover:border-white/20 transition outline-none shrink-0"
                                >
                                    <option value="all">All Pledges</option>
                                    <option value="has_pledge">Has Pledge</option>
                                    <option value="completed">Pledge: Paid</option>
                                    <option value="partial">Pledge: Partial</option>
                                    <option value="unpaid">Pledge: Unpaid</option>
                                </select>

                                {/* Actions Group: Export & Clear List (Locked together so they never split awkwardly) */}
                                <div className="flex items-center gap-1.5 shrink-0">
                                    {/* Export Dropdown */}
                                    {canExport ? (
                                        <div className="relative" ref={exportDropdownRef}>
                                            <button
                                                type="button"
                                                onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                                                className="h-8.5 inline-flex items-center gap-1.5 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#08121E] hover:bg-slate-50 dark:hover:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] rounded-xl transition cursor-pointer shadow-2xs whitespace-nowrap"
                                            >
                                                <Download className="w-3.5 h-3.5 text-slate-400" />
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
                                                        href={route('pledges.exportCsv', event.id)}
                                                        onClick={() => setExportDropdownOpen(false)}
                                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-xl transition text-left cursor-pointer"
                                                    >
                                                        <Coins className="w-4 h-4 text-amber-500" />
                                                        <div className="flex flex-col">
                                                            <span>Export Pledges Ledger</span>
                                                            <span className="text-[10px] text-slate-400 font-normal">Full financial statement CSV</span>
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
                                            className="h-8.5 inline-flex items-center gap-1.5 px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.06] rounded-xl cursor-not-allowed opacity-75 shadow-2xs whitespace-nowrap"
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
                                            className="h-8.5 inline-flex items-center gap-1.5 px-3 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-white dark:bg-[#08121E] hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl transition active:scale-95 shadow-2xs cursor-pointer whitespace-nowrap"
                                        >
                                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                            <span>Clear List</span>
                                        </button>
                                    )}
                                </div>

                                {/* Reset Filters Button */}
                                {(search || channelFilter !== 'all' || deliveryFilter !== 'all' || rsvpFilter !== 'all' || pledgeFilter !== 'all') && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearch('');
                                            setChannelFilter('all');
                                            setDeliveryFilter('all');
                                            setRsvpFilter('all');
                                            setPledgeFilter('all');
                                            router.get(route('events.show', event?.id || 1), {
                                                tab: activeTab,
                                            }, { preserveState: true, preserveScroll: true });
                                        }}
                                        className="h-8.5 px-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white flex items-center gap-1 transition cursor-pointer shrink-0"
                                    >
                                        <X className="w-3 h-3" />
                                        <span>Reset</span>
                                    </button>
                                )}
                            </div>
                        </div>
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
                                            className={`hover:bg-sky-50/30 dark:hover:bg-white/[0.04] transition-colors ${idx % 2 === 1 ? 'bg-slate-50/40 dark:bg-white/[0.02]' : 'bg-white dark:bg-transparent'}`}
                                        >
                                            {/* Column 1: Guest Info */}
                                            <td className="py-3.5 px-4 sm:px-6">
                                                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                    <span>{guest.name}</span>
                                                </div>
                                                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                                                    {guest.phone}
                                                </div>
                                                {Number(guest.pledge_amount || 0) > 0 && (
                                                    <div className="mt-1">
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                                            <Coins className="w-2.5 h-2.5" />
                                                            <span>Ahadi: {pledgeStats?.currency || 'TZS'} {Number(guest.paid_amount || 0).toLocaleString()} / {Number(guest.pledge_amount).toLocaleString()}</span>
                                                        </span>
                                                    </div>
                                                )}
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
                                                            setSelectedPledgeGuest(guest);
                                                            const pBal = Math.max(0, Number(guest.pledge_amount || 0) - Number(guest.paid_amount || 0));
                                                            recordPaymentForm.setData({
                                                                amount: pBal > 0 ? pBal : '',
                                                                payment_method: 'mpesa',
                                                                reference: '',
                                                                payment_date: new Date().toISOString().split('T')[0],
                                                                notes: '',
                                                            });
                                                            setRecordPaymentModalOpen(true);
                                                        }}
                                                        className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition cursor-pointer"
                                                        title="Record Contribution Payment"
                                                    >
                                                        <Coins className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setPreviewGuest(guest);
                                                            setCardPreviewModalOpen(true);
                                                        }}
                                                        className="p-1.5 text-slate-400 hover:text-[#154F7C] dark:hover:text-sky-400 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.08] transition cursor-pointer"
                                                        title="Live Preview Pass"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(guest)}
                                                        className="p-1.5 text-slate-400 hover:text-[#154F7C] dark:hover:text-sky-400 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.08] transition cursor-pointer"
                                                        title="Edit Guest Pass"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
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
                                                ? 'bg-gradient-to-r from-[#154F7C] to-[#327FB5] text-white border-sky-400/30 font-bold shadow-xs' 
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
                                <QrCode className="w-4 h-4 text-[#154F7C] dark:text-sky-400" />
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
                    </>
                )}

                {activeTab === 'pledges' && (
                    <div className="space-y-4 sm:space-y-6">
                        {/* Pledges Financial Cards (4 Cards) */}
                        {/* Pledges Financial Cards (Unified segmented bar matching Ticketing / Voting) */}
                        <section
                            aria-label="Pledges and contributions statistics"
                            className="grid grid-cols-2 lg:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-slate-200/80 dark:border-white/[0.08] bg-slate-200/80 dark:bg-white/[0.08] shadow-xs"
                        >
                            <div className="bg-white dark:bg-[#0B1524] p-5">
                                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Target Budget</div>
                                <div className="mt-1.5 text-xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums truncate">
                                    {Number(pledgeStats?.target || 0) > 0 ? `${pledgeStats?.currency || 'TZS'} ${Number(pledgeStats.target).toLocaleString()}` : 'Not Set'}
                                </div>
                                <div className="mt-1 text-xs text-slate-400 tabular-nums">
                                    {pledgeStats?.deadline ? `Deadline: ${new Date(pledgeStats.deadline).toLocaleDateString()}` : 'Campaign budget goal'}
                                </div>
                            </div>
                            <div className="bg-white dark:bg-[#0B1524] p-5">
                                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Pledged</div>
                                <div className="mt-1.5 text-xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums truncate">
                                    {`${pledgeStats?.currency || 'TZS'} ${Number(pledgeStats?.total_pledged || 0).toLocaleString()}`}
                                </div>
                                <div className="mt-1 text-xs text-slate-400 tabular-nums">
                                    {`${pledgeStats?.pledge_count || 0} registered contributors`}
                                </div>
                            </div>
                            <div className="bg-white dark:bg-[#0B1524] p-5">
                                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Collected</div>
                                <div className="mt-1.5 text-xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums truncate">
                                    {`${pledgeStats?.currency || 'TZS'} ${Number(pledgeStats?.total_collected || 0).toLocaleString()}`}
                                </div>
                                <div className="mt-1 text-xs text-slate-400 tabular-nums">
                                    {Number(pledgeStats?.target || 0) > 0 ? `${pledgeStats?.percent_of_target || 0}% of budget achieved` : `${pledgeStats?.completed_count || 0} completed`}
                                </div>
                            </div>
                            <div className="bg-white dark:bg-[#0B1524] p-5">
                                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Outstanding Balance</div>
                                <div className="mt-1.5 text-xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums truncate">
                                    {`${pledgeStats?.currency || 'TZS'} ${Number(pledgeStats?.total_balance || 0).toLocaleString()}`}
                                </div>
                                <div className="mt-1 text-xs text-slate-400 tabular-nums">
                                    {`${(pledgeStats?.unpaid_count || 0) + (pledgeStats?.partial_count || 0)} pending / partial`}
                                </div>
                            </div>
                        </section>

                        {/* Progress Bar Card */}
                        {Number(pledgeStats?.target || 0) > 0 && (
                            <div className="bg-white dark:bg-[#0B1524] rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-white/[0.08] shadow-xs">
                                <div className="flex items-center justify-between text-xs font-bold mb-2">
                                    <span className="text-slate-700 dark:text-slate-300">Campaign Funding Progress</span>
                                    <span className="text-[#154F7C] dark:text-sky-400 font-mono text-sm">
                                        {pledgeStats?.percent_of_target || 0}% ({pledgeStats?.currency || 'TZS'} {Number(pledgeStats?.total_collected || 0).toLocaleString()} of {Number(pledgeStats?.target || 0).toLocaleString()})
                                    </span>
                                </div>
                                <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-white/[0.06] overflow-hidden p-0.5">
                                    <div 
                                        className="h-full rounded-full bg-gradient-to-r from-[#154F7C] via-sky-500 to-emerald-500 transition-all duration-500"
                                        style={{ width: `${Math.min(100, pledgeStats?.percent_of_target || 0)}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Lipa Namba & Payment Details Banner */}
                        <div className="bg-white dark:bg-[#0B1524] rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-white/[0.08] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <Wallet className="w-4 h-4 text-[#154F7C] dark:text-sky-400" />
                                    <h3 className="text-sm font-black text-slate-900 dark:text-white font-display">
                                        Official Payment Information
                                    </h3>
                                </div>
                                <div className="text-xs text-slate-600 dark:text-slate-400 flex flex-wrap items-center gap-x-4 gap-y-1">
                                    {event?.pledge_settings?.lipa_number && (
                                        <span>Lipa Namba: <strong className="text-slate-900 dark:text-white font-mono">{event.pledge_settings.lipa_number}</strong></span>
                                    )}
                                    {event?.pledge_settings?.bank_name && (
                                        <span>Bank: <strong className="text-slate-900 dark:text-white">{event.pledge_settings.bank_name}</strong> {event?.pledge_settings?.account_number && `(${event.pledge_settings.account_number})`}</span>
                                    )}
                                    {!event?.pledge_settings?.lipa_number && !event?.pledge_settings?.bank_name && (
                                        <span className="italic text-slate-400">No Lipa Namba or bank account configured yet. Add details for contributors.</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                                {(event?.pledge_settings?.lipa_number || event?.pledge_settings?.bank_name) && (
                                    <button
                                        type="button"
                                        onClick={handleCopyBankDetails}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.04] text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition active:scale-95 cursor-pointer"
                                    >
                                        {copiedBankDetails ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                                        <span>{copiedBankDetails ? 'Copied!' : 'Copy Payment Info'}</span>
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setPledgeSettingsModalOpen(true)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-sky-400/25 bg-sky-500/10 text-[#154F7C] dark:text-sky-300 hover:bg-sky-500/20 transition active:scale-95 cursor-pointer"
                                >
                                    <Settings className="w-3.5 h-3.5" />
                                    <span>Configure Details</span>
                                </button>
                            </div>
                        </div>

                        {/* Contributors Table Card with Filters & Actions */}
                        <div className="bg-white dark:bg-[#0B1524] rounded-3xl border border-slate-200/90 dark:border-white/[0.08] shadow-card overflow-hidden">
                            {/* Header Toolbar */}
                            <div className="p-5 border-b border-slate-100 dark:border-white/[0.08] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-base font-black text-slate-900 dark:text-white font-display flex items-center gap-2">
                                        <span>Contributors Ledger</span>
                                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.08] text-slate-600 dark:text-slate-300 font-mono">
                                            {pledgeStats?.pledge_count || 0} pledges
                                        </span>
                                    </h2>
                                </div>

                                {/* Actions & Filters */}
                                <div className="flex flex-wrap items-center gap-2">
                                    {/* Status Filter Buttons */}
                                    <div className="flex items-center rounded-xl bg-slate-100 dark:bg-white/[0.06] p-1 text-xs font-bold">
                                        {[
                                            { id: 'all', label: 'All' },
                                            { id: 'completed', label: 'Completed' },
                                            { id: 'partial', label: 'Partial' },
                                            { id: 'unpaid', label: 'Pending' }
                                        ].map(f => (
                                            <button
                                                key={f.id}
                                                type="button"
                                                onClick={() => handleFilterSubmit(null, f.id)}
                                                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                                                    pledgeFilter === f.id
                                                        ? 'bg-white dark:bg-[#0B1524] text-[#154F7C] dark:text-sky-300 shadow-2xs font-bold'
                                                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                                                }`}
                                            >
                                                {f.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* WhatsApp Summary Button */}
                                    <button
                                        type="button"
                                        onClick={handleCopyWhatsAppReport}
                                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 border border-emerald-500/30 rounded-xl transition active:scale-95 shadow-xs cursor-pointer"
                                        title="Copy formatted WhatsApp Committee Report"
                                    >
                                        {copiedWhatsAppReport ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                                        <span>{copiedWhatsAppReport ? 'Copied to Clipboard!' : 'WhatsApp Report'}</span>
                                    </button>

                                    {/* Export CSV Button */}
                                    <a
                                        href={`${route('pledges.exportCsv', event.id)}${pledgeFilter && pledgeFilter !== 'all' ? `?status=${pledgeFilter}` : ''}`}
                                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.12] border border-slate-200/80 dark:border-white/[0.08] rounded-xl transition active:scale-95 shadow-2xs cursor-pointer"
                                        title="Export financial CSV ledger"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        <span>Export CSV</span>
                                    </a>

                                    {/* Add Pledge Button */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            addPledgeForm.reset();
                                            setAddPledgeModalOpen(true);
                                        }}
                                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#154F7C] to-[#327FB5] hover:from-[#1A5C91] hover:to-[#3D8EC7] border border-sky-400/25 rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Add Contributor</span>
                                    </button>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/95 dark:bg-[#08121E]/95 text-[10.5px] uppercase font-extrabold tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/[0.08]">
                                            <th className="py-3 px-4 sm:px-6">Contributor</th>
                                            <th className="py-3 px-4 sm:px-6">Pledged (Ahadi)</th>
                                            <th className="py-3 px-4 sm:px-6">Paid (Taslimu)</th>
                                            <th className="py-3 px-4 sm:px-6">Balance (Salio)</th>
                                            <th className="py-3 px-4 sm:px-6">Status</th>
                                            <th className="py-3 px-4 sm:px-6">Installments</th>
                                            <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06] text-xs">
                                        {guests?.data?.length > 0 ? (
                                            guests.data.map((guest, idx) => {
                                                const pAmount = Number(guest.pledge_amount || 0);
                                                const paid = Number(guest.paid_amount || 0);
                                                const balance = Math.max(0, pAmount - paid);
                                                const status = guest.pledge_status || 'none';
                                                const payments = guest.pledge_payments || [];

                                                return (
                                                    <tr 
                                                        key={guest.id} 
                                                        className={`hover:bg-sky-50/30 dark:hover:bg-white/[0.04] transition-colors ${idx % 2 === 1 ? 'bg-slate-50/40 dark:bg-white/[0.02]' : 'bg-white dark:bg-transparent'}`}
                                                    >
                                                        <td className="py-3.5 px-4 sm:px-6">
                                                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                                <span>{guest.name}</span>
                                                            </div>
                                                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                                                                {guest.phone}
                                                            </div>
                                                        </td>
                                                        <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-slate-900 dark:text-white">
                                                            {pledgeStats?.currency || 'TZS'} {pAmount.toLocaleString()}
                                                        </td>
                                                        <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                                            {pledgeStats?.currency || 'TZS'} {paid.toLocaleString()}
                                                        </td>
                                                        <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-slate-600 dark:text-slate-300">
                                                            {pledgeStats?.currency || 'TZS'} {balance.toLocaleString()}
                                                        </td>
                                                        <td className="py-3.5 px-4 sm:px-6">
                                                            {status === 'completed' || status === 'overpaid' ? (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                                                    <CheckCircle2 className="w-3 h-3" />
                                                                    <span>Completed</span>
                                                                </span>
                                                            ) : status === 'partial' ? (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                                                    <Clock className="w-3 h-3" />
                                                                    <span>Partial</span>
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-slate-100 dark:bg-white/[0.08] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/[0.08]">
                                                                    <span>Pending</span>
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="py-3.5 px-4 sm:px-6">
                                                            {payments.length > 0 ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setSelectedPledgeGuest(guest);
                                                                        setPledgeHistoryModalOpen(true);
                                                                    }}
                                                                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-mono font-bold bg-sky-500/10 text-[#154F7C] dark:text-sky-300 hover:bg-sky-500/20 border border-sky-500/20 cursor-pointer transition"
                                                                >
                                                                    <Receipt className="w-3 h-3" />
                                                                    <span>{payments.length} {payments.length === 1 ? 'payment' : 'payments'}</span>
                                                                </button>
                                                            ) : (
                                                                <span className="text-[11px] text-slate-400 italic">None yet</span>
                                                            )}
                                                        </td>
                                                        <td className="py-3.5 px-4 sm:px-6 text-right">
                                                            <div className="flex items-center justify-end gap-1.5">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setSelectedPledgeGuest(guest);
                                                                        recordPaymentForm.setData({
                                                                            amount: balance > 0 ? balance : '',
                                                                            payment_method: 'mpesa',
                                                                            reference: '',
                                                                            payment_date: new Date().toISOString().split('T')[0],
                                                                            notes: '',
                                                                        });
                                                                        setRecordPaymentModalOpen(true);
                                                                    }}
                                                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-lg shadow-2xs transition active:scale-95 cursor-pointer"
                                                                    title="Record installment payment"
                                                                >
                                                                    <Plus className="w-3.5 h-3.5" />
                                                                    <span>Pay</span>
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openEditModal(guest)}
                                                                    className="p-1.5 text-slate-400 hover:text-[#154F7C] dark:hover:text-sky-400 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.08] transition cursor-pointer"
                                                                    title="Edit pledge & attendee"
                                                                >
                                                                    <Edit className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="py-12 text-center text-slate-500 dark:text-slate-400">
                                                    <Coins className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2 stroke-[1.5]" />
                                                    <p className="font-bold text-sm text-slate-700 dark:text-slate-300">No contributors found</p>
                                                    <p className="text-xs mt-1">Add attendees with pledge commitments to start tracking contributions.</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Recent Installments Feed */}
                        {pledgePayments && pledgePayments.length > 0 && (
                            <div className="bg-white dark:bg-[#0B1524] rounded-3xl border border-slate-200/90 dark:border-white/[0.08] p-5 sm:p-6 shadow-card">
                                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-white/[0.08]">
                                    <div className="flex items-center gap-2">
                                        <Wallet className="w-4 h-4 text-[#154F7C] dark:text-sky-400" />
                                        <h3 className="text-sm font-black text-slate-900 dark:text-white font-display">
                                            Recent Payments Feed
                                        </h3>
                                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.08]">
                                            {pledgePayments.length} entries
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                                    {pledgePayments.map((p) => (
                                        <div key={p.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.08] text-xs">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 font-bold">
                                                    <Check className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                        <span>{p.guest?.name || 'Contributor'}</span>
                                                        <span className="text-emerald-600 dark:text-emerald-400 font-mono font-black">
                                                            +{pledgeStats?.currency || 'TZS'} {Number(p.amount).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                                                        <span className="uppercase font-bold">{p.payment_method}</span>
                                                        {p.reference && <span>• Ref: {p.reference}</span>}
                                                        <span>• {p.payment_date ? new Date(p.payment_date).toLocaleDateString() : 'Today'}</span>
                                                        {p.recorded_by?.name && <span>• Logged by {p.recorded_by.name}</span>}
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleDeletePayment(p)}
                                                className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition active:scale-95 cursor-pointer"
                                                title="Delete payment installment"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
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
                        <button type="button" onClick={() => setImportMode('excel')} className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${importMode === 'excel' ? 'border-sky-500 bg-sky-50 text-[#154F7C] dark:border-sky-500/50 dark:bg-sky-500/10 dark:text-sky-300' : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800'}`}>Upload File</button>
                        <button type="button" onClick={() => setImportMode('paste')} className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${importMode === 'paste' ? 'border-sky-500 bg-sky-50 text-[#154F7C] dark:border-sky-500/50 dark:bg-sky-500/10 dark:text-sky-300' : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800'}`}>Paste Text</button>
                    </div>

                    {importMode === 'excel' ? (
                        <div className="space-y-4">
                            <div>
                                <InputLabel value="Select Excel or CSV File" />
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 mb-3 leading-relaxed">
                                    Please upload an Excel (.xlsx, .xls) or CSV file. The file should have columns for <strong>Name</strong> and <strong>Phone</strong> (other columns like Category are optional).
                                </p>
                                <input type="file" className="block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-sky-50 file:text-[#154F7C] hover:file:bg-sky-100 dark:file:bg-sky-500/10 dark:file:text-sky-300 dark:hover:file:bg-sky-500/20 transition-colors cursor-pointer" accept=".xlsx,.xls,.csv" onChange={(e) => importForm.setData('file', e.target.files[0])} />
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
                                <textarea className="w-full border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 focus:border-[#154F7C] dark:focus:border-sky-400 focus:ring-sky-500 rounded-lg shadow-sm min-h-[120px] text-sm p-3" placeholder="e.g.&#10;Neema Mbwana, 0712 345 678&#10;Baraka Juma, +255 789 123 456" value={importForm.data.raw_text} onChange={(e) => importForm.setData('raw_text', e.target.value)}></textarea>
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

                        <div className="pt-2 border-t border-slate-100 dark:border-white/[0.08] space-y-3">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                                <Coins className="w-3.5 h-3.5 text-[#154F7C] dark:text-sky-400" />
                                <span>Pledge Commitment (Optional)</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <InputLabel value={`Amount (${pledgeStats?.currency || 'TZS'})`} />
                                    <TextInput
                                        type="number"
                                        min="0"
                                        className="block w-full mt-1 text-sm py-2 px-3 rounded-lg"
                                        placeholder="e.g. 100000"
                                        value={addForm.data.pledge_amount}
                                        onChange={(e) => addForm.setData('pledge_amount', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <InputLabel value="Deadline" />
                                    <TextInput
                                        type="date"
                                        className="block w-full mt-1 text-sm py-2 px-3 rounded-lg"
                                        value={addForm.data.pledge_deadline}
                                        onChange={(e) => addForm.setData('pledge_deadline', e.target.value)}
                                    />
                                </div>
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
                            <h3 className="text-xl font-black text-slate-900 dark:text-white font-display">
                                Edit: {selectedGuest?.name}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
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

                        {/* 5. Pledge & Contribution Tracking */}
                        <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                                    <Coins className="w-4 h-4 text-[#154F7C] dark:text-sky-400" />
                                    <span>Pledge Commitment</span>
                                </div>
                                {selectedGuest && (
                                    <span className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400">
                                        Paid: <span className="font-bold text-slate-900 dark:text-white">{pledgeStats?.currency || 'TZS'} {Number(selectedGuest.paid_amount || 0).toLocaleString()}</span>
                                        <span className="text-slate-400 dark:text-slate-500"> / {Number(selectedGuest.pledge_amount || 0).toLocaleString()}</span>
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <InputLabel value={`Target Pledge (${pledgeStats?.currency || 'TZS'})`} />
                                    <TextInput
                                        type="number"
                                        min="0"
                                        className="block w-full text-xs font-bold py-2.5 rounded-xl mt-1"
                                        placeholder="e.g. 100000"
                                        value={editForm.data.pledge_amount}
                                        onChange={(e) => editForm.setData('pledge_amount', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <InputLabel value="Pledge Deadline" />
                                    <TextInput
                                        type="date"
                                        className="block w-full text-xs font-bold py-2.5 rounded-xl mt-1"
                                        value={editForm.data.pledge_deadline}
                                        onChange={(e) => editForm.setData('pledge_deadline', e.target.value)}
                                    />
                                </div>
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
                            <h3 className="text-xl font-black text-slate-900 dark:text-white font-display">
                                Invitation Pass Preview
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Pass preview for <span className="font-bold text-slate-700 dark:text-slate-200">{previewGuest?.name}</span>
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
                            {(event?.card_template || event?.cardTemplate || event?.card_template_id) ? (
                                <PersonalisedCard
                                    guest={previewGuest}
                                    event={event}
                                    template={event?.card_template || event?.cardTemplate}
                                    interactive={true}
                                />
                            ) : (
                                <div className="py-14 px-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] text-center flex flex-col items-center justify-center space-y-3">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/[0.06] text-slate-400 flex items-center justify-center">
                                        <Palette className="w-6 h-6" />
                                    </div>
                                    <div className="max-w-xs space-y-1">
                                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                            No Template Created Yet
                                        </h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            A pass template design has not been created or assigned to this event yet.
                                        </p>
                                    </div>
                                    {canCustomize && (
                                        <Link
                                            href={route('templates.index')}
                                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#154F7C] to-[#327FB5] hover:from-[#1A5C91] hover:to-[#3D8EC7] border border-sky-400/25 text-white text-xs font-bold transition shadow-xs shadow-[#154F7C]/20 cursor-pointer"
                                        >
                                            <Palette className="w-3.5 h-3.5" />
                                            <span>Create in Pass Studio</span>
                                        </Link>
                                    )}
                                </div>
                            )}
                            
                            {(event?.microsite_config?.admin_override === true || event?.is_executive_package === true) && (
                                <div className="p-3.5 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-600 dark:text-slate-400 font-medium">
                                            Direct Public Pass & Microsite URL:
                                        </span>
                                    </div>
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
                            )}
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

                        <div className="w-9 h-9 rounded-xl bg-sky-500/10 dark:bg-sky-500/20 text-[#154F7C] dark:text-sky-400 flex items-center justify-center flex-shrink-0">
                            <Palette className="w-4 h-4" />
                        </div>
                    </div>

                    {/* Template List: Just list the titles */}
                    <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                        {/* 1. None / No Template Design */}
                        <div
                            onClick={() => setSelectedTemplateId('')}
                            className={`px-4 py-3 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                                selectedTemplateId === '' || selectedTemplateId === null || selectedTemplateId === undefined
                                    ? 'border-sky-400 bg-sky-500/10 dark:bg-sky-500/15'
                                    : 'border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#08121E] hover:border-slate-300 dark:hover:border-white/[0.15]'
                            }`}
                        >
                            <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                                No Template Design (Empty)
                            </span>
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center border transition flex-shrink-0 ${
                                selectedTemplateId === '' || selectedTemplateId === null || selectedTemplateId === undefined
                                    ? 'bg-[#154F7C] border-[#154F7C] text-white'
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
                                            ? 'border-sky-400 bg-sky-500/10 dark:bg-sky-500/15'
                                            : 'border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#08121E] hover:border-slate-300 dark:hover:border-white/[0.15]'
                                    }`}
                                >
                                    <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                                        {tmpl.name}
                                    </span>
                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center border transition flex-shrink-0 ${
                                        isSelected
                                            ? 'bg-[#154F7C] border-[#154F7C] text-white'
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
            <Modal show={editEventModalOpen} onClose={() => setEditEventModalOpen(false)} maxWidth="3xl">
                <form onSubmit={handleEditEventSubmit} className="p-6 sm:p-7 space-y-5 overflow-y-auto max-h-[85vh]">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.08] pb-4">
                        <div>
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
                        <button
                            type="button"
                            onClick={() => setEditEventTab('details')}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${editEventTab === 'details' ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            <Settings className="w-3.5 h-3.5" />
                            Event Details
                        </button>
                        <button
                            type="button"
                            onClick={() => setEditEventTab('microsite')}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${editEventTab === 'microsite' ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            <Globe className="w-3.5 h-3.5" />
                            <span>Microsite</span>
                            {!canCustomizeMicrosite && (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-white/10 text-slate-600 dark:text-slate-300 ml-1">
                                    <Lock className="w-2.5 h-2.5" /> Executive
                                </span>
                            )}
                        </button>
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
                                    className="mt-1 block w-full rounded-2xl border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white text-xs font-bold py-2.5 px-3 focus:border-[#154F7C] dark:focus:border-sky-400 focus:ring-sky-500 shadow-2xs cursor-pointer"
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
                                    className="mt-1 block w-full rounded-2xl border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white text-xs font-bold py-2.5 px-3 focus:border-[#154F7C] dark:focus:border-sky-400 focus:ring-sky-500 shadow-2xs cursor-pointer"
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
                                    className="mt-1 block w-full rounded-2xl border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white text-xs font-bold py-2.5 px-3 focus:border-[#154F7C] dark:focus:border-sky-400 focus:ring-sky-500 shadow-2xs cursor-pointer"
                                    value={editEventForm.data.card_template_id}
                                    onChange={(e) => editEventForm.setData('card_template_id', e.target.value)}
                                >
                                    <option value="">No Template Design (Empty)</option>
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
                                className="mt-1 block w-full rounded-2xl border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white text-xs font-medium p-3 focus:border-[#154F7C] dark:focus:border-sky-400 focus:ring-sky-500 shadow-2xs"
                                placeholder="Additional details or notes..."
                                value={editEventForm.data.description}
                                onChange={(e) => editEventForm.setData('description', e.target.value)}
                            />
                        </div>
                    </div>
                    )}

                    {/* ── Microsite Tab ── */}
                    {editEventTab === 'microsite' && (
                        !canCustomizeMicrosite ? (
                            <div className="py-12 px-6 sm:px-8 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] text-center space-y-4">
                                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-200 flex items-center justify-center mx-auto shadow-2xs">
                                    <Globe className="w-6 h-6 stroke-[1.5]" />
                                </div>
                                <div className="max-w-sm mx-auto space-y-1">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                        Executive Event Microsite
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Interactive web invitations and custom landing pages are available on the Executive tier.
                                    </p>
                                </div>
                                <div className="pt-1 flex justify-center">
                                    <Link
                                        href={route('organizer.wallet.index')}
                                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#154F7C] to-[#327FB5] hover:from-[#1A5C91] hover:to-[#3D8EC7] border border-sky-400/25 text-white text-xs font-bold shadow-xs shadow-[#154F7C]/20 transition active:scale-95 cursor-pointer"
                                    >
                                        <Crown className="w-3.5 h-3.5" />
                                        <span>Upgrade to Executive (2,500 TZS / card)</span>
                                    </Link>
                                </div>
                            </div>
                        ) : (
                    <div className="space-y-5">
                        {/* Admin Override Banner / Toggle */}
                        {isAdmin && (
                            <div className="p-4 rounded-2xl border border-sky-200 dark:border-sky-500/20 bg-sky-50/50 dark:bg-sky-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
                                        <Crown className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                                            <span>Admin Override: Event Microsite Permission</span>
                                            {editEventForm.data.microsite_config?.admin_override && (
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold">Active</span>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                            Grant this specific event interactive microsite access regardless of organizer package purchase.
                                        </p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={!!editEventForm.data.microsite_config?.admin_override}
                                        onChange={(e) => editEventForm.setData('microsite_config', {
                                            ...editEventForm.data.microsite_config,
                                            admin_override: e.target.checked
                                        })}
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-sky-600"></div>
                                </label>
                            </div>
                        )}

                        {!isAdmin && event?.microsite_config?.admin_override && (
                            <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                                <Crown className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <span><strong>Admin Permission Override Active:</strong> Platform administration has unlocked the interactive microsite for this event.</span>
                            </div>
                        )}

                        {/* 1. Envelope & Opening Experience */}
                        <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.06] bg-white dark:bg-[#0C1525] shadow-xs space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06]">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-[#154F7C] dark:text-sky-400 flex items-center justify-center">
                                        <Film className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                            1. Opening Envelope & Audio
                                        </h4>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                            Wax seal envelope video opening and ambient background soundtrack.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <MediaInput
                                    id="ms_intro_poster"
                                    label="Sealed Envelope Cover (Poster)"
                                    placeholder="https://.../envelope.png"
                                    configKey="intro_poster_url"
                                    editEventForm={editEventForm}
                                    accept="image/*"
                                    helper="Static image with 'Tap to open' prompt before video plays."
                                />
                                <MediaInput
                                    id="ms_intro_video"
                                    label="Envelope Unfolding Video (MP4)"
                                    placeholder="https://.../envelope_open.mp4"
                                    configKey="intro_video_url"
                                    editEventForm={editEventForm}
                                    accept="video/mp4,video/*"
                                    helper="Smooth opening animation played once tapped."
                                />
                                <div>
                                    <InputLabel htmlFor="ms_gate_seal_color" value="Wax Seal Color (Envelope & Attendance RSVP)" className="text-xs font-semibold text-slate-700 dark:text-slate-300" />
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <input
                                            type="color"
                                            className="w-10 h-10 rounded-xl border border-slate-300 dark:border-white/10 p-1 cursor-pointer bg-white dark:bg-[#08121E]"
                                            value={editEventForm.data.microsite_config.gate_seal_color || '#5a0f1b'}
                                            onChange={(e) => editEventForm.setData('microsite_config', { ...editEventForm.data.microsite_config, gate_seal_color: e.target.value })}
                                        />
                                        <TextInput
                                            id="ms_gate_seal_color"
                                            type="text"
                                            className="block flex-1 text-xs py-2.5 px-3 rounded-xl bg-white dark:bg-[#08121E]"
                                            placeholder="#5a0f1b"
                                            value={editEventForm.data.microsite_config.gate_seal_color || '#5a0f1b'}
                                            onChange={(e) => editEventForm.setData('microsite_config', { ...editEventForm.data.microsite_config, gate_seal_color: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                                        {[
                                            { name: 'Burgundy', hex: '#5a0f1b' },
                                            { name: 'Emerald', hex: '#165b4c' },
                                            { name: 'Royal Navy', hex: '#1e3a8a' },
                                            { name: 'Antique Gold', hex: '#c5a059' },
                                            { name: 'Obsidian Black', hex: '#1a1a1a' },
                                            { name: 'Blush Rose', hex: '#d88a8a' },
                                        ].map(preset => (
                                            <button
                                                key={preset.name}
                                                type="button"
                                                onClick={() => editEventForm.setData('microsite_config', { ...editEventForm.data.microsite_config, gate_seal_color: preset.hex })}
                                                className={`text-[10px] px-2 py-1 rounded-md border flex items-center gap-1 transition-all ${
                                                    (editEventForm.data.microsite_config.gate_seal_color || '#5a0f1b').toLowerCase() === preset.hex.toLowerCase()
                                                        ? 'border-[#154F7C] bg-[#154F7C]/10 font-bold text-[#154F7C] dark:text-sky-300 dark:border-sky-500'
                                                        : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                                                }`}
                                            >
                                                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: preset.hex }} />
                                                {preset.name}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1">Both the envelope wax seal and the attendance RSVP wax seal will automatically match this color symmetrically.</p>
                                </div>
                                <div>
                                    <InputLabel htmlFor="ms_gate_seal_initials" value="Wax Seal Monogram / Initials" className="text-xs font-semibold text-slate-700 dark:text-slate-300" />
                                    <TextInput
                                        id="ms_gate_seal_initials"
                                        type="text"
                                        className="block w-full text-xs py-2.5 px-3 rounded-xl mt-1.5 bg-white dark:bg-[#08121E]"
                                        placeholder="e.g. R&Z, Z&R, or single initial"
                                        value={editEventForm.data.microsite_config.gate_seal_initials || ''}
                                        onChange={(e) => editEventForm.setData('microsite_config', { ...editEventForm.data.microsite_config, gate_seal_initials: e.target.value })}
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1">Leave empty to use the classic reference seal or enter custom initials (e.g. R&Z).</p>
                                </div>
                                <div className="sm:col-span-2">
                                    <MediaInput
                                        id="ms_gate_seal_image"
                                        label="Custom Envelope Wax Seal Image (Optional Override)"
                                        placeholder="https://.../custom_seal.png"
                                        configKey="gate_seal_image_url"
                                        editEventForm={editEventForm}
                                        accept="image/*"
                                        helper="Upload a custom crest, logo, or stamp PNG to replace the envelope seal badge."
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <MediaInput
                                        id="ms_music"
                                        label="Background Music / Soundtrack (MP3)"
                                        placeholder="https://.../soundtrack.mp3"
                                        configKey="music_url"
                                        editEventForm={editEventForm}
                                        accept="audio/*"
                                        helper="Looping ambient music playing softly in the background with floating toggle button."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2. Hero Swan Arch & Couple Banner */}
                        <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.06] bg-white dark:bg-[#0C1525] shadow-xs space-y-4">
                            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
                                <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-[#154F7C] dark:text-sky-400 flex items-center justify-center">
                                    <Heart className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                        2. Hero Arch & Couple Names
                                    </h4>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                        The signature swan arch header, couple names, wedding day tagline, and date.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="ms_pname" value="First Partner Name" className="text-xs font-semibold text-slate-700 dark:text-slate-300" />
                                    <TextInput
                                        id="ms_pname"
                                        type="text"
                                        className="block w-full text-xs py-2.5 px-3 rounded-xl mt-1.5 bg-white dark:bg-[#08121E]"
                                        placeholder="e.g. Zohan"
                                        value={editEventForm.data.microsite_config.primary_name}
                                        onChange={(e) => editEventForm.setData('microsite_config', { ...editEventForm.data.microsite_config, primary_name: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="ms_sname" value="Second Partner Name" className="text-xs font-semibold text-slate-700 dark:text-slate-300" />
                                    <TextInput
                                        id="ms_sname"
                                        type="text"
                                        className="block w-full text-xs py-2.5 px-3 rounded-xl mt-1.5 bg-white dark:bg-[#08121E]"
                                        placeholder="e.g. Rose"
                                        value={editEventForm.data.microsite_config.secondary_name}
                                        onChange={(e) => editEventForm.setData('microsite_config', { ...editEventForm.data.microsite_config, secondary_name: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="ms_tagline" value="Event Tagline / Subtitle" className="text-xs font-semibold text-slate-700 dark:text-slate-300" />
                                    <TextInput
                                        id="ms_tagline"
                                        type="text"
                                        className="block w-full text-xs py-2.5 px-3 rounded-xl mt-1.5 bg-white dark:bg-[#08121E]"
                                        placeholder="e.g. Wedding Day"
                                        value={editEventForm.data.microsite_config.event_tagline}
                                        onChange={(e) => editEventForm.setData('microsite_config', { ...editEventForm.data.microsite_config, event_tagline: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="ms_date_formatted" value="Hero Date Display" className="text-xs font-semibold text-slate-700 dark:text-slate-300" />
                                    <TextInput
                                        id="ms_date_formatted"
                                        type="text"
                                        className="block w-full text-xs py-2.5 px-3 rounded-xl mt-1.5 bg-white dark:bg-[#08121E]"
                                        placeholder="27.09.26"
                                        value={editEventForm.data.microsite_config.event_date_formatted}
                                        onChange={(e) => editEventForm.setData('microsite_config', { ...editEventForm.data.microsite_config, event_date_formatted: e.target.value })}
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <MediaInput
                                        id="ms_swans_video"
                                        label="Hero Arch Video (MOV/MP4)"
                                        placeholder="https://.../swans.mov"
                                        configKey="swans_video_url"
                                        editEventForm={editEventForm}
                                        accept="video/*"
                                        helper="Serene looping video displayed inside the gold arched window."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 3. Deckled Card 1: Romantic Verse & Invitation Text */}
                        <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.06] bg-white dark:bg-[#0C1525] shadow-xs space-y-4">
                            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
                                <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-[#154F7C] dark:text-sky-400 flex items-center justify-center">
                                    <Sparkles className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                        3. Romantic Verse & Invitation Message
                                    </h4>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                        The torn-paper deckled card with heartfelt quote and invitation wording.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <InputLabel htmlFor="ms_couple_verse" value="Romantic Verse / Quranic / Blessing Note" className="text-xs font-semibold text-slate-700 dark:text-slate-300" />
                                    <textarea
                                        id="ms_couple_verse"
                                        rows={3}
                                        className="block w-full text-xs py-2.5 px-3 rounded-xl mt-1.5 bg-white dark:bg-[#08121E] border-slate-300 dark:border-white/10"
                                        placeholder={"Two Souls\nOne destiny\nA Lifetime written by Allah"}
                                        value={editEventForm.data.microsite_config.couple_verse || ''}
                                        onChange={(e) => editEventForm.setData('microsite_config', { ...editEventForm.data.microsite_config, couple_verse: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="ms_host_honor" value="Audience Greeting / Salutation" className="text-xs font-semibold text-slate-700 dark:text-slate-300" />
                                        <TextInput
                                            id="ms_host_honor"
                                            type="text"
                                            className="block w-full text-xs py-2.5 px-3 rounded-xl mt-1.5 bg-white dark:bg-[#08121E]"
                                            placeholder="Dear Friends and Family"
                                            value={editEventForm.data.microsite_config.host_honor_text}
                                            onChange={(e) => editEventForm.setData('microsite_config', { ...editEventForm.data.microsite_config, host_honor_text: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="ms_invitation_text" value="Formal Invitation Note" className="text-xs font-semibold text-slate-700 dark:text-slate-300" />
                                        <TextInput
                                            id="ms_invitation_text"
                                            type="text"
                                            className="block w-full text-xs py-2.5 px-3 rounded-xl mt-1.5 bg-white dark:bg-[#08121E]"
                                            placeholder="Join us for an evening of love, laughter, duas, and unforgettable memories as we begin our forever."
                                            value={editEventForm.data.microsite_config.invitation_text}
                                            onChange={(e) => editEventForm.setData('microsite_config', { ...editEventForm.data.microsite_config, invitation_text: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 4. Live Countdown Timer */}
                        <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.06] bg-white dark:bg-[#0C1525] shadow-xs space-y-4">
                            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
                                <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-[#154F7C] dark:text-sky-400 flex items-center justify-center">
                                    <Clock className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                        4. Countdown Timer
                                    </h4>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                        Live gold metallic countdown clock synced with the event date.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="ms_countdown_title" value="Countdown Heading" className="text-xs font-semibold text-slate-700 dark:text-slate-300" />
                                    <TextInput
                                        id="ms_countdown_title"
                                        type="text"
                                        className="block w-full text-xs py-2.5 px-3 rounded-xl mt-1.5 bg-white dark:bg-[#08121E]"
                                        placeholder="The Celebration Begins In"
                                        value={editEventForm.data.microsite_config.countdown_title}
                                        onChange={(e) => editEventForm.setData('microsite_config', { ...editEventForm.data.microsite_config, countdown_title: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="ms_countdown_target" value="Custom Countdown Target Date (Optional)" className="text-xs font-semibold text-slate-700 dark:text-slate-300" />
                                    <TextInput
                                        id="ms_countdown_target"
                                        type="datetime-local"
                                        className="block w-full text-xs py-2.5 px-3 rounded-xl mt-1.5 bg-white dark:bg-[#08121E]"
                                        value={editEventForm.data.microsite_config.countdown_target_datetime || ''}
                                        onChange={(e) => editEventForm.setData('microsite_config', { ...editEventForm.data.microsite_config, countdown_target_datetime: e.target.value })}
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1">
                                        Defaults to event date & time ({editEventForm.data.event_date || 'Event Date'}). Setting a future date displays the live Days:Hours:Mins:Secs gold timer.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 5. Schedule of Events (5 Timeline Items) */}
                        <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.06] bg-white dark:bg-[#0C1525] shadow-xs space-y-4">
                            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
                                <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-[#154F7C] dark:text-sky-400 flex items-center justify-center">
                                    <Calendar className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                        5. Schedule of Events
                                    </h4>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                        Customise each timeline milestone on the gold floral itinerary.
                                    </p>
                                </div>
                            </div>

                            <div>
                                <InputLabel htmlFor="ms_sched_title" value="Section Heading" className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1" />
                                <TextInput
                                    id="ms_sched_title"
                                    type="text"
                                    className="block w-full text-xs py-2.5 px-3 rounded-xl bg-white dark:bg-[#08121E]"
                                    placeholder="Schedule of Events"
                                    value={editEventForm.data.microsite_config.schedule_title}
                                    onChange={(e) => editEventForm.setData('microsite_config', { ...editEventForm.data.microsite_config, schedule_title: e.target.value })}
                                />
                            </div>

                            <div className="space-y-3 pt-2">
                                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    5 Itinerary Items
                                </span>
                                {(editEventForm.data.microsite_config.programme || []).slice(0, 5).map((item, i) => (
                                    <div key={i} className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.05]">
                                        <span className="text-[11px] font-mono font-bold text-slate-400 w-5 text-center">
                                            #{i + 1}
                                        </span>
                                        <input
                                            type="text"
                                            className="w-24 sm:w-28 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#08121E] text-xs font-bold px-3 py-1.5 text-slate-900 dark:text-white"
                                            placeholder="5 PM"
                                            value={item.time}
                                            onChange={(e) => {
                                                const prog = [...(editEventForm.data.microsite_config.programme || [])];
                                                prog[i] = { ...prog[i], time: e.target.value };
                                                editEventForm.setData('microsite_config', { ...editEventForm.data.microsite_config, programme: prog });
                                            }}
                                        />
                                        <input
                                            type="text"
                                            className="flex-1 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#08121E] text-xs font-semibold px-3 py-1.5 text-slate-900 dark:text-white"
                                            placeholder="Milestone Title"
                                            value={item.title}
                                            onChange={(e) => {
                                                const prog = [...(editEventForm.data.microsite_config.programme || [])];
                                                prog[i] = { ...prog[i], title: e.target.value };
                                                editEventForm.setData('microsite_config', { ...editEventForm.data.microsite_config, programme: prog });
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 6. Venue & Interactive Map */}
                        <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.06] bg-white dark:bg-[#0C1525] shadow-xs space-y-4">
                            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
                                <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-[#154F7C] dark:text-sky-400 flex items-center justify-center">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                        6. Venue & Google Map
                                    </h4>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                        Location details and embedded Google Maps frame.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="ms_rec_title" value="Venue Name" className="text-xs font-semibold text-slate-700 dark:text-slate-300" />
                                    <TextInput
                                        id="ms_rec_title"
                                        type="text"
                                        className="block w-full text-xs py-2.5 px-3 rounded-xl mt-1.5 bg-white dark:bg-[#08121E]"
                                        placeholder="Islamic Center of Melville"
                                        value={editEventForm.data.microsite_config.reception_title}
                                        onChange={(e) => editEventForm.setData('microsite_config', { ...editEventForm.data.microsite_config, reception_title: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="ms_rec_sub" value="Venue Address" className="text-xs font-semibold text-slate-700 dark:text-slate-300" />
                                    <TextInput
                                        id="ms_rec_sub"
                                        type="text"
                                        className="block w-full text-xs py-2.5 px-3 rounded-xl mt-1.5 bg-white dark:bg-[#08121E]"
                                        placeholder="Address: 118 Old East Neck Road Melville, NY 11747"
                                        value={editEventForm.data.microsite_config.reception_subtitle}
                                        onChange={(e) => editEventForm.setData('microsite_config', { ...editEventForm.data.microsite_config, reception_subtitle: e.target.value })}
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <InputLabel htmlFor="ms_map_embed" value="Google Maps Embed URL (iframe src)" className="text-xs font-semibold text-slate-700 dark:text-slate-300" />
                                    <TextInput
                                        id="ms_map_embed"
                                        type="text"
                                        className="block w-full text-xs py-2.5 px-3 rounded-xl mt-1.5 bg-white dark:bg-[#08121E]"
                                        placeholder="https://www.google.com/maps/embed?pb=..."
                                        value={editEventForm.data.microsite_config.google_maps_embed_url}
                                        onChange={(e) => editEventForm.setData('microsite_config', { ...editEventForm.data.microsite_config, google_maps_embed_url: e.target.value })}
                                    />
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                                        Paste the embed link from Google Maps (Share → Embed a map → copy the src attribute).
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 7. Deckled Card 2: Dress Code & Gift Preference */}
                        <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.06] bg-white dark:bg-[#0C1525] shadow-xs space-y-4">
                            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
                                <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-[#154F7C] dark:text-sky-400 flex items-center justify-center">
                                    <Palette className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                        7. Dress Code & Gift Preference
                                    </h4>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                        The second deckled card detailing guest attire and gift guidance.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="ms_dress_title" value="Dress Code Title" className="text-xs font-semibold text-slate-700 dark:text-slate-300" />
                                    <TextInput
                                        id="ms_dress_title"
                                        type="text"
                                        className="block w-full text-xs py-2.5 px-3 rounded-xl mt-1.5 bg-white dark:bg-[#08121E]"
                                        placeholder="Dress Code"
                                        value={editEventForm.data.microsite_config.dress_code_title}
                                        onChange={(e) => editEventForm.setData('microsite_config', { ...editEventForm.data.microsite_config, dress_code_title: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="ms_dress_note" value="Dress Code Note" className="text-xs font-semibold text-slate-700 dark:text-slate-300" />
                                    <TextInput
                                        id="ms_dress_note"
                                        type="text"
                                        className="block w-full text-xs py-2.5 px-3 rounded-xl mt-1.5 bg-white dark:bg-[#08121E]"
                                        placeholder="We kindly ask guests to avoid deep red and maroon attire for the celebration."
                                        value={editEventForm.data.microsite_config.dress_code_note}
                                        onChange={(e) => editEventForm.setData('microsite_config', { ...editEventForm.data.microsite_config, dress_code_note: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="ms_gift_title" value="Gift Preference Title" className="text-xs font-semibold text-slate-700 dark:text-slate-300" />
                                    <TextInput
                                        id="ms_gift_title"
                                        type="text"
                                        className="block w-full text-xs py-2.5 px-3 rounded-xl mt-1.5 bg-white dark:bg-[#08121E]"
                                        placeholder="Gift Preference"
                                        value={editEventForm.data.microsite_config.gift_preference_title}
                                        onChange={(e) => editEventForm.setData('microsite_config', { ...editEventForm.data.microsite_config, gift_preference_title: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="ms_gift_note" value="Gift Preference Note" className="text-xs font-semibold text-slate-700 dark:text-slate-300" />
                                    <TextInput
                                        id="ms_gift_note"
                                        type="text"
                                        className="block w-full text-xs py-2.5 px-3 rounded-xl mt-1.5 bg-white dark:bg-[#08121E]"
                                        placeholder="Kindly, no boxed gifts please."
                                        value={editEventForm.data.microsite_config.gift_preference_note}
                                        onChange={(e) => editEventForm.setData('microsite_config', { ...editEventForm.data.microsite_config, gift_preference_note: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 8. RSVP Confirmation & Modal Form */}
                        <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.06] bg-white dark:bg-[#0C1525] shadow-xs space-y-4">
                            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
                                <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-[#154F7C] dark:text-sky-400 flex items-center justify-center">
                                    <CheckCircle2 className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                        8. RSVP Attendance
                                    </h4>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                        Confirmation card headings and popup RSVP deadline.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="ms_rsvp_head" value="RSVP Heading" className="text-xs font-semibold text-slate-700 dark:text-slate-300" />
                                    <TextInput
                                        id="ms_rsvp_head"
                                        type="text"
                                        className="block w-full text-xs py-2.5 px-3 rounded-xl mt-1.5 bg-white dark:bg-[#08121E]"
                                        placeholder="Confirm Your Attendance"
                                        value={editEventForm.data.microsite_config.rsvp_heading}
                                        onChange={(e) => editEventForm.setData('microsite_config', { ...editEventForm.data.microsite_config, rsvp_heading: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="ms_rsvp_deadline" value="RSVP Deadline Note" className="text-xs font-semibold text-slate-700 dark:text-slate-300" />
                                    <TextInput
                                        id="ms_rsvp_deadline"
                                        type="text"
                                        className="block w-full text-xs py-2.5 px-3 rounded-xl mt-1.5 bg-white dark:bg-[#08121E]"
                                        placeholder="Please RSVP before August 09"
                                        value={editEventForm.data.microsite_config.rsvp_deadline}
                                        onChange={(e) => editEventForm.setData('microsite_config', { ...editEventForm.data.microsite_config, rsvp_deadline: e.target.value })}
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <InputLabel htmlFor="ms_rsvp_sub" value="RSVP Subtext / Call to Action" className="text-xs font-semibold text-slate-700 dark:text-slate-300" />
                                    <TextInput
                                        id="ms_rsvp_sub"
                                        type="text"
                                        className="block w-full text-xs py-2.5 px-3 rounded-xl mt-1.5 bg-white dark:bg-[#08121E]"
                                        placeholder="To help us prepare for a joyful celebration, kindly confirm your attendance."
                                        value={editEventForm.data.microsite_config.rsvp_subtext}
                                        onChange={(e) => editEventForm.setData('microsite_config', { ...editEventForm.data.microsite_config, rsvp_subtext: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 9. Footer & Portrait Photo */}
                        <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.06] bg-white dark:bg-[#0C1525] shadow-xs space-y-4">
                            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
                                <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-[#154F7C] dark:text-sky-400 flex items-center justify-center">
                                    <Camera className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                        9. Footer & Photo
                                    </h4>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                        Closing message, couple signature, and couple portrait photo.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="ms_foot_quote" value="Footer Closing Quote" className="text-xs font-semibold text-slate-700 dark:text-slate-300" />
                                    <TextInput
                                        id="ms_foot_quote"
                                        type="text"
                                        className="block w-full text-xs py-2.5 px-3 rounded-xl mt-1.5 bg-white dark:bg-[#08121E]"
                                        placeholder="Hope to see you there!"
                                        value={editEventForm.data.microsite_config.footer_quote}
                                        onChange={(e) => editEventForm.setData('microsite_config', { ...editEventForm.data.microsite_config, footer_quote: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="ms_foot_names" value="Footer Couple Names" className="text-xs font-semibold text-slate-700 dark:text-slate-300" />
                                    <TextInput
                                        id="ms_foot_names"
                                        type="text"
                                        className="block w-full text-xs py-2.5 px-3 rounded-xl mt-1.5 bg-white dark:bg-[#08121E]"
                                        placeholder="Zohan and Rose"
                                        value={editEventForm.data.microsite_config.footer_names}
                                        onChange={(e) => editEventForm.setData('microsite_config', { ...editEventForm.data.microsite_config, footer_names: e.target.value })}
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <MediaInput
                                        id="ms_cover_photo"
                                        label="Footer Couple Portrait Photo"
                                        placeholder="https://.../photo.jpg"
                                        configKey="cover_photo"
                                        editEventForm={editEventForm}
                                        accept="image/*"
                                        helper="Closing portrait picture presented at the bottom of the invitation."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 10. Luxury Styling & Colors */}
                        <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.06] bg-white dark:bg-[#0C1525] shadow-xs space-y-4">
                            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
                                <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-[#154F7C] dark:text-sky-400 flex items-center justify-center">
                                    <Palette className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                        10. Colors & Prompts
                                    </h4>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                        Theme background tone, gold metallic accents, and interactive action labels.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="ms_theme_color" value="Background Tone Color" className="text-xs font-semibold text-slate-700 dark:text-slate-300" />
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <input
                                            type="color"
                                            className="w-10 h-10 rounded-xl border border-slate-300 dark:border-white/10 p-1 cursor-pointer bg-white dark:bg-[#08121E]"
                                            value={editEventForm.data.microsite_config.theme_color || '#f9f0e0'}
                                            onChange={(e) => editEventForm.setData('microsite_config', { ...editEventForm.data.microsite_config, theme_color: e.target.value })}
                                        />
                                        <TextInput
                                            id="ms_theme_color"
                                            type="text"
                                            className="block flex-1 text-xs py-2.5 px-3 rounded-xl bg-white dark:bg-[#08121E]"
                                            placeholder="#f9f0e0"
                                            value={editEventForm.data.microsite_config.theme_color || '#f9f0e0'}
                                            onChange={(e) => editEventForm.setData('microsite_config', { ...editEventForm.data.microsite_config, theme_color: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <InputLabel htmlFor="ms_accent_color" value="Primary Gold Accent Color" className="text-xs font-semibold text-slate-700 dark:text-slate-300" />
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <input
                                            type="color"
                                            className="w-10 h-10 rounded-xl border border-slate-300 dark:border-white/10 p-1 cursor-pointer bg-white dark:bg-[#08121E]"
                                            value={editEventForm.data.microsite_config.accent_color || '#a67d2b'}
                                            onChange={(e) => editEventForm.setData('microsite_config', { ...editEventForm.data.microsite_config, accent_color: e.target.value })}
                                        />
                                        <TextInput
                                            id="ms_accent_color"
                                            type="text"
                                            className="block flex-1 text-xs py-2.5 px-3 rounded-xl bg-white dark:bg-[#08121E]"
                                            placeholder="#a67d2b"
                                            value={editEventForm.data.microsite_config.accent_color || '#a67d2b'}
                                            onChange={(e) => editEventForm.setData('microsite_config', { ...editEventForm.data.microsite_config, accent_color: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <InputLabel htmlFor="ms_intro_btn_text" value="Envelope Open Prompt" className="text-xs font-semibold text-slate-700 dark:text-slate-300" />
                                    <TextInput
                                        id="ms_intro_btn_text"
                                        type="text"
                                        className="block w-full text-xs py-2.5 px-3 rounded-xl mt-1.5 bg-white dark:bg-[#08121E]"
                                        placeholder="Tap to open"
                                        value={editEventForm.data.microsite_config.intro_button_text}
                                        onChange={(e) => editEventForm.setData('microsite_config', { ...editEventForm.data.microsite_config, intro_button_text: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="ms_scroll_text" value="Scroll Down Indicator" className="text-xs font-semibold text-slate-700 dark:text-slate-300" />
                                    <TextInput
                                        id="ms_scroll_text"
                                        type="text"
                                        className="block w-full text-xs py-2.5 px-3 rounded-xl mt-1.5 bg-white dark:bg-[#08121E]"
                                        placeholder="Scroll down"
                                        value={editEventForm.data.microsite_config.scroll_down_text}
                                        onChange={(e) => editEventForm.setData('microsite_config', { ...editEventForm.data.microsite_config, scroll_down_text: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="ms_venue_badge" value="Venue Eyebrow Badge" className="text-xs font-semibold text-slate-700 dark:text-slate-300" />
                                    <TextInput
                                        id="ms_venue_badge"
                                        type="text"
                                        className="block w-full text-xs py-2.5 px-3 rounded-xl mt-1.5 bg-white dark:bg-[#08121E]"
                                        placeholder="Location"
                                        value={editEventForm.data.microsite_config.venue_badge}
                                        onChange={(e) => editEventForm.setData('microsite_config', { ...editEventForm.data.microsite_config, venue_badge: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="ms_rsvp_open_label" value="Wax Seal Prompt Label" className="text-xs font-semibold text-slate-700 dark:text-slate-300" />
                                    <TextInput
                                        id="ms_rsvp_open_label"
                                        type="text"
                                        className="block w-full text-xs py-2.5 px-3 rounded-xl mt-1.5 bg-white dark:bg-[#08121E]"
                                        placeholder="Click to open"
                                        value={editEventForm.data.microsite_config.rsvp_open_label}
                                        onChange={(e) => editEventForm.setData('microsite_config', { ...editEventForm.data.microsite_config, rsvp_open_label: e.target.value })}
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <MediaInput
                                        id="ms_wax_seal_img"
                                        label="Custom Wax Seal Image / Emblem"
                                        placeholder="https://.../wax_seal.png"
                                        configKey="wax_seal_image_url"
                                        editEventForm={editEventForm}
                                        accept="image/*"
                                        helper="Custom wax stamp artwork used for the attendance confirmation seal."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 11. RSVP Form Labels & Submit Action */}
                        <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.06] bg-white dark:bg-[#0C1525] shadow-xs space-y-4">
                            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
                                <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-[#154F7C] dark:text-sky-400 flex items-center justify-center">
                                    <FileSpreadsheet className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                        11. RSVP Form Questions & Submit Button
                                    </h4>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                        Customise each question displayed inside the guest RSVP popup dialog.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="ms_rsvp_btn" value="RSVP Submit Button Text" className="text-xs font-semibold text-slate-700 dark:text-slate-300" />
                                    <TextInput
                                        id="ms_rsvp_btn"
                                        type="text"
                                        className="block w-full text-xs py-2.5 px-3 rounded-xl mt-1.5 bg-white dark:bg-[#08121E]"
                                        placeholder="Submit"
                                        value={editEventForm.data.microsite_config.rsvp_submit_label}
                                        onChange={(e) => editEventForm.setData('microsite_config', { ...editEventForm.data.microsite_config, rsvp_submit_label: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="ms_f_name" value="Guest Name Field Label" className="text-xs font-semibold text-slate-700 dark:text-slate-300" />
                                    <TextInput
                                        id="ms_f_name"
                                        type="text"
                                        className="block w-full text-xs py-2.5 px-3 rounded-xl mt-1.5 bg-white dark:bg-[#08121E]"
                                        placeholder="Your name"
                                        value={editEventForm.data.microsite_config.rsvp_field_name}
                                        onChange={(e) => editEventForm.setData('microsite_config', { ...editEventForm.data.microsite_config, rsvp_field_name: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="ms_f_att" value="Attendance Question" className="text-xs font-semibold text-slate-700 dark:text-slate-300" />
                                    <TextInput
                                        id="ms_f_att"
                                        type="text"
                                        className="block w-full text-xs py-2.5 px-3 rounded-xl mt-1.5 bg-white dark:bg-[#08121E]"
                                        placeholder="Will you be attending?"
                                        value={editEventForm.data.microsite_config.rsvp_field_attending}
                                        onChange={(e) => editEventForm.setData('microsite_config', { ...editEventForm.data.microsite_config, rsvp_field_attending: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="ms_f_count" value="Guest Count Question" className="text-xs font-semibold text-slate-700 dark:text-slate-300" />
                                    <TextInput
                                        id="ms_f_count"
                                        type="text"
                                        className="block w-full text-xs py-2.5 px-3 rounded-xl mt-1.5 bg-white dark:bg-[#08121E]"
                                        placeholder="Number of Guests Attending"
                                        value={editEventForm.data.microsite_config.rsvp_field_guest_count}
                                        onChange={(e) => editEventForm.setData('microsite_config', { ...editEventForm.data.microsite_config, rsvp_field_guest_count: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="ms_f_song" value="Song Request Question" className="text-xs font-semibold text-slate-700 dark:text-slate-300" />
                                    <TextInput
                                        id="ms_f_song"
                                        type="text"
                                        className="block w-full text-xs py-2.5 px-3 rounded-xl mt-1.5 bg-white dark:bg-[#08121E]"
                                        placeholder="A Song That Gets You Dancing"
                                        value={editEventForm.data.microsite_config.rsvp_field_song}
                                        onChange={(e) => editEventForm.setData('microsite_config', { ...editEventForm.data.microsite_config, rsvp_field_song: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="ms_f_children" value="Children Attending Question" className="text-xs font-semibold text-slate-700 dark:text-slate-300" />
                                    <TextInput
                                        id="ms_f_children"
                                        type="text"
                                        className="block w-full text-xs py-2.5 px-3 rounded-xl mt-1.5 bg-white dark:bg-[#08121E]"
                                        placeholder="Children Attending"
                                        value={editEventForm.data.microsite_config.rsvp_field_children}
                                        onChange={(e) => editEventForm.setData('microsite_config', { ...editEventForm.data.microsite_config, rsvp_field_children: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    ))}

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

            {/* Modal: Record Payment Installment */}
            <Modal show={recordPaymentModalOpen} onClose={() => { setRecordPaymentModalOpen(false); setSelectedPledgeGuest(null); }} maxWidth="md">
                <form onSubmit={handleRecordPaymentSubmit} className="p-6">
                    <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100 dark:border-white/[0.08]">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center font-bold">
                                <Wallet className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">Record Contribution Payment</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Log an installment received from contributor</p>
                            </div>
                        </div>
                        <button type="button" onClick={() => { setRecordPaymentModalOpen(false); setSelectedPledgeGuest(null); }} className="text-slate-400 hover:text-slate-600 transition">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Contributor Selection */}
                        <div>
                            <InputLabel value="Select Contributor *" />
                            <select
                                className="block w-full mt-1 text-sm py-2 px-3 rounded-lg border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white"
                                value={selectedPledgeGuest?.id || ''}
                                onChange={(e) => {
                                    const g = (guests?.data || []).find(x => String(x.id) === e.target.value);
                                    setSelectedPledgeGuest(g || null);
                                    if (g) {
                                        const bal = Math.max(0, Number(g.pledge_amount || 0) - Number(g.paid_amount || 0));
                                        recordPaymentForm.setData('amount', bal > 0 ? bal : '');
                                    }
                                }}
                                required
                            >
                                <option value="">-- Choose Contributor --</option>
                                {(guests?.data || []).map(g => (
                                    <option key={g.id} value={g.id}>
                                        {g.name} ({g.phone}) {Number(g.pledge_amount || 0) > 0 ? `- Ahadi: ${pledgeStats?.currency || 'TZS'} ${Number(g.pledge_amount).toLocaleString()}` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedPledgeGuest && (
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] text-xs flex items-center justify-between">
                                <div>
                                    <span className="text-slate-400">Pledged: </span>
                                    <strong className="text-slate-900 dark:text-white">{pledgeStats?.currency || 'TZS'} {Number(selectedPledgeGuest.pledge_amount || 0).toLocaleString()}</strong>
                                </div>
                                <div>
                                    <span className="text-slate-400">Paid: </span>
                                    <strong className="text-emerald-600 dark:text-emerald-400">{pledgeStats?.currency || 'TZS'} {Number(selectedPledgeGuest.paid_amount || 0).toLocaleString()}</strong>
                                </div>
                                <div>
                                    <span className="text-slate-400">Balance: </span>
                                    <strong className="text-[#154F7C] dark:text-sky-400">{pledgeStats?.currency || 'TZS'} {Math.max(0, Number(selectedPledgeGuest.pledge_amount || 0) - Number(selectedPledgeGuest.paid_amount || 0)).toLocaleString()}</strong>
                                </div>
                            </div>
                        )}

                        {/* Amount */}
                        <div>
                            <InputLabel value={`Payment Amount (${pledgeStats?.currency || 'TZS'}) *`} />
                            <TextInput
                                type="number"
                                min="1"
                                className="block w-full mt-1 text-sm py-2 px-3 rounded-lg font-bold font-mono"
                                placeholder="e.g. 50000"
                                value={recordPaymentForm.data.amount}
                                onChange={(e) => recordPaymentForm.setData('amount', e.target.value)}
                                required
                            />
                        </div>

                        {/* Payment Method & Date */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <InputLabel value="Payment Method *" />
                                <select
                                    className="block w-full mt-1 text-sm py-2 px-3 rounded-lg border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white"
                                    value={recordPaymentForm.data.payment_method}
                                    onChange={(e) => recordPaymentForm.setData('payment_method', e.target.value)}
                                    required
                                >
                                    <option value="mpesa">M-Pesa</option>
                                    <option value="airtel">Airtel Money</option>
                                    <option value="tigo">Tigo / Mixx</option>
                                    <option value="halopesa">HaloPesa</option>
                                    <option value="azampesa">AzamPesa</option>
                                    <option value="bank">Bank Transfer</option>
                                    <option value="cash">Cash (Taslimu)</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <InputLabel value="Payment Date *" />
                                <TextInput
                                    type="date"
                                    className="block w-full mt-1 text-sm py-2 px-3 rounded-lg"
                                    value={recordPaymentForm.data.payment_date}
                                    onChange={(e) => recordPaymentForm.setData('payment_date', e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Reference / Transaction ID */}
                        <div>
                            <InputLabel value="Reference / Transaction Code (Optional)" />
                            <TextInput
                                type="text"
                                className="block w-full mt-1 text-sm py-2 px-3 rounded-lg uppercase font-mono"
                                placeholder="e.g. QWE456RTY8"
                                value={recordPaymentForm.data.reference}
                                onChange={(e) => recordPaymentForm.setData('reference', e.target.value)}
                            />
                        </div>

                        {/* Notes */}
                        <div>
                            <InputLabel value="Notes (Optional)" />
                            <TextInput
                                type="text"
                                className="block w-full mt-1 text-sm py-2 px-3 rounded-lg"
                                placeholder="e.g. Paid via committee treasurer"
                                value={recordPaymentForm.data.notes}
                                onChange={(e) => recordPaymentForm.setData('notes', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-white/[0.08]">
                        <SecondaryButton onClick={() => { setRecordPaymentModalOpen(false); setSelectedPledgeGuest(null); }} className="!rounded-lg !py-2 !px-4 text-sm cursor-pointer">Cancel</SecondaryButton>
                        <PrimaryButton disabled={recordPaymentForm.processing || !selectedPledgeGuest?.id || !recordPaymentForm.data.amount} className="!rounded-lg !py-2 !px-4 text-sm gap-1.5 cursor-pointer bg-gradient-to-r from-emerald-600 to-teal-600">
                            <Check className="w-4 h-4" />
                            <span>Save Payment</span>
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal: Add Contributor / Pledge */}
            <Modal show={addPledgeModalOpen} onClose={() => setAddPledgeModalOpen(false)} maxWidth="md">
                <form onSubmit={handleAddPledgeSubmit} className="p-6">
                    <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100 dark:border-white/[0.08]">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-[#154F7C] dark:bg-sky-500/20 dark:text-sky-300 flex items-center justify-center font-bold">
                                <Receipt className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">Add Contributor Pledge</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Register a new pledge commitment</p>
                            </div>
                        </div>
                        <button type="button" onClick={() => setAddPledgeModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Mode Switcher: Existing Guest vs New Contributor */}
                    <div className="flex gap-2 mb-5">
                        <button
                            type="button"
                            onClick={() => {
                                setPledgeContributorType('existing');
                                addPledgeForm.setData('guest_id', '');
                            }}
                            className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-colors ${
                                pledgeContributorType === 'existing'
                                    ? 'border-sky-500 bg-sky-50 text-[#154F7C] dark:border-sky-500/50 dark:bg-sky-500/10 dark:text-sky-300'
                                    : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400'
                            }`}
                        >
                            Select Existing Attendee
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setPledgeContributorType('new');
                                addPledgeForm.setData('guest_id', '');
                            }}
                            className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-colors ${
                                pledgeContributorType === 'new'
                                    ? 'border-sky-500 bg-sky-50 text-[#154F7C] dark:border-sky-500/50 dark:bg-sky-500/10 dark:text-sky-300'
                                    : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400'
                            }`}
                        >
                            + New Contributor
                        </button>
                    </div>

                    <div className="space-y-4">
                        {pledgeContributorType === 'existing' ? (
                            <div>
                                <InputLabel value="Choose Guest *" />
                                <select
                                    className="block w-full mt-1 text-sm py-2 px-3 rounded-lg border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white"
                                    value={addPledgeForm.data.guest_id}
                                    onChange={(e) => addPledgeForm.setData('guest_id', e.target.value)}
                                    required={pledgeContributorType === 'existing'}
                                >
                                    <option value="">-- Choose Attendee --</option>
                                    {(guests?.data || []).map(g => (
                                        <option key={g.id} value={g.id}>
                                            {g.name} ({g.phone})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <>
                                <div>
                                    <InputLabel value="Full Name *" />
                                    <TextInput
                                        type="text"
                                        className="block w-full mt-1 text-sm py-2 px-3 rounded-lg"
                                        placeholder="e.g. Neema Mbwana"
                                        value={addPledgeForm.data.name}
                                        onChange={(e) => addPledgeForm.setData('name', e.target.value)}
                                        required={pledgeContributorType === 'new'}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <InputLabel value="Phone Number *" />
                                        <TextInput
                                            type="text"
                                            className="block w-full mt-1 text-sm py-2 px-3 rounded-lg"
                                            placeholder="e.g. 0712 345 678"
                                            value={addPledgeForm.data.phone}
                                            onChange={(e) => addPledgeForm.setData('phone', e.target.value)}
                                            required={pledgeContributorType === 'new'}
                                        />
                                    </div>
                                    <div>
                                        <InputLabel value="Category / Group" />
                                        <TextInput
                                            type="text"
                                            className="block w-full mt-1 text-sm py-2 px-3 rounded-lg"
                                            placeholder="e.g. Wanakamati, Rafiki"
                                            value={addPledgeForm.data.category}
                                            onChange={(e) => addPledgeForm.setData('category', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Pledge Amount & Deadline */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <InputLabel value={`Pledge Amount (${pledgeStats?.currency || 'TZS'}) *`} />
                                <TextInput
                                    type="number"
                                    min="1"
                                    className="block w-full mt-1 text-sm py-2 px-3 rounded-lg font-bold"
                                    placeholder="e.g. 100000"
                                    value={addPledgeForm.data.pledge_amount}
                                    onChange={(e) => addPledgeForm.setData('pledge_amount', e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <InputLabel value="Target Date / Deadline" />
                                <TextInput
                                    type="date"
                                    className="block w-full mt-1 text-sm py-2 px-3 rounded-lg"
                                    value={addPledgeForm.data.pledge_deadline}
                                    onChange={(e) => addPledgeForm.setData('pledge_deadline', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Initial Payment Section */}
                        <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] space-y-3">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                                <Wallet className="w-3.5 h-3.5 text-[#154F7C] dark:text-sky-400" />
                                <span>Initial Payment Installment (Optional)</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <InputLabel value="Amount Paid Now" />
                                    <TextInput
                                        type="number"
                                        min="0"
                                        className="block w-full mt-1 text-sm py-2 px-3 rounded-lg font-bold font-mono"
                                        placeholder="0"
                                        value={addPledgeForm.data.initial_paid}
                                        onChange={(e) => addPledgeForm.setData('initial_paid', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <InputLabel value="Payment Method" />
                                    <select
                                        className="block w-full mt-1 text-sm py-2 px-3 rounded-lg border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white"
                                        value={addPledgeForm.data.payment_method}
                                        onChange={(e) => addPledgeForm.setData('payment_method', e.target.value)}
                                    >
                                        <option value="mpesa">M-Pesa</option>
                                        <option value="airtel">Airtel Money</option>
                                        <option value="tigo">Tigo / Mixx</option>
                                        <option value="halopesa">HaloPesa</option>
                                        <option value="azampesa">AzamPesa</option>
                                        <option value="bank">Bank</option>
                                        <option value="cash">Cash</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-white/[0.08]">
                        <SecondaryButton onClick={() => setAddPledgeModalOpen(false)} className="!rounded-lg !py-2 !px-4 text-sm cursor-pointer">Cancel</SecondaryButton>
                        <PrimaryButton disabled={addPledgeForm.processing} className="!rounded-lg !py-2 !px-4 text-sm gap-1.5 cursor-pointer">
                            <Check className="w-4 h-4" />
                            <span>Save Contributor</span>
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal: Pledge Campaign Settings */}
            <Modal show={pledgeSettingsModalOpen} onClose={() => setPledgeSettingsModalOpen(false)} maxWidth="md">
                <form onSubmit={handlePledgeSettingsSubmit} className="p-6">
                    <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100 dark:border-white/[0.08]">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-[#154F7C] dark:bg-sky-500/20 dark:text-sky-300 flex items-center justify-center font-bold">
                                <Settings className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">Campaign & Payment Settings</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Set event target budget and payment account details</p>
                            </div>
                        </div>
                        <button type="button" onClick={() => setPledgeSettingsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <InputLabel value="Target Budget" />
                                <TextInput
                                    type="number"
                                    min="0"
                                    className="block w-full mt-1 text-xs sm:text-sm py-2 px-3 rounded-lg font-bold"
                                    placeholder="e.g. 15000000"
                                    value={pledgeSettingsForm.data.pledge_target}
                                    onChange={(e) => pledgeSettingsForm.setData('pledge_target', e.target.value)}
                                />
                            </div>
                            <div>
                                <InputLabel value="Currency" />
                                <select
                                    className="block w-full mt-1 text-xs sm:text-[13px] py-2 pl-3 pr-8 rounded-lg border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-sky-500/20 focus:border-[#154F7C] dark:focus:border-sky-400"
                                    value={pledgeSettingsForm.data.pledge_currency}
                                    onChange={(e) => pledgeSettingsForm.setData('pledge_currency', e.target.value)}
                                >
                                    <option value="TZS">TZS (Tanzanian Shilling)</option>
                                    <option value="USD">USD (US Dollar)</option>
                                    <option value="KES">KES (Kenyan Shilling)</option>
                                    <option value="UGX">UGX (Ugandan Shilling)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <InputLabel value="Campaign Deadline" />
                            <TextInput
                                type="date"
                                className="block w-full mt-1 text-sm py-2 px-3 rounded-lg"
                                value={pledgeSettingsForm.data.pledge_deadline}
                                onChange={(e) => pledgeSettingsForm.setData('pledge_deadline', e.target.value)}
                            />
                        </div>

                        <div className="pt-2 border-t border-slate-100 dark:border-white/[0.08] space-y-3">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                                <Wallet className="w-3.5 h-3.5 text-sky-500" />
                                <span>Official Payment Channels for Contributors</span>
                            </div>

                            <div>
                                <InputLabel value="Lipa Namba / Till / Paybill" />
                                <TextInput
                                    type="text"
                                    className="block w-full mt-1 text-sm py-2 px-3 rounded-lg font-mono font-bold"
                                    placeholder="e.g. 5432100 (M-Pesa Buy Goods / Till)"
                                    value={pledgeSettingsForm.data.pledge_settings?.lipa_number}
                                    onChange={(e) => pledgeSettingsForm.setData('pledge_settings', {
                                        ...pledgeSettingsForm.data.pledge_settings,
                                        lipa_number: e.target.value
                                    })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <InputLabel value="Bank Name" />
                                    <TextInput
                                        type="text"
                                        className="block w-full mt-1 text-sm py-2 px-3 rounded-lg"
                                        placeholder="e.g. CRDB Bank, NMB"
                                        value={pledgeSettingsForm.data.pledge_settings?.bank_name}
                                        onChange={(e) => pledgeSettingsForm.setData('pledge_settings', {
                                            ...pledgeSettingsForm.data.pledge_settings,
                                            bank_name: e.target.value
                                        })}
                                    />
                                </div>
                                <div>
                                    <InputLabel value="Account Number" />
                                    <TextInput
                                        type="text"
                                        className="block w-full mt-1 text-sm py-2 px-3 rounded-lg font-mono font-bold"
                                        placeholder="e.g. 0150123456789"
                                        value={pledgeSettingsForm.data.pledge_settings?.account_number}
                                        onChange={(e) => pledgeSettingsForm.setData('pledge_settings', {
                                            ...pledgeSettingsForm.data.pledge_settings,
                                            account_number: e.target.value
                                        })}
                                    />
                                </div>
                            </div>

                            <div>
                                <InputLabel value="Account Name" />
                                <TextInput
                                    type="text"
                                    className="block w-full mt-1 text-sm py-2 px-3 rounded-lg"
                                    placeholder="e.g. Wedding Committee Account"
                                    value={pledgeSettingsForm.data.pledge_settings?.account_name}
                                    onChange={(e) => pledgeSettingsForm.setData('pledge_settings', {
                                        ...pledgeSettingsForm.data.pledge_settings,
                                        account_name: e.target.value
                                    })}
                                />
                            </div>

                            <div>
                                <InputLabel value="Payment Instructions / Note" />
                                <TextInput
                                    type="text"
                                    className="block w-full mt-1 text-sm py-2 px-3 rounded-lg"
                                    placeholder="e.g. Please put your name as reference when paying"
                                    value={pledgeSettingsForm.data.pledge_settings?.instructions}
                                    onChange={(e) => pledgeSettingsForm.setData('pledge_settings', {
                                        ...pledgeSettingsForm.data.pledge_settings,
                                        instructions: e.target.value
                                    })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-white/[0.08]">
                        <SecondaryButton onClick={() => setPledgeSettingsModalOpen(false)} className="!rounded-lg !py-2 !px-4 text-sm cursor-pointer">Cancel</SecondaryButton>
                        <PrimaryButton disabled={pledgeSettingsForm.processing} className="!rounded-lg !py-2 !px-4 text-sm gap-1.5 cursor-pointer">
                            <Check className="w-4 h-4" />
                            <span>Save Settings</span>
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal: Contributor Payment History Breakdown */}
            <Modal show={pledgeHistoryModalOpen} onClose={() => { setPledgeHistoryModalOpen(false); setSelectedPledgeGuest(null); }} maxWidth="md">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100 dark:border-white/[0.08]">
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                {selectedPledgeGuest?.name}'s Contributions
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Phone: {selectedPledgeGuest?.phone} • Card: {selectedPledgeGuest?.card_number || '---'}
                            </p>
                        </div>
                        <button type="button" onClick={() => { setPledgeHistoryModalOpen(false); setSelectedPledgeGuest(null); }} className="text-slate-400 hover:text-slate-600 transition">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {selectedPledgeGuest && (
                        <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] text-center mb-4 text-xs">
                            <div>
                                <span className="text-slate-400 block text-[10px] font-bold">PLEDGED</span>
                                <strong className="text-slate-900 dark:text-white text-sm font-mono">
                                    {pledgeStats?.currency || 'TZS'} {Number(selectedPledgeGuest.pledge_amount || 0).toLocaleString()}
                                </strong>
                            </div>
                            <div>
                                <span className="text-slate-400 block text-[10px] font-bold">PAID</span>
                                <strong className="text-emerald-600 dark:text-emerald-400 text-sm font-mono">
                                    {pledgeStats?.currency || 'TZS'} {Number(selectedPledgeGuest.paid_amount || 0).toLocaleString()}
                                </strong>
                            </div>
                            <div>
                                <span className="text-slate-400 block text-[10px] font-bold">BALANCE</span>
                                <strong className="text-[#154F7C] dark:text-sky-400 text-sm font-mono">
                                    {pledgeStats?.currency || 'TZS'} {Math.max(0, Number(selectedPledgeGuest.pledge_amount || 0) - Number(selectedPledgeGuest.paid_amount || 0)).toLocaleString()}
                                </strong>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                        {(selectedPledgeGuest?.pledge_payments || []).length > 0 ? (
                            selectedPledgeGuest.pledge_payments.map((p) => (
                                <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.06] text-xs">
                                    <div>
                                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <span className="text-emerald-600 dark:text-emerald-400 font-mono font-black">
                                                +{pledgeStats?.currency || 'TZS'} {Number(p.amount).toLocaleString()}
                                            </span>
                                            <span className="uppercase text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/[0.08] font-bold">
                                                {p.payment_method}
                                            </span>
                                        </div>
                                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                                            <span>{p.payment_date ? new Date(p.payment_date).toLocaleDateString() : 'Today'}</span>
                                            {p.reference && <span> • Ref: {p.reference}</span>}
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleDeletePayment(p)}
                                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                                        title="Delete installment"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-xs text-slate-400 py-6">No payments recorded yet for this contributor.</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-white/[0.08]">
                        <SecondaryButton onClick={() => { setPledgeHistoryModalOpen(false); setSelectedPledgeGuest(null); }} className="!rounded-lg !py-2 !px-4 text-sm cursor-pointer">
                            Close
                        </SecondaryButton>
                        <button
                            type="button"
                            onClick={() => {
                                setPledgeHistoryModalOpen(false);
                                const pBal = Math.max(0, Number(selectedPledgeGuest?.pledge_amount || 0) - Number(selectedPledgeGuest?.paid_amount || 0));
                                recordPaymentForm.setData({
                                    amount: pBal > 0 ? pBal : '',
                                    payment_method: 'mpesa',
                                    reference: '',
                                    payment_date: new Date().toISOString().split('T')[0],
                                    notes: '',
                                });
                                setRecordPaymentModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg shadow-xs transition cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Log Payment</span>
                        </button>
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
