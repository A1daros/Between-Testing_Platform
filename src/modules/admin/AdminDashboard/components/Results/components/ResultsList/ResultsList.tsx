import type React from 'react';
import type { Results } from '../../../../../../../types/database';
import styles from './ResultsList.module.scss';
import { getResultsColumns } from './resultsColumns';
import { Table } from '../../../common/Table';

type Props = {
  allStudentResults: Results[];
  checkDetails: (resultId: number) => void;
};

export const ResultsList: React.FC<Props> = ({
  allStudentResults,
  checkDetails,
}) => {
  const columns = getResultsColumns();

  return (
    <div className={styles.page}>
      <Table
        columns={columns}
        rows={allStudentResults}
        onRowClick={(result) => checkDetails(result.id)}
      />
    </div>
  );
};
