import styles from './TestsList.module.scss';
import type { TestWithLevels } from '../../../../../../../types/database';
import { useNavigate } from 'react-router-dom';
import { Table } from '../../../common/Table';
import { getTestsColumns } from './testsColumns';

type TestsListProps = {
  allTests: TestWithLevels[];
  onDeleteClick: (id: number) => void;
};

export const TestsList = ({ allTests, onDeleteClick }: TestsListProps) => {
  const navigate = useNavigate();

  const columns = getTestsColumns(navigate, onDeleteClick);

  return (
    <div className={styles.page}>
      <Table columns={columns} rows={allTests} />
    </div>
  );
};
