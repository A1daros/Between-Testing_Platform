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
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          {allStudentResults.map((student) => {
            const date = new Date(student.created_at).toLocaleDateString();

            return (
              <tr key={student.id} onClick={() => checkDetails(student.id)}>
                <td>{student.profiles?.display_name}</td>
                <td>{student.tests.title}</td>
                <td>
                  {student.score} / {student.total}
                </td>
                <td>{date}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
