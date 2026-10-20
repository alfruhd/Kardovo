import React, { useState, useRef, useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { ShieldCheck, Lock, Smartphone, Mail, ArrowLeft, RefreshCw, Sparkles, CheckCircle2, Clipboard, AlertTriangle } from 'lucide-react';

export default function VerifyOtp({ maskedEmail, maskedPhone, devCode, status }) {
    const [digits, setDigits] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(600); // 10 minutes
    const [canResend, setCanResend] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const inputRefs = useRef([]);

    const { data, setData, post, processing, errors, reset } = useForm({
        code: '',
    });

    useEffect(() => {
        // Auto-focus first input box
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }

        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setCanResend(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Helper: apply 6 digits and sync
    const applyCodeString = (rawCode) => {
        if (!rawCode) return;
        const clean = String(rawCode).replace(/\D/g, '').slice(0, 6);
        if (clean.length === 0) return;

        const newDigits = ['', '', '', '', '', ''];
        for (let i = 0; i < clean.length; i++) {
            newDigits[i] = clean[i];
        }
        setDigits(newDigits);

        const focusIndex = Math.min(clean.length, 5);
        if (inputRefs.current[focusIndex]) {
            inputRefs.current[focusIndex].focus();
        }
    };

    // Sync combined digits to form data
    useEffect(() => {
        const fullCode = digits.join('');
        setData('code', fullCode);
        if (fullCode.length === 6 && !processing) {
            // Auto submit when 6 digits are typed or pasted
            post(route('two-factor.verify'), {
                preserveScroll: true,
                onError: () => {
                    setDigits(['', '', '', '', '', '']);
                    if (inputRefs.current[0]) inputRefs.current[0].focus();
                },
            });
        }
    }, [digits]);

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedText = e.clipboardData ? e.clipboardData.getData('text') : '';
        applyCodeString(pastedText);
    };

    const handleClipboardPasteButton = async () => {
        try {
            if (navigator.clipboard && navigator.clipboard.readText) {
                const text = await navigator.clipboard.readText();
                applyCodeString(text);
            }
        } catch (err) {
            console.warn('Clipboard read permission not granted or supported:', err);
        }
    };

    const handleDigitChange = (index, value) => {
        // If value has multiple characters (e.g. browser autofill / paste)
        if (value.length > 1) {
            applyCodeString(value);
            return;
        }

        const cleanVal = value.replace(/\D/g, '');
        const newDigits = [...digits];
        newDigits[index] = cleanVal;
        setDigits(newDigits);

        if (cleanVal && index < 5 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace') {
            if (!digits[index] && index > 0 && inputRefs.current[index - 1]) {
                const newDigits = [...digits];
                newDigits[index - 1] = '';
                setDigits(newDigits);
                inputRefs.current[index - 1].focus();
            } else if (digits[index]) {
                const newDigits = [...digits];
                newDigits[index] = '';
                setDigits(newDigits);
            }
        } else if (e.key === 'ArrowLeft' && index > 0 && inputRefs.current[index - 1]) {
            inputRefs.current[index - 1].focus();
        } else if (e.key === 'ArrowRight' && index < 5 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleResend = (e) => {
        e.preventDefault();
        setIsResending(true);
        post(route('two-factor.resend'), {
            preserveScroll: true,
            onFinish: () => {
                setIsResending(false);
                setTimer(600);
                setCanResend(false);
            },
        });
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('two-factor.verify'));
    };

    return (
        <GuestLayout>
            <Head title="Two-Factor Security Verification" />

            <div className="space-y-4 sm:space-y-5" onPaste={handlePaste}>
                {/* Header Badge & Title */}
                <div className="text-center space-y-1.5 sm:space-y-2">
                    <div className="inline-flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-sky-50 text-sky-700 border border-sky-200 shadow-2xs mb-0.5 sm:mb-1">
                        <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-display tracking-tight">
                        Two-Factor Authentication
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto leading-relaxed font-medium">
                        Enter the 6-digit security verification code sent to your registered channels.
                    </p>
                </div>

                {/* Delivery Target Channels */}
                <div className="flex flex-col gap-2 p-3 sm:p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/90 text-xs">
                    {maskedEmail && (
                        <div className="flex items-center justify-between text-slate-600">
                            <span className="flex items-center gap-2 font-medium">
                                <Mail className="w-3.5 h-3.5 text-sky-600" />
                                <span>Email Verification:</span>
                            </span>
                            <span className="font-mono font-bold text-slate-900">{maskedEmail}</span>
                        </div>
                    )}
                    {maskedPhone && (
                        <div className="flex items-center justify-between text-slate-600 pt-1.5 border-t border-slate-200">
                            <span className="flex items-center gap-2 font-medium">
                                <Smartphone className="w-3.5 h-3.5 text-sky-600" />
                                <span>WhatsApp / SMS:</span>
                            </span>
                            <span className="font-mono font-bold text-slate-900">{maskedPhone}</span>
                        </div>
                    )}
                </div>

                {/* Dev Mode Code Banner */}
                {devCode && (
                    <div className="p-2.5 sm:p-3 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-between text-xs animate-fadeIn text-sky-900">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-sky-600" />
                            <span className="text-sky-950 font-bold">Dev/Test Code:</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => applyCodeString(devCode)}
                            className="font-mono font-black text-sm tracking-widest text-sky-800 bg-white px-2.5 py-0.5 rounded-lg border border-sky-300 hover:bg-sky-50 transition cursor-pointer shadow-2xs"
                            title="Click to 1-tap fill this code"
                        >
                            {devCode}
                        </button>
                    </div>
                )}

                {status && (
                    <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800 font-bold animate-fadeIn">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>{status}</span>
                    </div>
                )}

                {/* Form: 6-Segmented Boxes */}
                <form onSubmit={submit} className="space-y-4 sm:space-y-5" onPaste={handlePaste}>
                    {/* Prominent Error Alert on Top of Input Boxes */}
                    {errors.code && (
                        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs animate-shake shadow-xs">
                            <div className="w-6 h-6 rounded-xl bg-rose-100 text-rose-600 border border-rose-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5]" />
                            </div>
                            <div className="space-y-0.5 text-left">
                                <div className="font-black text-rose-900 text-xs">
                                    Something went wrong.
                                </div>
                                <div className="text-rose-700 font-medium text-[11.5px] leading-relaxed">
                                    {errors.code}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                            {digits.map((digit, idx) => (
                                <input
                                    key={idx}
                                    ref={(el) => (inputRefs.current[idx] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={idx === 0 ? 6 : 1}
                                    autoComplete={idx === 0 ? "one-time-code" : "off"}
                                    value={digit}
                                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(idx, e)}
                                    onPaste={handlePaste}
                                    className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-mono font-black rounded-2xl bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-900 border-2 border-slate-200 focus:border-sky-600 focus:ring-4 focus:ring-sky-500/15 outline-none transition-all shadow-2xs"
                                    required
                                />
                            ))}
                        </div>

                        {/* Paste from Clipboard helper button */}
                        {typeof navigator !== 'undefined' && navigator.clipboard && (
                            <div className="flex justify-center pt-1">
                                <button
                                    type="button"
                                    onClick={handleClipboardPasteButton}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 hover:text-slate-900 border border-slate-200 text-[11px] font-bold transition active:scale-95 cursor-pointer shadow-2xs"
                                >
                                    <Clipboard className="w-3.5 h-3.5 text-sky-600" />
                                    <span>Paste code from clipboard</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Timer & Resend */}
                    <div className="flex items-center justify-between text-xs text-slate-500 px-1 pt-1 font-medium">
                        <span>
                            Code expires in <strong className="font-mono text-slate-900 font-bold">{formatTime(timer)}</strong>
                        </span>

                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={isResending}
                            className="inline-flex items-center gap-1.5 font-bold text-sky-700 hover:text-sky-900 hover:underline disabled:opacity-50 cursor-pointer transition"
                        >
                            <RefreshCw className={`w-3 h-3 ${isResending ? 'animate-spin' : ''}`} />
                            <span>Resend Code</span>
                        </button>
                    </div>

                    <PrimaryButton
                        disabled={processing || data.code.length !== 6}
                        className="w-full justify-center py-3.5 rounded-2xl bg-gradient-to-r from-[#154F7C] to-[#327FB5] hover:from-[#1A5C91] hover:to-[#3D8EC7] border border-sky-500/20 text-white font-black text-xs shadow-lg shadow-[#154F7C]/25 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                        <Lock className="w-3.5 h-3.5 mr-1 text-white" />
                        <span>Verify &amp; Continue</span>
                    </PrimaryButton>

                    <div className="text-center pt-2">
                        <Link
                            href={route('login')}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-sky-700 transition"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Back to Standard Login</span>
                        </Link>
                    </div>
                </form>
            </div>
        </GuestLayout>
    );
}
