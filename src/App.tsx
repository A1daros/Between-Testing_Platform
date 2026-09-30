import styles from './styles/App.module.scss';
import { lazy, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QuizPage } from './modules/quiz';
import { ResultPage } from './modules/results';
import { Login } from './modules/authentication/components/login';
import { Register } from './modules/authentication/components/register';
import { MyResults } from './modules/results/myResults';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { HomePage } from './modules/home';
import { ResultDetailsPage } from './modules/results/components/resultDetails/ResultDetailsPage';
import { AdminRoute } from './routes/AdminRoute';
import { Header } from './modules/shared/components/Layuot/Header';
import { Footer } from './modules/shared/components/Layuot/Footer';
import { TestsPage } from './modules/tests';
import { TestsByLevel } from './modules/tests/TestsByLevel';
import { PlacementTest } from './modules/tests/PlacementTest';
import { AboutSchool } from './modules/about-school';
import { ScrollToTop } from './utils/ScrollToTop';
import { ForgotPassword } from './modules/authentication/components/forgot-password';
import { UpdatePassword } from './modules/authentication/components/update-password';
import { Loader } from './modules/Loader';
import { ROUTES } from './constants/routes';
import { ChunkError } from './modules/shared/components/ChunkError';
import { ProfilePage } from './modules/profile';

const AdminRoutes = lazy(() =>
  import('./modules/admin/AdminRoutes').then((module) => ({
    default: module.AdminRoutes,
  })),
);

export const App = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <div className={styles.appLayout}>
        <Header />

        <main className={styles.mainContent}>
          <ErrorBoundary fallbackRender={ChunkError}>
            <Suspense fallback={<Loader />}>
              <Routes>
                <Route path={ROUTES.home} element={<HomePage />} />
                <Route path={ROUTES.aboutSchool} element={<AboutSchool />} />
                <Route
                  path={ROUTES.placementTest}
                  element={<PlacementTest />}
                />
                <Route path={ROUTES.login} element={<Login />} />
                <Route path={ROUTES.register} element={<Register />} />
                <Route
                  path={ROUTES.forgotPassword}
                  element={<ForgotPassword />}
                />
                <Route
                  path={ROUTES.updatePassword}
                  element={<UpdatePassword />}
                />

                <Route element={<ProtectedRoute />}>
                  <Route path={ROUTES.tests} element={<TestsPage />} />
                  <Route
                    path={ROUTES.testsByLevel}
                    element={<TestsByLevel />}
                  />
                  <Route path={ROUTES.quiz} element={<QuizPage />} />
                  <Route path={ROUTES.testResult} element={<ResultPage />} />
                  <Route path={ROUTES.myResults} element={<MyResults />} />
                  <Route
                    path={ROUTES.myResultDetails}
                    element={<ResultDetailsPage />}
                  />
                  <Route path={ROUTES.profile} element={<ProfilePage />} />

                  <Route element={<AdminRoute />}>
                    <Route
                      path={ROUTES.adminWildcard}
                      element={<AdminRoutes />}
                    />
                  </Route>
                </Route>
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
};
