import React from 'react';
import styles from './StudentsList.module.scss';
import type { StudentProfile } from '../../../../../../../types/database';
import { getStudentsColumns } from './studentsColumns';
import { Table } from '../../../common/Table';

type Props = {
  students: StudentProfile[];
  checkDetails: (studentId: string) => void;
};

export const StudentList: React.FC<Props> = ({ students, checkDetails }) => {
  const columns = getStudentsColumns();

  return (
    <div className={styles.page}>
      <Table
        columns={columns}
        rows={students}
        onRowClick={(student) => checkDetails(student.id)}
      />
    </div>
  );
};
