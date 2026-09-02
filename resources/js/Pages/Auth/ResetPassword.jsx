import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import PasswordStrengthMeter from '@/Components/PasswordStrengthMeter';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { validatePassword, generateStrongPassword } from '@/Utils/validation';
import { Check, X, Sparkles } from 'lucide-react';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

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

        if (!isMatch || !isStrong) {
            return;
        }

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Reset Password" />

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        hasError={Boolean(errors.email)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <div className="flex items-center justify-between">
                        <InputLabel htmlFor="password" value="New Secure Password *" />
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleGeneratePassword}
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-700 dark:text-cyan-300 hover:text-cyan-800 dark:hover:text-cyan-200 cursor-pointer bg-cyan-50 dark:bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-200 dark:border-cyan-800/40"
                                title="Generate strong 16-character password"
                            >
                                <Sparkles className="w-2.5 h-2.5 text-cyan-600 dark:text-cyan-400" />
                                <span>Suggest Strong</span>
                            </button>
                            {data.password && (
                                <span className={`inline-flex items-center gap-1 text-[10.5px] font-bold ${
                                    isStrong ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                                }`}>
                                    {isStrong ? <Check className="w-3 h-3" /> : null}
                                    <span>{isStrong ? 'Strong' : `${pwdAnalysis.score}/4 Requirements`}</span>
                                </span>
                            )}
                        </div>
                    </div>

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        isFocused={true}
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="Min 8 chars, uppercase, lowercase, numbers & symbols"
                        hasError={Boolean(errors.password)}
                        isValid={Boolean(isStrong)}
                        required
                    />

                    <PasswordStrengthMeter password={data.password} />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4">
                    <div className="flex items-center justify-between">
                        <InputLabel
                            htmlFor="password_confirmation"
                            value="Confirm New Password *"
                        />
                        {data.password_confirmation && (
                            <span className={`inline-flex items-center gap-1 text-[10.5px] font-bold ${
                                isMatch 
                                    ? 'text-emerald-600 dark:text-emerald-400' 
                                    : 'text-rose-600 dark:text-rose-400'
                            }`}>
                                {isMatch ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                <span>{isMatch ? 'Passwords match' : 'Do not match'}</span>
                            </span>
                        )}
                    </div>

                    <TextInput
                        type="password"
                        id="password_confirmation"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        placeholder="Repeat new password"
                        hasError={Boolean(errors.password_confirmation || isMismatch)}
                        isValid={Boolean(isMatch)}
                        required
                    />

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <div className="mt-6 flex items-center justify-end">
                    <PrimaryButton className="ms-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" disabled={processing || !isMatch || !isStrong}>
                        Reset Password
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
