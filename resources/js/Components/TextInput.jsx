import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export default forwardRef(function TextInput(
    { type = 'text', className = '', isFocused = false, ...props },
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

    return (
        <input
            {...props}
            type={type}
            className={
                'rounded-2xl border border-slate-300/90 dark:border-white/[0.08] bg-white/90 dark:bg-[#08121E] text-slate-900 dark:text-white shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:border-cyan-500/70 dark:hover:border-cyan-400/60 focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/20 dark:focus:ring-cyan-400/20 focus:outline-none transition duration-200 ' +
                className
            }
            ref={localRef}
        />
    );
});
