import { supabase } from '../lib/supabase';
import type {
  AdminResultsPage,
  AdminResultsSort,
  Results,
  SaveQuizResultInput,
  SubmitQuizResult,
} from '../types/database';

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

type GetAdminResultsParams = {
  query: string;
  sort: AdminResultsSort;
  page: number;
  pageSize: number;
};

export const getAdminResults = async ({
  query,
  sort,
  page,
  pageSize,
}: GetAdminResultsParams): Promise<AdminResultsPage> => {
  const { data, error } = await supabase.rpc('get_admin_results', {
    p_query: query,
    p_sort: sort,
    p_limit: pageSize,
    p_offset: (page - 1) * pageSize,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
