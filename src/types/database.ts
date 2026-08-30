export interface Test {
  id: number;
  title: string;
  description: string;
  level_id: number;
  submodule_id: number;
  test_type: string;
}

export interface Question {
  id: number;
  test_id: number;
  question: string;
  title: string;
  description: string;
  sort_order: number;
  part_id: number;
}

export interface QuestionWithAnswers extends Question {
  answers: Answer[];

  tests: {
    title: string;
    description: string;
  };

  test_parts: {
    title: string;
    instruction: string;
    part_id: number;
  } | null;

  levels: {
    code: string;
  } | null;
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

  profiles: { display_name: string } | null;
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

export interface ResultDetails {
  id: number;
  result_id: number;
  question_id: number;
  answer_id: number;

  questions: QuestionWithAnswers;
  answers: Answer;
}

export interface SaveQuizResultInput {
  testId: number;
  userId: string;
  score: number;
  total: number;
  userAnswers: Record<number, number>;
}

export interface Profile {
  id: string;
  role: 'student' | 'admin';
  display_name: string;
  avatar_url: string;
  birth_date: string;
}

export interface Submodule {
  id: number;
  level_id: number;
  title: string;
}

export interface Level {
  id: number;
  code: string;
  title: string;
}

export interface TheorySection {
  id: number;
  submodule_id: number;
  title: string;
  content: string;
}

export interface WritingPrompt {
  id: number;
  submodule_id: number;
  prompt_text: string;
}

export interface WritingSubmission {
  id: number;
  writing_prompt_id: number;
  user_id: number;
  answer_text: string;
}
