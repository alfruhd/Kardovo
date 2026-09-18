import React, { useState, useMemo } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import KardovoAppLayout from '@/Layouts/KardovoAppLayout';
import EmptyEventState from '@/Components/EmptyEventState';
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Plus,
    MapPin,
    Clock,
    Search,
    X,
    User as UserIcon,
    Shield,
} from 'lucide-react';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS_MON = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAYS_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function CalendarPage({
    events = [],
    templates = [],
    organizers = [],
    isAdmin = false
}) {
    const { auth } = usePage().props;
    const user = auth?.user;

    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    const todayDate = today.getDate();
    const todayFormatted = `${todayYear}-${String(todayMonth + 1).padStart(2, '0')}-${String(todayDate).padStart(2, '0')}`;

    const [viewYear, setViewYear] = useState(todayYear);
    const [viewMonth, setViewMonth] = useState(todayMonth);
    const [selectedDate, setSelectedDate] = useState(todayFormatted);
    // 'day' | 'week' | 'month' | 'year'
    const [viewMode, setViewMode] = useState('month');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedOrganizer, setSelectedOrganizer] = useState('all');
    const [createModalOpen, setCreateModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        title: '',
        event_type: 'Wedding Reception',
        event_date: todayFormatted,
        event_time: '',
        venue: '',
        city: '',
        description: '',
        card_template_id: '',
        user_id: '',
    });

    const getEventDateKey = (eventDate) => {
        if (!eventDate) return '';
        if (typeof eventDate === 'string') return eventDate.substring(0, 10);
        try {
            const d = new Date(eventDate);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        } catch { return ''; }
    };

    const filteredEvents = useMemo(() => {
        return events.filter(event => {
            const matchSearch = !searchQuery ||
                (event.title && event.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (event.venue && event.venue.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (event.city && event.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (event.user?.name && event.user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (event.user?.email && event.user.email.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchType = selectedType === 'all' || event.event_type === selectedType;
            const matchOrganizer = selectedOrganizer === 'all' || String(event.user_id) === String(selectedOrganizer);
            return matchSearch && matchType && matchOrganizer;
        });
    }, [events, searchQuery, selectedType, selectedOrganizer]);

    const eventsByDate = useMemo(() => {
        const map = {};
        filteredEvents.forEach(event => {
            const key = getEventDateKey(event.event_date);
            if (key) {
                if (!map[key]) map[key] = [];
                map[key].push(event);
            }
        });
        return map;
    }, [filteredEvents]);

    const eventTypes = useMemo(() => {
        const set = new Set();
        events.forEach(e => { if (e.event_type) set.add(e.event_type); });
        return Array.from(set);
    }, [events]);

    // Navigation: prev/next depends on view mode
    const navigate = (dir) => {
        if (viewMode === 'day') {
            const d = new Date(selectedDate);
            d.setDate(d.getDate() + dir);
            const newStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            setSelectedDate(newStr);
            setViewMonth(d.getMonth());
            setViewYear(d.getFullYear());
        } else if (viewMode === 'week') {
            const d = new Date(selectedDate);
            d.setDate(d.getDate() + dir * 7);
            const newStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            setSelectedDate(newStr);
            setViewMonth(d.getMonth());
            setViewYear(d.getFullYear());
        } else if (viewMode === 'month') {
            if (dir === -1) {
                if (viewMonth === 0) { setViewMonth(11); setViewYear(v => v - 1); }
                else setViewMonth(v => v - 1);
            } else {
                if (viewMonth === 11) { setViewMonth(0); setViewYear(v => v + 1); }
                else setViewMonth(v => v + 1);
            }
        } else if (viewMode === 'year') {
            setViewYear(v => v + dir);
        }
    };

    const goToToday = () => {
        setViewYear(todayYear);
        setViewMonth(todayMonth);
        setSelectedDate(todayFormatted);
    };

    const openCreateModalForDate = (dateStr) => {
        clearErrors();
        const effectiveDate = (dateStr && dateStr >= todayFormatted) ? dateStr : todayFormatted;
        setData({ ...data, event_date: effectiveDate, title: '', venue: '', description: '' });
        setCreateModalOpen(true);
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        post(route('events.store'), {
            onSuccess: () => { setCreateModalOpen(false); reset(); }
        });
    };

    const selectedDateEvents = useMemo(() => eventsByDate[selectedDate] || [], [eventsByDate, selectedDate]);

    const formattedSelectedDate = useMemo(() => {
        if (!selectedDate) return '';
        const parts = selectedDate.split('-');
        if (parts.length === 3) {
            const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
            return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        }
        return selectedDate;
    }, [selectedDate]);

    const agendaGroupedEvents = useMemo(() => {
        const sorted = [...filteredEvents].sort((a, b) => getEventDateKey(a.event_date).localeCompare(getEventDateKey(b.event_date)));
        const groups = {};
        sorted.forEach(event => {
            if (!event.event_date) return;
            const key = getEventDateKey(event.event_date);
            const parts = key.split('-');
            if (parts.length >= 2) {
                const monthKey = `${parts[0]}-${parts[1]}`;
                const monthLabel = `${MONTH_NAMES[parseInt(parts[1], 10) - 1]} ${parts[0]}`;
                if (!groups[monthKey]) groups[monthKey] = { monthKey, monthLabel, events: [] };
                groups[monthKey].events.push(event);
            }
        });
        return Object.values(groups);
    }, [filteredEvents]);

    const getEventTypeStyles = (type = '') => {
        return {
            dot: 'bg-[#16A34A] dark:bg-emerald-400',
            bar: 'bg-emerald-500/15 border-l-2 border-[#16A34A] text-emerald-800 dark:text-emerald-300'
        };
    };

    // Build Mon-first month cells
    const buildMonthCells = () => {
        const firstDay = new Date(viewYear, viewMonth, 1).getDay();
        const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
        const daysInPrev = new Date(viewYear, viewMonth, 0).getDate();
        const offset = (firstDay + 6) % 7;
        const cells = [];

        for (let i = offset - 1; i >= 0; i--) {
            const dayNum = daysInPrev - i;
            const prevM = viewMonth === 0 ? 11 : viewMonth - 1;
            const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
            const dateStr = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            cells.push({ dayNumber: dayNum, dateStr, isCurrentMonth: false, events: eventsByDate[dateStr] || [] });
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            cells.push({ dayNumber: d, dateStr, isCurrentMonth: true, isToday: dateStr === todayFormatted, isSelected: dateStr === selectedDate, events: eventsByDate[dateStr] || [] });
        }

        const total = cells.length <= 35 ? 35 : 42;
        for (let n = 1; n <= total - cells.length; n++) {
            const nextM = viewMonth === 11 ? 0 : viewMonth + 1;
            const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
            const dateStr = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(n).padStart(2, '0')}`;
            cells.push({ dayNumber: n, dateStr, isCurrentMonth: false, events: eventsByDate[dateStr] || [] });
        }

        return cells;
    };

    // Build week days (Mon-Sun) containing selectedDate
    const buildWeekDays = () => {
        const parts = selectedDate.split('-');
        const base = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        // Get Monday of this week
        const dayOfWeek = base.getDay(); // 0=Sun
        const monOffset = (dayOfWeek + 6) % 7;
        const monday = new Date(base);
        monday.setDate(base.getDate() - monOffset);

        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            days.push({
                dayNumber: d.getDate(),
                dayLabel: DAYS_MON[i],
                monthShort: MONTH_SHORT[d.getMonth()],
                dateStr,
                isToday: dateStr === todayFormatted,
                isSelected: dateStr === selectedDate,
                events: eventsByDate[dateStr] || [],
            });
        }
        return days;
    };

    // Header label
    const headerLabel = useMemo(() => {
        if (viewMode === 'day') return formattedSelectedDate;
        if (viewMode === 'week') {
            const days = buildWeekDays();
            const first = days[0];
            const last = days[6];
            return `${first.monthShort} ${first.dayNumber} – ${last.monthShort} ${last.dayNumber}, ${viewYear}`;
        }
        if (viewMode === 'month') return `${MONTH_NAMES[viewMonth]} ${viewYear}`;
        if (viewMode === 'year') return `${viewYear}`;
        return '';
    }, [viewMode, viewMonth, viewYear, formattedSelectedDate, selectedDate]);

    const VIEW_MODES = [
        { key: 'day', label: 'Day' },
        { key: 'week', label: 'Week' },
        { key: 'month', label: 'Month' },
        { key: 'year', label: 'Year' },
    ];

    const EventRow = ({ event }) => {
        const style = getEventTypeStyles(event.event_type);
        return (
            <div className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 group">
                <div className="min-w-0 flex-1 space-y-1">
                    <Link
                        href={route('events.show', event.id)}
                        className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors truncate block"
                    >
                        {event.title}
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                        {event.event_type && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
                                {event.event_type}
                            </span>
                        )}
                        {event.event_time && (
                            <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />{event.event_time}
                            </span>
                        )}
                        {(event.venue || event.city) && (
                            <span className="flex items-center gap-1 truncate">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />{event.venue || event.city}
                            </span>
                        )}
                        {isAdmin && event.user && (
                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] text-[10px] font-medium text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-white/[0.08]">
                                <UserIcon className="w-3 h-3 text-slate-400" />
                                <span className="truncate max-w-[120px]">{event.user.name}</span>
                            </span>
                        )}
                    </div>
                </div>
                <Link
                    href={route('events.show', event.id)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.05] hover:bg-emerald-500 text-slate-700 dark:text-slate-300 hover:text-white font-bold text-xs border border-slate-200/70 dark:border-white/[0.08] hover:border-transparent transition-all flex items-center gap-1 active:scale-95 flex-shrink-0"
                >
                    Manage <ChevronRight className="w-3.5 h-3.5" />
                </Link>
            </div>
        );
    };

    const NoEvents = () => (
        <div className="text-center py-6 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/[0.06]">
            <CalendarIcon className="w-7 h-7 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">No events</p>
        </div>
    );

    return (
        <KardovoAppLayout title="Event Calendar">
            <Head title="Event Calendar - Kardovo" />

            <div className="max-w-7xl mx-auto pb-12 space-y-4">
                {isAdmin && (
                    <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-xs font-bold font-display">
                                System Administrator Master Calendar — Viewing all events across {organizers.length} registered organizers
                            </span>
                        </div>
                        <span className="text-[11px] font-mono font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                            {events.length} Total Events
                        </span>
                    </div>
                )}

                {events.length === 0 ? (
                    <EmptyEventState
                        title={isAdmin ? "No Events Found" : "No Events Scheduled"}
                        description={isAdmin ? "No events exist across any organizer yet. Create an event to get started." : "You have not scheduled any events yet. Click below to schedule your first event."}
                        actionButton={
                            <button
                                type="button"
                                onClick={() => openCreateModalForDate(todayFormatted)}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] border border-[#16A34A] text-white font-bold text-xs sm:text-sm shadow-xs transition active:scale-95 cursor-pointer"
                            >
                                <Plus className="w-4 h-4" />
                                <span>{isAdmin ? "Create First Event" : "Create Event"}</span>
                            </button>
                        }
                    />
                ) : (
                    <div className="bg-white dark:bg-[#0B1524] rounded-3xl border border-slate-200/60 dark:border-white/[0.08] shadow-sm overflow-hidden">

                        {/* ── TOP BAR ── */}
                        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 dark:border-white/[0.08] bg-white dark:bg-[#0B1524]">

                            {/* Month/Period label */}
                            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-display tracking-tight min-w-[160px]">
                                {headerLabel.split(' ').map((word, i, arr) => {
                                    // last word (year) gets muted color
                                    if (i === arr.length - 1 && /^\d{4}$/.test(word)) {
                                        return <span key={i} className="text-slate-400 dark:text-slate-500 font-semibold"> {word}</span>;
                                    }
                                    return <span key={i}>{i > 0 && !/^\d{4}$/.test(arr[i-1]) ? ' ' : ''}{word}</span>;
                                })}
                            </h2>

                            {/* Center: View toggle + Filter + Search */}
                            <div className="flex items-center gap-2 flex-wrap">
                                {/* View toggle: Day / Week / Month / Year */}
                                <div className="flex items-center bg-slate-100 dark:bg-[#07111D] rounded-full p-0.5 border border-slate-200/80 dark:border-white/[0.08]">
                                    {VIEW_MODES.map(({ key, label }) => (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => setViewMode(key)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                                                viewMode === key
                                                    ? 'bg-[#0B2545] dark:bg-[#16A34A] text-white shadow-sm'
                                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>

                                {/* Filter */}
                                <select
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                    className="text-xs bg-slate-100 dark:bg-[#07111D] border border-slate-200/80 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 rounded-full py-1.5 px-3.5 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 font-semibold cursor-pointer"
                                >
                                    <option value="all">All Event Types</option>
                                    {eventTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>

                                {/* Admin Organizer Filter */}
                                {isAdmin && organizers.length > 0 && (
                                    <select
                                        value={selectedOrganizer}
                                        onChange={(e) => setSelectedOrganizer(e.target.value)}
                                        className="text-xs bg-slate-100 dark:bg-[#07111D] border border-slate-200/80 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 rounded-full py-1.5 px-3.5 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 font-semibold cursor-pointer max-w-[150px] truncate"
                                    >
                                        <option value="all">All Organizers</option>
                                        {organizers.map(org => (
                                            <option key={org.id} value={org.id}>{org.name}</option>
                                        ))}
                                    </select>
                                )}

                                {/* Search */}
                                <div className="relative">
                                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search..."
                                        className="pl-8 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-[#07111D] border border-slate-200/80 dark:border-white/[0.08] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-full focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 w-32"
                                    />
                                </div>
                            </div>

                            {/* Nav: prev / Today / next */}
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => navigate(-1)}
                                    className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-transparent hover:border-slate-200 dark:hover:border-white/[0.08] transition cursor-pointer"
                                    aria-label="Previous"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={goToToday}
                                    className="px-3.5 py-1.5 text-xs font-bold rounded-lg border border-slate-200/80 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition cursor-pointer"
                                >
                                    Today
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate(1)}
                                    className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-transparent hover:border-slate-200 dark:hover:border-white/[0.08] transition cursor-pointer"
                                    aria-label="Next"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* ── DAY VIEW ── */}
                        {viewMode === 'day' && (
                            <div className="p-5 sm:p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-bold font-mono text-emerald-500 dark:text-emerald-400 uppercase tracking-wider">Daily Schedule</p>
                                        <h3 className="text-base font-black text-slate-900 dark:text-white font-display">{formattedSelectedDate}</h3>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => openCreateModalForDate(selectedDate)}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold rounded-xl transition active:scale-95 cursor-pointer"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Add Event
                                    </button>
                                </div>

                                {selectedDateEvents.length > 0 ? (
                                    <div className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                                        {selectedDateEvents.map(ev => <EventRow key={ev.id} event={ev} />)}
                                    </div>
                                ) : <NoEvents />}
                            </div>
                        )}

                        {/* ── WEEK VIEW ── */}
                        {viewMode === 'week' && (() => {
                            const weekDays = buildWeekDays();
                            return (
                                <div>
                                    {/* Week day headers */}
                                    <div className="grid grid-cols-7 border-b border-slate-100 dark:border-white/[0.06]">
                                        {weekDays.map((day) => (
                                            <button
                                                key={day.dateStr}
                                                type="button"
                                                onClick={() => setSelectedDate(day.dateStr)}
                                                className={`py-3 px-1 text-center cursor-pointer transition-colors ${
                                                    day.isSelected ? 'bg-emerald-50 dark:bg-emerald-950/20' : 'hover:bg-slate-50 dark:hover:bg-white/[0.02]'
                                                }`}
                                            >
                                                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">{day.dayLabel}</div>
                                                <div className={`mx-auto mt-1 w-7 h-7 rounded-full flex items-center justify-center text-sm font-black ${
                                                    day.isToday
                                                        ? 'bg-[#0B2545] dark:bg-[#16A34A] text-white'
                                                        : day.isSelected
                                                            ? 'text-emerald-600 dark:text-emerald-400'
                                                            : 'text-slate-700 dark:text-slate-200'
                                                }`}>
                                                    {day.dayNumber}
                                                </div>
                                                {day.events.length > 0 && (
                                                    <div className="mt-1.5 space-y-1 px-1 overflow-hidden">
                                                        {day.events.slice(0, 2).map((ev) => {
                                                            const style = getEventTypeStyles(ev.event_type);
                                                            return (
                                                                <div
                                                                    key={ev.id}
                                                                    className="hidden sm:flex items-center gap-1 px-1 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 truncate text-left"
                                                                    title={ev.title}
                                                                >
                                                                    <span className={`w-1 h-1 rounded-full flex-shrink-0 ${style.dot}`} />
                                                                    <span className="truncate">{ev.title}</span>
                                                                </div>
                                                            );
                                                        })}
                                                        <div className="sm:hidden flex justify-center gap-0.5">
                                                            {day.events.slice(0, 3).map((ev, i) => (
                                                                <span key={i} className={`w-1 h-1 rounded-full ${getEventTypeStyles(ev.event_type).dot}`} />
                                                            ))}
                                                        </div>
                                                        {day.events.length > 2 && (
                                                            <div className="hidden sm:block text-[8px] font-bold text-slate-400 dark:text-slate-500 text-left pl-0.5">
                                                                +{day.events.length - 2}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Selected day events */}
                                    <div className="p-5 sm:p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <p className="text-[10px] font-bold font-mono text-emerald-500 dark:text-emerald-400 uppercase tracking-wider">Selected Day</p>
                                                <h3 className="text-sm font-black text-slate-900 dark:text-white font-display">{formattedSelectedDate}</h3>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => openCreateModalForDate(selectedDate)}
                                                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold rounded-xl transition active:scale-95 cursor-pointer"
                                            >
                                                <Plus className="w-3.5 h-3.5" /> Add Event
                                            </button>
                                        </div>
                                        {selectedDateEvents.length > 0 ? (
                                            <div className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                                                {selectedDateEvents.map(ev => <EventRow key={ev.id} event={ev} />)}
                                            </div>
                                        ) : <NoEvents />}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* ── MONTH VIEW ── */}
                        {viewMode === 'month' && (
                            <>
                                {/* Day headers */}
                                <div className="grid grid-cols-7 border-b border-slate-100 dark:border-white/[0.06]">
                                    {DAYS_MON.map((day) => (
                                        <div key={day} className="py-3 text-center text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Date cells */}
                                <div className="grid grid-cols-7">
                                    {buildMonthCells().map((cell, idx) => {
                                        const isSelected = cell.dateStr === selectedDate;
                                        return (
                                            <div
                                                key={`${cell.dateStr}-${idx}`}
                                                role="button"
                                                tabIndex={0}
                                                onClick={() => setSelectedDate(cell.dateStr)}
                                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedDate(cell.dateStr); } }}
                                                className={`min-h-[90px] sm:min-h-[110px] p-2 sm:p-3 border-b border-r border-slate-100 dark:border-white/[0.05] cursor-pointer select-none transition-colors ${
                                                    isSelected
                                                        ? 'bg-emerald-50/80 dark:bg-emerald-950/20'
                                                        : cell.isCurrentMonth
                                                            ? 'hover:bg-slate-50 dark:hover:bg-white/[0.03]'
                                                            : 'bg-slate-50/30 dark:bg-transparent opacity-60'
                                                }`}
                                            >
                                                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${
                                                    cell.isToday
                                                        ? 'bg-[#0B2545] dark:bg-[#16A34A] text-white'
                                                        : isSelected
                                                            ? 'text-emerald-600 dark:text-emerald-400 font-black'
                                                            : cell.isCurrentMonth
                                                                ? 'text-slate-700 dark:text-slate-200'
                                                                : 'text-slate-300 dark:text-slate-600'
                                                }`}>
                                                    {cell.dayNumber}
                                                </span>

                                                {cell.events.length > 0 && (
                                                    <div className="space-y-1 mt-1.5 overflow-hidden">
                                                        {cell.events.slice(0, 2).map((ev) => {
                                                            const style = getEventTypeStyles(ev.event_type);
                                                            return (
                                                                <div
                                                                    key={ev.id}
                                                                    className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 truncate text-left"
                                                                    title={ev.title}
                                                                >
                                                                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${style.dot}`} />
                                                                    <span className="truncate">{ev.title}</span>
                                                                </div>
                                                            );
                                                        })}
                                                        {cell.events.length > 2 && (
                                                            <div className="text-[9px] font-bold text-slate-400 dark:text-slate-500 pl-0.5 text-left">
                                                                +{cell.events.length - 2} more
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Selected Schedule panel */}
                                <div className="border-t border-slate-100 dark:border-white/[0.08] p-5 sm:p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <p className="text-[10px] font-bold font-mono text-emerald-500 dark:text-emerald-400 uppercase tracking-wider">Selected Schedule</p>
                                            <h3 className="text-base font-black text-slate-900 dark:text-white font-display">{formattedSelectedDate}</h3>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => openCreateModalForDate(selectedDate)}
                                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold rounded-xl transition active:scale-95 cursor-pointer"
                                        >
                                            <Plus className="w-3.5 h-3.5" /> Add Event
                                        </button>
                                    </div>

                                    {selectedDateEvents.length > 0 ? (
                                        <div className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                                            {selectedDateEvents.map(ev => <EventRow key={ev.id} event={ev} />)}
                                        </div>
                                    ) : <NoEvents />}
                                </div>
                            </>
                        )}

                        {/* ── YEAR VIEW ── */}
                        {viewMode === 'year' && (
                            <div className="p-5 sm:p-6">
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {MONTH_NAMES.map((name, mIdx) => {
                                        const firstDay = new Date(viewYear, mIdx, 1).getDay();
                                        const daysInMonth = new Date(viewYear, mIdx + 1, 0).getDate();
                                        const offset = (firstDay + 6) % 7;
                                        const isCurrentMonth = mIdx === todayMonth && viewYear === todayYear;
                                        const isSelectedMonth = mIdx === viewMonth && viewYear === viewYear;

                                        // Build mini cells
                                        const miniCells = [];
                                        for (let i = 0; i < offset; i++) miniCells.push(null);
                                        for (let d = 1; d <= daysInMonth; d++) {
                                            const dateStr = `${viewYear}-${String(mIdx + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                                            miniCells.push({ d, dateStr, isToday: dateStr === todayFormatted, hasEvents: (eventsByDate[dateStr] || []).length > 0 });
                                        }

                                        return (
                                            <div
                                                key={mIdx}
                                                className={`rounded-2xl border p-3 cursor-pointer transition-colors ${
                                                    isCurrentMonth
                                                        ? 'border-emerald-500/30 dark:border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/20'
                                                        : 'border-slate-200/70 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.12] hover:bg-slate-50 dark:hover:bg-white/[0.03]'
                                                }`}
                                                onClick={() => { setViewMonth(mIdx); setViewMode('month'); }}
                                            >
                                                <div className={`text-xs font-black mb-2 ${isCurrentMonth ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                                    {name}
                                                </div>
                                                {/* Mini grid */}
                                                <div className="grid grid-cols-7 gap-px">
                                                    {['M','T','W','T','F','S','S'].map((d, i) => (
                                                        <div key={i} className="text-[8px] text-slate-400 dark:text-slate-600 text-center font-bold">{d}</div>
                                                    ))}
                                                    {miniCells.map((cell, i) => (
                                                        <div key={i} className="aspect-square flex items-center justify-center">
                                                            {cell ? (
                                                                <span className={`text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center ${
                                                                    cell.isToday
                                                                        ? 'bg-[#0B2545] dark:bg-[#16A34A] text-white'
                                                                        : cell.hasEvents
                                                                            ? 'text-emerald-600 dark:text-emerald-400 font-black'
                                                                            : 'text-slate-500 dark:text-slate-400'
                                                                }`}>
                                                                    {cell.d}
                                                                </span>
                                                            ) : null}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                    </div>
                )}
            </div>

            {/* CREATE EVENT MODAL */}
            <Modal show={createModalOpen} onClose={() => setCreateModalOpen(false)} maxWidth="lg">
                <form noValidate onSubmit={handleCreateSubmit} className="p-6 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.08]">
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                            <h3 className="text-base font-black text-slate-900 dark:text-white font-display">Create New Event</h3>
                        </div>
                        <button type="button" onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div>
                        <InputLabel value="Event Title *" />
                        <TextInput
                            className="block w-full text-xs font-bold mt-1"
                            value={data.title}
                            onChange={(e) => { setData('title', e.target.value); if (errors.title) clearErrors('title'); }}
                            placeholder="e.g. Zamroth & Husna Wedding Reception"
                        />
                        <InputError message={errors.title} className="mt-1" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <InputLabel value="Event Type *" />
                            <select
                                className="block w-full border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white rounded-xl text-xs font-medium py-2 mt-1"
                                value={data.event_type}
                                onChange={(e) => setData('event_type', e.target.value)}
                            >
                                <option value="Wedding Reception">Wedding Reception</option>
                                <option value="Engagement Party">Engagement Party</option>
                                <option value="Birthday Celebration">Birthday Celebration</option>
                                <option value="Corporate Gala">Corporate Gala</option>
                                <option value="Conference / Summit">Conference / Summit</option>
                                <option value="Dinner / Anniversary">Dinner / Anniversary</option>
                                <option value="Private Gathering">Private Gathering</option>
                            </select>
                            <InputError message={errors.event_type} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel value="Event Date *" />
                            <TextInput
                                type="date"
                                min={todayFormatted}
                                className="block w-full text-xs mt-1"
                                value={data.event_date}
                                onChange={(e) => { setData('event_date', e.target.value); if (errors.event_date) clearErrors('event_date'); }}
                            />
                            <InputError message={errors.event_date} className="mt-1" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <InputLabel value="Event Time / Schedule" />
                            <TextInput
                                className="block w-full text-xs mt-1"
                                value={data.event_time}
                                onChange={(e) => setData('event_time', e.target.value)}
                                placeholder="e.g. 4:00 PM — Reception"
                            />
                            <InputError message={errors.event_time} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel value="City *" />
                            <TextInput
                                className="block w-full text-xs mt-1"
                                value={data.city}
                                onChange={(e) => { setData('city', e.target.value); if (errors.city) clearErrors('city'); }}
                                placeholder="e.g. Dar es Salaam"
                            />
                            <InputError message={errors.city} className="mt-1" />
                        </div>
                    </div>

                    <div>
                        <InputLabel value="Venue Location *" />
                        <TextInput
                            className="block w-full text-xs mt-1"
                            value={data.venue}
                            onChange={(e) => { setData('venue', e.target.value); if (errors.venue) clearErrors('venue'); }}
                            placeholder="e.g. Serena Hotel, Kibo Hall"
                        />
                        <InputError message={errors.venue} className="mt-1" />
                    </div>

                    {isAdmin && organizers.length > 0 && (
                        <div>
                            <InputLabel value="Assign Organizer (Admin)" />
                            <select
                                className="block w-full border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white rounded-xl text-xs py-2 mt-1"
                                value={data.user_id}
                                onChange={(e) => setData('user_id', e.target.value)}
                            >
                                <option value="">Assign to myself ({user?.name})</option>
                                {organizers.map(org => (
                                    <option key={org.id} value={org.id}>{org.name} ({org.email})</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/[0.08]">
                        <SecondaryButton type="button" onClick={() => setCreateModalOpen(false)}>Cancel</SecondaryButton>
                        <PrimaryButton disabled={processing} className="text-white py-2.5 px-4 text-xs font-bold rounded-xl">
                            {processing ? 'Creating...' : 'Create Event'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </KardovoAppLayout>
    );
}
