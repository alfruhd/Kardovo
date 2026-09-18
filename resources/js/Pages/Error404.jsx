import React from "react";
import { Head, Link } from "@inertiajs/react";

export default function Error404() {
    return (
        <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden bg-[#e0f2fe]">
            <Head title="404 — Page Not Found | Kardovo" />
            
            {/* Background Image containing the Fox and 404 */}
            <img 
                src="/images/404-bg.png" 
                alt="404 Not Found" 
                className="absolute inset-0 w-full h-full object-cover object-center"
            />

            {/* Bottom Content Container (Text + Button) */}
            <div className="absolute bottom-8 sm:bottom-12 w-full px-6 flex flex-col items-center text-center z-10">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-500 drop-shadow-sm mb-2">
                    Oops, I think we’re lost
                </h1>
                <p className="text-sm sm:text-base md:text-lg text-slate-600 font-medium mb-8">
                    Let’s get you back somewhere familiar...
                </p>
                
                <Link 
                    href="/" 
                    className="inline-flex items-center justify-center px-10 py-4 rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-lg sm:text-xl tracking-wide shadow-[0_10px_40px_rgba(15,23,42,0.4)] hover:-translate-y-1 hover:shadow-[0_15px_50px_rgba(15,23,42,0.5)] transition-all duration-300 active:scale-95 border-2 border-white/10"
                >
                    Back to Home
                </Link>
            </div>
        </div>
    );
}
