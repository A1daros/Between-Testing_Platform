import type { Result } from '../../../../../../../types/database';
import styles from './ResultsList.module.scss';
import { getResultsColumns } from './resultsColumns';
import { Table } from '../../../common/Table';

type ResultsListProps = {
  allStudentResults: Result[];
  checkDetails: (resultId: number) => void;
};

export const ResultsList = ({
  allStudentResults,
  checkDetails,
}: ResultsListProps) => {
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
