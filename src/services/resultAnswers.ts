import { supabase } from '../lib/supabase';
import type { ResultAnswerDetails } from '../types/database';
import { getCorrectAnswers } from './answers';
import { unwrap } from './helpers';

type ResultAnswerRow = Omit<ResultAnswerDetails, 'correct_answer_id'>;

export const getResultDetails = async (
  resultId: number,
): Promise<ResultAnswerDetails[]> => {
  const data = unwrap<ResultAnswerRow[]>(
    await supabase
      .from('result_answers')
      .select(
        `*,
        questions(*,
          answers(id, question_id, answer_text),
          tests(title, description, content_updated_at),
          test_parts(title, instruction)),
        answers(id, question_id, answer_text),
        results(created_at)`,
      )
      .eq('result_id', resultId),
  );

  const rows = [...data].sort(
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
