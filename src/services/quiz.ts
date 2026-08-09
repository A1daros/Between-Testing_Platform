import { supabase } from '../lib/supabase';
import type {
  Answer,
  Question,
  ResultAnswers,
  ResultAnswersInput,
  ResultDetails,
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

export const SaveResult = async (result: ResultInput): Promise<Results> => {
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
