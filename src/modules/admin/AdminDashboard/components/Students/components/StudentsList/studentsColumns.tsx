import type { StudentProfile } from '../../../../../../../types/database';
import type { ColumnConfig } from '../../../../../types/table';

export const getStudentsColumns = (): ColumnConfig<StudentProfile>[] => [
  {
    label: 'Fullname',
    key: 'display_name',
  },
  {
    label: 'Email',
    key: 'email',
  },
  {
    label: 'Test completed',
    render: (student) => student.results?.[0]?.count ?? 0,
  },
];
