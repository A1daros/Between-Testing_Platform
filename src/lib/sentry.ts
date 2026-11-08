// Reports must not carry personal data or credentials. Password recovery links
// keep tokens in the URL fragment and signed audio URLs keep them in the query,
// so breadcrumbs are off and URLs are cut down to the path.
import * as Sentry from '@sentry/react';

const IGNORED_NETWORK_ERRORS = [
  'Failed to fetch',
  'NetworkError when attempting to fetch resource',
  'Load failed',
  'Failed to send a request to the Edge Function',
];

const stripUrl = (url: string) => url.split(/[?#]/)[0];

export const initSentry = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;

  if (!dsn) {
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: false,
      httpBodies: [],
      urlQueryParams: false,
    },
    maxBreadcrumbs: 0,
    ignoreErrors: IGNORED_NETWORK_ERRORS,
    integrations: (defaults) =>
      defaults.filter(({ name }) => name !== 'BrowserSession'),
    beforeSend: (event) => {
      if (event.request) {
        event.request = event.request.url
          ? { url: stripUrl(event.request.url) }
          : {};
      }

      return event;
    },
  });
};
