import { useEffect, useRef, useState } from "react";

export function useRollingNumber(target: number, duration = 420) {
  const [displayValue, setDisplayValue] = useState(target);
  const previousTarget = useRef(target);

  useEffect(() => {
    const startValue = previousTarget.current;
    const delta = target - startValue;

    if (Math.abs(delta) < 0.01) {
      setDisplayValue(target);
      previousTarget.current = target;
      return undefined;
    }

    const startTime = performance.now();
    let frameId = 0;

    const tick = (timestamp: number) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setDisplayValue(startValue + delta * eased);

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      } else {
        previousTarget.current = target;
      }
    };

    frameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameId);
  }, [duration, target]);

  return displayValue;
}
