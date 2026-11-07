import { Navigate, Routes, Route } from 'react-router-dom';
import { AdminPage } from './AdminPage';
import { ADMIN_ROUTES } from '../../constants/routes';
import { Overview } from './AdminDashboard/components/Overview';
import { Tests } from './AdminDashboard/components/Tests';
import { CreateTest } from './AdminDashboard/components/Tests/components/CreateTest';
import { EditTest } from './AdminDashboard/components/Tests/components/EditTest';
import { Results } from './AdminDashboard/components/Results';
import { ResultDetails } from './AdminDashboard/components/Results/components/ResultDetails/ResultDetails';
import { Students } from './AdminDashboard/components/Students/Students';
import { StudentDetails } from './AdminDashboard/components/Students/components/StudentDetails/StudentDetails';

export const AdminRoutes = () => {
  return (
    <Routes>
      <Route element={<AdminPage />}>
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
