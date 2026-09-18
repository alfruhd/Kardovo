import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { Plus } from 'lucide-react';

export default function CreateEventModal() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleOpen = () => setIsOpen(true);
        window.addEventListener('open-create-event-modal', handleOpen);
        return () => window.removeEventListener('open-create-event-modal', handleOpen);
    }, []);

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        event_type: 'Wedding Reception',
        event_date: '',
        event_time: '',
        city: '',
        venue: '',
    });

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        post(route('events.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setIsOpen(false);
            },
        });
    };

    const todayFormatted = new Date().toISOString().split('T')[0];

    return (
        <Modal show={isOpen} onClose={() => setIsOpen(false)} maxWidth="md">
            <form onSubmit={handleCreateSubmit} className="p-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/[0.08]">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                            <Plus className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">Create New Event</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Launch a new invitation portfolio</p>
                        </div>
                    </div>
                </div>

                <div className="mt-5 space-y-4">
                    <div>
                        <InputLabel htmlFor="create_title" value="Event Title *" />
                        <TextInput
                            id="create_title"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            className="mt-1 block w-full text-sm focus:border-emerald-500 focus:ring-emerald-500"
                            placeholder="e.g. Neema & Baraka — Wedding Reception"
                            required
                        />
                        <InputError message={errors.title} className="mt-1" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <InputLabel htmlFor="create_type" value="Event Type *" />
                            <select
                                id="create_type"
                                value={data.event_type}
                                onChange={(e) => setData('event_type', e.target.value)}
                                className="mt-1 block w-full text-xs rounded-xl border-slate-300 dark:border-slate-700 dark:bg-[#0B1524] dark:text-white shadow-xs focus:border-emerald-500 focus:ring-emerald-500"
                            >
                                <option value="Wedding Reception">Wedding Reception</option>
                                <option value="Send Off Party">Send Off Party</option>
                                <option value="Engagement">Engagement</option>
                                <option value="Birthday Gala">Birthday Gala</option>
                                <option value="Corporate Gala">Corporate Gala</option>
                                <option value="VIP Concert">VIP Concert</option>
                                <option value="Alumni Reunion">Alumni Reunion</option>
                                <option value="Private Dinner">Private Dinner</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <InputLabel htmlFor="create_date" value="Event Date *" />
                            <TextInput
                                id="create_date"
                                type="date"
                                min={todayFormatted}
                                value={data.event_date}
                                onChange={(e) => setData('event_date', e.target.value)}
                                className="mt-1 block w-full text-xs focus:border-emerald-500 focus:ring-emerald-500"
                                required
                            />
                            <InputError message={errors.event_date} className="mt-1" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <InputLabel htmlFor="create_time" value="Event Time" />
                            <TextInput
                                id="create_time"
                                value={data.event_time}
                                onChange={(e) => setData('event_time', e.target.value)}
                                className="mt-1 block w-full text-xs focus:border-emerald-500 focus:ring-emerald-500"
                                placeholder="4:00 PM — Reception & Dinner"
                            />
                        </div>

                        <div>
                            <InputLabel htmlFor="create_city" value="City / Location" />
                            <TextInput
                                id="create_city"
                                value={data.city}
                                onChange={(e) => setData('city', e.target.value)}
                                className="mt-1 block w-full text-xs focus:border-emerald-500 focus:ring-emerald-500"
                                placeholder="Dar es Salaam"
                            />
                        </div>
                    </div>

                    <div>
                        <InputLabel htmlFor="create_venue" value="Venue Name *" />
                        <TextInput
                            id="create_venue"
                            value={data.venue}
                            onChange={(e) => setData('venue', e.target.value)}
                            className="mt-1 block w-full text-xs focus:border-emerald-500 focus:ring-emerald-500"
                            placeholder="e.g. Kunduchi Beach Gardens"
                            required
                        />
                        <InputError message={errors.venue} className="mt-1" />
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/[0.08] flex items-center justify-end gap-2.5">
                    <SecondaryButton type="button" onClick={() => setIsOpen(false)}>
                        Cancel
                    </SecondaryButton>
                    <PrimaryButton type="submit" disabled={processing} className="bg-[#16A34A] hover:bg-[#15803D] text-white border border-[#16A34A]">
                        {processing ? 'Creating Event...' : 'Create Event Portfolio'}
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}

