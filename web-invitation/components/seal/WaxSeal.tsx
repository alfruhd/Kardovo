'use client';

import React, { useId, useState, useMemo } from 'react';
import { SealConfigInput, SealConfigSchema } from '@/lib/schema';
import { deriveSealPalette } from '@/lib/theme/seal-palette';
import { getSealShapePath } from '@/lib/theme/seal-paths';

export interface WaxSealProps {
  config: Partial<SealConfigInput>;
  id?: string;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function WaxSeal({ config: rawConfig, id: customId, className = '', onClick, style }: WaxSealProps) {
  // Validate with defaults
  const config = useMemo(() => {
    return SealConfigSchema.parse(rawConfig || {});
  }, [rawConfig]);

  const autoId = useId().replace(/:/g, '');
  const filterId = customId || `seal-filter-${autoId}`;

  const [clicked, setClicked] = useState(false);

  // Derive palette from base color
  const palette = useMemo(() => {
    const derived = deriveSealPalette(config.baseColor);
    return {
      base: config.baseColor,
      highlight: config.highlightColor || derived.highlight,
      shadow: config.shadowColor || derived.shadow,
      rim: config.rimColor || derived.rim,
      deepShadow: derived.deepShadow,
      embossHighlight: derived.embossHighlight,
      embossShadow: derived.embossShadow,
    };
  }, [config.baseColor, config.highlightColor, config.shadowColor, config.rimColor]);

  // SVG parameters
  const roughness = config.edgeRoughness ?? config.roughness ?? 35;
  const gloss = config.gloss ?? 65;
  const emboss = config.emboss ?? config.embossDepth ?? 45;
  const baseFreq = 0.015 + (roughness / 100) * 0.055;
  const dispScale = 2 + (roughness / 100) * 14;

  // Specular gloss parameters
  const specularExponent = 10 + (gloss / 100) * 45;
  const surfaceScale = 1.5 + (emboss / 100) * 4;

  const shapePath = useMemo(() => {
    return getSealShapePath(config.shape, roughness);
  }, [config.shape, roughness]);

  const initials = rawConfig.content?.text || rawConfig.initials || config.content?.text || config.initials || 'Z&R';
  const fontFamily = config.content?.fontFamily || config.fontFamily || 'Cinzel Decorative';
  const fontSize = config.content?.fontSize || config.fontSizePx || 22;
  const textColor =
    config.content?.colorMode === 'custom' && config.content?.color
      ? config.content.color
      : palette.embossHighlight;

  const handleClick = () => {
    if (!config.interactive) return;
    setClicked(true);
    if (onClick) {
      onClick();
    }
  };

  // Click animation styles
  const clickAnimStyle = useMemo(() => {
    if (!clicked) return '';
    switch (config.animation.onClick) {
      case 'crack':
        return 'animate-crack scale-95 opacity-90';
      case 'melt':
        return 'scale-90 blur-[1px] opacity-80 duration-500';
      case 'spin':
        return 'rotate-[360deg] scale-95 duration-500';
      case 'fade':
        return 'opacity-50 scale-95 duration-300';
      default:
        return 'scale-95 duration-150';
    }
  }, [clicked, config.animation.onClick]);

  // Idle animation classes (respects reduced motion automatically via CSS)
  const idleAnimClass = useMemo(() => {
    if (clicked) return '';
    switch (config.animation.idle) {
      case 'pulse':
        return 'animate-seal-pulse';
      case 'glow':
        return 'animate-seal-glow';
      case 'float':
        return 'animate-seal-float';
      default:
        return '';
    }
  }, [clicked, config.animation.idle]);

  return (
    <div
      id={customId}
      data-seal-id={customId}
      className={`inline-flex flex-col items-center justify-center select-none ${className}`}
      style={style}
    >
      <button
        type="button"
        id={customId ? `btn-${customId}` : undefined}
        aria-label={config.label || 'Wax Seal'}
        onClick={handleClick}
        disabled={!config.interactive}
        style={{
          width: `${config.sizePx}px`,
          height: `${config.sizePx}px`,
          transform: `rotate(${config.rotation}deg)`,
        }}
        className={`group relative flex items-center justify-center cursor-pointer transition-transform duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-primary active:scale-95 ${idleAnimClass} ${clickAnimStyle}`}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full overflow-visible drop-shadow-lg"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* 1. Procedural Roughness: Turbulence & Displacement */}
            <filter id={`${filterId}-displacement`} x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency={baseFreq}
                numOctaves={3}
                result="noise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale={dispScale}
                xChannelSelector="R"
                yChannelSelector="G"
                result="displaced"
              />
            </filter>

            {/* 2. Specular Gloss & Surface Lighting */}
            <filter id={`${filterId}-lighting`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="2.5" result="blur" />
              <feSpecularLighting
                in="blur"
                surfaceScale={surfaceScale}
                specularConstant="1.2"
                specularExponent={specularExponent}
                lightingColor="#ffffff"
                result="specOut"
              >
                <fePointLight x="30" y="20" z="50" />
              </feSpecularLighting>
              <feComposite
                in="specOut"
                in2="SourceAlpha"
                operator="in"
                result="specIn"
              />
              <feComposite
                in="SourceGraphic"
                in2="specIn"
                operator="arithmetic"
                k1="0"
                k2="1"
                k3={gloss / 100}
                k4="0"
                result="litWax"
              />
            </filter>

            {/* 3. Embossed Shadow Filter */}
            <filter id={`${filterId}-emboss`}>
              <feDropShadow dx="-0.8" dy="-0.8" stdDeviation="0.4" floodColor={palette.embossHighlight} floodOpacity="0.8" />
              <feDropShadow dx="0.8" dy="0.8" stdDeviation="0.6" floodColor={palette.embossShadow} floodOpacity="0.9" />
            </filter>

            {/* 4. Radial Wax Depth Gradients */}
            <radialGradient id={`${filterId}-wax-grad`} cx="38%" cy="32%" r="65%">
              <stop offset="0%" stopColor={palette.highlight} />
              <stop offset="45%" stopColor={palette.base} />
              <stop offset="85%" stopColor={palette.shadow} />
              <stop offset="100%" stopColor={palette.deepShadow} />
            </radialGradient>

            <linearGradient id={`${filterId}-rim-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={palette.rim} />
              <stop offset="50%" stopColor={palette.base} />
              <stop offset="100%" stopColor={palette.shadow} />
            </linearGradient>

            {/* Optional Ribbon Gradient */}
            {config.ribbon?.enabled && (
              <linearGradient id={`${filterId}-ribbon-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={config.ribbon.color} />
                <stop offset="100%" stopColor={palette.deepShadow} />
              </linearGradient>
            )}
          </defs>

          {/* Optional Silk Ribbon Underlay */}
          {config.ribbon?.enabled && (
            <g id="seal-ribbon" className="opacity-95 drop-shadow-md">
              <path
                d="M 42,50 L 22,94 L 32,90 L 44,98 Z"
                fill={`url(#${filterId}-ribbon-grad)`}
              />
              <path
                d="M 58,50 L 78,94 L 68,90 L 56,98 Z"
                fill={`url(#${filterId}-ribbon-grad)`}
              />
            </g>
          )}

          {/* Base Molten Outer Puddle (Displaced) */}
          <g filter={`url(#${filterId}-displacement)`}>
            <path
              d={shapePath}
              fill={`url(#${filterId}-wax-grad)`}
              filter={`url(#${filterId}-lighting)`}
            />
          </g>

          {/* Raised Beveled Rim Ring */}
          <circle
            cx="50"
            cy="50"
            r="38"
            fill="none"
            stroke={`url(#${filterId}-rim-grad)`}
            strokeWidth="2.2"
            opacity="0.85"
            filter={`url(#${filterId}-emboss)`}
          />

          {/* Optional Inner Concentric Rings */}
          {config.rings > 1 && (
            <circle
              cx="50"
              cy="50"
              r="34"
              fill="none"
              stroke={palette.rim}
              strokeWidth="1"
              strokeDasharray="2 2"
              opacity="0.6"
            />
          )}

          {/* Recessed Center Basin */}
          <circle
            cx="50"
            cy="50"
            r="31"
            fill={palette.shadow}
            opacity="0.25"
          />

          {/* Embossed Monogram / Content */}
          <g filter={`url(#${filterId}-emboss)`}>
            <text
              x={50 + (config.content?.offsetX || 0)}
              y={56 + (config.content?.offsetY || 0)}
              textAnchor="middle"
              fill={textColor}
              style={{
                fontFamily,
                fontSize: `${fontSize}px`,
                fontWeight: config.content?.fontWeight || 'bold',
                letterSpacing: config.content?.letterSpacing || '0.05em',
              }}
              className="select-none pointer-events-none"
            >
              {initials}
            </text>
          </g>
        </svg>
      </button>

      {/* Optional Caption Label */}
      {config.label && (
        <span
          className="mt-2 text-[10px] uppercase font-semibold tracking-widest text-brand-text/75 transition-opacity duration-200 group-hover:opacity-100"
          style={{ letterSpacing: '0.2em' }}
        >
          {config.label}
        </span>
      )}
    </div>
  );
}
