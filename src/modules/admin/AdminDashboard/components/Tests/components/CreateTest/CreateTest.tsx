import { createTest } from '../../../../../../../services/testsForm';
import type { NewTestPayload } from '../../types/testForm';
import { TestForm } from '../TestForm/TestForm';

export const CreateTestForm = () => {
  const handleSubmit = (payload: NewTestPayload) => createTest(payload);

  return (
    <div>
      <div>
        <TestForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
};
