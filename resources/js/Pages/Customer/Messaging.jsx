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
    RefreshCw
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
    const { auth } = usePage().props;
    const user = auth?.user;
    const isSuperAdmin = user?.role === 'admin' || user?.is_admin || isAdmin;
    const canBroadcast = isSuperAdmin || (user?.status !== 'suspended' && user?.effective_permissions?.can_send_broadcasts !== false);
    const activeQuotas = quotas || user?.message_quotas;

    const [channel, setChannel] = useState('whatsapp');
    const [campaignType, setCampaignType] = useState('pass_invitation'); // 'pass_invitation' | 'text_only'
    const [targetFilter, setTargetFilter] = useState('draft');
    const [customCaption, setCustomCaption] = useState(WHATSAPP_DEFAULT_TEMPLATE);
    
    // Card Template Selection for Event & Pass Sending
    const initialTemplateId = selectedEvent?.card_template_id || selectedEvent?.card_template?.id || templates[0]?.id || '';
    const [selectedTemplateId, setSelectedTemplateId] = useState(initialTemplateId);
    const [isSavingTemplate, setIsSavingTemplate] = useState(false);

    useEffect(() => {
        if (selectedEvent) {
            const tId = selectedEvent.card_template_id || selectedEvent.card_template?.id || templates[0]?.id || '';
            setSelectedTemplateId(tId);
            broadcastForm.setData('card_template_id', tId);
        }
    }, [selectedEvent?.id]);

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

    const filteredGuests = allGuests.filter((guest) => {
        if (targetFilter === 'draft') return guest.delivery_status === 'draft';
        if (targetFilter === 'failed') return guest.delivery_status === 'failed';
        if (targetFilter === 'pending_rsvp') return guest.rsvp_status === 'pending';
        return true;
    });

    const searchedFilteredGuests = filteredGuests.filter((g) => {
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

    const broadcastForm = useForm({
        event_id: selectedEvent?.id || events[0]?.id || '',
        card_template_id: initialTemplateId,
        channel: 'whatsapp',
        campaign_type: 'pass_invitation',
        target_filter: 'draft',
        custom_caption: customCaption,
        enable_auto_reply: enableAutoReply,
        rsvp_attending_text: rsvpAttendingText,
        rsvp_declined_text: rsvpDeclinedText,
    });

    const handleCampaignTypeChange = (newType) => {
        setCampaignType(newType);
        broadcastForm.setData('campaign_type', newType);
        if (newType === 'text_only') {
            const defaultText = TEXT_ONLY_PRESETS[0].text;
            setCustomCaption(defaultText);
            broadcastForm.setData('custom_caption', defaultText);
        } else {
            const defaultPass = channel === 'sms' ? SMS_DEFAULT_TEMPLATE : WHATSAPP_DEFAULT_TEMPLATE;
            setCustomCaption(defaultPass);
            broadcastForm.setData('custom_caption', defaultPass);
        }
    };

    const handleChannelChange = (newChannel) => {
        setChannel(newChannel);
        broadcastForm.setData('channel', newChannel);
        if (newChannel === 'sms' && (customCaption === WHATSAPP_DEFAULT_TEMPLATE || !customCaption.trim())) {
            setCustomCaption(SMS_DEFAULT_TEMPLATE);
            broadcastForm.setData('custom_caption', SMS_DEFAULT_TEMPLATE);
        } else if (newChannel === 'whatsapp' && (customCaption === SMS_DEFAULT_TEMPLATE || !customCaption.trim())) {
            setCustomCaption(WHATSAPP_DEFAULT_TEMPLATE);
            broadcastForm.setData('custom_caption', WHATSAPP_DEFAULT_TEMPLATE);
        }
    };

    const handleSelectEvent = (eventId) => {
        router.get(route('messaging.index'), { event_id: eventId }, { preserveState: true });
        broadcastForm.setData('event_id', eventId);
    };

    const handleSelectTemplate = (templateId) => {
        setSelectedTemplateId(templateId);
        broadcastForm.setData('card_template_id', templateId);
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
        e.preventDefault();
        broadcastForm.transform((data) => ({
            ...data,
            card_template_id: selectedTemplateId,
        })).post(route('messaging.broadcast'), {
            preserveScroll: true,
        });
    };

    const insertPlaceholder = (tag) => {
        setCustomCaption(prev => `${prev} {{${tag}}}`);
        broadcastForm.setData('custom_caption', `${customCaption} {{${tag}}}`);
    };

    const sampleGuest = selectedEvent?.guests?.[0] || {
        id: 1,
        name: 'Neema Mbwana',
        phone: '+255 712 345 678',
        category: 'Double Entry',
        allowance_label: 'DOUBLE ENTRY • 2X',
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
            title="Messaging & Interactive RSVP Hub"
            headerActions={
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setGatewayModalOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 bg-white/80 dark:bg-white/[0.06] hover:bg-white dark:hover:bg-white/[0.1] border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.03)] backdrop-blur-xl transition active:scale-95 cursor-pointer"
                    >
                        <Settings className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                        <span>Delivery Gateways</span>
                    </button>
                </div>
            }
        >
            <Head title="Messaging & RSVP Hub - Kardovo" />

            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* ═══════════════════════════════════════════════════════════ */}
                {/* 1. SIMPLE PAGE TITLE HEADER                                  */}
                {/* ═══════════════════════════════════════════════════════════ */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight">
                            Interactive Pass Delivery &amp; RSVP Hub
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            Broadcast invitation passes directly via WhatsApp or SMS with instant response buttons.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-cyan-700 dark:text-cyan-300 bg-white/80 dark:bg-[#0B1524] px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
                            {filteredGuests.length} Target Recipients
                        </span>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* 2. MAIN 2-COLUMN HUB: CAMPAIGN COMPOSER & SMARTPHONE        */}
                {/* ═══════════════════════════════════════════════════════════ */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left: Campaign Composer (7 cols) */}
                    <div className="lg:col-span-7 space-y-6">
                        
                        {/* Event Selector & Channel Toggle */}
                        <div className="bg-white/80 dark:bg-[#0B1524]/90 backdrop-blur-3xl backdrop-saturate-180 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.04)] dark:shadow-card space-y-6">
                            {/* ═══════════════ CAMPAIGN CONTENT MODE ═══════════════ */}
                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <label className="block text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-display">
                                        Campaign Content Mode
                                    </label>
                                    <span className="text-[10.5px] font-mono font-bold text-slate-500 dark:text-slate-400">
                                        {campaignType === 'text_only' 
                                            ? 'Plain Text' 
                                            : campaignType === 'pass_only' 
                                                ? 'Pass Only' 
                                                : 'Pass & RSVP'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {/* Option 1: Pass & Interactive RSVP */}
                                    <div
                                        onClick={() => handleCampaignTypeChange('pass_invitation')}
                                        className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer select-none flex items-center justify-between gap-3 ${
                                            campaignType === 'pass_invitation'
                                                ? 'bg-cyan-50/70 dark:bg-cyan-950/30 border-cyan-500/80 ring-2 ring-cyan-500/20 text-slate-900 dark:text-white shadow-xs'
                                                : 'bg-white dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/[0.15]'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                                                campaignType === 'pass_invitation'
                                                    ? 'bg-cyan-600 text-white shadow-xs'
                                                    : 'bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-slate-400'
                                            }`}>
                                                <Ticket className="w-4 h-4" />
                                            </div>
                                            <span className="text-xs font-black text-slate-900 dark:text-white font-display truncate">
                                                Pass &amp; RSVP
                                            </span>
                                        </div>
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-all ${
                                            campaignType === 'pass_invitation'
                                                ? 'border-cyan-600 bg-cyan-600 text-white'
                                                : 'border-slate-300 dark:border-slate-600'
                                        }`}>
                                            {campaignType === 'pass_invitation' && <Check className="w-2.5 h-2.5 stroke-[3.5]" />}
                                        </div>
                                    </div>

                                    {/* Option 2: Pass Attachment Only (No RSVP) */}
                                    <div
                                        onClick={() => handleCampaignTypeChange('pass_only')}
                                        className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer select-none flex items-center justify-between gap-3 ${
                                            campaignType === 'pass_only'
                                                ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-500/80 ring-2 ring-blue-500/20 text-slate-900 dark:text-white shadow-xs'
                                                : 'bg-white dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/[0.15]'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                                                campaignType === 'pass_only'
                                                    ? 'bg-blue-600 text-white shadow-xs'
                                                    : 'bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-slate-400'
                                            }`}>
                                                <Sparkles className="w-4 h-4" />
                                            </div>
                                            <span className="text-xs font-black text-slate-900 dark:text-white font-display truncate">
                                                Pass Only
                                            </span>
                                        </div>
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-all ${
                                            campaignType === 'pass_only'
                                                ? 'border-blue-600 bg-blue-600 text-white'
                                                : 'border-slate-300 dark:border-slate-600'
                                        }`}>
                                            {campaignType === 'pass_only' && <Check className="w-2.5 h-2.5 stroke-[3.5]" />}
                                        </div>
                                    </div>

                                    {/* Option 3: Plain Text Broadcast */}
                                    <div
                                        onClick={() => handleCampaignTypeChange('text_only')}
                                        className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer select-none flex items-center justify-between gap-3 ${
                                            campaignType === 'text_only'
                                                ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-500/80 ring-2 ring-emerald-500/20 text-slate-900 dark:text-white shadow-xs'
                                                : 'bg-white dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/[0.15]'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                                                campaignType === 'text_only'
                                                    ? 'bg-emerald-600 text-white shadow-xs'
                                                    : 'bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-slate-400'
                                            }`}>
                                                <MessageSquare className="w-4 h-4" />
                                            </div>
                                            <span className="text-xs font-black text-slate-900 dark:text-white font-display truncate">
                                                Plain Text
                                            </span>
                                        </div>
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-all ${
                                            campaignType === 'text_only'
                                                ? 'border-emerald-600 bg-emerald-600 text-white'
                                                : 'border-slate-300 dark:border-slate-600'
                                        }`}>
                                            {campaignType === 'text_only' && <Check className="w-2.5 h-2.5 stroke-[3.5]" />}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
                                {/* Event Selector */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-display">
                                            Select Target Event <span className="text-cyan-600 dark:text-cyan-400">*</span>
                                        </label>
                                        <span className="text-[10.5px] text-slate-500 dark:text-slate-400 font-mono font-bold bg-slate-100 dark:bg-white/[0.08] px-2 py-0.5 rounded-full">
                                            {events.length} available
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <select
                                            className="block w-full h-12 border border-slate-300/80 dark:border-white/[0.08] bg-white/90 dark:bg-[#08121E] text-slate-900 dark:text-white rounded-2xl text-xs font-bold px-4 hover:border-cyan-500/70 dark:hover:border-cyan-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 shadow-[0_2px_10px_rgba(0,0,0,0.03)] cursor-pointer appearance-none pr-10 transition duration-200"
                                            value={selectedEvent?.id || ''}
                                            onChange={(e) => handleSelectEvent(e.target.value)}
                                        >
                                            {events.length === 0 ? (
                                                <option value="" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">No events found</option>
                                            ) : (
                                                events.map((evt) => (
                                                    <option key={evt.id} value={evt.id} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white py-1">
                                                        {evt.title} ({evt.guests_count || 0} guests){evt.user?.name ? ` • Host: ${evt.user.name}` : ''}
                                                    </option>
                                                ))
                                            )}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-600 dark:text-slate-400">
                                            <ChevronDown className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>

                                {/* Channel Switcher */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-display">
                                            Delivery Channel
                                        </label>
                                        <span className="text-[10.5px] text-cyan-700 dark:text-cyan-300 font-mono font-bold">
                                            {channel === 'whatsapp' ? 'Direct WhatsApp API' : 'Direct SMS Network'}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2.5 h-12">
                                        <button
                                            type="button"
                                            onClick={() => handleChannelChange('whatsapp')}
                                            className={`h-full text-xs font-black rounded-2xl border flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 cursor-pointer backdrop-blur-xl ${
                                                channel === 'whatsapp' 
                                                    ? 'bg-emerald-500/15 dark:bg-emerald-950/60 border-emerald-500/60 text-emerald-900 dark:text-emerald-300 shadow-[0_4px_15px_rgba(16,185,129,0.2)] ring-2 ring-emerald-500/40' 
                                                    : 'bg-white/80 dark:bg-white/[0.04] border-slate-300/80 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-white/[0.08] hover:border-emerald-500/60 hover:shadow-[0_2px_12px_rgba(16,185,129,0.15)] shadow-[0_2px_8px_rgba(0,0,0,0.02)]'
                                            }`}
                                        >
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span>WhatsApp API</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleChannelChange('sms')}
                                            className={`h-full text-xs font-black rounded-2xl border flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 cursor-pointer backdrop-blur-xl ${
                                                channel === 'sms' 
                                                    ? 'bg-blue-500/15 dark:bg-blue-950/60 border-blue-500/60 text-blue-900 dark:text-blue-300 shadow-[0_4px_15px_rgba(59,130,246,0.2)] ring-2 ring-blue-500/40' 
                                                    : 'bg-white/80 dark:bg-white/[0.04] border-slate-300/80 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-white/[0.08] hover:border-blue-500/60 hover:shadow-[0_2px_12px_rgba(59,130,246,0.15)] shadow-[0_2px_8px_rgba(0,0,0,0.02)]'
                                            }`}
                                        >
                                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                                            <span>SMS Gateway</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Gateway Connection & Telemetry Bar */}
                            <div className="p-4 bg-white/80 dark:bg-white/[0.03] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] backdrop-blur-xl shadow-[0_4px_15px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-2xl flex items-center justify-center border shadow-xs flex-shrink-0 ${
                                        channel === 'whatsapp' 
                                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                                            : 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30'
                                    }`}>
                                        <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-black text-xs text-slate-900 dark:text-white font-display">
                                                {channel === 'whatsapp' ? (gateways.whatsapp?.provider || 'Meta WhatsApp Cloud API') : (gateways.sms?.provider || 'NextSMS Gateway')}
                                            </span>
                                            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                <span>{channel === 'whatsapp' ? (gateways.whatsapp?.status || 'Connected') : (gateways.sms?.status || 'Active')}</span>
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                            {channel === 'whatsapp' ? 'Interactive Quick Replies & Pass Delivery' : 'Direct SMS Shortlink Pass Delivery'}
                                        </p>
                                    </div>
                                </div>

                                    <button
                                        type="button"
                                        onClick={() => setGatewayModalOpen(true)}
                                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-white/[0.06] hover:bg-slate-50 dark:hover:bg-white/[0.12] border border-slate-300/80 dark:border-white/[0.08] hover:border-cyan-500/70 text-xs font-black text-slate-800 dark:text-slate-200 shadow-xs hover:shadow-[0_2px_10px_rgba(6,182,212,0.15)] transition-all duration-200 active:scale-95 cursor-pointer self-start sm:self-center"
                                    >
                                        <Settings className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                                        <span>Configure Gateway</span>
                                    </button>
                                </div>

                                {/* Live Account Quota Telemetry Cards */}
                                {activeQuotas && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                        <div className={`p-3.5 rounded-2xl border transition-all ${
                                            channel === 'whatsapp' 
                                                ? 'bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500/40 shadow-xs' 
                                                : 'bg-white/60 dark:bg-white/[0.02] border-slate-200/80 dark:border-white/[0.06]'
                                        }`}>
                                            <div className="flex items-center justify-between text-xs font-bold">
                                                <span className="text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 font-display">
                                                    <span>💬 WhatsApp Quota</span>
                                                </span>
                                                <span className="font-mono text-xs font-black text-slate-900 dark:text-white">
                                                    {activeQuotas.whatsapp_limit !== null ? `${activeQuotas.whatsapp_remaining} remaining` : 'Unlimited'}
                                                </span>
                                            </div>
                                            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                                                <span>Dispatched: <strong className="text-slate-800 dark:text-slate-200">{activeQuotas.whatsapp_used}</strong></span>
                                                <span>Limit: <strong className="text-slate-800 dark:text-slate-200">{activeQuotas.whatsapp_limit !== null ? activeQuotas.whatsapp_limit : '∞'}</strong></span>
                                            </div>
                                            {activeQuotas.whatsapp_limit !== null && (
                                                <div className="mt-2 w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                                                    <div 
                                                        className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                                                        style={{ width: `${Math.min(100, Math.round((activeQuotas.whatsapp_used / Math.max(1, activeQuotas.whatsapp_limit)) * 100))}%` }}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div className={`p-3.5 rounded-2xl border transition-all ${
                                            channel === 'sms' 
                                                ? 'bg-blue-500/10 dark:bg-blue-950/40 border-blue-500/40 shadow-xs' 
                                                : 'bg-white/60 dark:bg-white/[0.02] border-slate-200/80 dark:border-white/[0.06]'
                                        }`}>
                                            <div className="flex items-center justify-between text-xs font-bold">
                                                <span className="text-blue-800 dark:text-blue-300 flex items-center gap-1.5 font-display">
                                                    <span>📱 Regular SMS Quota</span>
                                                </span>
                                                <span className="font-mono text-xs font-black text-slate-900 dark:text-white">
                                                    {activeQuotas.sms_limit !== null ? `${activeQuotas.sms_remaining} remaining` : 'Unlimited'}
                                                </span>
                                            </div>
                                            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                                                <span>Dispatched: <strong className="text-slate-800 dark:text-slate-200">{activeQuotas.sms_used}</strong></span>
                                                <span>Limit: <strong className="text-slate-800 dark:text-slate-200">{activeQuotas.sms_limit !== null ? activeQuotas.sms_limit : '∞'}</strong></span>
                                            </div>
                                            {activeQuotas.sms_limit !== null && (
                                                <div className="mt-2 w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                                                    <div 
                                                        className="bg-blue-500 h-full rounded-full transition-all duration-300"
                                                        style={{ width: `${Math.min(100, Math.round((activeQuotas.sms_used / Math.max(1, activeQuotas.sms_limit)) * 100))}%` }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* ═══════════════ INVITATION PASS TEMPLATE OF CHOICE ═══════════════ */}
                                {campaignType !== 'text_only' && (
                                    <div className="pt-4 border-t border-slate-200/80 dark:border-white/[0.08] space-y-3">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-2">
                                                    <Palette className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                                                    <label className="block text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-display">
                                                        Invitation Pass Template <span className="text-cyan-600 dark:text-cyan-400">*</span>
                                                    </label>
                                                </div>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                                    Select your custom template of choice to send to guests for this campaign.
                                                </p>
                                            </div>
                                            {activeTemplate && (
                                                <div className="flex items-center gap-2">
                                                    <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                                                        activeTemplate.user_id 
                                                            ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700/50' 
                                                            : 'bg-cyan-50 dark:bg-cyan-950/50 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700/50'
                                                    }`}>
                                                        <Sparkles className="w-2.5 h-2.5" />
                                                        <span>{activeTemplate.user_id ? 'Custom Template' : 'Global Template'}</span>
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassModal(true)}
                                                        className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-700 dark:text-cyan-300 hover:text-cyan-800 dark:hover:text-cyan-200 bg-cyan-500/10 hover:bg-cyan-500/20 px-2.5 py-1 rounded-xl transition cursor-pointer"
                                                        title="Preview this card template with sample guest data"
                                                    >
                                                        <Eye className="w-3 h-3" />
                                                        <span>Preview Pass</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                                            <div className="sm:col-span-8 relative">
                                                <select
                                                    value={selectedTemplateId}
                                                    onChange={(e) => handleSelectTemplate(e.target.value)}
                                                    className="block w-full h-11 border border-slate-300/80 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white rounded-xl text-xs font-bold px-3.5 hover:border-cyan-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 shadow-2xs cursor-pointer appearance-none pr-10 transition"
                                                >
                                                    {templates.length === 0 ? (
                                                        <option value="">Default Platform Template</option>
                                                    ) : (
                                                        <>
                                                            {templates.some(t => t.user_id) && (
                                                                <optgroup label="🌟 My Custom Templates">
                                                                    {templates.filter(t => t.user_id).map(t => (
                                                                        <option key={t.id} value={t.id}>
                                                                            🎨 {t.name} (My Custom Template)
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
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                                                    <ChevronDown className="w-4 h-4" />
                                                </div>
                                            </div>

                                            <div className="sm:col-span-4">
                                                <button
                                                    type="button"
                                                    onClick={handleSaveTemplateToEvent}
                                                    disabled={isSavingTemplate || !selectedEvent || (selectedEvent?.card_template_id == selectedTemplateId)}
                                                    className="w-full h-11 px-3 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white hover:bg-slate-100 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] border border-slate-300/80 dark:border-white/[0.08] rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
                                                    title="Save this template as the default template for the selected event"
                                                >
                                                    {isSavingTemplate ? (
                                                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-600" />
                                                    ) : (
                                                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                                    )}
                                                    <span>{selectedEvent?.card_template_id == selectedTemplateId ? 'Assigned to Event ✓' : 'Save as Event Default'}</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                        {/* Broadcast Campaign Dispatcher Form */}
                        <div className="bg-white/80 dark:bg-[#0B1524]/90 backdrop-blur-3xl backdrop-saturate-180 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.04)] dark:shadow-card space-y-6">
                            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.08] pb-4">
                                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-display flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-xl bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 flex items-center justify-center border border-cyan-500/30 shadow-xs">
                                        <Send className="w-4 h-4 stroke-[2.5]" />
                                    </div>
                                    <span>Broadcast Campaign Dispatcher</span>
                                </h3>
                                <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/[0.08] px-2.5 py-1 rounded-full">
                                    Step 03 / Delivery
                                </span>
                            </div>

                            {/* Recipient Audience Filter Capsules */}
                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <label className="block text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-display">
                                        Recipient Audience Filter
                                    </label>
                                    <span className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold">
                                        Target audience segmentation
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {[
                                        { id: 'draft', label: 'Unsent Drafts', count: filterCounts.draft },
                                        { id: 'all', label: 'All Guests', count: filterCounts.all },
                                        { id: 'pending_rsvp', label: 'Pending RSVP', count: filterCounts.pending_rsvp },
                                        { id: 'failed', label: 'Failed Retry', count: filterCounts.failed },
                                    ].map((opt) => (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            onClick={() => {
                                                setTargetFilter(opt.id);
                                                broadcastForm.setData('target_filter', opt.id);
                                            }}
                                            className={`p-3.5 rounded-2xl border text-center transition-all duration-200 flex flex-col items-center justify-center active:scale-95 cursor-pointer backdrop-blur-xl ${
                                                targetFilter === opt.id 
                                                    ? 'bg-kardovo-navy dark:bg-cyan-600 text-white border-cyan-400 dark:border-cyan-400 font-black shadow-[0_6px_20px_rgba(5,13,26,0.25)] ring-2 ring-cyan-500/60 scale-[1.02]' 
                                                    : 'bg-white/85 dark:bg-white/[0.04] border-slate-300/80 dark:border-white/[0.08] text-slate-800 dark:text-slate-200 hover:bg-white dark:hover:bg-white/[0.08] hover:border-cyan-500/70 hover:shadow-[0_4px_15px_rgba(6,182,212,0.15)] shadow-[0_2px_10px_rgba(0,0,0,0.03)]'
                                            }`}
                                        >
                                            <span className="text-xs font-bold leading-tight">{opt.label}</span>
                                            <span className={`text-[10.5px] px-2.5 py-0.5 rounded-full font-mono mt-2 font-black ${
                                                targetFilter === opt.id ? 'bg-white/20 text-white' : 'bg-slate-200/80 dark:bg-white/[0.1] text-slate-800 dark:text-slate-200'
                                            }`}>
                                                {opt.count} {opt.count === 1 ? 'guest' : 'guests'}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Matching Audience Recipient Table */}
                            <div className="rounded-2xl border border-slate-300/80 dark:border-white/[0.08] bg-white/70 dark:bg-white/[0.02] overflow-hidden backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                                <div className="p-4 bg-white/90 dark:bg-white/[0.04] border-b border-slate-200/80 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                                        <span className="text-xs font-black text-slate-900 dark:text-white font-display">
                                            Matching Recipients ({filteredGuests.length})
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            placeholder="Search recipients..."
                                            value={recipientSearch}
                                            onChange={(e) => setRecipientSearch(e.target.value)}
                                            className="bg-white dark:bg-[#08121E] border border-slate-300 dark:border-white/[0.08] text-slate-900 dark:text-slate-100 text-[11px] font-bold rounded-xl pl-8 pr-3 py-1.5 w-full sm:w-52 hover:border-cyan-500/70 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 shadow-xs transition duration-200 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="max-h-56 overflow-y-auto divide-y divide-slate-200/70 dark:divide-white/[0.06] bg-white/60 dark:bg-[#0B1524]">
                                    {searchedFilteredGuests.length === 0 ? (
                                        <div className="p-6 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
                                            {filteredGuests.length === 0 
                                                ? `No guests match the selected filter for this event.`
                                                : 'No guests found matching your search query.'}
                                        </div>
                                    ) : (
                                        searchedFilteredGuests.map((guest) => (
                                            <div key={guest.id} className="p-3.5 px-4 flex items-center justify-between text-xs hover:bg-white/90 dark:hover:bg-white/[0.06] transition">
                                                <div className="min-w-0 flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-xl bg-cyan-500/15 dark:bg-cyan-950/40 border border-cyan-500/30 dark:border-cyan-800/40 text-cyan-900 dark:text-cyan-300 font-black text-xs flex items-center justify-center flex-shrink-0 shadow-xs">
                                                        {guest.name.charAt(0)}
                                                    </div>
                                                    <div className="truncate">
                                                        <div className="font-black text-slate-900 dark:text-white truncate text-xs">
                                                            {guest.name}
                                                        </div>
                                                        <div className="text-[10.5px] text-slate-600 dark:text-slate-400 font-mono font-medium flex items-center gap-2 mt-0.5">
                                                            <span>{guest.phone}</span>
                                                            <span>•</span>
                                                            <span className="font-sans font-bold text-slate-700 dark:text-slate-300">{guest.category || 'Single Entry'}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                                    <span className={`text-[9.5px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                                                        guest.delivery_status === 'delivered' || guest.delivery_status === 'sent'
                                                            ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/40'
                                                            : guest.delivery_status === 'failed'
                                                            ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800/40'
                                                            : 'bg-slate-200/80 dark:bg-white/[0.08] text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-white/[0.08]'
                                                    }`}>
                                                        {guest.delivery_status || 'draft'}
                                                    </span>

                                                    <span className={`text-[9.5px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                                                        guest.rsvp_status === 'attending'
                                                            ? 'bg-emerald-500/20 text-emerald-900 dark:text-emerald-200 font-black border border-emerald-500/30'
                                                            : guest.rsvp_status === 'declined'
                                                            ? 'bg-rose-500/20 text-rose-900 dark:text-rose-200 font-black border border-rose-500/30'
                                                            : 'bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800/40'
                                                    }`}>
                                                        {guest.rsvp_status === 'attending' ? 'Attending' : guest.rsvp_status === 'declined' ? 'Declined' : 'Pending RSVP'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Quick Announcement Templates when in text_only mode */}
                            {campaignType === 'text_only' && (
                                <div className="space-y-1.5 pt-1">
                                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                                        <span className="flex items-center gap-1.5">
                                            <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                            <span>Quick Text Presets:</span>
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {TEXT_ONLY_PRESETS.map((preset) => (
                                            <button
                                                key={preset.id}
                                                type="button"
                                                onClick={() => {
                                                    setCustomCaption(preset.text);
                                                    broadcastForm.setData('custom_caption', preset.text);
                                                }}
                                                className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-200 dark:border-white/[0.08] hover:border-emerald-300 dark:hover:border-emerald-700/50 text-[11px] font-bold text-slate-700 dark:text-slate-300 transition active:scale-95 cursor-pointer"
                                            >
                                                {preset.title}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Caption Text Editor */}
                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <label className="block text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-display">
                                        {channel === 'sms' ? "SMS Message Caption Template" : "WhatsApp Message Caption Template"}
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const templ = channel === 'sms' ? SMS_DEFAULT_TEMPLATE : WHATSAPP_DEFAULT_TEMPLATE;
                                            setCustomCaption(templ);
                                            broadcastForm.setData('custom_caption', templ);
                                        }}
                                        className="text-[11px] text-cyan-700 dark:text-cyan-400 hover:underline font-extrabold cursor-pointer"
                                    >
                                        Reset to Default {channel === 'sms' ? 'SMS' : 'WhatsApp'} Template
                                    </button>
                                </div>

                                <textarea
                                    rows={3}
                                    className="block w-full border border-slate-300/90 dark:border-white/[0.08] bg-white/85 dark:bg-[#08121E] text-slate-900 dark:text-white rounded-2xl text-xs font-medium p-4 leading-relaxed shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-cyan-500/70 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition duration-200 outline-none"
                                    value={customCaption}
                                    onChange={(e) => {
                                        setCustomCaption(e.target.value);
                                        broadcastForm.setData('custom_caption', e.target.value);
                                    }}
                                />

                                {/* Interactive Placeholder Tags */}
                                <div className="flex flex-wrap items-center gap-2 pt-1">
                                    <span className="text-[11px] text-slate-700 dark:text-slate-400 font-bold mr-1">Insert Dynamic Tag:</span>
                                    {['guest_name', 'event_title', 'event_date', 'venue', 'pass_code'].map((tag) => (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => insertPlaceholder(tag)}
                                            className="px-3 py-1.5 rounded-xl bg-white/85 hover:bg-white dark:bg-white/[0.08] dark:hover:bg-white/[0.15] text-slate-900 dark:text-slate-200 font-mono text-[10.5px] font-black border border-slate-300/80 dark:border-white/[0.08] hover:border-cyan-500/80 hover:shadow-[0_2px_8px_rgba(6,182,212,0.2)] transition duration-200 shadow-[0_1px_4px_rgba(0,0,0,0.03)] cursor-pointer active:scale-95"
                                        >
                                            + {'{' + tag + '}'}
                                        </button>
                                    ))}
                                </div>

                                {channel === 'sms' && (
                                    <div className="text-right text-[10.5px] font-mono text-slate-600 dark:text-slate-400 font-bold">
                                        {formattedCaption.length} characters • {Math.ceil(formattedCaption.length / 160) || 1} SMS unit(s)
                                    </div>
                                )}
                            </div>

                            {/* ═══════════════ AUTOMATED RSVP CONFIRMATION BOT ═══════════════ */}
                            {channel === 'whatsapp' && campaignType === 'pass_invitation' && (
                                <div className="p-4 sm:p-5 rounded-2xl bg-white/70 dark:bg-white/[0.03] border border-slate-200/90 dark:border-white/[0.08] space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <div className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-display flex items-center gap-2">
                                                <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                                                <span>Automated WhatsApp RSVP Confirmation Reply</span>
                                            </div>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                                Automatically send an instant WhatsApp message back to guests after they submit RSVP.
                                            </p>
                                        </div>

                                        {/* Master Toggle */}
                                        <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                                            <input
                                                type="checkbox"
                                                checked={enableAutoReply}
                                                onChange={(e) => {
                                                    setEnableAutoReply(e.target.checked);
                                                    broadcastForm.setData('enable_auto_reply', e.target.checked);
                                                }}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                        </label>
                                    </div>

                                    {enableAutoReply && (
                                        <div className="space-y-3 pt-3 border-t border-slate-200/70 dark:border-white/[0.06]">
                                            {/* 1. Attending Response Text */}
                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                                                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                                        <span>"Will Attend" Confirmation Reply</span>
                                                    </label>
                                                    <span className="text-[10px] text-slate-400 font-mono">Dynamic Tags Supported</span>
                                                </div>
                                                <textarea
                                                    rows={2}
                                                    value={rsvpAttendingText}
                                                    onChange={(e) => {
                                                        setRsvpAttendingText(e.target.value);
                                                        broadcastForm.setData('rsvp_attending_text', e.target.value);
                                                    }}
                                                    placeholder="Thank you {{guest_name}}! Your RSVP has been confirmed for {{event_title}}..."
                                                    className="block w-full border border-slate-300/90 dark:border-white/[0.08] bg-white/90 dark:bg-[#08121E] text-slate-900 dark:text-white rounded-xl text-xs font-medium p-3 hover:border-cyan-500/70 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition outline-none"
                                                />
                                            </div>

                                            {/* 2. Declined Response Text */}
                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                                                        <span>"Cannot Attend" Acknowledgment Reply</span>
                                                    </label>
                                                </div>
                                                <textarea
                                                    rows={2}
                                                    value={rsvpDeclinedText}
                                                    onChange={(e) => {
                                                        setRsvpDeclinedText(e.target.value);
                                                        broadcastForm.setData('rsvp_declined_text', e.target.value);
                                                    }}
                                                    placeholder="Thank you {{guest_name}} for letting us know..."
                                                    className="block w-full border border-slate-300/90 dark:border-white/[0.08] bg-white/90 dark:bg-[#08121E] text-slate-900 dark:text-white rounded-xl text-xs font-medium p-3 hover:border-cyan-500/70 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition outline-none"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Dispatch Action Footer */}
                            <div className="pt-4 border-t border-slate-200/80 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="text-xs text-slate-700 dark:text-slate-400 font-medium">
                                    Targeting <strong className="text-slate-950 dark:text-white font-black">{filteredGuests.length}</strong> {filteredGuests.length === 1 ? 'recipient' : 'recipients'} in <strong className="text-slate-950 dark:text-white font-black">{selectedEvent?.title}</strong>
                                </div>
                                {canBroadcast ? (
                                    <PrimaryButton 
                                        onClick={handleSendBroadcast}
                                        disabled={broadcastForm.processing || filteredGuests.length === 0} 
                                        className="bg-kardovo-navy hover:bg-slate-900 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white dark:text-slate-950 gap-2 shadow-xl hover:shadow-2xl disabled:opacity-50 py-3.5 px-7 rounded-2xl text-xs font-black cursor-pointer active:scale-95"
                                    >
                                        <Send className="w-3.5 h-3.5 text-cyan-400 dark:text-slate-950 stroke-[2.5]" />
                                        <span>Dispatch Campaign Now</span>
                                    </PrimaryButton>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => alert('Broadcasting and message dispatch permissions are locked for your organizer account by platform governance.')}
                                        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-200 dark:bg-white/[0.06] text-slate-500 dark:text-slate-400 font-bold text-xs border border-slate-300 dark:border-white/[0.08] cursor-not-allowed opacity-80 shadow-xs"
                                        title="Broadcast dispatch locked by administration"
                                    >
                                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                                        <span>Broadcast Dispatch (Locked)</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Interactive Smartphone Preview (5 cols) */}
                    <div className="lg:col-span-5 flex flex-col items-center space-y-4 lg:sticky lg:top-6 lg:self-start">
                        {/* Control Header Card */}
                        <div className="w-full bg-white/70 dark:bg-[#0B1524]/85 backdrop-blur-3xl backdrop-saturate-180 p-4 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.03)] dark:shadow-card flex items-center justify-between">
                            <div className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 font-display">
                                <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                <span>{channel === 'whatsapp' ? 'WhatsApp Live View' : 'SMS Live View'}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setPreviewRsvpTapped(null)}
                                className="text-[11px] font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/80 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.08] shadow-xs transition active:scale-95 cursor-pointer"
                                title="Reset Simulation"
                            >
                                <RotateCcw className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                                <span>Reset Simulation</span>
                            </button>
                        </div>

                        {/* Virtual Phone Mockup Container */}
                        <div className="w-full flex justify-center py-2 relative">
                            {/* Phone Mockup Container */}
                            <div className="w-full max-w-[340px] bg-[#0B141B] rounded-[38px] p-3.5 shadow-[0_25px_60px_rgba(0,0,0,0.25)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.7)] border-4 border-slate-800 text-slate-200 relative z-10">
                                {/* Phone Speaker Notch */}
                                <div className="w-24 h-3.5 bg-slate-900 rounded-full mx-auto mb-2.5 flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-slate-800" />
                                </div>

                            {channel === 'sms' ? (
                                <>
                                    {/* SMS App Header */}
                                    <div className="bg-[#1F2430] p-2.5 px-3 rounded-t-2xl flex items-center gap-2.5 border-b border-slate-700">
                                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-1 shadow-md flex-shrink-0">
                                            <img src="/images/kardovo_logo.png" alt="Kardovo" className="w-full h-full object-contain" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                                <span className="truncate font-black tracking-wider">KARDOVO</span>
                                                <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-blue-500 text-white flex-shrink-0" title="SMS Gateway Verified">
                                                    <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                                                </span>
                                            </div>
                                            <div className="text-[9.5px] text-slate-400 truncate">
                                                Text Message • NextSMS Gateway
                                            </div>
                                        </div>
                                        <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300">
                                            NextSMS
                                        </span>
                                    </div>

                                    {/* SMS Chat Body */}
                                    <div className="bg-[#0B0F19] p-3 space-y-3 min-h-[390px] flex flex-col justify-end text-xs">
                                        <div className="text-center text-[9.5px] text-slate-500 font-medium">
                                            Today 12:45 PM • Text Message (SMS)
                                        </div>

                                        <div className="space-y-2 max-w-[95%]">
                                            <div className="bg-[#007AFF] text-white p-3.5 rounded-2xl rounded-tl-sm text-[11.5px] leading-relaxed shadow-md font-sans break-words whitespace-pre-line">
                                                {formattedCaption}
                                            </div>

                                            {campaignType !== 'text_only' && (
                                                <div 
                                                    onClick={() => setShowPassModal(true)}
                                                    className="p-2.5 rounded-2xl bg-[#141B26] border border-slate-700/80 hover:border-blue-500/60 cursor-pointer transition shadow-lg group"
                                                    title="Click to preview invitation pass"
                                                >
                                                    <div className="flex items-center justify-between text-[8.5px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                                        <span>kdv.app/p/{samplePassCode}</span>
                                                        <span className="text-blue-400 flex items-center gap-0.5 group-hover:underline">
                                                            <span>View Invitation Pass</span>
                                                            <ExternalLink className="w-2.5 h-2.5" />
                                                        </span>
                                                    </div>
                                                    <div className="text-[11px] font-bold text-white truncate">
                                                        {sampleEventTitle}
                                                    </div>
                                                    <div className="text-[9.5px] text-slate-400 truncate mt-0.5">
                                                        {sampleGuestName} • {sampleGuest.allowance_label || '2X Entry'}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Simulated SMS Input Footer */}
                                    <div className="p-2.5 bg-[#1F2430] rounded-b-2xl flex items-center justify-between text-[9.5px] text-slate-400 px-3">
                                        <span className="font-mono">{formattedCaption.length} chars • {Math.ceil(formattedCaption.length / 160) || 1} SMS unit(s)</span>
                                        <span className="text-blue-400 font-bold">Standard SMS Channel</span>
                                    </div>
                                </>
                            ) : (
                                /* ═══════════ WHATSAPP CLOUD API SIMULATOR ═══════════ */
                                <>
                                    {/* WhatsApp Header */}
                                    <div className="bg-[#1F2C34] p-2.5 px-3 rounded-t-2xl flex items-center gap-2.5 border-b border-slate-700">
                                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-1 shadow-md flex-shrink-0">
                                            <img src="/images/kardovo_logo.png" alt="Kardovo" className="w-full h-full object-contain" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                                <span className="truncate font-black tracking-wider">KARDOVO</span>
                                                <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-emerald-500 text-slate-950 flex-shrink-0" title="Verified Business">
                                                    <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                                                </span>
                                            </div>
                                            <div className="text-[9.5px] text-slate-400 truncate">
                                                Official Verified Business
                                            </div>
                                        </div>
                                        <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                            <span>Verified</span>
                                        </span>
                                    </div>

                                    {/* WhatsApp Chat Body */}
                                    <div className="bg-[#0B141B] p-2.5 space-y-2.5 min-h-[390px] flex flex-col justify-end text-xs">
                                        
                                        {campaignType === 'text_only' ? (
                                            /* ═══════════ PLAIN TEXT WHATSAPP BUBBLE (NO ATTACHMENTS) ═══════════ */
                                            <div className="bg-[#1F2C34] rounded-2xl rounded-tl-none p-3.5 border border-slate-700/80 shadow-md text-slate-100 space-y-2 max-w-[95%]">
                                                <div className="text-[12px] leading-relaxed font-sans whitespace-pre-line text-white">
                                                    {formattedCaption}
                                                </div>
                                                <div className="flex items-center justify-end gap-1.5 text-[9.5px] text-slate-400 font-mono pt-1">
                                                    <span>12:45 PM</span>
                                                    <CheckCheck className="w-3.5 h-3.5 text-cyan-400 stroke-[2.5]" />
                                                </div>
                                            </div>
                                        ) : (
                                            /* ═══════════ INVITATION PASS WITH ART & OPTIONAL RSVP BUTTONS ═══════════ */
                                            <div className="bg-[#1F2C34] rounded-2xl rounded-tl-none overflow-hidden border border-slate-700/80 shadow-md">
                                            
                                            {/* Responsive Card Image Header */}
                                            {template?.image_path ? (
                                                <div 
                                                    onClick={() => setShowPassModal(true)}
                                                    className="relative cursor-pointer group overflow-hidden select-none"
                                                    style={{ aspectRatio: '1 / 0.82' }}
                                                    title="Click to view full interactive invitation pass"
                                                >
                                                    <img 
                                                        src={template.image_path} 
                                                        alt={template.name || 'Invitation Template'} 
                                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/40" />

                                                    {/* Top Badge */}
                                                    <div className="absolute top-2 left-2.5 right-2.5 flex items-center justify-between">
                                                        <span className="px-2 py-0.5 rounded-full bg-black/60 border border-white/20 text-[8px] font-extrabold uppercase tracking-widest text-white backdrop-blur-xs">
                                                            {template.elements_config?.headline_text || template.headline || 'INVITATION PASS'}
                                                        </span>
                                                        <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-[8px] font-black uppercase text-slate-950 flex items-center gap-1 shadow-sm">
                                                            <CheckCheck className="w-2.5 h-2.5 stroke-[3]" />
                                                            <span>INVITATION PASS</span>
                                                        </span>
                                                    </div>

                                                    {/* Center Couple / Event Name */}
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3 pointer-events-none">
                                                        <div className="font-serif italic font-normal text-white text-lg drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] leading-tight">
                                                            {template.elements_config?.couple_names || sampleEventTitle}
                                                        </div>
                                                        <div className="text-[8px] text-amber-200 uppercase font-bold tracking-widest mt-0.5 drop-shadow-sm">
                                                            {sampleDate}
                                                        </div>
                                                    </div>

                                                    {/* Bottom Guest Plaque Overlay */}
                                                    <div className="absolute bottom-2 left-2 right-2 p-1.5 rounded-xl bg-black/75 border border-white/20 backdrop-blur-md flex items-center justify-between">
                                                        <div className="truncate pr-2">
                                                            <div className="text-[7px] text-slate-300 uppercase tracking-widest font-bold">INVITATION FOR</div>
                                                            <div className="text-[10.5px] font-black text-white truncate font-serif">{sampleGuestName}</div>
                                                        </div>
                                                        <div className="text-[8px] font-extrabold text-amber-300 bg-amber-950/80 border border-amber-500/50 px-1.5 py-0.5 rounded-md flex-shrink-0 uppercase">
                                                            {sampleGuest.allowance_label || '2X ENTRY'}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                /* Gradient / Signature Kardovo Card */
                                                <div 
                                                    onClick={() => setShowPassModal(true)}
                                                    className="p-3 relative cursor-pointer group overflow-hidden select-none"
                                                    style={{
                                                        background: `linear-gradient(135deg, ${template?.brand_color_from || '#0D1B2A'} 0%, #060E1A 50%, ${template?.brand_color_to || '#0B1E35'} 100%)`,
                                                        borderBottom: '1px solid rgba(0, 163, 255, 0.25)'
                                                    }}
                                                    title="Click to view full interactive invitation pass"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1.5">
                                                            <img src="/images/kardovo_logo.png" alt="Kardovo" className="w-4 h-4 object-contain" />
                                                            <span className="font-black text-[11px] text-white tracking-widest">KARDOVO</span>
                                                        </div>
                                                        <span className="text-[7.5px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 border border-blue-400/40 flex items-center gap-1">
                                                            <ShieldCheck className="w-2.5 h-2.5" />
                                                            VERIFIED PASS
                                                        </span>
                                                    </div>

                                                    <div className="mt-2 text-center">
                                                        <div className="text-[8px] font-extrabold uppercase tracking-widest text-cyan-400">
                                                            {template?.headline || 'OFFICIAL INVITATION'}
                                                        </div>
                                                        <h4 className="text-xs font-black text-white mt-0.5 truncate font-display">
                                                            {sampleEventTitle}
                                                        </h4>
                                                    </div>

                                                    <div className="mt-2 p-1.5 rounded-xl bg-black/60 border border-white/10 text-center">
                                                        <div className="text-[7px] text-slate-400 uppercase tracking-widest font-bold">ISSUED TO</div>
                                                        <div className="text-[11px] font-black text-white font-serif italic truncate">{sampleGuestName}</div>
                                                        <div className="text-[7.5px] font-extrabold text-cyan-300 mt-0.5 uppercase">
                                                            {sampleGuest.allowance_label || 'DOUBLE ENTRY • 2X'}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Formatted Message Caption */}
                                            <div className="p-3 text-[11.5px] text-slate-100 leading-relaxed font-sans whitespace-pre-line">
                                                {formattedCaption}
                                            </div>

                                            {/* Interactive Quick Reply Buttons */}
                                            <div className="border-t border-slate-700 divide-y divide-slate-700 bg-[#17232A]">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassModal(true)}
                                                    className="w-full py-2.5 px-3 text-center text-xs font-bold text-cyan-300 hover:bg-slate-800 flex items-center justify-center gap-1.5 transition"
                                                >
                                                    <Sparkles className="w-3.5 h-3.5" />
                                                    <span>View Invitation Pass</span>
                                                </button>
                                                {campaignType === 'pass_invitation' && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => setPreviewRsvpTapped('attending')}
                                                            className={`w-full py-2.5 px-3 text-center text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                                                                previewRsvpTapped === 'attending' 
                                                                    ? 'bg-emerald-950/80 text-emerald-400 font-extrabold' 
                                                                    : 'text-emerald-400 hover:bg-slate-800'
                                                            }`}
                                                        >
                                                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                                                            <span>Will Attend</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setPreviewRsvpTapped('declined')}
                                                            className={`w-full py-2.5 px-3 text-center text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                                                                previewRsvpTapped === 'declined' 
                                                                    ? 'bg-rose-950/80 text-rose-400 font-extrabold' 
                                                                    : 'text-slate-400 hover:bg-slate-800'
                                                            }`}
                                                        >
                                                            <span>✕ Cannot Attend</span>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                        {/* Outgoing Guest Tap Message Bubble */}
                                        {campaignType === 'pass_invitation' && previewRsvpTapped && (
                                            <div className="self-end bg-[#005C4B] text-white px-3.5 py-1.5 rounded-2xl rounded-tr-none text-[11px] font-medium flex items-center gap-1.5 shadow-sm animate-fadeIn">
                                                <span>{previewRsvpTapped === 'attending' ? '✓ Will Attend' : '✕ Cannot Attend'}</span>
                                                <CheckCheck className="w-3.5 h-3.5 text-cyan-300 stroke-[2.5]" />
                                            </div>
                                        )}

                                        {/* Automated Confirmation Reply */}
                                        {campaignType === 'pass_invitation' && enableAutoReply && previewRsvpTapped && (
                                            <div className="bg-[#1F2C34] text-slate-200 px-3.5 py-2.5 rounded-2xl rounded-tl-none text-[11px] border border-slate-700 shadow-sm animate-fadeIn leading-relaxed">
                                                <span>{previewRsvpTapped === 'attending' ? formattedAttendingReply : formattedDeclinedReply}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* WhatsApp Input Footer */}
                                    <div className="p-2.5 bg-[#1F2C34] rounded-b-2xl text-[9.5px] text-slate-400 flex items-center justify-between px-3">
                                        <span>Interactive Cloud API Template</span>
                                        <span className={`font-bold ${campaignType === 'pass_invitation' ? 'text-emerald-400' : campaignType === 'pass_only' ? 'text-blue-400' : 'text-slate-400'}`}>
                                            {campaignType === 'pass_invitation' ? 'Interactive RSVP Active' : campaignType === 'pass_only' ? 'Pass Attachment Active' : 'Text Broadcast Active'}
                                        </span>
                                    </div>
                                </>
                            )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* 3. RECENT BROADCAST DELIVERY LOGS                           */}
                {/* ═══════════════════════════════════════════════════════════ */}
                <div className="bg-white/80 dark:bg-[#0B1524]/90 backdrop-blur-3xl backdrop-saturate-180 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.04)] dark:shadow-card overflow-hidden">
                    {/* Header */}
                    <div className="p-5 sm:p-6 border-b border-slate-200/80 dark:border-white/[0.08] bg-white/85 dark:bg-white/[0.03] backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 flex items-center justify-center shadow-xs flex-shrink-0">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-display">
                                        Recent Message Delivery Logs
                                    </h3>
                                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border border-cyan-500/30 font-mono">
                                        <ListOrdered className="w-3 h-3" />
                                        <span>Numbered &amp; Filterable</span>
                                    </span>
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">
                                    Chronological audit of all broadcast dispatches and webhook receipts.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 self-start sm:self-auto">
                            <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/[0.08] px-3 py-1.5 rounded-full border border-slate-200/80 dark:border-white/[0.08]">
                                Showing {filteredRecentLogs.length} of {recentMessages.length} logs
                            </span>
                        </div>
                    </div>

                    {/* Filter & Search Toolbar */}
                    <div className="p-4 sm:px-6 bg-slate-50/70 dark:bg-white/[0.02] border-b border-slate-200/80 dark:border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-3">
                        {/* Search Input */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={logSearch}
                                onChange={(e) => setLogSearch(e.target.value)}
                                placeholder="Search logs by guest, phone, event, status..."
                                className="w-full pl-9 pr-9 py-2 rounded-xl text-xs font-bold bg-white dark:bg-[#08121E] border border-slate-300/80 dark:border-white/[0.08] text-slate-900 dark:text-white placeholder-slate-400 hover:border-cyan-500/70 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition shadow-2xs outline-none"
                            />
                            {logSearch && (
                                <button
                                    type="button"
                                    onClick={() => setLogSearch('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 dark:bg-white/[0.1] dark:hover:bg-white/[0.2] text-slate-600 dark:text-slate-300 flex items-center justify-center text-xs transition"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>

                        {/* Channel & Status Filters */}
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Channel Pills */}
                            <div className="flex items-center p-1 rounded-xl bg-slate-200/70 dark:bg-white/[0.05] border border-slate-300/60 dark:border-white/[0.08] text-xs">
                                <button
                                    type="button"
                                    onClick={() => setLogChannelFilter('all')}
                                    className={`px-2.5 py-1 rounded-lg font-black transition-all cursor-pointer ${
                                        logChannelFilter === 'all'
                                            ? 'bg-white dark:bg-[#08121E] text-slate-900 dark:text-white shadow-2xs ring-1 ring-slate-300/60 dark:ring-white/20'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    All ({logChannelCounts.all})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setLogChannelFilter('whatsapp')}
                                    className={`px-2.5 py-1 rounded-lg font-black transition-all flex items-center gap-1 cursor-pointer ${
                                        logChannelFilter === 'whatsapp'
                                            ? 'bg-white dark:bg-[#08121E] text-emerald-700 dark:text-emerald-300 shadow-2xs ring-1 ring-emerald-500/40'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300'
                                    }`}
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    <span>WA ({logChannelCounts.whatsapp})</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setLogChannelFilter('sms')}
                                    className={`px-2.5 py-1 rounded-lg font-black transition-all flex items-center gap-1 cursor-pointer ${
                                        logChannelFilter === 'sms'
                                            ? 'bg-white dark:bg-[#08121E] text-blue-700 dark:text-blue-300 shadow-2xs ring-1 ring-blue-500/40'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-blue-700 dark:hover:text-blue-300'
                                    }`}
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    <span>SMS ({logChannelCounts.sms})</span>
                                </button>
                            </div>

                            {/* Status Selector */}
                            <select
                                value={logStatusFilter}
                                onChange={(e) => setLogStatusFilter(e.target.value)}
                                className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-300/80 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-800 dark:text-slate-200 hover:border-cyan-500/70 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition cursor-pointer shadow-2xs"
                            >
                                <option value="all" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">All Statuses</option>
                                <option value="delivered" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">Delivered</option>
                                <option value="sent" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">Sent / Dispatched</option>
                                <option value="failed" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">Failed</option>
                                <option value="pending" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">Pending</option>
                            </select>

                            {/* Reset Button */}
                            {(logSearch || logChannelFilter !== 'all' || logStatusFilter !== 'all') && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setLogSearch('');
                                        setLogChannelFilter('all');
                                        setLogStatusFilter('all');
                                    }}
                                    className="px-2.5 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-200/60 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] rounded-xl flex items-center gap-1 transition active:scale-95 cursor-pointer"
                                    title="Reset filters"
                                >
                                    <RotateCcw className="w-3 h-3" />
                                    <span>Reset</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Scrollable Numbered Table */}
                    <div className="max-h-[460px] overflow-y-auto overflow-x-auto relative rounded-b-3xl scrollbar-thin">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead className="sticky top-0 z-10 bg-slate-100/95 dark:bg-[#07111D]/95 backdrop-blur-md text-[11px] uppercase font-black text-slate-700 dark:text-slate-300 border-b border-slate-200/80 dark:border-white/[0.08] font-mono tracking-wider shadow-xs">
                                <tr>
                                    <th className="py-3.5 px-4 w-12 text-center">#</th>
                                    <th className="py-3.5 px-5">Recipient Guest</th>
                                    <th className="py-3.5 px-4">Destination Phone</th>
                                    <th className="py-3.5 px-4">Channel</th>
                                    <th className="py-3.5 px-4">Event Campaign</th>
                                    <th className="py-3.5 px-4">Delivery Status</th>
                                    <th className="py-3.5 px-6 text-right">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200/70 dark:divide-white/[0.06] bg-white/60 dark:bg-[#0B1524] font-medium">
                                {filteredRecentLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="py-12 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-400">
                                                <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] flex items-center justify-center text-slate-400">
                                                    <Search className="w-5 h-5" />
                                                </div>
                                                <p className="text-xs font-bold">
                                                    {recentMessages.length === 0 
                                                        ? 'No broadcast messages dispatched yet.'
                                                        : 'No logs match your search or filter criteria.'
                                                    }
                                                </p>
                                                {(logSearch || logChannelFilter !== 'all' || logStatusFilter !== 'all') && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setLogSearch('');
                                                            setLogChannelFilter('all');
                                                            setLogStatusFilter('all');
                                                        }}
                                                        className="mt-1 px-3 py-1 text-xs font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/40 rounded-xl hover:underline transition"
                                                    >
                                                        Clear search &amp; filters
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRecentLogs.map((msg, index) => (
                                        <tr key={msg.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.04] transition duration-150 group">
                                            {/* Number Index */}
                                            <td className="py-3.5 px-4 text-center">
                                                <span className="inline-block font-mono text-[11px] font-black px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-white/[0.08] group-hover:border-cyan-500/50 group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition">
                                                    {String(index + 1).padStart(2, '0')}
                                                </span>
                                            </td>

                                            {/* Recipient */}
                                            <td className="py-3.5 px-5 font-black text-slate-900 dark:text-white">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-xl bg-white dark:bg-white/[0.08] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-slate-100 font-black flex items-center justify-center text-xs shadow-2xs flex-shrink-0">
                                                        {(msg.guest?.name || 'G').charAt(0)}
                                                    </div>
                                                    <span className="text-[12.5px] truncate max-w-[180px]">{msg.guest?.name || 'Guest'}</span>
                                                </div>
                                            </td>

                                            {/* Phone */}
                                            <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-300">
                                                {msg.recipient_phone}
                                            </td>

                                            {/* Channel */}
                                            <td className="py-3.5 px-4">
                                                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full inline-flex items-center gap-1 ${
                                                    msg.channel === 'whatsapp'
                                                        ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/40'
                                                        : 'bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800/40'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${msg.channel === 'whatsapp' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                                                    <span>{msg.channel}</span>
                                                </span>
                                            </td>

                                            {/* Event Title */}
                                            <td className="py-3.5 px-4 text-slate-900 dark:text-slate-200 font-bold truncate max-w-[190px]">
                                                {msg.event?.title}
                                            </td>

                                            {/* Delivery Status */}
                                            <td className="py-3.5 px-4">
                                                <StatusBadge status={msg.status} />
                                            </td>

                                            {/* Timestamp */}
                                            <td className="py-3.5 px-6 text-right font-mono font-semibold text-slate-600 dark:text-slate-400 text-xs whitespace-nowrap">
                                                {new Date(msg.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Invitation Pass View Modal */}
                <Modal show={showPassModal} onClose={() => setShowPassModal(false)} maxWidth="md">
                    <div className="p-6 bg-white/95 dark:bg-[#090E17] text-slate-900 dark:text-white flex flex-col items-center rounded-3xl backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xl">
                        <div className="w-full flex items-center justify-between pb-3 mb-4 border-b border-slate-200/80 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 dark:text-white font-display">
                                        Recipient Invitation Pass Preview
                                    </h3>
                                    {template?.name && (
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                                            Template: <span className="font-bold text-cyan-600 dark:text-cyan-400">{template.name}</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowPassModal(false)}
                                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="w-full flex justify-center py-2">
                            <PersonalisedCard
                                guest={sampleGuest}
                                event={selectedEvent}
                                template={template}
                                interactive={true}
                            />
                        </div>
                    </div>
                </Modal>

                {/* Gateway Configuration Modal */}
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
