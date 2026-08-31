import React, { useState, useEffect } from 'react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import KardovoLogo from '@/Components/KardovoLogo';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useTheme } from '@/Hooks/useTheme';
import { 
    ShieldCheck, 
    UserCheck, 
    QrCode, 
    Lock, 
    Mail, 
    Eye, 
    EyeOff, 
    ArrowRight, 
    Sparkles, 
    CheckCircle2, 
    Zap, 
    Smartphone, 
    Ticket,
    Sun,
    Moon,
    Check,
    Users,
    Shield,
    KeyRound,
    AlertTriangle
} from 'lucide-react';

export default function Login({ status, canResetPassword }) {
    const [showPassword, setShowPassword] = useState(false);
    const [selectedRole, setSelectedRole] = useState('customer');
    const { theme, isDark, toggleTheme } = useTheme();

    // Retrieve saved dev credentials from localStorage fallback
    const savedEmail = typeof window !== 'undefined' ? (localStorage.getItem('kardovo_dev_email') || 'alfredido6@gmail.com') : 'alfredido6@gmail.com';
    const savedPassword = typeof window !== 'undefined' ? (localStorage.getItem('kardovo_dev_password') || 'password') : 'password';

    const { data, setData, post, processing, errors, reset } = useForm({
        email: savedEmail,
        password: savedPassword,
        remember: true,
    });

    // Autosave credentials whenever changed
    const handleEmailChange = (val) => {
        setData('email', val);
        if (typeof window !== 'undefined') {
            localStorage.setItem('kardovo_dev_email', val);
        }
    };

    const handlePasswordChange = (val) => {
        setData('password', val);
        if (typeof window !== 'undefined') {
            localStorage.setItem('kardovo_dev_password', val);
        }
    };

    // Pre-configured developer credentials
    const devAccounts = [
        { 
            id: 'customer', 
            name: 'Alfred (Organiser)', 
            email: 'alfredido6@gmail.com', 
            password: 'password', 
            badge: '👔 Customer / Organiser', 
            icon: Users,
            desc: 'Manage events, attendees, passes & WhatsApp dispatch'
        },
        { 
            id: 'admin', 
            name: 'Administrator', 
            email: 'admin@kardovo.com', 
            password: 'password', 
            badge: '🛡️ Super Admin', 
            icon: Shield,
            desc: 'System governance, gateway configs & telemetry'
        },
        {
            id: 'subadmin',
            name: 'Sarah (Sub Admin)',
            email: 'subadmin@kardovo.com',
            password: 'password',
            badge: '👥 Sub Admin',
            icon: Users,
            desc: 'Delegated oversight for assigned organisers and event campaigns'
        },
        { 
            id: 'scanner1', 
            name: 'Gate 1 Scanner', 
            email: 'scanner1@kardovo.com', 
            password: 'password', 
            badge: '📱 VIP Gate Staff', 
            icon: Smartphone,
            desc: 'Gate 1 — Main VIP Entrance pass scanner app'
        },
        { 
            id: 'scanner2', 
            name: 'Gate 2 Scanner', 
            email: 'scanner2@kardovo.com', 
            password: 'password', 
            badge: '📱 North Gate Staff', 
            icon: Smartphone,
            desc: 'Gate 2 — North Wing Entrance pass scanner app'
        }
    ];

    const quickFillAccount = (acc) => {
        setSelectedRole(acc.id);
        setData('email', acc.email);
        setData('password', acc.password);
        if (typeof window !== 'undefined') {
            localStorage.setItem('kardovo_dev_email', acc.email);
            localStorage.setItem('kardovo_dev_password', acc.password);
        }
    };

    const directLoginAs = (acc, e) => {
        if (e) e.stopPropagation();
        if (typeof window !== 'undefined') {
            localStorage.setItem('kardovo_dev_email', acc.email);
            localStorage.setItem('kardovo_dev_password', acc.password);
        }
        router.post(route('login'), {
            email: acc.email,
            password: acc.password,
            remember: true,
        });
    };

    const submit = (e) => {
        e.preventDefault();
        // Ensure latest values are saved in localStorage
        if (typeof window !== 'undefined') {
            localStorage.setItem('kardovo_dev_email', data.email);
            localStorage.setItem('kardovo_dev_password', data.password);
        }
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
            <div className="w-full max-w-xl rounded-[28px] overflow-hidden backdrop-blur-2xl bg-white dark:bg-[#0B1524]/95 border border-slate-200/80 dark:border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] p-6 sm:p-9 relative z-10 transition-colors duration-300">
                <div className="space-y-4 sm:space-y-5">
                    {/* Header Branding & Title (Centered) */}
                    <div className="flex flex-col items-center text-center space-y-3 pb-1">
                        <div className="flex justify-center">
                            <KardovoLogo light={isDark} showText={true} stacked={true} imgClassName="h-11 w-11" size="lg" />
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white font-display tracking-tight">
                                Sign In to Kardovo
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Enter your credentials or choose a quick development profile.
                            </p>
                        </div>
                    </div>

                        {/* ⚡ 1-Click Developer Role Switcher */}
                        <div className="p-3.5 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-slate-200 dark:border-white/[0.08] space-y-2">
                            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300">
                                <span className="flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                                    <span>Quick Development Switcher (1-Click Fill)</span>
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">password: password</span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                                {devAccounts.map((acc) => {
                                    const isSelected = data.email === acc.email;
                                    const IconComponent = acc.icon;
                                    return (
                                        <button
                                            key={acc.id}
                                            type="button"
                                            onClick={() => quickFillAccount(acc)}
                                            className={`p-2 rounded-xl border text-left transition-all duration-200 cursor-pointer active:scale-95 flex flex-col justify-between ${
                                                isSelected
                                                    ? 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-500 dark:border-cyan-400 text-cyan-900 dark:text-cyan-100 shadow-sm ring-1 ring-cyan-500/30'
                                                    : 'bg-white dark:bg-[#0B1524] border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between w-full">
                                                <span className="text-[10.5px] font-extrabold truncate">{acc.name}</span>
                                                {isSelected && <Check className="w-3 h-3 text-cyan-600 dark:text-cyan-400 stroke-[3] flex-shrink-0" />}
                                            </div>
                                            <span className="text-[9.5px] font-mono text-slate-400 dark:text-slate-500 mt-1 truncate">
                                                {acc.email.split('@')[0]}
                                            </span>
                                        </button>
                                    );
                                })}
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
                                        className="block w-full text-xs font-mono font-bold pl-10 py-2.5 rounded-2xl"
                                        autoComplete="username"
                                        onChange={(e) => handleEmailChange(e.target.value)}
                                        placeholder="name@company.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <InputLabel htmlFor="password" value="Password *" />
                                <div className="relative mt-1">
                                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <TextInput
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={data.password}
                                        className="block w-full text-xs font-mono pl-10 pr-10 py-2.5 rounded-2xl"
                                        autoComplete="current-password"
                                        onChange={(e) => handlePasswordChange(e.target.value)}
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

