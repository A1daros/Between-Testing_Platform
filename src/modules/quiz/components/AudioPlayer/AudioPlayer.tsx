import { useEffect, useRef, useState } from 'react';
import { getTestAudioUrl } from '../../../../services/audio';
import styles from './AudioPlayer.module.scss';

type Props = {
  path: string;
  maxPlays: number;
  playsUsed: number;
  onPlayStart: () => void;
};

// No native controls on purpose: the recording can only be started from the
// beginning (counted as a play), paused and resumed, not seeked.
export const AudioPlayer = ({
  path,
  maxPlays,
  playsUsed,
  onPlayStart,
}: Props) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  const [src, setSrc] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const playsLeft = Math.max(maxPlays - playsUsed, 0);

  useEffect(() => {
    let isCancelled = false;

    getTestAudioUrl(path)
      .then((url) => {
        if (!isCancelled) {
          setSrc(url);
        }
      })
      .catch((error) => {
        console.error('Failed to load audio:', error);

        if (!isCancelled) {
          setErrorMessage('Не вдалося завантажити аудіо.');
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [path]);

  const handleToggle = async () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (isPlaying) {
      audio.pause();
      return;
    }

    try {
      if (isPaused) {
        await audio.play();
        return;
      }

      if (playsLeft === 0) {
        return;
      }

      audio.currentTime = 0;
      await audio.play();
      onPlayStart();
    } catch (error) {
      console.error('Failed to play audio:', error);
      setErrorMessage('Не вдалося відтворити аудіо.');
    }
  };

  const getButtonLabel = () => {
    if (!src) {
      return 'Завантаження аудіо...';
    }

    if (isPlaying) {
      return 'Пауза';
    }

    if (isPaused) {
      return 'Продовжити';
    }

    if (playsLeft === 0) {
      return 'Прослуховування вичерпано';
    }

    return playsUsed === 0 ? 'Прослухати' : 'Прослухати ще раз';
  };

  const isDisabled = !src || (!isPlaying && !isPaused && playsLeft === 0);

  return (
    <div className={styles.player}>
      <span className={styles.label}>LISTENING</span>

      {src && (
        <audio
          ref={audioRef}
          src={src}
          preload='auto'
          onPlay={() => {
            setIsPlaying(true);
            setIsPaused(false);
          }}
          onPause={(event) => {
            setIsPlaying(false);
            setIsPaused(!event.currentTarget.ended);
          }}
          onEnded={() => {
            setIsPlaying(false);
            setIsPaused(false);
          }}
          onTimeUpdate={(event) => {
            const { currentTime, duration } = event.currentTarget;

            setProgress(duration ? (currentTime / duration) * 100 : 0);
          }}
        />
      )}

      <div className={styles.controls}>
        <button
          type='button'
          className={styles.button}
          disabled={isDisabled}
          onClick={handleToggle}
        >
          {getButtonLabel()}
        </button>

        <span className={styles.playsInfo}>
          Залишилось прослуховувань: {playsLeft} з {maxPlays}
        </span>
      </div>

      <div
        className={styles.progressTrack}
        role='progressbar'
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label='Прогрес аудіо'
      >
        <div
          className={styles.progressBar}
          style={{ width: `${progress}%` }}
        />
      </div>

      {errorMessage && (
        <p className={styles.errorText} role='alert'>
          {errorMessage}
        </p>
      )}
    </div>
  );
};
