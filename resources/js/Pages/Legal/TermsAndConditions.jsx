import React from "react";
import { Head, Link } from "@inertiajs/react";
import KardovoLogo from "@/Components/KardovoLogo";
import {
    ArrowLeft,
    FileText,
    Lock,
    ShieldCheck,
    MessageSquare,
    Scale,
    Printer,
    Sun,
    Moon,
} from "lucide-react";

const sections = [
    {
        id: "terms",
        badge: "§1",
        icon: FileText,
        title: "Terms of Service",
        color: "text-cyan-500",
        content: [
            {
                heading: "Acceptance",
                body: "By creating an account, buying pass quotas, or using the Kardovo platform in any way, you agree to these terms. If you don't agree, please stop using the platform.",
            },
            {
                heading: "What each role can do",
                body: null,
                list: [
                    "Organizers — manage events, upload guest lists, configure passes, and send invitations.",
                    "Gate Operators — scan and validate passes at venue entrances only.",
                    "All users — keep login credentials and API keys private. Report any compromise immediately.",
                ],
            },
            {
                heading: "Passes are personal and non-transferable",
                body: "Each digital pass is tied to one specific guest. You may not share, resell, duplicate, or forge a pass. Doing so will result in gate rejection and account termination.",
            },
            {
                heading: "Service uptime",
                body: "We aim for 99.9% uptime. The scanner app works offline if the venue has no internet. We'll give at least 48 hours' notice before any planned maintenance.",
            },
            {
                heading: "Prohibited actions",
                body: null,
                list: [
                    "Bypassing or tampering with platform security.",
                    "Uploading guest data you don't have permission to use.",
                    "Sending spam or unrelated messages through our platform.",
                    "Accessing another organizer's data without permission.",
                    "Reselling platform access without a written agreement.",
                ],
            },
            {
                heading: "Payments and Purchases",
                body: "All package upgrades and purchases are processed securely through AzamPay. Accepted payment methods include major mobile money networks and supported credit/debit cards. All transactions are final.",
            },
            {
                heading: "Disputes",
                body: "These terms are governed by the laws of Kardovo's operating jurisdiction. Disputes should first be resolved through direct negotiation. If unresolved within 30 days, they proceed to binding arbitration.",
            },

        ],
    },
    {
        id: "privacy",
        badge: "§2",
        icon: Lock,
        title: "Privacy Policy",
        color: "text-emerald-500",
        content: [
            {
                heading: "We don't sell your data — ever",
                body: "Kardovo does not sell, rent, or share guest phone numbers, names, or organizer records with any third-party marketers or data brokers. Full stop.",
            },
            {
                heading: "What we collect",
                body: null,
                list: [
                    "Organizer info — name, email, organization, billing details.",
                    "Guest info — name, phone number (for WhatsApp delivery only), unique pass token, entry tier, and RSVP status.",
                    "Gate logs — check-in time, scan result (granted / rejected), and operator ID.",
                    "Technical data — IP addresses for security logging, kept for up to 90 days.",
                ],
            },
            {
                heading: "Why we collect it",
                body: null,
                list: [
                    "To issue passes and run gate verification.",
                    "To detect fraud and prevent duplicate entry.",
                    "To comply with legal and financial record-keeping requirements.",
                ],
            },
            {
                heading: "How we protect it",
                body: null,
                list: [
                    "All data in transit is encrypted with TLS 1.3.",
                    "All stored data is encrypted with AES-256.",
                    "Each organizer's data is isolated from others.",
                    "Only authorized staff can access production data.",
                ],
            },
            {
                heading: "Payment Information",
                body: "We process all payments through AzamPay. We do not store your full credit card numbers, mobile money PINs, or bank account details on our servers.",
            },
            {
                heading: "Data retention & your rights",
                body: "Guest data is kept for the event duration plus up to 12 months for audit purposes, then securely deleted. You can request access, correction, or deletion of your data at any time by emailing legal@kardovo.com. We'll respond within 72 hours.",
            },
        ],
    },
    {
        id: "security",
        badge: "§3",
        icon: ShieldCheck,
        title: "Gate & Anti-Fraud",
        color: "text-rose-500",
        content: [
            {
                heading: "How passes work",
                body: "Every pass has a unique cryptographic token linked to one guest. It cannot be guessed, duplicated, or predicted. When scanned, the system validates it instantly.",
            },
            {
                heading: "What happens on a duplicate scan",
                body: null,
                list: [
                    "A Red Duplicate Alert shows on the scanner screen immediately.",
                    "The incident is logged with the operator ID, device, and timestamp.",
                    "The organizer dashboard is updated in real time.",
                    "The guest is denied entry — no exceptions.",
                ],
            },
            {
                heading: "Camera permissions",
                body: "The scanner app only uses your camera to read QR codes. No photos or videos are stored or transmitted. The camera feed is processed on-device and discarded instantly after each scan.",
            },
            {
                heading: "Offline scanning",
                body: "If the venue loses internet, the scanner uses a locally cached token list. Scan results sync back to the server as soon as connectivity returns. Operators should sync their devices at least 1 hour before the event starts.",
            },
            {
                heading: "Gate operator rules",
                body: null,
                list: [
                    "Never leave a device unlocked and unattended.",
                    "Never share your scanner login with anyone.",
                    "Report any security issues to the organizer and Kardovo Support immediately.",
                    "Do not override a rejection without written organizer approval.",
                ],
            },
        ],
    },
    {
        id: "whatsapp",
        badge: "§4",
        icon: MessageSquare,
        title: "WhatsApp & Anti-Spam",
        color: "text-green-500",
        content: [
            {
                heading: "Consent is required",
                body: "By uploading phone numbers to Kardovo, you confirm that every person on your list has agreed to receive WhatsApp messages from you. Uploading purchased lists or scraped numbers is strictly prohibited.",
            },
            {
                heading: "What you can send",
                body: null,
                list: [
                    "Event invitations with a digital pass.",
                    "RSVP confirmations and updates.",
                    "Event logistics info (venue, time, access instructions).",
                    "A single post-event thank-you where consent covers it.",
                ],
            },
            {
                heading: "What you cannot send",
                body: "Promotional campaigns, bulk marketing, or any message unrelated to the specific event the guest was added for.",
            },
            {
                heading: "Rate limits",
                body: "Messages are sent through Meta's WhatsApp Business API and UltraMsg. Delivery is automatically rate-limited to stay within platform rules. Failed messages are logged in your dashboard.",
            },
            {
                heading: "Violations",
                body: "Sending spam or non-consented messages may result in immediate account suspension. No refunds are issued for policy violations.",
            },
        ],
    },
    {
        id: "refunds",
        badge: "§5",
        icon: Scale,
        title: "Quota & Cancellations",
        color: "text-purple-500",
        content: [
            {
                heading: "How quotas work",
                body: "Pass quotas are added to your account instantly after payment. Each quota is tied to a specific event and cannot be moved to another. Unused quotas from concluded events do not carry forward.",
            },
            {
                heading: "Updating your event",
                body: "You can update event details (name, date, venue, artwork) at any time in the dashboard. Existing passes stay valid and automatically reflect the latest details. Notifying your guests of changes is your responsibility.",
            },
            {
                heading: "Refund policy",
                body: "Platform fees are non-refundable once any of the following has happened:",
                list: [
                    "At least one pass has been generated.",
                    "WhatsApp invitations have been sent.",
                    "4K pass artwork has been downloaded.",
                    "The event has been scanned at least once.",
                ],
            },
            {
                heading: "Requesting a refund",
                body: "If none of the above apply, you can request a refund within 14 days of purchase by emailing billing@kardovo.com. A minimum processing fee applies.",
            },
            {
                heading: "Event cancellation",
                body: "If you cancel your event, archive it in the dashboard to stop further scans and messages. Kardovo is not responsible for any financial obligations between you and your guests (e.g., ticket refunds or venue costs).",
            },
        ],
    },
];

export default function TermsAndConditions() {
    const isDark = false;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans transition-colors duration-300">
            <Head title="Terms, Privacy & Policies — Kardovo" />

            {/* HEADER */}
            <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/85 border-b border-slate-200/80 px-5 sm:px-8 py-3.5">
                <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => window.history.back()}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all active:scale-95 cursor-pointer"
                        >
                            <ArrowLeft className="w-3.5 h-3.5 text-cyan-500" />
                            <span className="hidden sm:inline">Back</span>
                        </button>
                        <div className="h-4 w-px bg-slate-200 hidden sm:block" />
                        <KardovoLogo imgClassName="h-7 w-7" showText={true} size="normal" />
                    </div>
                    <div className="flex items-center gap-2">
                        

                    </div>
                </div>
            </header>

            {/* PAGE TITLE */}
            <div className="max-w-4xl mx-auto px-5 sm:px-8 pt-10 pb-6">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display tracking-tight">
                    Terms, Privacy & Policies
                </h1>
                <p className="mt-1.5 text-[13px] text-slate-500">
                    Last updated: 28 August 2026 · Questions? <a href="mailto:legal@kardovo.com" className="font-semibold text-cyan-600 hover:underline">legal@kardovo.com</a>
                </p>
            </div>

            {/* ALL SECTIONS */}
            <div className="max-w-4xl mx-auto px-5 sm:px-8 pb-16 space-y-6">
                {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                        <div
                            key={section.id}
                            id={section.id}
                            className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden"
                        >
                            {/* Section header */}
                            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
                                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-400 flex-shrink-0">
                                    {section.badge}
                                </span>
                                <Icon className={`w-4 h-4 flex-shrink-0 ${section.color}`} />
                                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                                    {section.title}
                                </h2>
                            </div>

                            {/* Section body */}
                            <div className="px-6 py-5 space-y-5">
                                {section.content.map((block, i) => (
                                    <div key={i} className="space-y-1.5">
                                        <h3 className="text-[13px] font-bold text-slate-800">
                                            {block.heading}
                                        </h3>
                                        {block.body && (
                                            <p className="text-[13px] text-slate-500 leading-relaxed">
                                                {block.body}
                                            </p>
                                        )}
                                        {block.list && (
                                            <ul className="space-y-1 mt-1">
                                                {block.list.map((item, j) => (
                                                    <li key={j} className="flex items-start gap-2 text-[13px] text-slate-500 leading-relaxed">
                                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-300 flex-shrink-0" />
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}

                {/* Footer */}
                <p className="text-center text-[11.5px] text-slate-400 font-mono pt-2">
                    Kardovo Platform Technologies · © 2026 · All rights reserved
                </p>
            </div>
        </div>
    );
}
