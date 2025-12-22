import { useCallback, useRef, useState } from "react";

interface UseLongPressOptions {
  onLongPress: () => void;
  onClick?: () => void;
  delay?: number;
}

export function useLongPress({
  onLongPress,
  onClick,
  delay = 500,
}: UseLongPressOptions) {
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPress = useRef(false);
  const startPos = useRef<{ x: number; y: number } | null>(null);

  const start = useCallback(
    (e: React.PointerEvent) => {
      // Track starting position to detect if user moved (scrolling)
      startPos.current = { x: e.clientX, y: e.clientY };
      isLongPress.current = false;
      
      timerRef.current = setTimeout(() => {
        isLongPress.current = true;
        setLongPressTriggered(true);
        onLongPress();
      }, delay);
    },
    [onLongPress, delay]
  );

  const end = useCallback(
    (e: React.PointerEvent) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      // Check if user moved significantly (scrolling) - if so, don't trigger click
      if (startPos.current) {
        const dx = Math.abs(e.clientX - startPos.current.x);
        const dy = Math.abs(e.clientY - startPos.current.y);
        if (dx > 10 || dy > 10) {
          // User was scrolling, don't trigger click
          setLongPressTriggered(false);
          startPos.current = null;
          return;
        }
      }

      if (!isLongPress.current && onClick) {
        onClick();
      }
      
      setLongPressTriggered(false);
      startPos.current = null;
    },
    [onClick]
  );

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setLongPressTriggered(false);
    startPos.current = null;
  }, []);

  return {
    onPointerDown: start,
    onPointerUp: end,
    onPointerLeave: cancel,
    onPointerCancel: cancel,
    longPressTriggered,
  };
}
