import React, { useState, useEffect } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import KardovoAppLayout from '@/Layouts/KardovoAppLayout';
import EmptyEventState from '@/Components/EmptyEventState';
import PersonalisedCard from '@/Components/PersonalisedCard';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import ConfirmationModal from '@/Components/ConfirmationModal';
import Modal from '@/Components/Modal';
import { 
    Palette, 
    Upload, 
    Sparkles, 
    Sliders, 
    Eye, 
    Save, 
    Trash2, 
    Check, 
    Layers, 
    Move, 
    Type, 
    QrCode, 
    Image as ImageIcon,
    SlidersHorizontal,
    Plus,
    X,
    ExternalLink,
    Maximize2,
    Calendar,
    MapPin,
    Clock,
    ShieldCheck,
    CheckCircle2,
    AlertTriangle,
    Lock,
    Loader2,
    ArrowRight
} from 'lucide-react';

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

    // Sort templates so custom user-added templates and newest templates appear first (left side of gallery)
    const sortedTemplates = React.useMemo(() => {
        return [...templates].sort((a, b) => {
            const aIsUser = Boolean(a.user_id);
            const bIsUser = Boolean(b.user_id);
            if (aIsUser && !bIsUser) return -1;
            if (!aIsUser && bIsUser) return 1;
            return (b.id || 0) - (a.id || 0);
        });
    }, [templates]);

    // Current Active Template (local state fallback to first template in sorted order)
    const [currentTpl, setCurrentTpl] = useState(() => {
        if (selectedTemplate) return selectedTemplate;
        if (templates.length === 0) return null;
        const sorted = [...templates].sort((a, b) => {
            const aIsUser = Boolean(a.user_id);
            const bIsUser = Boolean(b.user_id);
            if (aIsUser && !bIsUser) return -1;
            if (!aIsUser && bIsUser) return 1;
            return (b.id || 0) - (a.id || 0);
        });
        return sorted[0] || null;
    });

    useEffect(() => {
        if (selectedTemplate) {
            handleSelectTemplate(selectedTemplate);
        } else if (sortedTemplates.length > 0 && !currentTpl) {
            handleSelectTemplate(sortedTemplates[0]);
        }
    }, [selectedTemplate?.id, sortedTemplates]);

    const isCustomArt = Boolean(currentTpl?.template_type === 'custom_art' && currentTpl?.image_path);
    const isPredefinedTemplate = Boolean(currentTpl?.user_id === null || 
        currentTpl?.is_predefined === true ||
        (currentTpl?.image_path && (currentTpl.image_path.includes('zamroth') || currentTpl.image_path.includes('adel'))) ||
        (currentTpl?.name && (currentTpl.name.toLowerCase().includes('zamroth') || currentTpl.name.toLowerCase().includes('adel'))));
    const isUploadedCustomArt = isCustomArt && !isPredefinedTemplate;

    // Active Inspector Tab
    const [inspectorTab, setInspectorTab] = useState(isCustomArt ? 'content' : 'palette');
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState(null);
    const [uploadedImgMeta, setUploadedImgMeta] = useState(null);
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

    // Dummy test guest state for live stage preview
    const [testGuestName, setTestGuestName] = useState(sampleGuest?.name || 'Alfred Mashauri');
    const [testAllowance, setTestAllowance] = useState(sampleGuest?.category ? sampleGuest.category.toUpperCase() : 'DOUBLE ENTRY');

    // Helper to merge template config with smart defaults for all text fields
    const buildMergedElementsConfig = (tpl) => {
        const isCustom = tpl?.template_type === 'custom_art' && tpl?.image_path;
        const isEngage = tpl?.elements_config?.theme === 'engagement_burgundy' || 
            (tpl?.image_path && tpl.image_path.includes('adel_laila')) || 
            (tpl?.name && tpl.name.toLowerCase().includes('adel'));
        
        const cfg = tpl?.elements_config || {};

        return {
            theme: cfg.theme || (isEngage ? 'engagement_burgundy' : 'wedding_romantic'),
            headline_text: cfg.headline_text || tpl?.headline || (isEngage ? 'Engagement Invitation' : 'WEDDING INVITATION'),
            couple_names: cfg.couple_names || (isEngage ? 'Adel & Laila' : 'Zamroth & Husna'),
            subtitle_text: cfg.subtitle_text || 'We invite your pleasure to come to our Engagement Party of',
            date_month: cfg.date_month || (isEngage ? 'APRIL' : 'JANUARY'),
            date_day_name: cfg.date_day_name || (isEngage ? 'FRIDAY' : 'SUNDAY'),
            date_day_num: cfg.date_day_num || (isEngage ? '26' : '4'),
            date_time: cfg.date_time || (isEngage ? '8:30 PM' : 'AT 11:00 AM'),
            date_year: cfg.date_year || '2026',
            invitation_quote: cfg.invitation_quote || (isEngage ? 'CELEBRATING LOVE & PROMISE' : 'WE INVITE YOU TO WITNESS THE BEGINNING OF OUR FOREVER, TOGETHER WITH OUR FAMILIES.'),
            venue_name: cfg.venue_name || (isEngage ? 'DAR ES SALAAM SERENA HOTEL' : 'ANGKORBAN'),
            venue_sub: cfg.venue_sub || (isEngage ? 'tanzania' : 'kongmeah, kampongcham'),
            venue_date: cfg.venue_date || (isEngage ? '26.04.2026' : '04.01.2026'),
            save_the_date: cfg.save_the_date || 'SAVE THE DATE',

            // Custom Art Text Settings
            couple_names_size: cfg.couple_names_size ?? (isEngage ? 44 : 40),
            couple_names_color: cfg.couple_names_color || (isEngage ? '#7A1E28' : '#FFFFFF'),
            couple_names_font: cfg.couple_names_font || 'Georgia, "Playfair Display", serif',
            couple_names_y: cfg.couple_names_y ?? (isEngage ? 22.5 : 13.5),

            subtitle_size: cfg.subtitle_size ?? 9.5,
            subtitle_color: cfg.subtitle_color || (isEngage ? '#7A1E28' : '#FFFFFF'),

            date_size: cfg.date_size ?? (isEngage ? 11 : 10.5),
            date_color: cfg.date_color || (isEngage ? '#7A1E28' : '#FFFFFF'),
            date_num_color: cfg.date_num_color || (isEngage ? '#7A1E28' : '#FDE68A'),
            date_y: cfg.date_y ?? (isEngage ? 38.5 : 51.5),

            quote_size: cfg.quote_size ?? 8.5,
            quote_color: cfg.quote_color || (isEngage ? '#7A1E28' : '#FFFFFF'),

            custom_venue_size: cfg.custom_venue_size ?? 8,
            custom_venue_color: cfg.custom_venue_color || (isEngage ? '#7A1E28' : '#FFFFFF'),

            // Signature Pass Adjustable Typography & Copy
            headline_size: cfg.headline_size ?? 11.5,
            headline_spacing: cfg.headline_spacing || '0.22em',
            headline_color: cfg.headline_color || '',

            event_title_size: cfg.event_title_size ?? 21,
            event_title_color: cfg.event_title_color || '',
            event_title_font: cfg.event_title_font || 'system-ui, -apple-system, sans-serif',
            event_title_weight: cfg.event_title_weight || '900',

            date_pill_size: cfg.date_pill_size ?? 12,
            date_pill_color: cfg.date_pill_color || '',
            date_pill_bg: cfg.date_pill_bg || '',

            plaque_header_text: cfg.plaque_header_text || 'INVITATION PASS ISSUED TO',
            plaque_header_size: cfg.plaque_header_size ?? 9,
            plaque_header_color: cfg.plaque_header_color || '',

            schedule_label_text: cfg.schedule_label_text || 'SCHEDULE',
            schedule_size: cfg.schedule_size ?? 13,
            schedule_color: cfg.schedule_color || '',

            venue_label_text: cfg.venue_label_text || 'VENUE LOCATION',
            venue_size: cfg.venue_size ?? 13,
            venue_color: cfg.venue_color || '',

            footer_text: cfg.footer_text || tpl?.footer_text || 'Secured & verified by KARDOVO',
            footer_size: cfg.footer_size ?? 10,
            footer_color: cfg.footer_color || '',

            bg_mode: cfg.bg_mode || (isCustom ? 'image' : 'gradient'),
            bg_solid_color: cfg.bg_solid_color || '#FFFFFF',
            bg_image: cfg.bg_image || tpl?.image_path || null,
            bg_overlay_opacity: cfg.bg_overlay_opacity ?? 0.35,

            // Canvas Aspect Ratio & Orientation Controls
            aspect_ratio: cfg.aspect_ratio || '',
            orientation: cfg.orientation || (isCustom ? 'portrait' : 'portrait'),
            image_width: cfg.image_width || null,
            image_height: cfg.image_height || null,

            // Layer Visibility Flags (Customizable Overlays)
            show_guest_name: [true, 'true', 1, '1'].includes(cfg.show_guest_name ?? true),
            show_allowance_badge: [true, 'true', 1, '1'].includes(cfg.show_allowance_badge ?? true),
            show_qr: [true, 'true', 1, '1'].includes(cfg.show_qr ?? tpl?.show_qr ?? true),
            show_unique_code: [true, 'true', 1, '1'].includes(cfg.show_unique_code ?? tpl?.show_unique_code ?? true),
            show_headline: [true, 'true', 1, '1'].includes(cfg.show_headline ?? true),
            show_couple_names: [true, 'true', 1, '1'].includes(cfg.show_couple_names ?? (isEngage ? true : (isCustom ? false : true))),
            show_date: [true, 'true', 1, '1'].includes(cfg.show_date ?? (isEngage ? true : (isCustom ? false : true))),
            show_quote: [true, 'true', 1, '1'].includes(cfg.show_quote ?? (isEngage ? true : (isCustom ? false : true))),
            show_venue: [true, 'true', 1, '1'].includes(cfg.show_venue ?? (isEngage ? true : (isCustom ? false : true))),

            guest_name: {
                x: 50,
                y: isCustom ? 71.5 : 48,
                fontSize: isCustom ? (isEngage ? 18 : 20) : 34,
                color: isCustom ? (isEngage ? '#54101A' : '#FFFFFF') : '#FFFFFF',
                fontFamily: 'Georgia, serif',
                fontWeight: '800',
                plaqueWidth: 84,
                ...(cfg.guest_name || {})
            },
            category_badge: {
                x: 50,
                y: isCustom ? (isEngage ? 5.2 : 5.5) : 12,
                fontSize: isCustom ? (isEngage ? 12 : 10.5) : 11,
                color: isCustom ? (isEngage ? '#7A1E28' : '#00A3FF') : '#00A3FF',
                fontFamily: isEngage ? 'cursive, Georgia, serif' : 'sans-serif',
                fontWeight: '800',
                ...(cfg.category_badge || {})
            },
            allowance_badge: {
                x: 50,
                y: isCustom ? 78.5 : 55,
                fontSize: isCustom ? 10 : 10,
                color: isCustom ? '#FDE68A' : '#00A3FF',
                fontFamily: 'sans-serif',
                fontWeight: '800',
                plaqueWidth: 84,
                hide_badge_box: false,
                ...(cfg.allowance_badge || {})
            },
            qr_code: {
                x: 50,
                y: isCustom ? 85.5 : 75,
                size: isCustom ? (isEngage ? 70 : 88) : 140,
                darkColor: isEngage ? '#6B1D2F' : '#111827',
                lightColor: '#FFFFFF',
                ...(cfg.qr_code || {})
            },
            card_number: {
                x: 50,
                y: isCustom ? 96 : 90,
                fontSize: isCustom ? 9.5 : 28,
                color: isEngage ? '#7A1E28' : '#FFFFFF',
                fontFamily: 'monospace',
                ...(cfg.card_number || {})
            }
        };
    };

    // Template Editing Form
    const form = useForm({
        name: currentTpl?.name || '',
        template_type: currentTpl?.template_type || 'gradient_card',
        brand_color_from: currentTpl?.brand_color_from || '#050D1A',
        brand_color_to: currentTpl?.brand_color_to || '#0A1A2E',
        headline: currentTpl?.headline || 'EXCLUSIVE INVITATION PASS',
        footer_text: currentTpl?.footer_text || 'Secured & verified by KARDOVO',
        show_qr: [true, 'true', 1, '1'].includes(currentTpl?.show_qr ?? true),
        show_unique_code: [true, 'true', 1, '1'].includes(currentTpl?.show_unique_code ?? true),
        show_category_badge: [true, 'true', 1, '1'].includes(currentTpl?.show_category_badge ?? true),
        elements_config: buildMergedElementsConfig(currentTpl)
    });

    // Upload Custom Artwork Form
    const uploadForm = useForm({
        name: '',
        template_type: 'custom_art',
        headline: 'EXCLUSIVE INVITATION PASS',
        overlay_mode: 'minimal',
        image_file: null,
        show_guest_name: true,
        show_allowance_badge: true,
        show_category_badge: true,
        show_qr: true,
        show_unique_code: true,
        show_headline: false,
        show_couple_names: false,
        show_date: false,
        show_quote: false,
        show_venue: false,
    });

    const applyLayerPreset = (preset) => {
        let newLayers = {};
        if (preset === 'minimal') {
            newLayers = {
                show_guest_name: true,
                show_allowance_badge: true,
                show_qr: true,
                show_unique_code: true,
                show_headline: false,
                show_couple_names: false,
                show_date: false,
                show_quote: false,
                show_venue: false,
            };
            form.setData((prev) => ({
                ...prev,
                show_qr: true,
                show_unique_code: true,
                show_category_badge: true,
                elements_config: {
                    ...prev.elements_config,
                    ...newLayers,
                }
            }));
        } else if (preset === 'full') {
            newLayers = {
                show_guest_name: true,
                show_allowance_badge: true,
                show_qr: true,
                show_unique_code: true,
                show_headline: true,
                show_couple_names: true,
                show_date: true,
                show_quote: true,
                show_venue: true,
            };
            form.setData((prev) => ({
                ...prev,
                show_qr: true,
                show_unique_code: true,
                show_category_badge: true,
                elements_config: {
                    ...prev.elements_config,
                    ...newLayers,
                }
            }));
        } else if (preset === 'pass_only') {
            newLayers = {
                show_guest_name: false,
                show_allowance_badge: false,
                show_qr: true,
                show_unique_code: true,
                show_headline: false,
                show_couple_names: false,
                show_date: false,
                show_quote: false,
                show_venue: false,
            };
            form.setData((prev) => ({
                ...prev,
                show_qr: true,
                show_unique_code: true,
                show_category_badge: false,
                elements_config: {
                    ...prev.elements_config,
                    ...newLayers,
                }
            }));
        }
    };

    // 1-Click Interactive Template Switcher
    const handleSelectTemplate = (tpl) => {
        setCurrentTpl(tpl);
        const tplIsCustom = tpl.template_type === 'custom_art' && tpl.image_path;
        
        form.setData({
            name: tpl.name || '',
            template_type: tpl.template_type || 'gradient_card',
            brand_color_from: tpl.brand_color_from || '#050D1A',
            brand_color_to: tpl.brand_color_to || '#0A1A2E',
            headline: tpl.headline || 'EXCLUSIVE INVITATION PASS',
            footer_text: tpl.footer_text || 'Secured & verified by KARDOVO',
            show_qr: tpl.show_qr ?? true,
            show_unique_code: tpl.show_unique_code ?? true,
            show_category_badge: tpl.show_category_badge ?? true,
            elements_config: buildMergedElementsConfig(tpl)
        });

        // Set matching inspector tab
        if (tplIsCustom) {
            setInspectorTab('plaque');
        } else {
            setInspectorTab('content');
        }

        // Update URL query string silently without reloading page
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

    const handleSaveTemplate = (e) => {
        e.preventDefault();
        if (currentTpl?.id) {
            form.put(route('templates.update', currentTpl.id), {
                preserveScroll: true,
                onSuccess: () => {
                    // Flash toast is rendered by layout
                }
            });
        } else {
            form.post(route('templates.store'), {
                preserveScroll: true,
            });
        }
    };

    const [isUploadingArtwork, setIsUploadingArtwork] = useState(false);

    const handleUploadSubmit = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        uploadForm.clearErrors();

        const name = uploadForm.data.name?.trim();
        const file = uploadForm.data.image_file;

        let hasError = false;
        if (!name) {
            uploadForm.setError('name', 'Template Style Name is required.');
            hasError = true;
        }

        if (!file) {
            uploadForm.setError('image_file', 'Please select an image artwork file (PNG, JPG, WEBP, SVG) to upload.');
            hasError = true;
        }

        if (hasError) return;

        const isMinimal = uploadForm.data.overlay_mode !== 'full';
        const customElementsConfig = {
            show_guest_name: uploadForm.data.show_guest_name ?? true,
            show_allowance_badge: uploadForm.data.show_allowance_badge ?? true,
            show_category_badge: uploadForm.data.show_category_badge ?? true,
            show_qr: uploadForm.data.show_qr ?? true,
            show_unique_code: uploadForm.data.show_unique_code ?? true,
            show_headline: isMinimal ? false : (uploadForm.data.show_headline ?? true),
            show_couple_names: isMinimal ? false : (uploadForm.data.show_couple_names ?? true),
            show_date: isMinimal ? false : (uploadForm.data.show_date ?? true),
            show_quote: isMinimal ? false : (uploadForm.data.show_quote ?? true),
            show_venue: isMinimal ? false : (uploadForm.data.show_venue ?? true),
            guest_name: { x: 50, y: 71.5, fontSize: 20, color: '#FFFFFF', plaqueWidth: 84 },
            qr_code: { x: 50, y: 85.5, size: 88, darkColor: '#111827', lightColor: '#FFFFFF' },
            card_number: { x: 50, y: 96, fontSize: 9.5, color: '#FFFFFF' },
            aspect_ratio: uploadedImgMeta?.ratio || '',
            orientation: uploadedImgMeta?.orientation || 'portrait',
            image_width: uploadedImgMeta?.width || null,
            image_height: uploadedImgMeta?.height || null,
        };

        const formData = new FormData();
        formData.append('name', name);
        formData.append('template_type', 'custom_art');
        formData.append('image_file', file);
        formData.append('headline', uploadForm.data.headline || "YOU'RE INVITED");
        formData.append('show_qr', uploadForm.data.show_qr ? '1' : '0');
        formData.append('show_unique_code', uploadForm.data.show_unique_code ? '1' : '0');
        formData.append('show_category_badge', uploadForm.data.show_category_badge ? '1' : '0');
        
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
                console.error('Template upload errors:', errs);
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
            warning: 'Events using it will use the default design.',
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
                            const remaining = templates.filter(t => t.id !== tpl.id);
                            if (remaining.length > 0) {
                                handleSelectTemplate(remaining[0]);
                            }
                        }
                    },
                    onError: () => setConfirmModal(prev => ({ ...prev, loading: false })),
                });
            }
        });
    };

    const isCurrentCustomOrAdmin = currentTpl && (currentTpl.user_id === user?.id || user?.role === 'admin');

    

    const currentConfig = form.data.elements_config || {};
    const nameCfg = currentConfig.guest_name || { x: 50, y: 71.5, fontSize: isCustomArt ? 17 : 34, color: '#FFFFFF', fontFamily: 'Georgia, serif', fontWeight: '700', plaqueWidth: 84 };
    const allowanceCfg = currentConfig.allowance_badge || { x: 50, y: 78.5, fontSize: 10, color: '#FDE68A', fontFamily: 'sans-serif', fontWeight: '800', plaqueWidth: 84, hide_badge_box: false };
    const badgeCfg = currentConfig.category_badge || { x: 50, y: 5.5, fontSize: isCustomArt ? 10.5 : 11, color: '#00A3FF', fontFamily: 'sans-serif', fontWeight: '800' };
    const qrCfg = currentConfig.qr_code || { x: 50, y: 85.5, size: isCustomArt ? 72 : 140, darkColor: '#111827' };
    const cardNumCfg = currentConfig.card_number || { x: 50, y: 96, fontSize: isCustomArt ? 9.5 : 28, color: '#FFFFFF' };


    // Only show user-uploaded custom art templates (no predefined presets)
    const myTemplates = templates.filter(t => t.user_id !== null && t.user_id !== undefined);

    return (
        <KardovoAppLayout
            title="Card Templates"
            headerActions={
                !hasNoEvents && (
                    <button
                        onClick={() => setUploadModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#16A34A] hover:bg-[#15803D] rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
                    >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Design</span>
                    </button>
                )
            }
        >
            <Head title="Card Templates — Kardovo" />

            <div className="max-w-7xl mx-auto space-y-5">

                {/* ── PAGE HEADER ── */}
                <div className="px-1 flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-lg font-black text-slate-900 dark:text-white font-display tracking-tight">Card Templates</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Upload your event artwork · adjust element positions · save
                        </p>
                    </div>
                    {myTemplates.length > 0 && (
                        <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">
                            {myTemplates.length} {myTemplates.length === 1 ? 'design' : 'designs'}
                        </span>
                    )}
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
                    <div className="flex flex-col items-center justify-center py-24 px-6 text-center border-2 border-dashed border-slate-200 dark:border-white/[0.08] rounded-2xl bg-slate-50/60 dark:bg-white/[0.02]">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center mb-4">
                            <Upload className="w-6 h-6 text-slate-400" />
                        </div>
                        <h2 className="text-sm font-bold text-slate-800 dark:text-white">No designs yet</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                            Upload your event flyer or invitation artwork — we'll overlay the guest name, QR code and access badge on top.
                        </p>
                        <button
                            type="button"
                            onClick={() => setUploadModalOpen(true)}
                            className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
                        >
                            <Upload className="w-3.5 h-3.5" />
                            Upload Your First Design
                        </button>
                    </div>
                ) : (
                    <>
                        {/* ── TEMPLATE THUMBNAIL RAIL ── */}
                        <div className="flex overflow-x-auto gap-3 pb-1 -mx-1 px-1 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
                            {myTemplates.map((tpl) => {
                                const isSelected = currentTpl?.id === tpl.id;
                                const imgUrl = tpl.image_path || tpl.elements_config?.bg_image || null;
                                const canDeleteThis = tpl.user_id === user?.id || isAdmin;
                                return (
                                    <div
                                        key={tpl.id}
                                        onClick={() => handleSelectTemplate(tpl)}
                                        className={`group relative shrink-0 w-24 rounded-xl overflow-hidden border-2 cursor-pointer transition-all duration-150 ${
                                            isSelected
                                                ? 'border-[#16A34A] shadow-md shadow-emerald-500/20'
                                                : 'border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.2]'
                                        }`}
                                    >
                                        <div className="w-full h-[72px] bg-slate-100 dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                                            {imgUrl ? (
                                                <img src={imgUrl} alt={tpl.name} className="w-full h-full object-cover" loading="lazy" />
                                            ) : (
                                                <Palette className="w-5 h-5 text-slate-400" />
                                            )}
                                        </div>
                                        <div className={`px-2 py-1.5 text-[10px] font-bold truncate border-t ${
                                            isSelected
                                                ? 'bg-[#16A34A] text-white border-[#16A34A]'
                                                : 'bg-white dark:bg-[#0B1524] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/[0.06]'
                                        }`}>
                                            {isSelected && <Check className="w-2.5 h-2.5 inline mr-1 stroke-[3]" />}
                                            {tpl.name}
                                        </div>
                                        {canDeleteThis && (
                                            <button
                                                type="button"
                                                onClick={(e) => openDeleteConfirmation(e, tpl)}
                                                className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/60 hover:bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition cursor-pointer"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                            {/* Add new */}
                            <button
                                type="button"
                                onClick={() => setUploadModalOpen(true)}
                                className="shrink-0 w-24 h-[104px] rounded-xl border-2 border-dashed border-slate-300 dark:border-white/[0.1] hover:border-[#16A34A] dark:hover:border-[#16A34A] text-slate-400 hover:text-[#16A34A] flex flex-col items-center justify-center gap-1.5 transition cursor-pointer"
                            >
                                <Plus className="w-5 h-5" />
                                <span className="text-[10px] font-bold">Upload</span>
                            </button>
                        </div>

                        {/* ── STUDIO WORKSPACE ── */}
                        {currentTpl && (
                            <form onSubmit={handleSaveTemplate} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                                {/* LEFT: Element Controls (5 cols) */}
                                <div className="lg:col-span-5 space-y-3">

                                    {/* Template name row */}
                                    <div className="bg-white dark:bg-[#0B1524] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] px-4 py-3 flex items-center justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Template name</div>
                                            <input
                                                type="text"
                                                value={form.data.name}
                                                onChange={(e) => form.setData('name', e.target.value)}
                                                placeholder="e.g. Wedding Pass"
                                                className="w-full text-xs font-bold bg-transparent text-slate-900 dark:text-white border-none outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={form.processing}
                                            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold rounded-xl transition active:scale-95 cursor-pointer disabled:opacity-50"
                                        >
                                            <Save className="w-3.5 h-3.5" />
                                            Save
                                        </button>
                                    </div>

                                    {/* ELEMENT 1: Guest Attendee Name */}
                                    <div className="bg-white dark:bg-[#0B1524] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] overflow-hidden">
                                        <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06]">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                                                    <Type className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-slate-900 dark:text-white">Guest Attendee Name</div>
                                                    <div className="text-[10px] text-slate-400 mt-0.5">Fetched name for the guest (e.g. Alfred Mashauri)</div>
                                                </div>
                                            </div>
                                            <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                                                <input
                                                    type="checkbox"
                                                    checked={form.data.elements_config?.show_guest_name !== false}
                                                    onChange={(e) => updateDirectConfig('show_guest_name', e.target.checked)}
                                                    className="rounded text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5 cursor-pointer"
                                                />
                                                <span className={`text-[10px] font-bold ${form.data.elements_config?.show_guest_name !== false ? 'text-[#16A34A]' : 'text-slate-400'}`}>
                                                    {form.data.elements_config?.show_guest_name !== false ? 'VISIBLE' : 'HIDDEN'}
                                                </span>
                                            </label>
                                        </div>
                                        {form.data.elements_config?.show_guest_name !== false && (
                                            <div className="px-4 py-3 space-y-3">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <div className="text-[10px] text-slate-500 font-bold mb-1.5">Vertical position (%)</div>
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="range" min="1" max="99" step="0.5"
                                                                value={form.data.elements_config?.guest_name?.y ?? 71.5}
                                                                onChange={(e) => updateNestedConfig('guest_name', 'y', parseFloat(e.target.value))}
                                                                className="flex-1 h-1.5 accent-emerald-600 cursor-pointer"
                                                            />
                                                            <span className="text-[10px] font-mono font-bold text-[#16A34A] w-9 text-right">
                                                                {parseFloat(form.data.elements_config?.guest_name?.y ?? 71.5)}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] text-slate-500 font-bold mb-1.5">Font size (px)</div>
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="range" min="8" max="48" step="0.5"
                                                                value={form.data.elements_config?.guest_name?.fontSize ?? 20}
                                                                onChange={(e) => updateNestedConfig('guest_name', 'fontSize', parseFloat(e.target.value))}
                                                                className="flex-1 h-1.5 accent-emerald-600 cursor-pointer"
                                                            />
                                                            <span className="text-[10px] font-mono font-bold text-[#16A34A] w-9 text-right">
                                                                {parseFloat(form.data.elements_config?.guest_name?.fontSize ?? 20)}px
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between gap-4">
                                                    <div>
                                                        <div className="text-[10px] text-slate-500 font-bold mb-1.5">Text color</div>
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="color"
                                                                value={form.data.elements_config?.guest_name?.color ?? '#FFFFFF'}
                                                                onChange={(e) => updateNestedConfig('guest_name', 'color', e.target.value)}
                                                                className="w-8 h-8 rounded-lg border border-slate-200 dark:border-white/10 cursor-pointer p-0.5 bg-white dark:bg-slate-800"
                                                            />
                                                            <span className="text-xs font-mono text-slate-600 dark:text-slate-300">
                                                                {form.data.elements_config?.guest_name?.color ?? '#FFFFFF'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {/* Remove container toggle */}
                                                    <label className="flex items-center gap-2 cursor-pointer select-none shrink-0">
                                                        <div className={`relative w-8 h-4 rounded-full transition-colors ${form.data.elements_config?.guest_name?.hide_plaque_box ? 'bg-[#16A34A]' : 'bg-slate-200 dark:bg-white/[0.1]'}`}>
                                                            <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-xs transition-transform ${form.data.elements_config?.guest_name?.hide_plaque_box ? 'translate-x-4' : 'translate-x-0.5'}`} />
                                                        </div>
                                                        <input
                                                            type="checkbox"
                                                            className="sr-only"
                                                            checked={!!form.data.elements_config?.guest_name?.hide_plaque_box}
                                                            onChange={(e) => updateNestedConfig('guest_name', 'hide_plaque_box', e.target.checked)}
                                                        />
                                                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Remove container</span>
                                                    </label>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* ELEMENT 2: Category Badge */}
                                    <div className="bg-white dark:bg-[#0B1524] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] overflow-hidden">
                                        <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06]">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-slate-900 dark:text-white">Invitation Category Badge</div>
                                                    <div className="text-[10px] text-slate-400 mt-0.5">Access pill (e.g. DOUBLE ENTRY, SINGLE ENTRY)</div>
                                                </div>
                                            </div>
                                            <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                                                <input
                                                    type="checkbox"
                                                    checked={form.data.elements_config?.show_allowance_badge !== false}
                                                    onChange={(e) => updateDirectConfig('show_allowance_badge', e.target.checked)}
                                                    className="rounded text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5 cursor-pointer"
                                                />
                                                <span className={`text-[10px] font-bold ${form.data.elements_config?.show_allowance_badge !== false ? 'text-[#16A34A]' : 'text-slate-400'}`}>
                                                    {form.data.elements_config?.show_allowance_badge !== false ? 'VISIBLE' : 'HIDDEN'}
                                                </span>
                                            </label>
                                        </div>
                                        {form.data.elements_config?.show_allowance_badge !== false && (
                                            <div className="px-4 py-3 space-y-3">
                                                <div>
                                                    <div className="text-[10px] text-slate-500 font-bold mb-1.5">Vertical position (%)</div>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="range" min="1" max="99" step="0.5"
                                                            value={form.data.elements_config?.allowance_badge?.y ?? 78.5}
                                                            onChange={(e) => updateNestedConfig('allowance_badge', 'y', parseFloat(e.target.value))}
                                                            className="flex-1 h-1.5 accent-emerald-600 cursor-pointer"
                                                        />
                                                        <span className="text-[10px] font-mono font-bold text-[#16A34A] w-9 text-right">
                                                            {parseFloat(form.data.elements_config?.allowance_badge?.y ?? 78.5)}%
                                                        </span>
                                                    </div>
                                                </div>
                                                {/* Remove container toggle */}
                                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                                    <div className={`relative w-8 h-4 rounded-full transition-colors ${form.data.elements_config?.allowance_badge?.hide_badge_box ? 'bg-[#16A34A]' : 'bg-slate-200 dark:bg-white/[0.1]'}`}>
                                                        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-xs transition-transform ${form.data.elements_config?.allowance_badge?.hide_badge_box ? 'translate-x-4' : 'translate-x-0.5'}`} />
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only"
                                                        checked={!!form.data.elements_config?.allowance_badge?.hide_badge_box}
                                                        onChange={(e) => updateNestedConfig('allowance_badge', 'hide_badge_box', e.target.checked)}
                                                    />
                                                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Remove container</span>
                                                </label>
                                            </div>
                                        )}
                                    </div>

                                    {/* ELEMENT 3: QR Code */}
                                    <div className="bg-white dark:bg-[#0B1524] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] overflow-hidden">
                                        <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06]">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center">
                                                    <QrCode className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-slate-900 dark:text-white">QR Scanner Token</div>
                                                    <div className="text-[10px] text-slate-400 mt-0.5">High-contrast QR scanned at the gate</div>
                                                </div>
                                            </div>
                                            <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                                                <input
                                                    type="checkbox"
                                                    checked={form.data.elements_config?.show_qr !== false}
                                                    onChange={(e) => {
                                                        form.setData('show_qr', e.target.checked);
                                                        updateDirectConfig('show_qr', e.target.checked);
                                                    }}
                                                    className="rounded text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5 cursor-pointer"
                                                />
                                                <span className={`text-[10px] font-bold ${form.data.elements_config?.show_qr !== false ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                                                    {form.data.elements_config?.show_qr !== false ? 'VISIBLE' : 'HIDDEN'}
                                                </span>
                                            </label>
                                        </div>
                                        {form.data.elements_config?.show_qr !== false && (
                                            <div className="px-4 py-3 grid grid-cols-2 gap-3">
                                                <div>
                                                    <div className="text-[10px] text-slate-500 font-bold mb-1.5">Vertical position (%)</div>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="range" min="1" max="99" step="0.5"
                                                            value={form.data.elements_config?.qr_code?.y ?? 85.5}
                                                            onChange={(e) => updateNestedConfig('qr_code', 'y', parseFloat(e.target.value))}
                                                            className="flex-1 h-1.5 accent-emerald-600 cursor-pointer"
                                                        />
                                                        <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 w-9 text-right">
                                                            {parseFloat(form.data.elements_config?.qr_code?.y ?? 85.5)}%
                                                        </span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-[10px] text-slate-500 font-bold mb-1.5">QR size (px)</div>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="range" min="40" max="200" step="2"
                                                            value={form.data.elements_config?.qr_code?.size ?? 88}
                                                            onChange={(e) => updateNestedConfig('qr_code', 'size', parseInt(e.target.value))}
                                                            className="flex-1 h-1.5 accent-emerald-600 cursor-pointer"
                                                        />
                                                        <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 w-9 text-right">
                                                            {form.data.elements_config?.qr_code?.size ?? 88}px
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* ELEMENT 4: Gate Security Code */}
                                    <div className="bg-white dark:bg-[#0B1524] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] overflow-hidden">
                                        <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06]">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center">
                                                    <Lock className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-slate-900 dark:text-white">Gate Security Code</div>
                                                    <div className="text-[10px] text-slate-400 mt-0.5">8-digit passcode for manual staff lookup</div>
                                                </div>
                                            </div>
                                            <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                                                <input
                                                    type="checkbox"
                                                    checked={form.data.elements_config?.show_unique_code !== false}
                                                    onChange={(e) => {
                                                        form.setData('show_unique_code', e.target.checked);
                                                        updateDirectConfig('show_unique_code', e.target.checked);
                                                    }}
                                                    className="rounded text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5 cursor-pointer"
                                                />
                                                <span className={`text-[10px] font-bold ${form.data.elements_config?.show_unique_code !== false ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                                                    {form.data.elements_config?.show_unique_code !== false ? 'VISIBLE' : 'HIDDEN'}
                                                </span>
                                            </label>
                                        </div>
                                        {form.data.elements_config?.show_unique_code !== false && (
                                            <div className="px-4 py-3">
                                                <div className="text-[10px] text-slate-500 font-bold mb-1.5">Vertical position (%)</div>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="range" min="1" max="99" step="0.5"
                                                        value={form.data.elements_config?.card_number?.y ?? 96}
                                                        onChange={(e) => updateNestedConfig('card_number', 'y', parseFloat(e.target.value))}
                                                        className="flex-1 h-1.5 accent-emerald-600 cursor-pointer"
                                                    />
                                                    <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 w-9 text-right">
                                                        {parseFloat(form.data.elements_config?.card_number?.y ?? 96)}%
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                </div>

                                {/* RIGHT: Live Preview (7 cols) */}
                                <div className="lg:col-span-7 lg:sticky lg:top-6">
                                    <div className="bg-white dark:bg-[#0B1524] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] overflow-hidden">
                                        {/* Preview header */}
                                        <div className="px-4 py-3 border-b border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
                                            <div>
                                                <div className="text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-white">Live Preview</div>
                                                <div className="text-[10px] text-slate-400 mt-0.5">{currentTpl?.name}</div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {/* Test guest name input */}
                                                <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-lg px-2.5 py-1.5">
                                                    <Type className="w-3 h-3 text-slate-400 shrink-0" />
                                                    <input
                                                        type="text"
                                                        value={testGuestName}
                                                        onChange={(e) => setTestGuestName(e.target.value)}
                                                        placeholder="Test guest name"
                                                        className="text-[11px] font-medium bg-transparent text-slate-700 dark:text-slate-200 border-none outline-none w-32 placeholder:text-slate-300 dark:placeholder:text-slate-600"
                                                    />
                                                </div>
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                    Live
                                                </span>
                                            </div>
                                        </div>

                                        {/* Card preview */}
                                        <div className="p-6 flex items-center justify-center bg-slate-50 dark:bg-[#070E1A] min-h-[480px]">
                                            <div className="w-full max-w-[320px]">
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
                                                    interactive={true}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </form>
                        )}
                    </>
                )}

            </div>

            {/* ── UPLOAD MODAL ── */}
            <Modal show={uploadModalOpen} onClose={() => setUploadModalOpen(false)} maxWidth="sm">
                <form noValidate onSubmit={handleUploadSubmit} className="p-6 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.08]">
                        <div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-white">Upload Design</h3>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">PNG, JPG, WEBP or SVG · max 10MB</p>
                        </div>
                        <button type="button" onClick={() => setUploadModalOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Template name */}
                    <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                            Template Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={uploadForm.data.name}
                            onChange={(e) => uploadForm.setData('name', e.target.value)}
                            placeholder="e.g. Wedding Night Pass"
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-[#07111D] text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 outline-none transition"
                        />
                        {uploadForm.errors.name && <p className="text-rose-500 text-[11px] mt-1">{uploadForm.errors.name}</p>}
                    </div>

                    {/* File picker */}
                    <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                            Artwork File <span className="text-rose-500">*</span>
                        </label>
                        <label className="block w-full cursor-pointer">
                            <div className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl py-8 transition ${
                                uploadForm.data.image_file
                                    ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20'
                                    : 'border-slate-300 dark:border-white/[0.1] hover:border-[#16A34A] bg-slate-50 dark:bg-white/[0.02]'
                            }`}>
                                {uploadForm.data.image_file ? (
                                    <>
                                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 text-center px-4 truncate max-w-full">
                                            {uploadForm.data.image_file.name}
                                        </span>
                                        <span className="text-[10px] text-slate-400">Click to change</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-5 h-5 text-slate-400" />
                                        <span className="text-xs font-medium text-slate-500">Click to select artwork</span>
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
                        <button type="button" onClick={() => setUploadModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isUploadingArtwork || uploadForm.processing}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95 cursor-pointer disabled:opacity-50"
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

            {/* ── CONFIRM DELETE ── */}
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
