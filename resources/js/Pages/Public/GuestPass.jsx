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

export default function GuestPass({ guest, event, template, isDemo = false, micrositeConfig = null, hasMicrosite = false, recentPayments = [] }) {
    const cfg = micrositeConfig || {};

    const primaryName = cfg.primary_name || 'Zohan';
    const secondaryName = cfg.secondary_name || 'Rose';
    const coupleTitle = cfg.couple_title || `${primaryName} and ${secondaryName}`;
    const eventDateFormatted = cfg.event_date_formatted || '27.09.26';
    const eventTagline = cfg.event_tagline || 'Wedding Day';

    const [htmlContent, setHtmlContent] = useState('');
    const [showTicketModal, setShowTicketModal] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [rsvpStatus, setRsvpStatus] = useState(guest?.rsvp_status || 'pending');
    const [rsvpMessage, setRsvpMessage] = useState(guest?.notes || '');
    const [submittingRsvp, setSubmittingRsvp] = useState(false);
    const [rsvpSuccess, setRsvpSuccess] = useState(null);

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

                // RSVP Wax Seal color/image customization (REC 2487446223)
                let rsvpSealUrl = null;
                if (cfg.wax_seal_image_url && !cfg.wax_seal_image_url.includes('wax_seal_1.png')) {
                    rsvpSealUrl = cfg.wax_seal_image_url;
                } else if (cfg.gate_seal_image_url && cfg.gate_seal_image_url.trim()) {
                    rsvpSealUrl = cfg.gate_seal_image_url.trim();
                } else if (cfg.gate_seal_color) {
                    const sealType = resolveWaxSealColor(cfg.gate_seal_color);
                    if (sealType === 'emerald') {
                        rsvpSealUrl = '/images/sacred_garden/wax_seal_rsvp_emerald.png';
                    } else if (sealType === 'navy') {
                        rsvpSealUrl = '/images/sacred_garden/wax_seal_rsvp_navy.png';
                    } else if (sealType === 'gold') {
                        rsvpSealUrl = '/images/sacred_garden/wax_seal_rsvp_gold.png';
                    } else if (sealType === 'black') {
                        rsvpSealUrl = '/images/sacred_garden/wax_seal_rsvp_black.png';
                    } else if (sealType === 'blush') {
                        rsvpSealUrl = '/images/sacred_garden/wax_seal_rsvp_blush.png';
                    } else if (sealType === 'burgundy') {
                        rsvpSealUrl = '/images/sacred_garden/wax_seal_1.png';
                    }
                }

                if (rsvpSealUrl) {
                    processed = replaceInRecord(
                        processed,
                        '2487446223',
                        /https:\/\/static\.tildacdn\.net\/tild6638-6565-4665-a361-653962303137\/wax_seal_1\.png/g,
                        rsvpSealUrl
                    );
                    processed = replaceInRecord(
                        processed,
                        '2487446223',
                        /https:\/\/thb\.tildacdn\.net\/tild6638-6565-4665-a361-653962303137\/-\/resize\/20x\/wax_seal_1\.png/g,
                        rsvpSealUrl
                    );
                    processed = replaceInRecord(
                        processed,
                        '2487446223',
                        /\/images\/sacred_garden\/wax_seal_1\.png/g,
                        rsvpSealUrl
                    );
                }

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

                // 12b. Gate Envelope Wax Seal Customization (Native Replica: Color, Initials, Crest)
                const hasCustomSealImage = Boolean(cfg.gate_seal_image_url && cfg.gate_seal_image_url.trim());
                if (hasCustomSealImage) {
                    processed = processed.replace(
                        /(<div id="weiSealCore" class="wei-seal-core">)[\s\S]*?(<\/div>)/i,
                        `$1<img src="${cfg.gate_seal_image_url}" alt="Custom Wax Crest" class="wei-seal-img" />$2`
                    );
                } else {
                    // 1. Custom Monogram Initials
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

                    // 2. Custom Seal Color Mapping (Photorealistic pre-rendered authentic wax seals)
                    const sealColor = (cfg.gate_seal_color || '#5a0f1b').toLowerCase().trim();
                    let chosenSealImg = '/images/sacred_garden/wax_seal_authentic_blank.png';
                    let extraSvgFilter = '';

                    const gateSealType = resolveWaxSealColor(sealColor);
                    if (gateSealType === 'emerald') {
                        chosenSealImg = '/images/sacred_garden/seal_emerald_authentic.png';
                    } else if (gateSealType === 'navy') {
                        chosenSealImg = '/images/sacred_garden/seal_navy_authentic.png';
                    } else if (gateSealType === 'gold') {
                        chosenSealImg = '/images/sacred_garden/seal_gold_authentic.png';
                    } else if (gateSealType === 'black') {
                        chosenSealImg = '/images/sacred_garden/seal_black_authentic.png';
                    } else if (gateSealType === 'blush') {
                        chosenSealImg = '/images/sacred_garden/seal_blush_authentic.png';
                    } else if (gateSealType === 'custom') {
                        // Arbitrary hex color: apply procedural SVG tint
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

                    if (chosenSealImg !== '/images/sacred_garden/wax_seal_authentic_blank.png') {
                        processed = processed.replace(
                            /(<img id="weiSealImg"\s+src=")[^"]*(")/gi,
                            `$1${chosenSealImg}$2`
                        );
                    } else if (extraSvgFilter) {
                        processed = processed.replace('</body>', `${extraSvgFilter}</body>`);
                        processed = processed.replace(
                            /(<img id="weiSealImg"[^>]*class="[^"]*")/gi,
                            `$1 style="filter: url(#dynWaxSealTint);"`
                        );
                        processed = processed.replace(
                            /(<img id="weiRsvpSealImg"[^>]*class="[^"]*")/gi,
                            `$1 style="filter: url(#dynWaxSealTint);"`
                        );
                    }
                }

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
                            #weiAudioBtn, #rec2487446233 .t-btnflex.t-btnflex_type_submit {
                                background-color: ${cfg.accent_color} !important;
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
            <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center px-4 py-8 sm:py-12 selection:bg-amber-500 selection:text-white relative overflow-x-hidden">
                <Head title={`${guest?.name || 'Guest Pass'} — ${event?.title || 'Event Invitation'}`} />

                {/* Subtle ambient luxury glow in background */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                    <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-sky-600/15 via-amber-500/10 to-transparent blur-3xl rounded-full" />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-gradient-to-t from-sky-900/10 to-transparent blur-3xl rounded-full" />
                </div>

                <div className="relative z-10 w-full max-w-md flex flex-col items-center space-y-6">
                    {/* Header Brand */}
                    <header className="w-full flex items-center justify-between pb-4 border-b border-white/[0.08]">
                        <div className="flex items-center gap-2.5">
                            <KardovoLogo className="w-8 h-8 text-white" />
                            <div>
                                <span className="text-xs font-black tracking-widest uppercase text-white/90">Kardovo Pass</span>
                                <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3" />
                                    <span>Verified Invitation</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-500/15 text-sky-300 border border-sky-400/20">
                                {guest?.category || guest?.allowance_label || 'Digital Pass'}
                            </span>
                        </div>
                    </header>

                    {/* Event Title Banner */}
                    <div className="w-full text-center space-y-1">
                        <h1 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight">
                            {event?.title || 'Event Invitation'}
                        </h1>
                        <p className="text-xs text-slate-400">
                            Digital Pass for <span className="text-white font-bold">{guest?.name || 'Valued Guest'}</span>
                        </p>
                    </div>

                    {/* Interactive 3D Card Presentation */}
                    <div className="w-full flex justify-center">
                        <PersonalisedCard
                            guest={guest}
                            event={event}
                            template={template}
                            interactive={true}
                        />
                    </div>

                    {/* 1-Tap RSVP & Attendance Card */}
                    <div className="w-full p-5 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md shadow-2xl space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                            <div>
                                <h2 className="text-xs font-bold text-white uppercase tracking-wider">Confirm Attendance</h2>
                                <p className="text-[11px] text-slate-400">Let the hosts know if you will attend</p>
                            </div>
                            {rsvpStatus === 'attending' && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                                    <Check className="w-3 h-3" /> Attending
                                </span>
                            )}
                            {rsvpStatus === 'declined' && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/15 border border-rose-500/30 px-2.5 py-0.5 rounded-full">
                                    <X className="w-3 h-3" /> Cannot Attend
                                </span>
                            )}
                            {rsvpStatus !== 'attending' && rsvpStatus !== 'declined' && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                                    Pending RSVP
                                </span>
                            )}
                        </div>

                        {rsvpSuccess && (
                            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
                                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                                <span>{rsvpSuccess}</span>
                            </div>
                        )}

                        {/* Quick 1-Tap RSVP Buttons */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                disabled={submittingRsvp}
                                onClick={() => handleRsvp('attending')}
                                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black tracking-wide transition cursor-pointer shadow-lg active:scale-98 ${
                                    rsvpStatus === 'attending'
                                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white ring-2 ring-emerald-400/50 shadow-emerald-900/30'
                                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40 hover:shadow-emerald-900/30'
                                }`}
                            >
                                <Check className="w-4 h-4 stroke-[2.5]" />
                                <span>Will Attend</span>
                            </button>
                            <button
                                type="button"
                                disabled={submittingRsvp}
                                onClick={() => handleRsvp('declined')}
                                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black tracking-wide transition cursor-pointer active:scale-98 ${
                                    rsvpStatus === 'declined'
                                        ? 'bg-rose-600 text-white ring-2 ring-rose-400/50'
                                        : 'bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/[0.1]'
                                }`}
                            >
                                <X className="w-4 h-4 stroke-[2.5]" />
                                <span>Cannot Attend</span>
                            </button>
                        </div>

                        {/* Optional Message */}
                        <div className="pt-1">
                            <label htmlFor="guest_rsvp_msg" className="block text-[11px] font-medium text-slate-400 mb-1.5">
                                Send a note or well-wishes to the hosts:
                            </label>
                            <div className="flex gap-2">
                                <input
                                    id="guest_rsvp_msg"
                                    type="text"
                                    value={rsvpMessage}
                                    onChange={(e) => setRsvpMessage(e.target.value)}
                                    placeholder="e.g. Congratulations! Looking forward to it!"
                                    className="flex-1 bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-sky-400"
                                />
                                {rsvpMessage.trim() && (
                                    <button
                                        type="button"
                                        disabled={submittingRsvp}
                                        onClick={() => handleRsvp(rsvpStatus === 'declined' ? 'declined' : 'attending')}
                                        className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0"
                                    >
                                        <Send className="w-3.5 h-3.5" />
                                        <span>Save</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Contributions & Pledges Card */}
                    {(event?.pledges_enabled !== false || guest?.pledge_amount > 0) && (
                        <div className="w-full p-5 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md shadow-2xl space-y-4">
                            {/* Section Header */}
                            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center shrink-0">
                                        <Coins className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h2 className="text-xs font-bold text-white uppercase tracking-wider">Contributions & Pledges</h2>
                                        <p className="text-[11px] text-slate-400">Support the hosts with your blessing & gift</p>
                                    </div>
                                </div>
                                {guest?.pledge_status === 'completed' && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                                        <CheckCircle2 className="w-3 h-3" /> Completed
                                    </span>
                                )}
                                {guest?.pledge_status === 'partial' && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-400 bg-sky-500/15 border border-sky-500/30 px-2 py-0.5 rounded-full">
                                        Partial ({Math.round(guest?.pledge_progress_percent || 0)}%)
                                    </span>
                                )}
                                {guest?.pledge_status === 'pending' && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full">
                                        Pending Payment
                                    </span>
                                )}
                                {(!guest?.pledge_status || guest?.pledge_status === 'unpledged') && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-white/[0.06] border border-white/[0.1] px-2 py-0.5 rounded-full">
                                        No Pledge Yet
                                    </span>
                                )}
                            </div>

                            {/* Metrics Grid */}
                            <div className="grid grid-cols-3 gap-2">
                                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pledged</span>
                                    <span className="text-xs font-bold text-white block mt-0.5">
                                        {guest?.pledge_amount > 0 ? `${event?.pledge_currency || 'TZS'} ${Number(guest.pledge_amount).toLocaleString()}` : '—'}
                                    </span>
                                </div>
                                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Paid</span>
                                    <span className="text-xs font-bold text-emerald-400 block mt-0.5">
                                        {event?.pledge_currency || 'TZS'} {Number(guest?.paid_amount || 0).toLocaleString()}
                                    </span>
                                </div>
                                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Balance</span>
                                    <span className="text-xs font-bold text-sky-300 block mt-0.5">
                                        {event?.pledge_currency || 'TZS'} {Number(guest?.pledge_balance || 0).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            {guest?.pledge_amount > 0 && (
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                                        <span>Progress</span>
                                        <span className="text-white font-bold">{Math.round(guest?.pledge_progress_percent || 0)}%</span>
                                    </div>
                                    <div className="w-full h-2 rounded-full bg-white/[0.08] overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 rounded-full transition-all duration-500"
                                            style={{ width: `${Math.min(100, Math.max(0, guest?.pledge_progress_percent || 0))}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Feedback alerts */}
                            {pledgeFeedback && (
                                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                                    <span>{pledgeFeedback}</span>
                                </div>
                            )}
                            {paymentFeedback && (
                                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                                    <span>{paymentFeedback}</span>
                                </div>
                            )}

                            {/* Interactive Tabs: Pay / Send Contribution vs Commit Pledge */}
                            <div className="flex rounded-xl bg-white/[0.03] p-1 border border-white/[0.06] gap-1">
                                <button
                                    type="button"
                                    onClick={() => setActivePledgeTab('pay')}
                                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition text-center cursor-pointer ${
                                        activePledgeTab === 'pay'
                                            ? 'bg-sky-500/20 text-sky-300 border border-sky-400/30 shadow-xs'
                                            : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    Send Contribution / Pay
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActivePledgeTab('pledge')}
                                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition text-center cursor-pointer ${
                                        activePledgeTab === 'pledge'
                                            ? 'bg-sky-500/20 text-sky-300 border border-sky-400/30 shadow-xs'
                                            : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    {guest?.pledge_amount > 0 ? 'Edit Pledge' : 'Make a Pledge'}
                                </button>
                            </div>

                            {/* Tab 1: Pay / Send Contribution & Submit Proof */}
                            {activePledgeTab === 'pay' && (
                                <div className="space-y-3.5 pt-1 text-xs">
                                    {/* Organizer Payment Info Cards */}
                                    <div className="space-y-2">
                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                            Official Payment Channels
                                        </span>

                                        {/* Lipa Namba */}
                                        {event?.pledge_settings?.lipa_namba && (
                                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                                                        Lipa
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] text-slate-400 font-medium">Lipa Namba / Till</div>
                                                        <div className="font-mono text-xs font-bold text-white tracking-wide">
                                                            {event.pledge_settings.lipa_namba}
                                                        </div>
                                                        {event.pledge_settings.account_name && (
                                                            <div className="text-[10px] text-slate-400">
                                                                {event.pledge_settings.account_name}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => copyToClipboard(event.pledge_settings.lipa_namba, 'lipa')}
                                                    className="px-2.5 py-1 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-slate-300 hover:text-white text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                                                >
                                                    {copiedField === 'lipa' ? (
                                                        <>
                                                            <Check className="w-3 h-3 text-emerald-400" />
                                                            <span className="text-emerald-400">Copied</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="w-3 h-3" />
                                                            <span>Copy</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        )}

                                        {/* Bank Details */}
                                        {event?.pledge_settings?.bank_account && (
                                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center font-bold text-xs shrink-0">
                                                        Bank
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] text-slate-400 font-medium">
                                                            {event.pledge_settings.bank_name || 'Bank Transfer'}
                                                        </div>
                                                        <div className="font-mono text-xs font-bold text-white tracking-wide">
                                                            {event.pledge_settings.bank_account}
                                                        </div>
                                                        {event.pledge_settings.account_name && (
                                                            <div className="text-[10px] text-slate-400">
                                                                {event.pledge_settings.account_name}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => copyToClipboard(event.pledge_settings.bank_account, 'bank')}
                                                    className="px-2.5 py-1 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-slate-300 hover:text-white text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                                                >
                                                    {copiedField === 'bank' ? (
                                                        <>
                                                            <Check className="w-3 h-3 text-emerald-400" />
                                                            <span className="text-emerald-400">Copied</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="w-3 h-3" />
                                                            <span>Copy</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        )}

                                        {event?.pledge_settings?.instructions && (
                                            <p className="text-[11px] text-slate-400 italic px-1">
                                                {event.pledge_settings.instructions}
                                            </p>
                                        )}
                                    </div>

                                    {/* Submit Payment Proof Form */}
                                    <form onSubmit={handlePaymentSubmit} className="pt-2 border-t border-white/[0.06] space-y-3">
                                        <span className="text-[11px] font-bold text-white uppercase tracking-wider block">
                                            Record Payment / Mobile Money Proof
                                        </span>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-[10px] font-medium text-slate-400 mb-1">
                                                    Amount Paid ({event?.pledge_currency || 'TZS'})
                                                </label>
                                                <input
                                                    type="number"
                                                    min="100"
                                                    required
                                                    value={paymentAmount}
                                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                                    placeholder="e.g. 50000"
                                                    className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-sky-400"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-medium text-slate-400 mb-1">
                                                    Reference Code / Muamala
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={paymentRef}
                                                    onChange={(e) => setPaymentRef(e.target.value)}
                                                    placeholder="e.g. 9G28XK911L"
                                                    className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 uppercase font-mono focus:outline-hidden focus:border-sky-400"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <select
                                                value={paymentMethod}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                                aria-label="Payment Method"
                                                className="bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-sky-400"
                                            >
                                                <option value="lipa_namba" className="bg-slate-900 text-white">Lipa Namba</option>
                                                <option value="mobile_money" className="bg-slate-900 text-white">Mobile Money</option>
                                                <option value="bank" className="bg-slate-900 text-white">Bank Transfer</option>
                                                <option value="cash" className="bg-slate-900 text-white">Cash</option>
                                            </select>

                                            <button
                                                type="submit"
                                                disabled={submittingPayment || !paymentAmount || !paymentRef.trim()}
                                                className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-500 hover:to-teal-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg active:scale-98"
                                            >
                                                <Check className="w-3.5 h-3.5" />
                                                <span>{submittingPayment ? 'Submitting...' : 'Confirm Payment'}</span>
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Tab 2: Commit / Update Pledge */}
                            {activePledgeTab === 'pledge' && (
                                <form onSubmit={handlePledgeSubmit} className="space-y-3.5 pt-1 text-xs">
                                    <div>
                                        <label className="block text-[11px] font-medium text-slate-400 mb-2">
                                            Quick Suggested Amounts ({event?.pledge_currency || 'TZS'}):
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {[20000, 50000, 100000, 200000, 500000].map((amt) => (
                                                <button
                                                    key={amt}
                                                    type="button"
                                                    onClick={() => setPledgeAmount(amt)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                                                        Number(pledgeAmount) === amt
                                                            ? 'bg-sky-500/20 border-sky-400 text-white'
                                                            : 'bg-white/[0.04] border-white/[0.08] text-slate-300 hover:text-white hover:bg-white/[0.08]'
                                                    }`}
                                                >
                                                    {amt >= 1000000 ? `${amt / 1000000}M` : `${amt / 1000}K`}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-medium text-slate-400 mb-1">
                                            Pledge Amount ({event?.pledge_currency || 'TZS'})
                                        </label>
                                        <input
                                            type="number"
                                            min="500"
                                            required
                                            value={pledgeAmount}
                                            onChange={(e) => setPledgeAmount(e.target.value)}
                                            placeholder="e.g. 100000"
                                            className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-sky-400"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-medium text-slate-400 mb-1">
                                            Optional Note / Message
                                        </label>
                                        <input
                                            type="text"
                                            value={pledgeNotes}
                                            onChange={(e) => setPledgeNotes(e.target.value)}
                                            placeholder="e.g. Will contribute before month end"
                                            className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-sky-400"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submittingPledge || !pledgeAmount || Number(pledgeAmount) <= 0}
                                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg active:scale-98"
                                    >
                                        <Check className="w-3.5 h-3.5" />
                                        <span>{submittingPledge ? 'Saving...' : 'Save Pledge Commitment'}</span>
                                    </button>
                                </form>
                            )}

                            {/* Recent Verified Payments History */}
                            {recentPayments && recentPayments.length > 0 && (
                                <div className="pt-2 border-t border-white/[0.06] space-y-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                        Recorded Contributions
                                    </span>
                                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                                        {recentPayments.map((p) => (
                                            <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-[11px]">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                                    <div>
                                                        <span className="font-mono text-white font-bold">{p.reference || p.reference_number || 'Payment'}</span>
                                                        <span className="text-[10px] text-slate-500 block">
                                                            {p.payment_date ? new Date(p.payment_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : (p.created_at ? new Date(p.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Verified')}
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className="font-bold text-emerald-400">
                                                    {event?.pledge_currency || 'TZS'} {Number(p.amount).toLocaleString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Event Details Card */}
                    <div className="w-full p-5 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md shadow-lg space-y-3.5 text-xs">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-white/[0.06]">
                            Event Details
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="w-7 h-7 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
                                    <Calendar className="w-3.5 h-3.5" />
                                </div>
                                <div>
                                    <span className="text-[11px] text-slate-400 block">Date & Time</span>
                                    <span className="font-bold text-white text-xs">
                                        {event?.event_date ? new Date(event.event_date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'Upcoming Date'}
                                    </span>
                                    {event?.event_time && <span className="text-slate-400 block text-[11px]">{event.event_time}</span>}
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                                    <MapPin className="w-3.5 h-3.5" />
                                </div>
                                <div>
                                    <span className="text-[11px] text-slate-400 block">Venue & Location</span>
                                    <span className="font-bold text-white text-xs">{event?.venue || 'Venue to be announced'}</span>
                                    {event?.city && <span className="text-slate-400 block text-[11px]">{event.city}</span>}
                                </div>
                            </div>

                            {(guest?.table_number || guest?.seat_number) && (
                                <div className="flex items-start gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                                        <Ticket className="w-3.5 h-3.5" />
                                    </div>
                                    <div>
                                        <span className="text-[11px] text-slate-400 block">Seating Assignment</span>
                                        <span className="font-bold text-white text-xs">
                                            Table {guest.table_number || 'General'}{guest?.seat_number ? `, Seat ${guest.seat_number}` : ''}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Entrance Check-in Notice */}
                    <div className="w-full p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] text-center text-slate-400 text-[11px] space-y-1">
                        <p>Present the QR code on your card at the reception scanner for entrance verification.</p>
                        <p className="font-mono text-slate-500 text-[10px]">Pass ID: {guest?.card_number || guest?.unique_code || 'KDV-PASS'}</p>
                    </div>

                    {/* Footer */}
                    <footer className="w-full pt-6 border-t border-white/[0.08] text-center space-y-2">
                        <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
                            <KardovoLogo className="w-4 h-4 opacity-75" />
                            <span>Kardovo Pass & RSVP System</span>
                        </div>
                        <p className="text-[10px] text-slate-500">
                            Official digital pass powered by Kardovo. All rights reserved.
                        </p>
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
                className="fixed top-4 right-4 z-[2147483640] flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#fffaf8]/90 hover:bg-[#fffaf8] text-[#a67d2b] hover:text-[#7f5d1e] shadow-lg border border-[#a67d2b]/30 backdrop-blur-xs transition cursor-pointer text-xs font-semibold tracking-wider uppercase font-['Cinzel',serif]"
                title="View Guest Entry Pass"
            >
                <Ticket className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Guest Entry Pass</span>
            </button>

            {/* ── DIGITAL PASS MODAL ── */}
            {showTicketModal && (
                <div
                    className="fixed inset-0 z-[2147483647] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in"
                    onClick={() => setShowTicketModal(false)}
                >
                    <div
                        className="relative w-full max-w-sm rounded-2xl p-6 shadow-2xl text-center bg-[#fffaf8] border border-[#a67d2b]/30"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setShowTicketModal(false)}
                            className="absolute top-4 right-4 p-2 text-slate-500 hover:text-black rounded-full"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <p className="font-['Cinzel',serif] text-xs uppercase tracking-widest text-[#a67d2b] mb-1 font-semibold">
                            Guest Entry Pass
                        </p>
                        <h4 className="font-serif text-2xl text-[#4f4f4f] mb-4">
                            {guest?.name || 'Valued Guest'}
                        </h4>

                        <div className="p-3 bg-white rounded-xl inline-block border border-[#a67d2b]/30 shadow-inner mb-4">
                            {qrCodeUrl ? (
                                <img src={qrCodeUrl} alt="QR Code" className="w-44 h-44 object-contain mx-auto" />
                            ) : (
                                <div className="w-44 h-44 bg-slate-100 animate-pulse" />
                            )}
                        </div>

                        <div className="space-y-1">
                            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#a67d2b]/15 text-[#a67d2b]">
                                {guest?.category || guest?.allowance_label || 'Standard Entry'}
                            </span>
                            <p className="text-xs text-[#846f61] font-mono mt-1">
                                {guest?.card_number || 'KDV-2026-PASS'}
                            </p>
                            {guest?.table_number && (
                                <p className="text-xs text-[#6c513f] font-semibold mt-1">
                                    Table {guest.table_number}{guest?.seat_number ? `, Seat ${guest.seat_number}` : ''}
                                </p>
                            )}
                            <p className="text-[11px] text-[#846f61] italic mt-2">
                                Present this QR code at the reception check-in.
                            </p>
                        </div>

                        {guest?.pledge_amount > 0 && (
                            <div className="mt-3 p-2.5 rounded-xl bg-[#a67d2b]/10 border border-[#a67d2b]/20 text-left text-xs">
                                <div className="flex items-center justify-between text-[#846f61] font-semibold text-[11px] mb-1">
                                    <span>Contribution Status:</span>
                                    <span className="text-[#a67d2b] uppercase font-bold">{guest?.pledge_status || 'Pledged'}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-[#6c513f]">Paid: <strong>{event?.pledge_currency || 'TZS'} {Number(guest?.paid_amount || 0).toLocaleString()}</strong></span>
                                    <span className="text-[#6c513f]">Balance: <strong>{event?.pledge_currency || 'TZS'} {Number(guest?.pledge_balance || 0).toLocaleString()}</strong></span>
                                </div>
                            </div>
                        )}

                        <div className="pt-6 mt-4 border-t border-[#a67d2b]/20 flex items-center justify-center gap-2 text-[10px] uppercase font-['Cinzel',serif] tracking-widest text-[#6c513f]/70">
                            <KardovoLogo showText={false} className="w-4 h-4 opacity-75" />
                            <span>Kardovo Invitations</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
