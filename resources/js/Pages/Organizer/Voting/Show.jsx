import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import KardovoAppLayout from '@/Layouts/KardovoAppLayout';
import EventVotingManager from '@/Components/EventVotingManager';

export default function VotingShow({ competition, votingCategories = [], votingStats = {}, voteOrders = {} }) {
    return (
        <KardovoAppLayout
            title="Voting Portal"
            headerActions={
                <div className="flex items-center gap-2">
                    <Link
                        href={route('voting.portal.index')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-bold text-white bg-[#154F7C] hover:bg-[#114064] rounded-xl shadow-xs transition active:scale-[0.98] cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        <span>New Competition</span>
                    </Link>
                </div>
            }
        >
            <Head title={`${competition.title} - Voting Portal`} />

            <div className="max-w-7xl mx-auto space-y-6">
                <EventVotingManager
                    event={competition}
                    votingCategories={votingCategories}
                    votingStats={votingStats}
                    voteOrders={voteOrders}
                />
            </div>
        </KardovoAppLayout>
    );
}
