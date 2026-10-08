import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import KardovoLogo from '@/Components/KardovoLogo';
import {
    Search,
    Ticket,
    Calendar,
    MapPin,
    ArrowRight,
    Building2,
    PartyPopper,
    Trophy,
    X,
    Home as HomeIcon,
    Layers,
    ShieldCheck,
    Globe,
    Sparkles,
    Briefcase,
    Crown,
    Gem,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Flame,
} from 'lucide-react';
import { useTicketingLanguage } from '@/Utils/ticketingTranslations';

export default function TicketMarketplace({
    occasions = [],
    featuredOccasions = [],
    categoryCounts = {},
    currentCategory = 'all',
    search = '',
}) {
    const { auth } = usePage().props;
    const user = auth?.user;

    // Multi-language system
    const { lang, toggleLang, t } = useTicketingLanguage();

    const [searchTerm, setSearchTerm] = useState(search || '');
    const [selectedCategory, setSelectedCategory] = useState(currentCategory || 'all');
    const [priceFilter, setPriceFilter] = useState('all'); // 'all' | 'free' | 'paid' | 'low_high' | 'high_low'
    const [dateFilter, setDateFilter] = useState('all'); // 'all' | 'this_week' | 'this_month' | 'upcoming'
    const [openFilterDropdown, setOpenFilterDropdown] = useState(null); // 'category' | 'price' | 'date' | null

    // ── STICKY NAVBAR SCROLL BLUR STATE ──
    const [isScrolled, setIsScrolled] = useState(false);

    // ── PRECISE SCROLLING TO OCCASIONS SECTION MATCHING ATTACHMENT VIEW ──
    const scrollToOccasions = (e) => {
        if (e) e.preventDefault();
        const el = document.getElementById('occasions-section');
        if (!el) return;

        const navHeight = 56; // h-14 navbar height
        const rect = el.getBoundingClientRect();
        const targetScroll = window.scrollY + rect.top - navHeight;

        window.scrollTo({
            top: Math.max(0, Math.round(targetScroll)),
            behavior: 'smooth'
        });
    };

    useEffect(() => {
        // Ensure page strictly starts at top on fresh load/reload so the lower section never peeks
        if (typeof window !== 'undefined') {
            if ('scrollRestoration' in window.history) {
                window.history.scrollRestoration = 'manual';
            }
            if (!window.location.hash) {
                window.scrollTo(0, 0);
            }
        }

        const handleScroll = () => {
            const occasionsEl = document.getElementById('occasions-section');
            if (occasionsEl) {
                const navHeight = 56; // h-14 navbar
                const rect = occasionsEl.getBoundingClientRect();
                setIsScrolled(rect.top <= navHeight);
            } else {
                setIsScrolled(window.scrollY > 200);
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearchSubmit = (e) => {
        if (e) e.preventDefault();
        router.get(route('tickets.marketplace'), {
            category: selectedCategory !== 'all' ? selectedCategory : undefined,
            search: searchTerm || undefined,
        }, { 
            preserveState: true, 
            replace: true,
            onFinish: () => {
                setTimeout(() => scrollToOccasions(), 50);
            }
        });
    };

    const handleCategoryClick = (catKey) => {
        setSelectedCategory(catKey);
        router.get(route('tickets.marketplace'), {
            category: catKey !== 'all' ? catKey : undefined,
            search: searchTerm || undefined,
        }, { 
            preserveState: true, 
            preserveScroll: true,
            replace: true,
        });
    };

    const clearSearch = () => {
        setSearchTerm('');
        router.get(route('tickets.marketplace'), {
            category: selectedCategory !== 'all' ? selectedCategory : undefined,
        }, { 
            preserveState: true, 
            replace: true,
        });
    };

    // Category navigation tabs with translations
    const categories = [
        { key: 'all', labelKey: 'All', icon: Layers },
        { key: 'events', labelKey: 'Events', icon: Ticket },
        { key: 'hotels', labelKey: 'Hotels', icon: Building2 },
        { key: 'nightlife', labelKey: 'Night Life', icon: PartyPopper },
        { key: 'sports', labelKey: 'Sports', icon: Trophy },
        { key: 'fashion', labelKey: 'Fashion', icon: Crown },
        { key: 'corporate', labelKey: 'Corporate Events', icon: Briefcase },
    ];

    // Relevant background image for each category on the banner
    const categoryBanners = {
        all: '/images/kilimanjaro_landscape.jpg',
        events: '/images/categories/events.jpg',
        hotels: '/images/categories/hotels.jpg',
        nightlife: '/images/categories/nightlife.jpg',
        sports: '/images/categories/sports.jpg',
        fashion: '/images/categories/fashion.jpg',
        corporate: '/images/categories/corporate.jpg',
    };

    const categoryBgPositions = {
        all: 'center 40%',
        events: 'center 35%',
        hotels: 'center 50%',
        nightlife: 'center 40%',
        sports: 'center 30%',
        fashion: 'center 28%',
        corporate: 'center 40%',
    };

    const categoryHeadingKeys = {
        all: 'All Tickets',
        events: 'Concerts & Events',
        hotels: 'Hotels & Stays',
        nightlife: 'Nightlife & Parties',
        sports: 'Sports & Matches',
        fashion: 'Fashion & Galas',
        corporate: 'Corporate Events',
    };

    const categoryBannerTitles = {
        all: {
            en: { prefix: 'Experience the ', highlight: 'hottest events', suffix: ' across Tanzania.' },
            sw: { prefix: 'Pata uzoefu wa ', highlight: 'matukio maarufu zaidi', suffix: ' Tanzania.' },
        },
        events: {
            en: { prefix: 'Discover electrifying ', highlight: 'live concerts & festivals', suffix: ' across Tanzania.' },
            sw: { prefix: 'Gundua matamasha ya ', highlight: 'muziki na sherehe kali', suffix: ' kote Tanzania.' },
        },
        hotels: {
            en: { prefix: 'Escape to luxury ', highlight: 'beach resorts & safari lodges', suffix: ' in Tanzania.' },
            sw: { prefix: 'Pumzika kwenye ', highlight: 'hoteli na malazi ya kifahari', suffix: ' kote Tanzania.' },
        },
        nightlife: {
            en: { prefix: 'Feel the electric pulse of ', highlight: 'vibrant nightlife & parties', suffix: ' across Tanzania.' },
            sw: { prefix: 'Furahia maisha ya usiku na ', highlight: 'burudani ya vilabu', suffix: ' kote Tanzania.' },
        },
        sports: {
            en: { prefix: 'Witness the thrill of ', highlight: 'marathons & championship sports', suffix: ' across Tanzania.' },
            sw: { prefix: 'Shuhudia msisimko wa ', highlight: 'marathon na mechi mikuu', suffix: ' kote Tanzania.' },
        },
        fashion: {
            en: { prefix: 'Step into glamour with ', highlight: 'runway shows & fashion galas', suffix: ' across Tanzania.' },
            sw: { prefix: 'Shuhudia uzuri wa ', highlight: 'maonyesho ya mitindo na gala', suffix: ' kote Tanzania.' },
        },
        corporate: {
            en: { prefix: 'Elevate your network with ', highlight: 'executive summits & corporate events', suffix: ' in Tanzania.' },
            sw: { prefix: 'Panua mtandao wako na ', highlight: 'mikutano na matukio ya kibiashara', suffix: ' kote Tanzania.' },
        },
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#07111E] text-slate-800 dark:text-slate-100 flex flex-col font-sans selection:bg-[#16A34A] selection:text-white relative">
            <Head title={`${t('hero_title')} — Kardovo Tickets`}>
                <meta name="description" content="Discover and book tickets for concerts, nightlife, hotels, and marathons across Tanzania. Instant digital passes and multi-channel delivery powered by Kardovo." />
            </Head>

            {/* ══════════════════════════════════════════════════════════════
                1. TOP NAVBAR (Original Tickets Navbar: Brand, Home, Categories & Auth)
               ══════════════════════════════════════════════════════════════ */}
            <header 
                className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
                    isScrolled 
                        ? "bg-[#0B2545]/95 backdrop-blur-md border-b border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.25)]" 
                        : "bg-white/[0.1] backdrop-blur-xl border-b border-white/25 shadow-lg"
                }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4 text-white">
                    {/* Brand Logo & Home Navigation */}
                    <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                        <Link href="/" className="cursor-pointer focus:outline-none flex items-center shrink-0">
                            <KardovoLogo light={true} showText={true} textClassName="text-white text-base font-black tracking-widest" imgClassName="h-7 w-7" />
                        </Link>

                        <Link
                            href="/"
                            className="px-3 py-1.5 rounded-xl text-xs font-bold text-white hover:bg-white/15 transition flex items-center gap-1.5 shrink-0"
                        >
                            <HomeIcon className="w-3.5 h-3.5 text-sky-300" />
                            <span>{t('Home')}</span>
                        </Link>
                    </div>

                    {/* Right-Side Controls: Support / Language Toggle / Auth */}
                    <div className="flex items-center gap-2 sm:gap-3 text-xs font-semibold shrink-0 text-white">
                        <a href="mailto:support@kardovo.com" className="text-white hover:text-white/80 hover:bg-white/15 px-3 py-1.5 rounded-xl transition hidden md:inline">
                            {t('Support')}
                        </a>

                        {/* Language Toggle: Icon and text only, no shape */}
                        <button 
                            type="button"
                            onClick={toggleLang} 
                            className="flex items-center gap-1.5 px-2 py-1.5 text-white/90 hover:text-white transition-colors text-xs font-semibold cursor-pointer"
                            title={lang === 'en' ? 'Badili lugha kuwa Kiswahili' : 'Switch language to English'}
                        >
                            <Globe className="w-4 h-4 text-sky-300" />
                            <span>{lang === 'en' ? 'SWA' : 'ENG'}</span>
                        </button>

                        {user ? (
                            <Link
                                href={route('dashboard')}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] active:bg-[#117534] text-white text-xs font-bold transition shadow-xs"
                            >
                                <span>{t('Dashboard')}</span>
                            </Link>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link
                                    href={route('login')}
                                    className="px-3.5 py-1.5 rounded-xl font-bold transition text-xs cursor-pointer bg-white/[0.1] hover:bg-white/[0.18] text-white backdrop-blur-md border border-white/25"
                                >
                                    {t('Sign in')}
                                </Link>

                                <Link
                                    href={route('register')}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] active:bg-[#117534] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                                >
                                    <span>{t('Sign up')}</span>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* ══════════════════════════════════════════════════════════════
                2. UNIFIED SEAMLESS SHOWCASE (Headline on Top + Carousel Below)
               ══════════════════════════════════════════════════════════════ */}
            <section className="relative text-white overflow-hidden h-[100dvh] pt-14 pb-4 select-none flex flex-col justify-center gap-4 sm:gap-6">
                {/* Permanent Grand Landscape Background (Fixed & Completely Independent from category tabs) */}
                <div 
                    className="absolute inset-0 bg-cover z-0"
                    style={{
                        backgroundImage: `url('${categoryBanners.all}')`,
                        backgroundPosition: categoryBgPositions.all || 'center 40%',
                    }}
                />
                
                {/* Subtle Cinematic Vignette & Deep Glass Gradient connecting the entire top atmosphere */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#07111E]/80 via-[#07111E]/45 to-[#07111E]/95 pointer-events-none" />
                <div className="absolute inset-0 bg-[#0B2545]/20 pointer-events-none" />

                {/* 2.1 Bold & Larger Atmospheric Headline (Permanent, Independent from category tabs) */}
                <div className="max-w-5xl mx-auto w-full text-center relative z-10 px-4 sm:px-6 lg:px-8 shrink-0">
                    {(() => {
                        const titleData = categoryBannerTitles.all[lang === 'sw' ? 'sw' : 'en'];
                        return (
                            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black font-display tracking-tight text-white max-w-4xl mx-auto leading-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)] transition-all duration-300">
                                {titleData.prefix}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300">
                                    {titleData.highlight}
                                </span>
                                {titleData.suffix}
                            </h1>
                        );
                    })()}
                </div>

                {/* 2.2 Continuous Carousel Section (Positioned Below Headline) */}
                {(() => {
                    const carouselSource = (featuredOccasions && featuredOccasions.length > 0)
                        ? featuredOccasions
                        : (occasions && occasions.length > 0 ? occasions.slice(0, 5) : []);

                    const carouselItems = carouselSource.length > 0 ? carouselSource.slice(0, 5) : [
                        {
                            id: 1,
                            title: "The Noisy Book Club - October Meeting",
                            subtitle: "(Mainland Chapter)",
                            event_date: "Sat, Oct 24th, 2PM",
                            badge: "HIGHLIGHTED EVENT",
                            cover_photo: "/images/categories/fashion.jpg",
                        },
                        {
                            id: 2,
                            title: "Lagos Trivia Night",
                            subtitle: "Naija Edition",
                            event_date: "Sun, Oct 25th, 5PM",
                            badge: "HIGHLIGHTED EVENT",
                            cover_photo: "/images/categories/nightlife.jpg",
                        },
                        {
                            id: 3,
                            title: "Phlenjo DIRTY, SEXY RAVE",
                            subtitle: "Halloween Special",
                            event_date: "Fri, Oct 30th, 9PM",
                            badge: "HIGHLIGHTED EVENT",
                            cover_photo: "/images/categories/events.jpg",
                        },
                        {
                            id: 4,
                            title: "The Noisy Book Club - October Meeting",
                            subtitle: "(Island Chapter)",
                            event_date: "Sat, Oct 31st, 2PM",
                            badge: "HIGHLIGHTED EVENT",
                            cover_photo: "/images/corporate.jpg",
                        },
                        {
                            id: 5,
                            title: "Anendlessocean In Dar (LIAM Tour)",
                            subtitle: "Live in Concert",
                            event_date: "Sat, Nov 21st, 5PM",
                            badge: "HIGHLIGHTED EVENT",
                            cover_photo: "/images/categories/sports.jpg",
                        }
                    ];

                    return (
                        <div className="w-full relative z-10 overflow-hidden group/marquee">
                            <style>{`
                                @keyframes marqueeContinuous {
                                    from { transform: translateX(0); }
                                    to { transform: translateX(-100%); }
                                }
                                .marquee-track-seamless {
                                    display: flex;
                                    flex-shrink: 0;
                                    align-items: center;
                                    gap: 1.25rem;
                                    padding-right: 1.25rem;
                                    animation: marqueeContinuous 38s linear infinite;
                                    will-change: transform;
                                }
                                .group\\/marquee:hover .marquee-track-seamless {
                                    animation-play-state: paused;
                                }
                            `}</style>

                            {/* Dual Identical Track Continuous Marquee (100% Glitch-free mathematical loop) */}
                            <div className="flex w-max overflow-hidden select-none">
                                {[0, 1].map((copyIdx) => (
                                    <div
                                        key={`marquee-track-${copyIdx}`}
                                        className="marquee-track-seamless"
                                        aria-hidden={copyIdx === 1 ? 'true' : undefined}
                                    >
                                        {carouselItems.map((item, idx) => {
                                            const fallbackCover = '/images/categories/events.jpg';
                                            const cover = item.cover_photo || fallbackCover;
                                            const itemUrl = item.id ? route('events.publicTickets', item.id) : '#';

                                            return (
                                                <Link
                                                    key={`${copyIdx}-${item.id || 'item'}-${idx}`}
                                                    href={itemUrl}
                                                    tabIndex={copyIdx === 1 ? -1 : 0}
                                                    className="shrink-0 w-[185px] sm:w-[210px] md:w-[230px] aspect-[9/16] max-h-[48vh] rounded-2xl sm:rounded-3xl overflow-hidden relative group block shadow-[0_16px_40px_rgba(0,0,0,0.65)] border border-white/20 hover:border-emerald-400/60 transition-all duration-300 hover:-translate-y-1.5 focus:outline-none backdrop-blur-xs"
                                                >
                                                    {/* Full-bleed Vertical Poster Image */}
                                                    <img
                                                        src={cover}
                                                        alt={item.title}
                                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                                        loading="lazy"
                                                    />

                                                    {/* Film Grain & Dramatic Vignette Gradient */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent group-hover:via-black/40 transition-colors duration-300" />

                                                    {/* Bottom Card Content: Full Readable Title & Date */}
                                                    <div className="absolute bottom-0 left-0 right-0 p-3.5 sm:p-4 z-10 flex flex-col justify-end text-center">
                                                        <h3 className="text-xs sm:text-sm md:text-base font-black text-white font-display tracking-tight leading-snug drop-shadow-md mb-1">
                                                            {item.title}
                                                        </h3>
                                                        <p className="text-[10px] sm:text-[11px] font-semibold text-slate-300/90 font-mono drop-shadow-sm">
                                                            {item.event_date || (lang === 'sw' ? 'Tarehe itatangazwa' : 'Date TBA')}
                                                        </p>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })()}

                {/* Bottom Center Scroll Down Indicator */}
                <div className="absolute bottom-5 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
                    <button
                        type="button"
                        onClick={scrollToOccasions}
                        aria-label="Scroll down to events"
                        className="group flex flex-col items-center gap-1 text-white/70 hover:text-white transition-all cursor-pointer focus:outline-none"
                    >
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 hover:border-emerald-400/60 shadow-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 active:scale-95 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                            <ChevronDown className="w-5 h-5 text-white stroke-[2.25]" />
                        </div>
                    </button>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                3. MAIN OCCASIONS SECTION (Structured exactly as in attachment)
               ══════════════════════════════════════════════════════════════ */}
            <main id="occasions-section" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-14 sm:pb-20 scroll-mt-14">
                {/* 1. TOP FILTER BAR: [All Events ▾] [Price ▾] [Date ▾] (Matching Attachment Header) */}
                <div className="flex items-center gap-3 mb-6 sm:mb-8 relative z-30">
                    {/* Category Dropdown Pill: [All Events ▾] */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setOpenFilterDropdown(openFilterDropdown === 'category' ? null : 'category')}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-black text-white text-xs sm:text-sm font-bold shadow-xs hover:bg-slate-900 transition-all cursor-pointer"
                        >
                            <span>
                                {selectedCategory === 'all' 
                                    ? t('All Events') 
                                    : t(categories.find(c => c.key === selectedCategory)?.labelKey || 'All Events')}
                            </span>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openFilterDropdown === 'category' ? 'rotate-180' : ''}`} />
                        </button>

                        {openFilterDropdown === 'category' && (
                            <div className="absolute left-0 top-full mt-2 w-52 bg-white dark:bg-[#0B1524] rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-xl py-1.5 z-40">
                                {categories.map((cat) => (
                                    <button
                                        key={cat.key}
                                        type="button"
                                        onClick={() => {
                                            handleCategoryClick(cat.key);
                                            setOpenFilterDropdown(null);
                                        }}
                                        className={`w-full text-left px-4 py-2 text-xs font-semibold flex items-center justify-between hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer ${
                                            selectedCategory === cat.key ? 'text-[#16A34A] font-bold bg-emerald-50/50 dark:bg-emerald-950/20' : 'text-slate-700 dark:text-slate-200'
                                        }`}
                                    >
                                        <span>{t(cat.labelKey)}</span>
                                        {selectedCategory === cat.key && <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Price Filter Pill: [Price ▾] */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setOpenFilterDropdown(openFilterDropdown === 'price' ? null : 'price')}
                            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all border cursor-pointer ${
                                priceFilter !== 'all'
                                    ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900'
                                    : 'bg-white dark:bg-[#0B1524] text-slate-700 dark:text-slate-200 border-slate-300 dark:border-white/15 hover:border-slate-400'
                            }`}
                        >
                            <span>
                                {priceFilter === 'all' 
                                    ? t('Price') 
                                    : priceFilter === 'free' 
                                        ? t('Free') 
                                        : priceFilter === 'paid' 
                                            ? t('Paid') 
                                            : priceFilter === 'low_high' 
                                                ? t('Lowest Price') 
                                                : t('Highest Price')}
                            </span>
                            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${openFilterDropdown === 'price' ? 'rotate-180' : ''}`} />
                        </button>

                        {openFilterDropdown === 'price' && (
                            <div className="absolute left-0 top-full mt-2 w-44 bg-white dark:bg-[#0B1524] rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-xl py-1.5 z-40">
                                {[
                                    { key: 'all', label: 'All Prices' },
                                    { key: 'free', label: 'Free' },
                                    { key: 'paid', label: 'Paid' },
                                    { key: 'low_high', label: 'Lowest Price' },
                                    { key: 'high_low', label: 'Highest Price' },
                                ].map((p) => (
                                    <button
                                        key={p.key}
                                        type="button"
                                        onClick={() => {
                                            setPriceFilter(p.key);
                                            setOpenFilterDropdown(null);
                                        }}
                                        className={`w-full text-left px-4 py-2 text-xs font-semibold flex items-center justify-between hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer ${
                                            priceFilter === p.key ? 'text-[#16A34A] font-bold bg-emerald-50/50 dark:bg-emerald-950/20' : 'text-slate-700 dark:text-slate-200'
                                        }`}
                                    >
                                        <span>{t(p.label)}</span>
                                        {priceFilter === p.key && <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Date Filter Pill: [Date ▾] */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setOpenFilterDropdown(openFilterDropdown === 'date' ? null : 'date')}
                            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all border cursor-pointer ${
                                dateFilter !== 'all'
                                    ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900'
                                    : 'bg-white dark:bg-[#0B1524] text-slate-700 dark:text-slate-200 border-slate-300 dark:border-white/15 hover:border-slate-400'
                            }`}
                        >
                            <span>
                                {dateFilter === 'all' 
                                    ? t('Date') 
                                    : dateFilter === 'this_week' 
                                        ? t('This Week') 
                                        : dateFilter === 'this_month' 
                                            ? t('This Month') 
                                            : t('Upcoming')}
                            </span>
                            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${openFilterDropdown === 'date' ? 'rotate-180' : ''}`} />
                        </button>

                        {openFilterDropdown === 'date' && (
                            <div className="absolute left-0 top-full mt-2 w-44 bg-white dark:bg-[#0B1524] rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-xl py-1.5 z-40">
                                {[
                                    { key: 'all', label: 'All Dates' },
                                    { key: 'this_week', label: 'This Week' },
                                    { key: 'this_month', label: 'This Month' },
                                    { key: 'upcoming', label: 'Upcoming' },
                                ].map((d) => (
                                    <button
                                        key={d.key}
                                        type="button"
                                        onClick={() => {
                                            setDateFilter(d.key);
                                            setOpenFilterDropdown(null);
                                        }}
                                        className={`w-full text-left px-4 py-2 text-xs font-semibold flex items-center justify-between hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer ${
                                            dateFilter === d.key ? 'text-[#16A34A] font-bold bg-emerald-50/50 dark:bg-emerald-950/20' : 'text-slate-700 dark:text-slate-200'
                                        }`}
                                    >
                                        <span>{t(d.label)}</span>
                                        {dateFilter === d.key && <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {searchTerm && (
                        <button
                            type="button"
                            onClick={clearSearch}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400 text-xs font-bold transition cursor-pointer shrink-0 ml-auto"
                        >
                            <X className="w-3.5 h-3.5" />
                            <span>{t('Clear')}</span>
                        </button>
                    )}
                </div>

                {/* 2. SECTION TITLE: "Popular Events" + "See all" (Matching Attachment) */}
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight">
                        {t('Popular Events')}
                    </h2>
                    <button
                        type="button"
                        onClick={() => {
                            setSelectedCategory('all');
                            setPriceFilter('all');
                            setDateFilter('all');
                            setSearchTerm('');
                            handleCategoryClick('all');
                        }}
                        className="text-xs sm:text-sm font-bold text-[#16A34A] hover:text-[#15803D] dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors cursor-pointer"
                    >
                        {t('See all')}
                    </button>
                </div>

                {/* Empty State */}
                {occasions.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl bg-white dark:bg-[#0B1524] border border-slate-200 dark:border-white/10 shadow-xs max-w-md mx-auto my-6 space-y-3">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-[#16A34A] flex items-center justify-center mx-auto border border-emerald-500/20">
                            <Ticket className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                                {t('no_occasions_title')}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {searchTerm
                                    ? t('no_occasions_desc_search')
                                    : t('no_occasions_desc_empty')}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setSearchTerm('');
                                handleCategoryClick('all');
                            }}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                        >
                            <span>{t('View All Occasions')}</span>
                        </button>
                    </div>
                ) : (
                    /* 3. CARDS GRID: 2 Columns, horizontal card with left info & right portrait poster (Exact Attachment Structure) */
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
                        {occasions
                            .filter((occasion) => {
                                if (priceFilter === 'free') return occasion.min_price === 0;
                                if (priceFilter === 'paid') return occasion.min_price > 0;
                                return true;
                            })
                            .sort((a, b) => {
                                if (priceFilter === 'low_high') return a.min_price - b.min_price;
                                if (priceFilter === 'high_low') return b.min_price - a.min_price;
                                return 0;
                            })
                            .map((occasion) => {
                                const currency = occasion.ticket_currency || 'TZS';
                                const fallbackCover = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80';
                                const cover = occasion.cover_photo || fallbackCover;
                                const itemUrl = route('events.publicTickets', occasion.id);

                                return (
                                    <Link
                                        key={occasion.id}
                                        href={itemUrl}
                                        className="group bg-white dark:bg-[#0B1524] rounded-2xl border border-slate-200/80 dark:border-white/10 p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-slate-300 dark:hover:border-white/20 transition-all duration-200 flex items-stretch justify-between gap-4 sm:gap-6 cursor-pointer"
                                    >
                                        {/* Left Side: Title, Date, Venue, Starting Price with exact spacing */}
                                        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                            {/* Top group: Title + Date + Location */}
                                            <div className="space-y-3">
                                                {/* Event Title */}
                                                <h3 className="text-base sm:text-[17px] font-bold text-slate-900 dark:text-white font-sans tracking-tight leading-snug line-clamp-2">
                                                    {occasion.title}
                                                </h3>

                                                {/* Date & Location Group */}
                                                <div className="space-y-2 text-[13px] sm:text-sm text-slate-500 dark:text-slate-400 font-normal">
                                                    {/* Date with Calendar Icon */}
                                                    {occasion.event_date && (
                                                        <div className="flex items-center gap-2.5">
                                                            <Calendar className="w-4 h-4 shrink-0 text-slate-400 stroke-[1.75]" />
                                                            <span className="truncate">{occasion.event_date}{occasion.event_time ? `, ${occasion.event_time}` : ''}</span>
                                                        </div>
                                                    )}

                                                    {/* Venue / Location with MapPin Icon */}
                                                    {occasion.venue && (
                                                        <div className="flex items-center gap-2.5">
                                                            <MapPin className="w-4 h-4 shrink-0 text-slate-400 stroke-[1.75]" />
                                                            <span className="truncate">{occasion.venue}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Bottom: Price anchored at bottom-left */}
                                            <div className="pt-4 mt-auto">
                                                <div className="text-sm sm:text-[15px] font-bold font-sans text-[#16A34A] dark:text-emerald-400">
                                                    {occasion.is_sold_out ? (
                                                        <span className="text-xs px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 uppercase font-bold">
                                                            {t('Sold Out')}
                                                        </span>
                                                    ) : occasion.min_price === 0 ? (
                                                        <span>{t('Free')}</span>
                                                    ) : (
                                                        `${currency} ${Number(occasion.min_price).toLocaleString()}`
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Side: Portrait Poster Thumbnail matching attachment */}
                                        <div className="w-24 sm:w-28 md:w-32 self-stretch rounded-xl sm:rounded-2xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800 border border-slate-100 dark:border-white/10 shadow-2xs relative">
                                            <img
                                                src={cover}
                                                alt={occasion.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                loading="lazy"
                                            />
                                        </div>
                                    </Link>
                                );
                            })}
                    </div>
                )}
            </main>

            {/* ══════════════════════════════════════════════════════════════
                4. KARDOVO OFFICIAL FOOTER
               ══════════════════════════════════════════════════════════════ */}
            <footer className="bg-white border-t border-slate-200 py-6 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4">
                    {/* Far Left: Logo */}
                    <div className="flex-1 flex justify-start opacity-90 hover:opacity-100 transition-opacity">
                        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="cursor-pointer focus:outline-none">
                            <KardovoLogo showText={true} light={false} />
                        </button>
                    </div>
                    
                    {/* Center: Copyright */}
                    <div className="flex-1 flex justify-center text-slate-500 font-medium text-xs md:text-sm text-center">
                        &copy; {new Date().getFullYear()} Kardovo. {t('All rights reserved.')}
                    </div>
                    
                    {/* Far Right: Links */}
                    <div className="flex-1 flex justify-end gap-6 font-medium text-sm text-slate-500">
                        <Link href="/terms" className="hover:text-slate-800 transition-colors">{t('Terms & Conditions')}</Link>
                        <Link href="/privacy" className="hover:text-slate-800 transition-colors">{t('Privacy Policy')}</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
