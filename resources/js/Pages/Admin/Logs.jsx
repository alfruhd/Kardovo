import React, { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import KardovoAppLayout from '@/Layouts/KardovoAppLayout';
import ConfirmationModal from '@/Components/ConfirmationModal';
import { 
    Activity, 
    Search, 
    Check, 
    X, 
    Trash2, 
    Clock, 
    MapPin, 
    Ticket, 
    User as UserIcon, 
    Filter 
} from 'lucide-react';

export default function Logs({ isSuperAdmin = false, isSubAdmin = false, recentScanLogs = [] }) {
    const [logStatusFilter, setLogStatusFilter] = useState('all'); // 'all' | 'granted' | 'rejected'
    const [searchQuery, setSearchQuery] = useState('');
    const [confirmModal, setConfirmModal] = useState({
        show: false,
        title: '',
        message: '',
        warning: '',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger',
        loading: false,
        onConfirm: () => {},
    });

    const filteredLogs = useMemo(() => {
        return recentScanLogs.filter((log) => {
            const matchesStatus = logStatusFilter === 'all' || log.status === logStatusFilter;
            const query = searchQuery.toLowerCase().trim();
            if (!query) return matchesStatus;

            const matchesQuery = 
                (log.guest_name && log.guest_name.toLowerCase().includes(query)) ||
                (log.card_number && log.card_number.toLowerCase().includes(query)) ||
                (log.event_title && log.event_title.toLowerCase().includes(query)) ||
                (log.scanner_name && log.scanner_name.toLowerCase().includes(query)) ||
                (log.gate_label && log.gate_label.toLowerCase().includes(query));

            return matchesStatus && matchesQuery;
        });
    }, [recentScanLogs, logStatusFilter, searchQuery]);

    const handleDeleteScanLog = (logId) => {
        setConfirmModal({
            show: true,
            title: 'Delete Scan Audit Log',
            message: 'Are you sure you want to permanently delete this scan audit entry?',
            warning: 'This log entry will be removed from the gate access records.',
            confirmText: 'Delete Log',
            cancelText: 'Cancel',
            type: 'danger',
            loading: false,
            onConfirm: () => {
                setConfirmModal((prev) => ({ ...prev, loading: true }));
                router.delete(route('admin.destroyScanLog', logId), {
                    preserveScroll: true,
                    onFinish: () => setConfirmModal((prev) => ({ ...prev, show: false, loading: false })),
                });
            },
        });
    };

    const handleClearAllLogs = () => {
        setConfirmModal({
            show: true,
            title: 'Clear All Scan Audit Logs',
            message: 'Are you sure you want to purge all gate scan audit history across the platform?',
            warning: 'This will irreversibly remove all access records and cannot be undone.',
            confirmText: 'Purge All Logs',
            cancelText: 'Keep Logs',
            type: 'danger',
            loading: false,
            onConfirm: () => {
                setConfirmModal((prev) => ({ ...prev, loading: true }));
                router.delete(route('admin.clearScanLogs'), {
                    preserveScroll: true,
                    onFinish: () => setConfirmModal((prev) => ({ ...prev, show: false, loading: false })),
                });
            },
        });
    };

    return (
        <KardovoAppLayout title="Admin Logs">
            <Head title="Admin Logs - Kardovo" />

            <div className="space-y-6">
                {/* Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display flex items-center gap-2.5">
                            <Activity className="w-6 h-6 text-emerald-500" />
                            Admin Logs
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Real-time security and gate verification audit stream across all events.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {recentScanLogs.length > 0 && isSuperAdmin && (
                            <button
                                type="button"
                                onClick={handleClearAllLogs}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200/80 dark:border-rose-800/60 transition active:scale-95 cursor-pointer shadow-2xs"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Clear All Logs</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter and Search Card */}
                <div className="bg-white dark:bg-[#0B1524]/90 rounded-2xl border border-slate-200/90 dark:border-white/[0.08] p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-md">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search by guest, card #, event, or gate staff..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.08] rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                        />
                    </div>

                    <div className="flex items-center bg-slate-100 dark:bg-white/[0.06] p-0.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-white/[0.08] self-start sm:self-auto">
                        <button
                            type="button"
                            onClick={() => setLogStatusFilter('all')}
                            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer text-xs ${
                                logStatusFilter === 'all' 
                                    ? 'bg-[#16A34A] text-white shadow-2xs font-bold' 
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            All ({recentScanLogs.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setLogStatusFilter('granted')}
                            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer text-xs ${
                                logStatusFilter === 'granted' 
                                    ? 'bg-[#16A34A] text-white shadow-2xs font-bold' 
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            Admitted
                        </button>
                        <button
                            type="button"
                            onClick={() => setLogStatusFilter('rejected')}
                            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer text-xs ${
                                logStatusFilter === 'rejected' 
                                    ? 'bg-[#16A34A] text-white shadow-2xs font-bold' 
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            Rejected
                        </button>
                    </div>
                </div>

                {/* Table Container */}
                <div className="bg-white dark:bg-[#0B1524]/90 rounded-2xl border border-slate-200/90 dark:border-white/[0.08] shadow-card overflow-hidden transition-colors duration-300">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-slate-50/95 dark:bg-[#07111D]/95 backdrop-blur-md border-b border-slate-200 dark:border-white/[0.08]">
                                <tr className="text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 font-mono tracking-wider">
                                    <th className="py-3.5 px-5 font-bold text-left">Result</th>
                                    <th className="py-3.5 px-4 font-bold text-left">Guest / Pass</th>
                                    <th className="py-3.5 px-4 font-bold text-left">Event</th>
                                    <th className="py-3.5 px-4 font-bold text-left">Scanner / Gate</th>
                                    <th className="py-3.5 px-4 font-bold text-left">Timestamp</th>
                                    <th className="py-3.5 px-5 font-bold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05]">
                                {filteredLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-12 text-center text-slate-400 dark:text-slate-500">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Activity className="w-8 h-8 opacity-40 text-slate-400" />
                                                <span className="font-semibold text-xs">No scan audit logs found.</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLogs.map((log) => {
                                        const isGranted = log.status === 'granted';
                                        return (
                                            <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                                                <td className="py-3.5 px-5 align-middle whitespace-nowrap">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold font-mono ${
                                                        isGranted 
                                                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/50' 
                                                            : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/50'
                                                    }`}>
                                                        {isGranted ? (
                                                            <>
                                                                <Check className="w-3 h-3 stroke-[3]" /> Admitted
                                                            </>
                                                        ) : (
                                                            <>
                                                                <X className="w-3 h-3 stroke-[3]" /> Rejected
                                                            </>
                                                        )}
                                                    </span>
                                                    {!isGranted && log.rejection_reason && (
                                                        <div className="text-[10px] text-rose-500 mt-1 max-w-[180px] truncate" title={log.rejection_reason}>
                                                            {log.rejection_reason}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4 align-middle">
                                                    <div className="font-bold text-slate-900 dark:text-white truncate">
                                                        {log.guest_name}
                                                    </div>
                                                    <div className="font-mono text-[10.5px] text-slate-400">
                                                        {log.card_number}
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4 align-middle">
                                                    <div className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[220px]">
                                                        {log.event_title}
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                                                    <div className="text-slate-700 dark:text-slate-300 font-medium">
                                                        {log.scanner_name}
                                                    </div>
                                                    <div className="inline-flex items-center gap-1 text-[10.5px] text-slate-400">
                                                        <MapPin className="w-3 h-3" />
                                                        {log.gate_label}
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4 align-middle whitespace-nowrap text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                                                    <div className="inline-flex items-center gap-1.5">
                                                        <Clock className="w-3 h-3 text-slate-400" />
                                                        {log.scanned_at}
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-5 align-middle text-right whitespace-nowrap">
                                                    {isSuperAdmin && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteScanLog(log.id)}
                                                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
                                                            title="Delete Scan Log"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <ConfirmationModal
                show={confirmModal.show}
                onClose={() => setConfirmModal((prev) => ({ ...prev, show: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                warning={confirmModal.warning}
                confirmText={confirmModal.confirmText}
                cancelText={confirmModal.cancelText}
                type={confirmModal.type}
                loading={confirmModal.loading}
            />
        </KardovoAppLayout>
    );
}

