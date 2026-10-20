import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export default forwardRef(function TextInput(
    { type = 'text', className = '', isFocused = false, hasError = false, isValid = false, variant = 'default', ...props },
    ref,
) {
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    const isGlass = variant === 'glass';

    const stateClasses = hasError
        ? (isGlass ? 'border-rose-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-500/30 ' : 'border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/15 ')
        : isValid
        ? (isGlass ? 'border-sky-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-500/30 ' : 'border-sky-400 focus:border-[#154F7C] dark:focus:border-sky-400 focus:ring-4 focus:ring-sky-500/15 ')
        : (isGlass ? 'border-white/20 hover:border-white/35 focus:border-white/50 focus:ring-2 focus:ring-white/20 ' : 'border-slate-300/80 hover:border-slate-400/90 focus:border-[#154F7C] dark:focus:border-sky-400 focus:ring-4 focus:ring-sky-500/15 ');

    const baseClasses = isGlass
        ? 'rounded-2xl border bg-white/[0.10] hover:bg-white/[0.15] focus:bg-white/[0.20] text-white placeholder:text-white/50 placeholder:font-normal placeholder:font-sans shadow-[inset_0_1px_3px_rgba(0,0,0,0.2)] focus:outline-none transition duration-200 backdrop-blur-md font-medium '
        : 'rounded-2xl border bg-white hover:bg-slate-50 focus:bg-white text-slate-900 placeholder:text-slate-400 placeholder:font-normal placeholder:font-sans shadow-[0_2px_8px_rgba(0,0,0,0.03)] focus:outline-none transition duration-200 font-medium ';

    return (
        <input
            {...props}
            type={type}
            className={
                baseClasses +
                stateClasses +
                className
            }
            ref={localRef}
        />
    );
});
