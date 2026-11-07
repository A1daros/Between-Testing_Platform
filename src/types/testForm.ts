// `id` is set for rows that already exist in the DB, so save_test updates them
// in place instead of recreating them. UIPart.audioPath is the path already
// saved in the test-audio bucket; audioFile is a newly picked file that is
// uploaded on submit and replaces it. UIQuestion.description is the reading
// text shown above the question (questions.description).
import type { TimerType } from './database';

export type UIAnswer = {
  id?: number;
  text: string;
  isCorrect: boolean;
};

export type UIPart = {
  id?: number;
  uiId: string;
  title: string;
  instruction: string;
  points: number;
  audioPath: string | null;
  audioFile: File | null;
};

export type UIQuestion = {
  id?: number;
  uiId: string;
  partUiId: string | null;
  question: string;
  description: string;
  answers: UIAnswer[];
};

export type TestFormData = {
  title: string;
  description: string;
  levelId: string;
  timerEnabled: boolean;
  timerType: TimerType | null;
  timerDuration: number | null;
  parts: UIPart[];
  questions: UIQuestion[];
};

export type NewTestPayload = Omit<TestFormData, 'parts' | 'questions'> & {
  parts: Omit<UIPart, 'audioFile'>[];
  questions: {
    id?: number;
    partId: string | null;
    question: string;
    description: string;
    answers: UIAnswer[];
  }[];
};
