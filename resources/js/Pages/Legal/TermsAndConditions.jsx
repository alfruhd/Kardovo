import React, { useState } from "react";
import { Head, Link } from "@inertiajs/react";
import { 
    ShieldCheck, 
    FileText, 
    Lock, 
    Smartphone, 
    MessageSquare, 
    Scale, 
    ArrowLeft, 
    CheckCircle2, 
    AlertTriangle, 
    QrCode, 
    Zap, 
    Printer, 
    Globe, 
    Clock, 
    Building2,
    Users,
    Sun,
    Moon
} from "lucide-react";
import { useTheme } from "@/Hooks/useTheme";

export default function TermsAndConditions({ initialTab = "terms" }) {
    const [activeTab, setActiveTab] = useState(initialTab);
    const { isDark, toggleTheme } = useTheme();

    const tabs = [
        { id: "terms", label: "Terms of Service", icon: FileText },
        { id: "privacy", label: "Privacy Policy", icon: Lock },
        { id: "security", label: "Gate & Anti-Fraud Security", icon: ShieldCheck },
        { id: "whatsapp", label: "WhatsApp & Anti-Spam", icon: MessageSquare },
        { id: "refunds", label: "Quota & Cancellations", icon: Scale },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#070F1E] text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300">
            <Head title="Terms & Conditions, Privacy & Compliance Policies — Kardovo" />

            {/* ════════════ HEADER BAR ════════════ */}
            <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/85 dark:bg-[#091426]/85 border-b border-slate-200/80 dark:border-white/[0.08] px-6 sm:px-10 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link 
                            href="/login" 
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.12] text-slate-700 dark:text-slate-200 text-xs font-bold transition active:scale-95 cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                            <span>Back to Sign In</span>
                        </Link>
                        <div className="h-4 w-px bg-slate-300 dark:bg-white/10 hidden sm:block" />
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-kardovo-navy dark:bg-cyan-600 p-1.5 flex items-center justify-center shadow-xs">
                                <img src="/images/kardovo_logo.png" alt="Kardovo" className="w-full h-full object-contain" />
                            </div>
                            <span className="font-black text-base tracking-wider text-slate-900 dark:text-white font-display">
                                KARDOVO LEGAL
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <button
                            type="button"
                            onClick={toggleTheme}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.12] text-slate-700 dark:text-slate-200 transition cursor-pointer"
                            title="Toggle Theme"
                        >
                            {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-800" />}
                        </button>
                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.12] text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Print</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* ════════════ HERO BANNER ════════════ */}
            <div className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-[#091528] dark:via-[#071120] dark:to-[#050C17] border-b border-slate-200/80 dark:border-white/[0.08] py-12 px-6 sm:px-10">
                <div className="max-w-6xl mx-auto relative z-10 space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-500/15 border border-cyan-200 dark:border-cyan-400/30 text-cyan-700 dark:text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider">
                        <ShieldCheck className="w-4 h-4 text-cyan-500" />
                        <span>Kardovo Legal &amp; Governance Center</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-display tracking-tight">
                        Terms of Service &amp; Operational Policies
                    </h1>
                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
                        Last updated: August 28, 2026. Please read these terms, data protection policies, and gate security guidelines carefully before using Kardovo access control and pass issuance services.
                    </p>
                </div>
            </div>

            {/* ════════════ MAIN CONTENT WITH TAB NAVIGATION ════════════ */}
            <div className="max-w-6xl mx-auto px-6 sm:px-10 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* LEFT SIDEBAR: TAB DOCK */}
                    <div className="lg:col-span-4 sticky top-24 space-y-2">
                        <div className="p-2 rounded-2xl bg-white dark:bg-[#0B172A] border border-slate-200/90 dark:border-white/[0.08] shadow-xs space-y-1">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold text-left transition active:scale-[0.98] cursor-pointer ${
                                            isActive
                                                ? "bg-kardovo-navy dark:bg-cyan-600 text-white shadow-sm"
                                                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white"
                                        }`}
                                    >
                                        <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-cyan-400 dark:text-white" : "text-slate-400"}`} />
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Summary Card */}
                        <div className="p-4 rounded-2xl bg-cyan-50/60 dark:bg-cyan-950/30 border border-cyan-200/80 dark:border-cyan-800/40 text-xs space-y-2">
                            <div className="font-bold text-cyan-900 dark:text-cyan-200 flex items-center gap-1.5">
                                <Zap className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                                <span>Key Policy Summary</span>
                            </div>
                            <p className="text-[11.5px] text-cyan-800/90 dark:text-cyan-300/80 leading-relaxed">
                                • Zero guest data monetization<br/>
                                • Cryptographic single/double QR validation<br/>
                                • Anti-fraud duplicate gate lock<br/>
                                • Opt-in WhatsApp messaging compliance
                            </p>
                        </div>
                    </div>

                    {/* RIGHT CONTENT AREA */}
                    <div className="lg:col-span-8 bg-white dark:bg-[#0B172A] p-6 sm:p-10 rounded-3xl border border-slate-200/90 dark:border-white/[0.08] shadow-card space-y-8">
                        
                        {/* ════════════ TAB 1: TERMS OF SERVICE ════════════ */}
                        {activeTab === "terms" && (
                            <div className="space-y-6 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display">
                                        1. Terms of Service &amp; Agreement
                                    </h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        Governing the deployment, issuance, and gate validation of Kardovo digital invitations.
                                    </p>
                                </div>

                                <section className="space-y-3">
                                    <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        <span>1.1 Acceptance of Terms</span>
                                    </h3>
                                    <p>
                                        By registering an account, purchasing pass quotas, accessing organizer dashboards, or deploying mobile scanner fleet devices, you agree to be bound by these Terms of Service. If you do not agree to these terms, you must discontinue platform use immediately.
                                    </p>
                                </section>

                                <section className="space-y-3">
                                    <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-cyan-500" />
                                        <span>1.2 Account Responsibilities &amp; Roles</span>
                                    </h3>
                                    <p>
                                        <strong>Event Organizers:</strong> Organizers maintain sole responsibility for the accuracy of guest attendee lists, entry quota allowances (Single vs Double entry), and invitation artwork configuration.<br/>
                                        <strong>Gate Staff Accounts:</strong> Gate staff accounts are authorized strictly for scanning and validating attendee tokens at authorized physical entrance checkpoints.<br/>
                                        <strong>Credential Security:</strong> You must maintain strict confidentiality of your administrative credentials and gateway API keys.
                                    </p>
                                </section>

                                <section className="space-y-3">
                                    <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                                        <QrCode className="w-4 h-4 text-purple-500" />
                                        <span>1.3 Pass Ownership &amp; Non-Transferability</span>
                                    </h3>
                                    <p>
                                        Kardovo passes are cryptographically bound to specific attendee unique records. Re-distribution, unauthorized resale, forgery, or duplication of digital QR passes is strictly prohibited and will result in immediate gate admission rejection.
                                    </p>
                                </section>

                                <section className="space-y-3">
                                    <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-blue-500" />
                                        <span>1.4 Service Availability &amp; Offline Scanners</span>
                                    </h3>
                                    <p>
                                        Kardovo aims for 99.9% uptime for gate verification and pass rendering servers. In the event of venue network degradation, Kardovo Scanner Apps utilize offline token verification to ensure gate flow continuity.
                                    </p>
                                </section>
                            </div>
                        )}

                        {/* ════════════ TAB 2: PRIVACY POLICY ════════════ */}
                        {activeTab === "privacy" && (
                            <div className="space-y-6 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display">
                                        2. Privacy &amp; Data Protection Policy
                                    </h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        Our commitment to zero data monetization and enterprise-grade cryptographic isolation.
                                    </p>
                                </div>

                                <section className="space-y-3">
                                    <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                                        <Lock className="w-4 h-4 text-emerald-500" />
                                        <span>2.1 Zero-Monetization Guarantee</span>
                                    </h3>
                                    <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-200 text-xs font-semibold">
                                        Kardovo DOES NOT sell, rent, license, or monetize guest phone numbers, names, or organizer database records to any third-party marketing entities.
                                    </div>
                                </section>

                                <section className="space-y-3">
                                    <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                                        <Users className="w-4 h-4 text-cyan-500" />
                                        <span>2.2 Information We Collect</span>
                                    </h3>
                                    <p>
                                        We collect information strictly necessary to facilitate digital invitation generation and secure gate verification:
                                    </p>
                                    <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                                        <li><strong>Organizer Data:</strong> Name, administrative email, organization name, and billing records.</li>
                                        <li><strong>Attendee Data:</strong> Guest name, phone number (for WhatsApp RSVP delivery), unique token identifier, and pass tier allowance.</li>
                                        <li><strong>Gate Telemetry:</strong> Check-in timestamps, scan status (Granted / Duplicate Rejected), and gate scanner operator identity.</li>
                                    </ul>
                                </section>

                                <section className="space-y-3">
                                    <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-blue-500" />
                                        <span>2.3 Encryption &amp; Security Measures</span>
                                    </h3>
                                    <p>
                                        All attendee databases, scannable tokens, and communication logs are encrypted in transit via TLS 1.3 and at rest with AES-256 multi-tenant isolation.
                                    </p>
                                </section>
                            </div>
                        )}

                        {/* ════════════ TAB 3: GATE ACCESS SECURITY ════════════ */}
                        {activeTab === "security" && (
                            <div className="space-y-6 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display">
                                        3. Gate Access &amp; Anti-Fraud Security Policy
                                    </h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        Real-time duplicate detection, entry locking, and camera permission rules.
                                    </p>
                                </div>

                                <section className="space-y-3">
                                    <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                                        <span>3.1 Double-Entry &amp; Duplicate Prevention</span>
                                    </h3>
                                    <p>
                                        Each Kardovo pass contains a cryptographic token. Upon successful gate scan, the system locks the pass allowance. Subsequent scan attempts of an exhausted pass immediately trigger a <strong>Red Duplicate Alert</strong> and log an audit security event with the scanner identity and timestamp.
                                    </p>
                                </section>

                                <section className="space-y-3">
                                    <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                                        <Smartphone className="w-4 h-4 text-emerald-500" />
                                        <span>3.2 Hardware Camera Permissions</span>
                                    </h3>
                                    <p>
                                        The mobile scanner application requires camera access solely for optical barcode / QR code decoding. Kardovo does not capture, store, or stream photos or video feeds from gate devices.
                                    </p>
                                </section>
                            </div>
                        )}

                        {/* ════════════ TAB 4: WHATSAPP COMPLIANCE ════════════ */}
                        {activeTab === "whatsapp" && (
                            <div className="space-y-6 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display">
                                        4. WhatsApp Messaging &amp; Anti-Spam Compliance
                                    </h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        Adherence to WhatsApp Business Cloud API &amp; UltraMsg gateway policies.
                                    </p>
                                </div>

                                <section className="space-y-3">
                                    <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4 text-emerald-500" />
                                        <span>4.1 Attendee Consent Requirement</span>
                                    </h3>
                                    <p>
                                        Organizers warrant that all recipient phone numbers uploaded to Kardovo have granted legitimate consent to receive event invitations and RSVP reminders. Sending unsolicited promotional spam via Kardovo gateways is strictly prohibited.
                                    </p>
                                </section>

                                <section className="space-y-3">
                                    <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                                        <Zap className="w-4 h-4 text-cyan-500" />
                                        <span>4.2 Gateway Routing &amp; Rate Limiting</span>
                                    </h3>
                                    <p>
                                        Kardovo orchestrates message delivery via Meta WhatsApp Business Cloud API and dedicated UltraMsg webhook gateways with automated rate-limiting to ensure compliance with international telecommunication standards.
                                    </p>
                                </section>
                            </div>
                        )}

                        {/* ════════════ TAB 5: REFUNDS & CANCELLATIONS ════════════ */}
                        {activeTab === "refunds" && (
                            <div className="space-y-6 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display">
                                        5. Pass Quota, Refunds &amp; Cancellations
                                    </h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        Digital pass generation quota terms and event cancellation provisions.
                                    </p>
                                </div>

                                <section className="space-y-3">
                                    <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                                        <Scale className="w-4 h-4 text-purple-500" />
                                        <span>5.1 Digital Pass Quotas</span>
                                    </h3>
                                    <p>
                                        Purchased pass generation quotas are credited immediately to your organizer account. Quotas remain active for the duration of the scheduled event campaign.
                                    </p>
                                </section>

                                <section className="space-y-3">
                                    <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-amber-500" />
                                        <span>5.2 Event Postponement &amp; Cancellation</span>
                                    </h3>
                                    <p>
                                        In the event of event date or venue changes, organizers can update pass metadata without re-issuing new tokens. Once digital passes have been dispatched via WhatsApp or downloaded in 4K, platform processing fees are non-refundable.
                                    </p>
                                </section>
                            </div>
                        )}

                        {/* Bottom Footer Notice */}
                        <div className="pt-6 border-t border-slate-100 dark:border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                            <span>Questions regarding our policies? Contact <a href="mailto:legal@kardovo.com" className="font-bold text-cyan-600 dark:text-cyan-400 hover:underline">legal@kardovo.com</a></span>
                            <span className="font-mono text-[11px]">Kardovo Platform Technologies &copy; 2026</span>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
