import { supabase } from '../lib/supabase';
import type { Answer, Question, Test } from '../types/database';

export const getTestById = async (): Promise<Test[]> => {
  const { data, error } = await supabase.from('tests').select('*');

  if (error) {
    throw error;
  }

  return data;
};

export const getQuestionsByTestId = async (
  testId: number,
): Promise<Question[]> => {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('test_id', testId);

  if (error) {
    throw error;
  }

  return data;
};

export const getAnswersByQuestionId = async (
  questionId: number,
): Promise<Answer[]> => {
  const { data, error } = await supabase
    .from('answers')
    .select('*')
    .eq('question_id', questionId);

  if (error) {
    throw error;
  }

  return data;
};
