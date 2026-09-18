import React, { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import KardovoAppLayout from '@/Layouts/KardovoAppLayout';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import DeleteUserForm from './Partials/DeleteUserForm';
import { 
    User, 
    Lock, 
    ShieldCheck, 
    Building2, 
    Smartphone, 
    Mail, 
    Shield, 
    Calendar,
    Users,
    MessageSquare,
    Palette,
    Download,
    KeyRound,
    AlertTriangle
} from 'lucide-react';

export default function Edit({ mustVerifyEmail, status }) {
    const user = usePage().props.auth?.user || {};

    const [activeTab, setActiveTab] = useState(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const tabParam = params.get('tab');
            if (['profile', 'permissions', 'security'].includes(tabParam)) {
                return tabParam;
            }
        }
        return 'profile';
    });

    const handleTabChange = (tabKey) => {
        setActiveTab(tabKey);
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.set('tab', tabKey);
            window.history.replaceState({}, '', url.toString());
        }
    };

    return (
        <KardovoAppLayout title="Account & Security Settings">
            <Head title="Account Profile & Security - Kardovo" />

            <div className="max-w-5xl mx-auto space-y-6">
                
                {/* 1. PROFILE HEADER */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="relative flex-shrink-0">
                            {user?.avatar ? (
                                <div className="w-12 h-12 rounded-xl overflow-hidden shadow-xs border border-slate-200 dark:border-white/[0.1] bg-slate-100 dark:bg-slate-800">
                                    <img 
                                        src={user.avatar} 
                                        alt={user.name} 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.08] text-slate-800 dark:text-slate-100 flex items-center justify-center font-black font-mono text-lg shadow-2xs">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight">
                                    {user?.name}
                                </h1>
                                <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-white/[0.06] border border-slate-200/70 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 text-[10px] font-mono font-bold uppercase">
                                    {user?.role}
                                </span>
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-3 font-medium mt-0.5">
                                <span>{user?.email}</span>
                                {user?.phone && <span>• {user.phone}</span>}
                                {user?.company && <span>• {user.company}</span>}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-[#0B1524] px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
                            <span className={`w-1.5 h-1.5 rounded-full ${user?.status === 'suspended' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                            <span>{user?.status === 'suspended' ? 'Suspended' : 'Active'}</span>
                        </span>
                    </div>
                </div>

                {/* 2. NAVIGATION TABS */}
                <div className="bg-slate-100/80 dark:bg-white/[0.04] p-1.5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] flex flex-wrap gap-1.5">
                    <button
                        type="button"
                        onClick={() => handleTabChange('profile')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition duration-150 cursor-pointer ${
                            activeTab === 'profile'
                                ? 'bg-[#16A34A] text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/[0.06]'
                        }`}
                    >
                        <User className="w-4 h-4" />
                        <span>Profile &amp; Organization Info</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleTabChange('permissions')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition duration-150 cursor-pointer ${
                            activeTab === 'permissions'
                                ? 'bg-[#16A34A] text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/[0.06]'
                        }`}
                    >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Permissions &amp; Allocations</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleTabChange('security')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition duration-150 cursor-pointer ${
                            activeTab === 'security'
                                ? 'bg-[#16A34A] text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/[0.06]'
                        }`}
                    >
                        <Lock className="w-4 h-4" />
                        <span>Security &amp; Danger Zone</span>
                    </button>
                </div>

                {/* 3. TAB CONTENT SECTIONS */}

                {/* TAB 1: PROFILE & ORGANIZATION INFO */}
                {activeTab === 'profile' && (
                    <div className="bg-white/70 dark:bg-[#0B1524]/85 backdrop-blur-3xl backdrop-saturate-180 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.03)] dark:shadow-card animate-fadeIn">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                        />
                    </div>
                )}

                {/* TAB 2: PERMISSIONS & ALLOCATIONS */}
                {activeTab === 'permissions' && (
                    <div className="bg-white/80 dark:bg-[#0B1524]/90 backdrop-blur-2xl p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.02)] dark:shadow-card space-y-5 animate-fadeIn">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100 dark:border-white/[0.08]">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 shadow-2xs">
                                    <ShieldCheck className="w-4 h-4" />
                                </div>
                                <div>
                                    <h2 className="text-base font-black text-slate-900 dark:text-white font-display tracking-tight">
                                        Permissions &amp; Access Rights
                                    </h2>
                                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                                        Assigned module capabilities and tenant operational allowances.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 self-start sm:self-auto">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-bold bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/[0.08]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    <span>{user?.role === 'admin' ? 'Full Access' : 'Active'}</span>
                                </span>
                            </div>
                        </div>

                        {/* Permissions Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                            {[
                                { key: 'can_create_events', label: 'Manage Events', icon: Calendar },
                                { key: 'can_import_guests', label: 'Import Guests', icon: Users },
                                { key: 'can_send_broadcasts', label: 'Send Broadcasts', icon: MessageSquare },
                                { key: 'can_customize_templates', label: 'Pass Studio', icon: Palette },
                                { key: 'can_manage_scanners', label: 'Gate Scanners', icon: Smartphone },
                                { key: 'can_export_data', label: 'Export Data', icon: Download },
                            ].map((act) => {
                                const isAllowed = user?.role === 'admin' || (user?.status !== 'suspended' && user?.effective_permissions?.[act.key] !== false);
                                const IconComponent = act.icon;

                                return (
                                    <div 
                                        key={act.key} 
                                        className={`p-3 rounded-2xl border transition duration-200 flex items-center justify-between gap-2 ${
                                            isAllowed 
                                                ? 'bg-slate-50/70 dark:bg-white/[0.02] border-slate-200/80 dark:border-white/[0.06]' 
                                                : 'bg-slate-100/60 dark:bg-white/[0.01] border-slate-200/60 dark:border-white/[0.04] opacity-60'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                                isAllowed 
                                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                                                    : 'bg-slate-200/60 dark:bg-white/[0.06] text-slate-400'
                                            }`}>
                                                <IconComponent className="w-3.5 h-3.5" />
                                            </div>
                                            <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                                {act.label}
                                            </h3>
                                        </div>
                                        <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-lg border flex-shrink-0 ${
                                            isAllowed 
                                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-800/40' 
                                                : 'bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/[0.08]'
                                        }`}>
                                            {isAllowed ? 'Active' : 'Locked'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Allocated Quotas & Limits: Events, WhatsApp, SMS */}
                        {user && (
                            <div className="pt-4 border-t border-slate-100 dark:border-white/[0.08] space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
                                        <span>Quota Allocations &amp; Usage Limits</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {/* Events Limit */}
                                    <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] shadow-2xs flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                                    Events Limit
                                                </span>
                                                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                                                    <Building2 className="w-3 h-3" />
                                                </div>
                                            </div>
                                            <div className="text-base font-black text-slate-900 dark:text-white font-mono mt-1">
                                                {user.max_events_limit ? `${user.max_events_limit} Events` : 'Unlimited'}
                                            </div>
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-mono mt-2 pt-1.5 border-t border-slate-200/60 dark:border-white/[0.04]">
                                            Account limit
                                        </div>
                                    </div>

                                    {/* WhatsApp Limit */}
                                    <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] shadow-2xs flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                                    WhatsApp Limit
                                                </span>
                                                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                                                    <MessageSquare className="w-3 h-3" />
                                                </div>
                                            </div>
                                            <div className="text-base font-black text-slate-900 dark:text-white font-mono mt-1">
                                                {(user.max_whatsapp_limit !== null && user.max_whatsapp_limit !== undefined) 
                                                    ? `${Math.max(0, user.max_whatsapp_limit - (user.message_quotas?.whatsapp_used || 0))} / ${user.max_whatsapp_limit}`
                                                    : (user.message_quotas?.whatsapp_limit !== null && user.message_quotas?.whatsapp_limit !== undefined 
                                                        ? `${user.message_quotas.whatsapp_remaining} / ${user.message_quotas.whatsapp_limit}` 
                                                        : 'Unlimited')}
                                            </div>
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-mono mt-2 pt-1.5 border-t border-slate-200/60 dark:border-white/[0.04]">
                                            Dispatched: <span className="font-bold text-slate-700 dark:text-slate-300">{user.message_quotas?.whatsapp_used || 0}</span> messages
                                        </div>
                                    </div>

                                    {/* SMS Limit */}
                                    <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] shadow-2xs flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                                    SMS Limit
                                                </span>
                                                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                                                    <Smartphone className="w-3 h-3" />
                                                </div>
                                            </div>
                                            <div className="text-base font-black text-slate-900 dark:text-white font-mono mt-1">
                                                {(user.max_sms_limit !== null && user.max_sms_limit !== undefined) 
                                                    ? `${Math.max(0, user.max_sms_limit - (user.message_quotas?.sms_used || 0))} / ${user.max_sms_limit}`
                                                    : (user.message_quotas?.sms_limit !== null && user.message_quotas?.sms_limit !== undefined 
                                                        ? `${user.message_quotas.sms_remaining} / ${user.message_quotas.sms_limit}` 
                                                        : 'Unlimited')}
                                            </div>
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-mono mt-2 pt-1.5 border-t border-slate-200/60 dark:border-white/[0.04]">
                                            Dispatched: <span className="font-bold text-slate-700 dark:text-slate-300">{user.message_quotas?.sms_used || 0}</span> SMS
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 3: SECURITY & DANGER ZONE */}
                {activeTab === 'security' && (
                    <div className="space-y-6 animate-fadeIn">
                        {/* Security & Password Form */}
                        <div className="bg-white/70 dark:bg-[#0B1524]/85 backdrop-blur-3xl backdrop-saturate-180 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.03)] dark:shadow-card">
                            <UpdatePasswordForm />
                        </div>

                        {/* Danger Zone: Account Deletion */}
                        <div className="bg-white/70 dark:bg-[#0B1524]/85 backdrop-blur-3xl backdrop-saturate-180 p-6 sm:p-8 rounded-3xl border border-rose-200/80 dark:border-rose-900/40 shadow-[0_8px_30px_rgba(244,63,94,0.04)] dark:shadow-card">
                            <DeleteUserForm />
                        </div>
                    </div>
                )}

            </div>
        </KardovoAppLayout>
    );
}

