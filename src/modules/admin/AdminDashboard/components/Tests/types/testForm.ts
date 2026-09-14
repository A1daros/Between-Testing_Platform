export type NewTestPayload = {
  title: string;
  description: string;
  levelId: string;
  parts: {
    uiId: string;
    title: string;
    instruction: string;
    points: number;
  }[];
  questions: {
    partId: string | null;
    question: string;
    answers: { text: string; isCorrect: boolean }[];
  }[];
};

export interface UIPart {
  uiId: string;
  title: string;
  instruction: string;
  points: number;
}

export interface UIQuestion {
  uiId: string;
  partUiId: string | null;
  question: string;
  answers: { text: string; isCorrect: boolean }[];
}