import React from 'react';

export default function SecondaryButton({
    type = 'button',
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            type={type}
            className={
                `inline-flex items-center justify-center rounded-2xl border border-slate-300 dark:border-white/[0.08] bg-white/90 dark:bg-white/[0.06] hover:bg-white dark:hover:bg-white/[0.12] hover:border-cyan-500/70 dark:hover:border-cyan-400/60 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_15px_rgba(6,182,212,0.15)] hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-cyan-500/20 active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-25 ${
                    disabled && 'opacity-25 cursor-not-allowed hover:scale-100 hover:shadow-none'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
