import { ReactNode, CSSProperties } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { cn } from '@/lib/utils';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  animation?: 'fadeUp' | 'fadeIn' | 'scaleIn' | 'slideInLeft' | 'slideInRight';
}

const AnimatedCard = ({ 
  children, 
  className = '', 
  delay = 0,
  animation = 'fadeUp'
}: AnimatedCardProps) => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });

  const getAnimationClasses = () => {
    const baseTransition = 'transition-all ease-out';
    
    switch (animation) {
      case 'fadeUp':
        return cn(
          baseTransition,
          'duration-700',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        );
      case 'fadeIn':
        return cn(
          baseTransition,
          'duration-500',
          isVisible ? 'opacity-100' : 'opacity-0'
        );
      case 'scaleIn':
        return cn(
          baseTransition,
          'duration-500',
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        );
      case 'slideInLeft':
        return cn(
          baseTransition,
          'duration-600',
          isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
        );
      case 'slideInRight':
        return cn(
          baseTransition,
          'duration-600',
          isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
        );
      default:
        return cn(
          baseTransition,
          'duration-700',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        );
    }
  };

  const style: CSSProperties = {
    transitionDelay: `${delay}ms`,
  };

  return (
    <div 
      ref={ref} 
      className={cn(getAnimationClasses(), className)}
      style={style}
    >
      {children}
    </div>
  );
};

export default AnimatedCard;
