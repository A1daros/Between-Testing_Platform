import { createTest } from '../../../../../../../services/tests';
import type { NewTestPayload } from '../../types/testForm';
import { TestForm } from '../TestForm/TestForm';

export const CreateTestForm = () => {
  const handleSubmit = (payload: NewTestPayload) => createTest(payload);

  return (
    <div>
      <h2>Create Test | BETWEEN</h2>
      <div>
        <TestForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
};
