import { useEffect, useRef, useState } from 'react';

interface UseScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export const useScrollReveal = (options: UseScrollRevealOptions = {}) => {
  const { threshold = 0.1, rootMargin = '0px', triggerOnce = true } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isVisible };
};

// Animation classes for different reveal effects
export const revealClasses = {
  fadeUp: (isVisible: boolean, delay: number = 0, forceVisible = false) =>
    `transition-all duration-700 ease-out ${
      isVisible || forceVisible
        ? "opacity-100 translate-y-0"
        : "opacity-0 translate-y-8"
    }`,
  fadeIn: (isVisible: boolean, delay: number = 0, forceVisible = false) =>
    `transition-all duration-500 ease-out ${
      isVisible || forceVisible ? "opacity-100" : "opacity-0"
    }`,
  scaleIn: (isVisible: boolean, delay: number = 0, forceVisible = false) =>
    `transition-all duration-500 ease-out ${
      isVisible || forceVisible
        ? "opacity-100 scale-100"
        : "opacity-0 scale-95"
    }`,
  slideInLeft: (isVisible: boolean, delay: number = 0, forceVisible = false) =>
    `transition-all duration-600 ease-out ${
      isVisible || forceVisible
        ? "opacity-100 translate-x-0"
        : "opacity-0 -translate-x-8"
    }`,
  slideInRight: (isVisible: boolean, delay: number = 0, forceVisible = false) =>
    `transition-all duration-600 ease-out ${
      isVisible || forceVisible
        ? "opacity-100 translate-x-0"
        : "opacity-0 translate-x-8"
    }`,
};

export default useScrollReveal;
