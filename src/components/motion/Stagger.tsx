import { motion } from "framer-motion";
import { type ElementType, type ReactNode, useMemo } from "react";
import { staggerContainer, useReducedMotionSafe } from "@/lib/motion";

interface StaggerProps {
  children: ReactNode;
  /** Element/tag to render as the container. Defaults to a div. */
  as?: ElementType;
  className?: string;
  /** Animate only the first time it enters the viewport. Defaults to true. */
  once?: boolean;
  /** Fraction of the container that must be visible to trigger (0–1). */
  amount?: number;
}

/**
 * Orchestrates staggered child reveals for lists of cards/stats. Wrap children
 * in <StaggerItem> so each one inherits the container's animation state and
 * enters in sequence (staggerChildren from motion.ts).
 *
 * When prefers-reduced-motion is set, renders the plain container immediately;
 * its StaggerItems likewise render instantly.
 */
export function Stagger({
  children,
  as = "div",
  className,
  once = true,
  amount = 0.2,
}: StaggerProps) {
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
      variants={staggerContainer}
    >
      {children}
    </MotionComponent>
  );
}

export default Stagger;
