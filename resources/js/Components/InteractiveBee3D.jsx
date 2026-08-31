import React, { useEffect, useState, useRef } from "react";

export default function InteractiveBee3D() {
    const [beeState, setBeeState] = useState(() => ({
        x: typeof window !== "undefined" ? window.innerWidth / 2 : 400,
        y: typeof window !== "undefined" ? window.innerHeight / 2.2 : 350,
        headingAngle: 0,
        tiltX: 0,
        tiltY: 0,
        speed: 0,
    }));
    const [particles, setParticles] = useState([]);
    const [isSpinning, setIsSpinning] = useState(false);

    const posRef = useRef({
        currX: typeof window !== "undefined" ? window.innerWidth / 2 : 400,
        currY: typeof window !== "undefined" ? window.innerHeight / 2.2 : 350,
        targetX: typeof window !== "undefined" ? window.innerWidth / 2 : 400,
        targetY: typeof window !== "undefined" ? window.innerHeight / 2.2 : 350,
        headingAngle: 0,
        tiltX: 0,
        tiltY: 0,
    });

    const particlesRef = useRef([]);

    useEffect(() => {
        const initialX = window.innerWidth / 2;
        const initialY = window.innerHeight / 2.2;
        posRef.current.currX = initialX;
        posRef.current.currY = initialY;
        posRef.current.targetX = initialX;
        posRef.current.targetY = initialY;

        const calculateSafeTarget = (clientX, clientY) => {
            const width = window.innerWidth;
            let targetX = clientX;
            let targetY = clientY;

            // Strict exclusion zone for Top Header Buttons
            if (clientY < 170) {
                if (clientX < 360) {
                    targetY = Math.max(190, clientY + 110);
                    targetX = Math.max(340, clientX + 90);
                } else if (clientX > width - 320) {
                    targetY = Math.max(190, clientY + 110);
                    targetX = Math.min(width - 300, clientX - 90);
                } else {
                    targetY = Math.max(170, clientY + 60);
                }
            } else {
                targetX = clientX + 35;
                targetY = clientY + 35;
            }

            return { targetX, targetY };
        };

        const handleMouseMove = (e) => {
            const { targetX, targetY } = calculateSafeTarget(e.clientX, e.clientY);
            posRef.current.targetX = targetX;
            posRef.current.targetY = targetY;
        };

        const handleTouchMove = (e) => {
            if (e.touches && e.touches[0]) {
                const { targetX, targetY } = calculateSafeTarget(e.touches[0].clientX, e.touches[0].clientY);
                posRef.current.targetX = targetX;
                posRef.current.targetY = targetY;
            }
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("touchmove", handleTouchMove, { passive: true });

        // Physics Animation Loop
        let animationFrameId;
        let lastTime = performance.now();

        const updatePhysics = (time) => {
            animationFrameId = requestAnimationFrame(updatePhysics);
            lastTime = time;

            const p = posRef.current;

            const dx = p.targetX - p.currX;
            const dy = p.targetY - p.currY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            const speed = Math.min(dist * 0.08, 25);
            p.currX += dx * 0.06;
            p.currY += dy * 0.06;

            const bob = Math.sin(time * 0.005) * 6;

            let targetHeading = p.headingAngle;
            let targetTiltX = 0;
            let targetTiltY = 0;

            if (dist > 10) {
                const angleRad = Math.atan2(dy, dx);
                targetHeading = angleRad * (180 / Math.PI) + 90;
                targetTiltX = Math.min(30, speed * 1.5);
                targetTiltY = (dx / (dist || 1)) * 15;
            } else {
                targetHeading = Math.sin(time * 0.002) * 8;
                targetTiltX = Math.sin(time * 0.004) * 5;
                targetTiltY = Math.sin(time * 0.003) * 5;
            }

            let diff = ((targetHeading - p.headingAngle + 540) % 360) - 180;
            p.headingAngle += diff * 0.12;

            p.tiltX += (targetTiltX - p.tiltX) * 0.1;
            p.tiltY += (targetTiltY - p.tiltY) * 0.1;

            setBeeState({
                x: p.currX,
                y: p.currY + bob,
                headingAngle: p.headingAngle,
                tiltX: p.tiltX,
                tiltY: p.tiltY,
                speed: speed,
            });

            // Golden Pollen Particles Trail
            if (Math.random() < 0.35 + (speed > 2 ? 0.5 : 0)) {
                const rad = (p.headingAngle - 90) * (Math.PI / 180);
                const tailX = p.currX - Math.cos(rad) * 30;
                const tailY = p.currY - Math.sin(rad) * 30;

                particlesRef.current.push({
                    id: Math.random(),
                    x: tailX + (Math.random() - 0.5) * 14,
                    y: tailY + (Math.random() - 0.5) * 14,
                    size: Math.random() * 6 + 4,
                    opacity: 0.9,
                    vx: -Math.cos(rad) * (Math.random() * 1.5 + 0.5),
                    vy: -Math.sin(rad) * (Math.random() * 1.5 + 0.5),
                });
            }

            particlesRef.current = particlesRef.current
                .map((pt) => ({
                    ...pt,
                    x: pt.x + pt.vx,
                    y: pt.y + pt.vy,
                    opacity: pt.opacity - 0.025,
                }))
                .filter((pt) => pt.opacity > 0);

            setParticles([...particlesRef.current]);
        };

        animationFrameId = requestAnimationFrame(updatePhysics);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("touchmove", handleTouchMove);
        };
    }, []);

    const handleBeeClick = () => {
        if (isSpinning) return;
        setIsSpinning(true);
        setTimeout(() => setIsSpinning(false), 900);
    };

    return (
        <div className="fixed inset-0 w-full h-full pointer-events-none z-20 overflow-hidden select-none">
            {particles.map((pt) => (
                <div
                    key={pt.id}
                    className="absolute rounded-full pointer-events-none shadow-sm"
                    style={{
                        left: `${pt.x}px`,
                        top: `${pt.y}px`,
                        width: `${pt.size}px`,
                        height: `${pt.size}px`,
                        backgroundColor: "#FACC15",
                        boxShadow: "0 0 10px #FDE047, 0 0 4px #F59E0B",
                        opacity: pt.opacity,
                        transform: "translate(-50%, -50%)",
                    }}
                />
            ))}

            <div
                className="absolute pointer-events-none"
                style={{
                    left: `${beeState.x}px`,
                    top: `${beeState.y}px`,
                    transform: `translate(-50%, -50%) rotate(${beeState.headingAngle}deg) perspective(800px) rotateX(${beeState.tiltX}deg) rotateY(${beeState.tiltY}deg) ${
                        isSpinning ? "rotate(360deg) scale(1.2)" : ""
                    }`,
                    transition: isSpinning ? "transform 0.85s cubic-bezier(0.34, 1.56, 0.64, 1)" : "none",
                    filter: "drop-shadow(0 20px 25px rgba(0,0,0,0.22))",
                }}
            >
                <div className="relative w-36 h-36 flex items-center justify-center pointer-events-auto cursor-pointer" onClick={handleBeeClick}>

                    {/* Top Left Wing */}
                    <div
                        className="absolute origin-bottom-right"
                        style={{
                            top: "8px",
                            left: "14px",
                            width: "56px",
                            height: "36px",
                            borderRadius: "50% 50% 20% 60%",
                            background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(224,242,254,0.75) 50%, rgba(186,230,253,0.45) 100%)",
                            border: "1.5px solid rgba(255,255,255,0.9)",
                            boxShadow: "0 0 12px rgba(186,230,253,0.8), inset 0 0 8px rgba(255,255,255,0.9)",
                            animation: "wingFlutterLeft 0.05s infinite alternate ease-in-out",
                            transformOrigin: "bottom right",
                        }}
                    >
                        <svg className="w-full h-full opacity-60" viewBox="0 0 50 30">
                            <path d="M 50 30 Q 30 15 5 10 M 50 30 Q 25 25 15 28 M 35 20 Q 20 8 10 5" stroke="#38bdf8" strokeWidth="1" fill="none" />
                        </svg>
                    </div>

                    {/* Bottom Left Wing */}
                    <div
                        className="absolute origin-top-right"
                        style={{
                            top: "34px",
                            left: "24px",
                            width: "42px",
                            height: "26px",
                            borderRadius: "50% 50% 30% 60%",
                            background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(224,242,254,0.65) 60%, rgba(186,230,253,0.35) 100%)",
                            border: "1px solid rgba(255,255,255,0.8)",
                            boxShadow: "0 0 8px rgba(186,230,253,0.6)",
                            animation: "wingFlutterLeft 0.06s infinite alternate ease-in-out",
                            transformOrigin: "top right",
                        }}
                    />

                    {/* Top Right Wing */}
                    <div
                        className="absolute origin-bottom-left"
                        style={{
                            top: "8px",
                            right: "14px",
                            width: "56px",
                            height: "36px",
                            borderRadius: "50% 50% 60% 20%",
                            background: "linear-gradient(225deg, rgba(255,255,255,0.95) 0%, rgba(224,242,254,0.75) 50%, rgba(186,230,253,0.45) 100%)",
                            border: "1.5px solid rgba(255,255,255,0.9)",
                            boxShadow: "0 0 12px rgba(186,230,253,0.8), inset 0 0 8px rgba(255,255,255,0.9)",
                            animation: "wingFlutterRight 0.05s infinite alternate ease-in-out",
                            transformOrigin: "bottom left",
                        }}
                    >
                        <svg className="w-full h-full opacity-60" viewBox="0 0 50 30">
                            <path d="M 0 30 Q 20 15 45 10 M 0 30 Q 25 25 35 28 M 15 20 Q 30 8 40 5" stroke="#38bdf8" strokeWidth="1" fill="none" />
                        </svg>
                    </div>

                    {/* Bottom Right Wing */}
                    <div
                        className="absolute origin-top-left"
                        style={{
                            top: "34px",
                            right: "24px",
                            width: "42px",
                            height: "26px",
                            borderRadius: "50% 50% 60% 30%",
                            background: "linear-gradient(225deg, rgba(255,255,255,0.9) 0%, rgba(224,242,254,0.65) 60%, rgba(186,230,253,0.35) 100%)",
                            border: "1px solid rgba(255,255,255,0.8)",
                            boxShadow: "0 0 8px rgba(186,230,253,0.6)",
                            animation: "wingFlutterRight 0.06s infinite alternate ease-in-out",
                            transformOrigin: "top left",
                        }}
                    />

                    {/* --- MAIN BEE BODY --- */}
                    <div className="relative flex flex-col items-center z-10">

                        {/* Wobbly Antennae */}
                        <div className="flex items-end justify-center gap-7 -mb-2 z-20">
                            <div className="flex flex-col items-center animate-pulse duration-[1200ms] origin-bottom -rotate-12">
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-200 shadow-sm" />
                                <div className="w-1 h-4 bg-slate-900 rounded-full" />
                            </div>
                            <div className="flex flex-col items-center animate-pulse duration-[1400ms] origin-bottom rotate-12">
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-200 shadow-sm" />
                                <div className="w-1 h-4 bg-slate-900 rounded-full" />
                            </div>
                        </div>

                        {/* Bee Head */}
                        <div 
                            className="relative w-16 h-14 rounded-[45%] flex items-center justify-center shadow-md z-10"
                            style={{
                                background: "radial-gradient(circle at 35% 30%, #FFD166 0%, #FFB703 60%, #FB8500 100%)",
                                border: "1.5px solid #F59E0B",
                            }}
                        >
                            <div className="absolute -top-1 w-8 h-3 bg-slate-900 rounded-full" />

                            <div className="flex items-center justify-between w-full px-2 mt-1">
                                <div className="relative w-4 h-5 rounded-full bg-slate-950 shadow-inner flex items-center justify-center overflow-hidden">
                                    <div className="absolute top-1 left-1 w-1.5 h-2 rounded-full bg-white" />
                                    <div className="absolute bottom-1 right-1 w-0.8 h-0.8 rounded-full bg-white/80" />
                                </div>

                                <div className="w-3.5 h-2 border-b-2 border-slate-900 rounded-full" />

                                <div className="relative w-4 h-5 rounded-full bg-slate-950 shadow-inner flex items-center justify-center overflow-hidden">
                                    <div className="absolute top-1 left-1 w-1.5 h-2 rounded-full bg-white" />
                                    <div className="absolute bottom-1 right-1 w-0.8 h-0.8 rounded-full bg-white/80" />
                                </div>
                            </div>

                            <div className="absolute bottom-2.5 left-1 w-2.5 h-1.5 rounded-full bg-rose-400/70 blur-[0.5px]" />
                            <div className="absolute bottom-2.5 right-1 w-2.5 h-1.5 rounded-full bg-rose-400/70 blur-[0.5px]" />
                        </div>

                        {/* Plump Striped Abdomen */}
                        <div 
                            className="relative -mt-2 w-20 h-24 rounded-[45%_45%_55%_55%] overflow-hidden shadow-xl flex flex-col justify-between"
                            style={{
                                background: "linear-gradient(180deg, #FFB703 0%, #FB8500 100%)",
                                border: "1.5px solid #F59E0B",
                            }}
                        >
                            <div className="absolute top-2 left-3 w-5 h-8 rounded-full bg-white/35 blur-[2px] pointer-events-none" />

                            <div className="w-full h-4 bg-slate-900 mt-2 shadow-xs" />
                            <div className="w-full h-4 bg-slate-900 shadow-xs" />
                            <div className="w-full h-4 bg-slate-900 shadow-xs" />

                            <div className="w-full h-3 bg-slate-950" />
                        </div>

                        {/* Cute Stinger */}
                        <div 
                            className="-mt-0.5 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[8px] border-t-slate-950"
                        />

                        {/* Little Fuzzy Legs with Yellow Pollen Balls */}
                        <div className="absolute -bottom-2 -left-2 flex items-center gap-1">
                            <div className="w-1.5 h-3 bg-slate-900 rounded-full rotate-45" />
                            <div className="w-3.5 h-3.5 rounded-full bg-yellow-400 border border-amber-500 shadow-sm" title="Pollen Basket" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 flex items-center gap-1">
                            <div className="w-3.5 h-3.5 rounded-full bg-yellow-400 border border-amber-500 shadow-sm" title="Pollen Basket" />
                            <div className="w-1.5 h-3 bg-slate-900 rounded-full -rotate-45" />
                        </div>

                    </div>
                </div>
            </div>

            <style>{`
                @keyframes wingFlutterLeft {
                    0% { transform: rotate(-35deg) skewX(-12deg); opacity: 0.95; }
                    100% { transform: rotate(40deg) skewX(18deg); opacity: 0.65; }
                }
                @keyframes wingFlutterRight {
                    0% { transform: rotate(35deg) skewX(12deg); opacity: 0.95; }
                    100% { transform: rotate(-40deg) skewX(-18deg); opacity: 0.65; }
                }
            `}</style>
        </div>
    );
}
