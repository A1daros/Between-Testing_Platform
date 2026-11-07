import type { Result } from '../../../../../types/database';
import { getResultsColumns } from './resultsColumns';
import { Table } from '../../../components/Table';

type ResultsListProps = {
  results: Result[];
  onOpenDetails: (resultId: number) => void;
};

export const ResultsList = ({ results, onOpenDetails }: ResultsListProps) => {
  return (
    <div>
      <Table
        columns={getResultsColumns()}
        rows={results}
        onRowClick={(result) => onOpenDetails(result.id)}
        getRowLabel={(result) =>
          `Відкрити результат: ${result.profiles?.display_name ?? 'учень'}, ${result.tests.title}`
        }
      />
    </div>
  );
};
