import { useState, useEffect, useRef } from 'react';

export default function AnimatedNumber({ value, duration = 400, decimals = 0, style = {} }) {
  const [display, setDisplay] = useState(value);
  const ref = useRef({ start: value, target: value, startTime: 0 });

  useEffect(() => {
    if (value === ref.current.target) return;
    ref.current.start = display;
    ref.current.target = value;
    ref.current.startTime = performance.now();

    function animate(now) {
      const elapsed = now - ref.current.startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = ref.current.start + (ref.current.target - ref.current.start) * eased;
      setDisplay(current);
      if (progress < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }, [value, duration]);

  return (
    <span style={{ fontFamily: "'JetBrains Mono', monospace", ...style }}>
      {decimals > 0 ? display.toFixed(decimals) : Math.round(display)}
    </span>
  );
}
