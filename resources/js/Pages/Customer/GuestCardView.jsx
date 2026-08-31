import React from 'react';
import { Head, Link } from '@inertiajs/react';
import KardovoAppLayout from '@/Layouts/KardovoAppLayout';
import PersonalisedCard from '@/Components/PersonalisedCard';
import { ArrowLeft, ExternalLink } from 'lucide-react';

export default function GuestCardView({ guest, event, template }) {
    return (
        <KardovoAppLayout
            title={`Pass: ${guest.name}`}
            headerActions={
                <Link
                    href={route('events.show', event.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Guest List
                </Link>
            }
        >
            <Head title={`Pass: ${guest.name} - Kardovo`} />

            <div className="max-w-4xl mx-auto flex flex-col items-center space-y-6">
                <PersonalisedCard
                    guest={guest}
                    event={event}
                    template={template}
                    interactive={true}
                />

                <div className="w-full max-w-[480px] p-4 bg-white rounded-card border border-slate-200 text-xs flex items-center justify-between shadow-sm">
                    <span className="text-slate-500 font-medium">Public 1-Tap RSVP URL:</span>
                    <a
                        href={`/card/${guest.qr_token}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-kardovo-blue-dark font-bold hover:underline flex items-center gap-1"
                    >
                        /card/{guest.qr_token.substring(0, 14)}...
                        <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                </div>
            </div>
        </KardovoAppLayout>
    );
}
