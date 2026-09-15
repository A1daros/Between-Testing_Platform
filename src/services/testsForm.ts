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
  const { error: resultError } = await supabase
    .from('results')
    .delete()
    .eq('test_id', testId);

  if (resultError) {
    throw new Error(`Failed to delete result: ${resultError.message}`);
  }
};

const createTestStructure = async (testId: number, payload: NewTestPayload) => {
  const { data: createdParts, error: partsError } = await supabase
    .from('test_parts')
    .insert(
      payload.parts.map(({ title, instruction, points }, index) => ({
        test_id: testId,
        title,
        instruction,
        points,
        sort_order: index + 1,
      })),
    )
    .select('*');

  if (partsError) {
    throw new Error(`Failed to create test parts: ${partsError.message}`);
  }

  const partIdMap = new Map(
    payload.parts.map((part, index) => [part.uiId, createdParts[index]?.id]),
  );

  const questionsToInsert = payload.questions.map((question, index) => ({
    test_id: testId,
    part_id: partIdMap.get(question.partId ?? '') ?? null,
    question: question.question,
    sort_order: index + 1,
  }));

  const { data: createdQuestions, error: questionsError } = await supabase
    .from('questions')
    .insert(questionsToInsert)
    .select('*');

  if (questionsError) {
    throw new Error(`Failed to create questions: ${questionsError.message}`);
  }

  const answersToInsert = payload.questions.flatMap((question, index) => {
    const questionId = createdQuestions[index]?.id;

    if (!questionId) {
      return [];
    }

    return question.answers.map((answer) => ({
      question_id: questionId,
      answer_text: answer.text,
      is_correct: answer.isCorrect,
    }));
  });

  const { error: answersError } = await supabase
    .from('answers')
    .insert(answersToInsert);

  if (answersError) {
    throw new Error(`Failed to create answers: ${answersError.message}`);
  }
};

export const createTest = async (payload: NewTestPayload) => {
  const { data: newTest, error: testError } = await supabase
    .from('tests')
    .insert({
      title: payload.title,
      description: payload.description,
      level_id: payload.levelId,
      test_type: 'final_test',
    })
    .select('*')
    .single();

  if (testError) {
    throw new Error(`Failed to create test: ${testError.message}`);
  }

  await createTestStructure(newTest.id, payload);

  return newTest;
};

export const updateTest = async (testId: number, payload: NewTestPayload) => {
  const { data: updatedTest, error: testError } = await supabase
    .from('tests')
    .update({
      title: payload.title,
      description: payload.description,
      level_id: payload.levelId,
      test_type: 'final_test',
    })
    .eq('id', testId)
    .select('*')
    .single();

  if (testError) {
    throw new Error(`Failed to update test: ${testError.message}`);
  }

  await deleteTestResults(testId);
  await deleteTestStructure(testId);

  await createTestStructure(testId, payload);

  return updatedTest;
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
