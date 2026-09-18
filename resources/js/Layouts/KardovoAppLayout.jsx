import React, { useState, useEffect, useRef } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
    Calendar, 
    Palette, 
    MessageSquare, 
    QrCode, 
    Shield, 
    LogOut, 
    Menu, 
    X, 
    CheckCircle2, 
    AlertCircle,
    AlertTriangle,
    User as UserIcon,
    ChevronRight,
    ChevronLeft,
    Settings,
    Lock,
    Sun,
    Moon,
    CircleDollarSign,
    LayoutDashboard,
    Ticket,
    Wallet
} from 'lucide-react';
import KardovoLogo from '@/Components/KardovoLogo';
import { useTheme } from '@/Hooks/useTheme';
import CreateEventModal from '@/Components/CreateEventModal';

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
    const [toast, setToast] = useState(null);

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
            // Scrolling DOWN -> Disappear smoothly
            else if (currentScrollY > lastScrollY.current + 4) {
                if (!isHoveringTop) {
                    setHeaderVisible(false);
                }
                if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
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

    const isAdmin = user?.role === 'admin' || user?.is_admin;
    const isSubAdmin = user?.role === 'sub_admin' || user?.is_sub_admin;
    const isScanner = user?.role === 'scanner';
    const isSuspended = user?.status === 'suspended';
    const perms = user?.effective_permissions || {};

    const currentUrl = typeof window !== 'undefined' ? window.location.pathname : '';

    const safeRoute = (name, fallback = '#') => {
        try {
            return typeof route === 'function' && route().has(name) ? route(name) : fallback;
        } catch {
            return fallback;
        }
    };

    const navItems = [
        {
            name: 'Dashboard',
            href: safeRoute('dashboard', '/dashboard'),
            icon: LayoutDashboard,
            active: currentUrl === '/dashboard',
            show: !isAdmin && !isSubAdmin && !isScanner,
        },
        {
            name: 'Admin Portal',
            href: safeRoute('admin.dashboard', '/admin'),
            icon: Shield,
            active: (currentUrl === '/admin' || currentUrl.startsWith('/admin')) && !currentUrl.startsWith('/admin/finance') && !currentUrl.startsWith('/admin/audit-logs'),
            show: isAdmin || isSubAdmin,
        },
        {
            name: 'Calendar',
            href: safeRoute('calendar.index', '/calendar'),
            icon: Calendar,
            active: currentUrl === '/calendar' || currentUrl.startsWith('/calendar'),
            show: !isScanner,
        },
        {
            name: 'Payment',
            href: safeRoute('organizer.wallet.index', '/organizer/pricing'),
            icon: Wallet,
            active: currentUrl.startsWith('/organizer/pricing'),
            show: !isScanner && !isAdmin && !isSubAdmin,
        },
        {
            name: 'Card Templates',
            href: safeRoute('templates.index', '/templates'),
            icon: Palette,
            active: currentUrl === '/templates' || currentUrl.startsWith('/templates'),
            show: !isScanner && (isAdmin || isSubAdmin || (!isSuspended && perms.can_customize_templates !== false)),
        },
        {
            name: isAdmin ? 'All Events' : 'My Events',
            href: safeRoute('events.index', '/events'),
            icon: Ticket,
            active: currentUrl === '/events' || currentUrl.startsWith('/events'),
            show: !isScanner,
        },
        {
            name: 'Messaging Hub',
            href: safeRoute('messaging.index', '/messaging'),
            icon: MessageSquare,
            active: currentUrl.startsWith('/messaging'),
            show: !isScanner && (isAdmin || isSubAdmin || (!isSuspended && perms.can_send_broadcasts !== false)),
        },
        {
            name: 'Gate Scanner',
            href: safeRoute('scanner.index', '/scanner'),
            icon: QrCode,
            active: currentUrl.startsWith('/scanner'),
            show: isScanner || isAdmin || isSubAdmin || (!isSuspended && perms.can_manage_scanners !== false),
        },
        {
            name: 'Financial Analysis',
            href: safeRoute('admin.finance', '/admin/finance'),
            icon: CircleDollarSign,
            active: currentUrl.startsWith('/admin/finance'),
            show: isAdmin,
        },
        {
            name: 'Audit Logs',
            href: safeRoute('admin.auditLogs', '/admin/audit-logs'),
            icon: Shield,
            active: currentUrl.startsWith('/admin/audit-logs'),
            show: isAdmin || isSubAdmin,
        },
        {
            name: 'Account Profile',
            href: safeRoute('profile.edit', '/profile'),
            icon: UserIcon,
            active: currentUrl.startsWith('/profile'),
            show: true,
        },
    ].filter(item => item.show);

    return (
        <div className="min-h-screen bg-[#F1F5F9] dark:bg-[#0F172A] flex flex-col md:flex-row text-slate-800 dark:text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-white transition-colors duration-200">
            
            {/* 📱 MOBILE TWO-DECK SYSTEM */}
            {/* 📱 MOBILE TWO-DECK SYSTEM */}
            <div className="md:hidden sticky top-0 z-40 bg-[#0B2545] text-white border-b border-[#173860] shadow-md transition-colors duration-200">
                {/* 1. TOP DECK: Global Navigation, Brand, Theme & Profile */}
                <div className="px-3.5 h-[60px] flex items-center justify-between border-b border-[#173860]">
                    {/* Left: Menu Button & Brand */}
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.1] text-white shadow-2xs active:scale-90 transition-all duration-200 cursor-pointer"
                            aria-label="Open Navigation Menu"
                        >
                            {sidebarOpen ? (
                                <X className="w-4.5 h-4.5 text-rose-400" />
                            ) : (
                                <Menu className="w-4.5 h-4.5 text-emerald-400" />
                            )}
                        </button>

                        <Link href="/dashboard" className="flex items-center">
                            <KardovoLogo light={true} showText={true} size="lg" imgClassName="h-9 w-9" />
                        </Link>
                    </div>

                    {/* Right: Theme Toggle & Profile */}
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={toggleTheme}
                            className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.1] text-amber-400 shadow-2xs active:scale-90 transition-all duration-200 cursor-pointer"
                            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            {isDark ? (
                                <Sun className="w-4.5 h-4.5 text-amber-400" />
                            ) : (
                                <Moon className="w-4.5 h-4.5 text-emerald-300" />
                            )}
                        </button>

                        <Link
                            href={route('profile.edit')}
                            className={`w-10 h-10 rounded-2xl overflow-hidden flex items-center justify-center shadow-2xs active:scale-90 transition-all duration-200 cursor-pointer ${
                                currentUrl === '/profile'
                                    ? 'border-2 border-[#16A34A] ring-2 ring-emerald-500/30'
                                    : 'border border-white/[0.15] hover:border-emerald-400/50 bg-white/[0.08] hover:bg-white/[0.14]'
                            }`}
                            title={user?.name ? `${user.name} — Profile & Settings` : "Account Profile & Settings"}
                        >
                            {user?.avatar ? (
                                <img 
                                    src={user.avatar}
                                    alt={user.name || 'Profile'} 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <UserIcon className="w-4.5 h-4.5 text-slate-200" />
                            )}
                        </Link>
                    </div>
                </div>
                <div className="px-3.5 py-2.5 flex items-center justify-between gap-2 min-h-[44px] bg-[#07192F] border-b border-[#173860]">
                    <div className="min-w-0 flex-1 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                        <h1 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider font-display truncate">
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

            {/* Sidebar Navigation (Themed #0B2545 Dark Slate Blue & Vibrant Emerald) */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 bg-[#0B2545] text-slate-200 flex flex-col justify-between transition-all duration-300 ease-in-out border-r border-[#173860] dark:border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.5)]
                md:sticky md:top-0 md:h-screen md:translate-x-0 md:flex-shrink-0
                ${sidebarCollapsed ? 'md:w-20' : 'md:w-64'}
                ${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'}
            `}>
                <div>
                    <button
                        type="button"
                        onClick={toggleSidebarCollapse}
                        className="hidden md:flex absolute -right-3.5 top-6 z-50 w-7 h-7 rounded-full bg-[#0E3058] border border-emerald-500/40 text-emerald-300 hover:text-white hover:bg-emerald-600 hover:border-emerald-400 shadow-md items-center justify-center transition-all duration-200 active:scale-90 cursor-pointer"
                        title={sidebarCollapsed ? "Expand Sidebar Menu" : "Collapse / Hide Sidebar Menu"}
                    >
                        {sidebarCollapsed ? (
                            <ChevronRight className="w-4 h-4" />
                        ) : (
                            <ChevronLeft className="w-4 h-4" />
                        )}
                    </button>

                    {/* Brand Logo in Sidebar */}
                    <div className={`p-4 border-b border-[#173860] dark:border-white/[0.06] flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
                        <Link href="/dashboard" className="flex items-center">
                            <KardovoLogo light={true} showText={!sidebarCollapsed} size="md" />
                        </Link>
                    </div>

                    {user?.company && !sidebarCollapsed && (
                        <div className="px-4 pt-3.5 pb-1">
                            <div className="text-xs sm:text-[12.5px] font-semibold text-slate-300 truncate" title={user.company}>
                                {user.company}
                            </div>
                        </div>
                    )}

                    {/* Navigation Links with High-End Active Styling */}
                    <nav className="p-3 space-y-1.5 flex-1">
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
                                            ? 'bg-[#16A34A] text-white font-bold shadow-sm border border-[#16A34A]' 
                                            : 'text-slate-300 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.08] border border-transparent'}
                                    `}
                                >
                                    <Icon className={`w-4 h-4 transition-colors duration-150 flex-shrink-0 ${item.active ? 'text-white' : 'text-slate-400 group-hover:text-emerald-300'}`} />
                                    {!sidebarCollapsed && <span className="truncate">{item.name}</span>}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-3 flex-shrink-0 transition-colors duration-200">
                    {/* User Plan & Quotas */}
                    {user?.is_customer && !sidebarCollapsed && user?.message_quotas && (
                        <div className="mb-3 p-3.5 bg-slate-900/40 border border-white/[0.08] rounded-2xl w-full shadow-inner relative overflow-hidden group">
                            {/* Decorative background glow */}
                            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 rounded-full bg-emerald-500/10 blur-xl opacity-60 group-hover:opacity-100 transition-opacity"></div>
                            <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 rounded-full bg-blue-500/10 blur-xl opacity-60 group-hover:opacity-100 transition-opacity"></div>
                            
                            <div className="relative z-10 flex items-center justify-between mb-4">
                                <p className="text-[10px] font-black text-slate-300 tracking-wider uppercase">Active Quotas</p>
                                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] font-black rounded-full border border-emerald-500/20">LIVE</span>
                            </div>
                            
                            {/* WhatsApp Quota */}
                            <div className="mb-3.5 relative z-10">
                                <div className="flex justify-between text-[11px] font-medium text-slate-300 mb-1.5 items-center">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                                        </div>
                                        <span>WhatsApp</span>
                                    </div>
                                    <span className="font-black text-emerald-400 text-[10px]">{user.message_quotas.whatsapp_limit === null ? 'Unlimited' : `${user.message_quotas.whatsapp_remaining} left`}</span>
                                </div>
                                {user.message_quotas.whatsapp_limit !== null && (
                                    <div className="w-full bg-slate-950/60 rounded-full h-1.5 overflow-hidden border border-white/5">
                                        <div className="bg-gradient-to-r from-emerald-500 to-emerald-300 h-1.5 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)] transition-all duration-500" style={{ width: `${Math.max(0, Math.min(100, (user.message_quotas.whatsapp_remaining / user.message_quotas.whatsapp_limit) * 100))}%` }}></div>
                                    </div>
                                )}
                            </div>
                            
                            {/* SMS Quota */}
                            <div className="relative z-10">
                                <div className="flex justify-between text-[11px] font-medium text-slate-300 mb-1.5 items-center">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                                        </div>
                                        <span>SMS</span>
                                    </div>
                                    <span className="font-black text-blue-400 text-[10px]">{user.message_quotas.sms_limit === null ? 'Unlimited' : `${user.message_quotas.sms_remaining} left`}</span>
                                </div>
                                {user.message_quotas.sms_limit !== null && (
                                    <div className="w-full bg-slate-950/60 rounded-full h-1.5 overflow-hidden border border-white/5">
                                        <div className="bg-gradient-to-r from-blue-500 to-blue-300 h-1.5 rounded-full shadow-[0_0_10px_rgba(96,165,250,0.8)] transition-all duration-500" style={{ width: `${Math.max(0, Math.min(100, (user.message_quotas.sms_remaining / user.message_quotas.sms_limit) * 100))}%` }}></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Bottom Sign Out Button */}
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        onClick={() => setSidebarOpen(false)}
                        title={sidebarCollapsed ? "Sign Out of Platform" : undefined}
                        className={`
                            w-full flex items-center ${sidebarCollapsed ? 'justify-center p-2' : 'justify-center gap-2 py-2 px-3'} rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-100 border border-rose-500/25 shadow-2xs cursor-pointer
                        `}
                    >
                        <LogOut className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
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

                {/* Minimalist, Clean & Themed Sticky Topbar */}
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
                    className={`hidden md:flex h-14 bg-[#0B2545] text-white backdrop-blur-2xl border-b border-[#173860] shadow-[0_4px_25px_rgba(0,0,0,0.3)] sticky top-0 z-40 px-4 sm:px-6 items-center justify-between gap-4 transition-all duration-300 ease-in-out ${
                        headerVisible 
                            ? "translate-y-0 opacity-100 pointer-events-auto" 
                            : "-translate-y-full opacity-0 pointer-events-none"
                    }`}
                >
                    {/* Left: Minimalist Breadcrumb & Section Title */}
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-400 select-none">
                            <span>Kardovo</span>
                            <span className="text-slate-400">/</span>
                        </div>
                        <h1 className="text-sm sm:text-base font-black text-white tracking-tight truncate font-display">
                            {title || "Dashboard"}
                        </h1>
                    </div>

                    {/* Right: Actions & Theme Toggle */}
                    <div className="flex items-center gap-2">
                        {headerActions && (
                            <div className="flex items-center gap-1.5">
                                {headerActions}
                            </div>
                        )}

                        {/* Complementary Theme Mode Toggle */}
                        <button
                            type="button"
                            onClick={toggleTheme}
                            className="w-8 h-8 rounded-xl text-slate-200 hover:text-white bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] shadow-2xs transition flex items-center justify-center cursor-pointer active:scale-95"
                            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        >
                            {isDark ? (
                                <Sun className="w-4 h-4 text-amber-400" />
                            ) : (
                                <Moon className="w-4 h-4 text-emerald-300" />
                            )}
                        </button>

                        {/* Account Profile Link */}
                        <Link
                            href={route('profile.edit')}
                            className={`w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center transition active:scale-95 shadow-2xs cursor-pointer ${
                                currentUrl === '/profile'
                                    ? 'border-2 border-[#16A34A] ring-2 ring-emerald-500/30'
                                    : 'border border-white/[0.15] hover:border-emerald-400/50 bg-white/[0.08] hover:bg-white/[0.14]'
                            }`}
                            title={user?.name ? `${user.name} — Profile & Settings` : "Account Profile & Settings"}
                        >
                            {user?.avatar ? (
                                <img 
                                    src={user.avatar} 
                                    alt={user.name || 'Profile'} 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <UserIcon className="w-4 h-4 text-slate-200" />
                            )}
                        </Link>
                    </div>
                </header>

                {/* Account Suspension Banner */}
                {isSuspended && (
                    <div className="px-6 pt-4">
                        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-200 flex items-start gap-3 shadow-xs">
                            <div className="w-8 h-8 rounded-xl bg-rose-500/20 flex items-center justify-center flex-shrink-0 text-rose-600 dark:text-rose-400">
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

            <CreateEventModal />
        </div>
    );
}
