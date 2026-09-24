import React from 'react';
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
    Activity,
    ArrowRight,
    CircleDollarSign,
    TrendingUp
} from 'lucide-react';

export default function AdminDashboard({ 
    customers = [], 
    gateStaff = [],
    allEvents = [], 
    subAdmins = [],
    isSuperAdmin = true,
    isSubAdmin = false,
    globalTemplates = [], 
    recentScanLogs = [],
    stats = {}, 
    gateways = {} 
}) {
    const safeRoute = (name, fallback = '#') => {
        try {
            return typeof route === 'function' && route().has(name) ? route(name) : fallback;
        } catch {
            return fallback;
        }
    };

    const modules = [
        {
            title: 'Users',
            detail: `${customers.length} Organisers · ${gateStaff.length} Staff${isSuperAdmin && subAdmins.length ? ` · ${subAdmins.length} Admins` : ''}`,
            href: safeRoute('admin.users', '/admin/users'),
            icon: Users,
        },
        {
            title: 'Admin Logs',
            detail: 'Security verification stream',
            href: safeRoute('admin.logs', '/admin/logs'),
            icon: Activity,
        },
        {
            title: 'Gateways',
            detail: 'WhatsApp, SMS & AzamPay',
            href: safeRoute('admin.gateways', '/admin/gateways'),
            icon: Server,
        },
        {
            title: 'Events',
            detail: `${allEvents.length} Active events`,
            href: safeRoute('events.index', '/events'),
            icon: Calendar,
        },
        {
            title: 'Templates',
            detail: `${globalTemplates.length} Invitation designs`,
            href: safeRoute('templates.index', '/templates'),
            icon: Palette,
        },
        {
            title: 'Finance',
            detail: 'Cashflow, inflows & expenses',
            href: safeRoute('admin.finance', '/admin/finance'),
            icon: CircleDollarSign,
        },
    ];

    return (
        <KardovoAppLayout
            title="Governance & Administration"
            headerActions={
                <div className="flex items-center gap-2">
                    <Link
                        href={safeRoute('admin.users', '/admin/users')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-100 hover:text-white bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] rounded-xl shadow-2xs transition active:scale-95"
                    >
                        <Users className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Users</span>
                    </Link>
                    <Link
                        href={safeRoute('admin.gateways', '/admin/gateways')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-100 hover:text-white bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] rounded-xl shadow-2xs transition active:scale-95"
                    >
                        <Server className="w-3.5 h-3.5 text-amber-400" />
                        <span>Gateways</span>
                    </Link>
                </div>
            }
        >
            <Head title="Platform Operations Center - Kardovo" />

            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* 1. MINIMALISTIC EXECUTIVE HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200/60 dark:border-white/[0.06]">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight flex items-center gap-2.5">
                            <Shield className="w-6 h-6 text-[#16A34A]" />
                            Platform Operations Center
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            Executive command center for system health, verification telemetry, and cross-module governance.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            All Systems Operational
                        </span>
                    </div>
                </div>

                {/* 2. EXECUTIVE ANALYTICS DASHBOARD */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Platform Activity Chart */}
                    <div className="p-5 rounded-2xl bg-white dark:bg-[#07111D] border border-slate-200 dark:border-white/[0.08] shadow-xs flex flex-col h-full min-h-[340px]">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Platform Throughput</h3>
                                <p className="text-[11px] text-slate-500">7-day WhatsApp vs SMS dispatch volume</p>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] font-bold">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                    <span className="text-slate-600 dark:text-slate-400">WhatsApp</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                    <span className="text-slate-600 dark:text-slate-400">SMS</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 min-h-0 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.traffic_data || []} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorWhatsapp" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorSms" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" strokeOpacity={0.15} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '11px', color: '#fff', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        itemStyle={{ color: '#e2e8f0', fontSize: '12px', fontWeight: 'bold' }}
                                    />
                                    <Area type="monotone" dataKey="whatsapp" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorWhatsapp)" />
                                    <Area type="monotone" dataKey="sms" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorSms)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Quick Stats Mini-Grid */}
                    <div className="grid grid-cols-2 gap-4 h-full">
                        <div className="p-5 rounded-2xl bg-white dark:bg-[#07111D] border border-slate-200 dark:border-white/[0.08] shadow-xs flex flex-col justify-between">
                            <div>
                                <div className="w-10 h-10 rounded-xl bg-slate-500/10 text-slate-600 dark:text-slate-400 flex items-center justify-center mb-3">
                                    <QrCode className="w-5 h-5" />
                                </div>
                                <h4 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display mb-1 tracking-tight">
                                    {stats.total_scans?.toLocaleString() || 0}
                                </h4>
                                <p className="text-xs text-slate-500 font-medium">Total Passes Scanned</p>
                            </div>
                            <div className="mt-2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                <span>{stats.scans_growth || '+0%'} vs last week</span>
                            </div>
                        </div>

                        <div className="p-5 rounded-2xl bg-white dark:bg-[#07111D] border border-slate-200 dark:border-white/[0.08] shadow-xs flex flex-col justify-between">
                            <div>
                                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <h4 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display mb-1 tracking-tight">
                                    {stats.total_events || allEvents.length || 0}
                                </h4>
                                <p className="text-xs text-slate-500 font-medium">Live Events</p>
                            </div>
                            <div className="mt-2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                <span>{stats.events_growth || '+0%'} vs last week</span>
                            </div>
                        </div>

                        <div className="p-5 rounded-2xl bg-white dark:bg-[#07111D] border border-slate-200 dark:border-white/[0.08] shadow-xs flex flex-col justify-between">
                            <div>
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                                    <Smartphone className="w-5 h-5" />
                                </div>
                                <h4 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display mb-1 tracking-tight">
                                    {stats.whatsapp_delivered?.toLocaleString() || 0}
                                </h4>
                                <p className="text-xs text-slate-500 font-medium">WhatsApp Delivered</p>
                            </div>
                            <div className="mt-2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                <span>{stats.whatsapp_growth || '+0%'} vs last week</span>
                            </div>
                        </div>

                        <div className="p-5 rounded-2xl bg-white dark:bg-[#07111D] border border-slate-200 dark:border-white/[0.08] shadow-xs flex flex-col justify-between">
                            <div>
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <h4 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display mb-1 tracking-tight">
                                    {stats.sms_delivered?.toLocaleString() || 0}
                                </h4>
                                <p className="text-xs text-slate-500 font-medium">SMS Delivered</p>
                            </div>
                            <div className="mt-2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                <span>{stats.sms_growth || '+0%'} vs last week</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. MINIMALISTIC QUICK ACCESS TILES */}
                <div className="space-y-2.5">
                    <div className="flex items-center justify-between px-0.5">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Modules
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                        {modules.map((mod) => {
                            const IconComponent = mod.icon;
                            return (
                                <Link
                                    key={mod.title}
                                    href={mod.href}
                                    className="group p-3 rounded-xl bg-white dark:bg-[#07111D] border border-slate-200/80 dark:border-white/[0.06] hover:border-[#16A34A]/50 dark:hover:border-[#16A34A]/50 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between gap-3"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/[0.05] group-hover:bg-[#16A34A]/10 text-slate-600 dark:text-slate-300 group-hover:text-[#16A34A] flex items-center justify-center transition-colors">
                                            <IconComponent className="w-4 h-4" />
                                        </div>
                                        <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-[#16A34A] group-hover:translate-x-0.5 transition-all" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-[#16A34A] transition-colors truncate">
                                            {mod.title}
                                        </h3>
                                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                                            {mod.detail}
                                        </p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

            </div>
        </KardovoAppLayout>
    );
}
