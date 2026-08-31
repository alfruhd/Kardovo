export default function DangerButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center justify-center rounded-2xl border border-rose-400/40 bg-rose-600 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-md hover:bg-rose-500 hover:border-rose-300 hover:shadow-[0_4px_15px_rgba(244,63,94,0.3)] hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-rose-500/30 active:scale-95 transition-all duration-200 cursor-pointer ${
                    disabled && 'opacity-25 cursor-not-allowed hover:scale-100 hover:shadow-none'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
