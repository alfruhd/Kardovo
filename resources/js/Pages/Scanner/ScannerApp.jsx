import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import jsQR from 'jsqr';
import EmptyEventState from '@/Components/EmptyEventState';
import { 
    QrCode, 
    CheckCircle2, 
    XCircle, 
    Keyboard, 
    Camera, 
    Volume2, 
    VolumeX, 
    ShieldCheck, 
    RotateCcw, 
    LogOut, 
    Sparkles, 
    ArrowRight, 
    ArrowLeft, 
    LayoutDashboard, 
    Shield, 
    Play,
    History,
    FileText,
    Check,
    X,
    Users,
    ChevronDown,
    Zap,
    Ticket,
    Clock,
    RefreshCw,
    SlidersHorizontal,
    Sun,
    Moon,
    User,
    AlertTriangle
} from 'lucide-react';
import KardovoLogo from '@/Components/KardovoLogo';
import Modal from '@/Components/Modal';
import { useTheme } from '@/Hooks/useTheme';

export default function ScannerApp({ 
    events = [], 
    activeEvent = null, 
    gateLabel = 'Gate 1 — Main VIP Entrance', 
    scannerName = 'Gate Staff',
    stats: initialStats = {},
    myScanHistory: initialHistory = [],
    sampleGuests = []
}) {
    const { theme, toggleTheme } = useTheme();
    const pageProps = usePage()?.props || {};
    const auth = pageProps.auth || {};
    const user = auth?.user;
    const userRole = user?.role || 'scanner';
    const isAdmin = userRole === 'admin' || user?.is_admin;
    const isSubAdmin = userRole === 'sub_admin' || user?.is_sub_admin;
    const isCustomer = userRole === 'customer' || user?.is_customer;
    const isScannerOnly = userRole === 'scanner' && !isAdmin && !isSubAdmin && !isCustomer;

    // Direct Portal URL for returning to user's administrative environment
    const portalUrl = isAdmin 
        ? route('admin.dashboard') 
        : isSubAdmin 
        ? route('admin.dashboard') 
        : isCustomer 
        ? route('dashboard') 
        : route('profile.edit');

    const portalName = (isAdmin || isSubAdmin) 
        ? 'Admin Portal' 
        : isCustomer 
        ? 'Organizer Events' 
        : 'My Profile';

    const [selectedEventId, setSelectedEventId] = useState(activeEvent?.id || events[0]?.id || '');
    const [scanResult, setScanResult] = useState(null); // { status: 'granted' | 'rejected', guest, reason, scanned_at }
    const [manualCode, setManualCode] = useState('');
    const [showManualModal, setShowManualModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showSimulator, setShowSimulator] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [isVerifying, setIsVerifying] = useState(false);
    const [cameraActive, setCameraActive] = useState(false);
    const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false);
    const [stats, setStats] = useState(initialStats || {});
    const [scanHistory, setScanHistory] = useState(initialHistory || []);

    useEffect(() => {
        setStats(initialStats || {});
    }, [initialStats]);

    useEffect(() => {
        setScanHistory(initialHistory || []);
    }, [initialHistory]);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const animFrameRef = useRef(null);
    const resultTimeoutRef = useRef(null);
    const lastScannedTimeRef = useRef(0);

    // Web Audio Chimes
    const playChime = (isSuccess) => {
        if (!soundEnabled) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            if (isSuccess) {
                // Harmonic double success chime
                osc.type = 'sine';
                osc.frequency.setValueAtTime(587.33, ctx.currentTime);
                osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08);
                gain.gain.setValueAtTime(0.3, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
                osc.start();
                osc.stop(ctx.currentTime + 0.35);
            } else {
                // Low buzz error
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(150, ctx.currentTime);
                gain.gain.setValueAtTime(0.4, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
                osc.start();
                osc.stop(ctx.currentTime + 0.45);
            }
        } catch (e) {
            console.error('Audio chime error:', e);
        }
    };

    const handleScannedCode = useCallback(async (code, autoSwitch = false) => {
        const now = Date.now();
        if (!autoSwitch && (now - lastScannedTimeRef.current < 2500 || isVerifying || !selectedEventId)) {
            return;
        }
        lastScannedTimeRef.current = now;
        setIsVerifying(true);

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const response = await fetch('/scanner/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    event_id: selectedEventId,
                    qr_code: code,
                    gate_label: gateLabel,
                    auto_switch: autoSwitch,
                }),
            });

            const data = await response.json();

            if (response.ok && data.status === 'granted') {
                playChime(true);
                if (data.event_id && data.event_id !== selectedEventId) {
                    setSelectedEventId(data.event_id);
                }
                setScanResult({
                    status: 'granted',
                    guest: data.guest,
                    scanned_at: data.scanned_at,
                    gate_label: data.gate_label,
                    event_title: data.event_title || activeEvent?.title,
                });
                setStats(prev => ({
                    ...prev,
                    checked_in_count: (prev?.checked_in_count || 0) + 1,
                    total_granted_scans: (prev?.total_granted_scans || 0) + 1,
                }));
                setScanHistory(prev => [
                    {
                        id: Date.now(),
                        status: 'granted',
                        guest_name: data.guest?.name,
                        card_number: data.guest?.card_number,
                        event_title: data.event_title || activeEvent?.title || 'Active Event',
                        gate_label: gateLabel,
                        scanned_at: data.scanned_at || 'Just now',
                    },
                    ...prev
                ]);
            } else if (data.status === 'wrong_event') {
                playChime(false);
                setScanResult({
                    status: 'wrong_event',
                    reason: data.reason,
                    code: data.code || code,
                    other_event_id: data.other_event_id,
                    other_event_title: data.other_event_title,
                    guest: data.guest,
                });
                setStats(prev => ({
                    ...prev,
                    total_rejected_scans: (prev?.total_rejected_scans || 0) + 1,
                }));
                setScanHistory(prev => [
                    {
                        id: Date.now(),
                        status: 'rejected',
                        guest_name: data.guest?.name || 'Wrong Event Pass',
                        card_number: data.guest?.card_number || 'N/A',
                        event_title: data.other_event_title || 'Other Event',
                        gate_label: gateLabel,
                        scanned_at: 'Just now',
                        rejection_reason: data.reason,
                    },
                    ...prev
                ]);
            } else {
                playChime(false);
                setScanResult({
                    status: 'rejected',
                    reason: data.reason || 'Invalid or unrecognised pass',
                    guest: data.guest,
                });
                setStats(prev => ({
                    ...prev,
                    total_rejected_scans: (prev?.total_rejected_scans || 0) + 1,
                }));
                setScanHistory(prev => [
                    {
                        id: Date.now(),
                        status: 'rejected',
                        guest_name: data.guest?.name || 'Invalid Ticket',
                        card_number: data.guest?.card_number || 'N/A',
                        event_title: activeEvent?.title || 'Active Event',
                        gate_label: gateLabel,
                        scanned_at: 'Just now',
                        rejection_reason: data.reason,
                    },
                    ...prev
                ]);
            }

            if (resultTimeoutRef.current) clearTimeout(resultTimeoutRef.current);
            if (data.status !== 'wrong_event') {
                resultTimeoutRef.current = setTimeout(() => {
                    setScanResult(null);
                    setIsVerifying(false);
                }, 4000);
            } else {
                setIsVerifying(false);
            }

        } catch (err) {
            console.error('Validation error:', err);
            playChime(false);
            setScanResult({
                status: 'rejected',
                reason: 'Network or validation error occurred.',
            });
            setIsVerifying(false);
        }
    }, [selectedEventId, isVerifying, gateLabel, soundEnabled, activeEvent]);

    // Live webcam stream frame analyzer
    useEffect(() => {
        let isMounted = true;

        const scanFrame = () => {
            if (!isMounted) return;

            const video = videoRef.current;
            const canvas = canvasRef.current;

            if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
                const ctx = canvas.getContext('2d', { willReadFrequently: true });
                if (ctx) {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const code = jsQR(imageData.data, imageData.width, imageData.height, {
                        inversionAttempts: 'dontInvert',
                    });

                    if (code && code.data && code.data.trim()) {
                        handleScannedCode(code.data.trim());
                    }
                }
            }

            animFrameRef.current = requestAnimationFrame(scanFrame);
        };

        const startCamera = async () => {
            try {
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(t => t.stop());
                }

                const constraints = {
                    video: {
                        facingMode: { ideal: 'environment' },
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                    },
                };

                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                if (!isMounted) {
                    stream.getTracks().forEach(t => t.stop());
                    return;
                }

                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.setAttribute('playsinline', 'true');
                    await videoRef.current.play();
                    setCameraActive(true);
                    setCameraPermissionDenied(false);
                    animFrameRef.current = requestAnimationFrame(scanFrame);
                }
            } catch (err) {
                console.warn('Webcam stream unavailable:', err);
                if (isMounted) {
                    setCameraActive(false);
                    setCameraPermissionDenied(true);
                }
            }
        };

        startCamera();

        return () => {
            isMounted = false;
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
            if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
            if (resultTimeoutRef.current) clearTimeout(resultTimeoutRef.current);
        };
    }, [selectedEventId, handleScannedCode]);

    const handleManualSubmit = (e) => {
        if (e) e.preventDefault();
        if (!manualCode.trim()) return;
        handleScannedCode(manualCode.trim());
        setManualCode('');
        setShowManualModal(false);
    };

    const handleScanNextGuest = () => {
        if (resultTimeoutRef.current) clearTimeout(resultTimeoutRef.current);
        setScanResult(null);
        setIsVerifying(false);
    };

    const handleLogout = () => {
        if (typeof window !== "undefined") {
            localStorage.setItem("kardovo_dev_email", "alfred@kardovo.com");
            localStorage.setItem("kardovo_dev_password", "password");
        }
        router.post("/logout");
    };

    const totalGuests = stats?.total_guests || 0;
    const checkedIn = stats?.checked_in_count || 0;
    const attendancePercent = totalGuests > 0 ? Math.min(100, Math.round((checkedIn / totalGuests) * 100)) : 0;

    return (
        <div className="min-h-screen bg-[#F4F6F9] dark:bg-[#070D18] text-slate-900 dark:text-white flex flex-col justify-between font-sans select-none max-w-lg mx-auto relative overflow-hidden shadow-2xl border-x border-slate-200 dark:border-white/[0.08] transition-colors duration-300">
            <Head title="Kardovo Gate Scanner — Real-Time Access Control" />

            {/* Hidden canvas for jsQR analysis */}
            <canvas ref={canvasRef} className="hidden" />

            {/* ════════════ 1. TOP HEADER / APP BAR ════════════ */}
            <header className="p-3.5 sm:p-4 bg-white/90 dark:bg-[#091322]/95 backdrop-blur-2xl border-b border-slate-200/90 dark:border-white/[0.08] z-20 space-y-3 shadow-xs">
                {/* Row 1: App Navigation & Utility Controls */}
                <div className="flex items-center justify-between gap-2">
                    {/* Left: Back to Portal or Kardovo Brand */}
                    <div className="flex items-center gap-2">
                        {!isScannerOnly ? (
                            <Link
                                href={portalUrl}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.12] border border-slate-200/80 dark:border-white/[0.08] shadow-2xs transition active:scale-95 group cursor-pointer"
                                title={`Return to ${portalName}`}
                            >
                                <ArrowLeft className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:-translate-x-0.5 transition-transform stroke-[2.5]" />
                                <span>{(isAdmin || isSubAdmin) ? 'Admin Portal' : 'My Events'}</span>
                            </Link>
                        ) : (
                            <div className="flex items-center gap-2">
                                <img 
                                    src="/images/kardovo_logo.png" 
                                    alt="Kardovo" 
                                    className="w-7 h-7 object-contain flex-shrink-0" 
                                />
                                <span className="font-black text-sm tracking-wider text-slate-900 dark:text-white font-display">
                                    KARDOVO
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Center: Live Gate Indicator Badge */}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-[9.5px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 backdrop-blur-md shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                        <span>LIVE GATE</span>
                    </div>

                    {/* Right: Consolidated Action Icon Toolbar */}
                    <div className="flex items-center gap-1">
                        {/* Audio Chime Toggle */}
                        <button
                            type="button"
                            onClick={() => setSoundEnabled(!soundEnabled)}
                            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] transition cursor-pointer"
                            title={soundEnabled ? "Mute audio chimes" : "Enable audio chimes"}
                        >
                            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                        </button>

                        {/* Scan History Audit Log */}
                        <button
                            type="button"
                            onClick={() => setShowHistoryModal(true)}
                            className="p-2 rounded-xl text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-white/[0.08] transition cursor-pointer"
                            title="Gate Scan Audit Log"
                        >
                            <History className="w-4 h-4" />
                        </button>

                        {/* Light / Dark Mode Toggle */}
                        <button
                            type="button"
                            onClick={toggleTheme}
                            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] transition cursor-pointer"
                            title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        >
                            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-emerald-600" />}
                        </button>

                        {/* Profile Link (for Portal users) or Logout (for Gate Staff) */}
                        {!isScannerOnly ? (
                            <Link
                                href={route('profile.edit')}
                                className="p-2 rounded-xl text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition flex items-center justify-center cursor-pointer ml-0.5"
                                title="My Profile & Security Settings"
                            >
                                <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            </Link>
                        ) : (
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="p-2 rounded-xl text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer ml-0.5"
                                title="Sign Out of Gate"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Row 2: Active Event Title & Arrow Dropdown */}
                <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-white/[0.05]">
                    <div className="min-w-0 flex-1">
                        <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white font-display leading-snug break-words">
                            {events.find(e => String(e.id) === String(selectedEventId))?.title || activeEvent?.title || events[0]?.title || 'No Active Event'}
                        </h2>
                    </div>

                    {events.length > 1 && (
                        <div className="relative flex-shrink-0" title="Switch Event">
                            <div className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.12] border border-slate-200/80 dark:border-white/[0.08] text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white flex items-center justify-center transition cursor-pointer shadow-2xs">
                                <ChevronDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <select
                                value={selectedEventId}
                                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                                onChange={(e) => {
                                    const newEventId = e.target.value;
                                    setSelectedEventId(newEventId);
                                    router.get(route('scanner.index'), { event_id: newEventId }, { 
                                        preserveState: true, 
                                        preserveScroll: true 
                                    });
                                }}
                            >
                                {events.map((evt) => (
                                    <option key={evt.id} value={evt.id} className="bg-white dark:bg-[#0B1524] text-slate-900 dark:text-white font-medium">
                                        {evt.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </header>

            {/* ════════════ 2. VIEWFINDER SCANNING ZONE ════════════ */}
            {events.length === 0 ? (
                <main className="flex-1 flex items-center justify-center p-6">
                    <EmptyEventState
                        title="No Event Selected"
                        description="Please select an event from the dashboard or create a new one to manage messaging and broadcast passes."
                        buttonText="Go to Dashboard"
                        buttonHref={route('dashboard')}
                    />
                </main>
            ) : (
                <>
                    <main className="flex-1 relative flex flex-col items-center justify-center p-5 min-h-[380px]">
                
                {/* Framed Camera Viewport */}
                <div className="w-full max-w-[340px] aspect-square rounded-3xl overflow-hidden shadow-2xl bg-black relative border-2 border-slate-800 flex items-center justify-center group">
                    
                    {/* Live Video Feed */}
                    <video 
                        ref={videoRef} 
                        className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
                        playsInline
                        muted
                        autoPlay
                    />

                    {/* Tech Viewfinder Bracket Corners */}
                    <div className="absolute inset-5 pointer-events-none z-10 flex flex-col justify-between">
                        <div className="flex justify-between">
                            <div className="w-9 h-9 border-t-[3.5px] border-l-[3.5px] border-emerald-500 rounded-tl-xl shadow-[0_0_12px_rgba(16,185,129,0.7)]" />
                            <div className="w-9 h-9 border-t-[3.5px] border-r-[3.5px] border-emerald-500 rounded-tr-xl shadow-[0_0_12px_rgba(16,185,129,0.7)]" />
                        </div>
                        <div className="flex justify-between">
                            <div className="w-9 h-9 border-b-[3.5px] border-l-[3.5px] border-emerald-500 rounded-bl-xl shadow-[0_0_12px_rgba(16,185,129,0.7)]" />
                            <div className="w-9 h-9 border-b-[3.5px] border-r-[3.5px] border-emerald-500 rounded-br-xl shadow-[0_0_12px_rgba(16,185,129,0.7)]" />
                        </div>
                    </div>

                    {/* Animated Scanning Laser Line */}
                    {!scanResult && cameraActive && (
                        <div className="absolute left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_16px_rgba(16,185,129,1)] animate-pulse pointer-events-none z-10 top-1/2 -translate-y-1/2" />
                    )}

                    {/* Fallback Placeholder when Camera is inactive */}
                    {!cameraActive && (
                        <div className="p-6 text-center z-0 flex flex-col items-center space-y-3">
                            <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 shadow-inner">
                                <Camera className="w-7 h-7 text-emerald-400" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-200">
                                    {cameraPermissionDenied ? 'Camera Access Required' : 'Initializing Camera...'}
                                </h4>
                                <p className="text-xs text-slate-400 mt-1 max-w-[220px]">
                                    {cameraPermissionDenied 
                                        ? 'Please allow camera permission in your browser or enter the pass code manually.' 
                                        : 'Point camera directly at the guest QR pass to verify access.'}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowManualModal(true)}
                                className="px-4 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer"
                            >
                                <Keyboard className="w-3.5 h-3.5" />
                                <span>Manual Code Entry</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Subtitle helper */}
                <p className="text-[11px] text-slate-400 font-medium text-center mt-3">
                    Align guest QR code inside the viewfinder for instant 0.2s verification
                </p>

                {/* ════════════ 3. REAL-TIME RESULT OVERLAY MODAL ════════════ */}
                {scanResult && (
                    <div className={`absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center backdrop-blur-lg transition-all duration-300 ${
                        scanResult.status === 'granted' 
                            ? 'bg-[#041E15]/95 border-emerald-500' 
                            : scanResult.status === 'wrong_event'
                            ? 'bg-[#261A05]/95 border-amber-500'
                            : 'bg-[#24080D]/95 border-rose-500'
                    }`}>
                        {scanResult.status === 'granted' ? (
                            <div className="space-y-4 w-full max-w-sm">
                                {/* Success Animated Icon */}
                                <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border-2 border-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.5)] animate-pulse">
                                    <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
                                </div>

                                <div>
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/70 border border-emerald-400/40 text-[11px] font-black uppercase tracking-widest text-emerald-300">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        ACCESS GRANTED
                                    </div>
                                    <h2 className="text-2xl font-black text-white mt-2 font-display">
                                        {scanResult.guest?.name}
                                    </h2>
                                    <div className="inline-block px-3 py-0.5 rounded-full bg-emerald-950 border border-emerald-600/50 text-xs font-extrabold text-emerald-200 mt-1.5">
                                        {scanResult.guest?.allowance_label || 'SINGLE ENTRY PASS'}
                                    </div>
                                </div>

                                <div className="p-3.5 bg-black/45 rounded-2xl border border-white/10 text-xs space-y-1.5 text-slate-300">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Pass Code:</span>
                                        <span className="font-mono font-bold text-white">{scanResult.guest?.unique_code || scanResult.guest?.card_number}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Scan Timestamp:</span>
                                        <span className="text-white font-medium">{scanResult.scanned_at || 'Just now'}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-1 border-t border-white/10">
                                        <span className="text-slate-400">Gate Check-in:</span>
                                        <span className="text-emerald-400 font-extrabold">
                                             Admitted ({scanResult.guest?.entries_used}/{scanResult.guest?.max_entries || 1})
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleScanNextGuest}
                                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-lg transition active:scale-95 text-xs flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <span>Admit &amp; Scan Next Guest</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        ) : scanResult.status === 'wrong_event' ? (
                            <div className="space-y-4 w-full max-w-sm">
                                {/* Amber Warning Icon */}
                                <div className="w-20 h-20 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border-2 border-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.5)]">
                                    <AlertTriangle className="w-12 h-12 stroke-[2.5]" />
                                </div>

                                <div>
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-900/70 border border-amber-400/40 text-[11px] font-black uppercase tracking-widest text-amber-300">
                                        <AlertTriangle className="w-3.5 h-3.5" />
                                        DIFFERENT EVENT PASS DETECTED
                                    </div>
                                    <h2 className="text-xl font-black text-white mt-2 font-display">
                                        {scanResult.guest?.name || 'Valid Attendee'}
                                    </h2>
                                    <div className="text-xs text-amber-200 mt-1">
                                        Pass belongs to: <strong className="text-white block mt-0.5">{scanResult.other_event_title}</strong>
                                    </div>
                                </div>

                                <div className="p-3.5 bg-black/45 rounded-2xl border border-white/10 text-xs space-y-1 text-slate-300">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Card Number:</span>
                                        <span className="font-mono font-bold text-white">{scanResult.guest?.card_number}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Pass Code:</span>
                                        <span className="font-mono font-bold text-white">{scanResult.guest?.unique_code}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Allowance:</span>
                                        <span className="text-amber-300 font-bold">{scanResult.guest?.allowance_label}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (scanResult.other_event_id) {
                                                setSelectedEventId(scanResult.other_event_id);
                                            }
                                            handleScannedCode(scanResult.code, true);
                                        }}
                                        className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl shadow-lg transition active:scale-95 text-xs flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        <span>Switch Event &amp; Admit Guest</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleScanNextGuest}
                                        className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl transition active:scale-95 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                        <span>Dismiss</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 w-full max-w-sm">
                                {/* Rejected Animated Icon */}
                                <div className="w-20 h-20 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border-2 border-rose-400 shadow-[0_0_35px_rgba(244,63,94,0.5)]">
                                    <XCircle className="w-12 h-12 stroke-[2.5]" />
                                </div>

                                <div>
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-900/70 border border-rose-400/40 text-[11px] font-black uppercase tracking-widest text-rose-300">
                                        <X className="w-3.5 h-3.5" />
                                        ACCESS REJECTED
                                    </div>
                                    <h2 className="text-xl font-black text-white mt-2 font-display">
                                        {scanResult.reason || 'Invalid or Exceeded Pass'}
                                    </h2>
                                    {scanResult.guest && (
                                        <p className="text-xs text-rose-200 mt-1 font-medium">
                                            Assigned Guest: <strong>{scanResult.guest.name}</strong>
                                        </p>
                                    )}
                                </div>

                                <div className="p-3.5 bg-black/45 rounded-2xl border border-white/10 text-xs text-slate-300">
                                    <p className="text-[11px] text-slate-400 leading-relaxed">
                                        Pass already scanned or quota exceeded.
                                    </p>
                                </div>

                                <button
                                    onClick={handleScanNextGuest}
                                    className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-2xl shadow-lg transition active:scale-95 text-xs flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    <span>Dismiss &amp; Scan Next</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* ════════════ 4. BOTTOM ACTION CONTROL BAR ════════════ */}
            <footer className="p-4 bg-white/85 dark:bg-[#091322]/95 backdrop-blur-2xl border-t border-slate-200/90 dark:border-white/[0.08] space-y-3 z-20 shadow-[0_-4px_25px_rgba(0,0,0,0.03)]">
                
                {/* Floating Real-Time Stats Bar */}
                <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2.5 rounded-2xl bg-white dark:bg-[#0B1524] border border-slate-200/90 dark:border-white/[0.08] shadow-xs">
                        <span className="text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400 block tracking-wider">Total Guests</span>
                        <span className="text-base font-black text-slate-900 dark:text-white font-mono">{totalGuests}</span>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 shadow-xs">
                        <span className="text-[9px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block tracking-wider">Checked In</span>
                        <span className="text-base font-black text-emerald-700 dark:text-emerald-400 font-mono">{checkedIn} ({attendancePercent}%)</span>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-rose-50/90 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 shadow-xs">
                        <span className="text-[9px] uppercase font-bold text-rose-700 dark:text-rose-400 block tracking-wider">Rejected</span>
                        <span className="text-base font-black text-rose-700 dark:text-rose-400 font-mono">{stats?.total_rejected_scans || 0}</span>
                    </div>
                </div>

                {/* Primary Actions Row */}
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setShowManualModal(true)}
                        className="flex-1 py-3 px-4 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition active:scale-95 cursor-pointer"
                    >
                        <Keyboard className="w-4 h-4 text-white stroke-[2.5]" />
                        <span>Manual Pass Code Entry</span>
                    </button>

                    {sampleGuests.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setShowSimulator(!showSimulator)}
                            className={`p-3 rounded-2xl text-xs font-bold transition flex items-center justify-center cursor-pointer active:scale-95 shadow-xs ${
                                showSimulator 
                                    ? 'bg-emerald-100 dark:bg-emerald-500/25 border-2 border-emerald-500 text-emerald-900 dark:text-emerald-200 shadow-sm ring-2 ring-emerald-500/20' 
                                    : 'bg-white hover:bg-slate-50 dark:bg-[#0B1524] dark:hover:bg-white/[0.08] border border-slate-200 hover:border-emerald-500 dark:border-white/[0.08] dark:hover:border-emerald-500 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                            }`}
                            title="Toggle Test Pass Simulator"
                        >
                            <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </button>
                    )}
                </div>

                {/* Collapsible Test Simulation Panel */}
                {showSimulator && sampleGuests.length > 0 && (
                    <div className="p-3 rounded-2xl bg-white dark:bg-[#0B1524] border border-slate-200/90 dark:border-white/[0.08] space-y-2 animate-fadeIn shadow-lg">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                <Zap className="w-3 h-3 text-emerald-500" />
                                <span>Quick Test Pass Simulator</span>
                            </span>
                            <button 
                                onClick={() => setShowSimulator(false)} 
                                className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.08] dark:hover:bg-white/[0.15] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white text-xs flex items-center justify-center cursor-pointer transition"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                            {sampleGuests.map((g) => (
                                <button
                                    key={g.id}
                                    type="button"
                                    onClick={() => handleScannedCode(g.unique_code || g.qr_token)}
                                    className="px-2.5 py-1.5 bg-white hover:bg-slate-50 dark:bg-[#0B1524] dark:hover:bg-white/[0.08] text-[10.5px] text-slate-800 hover:text-slate-950 dark:text-slate-200 font-bold rounded-xl border border-slate-200 hover:border-emerald-500 dark:border-white/[0.08] dark:hover:border-emerald-400 flex items-center gap-1.5 transition active:scale-95 shadow-xs ring-0 hover:ring-2 hover:ring-emerald-500/20 cursor-pointer"
                                >
                                    <Play className="w-2.5 h-2.5 text-emerald-500 fill-emerald-500" />
                                    <span>{g.name} ({g.unique_code})</span>
                                </button>
                            ))}
                            <button
                                type="button"
                                onClick={() => handleScannedCode('INVALID_PASS_999')}
                                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900 text-[10.5px] text-rose-700 dark:text-rose-300 font-bold rounded-xl border border-rose-200 hover:border-rose-400 dark:border-rose-800/60 flex items-center gap-1.5 transition active:scale-95 shadow-xs ring-0 hover:ring-2 hover:ring-rose-500/20 cursor-pointer"
                            >
                                <Play className="w-2.5 h-2.5 text-rose-500 fill-rose-500" />
                                <span>Fake / Invalid Code</span>
                            </button>
                        </div>
                    </div>
                )}
            </footer>
                </>
            )}

            {/* ════════════ 5. MODAL: MANUAL CODE ENTRY ════════════ */}
            <Modal show={showManualModal} onClose={() => setShowManualModal(false)} maxWidth="sm">
                <form onSubmit={handleManualSubmit} className="p-6 bg-white dark:bg-[#0B1524] text-slate-900 dark:text-white rounded-3xl border border-slate-200/90 dark:border-white/[0.08] shadow-2xl">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.08]">
                        <div className="flex items-center gap-2">
                            <Keyboard className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            <h3 className="text-base font-black text-slate-900 dark:text-white font-display">
                                Manual Pass Verification
                            </h3>
                        </div>
                        <button 
                            type="button" 
                            onClick={() => setShowManualModal(false)}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.08] dark:hover:bg-white/[0.15] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white flex items-center justify-center text-xs font-bold cursor-pointer transition"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="mt-4 space-y-3">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Enter the <strong className="text-slate-800 dark:text-slate-200">Card Number</strong>, <strong className="text-slate-800 dark:text-slate-200">8-digit pass code</strong>, or attendee phone number.
                        </p>

                        <input
                            type="text"
                            placeholder="e.g. KDV-2026-004821 or 29841872..."
                            className="w-full bg-slate-50 hover:bg-white focus:bg-white dark:bg-[#07111D] border border-slate-300 hover:border-slate-400 dark:border-white/[0.15] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 rounded-2xl px-4 py-3 text-base text-slate-900 dark:text-white placeholder-slate-400 font-mono tracking-widest text-center shadow-xs transition uppercase"
                            value={manualCode}
                            onChange={(e) => setManualCode(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="mt-6 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setShowManualModal(false)}
                            className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 dark:text-slate-300 bg-white hover:bg-slate-50 dark:bg-white/[0.06] dark:hover:bg-white/[0.12] border border-slate-200 hover:border-slate-300 dark:border-white/[0.08] rounded-xl transition shadow-xs cursor-pointer active:scale-95"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!manualCode.trim()}
                            className="px-5 py-2 text-xs font-black text-white bg-[#16A34A] hover:bg-[#15803D] disabled:opacity-40 rounded-xl transition shadow-sm active:scale-95 cursor-pointer"
                        >
                            Verify Pass
                        </button>
                    </div>
                </form>
            </Modal>

            {/* ════════════ 6. MODAL: SCAN HISTORY AUDIT LOG ════════════ */}
            {showHistoryModal && (
                <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#0D1522] rounded-3xl max-w-md w-full border border-slate-200/90 dark:border-white/[0.08] p-5 shadow-2xl flex flex-col max-h-[85vh] space-y-4 text-slate-900 dark:text-white">
                        <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.08] pb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                    <History className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 dark:text-white font-display">
                                        Gate Staff Audit Stream
                                    </h3>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                        {scannerName} • {gateLabel}
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowHistoryModal(false)}
                                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.08] dark:hover:bg-white/[0.15] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white flex items-center justify-center text-xs font-bold cursor-pointer transition"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Stream List */}
                        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                            {scanHistory.length === 0 ? (
                                <div className="text-center py-12 text-slate-400 text-xs">
                                    No scans logged yet during this gate session.
                                </div>
                            ) : (
                                scanHistory.map((item, idx) => (
                                    <div 
                                        key={item.id || idx}
                                        className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition ${
                                            item.status === 'granted'
                                                ? 'bg-emerald-50/80 hover:bg-emerald-100/80 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-100'
                                                : 'bg-rose-50/80 hover:bg-rose-100/80 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 border-rose-200 dark:border-rose-800/40 text-rose-900 dark:text-rose-100'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5 truncate">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                item.status === 'granted' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                                            }`}>
                                                {item.status === 'granted' ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <X className="w-3.5 h-3.5 stroke-[3]" />}
                                            </div>
                                            <div className="truncate">
                                                <div className="font-bold text-slate-900 dark:text-white truncate text-[11.5px]">
                                                    {item.guest_name}
                                                </div>
                                                <div className="text-[9.5px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                                    {item.event_title} • <span className="font-mono text-slate-700 dark:text-slate-300">{item.card_number}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right flex-shrink-0 ml-2">
                                            <span className="text-[9px] text-slate-500 dark:text-slate-400 font-mono block">
                                                {item.scanned_at}
                                            </span>
                                            <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full mt-1 inline-block ${
                                                item.status === 'granted' ? 'bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700/60' : 'bg-rose-100 dark:bg-rose-900/80 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-700/60'
                                            }`}>
                                                {item.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="pt-3 border-t border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                            <span>Total Logged: <strong className="text-slate-900 dark:text-white font-mono">{scanHistory.length}</strong></span>
                            <button
                                onClick={() => setShowHistoryModal(false)}
                                className="px-4 py-2 bg-white hover:bg-slate-50 dark:bg-white/[0.06] dark:hover:bg-white/[0.12] text-slate-700 hover:text-slate-950 dark:text-white font-bold rounded-xl text-xs border border-slate-200 hover:border-slate-300 dark:border-white/[0.08] transition shadow-xs ring-0 hover:ring-2 hover:ring-slate-300/30 cursor-pointer active:scale-95"
                            >
                                Close Audit Log
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
