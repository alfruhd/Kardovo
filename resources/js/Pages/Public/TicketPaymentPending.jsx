import React, { useState, useEffect, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import { 
    Clock, 
    RefreshCw, 
    Lock, 
    ArrowLeft, 
    CheckCircle2, 
    Globe, 
    ArrowRight 
} from 'lucide-react';
import KardovoLogo from '@/Components/KardovoLogo';
import KardovoFooter from '@/Components/KardovoFooter';
import { useTicketingLanguage } from '@/Utils/ticketingTranslations';
import axios from 'axios';

export default function TicketPaymentPending({ ticket, order, event, tier }) {
    const { lang, toggleLang, t } = useTicketingLanguage();
    const [checking, setChecking] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [redirectUrl, setRedirectUrl] = useState('');
    const pollIntervalRef = useRef(null);

    const checkStatus = async (showFeedback = false) => {
        if (!order?.order_number || checking) return;
        setChecking(true);
        setStatusMessage('');

        try {
            const res = await axios.get(route('tickets.orderStatus', order.order_number));
            if (res.data?.is_paid) {
                setIsVerified(true);
                setRedirectUrl(res.data.redirect_url || `/t/${ticket.ticket_number}`);
                setStatusMessage(
                    lang === 'sw' 
                        ? 'Malipo yamethibitishwa! Inafungua tiketi yako sasa...' 
                        : 'Payment verified! Opening your digital ticket pass now...'
                );
                // Redirect smoothly to the live pass
                setTimeout(() => {
                    window.location.href = res.data.redirect_url || `/t/${ticket.ticket_number}`;
                }, 1200);
            } else if (showFeedback) {
                setStatusMessage(
                    lang === 'sw'
                        ? 'Malipo bado yanasubiri kuthibitishwa kwenye simu yako. Tafadhali weka namba ya siri (PIN).'
                        : 'Payment is still awaiting confirmation. Please approve the USSD prompt on your phone.'
                );
            }
        } catch (err) {
            if (showFeedback) {
                setStatusMessage(
                    lang === 'sw'
                        ? 'Imeshindikana kuhakiki hali ya malipo. Tafadhali jaribu tena.'
                        : 'Unable to verify payment status. Please try again.'
                );
            }
        } finally {
            setChecking(false);
        }
    };

    // Auto-poll every 4 seconds to detect payment completion seamlessly
    useEffect(() => {
        if (isVerified) return;

        pollIntervalRef.current = setInterval(() => {
            checkStatus(false);
        }, 4000);

        return () => {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        };
    }, [isVerified, order?.order_number]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#F0F5FA] via-[#F4F8FC] to-[#FFFFFF] text-slate-800 flex flex-col justify-between selection:bg-[#154F7C] selection:text-white relative overflow-hidden">
            {/* Subtle atmospheric ambient glow */}
            <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-gradient-to-br from-amber-200/25 to-sky-300/15 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-10 left-0 w-[450px] h-[450px] bg-gradient-to-tr from-sky-100/50 to-amber-200/20 rounded-full blur-3xl pointer-events-none -translate-x-1/4" />

            <Head title={lang === 'sw' ? `Uthibitisho wa Malipo — #${ticket.ticket_number}` : `Payment Required — #${ticket.ticket_number}`} />

            {/* Top Brand Bar */}
            <header className="max-w-2xl mx-auto w-full px-4 sm:px-6 pt-6 flex items-center justify-between pb-4 border-b border-slate-200/80 relative z-10">
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
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-black uppercase tracking-wider">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                        <span>{lang === 'sw' ? 'Inasubiri Malipo' : 'Pending Payment'}</span>
                    </div>
                </div>
            </header>

            {/* Main Pending Gate Container */}
            <main className="max-w-lg mx-auto w-full px-4 sm:px-6 my-8 space-y-6 relative z-10 animate-fadeIn">
                <div className="p-6 sm:p-8 rounded-3xl bg-white/95 backdrop-blur-2xl border border-slate-200/80 shadow-[0_24px_50px_-12px_rgba(11,37,69,0.18),0_12px_24px_-6px_rgba(11,37,69,0.10)] space-y-6 text-center">
                    
                    {/* Animated State Icon */}
                    <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-inner">
                        {isVerified ? (
                            <CheckCircle2 className="w-8 h-8 text-emerald-600 animate-bounce" />
                        ) : (
                            <Clock className="w-8 h-8 stroke-[2.5]" />
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-display tracking-tight">
                            {isVerified 
                                ? (lang === 'sw' ? 'Malipo Yamethibitishwa!' : 'Payment Verified!') 
                                : (lang === 'sw' ? 'Uthibitisho wa Malipo Unahitajika' : 'Payment Verification Required')}
                        </h1>
                        <p className="text-xs text-slate-500 max-w-xs mx-auto">
                            {isVerified
                                ? (lang === 'sw' ? 'Tiketi yako imefunguliwa na iko tayari kuingilia ukumbini.' : 'Your digital ticket pass has unlocked and is ready for gate check-in.')
                                : (lang === 'sw' 
                                    ? `Tiketi #${ticket.ticket_number} inasubiri kukamilika kwa malipo ili kutoa QR code ya kuingilia langoni.`
                                    : `Ticket #${ticket.ticket_number} requires confirmed payment before live pass and QR code are unlocked.`)}
                        </p>
                    </div>

                    {/* Security Notice Box */}
                    <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-left text-xs text-amber-900 flex items-start gap-2.5">
                        <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                            <span className="font-bold block">
                                {lang === 'sw' ? 'Ulinzi wa Tiketi na Lango la Kuingia' : 'Ticket Integrity & Anti-Fraud Gate Protection'}
                            </span>
                            <span className="text-[11px] text-amber-800 leading-relaxed block">
                                {lang === 'sw'
                                    ? 'Tiketi za Kardovo na QR code za kuingilia zimefungwa kwa usalama hadi muamala utakapothibitishwa rasmi na mtandao.'
                                    : 'Kardovo strictly hides live digital passes, barcode tokens, and gate admission QR codes until payment has been fully confirmed and verified.'}
                            </span>
                        </div>
                    </div>

                    {/* Booking Details Summary Box */}
                    <div className="rounded-2xl border border-slate-200/90 divide-y divide-slate-100 text-xs text-left overflow-hidden bg-slate-50/60">
                        <div className="p-3 flex justify-between items-center">
                            <span className="text-slate-500">{t('Event')}</span>
                            <span className="font-bold text-slate-900 truncate max-w-[200px]">
                                {event.title}
                            </span>
                        </div>
                        <div className="p-3 flex justify-between items-center">
                            <span className="text-slate-500">{lang === 'sw' ? 'Mhudhuriaji' : 'Attendee'}</span>
                            <span className="font-semibold text-slate-900">
                                {ticket.attendee_name}
                            </span>
                        </div>
                        <div className="p-3 flex justify-between items-center">
                            <span className="text-slate-500">{t('Package')}</span>
                            <span className="font-semibold text-slate-800">
                                {tier.name || 'Standard Pass'}
                            </span>
                        </div>
                        <div className="p-3 flex justify-between items-center">
                            <span className="text-slate-500">{t('Total')}</span>
                            <span className="font-black text-sm text-[#154F7C] font-mono">
                                {ticket.formatted_price}
                            </span>
                        </div>
                        {order && (
                            <div className="p-3 flex justify-between items-center">
                                <span className="text-slate-500">{t('Booking Ref')}</span>
                                <span className="font-mono font-bold text-slate-800">
                                    {order.order_number}
                                </span>
                            </div>
                        )}
                        <div className="p-3 flex justify-between items-center bg-amber-50/50">
                            <span className="text-slate-600 font-semibold">{t('Status')}</span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping" />
                                {lang === 'sw' ? 'INASUBIRI UTHIBITISHO' : 'PENDING VERIFICATION'}
                            </span>
                        </div>
                    </div>

                    {/* Inline Status Message */}
                    {statusMessage && (
                        <div className={`p-3 rounded-xl text-xs font-semibold ${
                            isVerified 
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                            {statusMessage}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="space-y-3 pt-2">
                        {isVerified ? (
                            <a
                                href={redirectUrl || `/t/${ticket.ticket_number}`}
                                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition cursor-pointer uppercase tracking-wider"
                            >
                                <span>{t('View My Tickets')}</span>
                                <ArrowRight className="w-4 h-4" />
                            </a>
                        ) : (
                            <button
                                type="button"
                                onClick={() => checkStatus(true)}
                                disabled={checking}
                                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#154F7C] to-[#327FB5] hover:from-[#1A5C91] hover:to-[#3D8EC7] active:scale-[0.98] text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-[#154F7C]/25 border border-sky-400/25 transition cursor-pointer uppercase tracking-wider disabled:opacity-75"
                            >
                                <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
                                <span>{checking ? (lang === 'sw' ? 'Inahakiki...' : 'Checking Status...') : (lang === 'sw' ? 'Hakiki Hali ya Malipo' : 'Check Payment Status')}</span>
                            </button>
                        )}

                        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-1">
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <a 
                                href={route('events.publicTickets', event.id)} 
                                className="hover:text-slate-800 font-semibold underline underline-offset-2 transition"
                            >
                                {lang === 'sw' ? 'Rudi kwenye ukurasa wa matukio' : 'Return to event tickets'}
                            </a>
                        </div>
                    </div>

                </div>
            </main>

            <KardovoFooter />
        </div>
    );
}

