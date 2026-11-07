import { supabase } from '../lib/supabase';
import type { QuestionWithAnswers } from '../types/database';
import { unwrap } from './helpers';

export const getQuestionsWithAnswersByTestId = async (
  testId: number,
): Promise<QuestionWithAnswers[]> =>
  unwrap(
    await supabase
      .from('questions')
      .select(
        `*,
        answers(id, question_id, answer_text),
        tests(title, description, timer_enabled, timer_type, timer_duration),
        test_parts(id, title, instruction, points, audio_path)`,
      )
      .eq('test_id', testId)
      .order('sort_order', { ascending: true }),
  );
