import { AlertCircle } from 'lucide-react';

export default function InputError({ message, className = '', ...props }) {
    if (!message) return null;

    return (
        <p
            {...props}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 ${className}`}
        >
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{message}</span>
        </p>
    );
}
