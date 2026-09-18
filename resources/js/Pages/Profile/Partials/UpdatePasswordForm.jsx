import React, { useRef, useState } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import PasswordStrengthMeter from '@/Components/PasswordStrengthMeter';
import { useForm } from '@inertiajs/react';
import { validatePassword, generateStrongPassword } from '@/Utils/validation';
import { Lock, Key, ShieldCheck, CheckCircle2, Check, X, AlertCircle, Sparkles, Eye, EyeOff } from 'lucide-react';

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
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

    const updatePassword = (e) => {
        e.preventDefault();

        if (!isStrong || !isMatch) {
            return;
        }

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    return (
        <section className={`space-y-5 ${className}`}>
            <header className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 shadow-2xs">
                        <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <h2 className="text-base font-black text-slate-900 dark:text-white font-display">
                            Security &amp; Password Management
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                            Ensure your account uses a secure password to protect your event guest data and gate scanning telemetry.
                        </p>
                    </div>
                </div>
            </header>

            <form onSubmit={updatePassword} className="space-y-4">
                {/* Current Password */}
                <div>
                    <InputLabel
                        htmlFor="current_password"
                        value="Current Password *"
                    />
                    <div className="relative mt-1 block w-full sm:w-2/3">
                        <TextInput
                            id="current_password"
                            ref={currentPasswordInput}
                            value={data.current_password}
                            onChange={(e) => setData('current_password', e.target.value)}
                            type={showCurrentPassword ? 'text' : 'password'}
                            className="block w-full text-xs pr-10 font-mono"
                            autoComplete="current-password"
                            placeholder="••••••••••••"
                            hasError={Boolean(errors.current_password)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer focus:outline-none transition"
                            title={showCurrentPassword ? 'Hide password' : 'Show password'}
                        >
                            {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    <InputError
                        message={errors.current_password}
                        className="mt-1.5"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* New Password */}
                    <div>
                        <div className="flex items-center justify-between">
                            <InputLabel htmlFor="password" value="New Secure Password *" />
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleGeneratePassword}
                                    className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200 cursor-pointer bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/40"
                                    title="Generate strong 16-character password"
                                >
                                    <Sparkles className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                                    <span>Suggest Strong</span>
                                </button>
                                {data.password && (
                                    <span className={`inline-flex items-center gap-1 text-[10.5px] font-bold ${
                                        isStrong ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                                    }`}>
                                        {isStrong ? <Check className="w-3 h-3" /> : null}
                                        <span>{isStrong ? 'Strong Password' : `${pwdAnalysis.score}/4 Requirements`}</span>
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="relative mt-1">
                            <TextInput
                                id="password"
                                ref={passwordInput}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                type={showNewPassword ? 'text' : 'password'}
                                className="block w-full text-xs pr-10 font-mono"
                                autoComplete="new-password"
                                placeholder="Min 8 chars, uppercase, lowercase, numbers & symbols"
                                hasError={Boolean(errors.password)}
                                isValid={Boolean(isStrong)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer focus:outline-none transition"
                                title={showNewPassword ? 'Hide password' : 'Show password'}
                            >
                                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        <InputError message={errors.password} className="mt-1.5" />
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <div className="flex items-center justify-between">
                            <InputLabel
                                htmlFor="password_confirmation"
                                value="Confirm New Password *"
                            />
                            {data.password_confirmation && (
                                <span className={`inline-flex items-center gap-1 text-[10.5px] font-bold ${
                                    isMatch 
                                        ? 'text-emerald-600 dark:text-emerald-400' 
                                        : 'text-rose-600 dark:text-rose-400'
                                }`}>
                                    {isMatch ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                    <span>{isMatch ? 'Passwords match' : 'Do not match'}</span>
                                </span>
                            )}
                        </div>
                        <div className="relative mt-1">
                            <TextInput
                                id="password_confirmation"
                                value={data.password_confirmation}
                                onChange={(e) =>
                                    setData('password_confirmation', e.target.value)
                                }
                                type={showConfirmPassword ? 'text' : 'password'}
                                className="block w-full text-xs pr-10 font-mono"
                                autoComplete="new-password"
                                placeholder="Repeat new password"
                                hasError={Boolean(errors.password_confirmation || isMismatch)}
                                isValid={Boolean(isMatch)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer focus:outline-none transition"
                                title={showConfirmPassword ? 'Hide password' : 'Show password'}
                            >
                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        <InputError
                            message={errors.password_confirmation}
                            className="mt-1.5"
                        />
                    </div>
                </div>

                <PasswordStrengthMeter password={data.password} />

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/[0.08]">
                    {recentlySuccessful ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/40 animate-fadeIn">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Password updated successfully!</span>
                        </span>
                    ) : <div />}

                    <div className="ml-auto">
                        <PrimaryButton 
                            disabled={processing || !data.current_password || !isStrong || !isMatch} 
                            className="bg-[#16A34A] hover:bg-[#15803D] border-[#16A34A] text-white font-bold py-2.5 px-5 rounded-xl shadow-xs transition active:scale-95 text-xs gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Key className="w-3.5 h-3.5 text-white" />
                            <span>Update Password</span>
                        </PrimaryButton>
                    </div>
                </div>
            </form>
        </section>
    );
}
