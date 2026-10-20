import React, { useState, useEffect } from 'react';
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
    Globe,
    Lock,
    RefreshCw
} from 'lucide-react';
import KardovoLogo from '@/Components/KardovoLogo';
import KardovoFooter from '@/Components/KardovoFooter';
import { useTicketingLanguage } from '@/Utils/ticketingTranslations';
import axios from 'axios';

export default function TicketOrderSuccess({ order, event, tickets = [], is_paid = true }) {
    const { lang, toggleLang, t } = useTicketingLanguage();
    const [paidState, setPaidState] = useState(Boolean(is_paid || order.payment_status === 'paid'));
    const [checking, setChecking] = useState(false);
    const [toastMsg, setToastMsg] = useState('');

    const formattedDate = event.event_date 
        ? new Date(event.event_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        : 'Date TBD';

    const checkStatus = async (showFeedback = false) => {
        if (checking || paidState) return;
        setChecking(true);
        setToastMsg('');

        try {
            const res = await axios.get(route('tickets.orderStatus', order.order_number));
            if (res.data?.is_paid) {
                setPaidState(true);
                setToastMsg(lang === 'sw' ? 'Malipo yamethibitishwa! Inapakia tiketi zako...' : 'Payment verified! Loading your tickets...');
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else if (showFeedback) {
                setToastMsg(
                    lang === 'sw'
                        ? 'Malipo bado yanasubiri kuthibitishwa kwenye simu yako.'
                        : 'Payment is still awaiting confirmation on your phone.'
                );
            }
        } catch (err) {
            if (showFeedback) {
                setToastMsg(lang === 'sw' ? 'Hitilafu ya kuhakiki hali ya malipo.' : 'Error checking payment status.');
            }
        } finally {
            setChecking(false);
        }
    };

    // Auto-poll if payment is not yet confirmed
    useEffect(() => {
        if (paidState) return;

        const interval = setInterval(() => {
            checkStatus(false);
        }, 4000);

        return () => clearInterval(interval);
    }, [paidState, order.order_number]);

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col justify-between selection:bg-[#154F7C] selection:text-white">
            <Head title={paidState ? `Order Confirmed #${order.order_number} — Kardovo` : `Payment Pending #${order.order_number} — Kardovo`} />

            {/* Top Brand Bar */}
            <header className="max-w-2xl mx-auto w-full px-4 sm:px-6 pt-6 sm:pt-8 flex items-center justify-between gap-2 pb-5 sm:pb-6 border-b border-slate-200">
                <a href={route('tickets.marketplace')} className="cursor-pointer shrink-0">
                    <KardovoLogo light={false} showText={true} textClassName="text-slate-900 text-xs sm:text-sm font-black tracking-widest" imgClassName="h-5 w-5 sm:h-6 sm:w-6" />
                </a>
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <button 
                        type="button"
                        onClick={toggleLang} 
                        className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full border border-slate-300 hover:border-slate-400 hover:bg-slate-100 transition-colors text-[11px] sm:text-xs font-bold text-slate-700 shadow-xs cursor-pointer"
                        title={lang === 'en' ? 'Badili lugha kuwa Kiswahili' : 'Switch language to English'}
                    >
                        <Globe className="w-3.5 h-3.5 text-[#008EE8]" />
                        <span>{lang === 'en' ? 'SWA' : 'ENG'}</span>
                    </button>
                    {paidState ? (
                        <div className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] sm:text-xs font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{lang === 'sw' ? 'Imethibitishwa' : 'Order Confirmed'}</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
                            <span>{lang === 'sw' ? 'Inasubiri Malipo' : 'Pending Payment'}</span>
                        </div>
                    )}
                </div>
            </header>

            <main className="max-w-2xl mx-auto w-full space-y-6 my-6 px-4 sm:px-0">
                {/* Clean Confirmation Heading */}
                <div className="text-center space-y-2">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto shadow-xs border ${
                        paidState 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                            : 'bg-amber-50 text-amber-600 border-amber-200'
                    }`}>
                        {paidState ? (
                            <CheckCircle2 className="w-7 h-7" />
                        ) : (
                            <Clock className="w-7 h-7 stroke-[2.5]" />
                        )}
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                        {paidState 
                            ? (lang === 'sw' ? 'Malipo Yamekamilika Kikamilifu!' : 'Payment Successful!') 
                            : (lang === 'sw' ? 'Inasubiri Uthibitisho wa Malipo' : 'Payment Verification Pending')}
                    </h1>
                    <p className="text-sm text-slate-500 max-w-md mx-auto">
                        {paidState ? (
                            <>
                                {lang === 'sw' ? 'Asante, ' : 'Thank you, '}
                                <span className="font-semibold text-slate-800">{order.buyer_name}</span>. 
                                {lang === 'sw' ? ' Agizo lako la tiketi ' : ' Your ticket order '}
                                <span className="font-mono font-medium text-slate-700">#{order.order_number}</span> 
                                {lang === 'sw' ? ' limethibitishwa.' : ' has been confirmed.'}
                            </>
                        ) : (
                            <>
                                {lang === 'sw' 
                                    ? `Agizo #${order.order_number} limesajiliwa lakini linasubiri uthibitisho wa muamala kwenye simu yako kabla ya tiketi kufunguliwa.`
                                    : `Order #${order.order_number} is reserved. Passes will unlock immediately once payment confirmation is received.`}
                            </>
                        )}
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
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                                {paidState ? 'Total Paid' : 'Amount Due'}
                            </span>
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
                            <span>Status: {paidState ? (
                                <strong className="text-emerald-600 font-semibold uppercase">Completed</strong>
                            ) : (
                                <strong className="text-amber-600 font-semibold uppercase">Pending</strong>
                            )}</span>
                        </div>
                    </div>
                </div>

                {/* Status Toast Notification */}
                {toastMsg && (
                    <div className={`p-3 rounded-2xl text-xs font-semibold text-center border ${
                        paidState 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                        {toastMsg}
                    </div>
                )}

                {/* Check status action when pending */}
                {!paidState && (
                    <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3 text-center">
                        <div className="flex items-start gap-2.5 text-left text-xs text-amber-900">
                            <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                            <p className="text-[11px] leading-relaxed">
                                {lang === 'sw'
                                    ? 'Tiketi na QR code za kuingilia zimefungwa kwa usalama hadi malipo yatakapothibitishwa.'
                                    : 'Digital passes and admission QR codes are locked until payment is verified by the network.'}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => checkStatus(true)}
                            disabled={checking}
                            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#154F7C] to-[#327FB5] hover:from-[#1A5C91] hover:to-[#3D8EC7] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition cursor-pointer uppercase tracking-wider disabled:opacity-75"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
                            <span>{checking ? 'Checking Status...' : 'Check Payment Status'}</span>
                        </button>
                    </div>
                )}

                {/* Issued Tickets List (Unlocked only when paidState is true) */}
                {paidState && tickets.length > 0 && (
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
                            {tickets.map((t) => (
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
                                            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#154F7C] to-[#327FB5] hover:from-[#1A5C91] hover:to-[#3D8EC7] border border-sky-400/25 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs shadow-[#154F7C]/20 active:scale-95 cursor-pointer"
                                        >
                                            <span>Open Pass</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

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

            {/* Official Kardovo Footer */}
            <KardovoFooter lang={lang} />
        </div>
    );
}
