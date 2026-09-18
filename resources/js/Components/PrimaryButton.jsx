export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            disabled={disabled}
            className={
                `inline-flex items-center justify-center rounded-xl border border-[#16A34A] bg-[#16A34A] hover:bg-[#15803D] px-4 py-2.5 text-xs font-bold text-white shadow-xs focus:outline-none focus:ring-2 focus:ring-[#16A34A]/50 active:scale-95 transition-all duration-150 cursor-pointer ${
                    disabled ? 'opacity-30 cursor-not-allowed active:scale-100 hover:bg-[#16A34A]' : ''
                } ` + className
            }
        >
            {children}
        </button>
    );
}
