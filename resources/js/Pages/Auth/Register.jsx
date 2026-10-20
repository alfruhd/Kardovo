import React, { useState, useEffect } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import KardovoLogo from '@/Components/KardovoLogo';
import PasswordStrengthMeter from '@/Components/PasswordStrengthMeter';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { validateEmail, validatePassword, generateStrongPassword } from '@/Utils/validation';
import { Sparkles, Eye, EyeOff } from 'lucide-react';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

    const pageProps = usePage()?.props || {};
    const formTimestampToken = pageProps.formTimestampToken || '';

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        website_url: '',
        _form_rendered_at: formTimestampToken || (Date.now() - 2000),
    });

    useEffect(() => {
        if (formTimestampToken && (!data._form_rendered_at || typeof data._form_rendered_at === 'number')) {
            setData('_form_rendered_at', formTimestampToken);
        }
    }, [formTimestampToken]);

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

            {/* Header with Kardovo Logo */}
            <div className="mb-5 text-center flex flex-col items-center">
                <div className="mb-2 flex justify-center">
                    <KardovoLogo light={false} showText={false} imgClassName="h-9 w-9 sm:h-10 sm:w-10" size="lg" />
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-display tracking-tight">
                    Create Organiser Account
                </h1>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                    Manage events, guests, and smart passes
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div className="opacity-0 absolute -left-[9999px] -top-[9999px] h-0 w-0 overflow-hidden pointer-events-none" aria-hidden="true">
                    <label htmlFor="website_url">Website</label>
                    <input
                        id="website_url"
                        type="text"
                        name="website_url"
                        tabIndex={-1}
                        autoComplete="off"
                        value={data.website_url}
                        onChange={(e) => setData('website_url', e.target.value)}
                    />
                </div>
                {/* Full Name */}
                <div>
                    <InputLabel htmlFor="name" value="Full Name *" className="text-slate-700 font-bold text-xs tracking-wider uppercase mb-1" />
                    <TextInput
                        id="name"
                        name="name"
                        variant="default"
                        value={data.name}
                        className="mt-1 block w-full text-xs font-medium py-2.5 rounded-2xl"
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
                        <InputLabel htmlFor="email" value="Email Address" className="text-slate-700 font-bold text-xs tracking-wider uppercase mb-1" />
                        <span className="text-[10.5px] text-slate-400 font-medium">Optional if phone provided</span>
                    </div>
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        variant="default"
                        value={data.email}
                        className="mt-1 block w-full text-xs font-medium py-2.5 rounded-2xl"
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
                        <InputLabel htmlFor="phone" value="Phone Number" className="text-slate-700 font-bold text-xs tracking-wider uppercase mb-1" />
                        <span className="text-[10.5px] text-slate-400 font-medium">Optional if email provided</span>
                    </div>
                    <TextInput
                        id="phone"
                        type="tel"
                        name="phone"
                        variant="default"
                        value={data.phone}
                        className="mt-1 block w-full text-xs font-medium py-2.5 rounded-2xl"
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
                        <InputLabel htmlFor="password" value="Password *" className="text-slate-700 font-bold text-xs tracking-wider uppercase mb-1" />
                        <button
                            type="button"
                            onClick={handleGeneratePassword}
                            className="inline-flex items-center gap-1 text-[10.5px] font-bold text-sky-700 hover:text-sky-900 cursor-pointer transition"
                        >
                            <Sparkles className="w-3 h-3 text-sky-600" />
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
                            className="block w-full pr-10 text-xs font-medium py-2.5 rounded-2xl"
                            autoComplete="new-password"
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Min. 8 characters"
                            hasError={Boolean(errors.password)}
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

                    <PasswordStrengthMeter password={data.password} dark={false} />
                    <InputError message={errors.password} className="mt-1.5" />
                </div>

                {/* Confirm Password */}
                <div>
                    <InputLabel htmlFor="password_confirmation" value="Confirm Password *" className="text-slate-700 font-bold text-xs tracking-wider uppercase mb-1" />
                    <div className="relative mt-1">
                        <TextInput
                            id="password_confirmation"
                            type={showPasswordConfirm ? 'text' : 'password'}
                            name="password_confirmation"
                            variant="default"
                            value={data.password_confirmation}
                            className="block w-full pr-10 text-xs font-medium py-2.5 rounded-2xl"
                            autoComplete="new-password"
                            placeholder="••••••••••••"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            hasError={Boolean(errors.password_confirmation || isMismatch)}
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
                    {isMismatch && (
                        <p className="mt-1 text-[10.5px] text-rose-500 font-medium">
                            Passwords do not match.
                        </p>
                    )}
                    {isMatch && (
                        <p className="mt-1 text-[10.5px] text-emerald-600 font-medium">
                            Passwords match.
                        </p>
                    )}
                    <InputError message={errors.password_confirmation} className="mt-1.5" />
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                    <PrimaryButton
                        className="w-full justify-center py-3.5 bg-gradient-to-r from-[#154F7C] to-[#327FB5] hover:from-[#1A5C91] hover:to-[#3D8EC7] text-white text-xs font-black rounded-2xl shadow-lg shadow-[#154F7C]/25 border border-sky-500/20 transition active:scale-[0.98] tracking-wide uppercase cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={processing || !isMatch || !isStrong || !hasIdentifier || !isEmailValid || !isPhoneValid || !isNameValid}
                    >
                        {processing ? 'Creating Account...' : 'Create Account'}
                    </PrimaryButton>
                </div>

                {/* Already have an account link */}
                <div className="pt-1 text-center">
                    <p className="text-xs text-slate-500 font-medium">
                        Already have an account?{' '}
                        <Link
                            href={route('login')}
                            className="text-sky-700 hover:text-sky-900 font-bold hover:underline cursor-pointer transition"
                        >
                            Sign in here
                        </Link>
                    </p>
                </div>

                {/* Terms & Privacy */}
                <div className="pt-1 text-center">
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                        By creating an account, you agree to Kardovo’s{' '}
                        <Link href="/terms" className="font-medium text-slate-600 hover:text-sky-700 underline transition">
                            Terms &amp; Conditions
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="font-medium text-slate-600 hover:text-sky-700 underline transition">
                            Privacy Policy
                        </Link>.
                    </p>
                </div>
            </form>
        </GuestLayout>
    );
}
