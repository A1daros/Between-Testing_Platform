import { supabase } from '../lib/supabase';
import type { NewTestPayload } from '../modules/admin/AdminDashboard/components/Tests/types/testForm';

const createTestStructure = async (testId: number, payload: NewTestPayload) => {
  // 1. Create test parts
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

  // 2. Map UI part IDs to real database IDs
  const partIdMap = new Map(
    payload.parts.map((part, index) => [part.uiId, createdParts[index]?.id]),
  );

  // 3. Prepare questions
  const questionsToInsert = payload.questions.map((question, index) => ({
    test_id: testId,
    part_id: partIdMap.get(question.partId ?? '') ?? null,
    question: question.question,
    sort_order: index + 1,
  }));

  // 4. Create questions
  const { data: createdQuestions, error: questionsError } = await supabase
    .from('questions')
    .insert(questionsToInsert)
    .select('*');

  if (questionsError) {
    throw new Error(`Failed to create questions: ${questionsError.message}`);
  }

  // 5. Prepare answers
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

  // 6. Create answers
  const { error: answersError } = await supabase
    .from('answers')
    .insert(answersToInsert);

  if (answersError) {
    throw new Error(`Failed to create answers: ${answersError.message}`);
  }
};

const deleteTestStructure = async (testId: number) => {
  // 1. Get existing question IDs
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

  // 2. Delete student answers connected to these questions
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

    // 3. Delete answers
    const { error: answersError } = await supabase
      .from('answers')
      .delete()
      .in('question_id', questionIds);

    if (answersError) {
      throw new Error(`Failed to delete answers: ${answersError.message}`);
    }
  }

  // 4. Delete questions
  const { error: questionsDeleteError } = await supabase
    .from('questions')
    .delete()
    .eq('test_id', testId);

  if (questionsDeleteError) {
    throw new Error(
      `Failed to delete questions: ${questionsDeleteError.message}`,
    );
  }

  // 5. Delete test parts
  const { error: partsError } = await supabase
    .from('test_parts')
    .delete()
    .eq('test_id', testId);

  if (partsError) {
    throw new Error(`Failed to delete test parts: ${partsError.message}`);
  }
};

export const createTest = async (payload: NewTestPayload) => {
  // 1. Create test
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

  // 2. Create test structure
  await createTestStructure(newTest.id, payload);

  return newTest;
};

export const updateTest = async (testId: number, payload: NewTestPayload) => {
  // 1. Update test
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

  // 2. Delete old structure
  await deleteTestStructure(testId);

  // 3. Create new structure
  await createTestStructure(testId, payload);

  return updatedTest;
};
