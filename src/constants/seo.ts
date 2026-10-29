// Production origin for canonical and og:url. Update together with the other
// hardcoded URLs when moving to the custom domain (see CLAUDE.md).
export const SITE_URL = 'https://between-testing-platform.vercel.app';

export const SITE_NAME = 'BETWEEN';

export const DEFAULT_TITLE = 'BETWEEN: тести з англійської для учнів школи';

export const DEFAULT_DESCRIPTION =
  'Платформа школи англійської BETWEEN: тести для визначення та перевірки рівня англійської. Доступ для учнів після запису на навчання.';

// The site is not launched yet, so every page is noindex. At launch set this
// to true AND remove the robots meta from index.html: Google does not render
// pages that are noindex in the initial HTML.
export const SITE_INDEXABLE = false;
