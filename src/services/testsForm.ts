import { supabase } from '../lib/supabase';
import type { NewTestPayload } from '../modules/admin/AdminDashboard/components/Tests/types/testForm';

const deleteTestStructure = async (testId: number) => {
  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select('id')
    .eq('test_id', testId);

  if (questionsError) {
    throw new Error(
      `Failed to get existing questions: ${questionsError.message}`,
    );
  }

  const questionIds = questions.map((question) => question.id);

  if (questionIds.length > 0) {
    const { error: resultAnswersError } = await supabase
      .from('result_answers')
      .delete()
      .in('question_id', questionIds);

    if (resultAnswersError) {
      throw new Error(
        `Failed to delete result answers: ${resultAnswersError.message}`,
      );
    }

    const { error: answersError } = await supabase
      .from('answers')
      .delete()
      .in('question_id', questionIds);

    if (answersError) {
      throw new Error(`Failed to delete answers: ${answersError.message}`);
    }
  }

  const { error: questionsDeleteError } = await supabase
    .from('questions')
    .delete()
    .eq('test_id', testId);

  if (questionsDeleteError) {
    throw new Error(
      `Failed to delete questions: ${questionsDeleteError.message}`,
    );
  }

  const { error: partsError } = await supabase
    .from('test_parts')
    .delete()
    .eq('test_id', testId);

  if (partsError) {
    throw new Error(`Failed to delete test parts: ${partsError.message}`);
  }
};

const deleteTestResults = async (testId: number) => {
  const { data: results, error: fetchError } = await supabase
    .from('results')
    .select('id')
    .eq('test_id', testId);

  if (fetchError) {
    throw new Error(`Failed to delete result: ${fetchError.message}`);
  }

  const resultIds = results.map((result) => result.id);

  if (resultIds.length > 0) {
    const { error: resultAnswersError } = await supabase
      .from('result_answers')
      .delete()
      .in('result_id', resultIds);

    if (resultAnswersError) {
      throw new Error(
        `Failed to delete result answers by result_id: ${resultAnswersError.message}`,
      );
    }
  }

  const { error: resultError } = await supabase
    .from('results')
    .delete()
    .eq('test_id', testId);

  if (resultError) {
    throw new Error(`Failed to delete result: ${resultError.message}`);
  }
};

export const createTest = async (payload: NewTestPayload) => {
  const { data, error } = await supabase.rpc('save_test', {
    p_payload: payload,
  });

  if (error) {
    throw new Error(`Failed to create test: ${error.message}`);
  }

  return data;
};

export const updateTest = async (testId: number, payload: NewTestPayload) => {
  const { data, error } = await supabase.rpc('save_test', {
    p_payload: payload,
    p_test_id: testId,
  });

  if (error) {
    throw new Error(`Failed to update test: ${error.message}`);
  }

  return data;
};

export const deleteTest = async (testId: number) => {
  await deleteTestResults(testId);
  await deleteTestStructure(testId);

  const { error: testError } = await supabase
    .from('tests')
    .delete()
    .eq('id', testId);

  if (testError) {
    throw new Error(`Failed to delete test: ${testError.message}`);
  }
};
