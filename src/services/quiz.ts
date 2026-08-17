import { supabase } from '../lib/supabase';
import type {
  Profile,
  QuestionWithAnswers,
  ResultAnswers,
  ResultAnswersInput,
  ResultDetails,
  ResultInput,
  Results,
  SaveQuizResultInput,
  Test,
} from '../types/database';

export const getTests = async (): Promise<Test[]> => {
  const { data, error } = await supabase.from('tests').select('*');

  if (error) {
    throw error;
  }

  return data;
};

export const getQuestionsWithAnswersByTestId = async (
  testId: number,
): Promise<QuestionWithAnswers[]> => {
  const { data, error } = await supabase
    .from('questions')
    .select(`*, answers(*)`)
    .eq('test_id', testId);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

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

export const getResultsByTestId = async (
  testId: number,
): Promise<Results[]> => {
  const { data, error } = await supabase
    .from('results')
    .select('*')
    .eq('test_id', testId);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getResultAnswersByResultId = async (
  resultId: number,
): Promise<ResultAnswers[]> => {
  const { data, error } = await supabase
    .from('result_answers')
    .select('*')
    .eq('result_id', resultId);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const saveResultAnswers = async (
  resultAnswers: ResultAnswersInput[],
) => {
  const { error } = await supabase.from('result_answers').insert(resultAnswers);

  if (error) {
    throw new Error(error.message);
  }
};

export const getResultDetails = async (
  resultId: number,
): Promise<ResultDetails[]> => {
  const { data, error } = await supabase
    .from('result_answers')
    .select(`*, questions(*, answers(*)), answers(*)`)
    .eq('result_id', resultId);

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
    .select(`*, test:tests(title)`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getResultById = async (resultId: number): Promise<Results[]> => {
  const { data, error } = await supabase
    .from('results')
    .select('*')
    .eq('id', resultId)
    .single();

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

export const getProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
