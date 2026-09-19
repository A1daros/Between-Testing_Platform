import { useParams } from 'react-router-dom';
import { TestForm } from '../TestForm';
import { useEffect, useState } from 'react';
import type { EditTest } from '../../../../../../../types/database';
import { getTestById } from '../../../../../../../services/tests';
import type { NewTestPayload, UIPart, UIQuestion } from '../../types/testForm';
import { Loader } from '../../../../../../Loader';
import styles from './EditTest.module.scss';
import { updateTest } from '../../../../../../../services/testsForm';

export const EditTestForm = () => {
  const [editTest, setEditTest] = useState<EditTest | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { testId } = useParams();

  useEffect(() => {
    if (!testId) {
      return;
    }

    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await getTestById(Number(testId));

        setEditTest(data);
      } catch (error) {
        console.error('Failed to load test:', error);
        setErrorMessage('Failed to load test. It can be empty');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [testId]);

  const handleSubmit = async (payload: NewTestPayload): Promise<void> => {
    if (!testId) {
      throw new Error('Test ID is missing');
    }

    await updateTest(Number(testId), payload);
  };

  if (isLoading) {
    return <Loader />;
  }

  if (errorMessage) {
    return <div className={styles.errorMessage}>{errorMessage}</div>;
  }

  if (!editTest) {
    return <div className={styles.errorMessage}>Empty data!</div>;
  }

  const mappedParts: UIPart[] = editTest.test_parts.map((part) => ({
    uiId: String(part.id),
    title: part.title,
    instruction: part.instruction,
    points: part.points,
  }));

  const mappedQuestions: UIQuestion[] = editTest.questions.map((question) => ({
    uiId: String(question.id),
    partUiId: question.part_id ? String(question.part_id) : null,
    question: question.question,
    answers: question.answers.map((answer) => ({
      text: answer.answer_text,
      isCorrect: answer.is_correct,
    })),
  }));

  const initialData = {
    title: editTest.title,
    description: editTest.description,
    levelId: String(editTest.level_id),
    parts: mappedParts,
    questions: mappedQuestions,
  };

  return (
    <div className={styles.container}>
        <TestForm initialData={initialData} onSubmit={handleSubmit} />
    </div>
  );
};
