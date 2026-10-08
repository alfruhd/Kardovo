import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import KardovoAppLayout from '@/Layouts/KardovoAppLayout';
import GatewayConfigModal from '@/Components/GatewayConfigModal';
import { 
    Server, 
    Smartphone, 
    MessageSquare, 
    CreditCard, 
    Settings, 
    CheckCircle2, 
    ChevronRight,
    Send,
    Tag
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

    const gatewayItems = [
        {
            id: 'whatsapp',
            title: 'Meta WhatsApp Cloud API',
            category: 'Invitations & Passes',
            icon: MessageSquare,
            details: [
                { label: 'Provider', value: whatsapp.provider || 'Meta Graph API' },
                { label: 'Sender', value: whatsapp.sender_number || '+255 700 000 000' },
                { label: 'API Version', value: whatsapp.api_version || 'v20.0' },
                { label: 'Phone ID', value: whatsapp.phone_number_id ? `••••${whatsapp.phone_number_id.slice(-6)}` : 'Active' },
            ],
            actionText: 'Configure WhatsApp',
        },
        {
            id: 'sms',
            title: 'NextSMS / Beem Gateway',
            category: 'Direct SMS Fallback',
            icon: Smartphone,
            details: [
                { label: 'Provider', value: sms.provider || 'NextSMS Tanzania' },
                { label: 'Sender ID', value: sms.sender_id || 'KARDOVO' },
                { label: 'Country', value: sms.country_code || '+255' },
                { label: 'Balance', value: sms.balance || '12,450 TZS' },
            ],
            actionText: 'Configure NextSMS',
        },
        {
            id: 'azampay',
            title: 'AzamPay Payment Gateway',
            category: 'Commercial Ticketing',
            icon: CreditCard,
            details: [
                { label: 'Provider', value: azampay.provider || 'AzamPay' },
                { label: 'Environment', value: (azampay.environment || 'sandbox').toUpperCase() },
                { label: 'App Name', value: azampay.app_name || 'Kardovo' },
                { label: 'Webhook', value: 'Active' },
            ],
            actionText: 'Configure AzamPay',
        },
    ];

    return (
        <KardovoAppLayout title="Delivery Gateways">
            <Head title="Gateways & APIs — Kardovo" />

            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* 1. MINIMALISTIC EXECUTIVE BANNER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-white/[0.06]">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight flex items-center gap-2.5">
                            <Server className="w-6 h-6 text-[#16A34A]" />
                            Delivery Gateways &amp; APIs
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            Connected carriers powering invitations dispatch, SMS fallbacks, and ticketing checkouts.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5 self-start sm:self-auto">
                        {isSuperAdmin && (
                            <button
                                type="button"
                                onClick={() => openConfig('whatsapp')}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[#16A34A] hover:bg-[#15803D] transition shadow-xs active:scale-95 cursor-pointer"
                            >
                                <Settings className="w-3.5 h-3.5" />
                                <span>Settings</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* 2. RELEVANCE CONTEXT: INVITATIONS & TICKETING PIPELINE */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#07111D] border border-slate-200/80 dark:border-white/[0.06] shadow-xs flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-[#16A34A] flex items-center justify-center">
                                <Send className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                                    Invitations Pipeline
                                </h3>
                                <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                                    Meta Cloud API &amp; NextSMS Carrier
                                </p>
                            </div>
                        </div>
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            Active
                        </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-[#07111D] border border-slate-200/80 dark:border-white/[0.06] shadow-xs flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-[#16A34A] flex items-center justify-center">
                                <Tag className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                                    Ticketing Checkout
                                </h3>
                                <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                                    AzamPay Mobile Money &amp; Card Gateway
                                </p>
                            </div>
                        </div>
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            Active
                        </span>
                    </div>
                </div>

                {/* 3. MINIMALISTIC & NEAT GATEWAY CARDS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {gatewayItems.map((item) => {
                        const IconComponent = item.icon;
                        return (
                            <div 
                                key={item.id}
                                className="bg-white dark:bg-[#07111D] rounded-2xl border border-slate-200/80 dark:border-white/[0.06] p-5 shadow-xs flex flex-col justify-between hover:border-[#16A34A]/30 transition-all duration-200"
                            >
                                <div>
                                    {/* Card Header */}
                                    <div className="flex items-center justify-between mb-3.5">
                                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-[#16A34A] flex items-center justify-center">
                                            <IconComponent className="w-4 h-4" />
                                        </div>
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-emerald-500/10 text-[#16A34A] border border-emerald-500/20">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            ACTIVE
                                        </span>
                                    </div>

                                    {/* Title & Category */}
                                    <h3 className="text-sm font-black text-slate-900 dark:text-white font-display">
                                        {item.title}
                                    </h3>
                                    <span className="text-[10px] font-bold text-slate-400 block mb-3">
                                        {item.category}
                                    </span>

                                    {/* Clean Metric Rows */}
                                    <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/[0.05] text-xs">
                                        {item.details.map((d) => (
                                            <div key={d.label} className="flex justify-between items-center py-1">
                                                <span className="text-slate-400 text-[11px]">{d.label}</span>
                                                <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px] font-mono truncate max-w-[150px]">
                                                    {d.value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Minimalist Action Button */}
                                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-white/[0.05]">
                                    <button
                                        type="button"
                                        onClick={() => openConfig(item.id)}
                                        className="w-full py-2 px-3 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-white bg-slate-100 hover:bg-[#16A34A] dark:bg-white/[0.04] dark:hover:bg-[#16A34A] transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-98"
                                    >
                                        <span>{item.actionText}</span>
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
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
