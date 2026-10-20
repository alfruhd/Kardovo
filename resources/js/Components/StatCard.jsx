import React from 'react';

export default function StatCard({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    trend, 
    className = '',
    titleColor = 'text-slate-900 dark:text-white',
    subtitleColor = 'text-emerald-600 dark:text-emerald-400 font-semibold',
    iconColor = 'text-emerald-600 dark:text-emerald-400',
    iconBg = 'bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20',
    valueColor = 'text-slate-900 dark:text-white',
    valueClassName = '',
    hoverBorder = ''
}) {
    const formattedValue = typeof value === 'number' ? value.toLocaleString() : (value ?? '');
    const strLen = typeof formattedValue === 'string' ? formattedValue.length : 0;

    // Auto-scale font size so long numbers and currency strings fit at full without truncation
    const autoSize = strLen > 14
        ? 'text-base sm:text-lg lg:text-xl'
        : (strLen > 9 ? 'text-lg sm:text-xl lg:text-2xl' : 'text-xl sm:text-2xl md:text-3xl');

    const resolvedValueClass = valueClassName || autoSize;

    return (
        <div className={`rounded-2xl p-3 sm:p-4 md:p-5 bg-white dark:bg-[#0B1524] border border-slate-200/80 dark:border-white/[0.08] shadow-xs flex flex-col justify-between min-w-0 ${className}`}>
            <div className="flex items-center justify-between gap-1.5">
                <span className={`text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider truncate ${titleColor}`}>
                    {title}
                </span>
                {Icon && (
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl border flex items-center justify-center flex-shrink-0 transition-colors ${iconBg} ${iconColor}`}>
                        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                )}
            </div>
            
            <div className="mt-2 sm:mt-3">
                <div 
                    title={typeof formattedValue === 'string' ? formattedValue : undefined}
                    className={`${resolvedValueClass} font-black tracking-tight font-mono whitespace-nowrap overflow-hidden text-ellipsis ${valueColor}`}
                >
                    {formattedValue}
                </div>
                {subtitle && (
                    <div className={`text-[10px] sm:text-xs mt-0.5 sm:mt-1 flex items-center gap-1.5 truncate ${subtitleColor}`}>
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
