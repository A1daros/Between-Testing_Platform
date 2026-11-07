import { createTest } from '../../../../services/tests';
import type { NewTestPayload } from '../../../../types/testForm';
import { TestForm } from '../components/TestForm';

const handleSubmit = async (payload: NewTestPayload) => {
  await createTest(payload);
};

export const CreateTest = () => {
  return <TestForm onSubmit={handleSubmit} />;
};
