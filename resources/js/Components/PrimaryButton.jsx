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
                `inline-flex items-center justify-center rounded-xl border border-sky-400/25 bg-gradient-to-r from-[#154F7C] to-[#327FB5] hover:from-[#1A5C91] hover:to-[#3D8EC7] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-[#154F7C]/25 focus:outline-none focus:ring-2 focus:ring-sky-500/50 active:scale-95 transition-all duration-150 cursor-pointer ${
                    disabled ? 'opacity-40 cursor-not-allowed active:scale-100 hover:from-[#154F7C] hover:to-[#327FB5]' : ''
                } ` + className
            }
        >
            {children}
        </button>
    );
}
