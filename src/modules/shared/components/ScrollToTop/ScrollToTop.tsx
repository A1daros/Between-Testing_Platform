import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Links like /#contacts point at a section; the router does not scroll
    // to it by itself. The section may render a moment later (data loading),
    // so this is retried on the next frame once.
    if (hash) {
      const scrollToHash = () => {
        const element = document.getElementById(hash.slice(1));

        element?.scrollIntoView({ behavior: 'smooth' });

        return Boolean(element);
      };

      if (!scrollToHash()) {
        const frame = requestAnimationFrame(scrollToHash);

        return () => cancelAnimationFrame(frame);
      }

      return;
    }

    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
};
