import React from 'react';

export default function InputLabel({
    value,
    className = '',
    children,
    ...props
}) {
    return (
        <label
            {...props}
            className={
                `block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1 ` +
                className
            }
        >
            {value ? value : children}
        </label>
    );
}
