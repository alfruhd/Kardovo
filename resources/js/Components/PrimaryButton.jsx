export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center justify-center rounded-2xl border border-white/20 dark:border-cyan-400/30 bg-gray-900 dark:bg-cyan-600 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-md hover:shadow-xl hover:border-cyan-400/60 dark:hover:border-cyan-300 hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-cyan-500/30 active:scale-95 transition-all duration-200 cursor-pointer ${
                    disabled && 'opacity-25 cursor-not-allowed hover:scale-100 hover:shadow-md'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
