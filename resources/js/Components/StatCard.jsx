import React from 'react';

export default function StatCard({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    trend, 
    className = '',
    titleColor = 'text-slate-900 dark:text-white',
    subtitleColor = 'text-cyan-600 dark:text-cyan-400 font-semibold',
    iconColor = 'text-cyan-600 dark:text-cyan-400',
    iconBg = 'bg-cyan-500/10 dark:bg-cyan-500/15 border border-cyan-500/20',
    valueColor = 'text-slate-900 dark:text-white',
    hoverBorder = 'hover:border-slate-300 dark:hover:border-slate-700'
}) {
    return (
        <div className={`group rounded-2xl p-4 sm:p-5 bg-white dark:bg-[#0B1524] border border-slate-200/80 dark:border-white/[0.08] shadow-xs hover:shadow-card ${hoverBorder} transition-all duration-200 flex flex-col justify-between ${className}`}>
            <div className="flex items-center justify-between gap-2">
                <span className={`text-[10.5px] sm:text-[11px] font-extrabold uppercase tracking-wider truncate ${titleColor}`}>
                    {title}
                </span>
                {Icon && (
                    <div className={`w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0 transition-colors ${iconBg} ${iconColor}`}>
                        <Icon className="w-4 h-4" />
                    </div>
                )}
            </div>
            
            <div className="mt-3">
                <div className={`text-2xl sm:text-3xl font-black tracking-tight font-mono ${valueColor}`}>
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </div>
                {subtitle && (
                    <div className={`text-[11px] sm:text-xs mt-1 flex items-center gap-1.5 truncate ${subtitleColor}`}>
                        {trend && (
                            <span className={trend > 0 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500'}>
                                {trend > 0 ? `+${trend}%` : `${trend}%`}
                            </span>
                        )}
                        <span className="truncate">{subtitle}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
