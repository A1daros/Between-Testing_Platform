export interface Test {
  id: number;
  title: string;
  description: string;
  level_id: number;
  submodule_id: number;
  test_type: string;
  timer_enabled: boolean;
  timer_type: 'test' | 'question' | null;
  timer_duration: number | null;

  levels: {
    code: string;
  } | null;

  questions: {
    count: number;
  } | null;
}

export interface TestWithLevels extends Test {
  levels: {
    code: string;
  } | null;

  questions: {
    count: number;
  } | null;
}

export interface Level {
  id: number;
  code: string;
  title: string;
  sort_order: number;
}

export interface PublicAnswer {
  id: number;
  question_id: number;
  answer_text: string;
}

export interface Answer extends PublicAnswer {
  is_correct: boolean;
}

export interface CorrectAnswer {
  question_id: number;
  answer_id: number;
}

export interface Question {
  id: number;
  test_id: number;
  question: string;
  title: string;
  description: string | null;
  sort_order: number;
  part_id: number;
}

export interface QuestionWithAnswers extends Question {
  answers: PublicAnswer[];

  tests: {
    title: string;
    description: string;
    timer_enabled: boolean;
    timer_type: 'test' | 'question' | null;
    timer_duration: number | null;
  };

  test_parts: {
    id: number;
    title: string;
    instruction: string;
    points: number;
    audio_path: string | null;
  } | null;

  levels: {
    code: string;
  } | null;
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
    test_type: string;
  };

  profiles: {
    display_name: string;
  } | null;
}

export interface ResultDetails {
  id: number;
  result_id: number;
  question_id: number;
  answer_id: number;

  questions: QuestionWithAnswers;
  answers: PublicAnswer;
  correct_answer_id: number | null;
}

export interface SaveQuizResultInput {
  testId: number;
  userAnswers: Record<number, number>;
}

export interface SubmitQuizResult {
  result_id: number;
  score: number;
  total: number;
}

export interface PlacementAnswer {
  id: number;
  answer_text: string;
}

export interface PlacementQuestion {
  id: number;
  question: string;
  description: string | null;
  sort_order: number;
  tests: {
    title: string;
    description: string | null;
  };
  levels: {
    code: string | null;
  } | null;
  answers: PlacementAnswer[];
}

export interface PlacementResult {
  level_code: string;
  level_title: string;
}

export interface EditTest {
  id: number;
  title: string;
  description: string;
  level_id: number;
  timer_enabled: boolean;
  timer_type: 'test' | 'question' | null;
  timer_duration: number | null;

  test_parts: {
    id: number;
    title: string;
    instruction: string;
    points: number;
    audio_path: string | null;
  }[];

  questions: (Question & {
    answers: Answer[];
  })[];
}

export interface StudentResults {
  id: number;
  score: number;
  total: number;
  created_at: string;
  tests: Test | null;
}

export interface StudentDetails {
  id: string;
  name: string;
  surname: string;
  email: string;
  birth_date: string;

  results: StudentResults[];
}

export type ProfileStatus = 'pending' | 'approved' | 'rejected';

export interface Profile {
  id: string;
  role: 'student' | 'admin';
  status: ProfileStatus;
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
  status: ProfileStatus;
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

export interface Teacher {
  id: string;
  name: string;
  age: number;
  role: string;
  experience: string;
  specialties: string;
  photo_url: string;
}

export interface Program {
  id: string;
  age_group: string;
  title: string;
  description: string;
  sort_order: number;
}

export interface ProgramFormat {
  id: number;
  program_id: string;
  type: string;
  lessons_per_month: number;
  duration_minutes: number;
  price: number;
  is_popular: boolean;
  sort_order: number;
}
