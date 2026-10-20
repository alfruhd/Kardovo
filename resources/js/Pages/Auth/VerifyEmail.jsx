import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Email Verification" />

            <div className="mb-5 text-center">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-display tracking-tight">
                    Verify Your Email
                </h1>
                <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                    Thanks for signing up! Before getting started, please verify your email address by clicking the link we just sent. If you didn't receive it, we'll gladly send another.
                </p>
            </div>

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/90 px-3.5 py-2.5 rounded-xl text-center">
                    A new verification link has been sent to your email address.
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div className="pt-2">
                    <PrimaryButton className="w-full justify-center py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-2xl shadow-lg shadow-emerald-600/25 transition active:scale-[0.98] uppercase tracking-wide cursor-pointer border border-emerald-500/50 disabled:opacity-50" disabled={processing}>
                        Resend Verification Email
                    </PrimaryButton>
                </div>

                <div className="pt-2 text-center">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 transition cursor-pointer"
                    >
                        Log Out
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
