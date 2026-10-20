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
    Globe,
    Lock,
    RefreshCw,
    ShieldAlert,
    Tag,
    X
} from 'lucide-react';
import KardovoLogo from '@/Components/KardovoLogo';
import KardovoFooter from '@/Components/KardovoFooter';
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

    const generateIdempotencyUuid = () => {
        if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
            return window.crypto.randomUUID();
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    };

    const [idempotencyKey, setIdempotencyKey] = useState(() => generateIdempotencyUuid());
    const [formErrors, setFormErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    // Booking confirmation result (Step 4)
    const [bookingResult, setBookingResult] = useState(null);
    const [checkingPayment, setCheckingPayment] = useState(false);
    const [statusToast, setStatusToast] = useState('');

    // Quantity helpers
    const updateQty = (tierId, delta, maxAvailable) => {
        const current = quantities[tierId] || 0;
        const next = Math.max(0, Math.min(maxAvailable || 20, current + delta));
        setQuantities({ ...quantities, [tierId]: next });
        setIdempotencyKey(generateIdempotencyUuid());
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

    // Discount code state & live calculation
    const [discountInput, setDiscountInput] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState(null);
    const [discountLoading, setDiscountLoading] = useState(false);
    const [discountError, setDiscountError] = useState('');

    const finalOrderAmount = useMemo(() => {
        if (!appliedDiscount) return totalOrderAmount;
        return Math.max(0, totalOrderAmount - Number(appliedDiscount.discount_amount || 0));
    }, [totalOrderAmount, appliedDiscount]);

    const handleApplyDiscount = async (e) => {
        if (e) e.preventDefault();
        const code = (discountInput || '').trim();
        if (!code) return;
        setDiscountLoading(true);
        setDiscountError('');
        try {
            const res = await axios.post(route('tickets.validateDiscount', event.id), {
                code,
                subtotal: totalOrderAmount,
            });
            if (res.data?.valid) {
                setAppliedDiscount(res.data);
                setDiscountError('');
                setIdempotencyKey(generateIdempotencyUuid());
            }
        } catch (err) {
            setAppliedDiscount(null);
            setDiscountError(err.response?.data?.message || (lang === 'sw' ? 'Kodi ya punguzo si sahihi au imeisha muda wake.' : 'Invalid or expired discount code.'));
        } finally {
            setDiscountLoading(false);
        }
    };

    const handleRemoveDiscount = () => {
        setAppliedDiscount(null);
        setDiscountInput('');
        setDiscountError('');
        setIdempotencyKey(generateIdempotencyUuid());
    };

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

        if (!buyerForm.payment_method && finalOrderAmount > 0) {
            setFormErrors({ payment: t('select_payment_method') });
            return;
        }

        if (buyerForm.payment_method === 'Mobile Money' && finalOrderAmount > 0) {
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
                idempotency_key: idempotencyKey,
                buyer_name: buyerForm.buyer_name.trim(),
                buyer_phone: buyerForm.buyer_phone.trim(),
                payment_phone: effectivePaymentPhone,
                buyer_email: buyerForm.buyer_email ? buyerForm.buyer_email.trim() : null,
                payment_method: finalOrderAmount <= 0 ? 'Free' : `${buyerForm.payment_method} (${buyerForm.carrier})`,
                carrier: buyerForm.carrier,
                discount_code: appliedDiscount?.code || null,
                items: orderItems.map((item) => ({
                    tier_id: item.tier_id,
                    quantity: item.quantity,
                })),
            };

            const response = await axios.post(route('tickets.checkout', event.id), payload, {
                headers: {
                    'Idempotency-Key': idempotencyKey,
                },
            });

            if (response.data?.success) {
                const isPaid = Boolean(response.data.is_paid || response.data.payment_status === 'paid' || response.data.status === 'CONFIRMED' || response.data.status === 'PAID');
                setBookingResult({
                    booking_ref: response.data.booking_ref || response.data.order_number,
                    event_title: response.data.event_title || event.title,
                    package_name: response.data.package_name || (orderItems[0]?.tier?.name || 'Standard Pass'),
                    quantity: response.data.quantity || totalTicketsCount,
                    service_fee: response.data.service_fee || 0,
                    total_amount: response.data.total_amount ?? totalOrderAmount,
                    status: response.data.status || (isPaid ? 'CONFIRMED' : 'PENDING'),
                    payment_status: response.data.payment_status || (isPaid ? 'paid' : 'pending'),
                    is_paid: isPaid,
                    payment_phone: response.data.payment_phone || effectivePaymentPhone,
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

    const handleCheckPaymentStatus = async (showToast = true) => {
        if (!bookingResult?.booking_ref || checkingPayment) return;
        setCheckingPayment(true);
        setStatusToast('');
        try {
            const res = await axios.get(route('tickets.orderStatus', bookingResult.booking_ref));
            if (res.data?.is_paid) {
                setBookingResult(prev => ({
                    ...prev,
                    status: 'CONFIRMED',
                    payment_status: 'paid',
                    is_paid: true,
                    redirect_url: res.data.redirect_url || prev.redirect_url,
                }));
                setStatusToast(lang === 'sw' ? 'Malipo yamethibitishwa! Tiketi zimefunguliwa.' : 'Payment confirmed! Your tickets are unlocked.');
            } else if (showToast) {
                setStatusToast(lang === 'sw' 
                    ? 'Malipo bado hayajathibitishwa. Tafadhali hakiki ombi la USSD kwenye simu yako.' 
                    : 'Payment is still awaiting confirmation. Please approve the USSD prompt on your phone.');
            }
        } catch (err) {
            if (showToast) {
                setStatusToast(lang === 'sw' ? 'Hitilafu ya kuhakiki hali ya malipo.' : 'Error checking payment status.');
            }
        } finally {
            setCheckingPayment(false);
        }
    };

    // Auto-polling when waiting for payment in Step 4
    useEffect(() => {
        if (step !== 4 || !bookingResult || bookingResult.is_paid) return;

        const interval = setInterval(() => {
            handleCheckPaymentStatus(false);
        }, 4000);

        return () => clearInterval(interval);
    }, [step, bookingResult?.is_paid, bookingResult?.booking_ref]);

    const fallbackCover = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80';
    const coverPhoto = event.cover_photo || fallbackCover;

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#F0F5FA] via-[#F4F8FC] to-[#FFFFFF] text-slate-800 flex flex-col justify-between selection:bg-[#154F7C] selection:text-white relative overflow-hidden">
            {/* Ambient soft oceanic atmospheric glows matching the Login/Register wave palette */}
            <div className="absolute top-40 right-0 w-[500px] h-[500px] bg-gradient-to-br from-sky-200/35 to-blue-300/15 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-20 left-0 w-[450px] h-[450px] bg-gradient-to-tr from-sky-100/50 to-blue-200/20 rounded-full blur-3xl pointer-events-none -translate-x-1/4" />

            <Head title={`${t('CHECKOUT')} — ${event.title}`} />

            {/* ══════════════════════════════════════════════════════════════
                2. HERO CHECKOUT BANNER
               ══════════════════════════════════════════════════════════════ */}
            <div className="relative border-b border-slate-200 overflow-hidden min-h-[160px] flex items-center">
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
                <div className="absolute inset-0 z-0 bg-black/50 mix-blend-multiply" />
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
                            <Clock className="w-4 h-4 text-sky-300" />
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
            <div className="max-w-6xl mx-auto w-full px-4 sm:px-8 pt-5 pb-1 relative z-10">
                <button
                    type="button"
                    onClick={handleBack}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#154F7C] transition w-fit cursor-pointer group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform text-[#154F7C]" />
                    <span>{t('Back')}</span>
                </button>
            </div>

            {/* ══════════════════════════════════════════════════════════════
                5. MAIN CONTENT AREA
               ══════════════════════════════════════════════════════════════ */}
            <main className="max-w-6xl mx-auto w-full px-4 sm:px-8 py-4 sm:py-6 flex-1 relative z-10">
                {/* ─────────────────────────────────────────────────────────────
                    STEP 4: BOOKING CREATED CONFIRMATION SCREEN
                   ───────────────────────────────────────────────────────────── */}
                {step === 4 && bookingResult && (() => {
                    const isPaid = Boolean(bookingResult.is_paid || bookingResult.payment_status === 'paid' || bookingResult.status === 'CONFIRMED' || bookingResult.status === 'PAID');

                    return (
                        <div className="max-w-md mx-auto my-6 p-6 sm:p-8 rounded-3xl bg-white/95 backdrop-blur-2xl border border-slate-100 shadow-[0_24px_50px_-12px_rgba(11,37,69,0.18),0_12px_24px_-6px_rgba(11,37,69,0.10)] space-y-6 text-center animate-fadeIn">
                            {/* Icon: Emerald Check if paid, Amber Clock if pending */}
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-inner border ${
                                isPaid 
                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200/80' 
                                    : 'bg-amber-50 text-amber-600 border-amber-200/80'
                            }`}>
                                {isPaid ? (
                                    <Check className="w-8 h-8 stroke-[3]" />
                                ) : (
                                    <Clock className="w-8 h-8 stroke-[2.5]" />
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display tracking-tight">
                                    {isPaid 
                                        ? t('Booking Created')
                                        : (lang === 'sw' ? 'Tiketi Imewekwa — Inasubiri Malipo' : 'Booking Created — Awaiting Payment')}
                                </h2>
                                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                                    {isPaid 
                                        ? (lang === 'sw' ? 'Malipo yamethibitishwa! Hifadhi namba yako ya kumbukumbu.' : 'Payment confirmed! Keep your booking reference safe.') 
                                        : (lang === 'sw' 
                                            ? `Ombi la malipo limetumwa kwenye ${bookingResult.payment_phone || 'simu yako'}. Weka PIN kuthibitisha ili kufungua tiketi.` 
                                            : `A payment request has been sent to ${bookingResult.payment_phone || 'your phone'}. Approve the prompt to unlock tickets.`)}
                                </p>
                            </div>

                            {/* Anti-fraud / Security Notice if unpaid */}
                            {!isPaid && (
                                <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-left text-xs text-amber-900 flex items-start gap-2.5">
                                    <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                                    <span className="text-[11px] text-amber-800 leading-relaxed font-medium">
                                        {t('payment_pending_gate_notice')}
                                    </span>
                                </div>
                            )}

                            {/* Booking Details Table Box */}
                            <div className="rounded-2xl border border-slate-200/90 divide-y divide-slate-100 text-xs text-left overflow-hidden bg-slate-50/50">
                                <div className="p-3 flex justify-between items-center">
                                    <span className="text-slate-500">{t('Booking Ref')}</span>
                                    <span className="font-mono font-bold text-slate-900">
                                        {bookingResult.booking_ref}
                                    </span>
                                </div>
                                <div className="p-3 flex justify-between items-center">
                                    <span className="text-slate-500">{t('Event')}</span>
                                    <span className="font-bold text-slate-900 truncate max-w-[200px]">
                                        {bookingResult.event_title}
                                    </span>
                                </div>
                                <div className="p-3 flex justify-between items-center">
                                    <span className="text-slate-500">{t('Package')}</span>
                                    <span className="font-semibold text-slate-800">
                                        {bookingResult.package_name}
                                    </span>
                                </div>
                                <div className="p-3 flex justify-between items-center">
                                    <span className="text-slate-500">{t('Quantity')}</span>
                                    <span className="font-bold text-slate-900">
                                        {bookingResult.quantity}
                                    </span>
                                </div>
                                <div className="p-3 flex justify-between items-center">
                                    <span className="text-slate-500">{t('Service fee')}</span>
                                    <span className="font-semibold text-slate-700">
                                        {bookingResult.service_fee || 0} {event.ticket_currency || 'TZS'}
                                    </span>
                                </div>
                                <div className="p-3 flex justify-between items-center bg-sky-50/60">
                                    <span className="font-bold text-slate-800">{t('Total')}</span>
                                    <span className="font-black text-sm text-[#154F7C] font-mono">
                                        {formatTzs(bookingResult.total_amount)}
                                    </span>
                                </div>
                                <div className={`p-3 flex justify-between items-center ${isPaid ? 'bg-emerald-50/50' : 'bg-amber-50/50'}`}>
                                    <span className="text-slate-600 font-semibold">{t('Status')}</span>
                                    {isPaid ? (
                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                                            {t('CONFIRMED')}
                                        </span>
                                    ) : (
                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping" />
                                            {t('PENDING VERIFICATION')}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {statusToast && (
                                <div className={`p-3 rounded-xl text-xs font-semibold ${
                                    isPaid 
                                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                                }`}>
                                    {statusToast}
                                </div>
                            )}

                            {isPaid ? (
                                <div className="space-y-2">
                                    <p className="text-[11px] text-slate-400">
                                        {t('keep_ref_safe')}
                                    </p>
                                    <a
                                        href={bookingResult.redirect_url || `/t/${bookingResult.booking_ref}`}
                                        className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#154F7C] to-[#327FB5] hover:from-[#1A5C91] hover:to-[#3D8EC7] active:scale-[0.98] text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-[#154F7C]/25 border border-sky-400/25 transition cursor-pointer uppercase tracking-wider"
                                    >
                                        <span>{t('View My Tickets')}</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </a>
                                </div>
                            ) : (
                                <div className="space-y-3 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => handleCheckPaymentStatus(true)}
                                        disabled={checkingPayment}
                                        className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#154F7C] to-[#327FB5] hover:from-[#1A5C91] hover:to-[#3D8EC7] active:scale-[0.98] text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-[#154F7C]/25 border border-sky-400/25 transition cursor-pointer uppercase tracking-wider disabled:opacity-75"
                                    >
                                        <RefreshCw className={`w-4 h-4 ${checkingPayment ? 'animate-spin' : ''}`} />
                                        <span>{checkingPayment ? t('Checking Status...') : t('Check Payment Status')}</span>
                                    </button>

                                    <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium">
                                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                                        <span>{t('Ticket viewing is locked until payment is confirmed')}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })()}

                {/* ─────────────────────────────────────────────────────────────
                    STEPS 1, 2, 3: TWO COLUMN LAYOUT (Form on Left, Summary on Right)
                   ───────────────────────────────────────────────────────────── */}
                {step < 4 && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* ──────── LEFT COLUMN: UNIFIED STEP CONTAINER ──────── */}
                        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
                            {/* Unified Card Header: Session Expire Capsule & 1 Booking - 2 Details - 3 Payment Bar */}
                            <div className="rounded-3xl sm:rounded-[32px] bg-white/95 backdrop-blur-2xl border border-slate-100 shadow-[0_20px_45px_-10px_rgba(11,37,69,0.12),0_4px_16px_-4px_rgba(11,37,69,0.06),0_0_1px_rgba(11,37,69,0.15)] overflow-hidden transition-all duration-300">
                                {/* Top Strip: Session Expiration Countdown */}
                                <div className="px-6 py-3 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5 text-sky-600" />
                                        <span>
                                            {lang === 'sw' ? 'Kipindi kitaisha baada ya: ' : 'Your session will expire in '}
                                        </span>
                                    </div>
                                    <span className="text-sky-700 bg-sky-50 border border-sky-200/80 px-2.5 py-0.5 rounded-full font-bold font-mono text-xs">
                                        {formatTimer(secondsLeft)}
                                    </span>
                                </div>

                                {/* Stepper Row: 1 Booking - 2 Details - 3 Payment */}
                                <div className="p-4 sm:p-5 border-b border-slate-100">
                                    <div className="flex items-center justify-between max-w-lg mx-auto">
                                        {/* Step 1: Booking */}
                                        <div className="flex items-center gap-2">
                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                                                step > 1 
                                                    ? 'bg-gradient-to-r from-[#154F7C] to-[#327FB5] text-white shadow-xs' 
                                                    : 'bg-[#154F7C] text-white shadow-md shadow-[#154F7C]/25 ring-2 ring-sky-500/20'
                                            }`}>
                                                {step > 1 ? <Check className="w-4 h-4 stroke-[3]" /> : '1'}
                                            </div>
                                            <span className={`text-xs font-bold ${
                                                step >= 1 ? 'text-slate-900' : 'text-slate-400'
                                            }`}>
                                                {t('Booking')}
                                            </span>
                                        </div>

                                        {/* Line 1 -> 2 */}
                                        <div className={`flex-1 h-0.5 mx-3 sm:mx-5 transition-colors duration-300 ${
                                            step > 1 ? 'bg-gradient-to-r from-[#154F7C] to-[#327FB5]' : 'bg-slate-200'
                                        }`} />

                                        {/* Step 2: Details */}
                                        <div className="flex items-center gap-2">
                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                                                step > 2 
                                                    ? 'bg-gradient-to-r from-[#154F7C] to-[#327FB5] text-white shadow-xs' 
                                                    : step === 2 
                                                        ? 'bg-[#154F7C] text-white shadow-md shadow-[#154F7C]/25 ring-2 ring-sky-500/20' 
                                                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                                            }`}>
                                                {step > 2 ? <Check className="w-4 h-4 stroke-[3]" /> : '2'}
                                            </div>
                                            <span className={`text-xs font-bold ${
                                                step >= 2 ? 'text-slate-900' : 'text-slate-400'
                                            }`}>
                                                {t('Details')}
                                            </span>
                                        </div>

                                        {/* Line 2 -> 3 */}
                                        <div className={`flex-1 h-0.5 mx-3 sm:mx-5 transition-colors duration-300 ${
                                            step > 2 ? 'bg-gradient-to-r from-[#154F7C] to-[#327FB5]' : 'bg-slate-200'
                                        }`} />

                                        {/* Step 3: Payment */}
                                        <div className="flex items-center gap-2">
                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                                                step === 3 
                                                    ? 'bg-[#154F7C] text-white shadow-md shadow-[#154F7C]/25 ring-2 ring-sky-500/20' 
                                                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                                            }`}>
                                                3
                                            </div>
                                            <span className={`text-xs font-bold ${
                                                step === 3 ? 'text-slate-900' : 'text-slate-400'
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
                                                                    {price === 0 ? (
                                                                        <span className="text-[11px] font-black uppercase tracking-wider text-sky-800 bg-sky-50 border border-sky-200/80 px-2 py-0.5 rounded-md">
                                                                            {lang === 'sw' ? 'Bure' : 'Free Entry'}
                                                                        </span>
                                                                    ) : (
                                                                        <span>{formatTzs(price)} {t('each')}</span>
                                                                    )}
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
                                                                                className="w-9 h-9 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-sky-50 hover:text-sky-700 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
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
                                                                                className="w-9 h-9 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-sky-50 hover:text-sky-700 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                                                                                aria-label="Increase quantity"
                                                                            >
                                                                                <Plus className="w-3.5 h-3.5" />
                                                                            </button>
                                                                        </div>

                                                                        {/* Line subtotal */}
                                                                        <div className="min-w-[90px] text-right font-black text-xs sm:text-sm text-slate-900 dark:text-white font-mono">
                                                                            {lineTotal === 0 ? (
                                                                                <span className="text-sky-800 font-black">
                                                                                    {lang === 'sw' ? 'Bure' : 'Free'}
                                                                                </span>
                                                                            ) : (
                                                                                formatTzs(lineTotal)
                                                                            )}
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
                                        className={`w-full py-3.5 px-4 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                                            isEventSoldOut
                                                ? 'bg-slate-200 dark:bg-white/10 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-[#154F7C] to-[#327FB5] hover:from-[#1A5C91] hover:to-[#3D8EC7] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-lg shadow-[#154F7C]/25 border border-sky-400/25 cursor-pointer uppercase tracking-wider'
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
                                                        className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#08121E] text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition"
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
                                                        className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#08121E] text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition"
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
                                                    <div className="flex items-center rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#08121E] overflow-hidden focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20 transition">
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
                                                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#154F7C] to-[#327FB5] hover:from-[#1A5C91] hover:to-[#3D8EC7] active:scale-[0.98] text-white text-xs font-bold transition shadow-lg shadow-[#154F7C]/25 border border-sky-400/25 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                                            >
                                                <span>{t('Continue to payment')}</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </form>
                                    )}

                                    {/* ── STEP 3: PAYMENT / CONFIRMATION ── */}
                                    {step === 3 && (
                                        <form onSubmit={handleFinalCheckout} className="space-y-5 animate-fadeIn">
                                            <div>
                                                <h2 className="text-xl font-black text-slate-900 dark:text-white font-display tracking-tight">
                                                    {finalOrderAmount <= 0 
                                                        ? (lang === 'sw' ? 'Thibitisha Tiketi Yako ya Bure' : 'Confirm Free Registration')
                                                        : t('payment_method_title')}
                                                </h2>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                    {finalOrderAmount <= 0
                                                        ? (lang === 'sw' ? 'Hakuna malipo yanayohitajika. Tiketi yako itatolewa mara moja.' : 'No payment required. Your digital pass will be issued instantly.')
                                                        : t('payment_method_subtitle')}
                                                </p>
                                            </div>

                                            {finalOrderAmount <= 0 ? (
                                                /* Free Order Summary Row - Clean, minimal, neutral */
                                                <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02] flex items-center justify-between gap-4">
                                                    <div>
                                                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                                                            {lang === 'sw' ? 'Usajili wa Bure' : 'Free Registration Pass'}
                                                        </div>
                                                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                                            {lang === 'sw'
                                                                ? 'Pasi yako ya kidijitali yenye QR code itatolewa bila malipo yoyote.'
                                                                : 'Your digital pass with gate QR code will be generated with zero processing fees.'}
                                                        </div>
                                                    </div>
                                                    <span className="font-mono text-xs font-bold px-2 py-1 rounded-lg bg-slate-200/70 dark:bg-white/10 text-slate-800 dark:text-slate-200 shrink-0">
                                                        TZS 0
                                                    </span>
                                                </div>
                                            ) : (
                                                /* Payment Radio Options */
                                                <div className="space-y-3">
                                                {/* Option 1: Mobile Money */}
                                                <label
                                                    onClick={() => setBuyerForm({ ...buyerForm, payment_method: 'Mobile Money' })}
                                                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                                                        buyerForm.payment_method === 'Mobile Money'
                                                            ? 'border-sky-500 bg-sky-50/70 shadow-sm ring-1 ring-sky-500/30'
                                                            : 'border-slate-200 dark:border-white/10 hover:border-sky-300 dark:hover:border-white/20'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3.5">
                                                        <div className="w-10 h-10 rounded-xl bg-sky-100/70 dark:bg-sky-950/40 flex items-center justify-center text-sky-700 dark:text-sky-300 shrink-0">
                                                            <Smartphone className="w-5 h-5 text-[#154F7C] dark:text-sky-400" />
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
                                                            ? 'border-[#154F7C] bg-[#154F7C]'
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
                                                                        className="text-[11px] font-semibold text-sky-700 dark:text-sky-400 hover:text-sky-900 dark:hover:text-sky-300 hover:underline cursor-pointer"
                                                                    >
                                                                        {lang === 'sw' ? `Tumia nambari ya ${buyerForm.buyer_phone}` : `Use attendee phone (${buyerForm.buyer_phone})`}
                                                                    </button>
                                                                )}
                                                            </div>

                                                            <div className="flex items-center rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#08121E] overflow-hidden focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20 transition shadow-inner">
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
                                                                <Smartphone className="w-3.5 h-3.5 text-[#154F7C] dark:text-sky-400 shrink-0 mt-0.5" />
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
                                                            ? 'border-sky-500 bg-sky-50/70 shadow-sm ring-1 ring-sky-500/30'
                                                            : 'border-slate-200 dark:border-white/10 hover:border-sky-300 dark:hover:border-white/20'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3.5">
                                                        <div className="w-10 h-10 rounded-xl bg-sky-100/70 dark:bg-sky-950/40 flex items-center justify-center text-sky-700 dark:text-sky-300 shrink-0">
                                                            <CreditCard className="w-5 h-5 text-[#154F7C] dark:text-sky-400" />
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
                                                            ? 'border-[#154F7C] bg-[#154F7C]'
                                                            : 'border-slate-300 dark:border-white/20'
                                                    }`}>
                                                        {buyerForm.payment_method === 'Card' && (
                                                            <div className="w-2 h-2 rounded-full bg-white" />
                                                        )}
                                                    </div>
                                                </label>
                                            </div>
                                            )}

                                            {/* Policy Agreement Checkbox */}
                                            <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] space-y-2.5">
                                                <label className="flex items-start gap-2.5 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={buyerForm.accepted_terms}
                                                        onChange={(e) => setBuyerForm({ ...buyerForm, accepted_terms: e.target.checked })}
                                                        className="w-4 h-4 rounded text-[#154F7C] border-slate-300 dark:border-white/20 focus:ring-sky-500 mt-0.5 shrink-0"
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

                                            {/* Register / Buy Now Button */}
                                            <button
                                                type="submit"
                                                disabled={loading || !buyerForm.accepted_terms}
                                                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#154F7C] to-[#327FB5] hover:from-[#1A5C91] hover:to-[#3D8EC7] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-lg shadow-[#154F7C]/25 border border-sky-400/25 flex items-center justify-center gap-2 cursor-pointer"
                                            >
                                                {loading ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        <span>{finalOrderAmount <= 0 ? (lang === 'sw' ? 'Inatoa Tiketi...' : 'Issuing Free Pass...') : t('Processing Booking...')}</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span>
                                                            {finalOrderAmount <= 0
                                                                ? (lang === 'sw' ? 'Kamilisha Usajili wa Bure' : 'Complete Free Registration')
                                                                : `${t('Buy Now')} (${formatTzs(finalOrderAmount)})`}
                                                        </span>
                                                        <ArrowRight className="w-4 h-4" />
                                                    </>
                                                )}
                                            </button>

                                            {totalOrderAmount > 0 && !buyerForm.payment_method && (
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
                            <div className="rounded-3xl bg-white/95 backdrop-blur-2xl border border-slate-100 shadow-[0_20px_45px_-10px_rgba(11,37,69,0.12),0_1px_3px_rgba(11,37,69,0.05)] overflow-hidden">
                                {/* Cover Banner Art - Inset with even spacing on all sides */}
                                <div className="p-3 pb-0">
                                    <div className="relative aspect-[4/3] sm:aspect-[1/1] max-h-[360px] w-full overflow-hidden rounded-2xl bg-slate-50 flex items-center justify-center">
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
                                        <h3 className="text-xs sm:text-sm font-black text-slate-900 font-display uppercase tracking-tight leading-snug">
                                            {event.title}
                                        </h3>

                                        <div className="space-y-0.5 text-[10px] sm:text-[11px] text-slate-500">
                                            {event.venue && (
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="w-3 h-3 text-sky-600 shrink-0" />
                                                    <span className="truncate">{event.venue}</span>
                                                </div>
                                            )}
                                            {event.event_date && (
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="w-3 h-3 text-sky-600 shrink-0" />
                                                    <span className="truncate">
                                                        {t('Start:')} {event.event_date}
                                                        {event.event_time ? `, ${event.event_time}` : ''}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Divider & Tickets Breakdown */}
                                    <div className="border-t border-slate-100 pt-2 space-y-1">
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
                                                        <span className="text-slate-700 truncate max-w-[180px]">
                                                            {item.tier.name} x{item.quantity}
                                                        </span>
                                                        <span className="font-mono font-bold text-slate-900 shrink-0">
                                                            {formatTzs(item.subtotal)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Discount Code Section */}
                                    <div className="border-t border-slate-100 pt-2 space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                                <Tag className="w-2.5 h-2.5 text-[#154F7C]" />
                                                <span>{lang === 'sw' ? 'Kodi ya Punguzo' : 'Discount Code'}</span>
                                            </div>
                                            {appliedDiscount && (
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveDiscount}
                                                    className="text-[9px] font-bold text-red-500 hover:text-red-700 cursor-pointer flex items-center gap-0.5"
                                                >
                                                    <X className="w-2.5 h-2.5" />
                                                    <span>{lang === 'sw' ? 'Ondoa' : 'Remove'}</span>
                                                </button>
                                            )}
                                        </div>

                                        {appliedDiscount ? (
                                            <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[10px] font-bold">
                                                <span className="font-mono tracking-wider">{appliedDiscount.code}</span>
                                                <span className="text-emerald-700">-{formatTzs(appliedDiscount.discount_amount)}</span>
                                            </div>
                                        ) : (
                                            <form onSubmit={handleApplyDiscount} className="flex gap-1.5">
                                                <input
                                                    type="text"
                                                    value={discountInput}
                                                    onChange={(e) => setDiscountInput(e.target.value.toUpperCase())}
                                                    placeholder={lang === 'sw' ? 'Weka kodi (mf. VIP20)' : 'Promo code (e.g. VIP20)'}
                                                    disabled={discountLoading || orderItems.length === 0}
                                                    className="flex-1 text-[10px] font-mono uppercase font-bold py-1 px-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-[#154F7C] focus:border-[#154F7C] disabled:opacity-50"
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={discountLoading || !discountInput.trim() || orderItems.length === 0}
                                                    className="px-2.5 py-1 text-[10px] font-black rounded-lg bg-[#154F7C] hover:bg-[#114064] text-white disabled:opacity-40 transition cursor-pointer shrink-0"
                                                >
                                                    {discountLoading ? '...' : (lang === 'sw' ? 'Weka' : 'Apply')}
                                                </button>
                                            </form>
                                        )}

                                        {discountError && (
                                            <p className="text-[9px] text-red-500 font-medium leading-tight">
                                                {discountError}
                                            </p>
                                        )}
                                    </div>

                                    {/* Divider & Subtotal */}
                                    <div className="border-t border-slate-100 pt-2 space-y-1">
                                        <div className="flex justify-between items-center text-[10px] sm:text-[11px]">
                                            <span className="text-slate-500">{t('Subtotal')}</span>
                                            <span className="font-bold text-slate-800 font-mono">
                                                {formatTzs(totalOrderAmount)}
                                            </span>
                                        </div>

                                        {appliedDiscount && (
                                            <div className="flex justify-between items-center text-[10px] sm:text-[11px] text-emerald-600 font-bold">
                                                <span>{lang === 'sw' ? 'Punguzo' : 'Discount'} ({appliedDiscount.code})</span>
                                                <span className="font-mono">
                                                    -{formatTzs(appliedDiscount.discount_amount)}
                                                </span>
                                            </div>
                                        )}

                                        <p className="text-[8.5px] text-slate-400 leading-tight">
                                            {t('subtotal_notice')}
                                        </p>

                                        <div className="pt-0.5 flex justify-between items-baseline">
                                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                                {lang === 'sw' ? 'Jumla ya Malipo' : 'Total Due'}
                                            </span>
                                            <span className="text-base sm:text-lg font-black text-[#154F7C] font-mono tracking-tight">
                                                {formatTzs(finalOrderAmount)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Trust badge */}
                            <div className="p-3 rounded-2xl bg-white/80 backdrop-blur border border-slate-100 shadow-sm flex items-center justify-center gap-1.5 text-xs text-sky-800 font-semibold">
                                <ShieldCheck className="w-4 h-4 text-sky-600" />
                                <span>{t('Verified')}</span>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* ══════════════════════════════════════════════════════════════
                6. KARDOVO OFFICIAL FOOTER (Same as Landing Page)
               ══════════════════════════════════════════════════════════════ */}
            <KardovoFooter lang={lang} />
        </div>
    );
}
