import React from 'react';
import type {
  ProfileStatus,
  StudentProfile,
} from '../../../../../../../types/database';
import { getStudentsColumns } from './studentsColumns';
import { Table } from '../../../common/Table';

type Props = {
  students: StudentProfile[];
  checkDetails: (studentId: string) => void;
  onChangeStatus: (studentId: string, status: ProfileStatus) => void;
  updatingId: string | null;
};

export const StudentList: React.FC<Props> = ({
  students,
  checkDetails,
  onChangeStatus,
  updatingId,
}) => {
  const columns = getStudentsColumns(onChangeStatus, updatingId);

  return (
    <div>
      <Table
        columns={columns}
        rows={students}
        onRowClick={(student) => checkDetails(student.id)}
      />
    </div>
  );
};
