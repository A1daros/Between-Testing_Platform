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

const ACCESS_DENIED_CODE = '42501';

export const getCorrectAnswersIfUnlocked = async (
  testId: number,
): Promise<CorrectAnswer[] | null> => {
  const { data, error } = await supabase.rpc('get_correct_answers', {
    p_test_id: testId,
  });

  if (error?.code === ACCESS_DENIED_CODE) {
    return null;
  }

  return unwrap<CorrectAnswer[] | null>({ data, error }) ?? [];
};
