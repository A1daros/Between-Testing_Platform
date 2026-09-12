import React from 'react';
import styles from './StudentsList.module.scss';
import type { StudentProfile } from '../../../../../../../types/database';

type Props = {
  students: StudentProfile[];
  checkDetails: (studentId: string) => void;
};

export const StudentList: React.FC<Props> = ({ students, checkDetails }) => {
  return (
    <div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Fullname</th>
            <th>Email</th>
            <th>Tests taken</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          {students.map((student) => {
            return (
              <tr key={student.id} onClick={() => checkDetails(student.id)}>
                <td>{student.display_name}</td>
                <td>{student.email}</td>
                <td>{student.results?.[0]?.count ?? 0}</td>
                <td>{student.birth_date}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
