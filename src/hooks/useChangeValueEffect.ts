import { useEffect, useRef } from "react";

export const useChangeValueEffect = (func: () => void, value: unknown) => {
  const oldValue = useRef<unknown>(null);

  useEffect(() => {
    if (oldValue.current === null || value === null) {
      oldValue.current = value;
      return;
    }
    if (oldValue.current !== value) func();
  }, [value]);
};
