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
  }[];
  questions: {
    id?: number;
    partId: string | null;
    question: string;
    answers: UIAnswer[];
  }[];
};

export interface UIPart {
  id?: number;
  uiId: string;
  title: string;
  instruction: string;
  points: number;
}

export interface UIQuestion {
  id?: number;
  uiId: string;
  partUiId: string | null;
  question: string;
  answers: UIAnswer[];
}
