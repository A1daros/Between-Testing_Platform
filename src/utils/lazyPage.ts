import { lazy, type ComponentType } from 'react';

export const lazyPage = <T extends Record<string, unknown>, K extends keyof T>(
  loader: () => Promise<T>,
  name: K,
) =>
  lazy(() =>
    loader().then((module) => ({
      default: module[name] as ComponentType,
    })),
  );
