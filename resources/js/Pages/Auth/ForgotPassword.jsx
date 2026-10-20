import React, { useState, useEffect } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import KardovoLogo from '@/Components/KardovoLogo';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Mail, Smartphone, ArrowRight, ArrowLeft } from 'lucide-react';

export default function ForgotPassword({ status, error }) {
    const [selectedChannel, setSelectedChannel] = useState('sms');

    const pageProps = usePage()?.props || {};
    const formTimestampToken = pageProps.formTimestampToken || '';

    const { data, setData, post, processing, errors } = useForm({
        email: '',
        delivery_method: 'sms',
        website_url: '',
        _form_rendered_at: formTimestampToken || (Date.now() - 2000),
    });

    useEffect(() => {
        if (formTimestampToken && (!data._form_rendered_at || typeof data._form_rendered_at === 'number')) {
            setData('_form_rendered_at', formTimestampToken);
        }
    }, [formTimestampToken]);

    const handleIdentifierChange = (value) => {
        setData((prev) => {
            const isEmail = value.includes('@');
            const defaultMethod = isEmail ? 'email' : 'sms';
            setSelectedChannel(defaultMethod);
            return {
                ...prev,
                email: value,
                delivery_method: defaultMethod,
            };
        });
    };

    const handleChannelSelect = (channel) => {
        setSelectedChannel(channel);
        setData('delivery_method', channel);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    const isEmailInput = data.email && data.email.includes('@');

    return (
        <GuestLayout>
            <Head title="Forgot Password" />

            {/* Clean, Branded Header with Kardovo Logo */}
            <div className="mb-6 text-center flex flex-col items-center">
                <div className="mb-2.5 flex justify-center">
                    <KardovoLogo light={false} showText={false} imgClassName="h-9 w-9 sm:h-10 sm:w-10" size="lg" />
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-display tracking-tight">
                    Reset Password
                </h1>
                <p className="text-xs text-slate-500 mt-1 font-medium max-w-xs mx-auto leading-relaxed">
                    Enter your email or phone to receive a 6-digit verification code
                </p>
            </div>

            {status && (
                <div className="mb-4 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 rounded-xl text-center">
                    {status}
                </div>
            )}

            {error && (
                <div className="mb-4 text-xs font-semibold text-rose-800 bg-rose-50 border border-rose-200 px-3.5 py-2.5 rounded-xl text-center">
                    {error}
                </div>
            )}

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
                <div>
                    <InputLabel htmlFor="email" value="Email or Phone Number *" className="text-slate-700 font-bold text-xs tracking-wider uppercase mb-1" />
                    <div className="relative mt-1">
                        {isEmailInput ? (
                            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        ) : (
                            <Smartphone className="w-4 h-4 text-sky-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        )}
                        <TextInput
                            id="email"
                            type="text"
                            name="email"
                            variant="default"
                            value={data.email}
                            className="block w-full text-xs font-medium pl-10 py-3 rounded-2xl"
                            autoComplete="username"
                            isFocused={true}
                            onChange={(e) => handleIdentifierChange(e.target.value)}
                            placeholder="name@email.com or 07XXXXXXXX"
                            required
                        />
                    </div>
                    <InputError message={errors.email} className="mt-1.5" />
                </div>

                {/* Delivery Channel Preference */}
                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <InputLabel value="Send Code To" className="text-slate-700 font-bold text-xs tracking-wider uppercase mb-1" />
                        <span className="text-[10.5px] text-slate-400 font-medium">Preferred channel</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => handleChannelSelect('sms')}
                            className={`p-2.5 rounded-2xl border text-center transition cursor-pointer flex items-center justify-center gap-2 ${
                                selectedChannel === 'sms'
                                    ? 'border-sky-500 bg-sky-50 text-sky-900 font-bold shadow-xs ring-2 ring-sky-500/20'
                                    : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-slate-50/80 hover:bg-slate-100/80 font-medium'
                            }`}
                        >
                            <Smartphone className={`w-3.5 h-3.5 ${selectedChannel === 'sms' ? 'text-sky-600' : 'text-slate-400'}`} />
                            <span className="text-xs">SMS / Phone</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleChannelSelect('email')}
                            className={`p-2.5 rounded-2xl border text-center transition cursor-pointer flex items-center justify-center gap-2 ${
                                selectedChannel === 'email'
                                    ? 'border-sky-500 bg-sky-50 text-sky-900 font-bold shadow-xs ring-2 ring-sky-500/20'
                                    : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-slate-50/80 hover:bg-slate-100/80 font-medium'
                            }`}
                        >
                            <Mail className={`w-3.5 h-3.5 ${selectedChannel === 'email' ? 'text-sky-600' : 'text-slate-400'}`} />
                            <span className="text-xs">Email</span>
                        </button>
                    </div>
                </div>

                <div className="pt-2">
                    <PrimaryButton
                        className="w-full justify-center py-3.5 bg-gradient-to-r from-[#154F7C] to-[#327FB5] hover:from-[#1A5C91] hover:to-[#3D8EC7] text-white text-xs font-black rounded-2xl shadow-lg shadow-[#154F7C]/25 transition active:scale-[0.98] gap-2 tracking-wide uppercase cursor-pointer border border-sky-500/20"
                        disabled={processing}
                    >
                        <span>{processing ? 'Sending Code...' : 'Send Verification Code'}</span>
                        <ArrowRight className="w-4 h-4 text-white" />
                    </PrimaryButton>
                </div>

                <div className="pt-2 text-center">
                    <Link
                        href={route('login')}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-sky-700 transition cursor-pointer"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back to Sign In</span>
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
