import React from 'react';
import { router } from '@inertiajs/react';

export default function Pagination({
    links = [],
    from = 0,
    to = 0,
    total = 0,
    itemName = 'records',
    onPageChange = null,
}) {
    if (!links || links.length === 0 || total === 0) {
        return null;
    }

    const handleClick = (url) => {
        if (!url) return;
        if (onPageChange) {
            onPageChange(url);
        } else {
            router.visit(url, { preserveScroll: true, preserveState: true });
        }
    };

    return (
        <div className="p-4 border-t border-slate-200 dark:border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500 dark:text-slate-400">
                Showing <span className="font-bold text-slate-900 dark:text-white">{from || 0}</span> to{' '}
                <span className="font-bold text-slate-900 dark:text-white">{to || 0}</span> of{' '}
                <span className="font-bold text-slate-900 dark:text-white">{total || 0}</span> {itemName}
            </div>

            {links.length > 3 && (
                <div className="flex items-center gap-1 flex-wrap justify-center">
                    {links.map((link, i) => (
                        <button
                            key={i}
                            type="button"
                            disabled={!link.url}
                            onClick={() => handleClick(link.url)}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                            className={`px-3 py-1.5 text-xs rounded-xl border transition cursor-pointer ${
                                link.active
                                    ? 'bg-[#16A34A] text-white border-[#16A34A] font-bold shadow-2xs'
                                    : (!link.url
                                        ? 'text-slate-300 dark:text-slate-600 border-slate-200 dark:border-white/[0.08] cursor-not-allowed'
                                        : 'text-slate-700 dark:text-slate-200 border-slate-200 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/[0.06]')
                            }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
