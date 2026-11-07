import { padNumber } from '../../../../utils/padNumber';
import styles from './AnswerList.module.scss';

type AnswerOption = {
  id: number;
  answer_text: string;
};

type AnswerListProps = {
  answers: AnswerOption[];
  selectedAnswerId: number | null;
  onSelect: (answer: AnswerOption) => void;
};

export const AnswerList = ({
  answers,
  selectedAnswerId,
  onSelect,
}: AnswerListProps) => {
  return (
    <div
      className={styles.answers}
      role='radiogroup'
      aria-label='Варіанти відповіді'
    >
      {answers.map((answer, index) => {
        const isSelected = selectedAnswerId === answer.id;

        return (
          <button
            key={answer.id}
            type='button'
            role='radio'
            aria-checked={isSelected}
            className={`${styles.answer} ${isSelected ? styles.answerSelected : ''}`}
            onClick={() => onSelect(answer)}
          >
            <span className={styles.answerNumber}>{padNumber(index + 1)}</span>

            <span className={styles.answerText}>{answer.answer_text}</span>

            <span className={styles.answerIndicator} aria-hidden='true'>
              {isSelected ? '✓' : '→'}
            </span>
          </button>
        );
      })}
    </div>
  );
};
