import { supabase } from '../lib/supabase';
import type {
  Answer,
  Question,
  ResultInput,
  Results,
  Test,
} from '../types/database';

export const getTest = async (): Promise<Test[]> => {
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

export const SaveResult = async (result: ResultInput): Promise<void> => {
  const { error } = await supabase.from('results').insert(result);

  if (error) {
    throw new Error(error.message);
  }
};

export const getResultsByTestId = async (testId: number): Promise<Results[]> => {
  const { data, error } = await supabase
    .from('results')
    .select('*')
    .eq('test_id', testId);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
