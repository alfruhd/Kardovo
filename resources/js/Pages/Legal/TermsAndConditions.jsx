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
    Ticket,
    Cookie,
    Building2,
    CheckCircle2,
    Trophy,
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
                heading: "Acceptance & Binding Agreement",
                body: "By creating an account, buying event tickets or pass quotas, accessing public invitations, or using the Kardovo platform (operated by Kardovo Platform Technologies Ltd., Dar es Salaam, Tanzania), you agree to be legally bound by these Terms of Service. If you do not agree, please discontinue using the platform immediately.",
            },
            {
                heading: "User Roles & Permissions",
                body: null,
                list: [
                    "Organizers: Authorized to manage registered events, upload guest lists with verifiable prior consent, configure digital passes, create ticket tiers, launch award categories and contestants, track real-time sales/votes, and transmit digital invitations.",
                    "Ticket Buyers: Browse public events, purchase authorized tickets with mobile money or cards without mandatory registration, receive digital ticket passes, and present dynamic QR codes at venue gates.",
                    "Voters & Contest Participants: Browse public voting competitions, purchase verified votes via authorized mobile money or cards, cast free daily allowances where enabled by organizers, and view real-time tallies.",
                    "Gate Operators: Authorized solely to scan and validate guest passes and ticket passes at venue entrances using our cryptographic scanner.",
                    "All Users: Obligated to safeguard account credentials, adhere to fair use policies, and notify Kardovo immediately of any unauthorized access or security breaches.",
                ],
            },
            {
                heading: "Passes & Tickets are Cryptographically Non-Transferable",
                body: "Each digital pass or event ticket is bound to one unique cryptographic token. Unauthorized reselling, duplication, tampering, or reproduction is strictly prohibited and triggers an immediate Red Duplicate Rejection alert at gate scanners, with potential forfeiture of entry and statutory reporting.",
            },
            {
                heading: "Awards, Contests & Voting Integrity",
                body: "Votes cast on Kardovo are processed in real time and recorded immutably upon telecommunications gateway payment confirmation. Automated scripts, emulators, bot manipulation, proxy flooding, and fraudulent payment reversals are strictly prohibited. Kardovo reserves the right to audit vote velocity, invalidate bad-faith votes, and deduct fraudulent votes from official leaderboards.",
            },
            {
                heading: "Service Availability & Maintenance",
                body: "While we engineer for continuous high availability, service is provided on an 'as-is' and 'as-available' basis. The Kardovo Gate Scanner app supports offline cryptographic validation in case of venue connectivity loss. Planned maintenance will be communicated at least 48 hours in advance.",
            },
            {
                heading: "Prohibited Actions",
                body: null,
                list: [
                    "Bypassing or tampering with platform security protocols or ticketing quotas.",
                    "Uploading guest phone numbers without prior consent, or uploading scraped lists.",
                    "Transmitting unsolicited marketing or spam through SMS, WhatsApp, or email integrations.",
                    "Accessing or attempting to access another organizer's guest or attendee records.",
                    "Reselling or sublicensing the platform without express written authorization.",
                ],
            },
            {
                heading: "Governing Law & Dispute Resolution",
                body: "These terms are governed by and construed in accordance with the laws of the United Republic of Tanzania, including the Electronic and Postal Communications Act (EPOCA) and the Personal Data Protection Act (PDPA), 2022. Any dispute not resolved through mutual consultation within thirty (30) days shall be submitted to final and binding arbitration in Dar es Salaam, Tanzania.",
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
                heading: "Our Commitment to Data Minimization",
                body: "Kardovo complies strictly with the Tanzania Personal Data Protection Act (PDPA) No. 11 of 2022, GDPR data minimization principles, and international privacy standards. We only collect data that is strictly necessary for event coordination, ticket delivery, and gate check-in. We do not sell, rent, or trade personal data to third-party marketers or data brokers.",
            },
            {
                heading: "What Data We Collect",
                body: null,
                list: [
                    "Organizers: Full name, business email, organization name, phone number, and billing history.",
                    "Ticket Buyers: Full name and phone number/email address solely for digital ticket delivery via SMS/WhatsApp and payment transaction matching.",
                    "Voters: Mobile money phone number (used for USSD payment push prompts and payment receipting), candidate selection, and vote audit timestamps.",
                    "Event Guests (RSVP): Name, phone number (used exclusively for pass delivery and logistics), RSVP status, guest count, and voluntary form responses.",
                    "Gate Verification Logs: Cryptographic check-in timestamp, scan outcome (Granted / Duplicate Rejected), and gate operator ID.",
                    "Technical Audit Logs: Anonymized IP addresses and essential session cookies for fraud prevention and CSRF protection (retained up to 90 days).",
                ],
            },
            {
                heading: "Lawful Purpose of Processing",
                body: null,
                list: [
                    "To generate and deliver personalized digital passes and event tickets.",
                    "To verify mobile money vote purchases and tabulate tamper-proof contest results.",
                    "To execute instant cryptographic gate verification and prevent ticket fraud.",
                    "To fulfill financial reporting obligations in compliance with statutory revenue authorities (TRA).",
                    "To ensure platform security and defend against cyberattacks.",
                ],
            },
            {
                heading: "Security & Encryption Safeguards",
                body: "All data in transit is encrypted using modern Transport Layer Security (TLS 1.3). Sensitive records in storage are protected using AES-256 encryption. Databases utilize tenant isolation to ensure complete separation between organizers.",
            },
            {
                heading: "Third-Party Data Processors",
                body: null,
                list: [
                    "Payment Processing: AzamPay processes mobile money (M-Pesa, TigoPesa, Airtel Money, HaloPesa, AzamPesa) and bank card transactions in a certified PCI-DSS compliant environment. Kardovo never stores sensitive credit card CVVs or mobile money PINs.",
                    "Messaging Infrastructure: Meta WhatsApp Cloud API and licensed SMS gateways (NextSMS, Beem, Twilio) for transactional pass delivery.",
                ],
            },
            {
                heading: "Data Retention & Your Statutory Rights",
                body: "Under the Tanzania PDPA and international regulations, data subjects have the right to request access to, rectification of, or erasure of their personal information. Guest lists are retained for the duration of the event plus up to 12 months for dispute resolution, then securely shredded. To exercise your rights, email legal@kardovo.com. We respond within 72 business hours.",
            },
        ],
    },
    {
        id: "cookies",
        badge: "§3",
        icon: Cookie,
        title: "Cookie Policy",
        color: "text-amber-500",
        content: [
            {
                heading: "How We Use Cookies",
                body: "Cookies are small text files stored on your device that allow web applications to function properly. Kardovo adopts a privacy-first approach: we prioritize strictly essential cookies required for session security and transactional integrity.",
            },
            {
                heading: "Types of Cookies We Use",
                body: null,
                list: [
                    "Strictly Essential Cookies (Always Active): Session authentication cookies (laravel_session) and Cross-Site Request Forgery security tokens (XSRF-TOKEN). These are mandatory for you to securely log in, navigate pages, and checkout tickets.",
                    "Preference Cookies: Local browser storage used to remember your dark/light theme choice and language selection (English vs. Swahili) locally on your device without transmitting data to servers.",
                    "Consent Management: The 'kardovo_cookie_consent' token records your choice so the banner does not re-appear on subsequent visits.",
                ],
            },
            {
                heading: "No Third-Party Advertising Trackers",
                body: "Kardovo does not deploy third-party advertising cookies, cross-site retargeting pixels (such as Meta Pixel or Google Ads tracking), or third-party behavioral fingerprinting. Any future optional analytical enhancements will always require your express prior consent.",
            },
            {
                heading: "Managing Your Cookie Preferences",
                body: "You can modify your browser settings at any time to block or delete cookies. Please note that disabling essential session cookies may prevent you from logging into your account or completing ticket checkouts.",
            },
        ],
    },
    {
        id: "refunds",
        badge: "§4",
        icon: Scale,
        title: "Refund & Cancellation Policy",
        color: "text-purple-500",
        content: [
            {
                heading: "Organizer Platform Quota Subscriptions",
                body: "Pass quota purchases are allocated immediately upon payment confirmation. Because digital infrastructure and pass generation allocations are provisioned instantly, platform quotas are non-refundable once any of the following has occurred:",
                list: [
                    "At least one personalized digital pass has been generated or dispatched.",
                    "WhatsApp or SMS invitation transmissions have been initiated.",
                    "4K pass artwork or print sheets have been exported.",
                    "A gate check-in scan has been executed for the event.",
                ],
            },
            {
                heading: "Organizer Quota Refund Window",
                body: "If none of the above provisioning triggers have occurred, organizers may request a refund within 14 calendar days of quota purchase by emailing billing@kardovo.com. Bank or mobile money network reversal processing deductions may apply.",
            },
            {
                heading: "Attendee Event Ticket Purchases",
                body: "Event tickets purchased through public checkout are non-refundable and non-exchangeable for change of mind or personal scheduling conflicts, as ticket allocations are reserved in real-time.",
            },
            {
                heading: "Awards & Pageant Vote Purchases (Irrevocable & Non-Refundable)",
                body: "All votes cast through Kardovo (paid via mobile money or bank cards) are digital consumer services fulfilled and tabulated immediately upon payment network confirmation. Votes cast are non-reversible and strictly non-refundable under all circumstances, including but not limited to nominee withdrawal, disqualification, jury veto, contest postponement, or voter remorse.",
            },
            {
                heading: "Event Postponement or Cancellation",
                body: "If an event is rescheduled by the organizer, issued digital passes automatically update with the revised venue and date details. If an event is cancelled by the organizer, the organizer is solely responsible for attendee communications and funding attendee ticket refunds. Kardovo assists in facilitating reversals through the payment gateway in accordance with consumer protection statutes.",
            },
        ],
    },
    {
        id: "security",
        badge: "§5",
        icon: ShieldCheck,
        title: "Gate Verification & Anti-Fraud",
        color: "text-rose-500",
        content: [
            {
                heading: "Tamper-Proof Cryptographic Verification",
                body: "Every Kardovo digital pass and ticket contains an unguessable 256-bit cryptographic token. When presented at venue entrances, our high-speed scanner validates the token against real-time check-in registries.",
            },
            {
                heading: "Immediate Duplicate Rejection Protocol",
                body: null,
                list: [
                    "Upon scanning a previously admitted token, the gate scanner flashes an unmistakable Red Duplicate Rejection alert.",
                    "The system logs the exact timestamp, operator device ID, and pass identification.",
                    "Admittance is denied immediately to prevent ticket sharing, counterfeiting, and venue overcapacity.",
                ],
            },
            {
                heading: "Zero-Storage Camera Privacy",
                body: "The Kardovo Scanner application accesses device cameras strictly for real-time QR code decoding on-device. No camera photos, facial scans, or video streams are saved, stored, or transmitted to servers.",
            },
        ],
    },
    {
        id: "whatsapp",
        badge: "§6",
        icon: MessageSquare,
        title: "Communications & Anti-Spam",
        color: "text-green-500",
        content: [
            {
                heading: "Prior Consent Requirement",
                body: "Organizers warrant and represent that every guest phone number uploaded to Kardovo has explicitly consented to receive event-specific communications. Using scraped databases, purchased contact lists, or unverified numbers is strictly prohibited.",
            },
            {
                heading: "Permitted Communications",
                body: "Organizers may only send transactional messages directly relevant to the specific event: personalized invitation links, RSVP confirmations, logistical updates (such as gate timings or parking guidance), and single post-event thank-you notices.",
            },
            {
                heading: "Spam Penalties",
                body: "Transmission of unsolicited commercial messages, unauthorized promotions, or non-consented bulk texts will result in immediate service suspension and possible forfeiture of platform access without refund.",
            },
        ],
    },
    {
        id: "business",
        badge: "§7",
        icon: Building2,
        title: "Business Details & Legal Disclosures",
        color: "text-blue-500",
        content: [
            {
                heading: "Operating Entity",
                body: "Kardovo is developed and operated by Kardovo Platform Technologies Ltd., a technology company registered in Dar es Salaam, United Republic of Tanzania.",
            },
            {
                heading: "Official Contact Information",
                body: null,
                list: [
                    "General & Technical Support: support@kardovo.com",
                    "Legal, Privacy & Compliance Inquiries: legal@kardovo.com",
                    "Billing & Quota Administration: billing@kardovo.com",
                    "Official Website: https://kardovo.com",
                    "Registered Jurisdiction: Dar es Salaam, Tanzania",
                ],
            },
            {
                heading: "Intellectual Property & Content Ownership",
                body: "The Kardovo platform, including its software architecture, user interface designs, dynamic pass generator, cryptographic algorithms, and proprietary brand assets, is the exclusive intellectual property of Kardovo Platform Technologies Ltd. Event artwork and custom assets uploaded by organizers remain the property of the respective event organizers.",
            },
        ],
    },
    {
        id: "compliance",
        badge: "§8",
        icon: ShieldCheck,
        title: "Statutory Compliance & International Standards",
        color: "text-indigo-500",
        content: [
            {
                heading: "GDPR Applicability & International Data Subjects",
                body: "Kardovo is primarily governed by the United Republic of Tanzania Personal Data Protection Act (PDPA No. 11 of 2022). However, where European Union (EU) or UK residents purchase tickets, receive digital passes, or RSVP for international events, Kardovo extends full GDPR extraterritorial safeguards: transparent legal bases (Article 6), strict data minimization (Article 5), explicit data processing records (Article 30), and immediate enforcement of data subject rights (Articles 15–22).",
            },
            {
                heading: "Lawful Basis for Processing",
                body: "We process personal information under the following defined lawful bases:",
                list: [
                    "Performance of Contract: Processing ticket checkouts, generating unique QR entry passes, and executing venue gate check-ins.",
                    "Explicit Consent: Opting into transactional WhatsApp or SMS notifications, and voluntarily submitting RSVP dietary/seating preferences.",
                    "Legal Obligation: Retaining mandatory financial transaction logs for tax and revenue authority compliance (Tanzania Revenue Authority - TRA).",
                    "Legitimate Interests: Defending against counterfeit passes, bot scalping, CSRF attacks, and duplicate gate entries.",
                ],
            },
            {
                heading: "Data Retention Schedules",
                body: "Data is retained strictly for the duration necessary to satisfy its operational and statutory purpose:",
                list: [
                    "Event Guest Lists & RSVP Records: Retained for the active duration of the event plus up to 12 months for attendee dispute resolution, after which organizers can purge records or the system securely shreds them.",
                    "Gate Verification & Scan Logs: Retained for 90 days following event completion for audit trail validation.",
                    "Financial & Invoicing Records: Retained for statutory periods mandated by commercial and tax legislation (up to 5 years).",
                    "User Account Profiles: Retained until the organizer requests permanent account deletion via Profile Settings.",
                ],
            },
            {
                heading: "Data Processing Agreements (DPAs) & Sub-processors",
                body: "Kardovo executes Data Processing Agreements with all licensed technical service providers to guarantee confidentiality, technical safeguards, and statutory compliance. Our critical sub-processors include: AzamPay (PCI-DSS Level 1 certified payment processing), Meta WhatsApp Business Platform (transactional messaging), and licensed regional SMS telecom gateways.",
            },
            {
                heading: "Data Breach Notification Procedure",
                body: "In the unlikely event of a confirmed personal data security breach, Kardovo maintains a formal Incident Response Protocol: containment and mitigation within 24 hours, formal statutory notification to the Tanzania Personal Data Protection Commission (PDPC) and relevant regulatory authorities within 72 hours, and transparent notification to affected data subjects where a high risk to rights and freedoms is identified.",
            },
            {
                heading: "Protection of Minors & Children's Personal Data",
                body: "The Kardovo platform and account creation services are intended exclusively for individuals aged 18 years or older. Organizers creating events that include minor attendees (such as school gatherings, family celebrations, or youth sports) represent and warrant that they possess verifiable parental or guardian consent under Tanzania PDPA Section 35 before uploading minors' names or contact details.",
            },
            {
                heading: "Open-Source Software Licensing",
                body: "Kardovo is built using high-integrity, commercially permissive open-source software libraries. Core dependencies include Laravel (MIT License), React (MIT License), Tailwind CSS (MIT License), and Inertia.js (MIT License). Web fonts (Figtree, Montserrat, Alex Brush) are distributed under the SIL Open Font License (OFL 1.1). No viral copyleft (GPL) dependencies are bundled in proprietary client modules.",
            },
        ],
    },
    {
        id: "voting",
        badge: "§9",
        icon: Trophy,
        title: "Awards, Pageants & Voting Policy",
        color: "text-amber-500",
        content: [
            {
                heading: "Scope of Voting Services",
                body: "Kardovo provides secure, real-time digital voting infrastructure for awards, beauty pageants, talent searches, corporate recognitions, and community contests across Tanzania and East Africa.",
            },
            {
                heading: "Vote Purchases & Payment Finality",
                body: "All votes cast through Kardovo (whether paid via M-Pesa, TigoPesa, Airtel Money, HaloPesa, AzamPesa, or bank cards, or free allocations where enabled by the organizer) are digital consumer transactions fulfilled immediately upon payment confirmation. Once a vote transaction is confirmed and registered in the database, it is final, irreversible, and strictly non-refundable under any circumstances, including nominee withdrawal, disqualification, or dispute.",
            },
            {
                heading: "Zero-Tolerance Anti-Fraud & Bot Prevention Policy",
                body: "To guarantee fair, genuine, and transparent competition outcomes, Kardovo enforces strict anti-manipulation protocols:",
                list: [
                    "Prohibition of Automated Scripting: The use of headless browsers, robotic macros, emulator scripts, botnets, or automated HTTP tooling to manipulate voting is strictly forbidden.",
                    "Audit Trail & Anomaly Detection: Kardovo actively analyzes real-time voting velocity, payment network telemetry, device fingerprints, and IP clustering. Suspicious voting spikes are quarantined for cryptographic manual audit.",
                    "Invalidation of Fraudulent Votes: Any votes obtained through stolen financial credentials, illicit mobile money reversals, or system exploit attempts will be immediately nullified and subtracted from official category totals.",
                    "Statutory & Civil Reporting: Kardovo reserves the right to report bad-faith bot actors and cyber-fraud syndicates to relevant statutory authorities under the Cybercrimes Act of Tanzania.",
                ],
            },
            {
                heading: "Organizer Responsibilities & Nominee Integrity",
                body: null,
                list: [
                    "Accurate Category & Nominee Details: Organizers are solely responsible for setting clear category criteria, maintaining fair eligibility rosters, and ensuring all nominee imagery and profiles are used with lawful authorization.",
                    "Prize Fulfillment & Award Ceremonies: Kardovo acts strictly as an independent technology service and payment gateway conduit. Prize disbursements, trophy awards, and gala event organization are the exclusive contractual obligations of the event organizer.",
                    "Public Tallies & Jury Adjudication: If a competition incorporates a hybrid scoring format (e.g. 60% public vote, 40% judges' panel), the organizer is obligated to clearly publish such scoring methodology in the contest rules before public voting commences.",
                ],
            },
            {
                heading: "Nominee Rights & Inquiries",
                body: "Nominees who wish to update their profile information, report impersonation, or request withdrawal from a competition should submit a written request to both the event organizer and compliance@kardovo.com. In the event of a nominee withdrawal, previously cast votes remain non-refundable to voters.",
            },
        ],
    },
];

export default function TermsAndConditions({ initialTab }) {
    React.useEffect(() => {
        if (initialTab) {
            const el = document.getElementById(initialTab);
            if (el) {
                setTimeout(() => {
                    el.scrollIntoView({ behavior: "smooth" });
                }, 100);
            }
        }
    }, [initialTab]);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans transition-colors duration-300">
            <Head title="Terms, Privacy, Cookies & Policies — Kardovo" />

            {/* HEADER */}
            <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/85 border-b border-slate-200/80 px-5 sm:px-8 py-3.5">
                <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                            <ArrowLeft className="w-3.5 h-3.5 text-cyan-500" />
                            <span className="hidden sm:inline">Back</span>
                        </button>
                        <div className="h-4 w-px bg-slate-200 hidden sm:block" />
                        <Link href="/" className="focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded-lg">
                            <KardovoLogo imgClassName="h-7 w-7" showText={true} size="normal" />
                        </Link>
                    </div>

                    {/* Quick Section Anchor Pills */}
                    <nav className="hidden md:flex items-center gap-1 text-xs font-semibold text-slate-600">
                        {sections.map((s) => (
                            <a
                                key={s.id}
                                href={`#${s.id}`}
                                className="px-2.5 py-1 rounded-md hover:bg-slate-100 hover:text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            >
                                {s.title.split(' ')[0]}
                            </a>
                        ))}
                    </nav>
                </div>
            </header>

            {/* PAGE TITLE */}
            <div className="max-w-4xl mx-auto px-5 sm:px-8 pt-10 pb-6">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display tracking-tight">
                    Terms, Privacy & Compliance Policies
                </h1>
                <p className="mt-1.5 text-[13px] text-slate-500">
                    Last updated: October 2026 · Registered in Tanzania · Questions?{" "}
                    <a href="mailto:legal@kardovo.com" className="font-semibold text-cyan-600 hover:underline focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded">
                        legal@kardovo.com
                    </a>
                </p>
            </div>

            {/* ALL SECTIONS */}
            <main className="max-w-4xl mx-auto px-5 sm:px-8 pb-16 space-y-6">
                {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                        <article
                            key={section.id}
                            id={section.id}
                            className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden scroll-mt-20"
                        >
                            {/* Section header */}
                            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
                                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-bold flex-shrink-0">
                                    {section.badge}
                                </span>
                                <Icon className={`w-4 h-4 flex-shrink-0 ${section.color}`} aria-hidden="true" />
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
                                            <p className="text-[13px] text-slate-600 leading-relaxed">
                                                {block.body}
                                            </p>
                                        )}
                                        {block.list && (
                                            <ul className="space-y-1.5 mt-1.5">
                                                {block.list.map((item, j) => (
                                                    <li key={j} className="flex items-start gap-2.5 text-[13px] text-slate-600 leading-relaxed">
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500 shrink-0 mt-1" aria-hidden="true" />
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </article>
                    );
                })}

                {/* Footer with Business Registry */}
                <footer className="pt-6 border-t border-slate-200/80 text-center space-y-2">
                    <p className="text-xs text-slate-500 font-medium">
                        Kardovo Platform Technologies Ltd. · Dar es Salaam, Tanzania · Registered Provider of Digital Pass & Ticketing Solutions
                    </p>
                    <p className="text-[11.5px] text-slate-400 font-mono">
                        © {new Date().getFullYear()} Kardovo. All rights reserved.
                    </p>
                </footer>
            </main>
        </div>
    );
}
