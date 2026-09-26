import { useCountdown } from '../../../../hooks/useCountdown';
import styles from './Timer.module.scss';

type Props = {
  durationSeconds: number;
  onExpire: () => void;
};

const URGENT_THRESHOLD_SECONDS = 10;

export const Timer = ({ durationSeconds, onExpire }: Props) => {
  const secondsLeft = useCountdown(durationSeconds, onExpire);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isUrgent = secondsLeft > 0 && secondsLeft <= URGENT_THRESHOLD_SECONDS;
  return (
    <div className={styles.timer}>
      <span className={styles.timerLabel}>TIME</span>
      <span
        className={`${styles.timerValue} ${isUrgent ? styles.timerUrgent : ''}`}
      >
        {formattedTime}
      </span>
    </div>
  );
};
