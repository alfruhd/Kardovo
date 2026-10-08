import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import { 
    Calendar, 
    MapPin, 
    Clock, 
    Ticket as TicketIcon, 
    CheckCircle2, 
    AlertCircle, 
    ArrowRight,
    ArrowLeft, 
    Plus, 
    Minus, 
    CreditCard, 
    Smartphone, 
    ShieldCheck, 
    Check,
    Home as HomeIcon,
    Building2,
    Sparkles,
    ExternalLink,
    Globe
} from 'lucide-react';
import KardovoLogo from '@/Components/KardovoLogo';
import { useTicketingLanguage } from '@/Utils/ticketingTranslations';

export default function EventTickets({ event, tiers = [] }) {
    const { auth } = usePage().props;
    const user = auth?.user;

    // Multi-language system
    const { lang, toggleLang, t } = useTicketingLanguage();

    // Multi-step state: 1 (Booking) | 2 (Details) | 3 (Payment) | 4 (Booking Created)
    const [step, setStep] = useState(1);

    // Check if entire event is sold out
    const isEventSoldOut = Boolean(
        event.is_sold_out || 
        (tiers.length > 0 && tiers.every(t => t.is_sold_out || (t.remaining_count !== undefined && t.remaining_count <= 0) || t.status === 'sold_out' || t.is_available === false))
    );

    // Initialize quantities (default 1 for the first available tier)
    const [quantities, setQuantities] = useState(() => {
        const initial = {};
        const firstAvailable = tiers.find(t => 
            !t.is_sold_out && 
            t.status !== 'sold_out' && 
            t.is_available !== false && 
            (t.remaining_count === undefined || t.remaining_count > 0)
        );
        if (firstAvailable) {
            initial[firstAvailable.id] = 1;
        }
        return initial;
    });

    // Session timer (5 minutes countdown)
    const [secondsLeft, setSecondsLeft] = useState(295);

    useEffect(() => {
        if (secondsLeft <= 0 || step === 4) return;
        const interval = setInterval(() => {
            setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, [secondsLeft, step]);

    const formatTimer = (totalSec) => {
        const mins = Math.floor(totalSec / 60);
        const secs = totalSec % 60;
        const minLabel = mins === 1 ? t('Minute') : t('Minutes');
        const secLabel = secs === 1 ? t('Second') : t('Seconds');
        return `${mins} ${minLabel} ${secs < 10 ? '0' : ''}${secs} ${secLabel}`;
    };

    // Form inputs
    const [buyerForm, setBuyerForm] = useState({
        buyer_name: user?.name || '',
        buyer_email: user?.email || '',
        buyer_phone: user?.phone || '',
        payment_phone: user?.phone || '',
        payment_method: 'Mobile Money', // 'Mobile Money' or 'Card'
        carrier: 'M-Pesa',
        accepted_terms: false,
    });

    const [formErrors, setFormErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    // Booking confirmation result (Step 4)
    const [bookingResult, setBookingResult] = useState(null);

    // Quantity helpers
    const updateQty = (tierId, delta, maxAvailable) => {
        const current = quantities[tierId] || 0;
        const next = Math.max(0, Math.min(maxAvailable || 20, current + delta));
        setQuantities({ ...quantities, [tierId]: next });
    };

    // Computed totals
    const orderItems = useMemo(() => {
        return tiers
            .filter((t) => (quantities[t.id] || 0) > 0)
            .map((t) => ({
                tier_id: t.id,
                tier: t,
                quantity: quantities[t.id],
                subtotal: quantities[t.id] * Number(t.price || 0),
            }));
    }, [tiers, quantities]);

    const totalTicketsCount = useMemo(() => {
        return orderItems.reduce((acc, item) => acc + item.quantity, 0);
    }, [orderItems]);

    const totalOrderAmount = useMemo(() => {
        return orderItems.reduce((acc, item) => acc + item.subtotal, 0);
    }, [orderItems]);

    const formatTzs = (amount) => {
        return `${Number(amount || 0).toLocaleString('en-US')} ${event.ticket_currency || 'TZS'}`;
    };

    // Navigation & Validation
    const handleContinueToDetails = () => {
        if (totalTicketsCount < 1) {
            setFormErrors({ tickets: t('select_at_least_1') });
            return;
        }
        setFormErrors({});
        setStep(2);
        window.scrollTo({ top: 120, behavior: 'smooth' });
    };

    const handleContinueToPayment = (e) => {
        e.preventDefault();
        const errors = {};
        if (!buyerForm.buyer_name.trim()) errors.buyer_name = t('name_required');
        if (!buyerForm.buyer_phone.trim()) errors.buyer_phone = t('phone_required');
        if (buyerForm.buyer_email && !/\S+@\S+\.\S+/.test(buyerForm.buyer_email)) {
            errors.buyer_email = t('valid_email');
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        // Initialize payment_phone with buyer_phone if not customized
        if (!buyerForm.payment_phone) {
            setBuyerForm(prev => ({
                ...prev,
                payment_phone: prev.buyer_phone,
            }));
        }

        setFormErrors({});
        setStep(3);
        window.scrollTo({ top: 120, behavior: 'smooth' });
    };

    const handleBack = () => {
        if (step === 3) setStep(2);
        else if (step === 2) setStep(1);
        else window.location.href = route('tickets.marketplace');
    };

    const handleFinalCheckout = async (e) => {
        e.preventDefault();
        if (!buyerForm.accepted_terms) {
            setFormErrors({ terms: t('must_accept_terms') });
            return;
        }

        if (!buyerForm.payment_method && totalOrderAmount > 0) {
            setFormErrors({ payment: t('select_payment_method') });
            return;
        }

        if (buyerForm.payment_method === 'Mobile Money' && totalOrderAmount > 0) {
            const payNum = (buyerForm.payment_phone || buyerForm.buyer_phone || '').trim();
            if (!payNum) {
                setFormErrors({ payment_phone: t('payment_phone_required') });
                return;
            }
        }

        setLoading(true);
        setApiError('');
        setFormErrors({});

        try {
            const effectivePaymentPhone = (buyerForm.payment_phone || buyerForm.buyer_phone || '').trim();
            const payload = {
                buyer_name: buyerForm.buyer_name.trim(),
                buyer_phone: buyerForm.buyer_phone.trim(),
                payment_phone: effectivePaymentPhone,
                buyer_email: buyerForm.buyer_email ? buyerForm.buyer_email.trim() : null,
                payment_method: totalOrderAmount <= 0 ? 'Free' : `${buyerForm.payment_method} (${buyerForm.carrier})`,
                carrier: buyerForm.carrier,
                items: orderItems.map((item) => ({
                    tier_id: item.tier_id,
                    quantity: item.quantity,
                })),
            };

            const response = await axios.post(route('tickets.checkout', event.id), payload);

            if (response.data?.success) {
                setBookingResult({
                    booking_ref: response.data.booking_ref || response.data.order_number,
                    event_title: response.data.event_title || event.title,
                    package_name: response.data.package_name || (orderItems[0]?.tier?.name || 'Standard Pass'),
                    quantity: response.data.quantity || totalTicketsCount,
                    service_fee: response.data.service_fee || 0,
                    total_amount: response.data.total_amount ?? totalOrderAmount,
                    status: response.data.status || 'PENDING',
                    redirect_url: response.data.redirect_url,
                });
                setStep(4);
                window.scrollTo({ top: 80, behavior: 'smooth' });
            } else {
                setApiError(lang === 'sw' ? 'Imeshindikana kukamilisha uwekaji. Tafadhali jaribu tena.' : 'Unable to complete booking. Please try again.');
            }
        } catch (err) {
            setApiError(err.response?.data?.error || (lang === 'sw' ? 'Muamala wa tiketi umeshindwa. Tafadhali hakiki taarifa zako.' : 'Booking transaction failed. Please check your information.'));
        } finally {
            setLoading(false);
        }
    };

    const fallbackCover = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80';
    const coverPhoto = event.cover_photo || fallbackCover;

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#07111E] text-slate-800 dark:text-slate-100 flex flex-col justify-between selection:bg-[#16A34A] selection:text-white">
            <Head title={`${t('CHECKOUT')} — ${event.title}`} />



            {/* ══════════════════════════════════════════════════════════════
                2. HERO CHECKOUT BANNER
               ══════════════════════════════════════════════════════════════ */}
            <div className="relative border-b border-slate-200 dark:border-white/[0.08] overflow-hidden min-h-[160px] flex items-center">
                {/* Blurred Cover Photo Background */}
                <div 
                    className="absolute inset-0 z-0"
                    style={{
                        backgroundImage: `url(${coverPhoto})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'blur(16px)',
                        transform: 'scale(1.05)'
                    }}
                />
                
                {/* Gradient Overlays for Readability */}
                <div className="absolute inset-0 z-0 bg-black/50 dark:bg-black/70 mix-blend-multiply" />
                <div className="absolute inset-0 z-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
                
                {/* Tech Mesh (Subtle) */}
                <div 
                    className="absolute inset-0 opacity-10 pointer-events-none z-0 mix-blend-overlay"
                    style={{
                        backgroundImage: 'radial-gradient(white 1px, transparent 1px)',
                        backgroundSize: '24px 24px',
                    }}
                />

                <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 relative z-10 w-full flex flex-col justify-center">
                    <div className="max-w-3xl space-y-2">
                        <h1 className="text-2xl sm:text-4xl font-black font-display tracking-tight text-white uppercase drop-shadow-md">
                            {event.title}
                        </h1>
                        <p className="text-sm sm:text-base font-medium text-white/90 drop-shadow-sm flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#16A34A]" />
                            {totalTicketsCount > 0 
                                ? (lang === 'sw' 
                                    ? `Linda tiketi ${totalTicketsCount} kabla ya muda huu kuisha.`
                                    : `Secure ${totalTicketsCount} ticket${totalTicketsCount > 1 ? 's' : ''} before this session expires.`)
                                : (lang === 'sw'
                                    ? 'Chagua tiketi zako kabla ya muda huu kuisha.'
                                    : 'Select your tickets before this session expires.')
                            }
                        </p>
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════
                3. SUB-BAR: < Back
               ══════════════════════════════════════════════════════════════ */}
            <div className="max-w-6xl mx-auto w-full px-4 sm:px-8 pt-5 pb-1">
                <button
                    type="button"
                    onClick={handleBack}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition w-fit cursor-pointer group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform text-[#16A34A]" />
                    <span>{t('Back')}</span>
                </button>
            </div>

            {/* ══════════════════════════════════════════════════════════════
                5. MAIN CONTENT AREA
               ══════════════════════════════════════════════════════════════ */}
            <main className="max-w-6xl mx-auto w-full px-4 sm:px-8 py-4 sm:py-6 flex-1">
                {/* ─────────────────────────────────────────────────────────────
                    STEP 4: BOOKING CREATED CONFIRMATION SCREEN
                   ───────────────────────────────────────────────────────────── */}
                {step === 4 && bookingResult && (
                    <div className="max-w-md mx-auto my-6 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0B1524] border border-slate-200 dark:border-white/10 shadow-xl space-y-6 text-center animate-fadeIn">
                        {/* Green Success Icon */}
                        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-[#16A34A] dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                            <Check className="w-8 h-8 stroke-[3]" />
                        </div>

                        <div className="space-y-1.5">
                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight">
                                {t('Booking Created')}
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                                {t('booking_created_subtitle')}
                            </p>
                        </div>

                        {/* Booking Details Table Box */}
                        <div className="rounded-2xl border border-slate-200 dark:border-white/10 divide-y divide-slate-100 dark:divide-white/[0.06] text-xs text-left overflow-hidden bg-slate-50/50 dark:bg-white/[0.02]">
                            <div className="p-3 flex justify-between items-center">
                                <span className="text-slate-500 dark:text-slate-400">{t('Booking Ref')}</span>
                                <span className="font-mono font-bold text-slate-900 dark:text-white">
                                    {bookingResult.booking_ref}
                                </span>
                            </div>
                            <div className="p-3 flex justify-between items-center">
                                <span className="text-slate-500 dark:text-slate-400">{t('Event')}</span>
                                <span className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]">
                                    {bookingResult.event_title}
                                </span>
                            </div>
                            <div className="p-3 flex justify-between items-center">
                                <span className="text-slate-500 dark:text-slate-400">{t('Package')}</span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                    {bookingResult.package_name}
                                </span>
                            </div>
                            <div className="p-3 flex justify-between items-center">
                                <span className="text-slate-500 dark:text-slate-400">{t('Quantity')}</span>
                                <span className="font-bold text-slate-900 dark:text-white">
                                    {bookingResult.quantity}
                                </span>
                            </div>
                            <div className="p-3 flex justify-between items-center">
                                <span className="text-slate-500 dark:text-slate-400">{t('Service fee')}</span>
                                <span className="font-semibold text-slate-700 dark:text-slate-300">
                                    {bookingResult.service_fee || 0} {event.ticket_currency || 'TZS'}
                                </span>
                            </div>
                            <div className="p-3 flex justify-between items-center bg-emerald-50/30 dark:bg-emerald-950/20">
                                <span className="font-bold text-slate-800 dark:text-slate-200">{t('Total')}</span>
                                <span className="font-black text-sm text-[#16A34A] dark:text-emerald-400 font-mono">
                                    {formatTzs(bookingResult.total_amount)}
                                </span>
                            </div>
                            <div className="p-3 flex justify-between items-center">
                                <span className="text-slate-500 dark:text-slate-400">{t('Status')}</span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-[#16A34A] dark:text-emerald-400 border border-emerald-500/30">
                                    {bookingResult.status}
                                </span>
                            </div>
                        </div>

                        <p className="text-[11px] text-slate-400">
                            {t('keep_ref_safe')}
                        </p>

                        <a
                            href={bookingResult.redirect_url || `/t/${bookingResult.booking_ref}`}
                            className="w-full py-3.5 px-4 rounded-xl bg-[#16A34A] hover:bg-[#15803D] active:bg-[#117534] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 transition cursor-pointer"
                        >
                            <span>{t('View My Tickets')}</span>
                            <ArrowRight className="w-4 h-4" />
                        </a>
                    </div>
                )}

                {/* ─────────────────────────────────────────────────────────────
                    STEPS 1, 2, 3: TWO COLUMN LAYOUT (Form on Left, Summary on Right)
                   ───────────────────────────────────────────────────────────── */}
                {step < 4 && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* ──────── LEFT COLUMN: UNIFIED STEP CONTAINER ──────── */}
                        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
                            {/* Unified Card Header: Session Expire Capsule & 1 Booking - 2 Details - 3 Payment Bar */}
                            <div className="rounded-3xl bg-white dark:bg-[#0B1524] border border-slate-200 dark:border-white/10 shadow-xs overflow-hidden">
                                {/* Top Strip: Session Expiration Countdown */}
                                <div className="px-6 py-3 bg-slate-50/70 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5 text-[#16A34A]" />
                                        <span>
                                            {lang === 'sw' ? 'Kipindi kitaisha baada ya: ' : 'Your session will expire in '}
                                        </span>
                                    </div>
                                    <span className="text-[#16A34A] dark:text-emerald-400 font-bold font-mono text-xs">
                                        {formatTimer(secondsLeft)}
                                    </span>
                                </div>

                                {/* Stepper Row: 1 Booking - 2 Details - 3 Payment */}
                                <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/[0.06]">
                                    <div className="flex items-center justify-between max-w-lg mx-auto">
                                        {/* Step 1: Booking */}
                                        <div className="flex items-center gap-2">
                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                                                step > 1 
                                                    ? 'bg-[#16A34A] text-white' 
                                                    : 'bg-[#111E2E] dark:bg-white text-white dark:text-slate-900'
                                            }`}>
                                                {step > 1 ? <Check className="w-4 h-4 stroke-[3]" /> : '1'}
                                            </div>
                                            <span className={`text-xs font-bold ${
                                                step >= 1 ? 'text-slate-900 dark:text-white' : 'text-slate-400'
                                            }`}>
                                                {t('Booking')}
                                            </span>
                                        </div>

                                        {/* Line 1 -> 2 */}
                                        <div className={`flex-1 h-0.5 mx-3 sm:mx-5 transition-colors duration-300 ${
                                            step > 1 ? 'bg-[#16A34A]' : 'bg-slate-200 dark:bg-white/10'
                                        }`} />

                                        {/* Step 2: Details */}
                                        <div className="flex items-center gap-2">
                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                                                step > 2 
                                                    ? 'bg-[#16A34A] text-white' 
                                                    : step === 2 
                                                        ? 'bg-[#111E2E] dark:bg-white text-white dark:text-slate-900' 
                                                        : 'bg-slate-100 dark:bg-white/10 text-slate-400 dark:text-slate-500'
                                            }`}>
                                                {step > 2 ? <Check className="w-4 h-4 stroke-[3]" /> : '2'}
                                            </div>
                                            <span className={`text-xs font-bold ${
                                                step >= 2 ? 'text-slate-900 dark:text-white' : 'text-slate-400'
                                            }`}>
                                                {t('Details')}
                                            </span>
                                        </div>

                                        {/* Line 2 -> 3 */}
                                        <div className={`flex-1 h-0.5 mx-3 sm:mx-5 transition-colors duration-300 ${
                                            step > 2 ? 'bg-[#16A34A]' : 'bg-slate-200 dark:bg-white/10'
                                        }`} />

                                        {/* Step 3: Payment */}
                                        <div className="flex items-center gap-2">
                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                                                step === 3 
                                                    ? 'bg-[#111E2E] dark:bg-white text-white dark:text-slate-900' 
                                                    : 'bg-slate-100 dark:bg-white/10 text-slate-400 dark:text-slate-500'
                                            }`}>
                                                3
                                            </div>
                                            <span className={`text-xs font-bold ${
                                                step === 3 ? 'text-slate-900 dark:text-white' : 'text-slate-400'
                                            }`}>
                                                {t('Payment')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Step Content Body */}
                                <div className="p-6 sm:p-7 space-y-5">
                                    {/* ── STEP 1: BOOKING ── */}
                                    {step === 1 && (
                                        <div className="space-y-5 animate-fadeIn">
                                            <div>
                                                <h2 className="text-xl font-black text-slate-900 dark:text-white font-display tracking-tight">
                                                    {t('booking_step_title')}
                                                </h2>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                    {t('booking_step_subtitle')}
                                                </p>
                                            </div>

                                    {/* Event-Level Notice Banner */}
                                    {isEventSoldOut && (
                                        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <div>
                                                <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                                                    {lang === 'sw' ? 'Tiketi za tukio hili zimeisha' : 'This occasion is fully booked'}
                                                </div>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                                    {lang === 'sw' ? 'Hakuna nafasi zilizobaki kwa sasa.' : 'All passes have been claimed.'}
                                                </p>
                                            </div>
                                            <Link
                                                href={route('tickets.marketplace')}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition shrink-0 self-start sm:self-center"
                                            >
                                                <span>{t('Explore Other Events')}</span>
                                                <ArrowRight className="w-3.5 h-3.5" />
                                            </Link>
                                        </div>
                                    )}

                                    {/* Tickets Box */}
                                    <div className="p-4 rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] space-y-3">
                                        <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                            {t('TICKETS')}
                                        </div>

                                        {tiers.length === 0 ? (
                                            <div className="py-6 text-center text-xs text-slate-400">
                                                {t('no_active_tiers')}
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-slate-200/70 dark:divide-white/[0.06]">
                                                {tiers.map((tier) => {
                                                    const isTierSoldOut = Boolean(
                                                        tier.is_sold_out || 
                                                        (tier.remaining_count !== undefined && tier.remaining_count <= 0) || 
                                                        tier.status === 'sold_out' || 
                                                        tier.is_available === false
                                                    );
                                                    const qty = isTierSoldOut ? 0 : (quantities[tier.id] || 0);
                                                    const price = Number(tier.price || 0);
                                                    const lineTotal = qty * price;
                                                    const maxCap = isTierSoldOut ? 0 : (tier.remaining_count ?? 20);

                                                    return (
                                                        <div 
                                                            key={tier.id} 
                                                            className={`py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                                                isTierSoldOut ? 'opacity-60' : ''
                                                            }`}
                                                        >
                                                            <div>
                                                                <div className={`font-bold text-sm ${isTierSoldOut ? 'text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                                                                    {tier.name}
                                                                </div>
                                                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium flex items-center gap-2">
                                                                    <span>{formatTzs(price)} {t('each')}</span>
                                                                    {!isTierSoldOut && tier.remaining_count !== undefined && tier.remaining_count <= 5 && tier.remaining_count > 0 && (
                                                                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 font-mono bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                                                                            {t('Only')} {tier.remaining_count} {t('left')}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center justify-between sm:justify-end gap-4">
                                                                {isTierSoldOut ? (
                                                                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 font-mono tracking-wider px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.06] select-none">
                                                                        {t('Sold Out')}
                                                                    </span>
                                                                ) : (
                                                                    <>
                                                                        {/* Stepper */}
                                                                        <div className="flex items-center rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#08121E] shadow-2xs overflow-hidden">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => updateQty(tier.id, -1, maxCap)}
                                                                                disabled={qty <= 0}
                                                                                className="w-9 h-9 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                                                                                aria-label="Decrease quantity"
                                                                            >
                                                                                <Minus className="w-3.5 h-3.5" />
                                                                            </button>
                                                                            <span className="w-9 text-center font-bold text-xs font-mono text-slate-900 dark:text-white select-none">
                                                                                {qty}
                                                                            </span>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => updateQty(tier.id, 1, maxCap)}
                                                                                disabled={qty >= maxCap}
                                                                                className="w-9 h-9 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                                                                                aria-label="Increase quantity"
                                                                            >
                                                                                <Plus className="w-3.5 h-3.5" />
                                                                            </button>
                                                                        </div>

                                                                        {/* Line subtotal */}
                                                                        <div className="min-w-[90px] text-right font-black text-xs sm:text-sm text-slate-900 dark:text-white font-mono">
                                                                            {formatTzs(lineTotal)}
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {/* Booking Subtotal Row */}
                                    <div className="p-3.5 rounded-xl bg-slate-100/70 dark:bg-white/[0.04] flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                            {t('Booking subtotal')}
                                        </span>
                                        <span className="text-sm font-black text-slate-900 dark:text-white font-mono">
                                            {formatTzs(totalOrderAmount)}
                                        </span>
                                    </div>

                                    {formErrors.tickets && (
                                        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 shrink-0" />
                                            <span>{formErrors.tickets}</span>
                                        </div>
                                    )}

                                    {/* Continue Button */}
                                    <button
                                        type="button"
                                        onClick={handleContinueToDetails}
                                        disabled={totalTicketsCount <= 0 || isEventSoldOut}
                                        className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                                            isEventSoldOut
                                                ? 'bg-slate-200 dark:bg-white/10 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                                                : 'bg-[#16A34A] hover:bg-[#15803D] active:bg-[#117534] disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-md shadow-emerald-700/20 cursor-pointer'
                                        }`}
                                    >
                                        <span>{isEventSoldOut ? (lang === 'sw' ? 'Zimekwisha' : 'Fully Booked') : t('Continue')}</span>
                                        {!isEventSoldOut && <ArrowRight className="w-4 h-4" />}
                                    </button>
                                        </div>
                                    )}
                                    {/* ── STEP 2: DETAILS ── */}
                                    {step === 2 && (
                                        <form onSubmit={handleContinueToPayment} className="space-y-5 animate-fadeIn">
                                            <div>
                                                <h2 className="text-xl font-black text-slate-900 dark:text-white font-display tracking-tight">
                                                    {t('personal_info_title')}
                                                </h2>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                    {t('personal_info_subtitle')}
                                                </p>
                                            </div>

                                            <div className="space-y-4">
                                                {/* Full Name */}
                                                <div>
                                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                                        {t('Full Name *')}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder={t('Enter full name')}
                                                        value={buyerForm.buyer_name}
                                                        onChange={(e) => setBuyerForm({ ...buyerForm, buyer_name: e.target.value })}
                                                        className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#08121E] text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#16A34A] transition"
                                                        required
                                                    />
                                                    {formErrors.buyer_name && (
                                                        <p className="text-[11px] text-rose-500 mt-1">{formErrors.buyer_name}</p>
                                                    )}
                                                </div>

                                                {/* Email Address */}
                                                <div>
                                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                                        {t('Email Address')}
                                                    </label>
                                                    <input
                                                        type="email"
                                                        placeholder={t('Enter your email address')}
                                                        value={buyerForm.buyer_email}
                                                        onChange={(e) => setBuyerForm({ ...buyerForm, buyer_email: e.target.value })}
                                                        className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#08121E] text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#16A34A] transition"
                                                    />
                                                    {formErrors.buyer_email && (
                                                        <p className="text-[11px] text-rose-500 mt-1">{formErrors.buyer_email}</p>
                                                    )}
                                                </div>

                                                {/* Phone Number with Country Flag Pill */}
                                                <div>
                                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                                        {t('phone_label')}
                                                    </label>
                                                    <div className="flex items-center rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#08121E] overflow-hidden focus-within:border-[#16A34A] transition">
                                                        <div className="px-3.5 py-3 bg-slate-100 dark:bg-white/[0.05] border-r border-slate-200 dark:border-white/10 flex items-center gap-1.5 shrink-0 select-none">
                                                            <span className="text-sm">🇹🇿</span>
                                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 font-mono">+255</span>
                                                        </div>
                                                        <input
                                                            type="tel"
                                                            placeholder={t('phone_placeholder')}
                                                            value={buyerForm.buyer_phone}
                                                            onChange={(e) => setBuyerForm({ ...buyerForm, buyer_phone: e.target.value })}
                                                            className="w-full px-3.5 py-3 bg-transparent text-xs font-mono font-semibold text-slate-900 dark:text-white focus:outline-none"
                                                            required
                                                        />
                                                    </div>
                                                    {formErrors.buyer_phone && (
                                                        <p className="text-[11px] text-rose-500 mt-1">{formErrors.buyer_phone}</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Continue Button */}
                                            <button
                                                type="submit"
                                                className="w-full py-3.5 px-4 rounded-xl bg-[#16A34A] hover:bg-[#15803D] active:bg-[#117534] text-white text-xs font-bold transition shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 cursor-pointer"
                                            >
                                                <span>{t('Continue to payment')}</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </form>
                                    )}

                                    {/* ── STEP 3: PAYMENT ── */}
                                    {step === 3 && (
                                        <form onSubmit={handleFinalCheckout} className="space-y-5 animate-fadeIn">
                                            <div>
                                                <h2 className="text-xl font-black text-slate-900 dark:text-white font-display tracking-tight">
                                                    {t('payment_method_title')}
                                                </h2>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                    {t('payment_method_subtitle')}
                                                </p>
                                            </div>

                                            {/* Payment Radio Options */}
                                            <div className="space-y-3">
                                                {/* Option 1: Mobile Money */}
                                                <label
                                                    onClick={() => setBuyerForm({ ...buyerForm, payment_method: 'Mobile Money' })}
                                                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                                                        buyerForm.payment_method === 'Mobile Money'
                                                            ? 'border-[#16A34A] bg-emerald-500/[0.04] dark:bg-emerald-500/[0.08] shadow-xs'
                                                            : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3.5">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/[0.05] flex items-center justify-center text-slate-700 dark:text-slate-200 shrink-0">
                                                            <Smartphone className="w-5 h-5 text-[#16A34A]" />
                                                        </div>
                                                        <div>
                                                            <div className="text-xs font-bold text-slate-900 dark:text-white">
                                                                {t('Pay Via Mobile Money')}
                                                            </div>
                                                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                                                {t('mobile_money_desc')}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                                                        buyerForm.payment_method === 'Mobile Money'
                                                            ? 'border-[#16A34A] bg-[#16A34A]'
                                                            : 'border-slate-300 dark:border-white/20'
                                                    }`}>
                                                        {buyerForm.payment_method === 'Mobile Money' && (
                                                            <div className="w-2 h-2 rounded-full bg-white" />
                                                        )}
                                                    </div>
                                                </label>

                                                {/* Mobile Money Configuration: Operator + Payment Phone */}
                                                {buyerForm.payment_method === 'Mobile Money' && (
                                                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-4 animate-fadeIn">
                                                        {/* Carrier selection pills */}
                                                        <div>
                                                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
                                                                {lang === 'sw' ? 'Chagua Mtandao wa Simu' : 'Select Mobile Carrier'}
                                                            </span>
                                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                                {[
                                                                    { id: 'M-Pesa', color: 'hover:border-red-500', active: 'border-red-500 bg-red-500/10 text-red-700 dark:text-red-400' },
                                                                    { id: 'Tigo Pesa', color: 'hover:border-blue-500', active: 'border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-400' },
                                                                    { id: 'Airtel Money', color: 'hover:border-rose-500', active: 'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-400' },
                                                                    { id: 'Halopesa', color: 'hover:border-orange-500', active: 'border-orange-500 bg-orange-500/10 text-orange-700 dark:text-orange-400' },
                                                                ].map(({ id, active }) => {
                                                                    const isSelected = buyerForm.carrier === id;
                                                                    return (
                                                                        <button
                                                                            key={id}
                                                                            type="button"
                                                                            onClick={() => setBuyerForm({ ...buyerForm, carrier: id })}
                                                                            className={`py-2 px-3 rounded-xl text-xs font-bold transition border cursor-pointer flex items-center justify-center gap-1.5 ${
                                                                                isSelected
                                                                                    ? `${active} shadow-xs font-black`
                                                                                    : 'bg-white dark:bg-[#0B1524] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-slate-300'
                                                                            }`}
                                                                        >
                                                                            <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-current' : 'bg-slate-300 dark:bg-white/20'}`} />
                                                                            {id}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>

                                                        {/* Mobile Money Payment Phone Number Input */}
                                                        <div>
                                                            <div className="flex items-center justify-between mb-1.5">
                                                                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                                                    {t('payment_phone_label')} *
                                                                </label>
                                                                {buyerForm.buyer_phone && buyerForm.payment_phone !== buyerForm.buyer_phone && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setBuyerForm({ ...buyerForm, payment_phone: buyerForm.buyer_phone })}
                                                                        className="text-[11px] font-semibold text-[#16A34A] dark:text-emerald-400 hover:underline cursor-pointer"
                                                                    >
                                                                        {lang === 'sw' ? `Tumia nambari ya ${buyerForm.buyer_phone}` : `Use attendee phone (${buyerForm.buyer_phone})`}
                                                                    </button>
                                                                )}
                                                            </div>

                                                            <div className="flex items-center rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#08121E] overflow-hidden focus-within:border-[#16A34A] transition shadow-inner">
                                                                <div className="px-3.5 py-3 bg-slate-100 dark:bg-white/[0.05] border-r border-slate-200 dark:border-white/10 flex items-center gap-1.5 shrink-0 select-none">
                                                                    <span className="text-sm">🇹🇿</span>
                                                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 font-mono">+255</span>
                                                                </div>
                                                                <input
                                                                    type="tel"
                                                                    placeholder={t('payment_phone_placeholder')}
                                                                    value={buyerForm.payment_phone !== undefined ? buyerForm.payment_phone : buyerForm.buyer_phone}
                                                                    onChange={(e) => setBuyerForm({ ...buyerForm, payment_phone: e.target.value })}
                                                                    className="w-full px-3.5 py-3 bg-transparent text-xs font-mono font-semibold text-slate-900 dark:text-white focus:outline-none"
                                                                    required
                                                                />
                                                            </div>

                                                            {formErrors.payment_phone && (
                                                                <p className="text-[11px] text-rose-500 mt-1">{formErrors.payment_phone}</p>
                                                            )}

                                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 flex items-start gap-1.5">
                                                                <Smartphone className="w-3.5 h-3.5 text-[#16A34A] shrink-0 mt-0.5" />
                                                                <span>{t('payment_phone_hint')}</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Option 2: Card */}
                                                <label
                                                    onClick={() => setBuyerForm({ ...buyerForm, payment_method: 'Card' })}
                                                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                                                        buyerForm.payment_method === 'Card'
                                                            ? 'border-[#16A34A] bg-emerald-500/[0.04] dark:bg-emerald-500/[0.08] shadow-xs'
                                                            : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3.5">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/[0.05] flex items-center justify-center text-slate-700 dark:text-slate-200 shrink-0">
                                                            <CreditCard className="w-5 h-5 text-[#008EE8]" />
                                                        </div>
                                                        <div>
                                                            <div className="text-xs font-bold text-slate-900 dark:text-white">
                                                                {t('Pay Via Card')}
                                                            </div>
                                                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                                                {t('card_desc')}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                                                        buyerForm.payment_method === 'Card'
                                                            ? 'border-[#16A34A] bg-[#16A34A]'
                                                            : 'border-slate-300 dark:border-white/20'
                                                    }`}>
                                                        {buyerForm.payment_method === 'Card' && (
                                                            <div className="w-2 h-2 rounded-full bg-white" />
                                                        )}
                                                    </div>
                                                </label>
                                            </div>

                                            {/* Policy Agreement Checkbox */}
                                            <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] space-y-2.5">
                                                <label className="flex items-start gap-2.5 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={buyerForm.accepted_terms}
                                                        onChange={(e) => setBuyerForm({ ...buyerForm, accepted_terms: e.target.checked })}
                                                        className="w-4 h-4 rounded text-[#16A34A] border-slate-300 dark:border-white/20 focus:ring-[#16A34A] mt-0.5 shrink-0"
                                                    />
                                                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                                                        {t('accept_no_refund_terms')}
                                                    </span>
                                                </label>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-6.5 leading-relaxed">
                                                    {t('terms_body_1')}
                                                </p>
                                                <div className="pl-6.5 pt-1">
                                                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                                        {t('NO-REFUND POLICY')}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 leading-normal">
                                                        {t('terms_body_2')}
                                                    </div>
                                                </div>
                                            </div>

                                            {formErrors.terms && (
                                                <p className="text-[11px] text-rose-500 font-semibold">{formErrors.terms}</p>
                                            )}

                                            {apiError && (
                                                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
                                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                                    <span>{apiError}</span>
                                                </div>
                                            )}

                                            {/* Buy Now Button */}
                                            <button
                                                type="submit"
                                                disabled={loading || !buyerForm.accepted_terms}
                                                className="w-full py-3.5 px-4 rounded-xl bg-[#16A34A] hover:bg-[#15803D] active:bg-[#117534] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 cursor-pointer"
                                            >
                                                {loading ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        <span>{t('Processing Booking...')}</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span>{t('Buy Now')} ({formatTzs(totalOrderAmount)})</span>
                                                        <ArrowRight className="w-4 h-4" />
                                                    </>
                                                )}
                                            </button>

                                            {!buyerForm.payment_method && (
                                                <p className="text-center text-[11px] text-amber-500 font-semibold">
                                                    {t('select_payment_method_to_continue')}
                                                </p>
                                            )}
                                        </form>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ──────── RIGHT COLUMN: STICKY ORDER SUMMARY CARD ──────── */}
                        <div className="lg:col-span-5 xl:col-span-4 sticky top-20 space-y-3">
                            <div className="rounded-3xl bg-white dark:bg-[#0B1524] border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
                                {/* Cover Banner Art - Inset with even spacing on all sides */}
                                <div className="p-3 pb-0">
                                    <div className="relative aspect-[4/3] sm:aspect-[1/1] max-h-[360px] w-full overflow-hidden rounded-2xl bg-white dark:bg-[#0B1524] flex items-center justify-center">
                                        {/* Full artwork shown cleanly */}
                                        <img
                                            src={coverPhoto}
                                            alt={event.title}
                                            className="w-full h-full object-contain rounded-2xl select-none"
                                        />
                                    </div>
                                </div>

                                {/* Event Info - Compact & neat typography */}
                                <div className="p-3.5 sm:p-4 space-y-2.5">
                                    <div className="space-y-1">
                                        <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white font-display uppercase tracking-tight leading-snug">
                                            {event.title}
                                        </h3>

                                        <div className="space-y-0.5 text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
                                            {event.venue && (
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="w-3 h-3 text-[#16A34A] shrink-0" />
                                                    <span className="truncate">{event.venue}</span>
                                                </div>
                                            )}
                                            {event.event_date && (
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="w-3 h-3 text-[#16A34A] shrink-0" />
                                                    <span className="truncate">
                                                        {t('Start:')} {event.event_date}
                                                        {event.event_time ? `, ${event.event_time}` : ''}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Divider & Tickets Breakdown */}
                                    <div className="border-t border-slate-100 dark:border-white/[0.06] pt-2 space-y-1">
                                        <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                                            {t('Tickets')}
                                        </div>

                                        {orderItems.length === 0 ? (
                                            <div className="text-[10px] text-slate-400 italic">
                                                {t('no_tickets_selected')}
                                            </div>
                                        ) : (
                                            <div className="space-y-0.5">
                                                {orderItems.map((item) => (
                                                    <div key={item.tier_id} className="flex justify-between items-center text-[10px] sm:text-[11px]">
                                                        <span className="text-slate-700 dark:text-slate-300 truncate max-w-[180px]">
                                                            {item.tier.name} x{item.quantity}
                                                        </span>
                                                        <span className="font-mono font-bold text-slate-900 dark:text-white shrink-0">
                                                            {formatTzs(item.subtotal)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Divider & Subtotal */}
                                    <div className="border-t border-slate-100 dark:border-white/[0.06] pt-2 space-y-1">
                                        <div className="flex justify-between items-center text-[10px] sm:text-[11px]">
                                            <span className="text-slate-500 dark:text-slate-400">{t('Subtotal')}</span>
                                            <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                                                {formatTzs(totalOrderAmount)}
                                            </span>
                                        </div>

                                        <p className="text-[8.5px] text-slate-400 leading-tight">
                                            {t('subtotal_notice')}
                                        </p>

                                        <div className="pt-0.5 text-base sm:text-lg font-black text-slate-900 dark:text-white font-mono tracking-tight">
                                            {formatTzs(totalOrderAmount)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Trust badge */}
                            <div className="p-3 rounded-2xl bg-white/60 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] flex items-center justify-center gap-1.5 text-xs text-slate-500 font-semibold">
                                <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                                <span>{t('Verified')}</span>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* ══════════════════════════════════════════════════════════════
                6. FOOTER
               ══════════════════════════════════════════════════════════════ */}
            <footer className="bg-white border-t border-slate-200 py-6 px-6">
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
