import styles from './QuizProgress.module.scss';

type QuizProgressProps = {
  current: number;
  total: number;
  label?: string;
};

export const QuizProgress = ({
  current,
  total,
  label = 'Прогрес тесту',
}: QuizProgressProps) => {
  const progress = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className={styles.progressWrapper}>
      <div
        className={styles.progressTrack}
        role='progressbar'
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div className={styles.progressBar} style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
};
