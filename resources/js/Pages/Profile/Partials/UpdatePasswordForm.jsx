import React, { useRef } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import PasswordStrengthMeter from '@/Components/PasswordStrengthMeter';
import { useForm } from '@inertiajs/react';
import { Lock, Key, ShieldCheck, CheckCircle2, Check, X, AlertCircle } from 'lucide-react';

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

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

    const isLengthValid = data.password.length >= 8;

    const updatePassword = (e) => {
        e.preventDefault();

        if (data.password !== data.password_confirmation) {
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
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200/60 dark:border-white/[0.08] text-slate-700 dark:text-slate-200 flex items-center justify-center flex-shrink-0 shadow-2xs">
                        <Lock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
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
                    <TextInput
                        id="current_password"
                        ref={currentPasswordInput}
                        value={data.current_password}
                        onChange={(e) => setData('current_password', e.target.value)}
                        type="password"
                        className="mt-1 block w-full sm:w-2/3 text-xs"
                        autoComplete="current-password"
                        placeholder="••••••••••••"
                        hasError={Boolean(errors.current_password)}
                    />
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
                            {data.password && (
                                <span className={`inline-flex items-center gap-1 text-[10.5px] font-bold ${
                                    isLengthValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                                }`}>
                                    {isLengthValid ? <Check className="w-3 h-3" /> : null}
                                    <span>{isLengthValid ? 'Length met (8+)' : `${data.password.length}/8 chars`}</span>
                                </span>
                            )}
                        </div>
                        <TextInput
                            id="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            type="password"
                            className="mt-1 block w-full text-xs"
                            autoComplete="new-password"
                            placeholder="Minimum 8 characters"
                            hasError={Boolean(errors.password)}
                            isValid={Boolean(isLengthValid)}
                        />
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
                        <TextInput
                            id="password_confirmation"
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            type="password"
                            className="mt-1 block w-full text-xs"
                            autoComplete="new-password"
                            placeholder="Repeat new password"
                            hasError={Boolean(errors.password_confirmation || isMismatch)}
                            isValid={Boolean(isMatch)}
                        />
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
                            disabled={processing || !data.current_password || !isLengthValid || !isMatch} 
                            className="bg-slate-900 hover:bg-slate-800 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white font-bold py-2.5 px-5 rounded-xl shadow-xs transition active:scale-95 text-xs gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Key className="w-3.5 h-3.5 text-cyan-400 dark:text-white" />
                            <span>Update Password</span>
                        </PrimaryButton>
                    </div>
                </div>
            </form>
        </section>
    );
}
