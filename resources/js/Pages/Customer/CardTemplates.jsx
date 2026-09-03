import React, { useState, useEffect } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import KardovoAppLayout from '@/Layouts/KardovoAppLayout';
import PersonalisedCard from '@/Components/PersonalisedCard';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
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
    Loader2
} from 'lucide-react';

export default function CardTemplates({ 
    templates = [], 
    selectedTemplate, 
    sampleEvent, 
    sampleGuest 
}) {
    const user = usePage().props.auth?.user;
    const isAdmin = user?.role === 'admin' || user?.is_admin;
    const canCustomize = isAdmin || (user?.status !== 'suspended' && user?.effective_permissions?.can_customize_templates !== false);

    // Current Active Template (local state fallback to first template)
    const [currentTpl, setCurrentTpl] = useState(() => {
        return selectedTemplate || templates[0] || null;
    });

    useEffect(() => {
        if (selectedTemplate) {
            handleSelectTemplate(selectedTemplate);
        } else if (templates.length > 0 && !currentTpl) {
            handleSelectTemplate(templates[0]);
        }
    }, [selectedTemplate?.id]);

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

    // Dummy test guest state for live stage preview
    const [testGuestName, setTestGuestName] = useState(sampleGuest?.name || 'Alfred Mashauri');
    const [testAllowance, setTestAllowance] = useState(sampleGuest?.allowance_label || 'DOUBLE ENTRY • 2X');

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

            // Layer Visibility Flags (Customizable Overlays)
            show_guest_name: cfg.show_guest_name ?? true,
            show_allowance_badge: cfg.show_allowance_badge ?? true,
            show_qr: cfg.show_qr ?? tpl?.show_qr ?? true,
            show_unique_code: cfg.show_unique_code ?? tpl?.show_unique_code ?? true,
            show_headline: cfg.show_headline ?? tpl?.show_category_badge ?? true,
            show_couple_names: cfg.show_couple_names ?? (isEngage ? true : (isCustom ? (cfg.show_couple_names ?? false) : true)),
            show_date: cfg.show_date ?? (isEngage ? true : (isCustom ? (cfg.show_date ?? false) : true)),
            show_quote: cfg.show_quote ?? (isEngage ? true : (isCustom ? (cfg.show_quote ?? false) : true)),
            show_venue: cfg.show_venue ?? (isEngage ? true : (isCustom ? (cfg.show_venue ?? false) : true)),

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
        show_qr: currentTpl?.show_qr ?? true,
        show_unique_code: currentTpl?.show_unique_code ?? true,
        show_category_badge: currentTpl?.show_category_badge ?? true,
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
        } else if (preset === 'full') {
            newLayers = {
                show_guest_name: true,
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

    const updateNestedConfig = (section, key, value) => {
        form.setData('elements_config', {
            ...form.data.elements_config,
            [section]: {
                ...(form.data.elements_config[section] || {}),
                [key]: value
            }
        });
    };

    const updateDirectConfig = (key, value) => {
        form.setData('elements_config', {
            ...form.data.elements_config,
            [key]: value
        });
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
        };

        const formData = new FormData();
        formData.append('name', name);
        formData.append('template_type', 'custom_art');
        formData.append('image_file', file);
        formData.append('headline', uploadForm.data.headline || "YOU'RE INVITED");
        formData.append('show_qr', uploadForm.data.show_qr ? '1' : '0');
        formData.append('show_unique_code', uploadForm.data.show_unique_code ? '1' : '0');
        formData.append('show_category_badge', isMinimal ? '0' : '1');
        
        Object.entries(customElementsConfig).forEach(([key, val]) => {
            if (typeof val === 'object' && val !== null) {
                Object.entries(val).forEach(([subKey, subVal]) => {
                    formData.append(`elements_config[${key}][${subKey}]`, subVal);
                });
            } else {
                formData.append(`elements_config[${key}]`, val ? '1' : '0');
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
        setTemplateToDelete(tpl);
        setDeleteModalOpen(true);
    };

    const confirmDeleteTemplate = () => {
        if (!templateToDelete) return;
        router.delete(route('templates.destroy', templateToDelete.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteModalOpen(false);
                if (currentTpl?.id === templateToDelete.id) {
                    const remaining = templates.filter(t => t.id !== templateToDelete.id);
                    if (remaining.length > 0) {
                        handleSelectTemplate(remaining[0]);
                    }
                }
                setTemplateToDelete(null);
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

    return (
        <KardovoAppLayout
            title="Card Templates & Artwork Studio"
            headerActions={
                <button
                    onClick={() => setUploadModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-cyan-600 dark:hover:bg-cyan-500 rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
                >
                    <Upload className="w-3.5 h-3.5 text-slate-200 dark:text-white" />
                    <span>+ Import Custom Artwork</span>
                </button>
            }
        >
            <Head title="Card & Artwork Studio - Kardovo" />

            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* ═══════════════════════════════════════════════════════════ */}
                {/* 1. SIMPLE PAGE TITLE HEADER                                  */}
                {/* ═══════════════════════════════════════════════════════════ */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight">
                            Card Templates &amp; Artwork Studio
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                            Customize and fine-tune dynamic guest pass layouts, typography, and QR code placement.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-[#0B1524] px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
                            {templates.length} Templates Configured
                        </span>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* 2. CARD TEMPLATE PRESET SELECTOR GRID (CLICK TO EDIT)       */}
                {/* ═══════════════════════════════════════════════════════════ */}
                <div className="bg-white/70 dark:bg-[#0B1524]/85 backdrop-blur-3xl backdrop-saturate-180 p-6 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.03)] dark:shadow-card space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                            <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                                Available Template Presets (Click Any Preset to Edit)
                            </span>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium font-mono">
                            {templates.length} templates configured
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {templates.map((tpl) => {
                            const isSelected = currentTpl?.id === tpl.id;
                            const imgUrl = (isSelected && currentTpl?.image_path)
                                ? currentTpl.image_path
                                : (tpl.image_path || tpl.elements_config?.bg_image || tpl.elements_config?.image_path || null);
                            const isCustom = Boolean(imgUrl || tpl.template_type === 'custom_art');
                            const isRecommended = isCustom && !tpl.user_id;
                            const isPersonal = !!tpl.user_id;
                            const canDeleteThis = tpl.user_id === user?.id || user?.role === 'admin';

                            return (
                                <div
                                    key={tpl.id}
                                    onClick={() => handleSelectTemplate(tpl)}
                                    className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all group relative overflow-hidden cursor-pointer active:scale-95 w-full backdrop-blur-xl ${
                                        isSelected 
                                            ? 'border-slate-900 dark:border-cyan-400 ring-2 ring-slate-900/10 dark:ring-cyan-400/30 bg-slate-50/80 dark:bg-white/[0.04] shadow-md scale-[1.01]' 
                                            : 'border-slate-200/80 dark:border-white/[0.08] hover:border-slate-400 dark:hover:border-white/[0.2] bg-white/60 dark:bg-white/[0.02] shadow-xs hover:shadow-card'
                                    }`}
                                >
                                    <div className="w-full">
                                        {isCustom && imgUrl ? (
                                            <div className="w-full h-32 rounded-xl overflow-hidden mb-3 bg-slate-900 border border-slate-200/80 dark:border-white/[0.08] relative group/thumb">
                                                <img 
                                                    src={imgUrl} 
                                                    alt={tpl.name} 
                                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                                                    onError={(e) => {
                                                        e.currentTarget.onerror = null;
                                                        e.currentTarget.src = '/templates/zamroth_husna_bg.jpg';
                                                    }}
                                                />
                                                {isRecommended && (
                                                    <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-md bg-slate-900/80 dark:bg-black/70 text-white text-[9px] font-bold tracking-wide uppercase shadow-sm backdrop-blur-xs border border-white/10">
                                                        ★ Recommended
                                                    </span>
                                                )}
                                                {isPersonal && (
                                                    <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-md bg-slate-900/80 dark:bg-black/70 text-white text-[9px] font-bold tracking-wide uppercase shadow-sm backdrop-blur-xs border border-white/10">
                                                        👤 My Template
                                                    </span>
                                                )}

                                                {/* Delete button on custom template card */}
                                                {canDeleteThis && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => openDeleteConfirmation(e, tpl)}
                                                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-700 text-white shadow-md transition active:scale-90 opacity-80 hover:opacity-100 cursor-pointer"
                                                        title="Delete this template"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}

                                                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/75 text-white text-[9px] font-bold backdrop-blur-xs">
                                                    4K Custom Art
                                                </span>
                                            </div>
                                        ) : (
                                            <div 
                                                className="w-full h-32 rounded-xl mb-3 flex items-center justify-center p-4 text-white text-center font-bold text-xs shadow-inner relative overflow-hidden"
                                                style={{
                                                    background: `linear-gradient(135deg, ${tpl.brand_color_from || '#0A1128'} 0%, #008EE8 50%, ${tpl.brand_color_to || '#008EE8'} 100%)`
                                                }}
                                            >
                                                {isPersonal && (
                                                    <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-md bg-slate-900/80 dark:bg-black/70 text-white text-[9px] font-bold tracking-wide uppercase shadow-sm backdrop-blur-xs border border-white/10">
                                                        👤 My Template
                                                    </span>
                                                )}

                                                {/* Delete button on gradient template card */}
                                                {canDeleteThis && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => openDeleteConfirmation(e, tpl)}
                                                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-700 text-white shadow-md transition active:scale-90 opacity-80 hover:opacity-100 cursor-pointer"
                                                        title="Delete this template"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}

                                                <span className="font-extrabold tracking-wider">{tpl.headline || 'GRADIENT PASS'}</span>
                                            </div>
                                        )}

                                        <div className="font-bold text-slate-900 dark:text-white text-xs truncate">
                                            {tpl.name}
                                        </div>
                                        <div className="text-[10.5px] text-slate-500 dark:text-slate-400 capitalize truncate mt-0.5 font-mono">
                                            {isCustom ? 'Custom Artwork' : 'Gradient Canvas'}
                                        </div>
                                    </div>

                                    <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-white/[0.08] flex items-center justify-between w-full">
                                        <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full transition ${
                                            isSelected 
                                                ? 'bg-slate-900 dark:bg-cyan-600 text-white shadow-xs' 
                                                : 'bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 group-hover:bg-slate-200 dark:group-hover:bg-white/[0.1] group-hover:text-slate-900 dark:group-hover:text-white'
                                        }`}>
                                            {isSelected ? 'Editing Now' : 'Click to Edit'}
                                        </span>
                                        {isSelected && (
                                            <div className="w-5 h-5 rounded-full bg-slate-900 dark:bg-cyan-600 text-white flex items-center justify-center shadow-xs">
                                                <Check className="w-3 h-3 stroke-[3]" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* 3. SPLIT WORKSPACE: ELEMENT INSPECTOR & LIVE 4K STAGE       */}
                {/* ═══════════════════════════════════════════════════════════ */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left: Studio Element & Coordinate Inspector (7 cols) */}
                    <div className="lg:col-span-7 bg-white/75 dark:bg-[#0B1524]/85 backdrop-blur-3xl backdrop-saturate-180 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-[0_10px_35px_rgba(0,0,0,0.04)] dark:shadow-card overflow-hidden flex flex-col lg:max-h-[calc(100vh-6rem)] lg:sticky lg:top-6">
                        
                        {/* Inspector Header & Segmented Tabs (Fixed at Top of Card) */}
                        <div className="p-5 sm:p-6 border-b border-slate-200/60 dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] backdrop-blur-xl flex-shrink-0">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200/60 dark:border-white/[0.08] text-slate-700 dark:text-slate-200 flex items-center justify-center flex-shrink-0 shadow-2xs">
                                        <SlidersHorizontal className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-slate-900 dark:text-white font-display">
                                            Element Placement &amp; Content Inspector
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                                            Editing Template: <strong className="text-slate-900 dark:text-white">{currentTpl?.name}</strong>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 text-[10.5px] font-mono font-medium text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-[#0B1524] px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span>Live Vector Sync</span>
                                    </span>
                                </div>
                            </div>

                            {/* Sub-Tabs Grid Bar (Clean, Unified Monochromatic Segmented Bar) */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 rounded-2xl bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08]">
                                {/* Row 1, Col 1: Layers & Elements */}
                                <button
                                    type="button"
                                    onClick={() => setInspectorTab("layers")}
                                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-2 cursor-pointer active:scale-95 ${
                                        inspectorTab === "layers"
                                            ? "bg-slate-900 dark:bg-cyan-600 text-white shadow-xs"
                                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/[0.06]"
                                    }`}
                                    title="Layers & Elements"
                                >
                                    <Layers className={`w-3.5 h-3.5 flex-shrink-0 ${inspectorTab === "layers" ? "text-white" : "text-slate-500 dark:text-slate-400"}`} />
                                    <span className="truncate">Layers &amp; Elements</span>
                                </button>

                                {/* Row 1, Col 2: Content & Text */}
                                <button
                                    type="button"
                                    onClick={() => setInspectorTab("content")}
                                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-2 cursor-pointer active:scale-95 ${
                                        inspectorTab === "content"
                                            ? "bg-slate-900 dark:bg-cyan-600 text-white shadow-xs"
                                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/[0.06]"
                                    }`}
                                    title="Content & Text"
                                >
                                    <Type className={`w-3.5 h-3.5 flex-shrink-0 ${inspectorTab === "content" ? "text-white" : "text-slate-500 dark:text-slate-400"}`} />
                                    <span className="truncate">Content &amp; Text</span>
                                </button>

                                {/* Row 1, Col 3: Artwork Asset */}
                                <button
                                    type="button"
                                    onClick={() => setInspectorTab(isCustomArt ? "artwork" : "palette")}
                                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-2 cursor-pointer active:scale-95 ${
                                        (inspectorTab === "artwork" || inspectorTab === "palette")
                                            ? "bg-slate-900 dark:bg-cyan-600 text-white shadow-xs"
                                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/[0.06]"
                                    }`}
                                    title={isCustomArt ? "Artwork Asset" : "Background & Palette"}
                                >
                                    {isCustomArt ? (
                                        <ImageIcon className={`w-3.5 h-3.5 flex-shrink-0 ${inspectorTab === "artwork" ? "text-white" : "text-slate-500 dark:text-slate-400"}`} />
                                    ) : (
                                        <Palette className={`w-3.5 h-3.5 flex-shrink-0 ${inspectorTab === "palette" ? "text-white" : "text-slate-500 dark:text-slate-400"}`} />
                                    )}
                                    <span className="truncate">{isCustomArt ? "Artwork Asset" : "Palette & Style"}</span>
                                </button>

                                {/* Row 1, Col 4: Guest Plaque */}
                                <button
                                    type="button"
                                    onClick={() => setInspectorTab("plaque")}
                                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-2 cursor-pointer active:scale-95 ${
                                        inspectorTab === "plaque"
                                            ? "bg-slate-900 dark:bg-cyan-600 text-white shadow-xs"
                                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/[0.06]"
                                    }`}
                                    title="Guest Plaque"
                                >
                                    <Move className={`w-3.5 h-3.5 flex-shrink-0 ${inspectorTab === "plaque" ? "text-white" : "text-slate-500 dark:text-slate-400"}`} />
                                    <span className="truncate">Guest Plaque</span>
                                </button>

                                {/* Row 2, Col 1 (Below Layers & Elements) */}
                                <button
                                    type="button"
                                    onClick={() => setInspectorTab(isUploadedCustomArt ? "category" : "badge")}
                                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-2 cursor-pointer active:scale-95 ${
                                        (inspectorTab === "badge" || inspectorTab === "category")
                                            ? "bg-slate-900 dark:bg-cyan-600 text-white shadow-xs"
                                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/[0.06]"
                                    }`}
                                    title="Verified Badge"
                                >
                                    <ShieldCheck className={`w-3.5 h-3.5 flex-shrink-0 ${(inspectorTab === "badge" || inspectorTab === "category") ? "text-white" : "text-slate-500 dark:text-slate-400"}`} />
                                    <span className="truncate">Verified Badge</span>
                                </button>

                                {/* Row 2, Col 2 (Below Content & Text) */}
                                <button
                                    type="button"
                                    onClick={() => setInspectorTab("qr")}
                                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-2 cursor-pointer active:scale-95 ${
                                        inspectorTab === "qr"
                                            ? "bg-slate-900 dark:bg-cyan-600 text-white shadow-xs"
                                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/[0.06]"
                                    }`}
                                    title="QR Code"
                                >
                                    <QrCode className={`w-3.5 h-3.5 flex-shrink-0 ${inspectorTab === "qr" ? "text-white" : "text-slate-500 dark:text-slate-400"}`} />
                                    <span className="truncate">QR Code</span>
                                </button>

                                {/* Row 2, Col 3 (Directly Below Artwork Asset) */}
                                <button
                                    type="button"
                                    onClick={() => setInspectorTab("security")}
                                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-2 cursor-pointer active:scale-95 ${
                                        inspectorTab === "security"
                                            ? "bg-slate-900 dark:bg-cyan-600 text-white shadow-xs"
                                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/[0.06]"
                                    }`}
                                    title="Security Code"
                                >
                                    <Clock className={`w-3.5 h-3.5 flex-shrink-0 ${inspectorTab === "security" ? "text-white" : "text-slate-500 dark:text-slate-400"}`} />
                                    <span className="truncate">Security Code</span>
                                </button>
                            </div>
                        </div>

                        {/* Inspector Form (Flex Layout with Internal Scroll) */}
                        <form onSubmit={handleSaveTemplate} className="flex-1 flex flex-col min-h-0 overflow-hidden">
                            
                            {/* Scrollable Form Body Container */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            
                            {/* General Template Meta (Always visible) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-100 dark:border-white/[0.08]">
                                <div>
                                    <InputLabel value="Template Name *" />
                                    <TextInput
                                        className="block w-full text-xs font-bold"
                                        value={form.data.name}
                                        onChange={(e) => form.setData('name', e.target.value)}
                                        required
                                        placeholder="e.g. Royal Emerald 4K Pass"
                                    />
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <InputLabel value="Headline Banner Text" />
                                        <label className="inline-flex items-center gap-1.5 cursor-pointer select-none text-[11px] font-bold">
                                            <input
                                                type="checkbox"
                                                checked={form.data.show_category_badge !== false && form.data.show_headline !== false}
                                                onChange={(e) => {
                                                    const isChecked = e.target.checked;
                                                    form.setData("show_headline", isChecked);
                                                    form.setData("show_category_badge", isChecked);
                                                    updateDirectConfig("show_headline", isChecked);
                                                    updateDirectConfig("show_category_badge", isChecked);
                                                }}
                                                className="rounded text-cyan-600 focus:ring-cyan-500 h-3.5 w-3.5 cursor-pointer"
                                            />
                                            <span className={(form.data.show_category_badge !== false && form.data.show_headline !== false) ? "text-cyan-600 dark:text-cyan-400" : "text-slate-400"}>
                                                {(form.data.show_category_badge !== false && form.data.show_headline !== false) ? "Visible" : "Hidden"}
                                            </span>
                                        </label>
                                    </div>
                                    <TextInput
                                        className={`block w-full text-xs font-bold transition-all ${
                                            (form.data.show_category_badge === false || form.data.show_headline === false)
                                                ? "opacity-40 bg-slate-100 dark:bg-white/[0.04]"
                                                : ""
                                        }`}
                                        value={form.data.headline || ""}
                                        disabled={form.data.show_category_badge === false || form.data.show_headline === false}
                                        onChange={(e) => {
                                            form.setData("headline", e.target.value);
                                            updateDirectConfig("headline_text", e.target.value);
                                        }}
                                        placeholder="e.g. WEDDING INVITATION"
                                    />
                                    
                                    {/* Headline Vertical Position (Y%) Slider */}
                                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between gap-3">
                                        <span className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400">
                                            Headline Vertical Position (Y%)
                                        </span>
                                        <div className="flex items-center gap-2 flex-1 max-w-[180px]">
                                            <input
                                                type="range"
                                                min="1"
                                                max="90"
                                                step="0.5"
                                                disabled={form.data.show_category_badge === false || form.data.show_headline === false}
                                                value={parseFloat(form.data.elements_config?.headline_y ?? form.data.elements_config?.category_badge?.y ?? 5.5)}
                                                onChange={(e) => {
                                                    const val = parseFloat(e.target.value);
                                                    updateDirectConfig("headline_y", val);
                                                    updateNestedConfig("category_badge", "y", val);
                                                }}
                                                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:opacity-40"
                                            />
                                            <span className="text-[11px] font-mono font-bold text-cyan-600 dark:text-cyan-400 min-w-[38px] text-right">
                                                {parseFloat(form.data.elements_config?.headline_y ?? form.data.elements_config?.category_badge?.y ?? 5.5)}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* TAB: FIELD LAYERS & VISIBILITY SELECTOR */}
                            {inspectorTab === 'layers' && (
                                <div className="space-y-6 animate-fadeIn">
                                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/[0.08]">
                                        <div className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                                            <Layers className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
                                            <span>Field &amp; Layer Visibility Selector</span>
                                        </div>
                                        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-medium">
                                            Live Canvas Sync
                                        </span>
                                    </div>

                                    {/* 1. Quick Presets Bar */}
                                    <div className="p-4 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-2.5">
                                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                                            <span>Quick Overlay Presets</span>
                                            <span className="text-[10.5px] text-slate-500 font-normal">Choose an instant layout preset</span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => applyLayerPreset('minimal')}
                                                className="p-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0B1524] hover:border-slate-400 dark:hover:border-white/20 text-left transition active:scale-95 cursor-pointer flex flex-col justify-between shadow-2xs"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold text-slate-900 dark:text-white">Minimal Pass</span>
                                                    <span className="text-[9.5px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.06] border border-slate-200/70 dark:border-white/[0.08] px-1.5 py-0.5 rounded-full font-mono">Popular</span>
                                                </div>
                                                <span className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">
                                                    Name + QR + Security Code only. For custom flyers with artwork text.
                                                </span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => applyLayerPreset('full')}
                                                className="p-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0B1524] hover:border-slate-400 dark:hover:border-white/20 text-left transition active:scale-95 cursor-pointer flex flex-col justify-between shadow-2xs"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold text-slate-900 dark:text-white">Full Suite</span>
                                                </div>
                                                <span className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">
                                                    Display all fields: Titles, Dates, Quotes, Venue &amp; Guest Plaque.
                                                </span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => applyLayerPreset('pass_only')}
                                                className="p-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0B1524] hover:border-slate-400 dark:hover:border-white/20 text-left transition active:scale-95 cursor-pointer flex flex-col justify-between shadow-2xs"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold text-slate-900 dark:text-white">QR Pass Only</span>
                                                </div>
                                                <span className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">
                                                    Only scannable QR token and Gate Code overlay.
                                                </span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* 2. Individual Layer Toggle Switches */}
                                    <div className="space-y-2.5">
                                        <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                            Select Which Elements Appear on the Pass
                                        </div>

                                        {/* A. Guest Name (Standalone) */}
                                        <div className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                                            currentConfig.show_guest_name !== false
                                                ? 'bg-white dark:bg-white/[0.04] border-slate-300 dark:border-white/[0.12] shadow-xs'
                                                : 'bg-slate-50/60 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.06] opacity-60'
                                        }`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                                                    currentConfig.show_guest_name !== false
                                                        ? 'bg-slate-900 dark:bg-cyan-600 text-white shadow-2xs'
                                                        : 'bg-slate-100 dark:bg-white/[0.06] text-slate-400 dark:text-slate-500'
                                                }`}>
                                                    <Move className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                        <span>Guest Attendee Name</span>
                                                        {currentConfig.show_guest_name !== false ? (
                                                            <span className="inline-flex items-center gap-1 text-[9.5px] font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.06] px-2 py-0.5 rounded-full border border-slate-200/70 dark:border-white/[0.08]">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                                <span>VISIBLE</span>
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center text-[9.5px] font-mono font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/[0.04] px-2 py-0.5 rounded-full border border-slate-200/50 dark:border-white/[0.04]">
                                                                <span>HIDDEN</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                                        Fetched name only for the guest attendee (e.g. <em>Alfred Mashauri</em>).
                                                    </div>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                                                <input
                                                    type="checkbox"
                                                    checked={currentConfig.show_guest_name !== false}
                                                    onChange={(e) => updateDirectConfig('show_guest_name', e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-slate-900 dark:peer-checked:bg-cyan-600" />
                                            </label>
                                        </div>

                                        {/* A2. Invitation Category / Allowance Badge (Separate Standalone Field) */}
                                        <div className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                                            currentConfig.show_allowance_badge !== false
                                                ? 'bg-white dark:bg-white/[0.04] border-slate-300 dark:border-white/[0.12] shadow-xs'
                                                : 'bg-slate-50/60 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.06] opacity-60'
                                        }`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                                                    currentConfig.show_allowance_badge !== false
                                                        ? 'bg-slate-900 dark:bg-cyan-600 text-white shadow-2xs'
                                                        : 'bg-slate-100 dark:bg-white/[0.06] text-slate-400 dark:text-slate-500'
                                                }`}>
                                                    <ShieldCheck className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                        <span>Invitation Category / Allowance Badge</span>
                                                        {currentConfig.show_allowance_badge !== false ? (
                                                            <span className="inline-flex items-center gap-1 text-[9.5px] font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.06] px-2 py-0.5 rounded-full border border-slate-200/70 dark:border-white/[0.08]">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                                <span>VISIBLE</span>
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center text-[9.5px] font-mono font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/[0.04] px-2 py-0.5 rounded-full border border-slate-200/50 dark:border-white/[0.04]">
                                                                <span>HIDDEN</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                                        Independent access category pill (e.g. <em>DOUBLE ENTRY • 2X</em> or <em>SINGLE ENTRY ACCESS</em>).
                                                    </div>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                                                <input
                                                    type="checkbox"
                                                    checked={currentConfig.show_allowance_badge !== false}
                                                    onChange={(e) => updateDirectConfig('show_allowance_badge', e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-slate-900 dark:peer-checked:bg-cyan-600" />
                                            </label>
                                        </div>

                                        {/* B. QR Code Pass */}
                                        <div className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                                            (form.data.show_qr && currentConfig.show_qr !== false)
                                                ? 'bg-white dark:bg-white/[0.04] border-slate-300 dark:border-white/[0.12] shadow-xs'
                                                : 'bg-slate-50/60 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.06] opacity-60'
                                        }`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                                                    (form.data.show_qr && currentConfig.show_qr !== false)
                                                        ? 'bg-slate-900 dark:bg-cyan-600 text-white shadow-2xs'
                                                        : 'bg-slate-100 dark:bg-white/[0.06] text-slate-400 dark:text-slate-500'
                                                }`}>
                                                    <QrCode className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                        <span>Scannable QR Code Pass</span>
                                                        {(form.data.show_qr && currentConfig.show_qr !== false) ? (
                                                            <span className="inline-flex items-center gap-1 text-[9.5px] font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.06] px-2 py-0.5 rounded-full border border-slate-200/70 dark:border-white/[0.08]">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                                <span>VISIBLE</span>
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center text-[9.5px] font-mono font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/[0.04] px-2 py-0.5 rounded-full border border-slate-200/50 dark:border-white/[0.04]">
                                                                <span>HIDDEN</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                                        Sub-second camera scannable dynamic QR token for gate entry.
                                                    </div>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                                                <input
                                                    type="checkbox"
                                                    checked={Boolean(form.data.show_qr && currentConfig.show_qr !== false)}
                                                    onChange={(e) => {
                                                        form.setData('show_qr', e.target.checked);
                                                        updateDirectConfig('show_qr', e.target.checked);
                                                    }}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-slate-900 dark:peer-checked:bg-cyan-600" />
                                            </label>
                                        </div>

                                        {/* C. Security Verification Code */}
                                        <div className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                                            (form.data.show_unique_code && currentConfig.show_unique_code !== false)
                                                ? 'bg-white dark:bg-white/[0.04] border-slate-300 dark:border-white/[0.12] shadow-xs'
                                                : 'bg-slate-50/60 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.06] opacity-60'
                                        }`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                                                    (form.data.show_unique_code && currentConfig.show_unique_code !== false)
                                                        ? 'bg-slate-900 dark:bg-cyan-600 text-white shadow-2xs'
                                                        : 'bg-slate-100 dark:bg-white/[0.06] text-slate-400 dark:text-slate-500'
                                                }`}>
                                                    <Clock className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                        <span>Gate Security Verification Code</span>
                                                        {(form.data.show_unique_code && currentConfig.show_unique_code !== false) ? (
                                                            <span className="inline-flex items-center gap-1 text-[9.5px] font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.06] px-2 py-0.5 rounded-full border border-slate-200/70 dark:border-white/[0.08]">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                                <span>VISIBLE</span>
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center text-[9.5px] font-mono font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/[0.04] px-2 py-0.5 rounded-full border border-slate-200/50 dark:border-white/[0.04]">
                                                                <span>HIDDEN</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                                        8-digit numeric passcode for manual gate staff override lookup.
                                                    </div>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                                                <input
                                                    type="checkbox"
                                                    checked={Boolean(form.data.show_unique_code && currentConfig.show_unique_code !== false)}
                                                    onChange={(e) => {
                                                        form.setData('show_unique_code', e.target.checked);
                                                        updateDirectConfig('show_unique_code', e.target.checked);
                                                    }}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-slate-900 dark:peer-checked:bg-cyan-600" />
                                            </label>
                                        </div>

                                        {/* D. Couple / Host Names */}
                                        <div className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                                            currentConfig.show_couple_names !== false
                                                ? 'bg-white dark:bg-white/[0.04] border-slate-300 dark:border-white/[0.12] shadow-xs'
                                                : 'bg-slate-50/60 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.06] opacity-60'
                                        }`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                                                    currentConfig.show_couple_names !== false
                                                        ? 'bg-slate-900 dark:bg-cyan-600 text-white shadow-2xs'
                                                        : 'bg-slate-100 dark:bg-white/[0.06] text-slate-400 dark:text-slate-500'
                                                }`}>
                                                    <Type className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                        <span>Couple / Event Host Names</span>
                                                        {currentConfig.show_couple_names !== false ? (
                                                            <span className="inline-flex items-center gap-1 text-[9.5px] font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.06] px-2 py-0.5 rounded-full border border-slate-200/70 dark:border-white/[0.08]">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                                <span>VISIBLE</span>
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center text-[9.5px] font-mono font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/[0.04] px-2 py-0.5 rounded-full border border-slate-200/50 dark:border-white/[0.04]">
                                                                <span>HIDDEN</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                                        Large centerpiece event title (e.g. <em>Zamroth &amp; Husna</em>). Turn off if already drawn in your flyer.
                                                    </div>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                                                <input
                                                    type="checkbox"
                                                    checked={currentConfig.show_couple_names !== false}
                                                    onChange={(e) => updateDirectConfig('show_couple_names', e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-slate-900 dark:peer-checked:bg-cyan-600" />
                                            </label>
                                        </div>

                                        {/* E. Date & Schedule Details */}
                                        <div className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                                            currentConfig.show_date !== false
                                                ? 'bg-white dark:bg-white/[0.04] border-slate-300 dark:border-white/[0.12] shadow-xs'
                                                : 'bg-slate-50/60 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.06] opacity-60'
                                        }`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                                                    currentConfig.show_date !== false
                                                        ? 'bg-slate-900 dark:bg-cyan-600 text-white shadow-2xs'
                                                        : 'bg-slate-100 dark:bg-white/[0.06] text-slate-400 dark:text-slate-500'
                                                }`}>
                                                    <Calendar className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                        <span>Date, Day &amp; Schedule Details</span>
                                                        {currentConfig.show_date !== false ? (
                                                            <span className="inline-flex items-center gap-1 text-[9.5px] font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.06] px-2 py-0.5 rounded-full border border-slate-200/70 dark:border-white/[0.08]">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                                <span>VISIBLE</span>
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center text-[9.5px] font-mono font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/[0.04] px-2 py-0.5 rounded-full border border-slate-200/50 dark:border-white/[0.04]">
                                                                <span>HIDDEN</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                                        Month, day, time, and year schedule blocks.
                                                    </div>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                                                <input
                                                    type="checkbox"
                                                    checked={currentConfig.show_date !== false}
                                                    onChange={(e) => updateDirectConfig('show_date', e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-slate-900 dark:peer-checked:bg-cyan-600" />
                                            </label>
                                        </div>

                                        {/* F. Headline Badge Pill */}
                                        <div className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                                            (form.data.show_category_badge && currentConfig.show_headline !== false)
                                                ? 'bg-white dark:bg-white/[0.04] border-slate-300 dark:border-white/[0.12] shadow-xs'
                                                : 'bg-slate-50/60 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.06] opacity-60'
                                        }`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                                                    (form.data.show_category_badge && currentConfig.show_headline !== false)
                                                        ? 'bg-slate-900 dark:bg-cyan-600 text-white shadow-2xs'
                                                        : 'bg-slate-100 dark:bg-white/[0.06] text-slate-400 dark:text-slate-500'
                                                }`}>
                                                    <ShieldCheck className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                        <span>Headline / Top Tag Pill</span>
                                                        {(form.data.show_category_badge && currentConfig.show_headline !== false) ? (
                                                            <span className="inline-flex items-center gap-1 text-[9.5px] font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.06] px-2 py-0.5 rounded-full border border-slate-200/70 dark:border-white/[0.08]">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                                <span>VISIBLE</span>
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center text-[9.5px] font-mono font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/[0.04] px-2 py-0.5 rounded-full border border-slate-200/50 dark:border-white/[0.04]">
                                                                <span>HIDDEN</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                                        Header tag badge (e.g. <em>WEDDING INVITATION</em> or <em>EXCLUSIVE PASS</em>).
                                                    </div>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                                                <input
                                                    type="checkbox"
                                                    checked={Boolean(form.data.show_category_badge && currentConfig.show_headline !== false)}
                                                    onChange={(e) => {
                                                        form.setData('show_category_badge', e.target.checked);
                                                        updateDirectConfig('show_headline', e.target.checked);
                                                    }}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-slate-900 dark:peer-checked:bg-cyan-600" />
                                            </label>
                                        </div>

                                        {/* G. Invitation Quote */}
                                        <div className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                                            currentConfig.show_quote !== false
                                                ? 'bg-white dark:bg-white/[0.04] border-slate-300 dark:border-white/[0.12] shadow-xs'
                                                : 'bg-slate-50/60 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.06] opacity-60'
                                        }`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                                                    currentConfig.show_quote !== false
                                                        ? 'bg-slate-900 dark:bg-cyan-600 text-white shadow-2xs'
                                                        : 'bg-slate-100 dark:bg-white/[0.06] text-slate-400 dark:text-slate-500'
                                                }`}>
                                                    <Sparkles className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                        <span>Invitation Quote / Tagline</span>
                                                        {currentConfig.show_quote !== false ? (
                                                            <span className="inline-flex items-center gap-1 text-[9.5px] font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.06] px-2 py-0.5 rounded-full border border-slate-200/70 dark:border-white/[0.08]">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                                <span>VISIBLE</span>
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center text-[9.5px] font-mono font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/[0.04] px-2 py-0.5 rounded-full border border-slate-200/50 dark:border-white/[0.04]">
                                                                <span>HIDDEN</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                                        Romantic quote or custom invitation statement paragraph.
                                                    </div>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                                                <input
                                                    type="checkbox"
                                                    checked={currentConfig.show_quote !== false}
                                                    onChange={(e) => updateDirectConfig('show_quote', e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-slate-900 dark:peer-checked:bg-cyan-600" />
                                            </label>
                                        </div>

                                        {/* H. Venue & Location */}
                                        <div className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                                            currentConfig.show_venue !== false
                                                ? 'bg-white dark:bg-white/[0.04] border-slate-300 dark:border-white/[0.12] shadow-xs'
                                                : 'bg-slate-50/60 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.06] opacity-60'
                                        }`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                                                    currentConfig.show_venue !== false
                                                        ? 'bg-slate-900 dark:bg-cyan-600 text-white shadow-2xs'
                                                        : 'bg-slate-100 dark:bg-white/[0.06] text-slate-400 dark:text-slate-500'
                                                }`}>
                                                    <MapPin className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                        <span>Venue Location Details</span>
                                                        {currentConfig.show_venue !== false ? (
                                                            <span className="inline-flex items-center gap-1 text-[9.5px] font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.06] px-2 py-0.5 rounded-full border border-slate-200/70 dark:border-white/[0.08]">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                                <span>VISIBLE</span>
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center text-[9.5px] font-mono font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/[0.04] px-2 py-0.5 rounded-full border border-slate-200/50 dark:border-white/[0.04]">
                                                                <span>HIDDEN</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                                        Hall/Hotel venue name, city, and date sub-captions.
                                                    </div>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                                                <input
                                                    type="checkbox"
                                                    checked={currentConfig.show_venue !== false}
                                                    onChange={(e) => updateDirectConfig('show_venue', e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-slate-900 dark:peer-checked:bg-cyan-600" />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB: CONTENT & TEXT (ALL TEMPLATES) */}
                            {inspectorTab === 'content' && (
                                <div className="space-y-6 animate-fadeIn">
                                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/[0.08]">
                                        <div className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                                            <Type className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                                            <span>{isCustomArt ? 'Artwork Typography & Pass Copy' : 'Signature Pass Elements & Typography'}</span>
                                        </div>
                                        <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                                            Live Canvas Sync
                                        </span>
                                    </div>

                                    {/* ─── A. CUSTOM ARTWORK ADJUSTABLE ELEMENTS ─── */}
                                    {isCustomArt ? (
                                        <div className="space-y-5">
                                            {/* 1. Couple / Host Names Section */}
                                            <div className="p-4 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-3">
                                                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                                    Couple / Event Host Names
                                                </div>
                                                <TextInput
                                                    className="block w-full text-xs font-serif font-bold"
                                                    value={currentConfig.couple_names || ''}
                                                    onChange={(e) => updateDirectConfig('couple_names', e.target.value)}
                                                    placeholder="e.g. Zamroth & Husna"
                                                />
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                                                    <div>
                                                        <div className="flex justify-between text-[10.5px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                                                            <span>Font Size</span>
                                                            <span className="font-mono text-cyan-600 dark:text-cyan-400">{currentConfig.couple_names_size || 40}px</span>
                                                        </div>
                                                        <input
                                                            type="range"
                                                            min="18"
                                                            max="65"
                                                            step="1"
                                                            value={currentConfig.couple_names_size || 40}
                                                            onChange={(e) => updateDirectConfig('couple_names_size', parseFloat(e.target.value))}
                                                            className="w-full h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="flex justify-between text-[10.5px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                                                            <span>Vertical Position (Y%)</span>
                                                            <span className="font-mono text-cyan-600 dark:text-cyan-400">{currentConfig.couple_names_y || 13.5}%</span>
                                                        </div>
                                                        <input
                                                            type="range"
                                                            min="5"
                                                            max="40"
                                                            step="0.5"
                                                            value={currentConfig.couple_names_y || 13.5}
                                                            onChange={(e) => updateDirectConfig('couple_names_y', parseFloat(e.target.value))}
                                                            className="w-full h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                                                        />
                                                    </div>
                                                    <div>
                                                        <InputLabel value="Text Color" />
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <input
                                                                type="color"
                                                                value={currentConfig.couple_names_color || '#FFFFFF'}
                                                                onChange={(e) => updateDirectConfig('couple_names_color', e.target.value)}
                                                                className="w-8 h-8 rounded-xl border border-slate-300 dark:border-white/[0.08] cursor-pointer"
                                                            />
                                                            <TextInput
                                                                className="block w-full text-[11px] font-mono uppercase"
                                                                value={currentConfig.couple_names_color || '#FFFFFF'}
                                                                onChange={(e) => updateDirectConfig('couple_names_color', e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 2. Subtitle / Invitation Prefix */}
                                            <div className="p-4 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-3">
                                                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                                    Subtitle / Invitation Prefix
                                                </div>
                                                <TextInput
                                                    className="block w-full text-xs font-medium"
                                                    value={currentConfig.subtitle_text || ''}
                                                    onChange={(e) => updateDirectConfig('subtitle_text', e.target.value)}
                                                    placeholder="e.g. We invite your pleasure to come to our Engagement Party of"
                                                />
                                                <div className="grid grid-cols-2 gap-3 pt-1">
                                                    <div>
                                                        <div className="flex justify-between text-[10.5px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                                                            <span>Font Size</span>
                                                            <span className="font-mono text-cyan-600 dark:text-cyan-400">{currentConfig.subtitle_size || 9.5}px</span>
                                                        </div>
                                                        <input
                                                            type="range"
                                                            min="7"
                                                            max="18"
                                                            step="0.5"
                                                            value={currentConfig.subtitle_size || 9.5}
                                                            onChange={(e) => updateDirectConfig('subtitle_size', parseFloat(e.target.value))}
                                                            className="w-full h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                                                        />
                                                    </div>
                                                    <div>
                                                        <InputLabel value="Subtitle Color" />
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <input
                                                                type="color"
                                                                value={currentConfig.subtitle_color || '#FFFFFF'}
                                                                onChange={(e) => updateDirectConfig('subtitle_color', e.target.value)}
                                                                className="w-8 h-8 rounded-xl border border-slate-300 dark:border-white/[0.08] cursor-pointer"
                                                            />
                                                            <TextInput
                                                                className="block w-full text-[11px] font-mono uppercase"
                                                                value={currentConfig.subtitle_color || '#FFFFFF'}
                                                                onChange={(e) => updateDirectConfig('subtitle_color', e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 3. Date & Schedule Lockup */}
                                            <div className="p-4 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-3">
                                                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                                    Date &amp; Schedule Lockup
                                                </div>
                                                <div className="grid grid-cols-3 gap-2">
                                                    <div>
                                                        <InputLabel value="Month" />
                                                        <TextInput
                                                            className="block w-full text-xs font-mono font-bold uppercase"
                                                            value={currentConfig.date_month || ''}
                                                            onChange={(e) => updateDirectConfig('date_month', e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <InputLabel value="Day Name" />
                                                        <TextInput
                                                            className="block w-full text-xs font-mono font-bold uppercase"
                                                            value={currentConfig.date_day_name || ''}
                                                            onChange={(e) => updateDirectConfig('date_day_name', e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <InputLabel value="Day Number" />
                                                        <TextInput
                                                            className="block w-full text-xs font-mono font-bold text-center"
                                                            value={currentConfig.date_day_num || ''}
                                                            onChange={(e) => updateDirectConfig('date_day_num', e.target.value)}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <InputLabel value="Time" />
                                                        <TextInput
                                                            className="block w-full text-xs font-mono font-bold"
                                                            value={currentConfig.date_time || ''}
                                                            onChange={(e) => updateDirectConfig('date_time', e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <InputLabel value="Year" />
                                                        <TextInput
                                                            className="block w-full text-xs font-mono font-bold"
                                                            value={currentConfig.date_year || ''}
                                                            onChange={(e) => updateDirectConfig('date_year', e.target.value)}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-200/80 dark:border-white/[0.08]">
                                                    <div>
                                                        <div className="flex justify-between text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                                                            <span>Date Size</span>
                                                            <span className="font-mono text-cyan-600 dark:text-cyan-400">{currentConfig.date_size || 10.5}px</span>
                                                        </div>
                                                        <input
                                                            type="range"
                                                            min="8"
                                                            max="22"
                                                            step="0.5"
                                                            value={currentConfig.date_size || 10.5}
                                                            onChange={(e) => updateDirectConfig('date_size', parseFloat(e.target.value))}
                                                            className="w-full h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="flex justify-between text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                                                            <span>Position Y%</span>
                                                            <span className="font-mono text-cyan-600 dark:text-cyan-400">{currentConfig.date_y || 51.5}%</span>
                                                        </div>
                                                        <input
                                                            type="range"
                                                            min="25"
                                                            max="75"
                                                            step="0.5"
                                                            value={currentConfig.date_y || 51.5}
                                                            onChange={(e) => updateDirectConfig('date_y', parseFloat(e.target.value))}
                                                            className="w-full h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                                                        />
                                                    </div>
                                                    <div>
                                                        <InputLabel value="Date Color" />
                                                        <div className="flex items-center gap-1.5 mt-0.5">
                                                            <input
                                                                type="color"
                                                                value={currentConfig.date_color || '#FFFFFF'}
                                                                onChange={(e) => updateDirectConfig('date_color', e.target.value)}
                                                                className="w-7 h-7 rounded-xl border border-slate-300 dark:border-white/[0.08] cursor-pointer"
                                                            />
                                                            <TextInput
                                                                className="block w-full text-[10.5px] font-mono uppercase"
                                                                value={currentConfig.date_color || '#FFFFFF'}
                                                                onChange={(e) => updateDirectConfig('date_color', e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <InputLabel value="Day # Accent" />
                                                        <div className="flex items-center gap-1.5 mt-0.5">
                                                            <input
                                                                type="color"
                                                                value={currentConfig.date_num_color || '#FDE68A'}
                                                                onChange={(e) => updateDirectConfig('date_num_color', e.target.value)}
                                                                className="w-7 h-7 rounded-xl border border-slate-300 dark:border-white/[0.08] cursor-pointer"
                                                            />
                                                            <TextInput
                                                                className="block w-full text-[10.5px] font-mono uppercase"
                                                                value={currentConfig.date_num_color || '#FDE68A'}
                                                                onChange={(e) => updateDirectConfig('date_num_color', e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 4. Invitation Quote / Tagline */}
                                            <div className="p-4 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-3">
                                                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                                    Invitation Quote / Tagline
                                                </div>
                                                <textarea
                                                    rows={2}
                                                    className="block w-full border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white rounded-xl text-xs focus:border-cyan-500 focus:ring-cyan-500 p-2.5 uppercase font-medium"
                                                    value={currentConfig.invitation_quote || ''}
                                                    onChange={(e) => updateDirectConfig('invitation_quote', e.target.value)}
                                                />
                                                <div className="grid grid-cols-2 gap-3 pt-1">
                                                    <div>
                                                        <div className="flex justify-between text-[10.5px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                                                            <span>Quote Font Size</span>
                                                            <span className="font-mono text-cyan-600 dark:text-cyan-400">{currentConfig.quote_size || 8.5}px</span>
                                                        </div>
                                                        <input
                                                            type="range"
                                                            min="6"
                                                            max="16"
                                                            step="0.5"
                                                            value={currentConfig.quote_size || 8.5}
                                                            onChange={(e) => updateDirectConfig('quote_size', parseFloat(e.target.value))}
                                                            className="w-full h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                                                        />
                                                    </div>
                                                    <div>
                                                        <InputLabel value="Quote Color" />
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <input
                                                                type="color"
                                                                value={currentConfig.quote_color || '#FFFFFF'}
                                                                onChange={(e) => updateDirectConfig('quote_color', e.target.value)}
                                                                className="w-8 h-8 rounded-xl border border-slate-300 dark:border-white/[0.08] cursor-pointer"
                                                            />
                                                            <TextInput
                                                                className="block w-full text-[11px] font-mono uppercase"
                                                                value={currentConfig.quote_color || '#FFFFFF'}
                                                                onChange={(e) => updateDirectConfig('quote_color', e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 5. Venue Details */}
                                            <div className="p-4 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-3">
                                                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                                    Venue &amp; Location Details
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <InputLabel value="Venue Name" />
                                                        <TextInput
                                                            className="block w-full text-xs font-bold uppercase"
                                                            value={currentConfig.venue_name || ''}
                                                            onChange={(e) => updateDirectConfig('venue_name', e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <InputLabel value="Location Subtitle" />
                                                        <TextInput
                                                            className="block w-full text-xs"
                                                            value={currentConfig.venue_sub || ''}
                                                            onChange={(e) => updateDirectConfig('venue_sub', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <InputLabel value="Venue Date" />
                                                        <TextInput
                                                            className="block w-full text-xs font-mono"
                                                            value={currentConfig.venue_date || ''}
                                                            onChange={(e) => updateDirectConfig('venue_date', e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <InputLabel value="Save The Date Label" />
                                                        <TextInput
                                                            className="block w-full text-xs font-bold uppercase"
                                                            value={currentConfig.save_the_date || ''}
                                                            onChange={(e) => updateDirectConfig('save_the_date', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        /* ─── B. SIGNATURE PASS ADJUSTABLE ELEMENTS ─── */
                                        <div className="space-y-5">
                                            {/* 1. Headline Banner Typography */}
                                            <div className="p-4 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-3">
                                                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                                    Headline Banner
                                                </div>
                                                <TextInput
                                                    className="block w-full text-xs font-bold uppercase"
                                                    value={currentConfig.headline_text || form.data.headline || ''}
                                                    onChange={(e) => {
                                                        form.setData('headline', e.target.value);
                                                        updateDirectConfig('headline_text', e.target.value);
                                                    }}
                                                    placeholder="e.g. EXCLUSIVE INVITATION PASS"
                                                />
                                                <div className="grid grid-cols-3 gap-3 pt-1">
                                                    <div>
                                                        <div className="flex justify-between text-[10.5px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                                                            <span>Font Size</span>
                                                            <span className="font-mono text-cyan-600 dark:text-cyan-400">{currentConfig.headline_size || 11.5}px</span>
                                                        </div>
                                                        <input
                                                            type="range"
                                                            min="8"
                                                            max="22"
                                                            step="0.5"
                                                            value={currentConfig.headline_size || 11.5}
                                                            onChange={(e) => updateDirectConfig('headline_size', parseFloat(e.target.value))}
                                                            className="w-full h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                                                        />
                                                    </div>
                                                    <div>
                                                        <InputLabel value="Letter Spacing" />
                                                        <TextInput
                                                            className="block w-full text-xs font-mono mt-0.5"
                                                            value={currentConfig.headline_spacing || '0.22em'}
                                                            onChange={(e) => updateDirectConfig('headline_spacing', e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <InputLabel value="Headline Color" />
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <input
                                                                type="color"
                                                                value={currentConfig.headline_color || form.data.brand_color_to || '#0070BA'}
                                                                onChange={(e) => updateDirectConfig('headline_color', e.target.value)}
                                                                className="w-8 h-8 rounded-xl border border-slate-300 dark:border-white/[0.08] cursor-pointer"
                                                            />
                                                            <TextInput
                                                                className="block w-full text-[11px] font-mono uppercase"
                                                                value={currentConfig.headline_color || form.data.brand_color_to || '#0070BA'}
                                                                onChange={(e) => updateDirectConfig('headline_color', e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 2. Event Title Typography */}
                                            <div className="p-4 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-3">
                                                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                                    Event Title Typography
                                                </div>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                    <div>
                                                        <div className="flex justify-between text-[10.5px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                                                            <span>Font Size</span>
                                                            <span className="font-mono text-cyan-600 dark:text-cyan-400">{currentConfig.event_title_size || 21}px</span>
                                                        </div>
                                                        <input
                                                            type="range"
                                                            min="14"
                                                            max="36"
                                                            step="1"
                                                            value={currentConfig.event_title_size || 21}
                                                            onChange={(e) => updateDirectConfig('event_title_size', parseFloat(e.target.value))}
                                                            className="w-full h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                                                        />
                                                    </div>
                                                    <div>
                                                        <InputLabel value="Font Family" />
                                                        <select
                                                            value={currentConfig.event_title_font || 'system-ui, -apple-system, sans-serif'}
                                                            onChange={(e) => updateDirectConfig('event_title_font', e.target.value)}
                                                            className="block w-full border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white rounded-xl text-xs p-2 mt-0.5"
                                                        >
                                                            <option value="system-ui, -apple-system, sans-serif">Modern Sans-Serif</option>
                                                            <option value="Georgia, 'Playfair Display', serif">Luxury Serif</option>
                                                            <option value="ui-monospace, SFMono-Regular, monospace">Monospace</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <InputLabel value="Title Color" />
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <input
                                                                type="color"
                                                                value={currentConfig.event_title_color || '#0F172A'}
                                                                onChange={(e) => updateDirectConfig('event_title_color', e.target.value)}
                                                                className="w-8 h-8 rounded-xl border border-slate-300 dark:border-white/[0.08] cursor-pointer"
                                                            />
                                                            <TextInput
                                                                className="block w-full text-[11px] font-mono uppercase"
                                                                value={currentConfig.event_title_color || '#0F172A'}
                                                                onChange={(e) => updateDirectConfig('event_title_color', e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 3. Schedule & Venue Cards Section */}
                                            <div className="p-4 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-3">
                                                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                                    Schedule &amp; Venue Labels
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <InputLabel value="Schedule Card Label" />
                                                        <TextInput
                                                            className="block w-full text-xs font-bold uppercase mt-0.5"
                                                            value={currentConfig.schedule_label_text || 'SCHEDULE'}
                                                            onChange={(e) => updateDirectConfig('schedule_label_text', e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <InputLabel value="Venue Card Label" />
                                                        <TextInput
                                                            className="block w-full text-xs font-bold uppercase mt-0.5"
                                                            value={currentConfig.venue_label_text || 'VENUE LOCATION'}
                                                            onChange={(e) => updateDirectConfig('venue_label_text', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 4. Guest Plaque Header & Security Footer */}
                                            <div className="p-4 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-3">
                                                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                                    Guest Plaque Header &amp; Footer Copy
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <div>
                                                        <InputLabel value="Plaque Header Label" />
                                                        <TextInput
                                                            className="block w-full text-xs font-bold uppercase mt-0.5"
                                                            value={currentConfig.plaque_header_text || 'INVITATION PASS ISSUED TO'}
                                                            onChange={(e) => updateDirectConfig('plaque_header_text', e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <InputLabel value="Pass Footer Security Text" />
                                                        <TextInput
                                                            className="block w-full text-xs font-mono mt-0.5"
                                                            value={currentConfig.footer_text || form.data.footer_text || 'Secured & verified by KARDOVO'}
                                                            onChange={(e) => {
                                                                form.setData('footer_text', e.target.value);
                                                                updateDirectConfig('footer_text', e.target.value);
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* TAB: ARTWORK & PHOTO */}
                            {inspectorTab === 'artwork' && isCustomArt && (
                                <div className="space-y-4 animate-fadeIn">
                                    <div className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                                        <ImageIcon className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                                        <span>Custom 4K Artwork Asset</span>
                                    </div>

                                    <div className="p-4 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-slate-200 dark:border-white/[0.08] flex items-center gap-4">
                                        <div className="w-20 h-28 rounded-xl overflow-hidden bg-slate-900 border border-slate-300 dark:border-white/[0.08] flex-shrink-0">
                                            <img src={currentTpl.image_path} alt="Template" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="text-xs font-bold text-slate-900 dark:text-white">Active Artwork Asset</div>
                                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate max-w-xs">{currentTpl.image_path}</div>
                                            <button
                                                type="button"
                                                onClick={() => setUploadModalOpen(true)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.1] transition"
                                            >
                                                <Upload className="w-3.5 h-3.5" />
                                                <span>Replace Artwork</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB: GUEST PLAQUE COORDINATES */}
                            {inspectorTab === 'plaque' && (
                                <div className="space-y-4 animate-fadeIn">
                                    <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-white/[0.08]">
                                        <div className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                                            <Move className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                                            <span>Guest Name Geometry &amp; Typography</span>
                                        </div>
                                    </div>

                                    {isCustomArt && (
                                        <div className="p-3.5 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between">
                                            <div>
                                                <div className="text-xs font-bold text-slate-900 dark:text-white">Clean Text Style (No Box)</div>
                                                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                                    Render guest name directly onto artwork with crisp, pure typography (zero shadow or box).
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                                                <input
                                                    type="checkbox"
                                                    checked={Boolean(nameCfg.hide_plaque_box)}
                                                    onChange={(e) => updateNestedConfig('guest_name', 'hide_plaque_box', e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-cyan-600" />
                                            </label>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                                                <span>Vertical Offset (Y%)</span>
                                                <span className="font-mono text-cyan-600 dark:text-cyan-400">{nameCfg.y ?? 71.5}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                step="0.5"
                                                value={nameCfg.y ?? 71.5}
                                                onChange={(e) => updateNestedConfig('guest_name', 'y', parseFloat(e.target.value))}
                                                className="w-full h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                                            />
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                                                <span>Horizontal Offset (X%)</span>
                                                <span className="font-mono text-cyan-600 dark:text-cyan-400">{nameCfg.x ?? 50}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                step="0.5"
                                                value={nameCfg.x ?? 50}
                                                onChange={(e) => updateNestedConfig('guest_name', 'x', parseFloat(e.target.value))}
                                                className="w-full h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                                                <span>Font Size (min 6px)</span>
                                                <div className="flex items-center gap-1">
                                                    <input
                                                        type="number"
                                                        min="6"
                                                        max="120"
                                                        step="0.5"
                                                        value={nameCfg.fontSize ?? 22}
                                                        onChange={(e) => updateNestedConfig('guest_name', 'fontSize', Math.max(6, parseFloat(e.target.value) || 6))}
                                                        className="w-14 text-center py-0.5 px-1 text-[11px] font-mono font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/[0.08] rounded-md text-cyan-600 dark:text-cyan-400"
                                                    />
                                                    <span className="text-[10px] text-slate-400">px</span>
                                                </div>
                                            </div>
                                            <input
                                                type="range"
                                                min="6"
                                                max="72"
                                                step="0.5"
                                                value={nameCfg.fontSize ?? 22}
                                                onChange={(e) => updateNestedConfig('guest_name', 'fontSize', parseFloat(e.target.value))}
                                                className="w-full h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                                            />
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                                                <span>Plaque Box Width (%)</span>
                                                <span className="font-mono text-cyan-600 dark:text-cyan-400">{nameCfg.plaqueWidth ?? 84}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="20"
                                                max="100"
                                                step="1"
                                                disabled={Boolean(nameCfg.hide_plaque_box)}
                                                value={nameCfg.plaqueWidth ?? 84}
                                                onChange={(e) => updateNestedConfig('guest_name', 'plaqueWidth', parseFloat(e.target.value))}
                                                className="w-full h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-600 disabled:opacity-30"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <InputLabel value="Font Family" />
                                            <select
                                                className="block w-full border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white rounded-xl text-xs font-bold py-2 mt-0.5"
                                                value={nameCfg.fontFamily || 'Georgia, serif'}
                                                onChange={(e) => updateNestedConfig('guest_name', 'fontFamily', e.target.value)}
                                            >
                                                <option value="Georgia, serif">Georgia (Classic Serif)</option>
                                                <option value="'Playfair Display', serif">Playfair Display (Luxury)</option>
                                                <option value="'Cinzel', serif">Cinzel (Regal Roman)</option>
                                                <option value="system-ui, sans-serif">Modern Sans-Serif</option>
                                                <option value="'Great Vibes', cursive">Great Vibes (Calligraphy)</option>
                                                <option value="ui-monospace, monospace">Monospace</option>
                                            </select>
                                        </div>

                                        <div>
                                            <InputLabel value="Name Text Color" />
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <input
                                                    type="color"
                                                    value={nameCfg.color || '#FFFFFF'}
                                                    onChange={(e) => updateNestedConfig('guest_name', 'color', e.target.value)}
                                                    className="w-8 h-8 rounded-xl border border-slate-300 dark:border-white/[0.08] cursor-pointer flex-shrink-0"
                                                />
                                                <TextInput
                                                    className="block w-full text-xs font-mono uppercase font-bold"
                                                    value={nameCfg.color || '#FFFFFF'}
                                                    onChange={(e) => updateNestedConfig('guest_name', 'color', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB: INVITATION CATEGORY (FOR CUSTOM UPLOADED ARTWORK) */}
                            {(inspectorTab === 'category' || (inspectorTab === 'badge' && isUploadedCustomArt)) && (
                                <div className="space-y-4 animate-fadeIn">
                                    <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-white/[0.08]">
                                        <div className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                                            <ShieldCheck className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                                            <span>Invitation Category Badge &amp; Typography</span>
                                        </div>
                                    </div>

                                    {/* Clean Text Style (No Box / Pill) */}
                                    <div className="p-3.5 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between">
                                        <div>
                                            <div className="text-xs font-bold text-slate-900 dark:text-white">Clean Text Style (No Box / Pill)</div>
                                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                                Render category text directly onto artwork with zero shadow, box, or background pill.
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                                            <input
                                                type="checkbox"
                                                checked={Boolean(allowanceCfg.hide_badge_box)}
                                                onChange={(e) => updateNestedConfig('allowance_badge', 'hide_badge_box', e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-cyan-600" />
                                        </label>
                                    </div>

                                    {/* Vertical & Horizontal Coordinates */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                                                <span>Vertical Offset (Y%)</span>
                                                <span className="font-mono text-cyan-600 dark:text-cyan-400">{allowanceCfg.y ?? 78.5}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                step="0.5"
                                                value={allowanceCfg.y ?? 78.5}
                                                onChange={(e) => updateNestedConfig('allowance_badge', 'y', parseFloat(e.target.value))}
                                                className="w-full h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                                            />
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                                                <span>Horizontal Offset (X%)</span>
                                                <span className="font-mono text-cyan-600 dark:text-cyan-400">{allowanceCfg.x ?? 50}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                step="0.5"
                                                value={allowanceCfg.x ?? 50}
                                                onChange={(e) => updateNestedConfig('allowance_badge', 'x', parseFloat(e.target.value))}
                                                className="w-full h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                                            />
                                        </div>
                                    </div>

                                    {/* Font Size & Pill Width */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                                                <span>Font Size (min 6px)</span>
                                                <div className="flex items-center gap-1">
                                                    <input
                                                        type="number"
                                                        min="6"
                                                        max="90"
                                                        step="0.5"
                                                        value={allowanceCfg.fontSize ?? 10}
                                                        onChange={(e) => updateNestedConfig('allowance_badge', 'fontSize', Math.max(6, parseFloat(e.target.value) || 6))}
                                                        className="w-14 text-center py-0.5 px-1 text-[11px] font-mono font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/[0.08] rounded-md text-cyan-600 dark:text-cyan-400"
                                                    />
                                                    <span className="text-[10px] text-slate-400">px</span>
                                                </div>
                                            </div>
                                            <input
                                                type="range"
                                                min="6"
                                                max="60"
                                                step="0.5"
                                                value={allowanceCfg.fontSize ?? 10}
                                                onChange={(e) => updateNestedConfig('allowance_badge', 'fontSize', parseFloat(e.target.value))}
                                                className="w-full h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                                            />
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                                                <span>Pill Box Width (%)</span>
                                                <span className="font-mono text-cyan-600 dark:text-cyan-400">{allowanceCfg.plaqueWidth ?? 84}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="20"
                                                max="100"
                                                step="1"
                                                disabled={Boolean(allowanceCfg.hide_badge_box)}
                                                value={allowanceCfg.plaqueWidth ?? 84}
                                                onChange={(e) => updateNestedConfig('allowance_badge', 'plaqueWidth', parseFloat(e.target.value))}
                                                className="w-full h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-600 disabled:opacity-30"
                                            />
                                        </div>
                                    </div>

                                    {/* Typography & Color */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <InputLabel value="Font Family" />
                                            <select
                                                className="block w-full border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white rounded-xl text-xs font-bold py-2 mt-0.5"
                                                value={allowanceCfg.fontFamily || 'sans-serif'}
                                                onChange={(e) => updateNestedConfig('allowance_badge', 'fontFamily', e.target.value)}
                                            >
                                                <option value="system-ui, sans-serif">Modern Sans-Serif</option>
                                                <option value="Georgia, serif">Georgia (Classic Serif)</option>
                                                <option value="'Playfair Display', serif">Playfair Display (Luxury)</option>
                                                <option value="'Cinzel', serif">Cinzel (Regal Roman)</option>
                                                <option value="'Great Vibes', cursive">Great Vibes (Calligraphy)</option>
                                                <option value="ui-monospace, monospace">Monospace</option>
                                            </select>
                                        </div>

                                        <div>
                                            <InputLabel value="Category Text Color" />
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <input
                                                    type="color"
                                                    value={allowanceCfg.color || '#FDE68A'}
                                                    onChange={(e) => updateNestedConfig('allowance_badge', 'color', e.target.value)}
                                                    className="w-8 h-8 rounded-xl border border-slate-300 dark:border-white/[0.08] cursor-pointer flex-shrink-0"
                                                />
                                                <TextInput
                                                    className="block w-full text-xs font-mono uppercase font-bold"
                                                    value={allowanceCfg.color || '#FDE68A'}
                                                    onChange={(e) => updateNestedConfig('allowance_badge', 'color', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Visibility Toggle */}
                                    <div className="pt-2 border-t border-slate-100 dark:border-white/[0.08]">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={currentConfig.show_allowance_badge !== false}
                                                onChange={(e) => updateDirectConfig('show_allowance_badge', e.target.checked)}
                                                className="rounded text-cyan-600 focus:ring-cyan-500"
                                            />
                                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                                Display Invitation Category Badge on Pass
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* TAB: QR CODE POSITION & DIMENSIONS */}
                            {inspectorTab === 'qr' && (
                                <div className="space-y-4 animate-fadeIn">
                                    <div className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                                        <QrCode className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                                        <span>QR Pass Verification Block Geometry</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                                                <span>Vertical Offset (Y%)</span>
                                                <span className="font-mono text-cyan-600 dark:text-cyan-400">{qrCfg.y}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                step="0.5"
                                                value={qrCfg.y}
                                                onChange={(e) => updateNestedConfig('qr_code', 'y', parseFloat(e.target.value))}
                                                className="w-full h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                                            />
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                                                <span>Horizontal Offset (X%)</span>
                                                <span className="font-mono text-cyan-600 dark:text-cyan-400">{qrCfg.x ?? 50}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                step="0.5"
                                                value={qrCfg.x ?? 50}
                                                onChange={(e) => updateNestedConfig('qr_code', 'x', parseFloat(e.target.value))}
                                                className="w-full h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                                                <span>QR Code Size (min 20px)</span>
                                                <div className="flex items-center gap-1">
                                                    <input
                                                        type="number"
                                                        min="20"
                                                        max="300"
                                                        step="1"
                                                        value={Math.max(20, parseFloat(qrCfg.size) || 72)}
                                                        onChange={(e) => updateNestedConfig('qr_code', 'size', Math.max(20, parseFloat(e.target.value) || 20))}
                                                        className="w-14 text-center py-0.5 px-1 text-[11px] font-mono font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/[0.08] rounded-md text-cyan-600 dark:text-cyan-400"
                                                    />
                                                    <span className="text-[10px] text-slate-400">px</span>
                                                </div>
                                            </div>
                                            <input
                                                type="range"
                                                min="20"
                                                max="240"
                                                step="1"
                                                value={Math.max(20, parseFloat(qrCfg.size) || 72)}
                                                onChange={(e) => updateNestedConfig('qr_code', 'size', parseFloat(e.target.value))}
                                                className="w-full h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                                            />
                                        </div>

                                        <div>
                                            <InputLabel value="QR Dark Module Color" />
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <input
                                                    type="color"
                                                    value={qrCfg.darkColor || '#111827'}
                                                    onChange={(e) => updateNestedConfig('qr_code', 'darkColor', e.target.value)}
                                                    className="w-8 h-8 rounded-xl border border-slate-300 dark:border-white/[0.08] cursor-pointer flex-shrink-0"
                                                />
                                                <TextInput
                                                    className="block w-full text-xs font-mono uppercase font-bold"
                                                    value={qrCfg.darkColor || '#111827'}
                                                    onChange={(e) => updateNestedConfig('qr_code', 'darkColor', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <label className="flex items-center gap-2 cursor-pointer pt-2">
                                        <input
                                            type="checkbox"
                                            checked={form.data.show_qr}
                                            onChange={(e) => form.setData('show_qr', e.target.checked)}
                                            className="rounded text-cyan-600 focus:ring-cyan-500"
                                        />
                                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                            Display Scannable QR Code on Invitation Pass
                                        </span>
                                    </label>
                                </div>
                            )}

                            {/* TAB: CATEGORY BADGE */}
                            {(inspectorTab === 'badge' && !isUploadedCustomArt) && (
                                <div className="space-y-4 animate-fadeIn">
                                    <div className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                                        <ShieldCheck className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                                        <span>Security Badge Placement</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                                                <span>Vertical Offset (Y%)</span>
                                                <span className="font-mono text-cyan-600 dark:text-cyan-400">{badgeCfg.y}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="2"
                                                max="30"
                                                step="0.5"
                                                value={badgeCfg.y}
                                                onChange={(e) => updateNestedConfig('category_badge', 'y', parseFloat(e.target.value))}
                                                className="w-full h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                                            />
                                        </div>

                                        <div>
                                            <InputLabel value="Badge Color" />
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={badgeCfg.color || '#00A3FF'}
                                                    onChange={(e) => updateNestedConfig('category_badge', 'color', e.target.value)}
                                                    className="w-8 h-8 rounded-lg border border-slate-300 dark:border-white/[0.08] cursor-pointer"
                                                />
                                                <TextInput
                                                    className="block w-full text-xs font-mono uppercase"
                                                    value={badgeCfg.color || '#00A3FF'}
                                                    onChange={(e) => updateNestedConfig('category_badge', 'color', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <label className="flex items-center gap-2 cursor-pointer pt-2">
                                        <input
                                            type="checkbox"
                                            checked={form.data.show_category_badge}
                                            onChange={(e) => form.setData('show_category_badge', e.target.checked)}
                                            className="rounded text-cyan-600 focus:ring-cyan-500"
                                        />
                                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                            Display Verified Security Badge Header
                                        </span>
                                    </label>
                                </div>
                            )}

                            {/* TAB: BACKGROUND & GRADIENT PALETTE (For Signature / Gradient passes) */}
                            {inspectorTab === 'palette' && !isCustomArt && (
                                <div className="space-y-5 animate-fadeIn">
                                    <div className="flex items-center justify-between">
                                        <div className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                                            <Layers className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                                            <span>Pass Background Engine</span>
                                        </div>
                                        <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                                            Live Canvas Sync
                                        </span>
                                    </div>

                                    {/* 1. Background Style Mode Switcher */}
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                                            Base Background Style
                                        </label>
                                        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-white/[0.05] rounded-2xl border border-slate-200 dark:border-white/[0.08]">
                                            {[
                                                { id: 'solid', label: 'Plain Solid', icon: Sparkles },
                                                { id: 'gradient', label: 'Gradient Mesh', icon: Palette },
                                                { id: 'image', label: 'Imported BG', icon: ImageIcon },
                                            ].map((mode) => {
                                                const IconComponent = mode.icon;
                                                const isCurrent = (form.data.elements_config?.bg_mode || 'gradient') === mode.id;
                                                return (
                                                    <button
                                                        key={mode.id}
                                                        type="button"
                                                        onClick={() => updateDirectConfig('bg_mode', mode.id)}
                                                        className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95 ${
                                                            isCurrent
                                                                ? 'bg-white dark:bg-[#0B1524] text-cyan-700 dark:text-cyan-300 shadow-sm border border-slate-200 dark:border-white/[0.08]'
                                                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                                        }`}
                                                    >
                                                        <IconComponent className="w-3.5 h-3.5" />
                                                        <span className="truncate">{mode.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* ── MODE 1: PLAIN SOLID BACKGROUND ── */}
                                    {(form.data.elements_config?.bg_mode === 'solid') && (
                                        <div className="space-y-4 pt-1 animate-fadeIn">
                                            <div>
                                                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                                                    Executive Solid Aesthetic Presets
                                                </label>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                    {[
                                                        { label: 'Porcelain Pearl', hex: '#FFFFFF', badge: '#0070BA' },
                                                        { label: 'Ivory Champagne', hex: '#FAF9F5', badge: '#B45309' },
                                                        { label: 'Obsidian Onyx', hex: '#070D18', badge: '#00A3FF' },
                                                        { label: 'Executive Navy', hex: '#0A1628', badge: '#38BDF8' },
                                                        { label: 'Emerald Noir', hex: '#041D14', badge: '#10B981' },
                                                        { label: 'Royal Bordeaux', hex: '#1A050A', badge: '#FB7185' },
                                                        { label: 'Platinum Slate', hex: '#F1F5F9', badge: '#2563EB' },
                                                        { label: 'Velvet Midnight', hex: '#0B0F19', badge: '#A855F7' },
                                                    ].map((preset) => (
                                                        <button
                                                            key={preset.label}
                                                            type="button"
                                                            onClick={() => {
                                                                form.setData({
                                                                    ...form.data,
                                                                    brand_color_from: preset.hex,
                                                                    brand_color_to: preset.badge,
                                                                    elements_config: {
                                                                        ...form.data.elements_config,
                                                                        bg_solid_color: preset.hex,
                                                                        category_badge: {
                                                                            ...(form.data.elements_config?.category_badge || {}),
                                                                            color: preset.badge
                                                                        }
                                                                    }
                                                                });
                                                            }}
                                                            className="p-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] hover:border-cyan-500 text-left transition flex items-center gap-2.5 group active:scale-95 shadow-2xs"
                                                        >
                                                            <div 
                                                                className="w-5 h-5 rounded-full border border-black/15 shadow-xs flex-shrink-0 flex items-center justify-center"
                                                                style={{ backgroundColor: preset.hex }}
                                                            >
                                                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: preset.badge }} />
                                                            </div>
                                                            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-cyan-600">
                                                                {preset.label}
                                                            </span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="pt-2 border-t border-slate-100 dark:border-white/[0.08]">
                                                <InputLabel value="Custom Solid Background Color" />
                                                <div className="flex items-center gap-2 mt-1">
                                                    <input
                                                        type="color"
                                                        value={form.data.elements_config?.bg_solid_color || '#FFFFFF'}
                                                        onChange={(e) => updateDirectConfig('bg_solid_color', e.target.value)}
                                                        className="w-9 h-9 rounded-xl border border-slate-300 dark:border-white/[0.08] cursor-pointer"
                                                    />
                                                    <TextInput
                                                        className="block w-full text-xs font-mono uppercase font-bold"
                                                        value={form.data.elements_config?.bg_solid_color || '#FFFFFF'}
                                                        onChange={(e) => updateDirectConfig('bg_solid_color', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* ── MODE 2: LUXURY GRADIENT MESH ── */}
                                    {((form.data.elements_config?.bg_mode || 'gradient') === 'gradient') && (
                                        <div className="space-y-4 pt-1 animate-fadeIn">
                                            <div>
                                                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                                                    Curated Luxury Gradient Mesh Presets
                                                </label>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                    {[
                                                        { label: 'Executive Azure', from: '#FFFFFF', to: '#C7E2FE', badge: '#0070BA' },
                                                        { label: 'Champagne Gold', from: '#FFFDF7', to: '#FDE68A', badge: '#D97706' },
                                                        { label: 'Rose Quartz Frost', from: '#FFF5F6', to: '#FECDD3', badge: '#E11D48' },
                                                        { label: 'Emerald Dew', from: '#F0FDF4', to: '#BBF7D0', badge: '#059669' },
                                                        { label: 'Midnight Cyber', from: '#091524', to: '#0A1C33', badge: '#00A3FF' },
                                                        { label: 'Imperial Amethyst', from: '#170A2C', to: '#0A0312', badge: '#C084FC' },
                                                        { label: 'Onyx Carbon Aurora', from: '#0F172A', to: '#020617', badge: '#38BDF8' },
                                                        { label: 'Nordic Sunset', from: '#FFF7ED', to: '#FED7AA', badge: '#EA580C' },
                                                    ].map((preset) => (
                                                        <button
                                                            key={preset.label}
                                                            type="button"
                                                            onClick={() => {
                                                                form.setData({
                                                                    ...form.data,
                                                                    brand_color_from: preset.from,
                                                                    brand_color_to: preset.to,
                                                                    elements_config: {
                                                                        ...form.data.elements_config,
                                                                        category_badge: {
                                                                            ...(form.data.elements_config?.category_badge || {}),
                                                                            color: preset.badge
                                                                        }
                                                                    }
                                                                });
                                                            }}
                                                            className="p-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] hover:border-cyan-500 dark:hover:border-cyan-400 text-left transition flex items-center gap-2.5 group active:scale-95 shadow-2xs"
                                                        >
                                                            <div 
                                                                className="w-5 h-5 rounded-full border border-black/10 shadow-xs flex-shrink-0"
                                                                style={{ background: `linear-gradient(135deg, ${preset.from} 0%, ${preset.to} 100%)` }}
                                                            />
                                                            <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 truncate">
                                                                {preset.label}
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-white/[0.08]">
                                                <div>
                                                    <InputLabel value="Mesh Base (From Color)" />
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <input
                                                            type="color"
                                                            value={form.data.brand_color_from}
                                                            onChange={(e) => form.setData('brand_color_from', e.target.value)}
                                                            className="w-9 h-9 rounded-xl border border-slate-300 dark:border-white/[0.08] cursor-pointer"
                                                        />
                                                        <TextInput
                                                            className="block w-full text-xs font-mono uppercase font-bold"
                                                            value={form.data.brand_color_from}
                                                            onChange={(e) => form.setData('brand_color_from', e.target.value)}
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <InputLabel value="Mesh Ambient (To Color)" />
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <input
                                                            type="color"
                                                            value={form.data.brand_color_to}
                                                            onChange={(e) => form.setData('brand_color_to', e.target.value)}
                                                            className="w-9 h-9 rounded-xl border border-slate-300 dark:border-white/[0.08] cursor-pointer"
                                                        />
                                                        <TextInput
                                                            className="block w-full text-xs font-mono uppercase font-bold"
                                                            value={form.data.brand_color_to}
                                                            onChange={(e) => form.setData('brand_color_to', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* ── MODE 3: IMPORTED BACKGROUND IMAGE / TEXTURE ── */}
                                    {(form.data.elements_config?.bg_mode === 'image') && (
                                        <div className="space-y-4 pt-1 animate-fadeIn">
                                            {/* File Upload Input */}
                                            <div>
                                                <InputLabel value="Upload Custom Background Art / Texture" />
                                                <div className="mt-1 flex items-center gap-3">
                                                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-kardovo-navy hover:bg-slate-900 text-white text-xs font-bold shadow-sm transition active:scale-95">
                                                        <Upload className="w-3.5 h-3.5 text-cyan-400" />
                                                        <span>Select Image File</span>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={(e) => {
                                                                const file = e.target.files[0];
                                                                if (file) {
                                                                    form.setData('image_file', file);
                                                                    const reader = new FileReader();
                                                                    reader.onload = (ev) => {
                                                                        updateDirectConfig('bg_image', ev.target.result);
                                                                    };
                                                                    reader.readAsDataURL(file);
                                                                }
                                                            }}
                                                        />
                                                    </label>
                                                    {form.data.elements_config?.bg_image && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                form.setData('image_file', null);
                                                                updateDirectConfig('bg_image', null);
                                                            }}
                                                            className="text-xs font-bold text-red-600 hover:text-red-700 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 transition"
                                                        >
                                                            Remove Background
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Curated Luxury Textures */}
                                            <div>
                                                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                                                    Or Choose a Curated Background Texture
                                                </label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {[
                                                        { label: 'Burgundy Velvet', url: '/template_assets/adel_laila_engagement.jpg' },
                                                        { label: 'Gold Art Romance', url: '/template_assets/zamroth_husna_wedding.jpg' },
                                                    ].map((texture) => (
                                                        <button
                                                            key={texture.label}
                                                            type="button"
                                                            onClick={() => updateDirectConfig('bg_image', texture.url)}
                                                            className="p-2 rounded-xl border border-slate-200 dark:border-white/[0.08] hover:border-cyan-500 text-left transition flex items-center gap-2.5 group active:scale-95"
                                                        >
                                                            <img 
                                                                src={texture.url} 
                                                                alt={texture.label} 
                                                                className="w-7 h-7 rounded-lg object-cover border border-black/10 flex-shrink-0"
                                                            />
                                                            <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 group-hover:text-cyan-600 truncate">
                                                                {texture.label}
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Overlay Opacity Slider */}
                                            <div className="pt-2 border-t border-slate-100 dark:border-white/[0.08]">
                                                <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                                                    <span>Backdrop Tint / Darkening Overlay</span>
                                                    <span className="font-mono text-cyan-600 dark:text-cyan-400">
                                                        {Math.round((form.data.elements_config?.bg_overlay_opacity ?? 0.35) * 100)}%
                                                    </span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="0.9"
                                                    step="0.05"
                                                    value={form.data.elements_config?.bg_overlay_opacity ?? 0.35}
                                                    onChange={(e) => updateDirectConfig('bg_overlay_opacity', parseFloat(e.target.value))}
                                                    className="w-full h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* TAB: SECURITY CODE */}
                            {inspectorTab === 'security' && (
                                <div className="space-y-4 animate-fadeIn">
                                    <div className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                                        <span>Gate Verification Code Typography &amp; Placement</span>
                                    </div>

                                    {/* Clean Text (No Shadow) */}
                                    <div className="p-3.5 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between">
                                        <div>
                                            <div className="text-xs font-bold text-slate-900 dark:text-white">Clean Text Style (No Shadow)</div>
                                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                                Render gate code with crisp, flat appearance (zero text shadow).
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                                            <input
                                                type="checkbox"
                                                checked={Boolean(cardNumCfg.hide_shadow)}
                                                onChange={(e) => updateNestedConfig('card_number', 'hide_shadow', e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-cyan-600" />
                                        </label>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                                                <span>Vertical Offset (Y%)</span>
                                                <span className="font-mono text-cyan-600 dark:text-cyan-400">{cardNumCfg.y}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                step="0.5"
                                                value={cardNumCfg.y}
                                                onChange={(e) => updateNestedConfig('card_number', 'y', parseFloat(e.target.value))}
                                                className="w-full h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                                            />
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                                                <span>Horizontal Offset (X%)</span>
                                                <span className="font-mono text-cyan-600 dark:text-cyan-400">{cardNumCfg.x ?? 50}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                step="0.5"
                                                value={cardNumCfg.x ?? 50}
                                                onChange={(e) => updateNestedConfig('card_number', 'x', parseFloat(e.target.value))}
                                                className="w-full h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                                                <span>Font Size (min 6px)</span>
                                                <div className="flex items-center gap-1">
                                                    <input
                                                        type="number"
                                                        min="6"
                                                        max="60"
                                                        step="0.5"
                                                        value={cardNumCfg.fontSize ?? 9.5}
                                                        onChange={(e) => updateNestedConfig('card_number', 'fontSize', Math.max(6, parseFloat(e.target.value) || 6))}
                                                        className="w-14 text-center py-0.5 px-1 text-[11px] font-mono font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/[0.08] rounded-md text-cyan-600 dark:text-cyan-400"
                                                    />
                                                    <span className="text-[10px] text-slate-400">px</span>
                                                </div>
                                            </div>
                                            <input
                                                type="range"
                                                min="6"
                                                max="48"
                                                step="0.5"
                                                value={cardNumCfg.fontSize ?? 9.5}
                                                onChange={(e) => updateNestedConfig('card_number', 'fontSize', parseFloat(e.target.value))}
                                                className="w-full h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                                            />
                                        </div>

                                        <div>
                                            <InputLabel value="Font Family" />
                                            <select
                                                className="block w-full border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white rounded-xl text-xs font-bold py-2 mt-0.5"
                                                value={cardNumCfg.fontFamily || 'ui-monospace, monospace'}
                                                onChange={(e) => updateNestedConfig('card_number', 'fontFamily', e.target.value)}
                                            >
                                                <option value="ui-monospace, monospace">Monospace (Terminal)</option>
                                                <option value="system-ui, sans-serif">Modern Sans-Serif</option>
                                                <option value="Georgia, serif">Georgia (Classic Serif)</option>
                                                <option value="'Cinzel', serif">Cinzel (Roman)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <InputLabel value="Code Text Color" />
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <input
                                                    type="color"
                                                    value={cardNumCfg.color || '#FFFFFF'}
                                                    onChange={(e) => updateNestedConfig('card_number', 'color', e.target.value)}
                                                    className="w-8 h-8 rounded-xl border border-slate-300 dark:border-white/[0.08] cursor-pointer flex-shrink-0"
                                                />
                                                <TextInput
                                                    className="block w-full text-xs font-mono uppercase font-bold"
                                                    value={cardNumCfg.color || '#FFFFFF'}
                                                    onChange={(e) => updateNestedConfig('card_number', 'color', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center pt-5">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={form.data.show_unique_code}
                                                    onChange={(e) => form.setData('show_unique_code', e.target.checked)}
                                                    className="rounded text-cyan-600 focus:ring-cyan-500"
                                                />
                                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                                    Display Gate Code
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}

                                                        </div>

                            {/* Submit & Save Bar (Fixed at bottom of Inspector) */}
                            <div className="p-4 sm:px-6 border-t border-slate-200/60 dark:border-white/[0.08] bg-white/75 dark:bg-[#08121E]/95 backdrop-blur-2xl flex flex-wrap items-center justify-between gap-3 flex-shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
                                {isCurrentCustomOrAdmin ? (
                                    <button
                                        type="button"
                                        onClick={(e) => openDeleteConfirmation(e, currentTpl)}
                                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition cursor-pointer"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span>Delete Custom Template</span>
                                    </button>
                                ) : (
                                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                        Instant 4K canvas vector synchronisation
                                    </div>
                                )}

                                {canCustomize ? (
                                    <PrimaryButton 
                                        disabled={form.processing} 
                                        className="bg-slate-900 hover:bg-slate-800 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white py-2.5 px-5 rounded-xl text-xs font-bold gap-2 shadow-xs transition active:scale-95 ml-auto cursor-pointer"
                                    >
                                        <Save className="w-3.5 h-3.5 text-slate-200 dark:text-white" />
                                        <span>Save Template Configurations</span>
                                    </PrimaryButton>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => alert('4K Card Studio design & artwork customization permissions are locked for your organizer account by platform governance.')}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-white/[0.06] text-slate-500 dark:text-slate-400 font-bold text-xs border border-slate-300 dark:border-white/[0.08] cursor-not-allowed opacity-80 shadow-xs ml-auto"
                                        title="Template Customization Locked"
                                    >
                                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                                        <span>Studio Customization (Locked)</span>
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Right: Live 4K Easel Stage & Test Controls (5 cols, sticky on scroll) */}
                    <div className="lg:col-span-5 flex flex-col items-center space-y-4 lg:sticky lg:top-6 lg:self-start">
                        
                        {/* ── Interactive Test Guest Controls & Live Preview Stage ── */}
                        <div className="w-full bg-white/75 dark:bg-[#0B1524] backdrop-blur-3xl backdrop-saturate-180 p-4 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.03)] dark:shadow-card space-y-3">
                            <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                                <span className="flex items-center gap-2 font-display">
                                    <Sparkles className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                                    <span>Live Pass Preview Stage</span>
                                </span>
                                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-slate-700 dark:text-slate-300 font-medium uppercase bg-white dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.08] px-2.5 py-0.5 rounded-full shadow-2xs">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span>Vector Sync</span>
                                </span>
                            </div>

                            {/* Interactive Test Guest Input */}
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">
                                        Test Guest Name
                                    </label>
                                    <input
                                        type="text"
                                        value={testGuestName}
                                        onChange={(e) => setTestGuestName(e.target.value)}
                                        className="w-full text-xs font-bold border border-slate-200/80 dark:border-white/[0.08] bg-white/70 dark:bg-[#08121E] text-slate-900 dark:text-white rounded-xl py-1.5 px-2.5 focus:ring-1 focus:ring-cyan-500 "
                                        placeholder="Type guest name..."
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">
                                        Test Allowance
                                    </label>
                                    <input
                                        type="text"
                                        value={testAllowance}
                                        onChange={(e) => setTestAllowance(e.target.value)}
                                        className="w-full text-xs font-bold border border-slate-200/80 dark:border-white/[0.08] bg-white/70 dark:bg-[#08121E] text-slate-900 dark:text-white rounded-xl py-1.5 px-2.5 focus:ring-1 focus:ring-cyan-500 "
                                        placeholder="e.g. VIP TABLE 1"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ── 3. Live Rendered Canvas Stage ── */}
                        <div className="w-full flex justify-center py-2 relative">
                            <PersonalisedCard
                                guest={{
                                    name: testGuestName,
                                    allowance_label: testAllowance,
                                    card_number: 'KDV-2026-004821',
                                    unique_code: '29841872',
                                    qr_token: 'kdv_live_sample_pass_token_2026',
                                    category: 'Double Entry'
                                }}
                                event={sampleEvent}
                                template={{
                                    ...form.data,
                                    image_path: currentTpl?.image_path
                                }}
                                interactive={true}
                            />
                        </div>
                    </div>
                </div>

                {/* Upload Custom Artwork Modal */}
                <Modal show={uploadModalOpen} onClose={() => setUploadModalOpen(false)} maxWidth="md">
                    <form noValidate onSubmit={handleUploadSubmit} className="p-6 sm:p-7 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] pb-3">
                            <div className="flex items-center gap-2">
                                <Upload className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                                <h3 className="text-base font-black text-slate-900 dark:text-white font-display">
                                    Import Custom 4K Artwork Asset
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setUploadModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {uploadForm.hasErrors && Object.keys(uploadForm.errors).length > 0 && (
                            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-xs text-rose-700 dark:text-rose-300 space-y-1">
                                <div className="font-bold flex items-center gap-1.5">
                                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                                    <span>Please fix the following issues:</span>
                                </div>
                                <ul className="list-disc list-inside space-y-0.5 text-[11px] pl-1">
                                    {Object.entries(uploadForm.errors).map(([key, err]) => (
                                        <li key={key}>{err}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div>
                            <InputLabel value="Template Style Name *" />
                            <TextInput
                                className="block w-full text-xs font-bold mt-1"
                                value={uploadForm.data.name}
                                onChange={(e) => {
                                    uploadForm.setData('name', e.target.value);
                                    if (uploadForm.errors.name) uploadForm.clearErrors('name');
                                }}
                                placeholder="e.g. Traditional Wedding Gold & Blue"
                            />
                            <InputError message={uploadForm.errors.name} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel value="Select High-Resolution Image (PNG, JPG, WEBP, SVG) *" />
                            <div className="mt-1">
                                <input
                                    type="file"
                                    id="custom-artwork-file-input"
                                    accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0] || null;
                                        uploadForm.setData('image_file', file);
                                        if (uploadForm.errors.image_file) uploadForm.clearErrors('image_file');
                                    }}
                                    className="block w-full text-xs text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-900 hover:file:bg-slate-800 dark:file:bg-cyan-600 dark:hover:file:bg-cyan-500 file:text-white cursor-pointer border border-slate-300 dark:border-white/[0.08] rounded-xl p-1 bg-white dark:bg-[#08121E]"
                                />
                            </div>
                            <InputError message={uploadForm.errors.image_file} className="mt-1" />

                            {uploadForm.data.image_file && (
                                <div className="mt-2.5 p-2 rounded-2xl bg-slate-900 border border-slate-700/80 space-y-2">
                                    <div className="w-full h-36 rounded-xl overflow-hidden bg-black/60 relative flex items-center justify-center">
                                        <img
                                            src={URL.createObjectURL(uploadForm.data.image_file)}
                                            alt="Upload Preview"
                                            className="w-full h-full object-contain"
                                        />
                                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-white text-[9px] font-bold uppercase tracking-wider backdrop-blur-xs border border-white/10">
                                            Artwork Preview Ready
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between px-1 text-[11px] text-slate-300 font-mono">
                                        <span className="truncate max-w-[200px]" title={uploadForm.data.image_file.name}>
                                            📄 {uploadForm.data.image_file.name}
                                        </span>
                                        <span>
                                            {(uploadForm.data.image_file.size / (1024 * 1024)).toFixed(2)} MB
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <InputLabel value="Choose Overlay Preset for this Flyer *" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1.5">
                                <button
                                    type="button"
                                    onClick={() => {
                                        uploadForm.setData({
                                            ...uploadForm.data,
                                            overlay_mode: 'minimal',
                                            show_guest_name: true,
                                            show_qr: true,
                                            show_unique_code: true,
                                            show_headline: false,
                                            show_couple_names: false,
                                            show_date: false,
                                            show_quote: false,
                                            show_venue: false,
                                        });
                                    }}
                                    className={`p-3 rounded-2xl border text-left transition active:scale-95 flex flex-col justify-between cursor-pointer ${
                                        uploadForm.data.overlay_mode !== 'full'
                                            ? 'border-slate-900 dark:border-cyan-400 bg-white dark:bg-white/[0.06] text-slate-900 dark:text-white shadow-xs ring-1 ring-slate-900/15 dark:ring-cyan-400/30'
                                            : 'border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] text-slate-600 dark:text-slate-400'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-xs">Minimal Overlays</span>
                                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.06] border border-slate-200/70 dark:border-white/[0.08] px-2 py-0.5 rounded-full font-mono">Recommended</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                                        Only <strong>Guest Name + QR Code + Security Code</strong>. Ideal for designs with pre-printed event text.
                                    </p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        uploadForm.setData({
                                            ...uploadForm.data,
                                            overlay_mode: 'full',
                                            show_guest_name: true,
                                            show_qr: true,
                                            show_unique_code: true,
                                            show_headline: true,
                                            show_couple_names: true,
                                            show_date: true,
                                            show_quote: true,
                                            show_venue: true,
                                        });
                                    }}
                                    className={`p-3 rounded-2xl border text-left transition active:scale-95 flex flex-col justify-between cursor-pointer ${
                                        uploadForm.data.overlay_mode === 'full'
                                            ? 'border-slate-900 dark:border-cyan-400 bg-white dark:bg-white/[0.06] text-slate-900 dark:text-white shadow-xs ring-1 ring-slate-900/15 dark:ring-cyan-400/30'
                                            : 'border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] text-slate-600 dark:text-slate-400'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-xs">Full Invitation Suite</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                                        Includes Titles, Dates, Quotes, and Venue text on top of decorative background frames.
                                    </p>
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/[0.08]">
                            <SecondaryButton type="button" onClick={() => setUploadModalOpen(false)}>
                                Cancel
                            </SecondaryButton>
                            <PrimaryButton 
                                type="button"
                                onClick={handleUploadSubmit}
                                disabled={isUploadingArtwork || uploadForm.processing} 
                                className="bg-slate-900 hover:bg-slate-800 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white py-2.5 px-4 text-xs font-bold rounded-xl shadow-xs transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                            >
                                {isUploadingArtwork || uploadForm.processing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                                        <span>Importing 4K Artwork...</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-3.5 h-3.5" />
                                        <span>Upload &amp; Create Template</span>
                                    </>
                                )}
                            </PrimaryButton>
                        </div>
                    </form>
                </Modal>

                {/* Delete Confirmation Modal */}
                <Modal show={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} maxWidth="sm">
                    <div className="p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-slate-900 dark:text-white font-display">
                                    Delete Card Template
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    This action cannot be undone.
                                </p>
                            </div>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            Are you sure you want to permanently delete custom template <strong>"{templateToDelete?.name}"</strong>? Any linked events will automatically fallback to the default template.
                        </p>

                        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/[0.08]">
                            <SecondaryButton onClick={() => setDeleteModalOpen(false)}>
                                Cancel
                            </SecondaryButton>
                            <DangerButton onClick={confirmDeleteTemplate} className="py-2 px-4 text-xs font-bold">
                                Delete Permanently
                            </DangerButton>
                        </div>
                    </div>
                </Modal>
            </div>
        </KardovoAppLayout>
    );
}
