import React from "react";

export default function KardovoLogo({ 
    className = "", 
    imgClassName = "h-8 w-8", 
    light = false, 
    showText = true,
    size = "normal",
    stacked = false
}) {
    const isLg = size === "lg" || size === "xl";
    return (
        <div className={`inline-flex ${stacked ? "flex-col items-center text-center gap-2" : "items-center gap-2.5 sm:gap-3"} select-none ${className}`}>
            <img
                src="/images/kardovo_logo.png"
                alt="Kardovo"
                className={`${imgClassName} object-contain flex-shrink-0 drop-shadow-xs transition-transform duration-200 group-hover:scale-105`}
            />
            {showText && (
                <div className={`flex flex-col justify-center min-w-0 ${stacked ? "items-center text-center" : ""}`}>
                    <span className={`font-black tracking-[0.14em] font-display leading-tight uppercase ${
                        isLg ? "text-[18.5px] sm:text-[20px]" : "text-[17px]"
                    } ${
                        light ? "text-white" : "text-slate-900 dark:text-white"
                    }`}>
                        KARDOVO
                    </span>
                    <span className={`tracking-[0.24em] uppercase font-extrabold mt-0.5 leading-none font-mono ${
                        isLg ? "text-[8.5px] sm:text-[9px]" : "text-[7.5px]"
                    } ${
                        light ? "text-cyan-400" : "text-cyan-600 dark:text-cyan-400"
                    }`}>
                        ACCESS &amp; INVITATION
                    </span>
                </div>
            )}
        </div>
    );
}
