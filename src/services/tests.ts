import { supabase } from '../lib/supabase';
import type { NewTestPayload } from '../modules/admin/AdminDashboard/components/Tests/components/TestForm/TestForm';

export const createTest = async (payload: NewTestPayload) => {
  const { data: newTest, error: newTestError } = await supabase
    .from('tests')
    .insert({
      title: payload.title,
      description: payload.description,
      level_id: payload.levelId,
      test_type: 'final_test',
    })
    .select('*')
    .single();

  if (newTestError) {
    throw new Error(newTestError.message);
  }

  const { data: testPart, error: testPartError } = await supabase
    .from('test_parts')
    .insert(
      payload.parts.map(({ title, instruction, points }, index) => ({
        test_id: newTest.id,
        title,
        instruction,
        points,
        sort_order: index + 1,
      })),
    )
    .select('*');

  if (testPartError) {
    throw new Error(testPartError.message);
  }

  const mapUiIdToRealId = payload.parts.map((part, index) => {
    const dbPart = testPart[index];

    return { ...part, realPartId: dbPart.id };
  });

  const questionsToInsert = payload.questions.map((question, index) => {
    const matchedPart = mapUiIdToRealId.find(
      (part) => part.uiId === question.partId,
    );

    return {
      test_id: newTest.id,
      part_id: matchedPart ? matchedPart.realPartId : null,
      question: question.question,
      sort_order: index + 1,
    };
  });

  const { data: testQuestions, error: testQuestionsError } = await supabase
    .from('questions')
    .insert(questionsToInsert)
    .select('*');

  if (testQuestionsError) {
    throw new Error(testQuestionsError.message);
  }

  const { error: testAnswersError } = await supabase
    .from('answers')
    .insert(
      payload.questions.flatMap((question, index) => {
        const realQuestionId = testQuestions[index]?.id;

        if (!realQuestionId) {
          return [];
        }

        return question.answers.map((answer) => ({
          question_id: realQuestionId,
          answer_text: answer.text,
          is_correct: answer.isCorrect,
        }));
      }),
    )
    .select('*');

  if (testAnswersError) {
    throw new Error(testAnswersError.message);
  }

  return newTest;
};
