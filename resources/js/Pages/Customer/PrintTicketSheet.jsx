import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { 
    Printer, 
    ArrowLeft, 
    Download, 
    Scissors, 
    CheckCircle2, 
    Calendar, 
    MapPin, 
    Ticket as TicketIcon,
    Layers,
    Filter
} from 'lucide-react';
import KardovoLogo from '@/Components/KardovoLogo';

export default function PrintTicketSheet({ event, tiers = [], tickets = [], selectedTierId = 'all', selectedOrderId = null }) {
    const [tierFilter, setTierFilter] = useState(selectedTierId);

    const filteredTickets = tickets.filter(t => {
        if (tierFilter && tierFilter !== 'all' && String(t.ticket_tier_id || t.tier_id) !== String(tierFilter)) {
            // Also check tier name if id is not directly matched
            if (t.tier_name && tiers.find(tr => String(tr.id) === String(tierFilter))?.name !== t.tier_name) {
                return false;
            }
        }
        return true;
    });

    const handlePrint = () => {
        window.print();
    };

    const templateConfig = event.ticket_template_config || {};
    const accentColor = templateConfig.accent_color || '#10b981';

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900">
            <Head title={`Print Tickets Sheet — ${event.title}`} />

            {/* Print CSS Configuration */}
            <style>{`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 10mm 8mm;
                    }
                    body {
                        background: #ffffff !important;
                        color: #000000 !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .print-page-ticket {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                        margin-bottom: 8mm !important;
                        border: 1.5px solid #334155 !important;
                        box-shadow: none !important;
                    }
                }
            `}</style>

            {/* ── TOP CONTROL TOOLBAR (HIDDEN ON PRINT) ── */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm no-print px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link
                        href={route('ticketing.index', { event_id: event.id })}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1.5 text-xs font-bold"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Back to Ticketing</span>
                    </Link>

                    <div>
                        <h1 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                            <span>Print Ticket Sheets</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold">
                                {filteredTickets.length} Passes Ready
                            </span>
                        </h1>
                        <p className="text-xs text-slate-500 truncate max-w-xs sm:max-w-md">
                            {event.title} • {event.event_date}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    {/* Tier Filter */}
                    <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
                        <Filter className="w-3.5 h-3.5 text-slate-500" />
                        <select
                            value={tierFilter}
                            onChange={(e) => setTierFilter(e.target.value)}
                            className="bg-transparent border-none text-xs font-bold text-slate-700 focus:ring-0 p-0 pr-6 cursor-pointer"
                        >
                            <option value="all">All Tiers ({tickets.length})</option>
                            {tiers.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Export CSV */}
                    <a
                        href={route('events.tickets.exportCsv', { event: event.id, tier_id: tierFilter })}
                        className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
                        title="Download CSV spreadsheet for external barcode printers"
                    >
                        <Download className="w-4 h-4 text-emerald-600" />
                        <span className="hidden md:inline">Export CSV</span>
                    </a>

                    {/* Print Button */}
                    <button
                        type="button"
                        onClick={handlePrint}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-black flex items-center gap-2 shadow-md shadow-emerald-600/25 transition cursor-pointer"
                    >
                        <Printer className="w-4 h-4" />
                        <span>Print Tickets</span>
                    </button>
                </div>
            </header>

            {/* Print Instructions Notice (No Print) */}
            <div className="max-w-4xl mx-auto px-4 pt-4 pb-2 no-print">
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                    <Scissors className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                        <strong>Physical Ticket Sheet Ready for Printing:</strong> Each horizontal ticket includes cut-guides and a perforated tear-line with semicircular notch cutouts.
                        In your browser print dialog, ensure <strong>"Background graphics"</strong> is checked and paper size is set to <strong>A4</strong>.
                    </div>
                </div>
            </div>

            {/* ── TICKETS LIST SHEET ── */}
            <main className="max-w-4xl mx-auto px-4 py-4 space-y-6">
                {filteredTickets.length === 0 ? (
                    <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 space-y-3">
                        <TicketIcon className="w-10 h-10 text-slate-400 mx-auto" />
                        <p className="font-bold text-sm">No tickets found for the selected filter.</p>
                        <Link
                            href={route('ticketing.index', { event_id: event.id })}
                            className="inline-block px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                        >
                            Generate Tickets in Ticketing Portal
                        </Link>
                    </div>
                ) : (
                    filteredTickets.map((t, idx) => (
                        <div key={t.id || idx} className="space-y-2">
                            {/* Cut guide line between tickets */}
                            {idx > 0 && (
                                <div className="flex items-center gap-2 text-slate-400 text-[10px] uppercase font-mono tracking-wider py-1 select-none">
                                    <Scissors className="w-3.5 h-3.5 -scale-x-100" />
                                    <div className="flex-1 border-t-2 border-dashed border-slate-300" />
                                    <span>Cut Along Line</span>
                                    <div className="flex-1 border-t-2 border-dashed border-slate-300" />
                                    <Scissors className="w-3.5 h-3.5" />
                                </div>
                            )}

                            {/* ── AUTHENTIC HORIZONTAL PERFORATED TICKET CARD ── */}
                            <div className="print-page-ticket relative flex flex-col md:flex-row rounded-3xl bg-white border border-slate-300 shadow-md overflow-hidden text-slate-900 transition">
                                
                                {/* ── LEFT SECTION (68% width): MAIN EVENT INFO ── */}
                                <div className="flex-1 flex flex-col justify-between p-5 md:p-6 relative">
                                    {/* Top Accent Strip */}
                                    <div 
                                        className="absolute top-0 left-0 right-0 h-2" 
                                        style={{ backgroundColor: t.tier_color || accentColor }} 
                                    />

                                    <div>
                                        {/* Header Bar */}
                                        <div className="flex items-start justify-between gap-3 mb-2.5">
                                            <div className="flex items-center gap-2">
                                                <KardovoLogo light={false} showText={true} textClassName="text-slate-900 text-xs font-black tracking-widest" imgClassName="h-5 w-5" />
                                                <span 
                                                    className="text-[9.5px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full text-white"
                                                    style={{ backgroundColor: t.tier_color || accentColor }}
                                                >
                                                    {templateConfig.badge_text || 'OFFICIAL PASS'}
                                                </span>
                                            </div>

                                            <div className="text-right">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Class / Tier</span>
                                                <span className="text-xs font-black text-slate-900 uppercase">
                                                    {t.tier_name}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Event Title */}
                                        <h2 className="text-lg md:text-xl font-black text-slate-950 font-display tracking-tight leading-snug">
                                            {event.title}
                                        </h2>

                                        {/* Meta details grid */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                                            <div>
                                                <span className="text-[9px] font-bold uppercase text-slate-400 block tracking-wider">Attendee</span>
                                                <span className="font-black text-slate-900 truncate block">{t.attendee_name}</span>
                                            </div>
                                            <div>
                                                <span className="text-[9px] font-bold uppercase text-slate-400 block tracking-wider">Date &amp; Time</span>
                                                <span className="font-bold text-slate-800 truncate block">
                                                    {event.event_date} {event.event_time ? `• ${event.event_time}` : ''}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-[9px] font-bold uppercase text-slate-400 block tracking-wider">Venue</span>
                                                <span className="font-bold text-slate-800 truncate block">{event.venue}, {event.city}</span>
                                            </div>
                                            <div>
                                                <span className="text-[9px] font-bold uppercase text-slate-400 block tracking-wider">Price</span>
                                                <span className="font-black text-emerald-700 font-mono block">
                                                    {t.formatted_price || `${Number(t.price_paid || 0).toLocaleString()} ${t.currency || 'TZS'}`}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom Instructions / Security */}
                                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                                        <span>
                                            {event.ticket_instructions || templateConfig.custom_instructions || 'Present this pass at the gate for scanning. Valid for single admission.'}
                                        </span>
                                        <span className="font-mono font-bold text-slate-600 shrink-0">
                                            #{t.ticket_number}
                                        </span>
                                    </div>
                                </div>

                                {/* ── PERFORATION DIVIDER WITH SEMICIRCULAR NOTCHES ── */}
                                <div className="relative flex md:flex-col items-center justify-between shrink-0 select-none">
                                    {/* Top Circular Cutout Notch */}
                                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-slate-100 border border-slate-300 z-10" />

                                    {/* Perforation Dashed Line */}
                                    <div className="hidden md:block w-[2px] h-full border-r-2 border-dashed border-slate-300 mx-2" />
                                    <div className="md:hidden w-full h-[2px] border-t-2 border-dashed border-slate-300 my-2" />

                                    {/* Tear Off Text */}
                                    <div className="hidden md:flex flex-col items-center justify-center my-auto px-1">
                                        <span className="text-[9px] font-mono font-bold uppercase text-slate-400 tracking-widest [writing-mode:vertical-lr] rotate-180">
                                            TEAR OFF STUB
                                        </span>
                                    </div>

                                    {/* Bottom Circular Cutout Notch */}
                                    <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-slate-100 border border-slate-300 z-10" />
                                </div>

                                {/* ── RIGHT SECTION (32% width): TEAR-OFF STUB & QR ── */}
                                <div className="w-full md:w-64 bg-slate-50/70 p-5 flex flex-col justify-between items-center text-center border-t md:border-t-0 md:border-l border-slate-200">
                                    <div className="w-full">
                                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                                            GATE PASS STUB
                                        </div>
                                        <div className="text-xs font-black text-slate-900 truncate">
                                            {t.attendee_name}
                                        </div>
                                        <div className="text-[10px] font-mono font-bold text-emerald-700">
                                            #{t.ticket_number}
                                        </div>
                                    </div>

                                    {/* Scannable Gate QR Code */}
                                    <div className="my-2 p-2 rounded-2xl bg-white border border-slate-200 shadow-xs inline-block">
                                        {t.qr_data_uri ? (
                                            <img
                                                src={t.qr_data_uri}
                                                alt={`QR #${t.ticket_number}`}
                                                className="w-28 h-28 mx-auto block rounded-lg"
                                            />
                                        ) : (
                                            <div className="w-28 h-28 bg-slate-100 flex items-center justify-center text-xs font-mono text-slate-400">
                                                QR Code
                                            </div>
                                        )}
                                        <div className="text-[10px] font-mono font-bold text-slate-800 tracking-widest mt-1">
                                            {t.unique_code}
                                        </div>
                                    </div>

                                    {/* Barcode Graphic Simulation */}
                                    <div className="w-full">
                                        <div className="flex items-center justify-center gap-[2px] h-6 overflow-hidden px-2">
                                            {[2, 1, 3, 1, 4, 1, 2, 3, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 3, 1, 2, 4, 1, 3, 2, 1].map((w, i) => (
                                                <div
                                                    key={i}
                                                    className="bg-slate-900 shrink-0"
                                                    style={{ width: `${w}px`, height: '22px' }}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mt-1 block">
                                            SCAN AT GATE • ADMIT 1
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </main>
        </div>
    );
}
