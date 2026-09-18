import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import KardovoAppLayout from '@/Layouts/KardovoAppLayout';
import { Wallet, Plus, Minus, Search } from 'lucide-react';
import ErrorBoundary from '@/Components/ErrorBoundary';

export default function AdminWalletsIndex(props) {
    return (
        <ErrorBoundary>
            <AdminWalletsIndexContent {...props} />
        </ErrorBoundary>
    );
}

function AdminWalletsIndexContent({ wallets }) {
    const [adjustingWallet, setAdjustingWallet] = useState(null);
    const { data, setData, post, processing, reset, errors, clearErrors } = useForm({
        amount: '',
        type: 'credit',
        notes: '',
    });

    const openAdjustModal = (wallet, type) => {
        setAdjustingWallet(wallet);
        setData({ amount: '', type, notes: '' });
        clearErrors();
    };

    const submitAdjust = (e) => {
        e.preventDefault();
        post(route('admin.wallets.adjust', adjustingWallet.id), {
            onSuccess: () => {
                setAdjustingWallet(null);
                reset();
            }
        });
    };

    return (
        <KardovoAppLayout title="Wallet Management">
            <Head title="Admin | Wallet Management" />

            <div className="max-w-7xl mx-auto space-y-6">
                
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-indigo-500" />
                            Organizer Wallets
                        </h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 dark:bg-slate-900 border-b border-slate-200 dark:border-white/5">
                                <tr>
                                    <th className="px-6 py-4">Organizer</th>
                                    <th className="px-6 py-4">Balance</th>
                                    <th className="px-6 py-4">Currency</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {wallets.data.map((wallet) => (
                                    <tr key={wallet.id} className="border-b border-slate-100 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-800 dark:text-white">{wallet.user?.name || "Unknown User"}</div>
                                            <div className="text-xs text-slate-500">{wallet.user?.email || "No Email"}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-black text-lg text-slate-900 dark:text-white">{Number(wallet.balance).toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-500">{wallet.currency}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                                                {wallet.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button 
                                                onClick={() => openAdjustModal(wallet, 'credit')}
                                                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:text-emerald-400 rounded-lg text-xs font-bold transition flex items-center gap-1 inline-flex"
                                            >
                                                <Plus className="w-3 h-3" /> Credit
                                            </button>
                                            <button 
                                                onClick={() => openAdjustModal(wallet, 'debit')}
                                                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 dark:text-rose-400 rounded-lg text-xs font-bold transition flex items-center gap-1 inline-flex"
                                            >
                                                <Minus className="w-3 h-3" /> Debit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination - Basic UI for now */}
                    <div className="p-4 border-t border-slate-200 dark:border-white/10 text-xs text-slate-500 text-center">
                        Showing {wallets.data.length} wallets
                    </div>
                </div>

                {/* Adjust Modal */}
                {adjustingWallet && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10">
                            <div className="p-6 border-b border-slate-100 dark:border-white/10">
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                                    {data.type === 'credit' ? 'Add Funds' : 'Deduct Funds'}
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">Adjusting balance for {adjustingWallet.user?.name || "Unknown User"}</p>
                            </div>
                            <form onSubmit={submitAdjust} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Amount (TZS)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={data.amount}
                                        onChange={(e) => setData('amount', e.target.value)}
                                        className="w-full rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                    />
                                    {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Reason / Notes</label>
                                    <input
                                        type="text"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        className="w-full rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="e.g. Manual correction, Refund..."
                                        required
                                    />
                                    {errors.notes && <p className="text-red-500 text-xs mt-1">{errors.notes}</p>}
                                </div>
                                
                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setAdjustingWallet(null)}
                                        className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className={`flex-1 py-2.5 px-4 font-bold rounded-xl transition text-white ${
                                            data.type === 'credit' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                                        }`}
                                    >
                                        {processing ? 'Saving...' : 'Confirm'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </KardovoAppLayout>
    );
}

