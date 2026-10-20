import React, { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import KardovoLogo from '@/Components/KardovoLogo';
import KardovoFooter from '@/Components/KardovoFooter';
import Modal from '@/Components/Modal';
import Login from '@/Pages/Auth/Login';
import { useTicketingLanguage } from '@/Utils/ticketingTranslations';
import {
    Ticket,
    Layers,
    TrendingUp,
    ShieldCheck,
    Zap,
    Monitor,
    Smartphone,
    CheckCircle2,
    Sparkles,
    Tag,
    Lock,
    Printer,
    CreditCard,
    ChevronDown,
    HelpCircle,
    Mail,
    Phone,
    MessageCircle,
    ArrowRight,
    QrCode,
    Check,
    Globe,
    Home as HomeIcon,
    Wifi,
    Building2,
    Calendar,
    MapPin,
    X,
    ExternalLink,
    Shield,
    Users,
    Server,
    Palette,
    CircleDollarSign,
    User as UserIcon,
    LogOut,
    Copy,
    Minus,
    Plus,
    Clock,
    AlertTriangle,
    LayoutDashboard,
    Wallet,
    Sun,
    Moon,
    Menu,
    Settings,
    ShoppingBag,
    Pause,
    Edit,
    Trash2,
    ArrowLeft,
    Volume2,
    History,
    Camera,
    Keyboard
} from 'lucide-react';

// ══════════════════════════════════════════════════════════════
// EXACT KARDOVO MOBILE SMARTPHONE COMPONENTS (LIGHT MODE POV)
// ══════════════════════════════════════════════════════════════

function SmartphoneMockup({ children }) {
    return (
        <div className="flex flex-col items-center select-none">
            {/* Authentic iPhone Pro Chassis with Hardware Buttons */}
            <div className="relative w-[328px] sm:w-[352px] h-[668px] sm:h-[692px] bg-[#181A20] rounded-[54px] p-[11px] shadow-[0_28px_60px_-12px_rgba(11,37,69,0.38),0_0_0_1px_rgba(255,255,255,0.12)_inset] border-[3px] border-[#323640] ring-1 ring-black/60 transition-transform duration-300 hover:scale-[1.01]">
                {/* Left Side Hardware Buttons: Silent/Action Switch + Volume Up + Volume Down */}
                <div className="absolute -left-[5px] top-[112px] w-[3px] h-7 bg-[#2C303A] rounded-l-md" />
                <div className="absolute -left-[5px] top-[156px] w-[3px] h-12 bg-[#2C303A] rounded-l-md" />
                <div className="absolute -left-[5px] top-[214px] w-[3px] h-12 bg-[#2C303A] rounded-l-md" />

                {/* Right Side Hardware Button: Power / Side Button */}
                <div className="absolute -right-[5px] top-[172px] w-[3px] h-16 bg-[#2C303A] rounded-r-md" />

                {/* Inner iPhone OLED Display Viewport (Edge-to-Edge Fit) */}
                <div className="w-full h-full bg-[#F1F5F9] text-slate-900 rounded-[42px] overflow-hidden flex flex-col justify-between relative ring-1 ring-black/15">
                    {children}
                </div>
            </div>
        </div>
    );
}

function PhoneStatusBar({ bgClass = 'bg-[#0B2545]', textClass = 'text-white' }) {
    return (
        <div className={`relative flex justify-between items-center text-[11px] font-bold px-6 pt-2.5 pb-1.5 shrink-0 ${bgClass} ${textClass}`}>
            {/* Left: iOS Time */}
            <span className="tracking-tight leading-none font-semibold">9:41</span>

            {/* Center: Authentic iPhone Dynamic Island inside the Screen Status Bar */}
            <div className="w-[90px] h-[22px] bg-black rounded-full flex items-center justify-end px-2.5 shadow-inner ring-1 ring-white/10">
                <div className="w-2.5 h-2.5 rounded-full bg-[#111827] ring-1 ring-sky-500/25 flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-sky-400/50" />
                </div>
            </div>

            {/* Right: Cellular, Wi-Fi, Battery */}
            <div className="flex items-center gap-1.5">
                <div className="flex items-end gap-[1.5px] h-2.5">
                    <span className="w-[2px] h-1 bg-current rounded-full" />
                    <span className="w-[2px] h-1.5 bg-current rounded-full" />
                    <span className="w-[2px] h-2 bg-current rounded-full" />
                    <span className="w-[2px] h-2.5 bg-current rounded-full" />
                </div>
                <Wifi className="w-3 h-3" />
                <div className="w-[18px] h-[9px] border border-current/80 rounded-[3px] p-[1px] flex items-center relative">
                    <div className="w-full h-full bg-emerald-400 rounded-[1.5px]" />
                </div>
            </div>
        </div>
    );
}

// Exact replica of KardovoAppLayout.jsx mobile sticky topbar (lines 523-578)
function KardovoMobileTopBar({ title = 'Ticketing', showNewEventButton = true }) {
    return (
        <div className="shrink-0">
            <PhoneStatusBar bgClass="bg-[#0B2545]" textClass="text-white/95" />

            <div className="bg-[#0B2545] text-white border-b border-[#173860] shadow-xs px-3.5 h-10 flex items-center justify-between gap-2">
                {/* Left: Real KardovoLogo + Divider + Uppercase Section Title */}
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="flex-shrink-0 flex items-center">
                        <KardovoLogo light={true} showText={false} imgClassName="h-5 w-5" />
                    </div>
                    <div className="h-3.5 w-px bg-white/20 flex-shrink-0" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider font-display truncate min-w-0">
                        {title}
                    </span>
                </div>

                {/* Right: Header Actions (+ New Event), Moon Theme Toggle (Light Mode), Profile UserIcon */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                    {showNewEventButton && (
                        <div className="inline-flex items-center gap-1 px-2 py-1 text-[9.5px] font-bold text-white bg-[#154F7C] rounded-lg shadow-xs">
                            <Plus className="w-2.5 h-2.5" />
                            <span>New Event</span>
                        </div>
                    )}

                    <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-white/[0.08] border border-white/[0.1]"
                        title="Switch to Dark Mode"
                    >
                        <Moon className="w-3 h-3 text-sky-300" />
                    </div>

                    <div
                        className="w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center shrink-0 border border-white/[0.15] bg-white/[0.08]"
                        title="Profile"
                    >
                        <UserIcon className="w-3 h-3 text-slate-200" />
                    </div>
                </div>
            </div>
        </div>
    );
}

// Exact replica of KardovoAppLayout.jsx mobile bottom navigation bar (lines 485-516 & 810-868)
function KardovoMobileBottomNav({ activeNav = 'events' }) {
    const items = [
        { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
        { id: 'events', name: 'Events', icon: Ticket },
        { id: 'studio', name: 'Studio', icon: Palette },
        { id: 'scanner', name: 'Scanner', icon: QrCode },
        { id: 'more', name: 'More', icon: Menu },
    ];

    return (
        <div className="shrink-0 bg-[#0B2545] border-t border-[#173860]">
            <div className="px-2 pt-1.5 pb-1 flex items-center justify-around">
                {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeNav === item.id;
                    return (
                        <div
                            key={item.id}
                            className="flex-1 flex flex-col items-center justify-center py-0.5 rounded-xl"
                        >
                            <div
                                className={`relative px-2.5 py-0.5 rounded-full ${
                                    isActive ? 'bg-sky-500/20 text-sky-400' : 'text-slate-400'
                                }`}
                            >
                                <Icon className={`w-3.5 h-3.5 ${isActive ? 'stroke-[2.5] text-sky-400' : 'stroke-[2]'}`} />
                                {isActive && (
                                    <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.8)]" />
                                )}
                            </div>
                            <span
                                className={`text-[8.5px] tracking-tight mt-0.5 ${
                                    isActive ? 'font-black text-sky-400' : 'font-semibold text-slate-400'
                                }`}
                            >
                                {item.name}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* iOS Home Indicator Bar */}
            <div className="pb-2 pt-0.5 flex justify-center">
                <div className="w-28 h-1 bg-white/35 rounded-full" />
            </div>
        </div>
    );
}

// Exact replica of TicketingPortal.jsx Event Header + 5-Section Navigation Bar (lines 872-1076)
function TicketingPortalHeaderAndTabs({ activeSection = 'overview' }) {
    const sections = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard, todo: activeSection === 'overview' ? 1 : 0 },
        { id: 'tickets', label: 'Tickets', icon: Ticket, todo: 0 },
        { id: 'sales', label: 'Sales', icon: ShoppingBag, todo: 0 },
        { id: 'event-day', label: 'Event Day', icon: QrCode, todo: 0 },
        { id: 'payouts', label: 'Payouts', icon: Wallet, todo: 0 },
    ];

    return (
        <div className="space-y-2.5">
            {/* Event Header (Directly on #F1F5F9 background, matching TicketingPortal.jsx lines 872-1042) */}
            <div className="space-y-2">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-12 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                        <img
                            src="/images/categories/sports.jpg"
                            alt=""
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                            <h4 className="text-[11px] font-extrabold text-slate-900 tracking-tight truncate">
                                KILIMANJARO PREMIUM LAGER MARATHON 2026
                            </h4>
                            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                        </div>

                        <div className="mt-0.5 flex items-center gap-x-2.5 gap-y-0.5 text-[9px] text-slate-500 flex-wrap">
                            <span className="inline-flex items-center gap-1">
                                <Calendar className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                                <span>Sun, 25 Oct 2026</span>
                            </span>
                            <span className="inline-flex items-center gap-1 min-w-0">
                                <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                                <span className="truncate max-w-[130px]">Moshi Stadium &amp; Foothills...</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Action Controls Row: Switch 'Sales open', 'Copy link', 'Preview', Settings Gear */}
                <div className="flex items-center gap-1.5 flex-wrap">
                    <div className="inline-flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-xl text-[9px] font-semibold text-slate-700 bg-white border border-slate-200">
                        <span className="relative w-6 h-3.5 rounded-full bg-emerald-500 shrink-0">
                            <span className="absolute top-[2px] right-[2px] w-2.5 h-2.5 rounded-full bg-white shadow" />
                        </span>
                        <span>Sales open</span>
                    </div>

                    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-xl text-[9px] font-semibold text-slate-700 bg-white border border-slate-200">
                        <Copy className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                        <span>Copy link</span>
                    </div>

                    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-xl text-[9px] font-semibold text-slate-700 bg-white border border-slate-200">
                        <ExternalLink className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                        <span>Preview</span>
                    </div>

                    <div className="inline-flex items-center justify-center w-6 h-6 rounded-xl text-slate-500 bg-white border border-slate-200 ml-auto">
                        <Settings className="w-3 h-3" />
                    </div>
                </div>
            </div>

            {/* 5-Section Navigation Bar (Fits all 5 tabs cleanly inside mobile width) */}
            <div className="border-b border-slate-200 flex items-center justify-between">
                {sections.map((sec) => {
                    const SecIcon = sec.icon;
                    const isActive = activeSection === sec.id;
                    return (
                        <div
                            key={sec.id}
                            className={`flex items-center gap-1 px-1.5 py-1.5 -mb-px text-[8.5px] font-semibold whitespace-nowrap border-b-2 ${
                                isActive
                                    ? 'border-[#154F7C] text-[#154F7C] font-bold'
                                    : 'border-transparent text-slate-500'
                            }`}
                        >
                            <SecIcon className="w-2.5 h-2.5 shrink-0" />
                            <span>{sec.label}</span>
                            {sec.todo > 0 && (
                                <span className="text-[7.5px] leading-none px-1 py-0.5 rounded-full font-bold bg-amber-500/15 text-amber-700">
                                    {sec.todo}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ── STEP 1 MOBILE: REAL KARDOVO TICKETING PORTAL — OVERVIEW TAB (TicketingPortal.jsx lines 1112-1227) ──
function MobileTicketingOverviewScreen() {
    return (
        <div className="w-full h-full flex flex-col justify-between min-h-0 bg-[#F1F5F9] overflow-hidden">
            <KardovoMobileTopBar title="Ticketing" showNewEventButton={true} />

            {/* Light-Mode Content Canvas */}
            <div className="p-2.5 sm:p-3 space-y-2.5 flex-1 overflow-hidden text-slate-800">
                <TicketingPortalHeaderAndTabs activeSection="overview" />

                {/* Finish setup Card (Exact replica of TicketingPortal.jsx lines 1115-1204) */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="p-3 border-b border-slate-100">
                        <h2 className="text-xs font-extrabold text-slate-900 tracking-tight">
                            Finish setup
                        </h2>
                        <p className="text-[9.5px] text-slate-500 mt-0.5">
                            Complete these 3 steps to start selling tickets.
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                <div className="h-full bg-[#154F7C] rounded-full w-2/3" />
                            </div>
                            <span className="text-[9px] font-semibold text-slate-500 tabular-nums">
                                2 of 3 done
                            </span>
                        </div>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {/* Step 1 */}
                        <div className="px-3 py-2.5 flex items-center justify-between gap-2">
                            <div className="flex items-start gap-2.5 min-w-0">
                                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                    <Check className="w-3 h-3" />
                                </span>
                                <div className="min-w-0">
                                    <div className="text-[10px] font-bold text-slate-900">Add your tickets</div>
                                    <div className="text-[9px] text-slate-500">3 ticket types added</div>
                                </div>
                            </div>
                            <span className="px-2.5 py-1 rounded-lg text-[9px] font-bold bg-white text-slate-700 border border-slate-200 shrink-0">
                                Manage
                            </span>
                        </div>

                        {/* Step 2 (Highlighted Next Step) */}
                        <div className="px-3 py-2.5 bg-sky-50/60 flex items-center justify-between gap-2">
                            <div className="flex items-start gap-2.5 min-w-0">
                                <span className="w-5 h-5 rounded-full bg-[#154F7C] text-white text-[9.5px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                    2
                                </span>
                                <div className="min-w-0">
                                    <div className="text-[10px] font-bold text-slate-900">Add your payout account</div>
                                    <div className="text-[8.5px] text-slate-500 leading-snug">
                                        Tell us where to send your earnings. You receive 94% of every sale.
                                    </div>
                                </div>
                            </div>
                            <span className="px-2.5 py-1 rounded-lg text-[9px] font-bold bg-[#154F7C] text-white shadow-xs shrink-0">
                                Add account
                            </span>
                        </div>

                        {/* Step 3 */}
                        <div className="px-3 py-2.5 flex items-center justify-between gap-2">
                            <div className="flex items-start gap-2.5 min-w-0">
                                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                    <Check className="w-3 h-3" />
                                </span>
                                <div className="min-w-0">
                                    <div className="text-[10px] font-bold text-slate-900">Open sales and share your link</div>
                                    <div className="text-[9px] text-slate-500">Sales are open</div>
                                </div>
                            </div>
                            <span className="px-2.5 py-1 rounded-lg text-[9px] font-bold bg-white text-slate-700 border border-slate-200 shrink-0">
                                Open sales
                            </span>
                        </div>
                    </div>

                    {/* Optional Pass Designer Footer */}
                    <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                        <p className="text-[8.5px] text-slate-500 leading-snug">
                            <span className="font-semibold text-slate-700">Optional:</span> choose the colors and poster on the ticket your guests receive.
                        </p>
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-semibold text-slate-700 bg-white border border-slate-200 shrink-0">
                            <Palette className="w-3 h-3 text-[#154F7C]" />
                            <span>Design ticket</span>
                        </span>
                    </div>
                </div>

                {/* Your ticket link Card (Exact replica of TicketingPortal.jsx lines 1208-1226) */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-3">
                    <h2 className="text-[10px] font-bold text-slate-900">Your ticket link</h2>
                    <p className="text-[8.5px] text-slate-500 mt-0.5">
                        Send this link to buyers on WhatsApp, Instagram or SMS.
                    </p>
                    <div className="mt-2 flex items-center gap-1.5">
                        <div className="flex-1 min-w-0 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[8.5px] text-slate-700 truncate">
                            https://kardovo.com/e/1/tickets
                        </div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[9px] font-bold text-white bg-[#154F7C] shadow-xs shrink-0">
                            <Copy className="w-2.5 h-2.5" />
                            <span>Copy link</span>
                        </span>
                    </div>
                </div>
            </div>

            <KardovoMobileBottomNav activeNav="events" />
        </div>
    );
}

// ── STEP 2 MOBILE: REAL KARDOVO TICKETING PORTAL — TICKETS TAB (TicketingPortal.jsx lines 1078-1504) ──
function MobileTicketsStudioScreen() {
    const tiers = [
        {
            name: 'VIP Marathon Lounge',
            desc: 'VIP hospitality tent, recovery zone & medal',
            price: 'TZS 100,000',
            sold: 85,
            capacity: 100,
            percent: 85,
            color: '#154F7C',
            status: 'active',
        },
        {
            name: '21K Half Marathon',
            desc: 'Official running bib, timing chip & shirt',
            price: 'TZS 35,000',
            sold: 410,
            capacity: 500,
            percent: 82,
            color: '#0D9488',
            status: 'active',
        },
        {
            name: 'Early Bird 5K Fun Run',
            desc: 'Discounted early bird entry pass',
            price: 'TZS 20,000',
            sold: 200,
            capacity: 200,
            percent: 100,
            color: '#D97706',
            status: 'sold_out',
        },
    ];

    return (
        <div className="w-full h-full flex flex-col justify-between min-h-0 bg-[#F1F5F9] overflow-hidden">
            <KardovoMobileTopBar title="Ticketing" showNewEventButton={true} />

            <div className="p-2.5 sm:p-3 space-y-2.5 flex-1 overflow-hidden text-slate-800">
                <TicketingPortalHeaderAndTabs activeSection="tickets" />

                {/* Sub-tabs Pill Bar: Ticket Types 3 | Promo Codes 2 (TicketingPortal.jsx lines 1078-1107) */}
                <div className="inline-flex p-0.5 gap-1 rounded-xl bg-slate-200/70">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9.5px] font-semibold bg-white text-slate-900 shadow-xs">
                        <span>Ticket Types</span>
                        <span className="text-[8.5px] font-mono text-slate-400">3</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9.5px] font-semibold text-slate-500">
                        <span>Promo Codes</span>
                        <span className="text-[8.5px] font-mono text-slate-400">2</span>
                    </div>
                </div>

                {/* Ticket Types Table Card (Exact replica of TicketingPortal.jsx lines 1321-1504) */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="p-3 border-b border-slate-100 space-y-2">
                        <div>
                            <h2 className="text-[11px] font-bold text-slate-900">Ticket Types</h2>
                            <p className="text-[9px] text-slate-500 mt-0.5">
                                Create ticket packages (e.g., Regular, VIP, Early Bird) and set seat limits.
                            </p>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-[8.5px] font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg">
                                <Palette className="w-3 h-3 text-[#154F7C]" />
                                <span>Customize Ticket Design</span>
                            </span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[8.5px] font-bold text-white bg-[#154F7C] rounded-lg shadow-2xs">
                                <Plus className="w-3 h-3" />
                                <span>Add Ticket Type</span>
                            </span>
                        </div>
                    </div>

                    {/* Table Header */}
                    <div className="grid grid-cols-12 border-b border-slate-100 bg-slate-50/60 px-3 py-1.5 text-[7.5px] font-bold text-slate-400 uppercase tracking-wider">
                        <div className="col-span-5">Tier Name</div>
                        <div className="col-span-3">Price</div>
                        <div className="col-span-2">Sold</div>
                        <div className="col-span-2 text-right">Status</div>
                    </div>

                    {/* Tier Rows */}
                    <div className="divide-y divide-slate-100 text-[9px]">
                        {tiers.map((tier) => (
                            <div key={tier.name} className="px-3 py-2.5 space-y-1.5">
                                <div className="grid grid-cols-12 items-center gap-1">
                                    <div className="col-span-5 flex items-start gap-1.5 min-w-0">
                                        <span
                                            className="w-2 h-2 rounded-full shrink-0 mt-1"
                                            style={{ backgroundColor: tier.color }}
                                        />
                                        <div className="min-w-0">
                                            <div className="font-bold text-slate-900 truncate text-[9.5px]">{tier.name}</div>
                                            <div className="text-[8px] text-slate-500 truncate">{tier.desc}</div>
                                        </div>
                                    </div>

                                    <div className="col-span-3 font-mono font-bold text-slate-900 text-[8.5px]">
                                        {tier.price}
                                    </div>

                                    <div className="col-span-2">
                                        <div className="font-mono text-[8px]">
                                            <span className="font-bold text-slate-900">{tier.sold}</span>
                                            <span className="text-slate-400">/{tier.capacity}</span>
                                        </div>
                                        <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden mt-0.5">
                                            <div
                                                className="h-full rounded-full"
                                                style={{ width: `${tier.percent}%`, backgroundColor: tier.color }}
                                            />
                                        </div>
                                    </div>

                                    <div className="col-span-2 text-right">
                                        <span
                                            className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[7.5px] font-bold uppercase tracking-wider whitespace-nowrap ${
                                                tier.status === 'active'
                                                    ? 'bg-emerald-500/10 text-emerald-700'
                                                    : 'bg-rose-500/10 text-rose-600'
                                            }`}
                                        >
                                            {tier.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>

                                {/* Row Action Controls (Pause, Edit, Delete) */}
                                <div className="flex items-center justify-end gap-1 pt-0.5">
                                    {tier.status !== 'sold_out' && (
                                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[8px] font-semibold inline-flex items-center gap-0.5">
                                            <Pause className="w-2.5 h-2.5 text-amber-600" />
                                            <span>Pause</span>
                                        </span>
                                    )}
                                    <span className="p-1 rounded text-slate-400 bg-slate-50">
                                        <Edit className="w-2.5 h-2.5" />
                                    </span>
                                    <span className="p-1 rounded text-slate-400 bg-slate-50">
                                        <Trash2 className="w-2.5 h-2.5" />
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <KardovoMobileBottomNav activeNav="events" />
        </div>
    );
}

// ── STEP 3 MOBILE: REAL KARDOVO GATE SCANNER APP (Exact replica of ScannerApp.jsx lines 488-1011) ──
function MobileGateSentinelScreen() {
    return (
        <div className="w-full h-full flex flex-col justify-between min-h-0 bg-[#F4F6F9] text-slate-900 overflow-hidden">
            {/* 1. TOP HEADER / APP BAR (Exact replica of ScannerApp.jsx lines 495-682) */}
            <div className="shrink-0">
                <PhoneStatusBar bgClass="bg-white/95" textClass="text-slate-900" />

                <div className="px-3 py-2.5 bg-white/95 backdrop-blur-2xl border-b border-slate-200/90 space-y-2 shadow-xs">
                    {/* Row 1: App Navigation & Utility Controls */}
                    <div className="flex items-center justify-between gap-1.5">
                        {/* Left: Back to My Events (Organizer POV) */}
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold text-slate-800 bg-slate-100 border border-slate-200/80 shadow-2xs">
                            <ArrowLeft className="w-3 h-3 text-[#154F7C] stroke-[2.5]" />
                            <span>My Events</span>
                        </div>

                        {/* Center: Live Gate Indicator Badge */}
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-[8.5px] font-extrabold uppercase tracking-wider text-[#154F7C] shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                            <span>LIVE GATE</span>
                        </div>

                        {/* Right: Consolidated Action Icon Toolbar (Volume2, History, Moon, User) */}
                        <div className="flex items-center gap-0.5">
                            <div className="p-1.5 rounded-xl text-[#154F7C]">
                                <Volume2 className="w-3.5 h-3.5 text-[#154F7C]" />
                            </div>
                            <div className="p-1.5 rounded-xl text-slate-500">
                                <History className="w-3.5 h-3.5" />
                            </div>
                            <div className="p-1.5 rounded-xl text-[#154F7C]">
                                <Moon className="w-3.5 h-3.5 text-[#154F7C]" />
                            </div>
                            <div className="p-1.5 rounded-xl text-[#154F7C]">
                                <UserIcon className="w-3.5 h-3.5 text-[#154F7C]" />
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Active Event Title & Switch Event Chevron */}
                    <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-100">
                        <div className="min-w-0 flex-1">
                            <h2 className="text-[11px] font-black text-slate-900 font-display leading-snug truncate">
                                KILIMANJARO PREMIUM LAGER MARATHON 2026
                            </h2>
                        </div>
                        <div className="w-7 h-7 rounded-xl bg-slate-100 border border-slate-200/80 text-[#154F7C] flex items-center justify-center shrink-0 shadow-2xs">
                            <ChevronDown className="w-3.5 h-3.5 text-[#154F7C]" />
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. VIEWFINDER SCANNING ZONE (Exact replica of ScannerApp.jsx lines 696-758) */}
            <div className="flex-1 relative flex flex-col items-center justify-center px-4 py-2">
                {/* Framed Square Black Camera Viewport */}
                <div className="w-full max-w-[230px] aspect-square rounded-3xl overflow-hidden shadow-2xl bg-black relative border-2 border-slate-800 flex items-center justify-center">
                    {/* Tech Viewfinder Bracket Corners (sky-400 glow) */}
                    <div className="absolute inset-3.5 pointer-events-none z-10 flex flex-col justify-between">
                        <div className="flex justify-between">
                            <div className="w-7 h-7 border-t-[3px] border-l-[3px] border-sky-400 rounded-tl-xl shadow-[0_0_12px_rgba(56,189,248,0.7)]" />
                            <div className="w-7 h-7 border-t-[3px] border-r-[3px] border-sky-400 rounded-tr-xl shadow-[0_0_12px_rgba(56,189,248,0.7)]" />
                        </div>
                        <div className="flex justify-between">
                            <div className="w-7 h-7 border-b-[3px] border-l-[3px] border-sky-400 rounded-bl-xl shadow-[0_0_12px_rgba(56,189,248,0.7)]" />
                            <div className="w-7 h-7 border-b-[3px] border-r-[3px] border-sky-400 rounded-br-xl shadow-[0_0_12px_rgba(56,189,248,0.7)]" />
                        </div>
                    </div>

                    {/* Animated Scanning Laser Line */}
                    <div className="absolute left-5 right-5 h-[2px] bg-gradient-to-r from-transparent via-sky-400 to-transparent shadow-[0_0_16px_rgba(56,189,248,1)] animate-pulse pointer-events-none z-10 top-1/2 -translate-y-1/2" />

                    {/* Camera Viewport Content */}
                    <div className="p-4 text-center z-0 flex flex-col items-center space-y-2.5">
                        <div className="w-11 h-11 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-inner">
                            <Camera className="w-5 h-5 text-sky-400" />
                        </div>
                        <div>
                            <h4 className="text-[11px] font-bold text-slate-200">
                                Ready to Scan QR Pass
                            </h4>
                            <p className="text-[9px] text-slate-400 mt-0.5 max-w-[175px] leading-relaxed">
                                Point camera directly at the guest QR pass to verify access.
                            </p>
                        </div>
                        <div className="px-3 py-1.5 bg-gradient-to-r from-[#154F7C] to-[#327FB5] text-white font-bold rounded-xl text-[9.5px] flex items-center gap-1.5 shadow-md shadow-[#154F7C]/25 border border-sky-400/25">
                            <Keyboard className="w-3 h-3" />
                            <span>Manual Code Entry</span>
                        </div>
                    </div>
                </div>

                {/* Subtitle helper */}
                <p className="text-[9.5px] text-slate-400 font-medium text-center mt-2.5">
                    Align guest QR code inside the viewfinder for instant 0.2s verification
                </p>
            </div>

            {/* 4. BOTTOM ACTION CONTROL BAR (Exact replica of ScannerApp.jsx lines 916-970) */}
            <div className="shrink-0 px-3 pt-2.5 pb-2 bg-white/90 backdrop-blur-2xl border-t border-slate-200/90 space-y-2 shadow-[0_-4px_25px_rgba(0,0,0,0.03)]">
                {/* Floating Real-Time Stats Bar */}
                <div className="grid grid-cols-3 gap-1.5 text-center">
                    <div className="p-2 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
                        <span className="text-[7.5px] uppercase font-bold text-slate-500 block tracking-wider">Total Guests</span>
                        <span className="text-xs font-black text-slate-900 font-mono">800</span>
                    </div>
                    <div className="p-2 rounded-2xl bg-sky-500/10 border border-sky-500/20 shadow-xs">
                        <span className="text-[7.5px] uppercase font-bold text-[#154F7C] block tracking-wider">Checked In</span>
                        <span className="text-xs font-black text-[#154F7C] font-mono">495 (62%)</span>
                    </div>
                    <div className="p-2 rounded-2xl bg-rose-50/90 border border-rose-200 shadow-xs">
                        <span className="text-[7.5px] uppercase font-bold text-rose-700 block tracking-wider">Rejected</span>
                        <span className="text-xs font-black text-rose-700 font-mono">3</span>
                    </div>
                </div>

                {/* Primary Actions Row */}
                <div className="flex items-center gap-1.5">
                    <div className="flex-1 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-[#154F7C] to-[#327FB5] text-white font-bold text-[10px] flex items-center justify-center gap-1.5 shadow-md shadow-[#154F7C]/25 border border-sky-400/25">
                        <Keyboard className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                        <span>Manual Pass Code Entry</span>
                    </div>

                    <div className="py-2.5 px-2.5 rounded-2xl bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center gap-1 shadow-md shadow-emerald-600/25 border border-emerald-400/30 shrink-0">
                        <CreditCard className="w-3.5 h-3.5 text-white" />
                        <span>POS</span>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center shadow-xs shrink-0">
                        <Zap className="w-3.5 h-3.5 text-[#154F7C]" />
                    </div>
                </div>

                {/* iOS Home Indicator Bar */}
                <div className="pt-0.5 flex justify-center">
                    <div className="w-28 h-1 bg-slate-300 rounded-full" />
                </div>
            </div>
        </div>
    );
}

// ── STEP 4 MOBILE: REAL KARDOVO TICKETING PORTAL — PAYOUTS TAB (TicketingPortal.jsx lines 2319-2531) ──
function MobilePayoutsDoorPOSScreen() {
    return (
        <div className="w-full h-full flex flex-col justify-between min-h-0 bg-[#F1F5F9] overflow-hidden">
            <KardovoMobileTopBar title="Ticketing" showNewEventButton={true} />

            <div className="p-2.5 sm:p-3 space-y-2.5 flex-1 overflow-hidden text-slate-800">
                <TicketingPortalHeaderAndTabs activeSection="payouts" />

                {/* Payout Account & 94% Revenue Split Card */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-3 space-y-2.5">
                    {/* Top: 94% Revenue Share Summary */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                            <h2 className="text-[11px] font-bold text-slate-900">
                                Payouts &amp; Earnings
                            </h2>
                            <span className="inline-flex items-center gap-1 text-[8px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-[#154F7C] border border-sky-500/20">
                                <ShieldCheck className="w-2.5 h-2.5" />
                                <span>94% Share</span>
                            </span>
                        </div>

                        {/* Net Payout Highlight + 2-Col Breakdown */}
                        <div className="p-2.5 rounded-xl bg-sky-50/70 border border-sky-500/25 flex items-center justify-between">
                            <div>
                                <div className="text-[8.5px] font-bold text-[#154F7C]">Net Payout (94%)</div>
                                <div className="text-sm font-black text-[#154F7C] leading-tight mt-0.5">TZS 25,239,000</div>
                            </div>
                            <span className="text-[9px] font-mono font-black text-[#154F7C] bg-sky-500/15 px-2 py-1 rounded-lg">
                                94%
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5">
                            <div className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200/70">
                                <div className="text-[7.5px] font-semibold text-slate-500">Gross Sales (100%)</div>
                                <div className="text-[10px] font-bold text-slate-900 mt-0.5">TZS 26,850,000</div>
                            </div>
                            <div className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200/70">
                                <div className="text-[7.5px] font-semibold text-slate-500">Platform Fee (6%)</div>
                                <div className="text-[10px] font-bold text-slate-700 mt-0.5">TZS 1,611,000</div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom: Payout Account Destination */}
                    <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[9.5px] font-bold text-slate-900">
                                Payout Account
                            </h3>
                            <span className="inline-flex items-center gap-0.5 text-[7.5px] font-bold text-emerald-700 bg-emerald-500/10 px-1.5 py-0.5 rounded-full shrink-0">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                <span>Saved</span>
                            </span>
                        </div>

                        {/* Method Selector */}
                        <div className="grid grid-cols-2 gap-1.5">
                            <div className="px-2 py-1.5 rounded-lg border bg-white border-[#154F7C] ring-1 ring-[#154F7C]/15 font-bold text-slate-900 flex items-center gap-1.5">
                                <Phone className="w-3 h-3 text-[#154F7C] shrink-0" />
                                <span className="text-[8.5px] font-bold truncate">Mobile Money</span>
                            </div>

                            <div className="px-2 py-1.5 rounded-lg border bg-white/60 border-slate-200 text-slate-600 flex items-center gap-1.5">
                                <Building2 className="w-3 h-3 text-[#154F7C] shrink-0" />
                                <span className="text-[8.5px] font-bold truncate">Bank Account</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 text-[8px]">
                            <div>
                                <div className="font-bold text-slate-600 mb-0.5">Network</div>
                                <div className="px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 font-semibold truncate">
                                    M-Pesa (Vodacom)
                                </div>
                            </div>
                            <div>
                                <div className="font-bold text-slate-600 mb-0.5">Phone Number</div>
                                <div className="px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 font-mono font-semibold truncate">
                                    0754 829 104
                                </div>
                            </div>
                        </div>

                        <div className="pt-0.5 flex justify-end">
                            <span className="px-3 py-1 rounded-lg bg-[#154F7C] text-white text-[8px] font-bold tracking-wide">
                                Save Account
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <KardovoMobileBottomNav activeNav="events" />
        </div>
    );
}

export default function HowItWorks() {
    const { lang, toggleLang, t } = useTicketingLanguage();
    const pageProps = usePage()?.props || {};
    const user = pageProps.auth?.user;

    const [isScrolled, setIsScrolled] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [authModalMode, setAuthModalMode] = useState('login');
    const [openFaqIndex, setOpenFaqIndex] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 40);
        };
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);


    const openAuthModal = (mode = 'login') => {
        setAuthModalMode(mode);
        setShowLoginModal(true);
    };

    const steps = [
        {
            key: 'step1',
            badge: lang === 'sw' ? 'Kuanzisha Haraka' : 'Quick Setup',
            stepNumber: '01',
            title: lang === 'sw' ? '1. Tengeneza & Simamia' : '1. Create & Manage',
            summary: lang === 'sw' 
                ? 'Sanidi tukio lako, viwango vya tiketi na pasi maalum kwa dakika chache' 
                : 'Set up events, custom ticket tiers, and luxury passes in minutes',
            description: lang === 'sw'
                ? 'Anza kwa sekunde chache ukitumia dashibodi yetu iliyonyooka. Sanidi viwango vya VIP na Kawaida, dhibiti idadi ya viti, na ubinafsishe muonekano wa pasi zako.'
                : 'Launch your event in minutes with Kardovo’s intuitive Organizer Studio. Define multi-tier pricing, lock inventory to prevent overselling, and customize luxury digital passes.',
            features: [
                {
                    icon: Layers,
                    title: lang === 'sw' ? 'Viwango vya Tiketi Visivyo na Kikomo' : 'Unlimited Multi-Tier Ticketing',
                    desc: lang === 'sw' ? 'VIP, VVIP, Early Bird, au Kawaida vyenye bei na idadi maalum ya viti.' : 'VIP, Early Bird, Regular, or Group tiers with custom pricing in TZS or USD.'
                },
                {
                    icon: Lock,
                    title: lang === 'sw' ? 'Kizuizi cha Uwezo (Zero Overselling)' : 'Real-Time Capacity & Inventory Lock',
                    desc: lang === 'sw' ? 'Kiwango kikikamilika, kinajifunga kiotomatiki na kuonyesha Sold Out.' : 'Atomic database row locking prevents overselling. Sold out tiers close instantly.'
                },
                {
                    icon: Clock,
                    title: lang === 'sw' ? 'Ratiba ya Kufunga Mauzo' : 'Automated Sales Deadlines',
                    desc: lang === 'sw' ? 'Weka muda maalum wa kufunga punguzo au endelea kuuza hadi getini.' : 'Set auto-close dates for promotional tickets or sell continuously until doors open.'
                },
                {
                    icon: Palette,
                    title: lang === 'sw' ? 'Pasi za Kidijitali za Kifahari' : 'Branded Digital Pass Customization',
                    desc: lang === 'sw' ? 'Bango la tukio, ramani ya ukumbi, maagizo ya mlangoni na taarifa za mgeni.' : 'Event cover artwork, Google maps venue directions, gate dress codes, and seat info.'
                }
            ],
            smallScreenLabel: 'Kardovo Ticketing Portal — Overview',
        },
        {
            key: 'step2',
            badge: lang === 'sw' ? 'Mauzo ya Juu' : 'High Conversion',
            stepNumber: '02',
            title: lang === 'sw' ? '2. Uza & Tangaza' : '2. Sell & Promote',
            summary: lang === 'sw' 
                ? 'Fikia maelfu ya wanunuzi kwa malipo rahisi ya mguso mmoja na kodi za punguzo' 
                : 'Reach thousands of attendees with instant 1-tap mobile checkout',
            description: lang === 'sw'
                ? 'Orodheshwa moja kwa moja kwenye soko kuu la tiketi la Kardovo Tanzania. Shiriki kiungo chako kwenye mitandao ya kijamii, weka kodi za punguzo na uwasilishe tiketi moja kwa moja WhatsApp & SMS.'
                : 'Get listed on Tanzania’s fastest-growing ticketing marketplace. Share instant 1-click links on Instagram and WhatsApp, run promo discount campaigns, and deliver tickets automatically.',
            features: [
                {
                    icon: ShoppingBag,
                    title: lang === 'sw' ? 'Kutangazwa Sokoni Kiotomatiki' : 'Featured Marketplace Showcase',
                    desc: lang === 'sw' ? 'Tukio lako linaonekana kwa maelfu ya wanunuzi kote Tanzania.' : 'Featured across concerts, festivals, nightlife, and corporate summits.'
                },
                {
                    icon: ExternalLink,
                    title: lang === 'sw' ? 'Kiungo Rahisi cha Mitandao (1-Click Link)' : '1-Click Social Media Checkout Links',
                    desc: lang === 'sw' ? 'Weka kwenye Instagram bio, TikTok au WhatsApp bila mteja kuanza kutafuta.' : 'Direct purchase links for your social bios, flyers, and promotional ads.'
                },
                {
                    icon: Smartphone,
                    title: lang === 'sw' ? 'Malipo ya Simu (M-Pesa, Tigo, Airtel)' : '1-Tap Mobile Money & Card Checkout',
                    desc: lang === 'sw' ? 'Wanunuzi wanalipa kwa urahisi kupitia M-Pesa, Tigo Pesa, Airtel Money, Halopesa na Kadi.' : 'Frictionless checkout supporting all Tanzanian MNOs and Visa/Mastercard.'
                },
                {
                    icon: MessageCircle,
                    title: lang === 'sw' ? 'Uwasilishaji wa Papo Hapo WhatsApp & SMS' : 'Instant WhatsApp & SMS Ticket Delivery',
                    desc: lang === 'sw' ? 'Mteja akilipa, tiketi yake inamfikia moja kwa moja WhatsApp na ujumbe wa SMS.' : 'Automated message dispatch delivers digital passes and QR codes in seconds.'
                }
            ],
            smallScreenLabel: 'Kardovo Ticketing Portal — Tickets & Tiers',
        },
        {
            key: 'step3',
            badge: lang === 'sw' ? 'Usalama wa 100%' : 'Bulletproof',
            stepNumber: '03',
            title: lang === 'sw' ? '3. Usalama & Msaada' : '3. Security & Support',
            summary: lang === 'sw' 
                ? 'Hakuna tiketi bandia, QR code zilizolindwa kihesabu na ulinzi wa roboti' 
                : 'Zero counterfeit passes, encrypted anti-tamper QR tokens, and 24/7 care',
            description: lang === 'sw'
                ? 'Hakuna tena tiketi za kugushi au wageni kuingia mara mbili. Kila tiketi inalindwa na kriptografia ya kisasa, na msaada wetu wa waandaaji unapatikana saa zote.'
                : 'Eliminate ticket fraud, scalper bots, and unauthorized gate re-entries. Every pass is backed by unique cryptographic tokens, immutable financial ledgers, and 24/7 concierge support.',
            features: [
                {
                    icon: QrCode,
                    title: lang === 'sw' ? 'QR Code Zenye Sahihi ya Siri (HMAC)' : 'Cryptographic Anti-Counterfeit Tokens',
                    desc: lang === 'sw' ? 'Kila tiketi ina tokeni iliyosimbwa kihesabu; haiwezi kughushiwa au kupigwa picha.' : 'Mathematically signed hash tokens render screenshots and photocopies useless.'
                },
                {
                    icon: ShieldCheck,
                    title: lang === 'sw' ? 'Kuzuia Kuingia Mara Mbili (Single-Entry Burn)' : 'Instant Gate Burn & Duplicate Block',
                    desc: lang === 'sw' ? 'Tiketi ikishakaguliwa mlangoni inafungwa; ikitumika tena inalia kengele ya onyo.' : 'Once scanned, passes burn instantly. Re-entry attempts trigger immediate alerts.'
                },
                {
                    icon: Shield,
                    title: lang === 'sw' ? 'Ulinzi wa Roboti na Malipo Mara Mbili' : 'Bot Defense & Idempotency Shield',
                    desc: lang === 'sw' ? 'Mitego ya roboti na vizuizi vya mtandao vinazuia walanguzi na makato mara mbili.' : 'Honeypots, session timestamps, and UUID idempotency protect every transaction.'
                },
                {
                    icon: Phone,
                    title: lang === 'sw' ? 'Msaada wa Saa 24 (Organizer Concierge)' : 'Dedicated 24/7 Organizer Support',
                    desc: lang === 'sw' ? 'Timu yetu ipo tayari kukusaidia saa zote kupitia WhatsApp, simu na ukumbini.' : 'Direct organizer hotline on WhatsApp, phone, and on-site gate coordination.'
                }
            ],
            smallScreenLabel: 'Kardovo Gate Scanner — Live Access Control',
        },
        {
            key: 'step4',
            badge: lang === 'sw' ? 'Mlangoni Haraka' : 'High Speed',
            stepNumber: '04',
            title: lang === 'sw' ? '4. Ufanisi wa Uendeshaji' : '4. Operational Efficiency',
            summary: lang === 'sw' 
                ? 'Uhakiki wa mlangoni chini ya sekunde moja, modi ya nje ya mtandao na mikanda' 
                : 'Sub-second entrance scanning, offline sync, and on-site door ticketing',
            description: lang === 'sw'
                ? 'Mageti yanaenda kwa kasi ya ajabu bila foleni. Hakuna kusimama hata kama mtandao ukikatika ukumbini, pamoja na uwezo wa kuuza tiketi mlangoni na kupokea fedha benki.'
                : 'Eliminate gate bottlenecks with sub-second camera check-ins. Keep scanning without interruption during venue internet blackouts, sell walk-in tickets, and receive direct bank payouts.',
            features: [
                {
                    icon: Zap,
                    title: lang === 'sw' ? 'App ya Kukagua Mlangoni (< 0.2s)' : 'Ultra-Fast Gate Scanner App',
                    desc: lang === 'sw' ? 'Simu yoyote ya kawaida inageuka kuwa skana ya kisasa inayohakiki kwa sekunde 0.2.' : 'Turn any smartphone into a high-speed scanner admitting attendees in under 0.2s.'
                },
                {
                    icon: Wifi,
                    title: lang === 'sw' ? 'Inafanya Kazi Bila Mtandao (Offline Sync)' : 'Offline Resilient Gate Validation',
                    desc: lang === 'sw' ? 'Mtandao ukikata, mageti yanaendelea kukagua bila kusita na kutuma data baadaye.' : 'Attendee databases cache locally. Gates keep scanning during complete outages.'
                },
                {
                    icon: CreditCard,
                    title: lang === 'sw' ? 'Mauzo ya Mlangoni (Door POS & Cashier Mode)' : 'Door POS & Cashier Mode',
                    desc: lang === 'sw' ? 'Uza tiketi kwa wanaofika ghafla ukumbini, pokea pesa taslimu au simu mara moja.' : 'Sell walk-in tickets at the entrance, accept cash or mobile money, and print wristbands.'
                },
                {
                    icon: Wallet,
                    title: lang === 'sw' ? 'Malipo Moja kwa Moja Benki au Simu' : 'Direct Bank & Mobile Money Settlements',
                    desc: lang === 'sw' ? 'Pata mapato yako ya mauzo moja kwa moja kwenye akaunti ya benki au namba ya simu.' : 'Automated revenue transfers to your Tanzanian bank account or mobile wallet.'
                }
            ],
            smallScreenLabel: 'Kardovo Ticketing Portal — Payouts & 94% Split',
        },
    ];

    const faqs = [
        {
            q: lang === 'sw' ? 'Je, ninapokeaje mapato ya mauzo ya tiketi zangu?' : 'How do I receive payouts from my ticket sales?',
            a: lang === 'sw'
                ? 'Mapato yanalipwa moja kwa moja kwenye akaunti yako ya benki au namba ya simu (M-Pesa, Tigo Pesa, Airtel Money) kulingana na ratiba unayochagua, pamoja na taarifa kamili ya mapato kwenye dashibodi yako.'
                : 'Payouts are transferred directly to your registered bank account or mobile money wallet (M-Pesa, Tigo Pesa, Airtel Money) according to your payout schedule, with full transparent transaction statements on your finance dashboard.'
        },
        {
            q: lang === 'sw' ? 'Je, ninaweza kuuza tiketi mlangoni siku ya tukio?' : 'Can I sell tickets at the venue door on the event day?',
            a: lang === 'sw'
                ? 'Ndio! Kardovo ina modi maalum ya Door POS & Cashier inayomwezesha mweka hazina au wahudumu kuuza tiketi kwa wageni wanaofika ghafla ukumbini na kutoa pasi au mikanda mara moja.'
                : 'Yes! Kardovo includes a built-in Door POS & Cashier Mode. Your gate staff can accept walk-ins, collect cash or mobile money, and instantly issue digital passes or print wristbands on the spot.'
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
        <div className="min-h-screen bg-white text-slate-800 flex flex-col font-sans selection:bg-[#154F7C] selection:text-white relative overflow-x-clip">
            <Head title={lang === 'sw' ? 'Jinsi Kardovo Ticketing Inavyofanya Kazi — Mwongozo wa Waandaaji' : 'How Kardovo Ticketing Works — Complete Organizer Guide'}>
                <meta name="description" content="Discover how Kardovo works for event organizers: create ticket tiers, accept 1-tap mobile payments, prevent counterfeit entries, and scan tickets at lightning speed." />
            </Head>

            {/* ══════════════════════════════════════════════════════════════
                1. TOP NAVBAR (Clean, Light, Minimalist like Tix.africa)
               ══════════════════════════════════════════════════════════════ */}
            <header className={`fixed top-0 left-0 right-0 z-50 w-full backdrop-blur-md transition-all duration-300 ${
                isScrolled
                    ? 'bg-white/95 border-b border-slate-200/80 shadow-xs'
                    : 'bg-white/85 border-b border-transparent'
            }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
                    {/* Brand Logo & Navigation */}
                    <div className="flex items-center gap-3 sm:gap-6 shrink-0">
                        <Link href="/" className="cursor-pointer focus:outline-none flex items-center shrink-0">
                            <KardovoLogo 
                                light={false} 
                                showText={true} 
                                textClassName="text-slate-900 text-base sm:text-lg font-black tracking-widest" 
                                imgClassName="h-8 w-8 sm:h-9 sm:w-9" 
                            />
                        </Link>

                        <Link
                            href="/"
                            className="px-2.5 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 shrink-0 text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                        >
                            <HomeIcon className="w-4 h-4 text-sky-600" />
                            <span>{t('Home')}</span>
                        </Link>

                        <Link
                            href={route('tickets.marketplace')}
                            className="px-2.5 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 shrink-0 text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                        >
                            <Ticket className="w-4 h-4 text-sky-600" />
                            <span className="hidden sm:inline">{lang === 'sw' ? 'Soko la Tiketi' : 'Ticket Marketplace'}</span>
                            <span className="sm:hidden">{lang === 'sw' ? 'Tiketi' : 'Tickets'}</span>
                        </Link>
                    </div>

                    {/* Right-Side Controls */}
                    <div className="flex items-center gap-2.5 sm:gap-3.5 text-xs sm:text-sm font-semibold shrink-0">
                        {/* Contact Us Button */}
                        <button 
                            type="button"
                            onClick={() => setShowContactModal(true)}
                            className="px-3 py-2 rounded-xl transition font-semibold inline-flex items-center cursor-pointer whitespace-nowrap text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                        >
                            <span>{t('Contact Us')}</span>
                        </button>

                        {/* Language Toggle */}
                        <button 
                            type="button"
                            onClick={toggleLang} 
                            className="flex items-center gap-1.5 px-2.5 py-2 transition-colors font-semibold cursor-pointer text-slate-700 hover:text-slate-900"
                            title={lang === 'en' ? 'Badili lugha kuwa Kiswahili' : 'Switch language to English'}
                        >
                            <Globe className="w-4 h-4 text-sky-600" />
                            <span>{lang === 'en' ? 'SWA' : 'ENG'}</span>
                        </button>

                        {user ? (
                            <Link
                                href={route('dashboard')}
                                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#154F7C] to-[#327FB5] hover:from-[#1A5C91] hover:to-[#3D8EC7] text-white text-xs sm:text-sm font-bold transition shadow-sm shadow-[#154F7C]/25 border border-sky-400/25 active:scale-95"
                            >
                                <span>{t('Dashboard')}</span>
                            </Link>
                        ) : (
                            <div className="flex items-center gap-2 sm:gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => openAuthModal('login')}
                                    className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold transition text-xs sm:text-sm cursor-pointer shadow-2xs active:scale-95 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/80"
                                >
                                    {t('Sign in')}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => openAuthModal('register')}
                                    className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#154F7C] to-[#327FB5] hover:from-[#1A5C91] hover:to-[#3D8EC7] text-white text-xs sm:text-sm font-bold transition shadow-sm shadow-[#154F7C]/25 border border-sky-400/25 cursor-pointer active:scale-95"
                                >
                                    <span>{lang === 'sw' ? 'Tengeneza Tukio' : 'Create an event'}</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* ══════════════════════════════════════════════════════════════
                2. HERO SECTION (Simple, Clean, Kardovo Theme & Colors)
               ══════════════════════════════════════════════════════════════ */}
            <section className="pt-32 sm:pt-40 pb-16 sm:pb-24 px-4 bg-white">
                <div className="max-w-4xl mx-auto text-center">
                    
                    {/* Main Headline with Kardovo Theme Accent */}
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-[#154F7C] tracking-tight leading-[1.18] mb-5 font-display">
                        {lang === 'sw' ? (
                            <>
                                Fanikisha tukio lako kwa chini ya{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-500 italic font-serif font-normal">
                                    dakika 10.
                                </span>
                            </>
                        ) : (
                            <>
                                Bring your next event to life in less than{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-500 italic font-serif font-normal">
                                    10
                                </span>{' '}
                                minutes.
                            </>
                        )}
                    </h1>

                    {/* Subtitle */}
                    <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed mb-8 sm:mb-9">
                        {lang === 'sw' 
                            ? 'Tengeneza matukio, uza tiketi, na ufikie watazamaji wako kwa urahisi. Kardovo inakupa zana zote za kuunda uzoefu wa kukumbukwa kuanzia mwanzo hadi mwisho.'
                            : 'Create events, sell tickets, and reach your audience easily. Kardovo gives you the tools to create a memorable experience from start to finish.'
                        }
                    </p>

                    {/* Prominent Center Call-to-Action with Kardovo Gradient */}
                    <div className="flex justify-center mb-12 sm:mb-16">
                        <button
                            type="button"
                            onClick={() => openAuthModal('register')}
                            className="px-8 py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-[#154F7C] to-[#327FB5] hover:from-[#1A5C91] hover:to-[#3D8EC7] text-white font-bold text-sm sm:text-base shadow-md shadow-[#154F7C]/25 border border-sky-400/25 hover:shadow-lg transition-all active:scale-95 cursor-pointer"
                        >
                            {lang === 'sw' ? 'Tengeneza tukio bure' : 'Create an event for free'}
                        </button>
                    </div>

                    {/* Dual Photography Showcase (Concert & Sports/Crowd side-by-side) */}
                    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8 text-left">
                        {/* Left Card: Live Stage / Concert Lighting */}
                        <div className="rounded-3xl sm:rounded-4xl overflow-hidden shadow-lg aspect-4/3 relative group bg-slate-900">
                            <img 
                                src="/images/categories/events.jpg" 
                                alt="Concerts & Live Events" 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                            <div className="absolute bottom-5 left-5 right-5 text-white">
                                <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider">
                                    Concerts & Festivals
                                </span>
                                <h3 className="text-base sm:text-lg font-bold mt-1 text-white drop-shadow-sm">
                                    Mobile Ticketing & Instant WhatsApp Delivery
                                </h3>
                            </div>
                        </div>

                        {/* Right Card: Stadium & High-Volume Crowds */}
                        <div className="rounded-3xl sm:rounded-4xl overflow-hidden shadow-lg aspect-4/3 relative group bg-slate-900">
                            <img 
                                src="/images/categories/sports.jpg" 
                                alt="Sports & Stadium Events" 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                            <div className="absolute bottom-5 left-5 right-5 text-white">
                                <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider">
                                    Sports & Large Crowds
                                </span>
                                <h3 className="text-base sm:text-lg font-bold mt-1 text-white drop-shadow-sm">
                                    Sub-Second Gate Scanning & Offline Validation
                                </h3>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                3. ALTERNATING 4 STEPS (Orbital Infographic & iPhone Showcase)
               ══════════════════════════════════════════════════════════════ */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-24 sm:space-y-32">
                {steps.map((step, idx) => {
                    const isEven = idx % 2 === 1;
                    const nodePalettes = [
                        { start: '#117534', end: '#0D9488', numColor: '#117534', arc: 'M 15 16 A 35 35 0 0 1 65 16', dot1: [15, 16], dot2: [65, 16] },
                        { start: '#0D9488', end: '#008EE8', numColor: '#0D9488', arc: 'M 64 15 A 35 35 0 0 1 64 65', dot1: [64, 15], dot2: [64, 65] },
                        { start: '#008EE8', end: '#154F7C', numColor: '#008EE8', arc: 'M 15 64 A 35 35 0 0 0 65 64', dot1: [15, 64], dot2: [65, 64] },
                        { start: '#154F7C', end: '#1E3A8A', numColor: '#154F7C', arc: 'M 16 15 A 35 35 0 0 0 16 65', dot1: [16, 15], dot2: [16, 65] },
                    ];

                    return (
                        <div 
                            key={step.key} 
                            className={`grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center ${
                                isEven ? 'lg:flex-row-reverse' : ''
                            }`}
                        >
                            {/* Infographic & Copy Column (Left for odd, Right for even) */}
                            <div className={`lg:col-span-7 space-y-8 ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                                {/* Clean Editorial Header */}
                                <div className="space-y-3 max-w-xl">
                                    <h2 className="text-3xl sm:text-4xl md:text-[2.6rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-500 font-display tracking-tight leading-tight pb-1">
                                        {step.title}
                                    </h2>

                                    <p className="text-base sm:text-lg text-slate-500 font-medium leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>

                                {/* 4-Node Orbital Disc Infographic Grid (Matching Welcome.jsx Infographic Language) */}
                                <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8 pt-2">
                                    {step.features.map((feat, fIdx) => {
                                        const FeatIcon = feat.icon || Check;
                                        const palette = nodePalettes[fIdx % nodePalettes.length];
                                        const gradId = `stepOrbitalGrad-${idx}-${fIdx}`;

                                        return (
                                            <div
                                                key={fIdx}
                                                className="group flex items-start gap-4 sm:p-2 transition-transform duration-300 hover:-translate-y-0.5"
                                            >
                                                {/* Orbital Infographic Disc (Matching Welcome.jsx Circular Discs) */}
                                                <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                                                    <svg
                                                        className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
                                                        viewBox="0 0 80 80"
                                                        fill="none"
                                                    >
                                                        <defs>
                                                            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                                                                <stop offset="0%" stopColor={palette.start} />
                                                                <stop offset="100%" stopColor={palette.end} />
                                                            </linearGradient>
                                                        </defs>

                                                        {/* Dashed Guide Orbit */}
                                                        <circle
                                                            cx="40"
                                                            cy="40"
                                                            r="35"
                                                            stroke="#94A3B8"
                                                            strokeWidth="1.2"
                                                            strokeDasharray="4 4"
                                                            className="opacity-55"
                                                        />

                                                        {/* Colored Brand Gradient Orbital Arc */}
                                                        <path
                                                            d={palette.arc}
                                                            stroke={`url(#${gradId})`}
                                                            strokeWidth="3.2"
                                                            strokeLinecap="round"
                                                        />

                                                        {/* Terminal Anchor Dots */}
                                                        <circle cx={palette.dot1[0]} cy={palette.dot1[1]} r="2.2" fill="#64748B" />
                                                        <circle cx={palette.dot2[0]} cy={palette.dot2[1]} r="2.2" fill="#64748B" />
                                                    </svg>

                                                    {/* Raised White Center Medallion */}
                                                    <div className="w-12 h-12 rounded-full bg-white shadow-[0_12px_28px_rgba(11,37,69,0.10),0_3px_8px_rgba(0,0,0,0.04)] flex items-center justify-center relative z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_18px_36px_rgba(11,37,69,0.18)]">
                                                        <FeatIcon className="w-5 h-5 text-slate-800 stroke-[1.8] group-hover:scale-115 transition-transform duration-300" />
                                                    </div>
                                                </div>

                                                {/* Infographic Text Content */}
                                                <div className="flex-1 min-w-0 pt-0.5">
                                                    <span
                                                        className="block text-xs font-black uppercase font-mono tracking-wider mb-0.5"
                                                        style={{ color: palette.numColor }}
                                                    >
                                                        0{fIdx + 1}
                                                    </span>

                                                    <h4 className="text-[15px] font-bold text-slate-900 leading-snug mb-1">
                                                        {feat.title}
                                                    </h4>

                                                    <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed font-normal">
                                                        {feat.desc}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* UI Screenshot Mockup Column (Exclusively Small Screen in LIGHT MODE) */}
                            <div className={`lg:col-span-5 flex justify-center ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                                <SmartphoneMockup>
                                    {step.key === 'step1' && <MobileTicketingOverviewScreen />}
                                    {step.key === 'step2' && <MobileTicketsStudioScreen />}
                                    {step.key === 'step3' && <MobileGateSentinelScreen />}
                                    {step.key === 'step4' && <MobilePayoutsDoorPOSScreen />}
                                </SmartphoneMockup>
                            </div>
                        </div>
                    );
                })}
            </main>

            {/* ══════════════════════════════════════════════════════════════
                4. FREQUENTLY ASKED QUESTIONS (FAQ) SECTION (Landing Page Style)
               ══════════════════════════════════════════════════════════════ */}
            <section id="faq" className="py-16 sm:py-24 bg-white scroll-mt-20">
                <div className="max-w-4xl mx-auto px-6 w-full">
                    <div className="text-center mb-10 sm:mb-12">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-500 mb-3 font-display pb-1">
                            {lang === 'sw' ? 'Maswali Yanayoulizwa Sana (FAQ)' : 'Frequently Asked Questions (FAQ)'}
                        </h2>
                        <p className="text-slate-500 text-base sm:text-lg">
                            {lang === 'sw' 
                                ? 'Pata majibu ya maswali muhimu kuhusu matumizi ya Kardovo.' 
                                : 'Get answers to the most common questions about using Kardovo.'}
                        </p>
                    </div>
                    <div className="bg-slate-50 rounded-3xl p-6 md:p-10 shadow-xs">
                        {faqs.map((faq, idx) => {
                            const isOpen = openFaqIndex === idx;
                            return (
                                <div key={idx} className="border-b border-slate-200/60 last:border-0">
                                    <button 
                                        type="button"
                                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)} 
                                        className="flex items-center justify-between w-full py-5 text-left cursor-pointer group focus:outline-none"
                                    >
                                        <span className="font-bold text-slate-800 group-hover:text-emerald-600 transition-colors pr-6 text-sm sm:text-base">
                                            {faq.q}
                                        </span>
                                        <span className={`transform transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180' : ''}`}>
                                            <svg className="w-5 h-5 text-slate-400 group-hover:text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </span>
                                    </button>
                                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}>
                                        <p className="text-slate-600 leading-relaxed text-sm sm:text-base">{faq.a}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                5. "HAVE MORE QUESTIONS? REACH OUT TO US" BANNER (Contact Us)
               ══════════════════════════════════════════════════════════════ */}
            <section className="bg-white py-16 sm:py-20 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="relative overflow-hidden rounded-3xl sm:rounded-4xl bg-gradient-to-r from-[#154F7C] via-[#1B5D91] to-[#0A2B47] text-white p-8 sm:p-12 lg:p-14 shadow-2xl shadow-[#154F7C]/25 border border-sky-400/25 text-center">
                        {/* Background Glows */}
                        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-400/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
                        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

                        <div className="relative z-10 max-w-xl mx-auto">
                            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-sky-300 flex items-center justify-center mx-auto mb-5 shadow-inner">
                                <MessageCircle className="w-7 h-7 stroke-[2.2]" />
                            </div>

                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-display tracking-tight text-white">
                                {lang === 'sw' ? 'Una maswali zaidi?' : 'Have more questions?'}
                            </h2>
                            
                            <p className="text-sm sm:text-base text-sky-100 mt-3 font-medium leading-relaxed">
                                {lang === 'sw' 
                                    ? 'Wasiliana nasi wakati wowote — tunafurahi sana kukusaidia kufanikisha tukio lako!'
                                    : 'Reach out to us - we are happy to help!'}
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
                                <button
                                    type="button"
                                    onClick={() => setShowContactModal(true)}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white text-[#154F7C] hover:bg-sky-50 text-sm font-black transition-all shadow-lg shadow-black/10 hover:scale-105 active:scale-95 cursor-pointer"
                                >
                                    <Phone className="w-4 h-4 text-[#154F7C]" />
                                    <span>{lang === 'sw' ? 'Wasiliana Nasi' : 'Contact Us'}</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => openAuthModal('register')}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/30 text-sm font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer"
                                >
                                    <span>{lang === 'sw' ? 'Anza Bila Gharama' : 'Get Started Free'}</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                6. KARDOVO OFFICIAL FOOTER
               ══════════════════════════════════════════════════════════════ */}
            <KardovoFooter lang={lang} />

            {/* Sign In / Sign Up Modal */}
            <Modal show={showLoginModal} onClose={() => setShowLoginModal(false)} maxWidth="lg" closeable={true} translucent={true}>
                <div className="relative">
                    <button 
                        onClick={() => setShowLoginModal(false)}
                        className="absolute top-4 right-4 z-50 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all cursor-pointer border border-slate-200/80 shadow-2xs"
                        aria-label="Close modal"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <div className="max-h-[90vh] overflow-y-auto overflow-x-hidden custom-scrollbar">
                        <Login asModal={true} initialMode={authModalMode} />
                    </div>
                </div>
            </Modal>

            {/* Contact Us Modal */}
            <Modal show={showContactModal} onClose={() => setShowContactModal(false)} maxWidth="md" closeable={true} translucent={true}>
                <div className="relative p-6 sm:p-8 bg-white dark:bg-[#0B2545] rounded-3xl text-slate-800 dark:text-white shadow-2xl">
                    <button 
                        type="button"
                        onClick={() => setShowContactModal(false)}
                        className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white transition-all cursor-pointer border border-slate-200/80 dark:border-white/15 shadow-2xs"
                        aria-label="Close modal"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    <div className="text-center mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-[#154F7C] to-[#327FB5] text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-[#154F7C]/25 border border-sky-400/25">
                            <MessageCircle className="w-6 h-6 stroke-[2.2]" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white font-display tracking-tight">
                            {lang === 'sw' ? 'Wasiliana na Kardovo' : 'Reach Out to Us'}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-300 mt-1">
                            {lang === 'sw' ? 'Tunafurahi kukusaidia! Chagua njia unayopendelea hapa chini:' : 'We are happy to help! Choose your preferred channel below:'}
                        </p>
                    </div>

                    <div className="space-y-3">
                        <a 
                            href="https://wa.me/255758222222?text=Hello%20Kardovo%20Team%2C%20I%20need%20assistance%20with%20organizing%20an%20event"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100/80 border border-emerald-200/80 dark:border-emerald-500/30 transition-all text-emerald-900 dark:text-emerald-200 group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                                <MessageCircle className="w-5 h-5 fill-current" />
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                                <div className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">WhatsApp 24/7</div>
                                <div className="text-xs font-bold text-slate-800 dark:text-white truncate">+255 758 222 222</div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-emerald-500 group-hover:translate-x-1 transition-transform" />
                        </a>

                        <a 
                            href="tel:+255758222222"
                            className="flex items-center gap-4 p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100/80 border border-sky-200/80 dark:border-sky-500/30 transition-all text-sky-900 dark:text-sky-200 group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-[#154F7C] text-white flex items-center justify-center shrink-0 shadow-xs">
                                <Phone className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                                <div className="text-xs font-black uppercase tracking-wider text-[#154F7C] dark:text-sky-400">{lang === 'sw' ? 'Piga Simu' : 'Direct Call'}</div>
                                <div className="text-xs font-bold text-slate-800 dark:text-white truncate">+255 758 222 222</div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-sky-600 group-hover:translate-x-1 transition-transform" />
                        </a>

                        <a 
                            href="mailto:support@kardovo.com"
                            className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100/80 dark:hover:bg-white/10 border border-slate-200 dark:border-white/15 transition-all text-slate-800 dark:text-white group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-slate-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                                <div className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Email Support</div>
                                <div className="text-xs font-bold text-slate-800 dark:text-white truncate">support@kardovo.com</div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                        </a>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
