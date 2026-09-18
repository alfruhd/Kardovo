import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import { AlertTriangle, Trash2, Info, CheckCircle2, Loader2, X } from 'lucide-react';

export default function ConfirmationModal({
    show = false,
    title = 'Confirm',
    message = 'Are you sure?',
    warning = '',
    confirmText = 'Delete',
    cancelText = 'Cancel',
    type = 'danger', // 'danger' | 'warning' | 'info' | 'success'
    loading = false,
    onConfirm = () => {},
    onClose = () => {},
    maxWidth = 'sm',
}) {
    const config = {
        danger: {
            icon: Trash2,
            iconBg: 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-500/20',
            confirmBtn: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm active:bg-rose-800',
        },
        warning: {
            icon: AlertTriangle,
            iconBg: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-500/20',
            confirmBtn: 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm active:bg-amber-800',
        },
        info: {
            icon: Info,
            iconBg: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-500/20',
            confirmBtn: 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 shadow-sm',
        },
        success: {
            icon: CheckCircle2,
            iconBg: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/20',
            confirmBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm active:bg-emerald-800',
        },
    }[type] || {
        icon: AlertTriangle,
        iconBg: 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-500/20',
        confirmBtn: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm active:bg-rose-800',
    };

    const Icon = config.icon;

    return (
        <Modal show={show} onClose={onClose} maxWidth={maxWidth}>
            <div className="relative p-5 sm:p-6">
                {/* Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50 cursor-pointer"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="flex items-start gap-3.5">
                    {/* Icon */}
                    <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${config.iconBg}`}>
                        <Icon className="w-5 h-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 pr-4 pt-0.5">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                            {title}
                        </h3>
                        <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            {message}
                        </p>

                        {/* Warning Box */}
                        {warning && (
                            <p className="mt-2 text-xs font-medium text-rose-600 dark:text-rose-400">
                                {warning}
                            </p>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-5 flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
                    <SecondaryButton
                        onClick={onClose}
                        disabled={loading}
                        className="!rounded-xl !py-2 !px-4 text-xs font-semibold cursor-pointer"
                    >
                        {cancelText}
                    </SecondaryButton>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className={`inline-flex items-center justify-center gap-1.5 rounded-xl py-2 px-4 text-xs font-bold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${config.confirmBtn}`}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Please wait...</span>
                            </>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
