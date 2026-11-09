import { Suspense } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ErrorBoundary } from 'react-error-boundary';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { lazyPage } from './lazyPage';

const FLAG = 'chunk-reload-attempted';

const renderPage = (loader: () => Promise<{ Page: () => React.ReactNode }>) => {
  const Page = lazyPage(loader, 'Page');

  render(
    <ErrorBoundary fallback={<p>Помилка чанка</p>}>
      <Suspense fallback={<p>Завантаження</p>}>
        <Page />
      </Suspense>
    </ErrorBoundary>,
  );
};

describe('lazyPage', () => {
  const reload = vi.fn();

  beforeEach(() => {
    sessionStorage.clear();
    vi.stubGlobal('location', { reload });
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders the page and clears the reload flag', async () => {
    sessionStorage.setItem(FLAG, '1');

    renderPage(async () => ({ Page: () => <p>Сторінка</p> }));

    expect(await screen.findByText('Сторінка')).toBeInTheDocument();
    expect(sessionStorage.getItem(FLAG)).toBeNull();
    expect(reload).not.toHaveBeenCalled();
  });

  it('reloads once when a chunk fails', async () => {
    renderPage(() => Promise.reject(new Error('stale chunk')));

    await waitFor(() => expect(reload).toHaveBeenCalledTimes(1));
    expect(sessionStorage.getItem(FLAG)).toBe('1');
    expect(screen.queryByText('Помилка чанка')).not.toBeInTheDocument();
  });

  it('shows the error when the chunk still fails after the reload', async () => {
    sessionStorage.setItem(FLAG, '1');

    renderPage(() => Promise.reject(new Error('stale chunk')));

    expect(await screen.findByText('Помилка чанка')).toBeInTheDocument();
    expect(reload).not.toHaveBeenCalled();
  });
});
