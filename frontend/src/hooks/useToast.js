import { useCallback, useEffect, useRef, useState } from 'react';

export const useToast = (duration = 4000) => {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const clearToastTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const hideToast = useCallback(() => {
    clearToastTimer();
    setToast(null);
  }, [clearToastTimer]);

  const showToast = useCallback(
    (message, type = 'success') => {
      clearToastTimer();
      setToast({ message, type });
      timerRef.current = setTimeout(() => {
        setToast(null);
        timerRef.current = null;
      }, duration);
    },
    [clearToastTimer, duration],
  );

  useEffect(() => {
    return clearToastTimer;
  }, [clearToastTimer]);

  return { toast, showToast, hideToast };
};
