import React, { useMemo } from 'react';
import { Check, X, ShieldAlert, ShieldCheck } from 'lucide-react';

export default function PasswordStrengthMeter({ password = '', dark = false }) {
    const analysis = useMemo(() => {
        const hasLength = password.length >= 8;
        const hasLower = /[a-z]/.test(password);
        const hasUpper = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[^A-Za-z0-9]/.test(password);

        let score = 0;
        if (hasLength) score += 1;
        if (hasLower && hasUpper) score += 1;
        if (hasNumber) score += 1;
        if (hasSpecial) score += 1;

        let label = 'Very Weak';
        let barColor = 'bg-rose-500';
        let badgeStyle = dark 
            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' 
            : 'bg-rose-100 text-rose-700 border-rose-200';
        let iconColor = 'text-rose-500';

        if (score === 2) {
            label = 'Fair';
            barColor = 'bg-amber-500';
            badgeStyle = dark 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                : 'bg-amber-100 text-amber-800 border-amber-200';
            iconColor = 'text-amber-500';
        } else if (score === 3) {
            label = 'Good';
            barColor = 'bg-blue-500';
            badgeStyle = dark 
                ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' 
                : 'bg-blue-100 text-blue-800 border-blue-200';
            iconColor = 'text-blue-500';
        } else if (score === 4) {
            label = 'Strong';
            barColor = 'bg-emerald-500';
            badgeStyle = dark 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                : 'bg-emerald-100 text-emerald-800 border-emerald-200';
            iconColor = 'text-emerald-500';
        }

        return {
            score,
            label,
            barColor,
            badgeStyle,
            iconColor,
            rules: [
                { label: 'At least 8 characters', passed: hasLength },
                { label: 'Upper & lowercase letters', passed: hasLower && hasUpper },
                { label: 'At least one number (0-9)', passed: hasNumber },
                { label: 'Special symbol (!@#$%^&*)', passed: hasSpecial },
            ],
        };
    }, [password, dark]);

    if (!password) {
        return null;
    }

    return (
        <div className={`mt-2 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border transition-all duration-200 ${
            dark 
                ? 'bg-white/[0.07] border-white/15 backdrop-blur-md' 
                : 'bg-slate-50/95 border-slate-200/90 shadow-2xs'
        }`}>
            {/* Header: Status badge & Requirements count */}
            <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                    {analysis.score === 4 ? (
                        <ShieldCheck className={`w-3.5 h-3.5 flex-shrink-0 ${analysis.iconColor}`} />
                    ) : (
                        <ShieldAlert className={`w-3.5 h-3.5 flex-shrink-0 ${analysis.iconColor}`} />
                    )}
                    <span className={`text-[11px] font-bold ${dark ? 'text-white/80' : 'text-slate-700'}`}>
                        Password:
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${analysis.badgeStyle}`}>
                        {analysis.label}
                    </span>
                </div>
                <span className={`text-[10.5px] font-mono font-medium flex-shrink-0 ${dark ? 'text-white/60' : 'text-slate-500'}`}>
                    {analysis.score}/4 met
                </span>
            </div>

            {/* Segmented Strength Bar (4 Segments) */}
            <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full mb-2">
                {[1, 2, 3, 4].map((step) => (
                    <div
                        key={step}
                        className={`h-full rounded-full transition-all duration-300 ${
                            step <= analysis.score
                                ? analysis.barColor
                                : (dark ? 'bg-white/15' : 'bg-slate-200')
                        }`}
                    />
                ))}
            </div>

            {/* Checklist items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-1.5 pt-0.5">
                {analysis.rules.map((rule, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-[10.5px]">
                        {rule.passed ? (
                            <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 ${
                                dark ? 'bg-emerald-500/25 text-emerald-300' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            }`}>
                                <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                            </span>
                        ) : (
                            <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 ${
                                dark ? 'bg-white/10 text-white/40' : 'bg-slate-200 text-slate-400'
                            }`}>
                                <X className="w-2.5 h-2.5 stroke-[2.5]" />
                            </span>
                        )}
                        <span className={`truncate ${
                            rule.passed 
                                ? (dark ? 'text-white font-medium' : 'text-slate-800 font-semibold')
                                : (dark ? 'text-white/50' : 'text-slate-400')
                        }`}>
                            {rule.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
