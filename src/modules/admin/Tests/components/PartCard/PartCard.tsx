import styles from './PartCard.module.scss';
import type { UIPart } from '../../../../../types/testForm';
import { ALLOWED_AUDIO_TYPES } from '../../../../../services/audio';

type PartCardProps = {
  part: UIPart;
  onChange: (fields: Partial<Omit<UIPart, 'uiId'>>) => void;
  onSelectAudio: (file: File | undefined) => void;
  onRemove: () => void;
};

export const PartCard = ({
  part,
  onChange,
  onSelectAudio,
  onRemove,
}: PartCardProps) => {
  const hasAudio = Boolean(part.audioFile || part.audioPath);

  return (
    <div className={styles.card}>
      <button
        type='button'
        className={styles.removeButton}
        aria-label='Видалити частину'
        onClick={onRemove}
      >
        ✕
      </button>

      <div className={styles.fieldGroup}>
        <label htmlFor={`partTitle-${part.uiId}`} className={styles.label}>
          Назва частини
        </label>
        <input
          id={`partTitle-${part.uiId}`}
          className={styles.input}
          value={part.title}
          onChange={(event) => onChange({ title: event.target.value })}
          placeholder='Напр., Reading | Grammar | Listening'
        />
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor={`instruction-${part.uiId}`} className={styles.label}>
          Інструкція
        </label>
        <textarea
          id={`instruction-${part.uiId}`}
          className={styles.textarea}
          value={part.instruction}
          onChange={(event) => onChange({ instruction: event.target.value })}
          placeholder='Інструкція для цієї частини'
        />
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor={`points-${part.uiId}`} className={styles.label}>
          Балів за питання
        </label>
        <input
          id={`points-${part.uiId}`}
          className={styles.input}
          type='number'
          min='1'
          value={part.points}
          onChange={(event) => onChange({ points: Number(event.target.value) })}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor={`audio-${part.uiId}`} className={styles.label}>
          Аудіо для listening (MP3, M4A, OGG, WAV, до 20 МБ)
        </label>

        {hasAudio && (
          <div className={styles.audioInfo}>
            <span className={styles.audioName}>
              {part.audioFile
                ? `${part.audioFile.name} — завантажиться під час збереження`
                : 'Аудіо додано'}
            </span>

            <button
              type='button'
              className={styles.audioRemoveButton}
              onClick={() => onChange({ audioPath: null, audioFile: null })}
            >
              Прибрати аудіо
            </button>
          </div>
        )}

        <input
          key={part.audioFile?.name ?? part.audioPath ?? 'empty'}
          id={`audio-${part.uiId}`}
          type='file'
          accept={ALLOWED_AUDIO_TYPES.join(',')}
          className={styles.fileInput}
          onChange={(event) => onSelectAudio(event.target.files?.[0])}
        />
      </div>
    </div>
  );
};
