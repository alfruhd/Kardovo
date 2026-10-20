'use client';

import React from 'react';
import { BackgroundMedia } from '@/lib/schema';

export function SectionBackground({ background }: { background?: BackgroundMedia }) {
  if (!background || background.type === 'none') {
    return null;
  }

  const { type, url, posterUrl, color, gradient, overlayColor, opacity, blurPx } = background;

  return (
    <div
      className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0"
      style={{ opacity }}
      aria-hidden="true"
    >
      {/* 1. Solid Color */}
      {type === 'color' && color && (
        <div className="absolute inset-0 w-full h-full" style={{ backgroundColor: color }} />
      )}

      {/* 2. Gradient */}
      {type === 'gradient' && gradient && (
        <div className="absolute inset-0 w-full h-full" style={{ backgroundImage: gradient }} />
      )}

      {/* 3. Image Background */}
      {type === 'image' && url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          loading="lazy"
          style={{
            filter: blurPx > 0 ? `blur(${blurPx}px)` : undefined,
          }}
          className="w-full h-full object-cover object-center"
        />
      )}

      {/* 4. Looping Video Background */}
      {type === 'video' && url && (
        <video
          src={url}
          poster={posterUrl}
          autoPlay
          loop
          muted
          playsInline
          style={{
            filter: blurPx > 0 ? `blur(${blurPx}px)` : undefined,
          }}
          className="w-full h-full object-cover object-center"
        />
      )}

      {/* Overlay Color Filter */}
      {overlayColor && overlayColor !== 'transparent' && (
        <div className="absolute inset-0 w-full h-full" style={{ backgroundColor: overlayColor }} />
      )}
    </div>
  );
}
