import React, { useState } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import PasswordStrengthMeter from '@/Components/PasswordStrengthMeter';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { validateEmail, validatePassword, generateStrongPassword, validateRequired } from '@/Utils/validation';
import { Check, X, Sparkles, Eye, EyeOff } from 'lucide-react';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
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
    const isEmailValid = validateEmail(data.email);
    const isNameValid = data.name.trim().length >= 2;

    const handleGeneratePassword = () => {
        const generated = generateStrongPassword(16);
        setData({
            ...data,
            password: generated,
            password_confirmation: generated,
        });
    };

    const submit = (e) => {
        e.preventDefault();

        if (!isMatch || !isStrong || !isEmailValid || !isNameValid) {
            return;
        }

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <form onSubmit={submit}>
                <div>
                    <div className="flex items-center justify-between">
                        <InputLabel htmlFor="name" value="Name" />
                        {data.name && isNameValid && (
                            <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400">
                                <Check className="w-3 h-3" />
                                <span>Valid</span>
                            </span>
                        )}
                    </div>

                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        hasError={Boolean(errors.name)}
                        isValid={Boolean(data.name && isNameValid)}
                        required
                    />

                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div className="mt-4">
                    <div className="flex items-center justify-between">
                        <InputLabel htmlFor="email" value="Email" />
                        {data.email && isEmailValid && (
                            <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400">
                                <Check className="w-3 h-3" />
                                <span>Verified format</span>
                            </span>
                        )}
                    </div>

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        hasError={Boolean(errors.email)}
                        isValid={Boolean(data.email && isEmailValid)}
                        required
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <div className="flex items-center justify-between">
                        <InputLabel htmlFor="password" value="Password" />
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleGeneratePassword}
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-700 dark:text-cyan-300 hover:text-cyan-800 dark:hover:text-cyan-200 cursor-pointer bg-cyan-50 dark:bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-200 dark:border-cyan-800/40"
                                title="Generate strong 16-character password"
                            >
                                <Sparkles className="w-2.5 h-2.5 text-cyan-600 dark:text-cyan-400" />
                                <span>Suggest Strong</span>
                            </button>
                            {data.password && (
                                <span className={`inline-flex items-center gap-1 text-[10.5px] font-bold ${
                                    isStrong ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                                }`}>
                                    {isStrong ? <Check className="w-3 h-3" /> : null}
                                    <span>{isStrong ? 'Strong' : `${pwdAnalysis.score}/4 Requirements`}</span>
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="relative mt-1">
                        <TextInput
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            className="block w-full pr-10"
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
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer focus:outline-none transition"
                            title={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>

                    <PasswordStrengthMeter password={data.password} />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4">
                    <div className="flex items-center justify-between">
                        <InputLabel
                            htmlFor="password_confirmation"
                            value="Confirm Password"
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
                            type={showPasswordConfirm ? 'text' : 'password'}
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="block w-full pr-10"
                            autoComplete="new-password"
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            hasError={Boolean(errors.password_confirmation || isMismatch)}
                            isValid={Boolean(isMatch)}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer focus:outline-none transition"
                            title={showPasswordConfirm ? 'Hide password' : 'Show password'}
                        >
                            {showPasswordConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                {/* Terms of Service & Privacy Notice */}
                <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                    By registering an organizer account, you agree to Kardovo’s{' '}
                    <Link href="/terms" className="font-bold text-cyan-600 dark:text-cyan-400 hover:underline">
                        Terms &amp; Conditions
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="font-bold text-cyan-600 dark:text-cyan-400 hover:underline">
                        Privacy Policy
                    </Link>.
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <Link
                        href={route('login')}
                        className="rounded-md text-sm text-gray-600 dark:text-slate-400 underline hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Already registered?
                    </Link>

                    <PrimaryButton className="ms-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" disabled={processing || !isMatch || !isStrong || !isEmailValid || !isNameValid}>
                        Register
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
