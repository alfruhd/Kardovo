import React, { useState } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import PasswordStrengthMeter from '@/Components/PasswordStrengthMeter';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { validatePassword, generateStrongPassword } from '@/Utils/validation';
import { Check, X, Sparkles, Eye, EyeOff, ShieldCheck, Lock, Smartphone, Mail, ArrowRight, ArrowLeft, RefreshCw, KeyRound } from 'lucide-react';

export default function ResetPassword({ token, email, maskedTarget, deliveryMethod, devCode, status }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
    const [isResending, setIsResending] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        token: token || '',
        email: email || '',
        password: '',
        password_confirmation: '',
    });

    const isMatch = Boolean(
        data.password &&
        data.password_confirmation &&
        data.password === data.password_confirmation
    );

    const isMismatch = Boolean(
        data.password_confirmation &&
        data.password !== data.password_confirmation
    );

    const pwdAnalysis = validatePassword(data.password);
    const isStrong = pwdAnalysis.isStrong;

    const handleGeneratePassword = () => {
        const generated = generateStrongPassword(16);
        setData({
            ...data,
            password: generated,
            password_confirmation: generated,
        });
    };

    const handleResendCode = () => {
        if (!data.email || isResending) return;
        setIsResending(true);
        router.post(route('password.email'), {
            email: data.email,
            delivery_method: deliveryMethod || 'sms',
        }, {
            preserveScroll: true,
            onFinish: () => setIsResending(false),
        });
    };

    const submit = (e) => {
        e.preventDefault();

        if (!isMatch || !isStrong) {
            return;
        }

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Reset Password - Kardovo" />

            <div className="text-center mb-6">
                <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <Lock className="w-6 h-6 text-[#16A34A]" />
                </div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                    Set New Password
                </h1>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                    Enter the 6-digit security code sent to you, then choose your new secure password.
                </p>
            </div>

            {maskedTarget && (
                <div className="mb-4 p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2.5">
                    {deliveryMethod === 'sms' ? (
                        <Smartphone className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                        <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                    <span className="font-semibold">
                        Verification code sent to <strong className="font-black font-mono">{maskedTarget}</strong>
                    </span>
                </div>
            )}

            {devCode && (
                <div className="mb-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                    <div>
                        <span className="font-bold text-[10px] uppercase tracking-wider text-amber-700 block">Dev / Test Code</span>
                        <span className="font-mono font-black text-base tracking-widest text-amber-950">{devCode}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setData('token', devCode)}
                        className="text-[11px] font-bold text-amber-800 bg-amber-200/60 hover:bg-amber-200 px-2.5 py-1 rounded-xl cursor-pointer transition"
                    >
                        Auto-fill
                    </button>
                </div>
            )}

            {status && (
                <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                {/* Account Identifier */}
                <div>
                    <InputLabel htmlFor="email" value="Email or Phone Number *" />
                    <TextInput
                        id="email"
                        type="text"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full text-xs font-mono font-bold py-2.5 rounded-2xl"
                        autoComplete="username"
                        placeholder="name@email.com or 07XXXXXXXX"
                        onChange={(e) => setData('email', e.target.value)}
                        hasError={Boolean(errors.email)}
                        required
                    />
                    <InputError message={errors.email} className="mt-1.5" />
                </div>

                {/* 6-Digit Security Code */}
                <div>
                    <div className="flex items-center justify-between">
                        <InputLabel htmlFor="token" value="6-Digit Verification Code *" />
                        <button
                            type="button"
                            onClick={handleResendCode}
                            disabled={isResending || !data.email}
                            className="text-[11px] font-bold text-[#16A34A] hover:text-[#15803D] hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                            <RefreshCw className={`w-3 h-3 ${isResending ? 'animate-spin' : ''}`} />
                            <span>{isResending ? 'Resending...' : 'Resend code'}</span>
                        </button>
                    </div>
                    <div className="relative mt-1">
                        <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <TextInput
                            id="token"
                            type="text"
                            name="token"
                            value={data.token}
                            className="block w-full text-sm font-mono font-black tracking-widest pl-10 pr-4 py-2.5 rounded-2xl text-center"
                            autoComplete="one-time-code"
                            maxLength={10}
                            placeholder="123456"
                            onChange={(e) => setData('token', e.target.value)}
                            hasError={Boolean(errors.token)}
                            required
                        />
                    </div>
                    <InputError message={errors.token} className="mt-1.5" />
                </div>

                {/* New Password */}
                <div>
                    <div className="flex items-center justify-between">
                        <InputLabel htmlFor="password" value="New Secure Password *" />
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleGeneratePassword}
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200 cursor-pointer transition"
                                title="Generate strong 16-character password"
                            >
                                <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                                <span>Suggest Strong</span>
                            </button>
                            {data.password && (
                                <span className={`inline-flex items-center gap-1 text-[10.5px] font-bold ${
                                    isStrong ? 'text-emerald-600' : 'text-amber-600'
                                }`}>
                                    {isStrong ? <Check className="w-3 h-3" /> : null}
                                    <span>{isStrong ? 'Strong' : `${pwdAnalysis.score}/4 Requirements`}</span>
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="relative mt-1">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <TextInput
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            className="block w-full text-xs font-mono pl-10 pr-10 py-2.5 rounded-2xl"
                            autoComplete="new-password"
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Min 8 chars, uppercase, lowercase, numbers & symbols"
                            hasError={Boolean(errors.password)}
                            isValid={Boolean(isStrong)}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer focus:outline-none transition"
                            title={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>

                    <PasswordStrengthMeter password={data.password} />
                    <InputError message={errors.password} className="mt-1.5" />
                </div>

                {/* Confirm Password */}
                <div>
                    <div className="flex items-center justify-between">
                        <InputLabel htmlFor="password_confirmation" value="Confirm New Password *" />
                        {data.password_confirmation && (
                            <span className={`inline-flex items-center gap-1 text-[10.5px] font-bold ${
                                isMatch ? 'text-emerald-600' : 'text-rose-600'
                            }`}>
                                {isMatch ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                <span>{isMatch ? 'Passwords match' : 'Do not match'}</span>
                            </span>
                        )}
                    </div>

                    <div className="relative mt-1">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <TextInput
                            type={showPasswordConfirm ? 'text' : 'password'}
                            id="password_confirmation"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="block w-full text-xs font-mono pl-10 pr-10 py-2.5 rounded-2xl"
                            autoComplete="new-password"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            placeholder="Repeat new password"
                            hasError={Boolean(errors.password_confirmation || isMismatch)}
                            isValid={Boolean(isMatch)}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer focus:outline-none transition"
                            title={showPasswordConfirm ? 'Hide password' : 'Show password'}
                        >
                            {showPasswordConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>

                    <InputError message={errors.password_confirmation} className="mt-1.5" />
                </div>

                <div className="pt-2">
                    <PrimaryButton
                        className="w-full justify-center py-3 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-black rounded-2xl shadow-md transition active:scale-[0.98] gap-2 tracking-wide uppercase cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={processing || !isMatch || !isStrong || !data.token}
                    >
                        <span>{processing ? 'Updating Password...' : 'Reset Password & Continue'}</span>
                        <ArrowRight className="w-4 h-4 text-white" />
                    </PrimaryButton>
                </div>

                <div className="pt-2 text-center">
                    <Link
                        href={route('login')}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back to Sign In</span>
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
