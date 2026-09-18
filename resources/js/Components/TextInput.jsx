import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export default forwardRef(function TextInput(
    { type = 'text', className = '', isFocused = false, hasError = false, isValid = false, ...props },
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

    const stateClasses = hasError
        ? 'border-rose-400 dark:border-rose-500/80 focus:border-rose-500 dark:focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20 dark:focus:ring-rose-500/20 '
        : isValid
        ? 'border-emerald-400 dark:border-emerald-500/80 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 dark:focus:ring-emerald-500/20 '
        : 'border-slate-300/90 dark:border-white/[0.08] hover:border-emerald-500/70 dark:hover:border-emerald-400/60 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20 dark:focus:ring-emerald-400/20 ';

    return (
        <input
            {...props}
            type={type}
            className={
                'rounded-2xl border bg-white/90 dark:bg-[#08121E] text-slate-900 dark:text-white shadow-[0_2px_8px_rgba(0,0,0,0.03)] focus:outline-none transition duration-200 ' +
                stateClasses +
                className
            }
            ref={localRef}
        />
    );
});
