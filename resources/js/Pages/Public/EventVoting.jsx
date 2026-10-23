import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { 
    Trophy, Search, Clock, Calendar, MapPin, Share2, 
    Check, ChevronDown, ChevronUp, User, Phone, Globe, 
    MessageCircle, Menu, X, ArrowLeft, Home as HomeIcon 
} from 'lucide-react';
import KardovoLogo from '@/Components/KardovoLogo';
import VotingModal from '@/Components/VotingModal';
import KardovoFooter, { WhatsAppIcon } from '@/Components/KardovoFooter';
import Modal from '@/Components/Modal';

function calculateTimeLeft(targetDate) {
    if (!targetDate) {
        return { days: '16', hours: '03', minutes: '12', seconds: '09', isPast: false };
    }
    const diff = new Date(targetDate).getTime() - Date.now();
    if (diff <= 0) {
        return { days: '00', hours: '00', minutes: '00', seconds: '00', isPast: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24)).toString().padStart(2, '0');
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24).toString().padStart(2, '0');
    const minutes = Math.floor((diff / (1000 * 60)) % 60).toString().padStart(2, '0');
    const seconds = Math.floor((diff / 1000) % 60).toString().padStart(2, '0');

    return { days, hours, minutes, seconds, isPast: false };
}

export default function EventVoting({ event, categories = [], stats = {} }) {
    const { auth } = usePage().props;

    // Language state
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

    // Accordion: which categories are expanded. Default first category open like Tukiio.
    const [expandedCategories, setExpandedCategories] = useState(() => {
        const initial = {};
        if (categories.length > 0) {
            initial[categories[0].id] = true;
        }
        return initial;
    });

    const toggleCategory = (catId) => {
        setExpandedCategories(prev => ({
            ...prev,
            [catId]: !prev[catId]
        }));
    };

    // Countdown timer
    const countdownTarget = event.voting_end_at || event.event_date;
    const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(countdownTarget));

    useEffect(() => {
        if (!countdownTarget) return;
        const interval = setInterval(() => {
            setTimeLeft(calculateTimeLeft(countdownTarget));
        }, 1000);
        return () => clearInterval(interval);
    }, [countdownTarget]);

    // Voting modal state
    const [activeVoteModal, setActiveVoteModal] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [targetCategory, setTargetCategory] = useState(null);
    const [copiedCandidateId, setCopiedCandidateId] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);

    const handleOpenVote = (candidate, category) => {
        setSelectedCandidate(candidate);
        setTargetCategory(category);
        setActiveVoteModal(true);
    };

    const handleCopyShare = (candId) => {
        const link = window.location.origin + `/vote-for-me/${event.id}/${candId}`;
        navigator.clipboard.writeText(link);
        setCopiedCandidateId(candId);
        setTimeout(() => setCopiedCandidateId(null), 2500);
    };

    const onVoteSuccess = () => {
        router.reload({ only: ['categories', 'stats'] });
    };

    // Organizer phone fallback
    const organizerPhone = event.user?.phone || '+255 717 651 601';

    return (
        <div className="min-h-screen bg-[#FDFDFD] dark:bg-[#07172B] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-[#154F7C] selection:text-white">
            <Head title={`${event.title} — ${lang === 'sw' ? 'Kura & Tuzo' : 'Official Voting Portal'}`} />

            {/* ══════════════════════════════════════════════════════════════
                1. UNIFORM PUBLIC HEADER (Matching Kardovo Standards)
               ══════════════════════════════════════════════════════════════ */}
            <header className="sticky top-0 z-50 w-full bg-white/90 dark:bg-[#07111E]/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/10 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6 text-slate-800 dark:text-slate-100">
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
                2. MAIN EVENT VOTING EXPERIENCE (Exact Tukiio Structure)
               ══════════════════════════════════════════════════════════════ */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex-1 w-full space-y-8">
                {/* Back to all competitions link */}
                <div>
                    <Link
                        href={route('voting.index')}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>{lang === 'sw' ? 'Mashindano Yote ya Kura' : 'All Voting Competitions'}</span>
                    </Link>
                </div>

                {/* Wide Event Poster Banner (matching tukiio rounded aspect-[21/9]) */}
                <div className="w-full aspect-[21/9] sm:aspect-[21/8] bg-slate-100 dark:bg-slate-800 rounded-3xl overflow-hidden shadow-xs border border-slate-200/80 dark:border-slate-800 relative">
                    {event.voting_banner || event.cover_image ? (
                        <img
                            src={event.voting_banner || event.cover_image}
                            alt={event.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#154F7C] to-[#2573AB] text-white p-6 text-center">
                            <Trophy className="w-16 h-16 sm:w-20 sm:h-20 text-[#FFC50B] mb-2 drop-shadow-md" />
                            <h2 className="text-xl sm:text-2xl font-black">{event.title}</h2>
                        </div>
                    )}
                </div>

                {/* Centered Event Header & Countdown (exact tukiio style) */}
                <div className="text-center space-y-4 pt-2">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        {event.title}
                    </h1>

                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
                        {event.description || `${event.city || 'Tanzania'} · Official Contestant Voting`}
                    </p>

                    {/* "Voting Close In" text */}
                    <div className="pt-2">
                        <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                            {lang === 'sw' ? 'Kura Zinafungwa Ndani Ya' : 'Voting Close In'}
                        </div>

                        {/* 4 Countdown Blocks: DAYS / HRS / MIN / SEC */}
                        <div className="flex items-center justify-center gap-2.5 sm:gap-4 mt-3">
                            {/* Days */}
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 dark:bg-slate-800/90 rounded-2xl flex flex-col items-center justify-center border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
                                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-none">
                                    {timeLeft.days}
                                </span>
                                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mt-1 tracking-wider">
                                    {lang === 'sw' ? 'SIKU' : 'DAYS'}
                                </span>
                            </div>

                            {/* Hours */}
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 dark:bg-slate-800/90 rounded-2xl flex flex-col items-center justify-center border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
                                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-none">
                                    {timeLeft.hours}
                                </span>
                                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mt-1 tracking-wider">
                                    {lang === 'sw' ? 'MASAA' : 'HRS'}
                                </span>
                            </div>

                            {/* Minutes */}
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 dark:bg-slate-800/90 rounded-2xl flex flex-col items-center justify-center border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
                                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-none">
                                    {timeLeft.minutes}
                                </span>
                                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mt-1 tracking-wider">
                                    {lang === 'sw' ? 'DAKIKA' : 'MIN'}
                                </span>
                            </div>

                            {/* Seconds */}
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 dark:bg-slate-800/90 rounded-2xl flex flex-col items-center justify-center border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
                                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-none">
                                    {timeLeft.seconds}
                                </span>
                                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mt-1 tracking-wider">
                                    {lang === 'sw' ? 'SEK' : 'SEC'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ══════════════════════════════════════════════════════════════
                    3. AWARD CATEGORIES (Exact Accordion Structure from Tukiio)
                   ══════════════════════════════════════════════════════════════ */}
                <section className="space-y-4 pt-4">
                    <h2 className="text-center text-sm sm:text-base font-black tracking-widest uppercase text-slate-900 dark:text-white">
                        {lang === 'sw' ? 'VIPENGELE VYA TUZO' : 'AWARD CATEGORIES'}
                    </h2>

                    {categories.length === 0 ? (
                        <div className="py-12 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-6">
                            <Trophy className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                                {lang === 'sw' ? 'Hakuna vipengele vilivyoongezwa bado.' : 'No award categories added yet.'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {categories.map((category) => {
                                const isExpanded = !!expandedCategories[category.id];
                                const candidateList = category.candidates || [];

                                return (
                                    <div
                                        key={category.id}
                                        className="bg-[#F8FAFC] dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs transition-all duration-200"
                                    >
                                        {/* Category Header Row */}
                                        <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-black text-sm sm:text-base tracking-wide uppercase text-slate-900 dark:text-white">
                                                    {category.name}
                                                </h3>
                                                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                                    ({candidateList.length})
                                                </span>
                                            </div>

                                            {/* Action Button: Vote (if closed) or Close (if open) */}
                                            <button
                                                type="button"
                                                onClick={() => toggleCategory(category.id)}
                                                className={`px-5 sm:px-6 py-2 rounded-full font-bold text-xs sm:text-sm transition cursor-pointer active:scale-95 ${
                                                    isExpanded
                                                        ? 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                                                        : 'bg-gradient-to-r from-[#154F7C] to-[#327FB5] hover:from-[#1A5C91] hover:to-[#3D8EC7] text-white shadow-md shadow-[#154F7C]/20 border border-sky-400/25'
                                                }`}
                                            >
                                                {isExpanded 
                                                    ? (lang === 'sw' ? 'Funga' : 'Close') 
                                                    : (lang === 'sw' ? 'Piga Kura' : 'Vote')}
                                            </button>
                                        </div>

                                        {/* Expanded Candidates List */}
                                        {isExpanded && (
                                            <div className="border-t border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900/50 divide-y divide-slate-100 dark:divide-slate-800/80">
                                                {candidateList.length === 0 ? (
                                                    <div className="py-8 text-center text-xs text-slate-400">
                                                        {lang === 'sw' ? 'Hakuna washiriki katika kipengele hiki bado.' : 'No candidates in this category yet.'}
                                                    </div>
                                                ) : (
                                                    candidateList.map((cand) => (
                                                        <div
                                                            key={cand.id}
                                                            className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition"
                                                        >
                                                            {/* Candidate Avatar & Name */}
                                                            <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                                                                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                                                                    {cand.photo_url ? (
                                                                        <img
                                                                            src={cand.photo_url}
                                                                            alt={cand.name}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#154F7C] to-[#2573AB] text-white font-black text-xl">
                                                                            {cand.name.charAt(0)}
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div className="min-w-0">
                                                                    <div className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white uppercase truncate">
                                                                        {cand.name}
                                                                    </div>
                                                                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mt-0.5 truncate">
                                                                        {category.name}
                                                                    </div>
                                                                    {event.voting_visible_tallies && (
                                                                        <div className="text-[11px] font-bold text-[#154F7C] dark:text-sky-400 mt-0.5">
                                                                            {Number(cand.total_votes || 0).toLocaleString()} {lang === 'sw' ? 'kura' : 'votes'}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Action Buttons: Vote + Share */}
                                                            <div className="flex items-center gap-2 shrink-0">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleOpenVote(cand, category)}
                                                                    className="px-4 sm:px-5 py-2 rounded-full bg-gradient-to-r from-[#154F7C] to-[#327FB5] hover:from-[#1A5C91] hover:to-[#3D8EC7] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#154F7C]/20 border border-sky-400/25 transition active:scale-95 cursor-pointer"
                                                                >
                                                                    {lang === 'sw' ? 'Piga Kura' : 'Vote'}
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleCopyShare(cand.id)}
                                                                    className="px-3.5 sm:px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm transition cursor-pointer flex items-center gap-1.5"
                                                                    title={lang === 'sw' ? 'Shiriki kiungo cha mshiriki huyu' : 'Share direct nominee voting link'}
                                                                >
                                                                    {copiedCandidateId === cand.id ? (
                                                                        <>
                                                                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                                                                            <span className="text-emerald-600 dark:text-emerald-400">{lang === 'sw' ? 'Imenakiliwa' : 'Copied'}</span>
                                                                        </>
                                                                    ) : (
                                                                        <span>{lang === 'sw' ? 'Shiriki' : 'Share'}</span>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* ══════════════════════════════════════════════════════════════
                    4. CONTACT ORGANIZER (Exact Tukiio Footer Feature)
                   ══════════════════════════════════════════════════════════════ */}
                <div className="pt-8 border-t border-slate-200/80 dark:border-slate-800 text-center space-y-2">
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
                        {event.title}
                    </h4>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        {lang === 'sw' ? 'Wasiliana na Mwandaaji' : 'Contact Organizer'}
                    </p>
                    <div className="pt-1 flex items-center justify-center gap-3">
                        <a
                            href={`tel:${organizerPhone}`}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs transition"
                        >
                            <Phone className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                            <span>{organizerPhone}</span>
                        </a>

                        <a
                            href={`https://wa.me/${organizerPhone.replace(/[^0-9]/g, '')}?text=Habari,%20nahitaji%20maelezo%20kuhusu%20${encodeURIComponent(event.title)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-200/60 dark:border-emerald-500/30 transition"
                        >
                            <WhatsAppIcon className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                        </a>
                    </div>
                </div>
            </main>

            {/* Voting Modal */}
            <VotingModal
                isOpen={activeVoteModal}
                onClose={() => setActiveVoteModal(false)}
                event={event}
                category={targetCategory}
                candidate={selectedCandidate}
                onSuccess={onVoteSuccess}
            />

            {/* Support Modal */}
            <Modal show={showContactModal} onClose={() => setShowContactModal(false)} maxWidth="md" closeable={true} translucent={true}>
                <div className="relative p-6 sm:p-8 bg-white dark:bg-[#0B2545] rounded-3xl text-slate-800 dark:text-white shadow-2xl">
                    <button 
                        type="button"
                        onClick={() => setShowContactModal(false)}
                        className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-300 cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sky-100 dark:bg-[#154F7C]/40 text-[#154F7C] dark:text-sky-300 mb-3.5">
                            <MessageCircle className="w-7 h-7" />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black">
                            {lang === 'sw' ? 'Wasiliana Nasi' : 'Contact Support'}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-300 mt-1">
                            {lang === 'sw' ? 'Tuko hapa kukusaidia saa 24/7.' : 'We are here to assist 24/7.'}
                        </p>
                    </div>
                    <div className="space-y-3">
                        <a
                            href="https://wa.me/255737672987?text=Habari%20Kardovo,%20nahitaji%20msaada%20wa%20kura."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 text-emerald-800 dark:text-emerald-300 font-bold text-sm"
                        >
                            <span>WhatsApp: +255 737 672 987</span>
                        </a>
                        <a
                            href="tel:+255737672987"
                            className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-bold text-sm"
                        >
                            <span>Call: +255 737 672 987</span>
                        </a>
                    </div>
                </div>
            </Modal>

            {/* Standard Kardovo Footer */}
            <KardovoFooter lang={lang} />
        </div>
    );
}
