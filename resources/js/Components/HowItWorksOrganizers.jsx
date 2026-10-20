import React, { useState } from 'react';
import { 
    Layers, 
    TrendingUp, 
    ShieldCheck, 
    Zap, 
    Monitor, 
    Smartphone, 
    CheckCircle2, 
    Sparkles, 
    Ticket, 
    Tag, 
    Lock, 
    ScanLine, 
    Printer, 
    CreditCard, 
    ChevronDown, 
    ChevronUp, 
    HelpCircle, 
    Mail, 
    Phone, 
    MessageCircle, 
    ArrowRight, 
    Clock, 
    Wifi, 
    WifiOff, 
    Users, 
    DollarSign, 
    Check, 
    QrCode,
    Building2,
    Calendar,
    Share2,
    ExternalLink
} from 'lucide-react';

export default function HowItWorksOrganizers({ lang = 'en', onContactClick, onSignUpClick }) {
    const [activeCategory, setActiveCategory] = useState('create_manage');
    const [deviceView, setDeviceView] = useState('big_screen'); // 'big_screen' | 'small_screen'
    const [openFaqIndex, setOpenFaqIndex] = useState(0);

    const categories = [
        {
            id: 'create_manage',
            step: '01',
            title: lang === 'sw' ? '1. Tengeneza & Simamia' : '1. Create & Manage',
            subtitle: lang === 'sw' ? 'Sanidi tukio lako, viwango vya tiketi na pasi maalum kwa dakika chache' : 'Set up events, custom ticket tiers, and luxury passes in minutes',
            badge: lang === 'sw' ? 'Kuanzisha Haraka' : 'Quick Setup',
            icon: Layers,
            color: 'from-blue-600 to-indigo-600',
            features: [
                {
                    title: lang === 'sw' ? 'Viwango vya Tiketi Visivyo na Kikomo' : 'Unlimited Multi-Tier Tickets',
                    desc: lang === 'sw' 
                        ? 'Unda viwango vya VIP, VVIP, Early Bird, au Kawaida vyenye bei tofauti na idadi maalum ya viti.' 
                        : 'Create unlimited VIP, Early Bird, Regular, or Table tiers with custom prices and inventory limits.',
                },
                {
                    title: lang === 'sw' ? 'Udhibiti wa Uwezo & Tiketi Zisizopitiliza' : 'Real-Time Capacity & Inventory Lock',
                    desc: lang === 'sw' 
                        ? 'Mfumo unazuia kiotomatiki uuzaji kupita kiasi. Kiwango kikikamilika, kinabadilika kuwa Sold Out mara moja.' 
                        : 'Atomic row locking prevents over-selling. Once capacity is reached, tiers automatically switch to Sold Out.',
                },
                {
                    title: lang === 'sw' ? 'Muda wa Kufunga Mauzo Kiotomatiki' : 'Custom Sales Deadlines & Schedules',
                    desc: lang === 'sw' 
                        ? 'Chagua tarehe na saa husika ya kufunga mauzo au endelea kuuza hadi dakika za mwisho mlangoni.' 
                        : 'Set precise countdowns to auto-close early bird sales or keep ticketing live until gate opening.',
                },
                {
                    title: lang === 'sw' ? 'Pasi za Kidijitali za Kifahari' : 'Luxury Digital Pass Customization',
                    desc: lang === 'sw' 
                        ? 'Weka picha ya bango, ramani ya ukumbi, maagizo ya mlangoni na taarifa binafsi za mgeni.' 
                        : 'Personalize passes with event artwork, venue instructions, seat allocations, and dress codes.',
                },
            ],
        },
        {
            id: 'sell_promote',
            step: '02',
            title: lang === 'sw' ? '2. Uza & Tangaza' : '2. Sell & Promote',
            subtitle: lang === 'sw' ? 'Fikia maelfu ya wanunuzi kwa malipo rahisi ya mguso mmoja na kodi za punguzo' : 'Reach thousands of attendees with instant 1-tap mobile checkout',
            badge: lang === 'sw' ? 'Mauzo ya Juu' : 'High Conversion',
            icon: TrendingUp,
            color: 'from-sky-500 to-[#154F7C]',
            features: [
                {
                    title: lang === 'sw' ? 'Kutangazwa Sokoni Kiotomatiki' : 'Featured Marketplace Listing',
                    desc: lang === 'sw' 
                        ? 'Tukio lako linaonekana moja kwa moja kwenye soko kuu la tiketi la Kardovo kwa wanunuzi kote nchini.' 
                        : 'Your event is prominently listed on the Kardovo public marketplace across concerts, nightlife, and sports.',
                },
                {
                    title: lang === 'sw' ? 'Kiungo Rahisi cha Kushiriki (Social Link)' : 'Direct 1-Click Checkout Links',
                    desc: lang === 'sw' 
                        ? 'Weka kiungo chako kwenye Instagram bio, WhatsApp, TikTok, au vipeperushi bila usumbufu.' 
                        : 'Direct shareable links for Instagram bio, WhatsApp status, posters, and TikTok with frictionless direct checkout.',
                },
                {
                    title: lang === 'sw' ? 'Malipo ya Simu ya Papo Hapo (M-Pesa, Tigo, Airtel)' : '1-Tap Mobile Money & Card Payments',
                    desc: lang === 'sw' 
                        ? 'Wanunuzi wanalipa kwa sekunde chache kupitia M-Pesa, Tigo Pesa, Airtel Money, Halopesa na Kadi za Benki.' 
                        : 'Fast mobile checkout supporting M-Pesa, Tigo Pesa, Airtel Money, Halopesa, and Visa/Mastercard.',
                },
                {
                    title: lang === 'sw' ? 'Kodi za Punguzo Zisizo na Kikomo (Discount Codes)' : 'Unlimited Custom Discount Codes',
                    desc: lang === 'sw' 
                        ? 'Tengeneza kodi maalum za punguzo (asilimia au kiasi halisi) ili kuharakisha uuzaji wa tiketi zako.' 
                        : 'Launch promotional campaigns with percentage or fixed discounts, usage caps, and expiration dates.',
                },
                {
                    title: lang === 'sw' ? 'Uwasilishaji wa Papo Hapo WhatsApp & SMS' : 'Instant WhatsApp & SMS Ticket Delivery',
                    desc: lang === 'sw' 
                        ? 'Mteja akilipa, anapokea tiketi yake yenye QR Code moja kwa moja kwenye WhatsApp na ujumbe wa SMS.' 
                        : 'Automated instant dispatch sends the digital ticket pass directly to the buyer’s WhatsApp and phone SMS.',
                },
            ],
        },
        {
            id: 'security_support',
            step: '03',
            title: lang === 'sw' ? '3. Usalama & Msaada' : '3. Security & Support',
            subtitle: lang === 'sw' ? 'Hakuna tiketi bandia, QR code zilizolindwa kihesabu na ulinzi wa roboti' : 'Zero counterfeit passes, encrypted anti-tamper QR tokens, and 24/7 care',
            badge: lang === 'sw' ? 'Usalama wa 100%' : 'Bulletproof',
            icon: ShieldCheck,
            color: 'from-emerald-500 to-teal-700',
            features: [
                {
                    title: lang === 'sw' ? 'QR Code Zenye Sahihi ya Siri (Anti-Counterfeit)' : 'Cryptographic Anti-Counterfeit Tokens',
                    desc: lang === 'sw' 
                        ? 'Kila tiketi ina namba ya siri iliyosimbwa kihesabu. Haiwezekani kughushi, kupiga picha, au kutengeneza nakala.' 
                        : 'Every ticket contains a cryptographically signed HMAC token that cannot be duplicated or photocopied.',
                },
                {
                    title: lang === 'sw' ? 'Kuzuia Kuingia Mara Mbili (Single-Entry Burn)' : 'Instant Gate Burn & Duplicate Block',
                    desc: lang === 'sw' 
                        ? 'Tiketi ikishakaguliwa mlangoni, inafungwa papo hapo. Mtu akijaribu kuitumia tena lango lingine inakataliwa mara moja.' 
                        : 'Tickets are permanently marked as used upon first scan. Re-entry attempts or forwarded screenshots trigger instant fraud alerts.',
                },
                {
                    title: lang === 'sw' ? 'Ulinzi wa Roboti & Malipo Mara Mbili (Bot Defense)' : 'Scalper Bot Defense & Idempotency',
                    desc: lang === 'sw' 
                        ? 'Mitego ya roboti (honeypots), vizuizi vya kasi na funguo za idempotency huzuia walanguzi na makato mara mbili.' 
                        : 'Session-bound timestamps, honeypots, and idempotency protect events from botnet scalpers and accidental double charges.',
                },
                {
                    title: lang === 'sw' ? 'Rekodi Zisizofutika & Msaada wa Saa 24' : 'Immutable Financial Ledger & 24/7 Concierge',
                    desc: lang === 'sw' 
                        ? 'Kila ununuzi na malipo yanarekodiwa kwa uwazi. Timu yetu ipo tayari kukusaidia saa zote kupitia WhatsApp na Simu.' 
                        : 'Full transaction audit trail, transparent revenue settlement, and dedicated human support around the clock.',
                },
            ],
        },
        {
            id: 'operational_efficiency',
            step: '04',
            title: lang === 'sw' ? '4. Ufanisi wa Uendeshaji' : '4. Operational Efficiency',
            subtitle: lang === 'sw' ? 'Uhakiki wa mlangoni chini ya sekunde moja, modi ya nje ya mtandao na mikanda' : 'Sub-second entrance scanning, offline sync, and on-site door ticketing',
            badge: lang === 'sw' ? 'Mlangoni Haraka' : 'High Speed',
            icon: Zap,
            color: 'from-amber-500 to-orange-600',
            features: [
                {
                    title: lang === 'sw' ? 'App ya Kukagua Mlangoni (Kardovo Scanner)' : 'Ultra-Fast Gate Scanner App',
                    desc: lang === 'sw' 
                        ? 'Tumia simu yoyote ya kawaida kukagua tiketi kwa chini ya sekunde 0.2 bila kuhitaji vifaa vya gharama kubwa.' 
                        : 'Turns any smartphone or barcode reader into a high-speed scanner admitting attendees in under 0.2 seconds.',
                },
                {
                    title: lang === 'sw' ? 'Kazi Bila Mtandao (Offline Sync Mode)' : 'Offline Resilient Gate Validation',
                    desc: lang === 'sw' 
                        ? 'Hata kama mtandao wa simu utakata ukumbini, mageti yataendelea kukagua wageni vizuri na kutuma data mtandao ukirudi.' 
                        : 'Entrance gates keep running smoothly even during complete internet blackout, auto-syncing when connectivity resumes.',
                },
                {
                    title: lang === 'sw' ? 'Mauzo ya Mlangoni (Door POS & Cashier Mode)' : 'Door POS & Cashier Mode',
                    desc: lang === 'sw' 
                        ? 'Uza tiketi mlangoni kwa wageni wanaofika ghafla, pokea pesa taslimu au simu na utoe pasi mara moja.' 
                        : 'Sell tickets to walk-ins at the door, collect cash or mobile money, and issue digital passes on the spot.',
                },
                {
                    title: lang === 'sw' ? 'Karatasi za Kuchapa Mikanda ya Mkononi' : 'Custom Wristband & Pass Sheets',
                    desc: lang === 'sw' 
                        ? 'Chapisha mikanda yenye taarifa za tukio au karatasi za tiketi tayari kwa ajili ya wageni mlangoni.' 
                        : 'Instant printable layout sheets for personalized attendee wristbands and batch gate passes.',
                },
                {
                    title: lang === 'sw' ? 'Malipo Moja kwa Moja Benki au Simu' : 'Direct Bank & Mobile Money Payouts',
                    desc: lang === 'sw' 
                        ? 'Pata mapato yako ya mauzo moja kwa moja kwenye akaunti yako ya benki au namba ya simu kwa uwazi wa 100%.' 
                        : 'Automated, scheduled revenue settlements transferred directly to your bank account or mobile wallet.',
                },
            ],
        },
    ];

    const currentCat = categories.find(c => c.id === activeCategory) || categories[0];

    const faqs = [
        {
            q: lang === 'sw' ? 'Je, ninapokeaje mapato ya mauzo ya tiketi zangu?' : 'How do I receive payouts from my ticket sales?',
            a: lang === 'sw'
                ? 'Mapato yanalipwa moja kwa moja kwenye akaunti yako ya benki au namba ya simu (M-Pesa, Tigo Pesa, Airtel Money) kulingana na ratiba unayochagua, pamoja na taarifa kamili ya mapato kwenye dashibodi yako.'
                : 'Payouts are transferred directly to your registered bank account or mobile money wallet (M-Pesa, Tigo Pesa, Airtel Money) according to your schedule, with full transparent transaction statements on your finance dashboard.'
        },
        {
            q: lang === 'sw' ? 'Je, ninaweza kuuza tiketi mlangoni siku ya tukio?' : 'Can I sell tickets at the venue door on the event day?',
            a: lang === 'sw'
                ? 'Ndio! Kardovo ina modi maalum ya Door POS & Cashier inayomwezesha mweka hazina au wahudumu kuuza tiketi kwa wageni wanaofika ghafla ukumbini na kutoa pasi au mikanda mara moja.'
                : 'Yes! Kardovo includes a built-in Door POS & Cashier Mode. Your gate staff can accept walk-ins, collect cash or mobile money, and instantly issue digital passes or print wristbands.'
        },
        {
            q: lang === 'sw' ? 'Nini kitatokea ikiwa mtandao wa simu utakata ukumbini?' : 'What happens if the internet drops at the venue entrance?',
            a: lang === 'sw'
                ? 'App ya Kardovo Scanner inafanya kazi bila mtandao (Offline Mode). Inahifadhi orodha ya tiketi zote ndani ya simu na kuendelea kuhakiki wageni bila kusimama. Mtandao ukirudi, inatuma taarifa zote mtandaoni kiotomatiki.'
                : 'The Kardovo Scanner App features full Offline Mode. It caches your attendee database locally and verifies tickets with zero latency even without internet, automatically syncing scan records once connection returns.'
        },
        {
            q: lang === 'sw' ? 'Wageni wanapokeaje tiketi zao baada ya kulipia?' : 'How do buyers receive their tickets after purchasing?',
            a: lang === 'sw'
                ? 'Mara tu baada ya kukamilisha malipo, mteja anapokea ujumbe wa WhatsApp na SMS wenye kiungo cha pasi yake ya kidijitali iliyo na QR Code maalum, maelezo ya tukio na chaguo la kuihifadhi kwenye simu.'
                : 'Immediately upon checkout completion, attendees receive an automated WhatsApp notification and SMS with their digital ticket pass, unique anti-counterfeit QR code, and venue directions.'
        },
        {
            q: lang === 'sw' ? 'Je, ninaweza kuweka punguzo (discount codes) kwa wateja maalum?' : 'Can I create promotional discount codes for special guests?',
            a: lang === 'sw'
                ? 'Ndio, unaweza kutengeneza kodi za punguzo zisizo na kikomo (mfano: EARLYBIRD20, VIPGIFT) kwa asilimia au kiasi cha fedha, na kuweka idadi ya matumizi au tarehe ya kuisha.'
                : 'Yes. You can create unlimited discount codes (e.g. EARLYBIRD20, VIPGIFT) with percentage or flat amounts, minimum purchase thresholds, and usage caps directly from your dashboard.'
        },
        {
            q: lang === 'sw' ? 'Kuna gharama zozote za mwezi au za kuanza?' : 'Are there any upfront or monthly subscription fees?',
            a: lang === 'sw'
                ? 'Hapana! Hakuna malipo yoyote ya awali, hakuna ada ya mwezi na hakuna mkataba. Unalipia tu asilimia ndogo na ya wazi kwa tiketi zilizouzwa pekee. Matukio ya bure hayatozwi hata senti moja.'
                : 'Zero upfront cost, zero monthly subscriptions, and no contracts. Kardovo only charges a small, transparent percentage fee per paid ticket sold. Free events are completely free.'
        },
    ];

    return (
        <section id="how-it-works" className="mt-16 sm:mt-24 pt-12 sm:pt-16 border-t border-slate-200/80 scroll-mt-24">
            {/* Header Badge & Title */}
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 px-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#154F7C]/10 border border-[#154F7C]/20 text-[#154F7C] text-xs font-bold tracking-wide uppercase mb-4 shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                    <span>{lang === 'sw' ? 'Mwongozo Kamili wa Waandaaji' : 'Complete Organizer Guide'}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 font-display tracking-tight leading-tight">
                    {lang === 'sw' ? 'Jinsi Kardovo Ticketing Inavyofanya Kazi' : 'How Kardovo Ticketing Works for Organizers'}
                </h2>
                <p className="text-xs sm:text-sm md:text-base text-slate-600 font-medium max-w-2xl mx-auto mt-3 sm:mt-4 leading-relaxed">
                    {lang === 'sw' 
                        ? 'Suluhisho la kisasa na rahisi kwa waandaaji wa matamasha, vilabu, mikutano na matukio ya michezo kukuza mauzo na kusimamia milango bila kosa.'
                        : 'A seamless, enterprise-grade ticketing engine designed for concert creators, nightlife promoters, summits, and sports organizers across Tanzania.'}
                </p>
            </div>

            {/* ══════════════════════════════════════════════════════════════
                1. INTERACTIVE CATEGORY TABS (4 Pillars)
               ══════════════════════════════════════════════════════════════ */}
            <div className="max-w-6xl mx-auto px-4 mb-8 sm:mb-12">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 p-1.5 sm:p-2 bg-slate-200/60 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-300/60 shadow-inner">
                    {categories.map((cat) => {
                        const Icon = cat.icon;
                        const isActive = activeCategory === cat.id;
                        return (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => setActiveCategory(cat.id)}
                                className={`group relative p-3 sm:p-4 rounded-xl sm:rounded-2xl text-left transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                                    isActive
                                        ? 'bg-white text-slate-900 shadow-md shadow-slate-900/10 border border-slate-200/90 scale-[1.01]'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all ${
                                        isActive 
                                            ? 'bg-gradient-to-r from-[#154F7C] to-[#327FB5] text-white shadow-xs' 
                                            : 'bg-slate-100 text-slate-500 group-hover:text-slate-700'
                                    }`}>
                                        <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                        isActive ? 'bg-sky-50 text-[#154F7C] border border-sky-200' : 'text-slate-400'
                                    }`}>
                                        {cat.badge}
                                    </span>
                                </div>
                                <div>
                                    <h4 className="text-xs sm:text-sm font-black tracking-tight font-display">
                                        {cat.title}
                                    </h4>
                                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 hidden sm:block">
                                        {cat.subtitle}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════
                2. ACTIVE PILLAR DETAIL & SCREENSHOT SHOWCASE (Big Screen + Small Screen)
               ══════════════════════════════════════════════════════════════ */}
            <div className="max-w-6xl mx-auto px-4 mb-14 sm:mb-20">
                <div className="bg-white/95 rounded-3xl sm:rounded-4xl p-5 sm:p-8 lg:p-10 border border-slate-200/90 shadow-[0_20px_50px_-15px_rgba(21,79,124,0.1),0_0_1px_rgba(21,79,124,0.2)]">
                    
                    {/* Pillar Title Bar & Device View Toggle */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 sm:pb-8 border-b border-slate-100">
                        <div>
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-xs font-black text-sky-600 uppercase tracking-widest">
                                    Step {currentCat.step}
                                </span>
                                <span className="text-slate-300">•</span>
                                <span className="text-xs font-bold text-slate-500">
                                    {currentCat.badge}
                                </span>
                            </div>
                            <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 font-display tracking-tight">
                                {currentCat.title}
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
                                {currentCat.subtitle}
                            </p>
                        </div>

                        {/* Big Screen vs Small Screen Device Toggle */}
                        <div className="inline-flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200 self-stretch sm:self-auto justify-center">
                            <button
                                type="button"
                                onClick={() => setDeviceView('big_screen')}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                    deviceView === 'big_screen'
                                        ? 'bg-[#154F7C] text-white shadow-xs shadow-[#154F7C]/30'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                <Monitor className="w-3.5 h-3.5" />
                                <span>{lang === 'sw' ? 'Skrini Kubwa (Laptop/Desktop)' : 'Big Screen (Desktop)'}</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setDeviceView('small_screen')}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                    deviceView === 'small_screen'
                                        ? 'bg-[#154F7C] text-white shadow-xs shadow-[#154F7C]/30'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                <Smartphone className="w-3.5 h-3.5" />
                                <span>{lang === 'sw' ? 'Skrini Ndogo (Simu ya Mkononi)' : 'Small Screen (Mobile)'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Content Split: Left Features List, Right Realistic Interactive Mockup Frame */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 mt-8 items-center">
                        
                        {/* Features Breakdown */}
                        <div className="lg:col-span-5 space-y-4">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                                {lang === 'sw' ? 'Vipengele Muhimu & Manufaa' : 'Key Capabilities & Benefits'}
                            </h4>
                            {currentCat.features.map((feat, idx) => (
                                <div 
                                    key={idx}
                                    className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/80 hover:bg-slate-100/90 border border-slate-200/70 transition-all duration-200 group"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-lg bg-sky-100 text-[#154F7C] flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#154F7C] group-hover:text-white transition-colors">
                                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                        </div>
                                        <div>
                                            <h5 className="text-xs sm:text-sm font-bold text-slate-900">
                                                {feat.title}
                                            </h5>
                                            <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed mt-1">
                                                {feat.desc}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Interactive UI Mockup Showcase (Dynamic Based on Category & Screen Choice) */}
                        <div className="lg:col-span-7 flex justify-center">
                            {deviceView === 'big_screen' ? (
                                /* ══════════════════════════════════════════════
                                   BIG SCREEN (DESKTOP / LAPTOP) MOCKUP FRAME
                                   ══════════════════════════════════════════════ */
                                <div className="w-full max-w-xl bg-slate-900 rounded-2xl sm:rounded-3xl p-2.5 sm:p-3.5 shadow-2xl border border-slate-700/80 shadow-[#154F7C]/20 transition-all duration-300">
                                    {/* Chrome Header */}
                                    <div className="flex items-center justify-between px-2 sm:px-3 pb-2.5 border-b border-slate-800 text-[11px] text-slate-400">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                                        </div>
                                        <div className="px-3 py-1 rounded-md bg-slate-800/90 text-slate-300 font-mono text-[10px] tracking-tight flex items-center gap-1.5 border border-slate-700/60 truncate max-w-[240px]">
                                            <Lock className="w-2.5 h-2.5 text-emerald-400" />
                                            <span>kardovo.com/organizer/ticketing-studio</span>
                                        </div>
                                        <div className="text-[10px] text-slate-500 font-medium">1080p Studio</div>
                                    </div>

                                    {/* Mockup Screen Content */}
                                    <div className="bg-[#0B2545] text-white rounded-xl sm:rounded-2xl p-4 sm:p-5 mt-2.5 border border-white/10 min-h-[340px] flex flex-col justify-between select-none">
                                        {activeCategory === 'create_manage' && (
                                            <div>
                                                <div className="flex items-center justify-between pb-3 border-b border-white/15">
                                                    <div>
                                                        <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider">Ticketing Studio</span>
                                                        <h5 className="text-sm sm:text-base font-black">Neema & Baraka — Gala Concert</h5>
                                                    </div>
                                                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">Active • 1,240 Sold</span>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3 mt-4">
                                                    <div className="p-3 rounded-xl bg-white/10 border border-white/15">
                                                        <div className="flex justify-between items-center text-[10px] text-slate-300 mb-1">
                                                            <span>VIP Lounge Tier</span>
                                                            <span className="text-amber-300 font-bold">TZS 100,000</span>
                                                        </div>
                                                        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                                            <div className="bg-gradient-to-r from-sky-400 to-blue-500 h-full w-[85%]" />
                                                        </div>
                                                        <div className="text-[10px] text-sky-300 mt-1 font-semibold flex justify-between">
                                                            <span>170 / 200 Sold</span>
                                                            <span>85% Capacity</span>
                                                        </div>
                                                    </div>

                                                    <div className="p-3 rounded-xl bg-white/10 border border-white/15">
                                                        <div className="flex justify-between items-center text-[10px] text-slate-300 mb-1">
                                                            <span>Regular Entry Tier</span>
                                                            <span className="text-emerald-300 font-bold">TZS 35,000</span>
                                                        </div>
                                                        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                                            <div className="bg-gradient-to-r from-emerald-400 to-teal-500 h-full w-[94%]" />
                                                        </div>
                                                        <div className="text-[10px] text-emerald-300 mt-1 font-semibold flex justify-between">
                                                            <span>940 / 1,000 Sold</span>
                                                            <span>94% Capacity</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <Tag className="w-4 h-4 text-sky-400" />
                                                        <span>Active Promo: <strong>EARLYBIRD15</strong> (15% Off)</span>
                                                    </div>
                                                    <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold">244 Used</span>
                                                </div>
                                            </div>
                                        )}

                                        {activeCategory === 'sell_promote' && (
                                            <div>
                                                <div className="flex items-center justify-between pb-3 border-b border-white/15">
                                                    <div>
                                                        <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider">Public Marketplace Listing</span>
                                                        <h5 className="text-sm sm:text-base font-black">Dar es Salaam AfroBeats Festival</h5>
                                                    </div>
                                                    <span className="px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 text-[10px] font-bold border border-sky-400/30">Live on /tickets</span>
                                                </div>

                                                <div className="mt-4 p-3 rounded-xl bg-white/10 border border-white/15 flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-amber-500 to-rose-500 flex items-center justify-center font-black text-lg">
                                                        AFRO
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-xs font-bold text-white truncate">1-Tap Checkout Active</div>
                                                        <div className="text-[10px] text-slate-300">M-Pesa • Tigo Pesa • Airtel Money • Halopesa • Card</div>
                                                    </div>
                                                    <span className="text-xs font-black text-emerald-400">99.4% Success</span>
                                                </div>

                                                <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                                                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                                                        <div className="text-[10px] text-slate-400">Direct Views</div>
                                                        <div className="text-sm font-black text-white">18,420</div>
                                                    </div>
                                                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                                                        <div className="text-[10px] text-slate-400">Checkout Conv.</div>
                                                        <div className="text-sm font-black text-emerald-400">14.8%</div>
                                                    </div>
                                                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                                                        <div className="text-[10px] text-slate-400">Dispatched WhatsApp</div>
                                                        <div className="text-sm font-black text-sky-400">2,610</div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {activeCategory === 'security_support' && (
                                            <div>
                                                <div className="flex items-center justify-between pb-3 border-b border-white/15">
                                                    <div>
                                                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Cryptographic Security Feed</span>
                                                        <h5 className="text-sm sm:text-base font-black">Gate Entrance Audit Stream</h5>
                                                    </div>
                                                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">All Gates Shielded</span>
                                                </div>

                                                <div className="mt-3 space-y-2 text-[11px]">
                                                    <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                                            <span>Pass #KDV-8821 (Amina Juma) — VIP</span>
                                                        </div>
                                                        <span className="text-emerald-300 font-mono text-[10px]">VERIFIED (Gate 1)</span>
                                                    </div>
                                                    <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                                            <span>Pass #KDV-8822 (David M.) — Regular</span>
                                                        </div>
                                                        <span className="text-emerald-300 font-mono text-[10px]">VERIFIED (Gate 2)</span>
                                                    </div>
                                                    <div className="p-2.5 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center justify-between text-red-200">
                                                        <div className="flex items-center gap-2">
                                                            <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
                                                            <span>Duplicate Attempt #KDV-8821</span>
                                                        </div>
                                                        <span className="text-red-400 font-bold text-[10px]">BLOCKED (Already Used)</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {activeCategory === 'operational_efficiency' && (
                                            <div>
                                                <div className="flex items-center justify-between pb-3 border-b border-white/15">
                                                    <div>
                                                        <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Gate Ops & Settlement</span>
                                                        <h5 className="text-sm sm:text-base font-black">Live Entrance Velocity</h5>
                                                    </div>
                                                    <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-400/30">Offline Sync Active</span>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3 mt-4">
                                                    <div className="p-3 rounded-xl bg-white/10 border border-white/15">
                                                        <div className="text-[10px] text-slate-300">Scan Velocity</div>
                                                        <div className="text-lg font-black text-white mt-1">48 scans/min</div>
                                                        <div className="text-[10px] text-emerald-300 mt-1">Average 0.18s per pass</div>
                                                    </div>
                                                    <div className="p-3 rounded-xl bg-white/10 border border-white/15">
                                                        <div className="text-[10px] text-slate-300">Net Revenue Balance</div>
                                                        <div className="text-lg font-black text-emerald-400 mt-1">TZS 28,450,000</div>
                                                        <div className="text-[10px] text-sky-300 mt-1">Direct Bank Wire Ready</div>
                                                    </div>
                                                </div>

                                                <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <Printer className="w-4 h-4 text-sky-400" />
                                                        <span>Wristband & Sheet Pass Printer</span>
                                                    </div>
                                                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">120 Sheets Ready</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Frame Footer Bar */}
                                        <div className="pt-3 border-t border-white/15 flex items-center justify-between text-[11px] text-slate-400">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                                <span>Real-Time Engine Sync: 100% Up</span>
                                            </div>
                                            <span className="text-sky-300 font-semibold">Kardovo High-Availability</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* ══════════════════════════════════════════════
                                   SMALL SCREEN (SMARTPHONE) MOCKUP FRAME
                                   ══════════════════════════════════════════════ */
                                <div className="w-[280px] sm:w-[320px] bg-slate-900 rounded-[44px] p-3 shadow-2xl border-4 border-slate-700/80 shadow-[#154F7C]/25 transition-all duration-300">
                                    {/* Phone Speaker & Dynamic Island */}
                                    <div className="flex justify-center mb-2">
                                        <div className="w-24 h-4 bg-slate-950 rounded-full flex items-center justify-end px-2">
                                            <div className="w-2 h-2 rounded-full bg-slate-800" />
                                        </div>
                                    </div>

                                    {/* Mobile Screen Area */}
                                    <div className="bg-[#07111E] text-white rounded-[34px] p-4 min-h-[440px] flex flex-col justify-between border border-white/10 select-none overflow-hidden relative">
                                        
                                        {/* Mobile Status Bar */}
                                        <div className="flex justify-between items-center text-[10px] text-slate-400 px-1 mb-2">
                                            <span className="font-bold">9:41</span>
                                            <div className="flex items-center gap-1.5">
                                                <Wifi className="w-3 h-3 text-white" />
                                                <span className="w-4 h-2 bg-white rounded-xs inline-block" />
                                            </div>
                                        </div>

                                        {/* Mobile Content Based on Category */}
                                        {activeCategory === 'create_manage' && (
                                            <div className="space-y-3">
                                                <div className="text-center pb-2 border-b border-white/10">
                                                    <span className="text-[9px] uppercase tracking-wider text-sky-400 font-bold">Organizer Pocket Studio</span>
                                                    <h5 className="text-xs font-black truncate">Summer Beach Bash 2026</h5>
                                                </div>

                                                <div className="p-3 rounded-2xl bg-white/10 border border-white/15 text-left">
                                                    <div className="flex justify-between text-[11px] mb-1">
                                                        <span className="font-bold">VIP Golden Pass</span>
                                                        <span className="text-emerald-400 font-bold">TZS 80,000</span>
                                                    </div>
                                                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden my-1">
                                                        <div className="bg-sky-400 h-full w-[78%]" />
                                                    </div>
                                                    <div className="text-[10px] text-slate-300 flex justify-between">
                                                        <span>156 / 200 Sold</span>
                                                        <span className="text-sky-300 font-bold">78%</span>
                                                    </div>
                                                </div>

                                                <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-[10px] flex items-center justify-between text-emerald-200">
                                                    <span>Instant WhatsApp Alerts:</span>
                                                    <span className="font-bold text-white">ON</span>
                                                </div>
                                            </div>
                                        )}

                                        {activeCategory === 'sell_promote' && (
                                            <div className="space-y-3">
                                                {/* Mobile Ticket Pass Preview */}
                                                <div className="bg-gradient-to-b from-[#154F7C] to-[#0A2540] rounded-2xl p-3 border border-sky-400/30 text-center relative overflow-hidden">
                                                    <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-sky-200 font-bold">VIP PASS</span>
                                                    <h5 className="text-xs font-black text-white mt-1">Kardovo Gala 2026</h5>
                                                    <div className="bg-white p-2.5 rounded-xl inline-block my-2 shadow-md">
                                                        <QrCode className="w-20 h-20 text-slate-900" />
                                                    </div>
                                                    <div className="text-[10px] font-mono text-slate-300 tracking-wider">#KDV-2026-004821</div>
                                                    <div className="text-[9px] text-emerald-300 font-semibold mt-1">✓ Valid for 2 Entries</div>
                                                </div>

                                                <div className="p-2 rounded-xl bg-white/10 text-center text-[10px] text-sky-200">
                                                    Delivered via WhatsApp & SMS instantly
                                                </div>
                                            </div>
                                        )}

                                        {activeCategory === 'security_support' && (
                                            <div className="space-y-3 text-center">
                                                <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300">
                                                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-1 animate-bounce" />
                                                    <h5 className="text-xs font-black uppercase tracking-wider">ENTRY VERIFIED</h5>
                                                    <div className="text-[10px] text-white font-bold mt-0.5">VIP Table • Sarah Mwangi</div>
                                                    <div className="text-[9px] text-emerald-300 mt-1">1 / 1 Entries Checked In</div>
                                                </div>

                                                <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-[10px] text-slate-300 text-left">
                                                    <div>⚡ Verification Time: <strong className="text-white">0.14s</strong></div>
                                                    <div>🛡️ Token Auth: <strong className="text-emerald-400">100% Cryptographic</strong></div>
                                                </div>
                                            </div>
                                        )}

                                        {activeCategory === 'operational_efficiency' && (
                                            <div className="space-y-3">
                                                <div className="p-3 rounded-2xl bg-white/10 border border-white/15 text-left">
                                                    <div className="text-[9px] uppercase tracking-wider text-amber-300 font-bold">Door Cashier Mode</div>
                                                    <div className="text-xs font-black text-white mt-1">Walk-In Ticket Issuance</div>
                                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                                        <div className="p-2 rounded-lg bg-sky-600/30 border border-sky-400/30 text-center text-[10px] font-bold">
                                                            Cash Payment
                                                        </div>
                                                        <div className="p-2 rounded-lg bg-emerald-600/30 border border-emerald-400/30 text-center text-[10px] font-bold">
                                                            M-Pesa / Tigo
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-2 rounded-xl bg-sky-500/15 border border-sky-400/30 text-[10px] text-center text-sky-200">
                                                    1-Tap Pass & Wristband Generation
                                                </div>
                                            </div>
                                        )}

                                        {/* Phone Bottom Home Bar */}
                                        <div className="flex justify-center pt-2">
                                            <div className="w-24 h-1 bg-white/40 rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════
                3. FREQUENTLY ASKED QUESTIONS (FAQ) SECTION
               ══════════════════════════════════════════════════════════════ */}
            <div className="max-w-4xl mx-auto px-4 mb-16 sm:mb-20">
                <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200/80 text-slate-700 text-xs font-bold mb-3">
                        <HelpCircle className="w-3.5 h-3.5 text-[#154F7C]" />
                        <span>FAQ</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-display tracking-tight">
                        {lang === 'sw' ? 'Maswali Yanayoulizwa Mara kwa Mara' : 'Frequently Asked Questions'}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-2">
                        {lang === 'sw' 
                            ? 'Majibu ya haraka kwa maswali muhimu kutoka kwa waandaaji wa matukio.' 
                            : 'Everything you need to know about setting up, selling, and scanning tickets with Kardovo.'}
                    </p>
                </div>

                <div className="space-y-3">
                    {faqs.map((faq, idx) => {
                        const isOpen = openFaqIndex === idx;
                        return (
                            <div 
                                key={idx}
                                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                                    isOpen 
                                        ? 'bg-white border-sky-300 shadow-md shadow-sky-900/5' 
                                        : 'bg-white/80 hover:bg-white border-slate-200/80'
                                }`}
                            >
                                <button
                                    type="button"
                                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                                    className="w-full px-5 sm:px-6 py-4 sm:py-4.5 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                                >
                                    <span className="text-xs sm:text-sm md:text-base font-bold text-slate-900 font-display">
                                        {faq.q}
                                    </span>
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                                        isOpen ? 'bg-[#154F7C] text-white rotate-180' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                        <ChevronDown className="w-4 h-4 stroke-[2.2]" />
                                    </div>
                                </button>
                                {isOpen && (
                                    <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════
                4. "HAVE MORE QUESTIONS? REACH OUT TO US" BANNER (Contact Us)
               ══════════════════════════════════════════════════════════════ */}
            <div className="max-w-4xl mx-auto px-4 mb-16 sm:mb-20">
                <div className="relative overflow-hidden rounded-3xl sm:rounded-4xl bg-gradient-to-r from-[#154F7C] via-[#1B5D91] to-[#0A2B47] text-white p-7 sm:p-10 lg:p-12 shadow-2xl shadow-[#154F7C]/25 border border-sky-400/25">
                    {/* Background Decorative Circles */}
                    <div className="absolute top-0 right-0 w-72 h-72 bg-sky-400/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
                    <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

                    <div className="relative z-10 text-center max-w-xl mx-auto">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-sky-300 flex items-center justify-center mx-auto mb-4 shadow-inner">
                            <MessageCircle className="w-6 h-6 stroke-[2.2]" />
                        </div>

                        <h3 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white">
                            {lang === 'sw' ? 'Una maswali zaidi?' : 'Have more questions?'}
                        </h3>
                        <p className="text-xs sm:text-sm md:text-base text-sky-100 mt-2 font-medium leading-relaxed">
                            {lang === 'sw' 
                                ? 'Wasiliana nasi wakati wowote — tunafurahi sana kukusaidia kufanikisha tukio lako!'
                                : 'Reach out to us - we are happy to help!'}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6 sm:mt-8">
                            <button
                                type="button"
                                onClick={onContactClick}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 rounded-2xl bg-white text-[#154F7C] hover:bg-sky-50 text-xs sm:text-sm font-black transition-all shadow-lg shadow-black/10 hover:scale-105 active:scale-95 cursor-pointer"
                            >
                                <Phone className="w-4 h-4 text-[#154F7C]" />
                                <span>{lang === 'sw' ? 'Wasiliana Nasi' : 'Contact Us'}</span>
                            </button>

                            {onSignUpClick && (
                                <button
                                    type="button"
                                    onClick={onSignUpClick}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/30 text-xs sm:text-sm font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer"
                                >
                                    <span>{lang === 'sw' ? 'Anza Bila Gharama' : 'Get Started Free'}</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
