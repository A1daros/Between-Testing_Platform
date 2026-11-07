import { Navigate, Routes, Route } from 'react-router-dom';
import { ADMIN_ROUTES } from '../../constants/routes';
import { AdminLayout } from './AdminLayout';
import { Overview } from './Overview';
import { Tests } from './Tests';
import { CreateTest } from './Tests/CreateTest';
import { EditTest } from './Tests/EditTest';
import { Results } from './Results';
import { ResultDetails } from './Results/ResultDetails';
import { Students } from './Students';
import { StudentDetails } from './Students/StudentDetails';

export const AdminRoutes = () => {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route
          index
          element={<Navigate to={ADMIN_ROUTES.overview} replace />}
        />
        <Route path={ADMIN_ROUTES.overview} element={<Overview />} />
        <Route path={ADMIN_ROUTES.tests} element={<Tests />} />
        <Route path={ADMIN_ROUTES.testCreate} element={<CreateTest />} />
        <Route path={ADMIN_ROUTES.testEdit} element={<EditTest />} />
        <Route path={ADMIN_ROUTES.results} element={<Results />} />
        <Route
          path={ADMIN_ROUTES.resultDetails}
          element={<ResultDetails />}
        />
        <Route path={ADMIN_ROUTES.students} element={<Students />} />
        <Route
          path={ADMIN_ROUTES.studentDetails}
          element={<StudentDetails />}
        />
      </Route>
    </Routes>
  );
};
