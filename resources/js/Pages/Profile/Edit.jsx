import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import KardovoAppLayout from '@/Layouts/KardovoAppLayout';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import DeleteUserForm from './Partials/DeleteUserForm';
import { 
    User, 
    Lock, 
    ShieldCheck, 
    Trash2, 
    Key, 
    Building2, 
    Smartphone, 
    Mail, 
    Shield, 
    CheckCircle2,
    Calendar,
    Users,
    MessageSquare,
    Palette,
    Download
} from 'lucide-react';

export default function Edit({ mustVerifyEmail, status }) {
    const user = usePage().props.auth?.user || {};

    return (
        <KardovoAppLayout title="Account & Security Settings">
            <Head title="Account Profile & Security - Kardovo" />

            <div className="max-w-5xl mx-auto space-y-6">
                
                {/* 1. SIMPLE PROFILE HEADER */}
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
                            <span>{user?.status === 'suspended' ? 'Suspended' : 'Governed & Active'}</span>
                        </span>
                    </div>
                </div>

                {/* 2. PERMITTED PORTAL ACTIVITIES & FEATURE GOVERNANCE CARD */}
                <div className="bg-white/80 dark:bg-[#0B1524]/90 backdrop-blur-2xl p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.02)] dark:shadow-card space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/[0.08]">
                        <div className="flex items-start sm:items-center gap-3.5">
                            <div className="w-10 h-10 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200/60 dark:border-cyan-800/40 text-cyan-600 dark:text-cyan-400 flex items-center justify-center flex-shrink-0 shadow-2xs">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-display tracking-tight">
                                    Permitted Portal Activities &amp; Authority Scope
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Feature permissions managed by Kardovo system administration for this account tenancy.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 self-start sm:self-auto">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/[0.08] shadow-2xs">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span>{user?.role === 'admin' ? 'Unrestricted Scope' : 'Governed Policy'}</span>
                            </span>
                        </div>
                    </div>

                    {/* Permissions Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                        {[
                            { 
                                key: 'can_create_events', 
                                label: 'Event Hosting & Creation', 
                                desc: 'Create, launch, and configure new event portfolios.',
                                icon: Calendar,
                            },
                            { 
                                key: 'can_import_guests', 
                                label: 'Guest Import & Uploads', 
                                desc: 'Bulk spreadsheet imports and manual guest additions.',
                                icon: Users,
                            },
                            { 
                                key: 'can_send_broadcasts', 
                                label: 'Broadcast Campaigns', 
                                desc: 'High-throughput WhatsApp & SMS dispatch engines.',
                                icon: MessageSquare,
                            },
                            { 
                                key: 'can_customize_templates', 
                                label: '4K Studio Customization', 
                                desc: 'Custom artwork typography, plaque positioning & designs.',
                                icon: Palette,
                            },
                            { 
                                key: 'can_manage_scanners', 
                                label: 'Gate Scanner Fleet', 
                                desc: 'Mobile terminal management & gate staff accounts.',
                                icon: Smartphone,
                            },
                            { 
                                key: 'can_export_data', 
                                label: 'Data & Ledger Export', 
                                desc: 'Attendee manifests and financial reporting CSVs.',
                                icon: Download,
                            },
                        ].map((act) => {
                            const isAllowed = user?.role === 'admin' || (user?.status !== 'suspended' && user?.effective_permissions?.[act.key] !== false);
                            const IconComponent = act.icon;

                            return (
                                <div 
                                    key={act.key} 
                                    className={`p-4 rounded-2xl border transition duration-200 flex flex-col justify-between ${
                                        isAllowed 
                                            ? 'bg-slate-50/70 dark:bg-white/[0.02] border-slate-200/80 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/20 hover:bg-white dark:hover:bg-white/[0.04] shadow-2xs' 
                                            : 'bg-slate-100/60 dark:bg-white/[0.01] border-slate-200/60 dark:border-white/[0.04] opacity-65'
                                    }`}
                                >
                                    <div>
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                                    isAllowed 
                                                        ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20' 
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
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2.5 leading-relaxed">
                                            {act.desc}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Allocated Tenancy Quotas: WhatsApp, SMS & Events */}
                    {user && (
                        <div className="pt-4 border-t border-slate-100 dark:border-white/[0.08] space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                                    <span>Allocated Dispatch Quotas &amp; Limits</span>
                                </div>
                                <span className="text-[10.5px] font-mono text-slate-400 dark:text-slate-500">
                                    Live Balance
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                {/* WhatsApp Quota */}
                                <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/15 transition shadow-2xs flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                                WhatsApp Quota
                                            </span>
                                            <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                                <MessageSquare className="w-3 h-3" />
                                            </div>
                                        </div>
                                        <div className="text-lg font-black text-slate-900 dark:text-white font-mono mt-1.5">
                                            {(user.max_whatsapp_limit !== null && user.max_whatsapp_limit !== undefined) 
                                                ? `${Math.max(0, user.max_whatsapp_limit - (user.message_quotas?.whatsapp_used || 0))} / ${user.max_whatsapp_limit}`
                                                : (user.message_quotas?.whatsapp_limit !== null && user.message_quotas?.whatsapp_limit !== undefined 
                                                    ? `${user.message_quotas.whatsapp_remaining} / ${user.message_quotas.whatsapp_limit}` 
                                                    : 'Unrestricted (∞)')}
                                        </div>
                                    </div>
                                    <div className="text-[10.5px] text-slate-500 dark:text-slate-400 font-mono mt-2 pt-2 border-t border-slate-200/60 dark:border-white/[0.04]">
                                        Dispatched: <span className="font-bold text-slate-700 dark:text-slate-300">{user.message_quotas?.whatsapp_used || 0}</span> messages
                                    </div>
                                </div>

                                {/* Regular SMS Quota */}
                                <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/15 transition shadow-2xs flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                                Regular SMS Quota
                                            </span>
                                            <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                                <Smartphone className="w-3 h-3" />
                                            </div>
                                        </div>
                                        <div className="text-lg font-black text-slate-900 dark:text-white font-mono mt-1.5">
                                            {(user.max_sms_limit !== null && user.max_sms_limit !== undefined) 
                                                ? `${Math.max(0, user.max_sms_limit - (user.message_quotas?.sms_used || 0))} / ${user.max_sms_limit}`
                                                : (user.message_quotas?.sms_limit !== null && user.message_quotas?.sms_limit !== undefined 
                                                    ? `${user.message_quotas.sms_remaining} / ${user.message_quotas.sms_limit}` 
                                                    : 'Unrestricted (∞)')}
                                        </div>
                                    </div>
                                    <div className="text-[10.5px] text-slate-500 dark:text-slate-400 font-mono mt-2 pt-2 border-t border-slate-200/60 dark:border-white/[0.04]">
                                        Dispatched: <span className="font-bold text-slate-700 dark:text-slate-300">{user.message_quotas?.sms_used || 0}</span> SMS
                                    </div>
                                </div>

                                {/* Event Portfolios */}
                                <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/15 transition shadow-2xs flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                                Event Portfolios
                                            </span>
                                            <div className="w-6 h-6 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                                                <Building2 className="w-3 h-3" />
                                            </div>
                                        </div>
                                        <div className="text-lg font-black text-slate-900 dark:text-white font-mono mt-1.5">
                                            {user.max_events_limit ? `${user.max_events_limit} Events max` : 'Unlimited Portfolios'}
                                        </div>
                                    </div>
                                    <div className="text-[10.5px] text-slate-500 dark:text-slate-400 font-mono mt-2 pt-2 border-t border-slate-200/60 dark:border-white/[0.04]">
                                        Account tenancy limit
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. PROFILE FORMS GRID */}
                <div className="space-y-6">
                    {/* Personal & Organization Profile Info */}
                    <div className="bg-white/70 dark:bg-[#0B1524]/85 backdrop-blur-3xl backdrop-saturate-180 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.03)] dark:shadow-card">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                        />
                    </div>

                    {/* Security & Password Form */}
                    <div className="bg-white/70 dark:bg-[#0B1524]/85 backdrop-blur-3xl backdrop-saturate-180 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.03)] dark:shadow-card">
                        <UpdatePasswordForm />
                    </div>

                    {/* Danger Zone: Account Deletion */}
                    <div className="bg-white/70 dark:bg-[#0B1524]/85 backdrop-blur-3xl backdrop-saturate-180 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.03)] dark:shadow-card">
                        <DeleteUserForm />
                    </div>
                </div>
            </div>
        </KardovoAppLayout>
    );
}
