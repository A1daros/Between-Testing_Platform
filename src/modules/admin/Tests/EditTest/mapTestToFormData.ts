import type { EditableTest } from '../../../../types/database';
import type { TestFormData } from '../../../../types/testForm';

export const mapTestToFormData = (test: EditableTest): TestFormData => ({
  title: test.title,
  description: test.description ?? '',
  levelId: test.level_id === null ? '' : String(test.level_id),
  timerEnabled: test.timer_enabled,
  timerType: test.timer_type,
  timerDuration: test.timer_duration,
  parts: test.test_parts.map((part) => ({
    id: part.id,
    uiId: String(part.id),
    title: part.title,
    instruction: part.instruction,
    points: part.points,
    audioPath: part.audio_path,
    audioFile: null,
  })),
  questions: test.questions.map((question) => ({
    id: question.id,
    uiId: String(question.id),
    partUiId: question.part_id === null ? null : String(question.part_id),
    question: question.question,
    description: question.description ?? '',
    answers: question.answers.map((answer) => ({
      id: answer.id,
      text: answer.answer_text,
      isCorrect: answer.is_correct,
    })),
  })),
});
