import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import KardovoAppLayout from '@/Layouts/KardovoAppLayout';
import GatewayConfigModal from '@/Components/GatewayConfigModal';
import { 
    MessageSquare, 
    Smartphone, 
    CreditCard, 
    Check, 
    Copy, 
    RefreshCw, 
    CheckCircle2, 
    AlertCircle, 
    ChevronRight,
    Sliders,
    X
} from 'lucide-react';

export default function Gateways({ isSuperAdmin = false, gateways = {} }) {
    const [configModalOpen, setConfigModalOpen] = useState(false);
    const [selectedTab, setSelectedTab] = useState('whatsapp');
    const [testingGateway, setTestingGateway] = useState(null);
    const [testFeedback, setTestFeedback] = useState(null);
    const [copied, setCopied] = useState(false);

    const openConfig = (tab) => {
        setSelectedTab(tab);
        setConfigModalOpen(true);
    };

    const whatsapp = gateways.whatsapp || {};
    const sms = gateways.sms || {};
    const azampay = gateways.azampay || {};

    const webhookUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/api/webhooks/whatsapp` 
        : 'https://kardovo.com/api/webhooks/whatsapp';

    const copyWebhook = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(webhookUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleQuickTest = async (type) => {
        setTestingGateway(type);
        setTestFeedback(null);
        try {
            const config = gateways[type] || {};
            const res = await axios.post(route('admin.gateway.test'), {
                gateway_type: type,
                config: config,
            });

            if (res.data?.success) {
                setTestFeedback({
                    type: 'success',
                    message: res.data.message || 'Connected and operational.',
                });
            } else {
                setTestFeedback({
                    type: 'error',
                    message: res.data?.message || 'Connection test failed.',
                });
            }
        } catch (err) {
            const errMsg = err.response?.data?.message || err.message || 'Connection test failed.';
            setTestFeedback({
                type: 'error',
                message: errMsg,
            });
        } finally {
            setTestingGateway(null);
        }
    };

    const isAzamSandbox = (azampay.environment || 'sandbox').toLowerCase() === 'sandbox';

    const gatewayList = [
        {
            id: 'whatsapp',
            title: 'WhatsApp Business',
            subtitle: 'Meta Cloud API',
            icon: MessageSquare,
            accent: 'emerald',
            statusText: 'Connected',
            statusClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/40',
            dotClass: 'bg-emerald-500',
            metrics: [
                { label: 'Sender', value: whatsapp.sender_number || '+255 700 000 000' },
                { label: 'Phone ID', value: whatsapp.phone_number_id ? `••••${whatsapp.phone_number_id.slice(-6)}` : 'Active' },
                { label: 'Version', value: whatsapp.api_version || 'v20.0' },
            ],
            testLabel: 'Test API',
        },
        {
            id: 'sms',
            title: 'NextSMS / Beem',
            subtitle: 'Direct SMS Fallback',
            icon: Smartphone,
            accent: 'sky',
            statusText: 'Active',
            statusClass: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800/40',
            dotClass: 'bg-sky-500',
            metrics: [
                { label: 'Sender ID', value: sms.sender_id || 'KARDOVO' },
                { label: 'Balance', value: sms.balance || '12,450 TZS' },
                { label: 'Coverage', value: 'Tanzania (+255)' },
            ],
            testLabel: 'Test SMS',
        },
        {
            id: 'azampay',
            title: 'AzamPay',
            subtitle: 'Ticketing Checkout',
            icon: CreditCard,
            accent: 'purple',
            statusText: isAzamSandbox ? 'Sandbox' : 'Live',
            statusClass: isAzamSandbox 
                ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/40'
                : 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/40',
            dotClass: isAzamSandbox ? 'bg-amber-500' : 'bg-emerald-500',
            metrics: [
                { label: 'Environment', value: (azampay.environment || 'sandbox').toUpperCase() },
                { label: 'App', value: azampay.app_name || 'Kardovo' },
                { label: 'Channels', value: 'Mobile Money & Cards' },
            ],
            testLabel: 'Test Auth',
        },
    ];

    return (
        <KardovoAppLayout title="Delivery Gateways">
            <Head title="Gateways — Kardovo" />

            <div className="max-w-6xl mx-auto space-y-5 pb-10">
                
                {/* 1. MINIMALISTIC HEADER */}
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200/70 dark:border-white/[0.06]">
                    <div>
                        <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                            Delivery Gateways
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Connected carriers for message delivery, SMS fallback, and ticket checkouts.
                        </p>
                    </div>

                    {isSuperAdmin && (
                        <button
                            type="button"
                            onClick={() => openConfig('whatsapp')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition shadow-2xs active:scale-95 cursor-pointer"
                        >
                            <Sliders className="w-3.5 h-3.5 text-slate-500" />
                            <span>Configure</span>
                        </button>
                    )}
                </div>

                {/* 2. MINIMAL TEST FEEDBACK TOAST */}
                {testFeedback && (
                    <div className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2.5 transition-all ${
                        testFeedback.type === 'success'
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-200'
                            : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/50 text-rose-800 dark:text-rose-200'
                    }`}>
                        <div className="flex items-center gap-2">
                            {testFeedback.type === 'success' ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            ) : (
                                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                            )}
                            <span className="font-medium">{testFeedback.message}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setTestFeedback(null)}
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}

                {/* 3. THREE MINIMALIST CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {gatewayList.map((item) => {
                        const IconComponent = item.icon;
                        const isTesting = testingGateway === item.id;

                        return (
                            <div 
                                key={item.id}
                                className="bg-white dark:bg-[#07111D] rounded-2xl border border-slate-200/80 dark:border-white/[0.07] p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-white/[0.12] transition-colors"
                            >
                                <div className="space-y-4">
                                    {/* Card Top: Icon & Status */}
                                    <div className="flex items-center justify-between">
                                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200/60 dark:border-white/[0.06] flex items-center justify-center text-slate-700 dark:text-slate-200">
                                            <IconComponent className="w-4 h-4" />
                                        </div>

                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${item.statusClass}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${item.dotClass}`} />
                                            <span>{item.statusText}</span>
                                        </span>
                                    </div>

                                    {/* Card Title */}
                                    <div>
                                        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                                            {item.title}
                                        </h2>
                                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                                            {item.subtitle}
                                        </p>
                                    </div>

                                    {/* 3 Key Metrics */}
                                    <div className="pt-2 border-t border-slate-100 dark:border-white/[0.05] space-y-1.5 text-xs">
                                        {item.metrics.map((m) => (
                                            <div key={m.label} className="flex justify-between items-center py-0.5">
                                                <span className="text-slate-400 text-[11px]">{m.label}</span>
                                                <span className="font-semibold text-slate-700 dark:text-slate-200 text-[11px] font-mono">
                                                    {m.value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Card Bottom Actions */}
                                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.05] flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleQuickTest(item.id)}
                                        disabled={isTesting}
                                        className="flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100/70 hover:bg-slate-200/70 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] transition flex items-center justify-center gap-1 cursor-pointer active:scale-95 disabled:opacity-50"
                                    >
                                        <RefreshCw className={`w-3 h-3 ${isTesting ? 'animate-spin text-sky-500' : 'text-slate-400'}`} />
                                        <span>{isTesting ? 'Testing' : item.testLabel}</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => openConfig(item.id)}
                                        className="py-1.5 px-3 rounded-xl text-xs font-semibold text-[#154F7C] dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/30 transition flex items-center gap-0.5 cursor-pointer active:scale-95"
                                    >
                                        <span>Edit</span>
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* 4. COMPACT WEBHOOK UTILITY STRIP */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#07111D] border border-slate-200/80 dark:border-white/[0.07] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <span className="font-semibold text-slate-700 dark:text-slate-200 shrink-0">
                            WhatsApp Webhook:
                        </span>
                        <code className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-[11px] font-mono truncate select-all">
                            {webhookUrl}
                        </code>
                    </div>

                    <button
                        type="button"
                        onClick={copyWebhook}
                        className="self-start sm:self-auto shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] transition active:scale-95 cursor-pointer"
                    >
                        {copied ? (
                            <>
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                            </>
                        ) : (
                            <>
                                <Copy className="w-3.5 h-3.5 text-slate-400" />
                                <span>Copy URL</span>
                            </>
                        )}
                    </button>
                </div>

            </div>

            {/* CONFIGURATION MODAL */}
            <GatewayConfigModal
                show={configModalOpen}
                onClose={() => setConfigModalOpen(false)}
                gateways={gateways}
                initialTab={selectedTab}
            />
        </KardovoAppLayout>
    );
}
