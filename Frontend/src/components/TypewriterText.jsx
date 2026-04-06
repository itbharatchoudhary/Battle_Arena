import { useEffect, useRef, useState } from 'react';

export default function TypewriterText({ text, speed = 8, className = '', onDone }) {
  const [displayed, setDisplayed] = useState('');
  const indexRef = useRef(0);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(null);

  useEffect(() => {
    if (!text) return;
    indexRef.current = 0;
    setDisplayed('');

    const step = (timestamp) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const elapsed = timestamp - lastTimeRef.current;

      // speed = chars per frame roughly; lower = faster
      const charsThisFrame = Math.max(1, Math.floor(elapsed / speed));
      if (elapsed >= speed) {
        indexRef.current = Math.min(indexRef.current + charsThisFrame, text.length);
        setDisplayed(text.slice(0, indexRef.current));
        lastTimeRef.current = timestamp;
      }

      if (indexRef.current < text.length) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        onDone?.();
      }
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = null;
    };
  }, [text, speed]);

  return (
    <span className={className}>
      {displayed}
      {displayed.length < (text?.length || 0) && (
        <span className="inline-block w-0.5 h-4 ml-0.5 bg-violet-400 animate-pulse align-middle" />
      )}
    </span>
  );
}
