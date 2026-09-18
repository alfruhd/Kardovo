import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import KardovoAppLayout from '@/Layouts/KardovoAppLayout';
import EmptyEventState from '@/Components/EmptyEventState';
import { 
    Calendar, 
    Plus, 
    Users, 
    CheckCircle2, 
    ArrowRight, 
    Upload, 
    Palette, 
    Send, 
    MapPin, 
    Clock, 
    MoreVertical,
    Edit,
    Trash2,
    LayoutGrid,
    Layers,
    ExternalLink,
    QrCode,
    ShieldCheck,
    Ticket,
    Lock
} from 'lucide-react';
import { router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import ConfirmationModal from '@/Components/ConfirmationModal';

export default function MyEvents({ 
    events = [], 
    overviewStats, 
    templates = [],
    organizers = [],
    isAdmin = false
}) {
    const { auth } = usePage().props;
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedEventForEdit, setSelectedEventForEdit] = useState(null);
    const [templateModalOpen, setTemplateModalOpen] = useState(false);
    const [selectedEventForTemplate, setSelectedEventForTemplate] = useState(null);
    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const [savingTemplate, setSavingTemplate] = useState(false);

    const today = new Date();
    const todayFormatted = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

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

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        event_type: 'Wedding Reception',
        event_date: '',
        event_time: '',
        venue: '',
        description: '',
        user_id: '',
    });

    const editForm = useForm({
        title: '',
        event_type: 'Wedding Reception',
        event_date: '',
        event_time: '',
        venue: '',
        description: '',
        card_template_id: '',
        status: 'active',
        user_id: '',
    });

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        post(route('events.store'), {
            onSuccess: () => {
                setCreateModalOpen(false);
                reset();
            }
        });
    };

    const handleOpenTemplateModal = (event) => {
        setSelectedEventForTemplate(event);
        setSelectedTemplateId(event.card_template_id || '');
        setTemplateModalOpen(true);
    };

    const handleApplyTemplate = (templateId) => {
        if (!selectedEventForTemplate) return;
        setSavingTemplate(true);
        router.put(route('events.update', selectedEventForTemplate.id), {
            title: selectedEventForTemplate.title,
            event_type: selectedEventForTemplate.event_type,
            event_date: typeof selectedEventForTemplate.event_date === 'string' ? selectedEventForTemplate.event_date.split('T')[0] : selectedEventForTemplate.event_date,
            event_time: selectedEventForTemplate.event_time,
            venue: selectedEventForTemplate.venue,
            city: selectedEventForTemplate.city,
            description: selectedEventForTemplate.description,
            status: selectedEventForTemplate.status || 'active',
            user_id: selectedEventForTemplate.user_id,
            card_template_id: templateId || null,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setTemplateModalOpen(false);
                setSavingTemplate(false);
                setSelectedEventForTemplate(null);
            },
            onError: () => {
                setSavingTemplate(false);
            }
        });
    };

    const handleEditOpen = (event) => {
        setSelectedEventForEdit(event);
        editForm.setData({
            title: event.title || '',
            event_type: event.event_type || 'Wedding Reception',
            event_date: event.event_date ? event.event_date.substring(0, 10) : '',
            event_time: event.event_time || '',
            venue: event.venue || '',
            city: event.city || '',
            description: event.description || '',
            card_template_id: event.card_template_id || '',
            status: event.status || 'active',
            user_id: event.user_id || '',
        });
        setEditModalOpen(true);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!selectedEventForEdit) return;
        editForm.put(route('events.update', selectedEventForEdit.id), {
            onSuccess: () => {
                setEditModalOpen(false);
                setSelectedEventForEdit(null);
            }
        });
    };

    const handleDeleteEvent = (event) => {
        setConfirmModal({
            show: true,
            title: 'Delete Event?',
            message: `Delete "${event.title}"? All guests and passes will be removed.`,
            warning: 'This cannot be undone.',
            confirmText: 'Delete',
            type: 'danger',
            loading: false,
            onConfirm: () => {
                setConfirmModal(prev => ({ ...prev, loading: true }));
                router.delete(route('events.destroy', event.id), {
                    onFinish: () => setConfirmModal(prev => ({ ...prev, show: false, loading: false })),
                });
            }
        });
    };

    const canCreate = isAdmin || (auth?.user?.status !== 'suspended' && auth?.user?.effective_permissions?.can_create_events !== false);

    return (
        <KardovoAppLayout 
            title={isAdmin ? "All Events Portfolio" : "My Events"}
            headerActions={
                canCreate ? (
                    <button
                        onClick={() => setCreateModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#16A34A] hover:bg-[#15803D] border border-[#16A34A] rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
                    >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Create Event</span>
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={() => setConfirmModal({
                            show: true,
                            title: 'Feature Locked',
                            message: 'Event creation is currently disabled for this account.',
                            confirmText: 'OK',
                            type: 'warning',
                            loading: false,
                            onConfirm: () => setConfirmModal(prev => ({ ...prev, show: false })),
                        })}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.08] text-slate-400 font-bold text-xs border border-white/[0.12] cursor-not-allowed opacity-80 shadow-2xs"
                        title="Event creation is locked by administration"
                    >
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Create Event (Locked)</span>
                    </button>
                )
            }
        >
            <Head title={isAdmin ? "All Events - Kardovo" : "My Events - Kardovo"} />

            <div className="max-w-7xl mx-auto space-y-6">
                {/* Welcome Header & Action Summary */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight font-display">
                            {isAdmin ? 'All Platform Events Portfolio' : 'My Events'}
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                            {isAdmin 
                                ? `Displaying all ${events.length} events across all organizers & customer accounts in the system.`
                                : `You're managing ${events.length} ${events.length === 1 ? 'event' : 'events'} in your portfolio.`}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="px-3.5 py-1.5 rounded-2xl bg-white/80 dark:bg-[#0B1524]/90 border border-slate-200/90 dark:border-white/[0.08] shadow-xs text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
                            <span>{events.length} Active Events</span>
                        </div>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* 2. COMPACT MODERN EVENTS GRID GALLERY                           */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                <div className="space-y-4 md:pt-4 md:border-t border-slate-200/80 dark:border-white/[0.08]">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                            <LayoutGrid className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white font-display">
                                All Events Portfolio Directory
                            </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-white/[0.05] px-2.5 py-1 rounded-full border border-slate-200 dark:border-white/[0.08]">
                            {events.length} {events.length === 1 ? 'Event' : 'Events'}
                        </span>
                    </div>

                    {events.length === 0 ? (
                        <EmptyEventState
                            title="No Event Selected"
                            description="Please select an event from the dashboard or create a new one to manage messaging and broadcast passes."
                            buttonText="Go to Dashboard"
                            buttonHref={route('dashboard')}
                            onCreateEvent={() => setCreateModalOpen(true)}
                        />
                    ) : (
                        <div className="space-y-3">
                            {events.map((event) => {
                            const total = event.total_guests || 0;
                            const attending = event.will_attend_count || 0;
                            const responseRate = event.response_rate || 0;

                            return (
                                <div 
                                    key={event.id}
                                    className="group relative rounded-2xl overflow-hidden backdrop-blur-2xl backdrop-saturate-180 bg-white/70 dark:bg-[#091322]/85 hover:bg-white/90 dark:hover:bg-[#0d1c33]/95 border border-slate-200/80 dark:border-white/[0.08] hover:border-emerald-500/40 shadow-[0_8px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-all duration-300 p-4 sm:p-5 text-slate-800 dark:text-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                                >
                                    {/* Left: Date Badge + Title + Venue + Metadata */}
                                    <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1 relative z-10">
                                        {/* Compact Frosted Date Pill */}
                                        <div className="flex-shrink-0 text-center w-14 sm:w-16 py-2 rounded-xl bg-white/60 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/[0.08] group-hover:border-emerald-500/30 transition">
                                            <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block tracking-wider font-mono">
                                                {new Date(event.event_date).toLocaleDateString('en-GB', { month: 'short' })}
                                            </span>
                                            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono block leading-tight">
                                                {new Date(event.event_date).toLocaleDateString('en-GB', { day: 'numeric' })}
                                            </span>
                                            <span className="text-[9px] text-slate-500 dark:text-slate-400 block">
                                                {new Date(event.event_date).toLocaleDateString('en-GB', { year: 'numeric' })}
                                            </span>
                                        </div>

                                        {/* Title & Metadata */}
                                        <div className="min-w-0 flex-1 space-y-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider shadow-2xs">
                                                    {event.event_type}
                                                </span>
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 dark:bg-emerald-950/50 border border-emerald-500/20 dark:border-emerald-500/30 px-2 py-0.5 rounded-full">
                                                    <span className="w-1 h-1 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                                                    <span>Active</span>
                                                </span>
                                                {event.user?.name && (
                                                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/[0.05] px-2 py-0.5 rounded-full">
                                                        Owner: {event.user.name}
                                                    </span>
                                                )}
                                            </div>

                                            <Link 
                                                href={route('events.show', event.id)} 
                                                className="text-base sm:text-lg font-black text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition block truncate font-display"
                                            >
                                                {event.title}
                                            </Link>

                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400 font-medium">
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                                    <span className="truncate">{event.venue}</span>
                                                </span>
                                                {event.event_time && (
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                                        <span>{event.event_time}</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Middle: Progress Bar & Key Counts */}
                                    <div className="w-full lg:w-72 bg-slate-100/70 dark:bg-white/[0.03] p-3 rounded-xl border border-slate-200/80 dark:border-white/[0.06] flex-shrink-0 relative z-10 space-y-2">
                                        <div className="flex items-center justify-between text-xs font-mono font-bold">
                                            <span className="text-slate-600 dark:text-slate-400">Attending:</span>
                                            <span className="text-emerald-700 dark:text-emerald-400">{attending} / {total} passes ({responseRate}%)</span>
                                        </div>
                                        {/* Progress Bar Track */}
                                        <div className="w-full h-2 bg-slate-200/80 dark:bg-white/[0.08] rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-[#16A34A] rounded-full transition-all duration-500" 
                                                style={{ width: `${Math.min(responseRate, 100)}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Right: Quick Action Buttons */}
                                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap relative z-10 flex-shrink-0">
                                        <Link
                                            href={route('events.show', event.id)}
                                            className="flex-1 sm:flex-none py-2 px-3.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition"
                                        >
                                            <Layers className="w-3.5 h-3.5 text-white" />
                                            <span>Open Hub</span>
                                        </Link>

                                        <Link
                                            href={route('scanner.index', { event_id: event.id })}
                                            className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 transition active:scale-95"
                                            title="Launch Gate Scanner App"
                                        >
                                            <QrCode className="w-4 h-4" />
                                        </Link>

                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => handleOpenTemplateModal(event)}
                                                className="p-2 rounded-xl bg-white dark:bg-white/[0.06] hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-white/[0.08] transition active:scale-95 cursor-pointer"
                                                title="Select / Change Card Template"
                                            >
                                                <Palette className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleEditOpen(event)}
                                                className="p-2 rounded-xl bg-white dark:bg-white/[0.06] hover:bg-slate-100 dark:hover:bg-white/[0.12] text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-white/[0.08] transition active:scale-95 cursor-pointer"
                                                title="Edit Event Configuration"
                                            >
                                                <Edit className="w-3.5 h-3.5" />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleDeleteEvent(event)}
                                                className="p-2 rounded-xl bg-white dark:bg-white/[0.06] hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 text-slate-400 border border-slate-200/80 dark:border-white/[0.08] transition active:scale-95 cursor-pointer"
                                                title="Delete Event"
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
            </div>

            {/* Create Event Modal */}
            <Modal show={createModalOpen} onClose={() => setCreateModalOpen(false)} maxWidth="md">
                <form onSubmit={handleCreateSubmit} className="p-6 sm:p-7 space-y-5">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/[0.08]">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-[10.5px] font-mono font-extrabold uppercase flex items-center gap-1">
                                    <Plus className="w-3 h-3" />
                                    <span>New Event</span>
                                </span>
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white font-display">
                                Create New Event
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Enter basic event details to start generating personalized passes.
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="title" value="Event Title *" />
                            <TextInput
                                id="title"
                                type="text"
                                className="mt-1 block w-full text-xs font-bold py-2.5 rounded-2xl focus:border-emerald-500 focus:ring-emerald-500"
                                placeholder="e.g. Neema & Baraka — Wedding Reception"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                required
                            />
                            <InputError message={errors.title} className="mt-1" />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <InputLabel htmlFor="event_type" value="Event Type *" />
                                <select
                                    id="event_type"
                                    className="mt-1 block w-full rounded-2xl border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white text-xs font-bold py-2.5 px-3 focus:border-emerald-500 focus:ring-emerald-500 shadow-2xs cursor-pointer"
                                    value={data.event_type}
                                    onChange={(e) => setData('event_type', e.target.value)}
                                    required
                                >
                                    <option value="Wedding Reception">Wedding Reception</option>
                                    <option value="Alumni Gala">Alumni Gala</option>
                                    <option value="Corporate Conference">Corporate Conference</option>
                                    <option value="Birthday Party">Birthday Party</option>
                                    <option value="Concert / Festival">Concert / Festival</option>
                                    <option value="Private Dinner">Private Dinner</option>
                                </select>
                            </div>

                            <div>
                                <InputLabel htmlFor="event_date" value="Date *" />
                                <TextInput
                                    id="event_date"
                                    type="date"
                                    min={todayFormatted}
                                    className="mt-1 block w-full text-xs font-bold py-2 rounded-2xl focus:border-emerald-500 focus:ring-emerald-500"
                                    value={data.event_date}
                                    onChange={(e) => setData('event_date', e.target.value)}
                                    required
                                />
                                <InputError message={errors.event_date} className="mt-1" />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="event_time" value="Time Label" />
                            <TextInput
                                id="event_time"
                                type="text"
                                className="mt-1 block w-full text-xs font-semibold py-2.5 rounded-2xl focus:border-emerald-500 focus:ring-emerald-500"
                                placeholder="e.g. 4:00 PM — Reception & Dinner"
                                value={data.event_time}
                                onChange={(e) => setData('event_time', e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <InputLabel htmlFor="venue" value="Venue *" />
                                <TextInput
                                    id="venue"
                                    type="text"
                                    className="mt-1 block w-full text-xs font-semibold py-2.5 rounded-2xl focus:border-emerald-500 focus:ring-emerald-500"
                                    placeholder="e.g. Kunduchi Beach Gardens"
                                    value={data.venue}
                                    onChange={(e) => setData('venue', e.target.value)}
                                    required
                                />
                                <InputError message={errors.venue} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="city" value="City" />
                                <TextInput
                                    id="city"
                                    type="text"
                                    className="mt-1 block w-full text-xs font-semibold py-2.5 rounded-2xl focus:border-emerald-500 focus:ring-emerald-500"
                                    value={data.city}
                                    onChange={(e) => setData('city', e.target.value)}
                                />
                            </div>
                        </div>

                        {isAdmin && organizers.length > 0 && (
                            <div>
                                <InputLabel htmlFor="create_user_id" value="Assign Event Organiser (Customer Account)" />
                                <select
                                    id="create_user_id"
                                    className="mt-1 block w-full rounded-2xl border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white text-xs font-bold py-2.5 px-3 focus:border-emerald-500 focus:ring-emerald-500 shadow-2xs cursor-pointer font-medium"
                                    value={data.user_id}
                                    onChange={(e) => setData('user_id', e.target.value)}
                                >
                                    <option value="">Myself (System Administrator)</option>
                                    {organizers.map(org => (
                                        <option key={org.id} value={org.id}>
                                            {org.name} ({org.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/[0.08]">
                        <SecondaryButton onClick={() => setCreateModalOpen(false)}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton disabled={processing} className="bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs uppercase tracking-wider border border-[#16A34A]">
                            Create Event
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal: Edit Event */}
            <Modal show={editModalOpen} onClose={() => setEditModalOpen(false)} maxWidth="lg">
                <form onSubmit={handleEditSubmit} className="p-6 sm:p-7 space-y-5">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/[0.08]">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-[10.5px] font-mono font-extrabold uppercase flex items-center gap-1">
                                    <Edit className="w-3 h-3" />
                                    <span>Event Governance</span>
                                </span>
                                {selectedEventForEdit && (
                                    <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                                        #{selectedEventForEdit.id}
                                    </span>
                                )}
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white font-display">
                                Edit Event Details
                            </h3>
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-200 flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="mt-4 space-y-4">
                        <div>
                            <InputLabel htmlFor="edit_event_title" value="Event Title *" />
                            <TextInput
                                id="edit_event_title"
                                type="text"
                                className="mt-1 block w-full text-sm font-semibold focus:border-emerald-500 focus:ring-emerald-500"
                                value={editForm.data.title}
                                onChange={(e) => editForm.setData('title', e.target.value)}
                                required
                            />
                            <InputError message={editForm.errors.title} className="mt-1" />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <InputLabel htmlFor="edit_event_type" value="Event Type *" />
                                <select
                                    id="edit_event_type"
                                    className="mt-1 block w-full rounded-2xl border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white text-xs font-bold py-2.5 px-3 focus:border-emerald-500 focus:ring-emerald-500 shadow-2xs cursor-pointer"
                                    value={editForm.data.event_type}
                                    onChange={(e) => editForm.setData('event_type', e.target.value)}
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
                                    className="mt-1 block w-full text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                    value={editForm.data.event_date}
                                    onChange={(e) => editForm.setData('event_date', e.target.value)}
                                    required
                                />
                                <InputError message={editForm.errors.event_date} className="mt-1" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <InputLabel htmlFor="edit_event_time" value="Time Label" />
                                <TextInput
                                    id="edit_event_time"
                                    type="text"
                                    className="mt-1 block w-full text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                    placeholder="e.g. 4:00 PM — Reception & Dinner"
                                    value={editForm.data.event_time}
                                    onChange={(e) => editForm.setData('event_time', e.target.value)}
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="edit_event_status" value="Event Status" />
                                <select
                                    id="edit_event_status"
                                    className="mt-1 block w-full rounded-2xl border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white text-xs font-bold py-2.5 px-3 focus:border-emerald-500 focus:ring-emerald-500 shadow-2xs cursor-pointer"
                                    value={editForm.data.status}
                                    onChange={(e) => editForm.setData('status', e.target.value)}
                                    >
                                    <option value="active">Active (Live)</option>
                                    <option value="draft">Draft</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <InputLabel htmlFor="edit_venue" value="Venue *" />
                                <TextInput
                                    id="edit_venue"
                                    type="text"
                                    className="mt-1 block w-full text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                    value={editForm.data.venue}
                                    onChange={(e) => editForm.setData('venue', e.target.value)}
                                    required
                                />
                                <InputError message={editForm.errors.venue} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="edit_city" value="City" />
                                <TextInput
                                    id="edit_city"
                                    type="text"
                                    className="mt-1 block w-full text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                    value={editForm.data.city}
                                    onChange={(e) => editForm.setData('city', e.target.value)}
                                />
                            </div>
                        </div>

                        {templates && templates.length > 0 && (
                            <div>
                                <InputLabel value="Assigned Invitation Card Template" />
                                <select
                                    className="mt-1 block w-full rounded-2xl border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white text-xs font-bold py-2.5 px-3 focus:border-emerald-500 focus:ring-emerald-500 shadow-2xs cursor-pointer"
                                    value={editForm.data.card_template_id}
                                    onChange={(e) => editForm.setData('card_template_id', e.target.value)}
                                >
                                    <option value="">Default System Pass</option>
                                    {templates.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.name} ({t.template_type})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {isAdmin && organizers.length > 0 && (
                            <div>
                                <InputLabel htmlFor="edit_user_id" value="Assigned Organiser (Customer Account)" />
                                <select
                                    id="edit_user_id"
                                    className="mt-1 block w-full rounded-2xl border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white text-xs font-bold py-2.5 px-3 focus:border-emerald-500 focus:ring-emerald-500 shadow-2xs cursor-pointer font-medium"
                                    value={editForm.data.user_id}
                                    onChange={(e) => editForm.setData('user_id', e.target.value)}
                                >
                                    <option value="">System Administrator</option>
                                    {organizers.map(org => (
                                        <option key={org.id} value={org.id}>
                                            {org.name} ({org.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div>
                            <InputLabel htmlFor="edit_description" value="Description / Notes" />
                            <textarea
                                id="edit_description"
                                rows={2}
                                className="mt-1 block w-full rounded-2xl border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white text-xs font-medium p-3 focus:border-emerald-500 focus:ring-emerald-500 shadow-2xs"
                                placeholder="Additional details or notes..."
                                value={editForm.data.description}
                                onChange={(e) => editForm.setData('description', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/[0.08]">
                        <SecondaryButton onClick={() => setEditModalOpen(false)}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton disabled={editForm.processing} className="bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs uppercase tracking-wider border border-[#16A34A]">
                            Save Changes
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal: Select Card Template */}
            <Modal show={templateModalOpen} onClose={() => setTemplateModalOpen(false)} maxWidth="md">
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
                                    <CheckCircle2 className="w-2.5 h-2.5 stroke-[3]" />
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
                                            <CheckCircle2 className="w-2.5 h-2.5 stroke-[3]" />
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
                        <SecondaryButton onClick={() => setTemplateModalOpen(false)}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton
                            onClick={() => handleApplyTemplate(selectedTemplateId)}
                            disabled={savingTemplate}
                            className="text-xs font-bold gap-1.5 cursor-pointer bg-[#16A34A] hover:bg-[#15803D] text-white border border-[#16A34A]"
                        >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{savingTemplate ? 'Saving...' : 'Save'}</span>
                        </PrimaryButton>
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
