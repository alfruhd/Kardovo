import React, { useMemo } from 'react';
import { Check, X, ShieldAlert, ShieldCheck } from 'lucide-react';

export default function PasswordStrengthMeter({ password = '' }) {
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
        let color = 'bg-rose-500 text-rose-500';
        let width = 'w-1/4';

        if (score === 2) {
            label = 'Fair';
            color = 'bg-amber-500 text-amber-500';
            width = 'w-2/4';
        } else if (score === 3) {
            label = 'Good';
            color = 'bg-blue-500 text-blue-500';
            width = 'w-3/4';
        } else if (score === 4) {
            label = 'Strong';
            color = 'bg-emerald-500 text-emerald-500';
            width = 'w-full';
        }

        return {
            score,
            label,
            color,
            width,
            rules: [
                { label: 'At least 8 characters', passed: hasLength },
                { label: 'Uppercase & lowercase letters', passed: hasLower && hasUpper },
                { label: 'At least one number (0-9)', passed: hasNumber },
                { label: 'At least one special symbol (!@#$%^&*)', passed: hasSpecial },
            ],
        };
    }, [password]);

    if (!password) {
        return null;
    }

    return (
        <div className="mt-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/90 dark:border-white/[0.08] space-y-2 text-xs transition-all">
            {/* Strength Bar */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 font-bold">
                    {analysis.score === 4 ? (
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                    )}
                    <span className="text-[11px] text-slate-700 dark:text-slate-300">Password Strength:</span>
                    <span className={`text-[11px] font-black uppercase tracking-wider ${analysis.color.split(' ')[1]}`}>
                        {analysis.label}
                    </span>
                </div>
                <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400">
                    {analysis.score}/4 Requirements
                </span>
            </div>

            <div className="h-1.5 w-full bg-slate-200 dark:bg-white/[0.1] rounded-full overflow-hidden">
                <div className={`h-full ${analysis.width} ${analysis.color.split(' ')[0]} transition-all duration-300 rounded-full`} />
            </div>

            {/* Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                {analysis.rules.map((rule, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-[10.5px]">
                        {rule.passed ? (
                            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                                <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                            </span>
                        ) : (
                            <span className="w-3.5 h-3.5 rounded-full bg-slate-200 dark:bg-white/[0.1] text-slate-600 dark:text-slate-400 flex items-center justify-center flex-shrink-0">
                                <X className="w-2.5 h-2.5" />
                            </span>
                        )}
                        <span className={rule.passed ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-600 dark:text-slate-400'}>
                            {rule.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
