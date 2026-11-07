import { supabase } from '../lib/supabase';
import type {
  EditableTest,
  PublicAnswer,
  Question,
  Test,
} from '../types/database';
import type { NewTestPayload } from '../types/testForm';
import { getCorrectAnswers } from './answers';
import { removeTestAudio } from './audio';
import { unwrap, unwrapCount } from './helpers';

type TestRow = Omit<EditableTest, 'questions'> & {
  questions: (Question & { answers: PublicAnswer[] })[];
};

type GetTestsOptions = {
  levelId?: number;
  includePlacement?: boolean;
};

export const getTests = async ({
  levelId,
  includePlacement = false,
}: GetTestsOptions = {}): Promise<Test[]> => {
  let query = supabase
    .from('tests')
    .select(`*, levels(code), questions(count)`);

  if (levelId !== undefined) {
    query = query.eq('level_id', levelId);
  }

  if (!includePlacement) {
    query = query.neq('test_type', 'placement_test');
  }

  return unwrap(await query);
};

export const getTestById = async (testId: number): Promise<EditableTest> => {
  const test = unwrap<TestRow>(
    await supabase
      .from('tests')
      .select(
        `*, test_parts(*), questions(*, answers(id, question_id, answer_text))`,
      )
      .eq('id', testId)
      .order('sort_order', { referencedTable: 'test_parts' })
      .order('sort_order', { referencedTable: 'questions' })
      .order('id', { referencedTable: 'questions.answers' })
      .single(),
  );

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

export const loadCountTests = async (): Promise<number> =>
  unwrapCount(
    await supabase
      .from('tests')
      .select('*', { count: 'exact', head: true })
      .neq('test_type', 'placement_test'),
  );

export const createTest = async (payload: NewTestPayload): Promise<number> =>
  unwrap(await supabase.rpc('save_test', { p_payload: payload }));

export const updateTest = async (
  testId: number,
  payload: NewTestPayload,
): Promise<number> =>
  unwrap(
    await supabase.rpc('save_test', {
      p_payload: payload,
      p_test_id: testId,
    }),
  );

export const deleteTest = async (testId: number): Promise<void> => {
  const parts = unwrap<{ audio_path: string | null }[]>(
    await supabase.from('test_parts').select('audio_path').eq('test_id', testId),
  );

  unwrap(await supabase.rpc('delete_test', { p_test_id: testId }));

  const audioPaths = parts
    .map((part) => part.audio_path)
    .filter((path): path is string => Boolean(path));

  try {
    await removeTestAudio(audioPaths);
  } catch (removeError) {
    console.error('Failed to remove test audio:', removeError);
  }
};
