import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import KardovoAppLayout from '@/Layouts/KardovoAppLayout';
import {
    CheckCircle2, ArrowRight, Smartphone, CreditCard,
    Building2, QrCode, Link2, History, TrendingUp,
    ShieldCheck, Check, Tag, Printer, X, Share2, Download
} from 'lucide-react';
import EmptyEventState from '@/Components/EmptyEventState';
import Modal from '@/Components/Modal';
import KardovoLogo from '@/Components/KardovoLogo';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import ErrorBoundary from '@/Components/ErrorBoundary';

// ─── Mobile Money Providers ──────────────────────────────────────
const MOBILE_PROVIDERS = [
    { value: 'Mpesa',    label: 'M-Pesa',       color: '#fff',    textColor: '#1a1a2e',  logo: MpesaLogo    },
    { value: 'Tigo',     label: 'Mixx by Yas',  color: '#fff',    textColor: '#1a1a2e',  logo: MixxLogo     },
    { value: 'Airtel',   label: 'Airtel Money',  color: '#fff',    textColor: '#1a1a2e',  logo: AirtelLogo   },
    { value: 'Halopesa', label: 'HaloPesa',      color: '#fff',    textColor: '#1a1a2e',  logo: HalopesaLogo },
    { value: 'Azampesa', label: 'AzamPesa',      color: '#fff',    textColor: '#1a1a2e',  logo: AzampesaLogo },
];

// ─── Logo Components ─────────────────────────────────────────────
function MpesaLogo() {
    return (
        <div className="flex flex-col items-center justify-center h-full gap-0.5">
            <span className="text-[#E60000] font-black text-base tracking-tight leading-none">m-pesa</span>
            <span className="text-slate-500 text-[10px] font-semibold tracking-wider uppercase leading-none">Vodacom</span>
        </div>
    );
}
function MixxLogo() {
    return (
        <div className="flex flex-col items-center justify-center h-full gap-0.5">
            <span className="text-[#1a237e] font-black text-base italic tracking-tight leading-none">Mixx</span>
            <span className="text-[#f59e0b] text-[10px] font-black uppercase tracking-widest leading-none">by Yas</span>
        </div>
    );
}
function AirtelLogo() {
    return (
        <div className="flex flex-col items-center justify-center h-full gap-0.5">
            <span className="text-[#E8001D] font-black text-base tracking-tight leading-none">airtel</span>
            <span className="text-[#E8001D] text-[10px] font-bold tracking-widest uppercase leading-none">Money</span>
        </div>
    );
}
function HalopesaLogo() {
    return (
        <div className="flex flex-col items-center justify-center h-full gap-0.5">
            <span className="text-[#F97316] font-black text-base tracking-tight leading-none">halo</span>
            <span className="text-slate-600 text-[10px] font-bold tracking-widest uppercase leading-none">Pesa</span>
        </div>
    );
}
function AzampesaLogo() {
    return (
        <div className="flex flex-col items-center justify-center h-full gap-0.5">
            <span className="text-[#16a34a] font-black text-base tracking-tight leading-none">Azam</span>
            <span className="text-slate-600 text-[10px] font-bold tracking-widest uppercase leading-none">Pesa</span>
        </div>
    );
}


const OTHER_PROVIDERS = [
    { value: 'Visa',         label: 'Visa',              hint: 'Debit / Credit',   Icon: CreditCard },
    { value: 'Mastercard',   label: 'Mastercard',         hint: 'Debit / Credit',   Icon: CreditCard },
    { value: 'Amex',         label: 'American Express',   hint: 'Amex Card',        Icon: CreditCard },
    { value: 'UnionPay',     label: 'UnionPay',           hint: 'Union Pay',        Icon: CreditCard },
    { value: 'BankTransfer', label: 'Bank Transfer',      hint: 'CRDB, NMB & more', Icon: Building2  },
    { value: 'QRCode',       label: 'QR Code',            hint: 'Scan to pay',      Icon: QrCode     },
    { value: 'LipiaLink',    label: 'Lipia Link',         hint: 'AzamPay invoice',  Icon: Link2      },
];

const MOBILE_VALUES = MOBILE_PROVIDERS.map(p => p.value);

// ─── Mobile provider colour map ──────────────────────────────────

function parseFeatures(features) {
    if (Array.isArray(features)) return features;
    if (typeof features === 'string') {
        try { return JSON.parse(features || '[]'); } catch { return []; }
    }
    return [];
}

// ─── Main export ─────────────────────────────────────────────────
export default function PaymentsIndex(props) {
    return <ErrorBoundary><PaymentPage {...props} /></ErrorBoundary>;
}

function PaymentPage({ packages, transactions, has_event }) {
    const safePackages     = Array.isArray(packages)     ? packages     : [];
    const safeTransactions = Array.isArray(transactions) ? transactions : [];

    
    const [selectedPkg, setSelectedPkg] = useState(null);
    const [providerTab, setProviderTab] = useState('mobile');
    const [viewReceiptTx, setViewReceiptTx] = useState(null);

    const handlePrint = () => {
        if (!viewReceiptTx) return;

        // Remove previous print iframe if it exists
        const oldIframe = document.getElementById('receipt-print-frame');
        if (oldIframe) {
            oldIframe.remove();
        }

        const iframe = document.createElement('iframe');
        iframe.id = 'receipt-print-frame';
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        iframe.style.opacity = '0';
        document.body.appendChild(iframe);

        const formattedDate = viewReceiptTx.created_at
            ? new Date(viewReceiptTx.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Receipt_${viewReceiptTx.transaction_number}</title>
                <meta charset="utf-8" />
                <style>
                    @page {
                        size: A4 portrait;
                        margin: 10mm;
                    }
                    * {
                        box-sizing: border-box;
                        margin: 0;
                        padding: 0;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    body {
                        background: #ffffff !important;
                        color: #0f172a !important;
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                        padding: 10px;
                        width: 100%;
                    }
                    .invoice-box {
                        width: 100%;
                        border: 1px solid #e2e8f0;
                        border-radius: 16px;
                        padding: 36px 32px;
                        background: #ffffff;
                        min-height: calc(100vh - 20px);
                        display: flex;
                        flex-direction: column;
                        justify-content: space-between;
                    }
                    .header {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        border-bottom: 2px solid #0f172a;
                        padding-bottom: 24px;
                        margin-bottom: 28px;
                    }
                    .logo-section {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                    }
                    .logo-img {
                        height: 44px;
                        width: auto;
                        display: block;
                    }
                    .brand-title {
                        font-size: 22px;
                        font-weight: 900;
                        letter-spacing: 0.15em;
                        text-transform: uppercase;
                        color: #0f172a;
                    }
                    .brand-subtitle {
                        font-size: 11px;
                        font-weight: 600;
                        color: #64748b;
                        margin-top: 2px;
                    }
                    .receipt-badge-col {
                        text-align: right;
                    }
                    .receipt-title {
                        font-size: 20px;
                        font-weight: 900;
                        letter-spacing: 0.1em;
                        text-transform: uppercase;
                        color: #0f172a;
                    }
                    .receipt-number {
                        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                        font-size: 13px;
                        font-weight: 700;
                        color: #64748b;
                        margin-top: 4px;
                    }
                    .meta-grid {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 16px;
                        background: #f8fafc;
                        border: 1px solid #e2e8f0;
                        border-radius: 12px;
                        padding: 18px 20px;
                        margin-bottom: 32px;
                    }
                    .meta-item-label {
                        font-size: 10px;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 0.08em;
                        color: #64748b;
                        margin-bottom: 4px;
                    }
                    .meta-item-value {
                        font-size: 14px;
                        font-weight: 700;
                        color: #0f172a;
                    }
                    .status-pill {
                        display: inline-block;
                        color: #059669;
                        font-weight: 900;
                        text-transform: uppercase;
                    }
                    .table-container {
                        margin-bottom: 32px;
                        flex-grow: 1;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    th {
                        text-align: left;
                        font-size: 11px;
                        font-weight: 800;
                        text-transform: uppercase;
                        letter-spacing: 0.08em;
                        color: #64748b;
                        padding: 12px 16px;
                        background: #f1f5f9;
                        border-top: 1px solid #e2e8f0;
                        border-bottom: 1px solid #e2e8f0;
                    }
                    td {
                        padding: 18px 16px;
                        font-size: 13px;
                        color: #1e293b;
                        border-bottom: 1px solid #f1f5f9;
                    }
                    .item-name {
                        font-weight: 700;
                        color: #0f172a;
                        font-size: 14px;
                    }
                    .total-section {
                        display: flex;
                        justify-content: flex-end;
                        margin-bottom: 28px;
                    }
                    .total-card {
                        width: 320px;
                        background: #f8fafc;
                        border: 1px solid #e2e8f0;
                        border-radius: 12px;
                        padding: 20px;
                    }
                    .total-line {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 10px;
                        font-size: 13px;
                        color: #64748b;
                    }
                    .total-main {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        border-top: 2px solid #0f172a;
                        padding-top: 12px;
                        margin-top: 8px;
                    }
                    .total-main-label {
                        font-size: 14px;
                        font-weight: 900;
                        text-transform: uppercase;
                        letter-spacing: 0.08em;
                        color: #0f172a;
                    }
                    .total-main-amount {
                        font-size: 22px;
                        font-weight: 900;
                        color: #059669;
                        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                    }
                    .footer {
                        border-top: 1px solid #e2e8f0;
                        padding-top: 18px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        font-size: 11px;
                        color: #94a3b8;
                    }
                    .footer-thankyou {
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 0.12em;
                        color: #64748b;
                    }
                </style>
            </head>
            <body>
                <div class="invoice-box">
                    <div>
                        <div class="header">
                            <div class="logo-section">
                                <img src="/images/kardovo_logo_transparent.png" class="logo-img" alt="Kardovo" />
                                <div>
                                    <div class="brand-title">KARDOVO</div>
                                    <div class="brand-subtitle">Smart Digital Invitations & Event Passes</div>
                                </div>
                            </div>
                            <div class="receipt-badge-col">
                                <div class="receipt-title">Payment Receipt</div>
                                <div class="receipt-number">REF: ${viewReceiptTx.transaction_number}</div>
                            </div>
                        </div>

                        <div class="meta-grid">
                            <div>
                                <div class="meta-item-label">Date Issued</div>
                                <div class="meta-item-value">${formattedDate}</div>
                            </div>
                            <div>
                                <div class="meta-item-label">Payment Method</div>
                                <div class="meta-item-value">${viewReceiptTx.payment_method || 'Direct Payment'}</div>
                            </div>
                            <div>
                                <div class="meta-item-label">Payment Status</div>
                                <div class="meta-item-value"><span class="status-pill">${viewReceiptTx.status}</span></div>
                            </div>
                            <div>
                                <div class="meta-item-label">Currency</div>
                                <div class="meta-item-value">TZS (Tanzanian Shilling)</div>
                            </div>
                        </div>

                        <div class="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th style="width: 60%;">Description</th>
                                        <th style="text-align: center; width: 15%;">Qty</th>
                                        <th style="text-align: right; width: 25%;">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            <div class="item-name">${viewReceiptTx.title}</div>
                                            <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Kardovo Event Management Package</div>
                                        </td>
                                        <td style="text-align: center; font-weight: 700;">1</td>
                                        <td style="text-align: right; font-weight: 700; font-family: ui-monospace, monospace; font-size: 14px;">
                                            ${Number(viewReceiptTx.amount).toLocaleString()} TZS
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div>
                        <div class="total-section">
                            <div class="total-card">
                                <div class="total-line">
                                    <span>Subtotal</span>
                                    <span style="font-weight: 700; color: #0f172a; font-family: monospace;">${Number(viewReceiptTx.amount).toLocaleString()} TZS</span>
                                </div>
                                <div class="total-line">
                                    <span>Tax / Fees</span>
                                    <span style="font-weight: 700; color: #0f172a; font-family: monospace;">0 TZS</span>
                                </div>
                                <div class="total-main">
                                    <span class="total-main-label">Total Paid</span>
                                    <div>
                                        <span class="total-main-amount">${Number(viewReceiptTx.amount).toLocaleString()}</span>
                                        <span style="font-size: 11px; font-weight: 700; color: #64748b; margin-left: 2px;">TZS</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="footer">
                            <div class="footer-thankyou">Thank you for choosing Kardovo!</div>
                            <div>Generated on ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} • kardovo.com</div>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;

        const doc = iframe.contentWindow.document;
        doc.open();
        doc.write(htmlContent);
        doc.close();

        setTimeout(() => {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
        }, 250);
    };

    const handleShare = async () => {
        const text = `Kardovo Receipt #${viewReceiptTx?.transaction_number} - ${Number(viewReceiptTx?.amount).toLocaleString()} TZS`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Kardovo Receipt',
                    text: text,
                });
            } catch (err) {}
        } else {
            navigator.clipboard.writeText(text);
            alert('Receipt details copied to clipboard!');
        }
    };
 // <-- Added state for modal


    const { data, setData, post, processing, errors, reset } = useForm({
        package_id:   '',
        provider:     'Mpesa',
        mobileNumber: '',
        guests_count: 100,
    });

    const isMobile       = MOBILE_VALUES.includes(data.provider);
    const selectedPkgObj = safePackages.find(p => p.id === selectedPkg);
    const allProviders   = [...MOBILE_PROVIDERS, ...OTHER_PROVIDERS];

    const handleSelectPkg = (pkg) => {
        setSelectedPkg(pkg.id);
        setData('package_id', pkg.id);
    };

    const submitPurchase = (e) => {
        e.preventDefault();
        if (!data.package_id) return;
        post(route('organizer.pricing.purchase'), {
            onSuccess: () => { reset(); setSelectedPkg(null); },
        });
    };

    return (
        <KardovoAppLayout title="Payment">
            <Head title="Payment" />

            {!has_event ? (
                <div className="max-w-7xl mx-auto py-12 px-4">
                    <EmptyEventState
                        title="No Event Selected"
                        description="Please select an event from the dashboard or create a new one to manage messaging and broadcast passes."
                        buttonText="Go to Dashboard"
                        buttonHref={route('dashboard')}
                    />
                </div>
            ) : (
                <div className="max-w-7xl mx-auto space-y-6">

                {/* ── Page header ── */}
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white">Payment</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Select a plan and complete payment to unlock features</p>
                </div>

                <form onSubmit={submitPurchase}>
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">

                        {/* ════ LEFT COLUMN ════════════════════════════════ */}
                        <div className="space-y-5">

                            {/* ── Section 1: Packages ── */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">

                                {/* Header */}
                                <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                        <Tag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900 dark:text-white">Select Package</p>
                                        <p className="text-[11px] text-slate-400">Choose the plan that fits your needs</p>
                                    </div>
                                    {safePackages.length > 0 && (
                                        <span className="ml-auto text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                                            {safePackages.length} plans
                                        </span>
                                    )}
                                </div>

                                {/* Package cards */}
                                {safePackages.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
                                            <Tag className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <p className="text-sm font-bold text-slate-600 dark:text-slate-400">No packages available yet</p>
                                        <p className="text-xs text-slate-400 mt-1">Check back soon for available plans</p>
                                    </div>
                                ) : (
                                    <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {safePackages.map((pkg, idx) => {
                                            const price     = Number(pkg.price || 0);
                                            const selected  = selectedPkg === pkg.id;
                                            const isPopular = idx === 1;

                                            return (
                                                <div
                                                    key={pkg.id}
                                                    onClick={() => handleSelectPkg(pkg)}
                                                    className={`relative flex flex-col rounded-xl border-2 p-5 cursor-pointer transition-all select-none group
                                                        ${selected
                                                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 shadow-md shadow-emerald-500/10'
                                                            : 'border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/30 hover:border-emerald-300 dark:hover:border-emerald-700/50 hover:shadow-sm'
                                                        }`}
                                                >
                                                    {/* Radio circle top-right */}
                                                    <div className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0
                                                        ${selected ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 dark:border-slate-600'}`}>
                                                        {selected && <Check className="w-3 h-3 text-white" />}
                                                    </div>

                                                    {/* Name */}
                                                    <h3 className={`text-base font-black leading-tight pr-6 ${selected ? 'text-emerald-800 dark:text-emerald-300' : 'text-slate-900 dark:text-white'}`}>
                                                        {pkg.name}
                                                    </h3>

                                                    {/* Price */}
                                                    <div className="flex items-baseline gap-1.5 mt-2">
                                                        <span className={`text-2xl font-black tracking-tight ${selected ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-900 dark:text-white'}`}>
                                                            {price.toLocaleString()}
                                                        </span>
                                                        <span className="text-xs font-semibold text-slate-400">TZS</span>
                                                    </div>

                                                    {/* Popular badge below price */}
                                                    <div className="mt-2 min-h-[22px] flex items-center flex-1">
                                                        {isPopular && (
                                                            <span className={`self-start text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border
                                                                ${selected
                                                                    ? 'bg-emerald-500 text-white border-emerald-500'
                                                                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'}`}>
                                                                ★ Most Popular
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Footer label */}
                                                    <div className={`mt-4 pt-3 border-t text-center text-xs font-bold transition-all
                                                        ${selected
                                                            ? 'border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                                            : 'border-slate-100 dark:border-white/5 text-slate-400 group-hover:text-emerald-500'}`}>
                                                        {selected ? '✓ Selected' : 'Click to select'}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* ── Section 2: Payment Provider ── */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">

                                <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                        <CreditCard className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900 dark:text-white">Payment Provider</p>
                                        <p className="text-[11px] text-slate-400">Select your preferred payment method</p>
                                    </div>
                                </div>

                                <div className="p-5 space-y-5">
                                    {/* Tab switcher */}
                                    <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                                        {[
                                            { id: 'mobile', label: 'Mobile Money', Icon: Smartphone },
                                            { id: 'other',  label: 'Card / Bank',  Icon: CreditCard },
                                        ].map(tab => (
                                            <button
                                                key={tab.id}
                                                type="button"
                                                onClick={() => {
                                                    setProviderTab(tab.id);
                                                    setData('provider', tab.id === 'mobile' ? 'Mpesa' : 'Visa');
                                                }}
                                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                                                    providerTab === tab.id
                                                        ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm'
                                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                                                }`}
                                            >
                                                <tab.Icon className="w-3.5 h-3.5" />
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Mobile money tiles */}
                                    {providerTab === 'mobile' && (
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            {MOBILE_PROVIDERS.map(p => {
                                                const LogoComp = p.logo;
                                                const selected = data.provider === p.value;
                                                return (
                                                    <button
                                                        key={p.value}
                                                        type="button"
                                                        onClick={() => setData('provider', p.value)}
                                                        className={`relative h-20 rounded-xl border-2 transition-all overflow-hidden
                                                            ${selected
                                                                ? 'border-emerald-500 ring-2 ring-emerald-500/25 shadow-md'
                                                                : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:shadow-sm'
                                                            }`}
                                                        style={{ background: p.color }}
                                                    >
                                                        <LogoComp />
                                                        {selected && (
                                                            <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center shadow">
                                                                <Check className="w-2.5 h-2.5 text-white" />
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Card / Other tiles */}
                                    {providerTab === 'other' && (
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            {OTHER_PROVIDERS.map(p => {
                                                const selected = data.provider === p.value;
                                                return (
                                                    <button
                                                        key={p.value}
                                                        type="button"
                                                        onClick={() => setData('provider', p.value)}
                                                        className={`relative h-20 rounded-xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all
                                                            ${selected
                                                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 ring-2 ring-emerald-500/25 shadow-md'
                                                                : 'border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/40 hover:border-slate-300 hover:shadow-sm'
                                                            }`}
                                                    >
                                                        <p.Icon className={`w-5 h-5 ${selected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`} />
                                                        <span className={`text-[11px] font-bold text-center leading-tight px-1 ${selected ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-600 dark:text-slate-300'}`}>
                                                            {p.label}
                                                        </span>
                                                        {selected && (
                                                            <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center shadow">
                                                                <Check className="w-2.5 h-2.5 text-white" />
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Phone number */}
                                    {isMobile && (
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
                                            <div className="relative">
                                                <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input
                                                    type="tel"
                                                    value={data.mobileNumber}
                                                    onChange={e => setData('mobileNumber', e.target.value)}
                                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                                                    placeholder="07XXXXXXXX"
                                                    required={isMobile}
                                                />
                                            </div>
                                            {errors.mobileNumber && <p className="text-red-500 text-xs mt-1">{errors.mobileNumber}</p>}
                                            <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
                                                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                                                You'll receive a USSD prompt to confirm this payment
                                            </p>
                                        </div>
                                    )}

                                    {/* Card/Other notice */}
                                    {!isMobile && (
                                        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-sky-50 dark:bg-sky-500/10 border border-sky-100 dark:border-sky-500/20">
                                            <ShieldCheck className="w-4 h-4 text-sky-500 flex-shrink-0 mt-0.5" />
                                            <p className="text-[11px] text-sky-700 dark:text-sky-300 leading-relaxed">
                                                You'll be redirected to the <strong>AzamPay</strong> secure checkout to pay via <strong>{allProviders.find(p => p.value === data.provider)?.label}</strong>. (Integration in progress)
                                            </p>
                                        </div>
                                    )}

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        disabled={processing || !selectedPkg}
                                        className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[.99] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-emerald-600/20 disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        {processing ? (
                                            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing…</>
                                        ) : (
                                            <><ArrowRight className="w-4 h-4" /> Complete Purchase</>
                                        )}
                                    </button>

                                    {!selectedPkg && (
                                        <p className="text-center text-[11px] text-slate-400">← Select a package above to continue</p>
                                    )}

                                    <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-600 pt-1">
                                        <ShieldCheck className="w-3 h-3" />
                                        Secure Payment Guaranteed
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ════ RIGHT COLUMN — Summary (sticky) ════════════ */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto custom-scrollbar">
                            <div className="px-5 py-4 border-b border-slate-100 dark:border-white/5 sticky top-0 bg-white dark:bg-slate-900 z-10">
                                <p className="text-sm font-black text-slate-900 dark:text-white">Summary</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">Your order details</p>
                            </div>

                            <div className="p-5 space-y-4">
                                {/* Selected package */}
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xs text-slate-400 mb-0.5">Package</p>
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                            {selectedPkgObj ? selectedPkgObj.name : <span className="text-slate-400 font-normal italic">Not selected</span>}
                                        </p>
                                    </div>
                                    {selectedPkgObj && (
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-xs text-slate-400 mb-0.5">Price / Card</p>
                                            <p className="text-sm font-black text-slate-900 dark:text-white">
                                                {Number(selectedPkgObj.price || 0).toLocaleString()}
                                                <span className="text-[10px] text-slate-400 font-normal ml-1">TZS</span>
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {selectedPkgObj && (
                                    <>
                                        {/* Guests Input */}
                                        <div className="pt-2">
                                            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Number of Guests</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={data.guests_count}
                                                onChange={e => setData('guests_count', parseInt(e.target.value) || 1)}
                                                className="w-full h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-sm font-bold text-slate-800 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                                                placeholder="e.g. 100"
                                            />
                                            {errors.guests_count && (
                                                <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.guests_count}</p>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between text-xs pt-1">
                                            <span className="text-slate-400">Payment via</span>
                                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                                                {allProviders.find(p => p.value === data.provider)?.label || data.provider}
                                            </span>
                                        </div>
                                    </>
                                )}

                                <div className="border-t border-slate-100 dark:border-white/5" />

                                {/* Total */}
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Payable</p>
                                    <div className="text-right">
                                        <p className="text-2xl font-black text-slate-900 dark:text-white">
                                            {selectedPkgObj ? Number((selectedPkgObj.price || 0) * (data.guests_count || 1)).toLocaleString() : '0'}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-semibold">TZS</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 py-2.5 rounded-lg">
                                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                                    Secure Payment Guaranteed
                                </div>

                                {/* What's included */}
                                {selectedPkgObj && parseFeatures(selectedPkgObj.features).length > 0 && (
                                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5">
                                        <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">What's Included</p>
                                        {parseFeatures(selectedPkgObj.features).map((f, i) => (
                                            <div key={i} className="flex items-start gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                                {f}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </form>

                {/* ════ TRANSACTION HISTORY ════════════════════════════════ */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                            <History className="w-3.5 h-3.5 text-slate-500" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white">Transaction History</p>
                            <p className="text-[11px] text-slate-400">Your payment records</p>
                        </div>
                        {safeTransactions.length > 0 && (
                            <span className="ml-auto text-[11px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-full px-2.5 py-1">
                                {safeTransactions.length} records
                            </span>
                        )}
                    </div>

                    {safeTransactions.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-[10px] text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-800/30">
                                        <th className="px-6 py-3 text-left font-semibold">Date</th>
                                        <th className="px-6 py-3 text-left font-semibold">Description</th>
                                        <th className="px-6 py-3 text-left font-semibold">Method</th>
                                        <th className="px-6 py-3 text-left font-semibold">Reference</th>
                                        <th className="px-6 py-3 text-right font-semibold">Amount</th>
                                        <th className="px-6 py-3 text-center font-semibold">Status</th>
                                        <th className="px-6 py-3 text-right font-semibold">Receipt</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                    {safeTransactions.map(tx => (
                                        <tr key={tx.id} className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                                                {tx.transaction_date
                                                    ? new Date(tx.transaction_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                                                    : '—'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                                                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                                    </div>
                                                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[180px] truncate">{tx.title}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-500">{tx.payment_method || '—'}</td>
                                            <td className="px-6 py-4 font-mono text-[11px] text-slate-400">{tx.transaction_number}</td>
                                            <td className="px-6 py-4 text-right font-black text-sm whitespace-nowrap text-emerald-600 dark:text-emerald-400">
                                                {Number(tx.amount || 0).toLocaleString()}
                                                <span className="text-slate-400 text-[10px] ml-1 font-normal">TZS</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase
                                                    ${tx.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
                                                    : tx.status === 'pending'   ? 'bg-amber-100  text-amber-700  dark:bg-amber-500/15  dark:text-amber-400'
                                                    :                            'bg-rose-100   text-rose-700   dark:bg-rose-500/15   dark:text-rose-400'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                                        tx.status === 'completed' ? 'bg-emerald-500'
                                                        : tx.status === 'pending' ? 'bg-amber-500 animate-pulse'
                                                        : 'bg-rose-500'}`} />
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => setViewReceiptTx(tx)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 rounded-lg transition cursor-pointer"
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                <History className="w-5 h-5 text-slate-400 opacity-60" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold text-slate-600 dark:text-slate-400">No payments yet</p>
                                <p className="text-xs text-slate-400 mt-1">Your purchase history will appear here</p>
                            </div>
                        </div>
                    )}
                </div>

                </div>
            )}
        
                                                
                <Modal show={!!viewReceiptTx} onClose={() => setViewReceiptTx(null)} maxWidth="md">
                    
                    {viewReceiptTx && (
                        <div className="bg-slate-100 dark:bg-[#0B1524] rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
                            {/* Actions Header */}
                            <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.02] flex-shrink-0 print-hidden">
                                <button 
                                    onClick={() => setViewReceiptTx(null)}
                                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
                                    title="Close"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={handlePrint}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 dark:text-slate-400 dark:hover:text-emerald-400 dark:hover:bg-emerald-500/10 transition cursor-pointer"
                                        title="Print"
                                    >
                                        <Printer className="w-3.5 h-3.5" />
                                        <span>Print</span>
                                    </button>
                                    <button
                                        onClick={handlePrint}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 dark:text-slate-400 dark:hover:text-emerald-400 dark:hover:bg-emerald-500/10 transition cursor-pointer"
                                        title="Download as PDF"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        <span>Download</span>
                                    </button>
                                    <button
                                        onClick={handleShare}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 dark:text-slate-400 dark:hover:text-emerald-400 dark:hover:bg-emerald-500/10 transition cursor-pointer"
                                        title="Share"
                                    >
                                        <Share2 className="w-3.5 h-3.5" />
                                        <span>Share</span>
                                    </button>
                                </div>
                            </div>

                            {/* Minimalist Printable Receipt */}
                            <div className="overflow-y-auto flex-1 p-6 sm:p-8 relative">
                                <div id="printable-receipt" className="max-w-sm mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-6 sm:p-8 rounded-xl shadow-sm relative overflow-hidden">
                                    
                                    {/* Background Watermark Graphic */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] dark:opacity-[0.02] pointer-events-none">
                                        <KardovoLogo className="w-auto h-32 grayscale" showText={false} />
                                    </div>

                                    {/* Header */}
                                    <div className="flex flex-col items-center justify-center text-center space-y-1 relative z-10 mb-6">
                                        <KardovoLogo showText={false} className="w-auto h-8 mb-2" />
                                        <h2 className="text-xl font-black tracking-widest uppercase text-slate-900 dark:text-white">Kardovo</h2>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Payment Receipt</p>
                                    </div>

                                    {/* Divider */}
                                    <div className="border-t-2 border-dashed border-slate-200 dark:border-white/10 relative z-10 my-4"></div>

                                    {/* Details Grid */}
                                    <div className="space-y-3 relative z-10">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-slate-500 font-medium">Receipt No:</span>
                                            <span className="font-mono font-bold text-slate-900 dark:text-white">
                                                {viewReceiptTx.transaction_number}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-slate-500 font-medium">Date:</span>
                                            <span className="font-bold text-slate-900 dark:text-white">
                                                {new Date(viewReceiptTx.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-slate-500 font-medium">Method:</span>
                                            <span className="font-bold text-slate-900 dark:text-white">
                                                {viewReceiptTx.payment_method || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-slate-500 font-medium">Status:</span>
                                            <span className={`font-black uppercase tracking-wider ${viewReceiptTx.status === 'completed' || viewReceiptTx.status === 'success' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                                                {viewReceiptTx.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div className="border-t-2 border-dashed border-slate-200 dark:border-white/10 relative z-10 my-4"></div>

                                    {/* Item Line */}
                                    <div className="relative z-10 my-4">
                                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 leading-snug">
                                            {viewReceiptTx.title}
                                        </p>
                                        <div className="flex justify-between text-xs mt-2">
                                            <span className="text-slate-500 font-medium">Amount</span>
                                            <span className="font-mono font-bold text-slate-900 dark:text-white">
                                                {Number(viewReceiptTx.amount).toLocaleString()} TZS
                                            </span>
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div className="border-t-2 border-slate-800 dark:border-white/20 relative z-10 my-4"></div>

                                    {/* Total */}
                                    <div className="flex justify-between items-center relative z-10">
                                        <span className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">Total Paid</span>
                                        <div className="text-right">
                                            <span className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                                                {Number(viewReceiptTx.amount).toLocaleString()} <span className="text-[10px] text-slate-500 font-sans">TZS</span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="text-center mt-8 relative z-10">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Thank you!</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </Modal>

            </KardovoAppLayout>
    );
}
