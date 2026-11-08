export type TimerType = 'test' | 'question';

export type TestType = 'placement_test' | 'submodule_quiz' | 'final_test';

export type ProfileRole = 'student' | 'admin';

export type ProfileStatus = 'pending' | 'approved' | 'rejected';

export type Level = {
  id: number;
  code: string;
  title: string;
  sort_order: number;
};

export type TestPart = {
  id: number;
  title: string;
  instruction: string;
  points: number;
  audio_path: string | null;
};

export type Test = {
  id: number;
  title: string;
  description: string | null;
  level_id: number | null;
  submodule_id: number | null;
  test_type: TestType;
  timer_enabled: boolean;
  timer_type: TimerType | null;
  timer_duration: number | null;

  levels: {
    code: string;
  } | null;

  questions: {
    count: number;
  }[];
};

export type PublicAnswer = {
  id: number;
  question_id: number;
  answer_text: string;
};

export type Answer = PublicAnswer & {
  is_correct: boolean;
};

export type CorrectAnswer = {
  question_id: number;
  answer_id: number;
};

export type Question = {
  id: number;
  test_id: number;
  question: string;
  title: string | null;
  description: string | null;
  sort_order: number;
  part_id: number | null;
};

export type QuestionWithAnswers = Question & {
  answers: PublicAnswer[];

  tests: {
    title: string;
    description: string | null;
    timer_enabled: boolean;
    timer_type: TimerType | null;
    timer_duration: number | null;
  };

  test_parts: TestPart | null;
};

export type ResultTest = {
  title: string;
  test_type: TestType;
  content_updated_at: string | null;
};

export type Result = {
  id: number;
  test_id: number;
  user_id: string | null;
  score: number;
  total: number;
  created_at: string;

  tests: ResultTest;

  profiles: {
    display_name: string;
  } | null;
};

export type AdminResultsSort = 'date' | 'test' | 'student';

export type AdminResultsPage = {
  items: Result[];
  total: number;
};

export type ResultAnswerDetails = {
  id: number;
  result_id: number;
  question_id: number;
  answer_id: number;

  questions: Question & {
    answers: PublicAnswer[];

    tests: {
      title: string;
      description: string | null;
      content_updated_at: string | null;
    };

    test_parts: {
      title: string;
      instruction: string;
    } | null;
  };

  answers: PublicAnswer;

  results: {
    created_at: string;
  };

  correct_answer_id: number | null;
};

export type ResultDetailsData = {
  rows: ResultAnswerDetails[];
  isKeyLocked: boolean;
};

export type SubmitQuizResult = {
  result_id: number;
  score: number;
  total: number;
  attempts_used: number;
  attempts_allowed: number | null;
};

export type QuizAttempt = {
  id: number;
  answers: Record<number, number>;
  audio_plays: Record<number, number>;
  question_index: number;
  seconds_left: number | null;
  question_seconds_left: number | null;
};

export type QuizAttemptState = {
  attempt: QuizAttempt | null;
  expired_result: SubmitQuizResult | null;
  attempts_used: number;
  attempts_allowed: number | null;
};

export type QuizProgressStatus = 'active' | 'expired' | 'finished';

export type StudentAttempts = {
  test_id: number;
  title: string;
  attempts_used: number;
  attempts_allowed: number | null;
};

export type PlacementAnswer = {
  id: number;
  answer_text: string;
};

export type PlacementQuestion = {
  id: number;
  question: string;
  description: string | null;
  sort_order: number;
  tests: {
    title: string;
    description: string | null;
  };
  answers: PlacementAnswer[];
};

export type PlacementResult = {
  level_code: string;
  level_title: string;
};

export type EditableTest = {
  id: number;
  title: string;
  description: string | null;
  level_id: number | null;
  timer_enabled: boolean;
  timer_type: TimerType | null;
  timer_duration: number | null;

  test_parts: TestPart[];

  questions: (Question & {
    answers: Answer[];
  })[];
};

export type StudentResult = {
  id: number;
  score: number;
  total: number;
  created_at: string;
  tests: {
    id: number;
    title: string;
    content_updated_at: string | null;
  } | null;
};

export type StudentWithResults = {
  id: string;
  name: string;
  surname: string;
  email: string;
  birth_date: string | null;
  terms_accepted_at: string | null;
  terms_version: string | null;

  results: StudentResult[];
};

export type Profile = {
  id: string;
  role: ProfileRole;
  status: ProfileStatus;
  display_name: string;
  name: string;
  surname: string;
  email: string;
  avatar_url: string | null;
  birth_date: string | null;
  terms_accepted_at: string | null;
  terms_version: string | null;
  created_at: string;
};

export type StudentProfile = Profile & {
  role: 'student';

  results: {
    count: number;
  }[];
};

export type Teacher = {
  id: string;
  name: string;
  age: number;
  role: string;
  experience: string;
  specialties: string;
  photo_url: string;
};

export type Program = {
  id: string;
  age_group: string;
  title: string;
  description: string;
  sort_order: number;
};

export type ProgramFormat = {
  id: number;
  program_id: string;
  type: string;
  lessons_per_month: number;
  duration_minutes: number;
  price: number;
  is_popular: boolean;
  sort_order: number;
};
