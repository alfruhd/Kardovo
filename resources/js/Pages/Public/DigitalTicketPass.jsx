 import React, { useState, useRef } from 'react';
import { Head } from '@inertiajs/react';
import { 
    Download, 
    Share2, 
    CheckCircle2, 
    AlertCircle, 
    Calendar, 
    MapPin, 
    Users,
    Check,
    Loader2,
    Globe
} from 'lucide-react';
import { toPng, toBlob, toJpeg } from 'html-to-image';
import KardovoLogo from '@/Components/KardovoLogo';
import { useTicketingLanguage } from '@/Utils/ticketingTranslations';

export default function DigitalTicketPass({ ticket, event, tier, qrDataUri, siblingTickets = [] }) {
    const { lang, toggleLang, t } = useTicketingLanguage();
    const [copied, setCopied] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [exportStatus, setExportStatus] = useState('');
    const ticketCardRef = useRef(null);

    const isCheckedIn = ticket.status === 'checked_in';
    const isCancelled = ticket.status === 'cancelled';
    const isValid = ticket.status === 'valid' && !isCheckedIn && !isCancelled;

    const shareUrl = ticket.pass_url || window.location.href;
    const shareText = `🎟️ My Ticket for ${event.title} (${tier?.name || 'Standard'})\nPass Code: #${ticket.ticket_number}\nView & Present at Gate: ${shareUrl}`;

    // Customization Configuration
    const templateConfig = event.ticket_template_config || {};
    const accentColor = templateConfig.accent_color || '#FABF24';
    const rightBgColor = templateConfig.right_bg_color || '#FFFFFF';
    const rightOverlay = templateConfig.right_overlay || 'none';
    const leftDesignMode = templateConfig.left_design_mode || 'default';
    const leftBgColor = templateConfig.left_bg_color || templateConfig.bg_color || '#241645';
    const customBgImage = templateConfig.left_bg_image;
    const bgArtworkUrl = leftDesignMode === 'custom' && customBgImage ? customBgImage : null;
    const badgeText = templateConfig.badge_text || 'TIER';
    const showConfetti = templateConfig.show_confetti !== false;
    const showBarcode = templateConfig.show_barcode !== false;

    // Format Date & Time matching screenshot: "SUNDAY, 25 OCTOBER 2026 • 6:00 AM START"
    const formattedDate = (() => {
        if (!event.event_date) return '';
        try {
            const d = new Date(event.event_date);
            if (!isNaN(d.getTime())) {
                const formatted = d.toLocaleDateString('en-GB', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                }).replace(/^([A-Za-z]+)\s+/, '$1, ');
                return formatted.toUpperCase();
            }
        } catch (e) {}
        return (event.event_date || '').toUpperCase();
    })();
    const formattedTime = (event.event_time || '6:00 AM').toUpperCase().replace(/\s*START\s*$/i, '');
    const scheduleDisplay = `${formattedDate} • ${formattedTime} START`;

    const isStubDark = (() => {
        if (!rightBgColor) return false;
        const hex = rightBgColor.replace('#', '');
        if (hex.length === 3) {
            const r = parseInt(hex[0] + hex[0], 16);
            const g = parseInt(hex[1] + hex[1], 16);
            const b = parseInt(hex[2] + hex[2], 16);
            return (r * 299 + g * 587 + b * 114) / 1000 < 140;
        }
        if (hex.length === 6) {
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            return (r * 299 + g * 587 + b * 114) / 1000 < 140;
        }
        return false;
    })();

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    /**
     * Capture high-res ticket card image (3x retina quality)
     */
    const captureCardImage = async (format = 'png') => {
        const cardNode = ticketCardRef.current;
        if (!cardNode) return null;

        const baseOptions = {
            pixelRatio: 3,
            cacheBust: false,
            backgroundColor: leftBgColor,
        };

        try {
            if (format === 'jpeg' || format === 'jpg') {
                return await toJpeg(cardNode, { ...baseOptions, quality: 0.95 });
            }
            return await toPng(cardNode, baseOptions);
        } catch (err) {
            console.warn('Standard image capture encountered issue, retrying with fallback filter...', err);
            const fallbackOptions = {
                ...baseOptions,
                filter: (node) => {
                    if (node?.classList?.contains('artwork-bg')) {
                        return false;
                    }
                    return true;
                }
            };
            if (format === 'jpeg' || format === 'jpg') {
                return await toJpeg(cardNode, { ...fallbackOptions, quality: 0.95 });
            }
            return await toPng(cardNode, fallbackOptions);
        }
    };

    /**
     * Download Pass as PNG or JPG
     */
    const handleDownloadImage = async (format = 'png') => {
        try {
            setIsExporting(true);
            setExportStatus(`Preparing ${format.toUpperCase()}...`);

            const dataUrl = await captureCardImage(format);
            if (!dataUrl) {
                throw new Error('Could not generate ticket image');
            }

            const ext = (format === 'jpeg' || format === 'jpg') ? 'jpg' : 'png';
            const safeEventName = (event.title || 'event').replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
            const filename = `Ticket_${ticket.ticket_number}_${safeEventName}.${ext}`;

            const link = document.createElement('a');
            link.download = filename;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setExportStatus('Downloaded!');
            setTimeout(() => setExportStatus(''), 2500);
        } catch (err) {
            console.error('Download ticket image error:', err);
            setExportStatus('Download Failed');
            setTimeout(() => setExportStatus(''), 3000);
        } finally {
            setIsExporting(false);
        }
    };

    /**
     * Share Ticket (Image + Link)
     */
    const handleNativeShare = async () => {
        const cardNode = ticketCardRef.current;
        setIsExporting(true);
        setExportStatus('Sharing...');

        try {
            let imageBlob = null;
            if (cardNode) {
                try {
                    imageBlob = await toBlob(cardNode, {
                        pixelRatio: 2.5,
                        cacheBust: false,
                        backgroundColor: leftBgColor,
                    });
                } catch (e) {
                    console.warn('Image blob generation for share skipped:', e);
                }
            }

            if (imageBlob && navigator.canShare) {
                const file = new File(
                    [imageBlob], 
                    `Ticket_${ticket.ticket_number}.png`, 
                    { type: 'image/png' }
                );

                if (navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        title: `Ticket: ${event.title}`,
                        text: shareText,
                        files: [file],
                    });
                    return;
                }
            }

            if (navigator.share) {
                await navigator.share({
                    title: `Ticket: ${event.title}`,
                    text: shareText,
                    url: shareUrl,
                });
            } else {
                handleCopyLink();
            }
        } catch (err) {
            if (err?.name !== 'AbortError') {
                handleCopyLink();
            }
        } finally {
            setIsExporting(false);
            setExportStatus('');
        }
    };

    /**
     * Print Ticket (Exact 1-Page High-Res Render)
     */
    const handlePrint = async () => {
        const cardNode = ticketCardRef.current;
        if (!cardNode) {
            window.print();
            return;
        }

        try {
            setIsExporting(true);
            setExportStatus('Preparing Print...');

            const dataUrl = await captureCardImage('png');
            if (!dataUrl) {
                window.print();
                return;
            }

            // Remove existing print iframe
            let printFrame = document.getElementById('kardovo-ticket-print-frame');
            if (printFrame) {
                printFrame.remove();
            }

            printFrame = document.createElement('iframe');
            printFrame.id = 'kardovo-ticket-print-frame';
            printFrame.style.position = 'fixed';
            printFrame.style.top = '-9999px';
            printFrame.style.left = '-9999px';
            printFrame.style.width = '0';
            printFrame.style.height = '0';
            printFrame.style.border = 'none';
            document.body.appendChild(printFrame);

            const frameDoc = printFrame.contentWindow || printFrame.contentDocument;
            const doc = frameDoc.document || frameDoc;
            doc.open();
            doc.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Ticket #${ticket.ticket_number} - ${event.title}</title>
                    <style>
                        @page {
                            size: landscape;
                            margin: 10mm;
                        }
                        * {
                            box-sizing: border-box;
                            margin: 0;
                            padding: 0;
                        }
                        html, body {
                            width: 100%;
                            height: 100%;
                            background: #FFFFFF;
                            margin: 0;
                            padding: 0;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        .print-sheet {
                            width: 100%;
                            max-width: 250mm;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            page-break-inside: avoid;
                            page-break-after: avoid;
                        }
                        img {
                            width: 100%;
                            max-height: 128mm;
                            object-fit: contain;
                            display: block;
                            border-radius: 24px;
                            box-shadow: 0 4px 25px rgba(0,0,0,0.15);
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                            image-rendering: -webkit-optimize-contrast;
                        }
                    </style>
                </head>
                <body>
                    <div class="print-sheet">
                        <img src="${dataUrl}" alt="Ticket #${ticket.ticket_number}" onload="window.focus(); window.print();" />
                    </div>
                </body>
                </html>
            `);
            doc.close();

            // Backup trigger
            setTimeout(() => {
                try {
                    printFrame.contentWindow.focus();
                    printFrame.contentWindow.print();
                } catch (e) {
                    // Ignore
                }
            }, 750);
        } catch (err) {
            console.error('Print generation failed, falling back to window.print():', err);
            window.print();
        } finally {
            setIsExporting(false);
            setExportStatus('');
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col justify-between py-6 px-4 sm:px-6 relative selection:bg-[#16A34A] selection:text-white">
            <Head title={`Ticket #${ticket.ticket_number} — ${event.title}`} />

            {/* Print Stylesheet Overrides (Ensures Cmd+P also prints cleanly) */}
            <style>{`
                @media print {
                    @page {
                        size: landscape;
                        margin: 8mm;
                    }
                    html, body {
                        background: #ffffff !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        min-height: 0 !important;
                        height: auto !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }
                    .min-h-screen {
                        min-height: 0 !important;
                        height: auto !important;
                        padding: 0 !important;
                        display: block !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    main {
                        padding: 0 !important;
                        margin: 0 auto !important;
                        max-width: 100% !important;
                        min-height: 0 !important;
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                    }
                    .print-card {
                        display: flex !important;
                        flex-direction: row !important;
                        width: 100% !important;
                        max-width: 920px !important;
                        margin: 0 auto !important;
                        box-shadow: none !important;
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                        overflow: hidden !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }
                }
            `}</style>

            {/* Top Brand & Utility Header */}
            <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-2 no-print relative z-10 border-b border-slate-200/80 pb-3">
                <a href={route('tickets.marketplace')} className="flex items-center gap-2 cursor-pointer">
                    <KardovoLogo light={false} showText={true} textClassName="text-slate-900 text-xs font-black tracking-widest" imgClassName="h-6 w-6" />
                </a>

                <div className="flex items-center gap-2">
                    {/* Status feedback pill if exporting */}
                    {exportStatus && (
                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg animate-pulse hidden sm:inline-flex items-center gap-1.5">
                            {isExporting && <Loader2 className="w-3 h-3 animate-spin" />}
                            <span>{exportStatus}</span>
                        </span>
                    )}

                    {/* Language Switcher */}
                    <button 
                        type="button"
                        onClick={toggleLang} 
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-xs font-bold text-slate-700 shadow-2xs cursor-pointer mr-0.5"
                        title={lang === 'en' ? 'Badili lugha kuwa Kiswahili' : 'Switch language to English'}
                    >
                        <Globe className="w-3.5 h-3.5 text-[#008EE8]" />
                        <span>{lang === 'en' ? 'SWA' : 'ENG'}</span>
                    </button>

                    {/* Share Button */}
                    <button
                        type="button"
                        onClick={handleNativeShare}
                        disabled={isExporting}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer disabled:opacity-50"
                        title="Share Pass"
                    >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-500" />}
                        <span className="hidden sm:inline">{copied ? t('Link Copied', 'Link Copied') : t('Share', 'Share')}</span>
                    </button>

                    {/* Download Button (PNG) */}
                    <button
                        type="button"
                        onClick={() => handleDownloadImage('png')}
                        disabled={isExporting}
                        className="px-3.5 py-1.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] active:bg-[#117534] text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer disabled:opacity-50"
                        title="Download Pass"
                    >
                        {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                        <span>{t('Download', 'Download')}</span>
                    </button>
                </div>
            </header>

            {/* Sibling Tickets Banner (If order includes multiple passes) */}
            {siblingTickets.length > 1 && (
                <div className="max-w-4xl mx-auto w-full my-2.5 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs no-print">
                    <div className="text-slate-500 font-medium">
                        Order <span className="font-mono font-bold text-slate-800">#{ticket.order_number}</span>
                        <span className="text-slate-400 ml-1.5">({siblingTickets.length} Passes in this order)</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        {siblingTickets.map((sib, idx) => {
                            const isCurrent = sib.ticket_number === ticket.ticket_number;
                            return (
                                <a
                                    key={sib.id}
                                    href={sib.pass_url}
                                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                                        isCurrent
                                            ? 'bg-slate-900 text-white shadow-xs'
                                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                                    }`}
                                >
                                    Pass {idx + 1}: {sib.attendee_name}
                                </a>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Main Authentic Digital Pass Card */}
            <main className="max-w-4xl mx-auto w-full my-auto py-4">
                <div 
                    ref={ticketCardRef}
                    className="print-card relative flex flex-col md:flex-row rounded-[28px] md:rounded-[32px] shadow-2xl overflow-hidden transition-all text-slate-100 border border-[#393655]"
                    style={{ backgroundColor: leftBgColor }}
                >
                    {/* ── LEFT SECTION (MAIN PASS BODY) ── */}
                    <div 
                        className="flex-1 flex flex-col justify-between p-6 sm:p-8 relative overflow-hidden"
                        style={{ backgroundColor: leftBgColor }}
                    >
                        {/* Background Artwork: only if custom design uploaded */}
                        {bgArtworkUrl && (
                            <div 
                                className="artwork-bg absolute inset-0 pointer-events-none bg-cover bg-center opacity-35 filter"
                                style={{ backgroundImage: `url(${bgArtworkUrl})` }}
                            />
                        )}
                        {bgArtworkUrl && (
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/75 via-slate-950/45 to-transparent pointer-events-none" />
                        )}

                        {/* Geometric Confetti Shapes (exact sampled colors) */}
                        {showConfetti && (
                            <>
                                <div className="w-12 h-12 rounded-br-[26px] bg-[#DF1C47] absolute top-0 left-0 pointer-events-none select-none opacity-95" />
                                <div className="w-8 h-8 rounded-full bg-[#FABF24] absolute -top-2 right-8 pointer-events-none select-none" />
                                <div className="w-6 h-6 rounded-full bg-[#DF1C47] absolute top-[57%] right-11 pointer-events-none select-none opacity-90" />
                                <div className="w-10 h-10 rounded-full bg-[#12B780] absolute -bottom-3 right-5 pointer-events-none select-none" />
                            </>
                        )}

                        <div className="relative z-10 space-y-3">
                            {/* Top Status & Category Bar */}
                            <div className="flex items-center justify-between gap-3">
                                <div className="text-[10.5px] sm:text-[11px] font-mono font-bold tracking-widest text-[#A285C6] uppercase">
                                    KARDOVO • {event.category || event.event_type || 'SPORTS & ATHLETICS'}
                                </div>

                                <div className="flex items-center gap-2">
                                    {isValid && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono">
                                            <CheckCircle2 className="w-3 h-3" /> {t('Valid Pass')}
                                        </span>
                                    )}
                                    {isCheckedIn && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/15 text-blue-400 border border-blue-500/30 font-mono">
                                            <CheckCircle2 className="w-3 h-3" /> {t('Admitted')}
                                        </span>
                                    )}
                                    {isCancelled && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/30 font-mono">
                                            <AlertCircle className="w-3 h-3" /> {t('Cancelled')}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Event Title */}
                            <div>
                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white uppercase tracking-tight leading-tight mt-2 font-display">
                                    {event.title}
                                </h1>
                            </div>

                            {/* Tier Badge */}
                            <div className="inline-flex items-center gap-2 bg-[#2F234E] rounded-xl p-1 pr-3 w-fit my-1">
                                <span 
                                    className="px-2.5 py-0.5 rounded-lg text-xs font-black uppercase tracking-wider text-slate-950 shadow-xs"
                                    style={{ backgroundColor: accentColor }}
                                >
                                    {badgeText}
                                </span>
                                <span className="text-xs sm:text-sm font-bold text-white tracking-wide uppercase">
                                    {tier?.name || 'Standard Entry'}
                                </span>
                            </div>

                            {/* Date, Time & Venue */}
                            <div className="space-y-1.5 text-xs sm:text-sm font-mono font-bold mt-2">
                                <div className="flex items-center gap-2" style={{ color: accentColor }}>
                                    <Calendar className="w-4 h-4 shrink-0" />
                                    <span>{scheduleDisplay}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-300 font-sans font-medium">
                                    <MapPin className="w-4 h-4 shrink-0 text-slate-400" />
                                    <span>{event.venue ? `AT ${event.venue}` : ''}{event.city ? `, ${event.city}` : ''}</span>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Attendee Details Row */}
                        <div className="mt-8 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono relative z-10">
                            <div>
                                <span className="text-[9.5px] uppercase text-[#A285C6] font-semibold tracking-wider block">
                                    PASS HOLDER
                                </span>
                                <span className="text-sm font-bold text-white truncate block mt-0.5 font-sans">
                                    {ticket.attendee_name}
                                </span>
                            </div>

                            <div>
                                <span className="text-[9.5px] uppercase text-[#A285C6] font-semibold tracking-wider block">
                                    PRICE
                                </span>
                                <span className="text-sm font-bold text-[#34C392] block mt-0.5 font-mono">
                                    {ticket.formatted_price}
                                </span>
                            </div>

                            <div>
                                <span className="text-[9.5px] uppercase text-[#A285C6] font-semibold tracking-wider block">
                                    GATE / ENTRY
                                </span>
                                <span className="text-sm font-medium text-white truncate block mt-0.5 font-sans">
                                    {ticket.gate_label || 'Main Gate'}
                                </span>
                            </div>

                            <div>
                                <span className="text-[9.5px] uppercase text-[#A285C6] font-semibold tracking-wider block">
                                    TICKET CODE
                                </span>
                                <span 
                                    className="text-sm font-bold block mt-0.5 font-mono"
                                    style={{ color: accentColor }}
                                >
                                    #{ticket.ticket_number}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ── PERFORATED DIVIDER WITH CIRCULAR NOTCHES ── */}
                    <div className="relative flex md:flex-col items-center justify-between shrink-0 select-none">
                        {/* Top Circular Cutout Notch */}
                        <div className="hidden md:block absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#F8FAFC] border border-[#CBD5E1] z-20" />

                        {/* Left Circular Cutout Notch (Mobile) */}
                        <div className="md:hidden absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#F8FAFC] border border-[#CBD5E1] z-20" />

                        {/* Perforation Dashed Line */}
                        <div className="hidden md:block w-0 h-full border-r-2 border-dashed border-[#D8DFE8] mx-1.5" />
                        <div className="md:hidden w-full h-0 border-t-2 border-dashed border-[#D8DFE8] my-1.5" />

                        {/* Bottom Circular Cutout Notch */}
                        <div className="hidden md:block absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#F8FAFC] border border-[#CBD5E1] z-20" />

                        {/* Right Circular Cutout Notch (Mobile) */}
                        <div className="md:hidden absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#F8FAFC] border border-[#CBD5E1] z-20" />
                    </div>

                    {/* ── RIGHT SECTION: TEAR-OFF STUB & SCANNABLE QR (CUSTOMIZABLE) ── */}
                    <div 
                        className="w-full md:w-80 p-6 sm:p-8 flex flex-col justify-between items-center text-center relative overflow-hidden shrink-0"
                        style={{ backgroundColor: rightBgColor }}
                    >
                        {/* Minimalist Design Overlays for QR Stub */}
                        {rightOverlay === 'accent_border' && (
                            <div 
                                className="absolute inset-2.5 rounded-2xl border pointer-events-none" 
                                style={{ borderColor: `${accentColor}35` }} 
                            />
                        )}
                        {rightOverlay === 'subtle_dots' && (
                            <>
                                <div 
                                    className="w-2.5 h-2.5 rounded-full absolute top-3 left-3 pointer-events-none opacity-60" 
                                    style={{ backgroundColor: accentColor }} 
                                />
                                <div 
                                    className="w-2.5 h-2.5 rounded-full absolute bottom-3 right-3 pointer-events-none opacity-60" 
                                    style={{ backgroundColor: accentColor }} 
                                />
                            </>
                        )}
                        {rightOverlay === 'top_glow' && (
                            <div 
                                className="absolute top-0 left-0 right-0 h-20 pointer-events-none opacity-25" 
                                style={{ background: `radial-gradient(ellipse at top, ${accentColor}, transparent 75%)` }} 
                            />
                        )}

                        {/* Top: SCAN AT GATE • ADMIT ONE */}
                        <div className="w-full relative z-10 pt-1">
                            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#A0ADC0] block font-mono">
                                SCAN AT GATE • ADMIT ONE
                            </span>
                        </div>

                        {/* Center: Dynamic QR Code & Unique Code */}
                        <div className="my-auto py-2 relative z-10 flex flex-col items-center">
                            <img 
                                src={qrDataUri} 
                                alt={`Gate QR Pass #${ticket.ticket_number}`} 
                                className={`w-44 h-44 sm:w-48 sm:h-48 mx-auto block ${
                                    isStubDark ? 'p-2 bg-white rounded-2xl shadow-lg' : ''
                                }`}
                            />
                            <div className={`mt-2 text-xl sm:text-2xl font-mono font-black tracking-widest ${
                                isStubDark ? 'text-white' : 'text-[#242C3D]'
                            }`}>
                                {ticket.unique_code}
                            </div>
                        </div>

                        {/* Bottom: Pass Number */}
                        <div className="w-full relative z-10 pb-1">
                            <span className="text-xs font-mono text-[#A0ADC0] block">
                                Pass #{ticket.ticket_number}
                            </span>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="text-center py-6 text-xs text-slate-400 no-print relative z-10">
                {t('Powered by Kardovo')}
            </footer>
        </div>
    );
}
