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
    CheckCircle2 
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
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-xs">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight">
                                    {user?.name}
                                </h1>
                                <span className="px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/40 text-cyan-700 dark:text-cyan-300 text-[10px] font-mono font-bold uppercase">
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
                        <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-white/80 dark:bg-[#0B1524] px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>{user?.status === 'suspended' ? 'Suspended' : 'Governed & Active'}</span>
                        </span>
                    </div>
                </div>

                {/* 2. PERMITTED PORTAL ACTIVITIES & FEATURE GOVERNANCE CARD */}
                <div className="bg-white/70 dark:bg-[#0B1524]/85 backdrop-blur-3xl backdrop-saturate-180 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.03)] dark:shadow-card space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80 dark:border-white/[0.08]">
                        <div>
                            <h2 className="text-base font-black text-slate-900 dark:text-white font-display flex items-center gap-2">
                                <Lock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                                <span>Permitted Portal Activities &amp; Authority Scope</span>
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Feature permissions managed by Kardovo system administration for this account tenancy.
                            </p>
                        </div>
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/50 self-start sm:self-auto">
                            <Shield className="w-3.5 h-3.5" />
                            <span>{user?.role === 'admin' ? 'Unrestricted Scope' : 'Governed Policy'}</span>
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { key: 'can_create_events', label: 'Event Hosting & Creation', desc: 'Create, launch, and configure new event portfolios.' },
                            { key: 'can_import_guests', label: 'Guest Import & Uploads', desc: 'Bulk spreadsheet imports and manual guest additions.' },
                            { key: 'can_send_broadcasts', label: 'Broadcast Campaigns', desc: 'High-throughput WhatsApp & SMS dispatch engines.' },
                            { key: 'can_customize_templates', label: '4K Studio Customization', desc: 'Custom artwork typography, plaque positioning & designs.' },
                            { key: 'can_manage_scanners', label: 'Gate Scanner Fleet', desc: 'Mobile terminal management & gate staff accounts.' },
                            { key: 'can_export_data', label: 'Data & Ledger Export', desc: 'Attendee manifests and financial reporting CSVs.' },
                        ].map((act) => {
                            const isAllowed = user?.role === 'admin' || (user?.status !== 'suspended' && user?.effective_permissions?.[act.key] !== false);

                            return (
                                <div 
                                    key={act.key} 
                                    className={`p-3.5 rounded-2xl border transition-all ${
                                        isAllowed 
                                            ? 'bg-slate-50/70 dark:bg-white/[0.02] border-slate-200/80 dark:border-white/[0.06]' 
                                            : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40 opacity-75'
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                                            {isAllowed ? (
                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                                            ) : (
                                                <Lock className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                                            )}
                                            <span className="truncate">{act.label}</span>
                                        </div>
                                        <span className={`text-[9.5px] font-mono uppercase font-black px-1.5 py-0.5 rounded-md border whitespace-nowrap ${
                                            isAllowed 
                                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40' 
                                                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/40'
                                        }`}>
                                            {isAllowed ? 'Active' : 'Locked'}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                                        {act.desc}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Allocated Tenancy Quotas: WhatsApp, SMS & Events */}
                    {user && (
                        <div className="pt-3 border-t border-slate-200/80 dark:border-white/[0.08]">
                            <div className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
                                Allocated Dispatch Quotas &amp; Limits
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40">
                                    <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 font-mono">💬 WhatsApp Quota</div>
                                    <div className="text-lg font-black text-slate-900 dark:text-white font-mono mt-0.5">
                                        {(user.max_whatsapp_limit !== null && user.max_whatsapp_limit !== undefined) 
                                            ? `${Math.max(0, user.max_whatsapp_limit - (user.message_quotas?.whatsapp_used || 0))} / ${user.max_whatsapp_limit}`
                                            : (user.message_quotas?.whatsapp_limit !== null && user.message_quotas?.whatsapp_limit !== undefined 
                                                ? `${user.message_quotas.whatsapp_remaining} / ${user.message_quotas.whatsapp_limit}` 
                                                : 'Unrestricted (∞)')}
                                    </div>
                                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                                        Dispatched: {user.message_quotas?.whatsapp_used || 0} messages
                                    </div>
                                </div>

                                <div className="p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40">
                                    <div className="text-[11px] font-bold text-amber-700 dark:text-amber-300 font-mono">📱 Regular SMS Quota</div>
                                    <div className="text-lg font-black text-slate-900 dark:text-white font-mono mt-0.5">
                                        {(user.max_sms_limit !== null && user.max_sms_limit !== undefined) 
                                            ? `${Math.max(0, user.max_sms_limit - (user.message_quotas?.sms_used || 0))} / ${user.max_sms_limit}`
                                            : (user.message_quotas?.sms_limit !== null && user.message_quotas?.sms_limit !== undefined 
                                                ? `${user.message_quotas.sms_remaining} / ${user.message_quotas.sms_limit}` 
                                                : 'Unrestricted (∞)')}
                                    </div>
                                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                                        Dispatched: {user.message_quotas?.sms_used || 0} SMS
                                    </div>
                                </div>

                                <div className="p-3 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-800/40">
                                    <div className="text-[11px] font-bold text-blue-700 dark:text-blue-300 font-mono">📅 Event Portfolios</div>
                                    <div className="text-lg font-black text-slate-900 dark:text-white font-mono mt-0.5">
                                        {user.max_events_limit ? `${user.max_events_limit} Events max` : 'Unlimited Portfolios'}
                                    </div>
                                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
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
                    <div className="bg-white/70 dark:bg-[#0B1524]/85 backdrop-blur-3xl backdrop-saturate-180 p-6 sm:p-8 rounded-3xl border border-rose-200/80 dark:border-rose-900/50 shadow-[0_8px_30px_rgba(244,63,94,0.04)] dark:shadow-card">
                        <DeleteUserForm />
                    </div>
                </div>
            </div>
        </KardovoAppLayout>
    );
}
