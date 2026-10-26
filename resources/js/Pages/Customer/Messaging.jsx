import React, { useState, useMemo, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import KardovoAppLayout from '@/Layouts/KardovoAppLayout';
import EmptyEventState from '@/Components/EmptyEventState';
import StatusBadge from '@/Components/StatusBadge';
import ConfirmationModal from '@/Components/ConfirmationModal';
import PersonalisedCard from '@/Components/PersonalisedCard';
import GatewayConfigModal from '@/Components/GatewayConfigModal';
import {
    MessageSquare,
    Send,
    Smartphone,
    Check,
    CheckCheck,
    Clock,
    Sparkles,
    IdCard,
    Users,
    ChevronDown,
    ChevronUp,
    RotateCcw,
    Settings,
    X,
    Search,
    Ticket,
    Palette,
    RefreshCw,
    CheckCircle2,
    CheckSquare,
    Trash2,
    Coins,
    Bell,
    SlidersHorizontal,
    History,
    User
} from 'lucide-react';

const WHATSAPP_DEFAULT_TEMPLATE = "Habari {{guest_name}}! You're cordially invited to our celebration. Please view your pass and tap below to confirm your attendance:";
const SMS_DEFAULT_TEMPLATE = "Habari {{guest_name}}! You're invited to {{event_title}} on {{event_date}} at {{venue}}. View your digital invitation pass & RSVP here: https://kdv.app/p/{{pass_code}}";

const PLEDGE_DEFAULT_WHATSAPP = "Habari {{guest_name}}! Tunakukaribisha kwa moyo mkunjufu kushiriki katika maandalizi ya {{event_title}}.\n\nKuweka ahadi yako, tafadhali jibu ujumbe huu kwa kiasi chochote unachopenda kulingana na uwezo wako (mfano: 'Ahadi 50,000' au 'Ahadi 100k' n.k).\n\nNjia za Mchango:\n- Lipa Namba: {{lipa_namba}}\n- Benki: {{bank_name}} - {{bank_account}} ({{account_name}})\n\nUkishatuma mchango wako, forward ujumbe wa muamala (SMS) hapa hapa WhatsApp na utapata stakabadhi yako papo hapo. Ahsante sana!";

const PLEDGE_DEFAULT_SMS = "Habari {{guest_name}}! Mchango wa {{event_title}}: Lipa Namba: {{lipa_namba}}, Benki: {{bank_name}} {{bank_account}} ({{account_name}}). Kuweka ahadi au kuthibitisha mchango, jibu SMS hii au WhatsApp. Ahsante!";

const PLEDGE_PRESETS = [
    {
        id: 'initial_drive',
        title: 'Request Pledge (Ahadi)',
        text: "Habari {{guest_name}}! Tunakukaribisha kwa moyo mkunjufu kushiriki katika maandalizi ya {{event_title}}.\n\nKuweka ahadi yako, tafadhali jibu ujumbe huu kwa kiasi chochote unachopenda kulingana na uwezo wako (mfano: 'Ahadi 50,000' au 'Ahadi 100k' n.k).\n\nNjia za Mchango:\n- Lipa Namba: {{lipa_namba}}\n- Benki: {{bank_name}} - {{bank_account}} ({{account_name}})\n\nUkishatuma mchango wako, forward ujumbe wa muamala (SMS) hapa hapa WhatsApp na utapata stakabadhi yako papo hapo. Ahsante sana!"
    },
    {
        id: 'balance_reminder',
        title: 'Balance Reminder',
        text: "Habari {{guest_name}}! Tunakushukuru kwa moyo wako wa kujitolea katika maandalizi ya {{event_title}}.\n\nSalio lako lililobaki la ahadi ni: {{pledge_balance}} (Kati ya ahadi ya {{pledge_amount}}).\n\nNjia za Kukamilisha:\n- Lipa Namba: {{lipa_namba}}\n- Benki: {{bank_name}} - {{bank_account}} ({{account_name}})\n\nUkishatuma, forward ujumbe wa muamala (SMS) hapa hapa WhatsApp ili kusasisha salio lako papo hapo. Ahsante!"
    },
    {
        id: 'thank_you_appreciation',
        title: 'Thank You Note',
        text: "Habari {{guest_name}}! Kamati ya maandalizi ya {{event_title}} inatoa shukrani za dhati kwa upendo na mchango wako wa {{amount_paid}}.\n\nKama ungependa kuongeza mchango au kutuma ahadi mpya ya kiasi chochote, unaweza kutumia Lipa Namba: {{lipa_namba}} au Benki: {{bank_name}} {{bank_account}}. Asante sana kwa kuendelea kuwa pamoja nasi!"
    }
];

const TEXT_ONLY_PRESETS = [
    {
        id: 'reminder',
        title: 'Event Reminder',
        text: 'Habari {{guest_name}}! This is a friendly reminder that {{event_title}} will take place on {{event_date}} at {{venue}}. We look forward to having you with us. Karibu sana!'
    },
    {
        id: 'venue_notice',
        title: 'Venue & Time Update',
        text: 'Important update for {{event_title}}: The ceremony at {{venue}} starts promptly on {{event_date}}. Please arrive early for convenient entry.'
    },
    {
        id: 'thank_you',
        title: 'Thank You Note',
        text: 'Asante sana {{guest_name}} for celebrating with us at {{event_title}}! Your love, support, and presence made our day unforgettable.'
    },
    {
        id: 'general',
        title: 'General Announcement',
        text: 'Habari {{guest_name}}! We are pleased to share an important announcement regarding {{event_title}}. We look forward to hosting you on {{event_date}} at {{venue}}.'
    }
];

const PLACEHOLDER_LABELS = {
    guest_name: 'Guest Name',
    event_title: 'Event Name',
    event_date: 'Event Date',
    venue: 'Venue',
    pass_code: 'Pass Code',
    lipa_namba: 'Lipa Namba',
    bank_name: 'Bank Name',
    bank_account: 'Account No.',
    account_name: 'Account Name',
    pledge_balance: 'Balance Due',
    pledge_amount: 'Pledged Amount',
    amount_paid: 'Amount Paid',
};

function ScaledCardThumbnail({ guest, event, template }) {
    return (
        <div className="w-full relative flex items-start justify-center pointer-events-none">
            <PersonalisedCard
                guest={guest}
                event={event}
                template={template}
                interactive={false}
                className="w-full"
            />
        </div>
    );
}

export default function Messaging({
    events = [],
    selectedEvent,
    templates = [],
    recentMessages = [],
    quotas = null,
    gateways = {},
    isAdmin = false,
    canCustomizeMicrosite: propCanCustomizeMicrosite = false
}) {
    const { auth, flash, errors } = usePage().props;
    const user = auth?.user;
    const isSuperAdmin = user?.role === 'admin' || user?.is_admin || isAdmin;
    const isSubAdmin = user?.role === 'sub_admin' || user?.is_sub_admin;
    const canDeleteLogs = isSuperAdmin || isSubAdmin;
    const canBroadcast = isSuperAdmin || isSubAdmin || (user?.status !== 'suspended' && user?.effective_permissions?.can_send_broadcasts !== false);
    const canCustomizeMicrosite = isSuperAdmin || isSubAdmin || propCanCustomizeMicrosite || (user?.status !== 'suspended' && (
        user?.effective_permissions?.can_customize_microsite === true ||
        selectedEvent?.microsite_config?.admin_override === true ||
        selectedEvent?.has_microsite_enabled === true
    ));
    const activeQuotas = quotas || user?.message_quotas;

    const [activeView, setActiveView] = useState('compose'); // 'compose' | 'history'
    const [channel, setChannel] = useState('whatsapp');
    const [campaignType, setCampaignType] = useState('pass_invitation'); // 'pass_invitation' | 'pass_only' | 'text_rsvp' | 'pledge_contribution' | 'text_only'
    const [includePassLink, setIncludePassLink] = useState(false);
    const effectiveIncludePassLink = canCustomizeMicrosite && includePassLink;

    useEffect(() => {
        if (!canCustomizeMicrosite && includePassLink) {
            setIncludePassLink(false);
        }
    }, [canCustomizeMicrosite, includePassLink]);

    const [customCaption, setCustomCaption] = useState(WHATSAPP_DEFAULT_TEMPLATE);
    const [isDispatching, setIsDispatching] = useState(false);
    const [showGuestChecklist, setShowGuestChecklist] = useState(false);
    const [showRsvpCustomization, setShowRsvpCustomization] = useState(false);

    // Card Template Selection for Event & Pass Sending
    const initialTemplateId = selectedEvent?.card_template_id || selectedEvent?.card_template?.id || '';
    const [selectedTemplateId, setSelectedTemplateId] = useState(initialTemplateId);
    const [isSavingTemplate, setIsSavingTemplate] = useState(false);
    const [gatewayModalOpen, setGatewayModalOpen] = useState(false);
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

    useEffect(() => {
        if (selectedEvent) {
            const tId = selectedEvent.card_template_id || selectedEvent.card_template?.id || '';
            setSelectedTemplateId(tId);
        }
    }, [selectedEvent?.id, selectedEvent?.card_template_id]);

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
        if (selectedTemplateId) {
            return templates.find(t => String(t.id) === String(selectedTemplateId)) || null;
        }
        return selectedEvent?.card_template || selectedEvent?.cardTemplate || null;
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
    const [rsvpButtonAttending, setRsvpButtonAttending] = useState(
        eventAutoReplyConfig.button_attending || 'Will Attend'
    );
    const [rsvpButtonDeclined, setRsvpButtonDeclined] = useState(
        eventAutoReplyConfig.button_declined || 'Cannot Attend'
    );

    useEffect(() => {
        const cfg = selectedEvent?.rsvp_auto_reply_config || {};
        setEnableAutoReply(cfg.enabled !== false);
        setRsvpAttendingText(
            cfg.attending_text || "Thank you {{guest_name}}! Your RSVP has been confirmed for {{event_title}}. We look forward to seeing you on {{event_date}}!"
        );
        setRsvpDeclinedText(
            cfg.declined_text || "Thank you {{guest_name}} for letting us know. Your RSVP has been recorded: Will Not Attend."
        );
        setRsvpButtonAttending(cfg.button_attending || 'Will Attend');
        setRsvpButtonDeclined(cfg.button_declined || 'Cannot Attend');
    }, [selectedEvent?.id]);

    // Interactive chat preview simulation state
    const [previewRsvpTapped, setPreviewRsvpTapped] = useState('attending');
    const [recipientSearch, setRecipientSearch] = useState('');
    const [previewGuestId, setPreviewGuestId] = useState('');

    // Delivery Logs search & filters state
    const [logSearch, setLogSearch] = useState('');
    const [logChannelFilter, setLogChannelFilter] = useState('all');
    const [logStatusFilter, setLogStatusFilter] = useState('all');

    const eventMessages = useMemo(() => {
        if (!selectedEvent?.id) return recentMessages;
        return recentMessages.filter((msg) => Number(msg.event_id) === Number(selectedEvent.id));
    }, [recentMessages, selectedEvent?.id]);

    const filteredRecentLogs = useMemo(() => {
        return eventMessages.filter((msg) => {
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
    }, [eventMessages, logSearch, logChannelFilter, logStatusFilter]);

    const logChannelCounts = useMemo(() => {
        return {
            all: eventMessages.length,
            whatsapp: eventMessages.filter(m => m.channel === 'whatsapp').length,
            sms: eventMessages.filter(m => m.channel === 'sms').length,
        };
    }, [eventMessages]);

    const logStatusSummary = useMemo(() => {
        const deliveredOrRead = eventMessages.filter(m => m.status === 'delivered' || m.status === 'read' || m.status === 'sent').length;
        const failed = eventMessages.filter(m => m.status === 'failed').length;
        return {
            total: eventMessages.length,
            deliveredOrRead,
            failed,
        };
    }, [eventMessages]);

    const allGuests = selectedEvent?.guests || [];

    const filterCounts = useMemo(() => {
        return {
            draft: allGuests.filter(g => g.delivery_status === 'draft').length,
            all: allGuests.length,
            pending_rsvp: allGuests.filter(g => g.rsvp_status === 'pending').length,
            failed: allGuests.filter(g => g.delivery_status === 'failed').length,
            unpledged: allGuests.filter(g => !g.pledge_amount || Number(g.pledge_amount) <= 0).length,
            pending_balance: allGuests.filter(g => Number(g.pledge_amount || 0) > Number(g.paid_amount || 0)).length,
            partial: allGuests.filter(g => Number(g.paid_amount || 0) > 0 && Number(g.paid_amount) < Number(g.pledge_amount || 0)).length,
        };
    }, [allGuests]);

    const initialTargetFilter = filterCounts.draft > 0 ? 'draft' : 'all';
    const [targetFilter, setTargetFilter] = useState(initialTargetFilter);

    const [selectedGuestIds, setSelectedGuestIds] = useState(() => {
        const drafts = allGuests.filter(g => g.delivery_status === 'draft').map(g => g.id);
        return drafts.length > 0 ? drafts : allGuests.map(g => g.id);
    });

    const filteredGuests = useMemo(() => {
        if (targetFilter === 'draft') return allGuests.filter(g => g.delivery_status === 'draft');
        if (targetFilter === 'failed') return allGuests.filter(g => g.delivery_status === 'failed');
        if (targetFilter === 'pending_rsvp') return allGuests.filter(g => g.rsvp_status === 'pending');
        if (targetFilter === 'unpledged') return allGuests.filter(g => !g.pledge_amount || Number(g.pledge_amount) <= 0);
        if (targetFilter === 'pending_balance') return allGuests.filter(g => Number(g.pledge_amount || 0) > Number(g.paid_amount || 0));
        if (targetFilter === 'partial') return allGuests.filter(g => Number(g.paid_amount || 0) > 0 && Number(g.paid_amount) < Number(g.pledge_amount || 0));
        if (targetFilter === 'custom') return allGuests.filter(g => selectedGuestIds.includes(g.id));
        return allGuests;
    }, [allGuests, targetFilter, selectedGuestIds]);

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
        } else if (targetFilter === 'unpledged') {
            setSelectedGuestIds(guests.filter(g => !g.pledge_amount || Number(g.pledge_amount) <= 0).map(g => g.id));
        } else if (targetFilter === 'pending_balance') {
            setSelectedGuestIds(guests.filter(g => Number(g.pledge_amount || 0) > Number(g.paid_amount || 0)).map(g => g.id));
        } else if (targetFilter === 'partial') {
            setSelectedGuestIds(guests.filter(g => Number(g.paid_amount || 0) > 0 && Number(g.paid_amount) < Number(g.pledge_amount || 0)).map(g => g.id));
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

    const getDefaultCaption = (targetMode = campaignType, targetChannel = channel) => {
        if (targetMode === 'pledge_contribution') {
            return targetChannel === 'sms' ? PLEDGE_DEFAULT_SMS : PLEDGE_DEFAULT_WHATSAPP;
        }
        if (targetChannel === 'sms') {
            return SMS_DEFAULT_TEMPLATE;
        }
        if (targetMode === 'text_rsvp') {
            return "Habari {{guest_name}}! You're cordially invited to {{event_title}} on {{event_date}} at {{venue}}. Please tap below to confirm your attendance:";
        }
        if (targetMode === 'pass_only') {
            return "Hi {{guest_name}}! You're invited to {{event_title}} on {{event_date}}. Please view your official invitation pass below:";
        }
        if (targetMode === 'text_only') {
            return TEXT_ONLY_PRESETS[0]?.text || "Habari {{guest_name}}! We are delighted to invite you to {{event_title}} on {{event_date}} at {{venue}}.";
        }
        return WHATSAPP_DEFAULT_TEMPLATE;
    };

    const [captionResetFlash, setCaptionResetFlash] = useState(false);
    const [buttonsResetFlash, setButtonsResetFlash] = useState(false);
    const [autoReplyResetFlash, setAutoReplyResetFlash] = useState(false);

    const handleResetCaption = () => {
        const defaultText = getDefaultCaption(campaignType, channel);
        setCustomCaption(defaultText);
        setCaptionResetFlash(true);
        setTimeout(() => setCaptionResetFlash(false), 1800);
    };

    const handleResetButtons = () => {
        setRsvpButtonAttending('Will Attend');
        setRsvpButtonDeclined('Cannot Attend');
        setButtonsResetFlash(true);
        setTimeout(() => setButtonsResetFlash(false), 1800);
    };

    const handleResetAutoReply = () => {
        setRsvpAttendingText("Thank you {{guest_name}}! Your RSVP has been confirmed for {{event_title}}. We look forward to seeing you on {{event_date}}!");
        setRsvpDeclinedText("Thank you {{guest_name}} for letting us know. Your RSVP has been recorded: Will Not Attend.");
        setAutoReplyResetFlash(true);
        setTimeout(() => setAutoReplyResetFlash(false), 1800);
    };

    const handleCampaignTypeChange = (newType) => {
        setCampaignType(newType);
        setCustomCaption(getDefaultCaption(newType, channel));
        if (newType === 'pledge_contribution') {
            if (['draft', 'pending_rsvp', 'failed'].includes(targetFilter)) {
                setTargetFilter('all');
            }
        } else {
            if (['unpledged', 'pending_balance', 'partial'].includes(targetFilter)) {
                setTargetFilter('all');
            }
        }
    };

    const handleChannelChange = (newChannel) => {
        setChannel(newChannel);
        if (newChannel === 'sms') {
            if (campaignType !== 'pledge_contribution') {
                setCampaignType('text_only');
                setCustomCaption(getDefaultCaption('text_only', 'sms'));
            } else {
                setCustomCaption(getDefaultCaption('pledge_contribution', 'sms'));
            }
        } else if (newChannel === 'whatsapp') {
            const nextType = campaignType === 'text_only' ? 'pass_invitation' : campaignType;
            setCampaignType(nextType);
            setCustomCaption(getDefaultCaption(nextType, 'whatsapp'));
        }
    };

    // High-level 3-goal purpose helper: 'invitation' | 'pledge' | 'update'
    const currentPurpose = useMemo(() => {
        if (campaignType === 'pledge_contribution') return 'pledge';
        if (campaignType === 'text_only' && channel === 'whatsapp') return 'update';
        return 'invitation';
    }, [campaignType, channel]);

    const handleSelectPurpose = (purpose) => {
        if (purpose === 'pledge') {
            handleCampaignTypeChange('pledge_contribution');
        } else if (purpose === 'update') {
            handleCampaignTypeChange('text_only');
        } else {
            // 'invitation'
            if (channel === 'sms') {
                setCampaignType('text_only');
                setCustomCaption(SMS_DEFAULT_TEMPLATE);
            } else {
                handleCampaignTypeChange('pass_invitation');
            }
        }
    };

    const handleSelectEvent = (eventId) => {
        router.get(route('messaging.index'), { event_id: eventId }, { preserveState: true });
    };

    const handleSelectTemplate = (templateId) => {
        setSelectedTemplateId(templateId);
    };

    const handleSaveTemplateToEvent = () => {
        if (!selectedEvent) return;
        setIsSavingTemplate(true);
        router.patch(route('messaging.updateEventTemplate', selectedEvent.id), {
            card_template_id: selectedTemplateId || '',
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
            alert('No event selected. Please create or select an event first.');
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
            }
        }

        setIsDispatching(true);

        router.post(route('messaging.broadcast'), {
            event_id: activeEventId,
            card_template_id: selectedTemplateId || undefined,
            channel: channel,
            campaign_type: campaignType,
            include_pass_link: effectiveIncludePassLink,
            target_filter: targetFilter,
            selected_guest_ids: guestIdsToSend,
            custom_caption: customCaption,
            enable_auto_reply: enableAutoReply,
            rsvp_attending_text: rsvpAttendingText,
            rsvp_declined_text: rsvpDeclinedText,
            rsvp_button_attending: rsvpButtonAttending,
            rsvp_button_declined: rsvpButtonDeclined,
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
        setConfirmModal({
            show: true,
            title: 'Delete Message Log?',
            message: `Delete delivery record for "${recipient}"?`,
            confirmText: 'Delete',
            type: 'danger',
            loading: false,
            onConfirm: () => {
                setConfirmModal(prev => ({ ...prev, loading: true }));
                router.delete(route('messaging.destroyLog', msg.id), {
                    preserveScroll: true,
                    onFinish: () => setConfirmModal(prev => ({ ...prev, show: false, loading: false })),
                });
            }
        });
    };

    const handleClearAllLogs = () => {
        const targetDesc = selectedEvent ? `event "${selectedEvent.title}"` : 'all events';
        setConfirmModal({
            show: true,
            title: 'Clear Delivery Logs?',
            message: `Delete all message logs for ${targetDesc}?`,
            warning: 'This cannot be undone.',
            confirmText: 'Clear All',
            type: 'danger',
            loading: false,
            onConfirm: () => {
                setConfirmModal(prev => ({ ...prev, loading: true }));
                router.delete(route('messaging.clearLogs'), {
                    data: {
                        event_id: selectedEvent?.id || undefined,
                    },
                    preserveScroll: true,
                    onFinish: () => setConfirmModal(prev => ({ ...prev, show: false, loading: false })),
                });
            }
        });
    };

    const sampleGuest = useMemo(() => {
        if (previewGuestId && allGuests.length > 0) {
            const found = allGuests.find(g => String(g.id) === String(previewGuestId));
            if (found) return found;
        }
        return allGuests[0] || {
            id: 1,
            name: 'Neema Mbwana',
            phone: '+255 712 345 678',
            category: 'Double Entry',
            allowance_label: 'Double Entry',
            card_number: 'KDV-2026-004821',
            unique_code: '29841872',
            qr_token: 'kdv_neema_mbwana_29841872',
            pledge_amount: 100000,
            paid_amount: 50000,
            pledge_status: 'partial',
        };
    }, [allGuests, previewGuestId]);

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

    const pledgeSettings = selectedEvent?.pledge_settings || {};
    const sampleLipa = pledgeSettings.lipa_number || '5428901 (Kardovo Event)';
    const sampleBankName = pledgeSettings.bank_name || 'CRDB Bank';
    const sampleBankAccount = pledgeSettings.account_number || '0152489201900';
    const sampleAccountName = pledgeSettings.account_name || selectedEvent?.title || 'Kamati ya Harusi';
    const eventCurrency = selectedEvent?.pledge_currency || 'TZS';
    const guestPledge = Number(sampleGuest.pledge_amount || 100000);
    const guestPaid = Number(sampleGuest.paid_amount || 50000);
    const guestBalance = Math.max(0, guestPledge - guestPaid);
    const samplePledgeBalance = `${guestBalance.toLocaleString()} ${eventCurrency}`;
    const samplePledgeAmount = `${guestPledge.toLocaleString()} ${eventCurrency}`;
    const sampleAmountPaid = `${guestPaid.toLocaleString()} ${eventCurrency}`;

    const samplePassUrl = useMemo(() => {
        const token = sampleGuest?.qr_token || sampleGuest?.unique_code || '29841872';
        const webhookUrl = gateways?.whatsapp?.webhook_url;
        if (webhookUrl && !webhookUrl.includes('localhost') && !webhookUrl.includes('127.0.0.1')) {
            try {
                const u = new URL(webhookUrl);
                return `${u.origin}/card/${token}`;
            } catch (e) {}
        }
        if (typeof window !== 'undefined' && window.location?.origin) {
            return `${window.location.origin}/card/${token}`;
        }
        return `https://kardovo.com/card/${token}`;
    }, [sampleGuest, gateways]);

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
        .replace(/\{pass_code\}/gi, samplePassCode)
        .replace(/\{\{lipa_namba\}\}/gi, sampleLipa)
        .replace(/\{lipa_namba\}/gi, sampleLipa)
        .replace(/\{\{lipa_number\}\}/gi, sampleLipa)
        .replace(/\{lipa_number\}/gi, sampleLipa)
        .replace(/\{\{bank_name\}\}/gi, sampleBankName)
        .replace(/\{bank_name\}/gi, sampleBankName)
        .replace(/\{\{bank_account\}\}/gi, sampleBankAccount)
        .replace(/\{bank_account\}/gi, sampleBankAccount)
        .replace(/\{\{account_number\}\}/gi, sampleBankAccount)
        .replace(/\{account_number\}/gi, sampleBankAccount)
        .replace(/\{\{account_name\}\}/gi, sampleAccountName)
        .replace(/\{account_name\}/gi, sampleAccountName)
        .replace(/\{\{pledge_balance\}\}/gi, samplePledgeBalance)
        .replace(/\{pledge_balance\}/gi, samplePledgeBalance)
        .replace(/\{\{pledge_amount\}\}/gi, samplePledgeAmount)
        .replace(/\{pledge_amount\}/gi, samplePledgeAmount)
        .replace(/\{\{amount_paid\}\}/gi, sampleAmountPaid)
        .replace(/\{amount_paid\}/gi, sampleAmountPaid)
        .replace(/\{\{paid_amount\}\}/gi, sampleAmountPaid)
        .replace(/\{paid_amount\}/gi, sampleAmountPaid);

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
                (isSuperAdmin || isSubAdmin) && (
                    <button
                        type="button"
                        onClick={() => setGatewayModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-100 hover:text-white bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] rounded-xl shadow-2xs transition active:scale-95 cursor-pointer"
                        title="Configure Gateways"
                    >
                        <Settings className="w-3.5 h-3.5 text-sky-400" />
                        <span className="hidden sm:inline">Gateways</span>
                    </button>
                )
            }
        >
            <Head title="Messaging & Broadcast Hub - Kardovo" />

            <div className="max-w-7xl mx-auto space-y-5">
                {events.length === 0 ? (
                    <EmptyEventState
                        title="No Event Selected"
                        description="Please select an event from the dashboard or create a new one to manage messaging and broadcast passes."
                        buttonText="Go to Dashboard"
                        buttonHref={route('dashboard')}
                    />
                ) : (
                    <>
                        {/* ═══════════════════════════════════════════════════════════ */}
                        {/* TOP BAR: EVENT SELECTOR, QUOTAS & VIEW SWITCHER             */}
                        {/* ═══════════════════════════════════════════════════════════ */}
                        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 min-w-0">
                                <div className="min-w-0 flex-1 max-w-md">
                                    <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                                        Sending messages for event
                                    </label>
                                    <div className="relative">
                                        <select
                                            className="block w-full py-2 border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 text-slate-900 dark:text-white rounded-xl text-xs sm:text-sm font-bold leading-normal px-3.5 hover:border-slate-300 dark:hover:border-slate-700 focus:border-[#154F7C] dark:focus:border-sky-400 focus:ring-1 focus:ring-sky-500/20 cursor-pointer appearance-none bg-none pr-9 transition truncate"
                                            value={selectedEvent?.id || ''}
                                            onChange={(e) => handleSelectEvent(e.target.value)}
                                        >
                                            {events.map((evt) => (
                                                <option key={evt.id} value={evt.id}>
                                                    {evt.title} ({evt.guests_count ?? (evt.guests?.length || 0)} guests){evt.user?.name ? ` • ${evt.user.name}` : ''}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                                            <ChevronDown className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>

                                {activeQuotas && (
                                    <div className="flex items-center flex-wrap gap-2 sm:pt-5">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs font-medium text-slate-700 dark:text-slate-300" title="WhatsApp messages used">
                                            <MessageSquare className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                            <span><strong>{(activeQuotas.whatsapp_used || 0).toLocaleString()}</strong> / {activeQuotas.whatsapp_limit ? activeQuotas.whatsapp_limit.toLocaleString() : '∞'} WhatsApp</span>
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs font-medium text-slate-700 dark:text-slate-300" title="SMS messages used">
                                            <Smartphone className="w-3.5 h-3.5 text-[#327FB5] shrink-0" />
                                            <span><strong>{(activeQuotas.sms_used || 0).toLocaleString()}</strong> / {activeQuotas.sms_limit ? activeQuotas.sms_limit.toLocaleString() : '∞'} SMS</span>
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Simple View Switcher: Send Messages vs Delivery History */}
                            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 self-start lg:self-center w-full sm:w-auto">
                                <button
                                    type="button"
                                    onClick={() => setActiveView('compose')}
                                    className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                                        activeView === 'compose'
                                            ? 'bg-gradient-to-r from-[#154F7C] to-[#327FB5] text-white shadow-xs'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    <span>Send Messages</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveView('history')}
                                    className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                                        activeView === 'history'
                                            ? 'bg-gradient-to-r from-[#154F7C] to-[#327FB5] text-white shadow-xs'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    <History className="w-3.5 h-3.5" />
                                    <span>Delivery History</span>
                                    <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                                        activeView === 'history'
                                            ? 'bg-white/20 text-white'
                                            : 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                    }`}>
                                        {eventMessages.length}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {activeView === 'compose' ? (
                            /* ═══════════════════════════════════════════════════════════ */
                            /* GUIDED 3-STEP SENDING JOURNEY + LIVE PHONE PREVIEW          */
                            /* ═══════════════════════════════════════════════════════════ */
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                                {/* Left: 3 Simple Steps (7 cols) */}
                                <div className="lg:col-span-7 space-y-5">

                                    {/* ── STEP 1: Choose how & what to send ── */}
                                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
                                        <div className="flex items-start gap-3">
                                            <span className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#154F7C] to-[#327FB5] text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-2xs">
                                                1
                                            </span>
                                            <div>
                                                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                                    Choose how & what to send
                                                </h2>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                    Pick your delivery channel and the type of message you want guests to receive.
                                                </p>
                                            </div>
                                        </div>

                                        {/* 1A: Delivery Channel */}
                                        <div>
                                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                                                Where should guests receive this?
                                            </label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                                <button
                                                    type="button"
                                                    onClick={() => handleChannelChange('whatsapp')}
                                                    className={`p-3 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                                                        channel === 'whatsapp'
                                                            ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-500/80 text-emerald-950 dark:text-emerald-100 ring-1 ring-emerald-500/25'
                                                            : 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/40'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                                            channel === 'whatsapp'
                                                                ? 'bg-emerald-500 text-white'
                                                                : 'bg-slate-200/70 dark:bg-slate-800 text-slate-500'
                                                        }`}>
                                                            <MessageSquare className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <div className="text-xs font-bold">WhatsApp</div>
                                                            <div className="text-[11px] text-slate-500 dark:text-slate-400">Supports card images & 1-tap RSVP</div>
                                                        </div>
                                                    </div>
                                                    {channel === 'whatsapp' && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleChannelChange('sms')}
                                                    className={`p-3 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                                                        channel === 'sms'
                                                            ? 'bg-sky-50/80 dark:bg-sky-950/30 border-[#327FB5] text-slate-900 dark:text-sky-100 ring-1 ring-[#327FB5]/25'
                                                            : 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/40'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                                            channel === 'sms'
                                                                ? 'bg-[#154F7C] text-white'
                                                                : 'bg-slate-200/70 dark:bg-slate-800 text-slate-500'
                                                        }`}>
                                                            <Smartphone className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <div className="text-xs font-bold">Regular SMS</div>
                                                            <div className="text-[11px] text-slate-500 dark:text-slate-400">Works on any phone without internet</div>
                                                        </div>
                                                    </div>
                                                    {channel === 'sms' && <CheckCircle2 className="w-4 h-4 text-[#154F7C] dark:text-sky-400 shrink-0" />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* 1B: Message Purpose (3 Clear Goals) */}
                                        <div>
                                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                                                What is the purpose of this message?
                                            </label>
                                            <div className={`grid gap-2.5 ${channel === 'sms' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'}`}>
                                                {[
                                                    {
                                                        id: 'invitation',
                                                        title: 'Send Invitations',
                                                        desc: channel === 'whatsapp' ? 'Invitation card & RSVP' : 'Text invite with pass link',
                                                        icon: Ticket,
                                                        show: true,
                                                    },
                                                    {
                                                        id: 'pledge',
                                                        title: 'Pledges (Ahadi)',
                                                        desc: 'Request or remind contributions',
                                                        icon: Coins,
                                                        show: true,
                                                    },
                                                    {
                                                        id: 'update',
                                                        title: 'Reminder / Update',
                                                        desc: 'Send a quick note or reminder',
                                                        icon: Bell,
                                                        show: channel === 'whatsapp',
                                                    },
                                                ].filter(item => item.show).map((goal) => {
                                                    const IconComp = goal.icon;
                                                    const isSelected = currentPurpose === goal.id;
                                                    return (
                                                        <button
                                                            key={goal.id}
                                                            type="button"
                                                            onClick={() => handleSelectPurpose(goal.id)}
                                                            className={`p-3 rounded-xl border text-left transition flex sm:flex-col items-center sm:items-start gap-3 sm:gap-1.5 cursor-pointer ${
                                                                isSelected
                                                                    ? 'bg-gradient-to-br from-[#0B2545] via-[#154F7C] to-[#327FB5] text-white border-transparent shadow-xs ring-1 ring-sky-400/30'
                                                                    : 'bg-slate-50/60 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                                                            }`}
                                                        >
                                                            <div className="flex items-center justify-between w-auto sm:w-full">
                                                                <IconComp className={`w-4 h-4 ${isSelected ? 'text-sky-200' : 'text-[#154F7C] dark:text-sky-400'}`} />
                                                                {isSelected && <Check className="w-3.5 h-3.5 text-white hidden sm:block" />}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                                                                    {goal.title}
                                                                </div>
                                                                <div className={`text-[11px] leading-snug mt-0.5 ${isSelected ? 'text-sky-100/90' : 'text-slate-500 dark:text-slate-400'}`}>
                                                                    {goal.desc}
                                                                </div>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* 1C: WhatsApp Invitation Style & Card Design Picker */}
                                        {channel === 'whatsapp' && currentPurpose === 'invitation' && (
                                            <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-3.5">
                                                <div>
                                                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-2">
                                                        Invitation style on WhatsApp
                                                    </label>
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                                        {[
                                                            { id: 'pass_invitation', label: 'Card + RSVP Buttons', sub: 'Recommended' },
                                                            { id: 'pass_only', label: 'Card Only', sub: 'No RSVP buttons' },
                                                            { id: 'text_rsvp', label: 'Text + RSVP Buttons', sub: 'No card image' },
                                                        ].map((style) => {
                                                            const active = campaignType === style.id;
                                                            return (
                                                                <button
                                                                    key={style.id}
                                                                    type="button"
                                                                    onClick={() => handleCampaignTypeChange(style.id)}
                                                                    className={`px-3 py-2 rounded-lg border text-left transition cursor-pointer flex items-center justify-between sm:block ${
                                                                        active
                                                                            ? 'bg-white dark:bg-slate-900 border-[#154F7C] dark:border-sky-400 text-slate-900 dark:text-white shadow-2xs ring-1 ring-[#154F7C]/20'
                                                                            : 'bg-transparent border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-900/40'
                                                                    }`}
                                                                >
                                                                    <div className="text-xs font-bold flex items-center justify-between gap-1">
                                                                        <span>{style.label}</span>
                                                                        {active && <Check className="w-3.5 h-3.5 text-[#154F7C] dark:text-sky-400 shrink-0" />}
                                                                    </div>
                                                                    <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{style.sub}</div>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Card Design Selector when a card is included */}
                                                {(campaignType === 'pass_invitation' || campaignType === 'pass_only') && (
                                                    <div className="pt-3 border-t border-slate-200/70 dark:border-slate-800/80">
                                                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mb-1.5">
                                                            <Palette className="w-3.5 h-3.5 text-[#154F7C] dark:text-sky-400" />
                                                            <span>Invitation Card Design</span>
                                                        </label>
                                                        <div className="flex flex-col sm:flex-row gap-2">
                                                            <div className="relative flex-1">
                                                                <select
                                                                    value={selectedTemplateId || ''}
                                                                    onChange={(e) => handleSelectTemplate(e.target.value)}
                                                                    className="block w-full py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl text-xs font-medium leading-normal px-3 hover:border-slate-300 focus:border-[#154F7C] dark:focus:border-sky-400 focus:ring-1 focus:ring-sky-500/20 cursor-pointer appearance-none bg-none pr-8 transition"
                                                                >
                                                                    <option value="">None (No Card Design)</option>
                                                                    {templates.some(t => t.user_id) && (
                                                                        <optgroup label="My Custom Designs">
                                                                            {templates.filter(t => t.user_id).map(t => (
                                                                                <option key={t.id} value={t.id}>{t.name}</option>
                                                                            ))}
                                                                        </optgroup>
                                                                    )}
                                                                    {templates.some(t => !t.user_id) && (
                                                                        <optgroup label="Ready-Made Templates">
                                                                            {templates.filter(t => !t.user_id).map(t => (
                                                                                <option key={t.id} value={t.id}>{t.name}</option>
                                                                            ))}
                                                                        </optgroup>
                                                                    )}
                                                                </select>
                                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
                                                                    <ChevronDown className="w-3.5 h-3.5" />
                                                                </div>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={handleSaveTemplateToEvent}
                                                                disabled={isSavingTemplate || !selectedEvent || (String(selectedEvent?.card_template_id || '') === String(selectedTemplateId || ''))}
                                                                className="h-9 px-3.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl inline-flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
                                                            >
                                                                {isSavingTemplate ? (
                                                                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                                                                ) : (
                                                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                                )}
                                                                <span>{String(selectedEvent?.card_template_id || '') === String(selectedTemplateId || '') ? 'Saved for Event' : 'Save as Event Default'}</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* ── STEP 2: Choose who receives it ── */}
                                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-start gap-3">
                                                <span className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#154F7C] to-[#327FB5] text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-2xs">
                                                    2
                                                </span>
                                                <div>
                                                    <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                                        Choose who receives this message
                                                    </h2>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                        Select a group below, or pick individual guests from your list.
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/50 border border-sky-200/70 dark:border-sky-800/60 text-xs font-bold text-[#154F7C] dark:text-sky-300 shrink-0">
                                                <Users className="w-3.5 h-3.5" />
                                                <span>{selectedGuestIds.length} of {allGuests.length}</span>
                                            </span>
                                        </div>

                                        {/* Plain-English Audience Filter Buttons */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                            {(campaignType === 'pledge_contribution'
                                                ? [
                                                    { id: 'all', label: 'All Guests', sub: 'Everyone on list', count: filterCounts.all },
                                                    { id: 'unpledged', label: 'No Pledge Yet', sub: 'Haven’t pledged', count: filterCounts.unpledged },
                                                    { id: 'pending_balance', label: 'Unpaid Balance', sub: 'Have balance due', count: filterCounts.pending_balance },
                                                    { id: 'partial', label: 'Partially Paid', sub: 'Started paying', count: filterCounts.partial },
                                                ]
                                                : [
                                                    { id: 'draft', label: 'Not Sent Yet', sub: 'New / unsent guests', count: filterCounts.draft },
                                                    { id: 'all', label: 'All Guests', sub: 'Everyone on list', count: filterCounts.all },
                                                    { id: 'pending_rsvp', label: 'Awaiting RSVP', sub: 'No reply yet', count: filterCounts.pending_rsvp },
                                                    { id: 'failed', label: 'Failed Delivery', sub: 'Retry sending', count: filterCounts.failed },
                                                ]
                                            ).map((opt) => {
                                                const active = targetFilter === opt.id;
                                                return (
                                                    <button
                                                        key={opt.id}
                                                        type="button"
                                                        onClick={() => setTargetFilter(opt.id)}
                                                        className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                                                            active
                                                                ? 'bg-sky-50/70 dark:bg-sky-950/30 border-[#154F7C] dark:border-sky-400 ring-1 ring-[#154F7C]/20'
                                                                : 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100/70 dark:hover:bg-slate-800/40'
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between gap-1 w-full">
                                                            <span className={`text-xs font-bold ${active ? 'text-[#0B2545] dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                                                                {opt.label}
                                                            </span>
                                                            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md font-bold ${
                                                                active
                                                                    ? 'bg-[#154F7C] text-white'
                                                                    : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                                            }`}>
                                                                {opt.count}
                                                            </span>
                                                        </div>
                                                        <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                                                            {opt.sub}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Collapsible Specific Guest Picker */}
                                        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden bg-slate-50/30 dark:bg-slate-950/30">
                                            <div className="px-3.5 py-2.5 flex items-center justify-between gap-2">
                                                <div className="text-xs text-slate-600 dark:text-slate-300">
                                                    Ready to send to <strong className="text-slate-900 dark:text-white">{selectedGuestIds.length}</strong> guest{selectedGuestIds.length === 1 ? '' : 's'}.
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowGuestChecklist(!showGuestChecklist)}
                                                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#154F7C] dark:text-sky-400 hover:underline cursor-pointer"
                                                >
                                                    <span>{showGuestChecklist ? 'Hide guest list' : 'Pick specific guests'}</span>
                                                    {showGuestChecklist ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>

                                            {showGuestChecklist && (
                                                <div className="border-t border-slate-200/70 dark:border-slate-800">
                                                    <div className="p-2.5 bg-slate-100/60 dark:bg-slate-900/60 border-b border-slate-200/60 dark:border-slate-800/60 flex flex-col xs:flex-row xs:items-center justify-between gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={handleSelectAllFiltered}
                                                            className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 cursor-pointer pl-1 transition"
                                                        >
                                                            <CheckSquare className="w-3.5 h-3.5 text-[#154F7C] dark:text-sky-400" />
                                                            <span>
                                                                {searchedFilteredGuests.length > 0 && searchedFilteredGuests.every(g => selectedGuestIds.includes(g.id))
                                                                    ? 'Unselect All'
                                                                    : `Select All (${searchedFilteredGuests.length})`
                                                                }
                                                            </span>
                                                        </button>
                                                        <div className="relative w-full xs:w-52">
                                                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                                                            <input
                                                                type="text"
                                                                placeholder="Search name or phone..."
                                                                value={recipientSearch}
                                                                onChange={(e) => setRecipientSearch(e.target.value)}
                                                                className="w-full pl-8 pr-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="max-h-52 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50">
                                                        {searchedFilteredGuests.length === 0 ? (
                                                            <div className="p-4 text-center text-xs text-slate-400">
                                                                No guests match this filter or search.
                                                            </div>
                                                        ) : (
                                                            searchedFilteredGuests.map((guest) => {
                                                                const isSelected = selectedGuestIds.includes(guest.id);
                                                                const pledgeAmt = Number(guest.pledge_amount || 0);
                                                                const paidAmt = Number(guest.paid_amount || 0);
                                                                return (
                                                                    <div
                                                                        key={guest.id}
                                                                        onClick={() => toggleGuestSelection(guest.id)}
                                                                        className={`px-3.5 py-2 flex items-center justify-between gap-3 text-xs transition cursor-pointer select-none ${
                                                                            isSelected
                                                                                ? 'bg-sky-500/5 dark:bg-sky-500/10 text-slate-900 dark:text-white'
                                                                                : 'hover:bg-slate-100/50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                                                                        }`}
                                                                    >
                                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={isSelected}
                                                                                onChange={() => {}}
                                                                                className="rounded border-slate-300 dark:border-slate-700 text-[#154F7C] focus:ring-sky-500 cursor-pointer"
                                                                            />
                                                                            <span className="font-medium truncate">{guest.name}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2 flex-shrink-0">
                                                                            <span className="font-mono text-[11px] text-slate-400">{guest.phone}</span>
                                                                            {campaignType === 'pledge_contribution' ? (
                                                                                pledgeAmt > 0 ? (
                                                                                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded font-mono ${
                                                                                        paidAmt >= pledgeAmt
                                                                                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                                                                                            : paidAmt > 0
                                                                                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                                                                                            : 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400'
                                                                                    }`}>
                                                                                        {paidAmt >= pledgeAmt
                                                                                            ? `Paid (${pledgeAmt.toLocaleString()})`
                                                                                            : paidAmt > 0
                                                                                            ? `${paidAmt.toLocaleString()} / ${pledgeAmt.toLocaleString()}`
                                                                                            : `Ahadi ${pledgeAmt.toLocaleString()}`}
                                                                                    </span>
                                                                                ) : (
                                                                                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                                                                        No pledge
                                                                                    </span>
                                                                                )
                                                                            ) : (
                                                                                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded capitalize ${
                                                                                    guest.delivery_status === 'read' ? 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400' :
                                                                                    guest.delivery_status === 'delivered' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' :
                                                                                    guest.delivery_status === 'sent' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' :
                                                                                    guest.delivery_status === 'failed' ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400' :
                                                                                    'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                                                                }`}>
                                                                                    {guest.delivery_status || 'draft'}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* ── STEP 3: Review message & send ── */}
                                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-start gap-3">
                                                <span className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#154F7C] to-[#327FB5] text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-2xs">
                                                    3
                                                </span>
                                                <div>
                                                    <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                                        Review your message & send
                                                    </h2>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                        Personalize the wording below. Each guest automatically sees their own name and details.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Ready-made Message Templates for Pledges or Reminders */}
                                        {(campaignType === 'text_only' || campaignType === 'pledge_contribution') && (
                                            <div className="space-y-1.5">
                                                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                                                    Quick message templates:
                                                </span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {(campaignType === 'pledge_contribution' ? PLEDGE_PRESETS : TEXT_ONLY_PRESETS).map((preset) => (
                                                        <button
                                                            key={preset.id}
                                                            type="button"
                                                            onClick={() => setCustomCaption(preset.text)}
                                                            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-950/50 hover:text-[#154F7C] dark:hover:text-sky-300 border border-slate-200/70 dark:border-slate-700/70 text-xs font-semibold text-slate-700 dark:text-slate-300 transition cursor-pointer"
                                                        >
                                                            {preset.title}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Message Editor */}
                                        <div>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                    Message wording
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={handleResetCaption}
                                                    className="inline-flex items-center gap-1 text-[11px] font-medium transition cursor-pointer text-[#154F7C] dark:text-sky-400 hover:underline"
                                                >
                                                    {captionResetFlash ? (
                                                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                                                            <Check className="w-3 h-3" />
                                                            Restored default
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1">
                                                            <RotateCcw className="w-3 h-3 text-slate-400" />
                                                            Reset to default
                                                        </span>
                                                    )}
                                                </button>
                                            </div>

                                            <textarea
                                                rows={4}
                                                className="block w-full border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 text-slate-900 dark:text-white rounded-xl text-xs sm:text-sm font-normal p-3.5 leading-relaxed focus:border-[#154F7C] dark:focus:border-sky-400 focus:ring-1 focus:ring-sky-500/20 outline-none transition"
                                                value={customCaption}
                                                onChange={(e) => setCustomCaption(e.target.value)}
                                            />

                                            {/* Human-friendly Insert Guest Info Chips */}
                                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5">
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    <span className="text-[11px] text-slate-400 font-medium mr-0.5">Insert automatic info:</span>
                                                    {(campaignType === 'pledge_contribution'
                                                        ? ['guest_name', 'event_title', 'lipa_namba', 'bank_name', 'bank_account', 'account_name', 'pledge_balance', 'pledge_amount', 'amount_paid']
                                                        : ['guest_name', 'event_title', 'event_date', 'venue', 'pass_code']
                                                    ).map((tag) => (
                                                        <button
                                                            key={tag}
                                                            type="button"
                                                            onClick={() => insertPlaceholder(tag)}
                                                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-medium transition cursor-pointer"
                                                            title={`Inserts {{${tag}}}`}
                                                        >
                                                            + {PLACEHOLDER_LABELS[tag] || tag}
                                                        </button>
                                                    ))}
                                                </div>
                                                {channel === 'sms' && (
                                                    <span className="text-[11px] font-mono text-slate-400">
                                                        {(formattedCaption + (effectiveIncludePassLink ? `\n\n🎟️ Digital Pass & RSVP: ${samplePassUrl}` : '')).length} chars • {Math.ceil((formattedCaption + (effectiveIncludePassLink ? `\n\n🎟️ Digital Pass & RSVP: ${samplePassUrl}` : '')).length / 160) || 1} SMS
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Optional Digital Pass & RSVP Link Toggle */}
                                        {canCustomizeMicrosite && (
                                            <div
                                                onClick={() => setIncludePassLink(!includePassLink)}
                                                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between select-none ${
                                                    includePassLink
                                                        ? 'bg-sky-500/10 dark:bg-sky-500/15 border-sky-500/40 ring-1 ring-sky-500/20'
                                                        : 'bg-slate-50/60 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100/60 dark:hover:bg-slate-900'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition shrink-0 ${
                                                        includePassLink
                                                            ? 'bg-gradient-to-r from-[#154F7C] to-[#327FB5] text-white'
                                                            : 'bg-slate-200/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                                    }`}>
                                                        <Ticket className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                                                            Include personal Digital Pass & RSVP web link
                                                        </div>
                                                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                                            Adds each guest’s personal invitation web page link at the bottom of the message
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="relative inline-flex items-center flex-shrink-0 ml-3 pointer-events-none">
                                                    <input
                                                        type="checkbox"
                                                        checked={includePassLink}
                                                        readOnly
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-10 h-6 bg-slate-300 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm peer-checked:bg-[#154F7C]" />
                                                </div>
                                            </div>
                                        )}

                                        {/* Collapsible RSVP Buttons & Auto-Reply Customization (WhatsApp RSVP modes only) */}
                                        {channel === 'whatsapp' && (campaignType === 'pass_invitation' || campaignType === 'text_rsvp') && (
                                            <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40 overflow-hidden">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowRsvpCustomization(!showRsvpCustomization)}
                                                    className="w-full px-3.5 py-2.5 flex items-center justify-between gap-2 text-left hover:bg-slate-100/60 dark:hover:bg-slate-900/60 transition cursor-pointer"
                                                >
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <SlidersHorizontal className="w-3.5 h-3.5 text-[#154F7C] dark:text-sky-400 shrink-0" />
                                                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                                                            RSVP Buttons & Automatic Reply
                                                        </div>
                                                        <span className="hidden sm:inline-block text-[11px] text-slate-400 truncate">
                                                            • "{rsvpButtonAttending}" / "{rsvpButtonDeclined}" ({enableAutoReply ? 'Auto-reply ON' : 'Auto-reply OFF'})
                                                        </span>
                                                    </div>
                                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#154F7C] dark:text-sky-400 shrink-0">
                                                        <span>{showRsvpCustomization ? 'Done' : 'Customize'}</span>
                                                        {showRsvpCustomization ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                                    </span>
                                                </button>

                                                {showRsvpCustomization && (
                                                    <div className="p-3.5 border-t border-slate-200/70 dark:border-slate-800 space-y-4 bg-white dark:bg-slate-900">
                                                        {/* Button Labels */}
                                                        <div>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                                    WhatsApp RSVP Button Labels
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={handleResetButtons}
                                                                    className="inline-flex items-center gap-1 text-[11px] font-medium text-[#154F7C] dark:text-sky-400 hover:underline cursor-pointer"
                                                                >
                                                                    {buttonsResetFlash ? 'Restored!' : 'Reset buttons'}
                                                                </button>
                                                            </div>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                                                <div>
                                                                    <div className="flex items-center justify-between mb-1">
                                                                        <label className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                                                                            ✓ Attending Button
                                                                        </label>
                                                                        <span className="text-[10px] text-slate-400 font-mono">{rsvpButtonAttending.length}/20</span>
                                                                    </div>
                                                                    <input
                                                                        type="text"
                                                                        maxLength={20}
                                                                        value={rsvpButtonAttending}
                                                                        placeholder="Will Attend"
                                                                        onChange={(e) => setRsvpButtonAttending(e.target.value)}
                                                                        className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center justify-between mb-1">
                                                                        <label className="text-[11px] font-medium text-rose-600 dark:text-rose-400">
                                                                            ✕ Declined Button
                                                                        </label>
                                                                        <span className="text-[10px] text-slate-400 font-mono">{rsvpButtonDeclined.length}/20</span>
                                                                    </div>
                                                                    <input
                                                                        type="text"
                                                                        maxLength={20}
                                                                        value={rsvpButtonDeclined}
                                                                        placeholder="Cannot Attend"
                                                                        onChange={(e) => setRsvpButtonDeclined(e.target.value)}
                                                                        className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Auto-Reply Bot */}
                                                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                                                        Automatic Confirmation Reply
                                                                    </div>
                                                                    <div className="text-[11px] text-slate-400">
                                                                        Send an instant thank-you message when a guest taps a button
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2.5">
                                                                    {enableAutoReply && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={handleResetAutoReply}
                                                                            className="text-[11px] font-medium text-[#154F7C] dark:text-sky-400 hover:underline cursor-pointer"
                                                                        >
                                                                            {autoReplyResetFlash ? 'Restored!' : 'Reset replies'}
                                                                        </button>
                                                                    )}
                                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={enableAutoReply}
                                                                            onChange={(e) => setEnableAutoReply(e.target.checked)}
                                                                            className="sr-only peer"
                                                                        />
                                                                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#154F7C]" />
                                                                    </label>
                                                                </div>
                                                            </div>

                                                            {enableAutoReply && (
                                                                <div className="space-y-2 pt-1">
                                                                    <div>
                                                                        <label className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 block mb-1">
                                                                            Reply when guest taps "{rsvpButtonAttending || 'Will Attend'}"
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            value={rsvpAttendingText}
                                                                            onChange={(e) => setRsvpAttendingText(e.target.value)}
                                                                            className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="text-[11px] font-medium text-rose-600 dark:text-rose-400 block mb-1">
                                                                            Reply when guest taps "{rsvpButtonDeclined || 'Cannot Attend'}"
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            value={rsvpDeclinedText}
                                                                            onChange={(e) => setRsvpDeclinedText(e.target.value)}
                                                                            className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* ── Final Send Bar ── */}
                                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <div className="text-xs text-slate-600 dark:text-slate-400">
                                                Sending via <strong className="text-slate-900 dark:text-white">{channel === 'whatsapp' ? 'WhatsApp' : 'SMS'}</strong> to{' '}
                                                <strong className="text-[#154F7C] dark:text-sky-400 font-bold">{selectedGuestIds.length}</strong> guest{selectedGuestIds.length === 1 ? '' : 's'}
                                            </div>
                                            {canBroadcast ? (
                                                <button
                                                    type="button"
                                                    onClick={handleSendBroadcast}
                                                    disabled={isDispatching || selectedGuestIds.length === 0}
                                                    className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-xs sm:text-sm font-bold transition active:scale-95 cursor-pointer shadow-xs ${
                                                        isDispatching
                                                            ? 'bg-slate-700 text-white opacity-80 cursor-wait'
                                                            : selectedGuestIds.length === 0
                                                            ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                                                            : 'bg-gradient-to-r from-[#154F7C] to-[#327FB5] hover:from-[#1A5C91] hover:to-[#3D8EC7] border border-sky-400/25 text-white shadow-[#154F7C]/20 hover:shadow-md'
                                                    }`}
                                                >
                                                    {isDispatching ? (
                                                        <>
                                                            <RefreshCw className="w-4 h-4 animate-spin text-white" />
                                                            <span>Sending to {selectedGuestIds.length} guest{selectedGuestIds.length === 1 ? '' : 's'}...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Send className="w-4 h-4" />
                                                            <span>Send {channel === 'whatsapp' ? 'WhatsApp' : 'SMS'} to {selectedGuestIds.length} Guest{selectedGuestIds.length === 1 ? '' : 's'}</span>
                                                        </>
                                                    )}
                                                </button>
                                            ) : (
                                                <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                                                    Broadcast permissions restricted.
                                                </div>
                                            )}
                                        </div>

                                        {(flash?.success || flash?.warning || flash?.error || Object.keys(errors).length > 0) && (
                                            <div className={`mt-3 p-3.5 rounded-xl border flex items-center justify-between gap-2.5 text-xs font-medium animate-fadeIn ${
                                                flash?.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-800/50 dark:text-emerald-300'
                                                : (flash?.warning ? 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/30 dark:border-amber-800/50 dark:text-amber-300'
                                                : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-800/50 dark:text-red-300')
                                            }`}>
                                                <div className="flex items-center gap-2.5">
                                                    {flash?.success ? <CheckCheck className="w-4 h-4 shrink-0" /> : <X className="w-4 h-4 shrink-0" />}
                                                    <span>{flash?.success || flash?.warning || flash?.error || Object.values(errors)[0]}</span>
                                                </div>
                                                {flash?.success && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setActiveView('history')}
                                                        className="text-xs font-bold underline shrink-0 cursor-pointer"
                                                    >
                                                        View Delivery Status →
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right: Live Guest Phone Preview (5 cols) */}
                                <div className="lg:col-span-5 space-y-3 lg:sticky lg:top-6">
                                    <div className="bg-white dark:bg-slate-900 p-3.5 px-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-2">
                                        <div>
                                            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                                <Smartphone className="w-3.5 h-3.5 text-[#154F7C] dark:text-sky-400" />
                                                <span>What your guest will see</span>
                                            </div>
                                            <div className="text-[11px] text-slate-400">
                                                Live {channel === 'whatsapp' ? 'WhatsApp' : 'SMS'} preview
                                            </div>
                                        </div>

                                        {allGuests.length > 0 && (
                                            <div className="flex items-center gap-2">
                                                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                <div className="relative">
                                                    <select
                                                        value={previewGuestId || sampleGuest?.id || ''}
                                                        onChange={(e) => setPreviewGuestId(e.target.value)}
                                                        className="block w-full min-w-[160px] max-w-[220px] py-1.5 pl-3 pr-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-800 dark:text-slate-200 leading-normal appearance-none bg-none focus:border-[#154F7C] dark:focus:border-sky-400 focus:ring-1 focus:ring-sky-500/20 outline-none truncate cursor-pointer transition"
                                                        title="Preview message as a specific guest"
                                                    >
                                                        {allGuests.slice(0, 50).map((g) => (
                                                            <option key={g.id} value={g.id}>
                                                                {g.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
                                                        <ChevronDown className="w-3.5 h-3.5" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
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
                                                            <div className="text-[9px] text-slate-400">SMS Message • To: {sampleGuestName}</div>
                                                        </div>
                                                    </div>

                                                    <div className="bg-[#0B1017] p-2.5 space-y-2.5 min-h-[380px] flex flex-col justify-end text-xs">
                                                        <div className="text-center text-[9px] text-slate-500 font-mono">Today 12:45 PM</div>
                                                        <div className="self-start mr-auto max-w-[92%] bg-[#007AFF] text-white p-3 rounded-2xl rounded-tl-xs text-[11px] leading-relaxed break-words whitespace-pre-line space-y-2 shadow-xs">
                                                            <div>{formattedCaption}</div>
                                                            {effectiveIncludePassLink && (
                                                                <div className="pt-2 border-t border-white/20 text-[10px] text-blue-100 font-mono">
                                                                    <div className="font-semibold text-white flex items-center gap-1 font-sans">
                                                                        <span>🎟️</span>
                                                                        <span>Digital Pass & RSVP:</span>
                                                                    </div>
                                                                    <span className="underline block mt-0.5 break-all">
                                                                        {samplePassUrl}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
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
                                                            <div className="text-[9px] text-slate-400 truncate">To: {sampleGuestName}</div>
                                                        </div>
                                                    </div>

                                                    <div className="bg-[#0B141B] p-2.5 space-y-2 min-h-[380px] flex flex-col justify-end text-xs">
                                                        <div className="flex justify-center my-0.5 select-none">
                                                            <span className="bg-[#182229] text-[9.5px] text-slate-400 font-medium px-2.5 py-0.5 rounded-md shadow-2xs tracking-wide">
                                                                TODAY
                                                            </span>
                                                        </div>

                                                        {campaignType === 'pledge_contribution' ? (
                                                            <div className="w-full flex flex-col gap-2">
                                                                <div className="self-start mr-auto max-w-[92%] w-full bg-[#1F2C34] rounded-2xl rounded-tl-xs p-3 border border-slate-700/60 text-slate-100 space-y-2 shadow-sm">
                                                                    <div className="text-[11.5px] leading-relaxed whitespace-pre-line text-white">
                                                                        {formattedCaption}
                                                                    </div>

                                                                    {effectiveIncludePassLink && (
                                                                        <div className="pt-2 border-t border-slate-700/70 text-[11px] leading-relaxed text-slate-200">
                                                                            <div className="font-bold text-white flex items-center gap-1">
                                                                                <span>🎟️</span>
                                                                                <span>Digital Pass & RSVP:</span>
                                                                            </div>
                                                                            <span className="text-cyan-400 text-[10.5px] font-mono break-all block mt-0.5">
                                                                                {samplePassUrl}
                                                                            </span>
                                                                        </div>
                                                                    )}

                                                                    <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-700/40 pt-1.5 mt-2">
                                                                        <span>Kardovo</span>
                                                                        <div className="flex items-center gap-1 text-[9px] font-mono">
                                                                            <span>12:45 PM</span>
                                                                            <CheckCheck className="w-3 h-3 text-cyan-400" />
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="self-end ml-auto bg-[#005C4B] text-white px-3 py-1.5 rounded-2xl rounded-tr-xs text-[11px] font-medium inline-flex items-center gap-2 shadow-xs w-fit max-w-[85%]">
                                                                    <span>Ahadi 75,000</span>
                                                                    <div className="flex items-center gap-1 text-[9px] text-emerald-200/80 font-mono shrink-0">
                                                                        <span>12:46 PM</span>
                                                                        <CheckCheck className="w-3 h-3 text-cyan-300" />
                                                                    </div>
                                                                </div>

                                                                <div className="self-start mr-auto bg-[#1F2C34] text-slate-100 px-3 py-2 rounded-2xl rounded-tl-xs text-[11px] border border-slate-700/60 leading-relaxed shadow-sm max-w-[90%] w-fit space-y-1">
                                                                    <div className="text-slate-100">
                                                                        Ahsante sana {sampleGuestName}! Ahadi yako ya TZS 75,000 imerekodiwa kikamilifu kwa {sampleEventTitle}.
                                                                    </div>
                                                                    <div className="flex items-center justify-end text-[9px] text-slate-400 font-mono">
                                                                        <span>12:46 PM</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : campaignType === 'text_only' ? (
                                                            <div className="self-start mr-auto max-w-[92%] w-full bg-[#1F2C34] rounded-2xl rounded-tl-xs p-3 border border-slate-700/60 text-slate-100 space-y-2 shadow-sm">
                                                                <div className="text-[11.5px] leading-relaxed whitespace-pre-line text-white">
                                                                    {formattedCaption}
                                                                </div>

                                                                {effectiveIncludePassLink && (
                                                                    <div className="pt-2 border-t border-slate-700/70 text-[11px] leading-relaxed text-slate-200">
                                                                        <div className="font-bold text-white flex items-center gap-1">
                                                                            <span>🎟️</span>
                                                                            <span>Digital Pass & RSVP:</span>
                                                                        </div>
                                                                        <span className="text-cyan-400 text-[10.5px] font-mono break-all block mt-0.5">
                                                                            {samplePassUrl}
                                                                        </span>
                                                                    </div>
                                                                )}

                                                                <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-700/40 pt-1.5 mt-2">
                                                                    <span>Kardovo</span>
                                                                    <div className="flex items-center gap-1 text-[9px] font-mono">
                                                                        <span>12:45 PM</span>
                                                                        <CheckCheck className="w-3 h-3 text-cyan-400" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : campaignType === 'text_rsvp' ? (
                                                            <div className="self-start mr-auto max-w-[92%] w-full bg-[#1F2C34] rounded-2xl rounded-tl-xs overflow-hidden border border-slate-700/60 shadow-md">
                                                                <div className="p-3 text-[11.5px] text-slate-100 leading-relaxed whitespace-pre-line space-y-2">
                                                                    <div>{formattedCaption}</div>
                                                                    {effectiveIncludePassLink && (
                                                                        <div className="pt-2 border-t border-slate-700/70 text-[11px] leading-relaxed text-slate-200">
                                                                            <div className="font-bold text-white flex items-center gap-1">
                                                                                <span>🎟️</span>
                                                                                <span>Digital Pass & RSVP:</span>
                                                                            </div>
                                                                            <span className="text-cyan-400 text-[10.5px] font-mono break-all block mt-0.5">
                                                                                {samplePassUrl}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="px-3 py-1.5 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-700/50">
                                                                    <span>Kardovo</span>
                                                                    <div className="flex items-center gap-1 text-[9px] font-mono">
                                                                        <span>12:45 PM</span>
                                                                        <CheckCheck className="w-3 h-3 text-cyan-400" />
                                                                    </div>
                                                                </div>
                                                                <div className="border-t border-slate-700 divide-y divide-slate-700 bg-[#17232A]">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setPreviewRsvpTapped('attending')}
                                                                        className={`w-full py-2 px-3 text-center text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                                                                            previewRsvpTapped === 'attending'
                                                                                ? 'bg-emerald-950/80 text-emerald-400 font-bold'
                                                                                : 'text-emerald-400 hover:bg-slate-800'
                                                                        }`}
                                                                    >
                                                                        <Check className="w-3 h-3 shrink-0" />
                                                                        <span className="truncate">{rsvpButtonAttending || 'Will Attend'}</span>
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setPreviewRsvpTapped('declined')}
                                                                        className={`w-full py-2 px-3 text-center text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                                                                            previewRsvpTapped === 'declined'
                                                                                ? 'bg-rose-950/80 text-rose-400 font-bold'
                                                                                : 'text-slate-400 hover:bg-slate-800'
                                                                        }`}
                                                                    >
                                                                        <span className="text-xs shrink-0">✕</span>
                                                                        <span className="truncate">{rsvpButtonDeclined || 'Cannot Attend'}</span>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            /* Pass Attachment Card (pass_invitation or pass_only) */
                                                            <div className="self-start mr-auto max-w-[92%] w-full bg-[#1F2C34] rounded-2xl rounded-tl-xs overflow-hidden border border-slate-700/60 shadow-md">
                                                                {template ? (
                                                                    <div className="relative select-none bg-black/40 p-1.5 sm:p-2 flex items-center justify-center overflow-hidden">
                                                                        <div className="w-full flex justify-center pointer-events-none">
                                                                            <ScaledCardThumbnail
                                                                                guest={sampleGuest}
                                                                                event={selectedEvent}
                                                                                template={template}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="p-4 mx-2.5 mt-2.5 rounded-xl border border-dashed border-slate-600/60 bg-[#16222A] flex flex-col items-center justify-center text-center gap-1.5 text-slate-400 select-none">
                                                                        <Palette className="w-5 h-5 text-slate-500" />
                                                                        <span className="text-[11px] font-semibold text-slate-300">No Card Design Selected</span>
                                                                        <span className="text-[9.5px] text-slate-400 max-w-[220px] leading-relaxed">
                                                                            Choose an Invitation Card Design in Step 1 to attach a personalized card image.
                                                                        </span>
                                                                    </div>
                                                                )}

                                                                <div className="p-2.5 text-[11px] text-slate-100 leading-relaxed whitespace-pre-line space-y-2">
                                                                    <div>{formattedCaption}</div>
                                                                    {effectiveIncludePassLink && (
                                                                        <div className="pt-2 border-t border-slate-700/70 text-[11px] leading-relaxed text-slate-200">
                                                                            <div className="font-bold text-white flex items-center gap-1">
                                                                                <span>🎟️</span>
                                                                                <span>Digital Pass & RSVP:</span>
                                                                            </div>
                                                                            <span className="text-cyan-400 text-[10.5px] font-mono break-all block mt-0.5">
                                                                                {samplePassUrl}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="px-2.5 py-1.5 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-700/50">
                                                                    <span>Kardovo</span>
                                                                    <div className="flex items-center gap-1 text-[9px] font-mono">
                                                                        <span>12:45 PM</span>
                                                                        <CheckCheck className="w-3 h-3 text-cyan-400" />
                                                                    </div>
                                                                </div>

                                                                {campaignType === 'pass_invitation' && (
                                                                    <div className="border-t border-slate-700 divide-y divide-slate-700 bg-[#17232A]">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setPreviewRsvpTapped('attending')}
                                                                            className={`w-full py-2 px-3 text-center text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                                                                                previewRsvpTapped === 'attending'
                                                                                    ? 'bg-emerald-950/80 text-emerald-400 font-bold'
                                                                                    : 'text-emerald-400 hover:bg-slate-800'
                                                                            }`}
                                                                        >
                                                                            <Check className="w-3 h-3 shrink-0" />
                                                                            <span className="truncate">{rsvpButtonAttending || 'Will Attend'}</span>
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setPreviewRsvpTapped('declined')}
                                                                            className={`w-full py-2 px-3 text-center text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                                                                                previewRsvpTapped === 'declined'
                                                                                    ? 'bg-rose-950/80 text-rose-400 font-bold'
                                                                                    : 'text-slate-400 hover:bg-slate-800'
                                                                            }`}
                                                                        >
                                                                            <span className="text-xs shrink-0">✕</span>
                                                                            <span className="truncate">{rsvpButtonDeclined || 'Cannot Attend'}</span>
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {(campaignType === 'pass_invitation' || campaignType === 'text_rsvp') && previewRsvpTapped && (
                                                            <div className="self-end ml-auto bg-[#005C4B] text-white px-3 py-1.5 rounded-2xl rounded-tr-xs text-[11px] font-medium inline-flex items-center gap-2 shadow-xs w-fit max-w-[85%]">
                                                                <span>
                                                                    {previewRsvpTapped === 'attending'
                                                                        ? `✓ ${rsvpButtonAttending || 'Will Attend'}`
                                                                        : `✕ ${rsvpButtonDeclined || 'Cannot Attend'}`}
                                                                </span>
                                                                <div className="flex items-center gap-1 text-[9px] text-emerald-200/80 font-mono shrink-0">
                                                                    <span>12:46 PM</span>
                                                                    <CheckCheck className="w-3 h-3 text-cyan-300" />
                                                                </div>
                                                            </div>
                                                        )}

                                                        {(campaignType === 'pass_invitation' || campaignType === 'text_rsvp') && enableAutoReply && previewRsvpTapped && (
                                                            <div className="self-start mr-auto bg-[#1F2C34] text-slate-100 px-3 py-2 rounded-2xl rounded-tl-xs text-[11px] border border-slate-700/60 leading-relaxed shadow-sm max-w-[90%] w-fit space-y-1">
                                                                <div className="text-slate-100">
                                                                    {previewRsvpTapped === 'attending' ? formattedAttendingReply : formattedDeclinedReply}
                                                                </div>
                                                                <div className="flex items-center justify-end text-[9px] text-slate-400 font-mono">
                                                                    <span>12:46 PM</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="p-2 bg-[#1F2C34] rounded-b-xl text-[9px] text-slate-400 flex items-center justify-between px-3">
                                                        <span>Tap RSVP buttons above to test reply</span>
                                                        <span className="text-emerald-400 font-semibold">Live Preview</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* ═══════════════════════════════════════════════════════════ */
                            /* DELIVERY HISTORY TAB                                        */
                            /* ═══════════════════════════════════════════════════════════ */
                            <div className="space-y-4">
                                {/* Quick Summary Strip */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Logged</div>
                                        <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">{logStatusSummary.total}</div>
                                    </div>
                                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                                        <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Sent / Delivered</div>
                                        <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{logStatusSummary.deliveredOrRead}</div>
                                    </div>
                                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                                        <div className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Failed</div>
                                        <div className="text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{logStatusSummary.failed}</div>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                                    {/* Header Toolbar */}
                                    <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 space-y-3.5">
                                        {/* Top Row: Title & Action Controls */}
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                            <div>
                                                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                                    Delivery History {selectedEvent?.title ? `— ${selectedEvent.title}` : ''}
                                                </h3>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                    Showing WhatsApp and SMS messages sent for this event.
                                                </p>
                                            </div>

                                            {/* Action Control: Clear Event Logs */}
                                            {canDeleteLogs && (
                                                <div className="self-start sm:self-auto shrink-0">
                                                    <button
                                                        type="button"
                                                        onClick={handleClearAllLogs}
                                                        disabled={eventMessages.length === 0}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800/60 transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs whitespace-nowrap"
                                                        title="Clear delivery logs for this event"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                        <span>Clear Event Logs</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Bottom Row: Search & Filter Controls */}
                                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex flex-wrap items-center gap-2">
                                            <div className="relative flex-1 sm:flex-initial">
                                                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                                <input
                                                    type="text"
                                                    value={logSearch}
                                                    onChange={(e) => setLogSearch(e.target.value)}
                                                    placeholder="Search guest or phone..."
                                                    className="w-full sm:w-56 pl-8 pr-7 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:border-[#154F7C] outline-none"
                                                />
                                                {logSearch && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setLogSearch('')}
                                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                )}
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
                                                <option value="read">Read</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="sent">Sent</option>
                                                <option value="failed">Failed</option>
                                                <option value="pending">Pending</option>
                                            </select>

                                            {/* Reset Filters Button */}
                                            {(logSearch || logChannelFilter !== 'all' || logStatusFilter !== 'all') && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setLogSearch('');
                                                        setLogChannelFilter('all');
                                                        setLogStatusFilter('all');
                                                    }}
                                                    className="h-8 px-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white flex items-center gap-1 transition cursor-pointer"
                                                >
                                                    <X className="w-3 h-3" />
                                                    <span>Reset</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Table */}
                                    <div className="overflow-x-auto overflow-y-auto max-h-[480px] scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                                        <table className="w-full text-left text-xs min-w-[640px]">
                                            <thead className="bg-slate-50/95 dark:bg-slate-950/95 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 backdrop-blur-md shadow-2xs">
                                                <tr>
                                                    <th className="py-3 px-4 w-12 text-center">#</th>
                                                    <th className="py-3 px-4">Guest</th>
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
                                                        <td colSpan={canDeleteLogs ? 8 : 7} className="py-10 text-center text-slate-400 text-xs">
                                                            No delivery logs match your current filters.
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
                                                                {new Date(msg.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                            </td>
                                                            {canDeleteLogs && (
                                                                <td className="py-2.5 px-4 text-center whitespace-nowrap">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleDeleteLog(msg)}
                                                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition active:scale-95 cursor-pointer"
                                                                        title="Delete delivery log entry"
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
                            </div>
                        )}
                    </>
                )}

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

                {(isSuperAdmin || isSubAdmin) && (
                    <GatewayConfigModal
                        show={gatewayModalOpen}
                        onClose={() => setGatewayModalOpen(false)}
                        gateways={gateways}
                    />
                )}
            </div>
        </KardovoAppLayout>
    );
}
