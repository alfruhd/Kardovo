import React, { useState } from 'react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import KardovoLogo from '@/Components/KardovoLogo';
import { Head, Link, useForm } from '@inertiajs/react';
import { useTheme } from '@/Hooks/useTheme';
import { 
    Lock, 
    Mail, 
    Eye, 
    EyeOff, 
    ArrowRight, 
    CheckCircle2, 
    Smartphone, 
    Sun,
    Moon,
    AlertTriangle
} from 'lucide-react';

export default function Login({ status, canResetPassword }) {
    const [showPassword, setShowPassword] = useState(false);
    const { theme, isDark, toggleTheme } = useTheme();

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: true,
        verify_via_sms: true,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen bg-[#F4F6F9] dark:bg-[#070D18] flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans text-slate-800 dark:text-slate-100 relative overflow-hidden selection:bg-cyan-500 selection:text-white transition-colors duration-300">
            <Head title="Sign In - Kardovo Platform" />

            {/* 🌓 Floating Light / Dark Mode Toggle Button */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50">
                <button
                    type="button"
                    onClick={toggleTheme}
                    className="px-3.5 py-2 rounded-2xl bg-white/80 dark:bg-[#0B1524]/80 backdrop-blur-xl border border-slate-200/90 dark:border-white/[0.08] text-slate-700 dark:text-slate-200 transition-all duration-200 active:scale-95 flex items-center gap-2 shadow-lg hover:shadow-xl group cursor-pointer"
                    title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                    {isDark ? (
                        <>
                            <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
                            <span className="text-xs font-bold font-mono">Light Mode</span>
                        </>
                    ) : (
                        <>
                            <Moon className="w-4 h-4 text-cyan-600 group-hover:-rotate-12 transition-transform duration-300" />
                            <span className="text-xs font-bold font-mono">Dark Mode</span>
                        </>
                    )}
                </button>
            </div>

            {/* Ambient Background Radial Glows */}
            <div className="absolute -top-40 -left-40 w-[550px] h-[550px] bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-40 -right-40 w-[550px] h-[550px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

            {/* Main Auth Container */}
            <div className="w-full max-w-md rounded-[28px] overflow-hidden backdrop-blur-2xl bg-white dark:bg-[#0B1524]/95 border border-slate-200/80 dark:border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] p-6 sm:p-9 relative z-10 transition-colors duration-300">
                <div className="space-y-5">
                    {/* Header Branding & Title */}
                    <div className="flex flex-col items-center text-center space-y-3 pb-1">
                        <div className="flex justify-center">
                            <KardovoLogo light={isDark} showText={true} stacked={true} imgClassName="h-11 w-11" size="lg" />
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight">
                                Sign In to Kardovo
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Enter your credentials to access your account.
                            </p>
                        </div>
                    </div>

                    {status && (
                        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl text-xs font-bold text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                            <span>{status}</span>
                        </div>
                    )}

                    {/* Sign In Form */}
                    <form onSubmit={submit} className="space-y-4">
                        {/* Prominent Error Alert on Top of Input Fields */}
                        {(errors.email || errors.password || errors.general) && (
                            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/70 flex items-start gap-3 text-xs animate-shake shadow-xs">
                                <div className="w-6 h-6 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5]" />
                                </div>
                                <div className="space-y-0.5 text-left">
                                    <div className="font-black text-rose-900 dark:text-rose-200 text-xs">
                                        Authentication Failed
                                    </div>
                                    <div className="text-rose-700 dark:text-rose-300 font-medium text-[11.5px] leading-relaxed">
                                        {errors.email || errors.password || errors.general || 'These credentials do not match our records.'}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <InputLabel htmlFor="email" value="Email Address *" />
                            <div className="relative mt-1">
                                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="block w-full text-xs font-mono font-bold pl-10 py-2.5 rounded-2xl"
                                    autoComplete="username"
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="name@company.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <InputLabel htmlFor="password" value="Password *" />
                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
                                    >
                                        Forgot Password?
                                    </Link>
                                )}
                            </div>
                            <div className="relative mt-1">
                                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <TextInput
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={data.password}
                                    className="block w-full text-xs font-mono pl-10 pr-10 py-2.5 rounded-2xl"
                                    autoComplete="current-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1.5 border-t border-slate-100 dark:border-white/[0.05]">
                            <label className="flex items-center cursor-pointer select-none">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="rounded-lg text-cyan-600 focus:ring-cyan-500"
                                />
                                <span className="ms-2 text-xs text-slate-600 dark:text-slate-300 font-semibold">
                                    Remember device
                                </span>
                            </label>

                            <label className="flex items-center cursor-pointer select-none">
                                <Checkbox
                                    name="verify_via_sms"
                                    checked={data.verify_via_sms}
                                    onChange={(e) => setData('verify_via_sms', e.target.checked)}
                                    className="rounded-lg text-emerald-600 focus:ring-emerald-500"
                                />
                                <span className="ms-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                                    <Smartphone className="w-3.5 h-3.5" />
                                    <span>Send verification code via SMS</span>
                                </span>
                            </label>
                        </div>

                        <div className="pt-2">
                            <PrimaryButton 
                                className="w-full justify-center py-3.5 bg-kardovo-navy hover:bg-slate-900 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-xs font-black rounded-2xl shadow-lg transition active:scale-[0.98] gap-2 tracking-wide uppercase cursor-pointer" 
                                disabled={processing}
                            >
                                <span>{processing ? "Authorizing..." : "Authorize & Sign In"}</span>
                                <ArrowRight className="w-4 h-4 text-cyan-400 dark:text-white" />
                            </PrimaryButton>
                        </div>

                        {/* Terms of Service & Privacy Policy Notice */}
                        <div className="pt-2 text-center">
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                                By signing in, you agree to Kardovo’s{' '}
                                <Link href="/terms" className="font-bold text-kardovo-blue-dark dark:text-cyan-400 hover:underline">
                                    Terms & Conditions
                                </Link>{' '}
                                and{' '}
                                <Link href="/privacy" className="font-bold text-kardovo-blue-dark dark:text-cyan-400 hover:underline">
                                    Privacy Policy
                                </Link>.
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
