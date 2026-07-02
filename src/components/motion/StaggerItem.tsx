import { motion, type Variants } from "framer-motion";
import { type ElementType, type ReactNode, useMemo } from "react";
import { fadeInUp, useReducedMotionSafe } from "@/lib/motion";

interface StaggerItemProps {
  children: ReactNode;
  /** Element/tag to render. Defaults to a div. */
  as?: ElementType;
  className?: string;
  /** Per-item variant. Defaults to fadeInUp. */
  variant?: Variants;
}

/**
 * A single item inside <Stagger>. It does NOT set its own initial/whileInView —
 * it inherits the animation state from the parent container and animates in
 * sequence via the container's staggerChildren timing.
 *
 * When prefers-reduced-motion is set, renders the plain element immediately.
 */
export function StaggerItem({
  children,
  as = "div",
  className,
  variant = fadeInUp,
}: StaggerItemProps) {
  const prefersReduced = useReducedMotionSafe();
  const MotionComponent = useMemo(() => motion.create(as as string), [as]);

  if (prefersReduced) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionComponent className={className} variants={variant}>
      {children}
    </MotionComponent>
  );
}

export default StaggerItem;
