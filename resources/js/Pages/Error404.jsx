import React from "react";
import { Head, Link } from "@inertiajs/react";
import { useTheme } from "@/Hooks/useTheme";
import InteractiveBee3D from "@/Components/InteractiveBee3D";
import InteractiveFirefly3D from "@/Components/InteractiveFirefly3D";
import { Sun, Moon } from "lucide-react";

export default function Error404() {
    const { theme, isDark, toggleTheme } = useTheme();

    return (
        <div 
            key={isDark ? "dark-theme-404" : "light-theme-404"}
            className="min-h-screen w-full relative flex flex-col justify-between select-none font-sans overflow-hidden transition-all duration-500"
            style={{
                background: isDark 
                    ? "linear-gradient(180deg, #071326 0%, #0A1A35 50%, #040914 100%)" 
                    : "linear-gradient(180deg, #4EA8DE 0%, #72C1F7 50%, #AEE0FC 100%)",
                color: isDark ? "#FFFFFF" : "#0F172A",
            }}
        >
            <Head title={`404 — ${isDark ? "Starry Night Firefly" : "Sunny Day & Bee"} | Kardovo`} />

            {/* ════════════ 1. BACKGROUND ATMOSPHERE (LIGHT: SUNNY SKY / DARK: NIGHT STARS & MOON) ════════════ */}
            {isDark ? (
                /* ─── DARK MODE: DEEP COSMIC NIGHT SKY WITH GLOWING MOON & STARS ─── */
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                    <div className="absolute -top-20 right-1/4 w-[550px] h-[550px] bg-amber-400/15 rounded-full blur-[140px]" />
                    <div className="absolute top-1/3 -left-20 w-[500px] h-[500px] bg-cyan-500/12 rounded-full blur-[130px]" />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-amber-500/10 rounded-full blur-[120px]" />

                    {/* Animated Luminous Crescent Moon */}
                    <div className="absolute top-10 right-16 sm:right-24 z-0 pointer-events-none hidden sm:block">
                        <div 
                            className="relative w-20 h-20 rounded-full"
                            style={{
                                animation: "moonFloat 6s ease-in-out infinite alternate",
                            }}
                        >
                            <div className="absolute -inset-4 rounded-full bg-amber-200/25 blur-xl animate-pulse duration-[3000ms]" />
                            <div className="absolute -inset-8 rounded-full bg-amber-300/15 blur-2xl animate-pulse duration-[4500ms]" />

                            <div 
                                className="relative w-20 h-20 rounded-full shadow-[0_0_50px_rgba(254,240,138,0.7),inset_0_0_20px_rgba(255,255,255,0.9)] overflow-hidden"
                                style={{
                                    background: "radial-gradient(circle at 30% 30%, #FFFDF0 0%, #FEF08A 50%, #FACC15 85%, #EAB308 100%)",
                                }}
                            >
                                <div 
                                    className="absolute -top-1.5 -right-1.5 w-18 h-18 rounded-full"
                                    style={{
                                        background: "linear-gradient(135deg, #071326 0%, #0A1A35 100%)",
                                    }}
                                />
                                <div className="absolute bottom-3 left-4 w-2.5 h-2.5 rounded-full bg-amber-300/40 blur-[0.5px]" />
                                <div className="absolute top-7 left-2 w-2 h-2 rounded-full bg-amber-300/35 blur-[0.5px]" />
                            </div>
                        </div>
                    </div>

                    {/* Twinkling Night Stars */}
                    <svg className="absolute inset-0 w-full h-full opacity-80" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12%" cy="18%" r="1.5" fill="#ffffff" className="animate-pulse duration-[3000ms]" />
                        <circle cx="28%" cy="12%" r="2" fill="#fef08a" className="animate-pulse duration-[2000ms]" />
                        <circle cx="45%" cy="22%" r="1.2" fill="#ffffff" />
                        <circle cx="68%" cy="14%" r="1.8" fill="#fde047" className="animate-pulse duration-[4000ms]" />
                        <circle cx="85%" cy="25%" r="2.2" fill="#fef08a" className="animate-pulse duration-[2500ms]" />
                        <circle cx="92%" cy="10%" r="1.5" fill="#ffffff" />
                        
                        <circle cx="8%" cy="45%" r="1.2" fill="#67e8f9" />
                        <circle cx="22%" cy="58%" r="2" fill="#ffffff" className="animate-pulse duration-[3500ms]" />
                        <circle cx="78%" cy="48%" r="1.6" fill="#fef08a" className="animate-pulse duration-[1800ms]" />
                        <circle cx="90%" cy="65%" r="2" fill="#fde047" className="animate-pulse duration-[2800ms]" />
                        
                        <circle cx="15%" cy="80%" r="2" fill="#ffffff" className="animate-pulse duration-[3000ms]" />
                        <circle cx="35%" cy="88%" r="1.4" fill="#ffffff" />
                        <circle cx="60%" cy="82%" r="1.8" fill="#fef08a" className="animate-pulse duration-[4000ms]" />
                        <circle cx="80%" cy="90%" r="1.5" fill="#ffffff" />
                        
                        <g transform="translate(180, 110)" className="animate-pulse duration-[3000ms]">
                            <line x1="-7" y1="0" x2="7" y2="0" stroke="#fef08a" strokeWidth="1" strokeLinecap="round" />
                            <line x1="0" y1="-7" x2="0" y2="7" stroke="#fef08a" strokeWidth="1" strokeLinecap="round" />
                            <circle cx="0" cy="0" r="2.2" fill="#ffffff" />
                        </g>
                        <g transform="translate(1080, 170)" className="animate-pulse duration-[4500ms]">
                            <line x1="-8" y1="0" x2="8" y2="0" stroke="#fde047" strokeWidth="1.2" strokeLinecap="round" />
                            <line x1="0" y1="-8" x2="0" y2="8" stroke="#fde047" strokeWidth="1.2" strokeLinecap="round" />
                            <circle cx="0" cy="0" r="2.5" fill="#ffffff" />
                        </g>
                    </svg>
                </div>
            ) : (
                /* ─── LIGHT MODE: SUNNY SKY & FLOATING CLOUDS ─── */
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                    <div className="absolute -top-24 right-1/4 w-[500px] h-[500px] bg-amber-200/35 rounded-full blur-[100px]" />
                    <div className="absolute top-1/3 -left-20 w-[450px] h-[450px] bg-white/30 rounded-full blur-[90px]" />
                    <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-white/20 rounded-full blur-[100px]" />

                    {/* Vector 3D Clouds */}
                    <svg className="absolute top-10 left-6 w-60 h-32 text-white/45 fill-current animate-pulse duration-[8000ms]" viewBox="0 0 100 50">
                        <path d="M 20 40 Q 15 25 30 20 Q 40 5 60 15 Q 75 10 80 25 Q 90 30 85 40 Z" />
                    </svg>
                    <svg className="absolute top-20 right-8 w-80 h-40 text-white/40 fill-current animate-pulse duration-[10000ms]" viewBox="0 0 100 50">
                        <path d="M 20 40 Q 15 25 30 20 Q 40 5 60 15 Q 75 10 80 25 Q 90 30 85 40 Z" />
                    </svg>
                    <svg className="absolute top-1/2 left-1/3 w-72 h-36 text-white/30 fill-current" viewBox="0 0 100 50">
                        <path d="M 20 40 Q 15 25 30 20 Q 40 5 60 15 Q 75 10 80 25 Q 90 30 85 40 Z" />
                    </svg>
                    <svg className="absolute bottom-16 right-16 w-64 h-32 text-white/25 fill-current" viewBox="0 0 100 50">
                        <path d="M 20 40 Q 15 25 30 20 Q 40 5 60 15 Q 75 10 80 25 Q 90 30 85 40 Z" />
                    </svg>
                </div>
            )}

            {/* ════════════ 2. TOP BRAND HEADER (ALL BUTTONS REDIRECT TO LOGIN) ════════════ */}
            <header className="relative z-40 w-full max-w-7xl mx-auto px-6 sm:px-10 py-6 flex items-center justify-between pointer-events-auto">
                {/* Kardovo Vector Logo + Wordmark -> Redirects to /login */}
                <Link 
                    href="/login" 
                    className="flex items-center gap-3 group transition active:scale-95 cursor-pointer"
                    title="Go to Login"
                >
                    <div className={`w-10 h-10 rounded-2xl p-2 flex items-center justify-center shadow-xs transition backdrop-blur-xl ${
                        isDark 
                            ? "bg-white/[0.08] border border-white/[0.15] group-hover:bg-white/[0.15] group-hover:border-amber-400/50" 
                            : "bg-white/40 border border-white/60 group-hover:bg-white/60"
                    }`}>
                        <img 
                            src="/images/kardovo_logo.png" 
                            alt="Kardovo" 
                            className="w-full h-full object-contain" 
                        />
                    </div>
                    <span className={`font-black text-xl tracking-wider font-display ${
                        isDark 
                            ? "text-white drop-shadow-[0_2px_12px_rgba(250,204,21,0.4)]" 
                            : "text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]"
                    }`}>
                        KARDOVO
                    </span>
                </Link>

                {/* Right Action Bar (Theme Switcher + Log In Button) */}
                <div className="flex items-center gap-2.5">
                    {/* Theme Toggle Button (Light/Dark) */}
                    <button
                        type="button"
                        onClick={toggleTheme}
                        className={`p-2.5 rounded-2xl backdrop-blur-xl border transition duration-300 active:scale-95 flex items-center justify-center cursor-pointer shadow-xs ${
                            isDark 
                                ? "bg-white/[0.08] hover:bg-white/[0.18] border-white/[0.15] text-amber-300 hover:border-amber-400/50 shadow-[0_0_15px_rgba(250,204,21,0.2)]" 
                                : "bg-white/40 hover:bg-white/65 border-white/60 text-slate-800"
                        }`}
                        title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
                    >
                        {isDark ? (
                            <Sun className="w-4 h-4 text-amber-300 animate-spin duration-[12000ms]" />
                        ) : (
                            <Moon className="w-4 h-4 text-slate-900" />
                        )}
                    </button>

                    {/* Top-Right "Log in" Pill Button -> Redirects to /login */}
                    <Link
                        href="/login"
                        className={`px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm backdrop-blur-xl border shadow-xs hover:shadow-md transition duration-200 active:scale-95 flex items-center gap-2 cursor-pointer ${
                            isDark 
                                ? "bg-white/[0.08] hover:bg-white/[0.18] text-white hover:text-amber-300 border-white/[0.15] hover:border-amber-400/50" 
                                : "bg-white/40 hover:bg-white/65 text-slate-900 font-extrabold border-white/60"
                        }`}
                        title="Go to Login"
                    >
                        <span>Log in</span>
                    </Link>
                </div>
            </header>

            {/* ════════════ 3. HERO ZONE: 404 BACKDROP & HEADLINE ════════════ */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-2 pointer-events-none select-none">
                <div className="relative w-full max-w-5xl flex items-center justify-center">
                    
                    {/* Massive 3D Vector "4 0 4" Background Backdrop */}
                    <div className="flex items-center justify-center pointer-events-none select-none">
                        <span 
                            className={`text-[140px] sm:text-[230px] md:text-[300px] lg:text-[360px] font-black tracking-tight leading-none font-display text-center select-none ${
                                isDark 
                                    ? "text-white/[0.12] drop-shadow-[0_0_90px_rgba(250,204,21,0.4)]" 
                                    : "text-white/95 drop-shadow-[0_15px_40px_rgba(255,255,255,0.45)]"
                            }`}
                            style={{ 
                                letterSpacing: "0.06em",
                                WebkitTextStroke: isDark ? "1.5px rgba(255, 255, 255, 0.25)" : "none",
                                textShadow: isDark 
                                    ? "0 0 90px rgba(250, 204, 21, 0.45), 0 20px 60px rgba(0, 0, 0, 0.8)" 
                                    : "0 10px 30px rgba(0, 100, 200, 0.15), 0 20px 60px rgba(255, 255, 255, 0.6)"
                            }}
                        >
                            404
                        </span>
                    </div>
                </div>

                {/* ════════════ 4. BOTTOM HEADLINE COPY ════════════ */}
                <div className="text-center z-20 max-w-md mx-auto space-y-1 mt-2 sm:mt-4 pointer-events-auto">
                    <h1 className={`text-2xl sm:text-4xl font-black tracking-tight font-display ${
                        isDark 
                            ? "text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]" 
                            : "text-slate-900 drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]"
                    }`}>
                        Oops! I think we’re lost
                    </h1>
                    <p className={`text-sm sm:text-base font-semibold leading-relaxed ${
                        isDark ? "text-slate-300" : "text-slate-700"
                    }`}>
                        Let’s get you back to somewhere familiar
                    </p>
                </div>
            </main>

            {/* ════════════ 5. FOOTER ════════════ */}
            <footer className="relative z-20 py-4 text-center pointer-events-none">
                <p className={`text-[11px] font-bold tracking-wider ${
                    isDark ? "text-slate-500 font-mono uppercase" : "text-slate-700/80"
                }`}>
                    Secured &amp; Powered by Kardovo Engine
                </p>
            </footer>

            {/* ════════════ 6. INTERACTIVE 3D FLYING CREATURE (LIGHT: BEE / DARK: FIREFLY) ════════════ */}
            {isDark ? <InteractiveFirefly3D key="firefly-component" /> : <InteractiveBee3D key="bee-component" />}

            {/* Moon Floating Keyframe */}
            <style>{`
                @keyframes moonFloat {
                    0% { transform: translateY(0px) rotate(0deg); }
                    100% { transform: translateY(-10px) rotate(2deg); }
                }
            `}</style>
        </div>
    );
}
