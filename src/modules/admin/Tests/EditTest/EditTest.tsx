import styles from './EditTest.module.scss';
import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getTestById, updateTest } from '../../../../services/tests';
import type { NewTestPayload } from '../../../../types/testForm';
import { useAsyncData } from '../../../../hooks/useAsyncData';
import { Loader } from '../../../shared/components/Loader';
import { ErrorState } from '../../../shared/components/ErrorState';
import { TestForm } from '../components/TestForm';
import { mapTestToFormData } from './mapTestToFormData';

export const EditTest = () => {
  const { testId } = useParams();
  const numericTestId = Number(testId);

  const loadTest = useCallback(
    () => getTestById(numericTestId),
    [numericTestId],
  );

  const { data: test, loading, error, reload } = useAsyncData(
    Number.isInteger(numericTestId) ? loadTest : null,
  );

  const handleSubmit = async (payload: NewTestPayload) => {
    await updateTest(numericTestId, payload);
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <ErrorState message='Не вдалося завантажити тест.' onAction={reload} />;
  }

  if (!test) {
    return <ErrorState message='Тест не знайдено.' />;
  }

  return (
    <div className={styles.container}>
      <TestForm initialData={mapTestToFormData(test)} onSubmit={handleSubmit} />
    </div>
  );
};
