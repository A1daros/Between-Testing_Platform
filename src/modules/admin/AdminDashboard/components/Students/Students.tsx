import { useEffect, useMemo, useState } from 'react';
import { SearchInput } from '../common/SearchInput/SearchInput';
import type { StudentProfile } from '../../../../../types/database';
import { loadStudents } from '../../../../../services/profile';
import { StudentList } from './components/StudentsList/StudentsList';

export const Students = () => {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await loadStudents();

        setStudents(data);
      } catch (error) {
        console.error('Failed to load students', error);
      }
    };

    loadData();
  }, []);

  const filteredSudents = useMemo(() => {
    return students.filter((student) => {
      const name = student.display_name ?? '';

      return name.toLowerCase().includes(query.toLowerCase());
    });
  }, [students, query]);

  return (
    <div>
      <h2>BETWEEN/STUDENTS</h2>
      <div>
        <SearchInput value={query} onChange={setQuery} />

        <StudentList students={filteredSudents} checkDetails={() => {}} />
      </div>
    </div>
  );
};
