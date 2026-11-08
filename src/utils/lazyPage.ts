// After a deploy, open tabs request chunks that no longer exist. The page
// reloads once to pick up the new build; the session flag stops a reload loop
// when the failure persists, and the error then reaches ChunkError.
import { lazy, type ComponentType } from 'react';

const RELOAD_FLAG = 'chunk-reload-attempted';

const claimChunkReload = () => {
  try {
    if (sessionStorage.getItem(RELOAD_FLAG)) {
      sessionStorage.removeItem(RELOAD_FLAG);

      return false;
    }

    sessionStorage.setItem(RELOAD_FLAG, '1');

    return true;
  } catch {
    return false;
  }
};

const clearChunkReload = () => {
  try {
    sessionStorage.removeItem(RELOAD_FLAG);
  } catch {
    return;
  }
};

export const lazyPage = <T extends Record<string, unknown>, K extends keyof T>(
  loader: () => Promise<T>,
  name: K,
) =>
  lazy(() =>
    loader().then(
      (module) => {
        clearChunkReload();

        return { default: module[name] as ComponentType };
      },
      (error) => {
        if (navigator.onLine && claimChunkReload()) {
          window.location.reload();

          return new Promise<never>(() => {});
        }

        throw error;
      },
    ),
  );
