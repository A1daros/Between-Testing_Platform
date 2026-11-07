import type {
  ProfileStatus,
  StudentProfile,
} from '../../../../../../../types/database';
import { getStudentsColumns } from './studentsColumns';
import { Table } from '../../../common/Table';

type StudentsListProps = {
  students: StudentProfile[];
  checkDetails: (studentId: string) => void;
  onChangeStatus: (studentId: string, status: ProfileStatus) => void;
  updatingId: string | null;
};

export const StudentsList = ({
  students,
  checkDetails,
  onChangeStatus,
  updatingId,
}: StudentsListProps) => {
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
