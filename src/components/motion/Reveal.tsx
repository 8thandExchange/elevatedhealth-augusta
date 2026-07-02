import { motion, type Variants } from "framer-motion";
import { type ElementType, type ReactNode, useMemo } from "react";
import { fadeInUp, useReducedMotionSafe } from "@/lib/motion";

interface RevealProps {
  children: ReactNode;
  /** Motion variant to animate in with. Defaults to fadeInUp. */
  variant?: Variants;
  /** Seconds to delay the reveal (useful for manual sequencing). */
  delay?: number;
  /** Element/tag to render. Defaults to a div. */
  as?: ElementType;
  className?: string;
  /** Animate only the first time it enters the viewport. Defaults to true. */
  once?: boolean;
  /** Fraction of the element that must be visible to trigger (0–1). */
  amount?: number;
}

/**
 * Scroll-reveal wrapper built on Framer Motion's whileInView. Composable
 * replacement for the manual IntersectionObserver in useScrollReveal.
 *
 * When prefers-reduced-motion is set, it renders the plain element with no
 * transform and full opacity immediately (no animation, no flash).
 */
export function Reveal({
  children,
  variant = fadeInUp,
  delay = 0,
  as = "div",
  className,
  once = true,
  amount,
}: RevealProps) {
  const prefersReduced = useReducedMotionSafe();
  const MotionComponent = useMemo(() => motion.create(as as string), [as]);

  if (prefersReduced) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionComponent
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-80px", amount }}
      variants={variant}
      transition={{ delay }}
    >
      {children}
    </MotionComponent>
  );
}

export default Reveal;
