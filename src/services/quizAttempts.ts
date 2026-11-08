import { supabase } from '../lib/supabase';
import type {
  QuizAttemptState,
  QuizProgressStatus,
  StudentAttempts,
  SubmitQuizResult,
} from '../types/database';
import { unwrap } from './helpers';

export const getQuizAttempt = async (
  testId: number,
): Promise<QuizAttemptState> =>
  unwrap(await supabase.rpc('get_quiz_attempt', { p_test_id: testId }));

export const startQuizAttempt = async (
  testId: number,
): Promise<QuizAttemptState> =>
  unwrap(await supabase.rpc('start_quiz_attempt', { p_test_id: testId }));

export const saveQuizProgress = async (
  attemptId: number,
  answers: Record<number, number>,
  questionIndex: number,
): Promise<QuizProgressStatus> => {
  const data = unwrap<{ status: QuizProgressStatus }>(
    await supabase.rpc('save_quiz_progress', {
      p_attempt_id: attemptId,
      p_answers: answers,
      p_question_index: questionIndex,
    }),
  );

  return data.status;
};

export const submitQuizAttempt = async (
  attemptId: number,
  answers: Record<number, number>,
): Promise<SubmitQuizResult> =>
  unwrap(
    await supabase.rpc('submit_quiz_attempt', {
      p_attempt_id: attemptId,
      p_answers: answers,
    }),
  );

export const registerAudioPlay = async (
  attemptId: number,
  partId: number,
): Promise<number> => {
  const data = unwrap<{ plays_used: number }>(
    await supabase.rpc('register_audio_play', {
      p_attempt_id: attemptId,
      p_part_id: partId,
    }),
  );

  return data.plays_used;
};

export const getStudentAttempts = async (
  studentId: string,
): Promise<StudentAttempts[]> =>
  unwrap(
    await supabase.rpc('get_student_attempts', { p_user_id: studentId }),
  );

export const grantExtraAttempt = async (
  studentId: string,
  testId: number,
): Promise<void> => {
  unwrap(
    await supabase.rpc('grant_extra_attempt', {
      p_user_id: studentId,
      p_test_id: testId,
    }),
  );
};
