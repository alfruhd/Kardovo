import React, { useState, useEffect } from 'react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import PasswordStrengthMeter from '@/Components/PasswordStrengthMeter';
import KardovoLogo from '@/Components/KardovoLogo';
import { Head, Link, useForm, router } from '@inertiajs/react';
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

    // Retrieve saved dev credentials from localStorage fallback
    const savedEmail = typeof window !== 'undefined' ? (localStorage.getItem('kardovo_dev_email') || 'alfredido6@gmail.com') : 'alfredido6@gmail.com';
    const savedPassword = typeof window !== 'undefined' ? (localStorage.getItem('kardovo_dev_password') || 'password') : 'password';

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
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
            if (typeof window !== 'undefined') {
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
        ? "w-full max-w-xl rounded-[28px] overflow-hidden backdrop-blur-2xl bg-white #0B1524]/95 border border-slate-200/80 .08] p-6 sm:p-9 relative z-10 transition-colors duration-300"
        : "w-full max-w-xl rounded-[28px] overflow-hidden backdrop-blur-2xl bg-white #0B1524]/95 border border-slate-200/80 .08] shadow-[0_20px_60px_rgba(0,0,0,0.06)] _20px_60px_rgba(0,0,0,0.5)] p-6 sm:p-9 relative z-10 transition-colors duration-300";

    const Wrapper = asModal ? 'div' : 'div';
    const wrapperClasses = asModal 
        ? "w-full font-sans text-slate-800  selection:bg-cyan-500 selection:text-white"
        : "min-h-screen bg-[#F4F6F9] #070D18] flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans text-slate-800  relative overflow-hidden selection:bg-cyan-500 selection:text-white transition-colors duration-300";

    return (
        <Wrapper className={wrapperClasses}>
            {!asModal && <Head title="Sign In - Kardovo Platform" />}

            {/* 🏠 Floating Top Left Control */}
            {!asModal && (
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-50">
                    <Link
                        href="/"
                        className="px-3.5 py-2 rounded-2xl bg-white/80 #0B1524]/80 backdrop-blur-xl border border-slate-200/90 .08] text-slate-700  transition-all duration-200 active:scale-95 flex items-center gap-2 shadow-lg hover:shadow-xl hover:text-[#16A34A] :text-emerald-400 group cursor-pointer"
                        title="Back to Landing Page"
                    >
                        <Home className="w-4 h-4 text-slate-400 group-hover:text-[#16A34A] :text-emerald-400 transition-colors" />
                        <span className="text-xs font-bold font-mono">Home</span>
                    </Link>
                </div>
            )}

            

            {/* Ambient Background Radial Glows */}
            {!asModal && (
                <>
                    <div className="absolute -top-40 -left-40 w-[550px] h-[550px] bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />
                    <div className="absolute -bottom-40 -right-40 w-[550px] h-[550px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />
                    <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
                </>
            )}

            {/* Main Auth Container */}
            <Container className={containerClasses}>
                <div className="space-y-4 sm:space-y-5">
                    {/* Header Branding & Title (Centered) */}
                    <div className="flex flex-col items-center text-center space-y-3 pb-1">
                        <div className="flex justify-center">
                            <KardovoLogo light={false} showText={true} stacked={true} imgClassName="h-11 w-11" size="lg" />
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900  font-display tracking-tight transition-all duration-300">
                                {isLogin ? 'Sign In to Kardovo' : 'Sign Up to Kardovo'}
                            </h2>
                            <p className="text-xs text-slate-500  mt-1 transition-all duration-300">
                                {isLogin ? 'Enter your credentials or choose a quick development profile.' : 'Join Kardovo to manage events, attendees, passes & more.'}
                            </p>
                        </div>
                    </div>

                        {/* ⚡ 1-Click Developer Role Switcher */}
                        {isLogin && (
                            <div className="p-3.5 bg-slate-50 .03] rounded-2xl border border-slate-200 .08] space-y-2">
                                <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 ">
                                    <span className="flex items-center gap-1.5">
                                        <Sparkles className="w-3.5 h-3.5 text-cyan-600 " />
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
                                                    ? 'bg-cyan-50  border-cyan-500  text-cyan-900  shadow-sm ring-1 ring-cyan-500/30'
                                                    : 'bg-white #0B1524] border-slate-200 .08] text-slate-700  hover:border-slate-300 :border-white/20'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between w-full">
                                                <span className="text-[10.5px] font-extrabold truncate">{acc.name}</span>
                                                {isSelected && <Check className="w-3 h-3 text-cyan-600  stroke-[3] flex-shrink-0" />}
                                            </div>
                                            <span className="text-[9.5px] font-mono text-slate-400  mt-1 truncate">
                                                {acc.email.split('@')[0]}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        )}

                        {status && (
                            <div className="p-3.5 bg-emerald-50  border border-emerald-200  rounded-2xl text-xs font-bold text-emerald-800  flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600  flex-shrink-0" />
                                <span>{status}</span>
                            </div>
                        )}

                        {/* Sign In Form */}
                        <form onSubmit={submit} className="space-y-4">
                            {/* Prominent Error Alert on Top of Input Fields */}
                            {(errors.email || errors.password || errors.general) && (
                                <div className="p-3.5 rounded-2xl bg-rose-50  border border-rose-200  flex items-start gap-3 text-xs animate-shake shadow-xs">
                                    <div className="w-6 h-6 rounded-xl bg-rose-100  text-rose-600  flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5]" />
                                    </div>
                                    <div className="space-y-0.5 text-left">
                                        <div className="font-black text-rose-900  text-xs">
                                            Something went wrong.
                                        </div>
                                        <div className="text-rose-700  font-medium text-[11.5px] leading-relaxed">
                                            {errors.email || errors.password || errors.general || 'These credentials do not match our records.'}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!isLogin && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-300 mb-4">
                                    <InputLabel htmlFor="name" value="Full Name *" />
                                    <div className="relative mt-1">
                                        <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                        <TextInput
                                            id="name"
                                            type="text"
                                            name="name"
                                            value={data.name}
                                            className="block w-full text-xs font-mono font-bold pl-10 py-2.5 rounded-2xl"
                                            autoComplete="name"
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="John Doe"
                                            required={!isLogin}
                                        />
                                    </div>
                                    {errors.name && <p className="mt-1 text-[10px] text-rose-500">{errors.name}</p>}
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
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 :text-slate-200 p-1 cursor-pointer focus:outline-none transition"
                                        title={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {!isLogin && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-300 mt-4">
                                    <InputLabel htmlFor="password_confirmation" value="Confirm Password *" />
                                    <div className="relative mt-1">
                                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                        <TextInput
                                            id="password_confirmation"
                                            type={showPasswordConfirm ? 'text' : 'password'}
                                            name="password_confirmation"
                                            value={data.password_confirmation}
                                            className="block w-full text-xs font-mono pl-10 pr-10 py-2.5 rounded-2xl"
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            placeholder="••••••••••••"
                                            required={!isLogin}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 :text-slate-200 p-1 cursor-pointer focus:outline-none transition"
                                            title={showPasswordConfirm ? 'Hide password' : 'Show password'}
                                        >
                                            {showPasswordConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {!isLogin && (
                                <div className="mt-1">
                                    <PasswordStrengthMeter password={data.password} />
                                </div>
                            )}

                            {isLogin && <div className="flex items-center justify-between pt-1">
                                <label className="flex items-center cursor-pointer select-none">
                                    <Checkbox
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="rounded-lg text-cyan-600 focus:ring-cyan-500"
                                    />
                                    <span className="ms-2 text-xs text-slate-600  font-semibold">
                                        Remember this device
                                    </span>
                                </label>
                            </div>}

                            <div className="pt-2">
                                <PrimaryButton 
                                    className="w-full justify-center py-3.5 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-black rounded-2xl shadow-lg transition active:scale-[0.98] gap-2 tracking-wide uppercase cursor-pointer" 
                                    disabled={processing}
                                >
                                    <span>{processing ? (isLogin ? "Authorizing..." : "Creating Account...") : (isLogin ? "Authorize & Sign In" : "Create Account")}</span>
                                    <ArrowRight className="w-4 h-4 text-white" />
                                </PrimaryButton>
                            </div>

                            <div className="pt-3 text-center">
                                <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
                                    {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                                    <button type="button" onClick={toggleMode} className="text-[#16A34A] hover:text-[#15803D] dark:text-emerald-400 dark:hover:text-emerald-300 font-black hover:underline cursor-pointer transition">
                                        {isLogin ? "Create an Account" : "Sign in here"}
                                    </button>
                                </p>
                            </div>

                            {/* Terms of Service & Privacy Policy Notice */}
                            <div className="pt-2 text-center">
                                <p className="text-[11px] text-slate-500  leading-relaxed">
                                    By signing in, you agree to Kardovo’s{' '}
                                    <Link href="/terms" className="font-bold text-kardovo-blue-dark  hover:underline">
                                        Terms & Conditions
                                    </Link>{' '}
                                    and{' '}
                                    <Link href="/privacy" className="font-bold text-kardovo-blue-dark  hover:underline">
                                        Privacy Policy
                                    </Link>.
                                </p>
                            </div>
                        </form>
                </div>
            </Container>
        </Wrapper>
    );
}
