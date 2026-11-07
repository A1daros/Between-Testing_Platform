const LOCALE = 'uk-UA';

export const formatDate = (value: string): string =>
  new Date(value).toLocaleDateString(LOCALE);

export const formatTime = (value: string): string =>
  new Date(value).toLocaleTimeString(LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
  });
