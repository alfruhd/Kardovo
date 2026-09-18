import React from 'react';
import { CheckCircle2, Clock, XCircle, Send, CheckCheck, AlertCircle } from 'lucide-react';

export default function StatusBadge({ status, type = 'general', className = '' }) {
    const s = (status || '').toLowerCase();

    let style = 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700';
    let icon = null;
    let label = status;

    if (s === 'read') {
        style = 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/60 font-semibold';
        icon = <CheckCheck className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />;
        label = 'Read';
    } else if (s === 'delivered') {
        style = 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50 font-semibold';
        icon = <CheckCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />;
        label = 'Delivered';
    } else if (s === 'sent') {
        style = 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/50 font-semibold';
        icon = <Send className="w-3 h-3 text-blue-500 dark:text-blue-400 shrink-0" />;
        label = 'Sent';
    } else if (s === 'attending' || s === 'will attend' || s === 'granted' || s === 'active') {
        style = 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50 font-semibold';
        icon = <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />;
        label = s === 'attending' ? 'Will Attend' : (s === 'granted' ? 'Granted' : 'Active');
    } else if (s === 'pending' || s === 'draft' || s === 'queued') {
        style = 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/50 font-semibold';
        icon = <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />;
        label = s === 'pending' ? 'Pending' : (s === 'draft' ? 'Draft' : 'Queued');
    } else if (s === 'declined' || s === 'will not attend' || s === 'failed' || s === 'rejected' || s === 'cancelled') {
        style = 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800/50 font-semibold';
        icon = <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400 shrink-0" />;
        label = (s === 'declined' || s === 'will not attend') ? 'Will Not Attend' : (s === 'failed' ? 'Failed' : (s === 'rejected' ? 'Rejected' : 'Cancelled'));
    }

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs border whitespace-nowrap shrink-0 ${style} ${className}`}>
            {icon}
            <span className="whitespace-nowrap">{label}</span>
        </span>
    );
}
