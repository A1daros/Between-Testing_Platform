import styles from './QuestionCard.module.scss';
import type { UIPart, UIQuestion } from '../../../../../types/testForm';

type QuestionCardProps = {
  question: UIQuestion;
  parts: UIPart[];
  onChange: (fields: Partial<Omit<UIQuestion, 'uiId' | 'answers'>>) => void;
  onAnswerTextChange: (answerIndex: number, text: string) => void;
  onSelectCorrectAnswer: (answerIndex: number) => void;
  onRemove: () => void;
};

export const QuestionCard = ({
  question,
  parts,
  onChange,
  onAnswerTextChange,
  onSelectCorrectAnswer,
  onRemove,
}: QuestionCardProps) => {
  return (
    <div className={styles.card}>
      <button
        type='button'
        className={styles.removeButton}
        aria-label='Видалити питання'
        onClick={onRemove}
      >
        ✕
      </button>

      <div className={styles.fieldGroup}>
        <label
          htmlFor={`questionPart-${question.uiId}`}
          className={styles.label}
        >
          Частина
        </label>
        <select
          id={`questionPart-${question.uiId}`}
          className={styles.select}
          value={question.partUiId ?? ''}
          onChange={(event) =>
            onChange({ partUiId: event.target.value || null })
          }
        >
          <option value=''>Без частини</option>
          {parts.map((part) => (
            <option key={part.uiId} value={part.uiId}>
              {part.title || 'Частина без назви'}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.fieldGroup}>
        <label
          htmlFor={`questionText-${question.uiId}`}
          className={styles.label}
        >
          Текст питання
        </label>
        <input
          id={`questionText-${question.uiId}`}
          className={styles.input}
          type='text'
          value={question.question}
          onChange={(event) => onChange({ question: event.target.value })}
          placeholder='Текст питання'
        />
      </div>

      <div className={styles.fieldGroup}>
        <label
          htmlFor={`questionDescription-${question.uiId}`}
          className={styles.label}
        >
          Текст для читання (необовʼязково)
        </label>
        <textarea
          id={`questionDescription-${question.uiId}`}
          className={styles.textarea}
          value={question.description}
          onChange={(event) => onChange({ description: event.target.value })}
          placeholder='Текст, який учень бачить над питанням (reading)'
        />
      </div>

      <fieldset className={styles.answers}>
        <legend className={styles.subTitle}>Відповіді</legend>

        {question.answers.map((answer, index) => (
          <div key={index} className={styles.answerRow}>
            <input
              type='radio'
              className={styles.radio}
              name={`correct-answer-${question.uiId}`}
              checked={answer.isCorrect}
              aria-label={`Відповідь ${index + 1} правильна`}
              onChange={() => onSelectCorrectAnswer(index)}
            />
            <input
              type='text'
              aria-label={`Текст відповіді ${index + 1}`}
              className={styles.input}
              value={answer.text}
              onChange={(event) => onAnswerTextChange(index, event.target.value)}
              placeholder={`Відповідь ${index + 1}`}
            />
          </div>
        ))}
      </fieldset>
    </div>
  );
};
