import { useCallback, useEffect, useRef, useState } from "react";

interface UseTimerReturn {
  timeLeft: number;
  isRunning: boolean;
  reset: (newDuration?: number) => void;
  pause: () => void;
  resume: () => void;
}

export function useTimer(
  duration: number,
  onExpire?: () => void,
): UseTimerReturn {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(true);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearTimer();
          setIsRunning(false);
          onExpireRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clearTimer;
  }, [isRunning, clearTimer]);

  const reset = useCallback(
    (newDuration?: number) => {
      clearTimer();
      setTimeLeft(newDuration ?? duration);
      setIsRunning(true);
    },
    [clearTimer, duration],
  );

  const pause = useCallback(() => {
    clearTimer();
    setIsRunning(false);
  }, [clearTimer]);

  const resume = useCallback(() => {
    setIsRunning(true);
  }, []);

  return { timeLeft, isRunning, reset, pause, resume };
}
