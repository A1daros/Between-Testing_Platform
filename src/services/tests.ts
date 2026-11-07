import { supabase } from '../lib/supabase';
import type {
  EditableTest,
  PublicAnswer,
  Question,
  Test,
  TestWithLevels,
} from '../types/database';
import { getCorrectAnswers } from './answers';

type TestRow = Omit<EditableTest, 'questions'> & {
  questions: (Question & { answers: PublicAnswer[] })[];
};

export const getTests = async (): Promise<Test[]> => {
  const { data, error } = await supabase
    .from('tests')
    .select(`*, levels(code), questions(count)`)
    .neq('test_type', 'placement_test');

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getTestById = async (testId: number): Promise<EditableTest> => {
  const { data, error } = await supabase
    .from('tests')
    .select(
      `*, test_parts(*), questions(*, answers(id, question_id, answer_text))`,
    )
    .eq('id', testId)
    .order('sort_order', { referencedTable: 'test_parts' })
    .order('sort_order', { referencedTable: 'questions' })
    .order('id', { referencedTable: 'questions.answers' })
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('Test not found');
  }

  const test = data as TestRow;

  const correctAnswers = await getCorrectAnswers(testId);
  const correctIds = new Set(correctAnswers.map((item) => item.answer_id));

  return {
    ...test,
    questions: test.questions.map((question) => ({
      ...question,
      answers: question.answers.map((answer) => ({
        ...answer,
        is_correct: correctIds.has(answer.id),
      })),
    })),
  };
};

export const getTestsWithLevel = async (): Promise<TestWithLevels[]> => {
  const { data, error } = await supabase
    .from('tests')
    .select(`*, levels(code), questions(count)`);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getTestsByLevelId = async (levelId: number): Promise<Test[]> => {
  const { data, error } = await supabase
    .from('tests')
    .select(`*, levels(code), questions(count)`)
    .eq('level_id', levelId)
    .neq('test_type', 'placement_test');

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const loadCountTests = async (): Promise<number> => {
  const { count, error } = await supabase
    .from('tests')
    .select('*', { count: 'exact', head: true })
    .neq('test_type', 'placement_test');

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
};
