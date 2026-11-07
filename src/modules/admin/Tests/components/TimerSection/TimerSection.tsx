import styles from './TimerSection.module.scss';
import type { TimerType } from '../../../../../types/database';

type TimerSectionProps = {
  timerEnabled: boolean;
  timerType: TimerType | null;
  timerDuration: number | null;
  onToggle: (enabled: boolean) => void;
  onTypeChange: (timerType: TimerType | null) => void;
  onDurationChange: (timerDuration: number | null) => void;
};

export const TimerSection = ({
  timerEnabled,
  timerType,
  timerDuration,
  onToggle,
  onTypeChange,
  onDurationChange,
}: TimerSectionProps) => {
  return (
    <>
      <div className={styles.checkboxGroup}>
        <input
          id='timerEnabled'
          type='checkbox'
          className={styles.checkbox}
          checked={timerEnabled}
          onChange={(event) => onToggle(event.target.checked)}
        />
        <label htmlFor='timerEnabled' className={styles.checkboxLabel}>
          Увімкнути таймер
        </label>
      </div>

      {timerEnabled && (
        <div className={styles.timerFields}>
          <div className={styles.fieldGroup}>
            <label htmlFor='timerType' className={styles.label}>
              Тип таймера
            </label>
            <select
              id='timerType'
              className={styles.select}
              value={timerType ?? ''}
              onChange={(event) => {
                const { value } = event.target;
                onTypeChange(
                  value === 'test' || value === 'question' ? value : null,
                );
              }}
              required
            >
              <option value=''>Оберіть тип...</option>
              <option value='test'>На весь тест</option>
              <option value='question'>На кожне питання</option>
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor='timerDuration' className={styles.label}>
              Тривалість (секунди)
            </label>
            <input
              id='timerDuration'
              type='number'
              min='1'
              className={styles.input}
              value={timerDuration ?? ''}
              onChange={(event) => {
                const { value } = event.target;
                onDurationChange(value ? Number(value) : null);
              }}
              required
            />
          </div>
        </div>
      )}
    </>
  );
};
