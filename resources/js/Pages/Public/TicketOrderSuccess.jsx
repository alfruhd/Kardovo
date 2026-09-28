import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { 
    CheckCircle2, 
    Ticket as TicketIcon, 
    Calendar, 
    MapPin, 
    ArrowRight, 
    Download, 
    Clock,
    CreditCard,
    Globe
} from 'lucide-react';
import KardovoLogo from '@/Components/KardovoLogo';
import { useTicketingLanguage } from '@/Utils/ticketingTranslations';

export default function TicketOrderSuccess({ order, event, tickets = [] }) {
    const { lang, toggleLang, t } = useTicketingLanguage();

    const formattedDate = event.event_date 
        ? new Date(event.event_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        : 'Date TBD';

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col justify-between py-8 px-4 sm:px-6 selection:bg-[#16A34A] selection:text-white">
            <Head title={`Order Confirmed #${order.order_number} — Kardovo`} />

            {/* Top Brand Bar */}
            <header className="max-w-2xl mx-auto w-full flex items-center justify-between pb-6 border-b border-slate-200">
                <a href={route('tickets.marketplace')} className="cursor-pointer">
                    <KardovoLogo light={false} showText={true} textClassName="text-slate-900 text-sm font-black tracking-widest" imgClassName="h-6 w-6" />
                </a>
                <div className="flex items-center gap-3">
                    <button 
                        type="button"
                        onClick={toggleLang} 
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-300 hover:border-slate-400 hover:bg-slate-100 transition-colors text-xs font-bold text-slate-700 shadow-xs cursor-pointer"
                        title={lang === 'en' ? 'Badili lugha kuwa Kiswahili' : 'Switch language to English'}
                    >
                        <Globe className="w-3.5 h-3.5 text-[#008EE8]" />
                        <span>{lang === 'en' ? 'SWA' : 'ENG'}</span>
                    </button>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Order Confirmed</span>
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto w-full space-y-6 my-6">
                {/* Clean Confirmation Heading */}
                <div className="text-center space-y-2">
                    <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-xs">
                        <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                        Payment Successful!
                    </h1>
                    <p className="text-sm text-slate-500 max-w-md mx-auto">
                        Thank you, <span className="font-semibold text-slate-800">{order.buyer_name}</span>. Your ticket order <span className="font-mono font-medium text-slate-700">#{order.order_number}</span> has been confirmed.
                    </p>
                </div>

                {/* Event & Order Summary Card */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Occasion</span>
                            <h2 className="text-lg font-bold text-slate-900">{event.title}</h2>
                        </div>
                        <div className="text-left sm:text-right">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Paid</span>
                            <span className="text-base font-bold text-slate-900 font-mono">
                                {Number(order.total_amount || 0).toLocaleString()} {order.currency || 'TZS'}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 pt-1">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                            <span>{formattedDate} {event.event_time ? `• ${event.event_time}` : ''}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="truncate">{event.venue}, {event.city}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-slate-400 shrink-0" />
                            <span>Payment: <strong className="font-semibold text-slate-700">{order.payment_method || 'Mobile Money'}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                            <span>Status: <strong className="text-emerald-600 font-semibold uppercase">Completed</strong></span>
                        </div>
                    </div>
                </div>

                {/* Issued Tickets List */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">Your Issued Passes</h3>
                            <p className="text-xs text-slate-400">Present this pass or download PDF voucher for gate check-in</p>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                            {tickets.length} {tickets.length === 1 ? 'Pass' : 'Passes'}
                        </span>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {tickets.map((t, idx) => (
                            <div
                                key={t.id}
                                className="py-3.5 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                                        <TicketIcon className="w-4 h-4 text-slate-600" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm text-slate-900">{t.attendee_name}</span>
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                {t.ticket_tier?.name || 'Standard Pass'}
                                            </span>
                                        </div>
                                        <div className="text-xs font-mono text-slate-400 mt-0.5">
                                            Pass Code: #{t.ticket_number}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                    <a
                                        href={route('tickets.downloadPdf', t.ticket_number)}
                                        className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
                                        title="Download PDF Voucher"
                                    >
                                        <Download className="w-3.5 h-3.5 text-slate-500" />
                                        <span>PDF</span>
                                    </a>

                                    <a
                                        href={t.pass_url || `/t/${t.ticket_number}`}
                                        className="px-4 py-1.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] active:bg-[#117534] text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                                    >
                                        <span>Open Pass</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Back to Events / Explore */}
                <div className="text-center pt-2">
                    <Link
                        href={route('tickets.marketplace')}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
                    >
                        ← Back to Ticket Marketplace
                    </Link>
                </div>
            </main>

            <footer className="bg-white border-t border-slate-200 py-6 px-6 mt-auto">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4">
                    {/* Far Left: Logo */}
                    <div className="flex-1 flex justify-start opacity-90 hover:opacity-100 transition-opacity">
                        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="cursor-pointer focus:outline-none">
                            <KardovoLogo showText={true} light={false} />
                        </button>
                    </div>
                    
                    {/* Center: Copyright */}
                    <div className="flex-1 flex justify-center text-slate-500 font-medium text-xs md:text-sm text-center">
                        &copy; {new Date().getFullYear()} Kardovo. {t('All rights reserved.')}
                    </div>
                    
                    {/* Far Right: Links */}
                    <div className="flex-1 flex justify-end gap-6 font-medium text-sm text-slate-500">
                        <Link href="/terms" className="hover:text-slate-800 transition-colors">{t('Terms & Conditions')}</Link>
                        <Link href="/privacy" className="hover:text-slate-800 transition-colors">{t('Privacy Policy')}</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
