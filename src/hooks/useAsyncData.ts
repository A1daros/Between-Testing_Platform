// `load` must be stable between renders (a module-level function or a
// useCallback), otherwise the data is reloaded on every render. Pass null to
// skip loading until the required input (e.g. a route param) is available.
import { useCallback, useEffect, useState } from 'react';
import { captureError } from '../utils/captureError';

type AsyncState<T> = {
  data: T | undefined;
  error: unknown;
  loading: boolean;
};

export const useAsyncData = <T>(load: (() => Promise<T>) | null) => {
  const [state, setState] = useState<AsyncState<T>>({
    data: undefined,
    error: null,
    loading: load !== null,
  });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!load) {
      return;
    }

    let cancelled = false;

    const run = async () => {
      setState((prev) => ({ ...prev, error: null, loading: true }));

      try {
        const data = await load();

        if (!cancelled) {
          setState({ data, error: null, loading: false });
        }
      } catch (error) {
        captureError(error);

        if (!cancelled) {
          setState((prev) => ({ ...prev, error, loading: false }));
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [load, attempt]);

  const setData = useCallback(
    (update: (prev: T | undefined) => T | undefined) => {
      setState((prev) => ({ ...prev, data: update(prev.data) }));
    },
    [],
  );

  const reload = useCallback(() => {
    setAttempt((prev) => prev + 1);
  }, []);

  return { ...state, setData, reload };
};
