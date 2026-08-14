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

export interface ResultInput {
  test_id: number;
  user_id: string;
  score: number;
  total: number;
}

export interface Results {
  id: number;
  test_id: number;
  user_id: string;
  score: number;
  total: number;
  created_at: string;

  test: {
    title: string;
  };
}

export interface ResultAnswers {
  id: number;
  result_id: number;
  question_id: number;
  answer_id: number;
}

export interface ResultAnswersInput {
  result_id: number;
  question_id: number;
  answer_id: number;
}

export interface QuestionWithAnswers extends Question {
  answers: Answer[];
}

export interface ResultDetails {
  id: number;
  result_id: number;
  question_id: number;
  answer_id: number;

  questions: QuestionWithAnswers;
  answers: Answer;
}
