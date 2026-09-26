import { useEffect, useRef, useState } from 'react';

export const useCountdown = (durationSeconds: number, onExpire: () => void) => {
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds);

  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;

    if (durationSeconds <= 0) {
      return;
    }

    const deadline = Date.now() + durationSeconds * 1000;

    const interval = setInterval(() => {
      const remainingMs = deadline - Date.now();
      const remaining = Math.max(0, Math.ceil(remainingMs / 1000));

      setSecondsLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        onExpireRef.current();
      }
    }, 250);

    return () => clearInterval(interval);
  }, [durationSeconds]);

  return secondsLeft;
};
