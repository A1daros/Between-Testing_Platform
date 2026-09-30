import { Navigate, Routes, Route } from 'react-router-dom';
import { AdminPage } from './AdminPage';
import { ADMIN_ROUTES } from '../../constants/routes';
import { Overview } from './AdminDashboard/components/Overview';
import { Tests } from './AdminDashboard/components/Tests';
import { CreateTestForm } from './AdminDashboard/components/Tests/components/CreateTest';
import { EditTestForm } from './AdminDashboard/components/Tests/components/EditTest';
import { ResultsOverview } from './AdminDashboard/components/Results';
import { ResultDetailsOverview } from './AdminDashboard/components/Results/components/ResultDetails/ResultDetails';
import { Students } from './AdminDashboard/components/Students/Students';
import { StudentDetailsOverview } from './AdminDashboard/components/Students/components/StudentDetails/StudentDetails';

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
        <Route path={ADMIN_ROUTES.testCreate} element={<CreateTestForm />} />
        <Route path={ADMIN_ROUTES.testEdit} element={<EditTestForm />} />
        <Route path={ADMIN_ROUTES.results} element={<ResultsOverview />} />
        <Route
          path={ADMIN_ROUTES.resultDetails}
          element={<ResultDetailsOverview />}
        />
        <Route path={ADMIN_ROUTES.students} element={<Students />} />
        <Route
          path={ADMIN_ROUTES.studentDetails}
          element={<StudentDetailsOverview />}
        />
      </Route>
    </Routes>
  );
};
