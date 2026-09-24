import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import KardovoAppLayout from '@/Layouts/KardovoAppLayout';
import GatewayConfigModal from '@/Components/GatewayConfigModal';
import { 
    Server, 
    Smartphone, 
    MessageSquare, 
    CreditCard, 
    Settings, 
    CheckCircle2, 
    AlertCircle, 
    Zap, 
    Radio, 
    ShieldCheck, 
    Key, 
    Globe 
} from 'lucide-react';

export default function Gateways({ isSuperAdmin = false, gateways = {} }) {
    const [configModalOpen, setConfigModalOpen] = useState(false);
    const [selectedTab, setSelectedTab] = useState('whatsapp');

    const openConfig = (tab) => {
        setSelectedTab(tab);
        setConfigModalOpen(true);
    };

    const whatsapp = gateways.whatsapp || {};
    const sms = gateways.sms || {};
    const azampay = gateways.azampay || {};

    return (
        <KardovoAppLayout title="Delivery Gateways">
            <Head title="Gateways & APIs - Kardovo" />

            <div className="space-y-6">
                {/* Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display flex items-center gap-2.5">
                            <Server className="w-6 h-6 text-emerald-500" />
                            Delivery Gateways & API Config
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Configure and monitor Meta WhatsApp Cloud API, NextSMS / Beem SMS routing, and AzamPay payments.
                        </p>
                    </div>

                    {isSuperAdmin && (
                        <button
                            type="button"
                            onClick={() => openConfig('whatsapp')}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#16A34A] hover:bg-emerald-600 transition shadow-sm active:scale-95 cursor-pointer self-start sm:self-auto"
                        >
                            <Settings className="w-4 h-4" />
                            <span>Configure Gateways</span>
                        </button>
                    )}
                </div>

                {/* Gateway Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* 1. WhatsApp Cloud API */}
                    <div className="bg-white dark:bg-[#0B1524]/90 rounded-3xl border border-slate-200/90 dark:border-white/[0.08] p-5 sm:p-6 shadow-card flex flex-col justify-between transition-colors">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-mono font-black bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/50">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    OPERATIONAL
                                </span>
                            </div>

                            <h3 className="text-base font-black text-slate-900 dark:text-white font-display">
                                Meta WhatsApp Cloud API
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5">
                                Official Meta Graph API routing for personalized wedding cards, RSVP buttons, and dynamic guest passes.
                            </p>

                            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                                <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-white/[0.05]">
                                    <span className="text-slate-400">Provider</span>
                                    <span className="font-bold">{whatsapp.provider || 'Meta Graph API'}</span>
                                </div>
                                <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-white/[0.05]">
                                    <span className="text-slate-400">Sender Number</span>
                                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{whatsapp.sender_number || '+255 700 000 000'}</span>
                                </div>
                                <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-white/[0.05]">
                                    <span className="text-slate-400">API Version</span>
                                    <span className="font-mono text-slate-700 dark:text-slate-300">{whatsapp.api_version || 'v20.0'}</span>
                                </div>
                                <div className="flex justify-between items-center py-1.5">
                                    <span className="text-slate-400">Phone Number ID</span>
                                    <span className="font-mono text-slate-700 dark:text-slate-300">{whatsapp.phone_number_id ? `••••${whatsapp.phone_number_id.slice(-6)}` : 'Not Set'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/[0.06]">
                            <button
                                type="button"
                                onClick={() => openConfig('whatsapp')}
                                className="w-full py-2 px-3 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-white bg-slate-100 hover:bg-[#16A34A] dark:bg-white/[0.06] dark:hover:bg-[#16A34A] transition cursor-pointer"
                            >
                                Settings & Live Test
                            </button>
                        </div>
                    </div>

                    {/* 2. SMS Gateway (NextSMS) */}
                    <div className="bg-white dark:bg-[#0B1524]/90 rounded-3xl border border-slate-200/90 dark:border-white/[0.08] p-5 sm:p-6 shadow-card flex flex-col justify-between transition-colors">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-500/20">
                                    <Smartphone className="w-5 h-5" />
                                </div>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-mono font-black bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border border-sky-200/60 dark:border-sky-800/50">
                                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                                    ACTIVE
                                </span>
                            </div>

                            <h3 className="text-base font-black text-slate-900 dark:text-white font-display">
                                NextSMS / Beem Gateway
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5">
                                High-priority Tanzanian telecom SMS routing with verified Sender ID and delivery DLR callbacks.
                            </p>

                            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                                <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-white/[0.05]">
                                    <span className="text-slate-400">Provider</span>
                                    <span className="font-bold">{sms.provider || 'NextSMS Tanzania'}</span>
                                </div>
                                <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-white/[0.05]">
                                    <span className="text-slate-400">Sender ID</span>
                                    <span className="font-mono font-black text-slate-900 dark:text-white">{sms.sender_id || 'KARDOVO'}</span>
                                </div>
                                <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-white/[0.05]">
                                    <span className="text-slate-400">Country Code</span>
                                    <span className="font-mono text-slate-700 dark:text-slate-300">{sms.country_code || '+255'}</span>
                                </div>
                                <div className="flex justify-between items-center py-1.5">
                                    <span className="text-slate-400">Account Balance</span>
                                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{sms.balance || '12,450 TZS'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/[0.06]">
                            <button
                                type="button"
                                onClick={() => openConfig('sms')}
                                className="w-full py-2 px-3 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-white bg-slate-100 hover:bg-[#16A34A] dark:bg-white/[0.06] dark:hover:bg-[#16A34A] transition cursor-pointer"
                            >
                                Settings & Live Test
                            </button>
                        </div>
                    </div>

                    {/* 3. AzamPay Payment Gateway */}
                    <div className="bg-white dark:bg-[#0B1524]/90 rounded-3xl border border-slate-200/90 dark:border-white/[0.08] p-5 sm:p-6 shadow-card flex flex-col justify-between transition-colors">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
                                    <CreditCard className="w-5 h-5" />
                                </div>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-mono font-black bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/50">
                                    CONFIGURED
                                </span>
                            </div>

                            <h3 className="text-base font-black text-slate-900 dark:text-white font-display">
                                AzamPay Mobile Money & Cards
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5">
                                Automated billing checkout for M-Pesa, Airtel Money, Tigo Pesa, Halopesa, and Visa/Mastercard.
                            </p>

                            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                                <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-white/[0.05]">
                                    <span className="text-slate-400">Provider</span>
                                    <span className="font-bold">{azampay.provider || 'AzamPay'}</span>
                                </div>
                                <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-white/[0.05]">
                                    <span className="text-slate-400">Environment</span>
                                    <span className="font-mono uppercase font-bold text-slate-800 dark:text-slate-200">{azampay.environment || 'sandbox'}</span>
                                </div>
                                <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-white/[0.05]">
                                    <span className="text-slate-400">App Name</span>
                                    <span className="font-mono text-slate-700 dark:text-slate-300">{azampay.app_name || 'Kardovo'}</span>
                                </div>
                                <div className="flex justify-between items-center py-1.5">
                                    <span className="text-slate-400">Webhook Integration</span>
                                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">Enabled</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/[0.06]">
                            <button
                                type="button"
                                onClick={() => openConfig('azampay')}
                                className="w-full py-2 px-3 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-white bg-slate-100 hover:bg-[#16A34A] dark:bg-white/[0.06] dark:hover:bg-[#16A34A] transition cursor-pointer"
                            >
                                Settings & API Keys
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <GatewayConfigModal
                show={configModalOpen}
                onClose={() => setConfigModalOpen(false)}
                gateways={gateways}
                initialTab={selectedTab}
            />
        </KardovoAppLayout>
    );
}

