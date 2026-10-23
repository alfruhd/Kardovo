import React, { useState, useEffect } from 'react';
import { 
    X, CheckCircle2, AlertCircle, Loader2, Share2, Sparkles, 
    Phone, User, Trophy, ShieldCheck, CreditCard, Smartphone, Lock 
} from 'lucide-react';
import axios from 'axios';

const MNO_PROVIDERS = [
    { id: 'Mpesa', name: 'M-Pesa', color: 'border-red-500/40 text-red-600 bg-red-500/5 hover:border-red-500' },
    { id: 'Tigo', name: 'Tigo Pesa', color: 'border-blue-500/40 text-blue-600 bg-blue-500/5 hover:border-blue-500' },
    { id: 'Airtel', name: 'Airtel Money', color: 'border-rose-500/40 text-rose-600 bg-rose-500/5 hover:border-rose-500' },
    { id: 'Halopesa', name: 'HaloPesa', color: 'border-orange-500/40 text-orange-600 bg-orange-500/5 hover:border-orange-500' },
];

export default function VotingModal({ isOpen, onClose, event, category, candidate, onSuccess }) {
    if (!isOpen || !candidate) return null;

    const isPaid = category?.is_paid ?? true;
    const pricingTiers = category?.pricing_tiers && category.pricing_tiers.length > 0
        ? category.pricing_tiers
        : [
            { quantity: 1, amount: 500 },
            { quantity: 3, amount: 1000 },
            { quantity: 6, amount: 2000 },
            { quantity: 15, amount: 5000 },
            { quantity: 35, amount: 10000 },
            { quantity: 80, amount: 20000 },
        ];

    const [selectedTier, setSelectedTier] = useState(pricingTiers[0]);
    const [isCustom, setIsCustom] = useState(false);
    const [customQty, setCustomQty] = useState('');
    const [voterPhone, setVoterPhone] = useState('');
    const [voterName, setVoterName] = useState('');
    const [provider, setProvider] = useState('Mpesa');

    // Payment method: 'mobile' or 'card'
    const [paymentMethod, setPaymentMethod] = useState('mobile');
    const [cardData, setCardData] = useState({
        number: '',
        expiry: '',
        cvv: '',
        name: '',
        email: '',
    });

    const handleCardNumberChange = (e) => {
        let val = e.target.value.replace(/\D/g, '').slice(0, 16);
        val = val.replace(/(.{4})/g, '$1 ').trim();
        setCardData(prev => ({ ...prev, number: val }));
    };

    const handleExpiryChange = (e) => {
        let val = e.target.value.replace(/\D/g, '').slice(0, 4);
        if (val.length >= 3) {
            val = val.slice(0, 2) + '/' + val.slice(2);
        }
        setCardData(prev => ({ ...prev, expiry: val }));
    };

    const handleCvvChange = (e) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 4);
        setCardData(prev => ({ ...prev, cvv: val }));
    };

    const baseTier = pricingTiers[0] || { quantity: 1, amount: 500 };
    const unitRate = Math.round((baseTier.amount || 500) / (baseTier.quantity || 1));
    const effectiveQuantity = isCustom 
        ? Math.max(1, parseInt(customQty, 10) || 1) 
        : (selectedTier?.quantity || 1);
    const effectiveAmount = isCustom 
        ? (effectiveQuantity * unitRate) 
        : (selectedTier?.amount || 500);
    
    // Status states: 'idle' | 'submitting' | 'waiting_ussd' | 'success' | 'error'
    const [phase, setPhase] = useState('idle');
    const [orderNumber, setOrderNumber] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [statusPollCount, setStatusPollCount] = useState(0);

    // Reset when modal opens
    useEffect(() => {
        if (isOpen) {
            setPhase('idle');
            setErrorMessage('');
            setSelectedTier(pricingTiers[0]);
            setIsCustom(false);
            setCustomQty('');
            setPaymentMethod('mobile');
            setCardData({ number: '', expiry: '', cvv: '', name: '', email: '' });
            setStatusPollCount(0);
        }
    }, [isOpen]);

    // Polling for USSD payment confirmation
    useEffect(() => {
        let interval = null;
        if (phase === 'waiting_ussd' && orderNumber) {
            interval = setInterval(async () => {
                try {
                    const res = await axios.get(route('voting.orderStatus', orderNumber));
                    if (res.data?.status === 'completed') {
                        setPhase('success');
                        if (onSuccess) onSuccess(res.data);
                        clearInterval(interval);
                    } else if (res.data?.status === 'failed') {
                        setPhase('error');
                        setErrorMessage('Payment was cancelled or failed. Please try again.');
                        clearInterval(interval);
                    }
                } catch (e) {
                    // silent polling error
                }

                setStatusPollCount(prev => {
                    if (prev > 45) { // 90 seconds timeout
                        clearInterval(interval);
                        setPhase('error');
                        setErrorMessage('Payment prompt timed out. If money was deducted, your votes will be automatically reflected shortly.');
                    }
                    return prev + 1;
                });
            }, 2000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [phase, orderNumber]);

    const handleVoteSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setPhase('submitting');

        try {
            const isCard = isPaid && paymentMethod === 'card';
            const res = await axios.post(route('voting.checkout', event.id), {
                category_id: category.id,
                candidate_id: candidate.id,
                quantity: isPaid ? effectiveQuantity : 1,
                voter_phone: isCard ? (voterPhone || '0700000000') : voterPhone,
                voter_name: isCard ? (cardData.name || voterName) : voterName,
                provider: isPaid ? (isCard ? 'Card' : provider) : 'Free',
                card_number: isCard ? cardData.number : undefined,
                card_expiry: isCard ? cardData.expiry : undefined,
                card_cvv: isCard ? cardData.cvv : undefined,
                voter_email: isCard ? cardData.email : undefined,
            });

            if (res.data?.checkout_url) {
                window.location.href = res.data.checkout_url;
                return;
            }

            if (res.data?.is_free || res.data?.status === 'completed') {
                setPhase('success');
                if (onSuccess) onSuccess(res.data);
            } else if (res.data?.success) {
                setOrderNumber(res.data.order_number);
                setPhase('waiting_ussd');
            } else {
                setPhase('error');
                setErrorMessage(res.data?.message || 'Failed to submit vote.');
            }
        } catch (err) {
            setPhase('error');
            setErrorMessage(err.response?.data?.message || 'An unexpected error occurred. Please verify your details.');
        }
    };

    const handleShare = (network) => {
        const directUrl = window.location.origin + `/vote-for-me/${event.id}/${candidate.id}`;
        const text = `I just voted for ${candidate.name} in ${category.name}! Vote for them now on Kardovo:`;

        if (network === 'whatsapp') {
            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + directUrl)}`, '_blank');
        } else if (network === 'twitter') {
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(directUrl)}`, '_blank');
        } else {
            navigator.clipboard.writeText(directUrl);
            alert('Voting campaign link copied to clipboard!');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[92vh] flex flex-col">
                {/* Header */}
                <div className="relative px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 flex items-center justify-center text-[#154F7C] dark:text-sky-400">
                            <Trophy className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                                Cast Your Vote
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {category?.name}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Candidate Highlight Strip */}
                <div className="px-6 py-3.5 bg-sky-50/50 dark:bg-sky-950/20 border-b border-sky-100/60 dark:border-sky-900/40 flex items-center gap-3.5">
                    {candidate.photo_url ? (
                        <img
                            src={candidate.photo_url}
                            alt={candidate.name}
                            className="w-12 h-12 rounded-xl object-cover border border-sky-200 dark:border-sky-800 shadow-2xs"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#154F7C] to-[#2A7AB8] text-white font-black text-lg flex items-center justify-center shadow-2xs">
                            {candidate.name.charAt(0)}
                        </div>
                    )}
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[#154F7C] text-white">
                                #{candidate.candidate_number || candidate.id}
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                {candidate.name}
                            </h4>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {event.title}
                        </p>
                    </div>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                    {/* SUCCESS STATE */}
                    {phase === 'success' && (
                        <div className="p-6 overflow-y-auto text-center py-6 space-y-4">
                            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border-2 border-emerald-500/30 animate-in zoom-in-75">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                                    Vote Successfully Recorded!
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                                    Thank you! Your official vote has been confirmed and tallied for <span className="font-semibold text-slate-800 dark:text-slate-200">{candidate.name}</span>.
                                </p>
                            </div>

                            {/* Share CTA */}
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    Help {candidate.name} win! Share their voting link:
                                </p>
                                <div className="flex items-center justify-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleShare('whatsapp')}
                                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                                    >
                                        WhatsApp
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleShare('twitter')}
                                        className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                                    >
                                        X (Twitter)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleShare('copy')}
                                        className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
                                    >
                                        <Share2 className="w-3.5 h-3.5" />
                                        Copy Link
                                    </button>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full mt-4 py-2.5 rounded-xl bg-[#154F7C] text-white text-xs font-bold hover:bg-[#124268] transition"
                            >
                                Done
                            </button>
                        </div>
                    )}

                    {/* WAITING USSD STATE */}
                    {phase === 'waiting_ussd' && (
                        <div className="text-center py-8 space-y-4">
                            <div className="relative w-16 h-16 mx-auto">
                                <div className="absolute inset-0 rounded-full border-4 border-sky-100 dark:border-sky-950/60" />
                                <div className="w-16 h-16 rounded-full border-4 border-[#154F7C] border-t-transparent animate-spin" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                                    Waiting for Mobile Money Approval...
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                                    A payment push has been sent to <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{voterPhone}</span> via {provider}. Enter your mobile money PIN to complete the transaction.
                                </p>
                            </div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-500 font-mono">
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#154F7C]" />
                                Listening for confirmation...
                            </div>
                        </div>
                    )}

                    {/* VOTE SELECTION & CHECKOUT FORM */}
                    {(phase === 'idle' || phase === 'submitting' || phase === 'error') && (
                        <form onSubmit={handleVoteSubmit} className="flex-1 flex flex-col min-h-0">
                            <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1">
                                {errorMessage && (
                                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
                                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                        <span>{errorMessage}</span>
                                    </div>
                                )}

                            {/* Paid Bundle Selection */}
                            {isPaid && (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                                        <span>Select Vote Package</span>
                                        <span className="text-[11px] text-slate-400 font-normal">More votes give higher advantage</span>
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {pricingTiers.map((tier) => {
                                            const isSelected = !isCustom && selectedTier?.quantity === tier.quantity;
                                            return (
                                                <button
                                                    key={tier.quantity}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedTier(tier);
                                                        setIsCustom(false);
                                                    }}
                                                    className={`p-3 rounded-2xl border text-left transition cursor-pointer relative ${
                                                        isSelected
                                                            ? 'border-[#154F7C] dark:border-sky-500 bg-sky-50/70 dark:bg-sky-950/40 shadow-xs ring-2 ring-[#154F7C]/20'
                                                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60'
                                                    }`}
                                                >
                                                    {tier.quantity >= 15 && (
                                                        <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-black tracking-wider uppercase">
                                                            Popular
                                                        </span>
                                                    )}
                                                    <div className="text-sm font-black text-slate-900 dark:text-white">
                                                        {tier.quantity} {tier.quantity === 1 ? 'Vote' : 'Votes'}
                                                    </div>
                                                    <div className="text-xs font-semibold text-[#154F7C] dark:text-sky-400 mt-0.5">
                                                        TZS {Number(tier.amount).toLocaleString()}
                                                    </div>
                                                </button>
                                            );
                                        })}

                                        {/* Custom Amount Button */}
                                        <button
                                            type="button"
                                            onClick={() => setIsCustom(true)}
                                            className={`p-3 rounded-2xl border text-left transition cursor-pointer relative ${
                                                isCustom
                                                    ? 'border-[#154F7C] dark:border-sky-500 bg-sky-50/70 dark:bg-sky-950/40 shadow-xs ring-2 ring-[#154F7C]/20'
                                                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60'
                                            }`}
                                        >
                                            <div className="text-sm font-black text-slate-900 dark:text-white">
                                                Custom
                                            </div>
                                            <div className="text-xs font-semibold text-[#154F7C] dark:text-sky-400 mt-0.5">
                                                Any quantity
                                            </div>
                                        </button>
                                    </div>

                                    {/* Custom Vote Count Input */}
                                    {isCustom && (
                                        <div className="mt-2 p-3 rounded-2xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-200/80 dark:border-sky-900/60 flex items-center justify-between gap-3 animate-in fade-in duration-150">
                                            <div className="flex-1">
                                                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                                    Enter Number of Votes (TZS {unitRate.toLocaleString()} each)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="5000"
                                                    value={customQty}
                                                    onChange={(e) => setCustomQty(e.target.value)}
                                                    placeholder="e.g. 50"
                                                    className="w-full px-3 py-1.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#154F7C] outline-hidden font-bold"
                                                />
                                            </div>
                                            <div className="text-right shrink-0 pt-3">
                                                <div className="text-[10px] uppercase font-bold text-slate-400">Total</div>
                                                <div className="text-sm font-black text-[#154F7C] dark:text-sky-400">
                                                    TZS {effectiveAmount.toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Payment Method Switcher (Paid flow) */}
                            {isPaid && (
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                                        Payment Method
                                    </label>
                                    
                                    <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 gap-1">
                                        <button
                                            type="button"
                                            onClick={() => setPaymentMethod('mobile')}
                                            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                                                paymentMethod === 'mobile'
                                                    ? 'bg-white dark:bg-slate-900 text-[#154F7C] dark:text-sky-300 shadow-xs'
                                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                            }`}
                                        >
                                            <Smartphone className="w-3.5 h-3.5" />
                                            <span>Mobile Money</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setPaymentMethod('card')}
                                            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                                                paymentMethod === 'card'
                                                    ? 'bg-white dark:bg-slate-900 text-[#154F7C] dark:text-sky-300 shadow-xs'
                                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                            }`}
                                        >
                                            <CreditCard className="w-3.5 h-3.5" />
                                            <span>Card (Visa / Mastercard)</span>
                                        </button>
                                    </div>

                                    {/* MOBILE MONEY DETAILS */}
                                    {paymentMethod === 'mobile' && (
                                        <div className="space-y-3 animate-in fade-in duration-150">
                                            <div>
                                                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">
                                                    Select Mobile Operator
                                                </span>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {MNO_PROVIDERS.map((mno) => (
                                                        <button
                                                            key={mno.id}
                                                            type="button"
                                                            onClick={() => setProvider(mno.id)}
                                                            className={`py-2 px-1 rounded-xl border text-center text-xs font-bold transition cursor-pointer ${
                                                                provider === mno.id
                                                                    ? `${mno.color} border-2 shadow-2xs`
                                                                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                                                            }`}
                                                        >
                                                            {mno.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                                    Payment Mobile Number (M-Pesa / Tigo / Airtel)
                                                </label>
                                                <div className="relative">
                                                    <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                                                    <input
                                                        type="tel"
                                                        required
                                                        value={voterPhone}
                                                        onChange={(e) => setVoterPhone(e.target.value)}
                                                        placeholder="e.g. 0754 123 456"
                                                        className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#154F7C] dark:focus:ring-sky-500 outline-hidden font-medium"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* CARD PAYMENT DETAILS */}
                                    {paymentMethod === 'card' && (
                                        <div className="space-y-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 animate-in fade-in duration-150">
                                            <div>
                                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                                    Card Number
                                                </label>
                                                <div className="relative">
                                                    <CreditCard className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        required
                                                        value={cardData.number}
                                                        onChange={handleCardNumberChange}
                                                        placeholder="4000 1234 5678 9010"
                                                        maxLength={19}
                                                        className="w-full pl-9 pr-14 py-2 text-sm font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#154F7C] outline-hidden"
                                                    />
                                                    <div className="absolute right-3 top-2.5 flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                                        <span>VISA</span>
                                                        <span>•</span>
                                                        <span>MC</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                                        Expiry Date
                                                    </label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={cardData.expiry}
                                                        onChange={handleExpiryChange}
                                                        placeholder="MM/YY"
                                                        maxLength={5}
                                                        className="w-full px-3 py-2 text-sm font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#154F7C] outline-hidden text-center"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                                        CVV / CVC
                                                    </label>
                                                    <div className="relative">
                                                        <Lock className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                                                        <input
                                                            type="password"
                                                            required
                                                            value={cardData.cvv}
                                                            onChange={handleCvvChange}
                                                            placeholder="•••"
                                                            maxLength={4}
                                                            className="w-full pl-8 pr-3 py-2 text-sm font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#154F7C] outline-hidden text-center"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                                    Cardholder Name
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={cardData.name}
                                                    onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                                                    placeholder="Full name as on card"
                                                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#154F7C] outline-hidden"
                                                />
                                            </div>

                                            <div>
                                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                                    Email Address (For Card Receipt)
                                                </label>
                                                <input
                                                    type="email"
                                                    value={cardData.email}
                                                    onChange={(e) => setCardData({ ...cardData, email: e.target.value })}
                                                    placeholder="receipt@example.com"
                                                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#154F7C] outline-hidden"
                                                />
                                            </div>

                                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 pt-1">
                                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                                <span>256-bit SSL encrypted • Visa 3D-Secure & Mastercard ID Check</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Voter Name for Free flow or additional reference */}
                            {!isPaid && (
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                            Your Mobile Number
                                        </label>
                                        <div className="relative">
                                            <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                                            <input
                                                type="tel"
                                                required
                                                value={voterPhone}
                                                onChange={(e) => setVoterPhone(e.target.value)}
                                                placeholder="e.g. 0754 123 456"
                                                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#154F7C] dark:focus:ring-sky-500 outline-hidden font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                            Your Name (Optional)
                                        </label>
                                        <div className="relative">
                                            <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                                            <input
                                                type="text"
                                                value={voterName}
                                                onChange={(e) => setVoterName(e.target.value)}
                                                placeholder="Anonymous Voter"
                                                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#154F7C] dark:focus:ring-sky-500 outline-hidden"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            </div>

                            {/* Pinned Bottom Submit Footer */}
                            <div className="p-4 bg-slate-50/95 dark:bg-slate-800/90 border-t border-slate-100 dark:border-slate-800 shrink-0">
                                <button
                                    type="submit"
                                    disabled={
                                        phase === 'submitting' || 
                                        (!isPaid && !voterPhone) ||
                                        (isPaid && paymentMethod === 'mobile' && !voterPhone) ||
                                        (isPaid && paymentMethod === 'card' && (cardData.number.replace(/\s/g, '').length < 15 || !cardData.expiry || !cardData.cvv))
                                    }
                                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#154F7C] to-[#327FB5] hover:from-[#1A5C91] hover:to-[#3D8EC7] text-white text-sm font-bold shadow-md shadow-[#154F7C]/25 border border-sky-400/25 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-98"
                                >
                                    {phase === 'submitting' ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Processing Secure Payment...</span>
                                        </>
                                    ) : (
                                        <>
                                            {paymentMethod === 'card' ? <CreditCard className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                                            <span>
                                                {isPaid 
                                                    ? (paymentMethod === 'card'
                                                        ? `Pay with Card • TZS ${Number(effectiveAmount).toLocaleString()}`
                                                        : `Cast ${effectiveQuantity} ${effectiveQuantity === 1 ? 'Vote' : 'Votes'} • TZS ${Number(effectiveAmount).toLocaleString()}`)
                                                    : 'Cast 1 Free Vote Now'}
                                            </span>
                                        </>
                                    )}
                                </button>
                                <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>Audited & verified by Kardovo Voting Engine</span>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

