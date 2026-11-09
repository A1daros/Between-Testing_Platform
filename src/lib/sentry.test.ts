import * as Sentry from '@sentry/react';
import { describe, expect, it, vi } from 'vitest';
import { initSentry } from './sentry';

vi.mock('@sentry/react', () => ({ init: vi.fn() }));

type SentryOptions = {
  maxBreadcrumbs: number;
  dataCollection: { userInfo: boolean; cookies: boolean };
  beforeSend: (event: { request?: { url?: string } }) => {
    request?: { url?: string };
  };
};

const getOptions = () => {
  vi.stubEnv('VITE_SENTRY_DSN', 'https://key@sentry.test/1');
  initSentry();
  vi.unstubAllEnvs();

  return vi.mocked(Sentry.init).mock.calls[0][0] as unknown as SentryOptions;
};

describe('initSentry', () => {
  it('stays off without a DSN', () => {
    vi.stubEnv('VITE_SENTRY_DSN', '');
    initSentry();
    vi.unstubAllEnvs();

    expect(Sentry.init).not.toHaveBeenCalled();
  });

  it('does not collect personal data', () => {
    const options = getOptions();

    expect(options.maxBreadcrumbs).toBe(0);
    expect(options.dataCollection.userInfo).toBe(false);
    expect(options.dataCollection.cookies).toBe(false);
  });

  it('removes tokens from URLs and drops other request data', () => {
    const { beforeSend } = getOptions();

    expect(
      beforeSend({
        request: {
          url: 'https://site.test/update-password?x=1#access_token=secret',
        },
      }).request,
    ).toEqual({ url: 'https://site.test/update-password' });
    expect(beforeSend({ request: {} }).request).toEqual({});
  });
});
