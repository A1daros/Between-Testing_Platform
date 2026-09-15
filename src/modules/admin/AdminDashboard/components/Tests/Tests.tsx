import { useEffect, useState } from 'react';
import type { TestWithLevels } from '../../../../../types/database';
import { TestsList } from './components/TestsList/TestsList';
import styles from './Tests.module.scss';
import { getTestsWithLevel } from '../../../../../services/tests';
import { useNavigate } from 'react-router-dom';

export const Tests = () => {
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
    <div className={styles.page}>
      <h2 className={styles.title}>BETWEEN/TESTS</h2>
      <div className={styles.container}>
        <TestsList allTests={testsWithLevels} onClick={handleAddTest} />
      </div>
    </div>
  );
};
