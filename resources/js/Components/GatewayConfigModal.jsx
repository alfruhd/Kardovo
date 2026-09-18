import React, { useState } from 'react';
import axios from 'axios';
import { useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { 
    Server, 
    Smartphone, 
    MessageSquare, 
    ShieldCheck, 
    Check, 
    Key, 
    Eye, 
    EyeOff, 
    Copy, 
    Sparkles, 
    CheckCircle2, 
    RefreshCw, 
    Globe, 
    Radio, 
    X, 
    AlertCircle, 
    AlertTriangle, 
    Send,
    Settings,
    Layers,
    Lock,
    Zap
} from 'lucide-react';

export default function GatewayConfigModal({ 
    show, 
    onClose, 
    gateways = {}, 
    initialTab = 'whatsapp' 
}) {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [showWhatsAppToken, setShowWhatsAppToken] = useState(false);
    const [showSmsSecret, setShowSmsSecret] = useState(false);
    const [copiedWebhook, setCopiedWebhook] = useState(false);
    const [testingConnection, setTestingConnection] = useState(false);
    const [testPhone, setTestPhone] = useState('');
    const [testResult, setTestResult] = useState(null);
    const [gwErrors, setGwErrors] = useState({});

    const webhookUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/whatsapp` : 'https://kardovo.com/api/webhooks/whatsapp';

    const whatsappForm = useForm({
        gateway_type: 'whatsapp',
        config: {
            provider: gateways.whatsapp?.provider || 'Meta WhatsApp Cloud API',
            phone_number_id: gateways.whatsapp?.phone_number_id || '',
            waba_id: gateways.whatsapp?.waba_id || '',
            api_version: gateways.whatsapp?.api_version || '',
            access_token: gateways.whatsapp?.access_token || '',
            sender_number: gateways.whatsapp?.sender_number || '',
            webhook_url: gateways.whatsapp?.webhook_url || webhookUrl,
            verify_token: gateways.whatsapp?.verify_token || '',
            status: gateways.whatsapp?.status || 'Connected (Operational)',
        }
    });

    const smsForm = useForm({
        gateway_type: 'sms',
        config: {
            provider: gateways.sms?.provider || 'NextSMS Tanzania',
            sender_id: gateways.sms?.sender_id || '',
            api_key: gateways.sms?.api_key || '',
            api_secret: gateways.sms?.api_secret || '',
            api_endpoint: gateways.sms?.api_endpoint || '',
            balance: gateways.sms?.balance || '',
            country_code: gateways.sms?.country_code || '',
            status: gateways.sms?.status || 'Active',
        }
    });


    const azampayForm = useForm({
        gateway_type: 'azampay',
        config: {
            provider: gateways.azampay?.provider || 'AzamPay',
            app_name: gateways.azampay?.app_name || 'Kardovo',
            client_id: gateways.azampay?.client_id || '',
            client_secret: gateways.azampay?.client_secret || '',
            environment: gateways.azampay?.environment || 'sandbox',
            status: gateways.azampay?.status || 'Pending Configuration',
        }
    });

    const handleCopyWebhook = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(webhookUrl);
            setCopiedWebhook(true);
            setTimeout(() => setCopiedWebhook(false), 2000);
        }
    };

    const handleTestConnection = async (type) => {
        setTestingConnection(true);
        setTestResult(null);
        try {
            const config = type === 'whatsapp' ? whatsappForm.data.config : (type === 'sms' ? smsForm.data.config : azampayForm.data.config);
            const res = await axios.post(route('admin.gateway.test'), {
                gateway_type: type,
                config: config,
                test_phone: testPhone.trim() || undefined,
            });

            if (res.data.success) {
                setTestResult({
                    type: 'success',
                    message: res.data.message,
                    details: {
                        meta_data: res.data.meta_data,
                        display_name: res.data.display_name,
                        display_phone: res.data.display_phone,
                        quality: res.data.quality,
                        test_message_sent: res.data.test_message_sent,
                        test_phone: res.data.test_phone,
                        whitelist_required: res.data.whitelist_required,
                        test_error_message: res.data.test_error_message,
                    },
                });
            } else {
                setTestResult({
                    type: 'error',
                    message: res.data.message || 'Verification test failed.',
                });
            }
        } catch (err) {
            const errMsg = err.response?.data?.message || err.message || 'Verification connection failed. Please check network and credentials.';
            setTestResult({
                type: 'error',
                message: errMsg,
            });
        } finally {
            setTestingConnection(false);
        }
    };


    const handleSaveAzamPay = (e) => {
        e.preventDefault();
        const errs = {};
        if (!azampayForm.data.config.client_id?.trim()) errs.client_id = 'Client ID is required.';
        if (!azampayForm.data.config.client_secret?.trim()) errs.client_secret = 'Client Secret is required.';
        if (Object.keys(errs).length > 0) {
            setGwErrors(errs);
            return;
        }
        azampayForm.post(route('admin.gateway'), {
            preserveScroll: true,
            onSuccess: () => {
                setGwErrors({});
                onClose();
            },
        });
    };
    const handleSaveWhatsApp = (e) => {
        e.preventDefault();
        const errs = {};
        const pid = whatsappForm.data.config.phone_number_id;
        if (!pid || !/^\d+$/.test(pid.trim())) {
            errs.phone_number_id = 'Phone Number ID must contain numbers only.';
        }
        if (!whatsappForm.data.config.access_token || !whatsappForm.data.config.access_token.trim()) {
            errs.access_token = 'Meta WhatsApp Access Token is required.';
        }

        if (Object.keys(errs).length > 0) {
            setGwErrors(errs);
            return;
        }

        setGwErrors({});
        whatsappForm.post(route('admin.gateway'), {
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    };

    const handleSaveSms = (e) => {
        e.preventDefault();
        const errs = {};
        const sender = smsForm.data.config.sender_id;
        if (!sender || sender.trim().length > 11) {
            errs.sender_id = 'SMS Sender ID cannot exceed 11 characters (telecom standard).';
        }
        if (!smsForm.data.config.api_key || !smsForm.data.config.api_key.trim()) {
            errs.api_key = 'SMS API Key is required.';
        }

        if (Object.keys(errs).length > 0) {
            setGwErrors(errs);
            return;
        }

        setGwErrors({});
        smsForm.post(route('admin.gateway'), {
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="3xl">
            <div className="flex flex-col max-h-[90vh]">
                {/* 1. MODAL HEADER */}
                <div className="px-6 py-5 border-b border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between bg-white dark:bg-[#08121E] flex-shrink-0">
                    <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-xs flex-shrink-0">
                            <Server className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-black text-slate-900 dark:text-white font-display tracking-tight">
                                    Gateway Integrations
                                </h3>
                                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                                    <ShieldCheck className="w-3 h-3" />
                                    <span>Encrypted API</span>
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                                Configure Meta WhatsApp Cloud API credentials, test live messaging, manage SMS delivery, and configure AzamPay.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.12] text-slate-500 dark:text-slate-300 flex items-center justify-center transition active:scale-95 cursor-pointer border border-transparent dark:border-white/[0.08]"
                        aria-label="Close"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* 2. TAB SWITCHER */}
                <div className="px-6 py-3 bg-slate-50/90 dark:bg-[#07111D] border-b border-slate-200/70 dark:border-white/[0.06] flex-shrink-0">
                    <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-200/70 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08]">
                        <button
                            type="button"
                            onClick={() => { setActiveTab('whatsapp'); setTestResult(null); }}
                            className={`flex-1 py-2 px-4 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 cursor-pointer border ${
                                activeTab === 'whatsapp'
                                    ? 'bg-white dark:bg-[#0B1828] text-emerald-900 dark:text-emerald-300 border-emerald-500/40 shadow-xs ring-2 ring-emerald-500/20'
                                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/[0.04]'
                            }`}
                        >
                            <Smartphone className={`w-4 h-4 ${activeTab === 'whatsapp' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                            <span>WhatsApp</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => { setActiveTab('sms'); setTestResult(null); }}
                            className={`flex-1 py-2 px-4 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 cursor-pointer border ${
                                activeTab === 'sms'
                                    ? 'bg-white dark:bg-[#0B1828] text-blue-900 dark:text-blue-300 border-blue-500/40 shadow-xs ring-2 ring-blue-500/20'
                                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/[0.04]'
                            }`}
                        >
                            <MessageSquare className={`w-4 h-4 ${activeTab === 'sms' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                            <span>SMS Gateway</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => { setActiveTab('azampay'); setTestResult(null); }}
                            className={`flex-1 py-2 px-4 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 cursor-pointer border ${
                                activeTab === 'azampay'
                                    ? 'bg-white dark:bg-[#0B1828] text-orange-900 dark:text-orange-300 border-orange-500/40 shadow-xs ring-2 ring-orange-500/20'
                                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/[0.04]'
                            }`}
                        >
                            <Zap className={`w-4 h-4 ${activeTab === 'azampay' ? 'text-orange-600 dark:text-orange-400' : 'text-slate-400'}`} />
                            <span>AzamPay</span>
                        </button>

                    </div>
                </div>

                {/* 3. SCROLLABLE FORM BODY */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 bg-white dark:bg-[#08121E]">
                    {/* Live Test Result Banner */}
                    {testResult && (
                        <div className={`p-4 rounded-2xl border text-xs font-bold flex items-start gap-3 animate-fadeIn shadow-xs ${
                            testResult.type === 'success' 
                                ? 'bg-emerald-500/15 dark:bg-emerald-950/60 border-emerald-500/40 text-emerald-950 dark:text-emerald-200' 
                                : 'bg-rose-500/15 dark:bg-rose-950/60 border-rose-500/40 text-rose-950 dark:text-rose-200'
                        }`}>
                            {testResult.type === 'success' ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                            ) : (
                                <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                            )}
                            <div className="space-y-1">
                                <div className="font-black text-sm">
                                    {testResult.type === 'success' ? 'Connection Verified & Active' : 'Connection Issue Detected'}
                                </div>
                                <div className="text-xs leading-relaxed font-medium">
                                    {testResult.message}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 1: WHATSAPP CLOUD API CONFIGURATION */}
                    {activeTab === 'whatsapp' && (
                        <form id="whatsapp-gw-form" onSubmit={handleSaveWhatsApp} className="space-y-5">
                            
                            {/* SECTION A: META CLOUD API CREDENTIALS */}
                            <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/90 dark:border-white/[0.08] space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/[0.06] pb-3">
                                    <div className="flex items-center gap-2">
                                        <Key className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                                            1. Meta Cloud API Credentials
                                        </h4>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                        From Meta for Developers
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel value="WhatsApp Phone Number ID *" />
                                        <TextInput
                                            type="text"
                                            placeholder="e.g. 108492019482910"
                                            className="mt-1 block w-full text-xs font-mono font-bold bg-white dark:bg-[#0B1828]"
                                            value={whatsappForm.data.config.phone_number_id}
                                            onChange={(e) => {
                                                whatsappForm.setData('config', { ...whatsappForm.data.config, phone_number_id: e.target.value });
                                                if (gwErrors.phone_number_id) setGwErrors(prev => ({ ...prev, phone_number_id: undefined }));
                                            }}
                                            hasError={Boolean(gwErrors.phone_number_id)}
                                            required
                                        />
                                        <InputError message={gwErrors.phone_number_id} className="mt-1" />
                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block font-medium">
                                            Found in WhatsApp &gt; API Setup &gt; Step 1
                                        </span>
                                    </div>

                                    <div>
                                        <InputLabel value="WhatsApp Business Account (WABA) ID" />
                                        <TextInput
                                            type="text"
                                            placeholder="e.g. 94820194820184"
                                            className="mt-1 block w-full text-xs font-mono font-bold bg-white dark:bg-[#0B1828]"
                                            value={whatsappForm.data.config.waba_id}
                                            onChange={(e) => whatsappForm.setData('config', { ...whatsappForm.data.config, waba_id: e.target.value })}
                                            required
                                        />
                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block font-medium">
                                            WhatsApp Business Account ID from Meta portal
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <InputLabel value="Permanent Access Token / Bearer Token *" />
                                    <div className="relative mt-1">
                                        <TextInput
                                            type={showWhatsAppToken ? "text" : "password"}
                                            placeholder="EAAG..."
                                            className="block w-full text-xs font-mono font-bold pr-10 bg-white dark:bg-[#0B1828]"
                                            value={whatsappForm.data.config.access_token}
                                            onChange={(e) => {
                                                whatsappForm.setData('config', { ...whatsappForm.data.config, access_token: e.target.value });
                                                if (gwErrors.access_token) setGwErrors(prev => ({ ...prev, access_token: undefined }));
                                            }}
                                            hasError={Boolean(gwErrors.access_token)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowWhatsAppToken(!showWhatsAppToken)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                                            tabIndex={-1}
                                        >
                                            {showWhatsAppToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <InputError message={gwErrors.access_token} className="mt-1" />
                                    <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block font-medium">
                                        Temporary 24h token or Permanent System User access token starting with EAAG...
                                    </span>
                                </div>
                            </div>

                            {/* SECTION B: LIVE TEST PING TO PERSONAL PHONE */}
                            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/[0.04] to-transparent border border-emerald-500/30 space-y-3.5 shadow-xs">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                        <h4 className="text-xs font-black uppercase tracking-wider text-emerald-950 dark:text-emerald-300">
                                            2. Live WhatsApp Test Ping (Optional)
                                        </h4>
                                    </div>
                                    <span className="text-[9.5px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                                        Real Dispatch
                                    </span>
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                                    Type your personal WhatsApp number below and click <strong>&quot;Test Connection&quot;</strong> to receive an immediate live WhatsApp test notification on your device.
                                </p>
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-0.5">
                                    <div className="flex-1">
                                        <TextInput
                                            type="text"
                                            placeholder="e.g. +255 767 749 919 or 255767749919"
                                            className="w-full text-xs font-mono font-bold bg-white dark:bg-[#0B1828]"
                                            value={testPhone}
                                            onChange={(e) => setTestPhone(e.target.value)}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleTestConnection('whatsapp')}
                                        disabled={testingConnection}
                                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-95 cursor-pointer flex-shrink-0 disabled:opacity-60"
                                    >
                                        <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
                                        <span>{testingConnection ? 'Testing Connection...' : 'Test Connection'}</span>
                                    </button>
                                </div>

                                {/* LIVE TESTING PROGRESS & INLINE DIAGNOSTICS */}
                                {testingConnection && (
                                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 dark:text-emerald-300 text-xs font-bold flex items-center gap-2.5 animate-pulse">
                                        <RefreshCw className="w-4 h-4 animate-spin text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                                        <span>Contacting Meta Cloud API &amp; validating credentials for {testPhone.trim() ? `+${testPhone.replace(/[^0-9]/g, '')}` : 'Meta Account'}...</span>
                                    </div>
                                )}

                                {testResult && !testingConnection && (
                                    <div>
                                        {testResult.details?.test_message_sent ? (
                                            /* SUCCESS CASE: MESSAGE SENT */
                                            <div className="p-4 rounded-xl bg-emerald-500/15 dark:bg-emerald-950/60 border border-emerald-500/40 text-emerald-950 dark:text-emerald-100 text-xs space-y-2 animate-fadeIn">
                                                <div className="flex items-center gap-2 font-black text-emerald-800 dark:text-emerald-300 text-sm">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                                                    <span>Live Test Message Delivered!</span>
                                                </div>
                                                <p className="font-medium text-emerald-900 dark:text-emerald-200">
                                                    A real WhatsApp test message was successfully dispatched to <strong>+{testResult.details.test_phone || testPhone}</strong>. Please check your phone!
                                                </p>
                                                <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[10.5px]">
                                                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 font-bold">
                                                        Account: {testResult.details.display_name}
                                                    </span>
                                                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 font-bold">
                                                        Sender ID: {testResult.details.display_phone}
                                                    </span>
                                                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 font-bold">
                                                        Quality: {testResult.details.quality}
                                                    </span>
                                                </div>
                                            </div>
                                        ) : testResult.details?.whitelist_required ? (
                                            /* META SANDBOX / WHITELIST REQUIRED */
                                            <div className="p-4 rounded-xl bg-amber-500/15 dark:bg-amber-950/60 border border-amber-500/40 text-amber-950 dark:text-amber-100 text-xs space-y-2.5 animate-fadeIn">
                                                <div className="flex items-center gap-2 font-black text-amber-800 dark:text-amber-300 text-sm">
                                                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                                                    <span>Meta Credentials Valid — Recipient Number Must Be Added</span>
                                                </div>
                                                <p className="font-medium text-amber-900 dark:text-amber-200 leading-relaxed">
                                                    Your Phone Number ID and Access Token are <strong>valid and connected</strong>! However, because Meta apps start in <strong>Development/Test mode</strong>, Meta blocks messages to numbers that haven&apos;t been added to your test recipient list.
                                                </p>
                                                <div className="p-3 rounded-xl bg-black/10 dark:bg-black/40 border border-amber-500/30 font-medium text-[11px] space-y-1.5">
                                                    <div className="font-extrabold text-amber-950 dark:text-amber-200">👉 How to enable your number in 10 seconds:</div>
                                                    <div>1. Open <a href="https://developers.facebook.com/apps" target="_blank" rel="noreferrer" className="underline font-black text-emerald-700 dark:text-emerald-400">Meta for Developers</a> &gt; Your App &gt; WhatsApp &gt; <strong>API Setup</strong>.</div>
                                                    <div>2. Under <strong>Step 1: Send and receive messages</strong>, look at the <strong>&quot;To&quot;</strong> recipient phone number dropdown.</div>
                                                    <div>3. Click <strong>&quot;Manage phone number list&quot;</strong> and add <code>+{testResult.details?.test_phone || testPhone}</code>.</div>
                                                    <div>4. Click <strong>Test Connection</strong> again to receive your real message!</div>
                                                </div>
                                            </div>
                                        ) : testResult.type === 'error' ? (
                                            /* ERROR CASE */
                                            <div className="p-4 rounded-xl bg-rose-500/15 dark:bg-rose-950/60 border border-rose-500/40 text-rose-950 dark:text-rose-100 text-xs space-y-1.5 animate-fadeIn">
                                                <div className="flex items-center gap-2 font-black text-rose-800 dark:text-rose-300 text-sm">
                                                    <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
                                                    <span>Meta Authentication / Connection Error</span>
                                                </div>
                                                <p className="font-medium text-rose-900 dark:text-rose-200 leading-relaxed">
                                                    {testResult.message}
                                                </p>
                                            </div>
                                        ) : (
                                            /* GENERAL SUCCESS */
                                            <div className="p-4 rounded-xl bg-emerald-500/15 dark:bg-emerald-950/60 border border-emerald-500/40 text-emerald-950 dark:text-emerald-100 text-xs space-y-1.5 animate-fadeIn">
                                                <div className="flex items-center gap-2 font-black text-emerald-800 dark:text-emerald-300 text-sm">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                                                    <span>Meta WhatsApp Cloud API Verified!</span>
                                                </div>
                                                <p className="font-medium text-emerald-900 dark:text-emerald-200 leading-relaxed">
                                                    {testResult.message}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* SECTION C: SENDER IDENTITY & OPERATIONAL SETTINGS */}
                            <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/90 dark:border-white/[0.08] space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/[0.06] pb-3">
                                    <div className="flex items-center gap-2">
                                        <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                                            3. Sender Identity &amp; Operational Status
                                        </h4>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel value="Operational Status" />
                                        <select
                                            className="mt-1 block w-full border border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#0B1828] text-slate-900 dark:text-white rounded-xl text-xs font-bold px-3.5 py-2.5 hover:border-emerald-500/70 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                                            value={whatsappForm.data.config.status}
                                            onChange={(e) => whatsappForm.setData('config', { ...whatsappForm.data.config, status: e.target.value })}
                                        >
                                            <option value="Connected (Operational)">Connected (Operational)</option>
                                            <option value="Sandbox / Testing Mode">Sandbox / Testing Mode</option>
                                            <option value="Disabled">Disabled</option>
                                        </select>
                                    </div>

                                    <div>
                                        <InputLabel value="Gateway Provider" />
                                        <select
                                            className="mt-1 block w-full border border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#0B1828] text-slate-900 dark:text-white rounded-xl text-xs font-bold px-3.5 py-2.5 hover:border-emerald-500/70 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                                            value={whatsappForm.data.config.provider}
                                            onChange={(e) => whatsappForm.setData('config', { ...whatsappForm.data.config, provider: e.target.value })}
                                        >
                                            <option value="Meta WhatsApp Cloud API">Meta WhatsApp Cloud API (Official / Direct)</option>
                                            <option value="Twilio for WhatsApp">Twilio WhatsApp Business API</option>
                                            <option value="Infobip WhatsApp">Infobip WhatsApp Business</option>
                                            <option value="360dialog WhatsApp">360dialog WhatsApp API</option>
                                            <option value="Custom Webhook Gateway">Custom Webhook Gateway</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel value="Sender Phone Number (Display Number)" />
                                        <TextInput
                                            type="text"
                                            placeholder="+255 700 000 000"
                                            className="mt-1 block w-full text-xs font-mono font-bold bg-white dark:bg-[#0B1828]"
                                            value={whatsappForm.data.config.sender_number}
                                            onChange={(e) => whatsappForm.setData('config', { ...whatsappForm.data.config, sender_number: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <InputLabel value="Graph API Version" />
                                        <TextInput
                                            type="text"
                                            placeholder="v20.0"
                                            className="mt-1 block w-full text-xs font-mono font-bold bg-white dark:bg-[#0B1828]"
                                            value={whatsappForm.data.config.api_version}
                                            onChange={(e) => whatsappForm.setData('config', { ...whatsappForm.data.config, api_version: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* SECTION D: WEBHOOK LISTENER & VERIFICATION */}
                            <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/90 dark:border-white/[0.08] space-y-3.5">
                                <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/[0.06] pb-3">
                                    <div className="flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                                            4. Meta Webhook Listener (1-Tap RSVP)
                                        </h4>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                        Inbound Automation
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="sm:col-span-2">
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="text-[10.5px] font-bold text-slate-600 dark:text-slate-400">
                                                Public Webhook Callback URL &amp; Domain
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => whatsappForm.setData('config', { ...whatsappForm.data.config, webhook_url: webhookUrl })}
                                                className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline font-bold cursor-pointer"
                                            >
                                                Use Current Origin
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={whatsappForm.data.config.webhook_url || ''}
                                                onChange={(e) => whatsappForm.setData('config', { ...whatsappForm.data.config, webhook_url: e.target.value })}
                                                placeholder="e.g. https://62c20482554209.lhr.life/api/webhooks/whatsapp"
                                                className="block w-full text-[11px] font-mono bg-white dark:bg-[#0B1828] border border-slate-300 dark:border-white/[0.08] rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 font-bold focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const urlToCopy = whatsappForm.data.config.webhook_url || webhookUrl;
                                                    if (navigator.clipboard) {
                                                        navigator.clipboard.writeText(urlToCopy);
                                                        setCopiedWebhook(true);
                                                        setTimeout(() => setCopiedWebhook(false), 2000);
                                                    }
                                                }}
                                                className="px-3.5 py-2 text-xs font-black bg-white dark:bg-white/[0.08] border border-slate-300 dark:border-white/[0.08] hover:border-emerald-500/70 text-slate-800 dark:text-white rounded-xl flex items-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer flex-shrink-0"
                                                title="Copy Webhook URL"
                                            >
                                                {copiedWebhook ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                                                <span>{copiedWebhook ? 'Copied' : 'Copy'}</span>
                                            </button>
                                        </div>
                                        <span className="text-[10px] text-slate-400 mt-1 block">
                                            Used for Meta Webhook delivery and public pass links. If using a tunnel, enter your public tunnel URL here.
                                        </span>
                                    </div>
                                    <div>
                                        <label className="text-[10.5px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                                            Verify Token
                                        </label>
                                        <input
                                            type="text"
                                            value={whatsappForm.data.config.verify_token}
                                            onChange={(e) => whatsappForm.setData('config', { ...whatsappForm.data.config, verify_token: e.target.value })}
                                            className="block w-full text-[11px] font-mono bg-white dark:bg-[#0B1828] border border-slate-300 dark:border-white/[0.08] rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 font-bold"
                                        />
                                        <span className="text-[10px] text-slate-400 mt-1 block">
                                            Token for Meta Developer Portal
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </form>
                    )}

                    {/* TAB 2: SMS GATEWAY PROVIDER CONFIGURATION */}
                    {activeTab === 'sms' && (
                        <form id="sms-gw-form" onSubmit={handleSaveSms} className="space-y-5">
                            
                            {/* SECTION A: SMS PROVIDER & SENDER ID */}
                            <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/90 dark:border-white/[0.08] space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/[0.06] pb-3">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                                            1. SMS Provider &amp; Sender Header
                                        </h4>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel value="SMS Gateway Provider" />
                                        <select
                                            className="mt-1 block w-full border border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#0B1828] text-slate-900 dark:text-white rounded-xl text-xs font-bold px-3.5 py-2.5 hover:border-blue-500/70 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                                            value={smsForm.data.config.provider}
                                            onChange={(e) => smsForm.setData('config', { ...smsForm.data.config, provider: e.target.value })}
                                        >
                                            <option value="NextSMS Tanzania">NextSMS Tanzania (Direct TZ Carriers)</option>
                                            <option value="Beem Africa">Beem Africa (SMS &amp; USSD Gateway)</option>
                                            <option value="Africa's Talking">Africa's Talking (Pan-Africa SMS)</option>
                                            <option value="Twilio SMS">Twilio SMS (Global Delivery)</option>
                                            <option value="Infobip SMS">Infobip SMS Gateway</option>
                                            <option value="Custom HTTP Gateway">Custom HTTP / SMPP Gateway</option>
                                        </select>
                                    </div>
                                    <div>
                                        <InputLabel value="Gateway Status" />
                                        <select
                                            className="mt-1 block w-full border border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#0B1828] text-slate-900 dark:text-white rounded-xl text-xs font-bold px-3.5 py-2.5 hover:border-blue-500/70 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                                            value={smsForm.data.config.status}
                                            onChange={(e) => smsForm.setData('config', { ...smsForm.data.config, status: e.target.value })}
                                        >
                                            <option value="Active">Active (Live Production)</option>
                                            <option value="Testing / Sandbox">Testing / Sandbox</option>
                                            <option value="Disabled">Disabled</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel value="Sender ID / Alphanumeric Header *" />
                                        <TextInput
                                            type="text"
                                            placeholder="KARDOVO"
                                            className="mt-1 block w-full text-xs font-mono font-bold uppercase tracking-wider bg-white dark:bg-[#0B1828]"
                                            value={smsForm.data.config.sender_id}
                                            onChange={(e) => {
                                                smsForm.setData('config', { ...smsForm.data.config, sender_id: e.target.value.toUpperCase() });
                                                if (gwErrors.sender_id) setGwErrors(prev => ({ ...prev, sender_id: undefined }));
                                            }}
                                            hasError={Boolean(gwErrors.sender_id)}
                                            required
                                        />
                                        <InputError message={gwErrors.sender_id} className="mt-1" />
                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block font-medium">TCRA registered sender name (max 11 chars)</span>
                                    </div>
                                    <div>
                                        <InputLabel value="Default Country Dialing Code" />
                                        <TextInput
                                            type="text"
                                            placeholder="+255"
                                            className="mt-1 block w-full text-xs font-mono font-bold bg-white dark:bg-[#0B1828]"
                                            value={smsForm.data.config.country_code}
                                            onChange={(e) => smsForm.setData('config', { ...smsForm.data.config, country_code: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* SECTION B: API CREDENTIALS & ENDPOINT */}
                            <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/90 dark:border-white/[0.08] space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/[0.06] pb-3">
                                    <div className="flex items-center gap-2">
                                        <Key className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                                            2. API Key &amp; Endpoint Configuration
                                        </h4>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel value="API Key / Username *" />
                                        <TextInput
                                            type="text"
                                            placeholder="e.g. nextsms_live_api_key"
                                            className="mt-1 block w-full text-xs font-mono font-bold bg-white dark:bg-[#0B1828]"
                                            value={smsForm.data.config.api_key}
                                            onChange={(e) => {
                                                smsForm.setData('config', { ...smsForm.data.config, api_key: e.target.value });
                                                if (gwErrors.api_key) setGwErrors(prev => ({ ...prev, api_key: undefined }));
                                            }}
                                            hasError={Boolean(gwErrors.api_key)}
                                            required
                                        />
                                        <InputError message={gwErrors.api_key} className="mt-1" />
                                    </div>
                                    <div>
                                        <InputLabel value="API Secret / Password / Auth Token" />
                                        <div className="relative mt-1">
                                            <TextInput
                                                type={showSmsSecret ? "text" : "password"}
                                                placeholder="••••••••••••••••"
                                                className="block w-full text-xs font-mono font-bold pr-10 bg-white dark:bg-[#0B1828]"
                                                value={smsForm.data.config.api_secret}
                                                onChange={(e) => smsForm.setData('config', { ...smsForm.data.config, api_secret: e.target.value })}
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowSmsSecret(!showSmsSecret)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                                                tabIndex={-1}
                                            >
                                                {showSmsSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel value="Base API Endpoint URL" />
                                        <TextInput
                                            type="text"
                                            placeholder="https://messaging-service.co.tz/api/sms/v1/text/single"
                                            className="mt-1 block w-full text-xs font-mono font-bold bg-white dark:bg-[#0B1828]"
                                            value={smsForm.data.config.api_endpoint}
                                            onChange={(e) => smsForm.setData('config', { ...smsForm.data.config, api_endpoint: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <InputLabel value="Account Balance / Credit Balance" />
                                        <TextInput
                                            type="text"
                                            placeholder="12,450 TZS"
                                            className="mt-1 block w-full text-xs font-mono font-bold bg-white dark:bg-[#0B1828]"
                                            value={smsForm.data.config.balance}
                                            onChange={(e) => smsForm.setData('config', { ...smsForm.data.config, balance: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </form>
                    )}

                    {/* ════════ AZAMPAY TAB ════════ */}
                    {activeTab === 'azampay' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            
                            {/* Notice */}
                            <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-900/30 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                                <div className="text-xs text-orange-800 dark:text-orange-200 leading-relaxed">
                                    <p className="font-bold mb-1">AzamPay Integration</p>
                                    <p>Configure your AzamPay credentials to accept payments via Mobile Money and Cards. Ensure you have the correct Client ID and Secret from your AzamPay Merchant Portal.</p>
                                </div>
                            </div>

                            <form id="azampay-form" onSubmit={handleSaveAzamPay} className="space-y-6">
                                
                                <div className="bg-slate-50 dark:bg-[#07111D] p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Key className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                                                API Credentials
                                            </h4>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <InputLabel value="App Name *" />
                                            <TextInput
                                                type="text"
                                                placeholder="e.g. Kardovo"
                                                className="mt-1 block w-full text-xs font-mono bg-white dark:bg-[#0B1828]"
                                                value={azampayForm.data.config.app_name}
                                                onChange={(e) => azampayForm.setData('config', { ...azampayForm.data.config, app_name: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <InputLabel value="Environment *" />
                                            <select
                                                className="mt-1 block w-full text-xs font-mono bg-white dark:bg-[#0B1828] border-slate-300 dark:border-slate-700 dark:text-white rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500"
                                                value={azampayForm.data.config.environment}
                                                onChange={(e) => azampayForm.setData('config', { ...azampayForm.data.config, environment: e.target.value })}
                                            >
                                                <option value="sandbox">Sandbox (Testing)</option>
                                                <option value="production">Production (Live)</option>
                                            </select>
                                        </div>
                                        <div className="sm:col-span-2">
                                            <InputLabel value="Client ID *" />
                                            <TextInput
                                                type="text"
                                                placeholder="Enter Client ID"
                                                className="mt-1 block w-full text-xs font-mono bg-white dark:bg-[#0B1828]"
                                                value={azampayForm.data.config.client_id}
                                                onChange={(e) => {
                                                    azampayForm.setData('config', { ...azampayForm.data.config, client_id: e.target.value });
                                                    if (gwErrors.client_id) setGwErrors(prev => ({ ...prev, client_id: undefined }));
                                                }}
                                                hasError={Boolean(gwErrors.client_id)}
                                                required
                                            />
                                            <InputError message={gwErrors.client_id} className="mt-1" />
                                        </div>

                                        <div className="sm:col-span-2">
                                            <InputLabel value="Client Secret *" />
                                            <TextInput
                                                type="password"
                                                placeholder="Enter Client Secret"
                                                className="mt-1 block w-full text-xs font-mono bg-white dark:bg-[#0B1828]"
                                                value={azampayForm.data.config.client_secret}
                                                onChange={(e) => {
                                                    azampayForm.setData('config', { ...azampayForm.data.config, client_secret: e.target.value });
                                                    if (gwErrors.client_secret) setGwErrors(prev => ({ ...prev, client_secret: undefined }));
                                                }}
                                                hasError={Boolean(gwErrors.client_secret)}
                                                required
                                            />
                                            <InputError message={gwErrors.client_secret} className="mt-1" />
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}

                </div>

                {/* 4. FIXED ACTION FOOTER */}
                <div className="px-6 py-4 border-t border-slate-200/80 dark:border-white/[0.08] bg-slate-50/95 dark:bg-[#07111D]/95 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        
                        {activeTab === 'azampay' ? (
                            <SecondaryButton
                                type="button"
                                onClick={() => handleTestConnection('azampay')}
                                disabled={testingConnection}
                                className="!py-2.5 !text-xs !bg-orange-50 dark:!bg-orange-500/10 !text-orange-700 dark:!text-orange-400 !border-orange-200 dark:!border-orange-500/20 hover:!bg-orange-100 dark:hover:!bg-orange-500/20"
                            >
                                {testingConnection ? 'Testing...' : 'Test AzamPay Gateway'}
                            </SecondaryButton>
                        ) : activeTab === 'whatsapp' ? (
                            <button
                                type="button"
                                onClick={() => handleTestConnection('whatsapp')}
                                disabled={testingConnection}
                                className="text-xs font-black text-emerald-800 dark:text-emerald-300 hover:text-emerald-950 dark:hover:text-white bg-emerald-500/15 dark:bg-emerald-950/60 hover:bg-emerald-500/25 px-4 py-2.5 rounded-xl border border-emerald-500/40 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer disabled:opacity-60"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
                                <span>{testingConnection ? 'Testing Meta Connection...' : 'Test WhatsApp Connection'}</span>
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => handleTestConnection('sms')}
                                disabled={testingConnection}
                                className="text-xs font-black text-blue-800 dark:text-blue-300 hover:text-blue-950 dark:hover:text-white bg-blue-500/15 dark:bg-blue-950/60 hover:bg-blue-500/25 px-4 py-2.5 rounded-xl border border-blue-500/40 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer disabled:opacity-60"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
                                <span>{testingConnection ? 'Testing...' : 'Test SMS Gateway Ping'}</span>
                            </button>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-2.5">
                        <SecondaryButton onClick={onClose} className="rounded-xl px-4 py-2.5 text-xs font-bold">
                            Cancel
                        </SecondaryButton>
                        
                        {activeTab === 'azampay' ? (
                            <SecondaryButton
                                type="button"
                                onClick={() => handleTestConnection('azampay')}
                                disabled={testingConnection}
                                className="!py-2.5 !text-xs !bg-orange-50 dark:!bg-orange-500/10 !text-orange-700 dark:!text-orange-400 !border-orange-200 dark:!border-orange-500/20 hover:!bg-orange-100 dark:hover:!bg-orange-500/20"
                            >
                                {testingConnection ? 'Testing...' : 'Test AzamPay Gateway'}
                            </SecondaryButton>
                        ) : activeTab === 'whatsapp' ? (
                            <PrimaryButton 
                                type="submit" 
                                form="whatsapp-gw-form" 
                                disabled={whatsappForm.processing} 
                                className="rounded-xl px-5 py-2.5 text-xs font-bold bg-[#16A34A] hover:bg-[#15803D] text-white shadow-xs"
                            >
                                Save WhatsApp Settings
                            </PrimaryButton>
                        ) : (
                            <PrimaryButton 
                                type="submit" 
                                form="sms-gw-form" 
                                disabled={smsForm.processing} 
                                className="rounded-xl px-5 py-2.5 text-xs font-bold bg-[#16A34A] hover:bg-[#15803D] text-white shadow-xs"
                            >
                                Save SMS Settings
                            </PrimaryButton>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
}
