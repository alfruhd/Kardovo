import React, { useState, useMemo, useEffect } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import KardovoAppLayout from '@/Layouts/KardovoAppLayout';
import StatusBadge from '@/Components/StatusBadge';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import Modal from '@/Components/Modal';
import PersonalisedCard from '@/Components/PersonalisedCard';
import { 
    MessageSquare, 
    Send, 
    Smartphone, 
    Check, 
    CheckCheck, 
    Clock, 
    ShieldCheck, 
    Sparkles, 
    Filter, 
    Users, 
    ChevronRight, 
    ChevronDown,
    ArrowRight, 
    RotateCcw,
    ExternalLink,
    Settings,
    X,
    Radio,
    Zap,
    Search,
    MapPin,
    Calendar,
    Building2,
    Ticket,
    SlidersHorizontal,
    Share2,
    ListOrdered,
    ArrowUpDown,
    Lock,
    Palette,
    Eye,
    RefreshCw,
    CheckCircle2,
    CheckSquare,
    Square,
    UserCheck,
    AlertCircle,
    AlertTriangle,
    Trash2,
    Maximize2
} from 'lucide-react';
import GatewayConfigModal from '@/Components/GatewayConfigModal';

const WHATSAPP_DEFAULT_TEMPLATE = "Habari {{guest_name}}! You're cordially invited to our celebration. Please view your pass and tap below to confirm your attendance:";
const SMS_DEFAULT_TEMPLATE = "Habari {{guest_name}}! You're invited to {{event_title}} on {{event_date}} at {{venue}}. View your digital invitation pass & RSVP here: https://kdv.app/p/{{pass_code}}";

const TEXT_ONLY_PRESETS = [
    {
        id: 'reminder',
        title: '🔔 Event Reminder',
        text: 'Habari {{guest_name}}! This is a friendly reminder that {{event_title}} will take place on {{event_date}} at {{venue}}. We look forward to having you with us. Karibu sana!'
    },
    {
        id: 'venue_notice',
        title: '📍 Venue & Time Notice',
        text: 'Important update for {{event_title}}: The ceremony at {{venue}} starts promptly on {{event_date}}. Please arrive early for convenient entry.'
    },
    {
        id: 'thank_you',
        title: '🙏 Thank You Note',
        text: 'Asante sana {{guest_name}} for celebrating with us at {{event_title}}! Your love, support, and presence made our day unforgettable.'
    },
    {
        id: 'general',
        title: '📢 General Announcement',
        text: 'Habari {{guest_name}}! We are pleased to share an important announcement regarding {{event_title}}. We look forward to hosting you on {{event_date}} at {{venue}}.'
    }
];

export default function Messaging({ 
    events = [], 
    selectedEvent, 
    templates = [],
    recentMessages = [], 
    quotas = null,
    gateways = {},
    isAdmin = false
}) {
    const { auth, flash, errors } = usePage().props;
    const user = auth?.user;
    const isSuperAdmin = user?.role === 'admin' || user?.is_admin || isAdmin;
    const isSubAdmin = user?.role === 'sub_admin' || user?.is_sub_admin;
    const canDeleteLogs = isSuperAdmin || isSubAdmin;
    const canBroadcast = isSuperAdmin || isSubAdmin || (user?.status !== 'suspended' && user?.effective_permissions?.can_send_broadcasts !== false);
    const activeQuotas = quotas || user?.message_quotas;

    const [channel, setChannel] = useState('whatsapp');
    const [campaignType, setCampaignType] = useState('pass_invitation'); // 'pass_invitation' | 'pass_only' | 'text_only'
    const [customCaption, setCustomCaption] = useState(WHATSAPP_DEFAULT_TEMPLATE);
    const [isDispatching, setIsDispatching] = useState(false);
    
    // Card Template Selection for Event & Pass Sending
    const initialTemplateId = selectedEvent?.card_template_id || selectedEvent?.card_template?.id || templates[0]?.id || '';
    const [selectedTemplateId, setSelectedTemplateId] = useState(initialTemplateId);
    const [isSavingTemplate, setIsSavingTemplate] = useState(false);

    useEffect(() => {
        if (selectedEvent) {
            const tId = selectedEvent.card_template_id || selectedEvent.card_template?.id || templates[0]?.id || '';
            setSelectedTemplateId(tId);
        }
    }, [selectedEvent?.id]);

    // Live background listener: Refresh message logs & recipient counts every 4 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            if (!isDispatching && typeof document !== 'undefined' && document.visibilityState === 'visible') {
                router.reload({
                    only: ['recentMessages', 'quotas', 'selectedEvent'],
                    preserveScroll: true,
                    preserveState: true,
                });
            }
        }, 4000);

        return () => clearInterval(interval);
    }, [isDispatching]);

    const activeTemplate = useMemo(() => {
        return templates.find(t => String(t.id) === String(selectedTemplateId)) 
            || selectedEvent?.card_template 
            || selectedEvent?.cardTemplate 
            || templates[0] 
            || null;
    }, [templates, selectedTemplateId, selectedEvent]);

    // Automated RSVP WhatsApp confirmation reply settings
    const eventAutoReplyConfig = selectedEvent?.rsvp_auto_reply_config || {};
    const [enableAutoReply, setEnableAutoReply] = useState(eventAutoReplyConfig.enabled !== false);
    const [rsvpAttendingText, setRsvpAttendingText] = useState(
        eventAutoReplyConfig.attending_text || "Thank you {{guest_name}}! Your RSVP has been confirmed for {{event_title}}. We look forward to seeing you on {{event_date}}!"
    );
    const [rsvpDeclinedText, setRsvpDeclinedText] = useState(
        eventAutoReplyConfig.declined_text || "Thank you {{guest_name}} for letting us know. Your RSVP has been recorded: Will Not Attend."
    );
    
    // Interactive chat preview simulation state
    const [previewRsvpTapped, setPreviewRsvpTapped] = useState('attending');
    const [recipientSearch, setRecipientSearch] = useState('');
    const [showPassModal, setShowPassModal] = useState(false);
    const [gatewayModalOpen, setGatewayModalOpen] = useState(false);

    // Delivery Logs search & filters state
    const [logSearch, setLogSearch] = useState('');
    const [logChannelFilter, setLogChannelFilter] = useState('all'); // 'all' | 'whatsapp' | 'sms'
    const [logStatusFilter, setLogStatusFilter] = useState('all'); // 'all' | 'delivered' | 'sent' | 'failed'

    const filteredRecentLogs = useMemo(() => {
        return recentMessages.filter((msg) => {
            if (logChannelFilter !== 'all' && msg.channel !== logChannelFilter) return false;
            if (logStatusFilter !== 'all' && msg.status !== logStatusFilter) return false;
            if (logSearch.trim()) {
                const q = logSearch.toLowerCase();
                const nameMatch = msg.guest?.name?.toLowerCase().includes(q);
                const phoneMatch = msg.recipient_phone?.toLowerCase().includes(q);
                const eventMatch = msg.event?.title?.toLowerCase().includes(q);
                const statusMatch = msg.status?.toLowerCase().includes(q);
                const channelMatch = msg.channel?.toLowerCase().includes(q);
                if (!nameMatch && !phoneMatch && !eventMatch && !statusMatch && !channelMatch) return false;
            }
            return true;
        });
    }, [recentMessages, logSearch, logChannelFilter, logStatusFilter]);

    const logChannelCounts = useMemo(() => {
        return {
            all: recentMessages.length,
            whatsapp: recentMessages.filter(m => m.channel === 'whatsapp').length,
            sms: recentMessages.filter(m => m.channel === 'sms').length,
        };
    }, [recentMessages]);

    const allGuests = selectedEvent?.guests || [];

    const filterCounts = {
        draft: allGuests.filter(g => g.delivery_status === 'draft').length,
        all: allGuests.length,
        pending_rsvp: allGuests.filter(g => g.rsvp_status === 'pending').length,
        failed: allGuests.filter(g => g.delivery_status === 'failed').length,
    };

    const initialTargetFilter = filterCounts.draft > 0 ? 'draft' : 'all';
    const [targetFilter, setTargetFilter] = useState(initialTargetFilter);

    // Track selected guest IDs for granular individual dispatch
    const [selectedGuestIds, setSelectedGuestIds] = useState(() => {
        const drafts = allGuests.filter(g => g.delivery_status === 'draft').map(g => g.id);
        return drafts.length > 0 ? drafts : allGuests.map(g => g.id);
    });

    const filteredGuests = useMemo(() => {
        if (targetFilter === 'draft') return allGuests.filter(g => g.delivery_status === 'draft');
        if (targetFilter === 'failed') return allGuests.filter(g => g.delivery_status === 'failed');
        if (targetFilter === 'pending_rsvp') return allGuests.filter(g => g.rsvp_status === 'pending');
        if (targetFilter === 'custom') return allGuests.filter(g => selectedGuestIds.includes(g.id));
        return allGuests;
    }, [allGuests, targetFilter, selectedGuestIds]);

    // When targetFilter or selectedEvent changes, auto-select matching guests
    useEffect(() => {
        if (!selectedEvent) return;
        const guests = selectedEvent.guests || [];
        if (targetFilter === 'draft') {
            const drafts = guests.filter(g => g.delivery_status === 'draft').map(g => g.id);
            setSelectedGuestIds(drafts.length > 0 ? drafts : guests.map(g => g.id));
        } else if (targetFilter === 'failed') {
            setSelectedGuestIds(guests.filter(g => g.delivery_status === 'failed').map(g => g.id));
        } else if (targetFilter === 'pending_rsvp') {
            setSelectedGuestIds(guests.filter(g => g.rsvp_status === 'pending').map(g => g.id));
        } else if (targetFilter === 'all') {
            setSelectedGuestIds(guests.map(g => g.id));
        }
    }, [selectedEvent?.id, targetFilter]);

    const toggleGuestSelection = (guestId) => {
        setSelectedGuestIds(prev => {
            if (prev.includes(guestId)) {
                return prev.filter(id => id !== guestId);
            } else {
                return [...prev, guestId];
            }
        });
    };

    const handleSelectAllFiltered = () => {
        const currentPool = targetFilter === 'custom' ? allGuests : filteredGuests;
        const currentPoolIds = currentPool.map(g => g.id);
        const allSelected = currentPoolIds.length > 0 && currentPoolIds.every(id => selectedGuestIds.includes(id));
        if (allSelected) {
            setSelectedGuestIds(prev => prev.filter(id => !currentPoolIds.includes(id)));
        } else {
            setSelectedGuestIds(prev => Array.from(new Set([...prev, ...currentPoolIds])));
        }
    };

    const guestsToDisplay = targetFilter === 'custom' ? allGuests : filteredGuests;

    const searchedFilteredGuests = useMemo(() => {
        return guestsToDisplay.filter((g) => {
            if (!recipientSearch.trim()) return true;
            const q = recipientSearch.toLowerCase();
            return (
                (g.name && g.name.toLowerCase().includes(q)) ||
                (g.phone && g.phone.toLowerCase().includes(q)) ||
                (g.category && g.category.toLowerCase().includes(q)) ||
                (g.unique_code && g.unique_code.toLowerCase().includes(q)) ||
                (g.card_number && g.card_number.toLowerCase().includes(q))
            );
        });
    }, [guestsToDisplay, recipientSearch]);

    const handleCampaignTypeChange = (newType) => {
        setCampaignType(newType);
        if (newType === 'text_only') {
            const defaultText = TEXT_ONLY_PRESETS[0].text;
            setCustomCaption(defaultText);
        } else if (newType === 'text_rsvp') {
            const defaultText = "Habari {{guest_name}}! You're cordially invited to {{event_title}} on {{event_date}} at {{venue}}. Please tap below to confirm your attendance:";
            setCustomCaption(defaultText);
        } else {
            const defaultPass = channel === 'sms' ? SMS_DEFAULT_TEMPLATE : WHATSAPP_DEFAULT_TEMPLATE;
            setCustomCaption(defaultPass);
        }
    };

    const handleChannelChange = (newChannel) => {
        setChannel(newChannel);
        if (newChannel === 'sms' && (customCaption === WHATSAPP_DEFAULT_TEMPLATE || !customCaption.trim())) {
            setCustomCaption(SMS_DEFAULT_TEMPLATE);
        } else if (newChannel === 'whatsapp' && (customCaption === SMS_DEFAULT_TEMPLATE || !customCaption.trim())) {
            setCustomCaption(WHATSAPP_DEFAULT_TEMPLATE);
        }
    };

    const handleSelectEvent = (eventId) => {
        router.get(route('messaging.index'), { event_id: eventId }, { preserveState: true });
    };

    const handleSelectTemplate = (templateId) => {
        setSelectedTemplateId(templateId);
    };

    const handleSaveTemplateToEvent = () => {
        if (!selectedEvent || !selectedTemplateId) return;
        setIsSavingTemplate(true);
        router.patch(route('messaging.updateEventTemplate', selectedEvent.id), {
            card_template_id: selectedTemplateId,
        }, {
            preserveScroll: true,
            onFinish: () => setIsSavingTemplate(false),
        });
    };

    const handleSendBroadcast = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (isDispatching) return;

        const activeEventId = selectedEvent?.id || events[0]?.id;
        if (!activeEventId) {
            setDispatchStatus({ 
                type: 'error', 
                message: 'No event selected. Please create or select an event first.' 
            });
            return;
        }

        let guestIdsToSend = [...selectedGuestIds];
        if (guestIdsToSend.length === 0) {
            if (filteredGuests.length > 0) {
                guestIdsToSend = filteredGuests.map(g => g.id);
                setSelectedGuestIds(guestIdsToSend);
            } else if (allGuests.length > 0) {
                guestIdsToSend = allGuests.map(g => g.id);
                setSelectedGuestIds(guestIdsToSend);
            } else {
                setDispatchStatus({ 
                    type: 'error', 
                    message: 'No guests found in this event. Please add guests to your event before dispatching passes.' 
                });
                return;
            }
        }

        setIsDispatching(true);

        router.post(route('messaging.broadcast'), {
            event_id: activeEventId,
            card_template_id: selectedTemplateId || undefined,
            channel: channel,
            campaign_type: campaignType,
            target_filter: targetFilter,
            selected_guest_ids: guestIdsToSend,
            custom_caption: customCaption,
            enable_auto_reply: enableAutoReply,
            rsvp_attending_text: rsvpAttendingText,
            rsvp_declined_text: rsvpDeclinedText,
        }, {
            preserveScroll: true,
            onFinish: () => {
                setIsDispatching(false);
            }
        });
    };

    const insertPlaceholder = (tag) => {
        setCustomCaption(prev => `${prev} {{${tag}}}`);
    };

    const handleDeleteLog = (msg) => {
        const recipient = msg.guest?.name || msg.recipient_phone;
        if (confirm(`Are you sure you want to delete the delivery log for "${recipient}" (${msg.channel.toUpperCase()})?`)) {
            router.delete(route('messaging.destroyLog', msg.id), {
                preserveScroll: true,
            });
        }
    };

    const handleClearAllLogs = () => {
        const targetDesc = selectedEvent ? `event "${selectedEvent.title}"` : 'all your events';
        if (confirm(`Are you sure you want to permanently clear all broadcast delivery logs for ${targetDesc}?\n\nThis action cannot be undone.`)) {
            router.delete(route('messaging.clearLogs'), {
                data: {
                    event_id: selectedEvent?.id || undefined,
                },
                preserveScroll: true,
            });
        }
    };

    const sampleGuest = selectedEvent?.guests?.[0] || {
        id: 1,
        name: 'Neema Mbwana',
        phone: '+255 712 345 678',
        category: 'Double Entry',
        allowance_label: 'Double Entry',
        card_number: 'KDV-2026-004821',
        unique_code: '29841872',
        qr_token: 'kdv_neema_mbwana_29841872',
    };

    const template = activeTemplate;
    const sampleGuestName = sampleGuest.name;
    const sampleEventTitle = selectedEvent?.title || 'Neema & Baraka — Wedding Reception';
    const sampleVenue = selectedEvent?.venue || 'Dar es Salaam Serena Hotel';
    const samplePassCode = sampleGuest?.unique_code || '29841872';
    const sampleDate = selectedEvent?.event_date ? (
        typeof selectedEvent.event_date === 'string' && selectedEvent.event_date.match(/^\d{4}-\d{2}-\d{2}/)
            ? new Date(selectedEvent.event_date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
            : selectedEvent.event_date
    ) : 'Sunday, 14 Sept 2026';

    const formattedCaption = (customCaption || '')
        .replace(/\{\{guest_name\}\}/gi, sampleGuestName)
        .replace(/\{guest_name\}/gi, sampleGuestName)
        .replace(/\{\{event_title\}\}/gi, sampleEventTitle)
        .replace(/\{event_title\}/gi, sampleEventTitle)
        .replace(/\{\{event_date\}\}/gi, sampleDate)
        .replace(/\{event_date\}/gi, sampleDate)
        .replace(/\{\{venue\}\}/gi, sampleVenue)
        .replace(/\{venue\}/gi, sampleVenue)
        .replace(/\{\{pass_code\}\}/gi, samplePassCode)
        .replace(/\{pass_code\}/gi, samplePassCode);

    const formattedAttendingReply = (rsvpAttendingText || "Thank you {{guest_name}}! Your RSVP has been confirmed for {{event_title}}. We look forward to seeing you on {{event_date}}!")
        .replace(/\{\{guest_name\}\}/gi, sampleGuestName)
        .replace(/\{guest_name\}/gi, sampleGuestName)
        .replace(/\{\{event_title\}\}/gi, sampleEventTitle)
        .replace(/\{event_title\}/gi, sampleEventTitle)
        .replace(/\{\{event_date\}\}/gi, sampleDate)
        .replace(/\{event_date\}/gi, sampleDate)
        .replace(/\{\{venue\}\}/gi, sampleVenue)
        .replace(/\{venue\}/gi, sampleVenue);

    const formattedDeclinedReply = (rsvpDeclinedText || "Thank you {{guest_name}} for letting us know. Your RSVP has been recorded: Will Not Attend.")
        .replace(/\{\{guest_name\}\}/gi, sampleGuestName)
        .replace(/\{guest_name\}/gi, sampleGuestName)
        .replace(/\{\{event_title\}\}/gi, sampleEventTitle)
        .replace(/\{event_title\}/gi, sampleEventTitle)
        .replace(/\{\{event_date\}\}/gi, sampleDate)
        .replace(/\{event_date\}/gi, sampleDate)
        .replace(/\{\{venue\}\}/gi, sampleVenue)
        .replace(/\{venue\}/gi, sampleVenue);

    return (
        <KardovoAppLayout
            title="Messaging Hub"
            headerActions={
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setGatewayModalOpen(true)}
                        className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
                    >
                        <Settings className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                        <span>Delivery Gateways</span>
                    </button>
                </div>
            }
        >
            <Head title="Messaging Hub - Kardovo" />

            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* ═══════════════════════════════════════════════════════════ */}
                {/* 1. CLEAN MINIMALIST HEADER & TELEMETRY STRIP                */}
                {/* ═══════════════════════════════════════════════════════════ */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Messaging Hub
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            Broadcast invitation passes directly via WhatsApp or SMS with instant response buttons.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs font-medium text-slate-700 dark:text-slate-300">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            <span><strong>{selectedGuestIds.length}</strong> Target Recipients</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span>Gateways Active</span>
                        </span>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* 2. MAIN 2-COLUMN HUB: CAMPAIGN COMPOSER & SMARTPHONE        */}
                {/* ═══════════════════════════════════════════════════════════ */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Left: Campaign Composer (7 cols) */}
                    <div className="lg:col-span-7 space-y-5">
                        




                        {/* ── CARD 1: Event & Delivery Setup ── */}
                        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
                            
                            {/* Target Event Selector */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        1. Select Target Event
                                    </label>
                                    <span className="text-[11px] font-mono text-slate-400">
                                        {events.length} available
                                    </span>
                                </div>
                                <div className="relative">
                                    <select
                                        className="block w-full h-11 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl text-xs font-semibold px-3.5 hover:border-slate-300 dark:hover:border-slate-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 cursor-pointer appearance-none pr-10 transition"
                                        value={selectedEvent?.id || ''}
                                        onChange={(e) => handleSelectEvent(e.target.value)}
                                    >
                                        {events.length === 0 ? (
                                            <option value="">No events found</option>
                                        ) : (
                                            events.map((evt) => (
                                                <option key={evt.id} value={evt.id}>
                                                    {evt.title} ({evt.guests_count || 0} guests){evt.user?.name ? ` • Host: ${evt.user.name}` : ''}
                                                </option>
                                            ))
                                        )}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                                        <ChevronDown className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>

                            {/* Delivery Channel Selector */}
                            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                                    2. Delivery Channel
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => handleChannelChange('whatsapp')}
                                        className={`p-3 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                                            channel === 'whatsapp'
                                                ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-500/80 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500/30'
                                                : 'bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/40'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <span className={`w-2 h-2 rounded-full ${channel === 'whatsapp' ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                                            <div>
                                                <div className="text-xs font-bold">WhatsApp API</div>
                                                <div className="text-[10px] text-slate-500 dark:text-slate-400">Interactive quick-reply pass</div>
                                            </div>
                                        </div>
                                        {channel === 'whatsapp' && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleChannelChange('sms')}
                                        className={`p-3 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                                            channel === 'sms'
                                                ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-500/80 text-blue-900 dark:text-blue-200 ring-1 ring-blue-500/30'
                                                : 'bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/40'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <span className={`w-2 h-2 rounded-full ${channel === 'sms' ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                                            <div>
                                                <div className="text-xs font-bold">SMS Gateway</div>
                                                <div className="text-[10px] text-slate-500 dark:text-slate-400">Direct carrier text link</div>
                                            </div>
                                        </div>
                                        {channel === 'sms' && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                                    </button>
                                </div>
                            </div>

                            {/* Campaign Content Mode */}
                            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                                    3. Campaign Mode
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {[
                                        { id: 'pass_invitation', label: 'Pass & RSVP', desc: 'Pass + RSVP Buttons', icon: Ticket },
                                        { id: 'pass_only', label: 'Pass Only', desc: 'Direct Pass View', icon: Sparkles },
                                        { id: 'text_rsvp', label: 'Text & RSVP', desc: 'Text + RSVP Buttons', icon: CheckCircle2 },
                                        { id: 'text_only', label: 'Plain Text', desc: 'Text Broadcast', icon: MessageSquare },
                                    ].map((mode) => {
                                        const IconComponent = mode.icon;
                                        const isCurrent = campaignType === mode.id;
                                        return (
                                            <button
                                                key={mode.id}
                                                type="button"
                                                onClick={() => handleCampaignTypeChange(mode.id)}
                                                className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                                                    isCurrent
                                                        ? 'bg-slate-900 text-white dark:bg-cyan-600 dark:text-white border-transparent dark:border-cyan-500 shadow-xs'
                                                        : 'bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
                                                }`}
                                            >
                                                <IconComponent className={`w-3.5 h-3.5 ${isCurrent ? 'text-cyan-400 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                                                <span className="text-xs font-bold">{mode.label}</span>
                                                <span className={`text-[9px] ${isCurrent ? 'text-slate-300 dark:text-cyan-100' : 'opacity-75'}`}>{mode.desc}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Template Picker (If pass is attached) */}
                            {(campaignType === 'pass_invitation' || campaignType === 'pass_only') && (
                                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                                            <Palette className="w-3.5 h-3.5 text-slate-500" />
                                            <span>4. Invitation Card Template</span>
                                        </label>
                                        {activeTemplate && (
                                            <button
                                                type="button"
                                                onClick={() => setShowPassModal(true)}
                                                className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                                            >
                                                <Eye className="w-3 h-3" />
                                                <span>Preview Pass</span>
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                                        <div className="sm:col-span-8 relative">
                                            <select
                                                value={selectedTemplateId}
                                                onChange={(e) => handleSelectTemplate(e.target.value)}
                                                className="block w-full h-10 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl text-xs font-semibold px-3 hover:border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 cursor-pointer appearance-none pr-8 transition"
                                            >
                                                {templates.length === 0 ? (
                                                    <option value="">Default Platform Template</option>
                                                ) : (
                                                    <>
                                                        {templates.some(t => t.user_id) && (
                                                            <optgroup label="🌟 My Custom Templates">
                                                                {templates.filter(t => t.user_id).map(t => (
                                                                    <option key={t.id} value={t.id}>
                                                                        🎨 {t.name} (Custom)
                                                                    </option>
                                                                ))}
                                                            </optgroup>
                                                        )}
                                                        <optgroup label="🏛️ Global Card Templates">
                                                            {templates.filter(t => !t.user_id).map(t => (
                                                                <option key={t.id} value={t.id}>
                                                                    {t.template_type === 'custom_art' ? '🖼️' : '💳'} {t.name}
                                                                </option>
                                                            ))}
                                                        </optgroup>
                                                    </>
                                                )}
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
                                                <ChevronDown className="w-3.5 h-3.5" />
                                            </div>
                                        </div>
                                        <div className="sm:col-span-4">
                                            <button
                                                type="button"
                                                onClick={handleSaveTemplateToEvent}
                                                disabled={isSavingTemplate || !selectedEvent || (selectedEvent?.card_template_id == selectedTemplateId)}
                                                className="w-full h-10 px-2.5 text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center gap-1 transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
                                            >
                                                {isSavingTemplate ? (
                                                    <RefreshCw className="w-3 h-3 animate-spin text-cyan-600" />
                                                ) : (
                                                    <Check className="w-3 h-3 text-emerald-600" />
                                                )}
                                                <span className="truncate">{selectedEvent?.card_template_id == selectedTemplateId ? 'Assigned ✓' : 'Save Default'}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── CARD 2: Audience Filter & Recipient Table ── */}
                        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                                    <Users className="w-3.5 h-3.5 text-slate-500" />
                                    <span>Target Audience Segmentation</span>
                                </label>
                                <span className="text-[11px] font-mono text-slate-400">
                                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{selectedGuestIds.length}</strong> of {allGuests.length} selected
                                </span>
                            </div>

                            {/* Filter & Segmentation Buttons */}
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                {[
                                    { id: 'draft', label: 'Unsent Drafts', count: filterCounts.draft },
                                    { id: 'all', label: 'All Guests', count: filterCounts.all },
                                    { id: 'pending_rsvp', label: 'Pending RSVP', count: filterCounts.pending_rsvp },
                                    { id: 'failed', label: 'Failed Retry', count: filterCounts.failed },
                                    { id: 'custom', label: 'Custom Select', count: selectedGuestIds.length },
                                ].map((opt) => (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => setTargetFilter(opt.id)}
                                        className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center cursor-pointer ${
                                            targetFilter === opt.id
                                                ? 'bg-slate-900 text-white dark:bg-cyan-600 dark:text-white border-transparent dark:border-cyan-500 shadow-xs'
                                                : 'bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
                                        }`}
                                    >
                                        <span className="text-[11px] font-bold leading-tight">{opt.label}</span>
                                        <span className={`text-[10px] font-mono mt-1 px-1.5 py-0.5 rounded-md ${
                                            targetFilter === opt.id ? 'bg-white/20 text-white dark:bg-cyan-700/80 dark:text-cyan-100' : 'bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                        }`}>
                                            {opt.count}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {/* Inline Recipient Search & Interactive Checkbox List */}
                            <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/30 dark:bg-slate-950/30">
                                <div className="p-2.5 bg-slate-100/70 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={handleSelectAllFiltered}
                                            className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <CheckSquare className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                                            <span>
                                                {searchedFilteredGuests.length > 0 && searchedFilteredGuests.every(g => selectedGuestIds.includes(g.id))
                                                    ? 'Deselect All' 
                                                    : `Select All (${searchedFilteredGuests.length})`
                                                }
                                            </span>
                                        </button>
                                    </div>
                                    <div className="relative w-48 sm:w-64">
                                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            placeholder="Filter recipients..."
                                            value={recipientSearch}
                                            onChange={(e) => setRecipientSearch(e.target.value)}
                                            className="w-full pl-8 pr-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                        />
                                    </div>
                                </div>

                                <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-900">
                                    {searchedFilteredGuests.length === 0 ? (
                                        <div className="p-4 text-center text-xs text-slate-400">
                                            No guests match the current filter or search criteria.
                                        </div>
                                    ) : (
                                        searchedFilteredGuests.map((guest) => {
                                            const isSelected = selectedGuestIds.includes(guest.id);
                                            return (
                                                <div 
                                                    key={guest.id}
                                                    onClick={() => toggleGuestSelection(guest.id)}
                                                    className={`p-2.5 flex items-center justify-between gap-3 text-xs transition cursor-pointer select-none ${
                                                        isSelected 
                                                            ? 'bg-cyan-50/60 dark:bg-cyan-950/30 text-slate-900 dark:text-white' 
                                                            : 'hover:bg-slate-100/50 dark:hover:bg-slate-900/50 text-slate-600 dark:text-slate-400'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => {}} // Handled by row onClick
                                                            className="rounded border-slate-300 dark:border-slate-700 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                                                        />
                                                        <div className="truncate">
                                                            <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                                                                {guest.name}
                                                            </div>
                                                            <div className="text-[10px] text-slate-500 font-mono">
                                                                {guest.phone || 'No Phone'} • {guest.category || 'General'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <span className="text-[9px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                                            {guest.delivery_status || 'draft'}
                                                        </span>
                                                        <span className="text-[10px] font-mono text-slate-400">
                                                            {guest.unique_code}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ── CARD 3: Message Caption Composer ── */}
                        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                            
                            {/* Quick Presets for Text Only */}
                            {campaignType === 'text_only' && (
                                <div className="space-y-1.5">
                                    <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block">
                                        Quick Announcement Presets
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {TEXT_ONLY_PRESETS.map((preset) => (
                                            <button
                                                key={preset.id}
                                                type="button"
                                                onClick={() => setCustomCaption(preset.text)}
                                                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[10.5px] font-medium text-slate-700 dark:text-slate-300 transition cursor-pointer"
                                            >
                                                {preset.title}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        {channel === 'sms' ? "SMS Message Caption" : "WhatsApp Message Caption"}
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const templ = channel === 'sms' ? SMS_DEFAULT_TEMPLATE : WHATSAPP_DEFAULT_TEMPLATE;
                                            setCustomCaption(templ);
                                        }}
                                        className="text-[10.5px] text-cyan-600 dark:text-cyan-400 hover:underline font-medium cursor-pointer"
                                    >
                                        Reset Template
                                    </button>
                                </div>

                                <textarea
                                    rows={3}
                                    className="block w-full border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl text-xs font-normal p-3 leading-relaxed focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition"
                                    value={customCaption}
                                    onChange={(e) => setCustomCaption(e.target.value)}
                                />

                                {/* Dynamic Tags Bar */}
                                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        <span className="text-[10.5px] text-slate-400 font-medium">Insert:</span>
                                        {['guest_name', 'event_title', 'event_date', 'venue', 'pass_code'].map((tag) => (
                                            <button
                                                key={tag}
                                                type="button"
                                                onClick={() => insertPlaceholder(tag)}
                                                className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-[10px] font-semibold border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                                            >
                                                +{'{' + tag + '}'}
                                            </button>
                                        ))}
                                    </div>
                                    {channel === 'sms' && (
                                        <span className="text-[10.5px] font-mono text-slate-400">
                                            {formattedCaption.length} chars • {Math.ceil(formattedCaption.length / 160) || 1} SMS
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Automated RSVP WhatsApp Reply Settings */}
                            {channel === 'whatsapp' && (campaignType === 'pass_invitation' || campaignType === 'text_rsvp') && (
                                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                Automated WhatsApp RSVP Reply Bot
                                            </div>
                                            <div className="text-[10.5px] text-slate-400">
                                                Instant response sent back to attendee after they submit RSVP.
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={enableAutoReply}
                                                onChange={(e) => setEnableAutoReply(e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
                                        </label>
                                    </div>

                                    {enableAutoReply && (
                                        <div className="space-y-2 pt-1">
                                            <div>
                                                <label className="text-[10.5px] font-semibold text-emerald-700 dark:text-emerald-400 block mb-1">
                                                    ✓ "Will Attend" Confirmation Reply
                                                </label>
                                                <input
                                                    type="text"
                                                    value={rsvpAttendingText}
                                                    onChange={(e) => setRsvpAttendingText(e.target.value)}
                                                    className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10.5px] font-semibold text-rose-700 dark:text-rose-400 block mb-1">
                                                    ✕ "Cannot Attend" Acknowledgment Reply
                                                </label>
                                                <input
                                                    type="text"
                                                    value={rsvpDeclinedText}
                                                    onChange={(e) => setRsvpDeclinedText(e.target.value)}
                                                    className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── Dispatch Action Footer ── */}
                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                    Targeting <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{selectedGuestIds.length}</strong> selected guest(s) in <strong>{selectedEvent?.title}</strong>
                                </div>
                                {canBroadcast ? (
                                    <button 
                                        type="button"
                                        onClick={handleSendBroadcast}
                                        disabled={isDispatching} 
                                        className={`inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer shadow-md ${
                                            isDispatching 
                                                ? 'bg-slate-700 text-white opacity-80 cursor-wait'
                                                : 'bg-slate-900 hover:bg-black dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 hover:shadow-lg'
                                        }`}
                                    >
                                        {isDispatching ? (
                                            <>
                                                <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400 dark:text-slate-950" />
                                                <span>Dispatching ({selectedGuestIds.length}) Passes...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-3.5 h-3.5" />
                                                <span>Dispatch ({selectedGuestIds.length}) Campaign Now</span>
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                                        Broadcast permissions restricted.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Interactive Smartphone Preview (5 cols) */}
                    <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-6">
                        
                        {/* Simulation Header */}
                        <div className="bg-white dark:bg-slate-900 p-3.5 px-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
                            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                <Smartphone className="w-4 h-4 text-slate-500" />
                                <span>{channel === 'whatsapp' ? 'WhatsApp Live Simulation' : 'SMS Live Simulation'}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setPreviewRsvpTapped(null)}
                                className="text-[11px] font-medium text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1 transition"
                                title="Reset Simulation"
                            >
                                <RotateCcw className="w-3 h-3" />
                                <span>Reset</span>
                            </button>
                        </div>

                        {/* Phone Device Mockup Container */}
                        <div className="w-full flex justify-center py-1">
                            <div className="w-full max-w-[340px] bg-[#0E1621] rounded-[36px] p-3 shadow-xl border-4 border-slate-800 text-slate-200 relative">
                                
                                {/* Phone Notch */}
                                <div className="w-20 h-3 bg-slate-900 rounded-full mx-auto mb-2 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                                </div>

                                {channel === 'sms' ? (
                                    /* ── SMS SIMULATOR ── */
                                    <>
                                        <div className="bg-[#1C2533] p-2 px-3 rounded-t-xl flex items-center gap-2 border-b border-slate-700/80">
                                            <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center p-1 flex-shrink-0">
                                                <img src="/images/kardovo_logo.png" alt="Kardovo" className="w-full h-full object-contain" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[11px] font-bold text-white flex items-center gap-1">
                                                    <span>KARDOVO</span>
                                                    <span className="w-3 h-3 rounded-full bg-blue-500 text-white flex items-center justify-center text-[8px]">✓</span>
                                                </div>
                                                <div className="text-[9px] text-slate-400">NextSMS Gateway</div>
                                            </div>
                                        </div>

                                        <div className="bg-[#0B1017] p-2.5 space-y-2.5 min-h-[380px] flex flex-col justify-end text-xs">
                                            <div className="text-center text-[9px] text-slate-500 font-mono">Today 12:45 PM</div>
                                            <div className="bg-[#007AFF] text-white p-3 rounded-xl rounded-tl-xs text-[11px] leading-relaxed break-words whitespace-pre-line">
                                                {formattedCaption}
                                            </div>
                                            {(campaignType === 'pass_invitation' || campaignType === 'pass_only') && (
                                                <div 
                                                    onClick={() => setShowPassModal(true)}
                                                    className="p-2 rounded-xl bg-[#151E2B] border border-slate-700 hover:border-blue-400 cursor-pointer transition"
                                                >
                                                    <div className="flex items-center justify-between text-[8.5px] text-slate-400">
                                                        <span>kdv.app/p/{samplePassCode}</span>
                                                        <span className="text-blue-400 flex items-center gap-0.5">View Pass <ExternalLink className="w-2.5 h-2.5" /></span>
                                                    </div>
                                                    <div className="text-[10.5px] font-bold text-white truncate mt-0.5">{sampleEventTitle}</div>
                                                    <div className="text-[9px] text-slate-400">{sampleGuestName}</div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-2 bg-[#1C2533] rounded-b-xl flex items-center justify-between text-[9px] text-slate-400 px-3">
                                            <span>Text Message</span>
                                            <span className="text-blue-400 font-semibold">Standard SMS</span>
                                        </div>
                                    </>
                                ) : (
                                    /* ── WHATSAPP SIMULATOR ── */
                                    <>
                                        <div className="bg-[#1F2C34] p-2 px-3 rounded-t-xl flex items-center gap-2 border-b border-slate-700/80">
                                            <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center p-1 flex-shrink-0">
                                                <img src="/images/kardovo_logo.png" alt="Kardovo" className="w-full h-full object-contain" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[11px] font-bold text-white flex items-center gap-1">
                                                    <span>KARDOVO</span>
                                                    <span className="w-3 h-3 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-[8px] font-black">✓</span>
                                                </div>
                                                <div className="text-[9px] text-slate-400">Verified Business Account</div>
                                            </div>
                                        </div>

                                        <div className="bg-[#0B141B] p-2.5 space-y-2 min-h-[380px] flex flex-col justify-end text-xs">
                                            
                                            {campaignType === 'text_only' ? (
                                                /* Plain Text Bubble (No buttons) */
                                                <div className="bg-[#1F2C34] rounded-xl rounded-tl-xs p-3 border border-slate-700/60 text-slate-100 space-y-1.5 max-w-[95%]">
                                                    <div className="text-[11.5px] leading-relaxed whitespace-pre-line text-white">
                                                        {formattedCaption}
                                                    </div>
                                                    <div className="flex items-center justify-end gap-1 text-[9px] text-slate-400 font-mono">
                                                        <span>12:45 PM</span>
                                                        <CheckCheck className="w-3 h-3 text-cyan-400" />
                                                    </div>
                                                </div>
                                            ) : campaignType === 'text_rsvp' ? (
                                                /* Plain Text Message + Interactive RSVP Buttons */
                                                <div className="bg-[#1F2C34] rounded-xl rounded-tl-xs overflow-hidden border border-slate-700/60 shadow-md">
                                                    <div className="p-3 text-[11.5px] text-slate-100 leading-relaxed whitespace-pre-line">
                                                        {formattedCaption}
                                                    </div>
                                                    <div className="flex items-center justify-end gap-1 text-[9px] text-slate-400 font-mono px-3 pb-1.5">
                                                        <span>12:45 PM</span>
                                                        <CheckCheck className="w-3 h-3 text-cyan-400" />
                                                    </div>
                                                    <div className="border-t border-slate-700 divide-y divide-slate-700 bg-[#17232A]">
                                                        <button
                                                            type="button"
                                                            onClick={() => setPreviewRsvpTapped('attending')}
                                                            className={`w-full py-2 text-center text-xs font-semibold flex items-center justify-center gap-1 transition ${
                                                                previewRsvpTapped === 'attending'
                                                                    ? 'bg-emerald-950/80 text-emerald-400 font-bold'
                                                                    : 'text-emerald-400 hover:bg-slate-800'
                                                            }`}
                                                        >
                                                            <Check className="w-3 h-3" />
                                                            <span>Will Attend</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setPreviewRsvpTapped('declined')}
                                                            className={`w-full py-2 text-center text-xs font-semibold flex items-center justify-center gap-1 transition ${
                                                                previewRsvpTapped === 'declined'
                                                                    ? 'bg-rose-950/80 text-rose-400 font-bold'
                                                                    : 'text-slate-400 hover:bg-slate-800'
                                                                }`}
                                                            >
                                                                <span>✕ Cannot Attend</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                            ) : (
                                                /* Pass Attachment Card (pass_invitation or pass_only) */
                                                <div className="bg-[#1F2C34] rounded-xl rounded-tl-xs overflow-hidden border border-slate-700/60 shadow-md">
                                                    <div 
                                                        onClick={() => setShowPassModal(true)}
                                                        className="relative cursor-pointer group select-none bg-black/40 p-1.5 sm:p-2 flex items-center justify-center transition hover:opacity-95 overflow-hidden"
                                                        title="Click to view full invitation pass"
                                                    >
                                                        <div className="w-full flex justify-center pointer-events-none transform transition duration-200 group-hover:scale-[1.01]">
                                                            <PersonalisedCard
                                                                guest={sampleGuest}
                                                                event={selectedEvent}
                                                                template={template}
                                                                interactive={false}
                                                                className="w-full shadow-lg"
                                                            />
                                                        </div>
                                                        {/* Interactive Hover / Tap Indicator */}
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                                            <span className="px-3 py-1.5 rounded-full bg-slate-900/90 text-white font-bold text-[10.5px] backdrop-blur-xs border border-white/20 shadow-xl flex items-center gap-1.5">
                                                                <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                                                                <span>Tap to Expand Pass</span>
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="p-2.5 text-[11px] text-slate-100 leading-relaxed whitespace-pre-line">
                                                        {formattedCaption}
                                                    </div>

                                                    {/* Quick Action RSVP Buttons */}
                                                    {campaignType === 'pass_invitation' && (
                                                        <div className="border-t border-slate-700 divide-y divide-slate-700 bg-[#17232A]">
                                                            <button
                                                                type="button"
                                                                onClick={() => setPreviewRsvpTapped('attending')}
                                                                className={`w-full py-2 text-center text-xs font-semibold flex items-center justify-center gap-1 transition ${
                                                                    previewRsvpTapped === 'attending'
                                                                        ? 'bg-emerald-950/80 text-emerald-400 font-bold'
                                                                        : 'text-emerald-400 hover:bg-slate-800'
                                                                }`}
                                                            >
                                                                <Check className="w-3 h-3" />
                                                                <span>Will Attend</span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setPreviewRsvpTapped('declined')}
                                                                className={`w-full py-2 text-center text-xs font-semibold flex items-center justify-center gap-1 transition ${
                                                                    previewRsvpTapped === 'declined'
                                                                        ? 'bg-rose-950/80 text-rose-400 font-bold'
                                                                        : 'text-slate-400 hover:bg-slate-800'
                                                                }`}
                                                            >
                                                                <span>✕ Cannot Attend</span>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Simulated RSVP Message Bubble */}
                                            {(campaignType === 'pass_invitation' || campaignType === 'text_rsvp') && previewRsvpTapped && (
                                                <div className="self-end bg-[#005C4B] text-white px-3 py-1 rounded-xl rounded-tr-xs text-[10.5px] font-medium flex items-center gap-1">
                                                    <span>{previewRsvpTapped === 'attending' ? '✓ Will Attend' : '✕ Cannot Attend'}</span>
                                                    <CheckCheck className="w-3 h-3 text-cyan-300" />
                                                </div>
                                            )}

                                            {/* Auto-reply simulation */}
                                            {(campaignType === 'pass_invitation' || campaignType === 'text_rsvp') && enableAutoReply && previewRsvpTapped && (
                                                <div className="bg-[#1F2C34] text-slate-200 px-3 py-2 rounded-xl rounded-tl-xs text-[10.5px] border border-slate-700 leading-relaxed">
                                                    {previewRsvpTapped === 'attending' ? formattedAttendingReply : formattedDeclinedReply}
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-2 bg-[#1F2C34] rounded-b-xl text-[9px] text-slate-400 flex items-center justify-between px-3">
                                            <span>WhatsApp Cloud API</span>
                                            <span className="text-emerald-400 font-semibold">Active</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* 3. BROADCAST DELIVERY AUDIT LOGS                            */}
                {/* ═══════════════════════════════════════════════════════════ */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                    
                    {/* Header Toolbar */}
                    <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                Broadcast Delivery Logs
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Real-time dispatch and delivery status records.
                            </p>
                        </div>

                        {/* Search & Filter Controls */}
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="relative">
                                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={logSearch}
                                    onChange={(e) => setLogSearch(e.target.value)}
                                    placeholder="Search logs..."
                                    className="pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:border-cyan-500 outline-none w-44 sm:w-56"
                                />
                            </div>

                            {/* Channel Filter */}
                            <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
                                {['all', 'whatsapp', 'sms'].map((ch) => (
                                    <button
                                        key={ch}
                                        type="button"
                                        onClick={() => setLogChannelFilter(ch)}
                                        className={`px-2.5 py-1 rounded-lg capitalize transition cursor-pointer ${
                                            logChannelFilter === ch
                                                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                                        }`}
                                    >
                                        {ch} ({logChannelCounts[ch] || 0})
                                    </button>
                                ))}
                            </div>

                            {/* Status Filter */}
                            <select
                                value={logStatusFilter}
                                onChange={(e) => setLogStatusFilter(e.target.value)}
                                className="px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 cursor-pointer"
                            >
                                <option value="all">All Statuses</option>
                                <option value="delivered">Delivered</option>
                                <option value="sent">Sent</option>
                                <option value="failed">Failed</option>
                                <option value="pending">Pending</option>
                            </select>

                            {/* Clear All Logs Button (Far Right) */}
                            {canDeleteLogs && (
                                <button
                                    type="button"
                                    onClick={handleClearAllLogs}
                                    disabled={recentMessages.length === 0}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800/60 transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs ml-auto"
                                    title="Clear all broadcast delivery logs"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Clear All Logs</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto overflow-y-auto max-h-[420px] sm:max-h-[480px] scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                        <table className="w-full text-left text-xs min-w-[680px]">
                            <thead className="bg-slate-50/95 dark:bg-slate-950/95 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 backdrop-blur-md shadow-2xs">
                                <tr>
                                    <th className="py-3 px-4 w-12 text-center">#</th>
                                    <th className="py-3 px-4">Recipient</th>
                                    <th className="py-3 px-4">Phone</th>
                                    <th className="py-3 px-4">Channel</th>
                                    <th className="py-3 px-4">Event</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-5 text-right">Time</th>
                                    {canDeleteLogs && (
                                        <th className="py-3 px-4 text-center w-12 font-semibold">Action</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                {filteredRecentLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={canDeleteLogs ? 8 : 7} className="py-8 text-center text-slate-400 text-xs">
                                            No logs match your filter criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRecentLogs.map((msg, idx) => (
                                        <tr key={msg.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                                            <td className="py-3 px-4 text-center font-mono text-slate-400 text-[11px]">
                                                {String(idx + 1).padStart(2, '0')}
                                            </td>
                                            <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                                                {msg.guest?.name || 'Guest'}
                                            </td>
                                            <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400 text-[11px]">
                                                {msg.recipient_phone}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase ${
                                                    msg.channel === 'whatsapp' 
                                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' 
                                                        : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                                                }`}>
                                                    {msg.channel}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-slate-700 dark:text-slate-300 truncate max-w-[180px]">
                                                {msg.event?.title}
                                            </td>
                                            <td className="py-3 px-4">
                                                <StatusBadge status={msg.status} />
                                            </td>
                                            <td className="py-3 px-5 text-right font-mono text-slate-400 text-[11px] whitespace-nowrap">
                                                {new Date(msg.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            </td>
                                            {canDeleteLogs && (
                                                <td className="py-2.5 px-4 text-center whitespace-nowrap">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteLog(msg)}
                                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition active:scale-95 cursor-pointer"
                                                        title="Delete delivery log entry (Admin/Sub-Admin)"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── Invitation Pass Modal ── */}
                <Modal show={showPassModal} onClose={() => setShowPassModal(false)} maxWidth="2xl">
                    <div className="p-5 sm:p-6 bg-white dark:bg-[#0B1524] text-slate-900 dark:text-white rounded-3xl border border-slate-200 dark:border-white/[0.08] shadow-2xl">
                        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 dark:border-white/[0.08]">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-cyan-500" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <span>Official Invitation Pass Preview</span>
                                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[9.5px] font-mono font-bold uppercase">
                                            Verified Pass
                                        </span>
                                    </h3>
                                    {template?.name && (
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                            Active Style: <strong className="text-slate-800 dark:text-slate-200">{template.name}</strong>
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowPassModal(false)}
                                className="p-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.12] text-slate-500 dark:text-slate-300 transition active:scale-95 cursor-pointer"
                                title="Close"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex justify-center py-2 max-h-[75vh] overflow-y-auto">
                            <PersonalisedCard
                                guest={sampleGuest}
                                event={selectedEvent}
                                template={template}
                                interactive={true}
                                className="w-full flex justify-center"
                            />
                        </div>
                    </div>
                </Modal>

                {/* ── Gateway Configuration Modal ── */}
                <GatewayConfigModal
                    show={gatewayModalOpen}
                    onClose={() => setGatewayModalOpen(false)}
                    gateways={gateways}
                    initialTab={channel === 'sms' ? 'sms' : 'whatsapp'}
                />
            </div>
        </KardovoAppLayout>
    );
}
