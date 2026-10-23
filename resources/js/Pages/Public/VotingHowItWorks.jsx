import React, { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import KardovoLogo from '@/Components/KardovoLogo';
import KardovoFooter from '@/Components/KardovoFooter';
import Modal from '@/Components/Modal';
import Login from '@/Pages/Auth/Login';
import {
    Trophy,
    Vote,
    BarChart3,
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
    Keyboard,
    Coins,
    Award,
    Eye,
    EyeOff,
    FileSpreadsheet,
    Share2,
    Download,
    Receipt
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

            {/* Center: Authentic iPhone Dynamic Island */}
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

// Mobile topbar for Voting Organizer Portal
function KardovoMobileTopBar({ title = 'Voting Portal', showNewContestButton = true }) {
    return (
        <div className="shrink-0">
            <PhoneStatusBar bgClass="bg-[#0B2545]" textClass="text-white/95" />

            <div className="bg-[#0B2545] text-white border-b border-[#173860] shadow-xs px-3.5 h-10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="flex-shrink-0 flex items-center">
                        <KardovoLogo light={true} showText={false} imgClassName="h-5 w-5" />
                    </div>
                    <div className="h-3.5 w-px bg-white/20 flex-shrink-0" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider font-display truncate min-w-0">
                        {title}
                    </span>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                    {showNewContestButton && (
                        <div className="inline-flex items-center gap-1 px-2 py-1 text-[9.5px] font-bold text-white bg-[#154F7C] rounded-lg shadow-xs">
                            <Plus className="w-2.5 h-2.5" />
                            <span>New Contest</span>
                        </div>
                    )}

                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-white/[0.08] border border-white/[0.1]">
                        <Moon className="w-3 h-3 text-sky-300" />
                    </div>

                    <div className="w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center shrink-0 border border-white/[0.15] bg-white/[0.08]">
                        <UserIcon className="w-3 h-3 text-slate-200" />
                    </div>
                </div>
            </div>
        </div>
    );
}

// Mobile bottom navigation bar
function KardovoMobileBottomNav({ activeNav = 'voting' }) {
    const items = [
        { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
        { id: 'voting', name: 'Voting', icon: Trophy },
        { id: 'nominees', name: 'Nominees', icon: Users },
        { id: 'analytics', name: 'Tallies', icon: BarChart3 },
        { id: 'more', name: 'More', icon: Menu },
    ];

    return (
        <div className="shrink-0 bg-[#0B2545] border-t border-[#173860]">
            <div className="px-2 pt-1.5 pb-1 flex items-center justify-around">
                {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeNav === item.id;
                    return (
                        <div key={item.id} className="flex-1 flex flex-col items-center justify-center py-0.5 rounded-xl">
                            <div className={`relative px-2.5 py-0.5 rounded-full ${isActive ? 'bg-sky-500/20 text-sky-400' : 'text-slate-400'}`}>
                                <Icon className={`w-3.5 h-3.5 ${isActive ? 'stroke-[2.5] text-sky-400' : 'stroke-[2]'}`} />
                                {isActive && (
                                    <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.8)]" />
                                )}
                            </div>
                            <span className={`text-[8.5px] tracking-tight mt-0.5 ${isActive ? 'font-black text-sky-400' : 'font-semibold text-slate-400'}`}>
                                {item.name}
                            </span>
                        </div>
                    );
                })}
            </div>

            <div className="pb-2 pt-0.5 flex justify-center">
                <div className="w-28 h-1 bg-white/35 rounded-full" />
            </div>
        </div>
    );
}

// Voting Portal Competition Header Component
function VotingPortalMiniHeader({ eventTitle = 'SERENGETI CREATIVE AWARDS 2026', isLive = true }) {
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-1 text-[9px] font-semibold text-slate-500">
                <ArrowLeft className="w-2.5 h-2.5" />
                <span>All Competitions</span>
            </div>

            <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                    <img
                        src="/images/categories/events.jpg"
                        alt=""
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="min-w-0 flex-1">
                    <h4 className="text-[11px] font-extrabold text-slate-900 tracking-tight truncate font-display">
                        {eventTitle}
                    </h4>

                    <div className="mt-0.5 flex items-center gap-x-2 text-[8.5px] text-slate-500 flex-wrap">
                        <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-semibold uppercase text-[7px]">
                            Annual Gala
                        </span>
                        <span className="inline-flex items-center gap-0.5">
                            <Calendar className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                            <span>Fri, 20 Nov 2026</span>
                        </span>
                        <span className="inline-flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                            <span>Dar es Salaam</span>
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-1.5 pt-0.5">
                <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[8.5px] font-semibold text-slate-700 bg-white border border-slate-200 shadow-2xs">
                    <span className={`relative w-4 h-2.5 rounded-full transition-colors shrink-0 ${isLive ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                        <span className={`absolute top-[1px] w-1.5 h-1.5 rounded-full bg-white shadow transition-transform ${isLive ? 'right-[1px]' : 'left-[1px]'}`} />
                    </span>
                    <span>{isLive ? 'Voting open' : 'Voting closed'}</span>
                </div>

                <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[8.5px] font-semibold text-slate-700 bg-white border border-slate-200 shadow-2xs">
                    <Copy className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                    <span>Copy link</span>
                </div>

                <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[8.5px] font-semibold text-slate-700 bg-white border border-slate-200 shadow-2xs">
                    <ExternalLink className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                    <span>Preview</span>
                </div>

                <div className="inline-flex items-center justify-center w-6 h-6 rounded-lg text-slate-500 bg-white border border-slate-200 ml-auto shadow-2xs">
                    <Settings className="w-3 h-3" />
                </div>
            </div>
        </div>
    );
}

// ── STEP 1 MOBILE: REAL KARDOVO VOTING PORTAL — OVERVIEW & SETUP ──
function MobileVotingOverviewScreen() {
    return (
        <div className="w-full h-full flex flex-col justify-between min-h-0 bg-[#F1F5F9] overflow-hidden">
            <KardovoMobileTopBar title="Voting Portal" showNewContestButton={true} />

            <div className="p-3 space-y-2.5 flex-1 overflow-y-auto scrollbar-none text-slate-800">
                <VotingPortalMiniHeader isLive={true} />

                {/* 2 Clean Stat Cards */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                        <span className="text-[8px] font-semibold text-slate-500 uppercase tracking-wider block">Total Votes</span>
                        <span className="text-sm font-black text-slate-900 font-mono block mt-0.5">42,850</span>
                        <span className="text-[7.5px] text-slate-400 block mt-0.5">Official tallies</span>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                        <span className="text-[8px] font-semibold text-emerald-700 uppercase tracking-wider block">Net Payout (94%)</span>
                        <span className="text-sm font-black text-emerald-700 font-mono block mt-0.5 truncate">TZS 20,139,500</span>
                        <span className="text-[7.5px] text-slate-400 block mt-0.5">Direct to Bank/M-Pesa</span>
                    </div>
                </div>

                {/* Finish Setup Checklist Card */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="p-3 border-b border-slate-100">
                        <h2 className="text-[11px] font-extrabold text-slate-900 tracking-tight">Finish setup</h2>
                        <p className="text-[8.5px] text-slate-500 mt-0.5">Complete these 3 steps to start collecting votes.</p>
                        <div className="mt-2 flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                <div className="h-full bg-[#154F7C] rounded-full w-2/3" />
                            </div>
                            <span className="text-[8.5px] font-semibold text-slate-500 tabular-nums">2 of 3 done</span>
                        </div>
                    </div>

                    <div className="divide-y divide-slate-100 text-[9px]">
                        {/* Step 1 */}
                        <div className="px-3 py-2 flex items-center justify-between gap-2">
                            <div className="flex items-start gap-2 min-w-0">
                                <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[8px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                    <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                                </span>
                                <div className="min-w-0">
                                    <div className="text-[9.5px] font-bold text-slate-900">Add categories &amp; nominees</div>
                                    <div className="text-[8px] text-slate-500">4 categories, 24 nominees added</div>
                                </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-lg text-[8px] font-bold bg-white text-slate-700 border border-slate-200 shrink-0">
                                Manage
                            </span>
                        </div>

                        {/* Step 2 (Highlighted Next Step) */}
                        <div className="px-3 py-2 bg-sky-50/70 flex items-center justify-between gap-2">
                            <div className="flex items-start gap-2 min-w-0">
                                <span className="w-4 h-4 rounded-full bg-[#154F7C] text-white text-[8.5px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                    2
                                </span>
                                <div className="min-w-0">
                                    <div className="text-[9.5px] font-bold text-slate-900">Add payout account</div>
                                    <div className="text-[8px] text-slate-500 leading-snug">Where to send your 94% vote revenue</div>
                                </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-lg text-[8px] font-bold bg-[#154F7C] text-white shadow-2xs shrink-0">
                                Add account
                            </span>
                        </div>

                        {/* Step 3 */}
                        <div className="px-3 py-2 flex items-center justify-between gap-2">
                            <div className="flex items-start gap-2 min-w-0">
                                <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[8px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                    <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                                </span>
                                <div className="min-w-0">
                                    <div className="text-[9.5px] font-bold text-slate-900">Open voting &amp; share link</div>
                                    <div className="text-[8px] text-slate-500">Voting is live and public</div>
                                </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-lg text-[8px] font-bold bg-white text-slate-700 border border-slate-200 shrink-0">
                                Live
                            </span>
                        </div>
                    </div>
                </div>

                {/* Public Voting Link Card */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-3">
                    <h2 className="text-[10px] font-bold text-slate-900">Public voting link</h2>
                    <p className="text-[8.5px] text-slate-500 mt-0.5">Share with voters on WhatsApp, Instagram &amp; TikTok.</p>
                    <div className="mt-2 flex items-center gap-1.5">
                        <div className="flex-1 min-w-0 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[8.5px] text-slate-700 truncate">
                            https://kardovo.com/e/serengeti-awards
                        </div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[9px] font-bold text-white bg-[#154F7C] shadow-xs shrink-0">
                            <Copy className="w-2.5 h-2.5" />
                            <span>Copy</span>
                        </span>
                    </div>
                </div>
            </div>

            <KardovoMobileBottomNav activeNav="voting" />
        </div>
    );
}

// ── STEP 2 MOBILE: REAL KARDOVO CATEGORIES & NOMINEES STUDIO ──
function MobileVotingCategoriesStudioScreen() {
    const nominees = [
        {
            id: '101',
            number: '101',
            name: 'Amani Juma',
            votes: '18,450',
            pct: '43%',
            color: 'bg-sky-100 text-sky-800 border-sky-300',
        },
        {
            id: '102',
            number: '102',
            name: 'Zawadi Baraka',
            votes: '14,120',
            pct: '33%',
            color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        },
        {
            id: '103',
            number: '103',
            name: 'Neema Mwangi',
            votes: '10,280',
            pct: '24%',
            color: 'bg-purple-100 text-purple-800 border-purple-300',
        },
    ];

    return (
        <div className="w-full h-full flex flex-col justify-between min-h-0 bg-[#F1F5F9] overflow-hidden">
            <KardovoMobileTopBar title="Voting Portal" showNewContestButton={true} />

            <div className="p-3 space-y-2.5 flex-1 overflow-y-auto scrollbar-none text-slate-800">
                <VotingPortalMiniHeader isLive={true} />

                {/* 2-Section Tabs Switcher */}
                <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-[9.5px] bg-gradient-to-r from-[#154F7C] to-[#327FB5] text-white shadow-xs border border-sky-400/25">
                        <Trophy className="w-3 h-3" />
                        <span>Categories &amp; Nominees</span>
                        <span className="text-[8px] font-mono px-1.5 py-0.2 rounded-full bg-white/20 text-white">4</span>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-[9.5px] text-slate-600 bg-white border border-slate-200">
                        <Receipt className="w-3 h-3" />
                        <span>Audit Ledger</span>
                        <span className="text-[8px] font-mono px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">48</span>
                    </div>
                </div>

                {/* Category Card */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="p-3 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                            <h4 className="text-[11px] font-extrabold text-slate-900 truncate">Artist of the Year 2026</h4>
                            <p className="text-[8.5px] text-slate-500 mt-0.5">TZS 500 per vote · 3 active nominees</p>
                        </div>
                        <span className="px-2 py-1 rounded-lg bg-[#154F7C] text-white text-[8.5px] font-bold shadow-2xs shrink-0 flex items-center gap-1">
                            <Plus className="w-2.5 h-2.5" />
                            <span>Add Nominee</span>
                        </span>
                    </div>

                    {/* Nominees List */}
                    <div className="divide-y divide-slate-100 text-[9.5px]">
                        {nominees.map((cand) => (
                            <div key={cand.id} className="p-2.5 flex items-center justify-between gap-2 hover:bg-slate-50/60 transition">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className={`w-8 h-8 rounded-xl font-black text-[10px] flex items-center justify-center shrink-0 border ${cand.color}`}>
                                        #{cand.number}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-bold text-slate-900 truncate">{cand.name}</div>
                                        <div className="text-[8px] text-slate-400 font-mono mt-0.5">kardovo.com/vote/{cand.id}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2.5 shrink-0">
                                    <div className="text-right">
                                        <div className="font-mono font-black text-slate-900">{cand.votes}</div>
                                        <div className="text-[8px] text-slate-400">{cand.pct} of votes</div>
                                    </div>
                                    <span className="p-1.5 rounded-lg bg-sky-50 text-[#154F7C] border border-sky-100 flex items-center gap-1 text-[8px] font-bold shadow-2xs">
                                        <Share2 className="w-2.5 h-2.5" />
                                        <span>Share</span>
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Direct Campaign Link Card */}
                <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1.5">
                    <div className="flex items-center justify-between text-[9px] font-bold text-slate-900">
                        <span className="flex items-center gap-1.5">
                            <Share2 className="w-3 h-3 text-[#154F7C]" />
                            <span>1-Tap Contestant Direct Link</span>
                        </span>
                        <span className="text-emerald-600 font-semibold">Active</span>
                    </div>
                    <p className="text-[8px] text-slate-500">
                        Each nominee gets a unique link to put in their Instagram bio &amp; WhatsApp status.
                    </p>
                    <div className="mt-1 flex items-center gap-1.5">
                        <div className="flex-1 min-w-0 px-2 py-1 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[8px] text-slate-700 truncate">
                            https://kardovo.com/vote-for-me/101
                        </div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[8.5px] font-bold text-white bg-[#154F7C] shadow-2xs shrink-0">
                            <Copy className="w-2.5 h-2.5" />
                            <span>Copy</span>
                        </span>
                    </div>
                </div>
            </div>

            <KardovoMobileBottomNav activeNav="voting" />
        </div>
    );
}

// ── STEP 3 MOBILE: REAL KARDOVO VOTER EXPERIENCE & USSD PUSH CHECKOUT ──
function MobileVotingVoterPushScreen() {
    const [selectedPkg, setSelectedPkg] = useState(1); // 10 votes default
    const [selectedOperator, setSelectedOperator] = useState('Mpesa');
    const [isUssdActive, setIsUssdActive] = useState(false);

    const packages = [
        { qty: 1, amount: '500', isPopular: false },
        { qty: 10, amount: '5,000', isPopular: true },
        { qty: 50, amount: '25,000', isPopular: false },
    ];

    const operators = [
        { id: 'Mpesa', name: 'M-Pesa', activeClass: 'border-2 border-red-500 text-red-600 bg-red-50/80 shadow-2xs' },
        { id: 'Tigo', name: 'Tigo Pesa', activeClass: 'border-2 border-blue-500 text-blue-600 bg-blue-50/80 shadow-2xs' },
        { id: 'Airtel', name: 'Airtel', activeClass: 'border-2 border-rose-500 text-rose-600 bg-rose-50/80 shadow-2xs' },
        { id: 'Halopesa', name: 'HaloPesa', activeClass: 'border-2 border-orange-500 text-orange-600 bg-orange-50/80 shadow-2xs' },
    ];

    return (
        <div className="w-full h-full flex flex-col justify-between min-h-0 bg-[#F8FAFC] text-slate-900 overflow-hidden font-sans">
            {/* Top Status & Authentic Public Header matching CandidateDirectVote.jsx */}
            <div className="shrink-0 bg-white border-b border-slate-200/90 shadow-2xs">
                <PhoneStatusBar bgClass="bg-white" textClass="text-slate-900" />
                <div className="px-3.5 h-10 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[9.5px] font-semibold text-slate-600">
                        <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
                        <span>All Nominees</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <img
                            src="/images/kardovo_logo_transparent.png"
                            alt="Kardovo"
                            className="w-5 h-5 object-contain shrink-0"
                            style={{ width: 20, height: 20 }}
                        />
                        <span className="text-[11px] font-black tracking-widest text-slate-900 uppercase font-display">
                            KARDOVO
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Content: Exact Kardovo VotingModal.jsx */}
            {!isUssdActive ? (
                <div className="flex-1 p-3 flex flex-col justify-between overflow-y-auto scrollbar-none min-h-0 bg-[#F8FAFC]">
                    {/* Voting Modal Window */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
                        {/* Modal Header (Exact replica of VotingModal.jsx lines 190-210) */}
                        <div className="px-3 py-2 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2 min-w-0">
                                <div className="w-7 h-7 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-[#154F7C] shrink-0">
                                    <Trophy className="w-3.5 h-3.5" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-[11px] font-bold text-slate-900 leading-tight">
                                        Cast Your Vote
                                    </h3>
                                    <p className="text-[8px] text-slate-500 truncate">
                                        Artist of the Year
                                    </p>
                                </div>
                            </div>
                            <span className="w-5 h-5 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                                ✕
                            </span>
                        </div>

                        {/* Candidate Highlight Strip (Exact replica of VotingModal.jsx lines 213-238) */}
                        <div className="px-3 py-2 bg-sky-50/60 border-b border-sky-100/70 flex items-center gap-2.5 shrink-0">
                            <img
                                src="/images/categories/events.jpg"
                                alt="Amani Juma"
                                className="w-8 h-8 rounded-xl object-cover border border-sky-200 shadow-2xs shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-[#154F7C] text-white shrink-0">
                                        #101
                                    </span>
                                    <h4 className="text-[10.5px] font-bold text-slate-900 truncate">
                                        Amani Juma
                                    </h4>
                                </div>
                                <p className="text-[8px] text-slate-500 truncate mt-0.5">
                                    Serengeti Creative Awards 2026
                                </p>
                            </div>
                        </div>

                        {/* Modal Form Elements */}
                        <div className="p-3 space-y-2">
                            {/* Choose Vote Package */}
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[8.5px] font-bold text-slate-700">Select Vote Package</span>
                                    <span className="text-[7.5px] text-slate-400">Bulk advantage</span>
                                </div>
                                <div className="grid grid-cols-3 gap-1.5">
                                    {packages.map((pkg, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setSelectedPkg(idx)}
                                            className={`p-1.5 rounded-xl border text-center relative transition cursor-pointer ${
                                                selectedPkg === idx
                                                    ? 'border-[#154F7C] bg-sky-50/80 ring-2 ring-[#154F7C]/20 shadow-2xs'
                                                    : 'border-slate-200 bg-white hover:border-slate-300'
                                            }`}
                                        >
                                            {pkg.isPopular && (
                                                <span className="absolute -top-1.5 right-1 px-1 py-0.2 rounded-full bg-amber-500 text-white text-[6.5px] font-black uppercase tracking-wider">
                                                    Popular
                                                </span>
                                            )}
                                            <p className={`text-[8.5px] font-bold ${selectedPkg === idx ? 'text-[#154F7C]' : 'text-slate-800'}`}>
                                                {pkg.qty} {pkg.qty === 1 ? 'Vote' : 'Votes'}
                                            </p>
                                            <p className={`text-[9.5px] font-black mt-0.5 ${selectedPkg === idx ? 'text-[#154F7C]' : 'text-slate-600'}`}>
                                                TZS {pkg.amount}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Payment Method Switcher (from VotingModal.jsx) */}
                            <div>
                                <span className="text-[8px] font-bold text-slate-700 block mb-1">Payment Method</span>
                                <div className="flex rounded-lg bg-slate-100 p-0.5 gap-1">
                                    <div className="flex-1 py-1 px-2 rounded-md text-[8px] font-bold bg-white text-[#154F7C] shadow-2xs flex items-center justify-center gap-1">
                                        <Smartphone className="w-2.5 h-2.5" />
                                        <span>Mobile Money</span>
                                    </div>
                                    <div className="flex-1 py-1 px-2 rounded-md text-[8px] font-semibold text-slate-500 flex items-center justify-center gap-1">
                                        <CreditCard className="w-2.5 h-2.5" />
                                        <span>Card</span>
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Operator Selection */}
                            <div>
                                <span className="text-[8px] font-bold text-slate-700 block mb-1">Select Mobile Operator</span>
                                <div className="grid grid-cols-4 gap-1 text-center font-bold text-[8px]">
                                    {operators.map((op) => (
                                        <button
                                            key={op.id}
                                            type="button"
                                            onClick={() => setSelectedOperator(op.id)}
                                            className={`py-1 rounded-lg border transition cursor-pointer ${
                                                selectedOperator === op.id
                                                    ? op.activeClass
                                                    : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                                            }`}
                                        >
                                            {op.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Phone Number Input */}
                            <div>
                                <span className="text-[8px] font-bold text-slate-700 block mb-1">Payment Mobile Number</span>
                                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white font-mono text-[9.5px]">
                                    <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                    <span className="font-bold text-slate-900">0754 123 456</span>
                                    <span className="ml-auto text-[7px] font-bold text-emerald-600 uppercase bg-emerald-50 px-1 py-0.2 rounded">
                                        Vodacom OK
                                    </span>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="button"
                                onClick={() => setIsUssdActive(true)}
                                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#154F7C] to-[#327FB5] hover:from-[#124268] hover:to-[#2b72a6] text-white font-bold text-[10px] shadow-sm shadow-[#154F7C]/25 flex items-center justify-center gap-1.5 transition active:scale-98 cursor-pointer"
                            >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>Pay TZS {packages[selectedPkg].amount} &amp; Cast {packages[selectedPkg].qty} {packages[selectedPkg].qty === 1 ? 'Vote' : 'Votes'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Bottom Security & USSD Info Notice */}
                    <div className="pt-1.5 text-center">
                        <div className="inline-flex items-center gap-1 text-[7.5px] font-bold text-slate-500">
                            <Zap className="w-2.5 h-2.5 text-amber-500" />
                            <span>Instant USSD Push Notification · Verified by AzamPay Gateway</span>
                        </div>
                    </div>
                </div>
            ) : (
                /* WAITING USSD STATE (Exact replica of VotingModal.jsx lines 298-318) */
                <div className="flex-1 p-3 flex flex-col justify-between overflow-y-auto scrollbar-none min-h-0 bg-[#F8FAFC] space-y-2.5">
                    {/* Waiting Spinner Notice */}
                    <div className="text-center py-2.5 space-y-1.5 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-3">
                        <div className="relative w-9 h-9 mx-auto">
                            <div className="absolute inset-0 rounded-full border-3 border-sky-100" />
                            <div className="w-9 h-9 rounded-full border-3 border-[#154F7C] border-t-transparent animate-spin" />
                        </div>
                        <div>
                            <h4 className="text-[11px] font-black text-slate-900">
                                Waiting for Mobile Money PIN...
                            </h4>
                            <p className="text-[8px] text-slate-500 mt-0.5 max-w-[240px] mx-auto leading-relaxed">
                                USSD push sent to <span className="font-mono font-bold text-slate-800">0754 123 456</span> via M-Pesa.
                            </p>
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-[8px] text-slate-600 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Listening for confirmation...</span>
                        </div>
                    </div>

                    {/* Authentic Cellular USSD Push Prompt Dialog */}
                    <div className="bg-slate-900 text-white rounded-2xl p-3 shadow-xl border border-slate-700/80 space-y-2">
                        <div className="flex items-center justify-between text-[8px] text-slate-400 border-b border-slate-800 pb-1.5">
                            <div className="flex items-center gap-1.5 font-bold text-white">
                                <Smartphone className="w-3 h-3 text-red-400" />
                                <span>VODACOM M-PESA</span>
                            </div>
                            <span className="font-mono text-[7px] text-emerald-400">● LIVE PUSH</span>
                        </div>

                        <div className="text-[9px] text-slate-200 leading-snug space-y-1">
                            <p>
                                Do you want to pay <span className="font-bold text-white">TZS 5,000</span> to <span className="font-bold text-sky-400">KARDOVO</span>?
                            </p>
                            <p className="text-[8px] text-slate-400 font-mono">
                                Ref: AZAM-VOTE-88210 · 10 Votes for Amani Juma
                            </p>
                        </div>

                        <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-between">
                            <span className="text-[8px] text-slate-400">Enter M-Pesa PIN:</span>
                            <span className="font-mono font-black tracking-widest text-emerald-400 text-xs">••••</span>
                        </div>

                        <div className="flex items-center gap-2 pt-0.5 text-[8.5px] font-bold">
                            <button
                                type="button"
                                onClick={() => setIsUssdActive(false)}
                                className="flex-1 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-center cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsUssdActive(false)}
                                className="flex-1 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 text-center flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                            >
                                <Check className="w-2.5 h-2.5" />
                                <span>Confirm PIN</span>
                            </button>
                        </div>
                    </div>

                    {/* Anti-Bot Explanation Note */}
                    <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-[8px] text-emerald-800 space-y-0.5">
                        <div className="font-bold flex items-center gap-1 text-[8.5px]">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>100% Anti-Bot Protection</span>
                        </div>
                        <p className="text-emerald-700 leading-tight">
                            Automated bots cannot enter cellular PINs. Only authentic transactions increment the verified ledger.
                        </p>
                    </div>

                    {/* Return link */}
                    <button
                        type="button"
                        onClick={() => setIsUssdActive(false)}
                        className="w-full py-1 text-slate-500 hover:text-slate-800 text-[8.5px] font-bold text-center cursor-pointer"
                    >
                        ← Back to Package Selection
                    </button>
                </div>
            )}

            {/* Bottom iOS Home Indicator */}
            <div className="shrink-0 pb-2 pt-1 flex justify-center bg-white border-t border-slate-100">
                <div className="w-28 h-1 bg-slate-300 rounded-full" />
            </div>
        </div>
    );
}

// ── STEP 4 MOBILE: REAL KARDOVO PAYOUTS, LIVE/SECRET TALLIES & AUDIT LEDGER ──
function MobileVotingPayoutsLeaderboardScreen() {
    const tallies = [
        { name: 'Amani Juma', code: '#101', votes: '18,450', pct: 43, color: 'bg-[#154F7C]' },
        { name: 'Zawadi Baraka', code: '#102', votes: '14,120', pct: 33, color: 'bg-sky-500' },
        { name: 'Neema Mwangi', code: '#103', votes: '10,280', pct: 24, color: 'bg-slate-400' },
    ];

    return (
        <div className="w-full h-full flex flex-col justify-between min-h-0 bg-[#F1F5F9] overflow-hidden">
            <KardovoMobileTopBar title="Voting Portal" showNewContestButton={true} />

            <div className="p-3 space-y-2.5 flex-1 overflow-y-auto scrollbar-none text-slate-800">
                <VotingPortalMiniHeader isLive={true} />

                {/* 2-Section Tabs Switcher */}
                <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-[9.5px] text-slate-600 bg-white border border-slate-200">
                        <Trophy className="w-3 h-3" />
                        <span>Categories &amp; Nominees</span>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-[9.5px] bg-gradient-to-r from-[#154F7C] to-[#327FB5] text-white shadow-xs border border-sky-400/25">
                        <Receipt className="w-3 h-3" />
                        <span>Audit Ledger &amp; Payouts</span>
                    </div>
                </div>

                {/* Payouts & 94% Revenue Share Card */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-3 space-y-2">
                    <div className="flex items-center justify-between gap-1.5">
                        <h2 className="text-[10.5px] font-bold text-slate-900">Organizer Payouts</h2>
                        <span className="inline-flex items-center gap-1 text-[8px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-[#154F7C] border border-sky-500/20">
                            <ShieldCheck className="w-2.5 h-2.5" />
                            <span>94% Revenue Share</span>
                        </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                        <div className="flex items-baseline justify-between text-[8.5px] text-slate-500">
                            <span>Total Ingested (42,850 votes)</span>
                            <span className="font-mono font-bold text-slate-900 text-[9.5px]">TZS 21,425,000</span>
                        </div>
                        <div className="flex items-baseline justify-between text-[8.5px] text-slate-500">
                            <span>Kardovo Fee (6%)</span>
                            <span className="font-mono text-slate-600 text-[9px]">- TZS 1,285,500</span>
                        </div>
                        <div className="pt-1.5 border-t border-slate-200 flex items-baseline justify-between text-emerald-700">
                            <span className="text-[9px] font-bold">Your Net Payout (94%)</span>
                            <span className="text-sm font-mono font-black">TZS 20,139,500</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-[8px] text-slate-500 pt-0.5">
                        <span>Settlement Destination:</span>
                        <span className="font-mono font-bold text-slate-800">CRDB Bank •••• 4892 (Instant)</span>
                    </div>

                    {/* Live Tallies vs Secret Blackout Switch */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div>
                            <p className="text-[9.5px] font-bold text-slate-900">Show Live Tallies</p>
                            <p className="text-[8px] text-slate-500">Public sees real-time counts. Switch off for Blackout Mode.</p>
                        </div>
                        <span className="relative w-7 h-4 rounded-full bg-emerald-500 shrink-0">
                            <span className="absolute top-[2px] right-[2px] w-3 h-3 rounded-full bg-white shadow" />
                        </span>
                    </div>
                </div>

                {/* Verified Tallies Leaderboard Table */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="p-2.5 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-[9.5px] font-bold text-slate-900">Live Verified Tallies &amp; Ledger</span>
                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">AzamPay Synced</span>
                    </div>

                    <div className="divide-y divide-slate-100 text-[9px] p-2.5 space-y-2">
                        {tallies.map((t, idx) => (
                            <div key={idx} className="space-y-1 pt-1 first:pt-0">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-mono font-bold text-slate-500 text-[8px]">{t.code}</span>
                                        <span className="font-bold text-slate-900">{t.name}</span>
                                    </div>
                                    <div className="font-mono font-bold text-[#154F7C] text-[9.5px]">
                                        {t.votes} <span className="text-[8px] text-slate-400 font-normal">({t.pct}%)</span>
                                    </div>
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className={`h-full ${t.color} rounded-full`} style={{ width: `${t.pct}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[8.5px] font-bold text-slate-700 flex items-center gap-1">
                            <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
                            <span>Export Audit Ledger</span>
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-[#154F7C] font-bold text-[8.5px] shadow-2xs">
                            <Download className="w-2.5 h-2.5" />
                            <span>.CSV (42,850 records)</span>
                        </span>
                    </div>
                </div>
            </div>

            <KardovoMobileBottomNav activeNav="voting" />
        </div>
    );
}

// ══════════════════════════════════════════════════════════════
// MAIN VOTING HOW IT WORKS COMPONENT (EXACT REPLICA OF HOWITWORKS.JSX)
// ══════════════════════════════════════════════════════════════

export default function VotingHowItWorks() {
    const pageProps = usePage()?.props || {};
    const user = pageProps.auth?.user;

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
                ? 'Sanidi shindano lako, weka vipengele vya tuzo na wagombea kwa dakika chache'
                : 'Set up competitions, award categories, and nominees in minutes',
            description: lang === 'sw'
                ? 'Anza kwa sekunde chache ukitumia dashibodi yetu iliyonyooka ya waandaaji. Sanidi vipengele kama Wimbo Bora wa Mwaka au Mwanamitindo Bora, weka picha zenye ubora za wagombea na ubinafsishe viwango vya bei za kura.'
                : 'Launch your voting competition in minutes with Kardovo’s intuitive Organizer Studio. Define multiple award categories, upload contestant headshots, and set custom price-per-vote tiers with bulk voter packages.',
            features: [
                {
                    icon: Layers,
                    title: lang === 'sw' ? 'Vipengele vya Tuzo Visivyo na Kikomo' : 'Unlimited Award Categories',
                    desc: lang === 'sw' ? 'Weka vipengele vingi vya tuzo kama Wimbo Bora, Msanii Chipukizi au Muongozaji Bora.' : 'Create distinct contest categories within a single ceremony with custom criteria.'
                },
                {
                    icon: Users,
                    title: lang === 'sw' ? 'Profaili na Namba za Wagombea' : 'Nominee Headshots & Voting Codes',
                    desc: lang === 'sw' ? 'Kila mgombea anapata namba maalum (kodi), picha na wasifu wake.' : 'Contestant headshots, biographical blurbs, and memorable SMS/web voting codes.'
                },
                {
                    icon: Clock,
                    title: lang === 'sw' ? 'Mwisho wa Kura Kiotomatiki' : 'Automated Voting Deadlines',
                    desc: lang === 'sw' ? 'Kura hujifunga kiotomatiki saa na dakika iliyopangwa bila kuchelewa.' : 'Contests close precisely down to the second when the official deadline passes.'
                },
                {
                    icon: Palette,
                    title: lang === 'sw' ? 'Mabango na Muonekano Maalum' : 'Custom Artwork & Competition Branding',
                    desc: lang === 'sw' ? 'Weka bango la shindano, nembo ya wadhamini na maelezo rasmi ya jinsi ya kupiga kura.' : 'Branded contest banner, sponsor logos, official rules, and verified organizer profile.'
                }
            ],
            smallScreenLabel: 'Kardovo Voting Portal — Overview',
        },
        {
            key: 'step2',
            badge: lang === 'sw' ? 'Ushiriki wa Juu' : 'High Engagement',
            stepNumber: '02',
            title: lang === 'sw' ? '2. Shiriki & Kusanya Kura' : '2. Share & Collect Votes',
            summary: lang === 'sw'
                ? 'Viungo maalum vya kila mgombea vya mitandao ya kijamii na vifurushi vya kura'
                : '1-click contestant campaign links for Instagram & WhatsApp virality',
            description: lang === 'sw'
                ? 'Orodheshwa moja kwa moja kwenye saraka ya kura ya Kardovo. Kila mgombea anapata kiungo chake maalum cha kampeni anachoweza kuweka kwenye Instagram bio, TikTok au WhatsApp ili mashabiki wapige kura kwa mguso mmoja.'
                : 'Get listed on Tanzania’s leading voting portal. Each contestant receives a dedicated direct campaign link to place on Instagram, TikTok, and WhatsApp, enabling supporters to cast multiple votes in seconds.',
            features: [
                {
                    icon: Share2,
                    title: lang === 'sw' ? 'Viungo Maalum vya Wagombea' : 'Direct Nominee Campaign Links',
                    desc: lang === 'sw' ? 'Kiungo cha moja kwa moja kinachofungua mgombea mara moja bila mteja kumtafuta.' : 'Vanity URLs (kardovo.com/vote-for-me/...) opening straight to nominee vote cards.'
                },
                {
                    icon: Coins,
                    title: lang === 'sw' ? 'Vifurushi vya Kura (Bulk Voting)' : 'Discounted Bulk Vote Packages',
                    desc: lang === 'sw' ? 'Wapiga kura wanaweza kununua kura 1, 10, 50 au 100 kwa malipo moja tu ya simu.' : 'Fans can purchase 1, 10, 50, or 100 votes in a single friction-free checkout.'
                },
                {
                    icon: Trophy,
                    title: lang === 'sw' ? 'Kutangazwa kwenye Saraka ya Kura' : 'Featured Marketplace Directory',
                    desc: lang === 'sw' ? 'Shindano lako linaonekana kwa maelfu ya watumiaji kote nchini Tanzania.' : 'Featured across our top showcase row with active banners and spotlight exposure.'
                },
                {
                    icon: MessageCircle,
                    title: lang === 'sw' ? 'Ujumbe wa Uthibitisho Papo Hapo' : 'Instant SMS & WhatsApp Receipts',
                    desc: lang === 'sw' ? 'Mteja anapata stakabadhi rasmi yenye namba ya kumbukumbu ya muamala.' : 'Automated notifications confirm the vote tally with official Azampay payment refs.'
                }
            ],
            smallScreenLabel: 'Kardovo Voting Portal — Categories & Nominees',
        },
        {
            key: 'step3',
            badge: lang === 'sw' ? 'Usalama wa 100%' : 'Bulletproof',
            stepNumber: '03',
            title: lang === 'sw' ? '3. Usalama & Uthibiti wa Kura' : '3. Security & Anti-Fraud',
            summary: lang === 'sw'
                ? 'Malipo ya simu ya USSD push, kuzuia boti (bots) na hakuna kura hewa'
                : 'Direct operator USSD push prompts and immutable audit trails',
            description: lang === 'sw'
                ? 'Hakuna tena mizozo ya kura hewa au kuchezewa kwa matokeo. Kila kura ina muamala halisi wa kibenki uliothibitishwa kupitia Azampay na mitandao ya simu (M-Pesa, Tigo, Airtel, HaloPesa) kwa usalama wa hali ya juu.'
                : 'Eliminate voting controversies, bot manipulation, and contested results. Every single vote requires authentic mobile money verification backed by immutable financial ledgers and licensed payment gateways.',
            features: [
                {
                    icon: Smartphone,
                    title: lang === 'sw' ? 'Ujumbe wa Moja kwa Moja Simuni (USSD Push)' : 'Instant USSD Push Payment Prompts',
                    desc: lang === 'sw' ? 'Mteja anaweka namba na anapata ujumbe wa PIN kwenye simu yake ya mkononi.' : 'Supporters receive a prompt on their mobile handset to enter their MNO PIN.'
                },
                {
                    icon: ShieldCheck,
                    title: lang === 'sw' ? 'Uthibiti Dhidi ya Boti (Anti-Bot)' : '100% Bot & Manipulation Defense',
                    desc: lang === 'sw' ? 'Boti haziwezi kuweka PIN ya USSD, hivyo mfumo unalinda usahihi wa washindi.' : 'Automated bots cannot clear cellular USSD authentication, preventing ghost votes.'
                },
                {
                    icon: Zap,
                    title: lang === 'sw' ? 'Uhesabuji wa Kura Papo Hapo' : 'Real-Time Vote Counting',
                    desc: lang === 'sw' ? 'Kura zinaongezwa moja kwa moja kwenye matokeo sekunde ile ile malipo yanapokamilika.' : 'Tallies update instantly the moment mobile money payment is confirmed.'
                },
                {
                    icon: Lock,
                    title: lang === 'sw' ? 'Kumbukumbu ya Kila Kura' : 'Tamper-Proof Audit Trail',
                    desc: lang === 'sw' ? 'Kila kura ina namba maalum ya muamala wa AzamPay kwa uwazi na ukaguzi wa 100%.' : 'Every vote is backed by an official AzamPay reference ID for 100% transparency.'
                }
            ],
            smallScreenLabel: 'Kardovo Voter Flow — Secure Mobile Checkout',
        },
        {
            key: 'step4',
            badge: lang === 'sw' ? 'Uwazi & Mapato' : 'Transparency & Payouts',
            stepNumber: '04',
            title: lang === 'sw' ? '4. Utoaji wa Mapato & Matokeo' : '4. Payouts & Ceremony Reveal',
            summary: lang === 'sw'
                ? 'Mapato ya 94% moja kwa moja benki au simu, kuficha/kuonyesha kura na CSV'
                : '94% net payouts, live or secret tally controls, and 1-click CSV export',
            description: lang === 'sw'
                ? 'Muandaaji anapokea 94% ya mapato yote yaliyokusanywa moja kwa moja kwenye akaunti yake ya benki au namba ya simu. Pia una uwezo wa kuweka matokeo wazi au kuyaficha (Secret Mode) hadi siku ya fainali.'
                : 'Receive 94% of gross voting revenue transferred directly to your bank account or mobile wallet. Toggle public real-time tallies on or switch to Blackout Mode to save the grand winner announcement for awards night.',
            features: [
                {
                    icon: Wallet,
                    title: lang === 'sw' ? 'Malipo ya 94% ya Moja kwa Moja' : 'Direct 94% Net Revenue Payouts',
                    desc: lang === 'sw' ? 'Fedha zinahamishiwa akaunti yako ya benki au simu bila urasimu au kucheleweshwa.' : 'Automated settlements transferred straight to your registered bank account or wallet.'
                },
                {
                    icon: Eye,
                    title: lang === 'sw' ? 'Kuficha/Kuonyesha Kura (Tally Control)' : 'Live Tally or Secret Blackout Switch',
                    desc: lang === 'sw' ? 'Chagua kama wananchi waone matokeo moja kwa moja au yafichwe hadi jukwaani.' : 'Maintain electrifying suspense by hiding counts before the grand gala finale.'
                },
                {
                    icon: FileSpreadsheet,
                    title: lang === 'sw' ? 'Pakua Ripoti Kamili ya CSV' : 'One-Click Audit CSV Export',
                    desc: lang === 'sw' ? 'Pakua orodha kamili ya kura zote, namba za simu zilizofichwa, na marejeo ya fedha.' : 'Export audit-ready spreadsheets containing exact timestamps and transaction IDs.'
                },
                {
                    icon: TrendingUp,
                    title: lang === 'sw' ? 'Takwimu za Mapato na Kasi ya Kura' : 'Real-Time Financial & Vote Analytics',
                    desc: lang === 'sw' ? 'Fuatilia mwenendo wa kura kwa saa, mapato ya kila kipengele na wagombea kinara.' : 'Live organizer graphs tracking hourly voting surges and revenue distribution.'
                }
            ],
            smallScreenLabel: 'Kardovo Voting Portal — Payouts & 94% Split',
        },
    ];

    const faqs = [
        {
            q: lang === 'sw' ? 'Je, wapiga kura wanapigaje kura kupitia Kardovo?' : 'How do voters cast their votes on Kardovo?',
            a: lang === 'sw'
                ? 'Wapiga kura wanafungua ukurasa wa shindano au kiungo maalum cha mgombea. Wanachagua idadi ya kura, wanachagua mtandao wao wa simu (M-Pesa, Tigo Pesa, Airtel Money, HaloPesa au Kadi), wanaingiza namba ya simu, na wanathibitisha malipo kupitia ujumbe wa USSD kwenye simu zao papo hapo bila kuhitaji kusajili akaunti ngumu.'
                : 'Voters open the contest link or click a contestant’s direct share link. They select their vote package, pick their mobile operator (M-Pesa, Tigo Pesa, Airtel Money, HaloPesa, or Card), enter their phone number, and approve the instant USSD prompt on their handset without downloading any apps.'
        },
        {
            q: lang === 'sw' ? 'Je, ninaweza kuficha idadi ya kura hadi siku ya ugawaji tuzo?' : 'Can organizers hide the vote counts until the award ceremony?',
            a: lang === 'sw'
                ? 'Ndio! Mwandaaji ana uhuru kamili kupitia kitufe cha "Show Live Tallies" kwenye dashibodi. Unaweza kuonyesha matokeo wakati wa kuanza, na kuyageuza kuwa ya siri (Hidden Blackout Mode) kabla ya siku ya kilele ili kuongeza msisimko na shauku ya washindi.'
                : 'Yes! Organizers have full control via the "Show Live Tallies" toggle on their dashboard. You can keep tallies visible during the nomination phase and switch to hidden mode before the grand finale to maintain suspense.'
        },
        {
            q: lang === 'sw' ? 'Je, ninapokeaje mapato ya kura na baada ya muda gani?' : 'How and when do organizers receive their voting revenue?',
            a: lang === 'sw'
                ? 'Mapato yanalipwa moja kwa moja kwenye akaunti yako ya benki au namba ya simu (M-Pesa, Tigo Pesa, Airtel Money). Muandaaji anapokea 94% ya mapato yote yaliyokusanywa (ada ya 6% inagharamia mitandao ya simu na usalama wa seva). Pamoja na taarifa kamili ya mapato kwenye dashibodi yako.'
                : 'Payouts are transferred directly to your registered bank account or mobile money wallet. Organizers receive 94% of collected revenue (a small 6% fee covers mobile telco gateway processing and infrastructure), with full transparent financial statements on your portal.'
        },
        {
            q: lang === 'sw' ? 'Je, wagombea wanaweza kutuma viungo vyao moja kwa moja mitandaoni?' : 'Can contestants share direct voting links on social media?',
            a: lang === 'sw'
                ? 'Ndio! Kila mgombea anapata kiungo chake binafsi cha kampeni (mfano: kardovo.com/vote-for-me/101) ambacho kikibonyezwa kinafungua moja kwa moja ukurasa wake wa kupigiwa kura. Mgombea anaweza kukiweka kwenye bio ya Instagram, TikTok au WhatsApp bila mashabiki kuanza kumtafuta.'
                : 'Yes! Every nominee receives a dedicated direct campaign link (e.g. kardovo.com/vote-for-me/101) that opens straight to their voting card with one tap. Contestants can easily place it in their Instagram bio, TikTok, or WhatsApp status.'
        },
        {
            q: lang === 'sw' ? 'Je, Kardovo inazuiwaje udanganyifu na kura hewa?' : 'How does Kardovo prevent fraud, duplicate votes, and bot attacks?',
            a: lang === 'sw'
                ? 'Kila kura lazima iwe na muamala halisi uliothibitishwa na benki/mtandao wa simu kupitia Azampay. Mifumo ya roboti (bots) haiwezi kupiga kura hewa kwa sababu haziwezi kuweka namba ya siri (PIN) ya USSD. Kila kura inahifadhiwa na kumbukumbu kamili ya ukaguzi wa kifedha.'
                : 'Every vote requires a verified, cleared monetary transaction through Azampay’s licensed payment infrastructure. Bots cannot generate fraudulent votes because script injections cannot pass real-time cellular USSD authentication. Every vote maps to an immutable transaction reference.'
        },
        {
            q: lang === 'sw' ? 'Kuna gharama zozote za mwezi au za kuanza?' : 'Are there any upfront or monthly subscription fees?',
            a: lang === 'sw'
                ? 'Hapana! Hakuna malipo yoyote ya awali, hakuna ada ya mwezi na hakuna mkataba unaokufunga. Unalipia tu asilimia ndogo ya 6% kwa kura zilizolipwa pekee. Kuanzisha shindano ni bure kabisa.'
                : 'Zero upfront cost, zero monthly subscriptions, and no contracts. Kardovo only deducts a transparent 6% fee from paid votes. Setting up your competition is completely free.'
        },
    ];

    return (
        <div className="min-h-screen bg-white text-slate-800 flex flex-col font-sans selection:bg-[#154F7C] selection:text-white relative overflow-x-clip">
            <Head title={lang === 'sw' ? 'Jinsi Kardovo Voting Inavyofanya Kazi — Mwongozo wa Waandaaji' : 'How Kardovo Voting Works — Complete Organizer Guide'}>
                <meta name="description" content="Discover how Kardovo works for awards and competition organizers: define categories, collect 1-tap mobile money votes via USSD push, prevent fraudulent votes, and reveal winners with live or secret tallies." />
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
                            <span>{lang === 'sw' ? 'Nyumbani' : 'Home'}</span>
                        </Link>

                        <Link
                            href={typeof route === 'function' && route().has && route().has('voting.index') ? route('voting.index') : '/voting'}
                            className="px-2.5 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 shrink-0 text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                        >
                            <Trophy className="w-4 h-4 text-sky-600" />
                            <span>{lang === 'sw' ? 'Kura' : 'Voting'}</span>
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
                            <span>{lang === 'sw' ? 'Wasiliana Nasi' : 'Contact Us'}</span>
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
                                href={typeof route === 'function' && route().has && route().has('dashboard') ? route('dashboard') : '/dashboard'}
                                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#154F7C] to-[#327FB5] hover:from-[#1A5C91] hover:to-[#3D8EC7] text-white text-xs sm:text-sm font-bold transition shadow-sm shadow-[#154F7C]/25 border border-sky-400/25 active:scale-95"
                            >
                                <span>{lang === 'sw' ? 'Dashibodi' : 'Dashboard'}</span>
                            </Link>
                        ) : (
                            <div className="flex items-center gap-2 sm:gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => openAuthModal('login')}
                                    className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold transition text-xs sm:text-sm cursor-pointer shadow-2xs active:scale-95 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/80"
                                >
                                    {lang === 'sw' ? 'Ingia' : 'Sign in'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => openAuthModal('register')}
                                    className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#154F7C] to-[#327FB5] hover:from-[#1A5C91] hover:to-[#3D8EC7] text-white text-xs sm:text-sm font-bold transition shadow-sm shadow-[#154F7C]/25 border border-sky-400/25 cursor-pointer active:scale-95"
                                >
                                    <span>{lang === 'sw' ? 'Anzisha Shindano' : 'Create a contest'}</span>
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
                                Fanikisha kura za shindano lako kwa chini ya{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-500 italic font-serif font-normal">
                                    dakika 10.
                                </span>
                            </>
                        ) : (
                            <>
                                Bring your next voting competition to life in less than{' '}
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
                            ? 'Tengeneza mashindano, weka vipengele na wagombea, na uwezeshe malipo rahisi ya simu (M-Pesa, Airtel, Tigo, HaloPesa). Kardovo inakupa zana zote za kura za kuaminika kuanzia mwanzo hadi kilele cha ugawaji tuzo.'
                            : 'Create awards and competitions, define categories and nominees, and accept frictionless mobile money votes via USSD push. Kardovo gives you the tools to run transparent, dispute-free voting from start to finish.'
                        }
                    </p>

                    {/* Prominent Center Call-to-Action with Kardovo Gradient */}
                    <div className="flex justify-center mb-12 sm:mb-16">
                        <button
                            type="button"
                            onClick={() => openAuthModal('register')}
                            className="px-8 py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-[#154F7C] to-[#327FB5] hover:from-[#1A5C91] hover:to-[#3D8EC7] text-white font-bold text-sm sm:text-base shadow-md shadow-[#154F7C]/25 border border-sky-400/25 hover:shadow-lg transition-all active:scale-95 cursor-pointer"
                        >
                            {lang === 'sw' ? 'Anzisha shindano bure' : 'Create a competition for free'}
                        </button>
                    </div>

                    {/* Dual Photography Showcase */}
                    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8 text-left">
                        {/* Left Card: Music Awards & Gala Stage */}
                        <div className="rounded-3xl sm:rounded-4xl overflow-hidden shadow-lg aspect-4/3 relative group bg-slate-900">
                            <img 
                                src="/images/categories/events.jpg" 
                                alt="Music Awards & Galas" 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                            <div className="absolute bottom-5 left-5 right-5 text-white">
                                <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider">
                                    Awards &amp; Galas
                                </span>
                                <h3 className="text-base sm:text-lg font-bold mt-1 text-white drop-shadow-sm">
                                    Instant USSD Push Voting &amp; Social Campaign Links
                                </h3>
                            </div>
                        </div>

                        {/* Right Card: Beauty Pageants & Public Contests */}
                        <div className="rounded-3xl sm:rounded-4xl overflow-hidden shadow-lg aspect-4/3 relative group bg-slate-900">
                            <img 
                                src="/images/categories/fashion.jpg" 
                                alt="Pageants & Contests" 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                            <div className="absolute bottom-5 left-5 right-5 text-white">
                                <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider">
                                    Pageants &amp; Talent Contests
                                </span>
                                <h3 className="text-base sm:text-lg font-bold mt-1 text-white drop-shadow-sm">
                                    Live or Secret Tallies &amp; 94% Direct Bank Payouts
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
                            {/* Infographic & Copy Column */}
                            <div className={`lg:col-span-7 space-y-8 ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                                <div className="space-y-3 max-w-xl">
                                    <h2 className="text-3xl sm:text-4xl md:text-[2.6rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-500 font-display tracking-tight leading-tight pb-1">
                                        {step.title}
                                    </h2>

                                    <p className="text-base sm:text-lg text-slate-500 font-medium leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>

                                {/* 4-Node Orbital Disc Infographic Grid */}
                                <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8 pt-2">
                                    {step.features.map((feat, fIdx) => {
                                        const FeatIcon = feat.icon || Check;
                                        const palette = nodePalettes[fIdx % nodePalettes.length];
                                        const gradId = `votingOrbitalGrad-${idx}-${fIdx}`;

                                        return (
                                            <div
                                                key={fIdx}
                                                className="group flex items-start gap-4 sm:p-2 transition-transform duration-300 hover:-translate-y-0.5"
                                            >
                                                {/* Orbital Infographic Disc */}
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

                            {/* UI Screenshot Mockup Column in LIGHT MODE */}
                            <div className={`lg:col-span-5 flex justify-center ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                                <SmartphoneMockup>
                                    {step.key === 'step1' && <MobileVotingOverviewScreen />}
                                    {step.key === 'step2' && <MobileVotingCategoriesStudioScreen />}
                                    {step.key === 'step3' && <MobileVotingVoterPushScreen />}
                                    {step.key === 'step4' && <MobileVotingPayoutsLeaderboardScreen />}
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
                                ? 'Pata majibu ya maswali muhimu kuhusu kuendesha kura za mashindano na Kardovo.' 
                                : 'Get answers to the most common questions about running voting competitions on Kardovo.'}
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
                                    ? 'Wasiliana nasi wakati wowote — tunafurahi sana kukusaidia kufanikisha shindano lako!'
                                    : 'Reach out to us anytime - we are happy to assist you in running your competition!'}
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
                            href="https://wa.me/255737672987?text=Habari%20Kardovo,%20nahitaji%20msaada%20kuhusu%20kuendesha%20kura%20za%20mashindano."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100/80 border border-emerald-200/80 dark:border-emerald-500/30 transition-all text-emerald-900 dark:text-emerald-200 group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                                <MessageCircle className="w-5 h-5 fill-current" />
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                                <div className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">WhatsApp 24/7</div>
                                <div className="text-xs font-bold text-slate-800 dark:text-white truncate">+255 737 672 987</div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-emerald-500 group-hover:translate-x-1 transition-transform" />
                        </a>

                        <a 
                            href="tel:+255737672987"
                            className="flex items-center gap-4 p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100/80 border border-sky-200/80 dark:border-sky-500/30 transition-all text-sky-900 dark:text-sky-200 group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-[#154F7C] text-white flex items-center justify-center shrink-0 shadow-xs">
                                <Phone className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                                <div className="text-xs font-black uppercase tracking-wider text-[#154F7C] dark:text-sky-400">{lang === 'sw' ? 'Piga Simu' : 'Direct Call'}</div>
                                <div className="text-xs font-bold text-slate-800 dark:text-white truncate">+255 737 672 987</div>
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
