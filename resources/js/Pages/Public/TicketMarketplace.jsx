import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import KardovoLogo from '@/Components/KardovoLogo';
import {
    Search,
    Ticket,
    Calendar,
    MapPin,
    ArrowRight,
    Plane,
    Building2,
    PartyPopper,
    Trophy,
    X,
    Home as HomeIcon,
    Layers,
    ShieldCheck,
    Globe,
} from 'lucide-react';
import { useTicketingLanguage } from '@/Utils/ticketingTranslations';

export default function TicketMarketplace({
    occasions = [],
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

    // ── STICKY NAVBAR SCROLL BLUR STATE ──
    const [isScrolled, setIsScrolled] = useState(false);

    // ── VIEWPORT-AWARE PRECISE SCROLLING TO OCCASIONS SECTION ──
    const scrollToFirstRow = (behavior = 'smooth') => {
        const el = document.getElementById('occasions-section');
        if (!el) return;

        const grid = el.querySelector('.grid');
        const firstCard = grid ? grid.firstElementChild : null;
        const viewportHeight = window.innerHeight;

        if (firstCard) {
            const cardRect = firstCard.getBoundingClientRect();
            const cardBottom = cardRect.bottom + window.scrollY;
            // Position viewport so that the first row's bottom is comfortably visible (24px above bottom of window)
            const targetScroll = cardBottom - viewportHeight + 24;
            if (targetScroll > 0) {
                window.scrollTo({
                    top: Math.round(targetScroll),
                    behavior: behavior
                });
                return;
            }
        }

        // Fallback: scroll to occasions section header
        const navHeight = 56;
        const rect = el.getBoundingClientRect();
        const elementTop = rect.top + window.scrollY;
        window.scrollTo({
            top: Math.max(0, Math.round(elementTop - navHeight)),
            behavior: behavior
        });
    };

    const scrollToOccasions = (e) => {
        if (e) e.preventDefault();
        scrollToFirstRow('smooth');
    };

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 15);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        // When the page is loaded, ensure the below first row is seen in full and not cropped
        if (!window.location.hash) {
            const timer = setTimeout(() => {
                scrollToFirstRow('smooth');
            }, 120);
            return () => clearTimeout(timer);
        }

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
                setTimeout(() => scrollToFirstRow('smooth'), 50);
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

    const applyQuickSearch = (keyword) => {
        setSearchTerm(keyword);
        router.get(route('tickets.marketplace'), {
            category: selectedCategory !== 'all' ? selectedCategory : undefined,
            search: keyword,
        }, { 
            preserveState: true, 
            replace: true,
        });
    };

    // Category navigation tabs with translations
    const categories = [
        { key: 'all', labelKey: 'All', icon: Layers },
        { key: 'events', labelKey: 'Events', icon: Ticket },
        { key: 'flights', labelKey: 'Flights', icon: Plane },
        { key: 'hotels', labelKey: 'Hotels', icon: Building2 },
        { key: 'nightlife', labelKey: 'Night Life', icon: PartyPopper },
        { key: 'sports', labelKey: 'Sports', icon: Trophy },
    ];

    // Relevant background image for each category on the banner
    const categoryBanners = {
        all: '/images/kilimanjaro_landscape.jpg',
        events: '/images/categories/events.jpg',
        flights: '/images/categories/flights.jpg',
        hotels: '/images/categories/hotels.jpg',
        nightlife: '/images/categories/nightlife.jpg',
        sports: '/images/categories/sports.jpg',
    };

    const categoryBgPositions = {
        all: 'center 40%',
        events: 'center 35%',
        flights: 'center 45%',
        hotels: 'center 50%',
        nightlife: 'center 40%',
        sports: 'center 30%',
    };

    const categoryHeadingKeys = {
        all: 'All Occasions & Experiences',
        events: 'Live Events & Festivals',
        flights: 'Flight Routes & Travel Passes',
        hotels: 'Hotel Stays & Getaway Packages',
        nightlife: 'Nightlife, Parties & Ocean Cruises',
        sports: 'Marathons, Matches & Sports Passes',
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
        flights: {
            en: { prefix: 'Book scenic routes & ', highlight: 'premier domestic flights', suffix: ' across Tanzania.' },
            sw: { prefix: 'Kata tiketi za ndege za ', highlight: 'safari za ndani na utalii', suffix: ' kote Tanzania.' },
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
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#07111E] text-slate-800 dark:text-slate-100 flex flex-col font-sans selection:bg-[#16A34A] selection:text-white relative">
            <Head title={`${t('hero_title')} — Kardovo Tickets`}>
                <meta name="description" content="Discover and book tickets for concerts, nightlife, flights, hotels, and marathons across Tanzania. Instant digital passes and multi-channel delivery powered by Kardovo." />
            </Head>

            {/* ══════════════════════════════════════════════════════════════
                1. TOP NAVBAR (Original Tickets Navbar: Brand, Home, Categories & Auth)
               ══════════════════════════════════════════════════════════════ */}
            <header 
                className={`sticky top-0 z-50 text-white transition-all duration-300 ${
                    isScrolled 
                        ? "bg-[#0B2545]/95 backdrop-blur-md border-b border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.25)]" 
                        : "bg-[#0B2545] border-b border-[#173860]"
                }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
                    {/* Brand Logo & Home Navigation */}
                    <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                        <Link href="/" className="cursor-pointer focus:outline-none flex items-center shrink-0">
                            <KardovoLogo light={true} showText={true} textClassName="text-white text-base font-black tracking-widest" imgClassName="h-7 w-7" />
                        </Link>

                        <Link
                            href="/"
                            className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition flex items-center gap-1.5 shrink-0"
                        >
                            <HomeIcon className="w-3.5 h-3.5" />
                            <span>{t('Home')}</span>
                        </Link>
                    </div>

                    {/* Right-Side Controls: Support / Language Toggle / Auth */}
                    <div className="flex items-center gap-2 sm:gap-3 text-xs font-semibold text-slate-300 shrink-0">
                        <a href="mailto:support@kardovo.com" className="hover:text-white transition hidden md:inline">
                            {t('Support')}
                        </a>

                        {/* Language Toggle matching landing page */}
                        <button 
                            type="button"
                            onClick={toggleLang} 
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 hover:border-white/40 hover:bg-white/10 transition-colors text-xs font-bold text-slate-200 shadow-xs cursor-pointer mr-1"
                            title={lang === 'en' ? 'Badili lugha kuwa Kiswahili' : 'Switch language to English'}
                        >
                            <Globe className="w-3.5 h-3.5 text-[#008EE8]" />
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
                            <>
                                <Link
                                    href={route('login')}
                                    className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition text-xs"
                                >
                                    {t('Sign in')}
                                </Link>

                                <Link
                                    href={route('register')}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] active:bg-[#117534] text-white text-xs font-bold transition shadow-xs"
                                >
                                    <span>{t('Sign up')}</span>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* ══════════════════════════════════════════════════════════════
                2. HERO HEADER (Dynamic Category Landscape/Atmosphere, Creative Typography & Search)
               ══════════════════════════════════════════════════════════════ */}
            <section className="relative text-white border-b border-white/10 overflow-hidden py-12 sm:py-16 md:py-20">
                {/* Dynamic Category Background Images with Smooth Crossfade */}
                {Object.entries(categoryBanners).map(([catKey, imgUrl]) => {
                    const isCurrent = (selectedCategory === catKey) || (selectedCategory === 'all' && catKey === 'all') || (!categoryBanners[selectedCategory] && catKey === 'all');
                    return (
                        <div 
                            key={catKey}
                            className={`absolute inset-0 bg-cover transition-opacity duration-700 ease-in-out ${
                                isCurrent ? 'opacity-100 z-0' : 'opacity-0 -z-10 pointer-events-none'
                            }`}
                            style={{
                                backgroundImage: `url('${imgUrl}')`,
                                backgroundPosition: categoryBgPositions[catKey] || 'center 40%',
                            }}
                        />
                    );
                })}
                
                {/* Clear, High-Contrast Overlays for Crystal-Clear Image Sharpness & Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#07111E]/90 via-black/30 to-black/45 pointer-events-none" />
                <div className="absolute inset-0 bg-[#0B2545]/15 pointer-events-none" />

                <div className="max-w-5xl mx-auto w-full text-center relative z-10 space-y-4 sm:space-y-5 px-4 sm:px-6 lg:px-8">
                    {/* Dynamic Creative Headline Matching the Selected Category */}
                    {(() => {
                        const titleData = (categoryBannerTitles[selectedCategory] || categoryBannerTitles.all)[lang === 'sw' ? 'sw' : 'en'];
                        return (
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-white max-w-4xl mx-auto leading-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)] transition-all duration-300">
                                {titleData.prefix}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300">
                                    {titleData.highlight}
                                </span>
                                {titleData.suffix}
                            </h1>
                        );
                    })()}

                    {/* Grand Search Bar */}
                    <form onSubmit={handleSearchSubmit} className="max-w-2xl w-full mx-auto pt-1">
                        <div className="relative flex items-center rounded-2xl bg-white/95 dark:bg-[#0B1524]/90 backdrop-blur-xl border border-white/30 dark:border-white/20 p-1.5 sm:p-2 shadow-[0_16px_40px_rgba(0,0,0,0.45)] transition-all duration-300 focus-within:ring-4 focus-within:ring-emerald-500/30 focus-within:border-emerald-500">
                            <Search className="w-5 h-5 text-slate-400 dark:text-slate-300 ml-3 shrink-0" />
                            <input
                                type="text"
                                placeholder={t('search_placeholder')}
                                className="w-full px-3 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base bg-transparent border-0 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400 focus:outline-none focus:ring-0 font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={clearSearch}
                                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mr-2 cursor-pointer transition rounded-lg hover:bg-slate-100 dark:hover:bg-white/10"
                                    aria-label="Clear search"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                            <button
                                type="submit"
                                className="px-5 sm:px-7 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#16A34A] to-[#15803D] hover:from-[#15803D] hover:to-[#117534] active:scale-[0.98] text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-950/30 transition-all shrink-0 cursor-pointer flex items-center gap-2"
                            >
                                <Search className="w-4 h-4 hidden sm:inline-block" />
                                <span>{t('Search')}</span>
                            </button>
                        </div>

                        {/* Quick Search Chips / Trending Locations */}
                        <div className="flex items-center justify-center flex-wrap gap-1.5 pt-2 text-xs text-slate-200">
                            <span className="font-semibold text-emerald-300 text-[11px]">{lang === 'sw' ? 'Maarufu:' : 'Popular:'}</span>
                            {[
                                { label: 'Kilimanjaro Marathon', query: 'Kilimanjaro' },
                                { label: 'Zanzibar Serena', query: 'Zanzibar' },
                                { label: 'Dar es Salaam', query: 'Dar' },
                                { label: 'Serengeti Safari', query: 'Serengeti' }
                            ].map((item) => (
                                <button
                                    key={item.label}
                                    type="button"
                                    onClick={() => applyQuickSearch(item.query)}
                                    className="px-2.5 py-0.5 rounded-full bg-black/40 hover:bg-black/60 border border-white/15 text-slate-200 hover:text-white transition backdrop-blur-xs cursor-pointer text-[10px] sm:text-[11px] font-medium"
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </form>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                3. MAIN OCCASIONS GRID (Engineered for Complete Viewport Visibility)
               ══════════════════════════════════════════════════════════════ */}
            <main id="occasions-section" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4 pb-8 sm:pb-12 scroll-mt-14">
                {/* Active Category Heading & Stats with Category Buttons Positioned Exactly as in Attachment */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4 sm:mb-5">
                    <div className="space-y-1">
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display tracking-tight">
                            {t(categoryHeadingKeys[selectedCategory] || 'All Occasions & Experiences')}
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                            {lang === 'sw' 
                                ? `Inaonyesha matukio ${occasions.length} ${searchTerm ? `kulingana na "${searchTerm}"` : 'tayari kwa kukata tiketi papo hapo'}`
                                : `Showing ${occasions.length} occasion${occasions.length !== 1 ? 's' : ''} ${searchTerm ? `matching "${searchTerm}"` : 'ready for instant booking'}`
                            }
                        </p>
                    </div>

                    {/* Category Filter Tabs (Positioned & Styled with Translucent Transparency Exactly as in Reference Attachment) */}
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 shrink-0">
                        {categories.map((cat) => {
                            const IconComp = cat.icon;
                            const isSelected = selectedCategory === cat.key;
                            return (
                                <button
                                    key={cat.key}
                                    type="button"
                                    onClick={() => handleCategoryClick(cat.key)}
                                    className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                                        isSelected
                                            ? "bg-[#16A34A] text-white shadow-xs"
                                            : "bg-[#F1F5F9] hover:bg-[#E2E8F0] dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200"
                                    }`}
                                >
                                    <IconComp className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-600 dark:text-slate-300'}`} />
                                    <span>{t(cat.labelKey)}</span>
                                </button>
                            );
                        })}

                        {searchTerm && (
                            <button
                                type="button"
                                onClick={clearSearch}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400 text-xs font-bold transition cursor-pointer"
                            >
                                <X className="w-3.5 h-3.5" />
                                <span>{t('Clear Filter')}</span>
                            </button>
                        )}
                    </div>
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
                    /* 3-Column Occasion Cards Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-7">
                        {occasions.map((occasion) => {
                            const currency = occasion.ticket_currency || 'TZS';
                            const fallbackCover = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80';
                            const cover = occasion.cover_photo || fallbackCover;

                            const priceLabelKey = occasion.occasion_type === 'flight' 
                                ? 'FROM FARE' 
                                : occasion.occasion_type === 'hotel' 
                                    ? 'ROOM FROM' 
                                    : 'TICKETS FROM';

                            return (
                                <div
                                    key={occasion.id}
                                    className="group rounded-2xl bg-white dark:bg-[#0B1524] border border-slate-200/90 dark:border-white/10 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden"
                                >
                                    {/* Cover Image Banner */}
                                    <div className="relative h-36 sm:h-40 md:h-44 w-full overflow-hidden bg-slate-900 shrink-0">
                                        <img
                                            src={cover}
                                            alt={occasion.title}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                    </div>

                                    {/* Card Content Body */}
                                    <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2">
                                        <div className="space-y-1">
                                            {/* Date */}
                                            {occasion.event_date && (
                                                <div className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#16A34A] dark:text-emerald-400 font-mono">
                                                    {occasion.event_date}
                                                </div>
                                            )}

                                            {/* Title */}
                                            <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white font-display tracking-tight leading-snug group-hover:text-[#16A34A] dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                                                {occasion.title}
                                            </h3>

                                            {/* Venue / Location */}
                                            {occasion.venue && (
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 flex items-center gap-1">
                                                    <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                                                    <span>{occasion.venue}</span>
                                                </p>
                                            )}
                                        </div>

                                        {/* Card Footer: Starting Price & Kardovo Green Action Button */}
                                        <div className="pt-1.5 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between gap-2">
                                            <div>
                                                <div className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 leading-none">
                                                    {t(priceLabelKey)}
                                                </div>
                                                <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white font-mono mt-0.5">
                                                    {occasion.min_price === 0 ? t('Free') : `${currency} ${Number(occasion.min_price).toLocaleString()}`}
                                                </div>
                                            </div>

                                            {/* Action Pill Button */}
                                            {occasion.is_sold_out ? (
                                                <Link
                                                    href={route('events.publicTickets', occasion.id)}
                                                    className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 text-xs font-bold transition-all shrink-0 cursor-pointer"
                                                >
                                                    <span>{t('Sold Out')}</span>
                                                </Link>
                                            ) : (
                                                <Link
                                                    href={route('events.publicTickets', occasion.id)}
                                                    className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-lg bg-[#16A34A] hover:bg-[#15803D] active:bg-[#117534] text-white text-xs font-bold shadow-xs transition-all duration-150 active:scale-95 shrink-0 cursor-pointer"
                                                >
                                                    <span>{t('View event')}</span>
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
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
