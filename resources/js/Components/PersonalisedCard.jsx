import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { toPng } from 'html-to-image';
import KardovoLogo from '@/Components/KardovoLogo';
import { 
    Calendar, 
    MapPin, 
    Clock, 
    ShieldCheck, 
    Ticket, 
    Download, 
    Printer, 
    Sparkles, 
    CheckCircle2, 
    Heart, 
    PartyPopper, 
    Building2, 
    Crown,
    Star,
    Award,
    Loader2,
    Check
} from 'lucide-react';

// Helper to determine if a hex color is dark
function isColorDark(hex) {
    if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return false;
    let c = hex.substring(1);
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    if (c.length !== 6) return false;
    const r = parseInt(c.substr(0, 2), 16);
    const g = parseInt(c.substr(2, 2), 16);
    const b = parseInt(c.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.55;
}

export default function PersonalisedCard({ 
    guest, 
    event, 
    template, 
    interactive = false,
    onDownload,
    className = "" 
}) {
    const cardRef = useRef(null);
    const [qrDataUrl, setQrDataUrl] = useState('');
    const [isExporting, setIsExporting] = useState(false);

    // Guest data with smart fallbacks
    const guestName = guest?.name || 'Alfred Mashauri';
    const eventTitle = event?.title || 'Neema & Baraka — Wedding Reception';
    const eventDate = event?.event_date ? (
        typeof event.event_date === 'string' && event.event_date.match(/^\d{4}-\d{2}-\d{2}/)
            ? new Date(event.event_date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
            : event.event_date
    ) : 'Monday, 14 September 2026';
    const eventTime = event?.event_time || '4:00 PM — Reception & Dinner';
    const venue = event?.venue || 'Kunduchi Beach Gardens, Dar es Salaam';
    const cardNumber = guest?.card_number || 'KDV-2026-004821';
    const uniqueCode = guest?.unique_code || '29841872';
    const qrToken = guest?.qr_token || 'kdv_alfred_mashauri_29841872';
    const category = guest?.category || 'Double Entry';
    const maxEntries = guest?.max_entries || 2;
    const allowanceLabel = guest?.allowance_label || (maxEntries > 1 ? `DOUBLE ENTRY • 2X` : 'SINGLE ENTRY ACCESS');
    const categoryText = guest?.category || (maxEntries > 1 ? 'Double Entry' : 'Single Entry');

    // Template properties
    const templateType = template?.template_type || (template?.image_path && !template?.elements_config?.bg_mode ? 'custom_art' : 'gradient_card');
    const imagePath = template?.image_path || null;
    const elementsConfig = template?.elements_config || {};

    // Background Mode & Colors for Signature Pass
    const bgMode = elementsConfig.bg_mode || (template?.template_type === 'gradient_card' ? (elementsConfig.bg_solid_color ? 'solid' : 'gradient') : (imagePath ? 'image' : 'gradient'));
    const bgSolidColor = elementsConfig.bg_solid_color || '#FFFFFF';
    const bgImage = elementsConfig.bg_image || imagePath || null;
    const bgOverlayOpacity = typeof elementsConfig.bg_overlay_opacity !== 'undefined' ? parseFloat(elementsConfig.bg_overlay_opacity) : 0.35;

    const brandColorFrom = template?.brand_color_from || '#EBF4FF';
    const brandColorTo = template?.brand_color_to || '#C7E2FE';
    const headline = elementsConfig.headline_text || template?.headline || 'EXCLUSIVE INVITATION PASS';
    const footerText = elementsConfig.footer_text || template?.footer_text || 'Secured & verified by KARDOVO';

    // Accent color logic
    const accentColor = template?.brand_color_to && template.brand_color_to.startsWith('#') && template.brand_color_to !== '#FFFFFF' 
        ? template.brand_color_to 
        : '#0070BA';

    // Check if background is dark for contrast calculations
    const isDarkBg = bgMode === 'image' 
        ? true 
        : bgMode === 'solid' 
            ? isColorDark(bgSolidColor) 
            : isColorDark(brandColorFrom) || isColorDark(brandColorTo);

    // Text & Container Palette depending on Light/Dark background
    const defaultTextPrimary = isDarkBg ? '#FFFFFF' : '#0F172A';
    const defaultTextSecondary = isDarkBg ? '#94A3B8' : '#64748B';
    const innerContainerBg = isDarkBg 
        ? (bgMode === 'image' ? 'rgba(8, 16, 28, 0.82)' : 'rgba(5, 12, 22, 0.88)') 
        : 'rgba(255, 255, 255, 0.94)';
    const innerContainerBorder = isDarkBg 
        ? '1px solid rgba(255, 255, 255, 0.15)' 
        : '1px solid rgba(226, 232, 240, 0.9)';
    const cardSurfaceBg = isDarkBg 
        ? 'rgba(10, 22, 38, 0.75)' 
        : '#F8FAFC';
    const cardSurfaceBorder = isDarkBg 
        ? '1px solid rgba(255, 255, 255, 0.12)' 
        : '1px solid #E2E8F0';

    // Check if this is the Adel & Laila Engagement Burgundy template
    const isEngagement = elementsConfig?.theme === 'engagement_burgundy' || 
        (imagePath && imagePath.includes('adel_laila')) ||
        (template?.name && template.name.toLowerCase().includes('adel'));

    const isZamroth = elementsConfig?.theme === 'wedding_gold' ||
        (imagePath && imagePath.includes('zamroth_husna')) ||
        (template?.name && template.name.toLowerCase().includes('zamroth'));

    const isPredefinedCustomArt = isEngagement || isZamroth || template?.is_predefined === true || template?.user_id === null;

    const _ignore = '' || 
        (imagePath && imagePath.includes('adel_laila')) ||
        (template?.name && template.name.toLowerCase().includes('adel'));

    // Custom art text fields
    const headlineText = elementsConfig.headline_text || template?.headline || (isEngagement ? 'Engagement Invitation' : 'WEDDING INVITATION');
    const coupleNames = elementsConfig.couple_names || (isEngagement ? 'Adel & Laila' : 'Zamroth & Husna');
    const subtitleText = elementsConfig.subtitle_text || 'We invite your pleasure to come to our Engagement Party of';
    const dateMonth = elementsConfig.date_month || (isEngagement ? 'APRIL' : 'JANUARY');
    const dateDayName = elementsConfig.date_day_name || (isEngagement ? 'FRIDAY' : 'SUNDAY');
    const dateDayNum = elementsConfig.date_day_num || (isEngagement ? '26' : '4');
    const dateTime = elementsConfig.date_time || (isEngagement ? '8:30 PM' : 'AT 11:00 AM');
    const dateYear = elementsConfig.date_year || '2026';
    const invitationQuote = elementsConfig.invitation_quote || (isEngagement ? 'CELEBRATING LOVE & PROMISE' : 'WE INVITE YOU TO WITNESS THE BEGINNING OF OUR FOREVER, TOGETHER WITH OUR FAMILIES.');
    const venueName = elementsConfig.venue_name || (isEngagement ? 'DAR ES SALAAM SERENA HOTEL' : 'ANGKORBAN');
    const venueSub = elementsConfig.venue_sub || (isEngagement ? 'tanzania' : 'kongmeah, kampongcham');
    const venueDate = elementsConfig.venue_date || (isEngagement ? '26.04.2026' : '04.01.2026');
    const saveTheDate = elementsConfig.save_the_date || 'SAVE THE DATE';

    // Signature Pass adjustable text elements
    const headlineFontSize = parseFloat(elementsConfig.headline_size) || 11.5;
    const headlineSpacing = elementsConfig.headline_spacing || '0.22em';
    const headlineColor = elementsConfig.headline_color || accentColor;

    const eventTitleFontSize = parseFloat(elementsConfig.event_title_size) || 21;
    const eventTitleColor = elementsConfig.event_title_color || defaultTextPrimary;
    const eventTitleFontFamily = elementsConfig.event_title_font || 'system-ui, -apple-system, sans-serif';
    const eventTitleFontWeight = elementsConfig.event_title_weight || '900';

    const datePillFontSize = parseFloat(elementsConfig.date_pill_size) || 12;
    const datePillColor = elementsConfig.date_pill_color || (isDarkBg ? '#E2E8F0' : '#334155');
    const datePillBg = elementsConfig.date_pill_bg || (isDarkBg ? 'rgba(15, 30, 50, 0.7)' : '#F8FAFC');

    const plaqueHeaderLabel = elementsConfig.plaque_header_text || 'INVITATION PASS ISSUED TO';
    const plaqueHeaderFontSize = parseFloat(elementsConfig.plaque_header_size) || 9;
    const plaqueHeaderColor = elementsConfig.plaque_header_color || accentColor;

    const scheduleLabel = elementsConfig.schedule_label_text || 'SCHEDULE';
    const scheduleFontSize = parseFloat(elementsConfig.schedule_size) || 13;
    const scheduleColor = elementsConfig.schedule_color || defaultTextPrimary;

    const venueLabel = elementsConfig.venue_label_text || 'VENUE LOCATION';
    const venueFontSize = parseFloat(elementsConfig.venue_size) || 13;
    const venueColor = elementsConfig.venue_color || defaultTextPrimary;

    const footerFontSize = parseFloat(elementsConfig.footer_size) || 10;
    const footerColor = elementsConfig.footer_color || defaultTextSecondary;

    // Custom Art element adjustments
    const coupleNamesFontSize = parseFloat(elementsConfig.couple_names_size) || (isEngagement ? 44 : 40);
    const coupleNamesColor = elementsConfig.couple_names_color || (isEngagement ? '#7A1E28' : '#FFFFFF');
    const coupleNamesFontFamily = elementsConfig.couple_names_font || 'Georgia, "Playfair Display", serif';
    const coupleNamesY = parseFloat(elementsConfig.couple_names_y) || (isEngagement ? 22.5 : 13.5);

    const subtitleFontSize = parseFloat(elementsConfig.subtitle_size) || 9.5;
    const subtitleColor = elementsConfig.subtitle_color || (isEngagement ? '#7A1E28' : '#FFFFFF');

    const dateFontSize = parseFloat(elementsConfig.date_size) || (isEngagement ? 11 : 10.5);
    const dateColor = elementsConfig.date_color || (isEngagement ? '#7A1E28' : '#FFFFFF');
    const dateNumColor = elementsConfig.date_num_color || (isEngagement ? '#7A1E28' : '#FDE68A');
    const dateY = parseFloat(elementsConfig.date_y) || (isEngagement ? 38.5 : 51.5);

    const quoteFontSize = parseFloat(elementsConfig.quote_size) || 8.5;
    const quoteColor = elementsConfig.quote_color || (isEngagement ? 'rgba(122, 30, 40, 0.9)' : 'rgba(255, 255, 255, 0.95)');

    const customVenueFontSize = parseFloat(elementsConfig.custom_venue_size) || 8;
    const customVenueColor = elementsConfig.custom_venue_color || (isEngagement ? '#7A1E28' : '#FFFFFF');

    // Dynamic placement configs (used by BOTH custom_art AND gradient_card)
    const nameCfg = elementsConfig.guest_name || { 
        x: 50, 
        y: 71.5, 
        fontSize: isEngagement ? 18 : 34, 
        color: isEngagement ? '#54101A' : defaultTextPrimary, 
        fontFamily: 'Georgia, serif', 
        fontWeight: '800', 
        plaqueWidth: 84 
    };
    const rawHeadlineY = elementsConfig.headline_y ?? elementsConfig.category_badge?.y;
    const headlineYPos = typeof rawHeadlineY !== 'undefined' && rawHeadlineY !== '' && !isNaN(parseFloat(rawHeadlineY)) 
        ? parseFloat(rawHeadlineY) 
        : (isEngagement ? 5.2 : 5.5);
    const badgeCfg = elementsConfig.category_badge || { 
        x: 50, 
        y: headlineYPos, 
        fontSize: isEngagement ? 12 : 10, 
        color: isEngagement ? '#7A1E28' : accentColor, 
        fontFamily: isEngagement ? 'cursive, Georgia, serif' : 'sans-serif', 
        fontWeight: '700' 
    };
    const qrCfg = elementsConfig.qr_code || { 
        x: 50, 
        y: 85.5, 
        size: isEngagement ? 70 : 140, 
        darkColor: isEngagement ? '#6B1D2F' : '#0F172A', 
        lightColor: '#FFFFFF' 
    };
    const allowanceCfg = elementsConfig.allowance_badge || {
        x: 50,
        y: 78.5,
        fontSize: 10,
        color: '#FDE68A',
        fontFamily: 'sans-serif',
        fontWeight: '800',
        plaqueWidth: 84,
        hide_badge_box: false
    };
    const cardNumCfg = elementsConfig.card_number || { 
        x: 50, 
        y: 96, 
        fontSize: isEngagement ? 9.5 : 28, 
        color: isEngagement ? '#7A1E28' : defaultTextPrimary 
    };

    useEffect(() => {
        let isMounted = true;
        const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8000';
        const scanUrl = `${origin}/card/${qrToken}`;

        QRCode.toDataURL(scanUrl, {
            width: 400,
            margin: 1,
            color: {
                dark: qrCfg.darkColor || (isEngagement ? '#6B1D2F' : '#0F172A'),
                light: '#FFFFFF',
            },
            errorCorrectionLevel: 'M',
        }).then((url) => {
            if (isMounted) setQrDataUrl(url);
        }).catch((err) => {
            console.warn('QR Code generation notice:', err);
        });

        return () => { isMounted = false; };
    }, [qrToken, cardNumber, qrCfg.darkColor, qrCfg.size, isEngagement]);

    const handlePrint = async () => {
        const cardNode = cardRef.current || document.getElementById("kardovo-invitation-card");
        if (!cardNode) {
            window.print();
            return;
        }
        try {
            setIsExporting(true);
            const dataUrl = await toPng(cardNode, {
                pixelRatio: 4,
                cacheBust: true,
            });

            // Create hidden printing iframe
            let printFrame = document.getElementById("kardovo-card-print-frame");
            if (printFrame) {
                printFrame.remove();
            }
            printFrame = document.createElement("iframe");
            printFrame.id = "kardovo-card-print-frame";
            printFrame.style.position = "fixed";
            printFrame.style.top = "-9999px";
            printFrame.style.left = "-9999px";
            printFrame.style.width = "0";
            printFrame.style.height = "0";
            printFrame.style.border = "none";
            document.body.appendChild(printFrame);

            const frameDoc = printFrame.contentWindow || printFrame.contentDocument;
            const doc = frameDoc.document || frameDoc;
            doc.open();
            doc.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Kardovo Pass - ${guestName}</title>
                    <style>
                        @page {
                            size: portrait;
                            margin: 0;
                        }
                        * {
                            box-sizing: border-box;
                            margin: 0;
                            padding: 0;
                        }
                        html, body {
                            width: 100%;
                            height: 100%;
                            background-color: #FFFFFF;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        .sheet-wrapper {
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            width: 100%;
                            min-height: 100vh;
                            padding: 20mm 10mm;
                            page-break-inside: avoid;
                            page-break-after: avoid;
                        }
                        .card-container {
                            width: 100%;
                            max-width: 105mm;
                            display: flex;
                            justify-content: center;
                            page-break-inside: avoid;
                        }
                        img {
                            width: 100%;
                            height: auto;
                            display: block;
                            border-radius: 20px;
                            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                            image-rendering: -webkit-optimize-contrast;
                        }
                        @media print {
                            body {
                                background: transparent;
                            }
                            .sheet-wrapper {
                                min-height: 100vh;
                                padding: 15mm 0;
                            }
                            img {
                                box-shadow: none !important;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="sheet-wrapper">
                        <div class="card-container">
                            <img src="${dataUrl}" alt="Kardovo Invitation Pass" onload="setTimeout(() => { window.focus(); window.print(); }, 200);" />
                        </div>
                    </div>
                </body>
                </html>
            `);
            doc.close();
        } catch (err) {
            console.error("Error generating print card preview:", err);
            window.print();
        } finally {
            setIsExporting(false);
        }
    };

    const handleDownloadCanvas = async () => {
        if (onDownload) {
            onDownload();
            return;
        }
        const cardNode = cardRef.current || document.getElementById('kardovo-invitation-card');
        if (!cardNode) return;
        try {
            setIsExporting(true);
            const dataUrl = await toPng(cardNode, {
                pixelRatio: 4,
                cacheBust: true,
            });
            const link = document.createElement('a');
            link.download = `kardovo_pass_${guestName.toLowerCase().replace(/\s+/g, '_')}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Error exporting card image:', err);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className={`flex flex-col items-center ${className}`}>
            
            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* 1. CUSTOM ART / PHOTO PASS (Vertical 4K Poster)                 */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {templateType === 'custom_art' && imagePath ? (
                isPredefinedCustomArt ? (
                    /* ═══════════ PREDEFINED TEMPLATE (Zamroth & Husna / Adel & Laila) ═══════════ */
                    <div 
                        ref={cardRef}
                        id="kardovo-invitation-card"
                        className="w-full max-w-[410px] rounded-3xl overflow-hidden shadow-2xl border border-slate-700/80 relative select-none bg-[#121212] group transition-all"
                        style={{ aspectRatio: '1 / 1.48' }}
                    >
                        <img src={imagePath} alt="Invitation Template" className="w-full h-full object-cover pointer-events-none absolute inset-0" />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/35 pointer-events-none" />

                        {/* Top Headline / Badge */}
                        {template?.show_category_badge !== false && template?.show_headline !== false && elementsConfig.show_headline !== false && elementsConfig.show_category_badge !== false && (
                            isEngagement ? (
                                <div 
                                    className="absolute -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none px-4 py-1 rounded-full bg-white/75 backdrop-blur-xs border border-[#7A1E28]/30 shadow-sm transition-all whitespace-nowrap z-20"
                                    style={{
                                        left: `${badgeCfg.x || 50}%`, top: `${headlineYPos || badgeCfg.y || 5.2}%`,
                                        color: badgeCfg.color || '#7A1E28', fontSize: `${badgeCfg.fontSize || 12}px`,
                                        fontFamily: badgeCfg.fontFamily || 'cursive, "Playfair Display", Georgia, serif', 
                                        fontWeight: badgeCfg.fontWeight || '700',
                                        fontStyle: 'italic',
                                        letterSpacing: '0.08em',
                                    }}
                                >
                                    <span>{headlineText}</span>
                                </div>
                            ) : (
                                <div 
                                    className="absolute -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none px-3.5 py-0.5 rounded-full bg-black/40 backdrop-blur-xs border border-white/20 shadow-md transition-all whitespace-nowrap z-20"
                                    style={{
                                        left: `${badgeCfg.x || 50}%`, top: `${headlineYPos || badgeCfg.y || 5.5}%`,
                                        color: badgeCfg.color || '#FFFFFF', fontSize: `${badgeCfg.fontSize || 10.5}px`,
                                        fontFamily: badgeCfg.fontFamily || 'sans-serif', fontWeight: badgeCfg.fontWeight || '700',
                                        letterSpacing: '0.22em', textTransform: 'uppercase',
                                    }}
                                >
                                    <span>{headlineText}</span>
                                </div>
                            )
                        )}

                        {/* Couple Names / Header Section */}
                        {elementsConfig.show_couple_names !== false && elementsConfig.show_title !== false && (
                            <div className="absolute -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none px-4 z-10 space-y-0.5" style={{ left: '50%', top: `${coupleNamesY}%` }}>
                                {isEngagement && (
                                    <div 
                                        className="font-medium tracking-wide px-4 drop-shadow-xs leading-tight mb-1"
                                        style={{ 
                                            fontSize: `${subtitleFontSize}px`, 
                                            color: subtitleColor 
                                        }}
                                    >
                                        {subtitleText}
                                    </div>
                                )}
                                <h1 
                                    className="tracking-wide transition-all leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
                                    style={{ 
                                        fontSize: `${coupleNamesFontSize}px`, 
                                        color: coupleNamesColor,
                                        fontFamily: coupleNamesFontFamily,
                                        fontStyle: 'italic',
                                        textShadow: isEngagement ? '0 1px 4px rgba(255,255,255,0.9)' : '0 2px 10px rgba(0,0,0,0.8), 0 4px 20px rgba(0,0,0,0.6)' 
                                    }}
                                >
                                    {coupleNames}
                                </h1>
                            </div>
                        )}

                        {/* Date & Details Section */}
                        {elementsConfig.show_date !== false && elementsConfig.show_date_details !== false && (
                            <div className="absolute -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none px-6 z-10 space-y-1.5" style={{ left: '50%', top: `${dateY}%` }}>
                                {isEngagement ? (
                                    /* Adel & Laila Engagement Burgundy Lockup */
                                    <>
                                        <div className="flex flex-col items-center justify-center">
                                            <div 
                                                className="font-bold uppercase tracking-[0.25em] mb-1 drop-shadow-xs"
                                                style={{ fontSize: `${dateFontSize}px`, color: dateColor }}
                                            >
                                                {dateMonth} {dateYear}
                                            </div>
                                            <div className="inline-flex items-center justify-center gap-2.5 bg-white/75 backdrop-blur-[2px] px-3.5 py-1 rounded-sm border border-[#7A1E28]/20 shadow-xs">
                                                <div className="flex flex-col items-center">
                                                    <span style={{ width: `${dateFontSize * 4.2}px`, height: '1px', backgroundColor: 'rgba(122, 30, 40, 0.6)', marginBottom: '2px' }} />
                                                    <span 
                                                        className="font-extrabold uppercase tracking-[0.14em]"
                                                        style={{ fontSize: `${dateFontSize * 0.9}px`, color: dateColor }}
                                                    >
                                                        {dateDayName}
                                                    </span>
                                                    <span style={{ width: `${dateFontSize * 4.2}px`, height: '1px', backgroundColor: 'rgba(122, 30, 40, 0.6)', marginTop: '2px' }} />
                                                </div>
                                                <span 
                                                    className="font-serif italic font-bold px-1 leading-none"
                                                    style={{ fontSize: `${dateFontSize * 2.2}px`, color: dateNumColor }}
                                                >
                                                    {dateDayNum}
                                                </span>
                                                <div className="flex flex-col items-center">
                                                    <span style={{ width: `${dateFontSize * 4.2}px`, height: '1px', backgroundColor: 'rgba(122, 30, 40, 0.6)', marginBottom: '2px' }} />
                                                    <span 
                                                        className="font-extrabold uppercase tracking-[0.1em]"
                                                        style={{ fontSize: `${dateFontSize * 0.85}px`, color: dateColor }}
                                                    >
                                                        {dateTime}
                                                    </span>
                                                    <span style={{ width: `${dateFontSize * 4.2}px`, height: '1px', backgroundColor: 'rgba(122, 30, 40, 0.6)', marginTop: '2px' }} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quote / Tagline */}
                                        {elementsConfig.show_quote !== false && invitationQuote && (
                                            <p className="font-semibold uppercase tracking-[0.14em] leading-relaxed drop-shadow-xs px-2 pt-0.5" style={{ fontSize: `${quoteFontSize}px`, color: quoteColor }}>
                                                {invitationQuote}
                                            </p>
                                        )}

                                        {/* Venue & Location Details */}
                                        {elementsConfig.show_venue !== false && (
                                            <div className="uppercase tracking-widest font-semibold pt-0.5 space-y-0.5" style={{ fontSize: `${customVenueFontSize}px`, color: customVenueColor }}>
                                                <div className="tracking-[0.18em] font-extrabold">{venueName}</div>
                                                {venueSub && <div className="lowercase opacity-85" style={{ fontSize: `${customVenueFontSize * 0.88}px` }}>{venueSub}</div>}
                                                {venueDate && <div className="tracking-wider opacity-85">{venueDate}</div>}
                                                {saveTheDate && <div className="font-extrabold tracking-[0.25em] pt-0.5">{saveTheDate}</div>}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    /* Zamroth & Husna Romantic Gold Lockup */
                                    <>
                                        <div className="font-bold uppercase tracking-[0.25em] drop-shadow-sm" style={{ fontSize: `${dateFontSize}px`, color: dateColor }}>{dateMonth}</div>
                                        <div className="flex items-center justify-center gap-3 uppercase font-extrabold tracking-widest drop-shadow-sm" style={{ fontSize: `${dateFontSize * 1.05}px`, color: dateColor }}>
                                            <span>{dateDayName}</span>
                                            <span className="font-serif italic font-normal mx-1 drop-shadow-md" style={{ fontSize: `${dateFontSize * 1.8}px`, color: dateNumColor }}>{dateDayNum}</span>
                                            <span>{dateTime}</span>
                                        </div>
                                        <div className="font-bold tracking-widest drop-shadow-sm" style={{ fontSize: `${dateFontSize}px`, color: dateColor }}>{dateYear}</div>
                                        
                                        {elementsConfig.show_quote !== false && invitationQuote && (
                                            <p className="font-bold uppercase tracking-wider leading-relaxed drop-shadow-md px-1 pt-0.5" style={{ fontSize: `${quoteFontSize}px`, color: quoteColor }}>{invitationQuote}</p>
                                        )}

                                        {elementsConfig.show_venue !== false && (
                                            <div className="uppercase tracking-widest font-semibold pt-0.5 space-y-0.5" style={{ fontSize: `${customVenueFontSize}px`, color: customVenueColor }}>
                                                <div className="tracking-[0.2em] font-bold" style={{ color: dateNumColor }}>{venueName}</div>
                                                <div className="lowercase font-normal opacity-90" style={{ fontSize: `${customVenueFontSize * 0.9}px` }}>{venueSub}</div>
                                                <div className="tracking-wider opacity-80">{venueDate}</div>
                                                <div className="font-extrabold tracking-[0.25em] pt-0.5">{saveTheDate}</div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {/* Guest Plaque */}
                        {elementsConfig.show_guest_name !== false && (
                            <div 
                                className="absolute -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none transition-all z-20"
                                style={{ 
                                    left: `${nameCfg.x || 50}%`, 
                                    top: `${nameCfg.y || 71.5}%`, 
                                    width: `${nameCfg.plaqueWidth || 84}%`,
                                }}
                            >
                                {isEngagement ? (
                                    <div 
                                        className="py-2 px-4 rounded-2xl backdrop-blur-xl shadow-2xl transition-all"
                                        style={{ 
                                            background: 'rgba(255, 255, 255, 0.45)',
                                            border: '1px solid rgba(255, 255, 255, 0.8)',
                                            boxShadow: '0 10px 30px rgba(122, 30, 40, 0.12), inset 0 1px 2px rgba(255, 255, 255, 0.85)',
                                        }}
                                    >
                                        <div className="text-[7.5px] text-[#7A1E28]/90 uppercase tracking-[0.22em] font-black">INVITATION PASS ISSUED TO</div>
                                        <div className="font-black font-serif tracking-wider uppercase mt-0.5 drop-shadow-xs truncate"
                                            style={{ 
                                                color: nameCfg.color && nameCfg.color !== '#FFFFFF' ? nameCfg.color : '#54101A', 
                                                fontSize: `${nameCfg.fontSize || 18}px`, 
                                                fontFamily: nameCfg.fontFamily || 'Georgia, serif', 
                                                fontWeight: nameCfg.fontWeight || '800' 
                                            }}>
                                            {guestName}
                                        </div>
                                        <div className="text-[8.5px] text-[#7A1E28] font-black tracking-widest uppercase mt-0.5">{allowanceLabel}</div>
                                    </div>
                                ) : (
                                    <div 
                                        className="py-2.5 px-4 rounded-2xl backdrop-blur-xl shadow-2xl transition-all"
                                        style={{ 
                                            background: 'rgba(0, 0, 0, 0.55)',
                                            border: '1px solid rgba(255, 255, 255, 0.3)',
                                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
                                        }}
                                    >
                                        <div className="text-[8px] text-white/80 uppercase tracking-[0.22em] font-bold">INVITATION PASS ISSUED TO</div>
                                        <div className="font-black font-serif tracking-wider uppercase mt-0.5 drop-shadow-sm truncate"
                                            style={{ 
                                                color: nameCfg.color || '#FFFFFF', 
                                                fontSize: `${nameCfg.fontSize || 19}px`, 
                                                fontFamily: nameCfg.fontFamily || 'Georgia, serif', 
                                                fontWeight: nameCfg.fontWeight || '800' 
                                            }}>
                                            {guestName}
                                        </div>
                                        <div className="text-[9px] text-amber-300 font-extrabold tracking-widest uppercase mt-0.5">{allowanceLabel}</div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* QR Code Pass */}
                        {template?.show_qr !== false && elementsConfig.show_qr !== false && (
                            <div className="absolute -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none transition-all drop-shadow-2xl z-20"
                                style={{ left: `${qrCfg.x || 50}%`, top: `${qrCfg.y || 85.5}%` }}>
                                <div className="p-1 bg-white rounded-xl shadow-2xl inline-block border border-slate-200/80">
                                    {qrDataUrl ? (
                                        <img src={qrDataUrl} alt="QR Pass" style={{ width: `${parseFloat(qrCfg.size) || 72}px`, height: `${parseFloat(qrCfg.size) || 72}px` }} className="rounded-lg block" />
                                    ) : (
                                        <div style={{ width: `${parseFloat(qrCfg.size) || 72}px`, height: `${parseFloat(qrCfg.size) || 72}px` }} className="bg-slate-200 animate-pulse rounded-lg" />
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Security Verification Code */}
                        {template?.show_unique_code !== false && elementsConfig.show_unique_code !== false && (
                            <div className="absolute -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none font-mono transition-all drop-shadow-md z-20"
                                style={{ left: `${cardNumCfg.x || 50}%`, top: `${cardNumCfg.y || 96}%`, color: isEngagement ? '#7A1E28' : (cardNumCfg.color || '#FFFFFF'), fontSize: `${cardNumCfg.fontSize || 9.5}px`, letterSpacing: '0.22em', fontWeight: 'bold', textShadow: isEngagement ? '0 1px 2px rgba(255,255,255,0.8)' : '0 2px 4px rgba(0,0,0,0.8)' }}>
                                <span>{uniqueCode}</span>
                            </div>
                        )}
                    </div>
                ) : (
                    /* ═══════════ UPLOADED CUSTOM ARTWORK (All 9 Layers Dynamically Controlled) ═══════════ */
                    <div 
                        ref={cardRef}
                        id="kardovo-invitation-card"
                        className="w-full max-w-[410px] rounded-3xl overflow-hidden shadow-2xl border border-slate-700/80 relative select-none bg-[#121212] group transition-all"
                        style={{ aspectRatio: '1 / 1.48' }}
                    >
                        {/* Background Artwork */}
                        <img src={imagePath} alt="Invitation Template" className="w-full h-full object-cover pointer-events-none absolute inset-0" />

                        {/* Top Headline Banner / Badge */}
                        {template?.show_category_badge !== false && template?.show_headline !== false && elementsConfig.show_headline !== false && elementsConfig.show_category_badge !== false && (
                            <div 
                                className="absolute -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none px-3.5 py-0.5 rounded-full bg-black/40 backdrop-blur-xs border border-white/20 shadow-md transition-all whitespace-nowrap z-20"
                                style={{
                                    left: `${badgeCfg.x || 50}%`, 
                                    top: `${headlineYPos}%`,
                                    color: badgeCfg.color || '#FFFFFF', 
                                    fontSize: `${badgeCfg.fontSize || 10.5}px`,
                                    fontFamily: badgeCfg.fontFamily || 'sans-serif', 
                                    fontWeight: badgeCfg.fontWeight || '700',
                                    letterSpacing: '0.22em', 
                                    textTransform: 'uppercase',
                                }}
                            >
                                <span>{headlineText}</span>
                            </div>
                        )}

                        {/* Couple Names / Header Section */}
                        {elementsConfig.show_couple_names !== false && elementsConfig.show_title !== false && coupleNames && (
                            <div className="absolute -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none px-4 z-10 space-y-0.5" style={{ left: '50%', top: `${coupleNamesY}%` }}>
                                {subtitleText && (
                                    <div 
                                        className="font-medium tracking-wide px-4 drop-shadow-xs leading-tight mb-1"
                                        style={{ 
                                            fontSize: `${subtitleFontSize}px`, 
                                            color: subtitleColor 
                                        }}
                                    >
                                        {subtitleText}
                                    </div>
                                )}
                                <h1 
                                    className="tracking-wide transition-all leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
                                    style={{ 
                                        fontSize: `${coupleNamesFontSize}px`, 
                                        color: coupleNamesColor,
                                        fontFamily: coupleNamesFontFamily,
                                        fontStyle: 'italic',
                                        textShadow: '0 2px 10px rgba(0,0,0,0.8), 0 4px 20px rgba(0,0,0,0.6)' 
                                    }}
                                >
                                    {coupleNames}
                                </h1>
                            </div>
                        )}

                        {/* Date & Details Section */}
                        {elementsConfig.show_date !== false && elementsConfig.show_date_details !== false && (
                            <div className="absolute -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none px-6 z-10 space-y-1" style={{ left: '50%', top: `${dateY}%` }}>
                                <div className="font-bold uppercase tracking-[0.25em] drop-shadow-sm" style={{ fontSize: `${dateFontSize}px`, color: dateColor }}>{dateMonth}</div>
                                <div className="flex items-center justify-center gap-3 uppercase font-extrabold tracking-widest drop-shadow-sm" style={{ fontSize: `${dateFontSize * 1.05}px`, color: dateColor }}>
                                    <span>{dateDayName}</span>
                                    <span className="font-serif italic font-normal mx-1 drop-shadow-md" style={{ fontSize: `${dateFontSize * 1.8}px`, color: dateNumColor }}>{dateDayNum}</span>
                                    <span>{dateTime}</span>
                                </div>
                                <div className="font-bold tracking-widest drop-shadow-sm" style={{ fontSize: `${dateFontSize}px`, color: dateColor }}>{dateYear}</div>
                                
                                {elementsConfig.show_quote !== false && invitationQuote && (
                                    <p className="font-bold uppercase tracking-wider leading-relaxed drop-shadow-md px-1 pt-0.5" style={{ fontSize: `${quoteFontSize}px`, color: quoteColor }}>{invitationQuote}</p>
                                )}

                                {elementsConfig.show_venue !== false && (
                                    <div className="uppercase tracking-widest font-semibold pt-0.5 space-y-0.5" style={{ fontSize: `${customVenueFontSize}px`, color: customVenueColor }}>
                                        <div className="tracking-[0.2em] font-bold" style={{ color: dateNumColor }}>{venueName}</div>
                                        {venueSub && <div className="lowercase font-normal opacity-90" style={{ fontSize: `${customVenueFontSize * 0.9}px` }}>{venueSub}</div>}
                                        {venueDate && <div className="tracking-wider opacity-80">{venueDate}</div>}
                                        {saveTheDate && <div className="font-extrabold tracking-[0.25em] pt-0.5">{saveTheDate}</div>}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 1. GUEST NAME (Fetched attendee name only - Zero shadow on clean text) */}
                        {elementsConfig.show_guest_name !== false && (
                            <div 
                                className="absolute -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none transition-all z-20"
                                style={{ 
                                    left: `${nameCfg.x ?? 50}%`, 
                                    top: `${nameCfg.y ?? 71.5}%`, 
                                    width: nameCfg.hide_plaque_box ? 'auto' : `${nameCfg.plaqueWidth ?? 84}%`,
                                }}
                            >
                                {nameCfg.hide_plaque_box ? (
                                    <div 
                                        className="font-black uppercase truncate"
                                        style={{ 
                                            color: nameCfg.color || '#FFFFFF', 
                                            fontSize: `${parseFloat(nameCfg.fontSize) || 22}px`, 
                                            fontFamily: nameCfg.fontFamily || 'Georgia, serif', 
                                            fontWeight: nameCfg.fontWeight || '800',
                                            textShadow: 'none'
                                        }}
                                    >
                                        {guestName}
                                    </div>
                                ) : (
                                    <div 
                                        className="py-2.5 px-4 rounded-2xl backdrop-blur-xl shadow-2xl transition-all"
                                        style={{ 
                                            background: nameCfg.boxBg || 'rgba(0, 0, 0, 0.48)',
                                            border: '1px solid rgba(255, 255, 255, 0.25)',
                                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
                                        }}
                                    >
                                        <div 
                                            className="font-black uppercase truncate"
                                            style={{ 
                                                color: nameCfg.color || '#FFFFFF', 
                                                fontSize: `${parseFloat(nameCfg.fontSize) || 18}px`, 
                                                fontFamily: nameCfg.fontFamily || 'Georgia, serif', 
                                                fontWeight: nameCfg.fontWeight || '800' 
                                            }}
                                        >
                                            {guestName}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 2. INVITATION CATEGORY (Same customizability as guest name - Zero shadow on clean text) */}
                        {elementsConfig.show_allowance_badge !== false && (
                            <div 
                                className="absolute -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none transition-all z-20"
                                style={{ 
                                    left: `${allowanceCfg.x ?? 50}%`, 
                                    top: `${allowanceCfg.y ?? 78.5}%`,
                                    width: allowanceCfg.hide_badge_box ? 'auto' : (allowanceCfg.plaqueWidth ? `${allowanceCfg.plaqueWidth}%` : 'auto'),
                                }}
                            >
                                {allowanceCfg.hide_badge_box ? (
                                    <div 
                                        className="font-extrabold tracking-widest uppercase truncate"
                                        style={{ 
                                            color: allowanceCfg.color || '#FDE68A', 
                                            fontSize: `${parseFloat(allowanceCfg.fontSize) || 10}px`,
                                            fontFamily: allowanceCfg.fontFamily || 'sans-serif',
                                            fontWeight: allowanceCfg.fontWeight || '800',
                                            textShadow: 'none'
                                        }}
                                    >
                                        {categoryText}
                                    </div>
                                ) : (
                                    <div 
                                        style={{ 
                                            display: 'inline-flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            gap: '5px', 
                                            padding: '4px 14px', 
                                            borderRadius: '9999px', 
                                            border: '1px solid rgba(255, 255, 255, 0.3)', 
                                            backgroundColor: allowanceCfg.boxBg || 'rgba(0, 0, 0, 0.65)', 
                                            backdropFilter: 'blur(4px)', 
                                            color: allowanceCfg.color || '#FDE68A', 
                                            fontSize: `${parseFloat(allowanceCfg.fontSize) || 9}px`, 
                                            fontFamily: allowanceCfg.fontFamily || 'sans-serif',
                                            fontWeight: allowanceCfg.fontWeight || '800', 
                                            letterSpacing: '0.12em', 
                                            textTransform: 'uppercase', 
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                                            width: allowanceCfg.plaqueWidth ? `${allowanceCfg.plaqueWidth}%` : 'auto'
                                        }}
                                    >
                                        <Ticket style={{ width: '11px', height: '11px' }} />
                                        <span>{categoryText}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 3. QR CODE PASS (Minimum size starting at 20px) */}
                        {template?.show_qr !== false && elementsConfig.show_qr !== false && (
                            <div 
                                className="absolute -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none transition-all drop-shadow-2xl z-20"
                                style={{ left: `${qrCfg.x ?? 50}%`, top: `${qrCfg.y ?? 86}%` }}
                            >
                                <div className="p-1.5 bg-white rounded-xl shadow-2xl inline-block border border-slate-200/80">
                                    {qrDataUrl ? (
                                        <img src={qrDataUrl} alt="QR Pass" style={{ width: `${Math.max(20, parseFloat(qrCfg.size) || 72)}px`, height: `${Math.max(20, parseFloat(qrCfg.size) || 72)}px` }} className="rounded-lg block" />
                                    ) : (
                                        <div style={{ width: `${Math.max(20, parseFloat(qrCfg.size) || 72)}px`, height: `${Math.max(20, parseFloat(qrCfg.size) || 72)}px` }} className="bg-slate-200 animate-pulse rounded-lg" />
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 4. SECURITY VERIFICATION CODE (Custom typography, size, color & optional shadow) */}
                        {template?.show_unique_code !== false && elementsConfig.show_unique_code !== false && (
                            <div 
                                className="absolute -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none transition-all z-20"
                                style={{ 
                                    left: `${cardNumCfg.x ?? 50}%`, 
                                    top: `${cardNumCfg.y ?? 96}%`, 
                                    color: cardNumCfg.color || '#FFFFFF', 
                                    fontSize: `${parseFloat(cardNumCfg.fontSize) || 9.5}px`, 
                                    fontFamily: cardNumCfg.fontFamily || 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
                                    letterSpacing: '0.22em', 
                                    fontWeight: 'bold', 
                                    textShadow: cardNumCfg.hide_shadow ? 'none' : '0 2px 4px rgba(0,0,0,0.9)' 
                                }}
                            >
                                <span>{uniqueCode}</span>
                            </div>
                        )}
                    </div>
                )
            ) : (

                /* ═══════════════════════════════════════════════════════════════ */
                /* 2. KARDOVO SIGNATURE PASS — FULLY ADJUSTABLE ELEMENTS           */
                /* ═══════════════════════════════════════════════════════════════ */
                <div 
                    ref={cardRef}
                    id="kardovo-invitation-card"
                    className="w-full max-w-[390px] rounded-[32px] overflow-hidden relative select-none"
                    style={{
                        background: bgMode === 'solid'
                            ? (bgSolidColor || '#FFFFFF')
                            : bgMode === 'image'
                                ? '#0B1524'
                                : `linear-gradient(155deg, ${brandColorFrom || '#EBF4FF'} 0%, ${isDarkBg ? '#060E1A' : '#FFFFFF'} 42%, ${brandColorTo || '#C7E2FE'} 100%)`,
                        border: isDarkBg ? '1.5px solid rgba(0, 160, 255, 0.4)' : '1.5px solid rgba(0, 112, 186, 0.25)',
                        boxShadow: isDarkBg 
                            ? '0 25px 60px rgba(0, 0, 0, 0.85), 0 0 50px rgba(0, 130, 255, 0.18)' 
                            : '0 20px 50px rgba(0, 80, 180, 0.10), 0 4px 20px rgba(0, 0, 0, 0.04)',
                        padding: '12px',
                    }}
                >
                    {/* Mode: Imported Background Image with Opacity Overlay */}
                    {bgMode === 'image' && bgImage && (
                        <>
                            <img 
                                src={bgImage} 
                                alt="Pass Background Texture" 
                                className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0" 
                            />
                            <div 
                                className="absolute inset-0 pointer-events-none z-0" 
                                style={{ backgroundColor: `rgba(0, 0, 0, ${bgOverlayOpacity})` }} 
                            />
                        </>
                    )}

                    {/* Mode: Ambient Mesh Glow Highlights (Gradient Mode) */}
                    {bgMode === 'gradient' && (
                        <>
                            <div 
                                className="absolute bottom-0 right-0 w-3/4 h-3/4 pointer-events-none" 
                                style={{ background: `radial-gradient(ellipse at 100% 100%, ${brandColorTo || '#0070BA'}35 0%, transparent 65%)` }} 
                            />
                            <div 
                                className="absolute top-0 left-0 w-2/3 h-1/2 pointer-events-none" 
                                style={{ background: `radial-gradient(ellipse at 0% 0%, ${brandColorFrom || '#00A3FF'}30 0%, transparent 60%)` }} 
                            />
                        </>
                    )}

                    {/* ──── INNER FRAMED SECURITY PLATE BEHIND TEXTS & ELEMENTS ──── */}
                    <div
                        className="space-y-4 relative z-10"
                        style={{
                            border: innerContainerBorder,
                            borderRadius: '24px',
                            padding: '20px 18px 16px 18px',
                            background: innerContainerBg,
                            backdropFilter: 'blur(16px)',
                            boxShadow: isDarkBg ? '0 4px 30px rgba(0, 0, 0, 0.5)' : '0 4px 20px rgba(0, 0, 0, 0.03)',
                        }}
                    >
                        {/* ──── 1. TOP HEADER (Logo + Title + Verified Badge) ──── */}
                        <div>
                            <div className="flex items-center justify-between">
                                {/* Brand Logo & Text */}
                                <div className="flex items-center gap-2.5">
                                    <svg width="26" height="26" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M6 7L14 16L6 25" stroke={accentColor} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M14 7L22 16L14 25" stroke={brandColorFrom !== '#FFFFFF' ? brandColorFrom : '#00A3FF'} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.85"/>
                                    </svg>
                                    <div>
                                        <div style={{ 
                                            fontSize: '18px', 
                                            fontWeight: 900, 
                                            letterSpacing: '0.14em', 
                                            color: defaultTextPrimary, 
                                            lineHeight: 1, 
                                            fontFamily: 'system-ui, -apple-system, sans-serif' 
                                        }}>
                                            KARDOVO
                                        </div>
                                        <div style={{ 
                                            fontSize: '8px', 
                                            fontWeight: 700, 
                                            letterSpacing: '0.24em', 
                                            color: defaultTextSecondary, 
                                            marginTop: '2px', 
                                            textTransform: 'uppercase' 
                                        }}>
                                            ACCESS &amp; INVITATION
                                        </div>
                                    </div>
                                </div>

                                {/* Verified Pass Badge */}
                                {template?.show_category_badge !== false && (
                                    <div style={{ 
                                        display: 'inline-flex', 
                                        alignItems: 'center', 
                                        gap: '5px', 
                                        padding: '4.5px 12px', 
                                        borderRadius: '9999px', 
                                        border: `1.5px solid ${badgeCfg.color || accentColor}`, 
                                        backgroundColor: isDarkBg ? 'rgba(0, 163, 255, 0.15)' : `${badgeCfg.color || accentColor}14`,
                                        color: badgeCfg.color || accentColor, 
                                        fontSize: `${parseFloat(badgeCfg.fontSize) || 10}px`, 
                                        fontWeight: 800, 
                                        letterSpacing: '0.08em', 
                                        textTransform: 'uppercase' 
                                    }}>
                                        <ShieldCheck style={{ width: '13px', height: '13px', color: badgeCfg.color || accentColor }} />
                                        <span>VERIFIED PASS</span>
                                    </div>
                                )}
                            </div>

                            {/* Header divider line */}
                            <div style={{ borderBottom: isDarkBg ? '1px solid rgba(255, 255, 255, 0.10)' : '1px solid rgba(226, 232, 240, 0.8)', marginTop: '14px' }} />
                        </div>

                        {/* ──── 2. HEADLINE & EVENT TITLE ──── */}
                        <div style={{ textAlign: 'center' }} className="space-y-1.5 pt-1">
                            <div style={{ 
                                fontSize: `${headlineFontSize}px`, 
                                fontWeight: 900, 
                                letterSpacing: headlineSpacing, 
                                color: headlineColor, 
                                textTransform: 'uppercase' 
                            }}>
                                {headline}
                            </div>
                            <h2 style={{ 
                                fontSize: `${eventTitleFontSize}px`, 
                                fontWeight: eventTitleFontWeight, 
                                color: eventTitleColor, 
                                lineHeight: 1.25, 
                                fontFamily: eventTitleFontFamily 
                            }}>
                                {eventTitle}
                            </h2>

                            {/* Date pill */}
                            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '4px' }}>
                                <div style={{ 
                                    display: 'inline-flex', 
                                    alignItems: 'center', 
                                    gap: '6px', 
                                    padding: '5.5px 16px', 
                                    borderRadius: '9999px', 
                                    backgroundColor: datePillBg, 
                                    border: isDarkBg ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid #E2E8F0', 
                                    fontSize: `${datePillFontSize}px`, 
                                    fontWeight: 600, 
                                    color: datePillColor 
                                }}>
                                    <Calendar style={{ width: '13px', height: '13px', color: headlineColor }} />
                                    <span>{eventDate}</span>
                                </div>
                            </div>
                        </div>

                        {/* ──── 3. GUEST PLAQUE ──── */}
                        <div 
                            style={{ 
                                padding: '16px 18px', 
                                borderRadius: '18px', 
                                background: isDarkBg
                                    ? 'rgba(6, 14, 26, 0.85)'
                                    : `linear-gradient(180deg, #F8FAFC 0%, ${brandColorFrom || '#EBF4FF'}30 100%)`, 
                                border: isDarkBg
                                    ? '1.5px solid rgba(0, 160, 255, 0.35)'
                                    : '1.5px solid rgba(226, 232, 240, 0.9)', 
                                boxShadow: isDarkBg ? '0 4px 20px rgba(0, 0, 0, 0.4)' : '0 2px 10px rgba(0, 0, 0, 0.02)',
                                textAlign: 'center' 
                            }}
                            className="space-y-1.5"
                        >
                            <div style={{ 
                                fontSize: `${plaqueHeaderFontSize}px`, 
                                fontWeight: 800, 
                                letterSpacing: '0.28em', 
                                color: plaqueHeaderColor, 
                                textTransform: 'uppercase' 
                            }}>
                                {plaqueHeaderLabel}
                            </div>
                            <h1 
                                style={{ 
                                    fontSize: `${Math.min(32, parseFloat(nameCfg.fontSize) || 26)}px`, 
                                    fontWeight: nameCfg.fontWeight || '700', 
                                    fontStyle: 'italic', 
                                    color: nameCfg.color && nameCfg.color !== '#FFFFFF' 
                                        ? nameCfg.color 
                                        : defaultTextPrimary, 
                                    fontFamily: nameCfg.fontFamily || 'Georgia, "Playfair Display", serif', 
                                    lineHeight: 1.2 
                                }}
                            >
                                {guestName}
                            </h1>
                            <div style={{ paddingTop: '6px', display: 'flex', justifyContent: 'center' }}>
                                <div style={{ 
                                    display: 'inline-flex', 
                                    alignItems: 'center', 
                                    gap: '5px', 
                                    padding: '5px 16px', 
                                    borderRadius: '9999px', 
                                    border: `1.5px solid ${accentColor}`, 
                                    backgroundColor: `${accentColor}14`, 
                                    color: accentColor, 
                                    fontSize: '10px', 
                                    fontWeight: 800, 
                                    letterSpacing: '0.08em', 
                                    textTransform: 'uppercase' 
                                }}>
                                    <Ticket style={{ width: '13px', height: '13px' }} />
                                    <span>{allowanceLabel}</span>
                                </div>
                            </div>
                        </div>

                        {/* ──── 4. SCHEDULE & VENUE LOCATION (2 SEPARATE STACKED CARDS) ──── */}
                        <div className="space-y-2.5">
                            {/* Schedule Card */}
                            <div style={{ 
                                padding: '12px 14px', 
                                borderRadius: '14px', 
                                backgroundColor: cardSurfaceBg, 
                                border: cardSurfaceBorder, 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '12px' 
                            }}>
                                <Clock style={{ width: '18px', height: '18px', color: accentColor, flexShrink: 0, strokeWidth: 1.8 }} />
                                <div className="min-w-0">
                                    <div style={{ fontSize: '8px', fontWeight: 800, letterSpacing: '0.2em', color: defaultTextSecondary, textTransform: 'uppercase' }}>
                                        {scheduleLabel}
                                    </div>
                                    <div style={{ fontSize: `${scheduleFontSize}px`, fontWeight: 700, color: scheduleColor, marginTop: '2px' }}>
                                        {eventTime}
                                    </div>
                                </div>
                            </div>

                            {/* Venue Card */}
                            <div style={{ 
                                padding: '12px 14px', 
                                borderRadius: '14px', 
                                backgroundColor: cardSurfaceBg, 
                                border: cardSurfaceBorder, 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '12px' 
                            }}>
                                <MapPin style={{ width: '18px', height: '18px', color: accentColor, flexShrink: 0, strokeWidth: 1.8 }} />
                                <div className="min-w-0">
                                    <div style={{ fontSize: '8px', fontWeight: 800, letterSpacing: '0.2em', color: defaultTextSecondary, textTransform: 'uppercase' }}>
                                        {venueLabel}
                                    </div>
                                    <div style={{ fontSize: `${venueFontSize}px`, fontWeight: 700, color: venueColor, marginTop: '2px' }}>
                                        {venue}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ──── 5. QR CODE & GATE VERIFICATION CODE ──── */}
                        <div style={{ textAlign: 'center', paddingTop: '2px' }}>
                            {/* Dashed Separator */}
                            <div style={{ borderTop: isDarkBg ? '1.5px dashed rgba(255, 255, 255, 0.18)' : '1.5px dashed #CBD5E1', marginBottom: '16px', marginTop: '4px' }} />

                            {template?.show_qr !== false && (
                                <div style={{ padding: '8px', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1.5px solid #E2E8F0', boxShadow: '0 6px 20px rgba(0,0,0,0.12)', display: 'inline-block' }}>
                                    {qrDataUrl ? (
                                        <img src={qrDataUrl} alt="QR Code" style={{ width: '120px', height: '120px', borderRadius: '8px', display: 'block' }} />
                                    ) : (
                                        <div style={{ width: '120px', height: '120px', borderRadius: '8px', backgroundColor: '#F1F5F9' }} />
                                    )}
                                </div>
                            )}

                            {template?.show_unique_code !== false && (
                                <div style={{ marginTop: '10px' }}>
                                    <div style={{ fontSize: '8.5px', fontWeight: 700, letterSpacing: '0.3em', color: defaultTextSecondary, textTransform: 'uppercase' }}>
                                        GATE VERIFICATION CODE
                                    </div>
                                    <div style={{ 
                                        fontSize: '22px', 
                                        fontWeight: 900, 
                                        letterSpacing: '0.35em', 
                                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', 
                                        color: defaultTextPrimary, 
                                        lineHeight: 1.2, 
                                        marginTop: '4px' 
                                    }}>
                                        {uniqueCode}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ──── 6. SECURITY FOOTER ──── */}
                        <div>
                            <div style={{ borderTop: isDarkBg ? '1px solid rgba(255, 255, 255, 0.10)' : '1px solid #E2E8F0', marginBottom: '10px', marginTop: '6px' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: `${footerFontSize}px`, color: footerColor, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}>
                                <span>{cardNumber}</span>
                                <span>{footerText}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Interactive Action Bar */}
            {interactive && (
                <div className="mt-4 flex items-center justify-center gap-3 w-full max-w-[390px]">
                    <button type="button" onClick={handleDownloadCanvas} disabled={isExporting}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-kardovo-navy hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-95">
                        {isExporting ? (
                            <><Loader2 className="w-4 h-4 animate-spin text-kardovo-blue-light" /><span>Generating Pass...</span></>
                        ) : (
                            <><Download className="w-4 h-4 text-kardovo-blue-light" /><span>Download Pass (PNG)</span></>
                        )}
                    </button>
                    <button type="button" onClick={handlePrint}
                        className="py-2.5 px-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition" title="Print Pass">
                        <Printer className="w-4 h-4 text-slate-500" />
                        <span>{isExporting ? "Printing..." : "Print"}</span>
                    </button>
                </div>
            )}
        </div>
    );
}
