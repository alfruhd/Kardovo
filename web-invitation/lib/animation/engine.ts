import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimationConfig } from '@/lib/schema';
import { prefersReducedMotion } from './reduced-motion';

// Register GSAP plugins safely on client side
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface AnimationEngineOptions {
  config?: AnimationConfig;
  targetRef: React.RefObject<HTMLElement>;
  triggerElementRef?: React.RefObject<HTMLElement>;
  onComplete?: () => void;
}

/**
 * Initializes GSAP animation with support for:
 * - Presets: fade, fade-in, fade-up, fade-down, slide, slide-left, slide-right, scale, zoom-in, zoom-out, rotate, blur, draw, stamp, float, pulse, reveal-envelope
 * - Triggers: load, scroll (ScrollTrigger), click
 * - Parallax scroll effects
 * - Reduced motion support (disables heavy motion & parallax)
 * - Loops and staggers
 */
export function useAnimationEngine({
  config,
  targetRef,
  triggerElementRef,
  onComplete,
}: AnimationEngineOptions) {
  const tweenRef = useRef<gsap.core.Tween | gsap.core.Timeline | null>(null);

  useEffect(() => {
    const el = targetRef.current;
    if (!el || !config || config.preset === 'none') {
      return;
    }

    const isReduced = prefersReducedMotion();

    // With prefers-reduced-motion, immediately ensure visibility without motion
    if (isReduced) {
      gsap.set(el, {
        clearProps: 'opacity,transform,filter',
        opacity: 1,
        visibility: 'visible',
      });
      return;
    }

    const ctx = gsap.context(() => {
      // 1. Parallax Scroll Effect
      if (config.parallaxSpeed !== 0 && config.trigger === 'scroll') {
        const yOffset = config.parallaxSpeed * 120;
        gsap.fromTo(
          el,
          { y: -yOffset },
          {
            y: yOffset,
            ease: 'none',
            scrollTrigger: {
              trigger: triggerElementRef?.current || el,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        );
        return;
      }

      // 2. Setup initial from-state based on preset
      const fromVars: gsap.TweenVars = { opacity: 0 };
      const toVars: gsap.TweenVars = {
        opacity: 1,
        duration: config.durationSec,
        delay: config.delaySec,
        ease: config.easing || 'power2.out',
        onComplete,
      };

      switch (config.preset) {
        case 'fade':
        case 'fade-in':
          fromVars.opacity = 0;
          toVars.opacity = 1;
          break;

        case 'fade-up':
          fromVars.opacity = 0;
          fromVars.y = 40;
          toVars.y = 0;
          break;

        case 'fade-down':
          fromVars.opacity = 0;
          fromVars.y = -40;
          toVars.y = 0;
          break;

        case 'slide':
        case 'slide-left':
          fromVars.opacity = 0;
          fromVars.x = 60;
          toVars.x = 0;
          break;

        case 'slide-right':
          fromVars.opacity = 0;
          fromVars.x = -60;
          toVars.x = 0;
          break;

        case 'scale':
        case 'zoom-in':
          fromVars.opacity = 0;
          fromVars.scale = 0.85;
          toVars.scale = 1;
          break;

        case 'zoom-out':
          fromVars.opacity = 0;
          fromVars.scale = 1.15;
          toVars.scale = 1;
          break;

        case 'rotate':
          fromVars.opacity = 0;
          fromVars.rotation = -15;
          fromVars.scale = 0.9;
          toVars.rotation = 0;
          toVars.scale = 1;
          break;

        case 'blur':
          fromVars.opacity = 0;
          fromVars.filter = 'blur(12px)';
          toVars.filter = 'blur(0px)';
          break;

        case 'stamp':
          fromVars.opacity = 0;
          fromVars.scale = 2.2;
          fromVars.rotation = -12;
          toVars.scale = 1;
          toVars.rotation = 0;
          toVars.ease = 'back.out(2)';
          break;

        case 'pulse':
          if (config.loop) {
            toVars.scale = 1.05;
            toVars.yoyo = true;
            toVars.repeat = -1;
            toVars.ease = 'power1.inOut';
          }
          break;

        case 'float':
          toVars.y = -10;
          toVars.yoyo = true;
          toVars.repeat = -1;
          toVars.ease = 'sine.inOut';
          break;

        case 'draw': {
          // SVG stroke dasharray / dashoffset draw
          const paths = el.querySelectorAll('path, line, polyline, polygon, circle');
          if (paths.length > 0) {
            paths.forEach((p) => {
              const length = (p as SVGGeometryElement).getTotalLength?.() || 100;
              gsap.set(p, {
                strokeDasharray: length,
                strokeDashoffset: length,
              });
            });
            toVars.strokeDashoffset = 0;
          }
          break;
        }

        default:
          fromVars.opacity = 0;
          fromVars.y = 30;
          toVars.y = 0;
          break;
      }

      // Loop support
      if (config.loop && !['float', 'pulse'].includes(config.preset)) {
        toVars.repeat = -1;
        toVars.yoyo = true;
      }

      // 3. Trigger Mode Handling
      if (config.trigger === 'scroll' && config.scrollTrigger) {
        toVars.scrollTrigger = {
          trigger: triggerElementRef?.current || el,
          start: config.triggerOffset || 'top 85%',
          toggleActions: config.once ? 'play none none none' : 'play reverse play reverse',
        };
        tweenRef.current = gsap.fromTo(el, fromVars, toVars);
      } else if (config.trigger === 'load') {
        tweenRef.current = gsap.fromTo(el, fromVars, toVars);
      } else if (config.trigger === 'click') {
        const handleClick = () => {
          gsap.fromTo(el, fromVars, toVars);
        };
        el.addEventListener('click', handleClick);
      } else {
        // Default direct run
        tweenRef.current = gsap.fromTo(el, fromVars, toVars);
      }
    }, el);

    return () => {
      ctx.revert();
    };
  }, [config, targetRef, triggerElementRef, onComplete]);

  return tweenRef;
}

export * from './reduced-motion';
