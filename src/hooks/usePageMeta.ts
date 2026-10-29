import { useEffect } from 'react';
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  SITE_INDEXABLE,
  SITE_NAME,
  SITE_URL,
} from '../constants/seo';

type PageMeta = {
  // Page name without the brand, e.g. 'Про школу'. Omitted → DEFAULT_TITLE.
  title?: string;
  description?: string;
  // Public path for canonical/og:url. Omit for pages that are not indexed.
  path?: string;
  noindex?: boolean;
};

const setMeta = (
  attribute: 'name' | 'property',
  key: string,
  content: string | null,
) => {
  let element = document.head.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${key}"]`,
  );

  if (content === null) {
    element?.remove();
    return;
  }

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.append(element);
  }

  element.content = content;
};

const setCanonical = (href: string | null) => {
  let element = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]',
  );

  if (href === null) {
    element?.remove();
    return;
  }

  if (!element) {
    element = document.createElement('link');
    element.rel = 'canonical';
    document.head.append(element);
  }

  element.href = href;
};

// Updates the tags that index.html ships with, instead of rendering new ones:
// the static values stay as a fallback for crawlers that do not run JS, and
// there are no duplicate <title>/<meta> elements.
export const usePageMeta = ({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  noindex = false,
}: PageMeta) => {
  useEffect(() => {
    const fullTitle = title ? `${title} — ${SITE_NAME}` : DEFAULT_TITLE;
    const url = path === undefined ? null : `${SITE_URL}${path}`;

    document.title = fullTitle;

    setMeta('name', 'description', description);
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', url ?? `${SITE_URL}/`);
    setCanonical(url);
    setMeta(
      'name',
      'robots',
      noindex || !SITE_INDEXABLE ? 'noindex, nofollow' : null,
    );
  }, [title, description, path, noindex]);
};
