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
    Wallet,
    Users,
    Activity,
    Server,
    ShieldCheck,
    Tag
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
            const saved = localStorage.getItem('kardovo_sidebar_collapsed');
            if (saved !== null) {
                return saved === 'true';
            }
            return window.innerWidth >= 768 && window.innerWidth < 1024;
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

    const page = usePage();
    const pageUrl = page.url || (typeof window !== 'undefined' ? window.location.pathname + window.location.search : '');
    const currentUrl = typeof window !== 'undefined' ? window.location.pathname : (pageUrl ? pageUrl.split('?')[0] : '');

    const safeRoute = (name, fallback = '#') => {
        try {
            return typeof route === 'function' && route().has(name) ? route(name) : fallback;
        } catch {
            return fallback;
        }
    };

    let navCategories = [];

    if (isAdmin) {
        navCategories = [
            {
                title: 'Governance',
                items: [
                    {
                        name: 'Admin Portal',
                        href: safeRoute('admin.dashboard', '/admin'),
                        icon: Shield,
                        active: (pageUrl === '/admin' || pageUrl === '/admin/') && !pageUrl.includes('?'),
                    },
                    {
                        name: 'Users',
                        href: safeRoute('admin.users', '/admin/users'),
                        icon: Users,
                        active: pageUrl.startsWith('/admin/users') || (pageUrl.startsWith('/admin') && (pageUrl.includes('tab=users') || pageUrl.includes('category='))),
                    },
                    {
                        name: 'Gateways',
                        href: safeRoute('admin.gateways', '/admin/gateways'),
                        icon: Server,
                        active: pageUrl.startsWith('/admin/gateways') || (pageUrl.startsWith('/admin') && pageUrl.includes('tab=gateways')),
                    },
                    {
                        name: 'Audit Logs',
                        href: safeRoute('admin.auditLogs', '/admin/audit-logs'),
                        icon: ShieldCheck,
                        active: pageUrl.startsWith('/admin/audit-logs'),
                    },
                ],
            },
            {
                title: 'Operations',
                items: [
                    {
                        name: 'Events',
                        href: safeRoute('events.index', '/events'),
                        icon: Ticket,
                        active: pageUrl === '/events' || (pageUrl.startsWith('/events') && !pageUrl.startsWith('/ticketing')),
                    },
                    {
                        name: 'Ticketing Portal',
                        href: safeRoute('ticketing.index', '/ticketing'),
                        icon: Tag,
                        active: pageUrl.startsWith('/ticketing'),
                    },
                    {
                        name: 'Templates',
                        href: safeRoute('templates.index', '/templates'),
                        icon: Palette,
                        active: pageUrl === '/templates' || pageUrl.startsWith('/templates'),
                    },
                    {
                        name: 'Gate Scanner',
                        href: safeRoute('scanner.index', '/scanner'),
                        icon: QrCode,
                        active: pageUrl.startsWith('/scanner'),
                    },
                    {
                        name: 'Messaging Hub',
                        href: safeRoute('messaging.index', '/messaging'),
                        icon: MessageSquare,
                        active: pageUrl.startsWith('/messaging'),
                    },
                    {
                        name: 'Calendar',
                        href: safeRoute('calendar.index', '/calendar'),
                        icon: Calendar,
                        active: pageUrl === '/calendar' || pageUrl.startsWith('/calendar'),
                    },
                ],
            },
            {
                title: 'Finance & Settings',
                items: [
                    {
                        name: 'Financial Analysis',
                        href: safeRoute('admin.finance', '/admin/finance'),
                        icon: CircleDollarSign,
                        active: pageUrl.startsWith('/admin/finance'),
                    },
                    {
                        name: 'Account Profile',
                        href: safeRoute('profile.edit', '/profile'),
                        icon: UserIcon,
                        active: pageUrl.startsWith('/profile'),
                    },
                ],
            },
        ];
    } else if (isSubAdmin) {
        navCategories = [
            {
                title: 'Governance',
                items: [
                    {
                        name: 'Admin Portal',
                        href: safeRoute('admin.dashboard', '/admin'),
                        icon: Shield,
                        active: (pageUrl === '/admin' || pageUrl === '/admin/') && !pageUrl.includes('?'),
                    },
                    {
                        name: 'Users',
                        href: safeRoute('admin.users', '/admin/users'),
                        icon: Users,
                        active: pageUrl.startsWith('/admin/users') || (pageUrl.startsWith('/admin') && (pageUrl.includes('tab=users') || pageUrl.includes('category='))),
                    },
                    {
                        name: 'Audit Logs',
                        href: safeRoute('admin.auditLogs', '/admin/audit-logs'),
                        icon: ShieldCheck,
                        active: pageUrl.startsWith('/admin/audit-logs'),
                    },
                ],
            },
            {
                title: 'Operations',
                items: [
                    {
                        name: 'Events',
                        href: safeRoute('events.index', '/events'),
                        icon: Ticket,
                        active: pageUrl === '/events' || (pageUrl.startsWith('/events') && !pageUrl.startsWith('/ticketing')),
                    },
                    {
                        name: 'Ticketing Portal',
                        href: safeRoute('ticketing.index', '/ticketing'),
                        icon: Tag,
                        active: pageUrl.startsWith('/ticketing'),
                    },
                    {
                        name: 'Templates',
                        href: safeRoute('templates.index', '/templates'),
                        icon: Palette,
                        active: pageUrl === '/templates' || pageUrl.startsWith('/templates'),
                    },
                    {
                        name: 'Gate Scanner',
                        href: safeRoute('scanner.index', '/scanner'),
                        icon: QrCode,
                        active: pageUrl.startsWith('/scanner'),
                    },
                    {
                        name: 'Messaging Hub',
                        href: safeRoute('messaging.index', '/messaging'),
                        icon: MessageSquare,
                        active: pageUrl.startsWith('/messaging'),
                    },
                    {
                        name: 'Calendar',
                        href: safeRoute('calendar.index', '/calendar'),
                        icon: Calendar,
                        active: pageUrl === '/calendar' || pageUrl.startsWith('/calendar'),
                    },
                ],
            },
            {
                title: 'Settings',
                items: [
                    {
                        name: 'Account Profile',
                        href: safeRoute('profile.edit', '/profile'),
                        icon: UserIcon,
                        active: pageUrl.startsWith('/profile'),
                    },
                ],
            },
        ];
    } else if (isScanner) {
        navCategories = [
            {
                title: 'Operations',
                items: [
                    {
                        name: 'Gate Scanner',
                        href: safeRoute('scanner.index', '/scanner'),
                        icon: QrCode,
                        active: pageUrl.startsWith('/scanner'),
                    },
                ],
            },
            {
                title: 'Account',
                items: [
                    {
                        name: 'Account Profile',
                        href: safeRoute('profile.edit', '/profile'),
                        icon: UserIcon,
                        active: pageUrl.startsWith('/profile'),
                    },
                ],
            },
        ];
    } else {
        navCategories = [
            {
                title: 'Events & Planning',
                items: [
                    {
                        name: 'Dashboard',
                        href: safeRoute('dashboard', '/dashboard'),
                        icon: LayoutDashboard,
                        active: pageUrl === '/dashboard',
                    },
                    {
                        name: 'My Events',
                        href: safeRoute('events.index', '/events'),
                        icon: Ticket,
                        active: pageUrl === '/events' || (pageUrl.startsWith('/events') && !pageUrl.startsWith('/ticketing')),
                    },
                    {
                        name: 'Ticketing Portal',
                        href: safeRoute('ticketing.index', '/ticketing'),
                        icon: Tag,
                        active: pageUrl.startsWith('/ticketing'),
                    },
                    {
                        name: 'Calendar',
                        href: safeRoute('calendar.index', '/calendar'),
                        icon: Calendar,
                        active: pageUrl === '/calendar' || pageUrl.startsWith('/calendar'),
                    },
                ],
            },
            {
                title: 'Studio & Access',
                items: [
                    {
                        name: 'Card Templates',
                        href: safeRoute('templates.index', '/templates'),
                        icon: Palette,
                        active: pageUrl === '/templates' || pageUrl.startsWith('/templates'),
                        show: !isSuspended && perms.can_customize_templates !== false,
                    },
                    {
                        name: 'Messaging Hub',
                        href: safeRoute('messaging.index', '/messaging'),
                        icon: MessageSquare,
                        active: pageUrl.startsWith('/messaging'),
                        show: !isSuspended && perms.can_send_broadcasts !== false,
                    },
                    {
                        name: 'Gate Scanner',
                        href: safeRoute('scanner.index', '/scanner'),
                        icon: QrCode,
                        active: pageUrl.startsWith('/scanner'),
                        show: !isSuspended && perms.can_manage_scanners !== false,
                    },
                ].filter((item) => item.show !== false),
            },
            {
                title: 'Billing & Account',
                items: [
                    {
                        name: 'Payments',
                        href: safeRoute('organizer.wallet.index', '/organizer/pricing'),
                        icon: Wallet,
                        active: pageUrl.startsWith('/organizer/pricing'),
                    },
                    {
                        name: 'Account Profile',
                        href: safeRoute('profile.edit', '/profile'),
                        icon: UserIcon,
                        active: pageUrl.startsWith('/profile'),
                    },
                ],
            },
        ];
    }

    // 📱 Phone Fixed Bottom Navigation Items (Instagram / WhatsApp layout)
    let bottomNavItems = [];
    if (isAdmin) {
        bottomNavItems = [
            {
                name: 'Portal',
                href: safeRoute('admin.dashboard', '/admin'),
                icon: Shield,
                active: (pageUrl === '/admin' || pageUrl === '/admin/') && !pageUrl.includes('?'),
            },
            {
                name: 'Users',
                href: safeRoute('admin.users', '/admin/users'),
                icon: Users,
                active: pageUrl.startsWith('/admin/users') || (pageUrl.startsWith('/admin') && (pageUrl.includes('tab=users') || pageUrl.includes('category='))),
            },
            {
                name: 'Gateways',
                href: safeRoute('admin.gateways', '/admin/gateways'),
                icon: Server,
                active: pageUrl.startsWith('/admin/gateways') || (pageUrl.startsWith('/admin') && pageUrl.includes('tab=gateways')),
            },
            {
                name: 'Audit',
                href: safeRoute('admin.auditLogs', '/admin/audit-logs'),
                icon: ShieldCheck,
                active: pageUrl.startsWith('/admin/audit-logs'),
            },
            {
                name: 'More',
                isMenuToggle: true,
                icon: Menu,
                active: sidebarOpen,
            },
        ];
    } else if (isSubAdmin) {
        bottomNavItems = [
            {
                name: 'Portal',
                href: safeRoute('admin.dashboard', '/admin'),
                icon: Shield,
                active: (pageUrl === '/admin' || pageUrl === '/admin/') && !pageUrl.includes('?'),
            },
            {
                name: 'Users',
                href: safeRoute('admin.users', '/admin/users'),
                icon: Users,
                active: pageUrl.startsWith('/admin/users') || (pageUrl.startsWith('/admin') && (pageUrl.includes('tab=users') || pageUrl.includes('category='))),
            },
            {
                name: 'Events',
                href: safeRoute('events.index', '/events'),
                icon: Ticket,
                active: pageUrl === '/events' || pageUrl.startsWith('/events'),
            },
            {
                name: 'Audit',
                href: safeRoute('admin.auditLogs', '/admin/audit-logs'),
                icon: ShieldCheck,
                active: pageUrl.startsWith('/admin/audit-logs'),
            },
            {
                name: 'More',
                isMenuToggle: true,
                icon: Menu,
                active: sidebarOpen,
            },
        ];
    } else if (isScanner) {
        bottomNavItems = [
            {
                name: 'Scanner',
                href: safeRoute('scanner.index', '/scanner'),
                icon: QrCode,
                active: pageUrl.startsWith('/scanner'),
            },
            {
                name: 'Profile',
                href: safeRoute('profile.edit', '/profile'),
                icon: UserIcon,
                active: pageUrl.startsWith('/profile'),
            },
            {
                name: 'More',
                isMenuToggle: true,
                icon: Menu,
                active: sidebarOpen,
            },
        ];
    } else {
        // Customer / Organiser
        bottomNavItems = [
            {
                name: 'Dashboard',
                href: safeRoute('dashboard', '/dashboard'),
                icon: LayoutDashboard,
                active: pageUrl === '/dashboard',
            },
            {
                name: 'Events',
                href: safeRoute('events.index', '/events'),
                icon: Ticket,
                active: pageUrl === '/events' || pageUrl.startsWith('/events'),
            },
            {
                name: 'Studio',
                href: safeRoute('templates.index', '/templates'),
                icon: Palette,
                active: pageUrl === '/templates' || pageUrl.startsWith('/templates'),
            },
            {
                name: 'Scanner',
                href: safeRoute('scanner.index', '/scanner'),
                icon: QrCode,
                active: pageUrl.startsWith('/scanner'),
            },
            {
                name: 'More',
                isMenuToggle: true,
                icon: Menu,
                active: sidebarOpen,
            },
        ];
    }

    return (
        <div className="min-h-screen bg-[#F1F5F9] dark:bg-[#0F172A] flex flex-col md:flex-row text-slate-800 dark:text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-white transition-colors duration-200">
            
            {/* 📱 MOBILE SLEEK TOPBAR (Minimalist & Dynamic) */}
            <div className="md:hidden sticky top-0 z-30 bg-[#0B2545] text-white border-b border-[#173860] shadow-sm">
                <div className="px-3.5 h-13 flex items-center justify-between">
                    {/* Left: Brand + Section Title */}
                    <div className="flex items-center gap-2.5 min-w-0">
                        <Link href="/dashboard" className="flex-shrink-0 flex items-center">
                            <KardovoLogo light={true} showText={false} imgClassName="h-7 w-7" />
                        </Link>
                        <div className="h-4 w-px bg-white/20 flex-shrink-0" />
                        <h1 className="text-xs font-bold text-white uppercase tracking-wider font-display truncate max-w-[130px] xs:max-w-[170px] sm:max-w-xs">
                            {title || 'Dashboard'}
                        </h1>
                    </div>

                    {/* Right: Actions, Theme Toggle & Profile Avatar */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {headerActions && (
                            <div className="flex items-center gap-1.5 scale-90 sm:scale-100 origin-right">
                                {headerActions}
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={toggleTheme}
                            className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.1] text-amber-400 active:scale-90 transition-all duration-150 cursor-pointer"
                            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            {isDark ? (
                                <Sun className="w-4 h-4 text-amber-400" />
                            ) : (
                                <Moon className="w-4 h-4 text-emerald-300" />
                            )}
                        </button>

                        <Link
                            href={route('profile.edit')}
                            className={`w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center active:scale-90 transition-all duration-150 cursor-pointer ${
                                currentUrl === '/profile'
                                    ? 'border-2 border-[#16A34A] ring-1 ring-emerald-500/30'
                                    : 'border border-white/[0.15] hover:border-emerald-400/50 bg-white/[0.08]'
                            }`}
                            title={user?.name ? `${user.name} — Profile` : "Profile"}
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
                </div>
            </div>

            {/* Sidebar Navigation (Themed #0B2545 Dark Slate Blue & Vibrant Emerald) */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 bg-[#0B2545] text-slate-200 flex flex-col justify-between transition-all duration-300 ease-in-out border-r border-[#173860] dark:border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.5)]
                md:sticky md:top-0 md:h-screen md:translate-x-0 md:flex-shrink-0
                ${sidebarCollapsed ? 'md:w-20' : 'md:w-64'}
                ${sidebarOpen ? 'translate-x-0 w-72 sm:w-80' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="flex flex-col flex-1 min-h-0">
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

                    {/* Brand Logo & Close button in Sidebar */}
                    <div className={`p-4 border-b border-[#173860] dark:border-white/[0.06] flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
                        <Link href="/dashboard" onClick={() => setSidebarOpen(false)} className="flex items-center">
                            <KardovoLogo light={true} showText={!sidebarCollapsed} size="md" />
                        </Link>
                        {/* Mobile Close Button */}
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(false)}
                            className="md:hidden w-8 h-8 rounded-xl flex items-center justify-center bg-white/[0.08] hover:bg-white/[0.14] text-slate-300 hover:text-white transition active:scale-90 cursor-pointer"
                            aria-label="Close Navigation Menu"
                        >
                            <X className="w-4 h-4 text-slate-300" />
                        </button>
                    </div>

                    {user?.company && !sidebarCollapsed && (
                        <div className="px-4 pt-3.5 pb-1">
                            <div className="text-xs sm:text-[12.5px] font-semibold text-slate-300 truncate" title={user.company}>
                                {user.company}
                            </div>
                        </div>
                    )}

                    {/* Navigation Links with High-End Categorized Styling */}
                    <nav className="p-3 space-y-2 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700/50">
                        {navCategories.map((group, groupIdx) => (
                            <div key={group.title || groupIdx} className="space-y-1">
                                {groupIdx > 0 && (
                                    <div className="my-2.5 mx-1 border-t border-white/[0.08]" />
                                )}
                                {!sidebarCollapsed && group.title && (
                                    <div className="px-3 pt-1 pb-1 text-[9.5px] font-bold uppercase tracking-widest text-slate-400/70 font-mono select-none">
                                        {group.title}
                                    </div>
                                )}
                                <div className="space-y-0.5">
                                    {group.items.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                onClick={() => setSidebarOpen(false)}
                                                title={sidebarCollapsed ? item.name : undefined}
                                                className={`
                                                    flex items-center ${sidebarCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2'} rounded-xl text-xs font-semibold transition-all duration-150 relative group active:scale-[0.98]
                                                    ${item.active 
                                                        ? 'bg-[#16A34A] text-white font-bold shadow-xs border border-[#16A34A]' 
                                                        : 'text-slate-300 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.08] border border-transparent'}
                                                `}
                                            >
                                                <Icon className={`w-4 h-4 transition-colors duration-150 flex-shrink-0 ${item.active ? 'text-white' : 'text-slate-400 group-hover:text-emerald-300'}`} />
                                                {!sidebarCollapsed && <span className="truncate">{item.name}</span>}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </nav>
                </div>

                <div className="p-3 flex-shrink-0 transition-colors duration-200">
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
            <main className="flex-1 flex flex-col min-w-0 relative pb-24 md:pb-6">
                
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
                <div className="p-3.5 sm:p-6 max-w-7xl mx-auto w-full">
                    {children}
                </div>
            </main>

            {/* 📱 WHATSAPP / INSTAGRAM STYLE MOBILE BOTTOM NAVIGATION BAR */}
            <nav 
                aria-label="Mobile Navigation"
                className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B2545]/95 dark:bg-[#07192F]/95 backdrop-blur-xl border-t border-[#173860] dark:border-white/[0.08] shadow-[0_-4px_25px_rgba(0,0,0,0.35)] px-2 pt-1.5 pb-[max(env(safe-area-inset-bottom),0.5rem)] flex items-center justify-around transition-all duration-200"
            >
                {bottomNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.active;

                    if (item.isMenuToggle) {
                        return (
                            <button
                                key={item.name}
                                type="button"
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-150 active:scale-90 group cursor-pointer focus:outline-none"
                                aria-label="Toggle Navigation Menu"
                            >
                                <div className={`relative px-3 py-1 rounded-full transition-all duration-200 ${
                                    sidebarOpen ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'
                                }`}>
                                    {sidebarOpen ? (
                                        <X className="w-5 h-5 stroke-[2.5] text-rose-400" />
                                    ) : (
                                        <Icon className="w-5 h-5 stroke-[2]" />
                                    )}
                                </div>
                                <span className={`text-[10px] tracking-tight mt-0.5 ${
                                    sidebarOpen ? 'font-black text-rose-400' : 'font-semibold text-slate-400 group-hover:text-slate-200'
                                }`}>
                                    {sidebarOpen ? 'Close' : 'More'}
                                </span>
                            </button>
                        );
                    }

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className="flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-150 active:scale-90 group cursor-pointer focus:outline-none"
                        >
                            <div className={`relative px-3 py-1 rounded-full transition-all duration-200 ${
                                isActive ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'
                            }`}>
                                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5] text-emerald-400' : 'stroke-[2]'}`} />
                                {isActive && (
                                    <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                                )}
                            </div>
                            <span className={`text-[10px] tracking-tight mt-0.5 ${
                                isActive ? 'font-black text-emerald-400' : 'font-semibold text-slate-400 group-hover:text-slate-200'
                            }`}>
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            <CreateEventModal />
        </div>
    );
}
