import { supabase } from '../lib/supabase';
import type {
  ResultInput,
  Results,
  SaveQuizResultInput,
  SubmitQuizResult,
} from '../types/database';

export const saveResult = async (result: ResultInput): Promise<Results> => {
  const { data, error } = await supabase
    .from('results')
    .insert(result)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getResultsByUserId = async (
  userId: string,
): Promise<Results[]> => {
  const { data, error } = await supabase
    .from('results')
    .select(`*, tests(title, test_type)`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const saveQuizResult = async ({
  testId,
  userAnswers,
}: SaveQuizResultInput): Promise<SubmitQuizResult> => {
  const { data, error } = await supabase.rpc('submit_quiz', {
    p_test_id: testId,
    p_answers: userAnswers,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const loadRecentResults = async (): Promise<Results[]> => {
  const { data, error } = await supabase
    .from('results')
    .select(`*, tests(title), profiles(display_name)`)
    .order('created_at', { ascending: false })
    .limit(6);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const loadAttemptResults = async (): Promise<number> => {
  const { count, error } = await supabase
    .from('results')
    .select('*', { count: 'exact', head: true });

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
};

export const loadAllStudentsResults = async (): Promise<Results[]> => {
  const { data, error } = await supabase
    .from('results')
    .select(`*, tests(title), profiles(display_name)`);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
