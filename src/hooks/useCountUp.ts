import { useState, useEffect } from 'react';

interface UseCountUpOptions {
  duration?: number;
  delay?: number;
  isMillionViews?: boolean;
}

export const useCountUp = (
  target: number,
  trigger: boolean,
  options: UseCountUpOptions = {}
) => {
  const { duration = 2000, delay = 0, isMillionViews = false } = options;
  const [count, setCount] = useState(0);
  const [showFormatted, setShowFormatted] = useState(false);

  useEffect(() => {
    if (!trigger) return;

    const startTime = Date.now() + delay;
    const endTime = startTime + duration;

    const timer = setInterval(() => {
      const now = Date.now();
      
      if (now < startTime) return;
      
      if (now >= endTime) {
        setCount(target);
        if (isMillionViews) {
          setTimeout(() => setShowFormatted(true), 500);
        }
        clearInterval(timer);
        return;
      }

      const progress = (now - startTime) / duration;
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(target * easeOutQuart));
    }, 16);

    return () => clearInterval(timer);
  }, [target, trigger, duration, delay, isMillionViews]);

  return { count, showFormatted };
};