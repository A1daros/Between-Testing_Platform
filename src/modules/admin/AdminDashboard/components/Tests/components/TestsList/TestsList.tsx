import React from 'react';
import styles from './TestsList.module.scss';
import type { TestWithLevels } from '../../../../../../../types/database';
import { useNavigate } from 'react-router-dom';
import { Table } from '../../../common/Table';
import { getTestsColumns } from './testsColumns';

type Props = {
  allTests: TestWithLevels[];
  onClick: () => void;
};

export const TestsList: React.FC<Props> = ({ allTests, onClick }) => {
  const navigate = useNavigate();

  const columns = getTestsColumns(navigate);

  return (
    <div className={styles.page}>
      <Table columns={columns} rows={allTests} />

      <div>
        <button onClick={onClick}>Add Test</button>
      </div>
    </div>
  );
};
