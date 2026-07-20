import { useCallback, useEffect, useRef } from "react";

type DebouncedFunction<TArgs extends unknown[]> = ((...args: TArgs) => void) & {
  cancel: () => void;
};

export function useDebounce<TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  delay: number,
): DebouncedFunction<TArgs> {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debounced = useCallback(
    (...args: TArgs) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay],
  ) as DebouncedFunction<TArgs>;

  debounced.cancel = () => {
    if (!timeoutRef.current) return;
    clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  };

  useEffect(() => () => debounced.cancel(), [debounced]);

  return debounced;
}
