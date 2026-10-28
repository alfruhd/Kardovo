import React, { useState, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import QRCode from 'qrcode';
import KardovoLogo from '@/Components/KardovoLogo';
import PersonalisedCard from '@/Components/PersonalisedCard';
import { 
    X, 
    QrCode, 
    Ticket, 
    Calendar, 
    MapPin, 
    Clock, 
    Check, 
    ShieldCheck, 
    Send, 
    CheckCircle2, 
    ExternalLink,
    Coins,
    Copy
} from 'lucide-react';

// Color calculation helpers for dynamic wax complementary styling
function hexToRgb(hex) {
    let clean = (hex || '#5a0f1b').replace('#', '').trim();
    if (clean.length === 3) clean = clean.split('').map(c => c + c).join('');
    const num = parseInt(clean, 16);
    if (isNaN(num)) return { r: 90, g: 15, b: 27 };
    return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255,
    };
}

function adjustColorBrightness(rgb, percent) {
    const factor = percent / 100;
    const adjust = (val) => {
        if (factor > 0) {
            return Math.min(255, Math.round(val + (255 - val) * factor));
        } else {
            return Math.max(0, Math.round(val * (1 + factor)));
        }
    };
    return `rgb(${adjust(rgb.r)}, ${adjust(rgb.g)}, ${adjust(rgb.b)})`;
}

export default function GuestPass({ guest, event, template, isDemo = false, micrositeConfig = null, hasMicrosite = false, recentPayments = [] }) {
    const cfg = micrositeConfig || {};

    const primaryName = cfg.primary_name || 'Zohan';
    const secondaryName = cfg.secondary_name || 'Rose';
    const coupleTitle = cfg.couple_title || `${primaryName} and ${secondaryName}`;
    const eventDateFormatted = cfg.event_date_formatted || '27.09.26';
    const eventTagline = cfg.event_tagline || 'Wedding Day';

    // Dynamic Wax Color System
    const waxColor = (cfg.gate_seal_color || cfg.wax_seal_color || '#5a0f1b').trim();
    const waxRgb = hexToRgb(waxColor);
    const waxRgbStr = `${waxRgb.r}, ${waxRgb.g}, ${waxRgb.b}`;
    const waxLight = adjustColorBrightness(waxRgb, 28);
    const waxDark = adjustColorBrightness(waxRgb, -28);
    const lum = (0.299 * waxRgb.r + 0.587 * waxRgb.g + 0.114 * waxRgb.b) / 255;
    const waxText = lum > 0.65 ? adjustColorBrightness(waxRgb, -38) : waxColor;

    const [htmlContent, setHtmlContent] = useState('');
    const [showTicketModal, setShowTicketModal] = useState(false);
    const [isRsvpPopupOpen, setIsRsvpPopupOpen] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [rsvpStatus, setRsvpStatus] = useState(guest?.rsvp_status || 'pending');
    const [rsvpMessage, setRsvpMessage] = useState(guest?.notes || '');
    const [submittingRsvp, setSubmittingRsvp] = useState(false);
    const [rsvpSuccess, setRsvpSuccess] = useState(null);

    // Listen for RSVP modal open/close events from the microsite iframe
    useEffect(() => {
        const handleMessage = (e) => {
            if (e.data && e.data.type === 'TILDA_RSVP_POPUP_STATE') {
                setIsRsvpPopupOpen(Boolean(e.data.isOpen));
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    // Pledges & Contributions state
    const [pledgeAmount, setPledgeAmount] = useState(guest?.pledge_amount || '');
    const [pledgeNotes, setPledgeNotes] = useState(guest?.pledge_notes || '');
    const [submittingPledge, setSubmittingPledge] = useState(false);
    const [pledgeFeedback, setPledgeFeedback] = useState(null);

    const [paymentAmount, setPaymentAmount] = useState(guest?.pledge_balance > 0 ? guest.pledge_balance : '');
    const [paymentRef, setPaymentRef] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('lipa_namba');
    const [submittingPayment, setSubmittingPayment] = useState(false);
    const [paymentFeedback, setPaymentFeedback] = useState(null);

    const [copiedField, setCopiedField] = useState(null);
    const [activePledgeTab, setActivePledgeTab] = useState(guest?.pledge_amount > 0 ? 'pay' : 'pledge');

    const iframeRef = useRef(null);

    const copyToClipboard = (text, fieldName) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedField(fieldName);
        setTimeout(() => setCopiedField(null), 2500);
    };

    const handlePledgeSubmit = (e) => {
        e?.preventDefault();
        if (!pledgeAmount || Number(pledgeAmount) <= 0) return;
        const token = guest?.qr_token || guest?.unique_code || guest?.card_number || 'demo';
        setSubmittingPledge(true);
        router.post(
            route('guest.pledge', token),
            {
                pledge_amount: Number(pledgeAmount),
                pledge_notes: pledgeNotes,
                is_demo: isDemo,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSubmittingPledge(false);
                    setPledgeFeedback('Pledge recorded successfully! You can now send your contribution.');
                    setActivePledgeTab('pay');
                    setTimeout(() => setPledgeFeedback(null), 5000);
                },
                onError: () => {
                    setSubmittingPledge(false);
                },
            }
        );
    };

    const handlePaymentSubmit = (e) => {
        e?.preventDefault();
        if (!paymentAmount || !paymentRef.trim()) return;
        const token = guest?.qr_token || guest?.unique_code || guest?.card_number || 'demo';
        setSubmittingPayment(true);
        router.post(
            route('guest.paymentProof', token),
            {
                amount: Number(paymentAmount),
                reference_number: paymentRef.trim(),
                payment_method: paymentMethod,
                is_demo: isDemo,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSubmittingPayment(false);
                    setPaymentRef('');
                    setPaymentFeedback('Payment proof submitted successfully and verified!');
                    setTimeout(() => setPaymentFeedback(null), 5000);
                },
                onError: () => {
                    setSubmittingPayment(false);
                },
            }
        );
    };

    // 1-Tap RSVP submission
    const handleRsvp = (status) => {
        const token = guest?.qr_token || guest?.unique_code || guest?.card_number || 'demo';
        setSubmittingRsvp(true);
        router.post(
            route('guest.rsvp', token),
            {
                status,
                message: rsvpMessage,
                is_demo: isDemo,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setRsvpStatus(status);
                    setRsvpSuccess(status === 'attending' ? 'Thank you! Your attendance has been confirmed.' : 'Your response has been recorded.');
                    setSubmittingRsvp(false);
                    setTimeout(() => setRsvpSuccess(null), 5000);
                },
                onError: () => {
                    setSubmittingRsvp(false);
                },
            }
        );
    };

    // Generate QR Code for door check-in pass
    useEffect(() => {
        const qrContent = guest?.qr_token || guest?.unique_code || guest?.card_number || 'KDV-PASS-DEMO';
        QRCode.toDataURL(qrContent, {
            margin: 1,
            width: 240,
            color: {
                dark: '#6c513f',
                light: '#ffffff',
            },
        })
            .then(url => setQrCodeUrl(url))
            .catch(() => {});
    }, [guest]);

    // Scoped helper to replace content inside a specific Tilda record block
    const replaceInRecord = (htmlStr, recId, pattern, replacement) => {
        const recRegex = new RegExp(`(<div id="rec${recId}"[\\s\\S]*?)(?=<div id="rec|\\Z)`);
        const match = htmlStr.match(recRegex);
        if (!match) return htmlStr;
        const oldBlock = match[1];
        const newBlock = oldBlock.replace(pattern, replacement);
        return htmlStr.slice(0, match.index) + newBlock + htmlStr.slice(match.index + oldBlock.length);
    };

    // Fetch and dynamically hydrate the exact 1:1 Sacred Garden template only if microsite is enabled
    useEffect(() => {
        if (!hasMicrosite) return;
        fetch('/invitation_templates/sacred_garden_exact.html')
            .then(res => res.text())
            .then(rawHtml => {
                let processed = rawHtml;

                // 1. Inject Token & Global Config for RSVP submission
                const token = guest?.qr_token || guest?.unique_code || guest?.card_number || 'kdv_demo_pass_preview';
                processed = processed.replace(
                    '</head>',
                    `<script>window.KARDOVO_GUEST_TOKEN = "${token}";</script></head>`
                );

                // 2. Hero Arch (REC 2487446043): Couple Names, Tagline, Date
                const pName = cfg.primary_name;
                const sName = cfg.secondary_name;
                if ((pName && pName !== 'Zohan') || (sName && sName !== 'Rose')) {
                    const p = pName || 'Zohan';
                    const s = sName || 'Rose';
                    processed = replaceInRecord(
                        processed,
                        '2487446043',
                        /(field='tn_text_1763402147625'>)Zohan <br \/><br \/>Rose(<\/div>)/gi,
                        `$1${p} <br /><br />${s}$2`
                    );
                }

                if (cfg.event_tagline && cfg.event_tagline !== 'Wedding Day') {
                    processed = replaceInRecord(
                        processed,
                        '2487446043',
                        /(field='tn_text_176340398328864790'>)[^<]*(<\/div>)/gi,
                        `$1${cfg.event_tagline}$2`
                    );
                }

                if (cfg.event_date_formatted && cfg.event_date_formatted !== '27.09.26') {
                    processed = replaceInRecord(
                        processed,
                        '2487446043',
                        /(field='tn_text_176340401720454780'>)[^<]*(<\/div>)/gi,
                        `$1${cfg.event_date_formatted}$2`
                    );
                }

                // 3. Deckled Card 1 (REC 2487446043): Romantic Verse & Host Invitation Note
                if (cfg.couple_verse && cfg.couple_verse.trim() !== "Two Souls\nOne destiny\nA Lifetime written by Allah") {
                    const verseHtml = cfg.couple_verse.replace(/\n/g, ' <br />');
                    processed = replaceInRecord(
                        processed,
                        '2487446043',
                        /(field='tn_text_1780748008617000003'>)[\s\S]*?(<\/div>)/gi,
                        `$1${verseHtml}$2`
                    );
                }

                const defaultHonor = 'Dear Friends and Family';
                const defaultInv = 'Join us for an evening of love, laughter, duas, and unforgettable memories as we begin our forever.';
                if ((cfg.host_honor_text && cfg.host_honor_text !== defaultHonor) || (cfg.invitation_text && cfg.invitation_text !== defaultInv)) {
                    const honor = cfg.host_honor_text || defaultHonor;
                    const inv = cfg.invitation_text || defaultInv;
                    processed = replaceInRecord(
                        processed,
                        '2487446043',
                        /(field='tn_text_1780748008617000005'>)[\s\S]*?(<\/div>)/gi,
                        `$1${honor} <br />${inv}$2`
                    );
                }

                // 4. Countdown (REC 2487446093): Title & Target Date
                if (cfg.countdown_title && cfg.countdown_title !== 'The Celebration Begins In') {
                    processed = replaceInRecord(
                        processed,
                        '2487446093',
                        /(field='tn_text_1771277026942000001'>)[^<]*(<\/div>)/gi,
                        `$1${cfg.countdown_title}$2`
                    );
                }

                const targetDateStr = cfg.countdown_target_datetime || event?.event_date;
                if (targetDateStr) {
                    const d = new Date(targetDateStr);
                    if (!isNaN(d.getTime())) {
                        const dateCode = `new Date(${d.getFullYear()},${d.getMonth()},${d.getDate()},${d.getHours() || 16},${d.getMinutes() || 0},0)`;
                        processed = replaceInRecord(
                            processed,
                            '2487446093',
                            /new Date\(2026,11,8,16,0,0\)/g,
                            dateCode
                        );
                    }
                }

                // 5. Schedule of Events (REC 2487446103): Title & 5 Specific Timeline Items
                if (cfg.schedule_title && cfg.schedule_title !== 'Schedule of Events') {
                    processed = replaceInRecord(
                        processed,
                        '2487446103',
                        /(field='tn_text_1763405219328'>)[^<]*(<\/div>)/gi,
                        `$1${cfg.schedule_title}$2`
                    );
                }

                if (Array.isArray(cfg.programme) && cfg.programme.length > 0) {
                    const fieldMap = [
                        ['tn_text_1772803062504', 'tn_text_1763405268776', '5 PM', 'Guest Arrival'],
                        ['tn_text_1772803288793000003', 'tn_text_1772803288793000002', '6 PM', 'Nikkah Ceremony'],
                        ['tn_text_1782315588274000002', 'tn_text_1782315605037000003', '7 PM', 'Mocktail Hour'],
                        ['tn_text_1778517684813000002', 'tn_text_1778517684813000001', '8 PM', 'Dinner'],
                        ['tn_text_1772803619332000009', 'tn_text_1772803619332000008', '9 PM', 'Dance'],
                    ];

                    cfg.programme.slice(0, 5).forEach((item, idx) => {
                        const [tField, titleField, defTime, defTitle] = fieldMap[idx];
                        if (item.time && item.time !== defTime) {
                            processed = replaceInRecord(
                                processed,
                                '2487446103',
                                new RegExp(`(field='${tField}'>)[^<]*(<\\/div>)`, 'g'),
                                `$1${item.time}$2`
                            );
                        }
                        if (item.title && item.title !== defTitle) {
                            processed = replaceInRecord(
                                processed,
                                '2487446103',
                                new RegExp(`(field='${titleField}'>)[^<]*(<\\/div>)`, 'g'),
                                `$1${item.title}$2`
                            );
                        }
                    });
                }

                // 6. Venue & Address (REC 2487446153)
                const defaultRecTitle = 'Islamic Center of Melville';
                const defaultRecSub = 'Address: 118 Old East Neck Road Melville, NY 11747';
                const vTitle = cfg.reception_title || cfg.venue_name;
                if (vTitle && vTitle !== defaultRecTitle) {
                    processed = replaceInRecord(
                        processed,
                        '2487446153',
                        /(field='tn_text_1772804808869'>)[^<]*(<\/div>)/gi,
                        `$1${vTitle}$2`
                    );
                }

                const vAddr = cfg.reception_subtitle || cfg.venue_address;
                if (vAddr && vAddr !== defaultRecSub) {
                    processed = replaceInRecord(
                        processed,
                        '2487446153',
                        /(field='tn_text_1772813480591000001'>)[^<]*(<\/div>)/gi,
                        `$1${vAddr}$2`
                    );
                }

                if (cfg.google_maps_embed_url && !cfg.google_maps_embed_url.includes('1782314483584')) {
                    processed = replaceInRecord(
                        processed,
                        '2487446163',
                        /src=['"]https:\/\/www\.google\.com\/maps\/embed\?[^'"]+['"]/gi,
                        `src="${cfg.google_maps_embed_url}"`
                    );
                }

                // 7. Deckled Card 2 (REC 2487446183): Dress Code & Gift Preference
                if (cfg.dress_code_title && cfg.dress_code_title !== 'Dress Code') {
                    processed = replaceInRecord(
                        processed,
                        '2487446183',
                        /(field='tn_text_1778524751695000002'>)[^<]*(<\/div>)/gi,
                        `$1${cfg.dress_code_title}$2`
                    );
                }
                const defaultDressNote = 'We kindly ask guests to avoid deep red and maroon attire for the celebration.';
                if (cfg.dress_code_note && cfg.dress_code_note !== defaultDressNote) {
                    processed = replaceInRecord(
                        processed,
                        '2487446183',
                        /(field='tn_text_1778524751695000001'>)[^<]*(<\/div>)/gi,
                        `$1${cfg.dress_code_note}$2`
                    );
                }

                if (cfg.gift_preference_title && cfg.gift_preference_title !== 'Gift Preference') {
                    processed = replaceInRecord(
                        processed,
                        '2487446183',
                        /(field='tn_text_1763405219328'>)[^<]*(<\/div>)/gi,
                        `$1${cfg.gift_preference_title}$2`
                    );
                }
                const defaultGiftNote = 'Kindly, no boxed gifts please.';
                if (cfg.gift_preference_note && cfg.gift_preference_note !== defaultGiftNote) {
                    processed = replaceInRecord(
                        processed,
                        '2487446183',
                        /(field='tn_text_1772813849329000001'>)[^<]*(<\/div>)/gi,
                        `$1${cfg.gift_preference_note}$2`
                    );
                }

                // 8. RSVP Section (REC 2487446223) & Modal Form (REC 2487446233)
                if (cfg.rsvp_heading && cfg.rsvp_heading !== 'Confirm Your Attendance') {
                    processed = replaceInRecord(
                        processed,
                        '2487446223',
                        /(field='tn_text_1763405219328'>)[^<]*(<\/div>)/gi,
                        `$1${cfg.rsvp_heading}$2`
                    );
                    processed = replaceInRecord(
                        processed,
                        '2487446233',
                        /(id="popuptitle_2487446233">)[^<]*(<\/div>)/gi,
                        `$1${cfg.rsvp_heading}$2`
                    );
                }

                const defaultRsvpSub = 'To help us prepare for a joyful celebration, kindly confirm your attendance.';
                if (cfg.rsvp_subtext && cfg.rsvp_subtext.trim() !== defaultRsvpSub) {
                    processed = replaceInRecord(
                        processed,
                        '2487446223',
                        /(field='tn_text_1772813849329000001'>)[\s\S]*?(<\/div>)/gi,
                        `$1${cfg.rsvp_subtext} $2`
                    );
                }

                if (cfg.rsvp_deadline && cfg.rsvp_deadline !== 'Please RSVP before August 09') {
                    processed = replaceInRecord(
                        processed,
                        '2487446233',
                        /(class="t702__descr t-descr t-descr_xs">)[^<]*(<\/div>)/gi,
                        `$1${cfg.rsvp_deadline}$2`
                    );
                }

                // 9. Wax Seal RSVP (REC 2487446223) & Form Fields (REC 2487446233)
                if (cfg.rsvp_open_label && cfg.rsvp_open_label !== 'Click to open') {
                    processed = replaceInRecord(
                        processed,
                        '2487446223',
                        /(field='tn_text_1782316019612'>)[^<]*(<\/div>)/gi,
                        `$1${cfg.rsvp_open_label}$2`
                    );
                }

                const resolveWaxSealColor = (colorStr) => {
                    if (!colorStr) return 'burgundy';
                    const c = colorStr.toLowerCase().trim();
                    if (c.includes('emerald') || c.includes('green') || c.includes('0f4a2d') || c.includes('064e3b')) return 'emerald';
                    if (c.includes('navy') || c.includes('blue') || c.includes('102a45') || c.includes('1e3a8a')) return 'navy';
                    if (c.includes('gold') || c.includes('yellow') || c.includes('a67d2b') || c.includes('c5a059')) return 'gold';
                    if (c.includes('black') || c.includes('dark') || c.includes('222222') || c.includes('000000')) return 'black';
                    if (c.includes('blush') || c.includes('pink') || c.includes('rose') || c.includes('c4828e')) return 'blush';
                    if (c.includes('burgundy') || c.includes('wine') || c.includes('maroon') || c.includes('5a0f1b')) return 'burgundy';

                    if (c.startsWith('#') || c.length === 6 || c.length === 3) {
                        const clean = c.replace('#', '');
                        const hex = clean.length === 3 ? clean.split('').map(x => x + x).join('') : clean;
                        const r = parseInt(hex.substring(0, 2), 16) || 0;
                        const g = parseInt(hex.substring(2, 4), 16) || 0;
                        const b = parseInt(hex.substring(4, 6), 16) || 0;

                        if (g > r * 1.2 && g >= b * 0.8) return 'emerald';
                        if (b > r * 1.2 && b > g) return 'navy';
                        if (r > 110 && g > 80 && r > b * 1.3) return 'gold';
                        if (r < 55 && g < 55 && b < 55) return 'black';
                        if (r > 130 && r > g && g > 70 && b > 70) return 'blush';
                        if (r > 60 && g < 40 && b < 50) return 'burgundy';
                    }

                    return 'custom';
                };

                // Note: Attendance RSVP Wax Seal & Envelope Wax Seal are symmetrically unified in section 12b below

                // RSVP Popup Form Customizations (REC 2487446233)
                if (cfg.rsvp_submit_label && cfg.rsvp_submit_label !== 'Submit') {
                    processed = replaceInRecord(
                        processed,
                        '2487446233',
                        /(<span class="t-btnflex__text">)[^<]*(<\/span>)/gi,
                        `$1${cfg.rsvp_submit_label}$2`
                    );
                }

                if (cfg.rsvp_field_name && cfg.rsvp_field_name !== 'Your name') {
                    processed = replaceInRecord(
                        processed,
                        '2487446233',
                        /(field="li_title__5828866651120"[^>]*>)[^<]*(<\/label>)/gi,
                        `$1${cfg.rsvp_field_name}$2`
                    );
                }

                if (cfg.rsvp_field_attending && cfg.rsvp_field_attending !== 'Will you be attending?') {
                    processed = replaceInRecord(
                        processed,
                        '2487446233',
                        /(field="li_title__1778524967946"[^>]*>)[^<]*(<\/div>)/gi,
                        `$1${cfg.rsvp_field_attending}$2`
                    );
                }

                if (cfg.rsvp_field_guest_count && cfg.rsvp_field_guest_count !== 'Number of Guests Attending') {
                    processed = replaceInRecord(
                        processed,
                        '2487446233',
                        /(field="li_title__5828866651121"[^>]*>)[^<]*(<\/label>)/gi,
                        `$1${cfg.rsvp_field_guest_count}$2`
                    );
                }

                if (cfg.rsvp_field_song && cfg.rsvp_field_song !== 'A Song That Gets You Dancing') {
                    processed = replaceInRecord(
                        processed,
                        '2487446233',
                        /(field="li_title__1778524368230"[^>]*>)[^<]*(<\/label>)/gi,
                        `$1${cfg.rsvp_field_song}$2`
                    );
                }

                if (cfg.rsvp_field_children && cfg.rsvp_field_children !== 'Children Attending') {
                    processed = replaceInRecord(
                        processed,
                        '2487446233',
                        /(field="li_title__1778524398300"[^>]*>)[^<]*(<\/label>)/gi,
                        `$1${cfg.rsvp_field_children}$2`
                    );
                }

                // 10. Venue Eyebrow Badge & Scroll Down & Intro Button
                if (cfg.venue_badge && cfg.venue_badge !== 'Location') {
                    processed = replaceInRecord(
                        processed,
                        '2487446153',
                        /(field='tn_text_1771277026942000001'>)[^<]*(<\/div>)/gi,
                        `$1${cfg.venue_badge}$2`
                    );
                }

                if (cfg.scroll_down_text && cfg.scroll_down_text !== 'Scroll down') {
                    processed = replaceInRecord(
                        processed,
                        '2487446043',
                        /(field='tn_text_1782235970225000002'>)[^<]*(<\/div>)/gi,
                        `$1${cfg.scroll_down_text}$2`
                    );
                }

                if (cfg.intro_button_text && cfg.intro_button_text !== 'Tap to open') {
                    processed = processed.replace(
                        /(<div id="weiTapLabel">)[^<]*(<\/div>)/gi,
                        `$1${cfg.intro_button_text}$2`
                    );
                }

                // 11. Footer (REC 2487446253): Quote, Names, and Photo
                if (cfg.footer_quote && cfg.footer_quote !== 'Hope to see you there!') {
                    processed = replaceInRecord(
                        processed,
                        '2487446253',
                        /(field='tn_text_1763405219328'>)[^<]*(<\/div>)/gi,
                        `$1${cfg.footer_quote}$2`
                    );
                }

                const footNames = cfg.footer_names || cfg.couple_title || ((pName && sName && (pName !== 'Zohan' || sName !== 'Rose')) ? `${pName} and ${sName}` : null);
                if (footNames && footNames !== 'Zohan and Rose') {
                    processed = replaceInRecord(
                        processed,
                        '2487446253',
                        /(field='tn_text_1772813849329000001'>)[^<]*(<\/div>)/gi,
                        `$1${footNames}$2`
                    );
                }

                if (cfg.cover_photo && !cfg.cover_photo.includes('pexels-vinicius-quar')) {
                    processed = replaceInRecord(
                        processed,
                        '2487446253',
                        /https:\/\/static\.tildacdn\.net\/tild6235-3237-4230-b632-326437376662\/pexels-vinicius-quar\.jpg/g,
                        cfg.cover_photo
                    );
                }

                // 12. Media Customizations (Audio, Envelope, Swans)
                if (cfg.music_url && !cfg.music_url.includes('Einaudi') && !cfg.music_url.includes('sacred_garden/music.mp3')) {
                    processed = processed.replace(
                        /(<audio id="weiAudio"[^>]*>[\s\S]*?<source\s+src=")[^"]*(")/gi,
                        `$1${cfg.music_url}$2`
                    );
                }
                if (cfg.intro_poster_url && !cfg.intro_poster_url.includes('ChatGPT_Image_Jun_23') && !cfg.intro_poster_url.includes('envelope_poster.png') && !cfg.intro_poster_url.includes('replica_envelope_base.png')) {
                    processed = processed.replace(
                        /(<img\s+id="weiBaseImg"[^>]*src=")[^"]*(")/gi,
                        `$1${cfg.intro_poster_url}$2`
                    );
                }
                if (cfg.swans_video_url && !cfg.swans_video_url.includes('Swans2') && !cfg.swans_video_url.includes('swans_video')) {
                    processed = processed.replace(
                        /(<source\s+src=")[^"]*(?:Swans2|swans_video)[^"]*(")/gi,
                        `$1${cfg.swans_video_url}$2`
                    );
                }

                // 12b. Wax Seals Customization (Symmetrically unified for Envelope Gate Seal & Attendance RSVP Seal)
                const hasCustomSealImage = Boolean(
                    cfg.gate_seal_image_url &&
                    cfg.gate_seal_image_url.trim() &&
                    !cfg.gate_seal_image_url.includes('wax_seal_') &&
                    !cfg.gate_seal_image_url.includes('seal_')
                );

                if (hasCustomSealImage) {
                    processed = processed.replace(
                        /(<div id="weiSealCore" class="wei-seal-core">)[\s\S]*?(<\/div>)/i,
                        `$1<img src="${cfg.gate_seal_image_url.trim()}" alt="Custom Wax Crest" class="wei-seal-img" />$2`
                    );
                } else {
                    // Custom Monogram Initials on Envelope Seal
                    const defaultInitials = (cfg.primary_name && cfg.secondary_name) 
                        ? `${cfg.primary_name.trim()[0] || 'R'}&${cfg.secondary_name.trim()[0] || 'Z'}`
                        : 'R&Z';
                    const initials = cfg.gate_seal_initials ? cfg.gate_seal_initials.trim() : defaultInitials;
                    const fontSize = initials.length > 3 ? '40px' : initials.length > 2 ? '48px' : '54px';

                    processed = processed.replace(
                        /(<div id="weiSealInitials" class="wei-seal-initials">)[^<]*(<\/div>)/gi,
                        `$1${initials}$2`
                    );
                    const leftOffset = initials.length === 1 ? '50%' : '46.5%';
                    processed = processed.replace(
                        /(class="wei-seal-initials")/gi,
                        `$1 style="font-size: ${fontSize}; left: ${leftOffset};"`
                    );
                }

                // Symmetrical Color & Asset Resolution
                const sealColor = (cfg.gate_seal_color || '#5a0f1b').toLowerCase().trim();
                const sealType = resolveWaxSealColor(sealColor);

                let chosenEnvelopeSealImg = '/images/sacred_garden/wax_seal_authentic_blank.png';
                let chosenRsvpSealImg = '/images/sacred_garden/wax_seal_1.png';
                let extraSvgFilter = '';
                let applyDynamicTint = false;

                if (sealType === 'emerald') {
                    chosenEnvelopeSealImg = '/images/sacred_garden/seal_emerald_authentic.png';
                    chosenRsvpSealImg = '/images/sacred_garden/wax_seal_rsvp_emerald.png';
                } else if (sealType === 'navy') {
                    chosenEnvelopeSealImg = '/images/sacred_garden/seal_navy_authentic.png';
                    chosenRsvpSealImg = '/images/sacred_garden/wax_seal_rsvp_navy.png';
                } else if (sealType === 'gold') {
                    chosenEnvelopeSealImg = '/images/sacred_garden/seal_gold_authentic.png';
                    chosenRsvpSealImg = '/images/sacred_garden/wax_seal_rsvp_gold.png';
                } else if (sealType === 'black') {
                    chosenEnvelopeSealImg = '/images/sacred_garden/seal_black_authentic.png';
                    chosenRsvpSealImg = '/images/sacred_garden/wax_seal_rsvp_black.png';
                } else if (sealType === 'blush') {
                    chosenEnvelopeSealImg = '/images/sacred_garden/seal_blush_authentic.png';
                    chosenRsvpSealImg = '/images/sacred_garden/wax_seal_rsvp_blush.png';
                } else if (sealType === 'burgundy') {
                    chosenEnvelopeSealImg = '/images/sacred_garden/wax_seal_authentic_blank.png';
                    chosenRsvpSealImg = '/images/sacred_garden/wax_seal_1.png';
                } else {
                    // Custom Hex Color: apply SVG color tint filter symmetrically to both seals
                    applyDynamicTint = true;
                    chosenEnvelopeSealImg = '/images/sacred_garden/wax_seal_authentic_blank.png';
                    chosenRsvpSealImg = '/images/sacred_garden/wax_seal_1.png';

                    const cleanHex = sealColor.replace('#', '');
                    const r = (parseInt(cleanHex.substring(0, 2), 16) || 90) / 255.0;
                    const g = (parseInt(cleanHex.substring(2, 4), 16) || 15) / 255.0;
                    const b = (parseInt(cleanHex.substring(4, 6), 16) || 27) / 255.0;
                    const mr = (r / 0.32).toFixed(3);
                    const mg = (g / 0.32).toFixed(3);
                    const mb = (b / 0.32).toFixed(3);
                    extraSvgFilter = `
                    <svg style="position:absolute; width:0; height:0;" aria-hidden="true">
                      <filter id="dynWaxSealTint" color-interpolation-filters="sRGB">
                        <feColorMatrix type="matrix" values="
                          ${(mr * 0.82).toFixed(3)} ${(mr * 0.09).toFixed(3)} ${(mr * 0.09).toFixed(3)} 0 ${(r * 0.03).toFixed(3)}
                          ${(mg * 0.82).toFixed(3)} ${(mg * 0.09).toFixed(3)} ${(mg * 0.09).toFixed(3)} 0 ${(g * 0.03).toFixed(3)}
                          ${(mb * 0.82).toFixed(3)} ${(mb * 0.09).toFixed(3)} ${(mb * 0.09).toFixed(3)} 0 ${(b * 0.03).toFixed(3)}
                          0 0 0 1 0" />
                      </filter>
                    </svg>`;
                }

                // Check for individual custom uploaded assets
                const hasCustomUploadedRsvpSeal = Boolean(
                    cfg.wax_seal_image_url &&
                    !cfg.wax_seal_image_url.includes('wax_seal_1.png') &&
                    !cfg.wax_seal_image_url.includes('wax_seal_rsvp_')
                );
                if (hasCustomUploadedRsvpSeal) {
                    chosenRsvpSealImg = cfg.wax_seal_image_url.trim();
                    applyDynamicTint = false;
                }

                // 1. Update Envelope Wax Seal image
                if (!hasCustomSealImage) {
                    processed = processed.replace(
                        /(<img id="weiSealImg"[^>]*?src=['"])[^'"]*(['"])/gi,
                        `$1${chosenEnvelopeSealImg}$2`
                    );
                }

                // 2. Update Attendance RSVP Wax Seal (REC 2487446223)
                processed = replaceInRecord(
                    processed,
                    '2487446223',
                    /\/images\/sacred_garden\/wax_seal_[^'"]*\.png/g,
                    chosenRsvpSealImg
                );
                processed = replaceInRecord(
                    processed,
                    '2487446223',
                    /https?:\/\/[^'"]*wax_seal_[^'"]*\.png/g,
                    chosenRsvpSealImg
                );
                processed = processed.replace(
                    /(<img id="weiRsvpSealImg"[^>]*?src=['"])[^'"]*(['"])/gi,
                    `$1${chosenRsvpSealImg}$2`
                );
                processed = processed.replace(
                    /(<img id="weiRsvpSealImg"[^>]*?data-original=['"])[^'"]*(['"])/gi,
                    `$1${chosenRsvpSealImg}$2`
                );

                // 3. Apply Symmetrical Dynamic Tint Filter when arbitrary custom color is used
                if (applyDynamicTint && extraSvgFilter) {
                    processed = processed.replace('</body>', `${extraSvgFilter}</body>`);

                    const tintCss = `
                    <style id="kardovo-wax-seal-tint">
                      #weiSealImg, #weiRsvpSealImg, img[id="weiSealImg"], img[id="weiRsvpSealImg"] {
                        filter: url(#dynWaxSealTint) !important;
                        -webkit-filter: url(#dynWaxSealTint) !important;
                      }
                    </style>
                    `;
                    processed = processed.replace('</head>', `${tintCss}</head>`);

                    processed = processed.replace(
                        /(<img id="weiSealImg"[^>]*?)(\s*\/?>)/gi,
                        '$1 style="filter: url(#dynWaxSealTint); -webkit-filter: url(#dynWaxSealTint);"$2'
                    );
                    processed = processed.replace(
                        /(<img id="weiRsvpSealImg"[^>]*?)(\s*\/?>)/gi,
                        '$1 style="filter: url(#dynWaxSealTint); -webkit-filter: url(#dynWaxSealTint);"$2'
                    );
                }

                // 12d. Dynamic Wax Complementary Theme Styling (Audio button, RSVP modal title, radio, checkbox, submit button)
                const waxDynamicStyle = `
                <style id="kardovo-wax-theme-vars">
                  :root {
                    --kdv-wax-primary: ${waxColor} !important;
                    --kdv-wax-text: ${waxText} !important;
                    --kdv-wax-light: ${waxLight} !important;
                    --kdv-wax-dark: ${waxDark} !important;
                    --kdv-wax-rgb: ${waxRgbStr} !important;
                    --kdv-wax-tint: rgba(${waxRgbStr}, 0.08) !important;
                    --kdv-wax-glow: rgba(${waxRgbStr}, 0.38) !important;
                  }
                  #weiAudioBtn {
                    background: ${waxColor} !important;
                  }
                  #rec2487446233 .t-popup__block-close-button:hover {
                    background: ${waxColor} !important;
                    border-color: ${waxColor} !important;
                    box-shadow: 0 6px 20px rgba(${waxRgbStr}, 0.4) !important;
                  }
                  #rec2487446233 .t702__title {
                    color: ${waxText} !important;
                  }
                  #rec2487446233 .t-radio__control .t-radio__indicator::after {
                    background: ${waxColor} !important;
                  }
                  #rec2487446233 .t-radio__control:has(input:checked),
                  #rec2487446233 .t-radio__control.wei-radio-selected {
                    border-color: ${waxColor} !important;
                    background: linear-gradient(135deg, rgba(${waxRgbStr}, 0.07) 0%, rgba(166, 125, 43, 0.1) 100%) !important;
                    box-shadow: 0 4px 16px rgba(${waxRgbStr}, 0.16), inset 0 0 0 1px rgba(${waxRgbStr}, 0.22) !important;
                  }
                  #rec2487446233 .t-radio__control:has(input:checked) .t-radio__indicator,
                  #rec2487446233 .t-radio__control.wei-radio-selected .t-radio__indicator {
                    border-color: ${waxColor} !important;
                  }
                  #rec2487446233 .t-radio__control:has(input:checked) span,
                  #rec2487446233 .t-radio__control.wei-radio-selected span {
                    color: ${waxText} !important;
                  }
                  #rec2487446233 .t-input-group_cb input[type="checkbox"] {
                    accent-color: ${waxColor} !important;
                  }
                  #rec2487446233 .t-input-group_cb a {
                    color: ${waxText} !important;
                  }
                  #rec2487446233 .t-btnflex.t-btnflex_type_submit {
                    background: linear-gradient(135deg, ${waxLight} 0%, ${waxColor} 50%, ${waxDark} 100%) !important;
                    box-shadow: 0 10px 24px rgba(${waxRgbStr}, 0.38), 0 2px 8px rgba(166, 125, 43, 0.35) !important;
                  }
                  #rec2487446233 .t-btnflex.t-btnflex_type_submit:hover {
                    transform: translateY(-2px) !important;
                    background: linear-gradient(135deg, ${adjustColorBrightness(waxRgb, 35)} 0%, ${waxColor} 50%, ${adjustColorBrightness(waxRgb, -35)} 100%) !important;
                    box-shadow: 0 14px 32px rgba(${waxRgbStr}, 0.48), 0 4px 12px rgba(166, 125, 43, 0.45) !important;
                  }
                  #rec2487446233 .js-successbox {
                    color: ${waxText} !important;
                  }
                </style>
                `;
                processed = processed.replace('</head>', `${waxDynamicStyle}</head>`);

                // 13. Dynamic Theme & Accent Color Overrides
                if ((cfg.theme_color && cfg.theme_color !== '#f9f0e0') || (cfg.accent_color && cfg.accent_color !== '#a67d2b')) {
                    const customColorsStyle = `
                    <style id="kardovo-theme-overrides">
                        ${cfg.theme_color && cfg.theme_color !== '#f9f0e0' ? `
                            body, .t396__artboard, #allrecords { background-color: ${cfg.theme_color} !important; }
                            #weiOverlay { background-color: ${cfg.theme_color} !important; }
                        ` : ''}
                        ${cfg.accent_color && cfg.accent_color !== '#a67d2b' ? `
                            .tn-elem[data-elem-id="1763405219328"] .tn-atom,
                            .tn-elem[data-elem-id="1778524751695000002"] .tn-atom,
                            .tn-elem[data-elem-id="1771277026942000001"] .tn-atom,
                            .tn-elem[data-elem-id="1782316019612"] .tn-atom {
                                color: ${cfg.accent_color} !important;
                            }
                        ` : ''}
                    </style>
                    `;
                    processed = processed.replace('</head>', `${customColorsStyle}</head>`);
                }

                setHtmlContent(processed);
            })
            .catch(err => {
                console.error('Failed to load sacred garden template:', err);
            });
    }, [guest, event, cfg, hasMicrosite]);

    if (!hasMicrosite) {
        return (
            <div className="min-h-screen bg-[#FBFBFC] text-slate-800 flex flex-col items-center px-4 py-6 sm:py-10 selection:bg-slate-900 selection:text-white relative overflow-x-hidden">
                <Head title={`${guest?.name || 'Guest Pass'} — ${event?.title || 'Event Invitation'}`} />

                <div className="relative z-10 w-full max-w-[410px] flex flex-col items-center space-y-4">
                    {/* Minimalist Top Brand Bar */}
                    <header className="w-full flex items-center justify-between pb-1">
                        <div className="flex items-center gap-2">
                            <KardovoLogo showText={false} imgClassName="w-5 h-5 opacity-80" />
                            <span className="text-[11px] font-bold tracking-widest uppercase text-slate-500">Kardovo Pass</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium bg-slate-100/80 px-2.5 py-0.5 rounded-full border border-slate-200/50">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Verified Pass</span>
                        </div>
                    </header>

                    {/* Interactive Pass Card Presentation (The Hero) */}
                    <div className="w-full flex justify-center">
                        <PersonalisedCard
                            guest={guest}
                            event={event}
                            template={template}
                            interactive={true}
                        />
                    </div>

                    {/* Optional Seating Assignment Pill */}
                    {(guest?.table_number || guest?.seat_number) && (
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-slate-700 text-xs font-medium border border-slate-200/80 shadow-2xs">
                            <Ticket className="w-3.5 h-3.5 text-slate-400" />
                            <span>Table {guest.table_number || 'General'}{guest?.seat_number ? `, Seat ${guest.seat_number}` : ''}</span>
                        </div>
                    )}

                    {/* Minimalist RSVP & Attendance Card */}
                    <div className="w-full bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3.5">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Attendance</h2>
                                <p className="text-[11px] text-slate-400">Please confirm your presence</p>
                            </div>
                            {rsvpStatus === 'attending' && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
                                    <Check className="w-3 h-3 stroke-[2.5]" /> Attending
                                </span>
                            )}
                            {rsvpStatus === 'declined' && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200/80 px-2.5 py-0.5 rounded-full">
                                    <X className="w-3 h-3 stroke-[2.5]" /> Cannot Attend
                                </span>
                            )}
                            {rsvpStatus !== 'attending' && rsvpStatus !== 'declined' && (
                                <span className="text-[11px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                                    Pending response
                                </span>
                            )}
                        </div>

                        {rsvpSuccess && (
                            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/70 text-emerald-800 text-xs flex items-center gap-2 animate-fade-in font-medium">
                                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                                <span>{rsvpSuccess}</span>
                            </div>
                        )}

                        {/* Minimalist 2-Button Choice */}
                        <div className="grid grid-cols-2 gap-2.5">
                            <button
                                type="button"
                                disabled={submittingRsvp}
                                onClick={() => handleRsvp('attending')}
                                className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-98 ${
                                    rsvpStatus === 'attending'
                                        ? 'bg-slate-900 text-white shadow-xs'
                                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                                }`}
                            >
                                <Check className="w-3.5 h-3.5" />
                                <span>Will Attend</span>
                            </button>
                            <button
                                type="button"
                                disabled={submittingRsvp}
                                onClick={() => handleRsvp('declined')}
                                className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-98 ${
                                    rsvpStatus === 'declined'
                                        ? 'bg-slate-900 text-white shadow-xs'
                                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                                }`}
                            >
                                <X className="w-3.5 h-3.5" />
                                <span>Cannot Attend</span>
                            </button>
                        </div>

                        {/* Optional Message */}
                        <div className="pt-0.5">
                            <div className="relative">
                                <input
                                    id="guest_rsvp_msg"
                                    type="text"
                                    value={rsvpMessage}
                                    onChange={(e) => setRsvpMessage(e.target.value)}
                                    placeholder="Add a note for the hosts (optional)..."
                                    className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200/80 focus:border-slate-900 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden transition pr-16"
                                />
                                {rsvpMessage.trim() && (
                                    <button
                                        type="button"
                                        disabled={submittingRsvp}
                                        onClick={() => handleRsvp(rsvpStatus === 'declined' ? 'declined' : 'attending')}
                                        className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[11px] font-semibold transition hover:bg-slate-800 cursor-pointer"
                                    >
                                        Save
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Minimalist Contributions & Pledges (only if explicitly enabled) */}
                    {(event?.pledges_enabled === true && guest?.pledge_amount > 0) && (
                        <div className="w-full bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3.5">
                            {/* Section Header */}
                            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                                        <Coins className="w-3.5 h-3.5" />
                                    </div>
                                    <div>
                                        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Contributions &amp; Pledges</h2>
                                        <p className="text-[11px] text-slate-400">Gift &amp; blessing for the hosts</p>
                                    </div>
                                </div>
                                {guest?.pledge_status === 'completed' && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                        <CheckCircle2 className="w-3 h-3" /> Completed
                                    </span>
                                )}
                                {guest?.pledge_status === 'partial' && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full">
                                        Partial ({Math.round(guest?.pledge_progress_percent || 0)}%)
                                    </span>
                                )}
                                {guest?.pledge_status === 'pending' && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                        Pending
                                    </span>
                                )}
                            </div>

                            {/* Metrics Grid */}
                            <div className="grid grid-cols-3 gap-2">
                                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                                    <span className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider">Pledged</span>
                                    <span className="text-xs font-bold text-slate-900 block mt-0.5">
                                        {guest?.pledge_amount > 0 ? `${event?.pledge_currency || 'TZS'} ${Number(guest.pledge_amount).toLocaleString()}` : '—'}
                                    </span>
                                </div>
                                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                                    <span className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider">Paid</span>
                                    <span className="text-xs font-bold text-emerald-700 block mt-0.5">
                                        {event?.pledge_currency || 'TZS'} {Number(guest?.paid_amount || 0).toLocaleString()}
                                    </span>
                                </div>
                                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                                    <span className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider">Balance</span>
                                    <span className="text-xs font-bold text-slate-900 block mt-0.5">
                                        {event?.pledge_currency || 'TZS'} {Number(guest?.pledge_balance || 0).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            {guest?.pledge_amount > 0 && (
                                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(100, Math.max(0, guest?.pledge_progress_percent || 0))}%` }}
                                    />
                                </div>
                            )}

                            {/* Feedback alerts */}
                            {pledgeFeedback && (
                                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
                                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                                    <span>{pledgeFeedback}</span>
                                </div>
                            )}
                            {paymentFeedback && (
                                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
                                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                                    <span>{paymentFeedback}</span>
                                </div>
                            )}

                            {/* Tabs */}
                            <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200/50 gap-1">
                                <button
                                    type="button"
                                    onClick={() => setActivePledgeTab('pay')}
                                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition text-center cursor-pointer ${
                                        activePledgeTab === 'pay'
                                            ? 'bg-white text-slate-900 shadow-2xs font-bold'
                                            : 'text-slate-500 hover:text-slate-900'
                                    }`}
                                >
                                    Payment Channels
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActivePledgeTab('pledge')}
                                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition text-center cursor-pointer ${
                                        activePledgeTab === 'pledge'
                                            ? 'bg-white text-slate-900 shadow-2xs font-bold'
                                            : 'text-slate-500 hover:text-slate-900'
                                    }`}
                                >
                                    {guest?.pledge_amount > 0 ? 'Edit Pledge' : 'Make a Pledge'}
                                </button>
                            </div>

                            {/* Tab 1: Pay */}
                            {activePledgeTab === 'pay' && (
                                <div className="space-y-3 pt-1 text-xs">
                                    {event?.pledge_settings?.lipa_namba && (
                                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                                            <div>
                                                <div className="text-[10px] text-slate-400 font-medium">Lipa Namba / Till</div>
                                                <div className="font-mono text-xs font-bold text-slate-900 tracking-wider">
                                                    {event.pledge_settings.lipa_namba}
                                                </div>
                                                {event.pledge_settings.account_name && (
                                                    <div className="text-[10px] text-slate-500">{event.pledge_settings.account_name}</div>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => copyToClipboard(event.pledge_settings.lipa_namba, 'lipa')}
                                                className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-medium transition flex items-center gap-1 cursor-pointer shadow-2xs"
                                            >
                                                {copiedField === 'lipa' ? (
                                                    <>
                                                        <Check className="w-3 h-3 text-emerald-600" />
                                                        <span className="text-emerald-700">Copied</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="w-3 h-3 text-slate-400" />
                                                        <span>Copy</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}

                                    {event?.pledge_settings?.bank_account && (
                                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                                            <div>
                                                <div className="text-[10px] text-slate-400 font-medium">{event.pledge_settings.bank_name || 'Bank Account'}</div>
                                                <div className="font-mono text-xs font-bold text-slate-900 tracking-wider">
                                                    {event.pledge_settings.bank_account}
                                                </div>
                                                {event.pledge_settings.account_name && (
                                                    <div className="text-[10px] text-slate-500">{event.pledge_settings.account_name}</div>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => copyToClipboard(event.pledge_settings.bank_account, 'bank')}
                                                className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-medium transition flex items-center gap-1 cursor-pointer shadow-2xs"
                                            >
                                                {copiedField === 'bank' ? (
                                                    <>
                                                        <Check className="w-3 h-3 text-emerald-600" />
                                                        <span className="text-emerald-700">Copied</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="w-3 h-3 text-slate-400" />
                                                        <span>Copy</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}

                                    {/* Record payment proof */}
                                    <form onSubmit={handlePaymentSubmit} className="pt-2 border-t border-slate-100 space-y-2.5">
                                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                                            Record Payment Proof
                                        </span>
                                        <div className="grid grid-cols-2 gap-2">
                                            <input
                                                type="number"
                                                min="100"
                                                required
                                                value={paymentAmount}
                                                onChange={(e) => setPaymentAmount(e.target.value)}
                                                placeholder={`Amount (${event?.pledge_currency || 'TZS'})`}
                                                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-slate-900 transition"
                                            />
                                            <input
                                                type="text"
                                                required
                                                value={paymentRef}
                                                onChange={(e) => setPaymentRef(e.target.value)}
                                                placeholder="Ref code / SMS"
                                                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 uppercase font-mono focus:outline-hidden focus:bg-white focus:border-slate-900 transition"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <select
                                                value={paymentMethod}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                                aria-label="Payment Method"
                                                className="bg-slate-50 border border-slate-200/80 rounded-xl px-2.5 py-2 text-xs text-slate-700 focus:outline-hidden"
                                            >
                                                <option value="lipa_namba">Lipa Namba</option>
                                                <option value="mobile_money">Mobile Money</option>
                                                <option value="bank">Bank</option>
                                                <option value="cash">Cash</option>
                                            </select>
                                            <button
                                                type="submit"
                                                disabled={submittingPayment || !paymentAmount || !paymentRef.trim()}
                                                className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-98"
                                            >
                                                <Check className="w-3.5 h-3.5" />
                                                <span>{submittingPayment ? 'Submitting...' : 'Confirm'}</span>
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Tab 2: Pledge */}
                            {activePledgeTab === 'pledge' && (
                                <form onSubmit={handlePledgeSubmit} className="space-y-3 pt-1 text-xs">
                                    <div className="flex flex-wrap gap-1.5">
                                        {[20000, 50000, 100000, 200000, 500000].map((amt) => (
                                            <button
                                                key={amt}
                                                type="button"
                                                onClick={() => setPledgeAmount(amt)}
                                                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer border ${
                                                    Number(pledgeAmount) === amt
                                                        ? 'bg-slate-900 border-slate-900 text-white'
                                                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                                }`}
                                            >
                                                {amt >= 1000000 ? `${amt / 1000000}M` : `${amt / 1000}K`}
                                            </button>
                                        ))}
                                    </div>
                                    <input
                                        type="number"
                                        min="500"
                                        required
                                        value={pledgeAmount}
                                        onChange={(e) => setPledgeAmount(e.target.value)}
                                        placeholder={`Pledge Amount (${event?.pledge_currency || 'TZS'})`}
                                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-slate-900 transition"
                                    />
                                    <input
                                        type="text"
                                        value={pledgeNotes}
                                        onChange={(e) => setPledgeNotes(e.target.value)}
                                        placeholder="Optional note..."
                                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-slate-900 transition"
                                    />
                                    <button
                                        type="submit"
                                        disabled={submittingPledge || !pledgeAmount || Number(pledgeAmount) <= 0}
                                        className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-98"
                                    >
                                        <Check className="w-3.5 h-3.5" />
                                        <span>{submittingPledge ? 'Saving...' : 'Save Commitment'}</span>
                                    </button>
                                </form>
                            )}
                        </div>
                    )}

                    {/* Quiet helper line */}
                    <div className="w-full text-center text-slate-400 text-[11px] pt-1">
                        <p>Present the QR code at the entrance for verification</p>
                        <p className="font-mono text-[10px] text-slate-400 mt-0.5">Pass #{guest?.card_number || guest?.unique_code || 'KDV-PASS'}</p>
                    </div>

                    {/* Quiet Minimalist Footer */}
                    <footer className="w-full pt-4 pb-8 text-center text-slate-400 text-[11px]">
                        <div className="flex items-center justify-center gap-1.5 font-medium">
                            <KardovoLogo showText={false} imgClassName="w-3.5 h-3.5 opacity-60" />
                            <span>Kardovo Pass</span>
                        </div>
                    </footer>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#f9f0e0] text-[#6c513f] min-h-screen overflow-x-hidden w-full relative">
            <Head title={`${coupleTitle} — ${eventTagline}`} />

            {/* 100% Exact 1:1 Sacred Garden Microsite Viewport */}
            {htmlContent ? (
                <iframe
                    ref={iframeRef}
                    srcDoc={htmlContent}
                    title="The Sacred Garden"
                    className="w-full h-screen border-0 block"
                    style={{
                        position: 'fixed',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        border: 'none',
                    }}
                />
            ) : (
                <div className="flex flex-col items-center justify-center min-h-screen bg-[#F9F0E0]">
                    <div className="w-10 h-10 border-2 border-[#B48C3D] border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="font-['Cinzel',serif] text-xs uppercase tracking-widest text-[#B48C3D]">
                        Loading Invitation...
                    </p>
                </div>
            )}

            {/* Discreet Floating Digital Entry Pass Trigger */}
            <button
                type="button"
                onClick={() => setShowTicketModal(true)}
                className={`fixed top-4 right-4 sm:top-5 sm:right-6 z-[2147483640] flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full bg-[#fffdfa]/95 hover:bg-[#fffdfa] text-[#8c6721] shadow-md hover:shadow-lg border border-[#a67d2b]/35 backdrop-blur-sm transition-all duration-300 cursor-pointer text-xs font-semibold tracking-wider uppercase font-['Cinzel',serif] ${
                    isRsvpPopupOpen ? 'opacity-0 pointer-events-none -translate-y-2' : 'opacity-100 translate-y-0'
                }`}
                onMouseEnter={(e) => { e.currentTarget.style.color = waxText; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = ''; }}
                title="View Guest Entry Pass"
            >
                <Ticket className="w-3.5 h-3.5 text-[#a67d2b]" />
                <span className="hidden sm:inline">Guest Entry Pass</span>
                <span className="sm:hidden">Pass</span>
            </button>

            {/* ── DIGITAL PASS MODAL ── */}
            {showTicketModal && (
                <div
                    className="fixed inset-0 z-[2147483647] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in"
                    onClick={() => setShowTicketModal(false)}
                >
                    <div
                        className="relative w-full max-w-sm rounded-2xl p-6 sm:p-7 shadow-2xl text-center bg-[#fffdfa] border border-[#a67d2b]/40 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Luxury Brass Medallion Close Button */}
                        <button
                            type="button"
                            onClick={() => setShowTicketModal(false)}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = waxColor;
                                e.currentTarget.style.borderColor = waxColor;
                                e.currentTarget.style.color = '#fffdfa';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '';
                                e.currentTarget.style.borderColor = '';
                                e.currentTarget.style.color = '';
                            }}
                            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-[#f4ede0]/80 text-[#8c6721] border border-[#a67d2b]/35 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xs hover:rotate-90 hover:scale-105"
                            title="Close guest pass"
                            aria-label="Close guest pass"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {/* Botanical Crest */}
                        <div className="flex justify-center mb-1.5">
                            <svg className="w-8 h-4 text-[#a67d2b]" viewBox="0 0 48 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M24 18C24 18 20 12 14 12C8 12 4 15 2 17C3.5 13.5 8 8 15 8C20 8 23 13 24 15C25 13 28 8 33 8C40 8 44.5 13.5 46 17C44 15 40 12 34 12C28 12 24 18 24 18Z" fill="currentColor" fillOpacity="0.85" />
                                <circle cx="24" cy="5" r="2" fill="currentColor" />
                                <circle cx="18" cy="7" r="1.5" fill="currentColor" fillOpacity="0.7" />
                                <circle cx="30" cy="7" r="1.5" fill="currentColor" fillOpacity="0.7" />
                            </svg>
                        </div>

                        <p className="font-['Cinzel',serif] text-[10px] uppercase tracking-[0.25em] text-[#a67d2b] font-semibold">
                            {coupleTitle || event?.title || 'Wedding Celebration'}
                        </p>
                        <p className="text-[11px] text-[#8c7355] font-serif italic mt-0.5">
                            {eventDateFormatted ? `${eventDateFormatted} • ` : ''}{event?.location || cfg?.venue_location || cfg?.church_venue || 'Wedding Reception'}
                        </p>

                        {/* Honored Guest Section */}
                        <div className="my-3.5 py-2.5 border-y border-[#a67d2b]/20">
                            <span className="block text-[9px] font-bold uppercase tracking-[0.2em] text-[#a67d2b]/80 font-['Cinzel',serif]">
                                Honored Guest
                            </span>
                            <h3 className="font-serif text-2xl font-bold text-[#3d271d] mt-0.5 tracking-wide">
                                {guest?.name || 'Valued Guest'}
                            </h3>
                        </div>

                        {/* Admittance & Seating Badge */}
                        <div className="flex flex-wrap items-center justify-center gap-1.5 mb-3.5">
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#a67d2b]/15 text-[#8c6721] border border-[#a67d2b]/25">
                                <Ticket className="w-3 h-3 text-[#a67d2b]" />
                                {guest?.max_entries && Number(guest.max_entries) > 1
                                    ? `Admit ${guest.max_entries} Guests`
                                    : (guest?.category || guest?.allowance_label || 'Admit 1 Guest')}
                            </span>
                            {(guest?.table_number || guest?.seat_number) && (
                                <span
                                    style={{
                                        backgroundColor: `rgba(${waxRgbStr}, 0.1)`,
                                        color: waxText,
                                        borderColor: `rgba(${waxRgbStr}, 0.25)`
                                    }}
                                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                                >
                                    Table {guest.table_number || 'General'}{guest?.seat_number ? `, Seat ${guest.seat_number}` : ''}
                                </span>
                            )}
                        </div>

                        {/* QR Code */}
                        <div className="p-3 bg-white rounded-xl inline-block border-2 border-[#a67d2b]/30 shadow-sm mb-3">
                            {qrCodeUrl ? (
                                <img src={qrCodeUrl} alt="QR Code" className="w-40 h-40 sm:w-44 sm:h-44 object-contain mx-auto" />
                            ) : (
                                <div className="w-40 h-40 sm:w-44 sm:h-44 bg-slate-100 animate-pulse rounded-lg" />
                            )}
                        </div>

                        <div className="space-y-1">
                            <p style={{ color: waxText }} className="text-[11px] font-mono font-bold tracking-wider">
                                PASS #{guest?.card_number || guest?.unique_code || 'KDV-PASS'}
                            </p>
                            <p className="text-[11px] text-[#846f61] italic">
                                Present this digital pass at the entrance for verification.
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="pt-4 mt-3 border-t border-[#a67d2b]/20 flex items-center justify-center gap-1.5 text-[9px] uppercase font-['Cinzel',serif] tracking-widest text-[#8c7355]">
                            <KardovoLogo showText={false} imgClassName="w-3.5 h-3.5 opacity-70" />
                            <span>Kardovo Invitations • Verified Pass</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
