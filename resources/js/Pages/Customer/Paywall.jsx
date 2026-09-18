import React from 'react';
import { Head } from '@inertiajs/react';
import KardovoAppLayout from '@/Layouts/KardovoAppLayout';
import EmptyEventState from '@/Components/EmptyEventState';
import { CreditCard } from 'lucide-react';

export default function Paywall() {
    return (
        <KardovoAppLayout title="Payment Required">
            <Head title="Payment Required - Kardovo" />
            <div className="max-w-7xl mx-auto py-12 px-4">
                <EmptyEventState
                    title="Payment Required"
                    description="Please purchase a package to unlock access to Card Templates, Events, Messaging, and Gate Scanner."
                    buttonText="Go to Payment"
                    buttonHref={route('organizer.wallet.index')}
                    icon={CreditCard}
                    showCreateEvent={false}
                />
            </div>
        </KardovoAppLayout>
    );
}

