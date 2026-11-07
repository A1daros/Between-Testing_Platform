import { supabase } from '../lib/supabase';
import type { CorrectAnswer } from '../types/database';
import { unwrap } from './helpers';

export const getCorrectAnswers = async (
  testId: number,
): Promise<CorrectAnswer[]> => {
  const data = unwrap<CorrectAnswer[] | null>(
    await supabase.rpc('get_correct_answers', { p_test_id: testId }),
  );

  return data ?? [];
};
