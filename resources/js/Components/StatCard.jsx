import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'blue' }) {
    const colorClasses = {
        blue: 'text-cyan-600 dark:text-cyan-400 bg-blue-50 dark:bg-cyan-950/40 border border-blue-200/60 dark:border-cyan-800/40',
        green: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40',
        amber: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40',
        navy: 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.08] border border-slate-200/60 dark:border-white/[0.08]',
    };

    return (
        <div className="bg-white dark:bg-[#0B1524] rounded-3xl border border-slate-200/90 dark:border-white/[0.08] p-5 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between">
            <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {title}
                </span>
                {Icon && (
                    <div className={`p-2.5 rounded-2xl ${colorClasses[color] || colorClasses.blue}`}>
                        <Icon className="w-4 h-4" />
                    </div>
                )}
            </div>
            
            <div className="mt-3">
                <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </div>
                {subtitle && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium flex items-center gap-1.5">
                        {trend && (
                            <span className={trend > 0 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500'}>
                                {trend > 0 ? `+${trend}%` : `${trend}%`}
                            </span>
                        )}
                        <span>{subtitle}</span>
                    </p>
                )}
            </div>
        </div>
    );
}
