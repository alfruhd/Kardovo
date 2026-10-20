import React, { useState } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import KardovoLogo from '@/Components/KardovoLogo';
import PasswordStrengthMeter from '@/Components/PasswordStrengthMeter';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { validatePassword, generateStrongPassword } from '@/Utils/validation';
import { Sparkles, Eye, EyeOff, ArrowLeft } from 'lucide-react';

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
            <Head title="Reset Password" />

            {/* Clean, Branded Header with Kardovo Logo */}
            <div className="mb-5 text-center flex flex-col items-center">
                <div className="mb-2 flex justify-center">
                    <KardovoLogo light={false} showText={false} imgClassName="h-9 w-9 sm:h-10 sm:w-10" size="lg" />
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-display tracking-tight">
                    Reset Password
                </h1>
                <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed max-w-xs mx-auto">
                    {maskedTarget ? (
                        <>Code sent to <span className="font-semibold text-slate-800">{maskedTarget}</span></>
                    ) : (
                        'Enter your verification code and new password'
                    )}
                </p>
            </div>

            {status && (
                <div className="mb-4 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 rounded-xl text-center">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                {/* Email / Phone input shown only if not already provided */}
                {!email && (
                    <div>
                        <InputLabel htmlFor="email" value="Email or Phone Number *" className="text-slate-700 font-bold text-xs tracking-wider uppercase mb-1" />
                        <TextInput
                            id="email"
                            type="text"
                            name="email"
                            variant="default"
                            value={data.email}
                            className="mt-1 block w-full text-xs font-medium pl-3.5 py-2.5 rounded-2xl"
                            placeholder="name@email.com or 07XXXXXXXX"
                            onChange={(e) => setData('email', e.target.value)}
                            hasError={Boolean(errors.email)}
                            required
                        />
                        <InputError message={errors.email} className="mt-1.5" />
                    </div>
                )}

                {/* 6-Digit Code */}
                <div>
                    <div className="flex items-center justify-between">
                        <InputLabel htmlFor="token" value="Verification Code *" className="text-slate-700 font-bold text-xs tracking-wider uppercase mb-1" />
                        <div className="flex items-center gap-2">
                            {devCode && (
                                <button
                                    type="button"
                                    onClick={() => setData('token', devCode)}
                                    className="text-[10.5px] font-mono font-bold text-sky-800 bg-sky-50 hover:bg-sky-100 px-2 py-0.5 rounded-md border border-sky-300 cursor-pointer transition shadow-2xs"
                                    title="Auto-fill dev code"
                                >
                                    Fill: {devCode}
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={handleResendCode}
                                disabled={isResending || !data.email}
                                className="text-[11px] font-bold text-sky-700 hover:text-sky-900 hover:underline cursor-pointer disabled:opacity-50"
                            >
                                {isResending ? 'Sending...' : 'Resend code'}
                            </button>
                        </div>
                    </div>
                    <TextInput
                        id="token"
                        type="text"
                        name="token"
                        variant="default"
                        value={data.token}
                        className="mt-1 block w-full text-sm font-mono font-black tracking-widest text-center py-2.5 rounded-2xl"
                        autoComplete="one-time-code"
                        maxLength={10}
                        placeholder="123456"
                        isFocused={true}
                        onChange={(e) => setData('token', e.target.value)}
                        hasError={Boolean(errors.token)}
                        required
                    />
                    <InputError message={errors.token} className="mt-1.5" />
                </div>

                {/* New Password */}
                <div>
                    <div className="flex items-center justify-between">
                        <InputLabel htmlFor="password" value="New Password *" className="text-slate-700 font-bold text-xs tracking-wider uppercase mb-1" />
                        <button
                            type="button"
                            onClick={handleGeneratePassword}
                            className="inline-flex items-center gap-1 text-[10.5px] font-bold text-sky-700 hover:text-sky-900 cursor-pointer transition"
                            title="Generate strong 16-character password"
                        >
                            <Sparkles className="w-2.5 h-2.5 text-sky-600" />
                            <span>Suggest strong</span>
                        </button>
                    </div>

                    <div className="relative mt-1">
                        <TextInput
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            variant="default"
                            value={data.password}
                            className="block w-full text-xs font-medium pl-3.5 pr-10 py-2.5 rounded-2xl"
                            autoComplete="new-password"
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="••••••••••••"
                            hasError={Boolean(errors.password)}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer focus:outline-none transition"
                            title={showPassword ? 'Hide' : 'Show'}
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>

                    <PasswordStrengthMeter password={data.password} dark={false} />
                    <InputError message={errors.password} className="mt-1.5" />
                </div>

                {/* Confirm Password */}
                <div>
                    <div className="flex items-center justify-between">
                        <InputLabel htmlFor="password_confirmation" value="Confirm Password *" className="text-slate-700 font-bold text-xs tracking-wider uppercase mb-1" />
                        {data.password_confirmation && (
                            <span className={`text-[10.5px] font-bold ${isMatch ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {isMatch ? 'Passwords match' : 'Do not match'}
                            </span>
                        )}
                    </div>

                    <div className="relative mt-1">
                        <TextInput
                            type={showPasswordConfirm ? 'text' : 'password'}
                            id="password_confirmation"
                            name="password_confirmation"
                            variant="default"
                            value={data.password_confirmation}
                            className="block w-full text-xs font-medium pl-3.5 pr-10 py-2.5 rounded-2xl"
                            autoComplete="new-password"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            placeholder="••••••••••••"
                            hasError={Boolean(errors.password_confirmation || isMismatch)}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer focus:outline-none transition"
                            title={showPasswordConfirm ? 'Hide' : 'Show'}
                        >
                            {showPasswordConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>

                    <InputError message={errors.password_confirmation} className="mt-1.5" />
                </div>

                <div className="pt-2">
                    <PrimaryButton
                        className="w-full justify-center py-3.5 bg-gradient-to-r from-[#154F7C] to-[#327FB5] hover:from-[#1A5C91] hover:to-[#3D8EC7] text-white text-xs font-black rounded-2xl shadow-lg shadow-[#154F7C]/25 border border-sky-500/20 transition active:scale-[0.98] uppercase tracking-wide cursor-pointer"
                        disabled={processing}
                    >
                        {processing ? 'Resetting Password...' : 'Reset Password'}
                    </PrimaryButton>
                </div>

                <div className="pt-2 text-center">
                    <Link
                        href={route('login')}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-sky-700 transition"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back to Sign In</span>
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
