import React from 'react';
import { CheckCircle2, Clock, XCircle, Send, CheckCheck, AlertCircle } from 'lucide-react';

export default function StatusBadge({ status, type = 'general', className = '' }) {
    const s = (status || '').toLowerCase();

    let style = 'bg-gray-100 text-gray-700 border-gray-200';
    let icon = null;
    let label = status;

    if (s === 'delivered') {
        style = 'bg-blue-50 text-blue-700 border-blue-200';
        icon = <CheckCheck className="w-3 h-3 text-blue-600" />;
        label = 'Delivered';
    } else if (s === 'sent') {
        style = 'bg-slate-100 text-slate-700 border-slate-200';
        icon = <Send className="w-3 h-3 text-slate-500" />;
        label = 'Sent';
    } else if (s === 'attending' || s === 'will attend' || s === 'read' || s === 'granted' || s === 'active') {
        style = 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium';
        icon = <CheckCircle2 className="w-3 h-3 text-emerald-600" />;
        label = s === 'attending' ? 'Will Attend' : (s === 'granted' ? 'Granted' : (s === 'active' ? 'Active' : 'Read'));
    } else if (s === 'pending' || s === 'draft' || s === 'queued') {
        style = 'bg-amber-50 text-amber-700 border-amber-200';
        icon = <Clock className="w-3 h-3 text-amber-500" />;
        label = s === 'pending' ? 'Pending' : (s === 'draft' ? 'Draft' : 'Queued');
    } else if (s === 'declined' || s === 'will not attend' || s === 'failed' || s === 'rejected' || s === 'cancelled') {
        style = 'bg-red-50 text-red-700 border-red-200';
        icon = <XCircle className="w-3 h-3 text-red-500" />;
        label = s === 'declined' ? 'Will Not Attend' : (s === 'failed' ? 'Failed' : (s === 'rejected' ? 'Rejected' : 'Cancelled'));
    }

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style} ${className}`}>
            {icon}
            <span>{label}</span>
        </span>
    );
}
