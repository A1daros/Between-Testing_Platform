import { captureException } from '@sentry/react';

export const captureError = (error: unknown) => {
  captureException(error);
};
