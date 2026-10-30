import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import KardovoLogo from '@/Components/KardovoLogo';
import KardovoFooter from '@/Components/KardovoFooter';
import Modal from '@/Components/Modal';
import Login from '@/Pages/Auth/Login';
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
    Mail,
    Phone,
    MessageCircle,
} from 'lucide-react';
import { useTicketingLanguage } from '@/Utils/ticketingTranslations';

function InstagramIcon({ className = "w-5 h-5" }) {
    return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
    );
}

function FacebookIcon({ className = "w-5 h-5" }) {
    return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
    );
}

function WhatsAppIcon({ className = "w-5 h-5" }) {
    return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
        </svg>
    );
}

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
    const [selectedLocation, setSelectedLocation] = useState('Tanzania');
    const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);

    // ── AUTH & CONTACT POPUP MODAL STATE (TRANSLUCENT) ──
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [authModalMode, setAuthModalMode] = useState('login');
    const [showContactModal, setShowContactModal] = useState(false);

    const openAuthModal = (mode) => {
        setAuthModalMode(mode);
        setShowLoginModal(true);
    };

    // ── STICKY NAVBAR SCROLL BLUR STATE ──
    const [isScrolled, setIsScrolled] = useState(false);

    // ── PRECISE SCROLLING TO OCCASIONS SECTION MATCHING ATTACHMENT VIEW ──
    const scrollToOccasions = (e) => {
        if (e) e.preventDefault();
        const el = document.getElementById('occasions-section');
        if (!el) return;

        const navHeight = 80; // h-20 navbar height
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
            const params = new URLSearchParams(window.location.search);
            const scrollParam = params.get('scroll');
            if (scrollParam) {
                setTimeout(() => window.scrollTo(0, parseInt(scrollParam, 10)), 100);
            } else if (!window.location.hash) {
                window.scrollTo(0, 0);
            }
        }

        const handleScroll = () => {
            const occasionsEl = document.getElementById('occasions-section');
            if (occasionsEl) {
                const navHeight = 80; // h-20 navbar
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
            sw: { prefix: 'Shiriki ', highlight: 'matukio maarufu zaidi', suffix: ' kote Tanzania.' },
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
            sw: { prefix: 'Shuhudia msisimko wa ', highlight: 'marathoni na mechi kuu', suffix: ' kote Tanzania.' },
        },
        fashion: {
            en: { prefix: 'Step into glamour with ', highlight: 'runway shows & fashion galas', suffix: ' across Tanzania.' },
            sw: { prefix: 'Shuhudia uzuri wa ', highlight: 'maonyesho ya mitindo na gala', suffix: ' kote Tanzania.' },
        },
        corporate: {
            en: { prefix: 'Elevate your network with ', highlight: 'executive summits & corporate events', suffix: ' in Tanzania.' },
            sw: { prefix: 'Panua mtandao wako kupitia ', highlight: 'mikutano na makongamano ya kibiashara', suffix: ' nchini Tanzania.' },
        },
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#07111E] text-slate-800 dark:text-slate-100 flex flex-col font-sans selection:bg-[#154F7C] selection:text-white relative">
            <Head title={`${t('hero_title')} — Kardovo Tickets`}>
                <meta name="description" content="Discover and book tickets for concerts, nightlife, hotels, and marathons across Tanzania. Instant digital passes and multi-channel delivery powered by Kardovo." />
            </Head>

            {/* ══════════════════════════════════════════════════════════════
                1. TOP NAVBAR (Clean, Frosted Sticky Navigation)
               ══════════════════════════════════════════════════════════════ */}
            <header 
                className="sticky top-0 z-50 w-full bg-white/90 dark:bg-[#07111E]/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/10 shadow-xs"
            >
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6 text-slate-800 dark:text-slate-100">
                    {/* Brand Logo & Home Navigation */}
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
                            <span>{t('Home')}</span>
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
                            <span>{t('Contact Us')}</span>
                        </button>

                        {/* Language Toggle: Icon and text only, no shape */}
                        <button 
                            type="button"
                            onClick={toggleLang} 
                            className="flex items-center gap-1.5 px-2.5 py-2 transition-colors font-semibold cursor-pointer text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white"
                            title={lang === 'en' ? 'Badili lugha kuwa Kiswahili' : 'Switch language to English'}
                        >
                            <Globe className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                            <span>{lang === 'en' ? 'SWA' : 'ENG'}</span>
                        </button>

                        {user ? (
                            <Link
                                href={route('dashboard')}
                                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#154F7C] to-[#327FB5] hover:from-[#1A5C91] hover:to-[#3D8EC7] text-white text-xs sm:text-sm font-bold transition shadow-md shadow-[#154F7C]/25 border border-sky-400/25 active:scale-95"
                            >
                                <span>{t('Dashboard')}</span>
                            </Link>
                        ) : (
                            <div className="flex items-center gap-2 sm:gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => openAuthModal('login')}
                                    className="px-4 py-2 sm:py-2.5 rounded-xl font-bold transition text-xs sm:text-sm cursor-pointer active:scale-95 bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white border border-slate-200/80 dark:border-white/10 shadow-2xs"
                                >
                                    {t('Sign in')}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => openAuthModal('register')}
                                    className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#154F7C] to-[#327FB5] hover:from-[#1A5C91] hover:to-[#3D8EC7] text-white text-xs sm:text-sm font-bold transition shadow-md shadow-[#154F7C]/25 border border-sky-400/25 cursor-pointer active:scale-95"
                                >
                                    <span>{t('Sign up')}</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
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
                            {lang === 'sw' ? 'Tafuta tukio ndani ya:' : 'Find an event in:'}
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
                        const carouselSource = (featuredOccasions && featuredOccasions.length > 0)
                            ? featuredOccasions
                            : (occasions && occasions.length > 0 ? occasions : []);

                        const defaultItems = [
                            {
                                id: 1,
                                title: "Diamond Platnumz — Wasafi Festival Finale",
                                event_date: "Fri, Oct 30th, 9PM",
                                cover_photo: "/images/categories/events.jpg",
                            },
                            {
                                id: 2,
                                title: "Kilimanjaro Marathon & Bush Retreat",
                                event_date: "Sun, Oct 25th, 8AM",
                                cover_photo: "/images/categories/sports.jpg",
                            },
                            {
                                id: 3,
                                title: "Serengeti Balloon Safari (Luxury Edition)",
                                event_date: "Wed, Oct 7th, 6AM",
                                cover_photo: "/images/categories/fashion.jpg",
                            },
                            {
                                id: 4,
                                title: "Nandy Festival Live in Dar",
                                event_date: "Fri, Oct 2nd, 8PM",
                                cover_photo: "/images/categories/nightlife.jpg",
                            },
                            {
                                id: 5,
                                title: "Dar es Salaam International Jazz Festival",
                                event_date: "Sat, Nov 14th, 7PM",
                                cover_photo: "/images/corporate.jpg",
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

                        return (
                            <div className="flex overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 md:grid md:grid-cols-5 md:overflow-visible md:snap-none md:pb-0 gap-4 sm:gap-5 lg:gap-6 items-stretch">
                                {baseItems.map((item, idx) => {
                                    const fallbackCover = '/images/categories/events.jpg';
                                    const cover = item.cover_photo || fallbackCover;
                                    const itemUrl = item.id ? route('events.publicTickets', item.id) : '#';

                                    return (
                                        <Link
                                            key={`static-card-${item.id || 'card'}-${idx}`}
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
                                                    {lang === 'sw' ? 'TUKIO LILILOANGINZIWA' : 'HIGHLIGHTED EVENT'}
                                                </span>
                                                <h3 className="text-sm sm:text-[15px] md:text-base font-black text-white text-center leading-[1.3] line-clamp-3 my-auto font-sans tracking-tight">
                                                    {item.title}
                                                </h3>
                                                <p className="text-xs sm:text-[13px] font-medium text-[#A1A1AA] text-center mt-2">
                                                    {item.event_date || (lang === 'sw' ? 'Tarehe itatangazwa' : 'Date TBA')}
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
                            onClick={scrollToOccasions}
                            className="group flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 shadow-xs hover:shadow-md hover:border-[#154F7C] dark:hover:border-sky-400 text-slate-500 hover:text-[#154F7C] dark:text-slate-400 dark:hover:text-sky-400 transition-all cursor-pointer active:scale-90 focus:outline-none"
                            aria-label="Scroll down to tickets"
                            title="Scroll down"
                        >
                            <ChevronDown className="w-5 h-5 animate-bounce stroke-[2.2] text-[#154F7C] dark:text-sky-400" />
                        </button>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                3. MAIN OCCASIONS SECTION (Seamless Pure White Flow)
               ══════════════════════════════════════════════════════════════ */}
            <div className="relative bg-white dark:bg-[#07111E]">
                <main id="occasions-section" className="relative z-10 flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-16 sm:pb-24 scroll-mt-20">
                    {/* 1. TOP FILTER BAR: [All Events ▾] [Price ▾] [Date ▾] + Search Bar */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 sm:mb-8 relative z-30">
                        {/* Filter Pills */}
                        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                            {/* Category Dropdown Pill: [All Events ▾] */}
                            <div className="relative">
                            <button
                                type="button"
                                onClick={() => setOpenFilterDropdown(openFilterDropdown === 'category' ? null : 'category')}
                                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all border cursor-pointer active:scale-95 ${
                                    selectedCategory !== 'all'
                                        ? 'bg-gradient-to-r from-[#154F7C] to-[#327FB5] text-white shadow-md shadow-[#154F7C]/25 border-sky-400/30'
                                        : 'bg-white/95 hover:bg-slate-50 text-slate-800 border-slate-200/90 shadow-2xs hover:border-sky-300 hover:text-sky-900'
                                }`}
                            >
                                <span>
                                    {selectedCategory === 'all' 
                                        ? t('All Events') 
                                        : t(categories.find(c => c.key === selectedCategory)?.labelKey || 'All Events')}
                                </span>
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openFilterDropdown === 'category' ? 'rotate-180' : ''} ${selectedCategory !== 'all' ? 'text-sky-100' : 'text-slate-400'}`} />
                            </button>

                            {openFilterDropdown === 'category' && (
                                <div className="absolute left-0 top-full mt-2 w-52 bg-white/95 backdrop-blur-2xl rounded-2xl border border-slate-100 shadow-[0_20px_45px_-10px_rgba(11,37,69,0.18),0_0_1px_rgba(11,37,69,0.15)] py-1.5 z-40 animate-in fade-in slide-in-from-top-1 duration-150">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.key}
                                            type="button"
                                            onClick={() => {
                                                handleCategoryClick(cat.key);
                                                setOpenFilterDropdown(null);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-xs font-semibold flex items-center justify-between hover:bg-sky-50/70 hover:text-sky-900 transition cursor-pointer ${
                                                selectedCategory === cat.key ? 'text-[#154F7C] font-bold bg-sky-50/90' : 'text-slate-700'
                                            }`}
                                        >
                                            <span>{t(cat.labelKey)}</span>
                                            {selectedCategory === cat.key && <span className="w-1.5 h-1.5 rounded-full bg-[#154F7C]" />}
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
                                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all border cursor-pointer active:scale-95 ${
                                    priceFilter !== 'all'
                                        ? 'bg-gradient-to-r from-[#154F7C] to-[#327FB5] text-white shadow-md shadow-[#154F7C]/25 border-sky-400/30 font-bold'
                                        : 'bg-white/95 hover:bg-slate-50 text-slate-800 border-slate-200/90 shadow-2xs hover:border-sky-300 hover:text-sky-900'
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
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openFilterDropdown === 'price' ? 'rotate-180' : ''} ${priceFilter !== 'all' ? 'text-sky-100' : 'text-slate-400'}`} />
                            </button>

                            {openFilterDropdown === 'price' && (
                                <div className="absolute left-0 top-full mt-2 w-44 bg-white/95 backdrop-blur-2xl rounded-2xl border border-slate-100 shadow-[0_20px_45px_-10px_rgba(11,37,69,0.18),0_0_1px_rgba(11,37,69,0.15)] py-1.5 z-40 animate-in fade-in slide-in-from-top-1 duration-150">
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
                                            className={`w-full text-left px-4 py-2 text-xs font-semibold flex items-center justify-between hover:bg-sky-50/70 hover:text-sky-900 transition cursor-pointer ${
                                                priceFilter === p.key ? 'text-[#154F7C] font-bold bg-sky-50/90' : 'text-slate-700'
                                            }`}
                                        >
                                            <span>{t(p.label)}</span>
                                            {priceFilter === p.key && <span className="w-1.5 h-1.5 rounded-full bg-[#154F7C]" />}
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
                                        : 'bg-white/95 hover:bg-slate-50 text-slate-800 border-slate-200/90 shadow-2xs hover:border-sky-300 hover:text-sky-900'
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
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openFilterDropdown === 'date' ? 'rotate-180' : ''} ${dateFilter !== 'all' ? 'text-sky-100' : 'text-slate-400'}`} />
                            </button>

                            {openFilterDropdown === 'date' && (
                                <div className="absolute left-0 top-full mt-2 w-44 bg-white/95 backdrop-blur-2xl rounded-2xl border border-slate-100 shadow-[0_20px_45px_-10px_rgba(11,37,69,0.18),0_0_1px_rgba(11,37,69,0.15)] py-1.5 z-40 animate-in fade-in slide-in-from-top-1 duration-150">
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
                                            className={`w-full text-left px-4 py-2 text-xs font-semibold flex items-center justify-between hover:bg-sky-50/70 hover:text-sky-900 transition cursor-pointer ${
                                                dateFilter === d.key ? 'text-[#154F7C] font-bold bg-sky-50/90' : 'text-slate-700'
                                            }`}
                                        >
                                            <span>{t(d.label)}</span>
                                            {dateFilter === d.key && <span className="w-1.5 h-1.5 rounded-full bg-[#154F7C]" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        </div>

                        {/* Search Bar Input */}
                        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80 shrink-0">
                            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={lang === 'sw' ? 'Tafuta matukio au tiketi...' : 'Search events or tickets...'}
                                className="w-full pl-10 pr-9 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-full text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#154F7C] transition-all text-slate-800 dark:text-slate-100"
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={clearSearch}
                                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                                    aria-label="Clear search"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </form>
                    </div>

                    {/* 2. SECTION TITLE: "Popular Events" + "See all" */}
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display tracking-tight">
                            {t('Popular Events')}
                        </h2>
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedCategory('all');
                                setPriceFilter('all');
                                dateFilter !== 'all' && setDateFilter('all');
                                setSearchTerm('');
                                handleCategoryClick('all');
                            }}
                            className="text-xs sm:text-sm font-bold text-sky-700 hover:text-sky-900 transition-colors cursor-pointer hover:underline"
                        >
                            {t('See all')}
                        </button>
                    </div>

                    {/* Empty State */}
                    {occasions.length === 0 ? (
                        <div className="p-8 text-center rounded-3xl bg-white/95 backdrop-blur-2xl border border-slate-100 shadow-[0_24px_50px_-12px_rgba(11,37,69,0.18),0_12px_24px_-6px_rgba(11,37,69,0.10)] max-w-md mx-auto my-8 space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-[#154F7C] flex items-center justify-center mx-auto border border-sky-200/80">
                                <Ticket className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-sm font-black text-slate-900 font-display">
                                    {t('no_occasions_title')}
                                </h3>
                                <p className="text-xs text-slate-500">
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
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#154F7C] to-[#327FB5] hover:from-[#1A5C91] hover:to-[#3D8EC7] text-white text-xs font-bold transition shadow-md shadow-[#154F7C]/25 cursor-pointer active:scale-95"
                            >
                                <span>{t('View All Occasions')}</span>
                            </button>
                        </div>
                    ) : (
                        /* 3. CARDS GRID: 2 Columns, matching Sign In & Register container depth & styling */
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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
                                            className="group bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100/90 hover:border-slate-200/90 p-5 sm:p-6 shadow-[0_16px_36px_-10px_rgba(11,37,69,0.10),0_4px_14px_-4px_rgba(11,37,69,0.05),0_0_1px_rgba(11,37,69,0.15)] hover:shadow-[0_24px_50px_-12px_rgba(11,37,69,0.16),0_10px_24px_-6px_rgba(11,37,69,0.08)] transition-all duration-300 flex items-stretch justify-between gap-4 sm:gap-6 cursor-pointer hover:-translate-y-0.5"
                                        >
                                            {/* Left Side: Title, Date, Venue, Starting Price */}
                                            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                                {/* Top group: Title + Date + Location */}
                                                <div className="space-y-3">
                                                    {/* Event Title */}
                                                    <h3 className="text-base sm:text-[17px] font-black text-slate-900 font-display tracking-tight leading-snug line-clamp-2 transition-colors">
                                                        {occasion.title}
                                                    </h3>

                                                    {/* Date & Location Group */}
                                                    <div className="space-y-2 text-[13px] sm:text-sm text-slate-500 font-normal">
                                                        {/* Date with Calendar Icon */}
                                                        {occasion.event_date && (
                                                            <div className="flex items-center gap-2.5">
                                                                <Calendar className="w-4 h-4 shrink-0 text-sky-600/70 group-hover:text-sky-600 stroke-[1.75] transition-colors" />
                                                                <span className="truncate">{occasion.event_date}{occasion.event_time ? `, ${occasion.event_time}` : ''}</span>
                                                            </div>
                                                        )}

                                                        {/* Venue / Location with MapPin Icon */}
                                                        {occasion.venue && (
                                                            <div className="flex items-center gap-2.5">
                                                                <MapPin className="w-4 h-4 shrink-0 text-sky-600/70 group-hover:text-sky-600 stroke-[1.75] transition-colors" />
                                                                <span className="truncate">{occasion.venue}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Bottom: Price anchored at bottom-left */}
                                                <div className="pt-4 mt-auto">
                                                    <div className="text-sm sm:text-[15px] font-black font-sans text-[#154F7C]">
                                                        {occasion.is_sold_out ? (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-500 border border-slate-200 text-xs uppercase font-bold">
                                                                {t('Sold Out')}
                                                            </span>
                                                        ) : occasion.min_price === 0 ? (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-sky-50 text-sky-800 border border-sky-200/80 font-black text-xs uppercase tracking-wide">
                                                                {t('Free')}
                                                            </span>
                                                        ) : (
                                                            `${currency} ${Number(occasion.min_price).toLocaleString()}`
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right Side: Portrait Poster Thumbnail matching attachment */}
                                            <div className="w-24 sm:w-28 md:w-32 self-stretch rounded-2xl overflow-hidden shrink-0 bg-slate-100 border border-slate-100/90 shadow-2xs relative">
                                                <img
                                                    src={cover}
                                                    alt={occasion.title}
                                                    onError={(e) => {
                                                        e.currentTarget.onerror = null;
                                                        e.currentTarget.src = '/images/categories/events.jpg';
                                                    }}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    loading="lazy"
                                                />
                                            </div>
                                        </Link>
                                    );
                                })}
                        </div>
                    )}

                    {/* ══════════════════════════════════════════════════════════════
                        ORGANIZER HOW IT WORKS CALLOUT BANNER
                       ══════════════════════════════════════════════════════════════ */}
                    <div className="mt-14 sm:mt-20 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#154F7C] via-[#1B5D91] to-[#0A2B47] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-sky-400/25">
                        <div className="space-y-1 text-center md:text-left">
                            <span className="text-xs font-bold text-sky-300 uppercase tracking-wider">
                                {lang === 'sw' ? 'Kwa Waandaaji wa Matukio' : 'For Event Organizers'}
                            </span>
                            <h3 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white">
                                {lang === 'sw' ? 'Unataka Kuuza Tiketi na Kardovo?' : 'Want to Sell Tickets on Kardovo?'}
                            </h3>
                            <p className="text-xs sm:text-sm text-sky-100 max-w-xl">
                                {lang === 'sw'
                                    ? 'Tazama jinsi mfumo wetu unavyofanya kazi: utengenezaji wa tiketi, malipo ya simu, ukaguzi wa mlangoni na usalama.'
                                    : 'Explore our complete organizer guide: multi-tier setup, instant mobile payments, gate scanning, and bulletproof security.'}
                            </p>
                        </div>
                        <Link
                            href={route('tickets.how-it-works')}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-[#154F7C] hover:bg-sky-50 text-xs sm:text-sm font-black transition-all shadow-md shrink-0 active:scale-95"
                        >
                            <span>{lang === 'sw' ? 'Jinsi Inavyofanya Kazi' : 'How It Works'}</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </main>
            </div>

            {/* ══════════════════════════════════════════════════════════════
                4. KARDOVO OFFICIAL FOOTER (Same as Landing Page)
               ══════════════════════════════════════════════════════════════ */}
            <KardovoFooter lang={lang} />

            {/* Translucent Sign In / Sign Up Modal */}
            <Modal show={showLoginModal} onClose={() => setShowLoginModal(false)} maxWidth="lg" closeable={true} translucent={true}>
                <div className="relative">
                    <button 
                        onClick={() => setShowLoginModal(false)}
                        className="absolute top-4 right-4 z-50 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all cursor-pointer border border-slate-200/80 shadow-2xs"
                        aria-label="Close modal"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <div className="max-h-[90vh] overflow-y-auto overflow-x-hidden custom-scrollbar">
                        <Login asModal={true} initialMode={authModalMode} />
                    </div>
                </div>
            </Modal>

            {/* Contact Us Modal - Variety of Options (WhatsApp, Phone, Email, Socials) */}
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
                        {/* 1. WhatsApp Option (Fastest response) */}
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
                            href="mailto:support@kardovo.com?subject=Kardovo%20Inquiry%20/%20Support"
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

                    {/* Social Media Follow Channels */}
                    <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-semibold">{lang === 'sw' ? 'Mitandao ya Kijamii:' : 'Follow Us On:'}</span>
                        <div className="flex items-center gap-2.5">
                            <a
                                href="https://instagram.com/kardovo"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Instagram"
                                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-pink-50 hover:text-pink-600 dark:bg-white/10 dark:hover:bg-pink-500/20 dark:hover:text-pink-300 flex items-center justify-center text-slate-600 dark:text-slate-200 transition-colors shadow-2xs cursor-pointer"
                            >
                                <InstagramIcon className="w-4 h-4" />
                            </a>
                            <a
                                href="https://facebook.com/kardovo"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Facebook"
                                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-600 dark:bg-white/10 dark:hover:bg-blue-500/20 dark:hover:text-blue-300 flex items-center justify-center text-slate-600 dark:text-slate-200 transition-colors shadow-2xs cursor-pointer"
                            >
                                <FacebookIcon className="w-4 h-4" />
                            </a>
                            <a
                                href="https://wa.me/255737672987"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="WhatsApp"
                                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-600 dark:bg-white/10 dark:hover:bg-emerald-500/20 dark:hover:text-emerald-300 flex items-center justify-center text-slate-600 dark:text-slate-200 transition-colors shadow-2xs cursor-pointer"
                            >
                                <WhatsAppIcon className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
