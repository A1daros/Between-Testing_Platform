import { supabase } from '../lib/supabase';
import type { PlacementQuestion, QuestionWithAnswers } from '../types/database';

export const getQuestionsWithAnswersByTestId = async (
  testId: number,
): Promise<QuestionWithAnswers[]> => {
  const { data, error } = await supabase
    .from('questions')
    .select(
      `*, answers(id, question_id, answer_text), 
        tests(title,
        description,
        timer_enabled, 
        timer_type,
        timer_duration), 
        test_parts(id, title, instruction, points, audio_path)`,
    )
    .eq('test_id', testId)
    .order('sort_order', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getPlacementTest = async (): Promise<PlacementQuestion[]> => {
  const { data, error } = await supabase.rpc('get_placement_questions');

  if (error) {
    throw new Error(error.message);
  }

  return (data as PlacementQuestion[] | null) ?? [];
};
