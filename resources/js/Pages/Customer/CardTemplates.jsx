import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import KardovoAppLayout from '@/Layouts/KardovoAppLayout';
import EmptyEventState from '@/Components/EmptyEventState';
import PersonalisedCard from '@/Components/PersonalisedCard';
import ConfirmationModal from '@/Components/ConfirmationModal';
import Modal from '@/Components/Modal';
import { 
    Upload, 
    Save, 
    Trash2, 
    Check, 
    Type, 
    QrCode, 
    Lock,
    ShieldCheck, 
    CheckCircle2, 
    Loader2, 
    Plus, 
    X,
    User,
    Palette,
    Move,
    Sliders,
    Sparkles
} from 'lucide-react';

const FONT_OPTIONS = [
    { label: 'Classic Serif (Georgia)', value: 'Georgia, serif' },
    { label: 'Modern Sans (Inter)', value: 'system-ui, -apple-system, sans-serif' },
    { label: 'Playfair Display', value: '"Playfair Display", Georgia, serif' },
    { label: 'Monospace Code', value: 'ui-monospace, SFMono-Regular, Menlo, monospace' },
    { label: 'Elegant Cursive', value: 'cursive, "Brush Script MT", Georgia, serif' },
];

export default function CardTemplates({ 
    templates = [], 
    selectedTemplate, 
    sampleEvent, 
    sampleGuest,
    events = []
}) {
    const user = usePage().props.auth?.user;
    const isAdmin = user?.role === 'admin' || user?.is_admin;
    const canCustomize = isAdmin || (user?.status !== 'suspended' && user?.effective_permissions?.can_customize_templates !== false);
    const hasNoEvents = !isAdmin && events.length === 0;

    // Only show user-uploaded custom art templates (no predefined presets)
    const myTemplates = useMemo(() => {
        return [...templates]
            .filter(t => t.user_id !== null && t.user_id !== undefined)
            .sort((a, b) => (b.id || 0) - (a.id || 0));
    }, [templates]);

    // Current Active Template
    const [currentTpl, setCurrentTpl] = useState(() => {
        if (selectedTemplate && selectedTemplate.user_id != null) return selectedTemplate;
        if (myTemplates.length > 0) return myTemplates[0];
        return null;
    });

    // Currently selected element on canvas or inspector ('guest_name' | 'allowance_badge' | 'qr_code' | 'card_number')
    const [activeElementKey, setActiveElementKey] = useState(null);

    // Canvas container ref for computing pointer drag coordinates
    const stageContainerRef = useRef(null);
    const draggingRef = useRef(null);

    useEffect(() => {
        if (selectedTemplate && selectedTemplate.user_id != null) {
            handleSelectTemplate(selectedTemplate);
        } else if (myTemplates.length > 0 && (!currentTpl || currentTpl.user_id == null)) {
            handleSelectTemplate(myTemplates[0]);
        }
    }, [selectedTemplate?.id, myTemplates]);

    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [uploadedImgMeta, setUploadedImgMeta] = useState(null);
    const [isUploadingArtwork, setIsUploadingArtwork] = useState(false);

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

    // Test guest state for live stage preview
    const [testGuestName, setTestGuestName] = useState(sampleGuest?.name || 'Alfred Mashauri');
    const [testAllowance] = useState(sampleGuest?.category ? sampleGuest.category.toUpperCase() : 'DOUBLE ENTRY');

    // Helper to merge template config with smart defaults
    const buildMergedElementsConfig = (tpl) => {
        const cfg = tpl?.elements_config || {};

        return {
            show_guest_name: [true, 'true', 1, '1'].includes(cfg.show_guest_name ?? false),
            show_allowance_badge: [true, 'true', 1, '1'].includes(cfg.show_allowance_badge ?? false),
            show_qr: [true, 'true', 1, '1'].includes(cfg.show_qr ?? tpl?.show_qr ?? false),
            show_unique_code: [true, 'true', 1, '1'].includes(cfg.show_unique_code ?? tpl?.show_unique_code ?? false),
            show_headline: false,
            show_category_badge: false,
            show_couple_names: false,
            show_date: false,
            show_quote: false,
            show_venue: false,
            headline_text: '',

            guest_name: {
                x: cfg.guest_name?.x ?? 50,
                y: cfg.guest_name?.y ?? 70.5,
                fontSize: cfg.guest_name?.fontSize ?? 20,
                color: cfg.guest_name?.color ?? '#FFFFFF',
                fontFamily: cfg.guest_name?.fontFamily ?? 'Georgia, serif',
                fontWeight: '800',
                plaqueWidth: 84,
                hide_plaque_box: true,
                hide_name_box: true,
                clean_text: true,
                ...(cfg.guest_name || {})
            },
            allowance_badge: {
                x: cfg.allowance_badge?.x ?? 50,
                y: cfg.allowance_badge?.y ?? 64.5,
                fontSize: cfg.allowance_badge?.fontSize ?? 10,
                color: cfg.allowance_badge?.color ?? '#FDE68A',
                fontFamily: cfg.allowance_badge?.fontFamily ?? 'sans-serif',
                fontWeight: '800',
                plaqueWidth: 84,
                hide_badge_box: true,
                clean_text: true,
                ...(cfg.allowance_badge || {})
            },
            qr_code: {
                x: cfg.qr_code?.x ?? 50,
                y: cfg.qr_code?.y ?? 85.5,
                size: cfg.qr_code?.size ?? 88,
                darkColor: cfg.qr_code?.darkColor || cfg.qr_code?.color || '#111827',
                color: cfg.qr_code?.color || cfg.qr_code?.darkColor || '#111827',
                transparent_bg: [true, 'true', 1, '1'].includes(cfg.qr_code?.transparent_bg ?? false),
                lightColor: '#FFFFFF',
                ...(cfg.qr_code || {})
            },
            card_number: {
                x: cfg.card_number?.x ?? 50,
                y: cfg.card_number?.y ?? 99,
                fontSize: cfg.card_number?.fontSize ?? 9.5,
                color: cfg.card_number?.color ?? '#FFFFFF',
                fontFamily: cfg.card_number?.fontFamily ?? 'monospace',
                ...(cfg.card_number || {})
            }
        };
    };

    // Template Editing Form
    const form = useForm({
        name: currentTpl?.name || '',
        template_type: currentTpl?.template_type || 'custom_art',
        brand_color_from: currentTpl?.brand_color_from || '#050D1A',
        brand_color_to: currentTpl?.brand_color_to || '#0A1A2E',
        headline: '',
        footer_text: currentTpl?.footer_text || '',
        show_qr: [true, 'true', 1, '1'].includes(currentTpl?.show_qr ?? false),
        show_unique_code: [true, 'true', 1, '1'].includes(currentTpl?.show_unique_code ?? false),
        show_category_badge: false,
        elements_config: buildMergedElementsConfig(currentTpl)
    });

    // Upload Form
    const uploadForm = useForm({
        name: '',
        template_type: 'custom_art',
        headline: '',
        image_file: null,
        show_guest_name: false,
        show_allowance_badge: false,
        show_category_badge: false,
        show_qr: false,
        show_unique_code: false,
    });

    const handleSelectTemplate = (tpl) => {
        setCurrentTpl(tpl);
        setActiveElementKey(null);
        form.setData({
            name: tpl.name || '',
            template_type: tpl.template_type || 'custom_art',
            brand_color_from: tpl.brand_color_from || '#050D1A',
            brand_color_to: tpl.brand_color_to || '#0A1A2E',
            headline: '',
            footer_text: tpl.footer_text || '',
            show_qr: [true, 'true', 1, '1'].includes(tpl.show_qr ?? false),
            show_unique_code: [true, 'true', 1, '1'].includes(tpl.show_unique_code ?? false),
            show_category_badge: false,
            elements_config: buildMergedElementsConfig(tpl)
        });

        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.set('template_id', tpl.id);
            window.history.replaceState({}, '', url.toString());
        }
    };

    const updateNestedConfig = (section, keyOrObj, value) => {
        if (typeof keyOrObj === 'object' && keyOrObj !== null) {
            form.setData(prev => ({
                ...prev,
                elements_config: {
                    ...(prev.elements_config || {}),
                    [section]: {
                        ...((prev.elements_config || {})[section] || {}),
                        ...keyOrObj
                    }
                }
            }));
        } else {
            form.setData(prev => ({
                ...prev,
                elements_config: {
                    ...(prev.elements_config || {}),
                    [section]: {
                        ...((prev.elements_config || {})[section] || {}),
                        [keyOrObj]: value
                    }
                }
            }));
        }
    };

    const updateDirectConfig = (keyOrObj, value) => {
        if (typeof keyOrObj === 'object' && keyOrObj !== null) {
            form.setData(prev => ({
                ...prev,
                elements_config: {
                    ...(prev.elements_config || {}),
                    ...keyOrObj
                }
            }));
        } else {
            form.setData(prev => ({
                ...prev,
                elements_config: {
                    ...(prev.elements_config || {}),
                    [keyOrObj]: value
                }
            }));
        }
    };

    // ── CANVA-LIKE INTERACTIVE DRAG HANDLERS ──
    const handleStartDrag = (elementKey, e) => {
        if (e.button !== undefined && e.button !== 0) return; // Only primary mouse button
        e.preventDefault();
        e.stopPropagation();

        const cardElement = stageContainerRef.current?.querySelector('#kardovo-invitation-card');
        if (!cardElement) return;

        const rect = cardElement.getBoundingClientRect();
        const startX = e.clientX;
        const startY = e.clientY;

        const currentCfg = form.data.elements_config?.[elementKey] || {};
        const parsedX = parseFloat(currentCfg.x);
        const parsedY = parseFloat(currentCfg.y);
        const originX = !isNaN(parsedX) ? parsedX : 50;
        const originY = !isNaN(parsedY) ? parsedY : 50;

        draggingRef.current = {
            elementKey,
            rect,
            startX,
            startY,
            originX,
            originY,
            rafId: null
        };

        const handlePointerMove = (moveEvent) => {
            if (!draggingRef.current) return;
            moveEvent.preventDefault();

            const { rect, startX, startY, originX, originY, elementKey, rafId } = draggingRef.current;
            const currentClientX = moveEvent.clientX;
            const currentClientY = moveEvent.clientY;

            if (rafId) {
                cancelAnimationFrame(rafId);
            }

            draggingRef.current.rafId = requestAnimationFrame(() => {
                if (!draggingRef.current) return;

                const deltaXPx = currentClientX - startX;
                const deltaYPx = currentClientY - startY;

                const deltaXPercent = (deltaXPx / rect.width) * 100;
                const deltaYPercent = (deltaYPx / rect.height) * 100;

                const newX = Math.round(Math.min(96, Math.max(4, originX + deltaXPercent)) * 10) / 10;
                const newY = Math.round(Math.min(98, Math.max(2, originY + deltaYPercent)) * 10) / 10;

                updateNestedConfig(elementKey, { x: newX, y: newY });
            });
        };

        const handlePointerUp = () => {
            if (draggingRef.current?.rafId) {
                cancelAnimationFrame(draggingRef.current.rafId);
            }
            draggingRef.current = null;
            window.removeEventListener('pointermove', handlePointerMove, { capture: true });
            window.removeEventListener('pointerup', handlePointerUp, { capture: true });
        };

        window.addEventListener('pointermove', handlePointerMove, { capture: true, passive: false });
        window.addEventListener('pointerup', handlePointerUp, { capture: true });
    };

    const handleSaveTemplate = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (currentTpl?.id) {
            form.put(route('templates.update', currentTpl.id), {
                preserveScroll: true,
                onSuccess: () => {},
            });
        } else {
            form.post(route('templates.store'), {
                preserveScroll: true,
            });
        }
    };

    const handleUploadSubmit = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        uploadForm.clearErrors();

        const name = uploadForm.data.name?.trim();
        const file = uploadForm.data.image_file;

        let hasError = false;
        if (!name) {
            uploadForm.setError('name', 'Artwork title is required.');
            hasError = true;
        }

        if (!file) {
            uploadForm.setError('image_file', 'Please select an image artwork file.');
            hasError = true;
        }

        if (hasError) return;

        const customElementsConfig = {
            show_guest_name: false,
            show_allowance_badge: false,
            show_category_badge: false,
            show_qr: false,
            show_unique_code: false,
            show_headline: false,
            show_couple_names: false,
            show_date: false,
            show_quote: false,
            show_venue: false,
            headline_text: '',
            guest_name: { x: 50, y: 70.5, fontSize: 20, color: '#FFFFFF', fontFamily: 'Georgia, serif', plaqueWidth: 84, hide_plaque_box: true, hide_name_box: true, clean_text: true },
            allowance_badge: { x: 50, y: 64.5, fontSize: 10, color: '#FDE68A', fontFamily: 'sans-serif', plaqueWidth: 84, hide_badge_box: true, clean_text: true },
            qr_code: { x: 50, y: 85.5, size: 88, darkColor: '#111827', color: '#111827', transparent_bg: false, lightColor: '#FFFFFF' },
            card_number: { x: 50, y: 99, fontSize: 9.5, color: '#FFFFFF', fontFamily: 'monospace' },
            aspect_ratio: uploadedImgMeta?.ratio || '',
            orientation: uploadedImgMeta?.orientation || 'portrait',
            image_width: uploadedImgMeta?.width || null,
            image_height: uploadedImgMeta?.height || null,
        };

        const formData = new FormData();
        formData.append('name', name);
        formData.append('template_type', 'custom_art');
        formData.append('image_file', file);
        formData.append('headline', '');
        formData.append('show_qr', '0');
        formData.append('show_unique_code', '0');
        formData.append('show_category_badge', '0');
        
        Object.entries(customElementsConfig).forEach(([key, val]) => {
            if (typeof val === 'object' && val !== null) {
                Object.entries(val).forEach(([subKey, subVal]) => {
                    formData.append(`elements_config[${key}][${subKey}]`, subVal);
                });
            } else if (typeof val === 'boolean') {
                formData.append(`elements_config[${key}]`, val ? '1' : '0');
            } else if (val !== null && val !== undefined) {
                formData.append(`elements_config[${key}]`, val);
            }
        });

        setIsUploadingArtwork(true);
        router.post(route('templates.store'), formData, {
            forceFormData: true,
            preserveScroll: true,
            onFinish: () => {
                setIsUploadingArtwork(false);
            },
            onSuccess: () => {
                setUploadModalOpen(false);
                uploadForm.reset();
            },
            onError: (errs) => {
                uploadForm.setError(errs);
            }
        });
    };

    const openDeleteConfirmation = (e, tpl) => {
        if (e) e.stopPropagation();
        setConfirmModal({
            show: true,
            title: 'Delete Template?',
            message: `Delete template "${tpl.name}"?`,
            warning: 'Events using this design will revert to standard card styling.',
            confirmText: 'Delete',
            type: 'danger',
            loading: false,
            onConfirm: () => {
                setConfirmModal(prev => ({ ...prev, loading: true }));
                router.delete(route('templates.destroy', tpl.id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        setConfirmModal(prev => ({ ...prev, show: false, loading: false }));
                        if (currentTpl?.id === tpl.id) {
                            const remaining = myTemplates.filter(t => t.id !== tpl.id);
                            if (remaining.length > 0) {
                                handleSelectTemplate(remaining[0]);
                            } else {
                                setCurrentTpl(null);
                            }
                        }
                    },
                    onError: () => setConfirmModal(prev => ({ ...prev, loading: false })),
                });
            }
        });
    };

    const isCurrentCustomOrAdmin = currentTpl && (currentTpl.user_id === user?.id || isAdmin);

    return (
        <KardovoAppLayout title="Card Templates">
            <Head title="Card Studio — Kardovo" />

            <div className="max-w-7xl mx-auto space-y-4">

                {/* ── TOP STUDIO BAR ── */}
                <div className="pb-2.5 border-b border-slate-200/70 dark:border-white/[0.06]">
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight">
                        Card Studio
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Click and drag elements freely on your pass design, just like Canva.
                    </p>
                </div>

                {hasNoEvents ? (
                    <EmptyEventState
                        title="No Event Yet"
                        description="Create an event first, then come back to set up your card template."
                        buttonText="Go to Dashboard"
                        buttonHref={route('dashboard')}
                    />
                ) : myTemplates.length === 0 ? (
                    /* ── EMPTY STATE ── */
                    <div className="flex flex-col items-center justify-center py-16 px-6 text-center border border-dashed border-slate-300 dark:border-white/[0.1] rounded-2xl bg-white dark:bg-[#0B1524]">
                        <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-500/10 border border-sky-200/60 dark:border-sky-500/20 flex items-center justify-center mb-3">
                            <Upload className="w-5 h-5 text-[#154F7C] dark:text-sky-400" />
                        </div>
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white">No custom artwork uploaded yet</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                            Upload your finished invitation or ticket pass design. You can then drag and position the attendee name, QR scanner token, and gate security passcode freely.
                        </p>
                        <button
                            type="button"
                            onClick={() => setUploadModalOpen(true)}
                            className="mt-5 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#154F7C] to-[#327FB5] hover:from-[#1A5C91] hover:to-[#3D8EC7] border border-sky-400/25 text-white text-xs font-bold shadow-xs shadow-[#154F7C]/20 transition active:scale-95 cursor-pointer"
                        >
                            <Plus className="w-4 h-4 stroke-[2.5]" />
                            <span>Upload Your First Artwork</span>
                        </button>
                    </div>
                ) : (
                    <>
                        {/* ── PROFESSIONAL "MY DESIGNS" GALLERY BAR ── */}
                        <div className="bg-white dark:bg-[#0B1524] rounded-2xl p-3 border border-slate-200/80 dark:border-white/[0.08] shadow-2xs">
                            <div className="flex items-center gap-2 mb-2 px-1">
                                <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                                    My Designs
                                </span>
                                <span className="text-[11px] font-mono font-bold text-slate-400">
                                    ({myTemplates.length})
                                </span>
                            </div>

                            {/* Horizontal cards row */}
                            <div className="flex items-center gap-2.5 overflow-x-auto pb-1 px-1">
                                {myTemplates.map((tpl) => {
                                    const isSelected = currentTpl?.id === tpl.id;
                                    const imgUrl = tpl.image_path || tpl.elements_config?.bg_image || null;
                                    return (
                                        <div
                                            key={tpl.id}
                                            onClick={() => handleSelectTemplate(tpl)}
                                            className={`group relative shrink-0 w-36 rounded-xl border-2 transition-all cursor-pointer overflow-hidden ${
                                                isSelected
                                                    ? 'border-[#154F7C] dark:border-sky-400 bg-sky-50/50 dark:bg-sky-950/20 shadow-xs ring-1 ring-[#154F7C]/30'
                                                    : 'border-slate-200 dark:border-white/[0.08] bg-slate-50/60 dark:bg-white/[0.02] hover:border-slate-300 dark:hover:border-white/20'
                                            }`}
                                        >
                                            <div className="h-16 w-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                                                {imgUrl ? (
                                                    <img src={imgUrl} alt={tpl.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Palette className="w-5 h-5 text-slate-400" />
                                                )}
                                            </div>
                                            <div className="p-2 flex items-center justify-between gap-1.5">
                                                <div className="min-w-0 flex-1">
                                                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                                        {tpl.name}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400">
                                                        {isSelected ? '● Active' : 'Select'}
                                                    </div>
                                                </div>
                                                {isCurrentCustomOrAdmin && myTemplates.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => openDeleteConfirmation(e, tpl)}
                                                        className="p-1 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                                                        title="Delete design"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Quick upload tile */}
                                <button
                                    type="button"
                                    onClick={() => setUploadModalOpen(true)}
                                    className="shrink-0 w-28 h-[100px] rounded-xl border-2 border-dashed border-slate-300 dark:border-white/10 hover:border-[#154F7C] dark:hover:border-sky-400 text-slate-400 hover:text-[#154F7C] dark:hover:text-sky-400 flex flex-col items-center justify-center gap-1 transition cursor-pointer"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span className="text-[11px] font-bold">New Pass</span>
                                </button>
                            </div>
                        </div>

                        {/* ── CLEAN CONTROL BAR & CONTEXTUAL INSPECTOR (BETWEEN "MY DESIGNS" AND "CANVAS STAGE") ── */}
                        {currentTpl && (
                            <form onSubmit={handleSaveTemplate} className="space-y-3">

                                {/* STUDIO CONTROLS BAR: Title, Element Selector Pills, Save Action */}
                                <div className="bg-white dark:bg-[#0B1524] rounded-2xl p-3 sm:p-3.5 border border-slate-200/80 dark:border-white/[0.08] shadow-2xs flex flex-wrap items-center justify-between gap-3">
                                    {/* Left: Template Title & Delete */}
                                    <div className="flex items-center gap-2 min-w-[200px] flex-1 sm:flex-initial">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
                                            Title:
                                        </span>
                                        <input
                                            type="text"
                                            value={form.data.name}
                                            onChange={(e) => form.setData('name', e.target.value)}
                                            placeholder="e.g. VIP Pass"
                                            className="w-36 sm:w-48 px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/70 dark:bg-[#07111D] text-slate-900 dark:text-white focus:border-[#154F7C] dark:focus:border-sky-400 focus:bg-white dark:focus:bg-[#07111D] outline-none transition"
                                        />
                                        {isCurrentCustomOrAdmin && (
                                            <button
                                                type="button"
                                                onClick={(e) => openDeleteConfirmation(e, currentTpl)}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition cursor-pointer"
                                                title="Delete this template"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Center: Element Selection Pills */}
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                         <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1 hidden md:inline">
                                             Elements:
                                         </span>

                                         {/* 1. Attendee Name Pill */}
                                         <button
                                             type="button"
                                             onClick={() => setActiveElementKey(activeElementKey === 'guest_name' ? null : 'guest_name')}
                                             className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                                 activeElementKey === 'guest_name'
                                                     ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs ring-1 ring-slate-900/10'
                                                     : 'bg-slate-50 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.08]'
                                             }`}
                                         >
                                             <Type className="w-3.5 h-3.5 text-slate-400" />
                                             <span>Attendee Name</span>
                                             {!form.data.elements_config?.show_guest_name && (
                                                 <span className="text-[10px] text-slate-400">(Hidden)</span>
                                             )}
                                         </button>

                                         {/* 2. Category Badge Pill */}
                                         <button
                                             type="button"
                                             onClick={() => setActiveElementKey(activeElementKey === 'allowance_badge' ? null : 'allowance_badge')}
                                             className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                                 activeElementKey === 'allowance_badge'
                                                     ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs ring-1 ring-slate-900/10'
                                                     : 'bg-slate-50 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.08]'
                                             }`}
                                         >
                                             <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                                             <span>Category Badge</span>
                                             {!form.data.elements_config?.show_allowance_badge && (
                                                 <span className="text-[10px] text-slate-400">(Hidden)</span>
                                             )}
                                         </button>

                                         {/* 3. QR Token Pill */}
                                         <button
                                             type="button"
                                             onClick={() => setActiveElementKey(activeElementKey === 'qr_code' ? null : 'qr_code')}
                                             className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                                 activeElementKey === 'qr_code'
                                                     ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs ring-1 ring-slate-900/10'
                                                     : 'bg-slate-50 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.08]'
                                             }`}
                                         >
                                             <QrCode className="w-3.5 h-3.5 text-slate-400" />
                                             <span>QR Token</span>
                                             {!form.data.elements_config?.show_qr && (
                                                 <span className="text-[10px] text-slate-400">(Hidden)</span>
                                             )}
                                         </button>

                                         {/* 4. Gate Code Pill */}
                                         <button
                                             type="button"
                                             onClick={() => setActiveElementKey(activeElementKey === 'card_number' ? null : 'card_number')}
                                             className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                                 activeElementKey === 'card_number'
                                                     ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs ring-1 ring-slate-900/10'
                                                     : 'bg-slate-50 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.08]'
                                             }`}
                                         >
                                             <Lock className="w-3.5 h-3.5 text-slate-400" />
                                             <span>Gate Code</span>
                                             {!form.data.elements_config?.show_unique_code && (
                                                 <span className="text-[10px] text-slate-400">(Hidden)</span>
                                             )}
                                         </button>
                                    </div>

                                    {/* Right: Save Template CTA */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="submit"
                                            disabled={form.processing}
                                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white rounded-xl bg-gradient-to-r from-[#154F7C] to-[#327FB5] hover:from-[#1A5C91] hover:to-[#3D8EC7] border border-sky-400/25 shadow-xs shadow-[#154F7C]/20 transition active:scale-95 cursor-pointer disabled:opacity-50"
                                        >
                                            {form.processing ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            ) : (
                                                <Save className="w-3.5 h-3.5" />
                                            )}
                                            <span>Save Changes</span>
                                        </button>
                                    </div>
                                </div>

                                {/* CONTEXTUAL SETTINGS PANEL: Only displayed when a specific element is clicked */}
                                {activeElementKey && (
                                    <div className="bg-white dark:bg-[#0B1524] rounded-2xl p-4 border border-sky-500/30 dark:border-sky-500/20 shadow-xs transition-all">
                                        
                                        {/* Header of Active Element */}
                                        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-white/[0.06]">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#154F7C] to-[#327FB5] text-white flex items-center justify-center shrink-0 shadow-xs">
                                                    {activeElementKey === 'guest_name' && <Type className="w-4 h-4" />}
                                                    {activeElementKey === 'allowance_badge' && <ShieldCheck className="w-4 h-4" />}
                                                    {activeElementKey === 'qr_code' && <QrCode className="w-4 h-4" />}
                                                    {activeElementKey === 'card_number' && <Lock className="w-4 h-4" />}
                                                </div>
                                                <div>
                                                    <div className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                                                        {activeElementKey === 'guest_name' && 'Attendee Name Settings'}
                                                        {activeElementKey === 'allowance_badge' && 'Category Badge Settings'}
                                                        {activeElementKey === 'qr_code' && 'QR Scanner Token Settings'}
                                                        {activeElementKey === 'card_number' && 'Gate Security Code Settings'}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 font-mono">
                                                        Position: X {form.data.elements_config?.[activeElementKey]?.x ?? 50}% · Y {form.data.elements_config?.[activeElementKey]?.y ?? 50}% · (drag on canvas to move)
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {/* Enable / Disable toggle for this specific element */}
                                                {activeElementKey === 'guest_name' && (
                                                    <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.08]">
                                                        <button
                                                            type="button"
                                                            onClick={() => updateDirectConfig('show_guest_name', true)}
                                                            className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${
                                                                form.data.elements_config?.show_guest_name === true
                                                                    ? 'bg-[#154F7C] text-white shadow-2xs'
                                                                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                                                            }`}
                                                        >
                                                            Show
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => updateDirectConfig('show_guest_name', false)}
                                                            className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${
                                                                form.data.elements_config?.show_guest_name !== true
                                                                    ? 'bg-slate-700 text-white shadow-2xs'
                                                                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                                                            }`}
                                                        >
                                                            Hide
                                                        </button>
                                                    </div>
                                                )}

                                                {activeElementKey === 'allowance_badge' && (
                                                    <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.08]">
                                                        <button
                                                            type="button"
                                                            onClick={() => updateDirectConfig('show_allowance_badge', true)}
                                                            className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${
                                                                form.data.elements_config?.show_allowance_badge === true
                                                                    ? 'bg-[#154F7C] text-white shadow-2xs'
                                                                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                                                            }`}
                                                        >
                                                            Show
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => updateDirectConfig('show_allowance_badge', false)}
                                                            className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${
                                                                form.data.elements_config?.show_allowance_badge !== true
                                                                    ? 'bg-slate-700 text-white shadow-2xs'
                                                                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                                                            }`}
                                                        >
                                                            Hide
                                                        </button>
                                                    </div>
                                                )}

                                                {activeElementKey === 'qr_code' && (
                                                    <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.08]">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                form.setData('show_qr', true);
                                                                updateDirectConfig('show_qr', true);
                                                            }}
                                                            className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${
                                                                form.data.elements_config?.show_qr === true
                                                                    ? 'bg-[#154F7C] text-white shadow-2xs'
                                                                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                                                            }`}
                                                        >
                                                            Show
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                form.setData('show_qr', false);
                                                                updateDirectConfig('show_qr', false);
                                                            }}
                                                            className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${
                                                                form.data.elements_config?.show_qr !== true
                                                                    ? 'bg-slate-700 text-white shadow-2xs'
                                                                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                                                            }`}
                                                        >
                                                            Hide
                                                        </button>
                                                    </div>
                                                )}

                                                {activeElementKey === 'card_number' && (
                                                    <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.08]">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                form.setData('show_unique_code', true);
                                                                updateDirectConfig('show_unique_code', true);
                                                            }}
                                                            className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${
                                                                form.data.elements_config?.show_unique_code === true
                                                                    ? 'bg-[#154F7C] text-white shadow-2xs'
                                                                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                                                            }`}
                                                        >
                                                            Show
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                form.setData('show_unique_code', false);
                                                                updateDirectConfig('show_unique_code', false);
                                                            }}
                                                            className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${
                                                                form.data.elements_config?.show_unique_code !== true
                                                                    ? 'bg-slate-700 text-white shadow-2xs'
                                                                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                                                            }`}
                                                        >
                                                            Hide
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Close / Done button */}
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveElementKey(null)}
                                                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition cursor-pointer ml-1"
                                                    title="Close element settings"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Specific Setting Controls Grid */}
                                        {activeElementKey === 'guest_name' && (
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                                                <div>
                                                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                                        <span>Font Size</span>
                                                        <span className="font-mono text-[#154F7C] dark:text-sky-400 font-bold">
                                                            {parseFloat(form.data.elements_config?.guest_name?.fontSize ?? 20)}px
                                                        </span>
                                                    </div>
                                                    <input
                                                        type="range" min="8" max="48" step="0.5"
                                                        value={form.data.elements_config?.guest_name?.fontSize ?? 20}
                                                        onChange={(e) => updateNestedConfig('guest_name', 'fontSize', parseFloat(e.target.value))}
                                                        className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#154F7C] dark:accent-sky-400"
                                                    />
                                                </div>
                                                <div>
                                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                                                        Typography Style
                                                    </span>
                                                    <select
                                                        value={form.data.elements_config?.guest_name?.fontFamily ?? 'Georgia, serif'}
                                                        onChange={(e) => updateNestedConfig('guest_name', 'fontFamily', e.target.value)}
                                                        className="w-full text-xs font-medium py-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-[#07111D] text-slate-800 dark:text-slate-200 outline-none cursor-pointer focus:border-[#154F7C] dark:focus:border-sky-400"
                                                    >
                                                        {FONT_OPTIONS.map(f => (
                                                            <option key={f.value} value={f.value}>{f.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                                                        Text Color
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="color"
                                                            value={form.data.elements_config?.guest_name?.color ?? '#FFFFFF'}
                                                            onChange={(e) => updateNestedConfig('guest_name', 'color', e.target.value)}
                                                            className="w-8 h-8 rounded-lg border border-slate-200 dark:border-white/10 cursor-pointer p-0.5 bg-white dark:bg-slate-800 shrink-0"
                                                        />
                                                        <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase">
                                                            {form.data.elements_config?.guest_name?.color ?? '#FFFFFF'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {activeElementKey === 'allowance_badge' && (
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                                                <div>
                                                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                                        <span>Badge Size</span>
                                                        <span className="font-mono text-[#154F7C] dark:text-sky-400 font-bold">
                                                            {parseFloat(form.data.elements_config?.allowance_badge?.fontSize ?? 10)}px
                                                        </span>
                                                    </div>
                                                    <input
                                                        type="range" min="8" max="32" step="0.5"
                                                        value={form.data.elements_config?.allowance_badge?.fontSize ?? 10}
                                                        onChange={(e) => updateNestedConfig('allowance_badge', 'fontSize', parseFloat(e.target.value))}
                                                        className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#154F7C] dark:accent-sky-400"
                                                    />
                                                </div>
                                                <div>
                                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                                                        Typography Style
                                                    </span>
                                                    <select
                                                        value={form.data.elements_config?.allowance_badge?.fontFamily ?? 'sans-serif'}
                                                        onChange={(e) => updateNestedConfig('allowance_badge', 'fontFamily', e.target.value)}
                                                        className="w-full text-xs font-medium py-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-[#07111D] text-slate-800 dark:text-slate-200 outline-none cursor-pointer focus:border-[#154F7C] dark:focus:border-sky-400"
                                                    >
                                                        {FONT_OPTIONS.map(f => (
                                                            <option key={f.value} value={f.value}>{f.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                                                        Badge Color
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="color"
                                                            value={form.data.elements_config?.allowance_badge?.color ?? '#FDE68A'}
                                                            onChange={(e) => updateNestedConfig('allowance_badge', 'color', e.target.value)}
                                                            className="w-8 h-8 rounded-lg border border-slate-200 dark:border-white/10 cursor-pointer p-0.5 bg-white dark:bg-slate-800 shrink-0"
                                                        />
                                                        <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase">
                                                            {form.data.elements_config?.allowance_badge?.color ?? '#FDE68A'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {activeElementKey === 'qr_code' && (
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                                                <div>
                                                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                                        <span>QR Code Size</span>
                                                        <span className="font-mono text-[#154F7C] dark:text-sky-400 font-bold">
                                                            {form.data.elements_config?.qr_code?.size ?? 88}px
                                                        </span>
                                                    </div>
                                                    <input
                                                        type="range" min="30" max="180" step="2"
                                                        value={form.data.elements_config?.qr_code?.size ?? 88}
                                                        onChange={(e) => updateNestedConfig('qr_code', 'size', parseInt(e.target.value))}
                                                        className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#154F7C] dark:accent-sky-400"
                                                    />
                                                </div>
                                                <div>
                                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                                                        QR Pattern Color
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="color"
                                                            value={form.data.elements_config?.qr_code?.darkColor ?? form.data.elements_config?.qr_code?.color ?? '#111827'}
                                                            onChange={(e) => {
                                                                updateNestedConfig('qr_code', {
                                                                    darkColor: e.target.value,
                                                                    color: e.target.value,
                                                                });
                                                            }}
                                                            className="w-8 h-8 rounded-lg border border-slate-200 dark:border-white/10 cursor-pointer p-0.5 bg-white dark:bg-slate-800 shrink-0"
                                                        />
                                                        <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase">
                                                            {form.data.elements_config?.qr_code?.darkColor ?? form.data.elements_config?.qr_code?.color ?? '#111827'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="pt-2 sm:pt-0">
                                                    <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={Boolean(form.data.elements_config?.qr_code?.transparent_bg)}
                                                            onChange={(e) => updateNestedConfig('qr_code', 'transparent_bg', e.target.checked)}
                                                            className="rounded text-[#154F7C] focus:ring-sky-500 h-4 w-4 cursor-pointer"
                                                        />
                                                        <span>Transparent Background (no white plaque)</span>
                                                    </label>
                                                </div>
                                            </div>
                                        )}

                                        {activeElementKey === 'card_number' && (
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                                                <div>
                                                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                                        <span>Code Font Size</span>
                                                        <span className="font-mono text-[#154F7C] dark:text-sky-400 font-bold">
                                                            {parseFloat(form.data.elements_config?.card_number?.fontSize ?? 9.5)}px
                                                        </span>
                                                    </div>
                                                    <input
                                                        type="range" min="8" max="24" step="0.5"
                                                        value={form.data.elements_config?.card_number?.fontSize ?? 9.5}
                                                        onChange={(e) => updateNestedConfig('card_number', 'fontSize', parseFloat(e.target.value))}
                                                        className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#154F7C] dark:accent-sky-400"
                                                    />
                                                </div>
                                                <div>
                                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                                                        Typography Style
                                                    </span>
                                                    <select
                                                        value={form.data.elements_config?.card_number?.fontFamily ?? 'monospace'}
                                                        onChange={(e) => updateNestedConfig('card_number', 'fontFamily', e.target.value)}
                                                        className="w-full text-xs font-medium py-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-[#07111D] text-slate-800 dark:text-slate-200 outline-none cursor-pointer focus:border-[#154F7C] dark:focus:border-sky-400"
                                                    >
                                                        {FONT_OPTIONS.map(f => (
                                                            <option key={f.value} value={f.value}>{f.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                                                        Text Color
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="color"
                                                            value={form.data.elements_config?.card_number?.color ?? '#FFFFFF'}
                                                            onChange={(e) => updateNestedConfig('card_number', 'color', e.target.value)}
                                                            className="w-8 h-8 rounded-lg border border-slate-200 dark:border-white/10 cursor-pointer p-0.5 bg-white dark:bg-slate-800 shrink-0"
                                                        />
                                                        <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase">
                                                            {form.data.elements_config?.card_number?.color ?? '#FFFFFF'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                )}

                                {/* ── EXPANSIVE INTERACTIVE CANVAS STAGE ── */}
                                <div className="bg-white dark:bg-[#0B1524] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs overflow-hidden flex flex-col">
                                    
                                    {/* Canvas Stage Bar */}
                                    <div className="px-4 py-2.5 border-b border-slate-100 dark:border-white/[0.06] flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#0B1524]">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                                Interactive Canvas
                                            </span>
                                        </div>

                                        {/* Sample Guest Input & Deselect Button */}
                                        <div className="flex items-center gap-2">
                                            {activeElementKey && (
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveElementKey(null)}
                                                    className="text-[11px] font-bold text-slate-400 hover:text-slate-700 dark:hover:text-white px-2 py-1 rounded-md transition cursor-pointer"
                                                >
                                                    Deselect
                                                </button>
                                            )}

                                            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] rounded-lg px-2.5 py-1">
                                                <User className="w-3 h-3 text-slate-400 shrink-0" />
                                                <span className="text-[10px] text-slate-400 font-bold shrink-0">Sample Guest:</span>
                                                <input
                                                    type="text"
                                                    value={testGuestName}
                                                    onChange={(e) => setTestGuestName(e.target.value)}
                                                    placeholder="Attendee Name"
                                                    className="text-xs font-bold bg-transparent text-slate-800 dark:text-white border-none outline-none w-32 placeholder:text-slate-300 dark:placeholder:text-slate-600"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stage Canvas Area */}
                                    <div 
                                        ref={stageContainerRef}
                                        onClick={() => setActiveElementKey(null)}
                                        className="p-3 sm:p-8 lg:p-12 flex items-center justify-center bg-slate-100/70 dark:bg-[#060D17] min-h-[380px] sm:min-h-[580px] relative select-none"
                                        style={{
                                            backgroundImage: 'radial-gradient(circle, rgba(148, 163, 184, 0.22) 1px, transparent 1px)',
                                            backgroundSize: '20px 20px'
                                        }}
                                    >
                                        <div className="w-full max-w-[460px] sm:max-w-[480px] transition-all relative drop-shadow-2xl">
                                            <PersonalisedCard
                                                guestName={testGuestName}
                                                cardNumber={sampleGuest?.card_number || '12345678'}
                                                allowance={testAllowance}
                                                event={sampleEvent}
                                                template={{
                                                    ...currentTpl,
                                                    ...form.data,
                                                    image_path: currentTpl?.image_path
                                                }}
                                                interactive={false}
                                                editorMode={true}
                                                activeElementKey={activeElementKey}
                                                onSelectElement={null}
                                                onStartDrag={handleStartDrag}
                                            />
                                        </div>
                                    </div>

                                </div>

                            </form>
                        )}
                    </>
                )}

            </div>

            {/* ── UPLOAD DESIGN MODAL ── */}
            <Modal show={uploadModalOpen} onClose={() => setUploadModalOpen(false)} maxWidth="sm">
                <form noValidate onSubmit={handleUploadSubmit} className="p-5 space-y-3.5">
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-white/[0.08]">
                        <div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-white">Upload Pass Artwork</h3>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">PNG, JPG, WEBP or SVG · up to 20MB</p>
                        </div>
                        <button 
                            type="button" 
                            onClick={() => setUploadModalOpen(false)} 
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Template name */}
                    <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                            Artwork Title <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={uploadForm.data.name}
                            onChange={(e) => uploadForm.setData('name', e.target.value)}
                            placeholder="e.g. Wedding VIP Invitation"
                            className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-[#07111D] text-slate-900 dark:text-white focus:border-[#154F7C] dark:focus:border-sky-400 focus:ring-1 focus:ring-sky-500/30 outline-none transition"
                        />
                        {uploadForm.errors.name && <p className="text-rose-500 text-[11px] mt-1">{uploadForm.errors.name}</p>}
                    </div>

                    {/* File picker */}
                    <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                            Artwork File <span className="text-rose-500">*</span>
                        </label>
                        <label className="block w-full cursor-pointer">
                            <div className={`flex flex-col items-center justify-center gap-1.5 border-2 border-dashed rounded-xl py-6 transition ${
                                uploadForm.data.image_file
                                    ? 'border-sky-400 bg-sky-50 dark:bg-sky-950/20'
                                    : 'border-slate-300 dark:border-white/[0.1] hover:border-[#154F7C] dark:hover:border-sky-400 bg-slate-50 dark:bg-white/[0.02]'
                            }`}>
                                {uploadForm.data.image_file ? (
                                    <>
                                        <CheckCircle2 className="w-5 h-5 text-[#154F7C] dark:text-sky-400" />
                                        <span className="text-xs font-bold text-[#154F7C] dark:text-sky-400 text-center px-4 truncate max-w-full">
                                            {uploadForm.data.image_file.name}
                                        </span>
                                        <span className="text-[10px] text-slate-400">Click to replace file</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-5 h-5 text-slate-400" />
                                        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Click to select image artwork</span>
                                    </>
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    uploadForm.setData('image_file', file);
                                    const img = new window.Image();
                                    const url = URL.createObjectURL(file);
                                    img.onload = () => {
                                        const w = img.naturalWidth, h = img.naturalHeight;
                                        setUploadedImgMeta({
                                            width: w, height: h,
                                            ratio: `${w}:${h}`,
                                            orientation: h > w ? 'portrait' : 'landscape'
                                        });
                                        URL.revokeObjectURL(url);
                                    };
                                    img.src = url;
                                }}
                            />
                        </label>
                        {uploadForm.errors.image_file && <p className="text-rose-500 text-[11px] mt-1">{uploadForm.errors.image_file}</p>}
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                        <button 
                            type="button" 
                            onClick={() => setUploadModalOpen(false)} 
                            className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isUploadingArtwork || uploadForm.processing}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#154F7C] to-[#327FB5] hover:from-[#1A5C91] hover:to-[#3D8EC7] border border-sky-400/25 text-white text-xs font-bold shadow-xs shadow-[#154F7C]/20 transition active:scale-95 cursor-pointer disabled:opacity-50"
                        >
                            {isUploadingArtwork || uploadForm.processing ? (
                                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading…</>
                            ) : (
                                <><Upload className="w-3.5 h-3.5" /> Upload</>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* ── CONFIRM DELETE MODAL ── */}
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
