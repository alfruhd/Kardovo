import React, { useState, useEffect } from 'react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import PasswordStrengthMeter from '@/Components/PasswordStrengthMeter';
import KardovoLogo from '@/Components/KardovoLogo';
import WaveBackground from '@/Components/WaveBackground';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
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
    X,
    Users,
    Shield,
    KeyRound,
    AlertTriangle,
    Home
} from 'lucide-react';

export default function Login({ status, canResetPassword, asModal = false, initialMode = 'login' }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
    const [isLogin, setIsLogin] = useState(initialMode === 'login');
    const [selectedRole, setSelectedRole] = useState('customer');
    useEffect(() => {
        setIsLogin(initialMode === 'login');
    }, [initialMode]);

    useEffect(() => {
        document.documentElement.classList.remove('dark');
    }, []);

    const pageProps = usePage()?.props || {};
    const isLocalEnv = Boolean(pageProps.isLocalEnv);
    const formTimestampToken = pageProps.formTimestampToken || '';

    // Retrieve saved dev credentials only in local/testing environment
    const savedEmail = (isLocalEnv && typeof window !== 'undefined') ? (localStorage.getItem('kardovo_dev_email') || '') : '';
    const savedPassword = (isLocalEnv && typeof window !== 'undefined') ? (localStorage.getItem('kardovo_dev_password') || '') : '';

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: savedEmail,
        phone: '',
        password: savedPassword,
        password_confirmation: '',
        remember: true,
        website_url: '',
        _form_rendered_at: formTimestampToken || (Date.now() - 2000),
    });

    useEffect(() => {
        if (formTimestampToken && (!data._form_rendered_at || typeof data._form_rendered_at === 'number')) {
            setData('_form_rendered_at', formTimestampToken);
        }
    }, [formTimestampToken]);

    // Autosave credentials whenever changed (in local environment only)
    const handleEmailChange = (val) => {
        setData('email', val);
        if (isLocalEnv && typeof window !== 'undefined') {
            localStorage.setItem('kardovo_dev_email', val);
        }
    };

    const handlePasswordChange = (val) => {
        setData('password', val);
        if (isLocalEnv && typeof window !== 'undefined') {
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
            id: 'neema', 
            name: 'Neema (Organiser)', 
            email: 'neworganizer@kardovo.com', 
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
        },];

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
        if (isLogin) {
            if (isLocalEnv && typeof window !== 'undefined') {
                localStorage.setItem('kardovo_dev_email', data.email);
                localStorage.setItem('kardovo_dev_password', data.password);
            }
            post(route('login'), {
                onFinish: () => reset('password'),
            });
        } else {
            post(route('register'), {
                onFinish: () => reset('password', 'password_confirmation'),
            });
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        clearErrors();
        reset('password', 'password_confirmation');
    };

    const Container = asModal ? 'div' : 'div';
    const containerClasses = asModal 
        ? "w-full rounded-2xl sm:rounded-[32px] overflow-hidden bg-transparent p-5 sm:p-8 relative z-10 transition-colors duration-300 text-slate-800 min-w-0 mx-auto"
        : `w-full ${isLogin ? 'sm:max-w-lg' : 'sm:max-w-[540px]'} rounded-3xl sm:rounded-[32px] overflow-hidden bg-white/95 backdrop-blur-2xl border border-slate-100 shadow-[0_24px_50px_-12px_rgba(11,37,69,0.18),0_12px_24px_-6px_rgba(11,37,69,0.10),0_0_1px_rgba(11,37,69,0.15)] ${isLogin ? 'p-6 sm:p-8' : 'p-5 sm:p-7'} relative z-10 transition-all duration-300 text-slate-800 min-w-0`;

    const Wrapper = asModal ? 'div' : 'div';
    const wrapperClasses = asModal 
        ? "w-full font-sans text-slate-800 selection:bg-emerald-500 selection:text-white"
        : "fixed inset-0 h-screen h-[100dvh] max-h-screen max-h-[100dvh] w-screen w-[100dvw] max-w-full bg-white flex flex-col items-center justify-center lg:items-end p-3 sm:p-5 lg:p-6 lg:pr-14 xl:pr-24 2xl:pr-32 font-sans text-slate-800 overflow-y-auto overflow-x-hidden selection:bg-emerald-500 selection:text-white transition-colors duration-300";

    return (
        <Wrapper className={wrapperClasses}>
            {!asModal && <Head title="Sign In - Kardovo Platform" />}

            {/* Wave Animated SVG Background */}
            {!asModal && <WaveBackground />}

            {/* 🏠 Floating Top Left Control */}
            {!asModal && (
                <div className="absolute top-3.5 left-3.5 sm:top-6 sm:left-6 z-50">
                    <Link
                        href="/"
                        className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl bg-white/70 hover:bg-white/95 backdrop-blur-xl border border-white/60 text-slate-700 hover:text-emerald-600 transition-all duration-200 active:scale-95 flex items-center gap-2 shadow-sm hover:shadow-md group cursor-pointer"
                        title="Back to Landing Page"
                    >
                        <Home className="w-4 h-4 text-slate-600 group-hover:text-emerald-600 transition-colors" />
                        <span className="text-xs font-bold font-mono">Home</span>
                    </Link>
                </div>
            )}

            {/* Main Auth Container Column */}
            <div className={asModal ? "w-full min-w-0 mx-auto" : `w-full ${isLogin ? 'sm:max-w-lg' : 'sm:max-w-[540px]'} flex flex-col items-center relative z-10 min-w-0 my-auto py-2 sm:py-3 px-1`}>
                <Container className={containerClasses}>
                <div className={`${isLogin ? 'space-y-4 sm:space-y-5' : 'space-y-2.5 sm:space-y-3.5'} w-full min-w-0`}>
                    {/* Header Branding & Title (Centered) */}
                    <div className={`flex flex-col items-center text-center ${isLogin ? 'space-y-2.5 pb-1' : 'space-y-1.5 pb-0'}`}>
                        <div className="flex justify-center">
                            <KardovoLogo light={false} showText={false} imgClassName={isLogin ? "h-10 w-10 sm:h-11 sm:w-11" : "h-8 w-8 sm:h-9 sm:w-9"} size="lg" />
                        </div>
                        <div>
                            <h2 className={`${isLogin ? 'text-xl sm:text-2xl md:text-3xl' : 'text-lg sm:text-xl md:text-2xl'} font-black font-display tracking-tight transition-all duration-300 text-slate-900`}>
                                {isLogin ? 'Sign In to Kardovo' : 'Sign Up to Kardovo'}
                            </h2>
                        </div>
                    </div>

                        {/* ⚡ 1-Click Developer Role Switcher (local environment only) */}
                        {isLogin && isLocalEnv && (
                            <div className="p-2.5 sm:p-3 rounded-2xl border space-y-2 w-full min-w-0 overflow-hidden bg-slate-50/80 border-slate-200/90">
                                <div className="flex items-center justify-between text-[11px] font-bold gap-2 text-slate-700">
                                    <span className="flex items-center gap-1.5 min-w-0">
                                        <Sparkles className="w-3.5 h-3.5 text-sky-600 flex-shrink-0" />
                                        <span className="truncate">Quick Dev Switcher</span>
                                    </span>
                                    <span className="text-[10px] font-mono flex-shrink-0 text-slate-400">password: password</span>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 sm:gap-2 w-full min-w-0 [&>*:last-child]:col-span-2 sm:[&>*:last-child]:col-span-1">
                                {devAccounts.map((acc) => {
                                    const isSelected = data.email === acc.email;
                                    const IconComponent = acc.icon;
                                    return (
                                        <button
                                            key={acc.id}
                                            type="button"
                                            onClick={() => quickFillAccount(acc)}
                                            className={`p-1.5 sm:p-2 rounded-xl border text-left transition-all duration-200 cursor-pointer active:scale-95 flex flex-col justify-between min-w-0 w-full overflow-hidden ${
                                                isSelected
                                                    ? 'bg-sky-50 border-sky-400 text-sky-900 shadow-xs ring-2 ring-sky-500/20 font-black'
                                                    : 'bg-white hover:bg-slate-100/80 border-slate-200 text-slate-700 hover:border-slate-300 font-semibold shadow-2xs'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between w-full min-w-0 gap-1">
                                                <span className="text-[10px] sm:text-[10.5px] font-bold truncate block">{acc.name}</span>
                                                {isSelected && <Check className="w-3 h-3 text-sky-600 stroke-[3] flex-shrink-0" />}
                                            </div>
                                            <span className="text-[9px] sm:text-[9.5px] font-mono mt-0.5 truncate block w-full text-slate-400">
                                                {acc.email.split('@')[0]}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        )}

                        {status && (
                            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                <span>{status}</span>
                            </div>
                        )}

                        {/* Sign In Form */}
                        <form onSubmit={submit} className="space-y-4">
                            {/* Invisible Bot Honeypot */}
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

                            {/* Prominent Error Alert on Top of Input Fields */}
                            {(errors.email || errors.password || errors.general) && (
                                <div className="p-3.5 rounded-2xl border backdrop-blur-md flex items-start gap-3 text-xs animate-shake shadow-xs bg-rose-50 border-rose-200 text-rose-800">
                                    <div className="w-6 h-6 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 border bg-rose-100 text-rose-600 border-rose-200">
                                        <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5]" />
                                    </div>
                                    <div className="space-y-0.5 text-left">
                                        <div className="font-bold text-xs text-rose-900">
                                            Something went wrong.
                                        </div>
                                        <div className="font-medium text-[11.5px] leading-relaxed text-rose-700">
                                            {errors.email || errors.password || errors.general || 'These credentials do not match our records.'}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!isLogin && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                    <InputLabel htmlFor="name" value="Full Name *" className="text-slate-700 font-bold text-xs tracking-wider uppercase mb-1" />
                                    <div className="relative mt-1">
                                        <UserCheck className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                                        <TextInput
                                            id="name"
                                            type="text"
                                            name="name"
                                            variant="default"
                                            value={data.name}
                                            className="block w-full text-xs font-medium pl-10 py-2.5 rounded-2xl"
                                            autoComplete="name"
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="e.g. Salim Juma"
                                            required={!isLogin}
                                        />
                                    </div>
                                    {errors.name && <p className="mt-1 text-[11px] font-medium text-rose-500">{errors.name}</p>}
                                </div>
                            )}

                            {!isLogin ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <InputLabel htmlFor="email" value="Email Address" className="text-slate-700 font-bold text-xs tracking-wider uppercase" />
                                        </div>
                                        <div className="relative mt-1">
                                            {(!data.email || data.email.includes('@')) ? (
                                                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                                            ) : (
                                                <Smartphone className="w-4 h-4 text-sky-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                            )}
                                            <TextInput
                                                id="email"
                                                type="email"
                                                name="email"
                                                variant="default"
                                                value={data.email}
                                                className="block w-full text-xs font-medium pl-10 py-2.5 rounded-2xl"
                                                autoComplete="email"
                                                onChange={(e) => handleEmailChange(e.target.value)}
                                                placeholder="name@email.com"
                                                required={!data.phone}
                                            />
                                        </div>
                                        {errors.email && <p className="mt-1 text-[11px] font-medium text-rose-500">{errors.email}</p>}
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <InputLabel htmlFor="phone" value="Phone Number" className="text-slate-700 font-bold text-xs tracking-wider uppercase" />
                                        </div>
                                        <div className="relative mt-1">
                                            <Smartphone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                                            <TextInput
                                                id="phone"
                                                type="tel"
                                                name="phone"
                                                variant="default"
                                                value={data.phone}
                                                className="block w-full text-xs font-medium pl-10 py-2.5 rounded-2xl"
                                                autoComplete="tel"
                                                onChange={(e) => setData('phone', e.target.value)}
                                                placeholder="07XXXXXXXX"
                                                required={!data.email}
                                            />
                                        </div>
                                        {errors.phone && <p className="mt-1 text-[11px] font-medium text-rose-500">{errors.phone}</p>}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <InputLabel htmlFor="email" value="Email or Phone Number *" className="text-slate-700 font-bold text-xs tracking-wider uppercase" />
                                    </div>
                                    <div className="relative mt-1">
                                        {(!data.email || data.email.includes('@')) ? (
                                            <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
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
                                            onChange={(e) => handleEmailChange(e.target.value)}
                                            placeholder="name@email.com or 07XXXXXXXX"
                                            required
                                        />
                                    </div>
                                    {errors.email && <p className="mt-1 text-[11px] font-medium text-rose-500">{errors.email}</p>}
                                </div>
                            )}

                            {!isLogin ? (
                                <div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                                        <div>
                                            <InputLabel htmlFor="password" value="Password *" className="text-slate-700 font-bold text-xs tracking-wider uppercase mb-1" />
                                            <div className="relative mt-1">
                                                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                                                <TextInput
                                                    id="password"
                                                    type={showPassword ? 'text' : 'password'}
                                                    name="password"
                                                    variant="default"
                                                    value={data.password}
                                                    className="block w-full text-xs font-medium pl-10 pr-10 py-2.5 rounded-2xl"
                                                    autoComplete="new-password"
                                                    onChange={(e) => handlePasswordChange(e.target.value)}
                                                    placeholder="••••••••••••"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 cursor-pointer focus:outline-none transition text-slate-400 hover:text-slate-600"
                                                    title={showPassword ? 'Hide password' : 'Show password'}
                                                >
                                                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                            {errors.password && <p className="mt-1 text-[11px] font-medium text-rose-500">{errors.password}</p>}
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="password_confirmation" value="Confirm Password *" className="text-slate-700 font-bold text-xs tracking-wider uppercase mb-1" />
                                            <div className="relative mt-1">
                                                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                                                <TextInput
                                                    id="password_confirmation"
                                                    type={showPasswordConfirm ? 'text' : 'password'}
                                                    name="password_confirmation"
                                                    variant="default"
                                                    value={data.password_confirmation}
                                                    className="block w-full text-xs font-medium pl-10 pr-10 py-2.5 rounded-2xl"
                                                    autoComplete="new-password"
                                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                                    placeholder="••••••••••••"
                                                    required={!isLogin}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 cursor-pointer focus:outline-none transition text-slate-400 hover:text-slate-600"
                                                    title={showPasswordConfirm ? 'Hide password' : 'Show password'}
                                                >
                                                    {showPasswordConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                            {errors.password_confirmation && <p className="mt-1 text-[11px] font-medium text-rose-500">{errors.password_confirmation}</p>}
                                        </div>
                                    </div>

                                    {/* Password Strength Meter */}
                                    <PasswordStrengthMeter password={data.password} dark={false} />

                                    {/* Password match check */}
                                    {data.password && data.password_confirmation && (
                                        <div className="flex items-center gap-1.5 mt-1.5 text-[11px] font-semibold">
                                            {data.password === data.password_confirmation ? (
                                                <span className="text-emerald-600 flex items-center gap-1">
                                                    <Check className="w-3.5 h-3.5 stroke-[3]" /> Passwords match
                                                </span>
                                            ) : (
                                                <span className="text-rose-500 flex items-center gap-1">
                                                    <X className="w-3.5 h-3.5 stroke-[2.5]" /> Passwords do not match
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <InputLabel htmlFor="password" value="Password *" className="text-slate-700 font-bold text-xs tracking-wider uppercase mb-1" />
                                    <div className="relative mt-1">
                                        <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                                        <TextInput
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            variant="default"
                                            value={data.password}
                                            className="block w-full text-xs font-medium pl-10 pr-10 py-3 rounded-2xl"
                                            autoComplete="current-password"
                                            onChange={(e) => handlePasswordChange(e.target.value)}
                                            placeholder="••••••••••••"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 cursor-pointer focus:outline-none transition text-slate-400 hover:text-slate-600"
                                            title={showPassword ? 'Hide password' : 'Show password'}
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="mt-1 text-[11px] font-medium text-rose-500">{errors.password}</p>}
                                </div>
                            )}

                            {isLogin && (
                                <div className="flex items-center justify-between pt-1">
                                    <label className="flex items-center cursor-pointer select-none">
                                        <Checkbox
                                            name="remember"
                                            checked={data.remember}
                                            onChange={(e) => setData('remember', e.target.checked)}
                                            className="rounded-lg bg-white border-slate-300 text-sky-600 focus:ring-sky-500"
                                        />
                                        <span className="ms-2 text-xs font-medium text-slate-600">
                                            Remember this device
                                        </span>
                                    </label>
                                    <Link
                                        href={route('password.request')}
                                        className="text-xs font-semibold cursor-pointer transition hover:underline text-sky-700 hover:text-sky-900"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                            )}

                            <div className={isLogin ? "pt-2" : "pt-1"}>
                                <PrimaryButton 
                                    className={`w-full justify-center ${isLogin ? 'py-3.5' : 'py-3'} bg-gradient-to-r from-[#154F7C] to-[#327FB5] hover:from-[#1A5C91] hover:to-[#3D8EC7] text-white text-xs font-black rounded-2xl shadow-lg shadow-[#154F7C]/25 transition active:scale-[0.98] gap-2 tracking-wide uppercase cursor-pointer border border-sky-500/20`} 
                                    disabled={processing}
                                >
                                    <span>{processing ? (isLogin ? "Authorizing..." : "Creating Account...") : (isLogin ? "Sign In" : "Create Account")}</span>
                                    <ArrowRight className="w-4 h-4 text-white" />
                                </PrimaryButton>
                            </div>

                            <div className={isLogin ? "pt-3 text-center" : "pt-2 text-center"}>
                                <p className="text-xs font-medium text-slate-500">
                                    {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                                    <button type="button" onClick={toggleMode} className="font-bold hover:underline cursor-pointer transition ml-1 text-sky-700 hover:text-sky-900">
                                        {isLogin ? "Sign Up" : "Sign in here"}
                                    </button>
                                </p>
                            </div>

                            {/* Terms of Service & Privacy Policy Notice */}
                            <div className={isLogin ? "pt-2 text-center" : "pt-1 text-center"}>
                                <p className="text-[11px] font-normal leading-relaxed text-slate-400">
                                    By signing {isLogin ? 'in' : 'up'}, you agree to Kardovo’s{' '}
                                    <Link href="/terms" className="font-medium underline transition text-slate-600 hover:text-sky-700">
                                        Terms & Conditions
                                    </Link>{' '}
                                    and{' '}
                                    <Link href="/privacy" className="font-medium underline transition text-slate-600 hover:text-sky-700">
                                        Privacy Policy
                                    </Link>.
                                </p>
                            </div>
                        </form>
                </div>
            </Container>

            {!asModal && (
                <div className={`${isLogin ? 'mt-5' : 'mt-3 sm:mt-4'} text-center text-[11px] font-mono text-slate-500 flex items-center justify-center gap-2 tracking-wider select-none shrink-0`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>KARDOVO ACCESS &amp; SECURITY</span>
                    <span className="text-emerald-600 font-bold">&bull;</span>
                    <span className="text-emerald-600 font-medium">ENCRYPTED</span>
                </div>
            )}
            </div>
        </Wrapper>
    );
}
