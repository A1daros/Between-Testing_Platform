import { supabase } from '../lib/supabase';
import type { QuestionWithAnswers } from '../types/database';

export const getQuestionsWithAnswersByTestId = async (
  testId: number,
): Promise<QuestionWithAnswers[]> => {
  const { data, error } = await supabase
    .from('questions')
    .select(
      `*, answers(*), tests(title, description), test_parts(title, instruction, points)`,
    )
    .eq('test_id', testId)
    .order('sort_order', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getPlacementTest = async (): Promise<QuestionWithAnswers[]> => {
  const { data, error } = await supabase
    .from('questions')
    .select(`*, answers(*), tests:test_id!inner(*), levels(code)`)
    .eq('tests.test_type', 'placement_test')
    .order('sort_order', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};
