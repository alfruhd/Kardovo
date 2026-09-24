import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import PersonalisedCard from '@/Components/PersonalisedCard';
import KardovoLogo from '@/Components/KardovoLogo';
import {
    Calendar,
    MapPin,
    Clock,
    Phone,
    MessageSquare,
    ChevronDown,
    ArrowUp,
    Check,
    X,
    ExternalLink,
    Sparkles,
    ShieldCheck,
    CreditCard
} from 'lucide-react';

// ─── Falling Petals Canvas ─────────────────────────────────────────────────────
function PetalCanvas({ color = '#5C4033' }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animId;

        // Rich autumn palette mixed with the base theme color
        const autumnColors = [
            color, '#8B4513', '#A0522D', '#D2691E', '#CD853F', '#DAA520', '#6B8E23', '#800000'
        ];

        const petals = Array.from({ length: 35 }, () => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * -window.innerHeight,
            size: 8 + Math.random() * 12,
            speed: 0.8 + Math.random() * 1.4,
            drift: (Math.random() - 0.5) * 1.5,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 2.5,
            opacity: 0.35 + Math.random() * 0.45,
            petalColor: autumnColors[Math.floor(Math.random() * autumnColors.length)],
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
                ctx.fillStyle = p.petalColor;
                ctx.beginPath();
                // Organic petal shape
                ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();

                p.y += p.speed;
                p.x += p.drift;
                p.rotation += p.rotationSpeed;

                if (p.y > canvas.height + 30) {
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

// ─── Countdown Timer Component ────────────────────────────────────────────────
function CountdownTimer({ targetDate, accentColor = '#5C4033' }) {
    const [timeLeft, setTimeLeft] = useState({ days: '00', hours: '00', mins: '00', secs: '00' });

    useEffect(() => {
        const updateCountdown = () => {
            const now = new Date().getTime();
            const target = targetDate ? new Date(targetDate).getTime() : new Date('2026-05-09T17:30:00').getTime();
            const diff = target - now;

            if (diff <= 0) {
                setTimeLeft({ days: '00', hours: '00', mins: '00', secs: '00' });
                return;
            }

            const d = Math.floor(diff / (1000 * 60 * 60 * 24));
            const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const m = Math.floor((diff / (1000 * 60)) % 60);
            const s = Math.floor((diff / 1000) % 60);

            setTimeLeft({
                days: String(d).padStart(2, '0'),
                hours: String(h).padStart(2, '0'),
                mins: String(m).padStart(2, '0'),
                secs: String(s).padStart(2, '0'),
            });
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }, [targetDate]);

    return (
        <div className="flex justify-center items-center gap-4 sm:gap-10 mt-6">
            <div className="text-center">
                <span className="block text-3xl sm:text-5xl font-['Playfair_Display'] font-normal leading-none mb-1" style={{ color: accentColor }}>
                    {timeLeft.days}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-slate-500">Days</span>
            </div>
            <div className="text-center">
                <span className="block text-3xl sm:text-5xl font-['Playfair_Display'] font-normal leading-none mb-1" style={{ color: accentColor }}>
                    {timeLeft.hours}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-slate-500">Hrs</span>
            </div>
            <div className="text-center">
                <span className="block text-3xl sm:text-5xl font-['Playfair_Display'] font-normal leading-none mb-1" style={{ color: accentColor }}>
                    {timeLeft.mins}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-slate-500">Min</span>
            </div>
            <div className="text-center">
                <span className="block text-3xl sm:text-5xl font-['Playfair_Display'] font-normal leading-none mb-1" style={{ color: accentColor }}>
                    {timeLeft.secs}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-slate-500">Sec</span>
            </div>
        </div>
    );
}

// ─── Scroll Reveal Animation Wrapper ──────────────────────────────────────────
function ScrollReveal({
    children,
    className = '',
    delay = 0,
    direction = 'up', // 'up' | 'down' | 'left' | 'right' | 'zoom' | 'fade'
    duration = 850,
    distance = 28,
    threshold = 0.08,
    once = true,
}) {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        if (typeof IntersectionObserver === 'undefined') {
            setIsVisible(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (once) observer.unobserve(el);
                } else if (!once) {
                    setIsVisible(false);
                }
            },
            { threshold, rootMargin: '0px 0px -40px 0px' }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [threshold, once]);

    const getTransform = () => {
        if (isVisible) return 'translate3d(0, 0, 0) scale(1)';
        switch (direction) {
            case 'up': return `translate3d(0, ${distance}px, 0) scale(0.985)`;
            case 'down': return `translate3d(0, -${distance}px, 0) scale(0.985)`;
            case 'left': return `translate3d(${distance}px, 0, 0)`;
            case 'right': return `translate3d(-${distance}px, 0, 0)`;
            case 'zoom': return 'scale(0.94) translate3d(0, 14px, 0)';
            case 'fade': return 'translate3d(0, 0, 0)';
            default: return `translate3d(0, ${distance}px, 0)`;
        }
    };

    return (
        <div
            ref={ref}
            className={`transition-all ${className}`}
            style={{
                opacity: isVisible ? 1 : 0,
                transform: getTransform(),
                transitionDuration: `${duration}ms`,
                transitionDelay: `${delay}ms`,
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                willChange: 'opacity, transform',
            }}
        >
            {children}
        </div>
    );
}

// ─── Timeline Line-Art Icons Matching Reference Style ─────────────────────────
function CeremonyRingsIcon({ className = "w-5 h-5 sm:w-6 sm:h-6" }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="8" cy="14" r="5" />
            <circle cx="15.5" cy="11.5" r="5" />
            <path d="M15.5 6.5l1.2-1.2 1.2 1.2-1.2 1.2z" strokeWidth="1.4" />
        </svg>
    );
}

function WelcomeToastIcon({ className = "w-5 h-5 sm:w-6 sm:h-6" }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M6 3.5l2.8 4v3.5a1.8 1.8 0 0 1-1.8 1.8H6a1.8 1.8 0 0 1-1.8-1.8V7.5L6 3.5z" />
            <path d="M6 12.8v5.2M4 18h4" />
            <path d="M18 3.5l-2.8 4v3.5a1.8 1.8 0 0 0 1.8 1.8h1a1.8 1.8 0 0 0 1.8-1.8V7.5L18 3.5z" />
            <path d="M18 12.8v5.2M16 18h4" />
            <path d="M12 4v2M11 5h2" strokeWidth="1.2" />
        </svg>
    );
}

function ReceptionClocheIcon({ className = "w-5 h-5 sm:w-6 sm:h-6" }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M3 17h18" />
            <path d="M4 17a8 8 0 0 1 16 0" />
            <circle cx="12" cy="7.5" r="1.5" />
            <path d="M7 20h10" />
        </svg>
    );
}

function FirstDanceGuitarIcon({ className = "w-5 h-5 sm:w-6 sm:h-6" }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="8.5" cy="15.5" r="3.5" />
            <path d="M11 13L18.5 5.5" />
            <path d="M17 4l3 3" />
            <circle cx="8.5" cy="15.5" r="1" fill="currentColor" />
            <path d="M5 8c0-1.5 1-2.5 2.5-2.5h1" strokeWidth="1.2" />
            <path d="M19 11v3M19 11c1 0 1.8.8 1.8 1.8" strokeWidth="1.2" />
        </svg>
    );
}

function DinnerBuffetPlateIcon({ className = "w-5 h-5 sm:w-6 sm:h-6" }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="12" cy="12" r="5" />
            <path d="M5 5v5a1.5 1.5 0 0 0 1.5 1.5V19" />
            <path d="M5 5h3v5" />
            <path d="M6.5 5v5" />
            <path d="M18 5v14M18 5c-1.5 0-2 1-2 3.5v3h2" />
        </svg>
    );
}

function CakeCuttingIcon({ className = "w-5 h-5 sm:w-6 sm:h-6" }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M4 20h16" />
            <path d="M5 20v-5h14v5" />
            <path d="M7 15v-4h10v4" />
            <path d="M12 7v4" />
            <circle cx="12" cy="5.5" r="1.2" fill="currentColor" />
        </svg>
    );
}

function FarewellSparkleIcon({ className = "w-5 h-5 sm:w-6 sm:h-6" }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5z" />
            <path d="M19 17l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" strokeWidth="1.2" />
        </svg>
    );
}


function ServiceBadgeIcon({ className = "w-5 h-5 sm:w-6 sm:h-6" }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    );
}

function CoupleHeartIcon({ className = "w-5 h-5 sm:w-6 sm:h-6" }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
    );
}

function getMilestoneTimelineIcon(item, index) {
    const title = (item.title || '').toLowerCase();
    const note = (item.note || '').toLowerCase();

    const findIcon = (text) => {
        if (text.includes('cake')) return <CakeCuttingIcon />;
        if (text.includes('ceremony') || text.includes('vow') || text.includes('ring') || text.includes('i do')) return <CeremonyRingsIcon />;
        if (text.includes('buffet') || text.includes('feast') || text.includes('meal')) return <DinnerBuffetPlateIcon />;
        if (text.includes('dinner') || text.includes('reception') || text.includes('food') || text.includes('eat')) return <ReceptionClocheIcon />;
        if (text.includes('toast') || text.includes('speech') || text.includes('mocktail') || text.includes('cocktail') || text.includes('drink')) return <WelcomeToastIcon />;
        if (text.includes('dance') || text.includes('music') || text.includes('song') || text.includes('party')) return <FirstDanceGuitarIcon />;
        if (text.includes('farewell') || text.includes('bye') || text.includes('thank') || text.includes('end') || text.includes('send')) return <FarewellSparkleIcon />;
        if (text.includes('arrival') || text.includes('entrance') || text.includes('welcome') || text.includes('couple') || text.includes('start')) return <CoupleHeartIcon />;
        return null;
    };

    return findIcon(title) || findIcon(note) || (
        [
            <WelcomeToastIcon key="toast" />,
            <CeremonyRingsIcon key="rings" />,
            <ReceptionClocheIcon key="cloche" />,
            <WelcomeToastIcon key="speech" />,
            <CakeCuttingIcon key="cake" />,
            <FarewellSparkleIcon key="sparkle" />,
        ][index % 6]
    );
}

// ─── Photorealistic Wax Seal Intro ───────────────────────────────────────────
function WaxSealIntro({ monogram, closing, onTap }) {
    const formattedMonogram = (monogram || '').trim();
    // Compact font size so flourishes of script letters (like 'E', 'J', 'B') fit neatly inside the shield without touching the baroque borders
    const fontSize = formattedMonogram.length <= 2 ? 56 : formattedMonogram.length === 3 ? 46 : 38;

    return (
        <>
            <style>{`
                @keyframes goldShimmerSweep {
                    0%, 100% { opacity: 0.15; }
                    50%      { opacity: 0.45; }
                }
                @keyframes tapPulse {
                    0%   { opacity: 0; transform: translateY(0); }
                    30%  { opacity: 1; }
                    100% { opacity: 0; transform: translateY(9px); }
                }
            `}</style>

            {/* ── Full-screen overlay with exact transition matching kadijanja.co.tz ── */}
            <div
                id="introOverlay"
                onClick={onTap}
                className="fixed inset-0 z-[9999] cursor-pointer select-none overflow-hidden bg-[#1a1714] flex items-center justify-center"
                style={{
                    opacity: closing ? 0 : 1,
                    transform: closing ? 'scale(1.05)' : 'scale(1)',
                    pointerEvents: closing ? 'none' : 'auto',
                    transition: 'opacity 1.2s ease, transform 1.2s ease',
                }}
            >
                <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
                    <svg
                        viewBox="0 0 768 1376"
                        preserveAspectRatio="xMidYMid slice"
                        className="w-full h-full select-none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <defs>
                            {/* Realistic Metallic Gold Gradient sampled directly from the wax seal photo */}
                            <linearGradient id="photoWaxGold" x1="15%" y1="0%" x2="85%" y2="100%">
                                <stop offset="0%" stopColor="#fff8d4" />
                                <stop offset="16%" stopColor="#f7dd89" />
                                <stop offset="42%" stopColor="#d3a749" />
                                <stop offset="70%" stopColor="#a47524" />
                                <stop offset="92%" stopColor="#69430c" />
                            </linearGradient>

                            {/* Warm animated shimmer pass */}
                            <linearGradient id="shimmerPass" x1="0%" y1="20%" x2="100%" y2="80%">
                                <stop offset="0%" stopColor="transparent" />
                                <stop offset="50%" stopColor="rgba(255, 250, 220, 0.7)" />
                                <stop offset="100%" stopColor="transparent" />
                            </linearGradient>

                            {/* 3D Wax Emboss Filter: Realistic bevel, depth shadow & specular gloss */}
                            <filter id="waxEmboss3D" x="-45%" y="-45%" width="190%" height="190%" colorInterpolationFilters="sRGB">
                                {/* 1. Deep cast shadow into the wax recess below-right */}
                                <feGaussianBlur in="SourceAlpha" stdDeviation="2.5" result="blurCast" />
                                <feOffset in="blurCast" dx="2.4" dy="3.0" result="offsetCast" />
                                <feFlood floodColor="#221102" floodOpacity="0.75" result="colorCast" />
                                <feComposite in="colorCast" in2="offsetCast" operator="in" result="shadowCast" />

                                {/* 2. Crisp contact shadow right under stroke boundary */}
                                <feGaussianBlur in="SourceAlpha" stdDeviation="0.9" result="blurContact" />
                                <feOffset in="blurContact" dx="0.9" dy="1.2" result="offsetContact" />
                                <feFlood floodColor="#120700" floodOpacity="0.88" result="colorContact" />
                                <feComposite in="colorContact" in2="offsetContact" operator="in" result="shadowContact" />

                                {/* 3. Bright top-left bevel highlight catching ambient light */}
                                <feGaussianBlur in="SourceAlpha" stdDeviation="1.1" result="blurHl" />
                                <feOffset in="blurHl" dx="-1.3" dy="-1.5" result="offsetHl" />
                                <feFlood floodColor="#fff9dc" floodOpacity="0.9" result="colorHl" />
                                <feComposite in="colorHl" in2="offsetHl" operator="in" result="lightBevel" />

                                {/* 4. Specular lighting for rounded 3D wax contour */}
                                <feGaussianBlur in="SourceAlpha" stdDeviation="1.3" result="blurSpec" />
                                <feSpecularLighting in="blurSpec" surfaceScale="5.5" specularConstant="1.3" specularExponent="26" lightingColor="#fffce6" result="specLight">
                                    <fePointLight x="320" y="640" z="200" />
                                </feSpecularLighting>
                                <feComposite in="specLight" in2="SourceAlpha" operator="in" result="specMasked" />

                                {/* Merge all shading passes in correct layer stack */}
                                <feMerge>
                                    <feMergeNode in="shadowCast" />
                                    <feMergeNode in="shadowContact" />
                                    <feMergeNode in="SourceGraphic" />
                                    <feMergeNode in="lightBevel" />
                                    <feMergeNode in="specMasked" />
                                </feMerge>
                            </filter>
                        </defs>

                        {/* Real photograph of the envelope and blank gold wax seal */}
                        <image
                            href="/images/rsvp/blank_seal_envelope.jpg"
                            width="768"
                            height="1376"
                            preserveAspectRatio="xMidYMid slice"
                        />

                        {/* Custom initials inside the baroque crest: diagonal interlocking layout for 2 characters matching reference attachment */}
                        {formattedMonogram.length === 2 ? (
                            <g>
                                {/* 1. Top-Left Initial */}
                                <text
                                    x="364"
                                    y="694"
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    fontFamily="'Great Vibes', cursive"
                                    fontSize="66"
                                    fill="url(#photoWaxGold)"
                                    filter="url(#waxEmboss3D)"
                                >
                                    {formattedMonogram[0]}
                                </text>
                                <text
                                    x="364"
                                    y="694"
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    fontFamily="'Great Vibes', cursive"
                                    fontSize="66"
                                    fill="url(#shimmerPass)"
                                    style={{
                                        animation: 'goldShimmerSweep 3.6s ease-in-out infinite',
                                        mixBlendMode: 'screen',
                                    }}
                                >
                                    {formattedMonogram[0]}
                                </text>

                                {/* 2. Bottom-Right Initial (interlocks gracefully with first initial) */}
                                <text
                                    x="406"
                                    y="736"
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    fontFamily="'Great Vibes', cursive"
                                    fontSize="66"
                                    fill="url(#photoWaxGold)"
                                    filter="url(#waxEmboss3D)"
                                >
                                    {formattedMonogram[1]}
                                </text>
                                <text
                                    x="406"
                                    y="736"
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    fontFamily="'Great Vibes', cursive"
                                    fontSize="66"
                                    fill="url(#shimmerPass)"
                                    style={{
                                        animation: 'goldShimmerSweep 3.6s ease-in-out infinite',
                                        mixBlendMode: 'screen',
                                    }}
                                >
                                    {formattedMonogram[1]}
                                </text>
                            </g>
                        ) : (
                            <g transform="translate(386, 715)">
                                <text
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    fontFamily="'Great Vibes', cursive"
                                    fontSize={fontSize}
                                    fill="url(#photoWaxGold)"
                                    filter="url(#waxEmboss3D)"
                                >
                                    {formattedMonogram}
                                </text>
                                <text
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    fontFamily="'Great Vibes', cursive"
                                    fontSize={fontSize}
                                    fill="url(#shimmerPass)"
                                    style={{
                                        animation: 'goldShimmerSweep 3.6s ease-in-out infinite',
                                        mixBlendMode: 'screen',
                                    }}
                                >
                                    {formattedMonogram}
                                </text>
                            </g>
                        )}
                    </svg>

                    {/* Tap hint matching kadijanja.co.tz style */}
                    <div className="absolute bottom-9 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none select-none">
                        <div
                            className="w-[20px] h-[34px] rounded-full border relative flex justify-center pt-1.5"
                            style={{
                                borderColor: 'rgba(212, 175, 55, 0.55)',
                                borderWidth: '1.5px',
                                background: 'rgba(0, 0, 0, 0.2)',
                                backdropFilter: 'blur(4px)',
                            }}
                        >
                            <div
                                className="w-1 h-2 rounded-full"
                                style={{
                                    backgroundColor: '#d4af37',
                                    animation: 'tapPulse 2s ease-in-out infinite',
                                }}
                            />
                        </div>
                        <span
                            className="text-[9px] uppercase tracking-[0.32em] font-semibold text-white/90 drop-shadow"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                            Tap to Open
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
}

// ─── Main GuestPass Page ───────────────────────────────────────────────────────



export default function GuestPass({ guest, event, template, isDemo = false, micrositeConfig = null }) {
    const cfg = micrositeConfig || {};

    // Colors & Theme
    const bgColor = cfg.theme_color || cfg.background_color || '#3a4634';
    const accentColor = cfg.accent_color || '#5C4033';
    const timelineColor = cfg.timeline_color || (accentColor && accentColor !== '#5C4033' ? accentColor : '#d4af37');
    const coverPhoto = cfg.cover_photo || 'https://www.kadijanja.co.tz/images/rsvp/header/baja.jpeg';
    const musicUrl = cfg.music_url || 'https://www.kadijanja.co.tz/assets/wedding-background-music.mp3';

    // Titles & Couple Names
    const primaryName = cfg.primary_name || 'Babu';
    const secondaryName = cfg.secondary_name || 'Jasmine';
    const coupleTitle = cfg.couple_title || (primaryName && secondaryName ? `${primaryName} & ${secondaryName}` : (event?.title || 'Celebration'));
    const heroDateFormatted = cfg.event_date_formatted || (event?.event_date ? new Date(event.event_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, ' . ') : '09 . 05 . 2026');

    // Formal Invitation & Request
    const hostHonorText = cfg.host_honor_text || 'The family of Prof & Mrs Idris Kikula cordially request the honour of your presence';
    const invitationText = cfg.invitation_text || `at the wedding ceremony of their son,\n${primaryName} Kikula & ${secondaryName} Mndeme.`;

    // Reception
    const receptionTitle = cfg.reception_title || event?.venue || 'OASIS Village & Club - Mbezi Beach';
    const receptionSubtitle = cfg.reception_subtitle || 'A reception dinner and evening of celebration.';
    const receptionTimeBadge = cfg.reception_time_badge || (event?.event_date ? `${new Date(event.event_date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}, ${event.event_time || '5:30 PM'}` : 'Saturday, 9th May 2026, 5:30 PM');

    // Programme / Timeline
    const defaultProgramme = [
        { time: '4:00 PM', title: 'Guest Arrival', note: 'Mocktails and soft music.' },
        { time: '5:00 PM', title: 'Couple Entrance', note: 'The celebration begins.' },
        { time: '5:30 PM', title: 'Dinner is Served', note: 'A lavish buffet.' },
        { time: '7:00 PM', title: 'Speeches & Toasts', note: 'Words from family.' },
        { time: '8:00 PM', title: 'Cake Cutting', note: 'First dance to follow.' },
        { time: '11:00 PM', title: 'Farewell', note: 'Thank you for coming!' },
    ];
    const rawProgramme = cfg.programme;
    const programme = Array.isArray(rawProgramme) && rawProgramme.length > 0 ? rawProgramme : defaultProgramme;

    // Dress Code
    const dressCodeTitle = cfg.dress_code_title || 'Dress Code';
    const dressCodeTheme = cfg.dress_code_theme || 'Theme: Soft Beige, Light Ivory / Off White, Muted Sage Green, Olive Green and Deep Black / Charcoal';
    const dressCodeImage = cfg.dress_code_image || 'https://www.kadijanja.co.tz/images/dressing-code/waja.jpeg';
    const dressCodeSwatches = cfg.dress_code_swatches || [
        { name: 'Light Ivory', color: '#edeade' },
        { name: 'Muted Sage Green', color: '#a3b18a' },
        { name: 'Olive Green', color: '#588157' },
        { name: 'Deep Black', color: '#1b1b1b' },
    ];

    // Master of Ceremonies
    const mcName = cfg.mc_name || 'Mc MishieBomba';
    const mcBadge = cfg.mc_badge || 'Master of Ceremonies';
    const mcBio = cfg.mc_bio || 'Bringing energy, elegance, and a seamless flow to the celebration. We are honored to have GuruB guide us through this special evening.';
    const mcPhoto = cfg.mc_photo || 'https://www.kadijanja.co.tz/images/rsvp/mc/mc_mishi.jpeg';
    const mcHashtag = cfg.mc_hashtag || '#BABUANDJASMINE2026';

    // Wedding Committee
    const committee = cfg.wedding_committee || [
        { name: 'Tenna Kikula', phone: '0753371116' },
        { name: 'Dr Aman Kikula', phone: '0689632093' },
    ];

    // Venue & Map
    const venueName = cfg.venue_name || event?.venue || 'OASIS Village & Club';
    const venueAddress = cfg.venue_address || (event?.venue ? `${event.venue}${event.city ? `, ${event.city}` : ''}` : 'OASIS Village & Club, Mbezi Beach, Dar es Salaam, Tanzania');
    const mapsEmbedUrl = cfg.google_maps_embed_url || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4003.811687197711!2d39.21885857504168!3d-6.704313793291326!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x185c51976672d47f%3A0xe3ac56e0d281274a!2sOasis%20Village%20and%20Club!5e1!3m2!1sen!2stz!4v1777563837703!5m2!1sen!2stz';
    const mapsLink = cfg.google_maps_link || (event?.venue ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([event.venue, event.city].filter(Boolean).join(', '))}` : 'https://maps.app.goo.gl/dQNq4jdmardAEHMq8');

    // Adult only note & Footer
    const adultsOnlyNote = cfg.adults_only_note || '"While we love your little ones, our celebration will be an adult-only occasion. We hope you will enjoy a night off to celebrate with us!"';
    const footerText = cfg.footer_text || coupleTitle;

    
    const showCountdown = cfg.show_countdown !== false;
    const showReception = cfg.show_reception !== false;
    const showProgramme = cfg.show_programme !== false;
    const showDressCode = cfg.show_dress_code !== false;
    const showMc = cfg.show_mc !== false;
    const showCommittee = cfg.show_committee !== false;
    const showMap = cfg.show_map !== false;
    
    // Services
    const showServices = cfg.show_services !== false;
    const servicesBadge = cfg.services_badge || 'Featured Services';
    const servicesTitle = cfg.services_title || 'Our Event Partners';
    const services = cfg.services || [
        { name: 'Catering & Dining', provider: 'Gourmet Bites Catering', note: 'A lavish multi-course buffet' },
        { name: 'Cocktails & Beverages', provider: 'The Tipsy Bartender', note: 'Signature drinks & mocktails' }
    ];

    // Intro Card Opening Animation
    const showIntroAnimation = cfg.show_intro_animation !== false;
    const coupleMonogram = cfg.couple_monogram || cfg.seal_initials || (
        cfg.primary_name && cfg.secondary_name
            ? (cfg.primary_name[0] + cfg.secondary_name[0]).toUpperCase()
            : 'BJ'
    );

    // State
    const [introActive, setIntroActive] = useState(showIntroAnimation);
    const [introClosing, setIntroClosing] = useState(false);
    const [heroActive, setHeroActive] = useState(!showIntroAnimation);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [audioPlaying, setAudioPlaying] = useState(false);
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [showFullCardModal, setShowFullCardModal] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);
    const [toastType, setToastType] = useState('success');

    // RSVP Form State
    const [rsvpChoice, setRsvpChoice] = useState(guest?.rsvp_status === 'declined' ? 'declined' : 'attending');
    const [rsvpMessage, setRsvpMessage] = useState(guest?.notes || '');
    const [isSubmittingRsvp, setIsSubmittingRsvp] = useState(false);
    const [rsvpDone, setRsvpDone] = useState(guest?.rsvp_status && guest.rsvp_status !== 'pending');

    const audioRef = useRef(null);
    const autoOpenTimerRef = useRef(null);

    // Opening Effect matching kadijanja.co.tz:
    // 1. Instantly reset scroll to top
    // 2. Start romantic music immediately as the envelope begins to dissolve
    // 3. Staggered hero typography slide-up entrance animation with cubic-bezier(0.19, 1, 0.22, 1)
    // 4. Smooth 1.2s cross-dissolve between overlay and mainContent
    const handleOpenIntro = () => {
        if (introClosing) return;
        setIntroClosing(true);
        window.scrollTo({ top: 0, behavior: 'instant' });

        if (audioRef.current && musicUrl) {
            audioRef.current.play()
                .then(() => setAudioPlaying(true))
                .catch(() => {});
        }

        setTimeout(() => {
            setHeroActive(true);
        }, 150);

        setTimeout(() => {
            setIntroActive(false);
            document.body.style.overflow = 'auto';
        }, 1200);
    };

    // Auto-open timer after delay (2.2s) or tap
    useEffect(() => {
        if (!showIntroAnimation) return;
        autoOpenTimerRef.current = setTimeout(handleOpenIntro, 2200);
        return () => clearTimeout(autoOpenTimerRef.current);
    }, [showIntroAnimation]);

    const handleOverlayClick = () => {
        if (introClosing) return;
        clearTimeout(autoOpenTimerRef.current);
        handleOpenIntro();
    };

    // Prevent body scrolling while the envelope overlay is visible
    useEffect(() => {
        if (introActive && !introClosing) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [introActive, introClosing]);

    const isDemoMode = Boolean(isDemo) || (typeof window !== 'undefined' && (
        window.location.pathname === '/demo/pass' ||
        new URLSearchParams(window.location.search).get('demo') === '1' ||
        guest?.qr_token === 'kdv_demo_pass_preview'
    ));

    // Generate QR Code
    useEffect(() => {
        const qrContent = guest?.qr_token || guest?.unique_code || guest?.card_number || 'KDV-PASS-DEMO';
        QRCode.toDataURL(qrContent, {
            margin: 1,
            width: 200,
            color: {
                dark: '#000000',
                light: '#ffffff',
            },
        })
            .then(url => setQrCodeUrl(url))
            .catch(() => {});
    }, [guest]);

    // Back to top scroll listener
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 350) {
                setShowBackToTop(true);
            } else {
                setShowBackToTop(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Toggle Audio
    const toggleMusic = () => {
        if (!audioRef.current) return;
        if (audioPlaying) {
            audioRef.current.pause();
            setAudioPlaying(false);
        } else {
            audioRef.current.play()
                .then(() => setAudioPlaying(true))
                .catch(() => {
                    setAudioPlaying(false);
                });
        }
    };

    const triggerToast = (msg, type = 'success') => {
        setToastMessage(msg);
        setToastType(type);
        setTimeout(() => {
            setToastMessage(null);
        }, 4000);
    };

    const fireCelebration = () => {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: [accentColor, '#ffffff', '#d4af37'],
        });
        setTimeout(() => {
            confetti({
                particleCount: 60,
                angle: 60,
                spread: 60,
                origin: { x: 0 },
                colors: [accentColor, '#ffffff', '#d4af37'],
            });
        }, 250);
        setTimeout(() => {
            confetti({
                particleCount: 60,
                angle: 120,
                spread: 60,
                origin: { x: 1 },
                colors: [accentColor, '#ffffff', '#d4af37'],
            });
        }, 450);
    };

    const handleSubmitRsvp = (e) => {
        e.preventDefault();
        setIsSubmittingRsvp(true);

        if (isDemoMode) {
            setTimeout(() => {
                setIsSubmittingRsvp(false);
                setRsvpDone(true);
                if (rsvpChoice === 'attending') fireCelebration();
                triggerToast(rsvpChoice === 'attending' ? 'Response confirmed with pleasure! (Demo Mode)' : 'Response recorded with regret. (Demo Mode)');
            }, 600);
            return;
        }

        const token = guest?.qr_token || guest?.unique_code || guest?.card_number;
        router.post(route('guest.rsvp', token), {
            status: rsvpChoice,
            message: rsvpMessage,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmittingRsvp(false);
                setRsvpDone(true);
                if (rsvpChoice === 'attending') fireCelebration();
                triggerToast(rsvpChoice === 'attending' ? 'Thank you! Your RSVP has been confirmed.' : 'Thank you for letting us know.');
            },
            onError: (err) => {
                setIsSubmittingRsvp(false);
                triggerToast('Could not record RSVP. Please try again.', 'error');
            },
        });
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div
            className="min-h-screen text-white overflow-x-hidden selection:bg-amber-800 selection:text-white scroll-smooth"
            style={{
                backgroundColor: bgColor,
                fontFamily: "'Inter', sans-serif",
            }}
        >
            <Head title={`${coupleTitle} | ${heroDateFormatted}`} />

            {/* Photorealistic Wax Seal Envelope Overlay */}
            {introActive && (
                <WaxSealIntro
                    monogram={coupleMonogram}
                    closing={introClosing}
                    onTap={handleOverlayClick}
                />
            )}

            {/* Background Audio */}
            {musicUrl && (
                <audio ref={audioRef} loop preload="auto">
                    <source src={musicUrl} type="audio/mpeg" />
                </audio>
            )}

            {/* ─── Main Content (cross-dissolves in when intro overlay dissolves out) ─── */}
            <div
                id="mainContent"
                style={{
                    opacity: introActive && !introClosing ? 0 : 1,
                    transition: 'opacity 1.2s ease',
                }}
            >
                {/* Floating Audio Control */}
                <div className="fixed top-5 right-5 z-50">
                    <button
                        onClick={toggleMusic}
                        className={`w-11 h-11 rounded-full bg-white text-slate-800 shadow-xl border border-black/10 flex items-center justify-center text-lg transition-all duration-300 hover:scale-110 cursor-pointer ${
                            audioPlaying ? 'ring-4 ring-amber-700/40 animate-pulse' : 'opacity-90'
                        }`}
                        title={audioPlaying ? 'Mute Music' : 'Play Music'}
                        aria-label="Toggle Audio"
                    >
                        {audioPlaying ? '🔊' : '🔇'}
                    </button>
                </div>

                {/* ─── SECTION 1: HERO ──────────────────────────────────────────────── */}
                <section className="relative h-screen flex flex-col items-center justify-center text-center overflow-hidden px-4">
                    {/* Parallax Cover Background */}
                    <div
                        className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-700 scale-105"
                        style={{
                            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.48), rgba(0, 0, 0, 0.52)), url('${coverPhoto}')`,
                        }}
                    />

                    {/* Animated Petals */}
                    <PetalCanvas color={accentColor} />

                    {/* Hero Content with signature kadijanja.co.tz entrance animation */}
                    <div className="relative z-20 max-w-2xl mx-auto flex flex-col items-center">
                        <h1
                            className="font-['Great_Vibes',cursive] text-6xl sm:text-8xl lg:text-9xl text-white drop-shadow-md tracking-wide"
                            style={{
                                lineHeight: '0.9',
                                opacity: heroActive ? 1 : 0,
                                transform: heroActive ? 'translateY(0)' : 'translateY(40px)',
                                transition: 'all 1.5s cubic-bezier(0.19, 1, 0.22, 1) 0.3s',
                            }}
                        >
                            {primaryName}
                        </h1>

                        <div
                            className="font-['Playfair_Display'] italic text-2xl sm:text-4xl text-white/90 my-2 sm:my-3"
                            style={{
                                opacity: heroActive ? 0.85 : 0,
                                transform: heroActive ? 'translateY(0)' : 'translateY(40px)',
                                transition: 'all 1.5s cubic-bezier(0.19, 1, 0.22, 1) 0.5s',
                            }}
                        >
                            &
                        </div>

                        <h1
                            className="font-['Great_Vibes',cursive] text-6xl sm:text-8xl lg:text-9xl text-white drop-shadow-md tracking-wide"
                            style={{
                                lineHeight: '0.9',
                                opacity: heroActive ? 1 : 0,
                                transform: heroActive ? 'translateY(0)' : 'translateY(40px)',
                                transition: 'all 1.5s cubic-bezier(0.19, 1, 0.22, 1) 0.7s',
                            }}
                        >
                            {secondaryName}
                        </h1>

                        <p
                            className="font-['Playfair_Display'] font-bold text-xl sm:text-2xl tracking-[0.3em] text-white/95 mt-6 sm:mt-8"
                            style={{
                                opacity: heroActive ? 1 : 0,
                                transform: heroActive ? 'translateY(0)' : 'translateY(40px)',
                                transition: 'all 1.5s cubic-bezier(0.19, 1, 0.22, 1) 0.9s',
                            }}
                        >
                            {heroDateFormatted}
                        </p>
                    </div>

                    {/* Scroll Indicator */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none">
                        <div className="w-5 h-9 rounded-full border border-white/60 relative flex justify-center pt-1.5">
                            <div className="w-1 h-2 bg-white rounded-full animate-bounce" />
                        </div>
                        <span className="text-[9px] uppercase tracking-[0.3em] text-white/70 font-semibold">Scroll</span>
                    </div>
                </section>


            {/* ─── SECTION 2: FORMAL INVITATION ───────────────────────────────────── */}
            <section className="relative max-w-2xl mx-auto px-6 pt-28 pb-16 text-center">
                {/* Ornamental top line */}
                <ScrollReveal direction="zoom" duration={800}>
                    <div className="flex items-center justify-center gap-3 mb-10">
                        <div className="h-px w-16 bg-gradient-to-r from-transparent via-white/50 to-white/50" />
                        <span className="text-white/60 text-xl">✦</span>
                        <div className="h-px w-16 bg-gradient-to-l from-transparent via-white/50 to-white/50" />
                    </div>
                </ScrollReveal>

                <ScrollReveal direction="up" delay={80} duration={900}>
                    <p className="font-['Playfair_Display'] italic text-base sm:text-xl text-white/75 leading-loose tracking-wide font-normal mb-8">
                        {hostHonorText}
                    </p>
                </ScrollReveal>

                {/* Guest Name — editorial feature */}
                <ScrollReveal direction="zoom" delay={200} duration={950}>
                    <div className="my-10">
                        <p className="text-[9px] font-bold uppercase tracking-[0.45em] text-white/50 mb-4">Guest of Honour</p>
                        <h2
                            className="font-['Great_Vibes',cursive] text-5xl sm:text-7xl text-white drop-shadow-lg"
                            style={{ lineHeight: 1.1 }}
                        >
                            {guest?.name || 'Valued Guest'}
                        </h2>
                        <div className="flex items-center justify-center gap-4 mt-5">
                            <div className="h-px w-12 bg-white/25" />
                            <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                            <div className="h-px w-12 bg-white/25" />
                        </div>
                    </div>
                </ScrollReveal>

                <ScrollReveal direction="up" delay={300} duration={900}>
                    <p className="font-['Playfair_Display'] italic text-base sm:text-xl text-white/75 leading-loose whitespace-pre-line font-normal">
                        {invitationText}
                    </p>
                    {/* Bottom ornament */}
                    <div className="flex items-center justify-center gap-3 mt-12">
                        <div className="h-px w-12 bg-white/25" />
                        <span className="text-white/40 text-base">◆</span>
                        <div className="h-px w-12 bg-white/25" />
                    </div>
                </ScrollReveal>
            </section>

            {/* ─── SECTION 3: COUNTDOWN ───────────────────────────────────────────── */}
            {showCountdown && (
            <section className="max-w-xl mx-auto px-4 sm:px-6 py-8">
                <ScrollReveal direction="up" delay={80} duration={900}>
                    <div
                        className="relative rounded-[2rem] overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.4)] border border-white/10"
                        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(245,240,230,0.97) 100%)' }}
                    >
                        {/* Subtle top accent stripe */}
                        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }} />
                        <div className="p-8 sm:p-10 text-center">
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <div className="h-px w-8 bg-slate-300" />
                                <p className="text-[9px] font-black uppercase tracking-[0.45em]" style={{ color: accentColor }}>
                                    Counting Down
                                </p>
                                <div className="h-px w-8 bg-slate-300" />
                            </div>
                            <p className="font-['Playfair_Display'] italic text-sm text-slate-500 mb-6">
                                to the wedding day
                            </p>
                            <CountdownTimer targetDate={event?.event_date} accentColor={accentColor} />
                        </div>
                        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }} />
                    </div>
                </ScrollReveal>
            </section>

                        )}
            {/* ─── SECTION 4: THE RECEPTION ───────────────────────────────────────── */}
            {showReception && (
            <section className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
                <ScrollReveal direction="up" delay={80} duration={900}>
                    <div
                        className="relative rounded-[2rem] overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.4)] border border-white/10"
                        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(245,240,230,0.97) 100%)' }}
                    >
                        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }} />
                        <div className="p-8 sm:p-12 text-center">
                            <p className="text-[9px] font-black uppercase tracking-[0.45em] mb-5" style={{ color: accentColor }}>
                                ✦ The Reception ✦
                            </p>
                            <h2
                                className="font-['Playfair_Display'] text-3xl sm:text-4xl font-semibold mb-3"
                                style={{ color: bgColor }}
                            >
                                {receptionTitle}
                            </h2>
                            <p className="text-slate-500 text-sm italic mb-8 font-['Playfair_Display']">
                                {receptionSubtitle}
                            </p>
                            {/* Time badge */}
                            <div
                                className="inline-flex items-center gap-3 px-6 py-3 rounded-full border text-sm font-semibold shadow-sm"
                                style={{ borderColor: accentColor, color: accentColor }}
                            >
                                <span style={{ color: accentColor }}>◆</span>
                                <span>{receptionTimeBadge}</span>
                                <span style={{ color: accentColor }}>◆</span>
                            </div>
                        </div>
                        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }} />
                    </div>
                </ScrollReveal>
            </section>

                        )}
            {/* ─── SECTION 5: WEDDING PROGRAMME ───────────────────────────────────── */}
            {showProgramme && (
            <section className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center relative">
                {/* Background ambient warm glow */}
                <div 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-15 pointer-events-none"
                    style={{ backgroundColor: accentColor }}
                />

                <ScrollReveal direction="up" delay={50} duration={800}>
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent to-white/40" />
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.4em] text-white/70 font-mono flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            Order of Events
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        </span>
                        <div className="h-px w-10 sm:w-16 bg-gradient-to-l from-transparent to-white/40" />
                    </div>
                    <h2 className="font-['Playfair_Display'] text-4xl sm:text-5xl md:text-6xl font-normal text-white mb-3 tracking-tight drop-shadow-sm">
                        Wedding Programme
                    </h2>
                    <p className="font-['Playfair_Display'] text-sm sm:text-base text-white/65 italic font-light max-w-md mx-auto mb-12">
                        A curated celebration of love, laughter, and cherished moments.
                    </p>
                </ScrollReveal>

                {/* ─── Continuous Vertical Wedding Timeline (Matching Reference Style) ─── */}
                <div className="max-w-xl mx-auto px-2 sm:px-4">
                    {programme.map((item, idx) => (
                        <ScrollReveal 
                            key={idx} 
                            direction="up" 
                            delay={idx * 50} 
                            duration={600} 
                            distance={14}
                        >
                            <div className="flex items-center min-h-[84px] sm:min-h-[104px] group">
                                {/* Left Column: Time (Right-Aligned towards Circle) */}
                                <div className="w-24 sm:w-36 shrink-0 text-right pr-3.5 sm:pr-6">
                                    <span className="font-['Playfair_Display'] text-sm sm:text-lg font-medium tracking-wider text-white/95 group-hover:text-amber-200 transition-colors whitespace-nowrap">
                                        {item.time}
                                    </span>
                                </div>

                                {/* Center Column: Connecting Vertical Line & Circular Line-Art Icon Node */}
                                <div className="self-stretch flex flex-col items-center shrink-0 w-12 sm:w-16 relative">
                                    {/* Top Connecting Line Segment */}
                                    <div 
                                        className={`w-0.5 flex-1 min-h-[14px] sm:min-h-[18px] transition-opacity duration-300 ${idx === 0 ? 'opacity-0' : 'opacity-85'}`}
                                        style={{ backgroundColor: timelineColor }}
                                    />

                                    {/* Circular Icon Node */}
                                    <div 
                                        className="w-11 h-11 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shrink-0 z-10 my-1 transition-all duration-300 group-hover:scale-110 shadow-[0_4px_16px_rgba(0,0,0,0.3)]"
                                        style={{ 
                                            backgroundColor: timelineColor,
                                            color: '#fff'
                                        }}
                                    >
                                        {getMilestoneTimelineIcon(item, idx)}
                                    </div>

                                    {/* Bottom Connecting Line Segment */}
                                    <div 
                                        className={`w-0.5 flex-1 min-h-[14px] sm:min-h-[18px] transition-opacity duration-300 ${idx === programme.length - 1 ? 'opacity-0' : 'opacity-85'}`}
                                        style={{ backgroundColor: timelineColor }}
                                    />
                                </div>

                                {/* Right Column: Event Title & Note (Left-Aligned) */}
                                <div className="flex-1 min-w-0 pl-3.5 sm:pl-6 text-left py-2">
                                    <h3 className="font-['Playfair_Display'] text-xs sm:text-sm md:text-base font-bold uppercase tracking-[0.18em] text-white leading-snug group-hover:text-amber-100 transition-colors">
                                        {item.title}
                                    </h3>
                                    {item.note && (
                                        <p className="font-['Playfair_Display'] text-[11px] sm:text-xs md:text-sm text-white/70 italic font-light tracking-wide mt-0.5 sm:mt-1 leading-snug">
                                            {item.note}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </section>
            )}

            {/* ─── SECTION 6: DRESS CODE ──────────────────────────────────────────── */}
            {showDressCode && (
            <section className="max-w-3xl mx-auto px-6 py-16 text-center">
                <ScrollReveal direction="up" delay={50} duration={800}>
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="h-px w-10 bg-white/30" />
                        <span className="text-[9px] font-black uppercase tracking-[0.45em] text-white/60">Attire</span>
                        <div className="h-px w-10 bg-white/30" />
                    </div>
                    <h2 className="font-['Playfair_Display'] text-4xl sm:text-5xl font-normal text-white mb-4">
                        {dressCodeTitle}
                    </h2>
                    <p className="font-['Playfair_Display'] italic text-sm sm:text-base text-white/70 max-w-xl mx-auto mb-10 leading-relaxed">
                        {dressCodeTheme}
                    </p>
                </ScrollReveal>

                {dressCodeImage && (
                    <ScrollReveal direction="zoom" delay={150} duration={900}>
                        <div className="max-w-2xl mx-auto rounded-[1.75rem] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.5)] border border-white/10 mb-10 group">
                            <img
                                src={dressCodeImage}
                                alt="Dress code"
                                className="w-full h-auto object-cover block transition-transform duration-700 group-hover:scale-[1.02]"
                            />
                        </div>
                    </ScrollReveal>
                )}

                {/* Colour swatches — larger, more prominent */}
                {dressCodeSwatches.length > 0 && (
                    <div className="flex flex-wrap justify-center items-start gap-6 sm:gap-10 mt-2">
                        {dressCodeSwatches.map((swatch, idx) => (
                            <ScrollReveal key={idx} direction="up" delay={180 + idx * 80} distance={20} duration={650}>
                                <div className="flex flex-col items-center gap-2">
                                    <div
                                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-lg border-2 border-white/30 transition-all duration-300 hover:scale-125 hover:shadow-2xl shrink-0"
                                        style={{ backgroundColor: swatch.color }}
                                    />
                                    <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.25em] text-white/65 font-semibold max-w-[80px] text-center leading-tight">
                                        {swatch.name}
                                    </span>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                )}
            </section>

                        )}
            {/* ─── SECTION 7: MASTER OF CEREMONIES ────────────────────────────────── */}
            {showMc && mcName && (
                <section className="max-w-4xl mx-auto px-6 py-16">
                    <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
                        {mcPhoto && (
                            <ScrollReveal direction="right" delay={100} duration={950} className="w-full md:w-5/12 shrink-0">
                                <div className="relative">
                                    {/* Decorative frame offset */}
                                    <div
                                        className="absolute -inset-3 rounded-[2rem] border border-white/15 -z-10"
                                        style={{ transform: 'rotate(2deg)' }}
                                    />
                                    <div className="rounded-[1.75rem] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.55)] border border-white/10">
                                        <img
                                            src={mcPhoto}
                                            alt={mcName}
                                            className="w-full h-80 sm:h-[26rem] object-cover block"
                                        />
                                    </div>
                                </div>
                            </ScrollReveal>
                        )}

                        <ScrollReveal direction="left" delay={200} duration={950} className="w-full md:w-7/12 text-center md:text-left">
                            <span
                                className="inline-block px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.3em] mb-5 border"
                                style={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.07)' }}
                            >
                                {mcBadge}
                            </span>
                            <h2 className="font-['Playfair_Display'] text-4xl sm:text-5xl text-white font-normal mb-4 leading-tight">
                                {mcName}
                            </h2>
                            <div className="h-px w-14 mb-6 mx-auto md:mx-0" style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }} />
                            <p className="text-white/75 text-sm sm:text-base leading-[1.9] mb-6 font-['Playfair_Display'] italic">
                                {mcBio}
                            </p>
                            {mcHashtag && (
                                <span
                                    className="inline-block text-[10px] font-bold uppercase tracking-[0.35em] px-4 py-2 rounded-full border border-white/20"
                                    style={{ color: 'rgba(255,255,255,0.55)', backgroundColor: 'rgba(255,255,255,0.06)' }}
                                >
                                    {mcHashtag}
                                </span>
                            )}
                        </ScrollReveal>
                    </div>
                </section>
            )}
            {/* ─── SECTION 8: WEDDING COMMITTEE ───────────────────────────────────── */}
            {showCommittee && committee.length > 0 && (
                <section className="max-w-2xl mx-auto px-6 py-16 text-center">
                    <ScrollReveal direction="up" delay={50} duration={800}>
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <div className="h-px w-10 bg-white/30" />
                            <span className="text-[9px] font-black uppercase tracking-[0.45em] text-white/60">Get in Touch</span>
                            <div className="h-px w-10 bg-white/30" />
                        </div>
                        <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl font-normal text-white mb-10">
                            Wedding Committee
                        </h2>
                    </ScrollReveal>

                    <div className="flex flex-wrap justify-center gap-4">
                        {committee.map((person, idx) => (
                            <ScrollReveal key={idx} direction="up" delay={100 + idx * 90} duration={750} distance={22}>
                                <a
                                    href={`tel:${person.phone?.replace(/\s+/g, '')}`}
                                    className="group relative flex flex-col items-center gap-3 bg-white/[0.07] hover:bg-white/[0.14] border border-white/15 hover:border-white/30 rounded-[1.5rem] p-6 min-w-[200px] transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-2xl"
                                >
                                    <div
                                        className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold"
                                        style={{ backgroundColor: accentColor }}
                                    >
                                        {person.name?.charAt(0) || '?'}
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/55 mb-1">{person.name}</p>
                                        <p className="text-white text-base font-bold tracking-wide">{person.phone}</p>
                                    </div>
                                    <span className="text-[9px] uppercase tracking-widest text-white/40 group-hover:text-white/70 transition-colors">
                                        Tap to call
                                    </span>
                                </a>
                            </ScrollReveal>
                        ))}
                    </div>
                </section>
            )}
            {/* ─── SECTION 9: VENUE & MAP ──────────────────────────────────────────── */}
            {showMap && (
            <section className="max-w-3xl mx-auto px-6 py-16 text-center">
                <ScrollReveal direction="up" delay={50} duration={800}>
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="h-px w-10 bg-white/30" />
                        <span className="text-[9px] font-black uppercase tracking-[0.45em] text-white/60">Find Us</span>
                        <div className="h-px w-10 bg-white/30" />
                    </div>
                    <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl font-normal text-white mb-2">
                        Reception Venue
                    </h2>
                    <p className="text-xs font-bold uppercase tracking-[0.35em] mb-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
                        {venueName}
                    </p>
                    <p className="font-['Playfair_Display'] italic text-sm text-white/55 mb-10">
                        {venueAddress}
                    </p>
                </ScrollReveal>

                {mapsEmbedUrl && (
                    <ScrollReveal direction="zoom" delay={150} duration={900}>
                        <div className="w-full rounded-[1.75rem] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.5)] border border-white/10 mb-8 h-72 sm:h-96">
                            <iframe
                                src={mapsEmbedUrl}
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Venue Location Map"
                            />
                        </div>
                    </ScrollReveal>
                )}

                {mapsLink && (
                    <ScrollReveal direction="up" delay={200}>
                        <a
                            href={mapsLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 hover:scale-105 cursor-pointer"
                            style={{
                                backgroundColor: '#ffffff',
                                color: '#0f172a',
                                border: '2px solid rgba(255, 255, 255, 0.9)',
                                boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.6), 0 0 20px rgba(255, 255, 255, 0.2)',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#ffffff'; }}
                        >
                            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" style={{ color: '#059669' }} />
                            <span style={{ color: '#0f172a', fontWeight: 800 }}>View on Google Maps</span>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-500 shrink-0" style={{ color: '#64748b' }} />
                        </a>
                    </ScrollReveal>
                )}
            </section>

            
                        )}
            {/* ─── SECTION: SERVICES ──────────────────────────────────────────── */}
            {showServices && services.length > 0 && (
                <section className="max-w-4xl mx-auto px-6 py-16">
                    <ScrollReveal direction="up" delay={50} duration={800} className="text-center">
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <div className="h-px w-10 bg-white/30" />
                            <span className="text-[9px] font-black uppercase tracking-[0.45em] text-white/60">{servicesBadge}</span>
                            <div className="h-px w-10 bg-white/30" />
                        </div>
                        <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl font-normal text-white mb-10">
                            {servicesTitle}
                        </h2>
                    </ScrollReveal>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {services.map((srv, idx) => (
                            <ScrollReveal key={idx} direction="up" delay={100 + idx * 80} duration={700}>
                                <div className="flex items-start gap-4 p-6 rounded-3xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 transition-all shadow-lg hover:shadow-2xl">
                                    <div 
                                        className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-full flex items-center justify-center text-white"
                                        style={{ backgroundColor: accentColor }}
                                    >
                                        <ServiceBadgeIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/50 mb-1">
                                            {srv.name}
                                        </p>
                                        <h3 className="font-['Playfair_Display'] text-lg sm:text-xl text-white mb-2 leading-tight">
                                            {srv.provider}
                                        </h3>
                                        <p className="font-['Playfair_Display'] italic text-sm text-white/60 leading-relaxed">
                                            {srv.note}
                                        </p>
                                    </div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </section>
            )}

            {/* ─── SECTION 10: ENTRY PASS ─────────────────────────────────────────── */}
            <section className="max-w-sm mx-auto px-6 py-16 text-center">
                <ScrollReveal direction="up" delay={50} duration={800}>
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="h-px w-10 bg-white/30" />
                        <span className="text-[9px] font-black uppercase tracking-[0.45em] text-white/60">Entry Pass</span>
                        <div className="h-px w-10 bg-white/30" />
                    </div>
                    <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl font-normal text-white mb-10">
                        Guest Verification
                    </h2>
                </ScrollReveal>

                <ScrollReveal direction="zoom" delay={150} duration={900}>
                    <div
                        className="relative rounded-[2rem] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.5)]"
                        style={{ background: 'linear-gradient(145deg, #fff 0%, #faf7f2 100%)' }}
                    >
                        {/* Top accent */}
                        <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }} />

                        <div className="p-8 sm:p-10">
                            {/* QR */}
                            <div
                                className="inline-block p-4 rounded-2xl mb-6 shadow-inner"
                                style={{ border: `2px solid ${accentColor}`, backgroundColor: '#faf7f2' }}
                            >
                                {qrCodeUrl ? (
                                    <img
                                        src={qrCodeUrl}
                                        alt="Verification QR Code"
                                        className="w-44 h-44 object-contain mx-auto block"
                                    />
                                ) : (
                                    <div className="w-44 h-44 bg-slate-100 animate-pulse rounded-lg" />
                                )}
                            </div>

                            {/* Category badge */}
                            <span
                                className="inline-block px-6 py-2 rounded-full text-white text-[10px] font-bold uppercase tracking-[0.3em] mb-3 shadow-sm"
                                style={{ backgroundColor: accentColor }}
                            >
                                {guest?.category || guest?.allowance_label || 'Entry Pass'}
                            </span>

                            <p className="font-['Playfair_Display'] italic text-slate-500 text-sm mt-1">
                                Please present this code at the reception entrance.
                            </p>

                            {/* View card */}
                            <button
                                type="button"
                                onClick={() => setShowFullCardModal(true)}
                                className="mt-6 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] transition-all duration-200 hover:scale-105 cursor-pointer"
                                style={{ color: accentColor }}
                            >
                                <CreditCard className="w-3.5 h-3.5" /> View Digital Card
                            </button>
                        </div>
                        <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }} />
                    </div>
                </ScrollReveal>

                {adultsOnlyNote && (
                    <ScrollReveal direction="up" delay={220}>
                        <div className="mt-12 px-2">
                            <div className="flex items-center justify-center gap-3 mb-5">
                                <div className="h-px flex-1 bg-white/20" />
                                <span className="text-white/40 text-xs">◆</span>
                                <div className="h-px flex-1 bg-white/20" />
                            </div>
                            <p className="font-['Playfair_Display'] italic text-sm text-white/65 leading-[1.9]">
                                {adultsOnlyNote}
                            </p>
                        </div>
                    </ScrollReveal>
                )}
            </section>

            {/* ─── SECTION 11: RSVP ───────────────────────────────────────────────── */}
            <section id="rsvpSection" className="max-w-xl mx-auto px-4 sm:px-6 py-12">
                <ScrollReveal direction="up" delay={80} duration={900}>
                    <div
                        className="relative rounded-[2rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.45)]"
                        style={{ background: 'linear-gradient(145deg, #fff 0%, #faf7f2 100%)' }}
                    >
                        <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }} />

                        <div className="p-8 sm:p-12">
                            {/* Header */}
                            <div className="text-center mb-10">
                                <div className="flex items-center justify-center gap-3 mb-4">
                                    <div className="h-px w-10 bg-slate-200" />
                                    <span className="text-[9px] font-bold uppercase tracking-[0.45em] text-slate-400">Kindly Reply</span>
                                    <div className="h-px w-10 bg-slate-200" />
                                </div>
                                <h2
                                    className="font-['Great_Vibes',cursive] text-6xl font-normal"
                                    style={{ color: bgColor, lineHeight: 1.1 }}
                                >
                                    RSVP
                                </h2>
                            </div>

                            <form onSubmit={handleSubmitRsvp} className="space-y-7">
                                {/* Name field */}
                                <div className="relative">
                                    <input
                                        type="text"
                                        readOnly
                                        value={guest?.name || 'Valued Guest'}
                                        className="w-full bg-transparent border-0 border-b-2 border-slate-200 focus:border-b-2 pb-3 text-slate-800 text-base font-semibold focus:ring-0 transition-colors"
                                        style={{ outline: 'none' }}
                                    />
                                    <span className="absolute right-0 bottom-3 text-[9px] uppercase tracking-widest text-slate-400">Guest</span>
                                </div>

                                {/* Attendance */}
                                <div>
                                    <p className="text-[9px] font-bold uppercase tracking-[0.4em] mb-4" style={{ color: 'rgba(0,0,0,0.4)' }}>
                                        Will you attend?
                                    </p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setRsvpChoice('attending')}
                                            className="py-4 px-4 rounded-2xl text-xs font-bold border-2 transition-all duration-250 cursor-pointer text-center shadow-sm"
                                            style={rsvpChoice === 'attending'
                                                ? { backgroundColor: accentColor, borderColor: accentColor, color: '#fff', boxShadow: `0 8px 24px ${accentColor}55` }
                                                : { backgroundColor: '#faf7f2', borderColor: '#e5e0d8', color: '#666' }
                                            }
                                        >
                                            ✦ Yes, with pleasure
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setRsvpChoice('declined')}
                                            className="py-4 px-4 rounded-2xl text-xs font-bold border-2 transition-all duration-250 cursor-pointer text-center shadow-sm"
                                            style={rsvpChoice === 'declined'
                                                ? { backgroundColor: bgColor, borderColor: bgColor, color: '#fff', boxShadow: `0 8px 24px ${bgColor}55` }
                                                : { backgroundColor: '#faf7f2', borderColor: '#e5e0d8', color: '#666' }
                                            }
                                        >
                                            Declines with regret
                                        </button>
                                    </div>
                                </div>

                                {/* Message */}
                                <div className="relative">
                                    <textarea
                                        rows="3"
                                        value={rsvpMessage}
                                        onChange={(e) => setRsvpMessage(e.target.value)}
                                        placeholder={`A message for ${coupleTitle}…`}
                                        className="w-full bg-transparent border-0 border-b-2 border-slate-200 pb-3 text-slate-700 text-sm focus:ring-0 resize-none placeholder:text-slate-400 transition-colors"
                                        style={{ outline: 'none' }}
                                    />
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={isSubmittingRsvp}
                                    className="w-full py-4 rounded-full text-white text-[10px] font-bold uppercase tracking-[0.4em] transition-all duration-300 cursor-pointer disabled:opacity-60 hover:opacity-95 hover:scale-[1.02] active:scale-[0.99]"
                                    style={{
                                        background: `linear-gradient(135deg, ${accentColor} 0%, ${bgColor} 100%)`,
                                        boxShadow: `0 12px 32px ${accentColor}55`
                                    }}
                                >
                                    {isSubmittingRsvp ? 'Sending…' : '✦ Send My Response ✦'}
                                </button>
                            </form>
                        </div>
                        <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }} />
                    </div>
                </ScrollReveal>
            </section>

            {/* ─── SECTION 12: FOOTER ─────────────────────────────────────────────── */}
            <footer
                className="relative py-20 px-6 text-center overflow-hidden"
                style={{ background: `linear-gradient(180deg, transparent 0%, ${bgColor}ee 100%)` }}
            >
                {/* Decorative backdrop */}
                <div className="absolute inset-0 bg-black/20" />
                <ScrollReveal direction="up" delay={80} duration={900} className="relative z-10">
                    <div className="flex items-center justify-center gap-4 mb-8">
                        <div className="h-px w-16 bg-white/25" />
                        <span className="text-white/40 text-xl">✦</span>
                        <div className="h-px w-16 bg-white/25" />
                    </div>
                    <h2
                        className="font-['Great_Vibes',cursive] text-5xl sm:text-7xl text-white mb-4 drop-shadow-lg"
                        style={{ lineHeight: 1.1 }}
                    >
                        {footerText}
                    </h2>
                    <p className="font-['Playfair_Display'] tracking-[0.4em] text-sm text-white/60 mb-10">
                        {heroDateFormatted}
                    </p>
                    <div className="flex items-center justify-center gap-2 text-[9px] font-mono uppercase tracking-widest text-white/35">
                        <KardovoLogo light showText={false} className="w-4 h-4 opacity-50" />
                        <span>Powered by Kardovo</span>
                    </div>
                </ScrollReveal>
            </footer>
            </div>
            {/* Floating Back to Top Button */}
            {showBackToTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-white shadow-2xl flex items-center justify-center text-lg z-50 transition-all hover:scale-110 cursor-pointer border border-black/10"
                    style={{ color: accentColor }}
                    title="Back to Top"
                    aria-label="Back to Top"
                >
                    <ArrowUp className="w-5 h-5" />
                </button>
            )}

            {/* Full Digital Card Modal */}
            {showFullCardModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 max-w-lg w-full relative max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setShowFullCardModal(false)}
                            className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h3 className="text-base font-bold text-slate-900 mb-4 text-center">Your Digital Pass</h3>
                        <div className="flex justify-center">
                            <PersonalisedCard
                                guest={guest}
                                event={event}
                                template={template}
                                interactive={true}
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toastMessage && (
                <div
                    className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3.5 rounded-2xl shadow-2xl text-white text-sm font-semibold flex items-center gap-2 animate-fade-in ${
                        toastType === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
                    }`}
                >
                    {toastType === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    <span>{toastMessage}</span>
                </div>
            )}
        </div>
    );
}
