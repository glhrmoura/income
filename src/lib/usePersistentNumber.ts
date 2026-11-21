import { useEffect, useState } from 'react';

const PREFIX = 'income:';

function read(key: string, fallback: number): number {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw === null) return fallback;
    const value = Number(raw);
    return Number.isFinite(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

export function usePersistentNumber(key: string, fallback: number) {
  const [value, setValue] = useState(() => read(key, fallback));

  useEffect(() => {
    try {
      localStorage.setItem(PREFIX + key, String(value));
    } catch {
      return;
    }
  }, [key, value]);

  return [value, setValue] as const;
}
