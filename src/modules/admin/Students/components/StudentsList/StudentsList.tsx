import type {
  ProfileStatus,
  StudentProfile,
} from '../../../../../types/database';
import { getStudentsColumns } from './studentsColumns';
import { Table } from '../../../components/Table';

type StudentsListProps = {
  students: StudentProfile[];
  onOpenDetails: (studentId: string) => void;
  onChangeStatus: (studentId: string, status: ProfileStatus) => void;
  updatingId: string | null;
};

export const StudentsList = ({
  students,
  onOpenDetails,
  onChangeStatus,
  updatingId,
}: StudentsListProps) => {
  return (
    <Table
      columns={getStudentsColumns(onChangeStatus, updatingId)}
      rows={students}
      onRowClick={(student) => onOpenDetails(student.id)}
      getRowLabel={(student) => `Відкрити профіль учня: ${student.display_name}`}
    />
  );
};
