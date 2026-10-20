import React, { useState } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import KardovoLogo from '@/Components/KardovoLogo';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';

export default function ConfirmPassword() {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Confirm Password" />

            <div className="mb-5 text-center flex flex-col items-center">
                <div className="mb-2 flex justify-center">
                    <KardovoLogo light={false} showText={false} imgClassName="h-9 w-9 sm:h-10 sm:w-10" size="lg" />
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-display tracking-tight">
                    Confirm Password
                </h1>
                <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed max-w-xs mx-auto">
                    This is a secure area of the application. Please confirm your password before continuing.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="password" value="Password *" className="text-slate-700 font-bold text-xs tracking-wider uppercase mb-1" />

                    <div className="relative mt-1">
                        <TextInput
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            variant="default"
                            value={data.password}
                            className="block w-full text-xs font-medium pl-3.5 pr-10 py-3 rounded-2xl"
                            placeholder="••••••••••••"
                            isFocused={true}
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer focus:outline-none transition"
                            title={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>

                    <InputError message={errors.password} className="mt-1.5" />
                </div>

                <div className="pt-2">
                    <PrimaryButton className="w-full justify-center py-3.5 bg-gradient-to-r from-[#154F7C] to-[#327FB5] hover:from-[#1A5C91] hover:to-[#3D8EC7] text-white text-xs font-black rounded-2xl shadow-lg shadow-[#154F7C]/25 transition active:scale-[0.98] uppercase tracking-wide cursor-pointer border border-sky-500/20 disabled:opacity-50" disabled={processing}>
                        Confirm Password
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
