import React from 'react';
import { Link } from '@inertiajs/react';
import { Calendar, Plus, LayoutDashboard } from 'lucide-react';

export default function EmptyEventState({
    title = "No Event Selected",
    description = "Please select an event from the dashboard to view its details",
    buttonText = "Go to Dashboard",
    buttonHref = route('dashboard'),
    actionButton = null,
    onCreateEvent = null,
    showCreateEvent = true,
    icon: Icon = Calendar,
}) {
    return (
        <div className="rounded-3xl border-2 border-dashed border-emerald-500/20 dark:border-emerald-500/30 bg-white/80 dark:bg-[#0B1524] py-16 sm:py-20 px-6 text-center space-y-4 shadow-xs hover:border-emerald-500/40 transition-all max-w-4xl mx-auto my-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-2xs">
                <Icon className="w-8 h-8 stroke-[1.75]" />
            </div>

            <div className="space-y-1.5">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight">
                    {title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    {description}
                </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                {actionButton ? (
                    actionButton
                ) : (
                    <Link
                        href={buttonHref}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] border border-[#16A34A] text-white font-bold text-xs sm:text-sm shadow-xs transition active:scale-95 cursor-pointer"
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        <span>{buttonText}</span>
                    </Link>
                )}

                {showCreateEvent && (
                    <button
                        type="button"
                        onClick={onCreateEvent || (() => window.dispatchEvent(new CustomEvent('open-create-event-modal')))}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.14] border border-slate-200 dark:border-white/[0.12] text-slate-800 dark:text-white font-bold text-xs sm:text-sm shadow-xs transition active:scale-95 cursor-pointer"
                    >
                        <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
                        <span>Create Event</span>
                    </button>
                )}
            </div>
        </div>
    );
}
