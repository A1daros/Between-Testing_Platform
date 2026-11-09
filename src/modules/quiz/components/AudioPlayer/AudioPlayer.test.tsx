import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getTestAudioUrl } from '../../../../services/audio';
import { captureError } from '../../../../utils/captureError';
import { AudioPlayer } from './AudioPlayer';

vi.mock('../../../../services/audio', () => ({ getTestAudioUrl: vi.fn() }));
vi.mock('../../../../utils/captureError', () => ({ captureError: vi.fn() }));

const renderPlayer = (playsUsed: number, onPlayStart = vi.fn()) => {
  onPlayStart.mockResolvedValue(undefined);

  render(
    <AudioPlayer
      path='parts/a.mp3'
      maxPlays={2}
      playsUsed={playsUsed}
      onPlayStart={onPlayStart}
    />,
  );

  return onPlayStart;
};

describe('AudioPlayer', () => {
  beforeEach(() => {
    vi.mocked(getTestAudioUrl).mockResolvedValue('https://audio.test/a.mp3');

    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(
      async function (this: HTMLMediaElement) {
        this.dispatchEvent(new Event('play'));
      },
    );
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(
      function (this: HTMLMediaElement) {
        this.dispatchEvent(new Event('pause'));
      },
    );
  });

  it('shows how many plays are left', async () => {
    renderPlayer(1);

    expect(
      await screen.findByRole('button', { name: 'Прослухати ще раз' }),
    ).toBeEnabled();
    expect(
      screen.getByText('Залишилось прослуховувань: 1 з 2'),
    ).toBeInTheDocument();
  });

  it('registers a play with the server', async () => {
    const onPlayStart = renderPlayer(0);

    fireEvent.click(await screen.findByRole('button', { name: 'Прослухати' }));

    expect(await screen.findByRole('button', { name: 'Пауза' })).toBeEnabled();
    expect(onPlayStart).toHaveBeenCalledTimes(1);
  });

  it('does not count a resume after a pause as a new play', async () => {
    const onPlayStart = renderPlayer(0);

    fireEvent.click(await screen.findByRole('button', { name: 'Прослухати' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Пауза' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Продовжити' }));

    expect(await screen.findByRole('button', { name: 'Пауза' })).toBeEnabled();
    expect(onPlayStart).toHaveBeenCalledTimes(1);
  });

  it('blocks playback when no plays are left', async () => {
    const onPlayStart = renderPlayer(2);
    const exhausted = await screen.findByRole('button', {
      name: 'Прослуховування вичерпано',
    });

    expect(exhausted).toBeDisabled();

    fireEvent.click(exhausted);

    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
    expect(onPlayStart).not.toHaveBeenCalled();
  });

  it('stops the audio when the server refuses the play', async () => {
    const failure = new Error('Audio plays exhausted');
    const onPlayStart = vi.fn();

    render(
      <AudioPlayer
        path='parts/a.mp3'
        maxPlays={2}
        playsUsed={0}
        onPlayStart={onPlayStart.mockRejectedValue(failure)}
      />,
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Прослухати' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Не вдалося відтворити аудіо.',
    );
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Прослухати' })).toBeEnabled();
    expect(captureError).toHaveBeenCalledWith(failure);
  });

  it('reports a failed audio link', async () => {
    const failure = new Error('no url');

    vi.mocked(getTestAudioUrl).mockRejectedValue(failure);
    renderPlayer(0);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Не вдалося завантажити аудіо.',
    );
    expect(captureError).toHaveBeenCalledWith(failure);
  });
});
