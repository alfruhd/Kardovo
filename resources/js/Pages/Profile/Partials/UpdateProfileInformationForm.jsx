import React, { useState, useRef } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Link, useForm, usePage } from '@inertiajs/react';
import { 
    validateEmail, 
    validatePhone, 
    validateFileSize, 
    validateFileExtension, 
    validateRequired 
} from '@/Utils/validation';
import { 
    User, 
    Mail, 
    Smartphone, 
    Building2, 
    CheckCircle2, 
    Save, 
    Camera, 
    UploadCloud, 
    Trash2, 
    Sparkles, 
    ShieldCheck,
    Lock,
    Image as ImageIcon,
    Check,
    AlertCircle
} from 'lucide-react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth?.user || {};
    const isAdmin = user?.role === 'admin';
    const fileInputRef = useRef(null);
    const [previewUrl, setPreviewUrl] = useState(user?.avatar || null);
    const [clientErrors, setClientErrors] = useState({});
    const [touched, setTouched] = useState({});

    const { data, setData, post, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
            company: user?.company || '',
            two_factor_enabled: Boolean(user?.two_factor_enabled),
            avatar_file: null,
            remove_avatar: false,
            max_whatsapp_limit: user?.max_whatsapp_limit ?? '',
            max_sms_limit: user?.max_sms_limit ?? '',
            max_events_limit: user?.max_events_limit ?? '',
            _method: 'PATCH',
        });

    const validateField = (field, value) => {
        const errs = { ...clientErrors };
        if (field === 'name') {
            if (!validateRequired(value, 2, 255)) {
                errs.name = 'Full name must be at least 2 characters.';
            } else {
                delete errs.name;
            }
        }
        if (field === 'email') {
            if (!value || !value.trim()) {
                errs.email = 'Email address is required.';
            } else if (!validateEmail(value)) {
                errs.email = 'Please provide a valid email address (e.g. name@company.com).';
            } else {
                delete errs.email;
            }
        }
        if (field === 'phone') {
            if (value && value.trim() && !validatePhone(value)) {
                errs.phone = 'Please provide a valid phone number with country code (e.g. +255 712 345 678).';
            } else {
                delete errs.phone;
            }
        }
        setClientErrors(errs);
        return errs;
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const extCheck = validateFileExtension(file, ['jpg', 'jpeg', 'png', 'webp', 'svg']);
            if (!extCheck.isValid) {
                setClientErrors(prev => ({ ...prev, avatar_file: extCheck.message }));
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }

            const sizeCheck = validateFileSize(file, 5);
            if (!sizeCheck.isValid) {
                setClientErrors(prev => ({ ...prev, avatar_file: sizeCheck.message }));
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }

            setClientErrors(prev => {
                const next = { ...prev };
                delete next.avatar_file;
                return next;
            });

            setData((prev) => ({
                ...prev,
                avatar_file: file,
                remove_avatar: false,
            }));
            const reader = new FileReader();
            reader.onload = (event) => {
                setPreviewUrl(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemovePhoto = () => {
        setData((prev) => ({
            ...prev,
            avatar_file: null,
            remove_avatar: true,
        }));
        setPreviewUrl(null);
        setClientErrors(prev => {
            const next = { ...prev };
            delete next.avatar_file;
            return next;
        });
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const submit = (e) => {
        e.preventDefault();

        // Run full client-side validation
        const errs = {};
        if (!validateRequired(data.name, 2, 255)) {
            errs.name = 'Full name must be at least 2 characters.';
        }
        if (!data.email || !validateEmail(data.email)) {
            errs.email = 'Please provide a valid email address.';
        }
        if (data.phone && data.phone.trim() && !validatePhone(data.phone)) {
            errs.phone = 'Please provide a valid phone number (e.g. +255 712 345 678).';
        }

        if (Object.keys(errs).length > 0) {
            setClientErrors(errs);
            setTouched({ name: true, email: true, phone: true });
            return;
        }
        
        if (data.avatar_file) {
            post(route('profile.update'), {
                preserveScroll: true,
                forceFormData: true,
            });
        } else {
            patch(route('profile.update'), {
                preserveScroll: true,
            });
        }
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200/60 dark:border-white/[0.08] text-slate-700 dark:text-slate-200 flex items-center justify-center flex-shrink-0 shadow-2xs">
                        <User className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <div>
                        <h2 className="text-base font-black text-slate-900 dark:text-white font-display">
                            Profile &amp; Organization Information
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                            Customize your profile photo, official identity, contact details, and dispatch quota limits.
                        </p>
                    </div>
                </div>
            </header>

            <form onSubmit={submit} className="space-y-6">
                {/* 📸 1. EDITABLE PROFILE PHOTO SECTION */}
                <div className="p-5 rounded-3xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white font-display flex items-center gap-1.5">
                            <Camera className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                            <span>Profile Avatar &amp; Photo</span>
                        </span>
                        <span className="text-[10.5px] font-mono text-slate-400">JPG, PNG, WEBP up to 5MB</span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                        {/* Avatar Preview Box */}
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shadow-xs border-2 border-white dark:border-slate-700 bg-slate-200 dark:bg-slate-800 flex items-center justify-center relative">
                                {previewUrl ? (
                                    <img 
                                        src={previewUrl} 
                                        alt={data.name || 'User Avatar'} 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-slate-100 dark:bg-white/[0.06] text-slate-800 dark:text-slate-100 flex items-center justify-center font-bold font-mono text-3xl shadow-inner">
                                        {data.name?.charAt(0) || user?.name?.charAt(0) || 'U'}
                                    </div>
                                )}

                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold gap-1 backdrop-blur-xs">
                                    <Camera className="w-5 h-5 text-cyan-300" />
                                    <span>Change</span>
                                </div>
                            </div>

                            {/* Camera Action Badge */}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    fileInputRef.current?.click();
                                }}
                                className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white shadow-md flex items-center justify-center transition active:scale-95 border-2 border-white dark:border-[#0B1524]"
                                title="Upload new photo"
                            >
                                <Camera className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {/* Upload Controls & Description */}
                        <div className="space-y-2.5 text-center sm:text-left flex-1">
                            <div>
                                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                    Personalize Your Account Image
                                </h3>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                                    Your profile photo appears on the top navigation bar, sidebar account dock, event collaborator lists, and guest dispatch notifications.
                                </p>
                            </div>

                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileSelect} 
                                accept="image/jpeg,image/png,image/jpg,image/webp,image/svg+xml" 
                                className="hidden" 
                            />

                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.12] border border-slate-200 dark:border-white/[0.1] text-slate-700 dark:text-slate-200 text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
                                >
                                    <UploadCloud className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                                    <span>{previewUrl ? 'Change Photo' : 'Upload Photo'}</span>
                                </button>

                                {previewUrl && (
                                    <button
                                        type="button"
                                        onClick={handleRemovePhoto}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800/40 text-rose-700 dark:text-rose-300 text-xs font-bold transition active:scale-95 cursor-pointer"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span>Remove</span>
                                    </button>
                                )}
                            </div>

                            <InputError className="mt-1" message={clientErrors.avatar_file || errors.avatar_file} />
                        </div>
                    </div>
                </div>

                {/* 📝 2. PERSONAL IDENTITY & CONTACT DETAILS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div>
                        <div className="flex items-center justify-between">
                            <InputLabel htmlFor="name" value="Full Name *" />
                            {touched.name && !clientErrors.name && data.name.trim().length >= 2 && (
                                <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400">
                                    <Check className="w-3 h-3" />
                                    <span>Valid</span>
                                </span>
                            )}
                        </div>
                        <div className="relative mt-1">
                            <TextInput
                                id="name"
                                className="block w-full text-xs font-bold pl-3"
                                value={data.name}
                                onChange={(e) => {
                                    setData('name', e.target.value);
                                    validateField('name', e.target.value);
                                }}
                                onBlur={() => {
                                    setTouched(prev => ({ ...prev, name: true }));
                                    validateField('name', data.name);
                                }}
                                hasError={Boolean((touched.name && clientErrors.name) || errors.name)}
                                isValid={Boolean(touched.name && !clientErrors.name && data.name.trim().length >= 2)}
                                required
                                autoComplete="name"
                                placeholder="e.g. Alfred Mashauri"
                            />
                        </div>
                        <InputError className="mt-1.5" message={(touched.name && clientErrors.name) || errors.name} />
                    </div>

                    {/* Email Address */}
                    <div>
                        <div className="flex items-center justify-between">
                            <InputLabel htmlFor="email" value="Email Address *" />
                            {touched.email && !clientErrors.email && validateEmail(data.email) && (
                                <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400">
                                    <Check className="w-3 h-3" />
                                    <span>Verified format</span>
                                </span>
                            )}
                        </div>
                        <div className="relative mt-1">
                            <TextInput
                                id="email"
                                type="email"
                                className="block w-full text-xs font-mono font-bold pl-3"
                                value={data.email}
                                onChange={(e) => {
                                    setData('email', e.target.value);
                                    validateField('email', e.target.value);
                                }}
                                onBlur={() => {
                                    setTouched(prev => ({ ...prev, email: true }));
                                    validateField('email', data.email);
                                }}
                                hasError={Boolean((touched.email && clientErrors.email) || errors.email)}
                                isValid={Boolean(touched.email && !clientErrors.email && validateEmail(data.email))}
                                required
                                autoComplete="username"
                                placeholder="name@company.com"
                            />
                        </div>
                        <InputError className="mt-1.5" message={(touched.email && clientErrors.email) || errors.email} />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Phone Number */}
                    <div>
                        <div className="flex items-center justify-between">
                            <InputLabel htmlFor="phone" value="Phone Number (WhatsApp / Contact)" />
                            {data.phone && data.phone.trim() && validatePhone(data.phone) && (
                                <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                                    <Check className="w-3 h-3" />
                                    <span>Verified</span>
                                </span>
                            )}
                        </div>
                        <div className="relative mt-1">
                            <TextInput
                                id="phone"
                                type="text"
                                className="block w-full text-xs font-mono font-bold pl-3"
                                value={data.phone}
                                onChange={(e) => {
                                    setData('phone', e.target.value);
                                    validateField('phone', e.target.value);
                                }}
                                onBlur={() => {
                                    setTouched(prev => ({ ...prev, phone: true }));
                                    validateField('phone', data.phone);
                                }}
                                hasError={Boolean((touched.phone && clientErrors.phone) || errors.phone)}
                                isValid={Boolean(data.phone && data.phone.trim() && validatePhone(data.phone))}
                                placeholder="+255 712 345 678"
                            />
                        </div>
                        <InputError className="mt-1.5" message={(touched.phone && clientErrors.phone) || errors.phone} />
                        {(!touched.phone || !clientErrors.phone) && !errors.phone && (
                            <p className="text-[10px] text-slate-400 font-mono mt-1">
                                International format supported: e.g. +255 712 345 678 or 0712345678
                            </p>
                        )}
                    </div>

                    {/* Company / Brand Name */}
                    <div>
                        <InputLabel htmlFor="company" value="Company / Brand Name" />
                        <div className="relative mt-1">
                            <TextInput
                                id="company"
                                type="text"
                                className="block w-full text-xs font-bold pl-3"
                                value={data.company}
                                onChange={(e) => setData('company', e.target.value)}
                                placeholder="e.g. Kardovo Events Ltd"
                            />
                        </div>
                        <InputError className="mt-1.5" message={errors.company} />
                    </div>
                </div>

                {/* 🛡️ TWO-FACTOR AUTHENTICATION (2FA) CARD */}
                <div className="p-4 sm:p-5 rounded-3xl bg-slate-50/90 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] space-y-3">
                    <div className="flex items-center justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white font-display">
                                    Two-Factor Authentication (2FA)
                                </h3>
                                <span className="text-[10px] font-mono font-medium uppercase px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-white/[0.08] inline-flex items-center gap-1.5">
                                    <span className={`w-1.5 h-1.5 rounded-full ${data.two_factor_enabled ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                    <span>{data.two_factor_enabled ? 'Active & Enforced' : 'Disabled'}</span>
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                                Require a 6-digit security verification code sent to your registered email or phone whenever you sign in to your account.
                            </p>
                        </div>

                        {/* Toggle Switch */}
                        <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                            <input
                                type="checkbox"
                                checked={data.two_factor_enabled}
                                onChange={(e) => setData('two_factor_enabled', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                        </label>
                    </div>
                </div>

                {/* 💬 3. DISPATCH QUOTAS: WHATSAPP & SMS (Admin Authority Only) */}
                {isAdmin && (
                    <div className="p-4 sm:p-5 rounded-3xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] space-y-3.5">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white font-display">
                                    Dispatch Quota Settings (Admin Governance)
                                </h3>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                    Set limits for guest pass dispatches (leave empty for unlimited).
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            {/* WhatsApp Quota Box */}
                            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#07111D] border border-slate-200/80 dark:border-white/[0.08] shadow-xs space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                    <InputLabel htmlFor="max_whatsapp_limit" value="WhatsApp Quota" className="text-xs font-bold text-slate-800 dark:text-slate-200" />
                                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.06] px-2 py-0.5 rounded-md font-medium border border-slate-200/70 dark:border-white/[0.08]">
                                        WhatsApp
                                    </span>
                                </div>
                                <div className="relative">
                                    <TextInput
                                        id="max_whatsapp_limit"
                                        type="number"
                                        min="0"
                                        placeholder="Unlimited"
                                        className="block w-full text-xs font-mono font-bold px-3 py-2.5"
                                        value={data.max_whatsapp_limit}
                                        onChange={(e) => setData('max_whatsapp_limit', e.target.value)}
                                    />
                                </div>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                                    Max total WhatsApp passes/messages
                                </p>
                                <InputError className="mt-1" message={errors.max_whatsapp_limit} />
                            </div>

                            {/* SMS Quota Box */}
                            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#07111D] border border-slate-200/80 dark:border-white/[0.08] shadow-xs space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                    <InputLabel htmlFor="max_sms_limit" value="Regular SMS Quota" className="text-xs font-bold text-slate-800 dark:text-slate-200" />
                                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.06] px-2 py-0.5 rounded-md font-medium border border-slate-200/70 dark:border-white/[0.08]">
                                        SMS
                                    </span>
                                </div>
                                <div className="relative">
                                    <TextInput
                                        id="max_sms_limit"
                                        type="number"
                                        min="0"
                                        placeholder="Unlimited"
                                        className="block w-full text-xs font-mono font-bold px-3 py-2.5"
                                        value={data.max_sms_limit}
                                        onChange={(e) => setData('max_sms_limit', e.target.value)}
                                    />
                                </div>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                                    Max total SMS passes/messages
                                </p>
                                <InputError className="mt-1" message={errors.max_sms_limit} />
                            </div>
                        </div>
                    </div>
                )}

                {mustVerifyEmail && user?.email_verified_at === null && (
                    <div className="p-4 rounded-2xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 text-xs">
                        <p className="font-semibold">
                            Your email address is unverified.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="ml-2 underline font-bold hover:text-slate-900 dark:hover:text-white focus:outline-hidden"
                            >
                                Click here to re-send the verification email.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                                A new verification link has been sent to your email address.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/[0.08]">
                    {recentlySuccessful ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/40 animate-fadeIn">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Profile updated successfully!</span>
                        </span>
                    ) : <div />}

                    <div className="ml-auto flex items-center gap-3">
                        {Object.keys(clientErrors).length > 0 && (
                            <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>Please resolve form errors above</span>
                            </span>
                        )}
                        <PrimaryButton 
                            disabled={processing || Boolean(clientErrors.name || clientErrors.email || clientErrors.phone || clientErrors.avatar_file)} 
                            className="bg-slate-900 hover:bg-slate-800 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white font-bold py-2.5 px-5 rounded-xl shadow-xs transition active:scale-95 text-xs gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="w-3.5 h-3.5 text-cyan-400 dark:text-white" />
                            <span>{processing ? 'Saving...' : 'Save Profile Changes'}</span>
                        </PrimaryButton>
                    </div>
                </div>
            </form>
        </section>
    );
}
