import React from 'react';

export default function InputLabel({
    value,
    className = '',
    children,
    ...props
}) {
    const hasTextColor = className.includes('text-');
    return (
        <label
            {...props}
            className={
                `block text-xs font-black uppercase tracking-wider mb-1 ${hasTextColor ? '' : 'text-slate-900 dark:text-white'} ` +
                className
            }
        >
            {value ? value : children}
        </label>
    );
}
