import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import KardovoAppLayout from '@/Layouts/KardovoAppLayout';
import { Shield, Search, Filter } from 'lucide-react';
import TextInput from '@/Components/TextInput';

export default function AuditLogs({ logs, filters, auth }) {
    const [actionType, setActionType] = useState(filters.action_type || '');

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('admin.auditLogs'), { action_type: actionType }, { preserveState: true });
    };

    return (
        <KardovoAppLayout title="Audit Logs">
            <Head title="Audit Logs - Kardovo" />
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <Shield className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                            System Audit Logs
                        </h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            A secure, chronological record of system activities, access control, and user actions.
                        </p>
                    </div>

                    <form onSubmit={handleFilter} className="flex items-center gap-2">
                        <TextInput
                            type="text"
                            placeholder="Filter by action..."
                            value={actionType}
                            onChange={(e) => setActionType(e.target.value)}
                            className="text-sm py-1.5"
                        />
                        <button type="submit" className="p-2 bg-slate-100 dark:bg-white/[0.04] rounded-lg hover:bg-slate-200 dark:hover:bg-white/[0.08] transition">
                            <Filter className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        </button>
                    </form>
                </div>

                <div className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-white/[0.05] rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-white/[0.05]">
                            <thead className="bg-slate-50 dark:bg-slate-800/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Timestamp</th>
                                    <th className="px-6 py-3 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actor (User)</th>
                                    <th className="px-6 py-3 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Action</th>
                                    <th className="px-6 py-3 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Target Resource</th>
                                    <th className="px-6 py-3 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Source IP</th>
                                    <th className="px-6 py-3 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Outcome</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-white/[0.05]">
                                {logs.data.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                                            {new Date(log.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-slate-900 dark:text-white">
                                                {log.user ? log.user.name : 'System / Unknown'}
                                            </div>
                                            {log.user && (
                                                <div className="text-xs text-slate-500 dark:text-slate-400">{log.user.email} ({log.user.role})</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold font-mono bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 font-mono text-xs">
                                            {log.resource_type ? `${log.resource_type.split('\\').pop()} #${log.resource_id}` : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 font-mono text-xs">
                                            {log.ip_address || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${log.outcome === 'success' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300'}`}>
                                                {log.outcome}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {logs.data.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                                            No audit logs found matching criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </KardovoAppLayout>
    );
}

