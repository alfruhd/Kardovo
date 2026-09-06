import React, { useState, useEffect, useRef } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { 
    Calendar, 
    Users, 
    Palette, 
    MessageSquare, 
    QrCode, 
    Shield, 
    LogOut, 
    Menu, 
    X, 
    Plus, 
    CheckCircle2, 
    AlertCircle,
    User as UserIcon,
    ChevronRight,
    ChevronLeft,
    ChevronDown,
    Settings,
    Key,
    Lock,
    ShieldCheck,
    Sparkles,
    Building2,
    Smartphone,
    Sun,
    Moon,
    CircleDollarSign,
    TrendingUp,
    LayoutDashboard
} from 'lucide-react';
import KardovoLogo from '@/Components/KardovoLogo';
import { useTheme } from '@/Hooks/useTheme';

export default function KardovoAppLayout({ children, title, headerActions }) {
    const { auth, flash } = usePage().props;
    const user = auth?.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('kardovo_sidebar_collapsed') === 'true';
        }
        return false;
    });
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [toast, setToast] = useState(null);
    const dropdownRef = useRef(null);

    // Smart Dynamic Auto-Hiding Topbar Logic
    const [headerVisible, setHeaderVisible] = useState(true);
    const [isHoveringTop, setIsHoveringTop] = useState(false);
    const lastScrollY = useRef(0);
    const hideTimerRef = useRef(null);

    const { theme, isDark, toggleTheme } = useTheme();

    const toggleSidebarCollapse = () => {
        setSidebarCollapsed((prev) => {
            const next = !prev;
            if (typeof window !== 'undefined') {
                localStorage.setItem('kardovo_sidebar_collapsed', next.toString());
            }
            return next;
        });
    };

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Always show when at the very top of the page
            if (currentScrollY < 15) {
                setHeaderVisible(true);
                if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
                lastScrollY.current = currentScrollY;
                return;
            }

            // Scrolling UP -> Reappear immediately
            if (currentScrollY < lastScrollY.current - 4) {
                setHeaderVisible(true);
                if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
                // Keep visible for a couple of seconds after scrolling up then auto-hide if inactive
                hideTimerRef.current = setTimeout(() => {
                    if (!isHoveringTop && window.scrollY > 40) {
                        setHeaderVisible(false);
                    }
                }, 2800);
            } 
            // Scrolling DOWN -> Reappear briefly on start of scroll, then auto-disappear after 1.8 seconds
            else if (currentScrollY > lastScrollY.current + 4) {
                setHeaderVisible(true);
                if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
                hideTimerRef.current = setTimeout(() => {
                    if (!isHoveringTop && window.scrollY > 40) {
                        setHeaderVisible(false);
                    }
                }, 1800);
            }

            lastScrollY.current = currentScrollY;
        };

        const handleMouseMove = (e) => {
            // Hovering at the top of the screen (top 65px) -> Reappear immediately
            if (e.clientY <= 65) {
                setIsHoveringTop(true);
                setHeaderVisible(true);
                if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
            } else if (e.clientY > 80 && isHoveringTop) {
                setIsHoveringTop(false);
                if (window.scrollY > 40) {
                    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
                    hideTimerRef.current = setTimeout(() => {
                        setHeaderVisible(false);
                    }, 1800);
                }
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('mousemove', handleMouseMove, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('mousemove', handleMouseMove);
            if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        };
    }, [isHoveringTop]);

    useEffect(() => {
        if (flash?.success) {
            setToast({ type: 'success', message: flash.success });
            const timer = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(timer);
        } else if (flash?.warning) {
            setToast({ type: 'warning', message: flash.warning });
            const timer = setTimeout(() => setToast(null), 6000);
            return () => clearTimeout(timer);
        } else if (flash?.error) {
            setToast({ type: 'error', message: flash.error });
            const timer = setTimeout(() => setToast(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setUserDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isAdmin = user?.role === 'admin' || user?.is_admin;
    const isSubAdmin = user?.role === 'sub_admin' || user?.is_sub_admin;
    const isScanner = user?.role === 'scanner';
    const isSuspended = user?.status === 'suspended';
    const perms = user?.effective_permissions || {};

    const currentUrl = typeof window !== 'undefined' ? window.location.pathname : '';

    const navItems = [
        {
            name: 'Dashboard',
            href: route('dashboard'),
            icon: LayoutDashboard,
            active: currentUrl === '/dashboard',
            show: !isAdmin && !isScanner,
        },
        {
            name: 'Admin Portal',
            href: route('admin.dashboard'),
            icon: Shield,
            active: (currentUrl === '/admin' || currentUrl.startsWith('/admin')) && !currentUrl.startsWith('/admin/finance'),
            show: isAdmin || isSubAdmin,
        },
        {
            name: 'Card Templates',
            href: route('templates.index'),
            icon: Palette,
            active: currentUrl.startsWith('/templates'),
            show: !isScanner && (isAdmin || isSubAdmin || (!isSuspended && perms.can_customize_templates !== false)),
        },
        {
            name: isAdmin ? 'All Events' : 'My Events',
            href: route('events.index'),
            icon: Calendar,
            active: currentUrl === '/events' || currentUrl.startsWith('/events'),
            show: !isScanner,
        },
        {
            name: 'Messaging Hub',
            href: route('messaging.index'),
            icon: MessageSquare,
            active: currentUrl.startsWith('/messaging'),
            show: !isScanner && (isAdmin || isSubAdmin || (!isSuspended && perms.can_send_broadcasts !== false)),
        },
        {
            name: 'Gate Scanner',
            href: route('scanner.index'),
            icon: QrCode,
            active: currentUrl.startsWith('/scanner'),
            show: isScanner || isAdmin || isSubAdmin || (!isSuspended && perms.can_manage_scanners !== false),
        },
        {
            name: 'Financial Analysis',
            href: route('admin.finance'),
            icon: CircleDollarSign,
            active: currentUrl.startsWith('/admin/finance'),
            show: isAdmin,
        },
        {
            name: 'Account Profile',
            href: route('profile.edit'),
            icon: UserIcon,
            active: currentUrl.startsWith('/profile'),
            show: true,
        },
    ].filter(item => item.show);

    return (
        <div className="min-h-screen bg-[#F1F5F9] dark:bg-[#060C16] flex flex-col md:flex-row text-slate-800 dark:text-slate-100 font-sans antialiased selection:bg-cyan-500 selection:text-white transition-colors duration-200">
            
            {/* 📱 MOBILE TWO-DECK SYSTEM */}
            <div className="md:hidden sticky top-0 z-40 bg-white/95 dark:bg-[#0B1524]/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/[0.08] shadow-xs transition-colors duration-200">
                {/* 1. TOP DECK: Global Navigation, Brand, Theme & Profile */}
                <div className="px-3.5 h-[60px] flex items-center justify-between border-b border-slate-200/70 dark:border-white/[0.06]">
                    {/* Left: Menu Button & Brand */}
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="w-10 h-10 rounded-2xl flex items-center justify-center bg-slate-100/80 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] border border-slate-200/90 dark:border-white/[0.08] text-slate-800 dark:text-slate-100 shadow-2xs active:scale-90 transition-all duration-200 cursor-pointer"
                            aria-label="Open Navigation Menu"
                        >
                            {sidebarOpen ? (
                                <X className="w-4.5 h-4.5 text-rose-600 dark:text-rose-400" />
                            ) : (
                                <Menu className="w-4.5 h-4.5" />
                            )}
                        </button>

                        <Link href="/dashboard" className="flex items-center">
                            <KardovoLogo light={isDark} showText={true} size="lg" imgClassName="h-9 w-9" />
                        </Link>
                    </div>

                    {/* Right: Theme Toggle & Avatar */}
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={toggleTheme}
                            className="w-10 h-10 rounded-2xl flex items-center justify-center bg-slate-100/80 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] border border-slate-200/90 dark:border-white/[0.08] text-slate-700 dark:text-amber-400 shadow-2xs active:scale-90 transition-all duration-200 cursor-pointer"
                            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            {isDark ? (
                                <Sun className="w-4.5 h-4.5 text-amber-400" />
                            ) : (
                                <Moon className="w-4.5 h-4.5 text-cyan-600" />
                            )}
                        </button>

                        <Link
                            href={route('profile.edit')}
                            className="w-10 h-10 rounded-2xl overflow-hidden border border-slate-200/90 dark:border-white/[0.08] text-slate-800 dark:text-slate-100 flex items-center justify-center font-bold text-xs shadow-2xs bg-slate-100/80 dark:bg-white/[0.06] active:scale-90 transition-all duration-200"
                            title="User Profile"
                        >
                            {user?.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="font-extrabold text-sm">{user?.name?.charAt(0) || 'U'}</span>
                            )}
                        </Link>
                    </div>
                </div>

                {/* 2. BELOW DECK: Context Page Title & Function Action Buttons */}
                <div className="px-3.5 py-2.5 flex items-center justify-between gap-2 min-h-[44px] bg-slate-50/80 dark:bg-[#07111D]/90 border-b border-slate-200/70 dark:border-white/[0.06]">
                    <div className="min-w-0 flex-1 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400 flex-shrink-0 animate-pulse" />
                        <h1 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-display truncate">
                            {title || 'Dashboard'}
                        </h1>
                    </div>

                    {headerActions && (
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                            {headerActions}
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar Navigation */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 bg-gradient-to-b from-[#F8FAFC] via-white to-[#F0F4FA] dark:from-[#091424] dark:via-[#070E1A] dark:to-[#050B14] text-slate-700 dark:text-slate-200 flex flex-col justify-between transition-all duration-300 ease-in-out border-r border-slate-200/90 dark:border-cyan-500/20 shadow-[0_4px_30px_rgba(0,100,220,0.04)] dark:shadow-[0_4px_40px_rgba(0,0,0,0.8)]
                md:sticky md:top-0 md:h-screen md:translate-x-0 md:flex-shrink-0
                ${sidebarCollapsed ? 'md:w-20' : 'md:w-64'}
                ${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'}
            `}>
                <div>
                    <button
                        type="button"
                        onClick={toggleSidebarCollapse}
                        className="hidden md:flex absolute -right-3.5 top-6 z-50 w-7 h-7 rounded-full bg-white dark:bg-[#0A1A2E] border border-slate-300 dark:border-cyan-400/60 text-slate-600 dark:text-cyan-300 hover:text-cyan-600 dark:hover:text-white hover:bg-cyan-50 dark:hover:bg-cyan-600 hover:border-cyan-400 shadow-md items-center justify-center transition-all duration-200 active:scale-90"
                        title={sidebarCollapsed ? "Expand Sidebar Menu" : "Collapse / Hide Sidebar Menu"}
                    >
                        {sidebarCollapsed ? (
                            <ChevronRight className="w-4 h-4" />
                        ) : (
                            <ChevronLeft className="w-4 h-4" />
                        )}
                    </button>

                    {/* Brand Logo in Sidebar */}
                    <div className={`p-4 border-b border-slate-200/90 dark:border-cyan-500/20 flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
                        <Link href="/dashboard" className="flex items-center">
                            <KardovoLogo light={isDark} showText={!sidebarCollapsed} size="md" />
                        </Link>
                    </div>

                    {user?.company && !sidebarCollapsed && (
                        <div className="px-4 pt-3.5 pb-1">
                            <div className="text-xs sm:text-[12.5px] font-semibold text-slate-700 dark:text-slate-200 truncate" title={user.company}>
                                {user.company}
                            </div>
                        </div>
                    )}

                    {/* Navigation Links with High-End Active Styling */}
                    <nav className="p-3 space-y-1.5 flex-1">
                        {!sidebarCollapsed && (
                            <div className="text-[10px] uppercase font-mono font-bold tracking-widest text-cyan-700 dark:text-cyan-400 px-3 mb-2 flex items-center gap-1.5">
                                <span className="w-1 h-1 rounded-full bg-cyan-500 dark:bg-cyan-400 dark:shadow-[0_0_6px_rgba(0,210,255,0.8)]" />
                                <span>Platform Navigation</span>
                            </div>
                        )}
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    title={sidebarCollapsed ? item.name : undefined}
                                    className={`
                                        flex items-center ${sidebarCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3.5 py-2.5'} rounded-xl text-xs font-semibold transition-all duration-150 relative group active:scale-[0.98]
                                        ${item.active 
                                            ? 'bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-transparent text-cyan-950 dark:bg-gradient-to-r dark:from-cyan-500/20 dark:via-blue-600/15 dark:to-transparent dark:text-cyan-300 font-black border border-cyan-500/30 dark:border-cyan-400/40 shadow-[0_2px_10px_rgba(0,163,255,0.12)] dark:shadow-[0_0_20px_rgba(0,163,255,0.15)] dark:ring-1 dark:ring-cyan-400/25' 
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-gradient-to-r hover:from-slate-100 hover:to-cyan-50/40 hover:text-cyan-900 dark:hover:bg-gradient-to-r dark:hover:from-white/[0.07] dark:hover:to-cyan-950/25 dark:hover:text-cyan-200 border border-transparent dark:hover:border-cyan-500/20'}
                                    `}
                                >
                                    {/* Active Indicator Accent Bar */}
                                    {item.active && (
                                        <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-4.5 bg-gradient-to-b from-cyan-500 to-blue-600 dark:from-cyan-400 dark:to-blue-500 rounded-full shadow-[0_0_8px_rgba(0,163,255,0.8)] dark:shadow-[0_0_12px_rgba(0,210,255,1)]" />
                                    )}
                                    <Icon className={`w-4 h-4 transition-colors duration-150 flex-shrink-0 ${item.active ? 'text-cyan-600 dark:text-cyan-400 dark:drop-shadow-[0_0_8px_rgba(0,210,255,0.6)]' : 'text-slate-400 dark:text-slate-500 group-hover:text-cyan-600 dark:group-hover:text-cyan-400'}`} />
                                    {!sidebarCollapsed && <span className="truncate">{item.name}</span>}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-3 border-t border-slate-200/90 dark:border-cyan-500/20 bg-gradient-to-b from-white/90 to-slate-100/90 dark:from-[#08111E]/95 dark:to-[#050A14]/98 flex-shrink-0 space-y-2 transition-colors duration-200">
                    {/* User Profile Card with Padlock */}
                    <Link
                        href={route('profile.edit')}
                        onClick={() => setSidebarOpen(false)}
                        title={sidebarCollapsed ? user?.name : undefined}
                        className={`flex items-center ${sidebarCollapsed ? 'justify-center p-1.5' : 'justify-between p-2'} rounded-2xl hover:bg-white dark:hover:bg-cyan-950/30 transition group border border-transparent hover:border-slate-200/90 dark:hover:border-cyan-500/30 shadow-2xs hover:shadow-xs`}
                    >
                        <div className="flex items-center gap-2.5 truncate min-w-0">
                            <div className="relative flex-shrink-0">
                                {user?.avatar ? (
                                    <div className="w-8 h-8 rounded-xl overflow-hidden shadow-md group-hover:ring-2 group-hover:ring-cyan-500/40 dark:group-hover:ring-cyan-400/60 transition bg-slate-100 dark:bg-slate-800">
                                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.08] text-slate-800 dark:text-slate-100 flex items-center justify-center font-bold font-mono text-xs shadow-2xs">
                                        {user?.name?.charAt(0) || 'U'}
                                    </div>
                                )}
                            </div>
                            {!sidebarCollapsed && (
                                <div className="truncate">
                                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition flex items-center gap-1.5">
                                        <span className="truncate">{user?.name}</span>
                                    </div>
                                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono capitalize truncate flex items-center gap-1">
                                        <span>{user?.role}</span>
                                        {user?.gate_label ? <span>• {user.gate_label.split('—')[0]}</span> : ''}
                                    </div>
                                </div>
                            )}
                        </div>

                        {!sidebarCollapsed && (
                            <Settings className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition" />
                        )}
                    </Link>

                    {/* Bottom Sign Out Button */}
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        onClick={() => setSidebarOpen(false)}
                        title={sidebarCollapsed ? "Sign Out of Platform" : undefined}
                        className={`
                            w-full flex items-center ${sidebarCollapsed ? 'justify-center p-2' : 'justify-center gap-2 py-2 px-3'} rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/50 text-rose-700 hover:text-rose-900 dark:text-rose-300 dark:hover:text-rose-200 border border-rose-200 hover:border-rose-300 dark:border-rose-800/40 dark:hover:border-rose-700/60 shadow-2xs cursor-pointer
                        `}
                    >
                        <LogOut className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 flex-shrink-0" />
                        {!sidebarCollapsed && <span>Sign Out</span>}
                    </Link>
                </div>
            </aside>

            {/* Sidebar Mobile Backdrop */}
            {sidebarOpen && (
                <div 
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-slate-950/70 z-40 md:hidden backdrop-blur-xs transition-opacity"
                />
            )}

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 relative">
                
                {/* Top Edge Hover Trigger Strip (Detects hover at the very top of the window) */}
                <div 
                    onMouseEnter={() => {
                        setIsHoveringTop(true);
                        setHeaderVisible(true);
                        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
                    }}
                    className="fixed top-0 left-0 right-0 h-4 z-50 pointer-events-auto"
                />

                {/* Minimalist, Clean & Professional Sticky Topbar */}
                <header 
                    onMouseEnter={() => {
                        setIsHoveringTop(true);
                        setHeaderVisible(true);
                        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
                    }}
                    onMouseLeave={() => {
                        setIsHoveringTop(false);
                        if (window.scrollY > 40) {
                            if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
                            hideTimerRef.current = setTimeout(() => {
                                setHeaderVisible(false);
                            }, 1800);
                        }
                    }}
                    className={`hidden md:flex h-14 bg-white/90 dark:bg-[#070E1A]/90 backdrop-blur-2xl backdrop-saturate-180 border-b border-slate-200/90 dark:border-cyan-500/15 shadow-[0_4px_20px_rgba(0,100,220,0.03)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.6)] sticky top-0 z-40 px-4 sm:px-6 items-center justify-between gap-4 transition-all duration-300 ease-in-out ${
                        headerVisible 
                            ? "translate-y-0 opacity-100 pointer-events-auto" 
                            : "-translate-y-full opacity-0 pointer-events-none"
                    }`}
                >
                    {/* Left: Minimalist Breadcrumb & Section Title */}
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="flex items-center gap-1.5 text-xs font-extrabold text-cyan-600 dark:text-cyan-400 select-none">
                            <span>Kardovo</span>
                            <span className="text-slate-300 dark:text-slate-600">/</span>
                        </div>
                        <h1 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight truncate font-display">
                            {title || "Dashboard"}
                        </h1>
                    </div>

                    {/* Right: Actions, Theme Toggle & User Menu */}
                    <div className="flex items-center gap-2">
                        {headerActions && (
                            <div className="flex items-center gap-1.5">
                                {headerActions}
                            </div>
                        )}

                        {/* Minimalist Theme Mode Toggle */}
                        <button
                            type="button"
                            onClick={toggleTheme}
                            className="w-8 h-8 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition flex items-center justify-center cursor-pointer"
                            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        >
                            {isDark ? (
                                <Sun className="w-4 h-4 text-amber-400" />
                            ) : (
                                <Moon className="w-4 h-4 text-cyan-600" />
                            )}
                        </button>

                        <div className="h-4 w-px bg-slate-200 dark:bg-white/[0.08] mx-0.5" />

                        {/* Minimalist User Profile Dropdown Pill with Padlock */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                type="button"
                                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                className="flex items-center gap-2 py-1 px-1.5 sm:pr-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06] transition cursor-pointer select-none group"
                            >
                                <div className="relative flex-shrink-0">
                                    {user?.avatar ? (
                                        <div className="w-7 h-7 rounded-lg overflow-hidden shadow-xs bg-slate-100 dark:bg-slate-800">
                                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.08] text-slate-800 dark:text-slate-100 flex items-center justify-center font-bold font-mono text-xs shadow-2xs">
                                            {user?.name?.charAt(0) || "U"}
                                        </div>
                                    )}
                                </div>
                                <div className="hidden sm:flex items-center gap-1.5 max-w-[140px]">
                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
                                        {user?.name}
                                    </span>
                                </div>
                                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${userDropdownOpen ? "rotate-180" : ""}`} />
                            </button>

                            {/* Refined Dropdown Menu */}
                            {userDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-60 bg-white/95 dark:bg-[#0B1524]/95 backdrop-blur-2xl rounded-2xl shadow-xl border border-slate-200/80 dark:border-white/[0.08] py-1.5 z-50 animate-fadeIn text-xs">
                                    <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-white/[0.08]">
                                        <div className="font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                                            <span className="truncate">{user?.name}</span>
                                        </div>
                                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-mono mt-0.5">{user?.email}</div>
                                        <div className="mt-1.5 flex items-center justify-between gap-1.5">
                                            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-white/[0.08]">
                                                {user?.role}
                                            </span>
                                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400">
                                                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                                                <span>{user?.status === 'suspended' ? 'Suspended' : 'Governed'}</span>
                                            </span>
                                        </div>
                                    </div>

                                    <div className="py-1">
                                        <Link
                                            href={route("profile.edit")}
                                            onClick={() => setUserDropdownOpen(false)}
                                            className="flex items-center gap-2.5 px-3.5 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.06] font-medium transition"
                                        >
                                            <UserIcon className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                                            <span>Manage Profile</span>
                                        </Link>

                                        <Link
                                            href={route("profile.edit")}
                                            onClick={() => setUserDropdownOpen(false)}
                                            className="flex items-center gap-2.5 px-3.5 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.06] font-medium transition"
                                        >
                                            <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                            <span>Security &amp; Password</span>
                                        </Link>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                toggleTheme();
                                                setUserDropdownOpen(false);
                                            }}
                                            className="w-full flex items-center justify-between px-3.5 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.06] font-medium transition text-left cursor-pointer"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-cyan-600" />}
                                                <span>Theme Mode</span>
                                            </div>
                                            <span className="text-[10.5px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.1] text-slate-600 dark:text-slate-300">
                                                {isDark ? "Dark" : "Light"}
                                            </span>
                                        </button>
                                    </div>

                                    <div className="border-t border-slate-100 dark:border-white/[0.08] pt-1 mt-1">
                                        <Link
                                            href={route("logout")}
                                            method="post"
                                            as="button"
                                            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold transition text-left cursor-pointer"
                                        >
                                            <LogOut className="w-3.5 h-3.5" />
                                            <span>Sign Out</span>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Account Suspension Banner */}
                {user?.status === 'suspended' && (
                    <div className="px-6 pt-4">
                        <div className="p-4 rounded-2xl flex items-center justify-between border bg-rose-50 dark:bg-rose-950/70 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-800/80 shadow-md">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-rose-200/60 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-xs font-black uppercase tracking-wider font-mono">
                                        Account Suspended by System Administration
                                    </div>
                                    <div className="text-xs font-medium text-rose-700 dark:text-rose-300 mt-0.5">
                                        Your organizer portal activities, guest imports, broadcast campaigns, and studio customization privileges are currently locked. Contact support or administration for clearance.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Toast Notification Banner */}
                {toast && (
                    <div className="px-6 pt-4">
                        <div className={`p-4 rounded-2xl flex items-center justify-between border shadow-sm ${
                            toast.type === 'success' 
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800/50' 
                                : toast.type === 'warning'
                                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800/50'
                                    : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800/50'
                        }`}>
                            <div className="flex items-center gap-2.5">
                                {toast.type === 'success' ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                                ) : toast.type === 'warning' ? (
                                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                                ) : (
                                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                                )}
                                <span className="text-xs font-bold">{toast.message}</span>
                            </div>
                            <button
                                onClick={() => setToast(null)}
                                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs font-bold px-2 py-1"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                )}

                {/* Main Content View */}
                <div className="p-3.5 sm:p-6 flex-1 max-w-7xl mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
