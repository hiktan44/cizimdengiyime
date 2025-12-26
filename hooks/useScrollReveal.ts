/**
 * Scroll Reveal Hook
 * Elementleri scroll ile görünür olduğunda animasyonla göstermek için
 */

import { useEffect, useRef, useState } from 'react';

interface ScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
}

export const useScrollReveal = (options: ScrollRevealOptions = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = true,
    direction = 'up',
    delay = 0,
  } = options;

  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay > 0) {
            setTimeout(() => setIsVisible(true), delay);
          } else {
            setIsVisible(true);
          }

          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, triggerOnce, delay]);

  const getRevealClass = () => {
    if (!isVisible) {
      switch (direction) {
        case 'up':
          return 'opacity-0 translate-y-12';
        case 'down':
          return 'opacity-0 -translate-y-12';
        case 'left':
          return 'opacity-0 translate-x-12';
        case 'right':
          return 'opacity-0 -translate-x-12';
        default:
          return 'opacity-0 translate-y-12';
      }
    }
    return 'opacity-100 translate-0';
  };

  return { ref, isVisible, revealClass: getRevealClass() };
};

// Hook for staggering multiple elements
export const useScrollRevealStaggered = (
  count: number,
  options: ScrollRevealOptions = {}
) => {
  const refs = useRef<(HTMLElement | null)[]>([]);
  const [visibleIndices, setVisibleIndices] = useState<Set<number>>(new Set());

  useEffect(() => {
    refs.current = refs.current.slice(0, count);
  }, [count]);

  useEffect(() => {
    const { threshold = 0.1, rootMargin = '0px', delay = 100 } = options;

    const observers = refs.current.map((element, index) => {
      if (!element) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setVisibleIndices(prev => new Set(prev).add(index));
            }, index * delay);
            observer.unobserve(element);
          }
        },
        { threshold, rootMargin }
      );

      observer.observe(element);
      return observer;
    });

    return () => {
      observers.forEach(observer => observer?.disconnect());
    };
  }, [count, options]);

  return { refs, visibleIndices };
};

