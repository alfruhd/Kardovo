'use client';

import React, { useRef, useMemo } from 'react';
import { Element, Theme, Section, Breakpoint, resolveStyle, ResolvedStyle } from '@/lib/schema';
import { useAnimationEngine } from '@/lib/animation';
import { WaxSeal } from '@/components/seal';

// ============================================================================
// Concrete Element Renderers
// ============================================================================

export function TextElement({ element, style }: { element: Element; style: ResolvedStyle }) {
  if (element.content.type !== 'text') return null;
  const { text, tag } = element.content;
  const Tag = tag === 'quote' ? 'blockquote' : tag;

  return (
    <Tag
      style={{
        fontFamily: style.typography.fontFamily,
        fontSize: style.typography.fontSize,
        fontWeight: style.typography.fontWeight,
        letterSpacing: style.typography.letterSpacing,
        lineHeight: style.typography.lineHeight,
        textAlign: style.typography.textAlign,
        textTransform: style.typography.textTransform,
        color: style.typography.color,
        textShadow: style.typography.textShadow,
        fontStyle: style.typography.italic ? 'italic' : undefined,
      }}
      className="transition-colors duration-200"
    >
      {text}
    </Tag>
  );
}

export function ImageElement({ element, style }: { element: Element; style: ResolvedStyle }) {
  if (element.content.type !== 'image') return null;
  const { url, alt, aspectRatio, objectFit, caption } = element.content;

  return (
    <figure className="w-full flex flex-col items-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={alt}
        style={{
          aspectRatio: aspectRatio !== 'auto' ? aspectRatio : undefined,
          objectFit,
          borderRadius: style.box.borderRadius,
        }}
        className="w-full h-auto max-w-full shadow-sm"
        loading="lazy"
      />
      {caption && (
        <figcaption className="text-xs text-brand-muted mt-2 text-center italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

export function VideoElement({ element }: { element: Element }) {
  if (element.content.type !== 'video') return null;
  const { url, posterUrl, autoplay, loop, muted, controls, playsInline } = element.content;

  return (
    <div className="w-full overflow-hidden rounded-xl">
      <video
        src={url}
        poster={posterUrl}
        autoPlay={autoplay}
        loop={loop}
        muted={muted}
        controls={controls}
        playsInline={playsInline}
        className="w-full h-auto object-cover"
      />
    </div>
  );
}

export function DecorElement({ element }: { element: Element }) {
  if (element.content.type !== 'decor') return null;
  const { svgContent, imageUrl, alt } = element.content;

  if (svgContent) {
    return (
      <div
        className="w-full flex justify-center py-2 text-brand-primary"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    );
  }

  if (imageUrl) {
    return (
      <div className="w-full flex justify-center py-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt={alt} className="max-w-[120px] h-auto object-contain" />
      </div>
    );
  }

  // Fallback procedural floral flourish SVG
  return (
    <div role="img" className="w-full flex justify-center py-2 text-brand-primary" aria-label={alt}>
      <svg width="100" height="24" viewBox="0 0 100 24" fill="none" className="stroke-current">
        <path
          d="M10 12 C 30 2, 40 22, 50 12 C 60 2, 70 22, 90 12"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <circle cx="50" cy="12" r="2.5" fill="currentColor" />
      </svg>
    </div>
  );
}

export function DividerElement({ element, style }: { element: Element; style: ResolvedStyle }) {
  if (element.content.type !== 'divider') return null;
  const { style: dividerStyle, color, thicknessPx, ornamentText } = element.content;

  const lineColor = color || style.typography.color || 'var(--color-border)';

  if (dividerStyle === 'floral-knot' || ornamentText) {
    return (
      <div className="w-full flex items-center justify-center gap-3 py-3">
        <div
          className="flex-1"
          style={{ height: `${thicknessPx}px`, backgroundColor: lineColor }}
        />
        <span
          className="font-script text-base text-brand-primary select-none px-2"
          style={{ color: lineColor }}
        >
          {ornamentText || '&'}
        </span>
        <div
          className="flex-1"
          style={{ height: `${thicknessPx}px`, backgroundColor: lineColor }}
        />
      </div>
    );
  }

  return (
    <div
      className="w-full my-2"
      style={{
        height: `${thicknessPx}px`,
        backgroundColor: lineColor,
        borderStyle: dividerStyle === 'dotted' ? 'dotted' : 'solid',
      }}
    />
  );
}

export function ButtonElement({ element, style }: { element: Element; style: ResolvedStyle }) {
  if (element.content.type !== 'button') return null;
  const { label, variant, action, target } = element.content;

  const handleClick = () => {
    if (action === 'scroll-to' && target) {
      document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' });
    } else if (action === 'external-url' && target) {
      window.open(target, '_blank');
    }
  };

  const variantClass =
    variant === 'secondary'
      ? 'bg-brand-secondary text-white hover:opacity-90'
      : variant === 'outline'
      ? 'border border-brand-border text-brand-text hover:bg-black/5'
      : 'bg-brand-primary text-white shadow-md hover:bg-brand-primary/90';

  return (
    <button
      onClick={handleClick}
      style={{
        padding: style.box.padding || '12px 24px',
        borderRadius: style.box.borderRadius || 'var(--radius-default)',
        fontFamily: style.typography.fontFamily,
        fontSize: style.typography.fontSize,
      }}
      className={`font-semibold tracking-wider uppercase text-xs transition-all active:scale-95 ${variantClass}`}
    >
      {label}
    </button>
  );
}

export function ShapeElement({ element, style }: { element: Element; style: ResolvedStyle }) {
  if (element.content.type !== 'shape') return null;
  const { shapeType, borderColor, backgroundColor } = element.content;

  const shapeRadius =
    shapeType === 'circle'
      ? '9999px'
      : shapeType === 'arch'
      ? '160px 160px 0 0'
      : shapeType === 'pill'
      ? '9999px'
      : '0px';

  return (
    <div
      style={{
        width: style.box.width || '100%',
        height: style.box.height || '120px',
        borderRadius: shapeRadius,
        backgroundColor: backgroundColor || style.box.backgroundColor || 'transparent',
        border: borderColor ? `1.5px solid ${borderColor}` : style.box.border,
      }}
      className="mx-auto overflow-hidden"
    />
  );
}

export function SealElement({
  element,
  onAction,
}: {
  element: Element;
  onAction?: (action: string) => void;
}) {
  if (element.content.type !== 'seal') return null;
  const { seal, action } = element.content;

  const handleClick = () => {
    if (onAction) {
      onAction(action);
    } else {
      window.dispatchEvent(new CustomEvent('kardovo:seal-action', { detail: { action, elementId: element.id } }));
    }
  };

  return <WaxSeal id={element.id} config={seal} onClick={handleClick} />;
}

export function SpacerElement({ element }: { element: Element }) {
  if (element.content.type !== 'spacer') return null;
  const { heightPx } = element.content;

  return <div style={{ height: `${heightPx}px` }} aria-hidden="true" />;
}

// ============================================================================
// Master <ElementRenderer> Component
// ============================================================================

export interface ElementRendererProps {
  element: Element;
  theme: Theme;
  section?: Section | null;
  breakpoint?: Breakpoint;
  className?: string;
}

export function ElementRenderer({
  element,
  theme,
  section,
  breakpoint,
  className = '',
}: ElementRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Resolve Cascade Styles (Theme -> Section -> Breakpoint -> Element -> Overrides)
  const resolved = useMemo(
    () => resolveStyle(theme, section, element, breakpoint),
    [theme, section, element, breakpoint]
  );

  // 2. Attach Animation Engine
  useAnimationEngine({
    config: element.animation,
    targetRef: containerRef,
  });

  // If element is not visible at this breakpoint, hide it
  if (!resolved.visible) {
    return null;
  }

  // 3. Compose Box & Transform inline CSS styles
  const boxStyles: React.CSSProperties = {
    padding: resolved.box.padding,
    paddingTop: resolved.box.paddingTop,
    paddingRight: resolved.box.paddingRight,
    paddingBottom: resolved.box.paddingBottom,
    paddingLeft: resolved.box.paddingLeft,
    margin: resolved.box.margin,
    marginTop: resolved.box.marginTop,
    marginRight: resolved.box.marginRight,
    marginBottom: resolved.box.marginBottom,
    marginLeft: resolved.box.marginLeft,
    width: resolved.box.width,
    minWidth: resolved.box.minWidth,
    maxWidth: resolved.box.maxWidth,
    height: resolved.box.height,
    minHeight: resolved.box.minHeight,
    maxHeight: resolved.box.maxHeight,
    background: resolved.box.background || resolved.box.backgroundColor,
    borderRadius: resolved.box.borderRadius,
    border: resolved.box.border,
    borderColor: resolved.box.borderColor,
    borderWidth: resolved.box.borderWidth,
    borderStyle: resolved.box.borderStyle,
    boxShadow: resolved.box.boxShadow,
    opacity: resolved.box.opacity,
    display: resolved.box.display,
    overflow: resolved.box.overflow,
    zIndex: resolved.box.zIndex,
    // Transform parameters
    transform: `translate(${resolved.transform.translateX}, ${resolved.transform.translateY}) rotate(${resolved.transform.rotateDeg}deg) scale(${resolved.transform.scale})`,
  };

  return (
    <div
      ref={containerRef}
      id={element.id}
      data-element-id={element.id}
      data-element-type={element.content.type}
      style={boxStyles}
      className={`element-node relative transition-all duration-150 ${className}`}
    >
      {(() => {
        switch (element.content.type) {
          case 'text':
            return <TextElement element={element} style={resolved} />;
          case 'image':
            return <ImageElement element={element} style={resolved} />;
          case 'video':
            return <VideoElement element={element} />;
          case 'decor':
            return <DecorElement element={element} />;
          case 'divider':
            return <DividerElement element={element} style={resolved} />;
          case 'button':
            return <ButtonElement element={element} style={resolved} />;
          case 'seal':
            return <SealElement element={element} />;
          case 'shape':
            return <ShapeElement element={element} style={resolved} />;
          case 'spacer':
            return <SpacerElement element={element} />;
          default:
            return null;
        }
      })()}
    </div>
  );
}
