import type { SubmitQuizResult } from '../types/database';
import type { QuizResultState } from '../types/quiz';

export const getQuizResultState = ({
  score,
  total,
  attempts_used,
  attempts_allowed,
}: SubmitQuizResult): QuizResultState => ({
  score,
  totalScore: total,
  attemptsLeft:
    attempts_allowed === null
      ? null
      : Math.max(attempts_allowed - attempts_used, 0),
});
