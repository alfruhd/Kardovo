import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Head, Link } from '@inertiajs/react';
import KardovoAppLayout from '@/Layouts/KardovoAppLayout';
import { 
    Shield, 
    Users,
    Calendar, 
    QrCode, 
    Server, 
    MessageSquare,
    Palette,
    Smartphone,
    ShieldCheck,
    ArrowRight,
    CircleDollarSign,
    TrendingUp,
    Tag,
    Send,
    ChevronRight,
    Sparkles
} from 'lucide-react';

export default function AdminDashboard({ 
    customers = [], 
    gateStaff = [],
    allEvents = [], 
    subAdmins = [],
    isSuperAdmin = true,
    isSubAdmin = false,
    globalTemplates = [], 
    stats = {}, 
    gateways = {} 
}) {
    const [viewMode, setViewMode] = useState('all'); // 'all' | 'invitations' | 'ticketing'

    const safeRoute = (name, fallback = '#') => {
        try {
            return typeof route === 'function' && route().has(name) ? route(name) : fallback;
        } catch {
            return fallback;
        }
    };

    const formatTzs = (amount) => {
        const num = parseFloat(amount) || 0;
        return `${num.toLocaleString()} TZS`;
    };

    return (
        <KardovoAppLayout
            title="Governance & Administration"
            headerActions={
                <div className="flex items-center gap-2">
                    <Link
                        href={safeRoute('admin.users', '/admin/users')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-100 hover:text-white bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] rounded-xl shadow-2xs transition active:scale-95"
                    >
                        <Users className="w-3.5 h-3.5 text-sky-400" />
                        <span>Users</span>
                    </Link>
                    <Link
                        href={safeRoute('admin.gateways', '/admin/gateways')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-100 hover:text-white bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] rounded-xl shadow-2xs transition active:scale-95"
                    >
                        <Server className="w-3.5 h-3.5 text-sky-400" />
                        <span>Gateways</span>
                    </Link>
                </div>
            }
        >
            <Head title="Platform Operations Center — Kardovo" />

            <div className="max-w-7xl mx-auto space-y-3.5 flex flex-col justify-between">
                
                {/* 1. EXECUTIVE HEADER WITH UNIFIED VIEW SWITCHER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/60 dark:border-white/[0.06]">
                    <div>
                        <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-display tracking-tight flex items-center gap-2">
                            <Shield className="w-5 h-5 text-sky-500" />
                            Platform Operations Center
                        </h1>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            Unified command center for VIP invitations, commercial ticketing, gate telemetry, and APIs.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        {/* Scope Toggle: All | Invitations | Ticketing */}
                        <div className="inline-flex items-center p-0.5 rounded-xl bg-slate-200/60 dark:bg-white/[0.04] border border-slate-300/50 dark:border-white/[0.08] text-[11px] font-semibold">
                            <button
                                type="button"
                                onClick={() => setViewMode('all')}
                                className={`px-2 py-0.5 rounded-lg transition cursor-pointer ${
                                    viewMode === 'all'
                                        ? 'bg-white dark:bg-[#07111D] text-slate-900 dark:text-white shadow-xs font-bold'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                All Operations
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('invitations')}
                                className={`px-2 py-0.5 rounded-lg transition cursor-pointer ${
                                    viewMode === 'invitations'
                                        ? 'bg-white dark:bg-[#07111D] text-[#154F7C] dark:text-sky-400 shadow-xs font-bold'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                Invitations
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('ticketing')}
                                className={`px-2 py-0.5 rounded-lg transition cursor-pointer ${
                                    viewMode === 'ticketing'
                                        ? 'bg-white dark:bg-[#07111D] text-[#154F7C] dark:text-sky-400 shadow-xs font-bold'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                Ticketing
                            </button>
                        </div>

                        <span className="hidden lg:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-sky-500/10 text-[#154F7C] dark:text-sky-300 border border-sky-500/25">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                            Live
                        </span>
                    </div>
                </div>

                {/* 2. DUAL OPERATIONAL PILLARS (UNIFORM KARDOVO PALETTE) */}
                {(viewMode === 'all' || viewMode === 'invitations' || viewMode === 'ticketing') && (
                    <div className={`grid grid-cols-1 ${viewMode === 'all' ? 'md:grid-cols-2' : 'grid-cols-1'} gap-3`}>
                        
                        {/* ── PILLAR 1: DIGITAL PASSES & INVITATIONS ── */}
                        {(viewMode === 'all' || viewMode === 'invitations') && (
                            <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#07111D] border border-slate-200/90 dark:border-white/[0.08] shadow-xs flex flex-col justify-between hover:border-sky-500/40 transition-all">
                                <div>
                                    <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 dark:border-white/[0.05]">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                                                <Send className="w-3.5 h-3.5" />
                                            </div>
                                            <div>
                                                <h2 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white font-display">
                                                    Invitations
                                                </h2>
                                                <p className="text-[10px] text-slate-400">
                                                    Personalized cards, WhatsApp &amp; SMS delivery
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Metrics Trio */}
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04]">
                                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                                                Invited Guests
                                            </span>
                                            <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-display">
                                                {(stats.total_guests || 0).toLocaleString()}
                                            </div>
                                        </div>

                                        <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04]">
                                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                                                WhatsApp
                                            </span>
                                            <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-display">
                                                {(stats.whatsapp_delivered || 0).toLocaleString()}
                                            </div>
                                        </div>

                                        <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04]">
                                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                                                SMS Sent
                                            </span>
                                            <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-display">
                                                {(stats.sms_delivered || 0).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── PILLAR 2: COMMERCIAL TICKETING & BOX OFFICE ── */}
                        {(viewMode === 'all' || viewMode === 'ticketing') && (
                            <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#07111D] border border-slate-200/90 dark:border-white/[0.08] shadow-xs flex flex-col justify-between hover:border-sky-500/40 transition-all">
                                <div>
                                    <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 dark:border-white/[0.05]">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                                                <Tag className="w-3.5 h-3.5" />
                                            </div>
                                            <div>
                                                <h2 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white font-display">
                                                    Ticketing
                                                </h2>
                                                <p className="text-[10px] text-slate-400">
                                                    Online sales, revenue &amp; gate admissions
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Metrics Trio */}
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04]">
                                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                                                Revenue
                                            </span>
                                            <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white font-display truncate">
                                                {formatTzs(stats.ticket_revenue)}
                                            </div>
                                        </div>

                                        <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04]">
                                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                                                Tickets Sold
                                            </span>
                                            <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-display">
                                                {(stats.total_tickets_sold || 0).toLocaleString()}
                                            </div>
                                        </div>

                                        <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04]">
                                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                                                Admitted
                                            </span>
                                            <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-display">
                                                {(stats.checked_in_tickets || 0).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                )}

                {/* 3. PLATFORM TELEMETRY & DISPATCH VELOCITY (FULL WIDTH) */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#07111D] border border-slate-200/90 dark:border-white/[0.08] shadow-xs flex flex-col justify-between">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                        <div>
                            <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white font-display">
                                Platform Dispatch Velocity
                            </h3>
                            <p className="text-[10px] text-slate-400">
                                7-day WhatsApp vs SMS message volume
                            </p>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] font-bold">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                                <span className="text-slate-600 dark:text-slate-300">WhatsApp</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500" />
                                <span className="text-slate-600 dark:text-slate-300">SMS</span>
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-[180px] sm:h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.traffic_data || []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorWhatsapp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#16A34A" stopOpacity={0.25}/>
                                        <stop offset="95%" stopColor="#16A34A" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorSms" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#64748b" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#64748b" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" strokeOpacity={0.12} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={4} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#07111D', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                                    itemStyle={{ color: '#e2e8f0', fontSize: '11px', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="whatsapp" stroke="#16A34A" strokeWidth={2} fillOpacity={1} fill="url(#colorWhatsapp)" />
                                <Area type="monotone" dataKey="sms" stroke="#64748b" strokeWidth={1.5} fillOpacity={1} fill="url(#colorSms)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </KardovoAppLayout>
    );
}
