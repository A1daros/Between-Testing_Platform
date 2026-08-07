import { supabase } from '../lib/supabase';
import type { Answer, Question, Test } from '../types/database';

export const getTests = async (): Promise<Test[]> => {
  const { data, error } = await supabase.from('tests').select('*');

  if (error) {
    throw new Error();
  }

  return data;
};

export const getQuestions = async (): Promise<Question[]> => {
  const { data, error } = await supabase.from('questions').select('*');

  if (error) {
    throw new Error();
  }

  return data;
};

export const getAnswers = async (): Promise<Answer[]> => {
  const { data, error } = await supabase.from('answers').select('*');

  if (error) {
    throw new Error();
  }

  return data;
};
