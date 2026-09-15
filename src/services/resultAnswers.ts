import { supabase } from '../lib/supabase';
import type { ResultAnswersInput, ResultDetails } from '../types/database';

export const getResultDetails = async (
  resultId: number,
): Promise<ResultDetails[]> => {
  const { data, error } = await supabase
    .from('result_answers')
    .select(
      `*, questions(*, answers(*), tests(title, description), test_parts(title, instruction)), answers(*)`,
    )
    .eq('result_id', resultId);

  if (error) {
    throw new Error(error.message);
  }

  return (data as ResultDetails[]).sort(
    (a, b) => a.questions.sort_order - b.questions.sort_order,
  );
};

export const saveResultAnswers = async (
  resultAnswers: ResultAnswersInput[],
) => {
  const { error } = await supabase.from('result_answers').insert(resultAnswers);

  if (error) {
    throw new Error(error.message);
  }
};
