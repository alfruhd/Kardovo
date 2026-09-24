import React, { useState } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Mail, Smartphone, ArrowRight, ArrowLeft } from 'lucide-react';

export default function ForgotPassword({ status, error }) {
    const [selectedChannel, setSelectedChannel] = useState('sms');

    const { data, setData, post, processing, errors } = useForm({
        email: '',
        delivery_method: 'sms',
    });

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

            {/* Clean, Simple Header */}
            <div className="mb-5 text-center">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                    Reset Password
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                    Enter your email or phone to receive a 6-digit verification code
                </p>
            </div>

            {status && (
                <div className="mb-4 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl text-center">
                    {status}
                </div>
            )}

            {error && (
                <div className="mb-4 text-xs font-semibold text-rose-800 bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl text-center">
                    {error}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="email" value="Email or Phone Number *" />
                    <div className="relative mt-1">
                        {isEmailInput ? (
                            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        ) : (
                            <Smartphone className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        )}
                        <TextInput
                            id="email"
                            type="text"
                            name="email"
                            value={data.email}
                            className="block w-full text-xs font-mono font-bold pl-10 py-2.5 rounded-2xl"
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
                        <InputLabel value="Send Code To" />
                        <span className="text-[10.5px] text-slate-400">Preferred channel</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => handleChannelSelect('sms')}
                            className={`p-2.5 rounded-2xl border text-center transition cursor-pointer flex items-center justify-center gap-2 ${
                                selectedChannel === 'sms'
                                    ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 font-bold shadow-xs'
                                    : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                            }`}
                        >
                            <Smartphone className={`w-3.5 h-3.5 ${selectedChannel === 'sms' ? 'text-emerald-600' : 'text-slate-400'}`} />
                            <span className="text-xs">SMS / Phone</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleChannelSelect('email')}
                            className={`p-2.5 rounded-2xl border text-center transition cursor-pointer flex items-center justify-center gap-2 ${
                                selectedChannel === 'email'
                                    ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 font-bold shadow-xs'
                                    : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                            }`}
                        >
                            <Mail className={`w-3.5 h-3.5 ${selectedChannel === 'email' ? 'text-emerald-600' : 'text-slate-400'}`} />
                            <span className="text-xs">Email</span>
                        </button>
                    </div>
                </div>

                <div className="pt-2">
                    <PrimaryButton
                        className="w-full justify-center py-3 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-black rounded-2xl shadow-md transition active:scale-[0.98] gap-2 tracking-wide uppercase cursor-pointer disabled:opacity-50"
                        disabled={processing || !data.email}
                    >
                        <span>{processing ? 'Sending Code...' : 'Send Verification Code'}</span>
                        <ArrowRight className="w-4 h-4 text-white" />
                    </PrimaryButton>
                </div>

                <div className="pt-1 text-center">
                    <Link
                        href={route('login')}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back to Sign In</span>
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
