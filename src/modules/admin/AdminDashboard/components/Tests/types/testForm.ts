// `id` is set for rows that already exist in the DB, so save_test updates them
// in place instead of recreating them.
export type UIAnswer = {
  id?: number;
  text: string;
  isCorrect: boolean;
};

export type NewTestPayload = {
  title: string;
  description: string;
  levelId: string;
  timerEnabled: boolean;
  timerType: 'test' | 'question' | null;
  timerDuration: number | null;
  parts: {
    id?: number;
    uiId: string;
    title: string;
    instruction: string;
    points: number;
    audioPath: string | null;
  }[];
  questions: {
    id?: number;
    partId: string | null;
    question: string;
    description: string;
    answers: UIAnswer[];
  }[];
};

export interface UIPart {
  id?: number;
  uiId: string;
  title: string;
  instruction: string;
  points: number;
  // Path in the test-audio bucket that is already saved for this part.
  audioPath: string | null;
  // A newly picked file; uploaded on submit and replaces audioPath.
  audioFile: File | null;
}

export interface UIQuestion {
  id?: number;
  uiId: string;
  partUiId: string | null;
  question: string;
  // Reading text shown above the question (questions.description).
  description: string;
  answers: UIAnswer[];
}
