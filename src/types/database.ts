export interface Test {
  id: number;
  title: string;
  description: string;
  level_id: number;
  submodule_id: number;
  test_type: string;

  level: Level[];
}

export interface EditTest {
  id: number;
  title: string;
  description: string;
  level_id: number;

  test_parts: {
    id: number;
    title: string;
    instruction: string;
    points: number;
  }[];

  questions: (Question & { answers: Answer[] })[];
}

export interface TestWithLevels extends Test {
  levels: {
    code: string;
  } | null;

  questions: {
    count: number;
  } | null;
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
    points: number;
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

  tests: {
    title: string;
  };

  profiles: {
    display_name: string;
  } | null;
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

export interface StudentDetails {
  id: string;
  name: string;
  surname: string;
  email: string;
  birth_date: string;

  results: {
    id: number;
    score: number;
    total: number;
    created_at: string;
    tests: {
      id: number;
      title: string;
    } | null;
  }[];
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
  name: string;
  surname: string;
  email: string;
  avatar_url: string;
  birth_date: string;

  tests: {
    title: string;
  };

  results: Results[];
}

export interface StudentProfile {
  id: string;
  role: 'student';
  display_name: string;
  email: string;
  avatar_url: string;
  birth_date: string;

  results:
    | {
        count: number;
      }[]
    | null;
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
  sort_order: number;
}
