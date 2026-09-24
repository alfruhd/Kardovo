import React, { useState } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import PasswordStrengthMeter from '@/Components/PasswordStrengthMeter';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { validateEmail, validatePassword, generateStrongPassword } from '@/Utils/validation';
import { Sparkles, Eye, EyeOff } from 'lucide-react';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
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
    const isEmailValid = !data.email || validateEmail(data.email);
    const isPhoneValid = !data.phone || /^\+?[0-9\s\-().]{7,25}$/.test(data.phone.trim());
    const hasIdentifier = Boolean((data.email && validateEmail(data.email)) || (data.phone && /^\+?[0-9\s\-().]{7,25}$/.test(data.phone.trim())));
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

        if (!isMatch || !isStrong || !hasIdentifier || !isEmailValid || !isPhoneValid || !isNameValid) {
            return;
        }

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Create Organiser Account" />

            {/* Header */}
            <div className="mb-5 text-center">
                <h1 className="text-xl font-black text-slate-900 dark:text-white font-display tracking-tight">
                    Create Organiser Account
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Manage events, guests, and smart passes
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                {/* Full Name */}
                <div>
                    <InputLabel htmlFor="name" value="Full Name *" />
                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full text-xs font-mono font-bold"
                        autoComplete="name"
                        placeholder="e.g. Salim Juma"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        hasError={Boolean(errors.name)}
                        required
                    />
                    <InputError message={errors.name} className="mt-1.5" />
                </div>

                {/* Email Address */}
                <div>
                    <div className="flex items-center justify-between">
                        <InputLabel htmlFor="email" value="Email Address" />
                        <span className="text-[10.5px] text-slate-400">Optional if phone provided</span>
                    </div>
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full text-xs font-mono font-bold"
                        autoComplete="username"
                        placeholder="name@email.com"
                        onChange={(e) => setData('email', e.target.value)}
                        hasError={Boolean(errors.email)}
                        required={!data.phone}
                    />
                    <InputError message={errors.email} className="mt-1.5" />
                </div>

                {/* Phone Number */}
                <div>
                    <div className="flex items-center justify-between">
                        <InputLabel htmlFor="phone" value="Phone Number" />
                        <span className="text-[10.5px] text-slate-400">Optional if email provided</span>
                    </div>
                    <TextInput
                        id="phone"
                        type="tel"
                        name="phone"
                        value={data.phone}
                        className="mt-1 block w-full text-xs font-mono font-bold"
                        autoComplete="tel"
                        placeholder="07XXXXXXXX or +255 7XX XXX XXX"
                        onChange={(e) => setData('phone', e.target.value)}
                        hasError={Boolean(errors.phone)}
                        required={!data.email}
                    />
                    <InputError message={errors.phone} className="mt-1.5" />
                </div>

                {/* Password */}
                <div>
                    <div className="flex items-center justify-between">
                        <InputLabel htmlFor="password" value="Password *" />
                        <button
                            type="button"
                            onClick={handleGeneratePassword}
                            className="inline-flex items-center gap-1 text-[10.5px] font-bold text-cyan-700 dark:text-cyan-400 hover:underline cursor-pointer"
                        >
                            <Sparkles className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                            <span>Suggest strong</span>
                        </button>
                    </div>

                    <div className="relative mt-1">
                        <TextInput
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            className="block w-full pr-10 text-xs font-mono"
                            autoComplete="new-password"
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Min. 8 characters"
                            hasError={Boolean(errors.password)}
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
                    <InputError message={errors.password} className="mt-1.5" />
                </div>

                {/* Confirm Password */}
                <div>
                    <InputLabel htmlFor="password_confirmation" value="Confirm Password *" />
                    <div className="relative mt-1">
                        <TextInput
                            id="password_confirmation"
                            type={showPasswordConfirm ? 'text' : 'password'}
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="block w-full pr-10 text-xs font-mono"
                            autoComplete="new-password"
                            placeholder="••••••••••••"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            hasError={Boolean(errors.password_confirmation || isMismatch)}
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
                    {isMismatch && (
                        <p className="mt-1 text-[10.5px] text-rose-500 font-medium">
                            Passwords do not match.
                        </p>
                    )}
                    <InputError message={errors.password_confirmation} className="mt-1.5" />
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                    <PrimaryButton
                        className="w-full justify-center py-3 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-black rounded-2xl shadow-md transition active:scale-[0.98] tracking-wide uppercase cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={processing || !isMatch || !isStrong || !hasIdentifier || !isEmailValid || !isPhoneValid || !isNameValid}
                    >
                        {processing ? 'Creating Account...' : 'Create Account'}
                    </PrimaryButton>
                </div>

                {/* Already have an account link */}
                <div className="pt-1 text-center">
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
                        Already have an account?{' '}
                        <Link
                            href={route('login')}
                            className="text-[#16A34A] hover:text-[#15803D] dark:text-emerald-400 dark:hover:text-emerald-300 font-black hover:underline cursor-pointer transition"
                        >
                            Sign in here
                        </Link>
                    </p>
                </div>

                {/* Terms & Privacy */}
                <div className="pt-1 text-center">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        By creating an account, you agree to Kardovo’s{' '}
                        <Link href="/terms" className="font-bold text-slate-700 dark:text-slate-300 hover:underline">
                            Terms &amp; Conditions
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="font-bold text-slate-700 dark:text-slate-300 hover:underline">
                            Privacy Policy
                        </Link>.
                    </p>
                </div>
            </form>
        </GuestLayout>
    );
}
