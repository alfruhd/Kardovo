import React, { useState, useRef, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
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
    Globe,
    Ticket,
    X,
    MessageCircle,
    Phone,
    Mail,
    ArrowRight
} from 'lucide-react';
import { toPng, toBlob, toJpeg } from 'html-to-image';
import Modal from '@/Components/Modal';
import KardovoLogo from '@/Components/KardovoLogo';
import KardovoFooter from '@/Components/KardovoFooter';
import { useTicketingLanguage } from '@/Utils/ticketingTranslations';

function WhatsAppIcon({ className = "w-5 h-5" }) {
    return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
        </svg>
    );
}

export default function DigitalTicketPass({ ticket, event, tier, qrDataUri, siblingTickets = [] }) {
    const { lang, toggleLang, t } = useTicketingLanguage();
    const [copied, setCopied] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [exportStatus, setExportStatus] = useState('');
    const [showContactModal, setShowContactModal] = useState(false);
    const ticketCardRef = useRef(null);

    // Active ticket state & 3D Flip transition state
    const [activeTicketNumber, setActiveTicketNumber] = useState(ticket.ticket_number);
    const [flipStage, setFlipStage] = useState('idle'); // 'idle' | 'flipping-out' | 'flipping-in' | 'settling'
    const [flipDirection, setFlipDirection] = useState('next'); // 'next' | 'prev'

    const activeSibling = siblingTickets.find((s) => s.ticket_number === activeTicketNumber);
    const activeTicket = activeSibling ? { ...ticket, ...activeSibling } : ticket;
    const activeTier = activeSibling?.tier || tier;
    const activeQrDataUri = activeSibling?.qr_data_uri || qrDataUri;

    const isCheckedIn = activeTicket.status === 'checked_in' || activeTicket.is_checked_in;
    const isCancelled = activeTicket.status === 'cancelled';
    const isValid = activeTicket.status === 'valid' && !isCheckedIn && !isCancelled;

    const shareUrl = activeTicket.pass_url || window.location.href;
    const shareText = `🎟️ My Ticket for ${event.title} (${activeTier?.name || 'Standard'})\nPass Code: #${activeTicket.ticket_number}\nView & Present at Gate: ${shareUrl}`;

    // Perform smooth 3D flip card transition when switching between sibling passes
    const handleSwitchPass = (targetTicket) => {
        if (!targetTicket || targetTicket.ticket_number === activeTicketNumber || flipStage !== 'idle') {
            return;
        }

        const currentIdx = siblingTickets.findIndex((s) => s.ticket_number === activeTicketNumber);
        const targetIdx = siblingTickets.findIndex((s) => s.ticket_number === targetTicket.ticket_number);
        const direction = targetIdx >= currentIdx ? 'next' : 'prev';

        setFlipDirection(direction);
        setFlipStage('flipping-out');

        // Halfway through rotation (when card is edge-on at 80deg), swap ticket data and set reverse angle
        setTimeout(() => {
            setActiveTicketNumber(targetTicket.ticket_number);
            if (targetTicket.pass_url) {
                window.history.replaceState({}, '', targetTicket.pass_url);
            }
            setFlipStage('flipping-in');

            // Force reflow and smoothly settle into view
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setFlipStage('settling');
                    setTimeout(() => {
                        setFlipStage('idle');
                    }, 280);
                });
            });
        }, 220);
    };

    // Keep active pass synced if user uses browser history navigation
    useEffect(() => {
        const handlePopState = () => {
            const currentPath = window.location.pathname;
            const matched = siblingTickets.find((s) => s.pass_url && s.pass_url.includes(currentPath));
            if (matched && matched.ticket_number !== activeTicketNumber) {
                setActiveTicketNumber(matched.ticket_number);
            }
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [siblingTickets, activeTicketNumber]);

    // 3D Flip style transformations
    let cardFlipStyle = {};
    if (flipStage === 'flipping-out') {
        const angle = flipDirection === 'next' ? -80 : 80;
        cardFlipStyle = {
            transform: `rotateY(${angle}deg) scale(0.92)`,
            opacity: 0.5,
            filter: 'blur(0.5px)',
            transition: 'transform 220ms cubic-bezier(0.4, 0, 0.7, 1), opacity 200ms ease, filter 200ms ease',
        };
    } else if (flipStage === 'flipping-in') {
        const angle = flipDirection === 'next' ? 80 : -80;
        cardFlipStyle = {
            transform: `rotateY(${angle}deg) scale(0.92)`,
            opacity: 0.5,
            filter: 'blur(0.5px)',
            transition: 'none',
        };
    } else if (flipStage === 'settling') {
        cardFlipStyle = {
            transform: 'rotateY(0deg) scale(1)',
            opacity: 1,
            filter: 'blur(0px)',
            transition: 'transform 280ms cubic-bezier(0.16, 1, 0.3, 1), opacity 250ms ease, filter 250ms ease',
        };
    } else {
        cardFlipStyle = {
            transform: 'rotateY(0deg) scale(1)',
            transition: 'transform 250ms cubic-bezier(0.16, 1, 0.3, 1)',
        };
    }

    // Customization Configuration
    const templateConfig = event.ticket_template_config || {};
    const accentColor = templateConfig.accent_color || '#FABF24';
    const rightBgColor = templateConfig.right_bg_color || '#FFFFFF';
    const rightOverlay = templateConfig.right_overlay || 'none';
    const leftDesignMode = templateConfig.left_design_mode || 'default';
    const leftBgColor = templateConfig.left_bg_color || templateConfig.bg_color || '#241645';
    const customBgImage = templateConfig.left_bg_image;
    const bgArtworkUrl = customBgImage || event.cover_photo || null;
    const badgeText = templateConfig.badge_text || 'TIER';
    const showBarcode = templateConfig.show_barcode !== false;
    const showEventDetails = leftDesignMode === 'custom_graphic' ? Boolean(templateConfig.show_event_details) : true;

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
            const filename = `Ticket_${activeTicket.ticket_number}_${safeEventName}.${ext}`;

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
                    `Ticket_${activeTicket.ticket_number}.png`, 
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
                    <title>Ticket #${activeTicket.ticket_number} - ${event.title}</title>
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
                        <img src="${dataUrl}" alt="Ticket #${activeTicket.ticket_number}" onload="window.focus(); window.print();" />
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
        <div className="min-h-screen bg-gradient-to-b from-[#F0F5FA] via-[#F4F8FC] to-[#FFFFFF] text-slate-800 flex flex-col justify-between relative selection:bg-[#154F7C] selection:text-white">
            <Head title={`Ticket #${activeTicket.ticket_number} — ${event.title}`} />

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

            {/* ══════════════════════════════════════════════════════════════
                TOP NAVBAR (Full-width glass navbar matching other pages)
               ══════════════════════════════════════════════════════════════ */}
            <header className="w-full bg-white/85 dark:bg-[#07111E]/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/10 shadow-xs sticky top-0 z-40 no-print">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4 text-slate-800 dark:text-slate-100">
                    {/* Brand Logo & Marketplace Link */}
                    <div className="flex items-center gap-3 sm:gap-6 shrink-0">
                        <Link href="/" className="cursor-pointer focus:outline-none flex items-center shrink-0">
                            <KardovoLogo 
                                light={false} 
                                showText={true} 
                                textClassName="text-slate-900 dark:text-white text-sm sm:text-lg font-black tracking-widest transition-colors duration-300" 
                                imgClassName="h-7 w-7 sm:h-9 sm:w-9" 
                            />
                        </Link>

                        <Link
                            href={route('tickets.marketplace')}
                            className="hidden md:inline-flex px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition items-center gap-1.5 shrink-0 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10"
                        >
                            <Ticket className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                            <span>{lang === 'sw' ? 'Tiketi Zote' : 'Marketplace'}</span>
                        </Link>
                    </div>

                    {/* Right-Side Controls: Contact Us, Language Switcher, Share & Download */}
                    <div className="flex items-center gap-1.5 sm:gap-2.5 text-xs sm:text-sm font-semibold shrink-0">
                        {/* Status feedback pill if exporting */}
                        {exportStatus && (
                            <span className="text-[10px] sm:text-[11px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg animate-pulse hidden sm:inline-flex items-center gap-1.5">
                                {isExporting && <Loader2 className="w-3 h-3 animate-spin" />}
                                <span>{exportStatus}</span>
                            </span>
                        )}

                        {/* Contact Us: icon on mobile, full text on sm+ */}
                        <button 
                            type="button"
                            onClick={() => setShowContactModal(true)}
                            className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer flex items-center gap-1.5"
                            title={lang === 'sw' ? 'Wasiliana Nasi' : 'Contact Us'}
                        >
                            <MessageCircle className="w-4 h-4 text-slate-500 sm:hidden" />
                            <span className="hidden sm:inline">{lang === 'sw' ? 'Wasiliana Nasi' : 'Contact Us'}</span>
                        </button>

                        {/* Language Toggle: Icon and text only, no shape */}
                        <button 
                            type="button"
                            onClick={toggleLang} 
                            className="flex items-center gap-1 px-1.5 sm:px-2.5 py-1.5 sm:py-2 transition-colors font-semibold cursor-pointer text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white text-xs sm:text-sm"
                            title={lang === 'en' ? 'Badili lugha kuwa Kiswahili' : 'Switch language to English'}
                        >
                            <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-600 dark:text-sky-400" />
                            <span className="text-[11px] sm:text-xs font-bold">{lang === 'en' ? 'SWA' : 'ENG'}</span>
                        </button>

                        {/* Share Button: icon on mobile, icon + label on sm+ */}
                        <button
                            type="button"
                            onClick={handleNativeShare}
                            disabled={isExporting}
                            className="p-2 sm:px-3.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-white border border-slate-200/80 dark:border-white/10 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer disabled:opacity-50"
                            title="Share Pass"
                        >
                            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-slate-500" />}
                            <span className="hidden sm:inline">{copied ? t('Link Copied', 'Link Copied') : t('Share', 'Share')}</span>
                        </button>

                        {/* Download Button */}
                        <button
                            type="button"
                            onClick={() => handleDownloadImage('png')}
                            disabled={isExporting}
                            className="inline-flex items-center gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#154F7C] to-[#327FB5] hover:from-[#1A5C91] hover:to-[#3D8EC7] text-white text-xs sm:text-sm font-bold transition shadow-md shadow-[#154F7C]/25 border border-sky-400/25 cursor-pointer active:scale-95 disabled:opacity-50"
                            title="Download Pass"
                        >
                            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                            <span className="hidden xs:inline sm:inline">{t('Download', 'Download')}</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Stage & Background Glows */}
            <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 py-6 sm:py-10 relative overflow-hidden">
                {/* Ambient soft oceanic atmospheric glows matching the Login/Register wave palette */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-sky-200/35 to-blue-300/15 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-10 left-0 w-[450px] h-[450px] bg-gradient-to-tr from-sky-100/50 to-blue-200/20 rounded-full blur-3xl pointer-events-none -translate-x-1/4" />

                {/* Sibling Tickets Banner (If order includes multiple passes) */}
                {siblingTickets.length > 1 && (
                    <div className="max-w-3xl mx-auto w-full my-2.5 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs no-print relative z-10">
                        <div className="text-slate-500 font-medium">
                            Order <span className="font-mono font-bold text-slate-800">#{activeTicket.order_number}</span>
                        <span className="text-slate-400 ml-1.5">({siblingTickets.length} Passes in this order)</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        {siblingTickets.map((sib, idx) => {
                            const isCurrent = sib.ticket_number === activeTicket.ticket_number;
                            return (
                                <button
                                    key={sib.id || sib.ticket_number}
                                    type="button"
                                    onClick={() => handleSwitchPass(sib)}
                                    disabled={flipStage !== 'idle'}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:pointer-events-none ${
                                        isCurrent
                                            ? 'bg-gradient-to-r from-[#154F7C] to-[#327FB5] text-white shadow-sm shadow-[#154F7C]/25 border border-sky-400/30 ring-2 ring-sky-500/20'
                                            : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs hover:border-slate-300'
                                    }`}
                                    title={`Flip to Pass ${idx + 1}: ${sib.attendee_name}`}
                                >
                                    Pass {idx + 1}: {sib.attendee_name}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Main Authentic Digital Pass Card */}
            <main className="max-w-3xl mx-auto w-full my-auto py-4" style={{ perspective: '1600px' }}>
                <div 
                    ref={ticketCardRef}
                    className="print-card relative flex flex-col md:flex-row rounded-[24px] md:rounded-[28px] shadow-[0_20px_50px_-12px_rgba(15,23,42,0.18)] overflow-hidden text-slate-100 border-0 ring-0"
                    style={{ 
                        backgroundColor: leftBgColor,
                        transformStyle: 'preserve-3d',
                        backfaceVisibility: 'hidden',
                        willChange: 'transform, opacity, filter',
                        ...cardFlipStyle
                    }}
                >
                    {/* Dynamic specular light sheen during 3D flip */}
                    <div 
                        className={`absolute inset-0 pointer-events-none rounded-[24px] md:rounded-[28px] transition-opacity duration-300 z-30 ${
                            flipStage !== 'idle' ? 'opacity-35' : 'opacity-0'
                        }`}
                        style={{
                            background: flipDirection === 'next'
                                ? 'linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.4) 50%, transparent 80%)'
                                : 'linear-gradient(285deg, transparent 20%, rgba(255,255,255,0.4) 50%, transparent 80%)',
                        }}
                    />

                    {/* ── LEFT SECTION (MAIN PASS BODY) ── */}
                    <div 
                        className={`flex-1 flex flex-col justify-between p-5 sm:p-7 relative overflow-hidden ${
                            !showEventDetails ? 'min-h-[260px] sm:min-h-[320px] md:min-h-[380px]' : 'min-h-[220px] md:min-h-0'
                        }`}
                        style={{ backgroundColor: leftBgColor }}
                    >
                        {/* Background Artwork: only if custom design uploaded or cover photo */}
                        {bgArtworkUrl && (
                            <>
                                <div 
                                    className="artwork-bg absolute inset-0 pointer-events-none bg-cover bg-center"
                                    style={{ backgroundImage: `url(${bgArtworkUrl})` }}
                                />
                                {showEventDetails && (
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/35 pointer-events-none z-0" />
                                )}
                            </>
                        )}

                        {showEventDetails && (
                            <>
                                <div className="relative z-10 space-y-2.5 sm:space-y-3">
                                    {/* Event Title */}
                                    <div>
                                        <h1 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-white uppercase tracking-tight leading-snug font-display drop-shadow-xs">
                                            {event.title}
                                        </h1>
                                    </div>

                                    {/* Tier Badge */}
                                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xs rounded-xl p-1 pr-3 w-fit border border-white/10">
                                        <span 
                                            className="px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-950 shadow-xs"
                                            style={{ backgroundColor: accentColor }}
                                        >
                                            {badgeText}
                                        </span>
                                        <span className="text-xs sm:text-sm font-bold text-white tracking-wide uppercase">
                                            {activeTier?.name || 'Standard Entry'}
                                        </span>
                                    </div>

                                    {/* Date, Time & Venue */}
                                    <div className="space-y-1.5 text-xs sm:text-sm pt-0.5">
                                        <div className="flex items-center gap-2 font-mono font-bold" style={{ color: accentColor }}>
                                            <Calendar className="w-3.5 h-3.5 shrink-0" />
                                            <span className="truncate">{scheduleDisplay}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-300 font-medium">
                                            <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                                            <span className="truncate">{event.venue ? `AT ${event.venue}` : ''}{event.city ? `, ${event.city}` : ''}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom Event Specifications */}
                                <div className="mt-4 sm:mt-5 pt-3 sm:pt-3.5 border-t border-white/10 grid grid-cols-3 gap-2 sm:gap-3 text-xs font-mono relative z-10">
                                    <div className="min-w-0">
                                        <span className="text-[9px] sm:text-[9.5px] uppercase text-white/50 font-semibold tracking-wider block">
                                            PRICE
                                        </span>
                                        <span className="text-xs sm:text-sm font-bold text-emerald-400 block mt-0.5 font-mono truncate">
                                            {activeTicket.formatted_price}
                                        </span>
                                    </div>

                                    <div className="min-w-0">
                                        <span className="text-[9px] sm:text-[9.5px] uppercase text-white/50 font-semibold tracking-wider block">
                                            GATE / ACCESS
                                        </span>
                                        <span className="text-xs sm:text-sm font-medium text-white block mt-0.5 font-sans truncate">
                                            {activeTicket.gate_label || 'Main Gate'}
                                        </span>
                                    </div>

                                    <div className="min-w-0">
                                        <span className="text-[9px] sm:text-[9.5px] uppercase text-white/50 font-semibold tracking-wider block">
                                            ENTRY PASS
                                        </span>
                                        <span 
                                            className="text-xs sm:text-sm font-bold block mt-0.5 font-mono truncate"
                                            style={{ color: accentColor }}
                                        >
                                            #{activeTicket.ticket_number}
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* ── PERFORATED DIVIDER WITH CIRCULAR NOTCHES & DOTTED LINE ── */}
                    {/* Desktop Vertical Perforated Divider */}
                    <div className="hidden md:block relative w-0 self-stretch border-r-2 border-dotted border-slate-300/80 dark:border-white/30 shrink-0 select-none z-20 pointer-events-none">
                        <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-[#F0F5FA] border-0 pointer-events-none z-30" />
                        <div className="absolute -bottom-4 -left-4 w-8 h-8 rounded-full bg-[#F0F5FA] border-0 pointer-events-none z-30" />
                    </div>

                    {/* Mobile Horizontal Perforated Divider */}
                    <div className="md:hidden relative w-full h-0 self-stretch border-t-2 border-dotted border-slate-300/80 dark:border-white/30 shrink-0 select-none z-20 pointer-events-none">
                        <div className="absolute -left-4 -top-4 w-8 h-8 rounded-full bg-[#F0F5FA] border-0 pointer-events-none z-30" />
                        <div className="absolute -right-4 -top-4 w-8 h-8 rounded-full bg-[#F0F5FA] border-0 pointer-events-none z-30" />
                    </div>

                    {/* ── RIGHT SECTION: TEAR-OFF STUB & SCANNABLE QR ── */}
                    <div 
                        className="w-full md:w-[260px] p-4 sm:p-5 flex flex-col justify-between items-center text-center relative overflow-hidden shrink-0 border-0"
                        style={{ backgroundColor: rightBgColor }}
                    >
                        {/* Center: Pass Holder, Dynamic QR Code & Check-in Code */}
                        <div className="my-auto py-1 relative z-10 flex flex-col items-center justify-center w-full gap-2.5">
                            {/* Person's Full Name (Prominently displayed on the QR stub) */}
                            <div className={`w-full px-2.5 py-1.5 rounded-lg border flex flex-col items-center text-center ${
                                isStubDark ? 'bg-white/10 border-white/10' : 'bg-slate-50/90 border-slate-100'
                            }`}>
                                <div className="flex items-center gap-1 text-[8px] font-mono font-bold tracking-widest text-slate-400 uppercase">
                                    <Users className="w-2.5 h-2.5 text-slate-400" />
                                    <span>PASS HOLDER</span>
                                </div>
                                <div className={`text-sm sm:text-base font-black font-sans tracking-tight leading-snug break-words ${
                                    isStubDark ? 'text-white' : 'text-slate-900'
                                }`}>
                                    {activeTicket.attendee_name}
                                </div>
                            </div>

                            {/* Dynamic QR Code Container */}
                            <div className="p-2.5 bg-white rounded-xl shadow-xs border border-slate-100 flex items-center justify-center">
                                <img 
                                    src={activeQrDataUri} 
                                    alt={`Gate QR Pass #${activeTicket.ticket_number}`} 
                                    className="w-28 h-28 sm:w-32 sm:h-32 block object-contain"
                                />
                            </div>

                            {/* Check-in Code */}
                            <div className="text-center">
                                <span className="text-[8px] font-mono tracking-widest text-slate-400 uppercase block font-semibold">
                                    CHECK-IN CODE
                                </span>
                                <div className={`mt-0.5 text-base sm:text-lg font-mono font-black tracking-[0.16em] ${
                                    isStubDark ? 'text-white' : 'text-slate-900'
                                }`}>
                                    {activeTicket.unique_code}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>

            {/* Standard Platform Footer */}
            <div className="no-print w-full">
                <KardovoFooter lang={lang} />
            </div>

            {/* Contact Us Modal - Variety of Options (WhatsApp, Phone, Email) */}
            <Modal show={showContactModal} onClose={() => setShowContactModal(false)} maxWidth="md" closeable={true} translucent={true}>
                <div className="relative p-6 sm:p-8 bg-white dark:bg-[#0B2545] rounded-3xl text-slate-800 dark:text-white shadow-2xl">
                    {/* Close Button */}
                    <button 
                        type="button"
                        onClick={() => setShowContactModal(false)}
                        className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white transition-all cursor-pointer border border-slate-200/80 dark:border-white/15 shadow-2xs"
                        aria-label="Close modal"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    {/* Modal Header */}
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sky-100 dark:bg-[#154F7C]/40 text-[#154F7C] dark:text-sky-300 mb-3.5 shadow-sm border border-sky-200/60 dark:border-sky-400/20">
                            <MessageCircle className="w-7 h-7" />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black font-display tracking-tight text-slate-900 dark:text-white">
                            {lang === 'sw' ? 'Wasiliana Nasi' : 'Contact Us'}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-300/90 mt-1 max-w-sm mx-auto">
                            {lang === 'sw' 
                                ? 'Tuko hapa kukusaidia saa 24/7 kuhusu tiketi za matukio, mialiko ya kidigitali na malipo.'
                                : 'We are here 24/7 to assist you with event tickets, invitations, check-ins, and payments.'}
                        </p>
                    </div>

                    {/* Variety of Contact Options */}
                    <div className="space-y-3">
                        {/* 1. WhatsApp Option */}
                        <a
                            href="https://wa.me/255737672987?text=Habari%20Kardovo,%20nahitaji%20msaada%20kuhusu%20huduma%20zenu."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center justify-between p-4 rounded-2xl bg-emerald-50/70 hover:bg-emerald-50 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 border border-emerald-200/70 dark:border-emerald-500/30 transition-all duration-200 shadow-2xs hover:shadow-md cursor-pointer"
                        >
                            <div className="flex items-center gap-3.5">
                                <div className="w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                                    <WhatsAppIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                                            {lang === 'sw' ? 'Msaada kupitia WhatsApp' : 'Chat on WhatsApp'}
                                        </span>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-400/20 dark:text-emerald-300">
                                            {lang === 'sw' ? 'Haraka Zaidi' : 'Fastest'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-300 font-mono mt-0.5">+255 737 672 987</p>
                                </div>
                            </div>
                            <div className="text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
                                <ArrowRight className="w-5 h-5" />
                            </div>
                        </a>

                        {/* 2. Direct Phone Call */}
                        <a
                            href="tel:+255737672987"
                            className="group flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] border border-slate-200/80 dark:border-white/10 transition-all duration-200 shadow-2xs hover:shadow-md cursor-pointer"
                        >
                            <div className="flex items-center gap-3.5">
                                <div className="w-11 h-11 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                                        {lang === 'sw' ? 'Piga Simu Moja kwa Moja' : 'Call Support Directly'}
                                    </span>
                                    <p className="text-xs text-slate-500 dark:text-slate-300 font-mono mt-0.5">+255 737 672 987</p>
                                </div>
                            </div>
                            <div className="text-sky-600 dark:text-sky-400 group-hover:translate-x-1 transition-transform">
                                <ArrowRight className="w-5 h-5" />
                            </div>
                        </a>

                        {/* 3. Official Email */}
                        <a
                            href="mailto:support@kardovo.com?subject=Kardovo%20Ticket%20Inquiry"
                            className="group flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] border border-slate-200/80 dark:border-white/10 transition-all duration-200 shadow-2xs hover:shadow-md cursor-pointer"
                        >
                            <div className="flex items-center gap-3.5">
                                <div className="w-11 h-11 rounded-xl bg-[#154F7C] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                                        {lang === 'sw' ? 'Tuma Barua Pepe (Email)' : 'Official Email Support'}
                                    </span>
                                    <p className="text-xs text-slate-500 dark:text-slate-300 font-mono mt-0.5">support@kardovo.com</p>
                                </div>
                            </div>
                            <div className="text-slate-600 dark:text-slate-400 group-hover:translate-x-1 transition-transform">
                                <ArrowRight className="w-5 h-5" />
                            </div>
                        </a>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
