import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import PersonalisedCard from '@/Components/PersonalisedCard';
import KardovoLogo from '@/Components/KardovoLogo';
import confetti from 'canvas-confetti';
import {
    Check,
    X,
    Calendar,
    MapPin,
    Clock,
    ShieldCheck,
    Sparkles,
    ExternalLink,
    CheckCircle2,
    XCircle,
    Music,
    Volume2,
    VolumeX,
    ChevronDown,
    QrCode,
} from 'lucide-react';

// ─── Falling Petals Canvas ─────────────────────────────────────────────────
function PetalCanvas({ color = '#10b981' }) {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animId;
        const petals = Array.from({ length: 18 }, () => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * -window.innerHeight,
            size: 6 + Math.random() * 10,
            speed: 0.6 + Math.random() * 1.2,
            drift: (Math.random() - 0.5) * 1.2,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 2,
            opacity: 0.4 + Math.random() * 0.4,
        }));

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            petals.forEach(p => {
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.globalAlpha = p.opacity;
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.ellipse(0, 0, p.size, p.size / 2, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
                p.y += p.speed;
                p.x += p.drift;
                p.rotation += p.rotationSpeed;
                if (p.y > canvas.height + 20) {
                    p.y = -20;
                    p.x = Math.random() * canvas.width;
                }
            });
            animId = requestAnimationFrame(draw);
        };
        draw();
        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', resize);
        };
    }, [color]);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />;
}

// ─── Countdown Timer ───────────────────────────────────────────────────────
function Countdown({ eventDate, accentColor }) {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });

    useEffect(() => {
        const calc = () => {
            const diff = new Date(eventDate) - new Date();
            if (diff <= 0) { setTimeLeft(t => ({ ...t, expired: true })); return; }
            setTimeLeft({
                days: Math.floor(diff / 86400000),
                hours: Math.floor((diff % 86400000) / 3600000),
                minutes: Math.floor((diff % 3600000) / 60000),
                seconds: Math.floor((diff % 60000) / 1000),
                expired: false,
            });
        };
        calc();
        const timer = setInterval(calc, 1000);
        return () => clearInterval(timer);
    }, [eventDate]);

    if (timeLeft.expired) return null;

    const units = [
        { label: 'Days', value: timeLeft.days },
        { label: 'Hours', value: timeLeft.hours },
        { label: 'Minutes', value: timeLeft.minutes },
        { label: 'Seconds', value: timeLeft.seconds },
    ];

    return (
        <div className="flex gap-3 sm:gap-5 justify-center mt-6">
            {units.map(({ label, value }) => (
                <div key={label} className="text-center">
                    <div
                        className="w-14 sm:w-18 h-14 sm:h-18 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-black text-white shadow-lg"
                        style={{ backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}
                    >
                        {String(value).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] sm:text-xs font-bold text-white/70 mt-1.5 uppercase tracking-widest">{label}</div>
                </div>
            ))}
        </div>
    );
}

// ─── Scroll Reveal Hook ────────────────────────────────────────────────────
function useScrollReveal() {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        if (!ref.current) return;
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
            { threshold: 0.15 }
        );
        obs.observe(ref.current);
        return () => obs.disconnect();
    }, []);
    return [ref, visible];
}

function RevealSection({ children, delay = 0 }) {
    const [ref, visible] = useScrollReveal();
    return (
        <div
            ref={ref}
            className="transition-all duration-700"
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(40px)',
                transitionDelay: `${delay}ms`,
            }}
        >
            {children}
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function GuestPass({ guest, event, template, isDemo = false, micrositeConfig = null }) {
    const [submitting, setSubmitting] = useState(false);
    const [rsvpSubmitted, setRsvpSubmitted] = useState(
        guest?.rsvp_status !== 'pending' ? guest?.rsvp_status : null
    );
    const [heroLoaded, setHeroLoaded] = useState(false);
    const [audioPlaying, setAudioPlaying] = useState(false);
    const audioRef = useRef(null);

    const cfg = micrositeConfig || {};
    const accentColor = cfg.accent_color || '#10b981';
    const coverPhoto = cfg.cover_photo || null;
    const tagline = cfg.tagline || '';
    const showCountdown = cfg.show_countdown !== false;
    const programme = cfg.programme || [];
    const musicUrl = cfg.music_url || null;
    const rsvpPrompt = cfg.rsvp_prompt || 'Kindly confirm your attendance';
    const fontStyle = cfg.font_style || 'script'; // 'script' | 'serif' | 'modern'
    const dressCode = cfg.dress_code || '';

    const isDemoMode = Boolean(isDemo) || (typeof window !== 'undefined' && (
        window.location.pathname === '/demo/pass' ||
        new URLSearchParams(window.location.search).get('demo') === '1' ||
        guest?.qr_token === 'kdv_demo_pass_preview'
    ));

    useEffect(() => {
        const timer = setTimeout(() => setHeroLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Music
    useEffect(() => {
        if (!audioRef.current || !musicUrl) return;
        audioRef.current.volume = 0.4;
    }, [musicUrl]);

    const toggleAudio = () => {
        if (!audioRef.current) return;
        if (audioPlaying) { audioRef.current.pause(); setAudioPlaying(false); }
        else { audioRef.current.play().then(() => setAudioPlaying(true)).catch(() => {}); }
    };

    const handleRsvp = (status) => {
        if (isDemoMode) {
            setRsvpSubmitted(status);
            if (status === 'attending') fireConfetti();
            return;
        }
        setSubmitting(true);
        router.post(route('guest.rsvp', guest.qr_token), { status }, {
            preserveScroll: true,
            onSuccess: () => {
                setSubmitting(false);
                setRsvpSubmitted(status);
                if (status === 'attending') fireConfetti();
            },
            onError: () => setSubmitting(false),
        });
    };

    const fireConfetti = () => {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: [accentColor, '#ffffff', '#fbbf24'] });
        setTimeout(() => confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0 }, colors: [accentColor, '#ffffff'] }), 300);
        setTimeout(() => confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1 }, colors: [accentColor, '#ffffff'] }), 500);
    };

    const formattedDate = event?.event_date
        ? new Date(event.event_date).toLocaleDateString('en-GB', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
        })
        : 'Date to be announced';

    const mapsQuery = encodeURIComponent([event?.venue, event?.city].filter(Boolean).join(', '));
    const mapsUrl = mapsQuery ? `https://www.google.com/maps/search/?api=1&query=${mapsQuery}` : null;

    const fontClass = fontStyle === 'serif'
        ? 'font-serif'
        : fontStyle === 'modern'
            ? 'font-sans tracking-tight'
            : 'font-display'; // script/display

    const heroStyle = coverPhoto
        ? { backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.6) 100%), url('${coverPhoto}')`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : { background: `linear-gradient(135deg, ${accentColor}ee 0%, ${accentColor}99 50%, #0f172a 100%)` };

    return (
        <div className="min-h-screen bg-slate-50 font-sans overflow-x-hidden">
            <Head title={`Invitation: ${event?.title || 'Event'} — ${guest?.name || 'Guest'}`} />

            {/* Audio element */}
            {musicUrl && <audio ref={audioRef} src={musicUrl} loop preload="none" />}

            {/* ─── HERO ─────────────────────────────────────────────── */}
            <section className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden" style={heroStyle}>
                {/* Animated petals */}
                <PetalCanvas color={accentColor} />

                {/* Floating controls */}
                <div className="absolute top-5 right-5 z-30 flex items-center gap-2">
                    {musicUrl && (
                        <button
                            onClick={toggleAudio}
                            className="w-9 h-9 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 transition"
                            title={audioPlaying ? 'Pause music' : 'Play music'}
                        >
                            {audioPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                        </button>
                    )}
                </div>

                {/* Kardovo badge top-left */}
                <div className="absolute top-5 left-5 z-30">
                    <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/20">
                        <div className="w-4 h-4 rounded-full bg-white/80 flex items-center justify-center">
                            <span className="text-[7px] font-black text-slate-800">K</span>
                        </div>
                        <span className="text-[10px] font-bold text-white/80 tracking-wider">KARDOVO</span>
                    </div>
                </div>

                {/* Hero Content */}
                <div
                    className="relative z-20 px-6 max-w-2xl transition-all duration-1000"
                    style={{ opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? 'translateY(0)' : 'translateY(30px)' }}
                >
                    {tagline && (
                        <p className="text-white/70 text-xs sm:text-sm tracking-[0.25em] uppercase font-medium mb-4">
                            {tagline}
                        </p>
                    )}

                    <h1
                        className={`text-4xl sm:text-6xl lg:text-7xl text-white leading-tight mb-2 ${fontClass}`}
                        style={{ textShadow: '0 2px 20px rgba(0,0,0,0.4)' }}
                    >
                        {event?.title || 'You\'re Invited'}
                    </h1>

                    {guest?.name && (
                        <p className="text-white/90 text-base sm:text-lg font-medium mt-3">
                            Dear <span className="font-bold" style={{ color: accentColor === '#10b981' ? '#6ee7b7' : 'white' }}>{guest.name}</span>
                        </p>
                    )}

                    <div className="flex items-center justify-center gap-2 mt-4 text-white/80 text-sm font-medium">
                        <Calendar className="w-4 h-4" />
                        <span>{formattedDate}</span>
                    </div>

                    {event?.venue && (
                        <div className="flex items-center justify-center gap-2 mt-1.5 text-white/70 text-sm">
                            <MapPin className="w-4 h-4" />
                            <span>{event.venue}</span>
                        </div>
                    )}

                    {/* Countdown */}
                    {showCountdown && event?.event_date && (
                        <Countdown eventDate={event.event_date} accentColor={accentColor} />
                    )}
                </div>

                {/* Scroll cue */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 animate-bounce">
                    <span className="text-white/50 text-[10px] tracking-widest uppercase">Scroll</span>
                    <ChevronDown className="w-5 h-5 text-white/50" />
                </div>
            </section>

            {/* ─── MAIN CONTENT ────────────────────────────────────── */}
            <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12 space-y-12">

                {/* ── Event Details Card ── */}
                <RevealSection>
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="h-1.5 w-full" style={{ backgroundColor: accentColor }} />
                        <div className="p-6 sm:p-8 space-y-4">
                            <h2 className="text-lg font-black text-slate-900">Event Details</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: accentColor + '20' }}>
                                        <Calendar className="w-4 h-4" style={{ color: accentColor }} />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Date</div>
                                        <div className="text-sm font-bold text-slate-900">{formattedDate}</div>
                                    </div>
                                </div>

                                {event?.event_time && (
                                    <div className="flex items-start gap-3">
                                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: accentColor + '20' }}>
                                            <Clock className="w-4 h-4" style={{ color: accentColor }} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Time</div>
                                            <div className="text-sm font-bold text-slate-900">{event.event_time}</div>
                                        </div>
                                    </div>
                                )}

                                {event?.venue && (
                                    <div className="flex items-start gap-3 sm:col-span-2">
                                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: accentColor + '20' }}>
                                            <MapPin className="w-4 h-4" style={{ color: accentColor }} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Venue</div>
                                            <div className="text-sm font-bold text-slate-900">{event.venue}{event.city ? `, ${event.city}` : ''}</div>
                                            {mapsUrl && (
                                                <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-xs font-bold mt-1 hover:underline transition"
                                                    style={{ color: accentColor }}
                                                >
                                                    <ExternalLink className="w-3 h-3" /> View on Google Maps
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {dressCode && (
                                    <div className="flex items-start gap-3 sm:col-span-2">
                                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: accentColor + '20' }}>
                                            <Sparkles className="w-4 h-4" style={{ color: accentColor }} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Dress Code</div>
                                            <div className="text-sm font-bold text-slate-900">{dressCode}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </RevealSection>

                {/* ── Programme / Timeline ── */}
                {programme.length > 0 && (
                    <RevealSection delay={100}>
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8">
                            <h2 className="text-lg font-black text-slate-900 mb-6">Programme</h2>
                            <div className="relative pl-6">
                                <div className="absolute left-0 top-1 bottom-1 w-px bg-slate-100" />
                                <div className="space-y-6">
                                    {programme.map((item, i) => (
                                        <div key={i} className="relative">
                                            <div className="absolute -left-[25px] top-1 w-3 h-3 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: accentColor }} />
                                            <div className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: accentColor }}>
                                                {item.time}
                                            </div>
                                            <div className="text-sm font-bold text-slate-900">{item.title}</div>
                                            {item.note && <div className="text-xs text-slate-500 mt-0.5">{item.note}</div>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </RevealSection>
                )}

                {/* ── Digital Pass ── */}
                <RevealSection delay={150}>
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="h-1.5 w-full" style={{ backgroundColor: accentColor }} />
                        <div className="p-6 sm:p-8">
                            <div className="flex items-center gap-2 mb-6">
                                <QrCode className="w-4 h-4" style={{ color: accentColor }} />
                                <h2 className="text-lg font-black text-slate-900">Your Digital Pass</h2>
                            </div>

                            <div className="flex flex-col items-center">
                                <PersonalisedCard
                                    guest={guest}
                                    event={event}
                                    template={template}
                                    className="w-full max-w-sm"
                                />
                            </div>

                            {/* Pass Meta */}
                            <div className="mt-6 grid grid-cols-2 gap-3">
                                <div className="bg-slate-50 rounded-2xl p-3 text-center">
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Pass Number</div>
                                    <div className="text-xs font-black text-slate-800 font-mono">{guest?.card_number || '—'}</div>
                                </div>
                                <div className="bg-slate-50 rounded-2xl p-3 text-center">
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Entry</div>
                                    <div className="text-xs font-black text-slate-800">{guest?.category || guest?.allowance_label || 'Standard'}</div>
                                </div>
                            </div>

                            <div className="mt-3 flex items-center gap-2 text-xs text-slate-400 justify-center">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>This pass is unique to {guest?.name || 'you'} and cannot be transferred</span>
                            </div>
                        </div>
                    </div>
                </RevealSection>

                {/* ── RSVP Section ── */}
                <RevealSection delay={200}>
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="h-1.5 w-full" style={{ backgroundColor: accentColor }} />
                        <div className="p-6 sm:p-8 text-center">
                            {rsvpSubmitted === null ? (
                                <>
                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: accentColor + '20' }}>
                                        <CheckCircle2 className="w-7 h-7" style={{ color: accentColor }} />
                                    </div>
                                    <h2 className="text-xl font-black text-slate-900 mb-1">RSVP</h2>
                                    <p className="text-sm text-slate-500 mb-6">{rsvpPrompt}</p>

                                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                        <button
                                            onClick={() => handleRsvp('attending')}
                                            disabled={submitting}
                                            className="flex-1 sm:flex-none sm:min-w-[160px] flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-black text-sm text-white shadow-lg active:scale-95 transition-all duration-150 disabled:opacity-60 cursor-pointer"
                                            style={{ backgroundColor: accentColor }}
                                        >
                                            <Check className="w-4 h-4 stroke-[2.5]" />
                                            Will Attend
                                        </button>
                                        <button
                                            onClick={() => handleRsvp('declined')}
                                            disabled={submitting}
                                            className="flex-1 sm:flex-none sm:min-w-[160px] flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-black text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all duration-150 disabled:opacity-60 cursor-pointer"
                                        >
                                            <X className="w-4 h-4 stroke-[2.5]" />
                                            Cannot Attend
                                        </button>
                                    </div>
                                </>
                            ) : rsvpSubmitted === 'attending' ? (
                                <div className="py-4">
                                    <CheckCircle2 className="w-12 h-12 mx-auto mb-4" style={{ color: accentColor }} />
                                    <h2 className="text-xl font-black text-slate-900 mb-1">See you there! 🎉</h2>
                                    <p className="text-sm text-slate-500">Your attendance has been confirmed. We look forward to celebrating with you!</p>
                                </div>
                            ) : (
                                <div className="py-4">
                                    <XCircle className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                                    <h2 className="text-xl font-black text-slate-900 mb-1">We'll miss you</h2>
                                    <p className="text-sm text-slate-500">Thank you for letting us know. Your response has been recorded.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </RevealSection>
            </main>

            {/* ─── FOOTER ────────────────────────────────────────────── */}
            <footer className="text-center py-8 px-4">
                <div className="flex items-center justify-center gap-2 opacity-50">
                    <KardovoLogo light={false} showText={false} />
                    <span className="text-[11px] font-bold font-mono text-slate-400 tracking-widest uppercase">Powered by Kardovo</span>
                </div>
            </footer>
        </div>
    );
}
