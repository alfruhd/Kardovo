import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { Cookie, ShieldCheck, X, Check } from 'lucide-react';
import KardovoLogo from '@/Components/KardovoLogo';

export default function CookieConsentBanner() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        try {
            const consent = localStorage.getItem('kardovo_cookie_consent');
            if (!consent) {
                // Subtle non-intrusive appearance after 1.2s
                setVisible(true);
            }
        } catch (e) {
            // LocalStorage inaccessible
        }
    }, []);

    const handleAcceptAll = () => {
        try {
            localStorage.setItem('kardovo_cookie_consent', JSON.stringify({
                status: 'accepted_all',
                essential: true,
                analytics: true,
                timestamp: new Date().toISOString()
            }));
        } catch (e) {}
        setVisible(false);
    };

    const handleEssentialOnly = () => {
        try {
            localStorage.setItem('kardovo_cookie_consent', JSON.stringify({
                status: 'essential_only',
                essential: true,
                analytics: false,
                timestamp: new Date().toISOString()
            }));
        } catch (e) {}
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <aside
            role="region"
            aria-label="Privacy and Cookie Preferences"
            className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-50 animate-fadeIn"
        >
            <div className="bg-white/95 backdrop-blur-xl text-slate-800 p-5 rounded-2xl border border-slate-200/90 shadow-[0_20px_50px_rgba(17,30,46,0.18)] space-y-3.5 transition-all">
                {/* Header: Kardovo Brand Badge & Close Button */}
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                            <Cookie className="w-4 h-4" aria-hidden="true" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-900 font-display">
                            Cookie Notice & Privacy
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={handleEssentialOnly}
                        className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                        aria-label="Close and continue with essential cookies only"
                    >
                        <X className="w-4 h-4" aria-hidden="true" />
                    </button>
                </div>

                {/* Body Text */}
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    We use strictly essential session cookies to ensure secure logins, defend against CSRF attacks, and process ticket orders safely. We do not sell your personal data or use third-party advertising trackers.
                </p>

                {/* Action Buttons in Kardovo Theme: Brand Green / Navy */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                    <button
                        type="button"
                        onClick={handleAcceptAll}
                        className="flex-1 py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                        <Check className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Accept All</span>
                    </button>
                    <button
                        type="button"
                        onClick={handleEssentialOnly}
                        className="flex-1 py-2 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 text-xs font-semibold transition-all border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 cursor-pointer"
                    >
                        Essential Only
                    </button>
                    <Link
                        href="/cookies"
                        className="py-2 px-2.5 text-center text-xs text-slate-500 hover:text-emerald-600 font-medium underline underline-offset-2 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded-lg"
                    >
                        Learn More
                    </Link>
                </div>
            </div>
        </aside>
    );
}
