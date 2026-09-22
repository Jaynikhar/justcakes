import { useCallback, useEffect, useRef, useState } from 'react';
import { apiMessage } from '../api/axios.js';

/**
 * Small data-fetching helper so every page gets
 * loading / error / empty states without repeating code.
 */
export function useAsync(asyncFn, deps = [], { immediate = true } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState('');
  const mounted = useRef(true);
  const fnRef = useRef(asyncFn);
  fnRef.current = asyncFn;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const run = useCallback(async (...args) => {
    setLoading(true);
    setError('');
    try {
      const result = await fnRef.current(...args);
      if (mounted.current) setData(result);
      return result;
    } catch (err) {
      if (mounted.current) setError(apiMessage(err));
      return null;
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (immediate) run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, setData, loading, error, refetch: run };
}
