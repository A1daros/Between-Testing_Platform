import { useNavigate } from 'react-router-dom';
import type { Test } from '../../../../../types/database';
import { Table } from '../../../components/Table';
import { getTestsColumns } from './testsColumns';

type TestsListProps = {
  tests: Test[];
  onDeleteClick: (testId: number) => void;
};

export const TestsList = ({ tests, onDeleteClick }: TestsListProps) => {
  const navigate = useNavigate();

  return (
    <Table columns={getTestsColumns(navigate, onDeleteClick)} rows={tests} />
  );
};
