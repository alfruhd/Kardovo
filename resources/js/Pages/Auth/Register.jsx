import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import PasswordStrengthMeter from '@/Components/PasswordStrengthMeter';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { validateEmail, validateRequired } from '@/Utils/validation';
import { Check, X } from 'lucide-react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
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

    const isLengthValid = data.password.length >= 8;
    const isEmailValid = validateEmail(data.email);
    const isNameValid = data.name.trim().length >= 2;

    const submit = (e) => {
        e.preventDefault();

        if (!isMatch || !isLengthValid || !isEmailValid || !isNameValid) {
            return;
        }

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <form onSubmit={submit}>
                <div>
                    <div className="flex items-center justify-between">
                        <InputLabel htmlFor="name" value="Name" />
                        {data.name && isNameValid && (
                            <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400">
                                <Check className="w-3 h-3" />
                                <span>Valid</span>
                            </span>
                        )}
                    </div>

                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        hasError={Boolean(errors.name)}
                        isValid={Boolean(data.name && isNameValid)}
                        required
                    />

                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div className="mt-4">
                    <div className="flex items-center justify-between">
                        <InputLabel htmlFor="email" value="Email" />
                        {data.email && isEmailValid && (
                            <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400">
                                <Check className="w-3 h-3" />
                                <span>Verified format</span>
                            </span>
                        )}
                    </div>

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        hasError={Boolean(errors.email)}
                        isValid={Boolean(data.email && isEmailValid)}
                        required
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <div className="flex items-center justify-between">
                        <InputLabel htmlFor="password" value="Password" />
                        {data.password && (
                            <span className={`inline-flex items-center gap-1 text-[10.5px] font-bold ${
                                isLengthValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                            }`}>
                                {isLengthValid ? <Check className="w-3 h-3" /> : null}
                                <span>{isLengthValid ? 'Length met (8+)' : `${data.password.length}/8 chars`}</span>
                            </span>
                        )}
                    </div>

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        hasError={Boolean(errors.password)}
                        isValid={Boolean(isLengthValid)}
                        required
                    />

                    <PasswordStrengthMeter password={data.password} />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4">
                    <div className="flex items-center justify-between">
                        <InputLabel
                            htmlFor="password_confirmation"
                            value="Confirm Password"
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
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        hasError={Boolean(errors.password_confirmation || isMismatch)}
                        isValid={Boolean(isMatch)}
                        required
                    />

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                {/* Terms of Service & Privacy Notice */}
                <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                    By registering an organizer account, you agree to Kardovo’s{' '}
                    <Link href="/terms" className="font-bold text-cyan-600 dark:text-cyan-400 hover:underline">
                        Terms &amp; Conditions
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="font-bold text-cyan-600 dark:text-cyan-400 hover:underline">
                        Privacy Policy
                    </Link>.
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <Link
                        href={route('login')}
                        className="rounded-md text-sm text-gray-600 dark:text-slate-400 underline hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Already registered?
                    </Link>

                    <PrimaryButton className="ms-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" disabled={processing || !isMatch || !isLengthValid || !isEmailValid || !isNameValid}>
                        Register
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
