import React, { useState, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Printer,
    ArrowLeft,
    Layers,
    QrCode,
    Upload,
    Check,
    X,
    RefreshCw,
    CheckCircle2,
} from 'lucide-react';

export default function PrintWristbandSheet({
    event,
    tiers = [],
    tickets = [],
    selectedTierId = 'all',
    selectedOrderId = null,
    wristbandConfig = null,
}) {
    const [tierFilter, setTierFilter] = useState(selectedTierId);
    const [sourceTab, setSourceTab] = useState(tickets.length === 0 && tiers.length > 0 ? 'bulk' : 'issued');
    const [bulkTierId, setBulkTierId] = useState(tiers[0]?.id ? String(tiers[0].id) : '');
    const [bulkQuantity, setBulkQuantity] = useState(20);
    const [bulkLabel, setBulkLabel] = useState('');
    const [generatingBulk, setGeneratingBulk] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);
    const fileInputRef = useRef(null);

    // Initial Wristband Configuration
    const initialConfig = {
        template_style: wristbandConfig?.template_style || 'festival_pop',
        bg_mode: wristbandConfig?.bg_mode || (wristbandConfig?.custom_artwork_url ? 'custom_upload' : 'preset'),
        custom_artwork_url: wristbandConfig?.custom_artwork_url || '',
        font_style: wristbandConfig?.font_style || 'chunky_festival',
        qr_position: wristbandConfig?.qr_position || 'left',
        custom_title: wristbandConfig?.custom_title || '',
        custom_subtitle: wristbandConfig?.custom_subtitle || '',
        custom_role_label: wristbandConfig?.custom_role_label || '',
        show_serial: wristbandConfig?.show_serial !== false,
        show_arrows: wristbandConfig?.show_arrows !== false,
        accent_color: wristbandConfig?.accent_color || '#154F7C',
    };

    const [config, setConfig] = useState(initialConfig);
    const [filePreview, setFilePreview] = useState(wristbandConfig?.custom_artwork_url || null);
    const [artTab, setArtTab] = useState(wristbandConfig?.template_style === 'custom_graphic' ? 'custom' : 'presets');

    const buildSnapshot = (cfg, file) =>
        JSON.stringify({ cfg, file: file ? `${file.name}-${file.size}-${file.lastModified}` : null });
    const [savedSnapshot, setSavedSnapshot] = useState(() => buildSnapshot(initialConfig, null));
    const isDirty = buildSnapshot(config, uploadFile) !== savedSnapshot;

    const PRESET_THEMES = [
        {
            id: 'festival_pop',
            name: 'Festival Pop',
            subtitle: 'Memphis geometric shapes',
            gradient: 'from-purple-600 via-indigo-600 to-sky-500',
            sampleColor: '#7C3AED',
        },
        {
            id: 'jungle_afro',
            name: 'Jungle & Afrobeat',
            subtitle: 'Warm golden chevrons',
            gradient: 'from-amber-700 via-amber-500 to-yellow-400',
            sampleColor: '#D97706',
        },
        {
            id: 'neon_rave',
            name: 'Neon Rave',
            subtitle: 'Cyber ultraviolet glow',
            gradient: 'from-indigo-950 via-purple-900 to-cyan-500',
            sampleColor: '#4C1D95',
        },
        {
            id: 'summer_sunset',
            name: 'Summer Sunset',
            subtitle: 'Vibrant sunset gradient',
            gradient: 'from-rose-600 via-orange-500 to-amber-400',
            sampleColor: '#E11D48',
        },
        {
            id: 'luxury_gold',
            name: 'VIP Gold',
            subtitle: 'Obsidian & gold ribbons',
            gradient: 'from-zinc-950 via-neutral-900 to-amber-500',
            sampleColor: '#18181B',
        },
        {
            id: 'clean_solid',
            name: 'Classic Tyvek',
            subtitle: 'Tier & brand tone',
            gradient: 'from-sky-800 to-slate-700',
            sampleColor: '#154F7C',
        },
    ];

    const ROLE_CHIPS = ['Tier Name (Auto)', 'VIP', 'Artist', 'Staff', 'Volunteer', 'Custom'];

    const handleTierChange = (e) => {
        const val = e.target.value;
        setTierFilter(val);
        router.get(
            route('events.wristbands.print', event.id),
            { tier_id: val },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleShowAllBands = () => {
        setTierFilter('all');
        router.get(
            route('events.wristbands.print', event.id),
            { tier_id: 'all' },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleGenerateBulkWristbands = (e) => {
        e?.preventDefault();
        if (!bulkTierId || generatingBulk) return;
        setGeneratingBulk(true);
        router.post(
            route('events.tickets.batchGenerate', event.id),
            {
                tier_id: bulkTierId,
                quantity: Number(bulkQuantity) || 20,
                distribution_label: bulkLabel || 'Bulk Wristband Stock',
                redirect_to: 'print_wristbands',
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setGeneratingBulk(false);
                    setSourceTab('issued');
                },
                onError: () => {
                    setGeneratingBulk(false);
                },
            }
        );
    };

    const filteredTickets = tickets.filter((t) => {
        if (tierFilter && tierFilter !== 'all' && String(t.ticket_tier_id || t.tier_id) !== String(tierFilter)) {
            if (t.tier_name && tiers.find((tr) => String(tr.id) === String(tierFilter))?.name !== t.tier_name) {
                return false;
            }
        }
        return true;
    });

    const passesPerPage = 10;
    const totalPages = Math.ceil(filteredTickets.length / passesPerPage) || 1;

    const handlePrint = () => {
        window.print();
    };

    const formatEventDate = (dateVal) => {
        if (!dateVal) return '';
        try {
            const d = new Date(dateVal);
            if (isNaN(d.getTime())) return String(dateVal);
            return d.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            });
        } catch {
            return String(dateVal);
        }
    };

    const formattedDate = formatEventDate(event.event_date);

    // Handle File Upload for Custom Artwork
    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadFile(file);
        const reader = new FileReader();
        reader.onload = (event) => {
            setFilePreview(event.target?.result);
            setConfig((prev) => ({
                ...prev,
                bg_mode: 'custom_upload',
                template_style: 'custom_graphic',
            }));
            setArtTab('custom');
        };
        reader.readAsDataURL(file);
    };

    const handleResetDesign = () => {
        setConfig(initialConfig);
        setUploadFile(null);
        setFilePreview(wristbandConfig?.custom_artwork_url || null);
        setArtTab(wristbandConfig?.template_style === 'custom_graphic' ? 'custom' : 'presets');
    };

    // Save Template Configuration to Server
    const handleSaveTemplate = (e) => {
        e?.preventDefault();
        setSaving(true);

        const formData = new FormData();
        formData.append('template_style', config.template_style);
        formData.append('bg_mode', config.bg_mode);
        formData.append('qr_position', config.qr_position);
        formData.append('font_style', config.font_style);
        formData.append('custom_title', config.custom_title || '');
        formData.append('custom_subtitle', config.custom_subtitle || '');
        formData.append('custom_role_label', config.custom_role_label || '');
        formData.append('show_serial', config.show_serial ? '1' : '0');
        formData.append('show_arrows', config.show_arrows ? '1' : '0');
        formData.append('accent_color', config.accent_color || '#154F7C');

        if (config.custom_artwork_url) {
            formData.append('custom_artwork_url', config.custom_artwork_url);
        }
        if (uploadFile) {
            formData.append('custom_artwork_file', uploadFile);
        }

        router.post(route('events.wristbands.template', event.id), formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setSaving(false);
                setUploadFile(null);
                setSavedSnapshot(buildSnapshot(config, null));
            },
            onError: () => {
                setSaving(false);
            },
        });
    };

    // Helper: Determine Background Style for a Band
    const getBandBackground = (ticket) => {
        const tierColor = ticket?.tier_color || config.accent_color || '#154F7C';

        if (config.template_style === 'custom_graphic' && (filePreview || config.custom_artwork_url)) {
            return {
                backgroundImage: `url(${filePreview || config.custom_artwork_url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundColor: '#1E293B',
            };
        }

        switch (config.template_style) {
            case 'festival_pop':
                return {
                    background: `linear-gradient(135deg, ${tierColor} 0%, #4338CA 50%, #6366F1 100%)`,
                };
            case 'jungle_afro':
                return {
                    background: 'linear-gradient(135deg, #78350F 0%, #D97706 45%, #F59E0B 80%, #1C1917 100%)',
                };
            case 'neon_rave':
                return {
                    background: 'linear-gradient(135deg, #1E1B4B 0%, #4C1D95 40%, #0369A1 85%, #06B6D4 100%)',
                };
            case 'summer_sunset':
                return {
                    background: 'linear-gradient(135deg, #BE123C 0%, #EA580C 50%, #F59E0B 100%)',
                };
            case 'luxury_gold':
                return {
                    background: 'linear-gradient(135deg, #09090B 0%, #18181B 50%, #27272A 100%)',
                };
            case 'clean_solid':
            default:
                return {
                    background: tierColor,
                };
        }
    };

    // Helper: Memphis Graphic Overlay
    const renderMemphisOverlay = () => {
        if (config.template_style === 'festival_pop') {
            return (
                <div className="absolute inset-0 pointer-events-none overflow-hidden select-none opacity-25">
                    {/* Memphis Stars & Shapes */}
                    <div className="absolute top-1 left-4 text-yellow-300 font-black text-[14px]">✦</div>
                    <div className="absolute bottom-1.5 left-14 text-white font-black text-[10px]">★</div>
                    <div className="absolute top-2 left-28 text-pink-300 font-black text-[12px]">▲</div>
                    <div className="absolute bottom-2 left-44 text-yellow-200 font-black text-[16px]">✦</div>
                    <div className="absolute top-1 left-60 text-white font-black text-[11px]">★</div>
                    <div className="absolute bottom-1 right-20 text-yellow-300 font-black text-[15px]">✦</div>
                    <div className="absolute top-1.5 right-36 text-cyan-200 font-black text-[13px]">▲</div>
                    <div className="absolute top-2.5 right-8 text-white font-black text-[11px]">★</div>
                    {/* Geometric Zig-zag Ribbon */}
                    <svg className="absolute inset-0 w-full h-full stroke-white/30 fill-none stroke-[1.2]" preserveAspectRatio="none">
                        <path d="M 50,2 L 70,22 L 90,2 L 110,22 L 130,2 L 150,22 L 170,2 L 190,22 L 210,2" />
                    </svg>
                </div>
            );
        }

        if (config.template_style === 'jungle_afro') {
            return (
                <div className="absolute inset-0 pointer-events-none overflow-hidden select-none opacity-20">
                    <svg className="w-full h-full stroke-black fill-none stroke-[2]" preserveAspectRatio="none">
                        <pattern id="jungle-chevron" width="24" height="24" patternUnits="userSpaceOnUse">
                            <path d="M 0,0 L 12,12 L 24,0" />
                            <path d="M 0,12 L 12,24 L 24,12" />
                        </pattern>
                        <rect width="100%" height="100%" fill="url(#jungle-chevron)" />
                    </svg>
                </div>
            );
        }

        if (config.template_style === 'neon_rave') {
            return (
                <div className="absolute inset-0 pointer-events-none overflow-hidden select-none opacity-30">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(6,182,212,0.4),transparent_60%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(236,72,153,0.4),transparent_60%)]" />
                </div>
            );
        }

        if (config.template_style === 'luxury_gold') {
            return (
                <div className="absolute inset-0 pointer-events-none select-none">
                    <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-amber-500/20 via-yellow-400 to-amber-500/20" />
                    <div className="absolute inset-x-0 bottom-0 h-[1.5px] bg-gradient-to-r from-amber-500/20 via-yellow-400 to-amber-500/20" />
                </div>
            );
        }

        return null;
    };

    // Render A Single Wristband Strip (Used for both live preview & bulk print sheet)
    const renderWristbandStrip = (ticket, index, isPreview = false) => {
        const bgStyle = getBandBackground(ticket);
        const stripColor = ticket?.tier_color || config.accent_color || '#154F7C';

        // Role title: Custom override or tier name
        const displayRole = config.custom_role_label && config.custom_role_label !== 'Tier Name (Auto)'
            ? config.custom_role_label
            : (ticket?.tier_name || 'GENERAL ADMISSION');

        const displayTitle = config.custom_title?.trim() || event.title;
        const displaySubtitle = config.custom_subtitle?.trim() || `${formattedDate} • ${event.venue || event.city || 'VENUE'}`;

        const isLightBg = config.template_style === 'clean_solid' && !ticket?.tier_color;
        const textPrimaryClass = isLightBg ? 'text-slate-900' : 'text-white';
        const textMutedClass = isLightBg ? 'text-slate-600' : 'text-white/80';

        return (
            <div
                className={`wristband-strip relative rounded-md overflow-hidden flex items-stretch border border-dashed border-slate-300 print:border-slate-400 select-none ${
                    isPreview ? 'h-18 sm:h-20 shadow-xs border-slate-300' : 'h-20 sm:h-22 print:h-[26.5mm]'
                }`}
                style={{
                    ...bgStyle,
                    WebkitPrintColorAdjust: 'exact',
                    printColorAdjust: 'exact',
                }}
            >
                {/* 1. Left Adhesive / Fastener Tab with Tamper-evident wavy slit pattern */}
                <div
                    className="w-14 sm:w-16 print:w-[22mm] h-full flex flex-col items-center justify-center p-1 text-white shrink-0 select-none relative overflow-hidden"
                    style={{
                        backgroundColor: stripColor,
                        WebkitPrintColorAdjust: 'exact',
                        printColorAdjust: 'exact',
                    }}
                >
                    {/* Tamper Wavy Pattern */}
                    <div className="absolute inset-0 opacity-25 pointer-events-none flex flex-col justify-around py-1">
                        <svg viewBox="0 0 40 20" className="w-full h-3 fill-none stroke-black stroke-[1.5]">
                            <path d="M0,10 Q5,2 10,10 T20,10 T30,10 T40,10" />
                            <path d="M0,15 Q5,7 10,15 T20,15 T30,15 T40,15" />
                        </svg>
                    </div>
                    <div className="relative z-10 flex flex-col items-center justify-center text-center">
                        <span className="text-[8px] sm:text-[9px] print:text-[7.5px] font-black uppercase tracking-wider text-white">
                            FASTEN
                        </span>
                        <span className="text-[6.5px] print:text-[6px] font-bold text-white/80 uppercase tracking-tight">
                            HERE
                        </span>
                    </div>
                </div>

                {/* 2. Left Festival QR Code (Festival Standard: right beside adhesive tab) */}
                {(config.qr_position === 'left' || config.qr_position === 'dual') && (
                    <div className="w-16 sm:w-18 print:w-[23mm] h-full bg-white/95 backdrop-blur-xs border-r border-slate-200/90 p-1 flex flex-col items-center justify-center shrink-0 text-center select-none shadow-2xs">
                        {ticket?.qr_data_uri ? (
                            <img
                                src={ticket.qr_data_uri}
                                alt="Pass QR"
                                className="w-11 h-11 sm:w-13 sm:h-13 print:w-[17.5mm] print:h-[17.5mm] object-contain rounded-xs bg-white p-0.5"
                            />
                        ) : (
                            <div className="w-11 h-11 sm:w-13 sm:h-13 print:w-[17.5mm] print:h-[17.5mm] flex items-center justify-center bg-slate-100 rounded-xs">
                                <QrCode className="w-8 h-8 text-slate-500" />
                            </div>
                        )}
                        <div className="text-[6px] print:text-[5.5px] font-mono font-black text-slate-800 uppercase tracking-wider mt-0.5">
                            GATE SCAN
                        </div>
                    </div>
                )}

                {/* Optional Custom Graphic Dimmer Overlay so typography stays razor-sharp */}
                {config.template_style === 'custom_graphic' && (
                    <div className="absolute inset-0 bg-slate-950/45 pointer-events-none" />
                )}

                {/* Memphis / Preset Graphic Decorative Layer */}
                {renderMemphisOverlay()}

                {/* 3. Center Body: Role Pill, Headline, Subtitle, Attendee Name */}
                <div className="relative z-10 flex-1 px-3 sm:px-4 print:px-3 py-1 flex flex-col justify-center min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        {/* High-visibility Role Badge */}
                        <span
                            className="px-2 py-0.5 rounded text-[8.5px] sm:text-[9.5px] print:text-[8px] font-black uppercase tracking-wider text-slate-900 inline-block shadow-2xs"
                            style={{
                                backgroundColor: config.template_style === 'luxury_gold' ? '#FACC15' : '#FFFFFF',
                                WebkitPrintColorAdjust: 'exact',
                                printColorAdjust: 'exact',
                            }}
                        >
                            {displayRole}
                        </span>
                        <span className={`text-[9px] print:text-[8px] font-semibold truncate ${textMutedClass}`}>
                            {displaySubtitle}
                        </span>
                    </div>

                    <h2
                        className={`text-xs sm:text-sm print:text-[11px] font-black tracking-tight uppercase leading-snug truncate drop-shadow-xs ${textPrimaryClass}`}
                    >
                        {displayTitle}
                    </h2>

                    <div className={`flex items-center justify-between text-xs print:text-[9px] mt-0.5 ${textMutedClass}`}>
                        <span className="font-bold truncate text-white">
                            {ticket?.attendee_name || 'John Doe (Sample Attendee)'}
                        </span>
                        <span className="font-mono text-[9px] print:text-[8px] opacity-80 shrink-0 ml-2">
                            #{ticket?.ticket_number || 'TKT-001001'}
                        </span>
                    </div>
                </div>

                {/* 4. Directional Wrap Alignment Arrows (→ → →) */}
                {config.show_arrows && (
                    <div className="relative z-10 flex items-center gap-1 text-white/80 print:text-slate-800 font-black text-xs sm:text-sm tracking-widest px-2 select-none shrink-0">
                        <span>→</span>
                        <span>→</span>
                        <span>→</span>
                    </div>
                )}

                {/* 5. Security Void / Serial Section (Clean, without orange icon) */}
                {config.show_serial && (
                    <div className="relative z-10 w-16 sm:w-18 print:w-[24mm] h-full border-l border-slate-200/90 bg-white/95 p-1 flex flex-col justify-between items-center shrink-0 text-center select-none">
                        <div className="text-[7px] print:text-[6.5px] font-black text-slate-700 uppercase tracking-wider leading-tight">
                            VOID IF TORN
                        </div>
                        <div className="font-mono font-black text-[9px] sm:text-[9.5px] print:text-[8px] text-slate-900 tracking-wider">
                            {ticket?.unique_code || ticket?.ticket_number?.slice(-8) || '56648880'}
                        </div>
                        <div className="text-[6px] print:text-[5.5px] text-slate-400 uppercase font-bold tracking-tight">
                            KARDOVO SECURE
                        </div>
                    </div>
                )}

                {/* 6. Traditional Right Stub QR Code */}
                {config.qr_position === 'right' && (
                    <div className="w-16 sm:w-18 print:w-[28mm] h-full bg-white/95 border-l border-slate-200/90 p-1 flex flex-col items-center justify-center shrink-0 text-center select-none">
                        {ticket?.qr_data_uri ? (
                            <img
                                src={ticket.qr_data_uri}
                                alt="Pass QR"
                                className="w-11 h-11 sm:w-13 sm:h-13 print:w-[17.5mm] print:h-[17.5mm] object-contain rounded-xs bg-white p-0.5"
                            />
                        ) : (
                            <div className="w-11 h-11 sm:w-13 sm:h-13 print:w-[17.5mm] print:h-[17.5mm] flex items-center justify-center bg-slate-100 rounded-xs">
                                <QrCode className="w-8 h-8 text-slate-500" />
                            </div>
                        )}
                        <div className="text-[6.5px] print:text-[6px] font-mono font-black text-slate-700 uppercase tracking-wider mt-0.5">
                            GATE SCAN
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const badgeChipLabel = (chip) => (chip === 'Tier Name (Auto)' ? 'Ticket type' : chip);

    const inputClass =
        'w-full text-sm rounded-xl border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-[#154F7C] focus:ring-[#154F7C]/20 py-2';

    const bandCountLabel = `${filteredTickets.length} ${filteredTickets.length === 1 ? 'wristband' : 'wristbands'}`;

    const pageGroups = Array.from({ length: totalPages }, (_, pageIndex) =>
        filteredTickets.slice(pageIndex * passesPerPage, (pageIndex + 1) * passesPerPage)
    );

    return (
        <div className="min-h-screen bg-[#F4F7FB] text-slate-900 font-sans print:bg-white print:p-0">
            <Head title={`Print Wristbands — ${event.title}`} />

            {/* ══════════════════════════════════════════════════════════════
                EXACT PHYSICAL PRINT CSS ENGINE (A4 Portrait, 10-per-page)
               ══════════════════════════════════════════════════════════════ */}
            <style>{`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 8mm 6mm;
                    }
                    html, body {
                        visibility: visible !important;
                        background: #ffffff !important;
                        color: #000000 !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    #app, #app * {
                        visibility: visible !important;
                    }
                    .no-print, .no-print * {
                        display: none !important;
                        visibility: hidden !important;
                        height: 0 !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    .wristband-print-sheet {
                        width: 100% !important;
                        max-width: 198mm !important;
                        margin: 0 auto !important;
                        padding: 0 !important;
                        background: #ffffff !important;
                    }
                    .print-page {
                        break-after: page !important;
                        page-break-after: always !important;
                    }
                    .print-page:last-child {
                        break-after: auto !important;
                        page-break-after: auto !important;
                    }
                    .wristband-strip {
                        display: flex !important;
                        flex-direction: row !important;
                        height: 26.5mm !important;
                        max-height: 26.5mm !important;
                        min-height: 26.5mm !important;
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                        border: 1px dashed #94a3b8 !important;
                        margin-bottom: 1.5mm !important;
                        box-shadow: none !important;
                        border-radius: 4px !important;
                        overflow: hidden !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>

            {/* ── TOP BAR (hidden on print) ── */}
            <header className="sticky top-0 z-30 h-14 bg-white border-b border-slate-200 no-print">
                <div className="h-full px-3 sm:px-6 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <Link
                            href={route('ticketing.index', { event_id: event.id })}
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition shrink-0"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">Back to ticketing</span>
                        </Link>
                        <div className="h-5 w-px bg-slate-200 shrink-0" />
                        <div className="min-w-0">
                            <h1 className="text-sm font-extrabold text-slate-900 leading-tight truncate">Print wristbands</h1>
                            <p className="text-xs text-slate-500 truncate leading-tight">{event.title}</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handlePrint}
                        disabled={filteredTickets.length === 0}
                        className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#154F7C] to-[#327FB5] text-white text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-40 shrink-0"
                    >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print ({filteredTickets.length})</span>
                    </button>
                </div>
            </header>

            <div className="lg:flex lg:items-start print:block">
                {/* ══════════════ LEFT: 3 SIMPLE STEPS ══════════════ */}
                <aside className="lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem)] lg:w-[380px] lg:shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col no-print">
                    <div className="flex-1 lg:overflow-y-auto">
                        {/* STEP 1 — WHO */}
                        <Step number={1} title="Who needs a wristband?" hint="Print already-issued passes or generate a new bulk batch to sell at the door.">
                            <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                                <button
                                    type="button"
                                    onClick={() => setSourceTab('issued')}
                                    className={`py-2 rounded-lg transition cursor-pointer ${
                                        sourceTab === 'issued' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    Issued passes ({tickets.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSourceTab('bulk')}
                                    className={`py-2 rounded-lg transition cursor-pointer ${
                                        sourceTab === 'bulk' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    + Bulk stock
                                </button>
                            </div>

                            {sourceTab === 'issued' ? (
                                <div className="space-y-2.5">
                                    {selectedOrderId && (
                                        <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-sky-50 border border-sky-200/80 text-xs">
                                            <span className="font-semibold text-[#154F7C]">
                                                Showing your new batch ({tickets.length})
                                            </span>
                                            <button
                                                type="button"
                                                onClick={handleShowAllBands}
                                                className="font-bold text-[#154F7C] underline cursor-pointer shrink-0"
                                            >
                                                Show all
                                            </button>
                                        </div>
                                    )}
                                    <select value={tierFilter} onChange={handleTierChange} className={`${inputClass} font-semibold cursor-pointer`}>
                                        <option value="all">Everyone (all ticket types)</option>
                                        {tiers.map((tr) => (
                                            <option key={tr.id} value={tr.id}>
                                                {tr.name}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs font-semibold text-slate-600">
                                        {bandCountLabel} · {totalPages} {totalPages === 1 ? 'page' : 'pages'}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3 rounded-xl bg-slate-50/80 border border-slate-200/80 p-3">
                                    <p className="text-[11px] text-slate-600 leading-relaxed">
                                        No attendee names or phones needed. Each wristband is auto-numbered (<span className="font-mono font-semibold">#001, #002…</span>) with its own unique, gate-scannable QR code.
                                    </p>
                                    <div>
                                        <label className="text-xs font-bold text-slate-700 block mb-1">Ticket type</label>
                                        <select
                                            value={bulkTierId}
                                            onChange={(e) => setBulkTierId(e.target.value)}
                                            className={`${inputClass} text-xs font-semibold cursor-pointer`}
                                        >
                                            {tiers.map((tr) => (
                                                <option key={tr.id} value={tr.id}>
                                                    {tr.name} — {Number(tr.price || 0).toLocaleString()} {event.ticket_currency || 'TZS'} ({tr.remaining_count ?? tr.capacity} left)
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-700 block mb-1">How many wristbands?</label>
                                        <div className="grid grid-cols-4 gap-1.5 mb-2">
                                            {[10, 20, 50, 100].map((n) => (
                                                <button
                                                    key={n}
                                                    type="button"
                                                    onClick={() => setBulkQuantity(n)}
                                                    className={`py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                                                        Number(bulkQuantity) === n
                                                            ? 'border-[#154F7C] bg-[#154F7C] text-white'
                                                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                                                    }`}
                                                >
                                                    {n}
                                                </button>
                                            ))}
                                        </div>
                                        <input
                                            type="number"
                                            min="1"
                                            max="500"
                                            value={bulkQuantity}
                                            onChange={(e) => setBulkQuantity(e.target.value)}
                                            className={`${inputClass} text-xs font-mono`}
                                            placeholder="Custom quantity (1 - 500)"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleGenerateBulkWristbands}
                                        disabled={!bulkTierId || generatingBulk}
                                        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#154F7C] to-[#327FB5] hover:from-[#1A5C91] hover:to-[#3D8EC7] text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                                    >
                                        {generatingBulk
                                            ? 'Generating QR wristbands…'
                                            : `Generate ${Number(bulkQuantity) || 20} Scannable Wristbands`}
                                    </button>
                                </div>
                            )}
                        </Step>

                        {/* STEP 2 — DESIGN */}
                        <Step number={2} title="Choose a design" hint="Use a ready-made style or upload your own artwork.">
                            <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setArtTab('presets');
                                        if (config.template_style === 'custom_graphic') {
                                            setConfig((prev) => ({ ...prev, template_style: 'festival_pop', bg_mode: 'preset' }));
                                        }
                                    }}
                                    className={`py-2 rounded-lg transition cursor-pointer ${
                                        artTab === 'presets' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    Ready-made
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setArtTab('custom');
                                        if (filePreview) {
                                            setConfig((prev) => ({ ...prev, template_style: 'custom_graphic', bg_mode: 'custom_upload' }));
                                        }
                                    }}
                                    className={`py-2 rounded-lg transition cursor-pointer ${
                                        artTab === 'custom' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    Upload my own
                                </button>
                            </div>

                            {artTab === 'presets' ? (
                                <div className="grid grid-cols-2 gap-2">
                                    {PRESET_THEMES.map((theme) => {
                                        const isSelected = config.template_style === theme.id;
                                        return (
                                            <button
                                                key={theme.id}
                                                type="button"
                                                onClick={() => setConfig((prev) => ({ ...prev, template_style: theme.id, bg_mode: 'preset' }))}
                                                aria-pressed={isSelected}
                                                className={`p-2 rounded-xl border text-left transition cursor-pointer ${
                                                    isSelected
                                                        ? 'border-[#154F7C] ring-2 ring-[#154F7C]/20 bg-sky-50/50'
                                                        : 'border-slate-200 hover:border-slate-300 bg-white'
                                                }`}
                                            >
                                                <div className={`h-7 rounded-md bg-gradient-to-r ${theme.gradient} border border-black/10`} />
                                                <div className="mt-1.5 flex items-center justify-between gap-1">
                                                    <span className="text-xs font-bold text-slate-800 truncate">{theme.name}</span>
                                                    {isSelected && <Check className="w-3.5 h-3.5 text-[#154F7C] shrink-0" />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                                        className="hidden"
                                    />
                                    {filePreview ? (
                                        <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2.5">
                                            <img src={filePreview} alt="Your artwork" className="w-full h-12 object-cover rounded-lg border border-slate-200" />
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1 min-w-0">
                                                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                                    <span className="truncate">{uploadFile?.name || 'Your artwork is in use'}</span>
                                                </p>
                                                <div className="flex items-center gap-1 shrink-0">
                                                    <button
                                                        type="button"
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="px-2.5 py-1 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition cursor-pointer"
                                                    >
                                                        Change
                                                    </button>
                                                    <button
                                                        type="button"
                                                        aria-label="Remove artwork"
                                                        onClick={() => {
                                                            setFilePreview(null);
                                                            setUploadFile(null);
                                                            setConfig((prev) => ({
                                                                ...prev,
                                                                custom_artwork_url: '',
                                                                template_style: 'festival_pop',
                                                                bg_mode: 'preset',
                                                            }));
                                                            setArtTab('presets');
                                                        }}
                                                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition cursor-pointer"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-full border-2 border-dashed border-slate-200 hover:border-[#154F7C]/50 hover:bg-sky-50/40 rounded-xl p-5 text-center transition cursor-pointer flex flex-col items-center gap-1.5"
                                        >
                                            <Upload className="w-5 h-5 text-slate-400" />
                                            <span className="text-sm font-bold text-slate-800">Choose an image</span>
                                            <span className="text-xs text-slate-500">PNG, JPG or WebP · wide banner, about 2000 × 270 px</span>
                                        </button>
                                    )}
                                    <p className="text-xs text-slate-500 mt-2">Your artwork fills the whole band, behind the QR code and text.</p>
                                </div>
                            )}
                        </Step>

                        {/* STEP 3 — DETAILS */}
                        <Step number={3} title="Add your details" hint="Optional. Leave blank to use the event name and date.">
                            <div>
                                <span className="text-xs font-bold text-slate-700 block mb-1.5">Badge on each band</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {ROLE_CHIPS.map((chip) => {
                                        const isCustom = chip === 'Custom';
                                        const isActive = isCustom
                                            ? config.custom_role_label &&
                                              !['Tier Name (Auto)', 'VIP', 'Artist', 'Staff', 'Volunteer'].includes(config.custom_role_label)
                                            : chip === 'Tier Name (Auto)'
                                            ? !config.custom_role_label || config.custom_role_label === 'Tier Name (Auto)'
                                            : config.custom_role_label === chip;

                                        return (
                                            <button
                                                key={chip}
                                                type="button"
                                                aria-pressed={Boolean(isActive)}
                                                onClick={() => {
                                                    if (chip === 'Tier Name (Auto)') {
                                                        setConfig((prev) => ({ ...prev, custom_role_label: '' }));
                                                    } else if (isCustom) {
                                                        setConfig((prev) => ({ ...prev, custom_role_label: prev.custom_role_label || 'MEDIA' }));
                                                    } else {
                                                        setConfig((prev) => ({ ...prev, custom_role_label: chip }));
                                                    }
                                                }}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                                                    isActive ? 'bg-[#154F7C] text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                                }`}
                                            >
                                                {badgeChipLabel(chip)}
                                            </button>
                                        );
                                    })}
                                </div>
                                {config.custom_role_label &&
                                    !['Tier Name (Auto)', 'VIP', 'Artist', 'Staff', 'Volunteer'].includes(config.custom_role_label) && (
                                        <input
                                            type="text"
                                            placeholder="e.g. ALL ACCESS, MEDIA, CREW"
                                            value={config.custom_role_label}
                                            onChange={(e) => setConfig((prev) => ({ ...prev, custom_role_label: e.target.value.toUpperCase() }))}
                                            className={`${inputClass} mt-2 font-bold`}
                                        />
                                    )}
                            </div>

                            <div>
                                <label htmlFor="wb-title" className="text-xs font-bold text-slate-700 block mb-1.5">
                                    Headline
                                </label>
                                <input
                                    id="wb-title"
                                    type="text"
                                    placeholder={event.title}
                                    value={config.custom_title}
                                    onChange={(e) => setConfig((prev) => ({ ...prev, custom_title: e.target.value }))}
                                    className={`${inputClass} font-semibold`}
                                />
                            </div>

                            <div>
                                <label htmlFor="wb-subtitle" className="text-xs font-bold text-slate-700 block mb-1.5">
                                    Date or tagline
                                </label>
                                <input
                                    id="wb-subtitle"
                                    type="text"
                                    placeholder={`${formattedDate} • ${event.venue || event.city || 'Venue'}`}
                                    value={config.custom_subtitle}
                                    onChange={(e) => setConfig((prev) => ({ ...prev, custom_subtitle: e.target.value }))}
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <span className="text-xs font-bold text-slate-700 block mb-1.5">Where should the QR code go?</span>
                                <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold text-center">
                                    {[
                                        { id: 'left', label: 'Left' },
                                        { id: 'right', label: 'Right' },
                                        { id: 'dual', label: 'Both ends' },
                                    ].map((pos) => {
                                        const isActive = config.qr_position === pos.id;
                                        return (
                                            <button
                                                key={pos.id}
                                                type="button"
                                                aria-pressed={isActive}
                                                onClick={() => setConfig((prev) => ({ ...prev, qr_position: pos.id }))}
                                                className={`py-2 rounded-lg transition cursor-pointer ${
                                                    isActive ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                                                }`}
                                            >
                                                {pos.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="space-y-2 pt-1">
                                <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-slate-700 select-none">
                                    <input
                                        type="checkbox"
                                        checked={config.show_arrows}
                                        onChange={(e) => setConfig((prev) => ({ ...prev, show_arrows: e.target.checked }))}
                                        className="rounded border-slate-300 text-[#154F7C] focus:ring-[#154F7C]/20"
                                    />
                                    <span>Show direction arrows</span>
                                </label>
                                <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-slate-700 select-none">
                                    <input
                                        type="checkbox"
                                        checked={config.show_serial}
                                        onChange={(e) => setConfig((prev) => ({ ...prev, show_serial: e.target.checked }))}
                                        className="rounded border-slate-300 text-[#154F7C] focus:ring-[#154F7C]/20"
                                    />
                                    <span>Show “Void if torn” security code</span>
                                </label>
                            </div>
                        </Step>
                    </div>

                    {/* PRINT FOOTER */}
                    <div className="shrink-0 border-t border-slate-200 bg-white p-4 space-y-3">
                        <button
                            type="button"
                            onClick={handlePrint}
                            disabled={filteredTickets.length === 0}
                            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#154F7C] to-[#327FB5] hover:from-[#1A5C91] hover:to-[#3D8EC7] text-white text-sm font-bold flex items-center justify-center gap-2 transition shadow-md shadow-[#154F7C]/20 border border-sky-400/25 active:scale-[0.98] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <Printer className="w-4 h-4" />
                            <span>Print {bandCountLabel}</span>
                        </button>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            In the print window choose <span className="font-semibold text-slate-700">A4 · Portrait · Scale 100%</span> so every band prints at its exact size.
                        </p>
                        <div className="flex items-center justify-between gap-2 text-xs">
                            {isDirty ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={handleResetDesign}
                                        className="inline-flex items-center gap-1 font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer"
                                    >
                                        <RefreshCw className="w-3 h-3" />
                                        <span>Undo changes</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSaveTemplate}
                                        disabled={saving}
                                        className="font-bold text-[#154F7C] hover:underline disabled:opacity-50 cursor-pointer"
                                    >
                                        {saving ? 'Saving…' : 'Save design for next time'}
                                    </button>
                                </>
                            ) : (
                                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Design saved</span>
                                </span>
                            )}
                        </div>
                    </div>
                </aside>

                {/* ══════════════ RIGHT: LIVE PREVIEW = WHAT PRINTS ══════════════ */}
                <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 print:p-0">
                    <div className="no-print mb-5">
                        <h2 className="text-base font-extrabold text-slate-900">Preview</h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            This is exactly what will print · {bandCountLabel} · 10 per A4 page · each band 198 × 26.5 mm · cut along the dashed lines.
                        </p>
                    </div>

                    {filteredTickets.length >= 500 && (
                        <p className="no-print mb-4 text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5">
                            Showing the latest 500 passes. Choose a ticket type in step 1 to print the rest.
                        </p>
                    )}

                    {filteredTickets.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 no-print">
                            <Layers className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                            <h3 className="text-base font-bold text-slate-800">Nothing to print yet</h3>
                            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                                {tierFilter !== 'all'
                                    ? 'There are no passes for this ticket type. Choose “Everyone” in step 1.'
                                    : 'Wristbands appear here once tickets have been sold or issued.'}
                            </p>
                        </div>
                    ) : (
                        <div className="wristband-print-sheet space-y-8 print:space-y-0">
                            {pageGroups.map((group, pageIndex) => (
                                <section key={pageIndex} className="print-page">
                                    <div className="no-print flex items-center justify-between mb-2 text-xs font-bold text-slate-500">
                                        <span>
                                            Page {pageIndex + 1} of {totalPages}
                                        </span>
                                        <span>{group.length} {group.length === 1 ? 'band' : 'bands'}</span>
                                    </div>
                                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-3 sm:p-4 overflow-x-auto print:overflow-visible print:p-0 print:border-0 print:shadow-none print:rounded-none">
                                        <div className="min-w-[640px] space-y-2 print:min-w-0 print:space-y-0">
                                            {group.map((t, idx) => (
                                                <React.Fragment key={t.id || idx}>
                                                    {renderWristbandStrip(t, pageIndex * passesPerPage + idx, false)}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </div>
                                </section>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

function Step({ number, title, hint, children }) {
    return (
        <section className="px-5 py-5 border-b border-slate-100">
            <div className="flex items-start gap-3 mb-3.5">
                <span className="w-6 h-6 rounded-full bg-[#154F7C] text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {number}
                </span>
                <div className="min-w-0">
                    <h2 className="text-sm font-extrabold text-slate-900 leading-6">{title}</h2>
                    {hint && <p className="text-xs text-slate-500 mt-0.5">{hint}</p>}
                </div>
            </div>
            <div className="space-y-3.5">{children}</div>
        </section>
    );
}
