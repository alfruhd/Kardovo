import React, { useState } from 'react';
import Checkbox from '@/Components/Checkbox';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import KardovoLogo from '@/Components/KardovoLogo';
import { Head, Link, useForm } from '@inertiajs/react';
import { useTheme } from '@/Hooks/useTheme';
import { 
    ShieldCheck, 
    QrCode, 
    Lock, 
    Mail, 
    Eye, 
    EyeOff, 
    ArrowRight, 
    Sparkles, 
    CheckCircle2, 
    Zap, 
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
            <div className="w-full max-w-5xl rounded-[32px] overflow-hidden backdrop-blur-2xl bg-white dark:bg-[#0B1524]/90 border border-slate-200/80 dark:border-white/[0.08] shadow-[0_25px_70px_rgba(0,0,0,0.08)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.6)] grid grid-cols-1 lg:grid-cols-12 relative z-10 transition-colors duration-300">
                
                {/* ═══════════════════════════════════════════════════════════ */}
                {/* LEFT HERO BRANDING STAGE (Desktop Only - Hidden on Mobile)  */}
                {/* ═══════════════════════════════════════════════════════════ */}
                <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-[#091322] via-[#0A1A30] to-[#060F1A] p-8 sm:p-10 flex-col justify-between border-r border-white/[0.08] relative overflow-hidden">
                    {/* Ambient Glow in Left Panel */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/15 blur-3xl pointer-events-none" />

                    <div className="space-y-8 relative z-10">
                        {/* Logo */}
                        <div>
                            <KardovoLogo light showText={true} />
                            <p className="text-xs text-slate-400 font-medium mt-2 leading-relaxed">
                                Enterprise digital event invitation passes, WhatsApp RSVP dispatch & sub-second offline gate access control.
                            </p>
                        </div>

                        {/* Feature Badges */}
                        <div className="space-y-3.5 pt-2">
                            <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm">
                                <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Zap className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-white">Interactive WhatsApp RSVPs</div>
                                    <div className="text-[11px] text-slate-400 leading-normal mt-0.5">Zero-app 1-tap pass delivery with automated attendance syncing.</div>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm">
                                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <QrCode className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-white">Sub-Second Gate Verification</div>
                                    <div className="text-[11px] text-slate-400 leading-normal mt-0.5">Rapid camera & laser barcode scanning with duplicate entry lock.</div>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm">
                                <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-400/30 text-purple-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Sparkles className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-white">4K Dynamic Pass Studio</div>
                                    <div className="text-[11px] text-slate-400 leading-normal mt-0.5">High-definition personalized vector invitation card renderer.</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Security Footer */}
                    <div className="pt-8 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-slate-400 relative z-10">
                        <span className="flex items-center gap-1.5 font-mono text-[10.5px]">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            <span>AES-256 Multi-Tenant</span>
                        </span>
                        <span className="text-[10.5px] font-mono text-slate-500">v2.4.0 Live</span>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* RIGHT AUTHENTICATION PANEL (Full Width on Mobile)            */}
                {/* ═══════════════════════════════════════════════════════════ */}
                <div className="lg:col-span-7 bg-white dark:bg-[#091322] p-6 sm:p-10 lg:p-12 flex flex-col justify-between text-slate-800 dark:text-slate-100 transition-colors duration-300">
                    <div className="space-y-6">
                        {/* Mobile-Only Header Branding */}
                        <div className="lg:hidden flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.08]">
                            <KardovoLogo light={isDark} showText={true} />
                            <span className="px-2.5 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/40 text-cyan-700 dark:text-cyan-300 text-[10px] font-mono font-extrabold uppercase">
                                Portal Sign In
                            </span>
                        </div>

                        <div>
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display tracking-tight">
                                Sign In to Kardovo
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                                Enter your email and password to access your account.
                            </p>
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
                                            Something went wrong.
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
                                        className="block w-full text-xs font-mono font-bold pl-10 py-3 rounded-2xl"
                                        autoComplete="username"
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="name@company.com"
                                        required
                                        autoFocus
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
                                            Forgot password?
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
                                        className="block w-full text-xs font-mono pl-10 pr-10 py-3 rounded-2xl"
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

                            <div className="flex items-center justify-between pt-1">
                                <label className="flex items-center cursor-pointer select-none">
                                    <Checkbox
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="rounded-lg text-cyan-600 focus:ring-cyan-500"
                                    />
                                    <span className="ms-2 text-xs text-slate-600 dark:text-slate-300 font-semibold">
                                        Remember this device
                                    </span>
                                </label>
                            </div>

                            <div className="pt-2">
                                <PrimaryButton 
                                    className="w-full justify-center py-3.5 bg-kardovo-navy hover:bg-slate-900 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-xs font-black rounded-2xl shadow-lg transition active:scale-[0.98] gap-2 tracking-wide uppercase cursor-pointer" 
                                    disabled={processing}
                                >
                                    <span>{processing ? "Authorizing..." : "Sign In to Account"}</span>
                                    <ArrowRight className="w-4 h-4 text-cyan-400 dark:text-white" />
                                </PrimaryButton>
                            </div>

                            {/* Terms of Service & Privacy Policy Notice */}
                            <div className="pt-3 text-center">
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
        </div>
    );
}

