import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { 
    Search, 
    Trophy, 
    Globe, 
    MessageCircle, 
    Menu, 
    X, 
    ArrowRight, 
    Phone, 
    Mail,
    Home as HomeIcon,
    ChevronDown
} from 'lucide-react';
import KardovoLogo from '@/Components/KardovoLogo';
import KardovoFooter, { WhatsAppIcon } from '@/Components/KardovoFooter';
import Modal from '@/Components/Modal';

export default function VotingMarketplace({ 
    ongoingCompetitions = [], 
    pastCompetitions = [], 
    featuredCompetitions = [],
    events = null, 
    filters = {} 
}) {
    const { auth } = usePage().props;

    const [lang, setLang] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('kardovo_lang') || 'sw';
        }
        return 'sw';
    });

    const toggleLang = () => {
        const next = lang === 'en' ? 'sw' : 'en';
        setLang(next);
        if (typeof window !== 'undefined') {
            localStorage.setItem('kardovo_lang', next);
        }
    };

    const [search, setSearch] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || 'all');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [dateFilter, setDateFilter] = useState(filters.date || 'all');
    const [openFilterDropdown, setOpenFilterDropdown] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState('Tanzania');
    const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);

    const categories = [
        { key: 'all', label: lang === 'sw' ? 'Mashindano Yote' : 'All Competitions' },
        { key: 'Awards', label: lang === 'sw' ? 'Tuzo na Heshima' : 'Awards & Gala' },
        { key: 'Music', label: lang === 'sw' ? 'Muziki na Sanaa' : 'Music & Arts' },
        { key: 'Pageant', label: lang === 'sw' ? 'Urembo na Mitindo' : 'Pageants & Modeling' },
        { key: 'Sports', label: lang === 'sw' ? 'Michezo na Ushindani' : 'Sports & Gaming' },
    ];

    const statuses = [
        { key: 'all', label: lang === 'sw' ? 'Hali Zote' : 'All Status' },
        { key: 'ongoing', label: lang === 'sw' ? 'Zinazoendelea' : 'Ongoing' },
        { key: 'past', label: lang === 'sw' ? 'Zilizofungwa' : 'Closed' },
    ];

    const dates = [
        { key: 'all', label: lang === 'sw' ? 'Tarehe Zote' : 'All Dates' },
        { key: 'this_week', label: lang === 'sw' ? 'Wiki Hii' : 'This Week' },
        { key: 'this_month', label: lang === 'sw' ? 'Mwezi Huu' : 'This Month' },
        { key: 'upcoming', label: lang === 'sw' ? 'Zijazo' : 'Upcoming' },
    ];

    const applyFilters = (newParams = {}) => {
        const query = {
            search: newParams.search !== undefined ? (newParams.search || undefined) : (search || undefined),
            category: (newParams.category !== undefined ? newParams.category : selectedCategory) !== 'all' ? (newParams.category !== undefined ? newParams.category : selectedCategory) : undefined,
            status: (newParams.status !== undefined ? newParams.status : statusFilter) !== 'all' ? (newParams.status !== undefined ? newParams.status : statusFilter) : undefined,
            date: (newParams.date !== undefined ? newParams.date : dateFilter) !== 'all' ? (newParams.date !== undefined ? newParams.date : dateFilter) : undefined,
        };

        router.get(route('voting.index'), query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onFinish: () => {
                setTimeout(() => scrollToCompetitions(), 50);
            }
        });
    };

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        applyFilters({ search });
    };

    const clearAllFilters = () => {
        setSearch('');
        setSelectedCategory('all');
        setStatusFilter('all');
        setDateFilter('all');
        router.get(route('voting.index'), {}, {
            preserveState: true,
            replace: true,
            onFinish: () => {
                setTimeout(() => scrollToCompetitions(), 50);
            }
        });
    };

    const hasActiveFilters = search || selectedCategory !== 'all' || statusFilter !== 'all' || dateFilter !== 'all';

    const howItWorksUrl = (typeof route === 'function' && route().has && route().has('voting.how-it-works'))
        ? route('voting.how-it-works')
        : '/voting/how-it-works';

    // Fallback: If ongoingCompetitions not passed (e.g. in test env), derive from events.data
    const allEvents = events?.data || [];
    const ongoing = ongoingCompetitions.length > 0 
        ? ongoingCompetitions 
        : allEvents.filter(e => !e.voting_end_at || new Date(e.voting_end_at) >= new Date());
    const past = pastCompetitions.length > 0 
        ? pastCompetitions 
        : allEvents.filter(e => e.voting_end_at && new Date(e.voting_end_at) < new Date());


    const scrollToCompetitions = (e) => {
        if (e) e.preventDefault();
        const el = document.getElementById('competitions-section');
        if (!el) return;

        const navHeight = 80;
        const rect = el.getBoundingClientRect();
        const targetScroll = window.scrollY + rect.top - navHeight;

        window.scrollTo({
            top: Math.max(0, Math.round(targetScroll)),
            behavior: 'smooth'
        });
    };

    const formatDateBadge = (dateStr) => {
        if (!dateStr) return { day: '20', month: 'OCT' };
        const d = new Date(dateStr);
        const day = d.getDate().toString().padStart(2, '0');
        const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
        return { day, month };
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#07111E] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-[#154F7C] selection:text-white relative">
            <Head title={lang === 'sw' ? 'Kura za Mashindano — Kardovo' : 'Voting — Kardovo'} />

            {/* ══════════════════════════════════════════════════════════════
                UNIFORM PUBLIC HEADER (Matching Welcome & Ticket Marketplace)
               ══════════════════════════════════════════════════════════════ */}
            {/* ══════════════════════════════════════════════════════════════
                TOP NAVBAR (Clean, Consistent Public Navigation)
               ══════════════════════════════════════════════════════════════ */}
            <header className="sticky top-0 z-50 w-full bg-white/90 dark:bg-[#07111E]/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/10 shadow-xs">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6 text-slate-800 dark:text-slate-100">
                    {/* Brand Logo & Navigation */}
                    <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                        <Link href="/" className="cursor-pointer focus:outline-none flex items-center shrink-0">
                            <KardovoLogo 
                                light={false} 
                                showText={true} 
                                textClassName="text-slate-900 dark:text-white text-base sm:text-lg font-black tracking-widest transition-colors duration-300" 
                                imgClassName="h-8 w-8 sm:h-9 sm:w-9" 
                            />
                        </Link>

                        <Link
                            href="/"
                            className="px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 shrink-0 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10"
                        >
                            <HomeIcon className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                            <span>{lang === 'sw' ? 'Nyumbani' : 'Home'}</span>
                        </Link>
                    </div>

                    {/* Right-Side Controls: Support / Language Toggle / Auth */}
                    <div className="flex items-center gap-2.5 sm:gap-3.5 text-xs sm:text-sm font-semibold shrink-0">
                        {/* Contact Us Button */}
                        <button 
                            type="button"
                            onClick={() => setShowContactModal(true)}
                            className="px-3 py-2 rounded-xl transition font-semibold inline-flex items-center cursor-pointer whitespace-nowrap text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10"
                        >
                            <span>{lang === 'sw' ? 'Wasiliana Nasi' : 'Contact Us'}</span>
                        </button>

                        {/* Language Toggle */}
                        <button 
                            type="button"
                            onClick={toggleLang} 
                            className="flex items-center gap-1.5 px-2.5 py-2 transition-colors font-semibold cursor-pointer text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white"
                            title={lang === 'en' ? 'Badili lugha kuwa Kiswahili' : 'Switch language to English'}
                        >
                            <Globe className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                            <span>{lang === 'en' ? 'SWA' : 'ENG'}</span>
                        </button>

                        {auth?.user ? (
                            <Link
                                href={route('dashboard')}
                                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#154F7C] to-[#327FB5] hover:from-[#1A5C91] hover:to-[#3D8EC7] text-white text-xs sm:text-sm font-bold transition shadow-md shadow-[#154F7C]/25 border border-sky-400/25 active:scale-95"
                            >
                                <span>{lang === 'sw' ? 'Dashibodi' : 'Dashboard'}</span>
                            </Link>
                        ) : (
                            <div className="flex items-center gap-2 sm:gap-2.5">
                                <Link
                                    href={route('login')}
                                    className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold transition text-xs sm:text-sm cursor-pointer active:scale-95 bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white border border-slate-200/80 dark:border-white/10 shadow-2xs"
                                >
                                    {lang === 'sw' ? 'Ingia' : 'Sign in'}
                                </Link>

                                <Link
                                    href={route('register')}
                                    className="inline-flex items-center gap-1.5 px-3.5 sm:px-4.5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#154F7C] to-[#327FB5] hover:from-[#1A5C91] hover:to-[#3D8EC7] text-white text-xs sm:text-sm font-bold transition shadow-md shadow-[#154F7C]/25 border border-sky-400/25 cursor-pointer active:scale-95"
                                >
                                    <span>{lang === 'sw' ? 'Jisajili' : 'Sign up'}</span>
                                </Link>
                            </div>
                        )}

                        {/* Mobile Hamburger Toggle */}
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer"
                            aria-label="Toggle Navigation Menu"
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Drawer */}
                {mobileMenuOpen && (
                    <div className="lg:hidden border-t border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#07111E] px-4 py-4 space-y-2 shadow-lg text-slate-800 dark:text-slate-100">
                        <Link 
                            href="/" 
                            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {lang === 'sw' ? 'Nyumbani' : 'Home'}
                        </Link>
                        <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex gap-2">
                            <Link 
                                href={route('login')} 
                                className="flex-1 text-center py-2 rounded-xl text-sm font-bold bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {lang === 'sw' ? 'Ingia' : 'Sign in'}
                            </Link>
                            <Link 
                                href={route('register')} 
                                className="flex-1 text-center py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-[#154F7C] to-[#327FB5] text-white"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {lang === 'sw' ? 'Jisajili' : 'Sign up'}
                            </Link>
                        </div>
                    </div>
                )}
            </header>

            {/* ══════════════════════════════════════════════════════════════
                2. SHOWCASE (Discover Header + Static Featured 5-Card Row)
                   Matches https://tix.africa/discover with 5 cards & exact proportions
               ══════════════════════════════════════════════════════════════ */}
            <section className="relative bg-white dark:bg-[#07111E] text-slate-900 dark:text-white pt-8 sm:pt-10 pb-4 sm:pb-6">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    {/* 2.1 Discover Location Header: "Find an event in:" + 📍 Tanzania ▾ */}
                    <div className="mb-6 sm:mb-8">
                        <p className="text-[15px] font-normal text-[#71717A] dark:text-neutral-400 mb-1.5">
                            {lang === 'sw' ? 'Tafuta shindano ndani ya:' : 'Find an event in:'}
                        </p>
                        <div className="relative inline-block">
                            <button
                                type="button"
                                onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
                                className="inline-flex items-center gap-2 text-xl sm:text-[23px] font-extrabold text-slate-900 dark:text-white cursor-pointer select-none group focus:outline-none"
                            >
                                {/* Location Pin in signature Kardovo Blue */}
                                <svg className="w-5 h-5 text-[#154F7C] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                                    <circle cx="12" cy="10" r="3" fill="#154F7C" />
                                </svg>
                                <span className="tracking-tight">{selectedLocation}</span>
                                <ChevronDown className={`w-4 h-4 text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-transform duration-200 stroke-[2.2] ml-0.5 ${locationDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {locationDropdownOpen && (
                                <div className="absolute left-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/10 shadow-xl py-1.5 z-40 animate-in fade-in slide-in-from-top-1 duration-150">
                                    {['Tanzania', 'Dar es Salaam', 'Zanzibar', 'Arusha', 'Mwanza', 'Dodoma'].map((loc) => (
                                        <button
                                            key={loc}
                                            type="button"
                                            onClick={() => {
                                                setSelectedLocation(loc);
                                                setLocationDropdownOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-xs font-semibold flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition cursor-pointer ${
                                                selectedLocation === loc ? 'text-[#154F7C] dark:text-sky-400 font-bold bg-sky-50/70 dark:bg-sky-950/40' : 'text-slate-700 dark:text-slate-200'
                                            }`}
                                        >
                                            <span>{loc}</span>
                                            {selectedLocation === loc && <span className="w-1.5 h-1.5 rounded-full bg-[#154F7C] dark:bg-sky-400" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 2.2 Static 5-Card Row matching tix.africa/discover layout (Larger & More Prominent) */}
                    {(() => {
                        const carouselSource = (featuredCompetitions && featuredCompetitions.length > 0)
                            ? featuredCompetitions
                            : (ongoing && ongoing.length > 0 ? ongoing : []);

                        const defaultItems = [
                            {
                                id: 17,
                                title: "Tanzania Music Awards (TMA) 2026",
                                event_date: "Fri, Nov 20th, 7PM",
                                cover_photo: "/images/categories/events.jpg",
                            },
                            {
                                id: 18,
                                title: "Miss Grand Tanzania Gala 2026",
                                event_date: "Sat, Nov 7th, 8PM",
                                cover_photo: "/images/categories/fashion.jpg",
                            },
                            {
                                id: 15,
                                title: "Miss Popularity Dar Gala",
                                event_date: "Fri, Oct 30th, 8PM",
                                cover_photo: "/images/categories/fashion_runway.jpg",
                            },
                            {
                                id: 14,
                                title: "Tanzania Northern Zone Awards 2026",
                                event_date: "Wed, Nov 25th, 6PM",
                                cover_photo: "/images/categories/corporate.jpg",
                            },
                            {
                                id: 19,
                                title: "East Africa Tech & Fintech Innovation Awards 2026",
                                event_date: "Fri, Dec 4th, 6:30PM",
                                cover_photo: "/images/categories/nightlife.jpg",
                            }
                        ];

                        // Always ensure STRICTLY 5 items are displayed in the showcase row
                        let baseItems = [...(carouselSource || [])];
                        if (baseItems.length < 5) {
                            const existingTitles = new Set(baseItems.map(item => (item.title || '').toLowerCase()));
                            for (const d of defaultItems) {
                                if (!existingTitles.has((d.title || '').toLowerCase())) {
                                    baseItems.push(d);
                                    if (baseItems.length >= 5) break;
                                }
                            }
                        }
                        baseItems = baseItems.slice(0, 5);

                        const formatShowcaseDate = (dateVal) => {
                            if (!dateVal) return lang === 'sw' ? 'Tarehe itatangazwa' : 'Date TBA';
                            if (typeof dateVal === 'string' && (dateVal.includes(',') || dateVal.includes('PM') || dateVal.includes('AM'))) {
                                return dateVal;
                            }
                            try {
                                const d = new Date(dateVal);
                                if (isNaN(d.getTime())) return dateVal;
                                return d.toLocaleDateString(lang === 'sw' ? 'sw-TZ' : 'en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                });
                            } catch {
                                return dateVal;
                            }
                        };

                        return (
                            <div className="flex overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 md:grid md:grid-cols-5 md:overflow-visible md:snap-none md:pb-0 gap-4 sm:gap-5 lg:gap-6 items-stretch">
                                {baseItems.map((item, idx) => {
                                    const fallbackCover = '/images/categories/events.jpg';
                                    const cover = item.cover_photo || item.voting_banner || item.cover_image || fallbackCover;
                                    const itemUrl = item.id ? route('voting.show', item.id) : '#';

                                    return (
                                        <Link
                                            key={`voting-card-${item.id || 'card'}-${idx}`}
                                            href={itemUrl}
                                            className="w-[240px] sm:w-[260px] shrink-0 snap-start md:w-auto md:shrink bg-black text-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col group h-full"
                                        >
                                            {/* Poster Image (Larger & Taller with smooth fade into black footer) */}
                                            <div className="relative aspect-[1/1.32] w-full overflow-hidden bg-neutral-900 shrink-0">
                                                <img
                                                    src={cover}
                                                    alt={item.title}
                                                    onError={(e) => {
                                                        e.currentTarget.onerror = null;
                                                        e.currentTarget.src = '/images/categories/events.jpg';
                                                    }}
                                                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                                                />
                                                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none" />
                                            </div>

                                            {/* Solid Black Footer matching tix.africa (Spacious, bold typography) */}
                                            <div className="p-4 sm:p-5 bg-black flex-1 flex flex-col items-center justify-between text-center min-h-[145px] sm:min-h-[155px]">
                                                <span className="text-[11px] sm:text-xs tracking-[0.09em] font-bold text-[#A1A1AA] uppercase mb-1.5 block">
                                                    {lang === 'sw' ? 'SHINDANO LILILOANGINZIWA' : 'HIGHLIGHTED COMPETITION'}
                                                </span>
                                                <h3 className="text-sm sm:text-[15px] md:text-base font-black text-white text-center leading-[1.3] line-clamp-3 my-auto font-sans tracking-tight">
                                                    {item.title}
                                                </h3>
                                                <p className="text-xs sm:text-[13px] font-medium text-[#A1A1AA] text-center mt-2">
                                                    {formatShowcaseDate(item.event_date || item.voting_end_at || item.created_at)}
                                                </p>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        );
                    })()}

                    {/* Scroll Down Arrow Indicator */}
                    <div className="flex justify-center pt-6 pb-2">
                        <button
                            type="button"
                            onClick={scrollToCompetitions}
                            className="group flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 shadow-xs hover:shadow-md hover:border-[#154F7C] dark:hover:border-sky-400 text-slate-500 hover:text-[#154F7C] dark:text-slate-400 dark:hover:text-sky-400 transition-all cursor-pointer active:scale-90 focus:outline-none"
                            aria-label="Scroll down to competitions"
                            title="Scroll down"
                        >
                            <ChevronDown className="w-5 h-5 animate-bounce stroke-[2.2] text-[#154F7C] dark:text-sky-400" />
                        </button>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                MAIN CONTENT: Clean, Minimalist, Spacious (like tukiio.com/voting)
               ══════════════════════════════════════════════════════════════ */}
            <main id="competitions-section" className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex-1 w-full space-y-12 scroll-mt-20">
                {/* 1. TOP FILTER BAR: [All Competitions ▾] [Status ▾] [Date ▾] + Search Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 sm:mb-8 relative z-30">
                    {/* Filter Pills */}
                    <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                        {/* Category Dropdown Pill: [All Competitions ▾] */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setOpenFilterDropdown(openFilterDropdown === 'category' ? null : 'category')}
                                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all border cursor-pointer active:scale-95 ${
                                    selectedCategory !== 'all'
                                        ? 'bg-gradient-to-r from-[#154F7C] to-[#327FB5] text-white shadow-md shadow-[#154F7C]/25 border-sky-400/30'
                                        : 'bg-white/95 hover:bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-100 border-slate-200/90 dark:border-white/10 shadow-2xs hover:border-sky-300 hover:text-sky-900 dark:hover:text-white'
                                }`}
                            >
                                <span>
                                    {categories.find(c => c.key === selectedCategory)?.label || (lang === 'sw' ? 'Mashindano Yote' : 'All Competitions')}
                                </span>
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openFilterDropdown === 'category' ? 'rotate-180' : ''} ${selectedCategory !== 'all' ? 'text-sky-100' : 'text-slate-400'}`} />
                            </button>

                            {openFilterDropdown === 'category' && (
                                <div className="absolute left-0 top-full mt-2 w-52 bg-white/95 dark:bg-slate-900 backdrop-blur-2xl rounded-2xl border border-slate-100 dark:border-white/10 shadow-[0_20px_45px_-10px_rgba(11,37,69,0.18),0_0_1px_rgba(11,37,69,0.15)] py-1.5 z-40 animate-in fade-in slide-in-from-top-1 duration-150">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.key}
                                            type="button"
                                            onClick={() => {
                                                setSelectedCategory(cat.key);
                                                setOpenFilterDropdown(null);
                                                applyFilters({ category: cat.key });
                                            }}
                                            className={`w-full text-left px-4 py-2 text-xs font-semibold flex items-center justify-between hover:bg-sky-50/70 hover:text-sky-900 dark:hover:bg-white/10 dark:hover:text-white transition cursor-pointer ${
                                                selectedCategory === cat.key ? 'text-[#154F7C] dark:text-sky-400 font-bold bg-sky-50/90 dark:bg-white/5' : 'text-slate-700 dark:text-slate-200'
                                            }`}
                                        >
                                            <span>{cat.label}</span>
                                            {selectedCategory === cat.key && <span className="w-1.5 h-1.5 rounded-full bg-[#154F7C] dark:bg-sky-400" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Status Filter Pill: [Status ▾] */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setOpenFilterDropdown(openFilterDropdown === 'status' ? null : 'status')}
                                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all border cursor-pointer active:scale-95 ${
                                    statusFilter !== 'all'
                                        ? 'bg-gradient-to-r from-[#154F7C] to-[#327FB5] text-white shadow-md shadow-[#154F7C]/25 border-sky-400/30 font-bold'
                                        : 'bg-white/95 hover:bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-100 border-slate-200/90 dark:border-white/10 shadow-2xs hover:border-sky-300 hover:text-sky-900 dark:hover:text-white'
                                }`}
                            >
                                <span>
                                    {statuses.find(s => s.key === statusFilter)?.label || (lang === 'sw' ? 'Hali' : 'Status')}
                                </span>
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openFilterDropdown === 'status' ? 'rotate-180' : ''} ${statusFilter !== 'all' ? 'text-sky-100' : 'text-slate-400'}`} />
                            </button>

                            {openFilterDropdown === 'status' && (
                                <div className="absolute left-0 top-full mt-2 w-44 bg-white/95 dark:bg-slate-900 backdrop-blur-2xl rounded-2xl border border-slate-100 dark:border-white/10 shadow-[0_20px_45px_-10px_rgba(11,37,69,0.18),0_0_1px_rgba(11,37,69,0.15)] py-1.5 z-40 animate-in fade-in slide-in-from-top-1 duration-150">
                                    {statuses.map((st) => (
                                        <button
                                            key={st.key}
                                            type="button"
                                            onClick={() => {
                                                setStatusFilter(st.key);
                                                setOpenFilterDropdown(null);
                                                applyFilters({ status: st.key });
                                            }}
                                            className={`w-full text-left px-4 py-2 text-xs font-semibold flex items-center justify-between hover:bg-sky-50/70 hover:text-sky-900 dark:hover:bg-white/10 dark:hover:text-white transition cursor-pointer ${
                                                statusFilter === st.key ? 'text-[#154F7C] dark:text-sky-400 font-bold bg-sky-50/90 dark:bg-white/5' : 'text-slate-700 dark:text-slate-200'
                                            }`}
                                        >
                                            <span>{st.label}</span>
                                            {statusFilter === st.key && <span className="w-1.5 h-1.5 rounded-full bg-[#154F7C] dark:bg-sky-400" />}
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
                                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all border cursor-pointer active:scale-95 ${
                                    dateFilter !== 'all'
                                        ? 'bg-gradient-to-r from-[#154F7C] to-[#327FB5] text-white shadow-md shadow-[#154F7C]/25 border-sky-400/30 font-bold'
                                        : 'bg-white/95 hover:bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-100 border-slate-200/90 dark:border-white/10 shadow-2xs hover:border-sky-300 hover:text-sky-900 dark:hover:text-white'
                                }`}
                            >
                                <span>
                                    {dates.find(d => d.key === dateFilter)?.label || (lang === 'sw' ? 'Tarehe' : 'Date')}
                                </span>
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openFilterDropdown === 'date' ? 'rotate-180' : ''} ${dateFilter !== 'all' ? 'text-sky-100' : 'text-slate-400'}`} />
                            </button>

                            {openFilterDropdown === 'date' && (
                                <div className="absolute left-0 top-full mt-2 w-44 bg-white/95 dark:bg-slate-900 backdrop-blur-2xl rounded-2xl border border-slate-100 dark:border-white/10 shadow-[0_20px_45px_-10px_rgba(11,37,69,0.18),0_0_1px_rgba(11,37,69,0.15)] py-1.5 z-40 animate-in fade-in slide-in-from-top-1 duration-150">
                                    {dates.map((d) => (
                                        <button
                                            key={d.key}
                                            type="button"
                                            onClick={() => {
                                                setDateFilter(d.key);
                                                setOpenFilterDropdown(null);
                                                applyFilters({ date: d.key });
                                            }}
                                            className={`w-full text-left px-4 py-2 text-xs font-semibold flex items-center justify-between hover:bg-sky-50/70 hover:text-sky-900 dark:hover:bg-white/10 dark:hover:text-white transition cursor-pointer ${
                                                dateFilter === d.key ? 'text-[#154F7C] dark:text-sky-400 font-bold bg-sky-50/90 dark:bg-white/5' : 'text-slate-700 dark:text-slate-200'
                                            }`}
                                        >
                                            <span>{d.label}</span>
                                            {dateFilter === d.key && <span className="w-1.5 h-1.5 rounded-full bg-[#154F7C] dark:bg-sky-400" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={clearAllFilters}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-white/10 dark:hover:bg-white/20 dark:text-slate-200 text-xs font-bold transition cursor-pointer shrink-0 border border-slate-200/80 dark:border-white/10 shadow-2xs"
                            >
                                <X className="w-3.5 h-3.5" />
                                <span>{lang === 'sw' ? 'Futa' : 'Clear'}</span>
                            </button>
                        )}
                    </div>

                    {/* Right: Search Bar Input */}
                    <form onSubmit={handleSearch} className="relative w-full md:w-80 shrink-0">
                        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={lang === 'sw' ? 'Tafuta mashindano au tuzo...' : 'Search competitions or awards...'}
                            className="w-full pl-10 pr-9 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-full text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#154F7C] transition-all text-slate-800 dark:text-slate-100"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearch('');
                                    applyFilters({ search: '' });
                                }}
                                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                                aria-label="Clear search"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </form>
                </div>

                {/* 1. ONGOING VOTING SECTION */}
                <section className="space-y-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                        {lang === 'sw' ? 'Kura Zinazoendelea' : 'Ongoing Voting'}
                    </h2>

                    {ongoing.length === 0 ? (
                        <div className="py-12 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-6">
                            <Trophy className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                                {lang === 'sw' 
                                    ? 'Hakuna mashindano yanayoendelea kwa sasa.' 
                                    : 'No ongoing voting competitions at the moment.'}
                            </p>
                            <Link
                                href={route('voting.portal.index')}
                                className="mt-3 inline-block text-xs font-bold text-[#154F7C] dark:text-sky-400 hover:underline"
                            >
                                {lang === 'sw' ? 'Anzisha shindano sasa →' : 'Launch a competition now →'}
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
                            {ongoing.map((event) => {
                                const { day, month } = formatDateBadge(event.event_date || event.created_at);

                                return (
                                    <div
                                        key={event.id}
                                        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
                                    >
                                        <div>
                                            {/* Poster Image with Floating Date Badge */}
                                            <div className="relative aspect-[16/10] bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                                {event.cover_photo || event.voting_banner || event.cover_image ? (
                                                    <img
                                                        src={event.cover_photo || event.voting_banner || event.cover_image}
                                                        alt={event.title}
                                                        onError={(e) => {
                                                            e.currentTarget.onerror = null;
                                                            e.currentTarget.src = '/images/categories/events.jpg';
                                                        }}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#154F7C] to-[#2573AB] text-white/30">
                                                        <Trophy className="w-16 h-16" />
                                                    </div>
                                                )}

                                                {/* Date Badge: Top Left (exact tukiio style) */}
                                                <div className="absolute top-3 left-3 bg-white dark:bg-slate-900/95 px-3 py-1.5 rounded-xl shadow-md border border-slate-100 dark:border-slate-800 text-center leading-none">
                                                    <div className="text-lg font-black text-slate-900 dark:text-white">
                                                        {day}
                                                    </div>
                                                    <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mt-0.5 tracking-wider">
                                                        {month}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Title & Info */}
                                            <div className="p-5 pb-3">
                                                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 min-h-[44px]">
                                                    {event.title}
                                                </h3>
                                            </div>
                                        </div>

                                        {/* Action Button: Vote */}
                                        <div className="p-5 pt-0">
                                            <Link
                                                href={route('voting.show', event.id)}
                                                className="w-full py-2.5 rounded-full bg-gradient-to-r from-[#154F7C] to-[#327FB5] hover:from-[#1A5C91] hover:to-[#3D8EC7] text-white font-bold text-xs sm:text-sm transition flex items-center justify-center shadow-md shadow-[#154F7C]/20 border border-sky-400/25 active:scale-98 cursor-pointer"
                                            >
                                                {lang === 'sw' ? 'Piga Kura' : 'Vote'}
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* 2. PAST VOTING SECTION */}
                <section className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                        {lang === 'sw' ? 'Kura Zilizopita' : 'Past Voting'}
                    </h2>

                    {past.length === 0 ? (
                        <div className="py-8 text-center text-xs text-slate-400">
                            {lang === 'sw' ? 'Hakuna kumbukumbu za kura zilizopita bado.' : 'No past voting records yet.'}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
                            {past.map((event) => {
                                const { day, month } = formatDateBadge(event.event_date || event.voting_end_at || event.created_at);

                                return (
                                    <div
                                        key={event.id}
                                        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs flex flex-col justify-between opacity-85 hover:opacity-100 transition"
                                    >
                                        <div>
                                            {/* Poster Image with Floating Date Badge */}
                                            <div className="relative aspect-[16/10] bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                                {event.cover_photo || event.voting_banner || event.cover_image ? (
                                                    <img
                                                        src={event.cover_photo || event.voting_banner || event.cover_image}
                                                        alt={event.title}
                                                        onError={(e) => {
                                                            e.currentTarget.onerror = null;
                                                            e.currentTarget.src = '/images/categories/events.jpg';
                                                        }}
                                                        className="w-full h-full object-cover grayscale-30"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-800 text-slate-400">
                                                        <Trophy className="w-16 h-16" />
                                                    </div>
                                                )}

                                                {/* Date Badge: Top Left */}
                                                <div className="absolute top-3 left-3 bg-white dark:bg-slate-900/95 px-3 py-1.5 rounded-xl shadow-md border border-slate-100 dark:border-slate-800 text-center leading-none">
                                                    <div className="text-lg font-black text-slate-900 dark:text-white">
                                                        {day}
                                                    </div>
                                                    <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mt-0.5 tracking-wider">
                                                        {month}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Title */}
                                            <div className="p-5 pb-3">
                                                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 min-h-[44px]">
                                                    {event.title}
                                                </h3>
                                            </div>
                                        </div>

                                        {/* Action Button: Closed or View Results */}
                                        <div className="p-5 pt-0">
                                            <Link
                                                href={route('voting.show', event.id)}
                                                className="w-full py-2.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs sm:text-sm font-bold transition flex items-center justify-center cursor-pointer"
                                            >
                                                {lang === 'sw' ? 'Imefungwa' : 'Closed'}
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    ORGANIZER HOW IT WORKS CALLOUT BANNER (Matching TicketMarketplace)
                   ══════════════════════════════════════════════════════════════ */}
                <div className="mt-14 sm:mt-20 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#154F7C] via-[#1B5D91] to-[#0A2B47] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-sky-400/25">
                    <div className="space-y-1 text-center md:text-left">
                        <span className="text-xs font-bold text-sky-300 uppercase tracking-wider">
                            {lang === 'sw' ? 'Kwa Waandaaji wa Tuzo na Mashindano' : 'For Award & Contest Organizers'}
                        </span>
                        <h3 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white">
                            {lang === 'sw' ? 'Unataka Kuendesha Kura na Kardovo?' : 'Want to Run Voting on Kardovo?'}
                        </h3>
                        <p className="text-xs sm:text-sm text-sky-100 max-w-xl">
                            {lang === 'sw'
                                ? 'Tazama jinsi mfumo wetu wa kura unavyofanya kazi: uundaji wa vipengele na wagombea, malipo ya simu (M-Pesa, Airtel, Tigo, HaloPesa), matokeo ya moja kwa moja na usalama dhidi ya udanganyifu.'
                                : 'Explore our complete organizer guide: category & nominee setup, instant mobile money voting (M-Pesa, Airtel, Tigo, HaloPesa), live transparent tallies, and fraud-proof audit logs.'}
                        </p>
                    </div>
                    <Link
                        href={howItWorksUrl}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-[#154F7C] hover:bg-sky-50 text-xs sm:text-sm font-black transition-all shadow-md shrink-0 active:scale-95"
                    >
                        <span>{lang === 'sw' ? 'Jinsi Inavyofanya Kazi' : 'How It Works'}</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </main>

            {/* Contact Us Modal (Translucent & Uniform) */}
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
                                ? 'Tuko hapa kukusaidia saa 24/7 kuhusu kura, tiketi za matukio, mialiko ya kidigitali na malipo.'
                                : 'We are here 24/7 to assist you with voting, awards, event tickets, invitations, and payments.'}
                        </p>
                    </div>

                    {/* Variety of Contact Options */}
                    <div className="space-y-3">
                        {/* 1. WhatsApp Option */}
                        <a
                            href="https://wa.me/255737672987?text=Habari%20Kardovo,%20nahitaji%20msaada%20kuhusu%20huduma%20za%20kura%20na%20matukio."
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
                                <div className="w-11 h-11 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
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
                            href="mailto:support@kardovo.com"
                            className="group flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] border border-slate-200/80 dark:border-white/10 transition-all duration-200 shadow-2xs hover:shadow-md cursor-pointer"
                        >
                            <div className="flex items-center gap-3.5">
                                <div className="w-11 h-11 rounded-xl bg-[#154F7C] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                                        {lang === 'sw' ? 'Barua Pepe Rasmi' : 'Email Support'}
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

            {/* Standard Kardovo Footer */}
            <KardovoFooter lang={lang} />
        </div>
    );
}
