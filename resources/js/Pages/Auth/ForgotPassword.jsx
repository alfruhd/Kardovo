import React, { useState } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Mail, Smartphone, ArrowRight, ArrowLeft, ShieldCheck, KeyRound, Check } from 'lucide-react';

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
            <Head title="Forgot Password - Kardovo" />

            <div className="text-center mb-6">
                <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <KeyRound className="w-6 h-6 text-[#16A34A]" />
                </div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                    Reset Your Password
                </h1>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                    Enter your registered email address or phone number, then choose where to receive your 6-digit security code.
                </p>
            </div>

            {status && (
                <div className="mb-5 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{status}</span>
                </div>
            )}

            {error && (
                <div className="mb-5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800">
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
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                            Send Code Via
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">User preference</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                        <button
                            type="button"
                            onClick={() => handleChannelSelect('sms')}
                            className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                                selectedChannel === 'sms'
                                    ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20 shadow-sm'
                                    : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <Smartphone className={`w-4 h-4 ${selectedChannel === 'sms' ? 'text-emerald-600' : 'text-slate-400'}`} />
                                {selectedChannel === 'sms' && (
                                    <span className="w-4 h-4 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                                    </span>
                                )}
                            </div>
                            <div>
                                <div className="text-xs font-black text-slate-800">Phone (SMS)</div>
                                <div className="text-[10px] text-slate-500 leading-tight mt-0.5">Direct SMS text</div>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleChannelSelect('email')}
                            className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                                selectedChannel === 'email'
                                    ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20 shadow-sm'
                                    : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <Mail className={`w-4 h-4 ${selectedChannel === 'email' ? 'text-emerald-600' : 'text-slate-400'}`} />
                                {selectedChannel === 'email' && (
                                    <span className="w-4 h-4 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                                    </span>
                                )}
                            </div>
                            <div>
                                <div className="text-xs font-black text-slate-800">Email Address</div>
                                <div className="text-[10px] text-slate-500 leading-tight mt-0.5">Inbox email code</div>
                            </div>
                        </button>
                    </div>
                </div>

                <div className="pt-2">
                    <PrimaryButton
                        className="w-full justify-center py-3 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-black rounded-2xl shadow-md transition active:scale-[0.98] gap-2 tracking-wide uppercase cursor-pointer"
                        disabled={processing || !data.email}
                    >
                        <span>{processing ? 'Sending Code...' : 'Send Verification Code'}</span>
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
