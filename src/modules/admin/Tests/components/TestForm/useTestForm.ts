import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type {
  NewTestPayload,
  TestFormData,
  UIPart,
  UIQuestion,
} from '../../../../../types/testForm';
import type { TimerType } from '../../../../../types/database';
import { ADMIN_ROUTES } from '../../../../../constants/routes';
import { getAdminPath } from '../../../../../utils/getAdminPath';
import { validateQuestions } from '../../../../../utils/validateQuestions';
import {
  removeTestAudio,
  uploadTestAudio,
  validateAudioFile,
} from '../../../../../services/audio';
import { captureError } from '../../../../../utils/captureError';

type TestFields = Omit<TestFormData, 'parts' | 'questions'>;

const EMPTY_FORM: TestFormData = {
  title: '',
  description: '',
  levelId: '',
  timerEnabled: false,
  timerType: null,
  timerDuration: null,
  parts: [],
  questions: [],
};

const createPart = (): UIPart => ({
  uiId: crypto.randomUUID(),
  title: '',
  instruction: '',
  points: 1,
  audioPath: null,
  audioFile: null,
});

const createQuestion = (): UIQuestion => ({
  uiId: crypto.randomUUID(),
  partUiId: null,
  question: '',
  description: '',
  answers: [
    { text: '', isCorrect: true },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ],
});

const getAudioPaths = (parts: UIPart[]): string[] =>
  parts
    .map((part) => part.audioPath)
    .filter((path): path is string => Boolean(path));

const uploadPartsAudio = async (
  parts: UIPart[],
  uploadedPaths: string[],
): Promise<UIPart[]> => {
  const savedParts: UIPart[] = [];

  for (const part of parts) {
    if (!part.audioFile) {
      savedParts.push(part);
      continue;
    }

    const audioPath = await uploadTestAudio(part.audioFile);

    uploadedPaths.push(audioPath);
    savedParts.push({ ...part, audioPath, audioFile: null });
  }

  return savedParts;
};

const toPayload = (
  form: TestFormData,
  savedParts: UIPart[],
): NewTestPayload => ({
  title: form.title,
  description: form.description,
  levelId: form.levelId,
  timerEnabled: form.timerEnabled,
  timerType: form.timerType,
  timerDuration: form.timerDuration,
  parts: savedParts.map(({ id, uiId, title, instruction, points, audioPath }) => ({
    id,
    uiId,
    title,
    instruction,
    points,
    audioPath,
  })),
  questions: form.questions.map(
    ({ id, partUiId, question, description, answers }) => ({
      id,
      partId: partUiId,
      question,
      description,
      answers,
    }),
  ),
});

export const useTestForm = (
  initialData: TestFormData | undefined,
  onSubmit: (payload: NewTestPayload) => Promise<void>,
) => {
  const [form, setForm] = useState<TestFormData>(initialData ?? EMPTY_FORM);
  const [initialAudioPaths] = useState(() =>
    getAudioPaths(initialData?.parts ?? []),
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  const updateFields = (fields: Partial<TestFields>) => {
    setForm((prev) => ({ ...prev, ...fields }));
  };

  const toggleTimer = (enabled: boolean) => {
    updateFields(
      enabled
        ? { timerEnabled: true }
        : { timerEnabled: false, timerType: null, timerDuration: null },
    );
  };

  const setTimerType = (timerType: TimerType | null) => {
    updateFields({ timerType });
  };

  const setTimerDuration = (timerDuration: number | null) => {
    updateFields({ timerDuration });
  };

  const addPart = () => {
    setForm((prev) => ({ ...prev, parts: [...prev.parts, createPart()] }));
  };

  const updatePart = (uiId: string, fields: Partial<Omit<UIPart, 'uiId'>>) => {
    setForm((prev) => ({
      ...prev,
      parts: prev.parts.map((part) =>
        part.uiId === uiId ? { ...part, ...fields } : part,
      ),
    }));
  };

  const selectPartAudio = (uiId: string, file: File | undefined) => {
    if (!file) {
      return;
    }

    const validationError = validateAudioFile(file);

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage('');
    updatePart(uiId, { audioFile: file });
  };

  const removePart = (uiId: string) => {
    setForm((prev) => ({
      ...prev,
      parts: prev.parts.filter((part) => part.uiId !== uiId),
      questions: prev.questions.map((question) =>
        question.partUiId === uiId ? { ...question, partUiId: null } : question,
      ),
    }));
  };

  const addQuestion = () => {
    setForm((prev) => ({
      ...prev,
      questions: [...prev.questions, createQuestion()],
    }));
  };

  const updateQuestion = (
    uiId: string,
    update: (question: UIQuestion) => UIQuestion,
  ) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.map((question) =>
        question.uiId === uiId ? update(question) : question,
      ),
    }));
  };

  const updateQuestionFields = (
    uiId: string,
    fields: Partial<Omit<UIQuestion, 'uiId' | 'answers'>>,
  ) => {
    updateQuestion(uiId, (question) => ({ ...question, ...fields }));
  };

  const updateAnswerText = (uiId: string, answerIndex: number, text: string) => {
    updateQuestion(uiId, (question) => ({
      ...question,
      answers: question.answers.map((answer, index) =>
        index === answerIndex ? { ...answer, text } : answer,
      ),
    }));
  };

  const selectCorrectAnswer = (uiId: string, correctIndex: number) => {
    updateQuestion(uiId, (question) => ({
      ...question,
      answers: question.answers.map((answer, index) => ({
        ...answer,
        isCorrect: index === correctIndex,
      })),
    }));
  };

  const removeQuestion = (uiId: string) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.filter((question) => question.uiId !== uiId),
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError = validateQuestions(form.questions);

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const uploadedAudioPaths: string[] = [];

    try {
      const savedParts = await uploadPartsAudio(form.parts, uploadedAudioPaths);

      await onSubmit(toPayload(form, savedParts));

      const keptAudioPaths = new Set(getAudioPaths(savedParts));
      const obsoleteAudioPaths = initialAudioPaths.filter(
        (path) => !keptAudioPaths.has(path),
      );

      try {
        await removeTestAudio(obsoleteAudioPaths);
      } catch (removeError) {
        captureError(removeError);
      }

      navigate(getAdminPath(ADMIN_ROUTES.tests));
    } catch (error) {
      captureError(error);

      removeTestAudio(uploadedAudioPaths).catch(captureError);

      setErrorMessage('Не вдалося зберегти тест. Спробуйте ще раз.');
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    errorMessage,
    updateFields,
    toggleTimer,
    setTimerType,
    setTimerDuration,
    addPart,
    updatePart,
    selectPartAudio,
    removePart,
    addQuestion,
    updateQuestionFields,
    updateAnswerText,
    selectCorrectAnswer,
    removeQuestion,
    handleSubmit,
  };
};
