import React, { useRef, useState } from 'react';
import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { Trash2, AlertTriangle, X } from 'lucide-react';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-4 ${className}`}>
            <header className="flex items-center justify-between border-b border-rose-100 dark:border-rose-900/50 pb-4">
                <div>
                    <h2 className="text-base font-black text-rose-900 dark:text-rose-300 font-display flex items-center gap-2">
                        <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                        <span>Danger Zone: Permanent Account Deletion</span>
                    </h2>
                    <p className="mt-1 text-xs text-rose-700/80 dark:text-rose-400/80 font-medium">
                        Once your account is deleted, all hosted events, guest databases, custom card templates, and gate logs will be permanently erased.
                    </p>
                </div>
            </header>

            <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    This action is permanent and cannot be undone.
                </span>
                <DangerButton onClick={confirmUserDeletion} className="py-2.5 px-4 rounded-xl text-xs font-bold shadow-xs">
                    Delete Account
                </DangerButton>
            </div>

            <Modal show={confirmingUserDeletion} onClose={closeModal} maxWidth="md">
                <form onSubmit={deleteUser} className="p-6 sm:p-7 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200 dark:border-rose-800/40">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <h2 className="text-base font-black text-slate-900 dark:text-white font-display">
                                Confirm Account Deletion
                            </h2>
                        </div>
                        <button
                            type="button"
                            onClick={closeModal}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        Are you sure you want to permanently delete your account? All created events, pass scans, and templates will be immediately purged. Please enter your password to confirm.
                    </p>

                    <div className="space-y-1.5">
                        <InputLabel
                            htmlFor="password"
                            value="Confirm Password to Authorize Deletion"
                        />

                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            className="block w-full text-xs font-mono"
                            isFocused
                            placeholder="Enter your current password"
                        />

                        <InputError
                            message={errors.password}
                            className="mt-1.5"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-white/[0.08]">
                        <SecondaryButton onClick={closeModal}>
                            Cancel
                        </SecondaryButton>

                        <DangerButton disabled={processing} className="py-2.5 px-4 rounded-xl text-xs font-bold shadow-xs">
                            Permanently Delete Account
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
