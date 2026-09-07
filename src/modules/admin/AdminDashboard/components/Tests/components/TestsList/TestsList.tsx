import { useEffect, useState } from 'react';
import styles from './TestsList.module.scss';
import type { TestWithLevels } from '../../../../../../../types/database';
import { getTestsWithLevel } from '../../../../../../../services/quiz';
import { useNavigate } from 'react-router-dom';

export const TestsList = () => {
  const [testsWithLevels, setTestsWithLevels] = useState<TestWithLevels[]>([]);
  const navigate = useNavigate();

  const handleAddTest = () => navigate('/admin/tests/create');

  useEffect(() => {
    const loadTests = async () => {
      try {
        const data = await getTestsWithLevel();

        setTestsWithLevels(data);
      } catch (error) {
        console.error(error);
      }
    };

    loadTests();
  }, []);

  return (
    <div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Level</th>
            <th>Q-s</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {testsWithLevels.map((test) => {
            const handleEditTest = () => {
              navigate(`/admin/tests/${test.id}/edit`);
            };

            return (
              <tr key={test.id}>
                <td>{test.title}</td>
                <td>{test.levels?.code}</td>
                <td>
                  {Array.isArray(test.questions)
                    ? (test.questions[0]?.count ?? 0)
                    : 0}
                </td>
                <td>
                  <button onClick={handleEditTest}>Edit / Delete</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div>
        <button onClick={handleAddTest}>Add Test</button>
      </div>
    </div>
  );
};
