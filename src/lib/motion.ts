/**
 * Motion primitive layer — shared Framer Motion variants + reduced-motion helper.
 *
 * Goal: consistent, accessible motion that is easy to apply. Every reveal in the
 * app should go through these variants (via <Reveal> / <Stagger>) so timing and
 * easing stay uniform and prefers-reduced-motion is honored in one place.
 *
 * Accessibility: useReducedMotionSafe() reads the OS/browser
 * `prefers-reduced-motion` setting. When true, callers collapse motion to an
 * instant, opacity-only state (no transform, no scale) — see `instant` below
 * and the short-circuit in the motion components.
 */
import { useReducedMotion, type Transition, type Variants } from "framer-motion";

/**
 * Easing that mirrors `--transition-smooth` in src/index.css:
 * cubic-bezier(0.4, 0, 0.2, 1). Kept in sync so JS motion and CSS transitions agree.
 */
export const EASE_SMOOTH = [0.4, 0, 0.2, 1] as const;

/** Editorial ease-out (expo-ish) used for scroll reveals. */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** Shared transition preset — mirrors the CSS `--transition-smooth` timing. */
export const smooth: Transition = {
  duration: 0.4,
  ease: EASE_SMOOTH,
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_OUT },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: EASE_OUT },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: EASE_OUT },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

/**
 * Reduced-motion fallback: no transform, no scale, appears instantly.
 * Both states are opacity: 1 so content is present the moment it mounts.
 */
export const instant: Variants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1, transition: { duration: 0 } },
};

/** Named variant registry for convenient lookup. */
export const motionVariants = {
  fadeInUp,
  fadeIn,
  scaleIn,
  staggerContainer,
} as const;

export type MotionVariantName = keyof typeof motionVariants;

/**
 * Wrapper around Framer Motion's useReducedMotion that always returns a boolean
 * (the underlying hook can return null before the media query resolves).
 */
export function useReducedMotionSafe(): boolean {
  return useReducedMotion() ?? false;
}

/**
 * Collapse any variant to the instant/opacity-only fallback when the user
 * prefers reduced motion. Use this when animating raw motion elements directly
 * instead of the <Reveal>/<Stagger> components.
 */
export function resolveVariants(variant: Variants, prefersReducedMotion: boolean): Variants {
  return prefersReducedMotion ? instant : variant;
}
