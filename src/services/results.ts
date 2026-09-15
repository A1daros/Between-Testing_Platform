import { supabase } from '../lib/supabase';
import type {
  ResultInput,
  Results,
  SaveQuizResultInput,
} from '../types/database';
import { saveResultAnswers } from './resultAnswers';

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
    .select(`*, tests(title)`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const saveQuizResult = async ({
  testId,
  userId,
  score,
  total,
  userAnswers,
}: SaveQuizResultInput) => {
  const result = await saveResult({
    test_id: testId,
    user_id: userId,
    score,
    total,
  });

  const resultAnswers = Object.entries(userAnswers).map(
    ([questionId, answerId]) => ({
      result_id: result.id,
      question_id: Number(questionId),
      answer_id: Number(answerId),
    }),
  );

  await saveResultAnswers(resultAnswers);

  return result;
};

export const loadRecentResults = async (): Promise<Results[]> => {
  const { data, error } = await supabase
    .from('results')
    .select(`*, tests(title), profiles(display_name)`)
    .order('created_at', { ascending: false })
    .limit(5);

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
