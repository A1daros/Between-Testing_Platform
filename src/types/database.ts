export interface Test {
  id: number;
  title: string;
  description: string;
  level: string;
}

export interface Question {
  id: number;
  test_id: number;
  question: string;
}

export interface Answer {
  id: number;
  question_id: number;
  answer_text: string;
  is_correct: boolean;
}
