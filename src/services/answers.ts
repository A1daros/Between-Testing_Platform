import { supabase } from '../lib/supabase';
import type { CorrectAnswer } from '../types/database';

export const getCorrectAnswers = async (
  testId: number,
): Promise<CorrectAnswer[]> => {
  const { data, error } = await supabase.rpc('get_correct_answers', {
    p_test_id: testId,
  });

  if (error) {
    throw new Error(error.message);
  }

  return (data as CorrectAnswer[] | null) ?? [];
};
