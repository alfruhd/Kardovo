import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Trophy, Share2, ShieldCheck, ArrowLeft, 
    Check, ChevronRight, Copy, MessageCircle
} from 'lucide-react';
import VotingModal from '@/Components/VotingModal';
import KardovoFooter from '@/Components/KardovoFooter';
import KardovoLogo from '@/Components/KardovoLogo';

export default function CandidateDirectVote({ event, candidate, category, otherCandidates = [] }) {
    const [voteModalOpen, setVoteModalOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareText = `Vote for ${candidate.name} in ${category?.name} for ${event.title}! Vote here: ${shareUrl}`;

    const handleShare = (network) => {
        if (network === 'whatsapp') {
            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
        } else if (network === 'twitter') {
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
        } else {
            navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const onVoteSuccess = () => {
        router.reload({ only: ['candidate'] });
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
            <Head title={`Vote for ${candidate.name} — ${event.title}`} />

            {/* Top Navigation */}
            <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#07111E]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-white/10 shadow-xs">
                <div className="max-w-4xl mx-auto px-4 h-16 sm:h-20 flex items-center justify-between">
                    <Link
                        href={route('events.publicVoting', event.id)}
                        className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 transition"
                    >
                        <ArrowLeft className="w-4 h-4 text-slate-400" />
                        <span>All Nominees & Categories</span>
                    </Link>

                    <Link href="/" className="flex items-center gap-2">
                        <KardovoLogo 
                            light={false} 
                            showText={true} 
                            textClassName="text-slate-900 dark:text-white text-base font-black tracking-widest" 
                            imgClassName="h-7 w-7" 
                        />
                    </Link>
                </div>
            </header>

            {/* Main Showcase */}
            <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12 flex-1 w-full space-y-8">
                {/* Contestant Campaign Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] overflow-hidden shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        {/* Portrait / Photo Section */}
                        <div className="relative aspect-square md:aspect-auto md:h-full min-h-[300px] sm:min-h-[360px] bg-slate-50 dark:bg-slate-850/60 flex items-center justify-center p-6 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800">
                            {candidate.photo_url ? (
                                <img
                                    src={candidate.photo_url}
                                    alt={candidate.name}
                                    className="w-full h-full object-cover rounded-2xl"
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center space-y-3 py-6">
                                    <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-tr from-[#154F7C] to-[#2E82BC] text-white flex items-center justify-center font-black text-5xl sm:text-6xl shadow-xl shadow-[#154F7C]/20 border-4 border-white/90 dark:border-white/10">
                                        {candidate.name.charAt(0)}
                                    </div>
                                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                        Official Nominee
                                    </span>
                                </div>
                            )}

                            {/* Floating Candidate Number Badge */}
                            <div className="absolute top-4 left-4">
                                <span className="px-3 py-1 rounded-xl bg-slate-900/80 dark:bg-black/80 backdrop-blur-md text-white text-xs font-mono font-bold shadow-xs">
                                    #{candidate.candidate_number || candidate.id}
                                </span>
                            </div>
                        </div>

                        {/* Nominee Campaign Info */}
                        <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-400">
                                        {category?.name}
                                    </span>
                                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2 leading-tight">
                                        {candidate.name}
                                    </h1>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        Competing in <span className="font-semibold text-slate-700 dark:text-slate-300">{event.title}</span>
                                    </p>
                                </div>

                                {/* Live Vote Tallies Display */}
                                {event.voting_visible_tallies && (
                                    <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                                        <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                                            Current Official Tallies
                                        </div>
                                        <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                                            {Number(candidate.total_votes || 0).toLocaleString()} <span className="text-sm font-semibold text-slate-400">Votes</span>
                                        </div>
                                    </div>
                                )}

                                {candidate.bio && (
                                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                        {candidate.bio}
                                    </p>
                                )}
                            </div>

                            {/* Primary Vote Button & Unified Social Share */}
                            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setVoteModalOpen(true)}
                                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#154F7C] to-[#327FB5] hover:from-[#1A5C91] hover:to-[#3D8EC7] text-white text-sm font-bold shadow-xs border border-sky-400/25 transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                                >
                                    <Trophy className="w-4 h-4 text-white" />
                                    <span>Vote for {candidate.name}</span>
                                </button>

                                {/* Unified Minimalist Share Tray */}
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleShare('whatsapp')}
                                        className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
                                    >
                                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                        <span>WhatsApp</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleShare('twitter')}
                                        className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
                                    >
                                        <Share2 className="w-3.5 h-3.5 text-slate-500" />
                                        <span>X (Twitter)</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleShare('copy')}
                                        className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
                                    >
                                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                                        <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                                    </button>
                                </div>

                                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>Verified by Kardovo Voting Engine</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Other Contestants in Category */}
                {otherCandidates.length > 0 && (
                    <div className="space-y-4 pt-2">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                More Nominees in {category?.name}
                            </h3>
                            <Link
                                href={route('events.publicVoting', event.id)}
                                className="text-xs font-semibold text-[#154F7C] dark:text-sky-400 hover:underline flex items-center gap-1"
                            >
                                <span>View all</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {otherCandidates.map((other) => (
                                <Link
                                    key={other.id}
                                    href={route('voting.candidateDirect', [event.id, other.id])}
                                    className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/[0.08] hover:border-sky-300 dark:hover:border-sky-500/50 transition flex items-center gap-2.5 group shadow-2xs"
                                >
                                    {other.photo_url ? (
                                        <img
                                            src={other.photo_url}
                                            alt={other.name}
                                            className="w-10 h-10 rounded-xl object-cover shrink-0"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-400 shrink-0">
                                            {other.name.charAt(0)}
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-[#154F7C] dark:group-hover:text-sky-400 transition-colors">
                                            {other.name}
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-mono">
                                            #{other.candidate_number || other.id}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            <VotingModal
                isOpen={voteModalOpen}
                onClose={() => setVoteModalOpen(false)}
                event={event}
                category={category}
                candidate={candidate}
                onSuccess={onVoteSuccess}
            />

            <KardovoFooter />
        </div>
    );
}
