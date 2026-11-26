import { useEffect, useState } from 'react';
import { getCdiData, readCachedCdi, type CdiData } from '@/lib/cdi';

export type CdiStatus =
  | { state: 'loading' }
  | { state: 'error'; message: string }
  | { state: 'ready'; data: CdiData };

export function useCdi(): CdiStatus {
  const [status, setStatus] = useState<CdiStatus>(() => {
    const cached = readCachedCdi();
    return cached ? { state: 'ready', data: cached } : { state: 'loading' };
  });

  useEffect(() => {
    let active = true;
    getCdiData()
      .then((data) => {
        if (active) setStatus({ state: 'ready', data });
      })
      .catch((error: Error) => {
        if (active) setStatus({ state: 'error', message: error.message });
      });
    return () => {
      active = false;
    };
  }, []);

  return status;
}
