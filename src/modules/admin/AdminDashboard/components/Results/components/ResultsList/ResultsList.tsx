import type React from 'react';
import type { Results } from '../../../../../../../types/database';
import styles from './ResultsList.module.scss';

type Props = {
  allStudentResults: Results[];
  checkDetails: (resultId: number) => void;
};

export const ResultsList: React.FC<Props> = ({
  allStudentResults,
  checkDetails,
}) => {
  return (
    <div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Student</th>
            <th>Test</th>
            <th>Score</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          {allStudentResults.map((student) => {
            return (
              <tr key={student.id} onClick={() => checkDetails(student.id)}>
                <td>{student.profiles?.display_name}</td>
                <td>{student.tests.title}</td>
                <td>
                  {student.score} / {student.total}
                </td>
                <td></td>
                <td>{student.created_at}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
