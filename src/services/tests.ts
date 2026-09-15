import { supabase } from '../lib/supabase';
import type { EditTest, Test, TestWithLevels } from '../types/database';

export const getTests = async (): Promise<Test[]> => {
  const { data, error } = await supabase
    .from('tests')
    .select('*')
    .neq('test_type', 'placement_test');

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getTestById = async (testId: number): Promise<EditTest> => {
  const { data, error } = await supabase
    .from('tests')
    .select(`*, test_parts(*), questions(*, answers(*))`)
    .eq('id', testId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('Test not found');
  }

  return data;
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
    .select(`*, levels(id)`)
    .eq('level_id', levelId);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
