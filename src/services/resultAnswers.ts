import { supabase } from '../lib/supabase';
import type { ResultDetails } from '../types/database';
import { getCorrectAnswers } from './answers';

type ResultAnswerRow = Omit<ResultDetails, 'correct_answer_id'>;

export const getResultDetails = async (
  resultId: number,
): Promise<ResultDetails[]> => {
  const { data, error } = await supabase
    .from('result_answers')
    .select(
      `*,
        questions(*,
          answers(id, question_id, answer_text),
          tests(title, description),
          test_parts(title, instruction)),
          answers(id, question_id, answer_text)`,
    )
    .eq('result_id', resultId);

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data as ResultAnswerRow[]).sort(
    (a, b) => a.questions.sort_order - b.questions.sort_order,
  );

  if (rows.length === 0) {
    return [];
  }

  const correctAnswers = await getCorrectAnswers(rows[0].questions.test_id);

  const correctByQuestion = new Map<number, number>(
    correctAnswers.map(({ question_id, answer_id }) => [
      question_id,
      answer_id,
    ]),
  );

  return rows.map((row) => ({
    ...row,
    correct_answer_id: correctByQuestion.get(row.question_id) ?? null,
  }));
};
