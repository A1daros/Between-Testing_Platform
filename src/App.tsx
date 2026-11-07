import styles from './styles/App.module.scss';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { HomePage } from './modules/home';
import { AdminRoute } from './routes/AdminRoute';
import { ApprovedRoute } from './routes/ApprovedRoute';
import { Header } from './modules/shared/components/Layout/Header';
import { Footer } from './modules/shared/components/Layout/Footer';
import { ScrollToTop } from './modules/shared/components/ScrollToTop';
import { Loader } from './modules/shared/components/Loader';
import { ROUTES } from './constants/routes';
import { ChunkError } from './modules/shared/components/ChunkError';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { lazyPage } from './utils/lazyPage';

const QuizPage = lazyPage(() => import('./modules/quiz'), 'QuizPage');
const ResultPage = lazyPage(() => import('./modules/results'), 'ResultPage');
const Login = lazyPage(
  () => import('./modules/authentication/Login'),
  'Login',
);
const Register = lazyPage(
  () => import('./modules/authentication/Register'),
  'Register',
);
const MyResults = lazyPage(
  () => import('./modules/results/MyResults'),
  'MyResults',
);
const ResultDetailsPage = lazyPage(
  () => import('./modules/results/ResultDetails'),
  'ResultDetailsPage',
);
const AwaitingApproval = lazyPage(
  () => import('./modules/authentication/AwaitingApproval'),
  'AwaitingApproval',
);
const TestsPage = lazyPage(() => import('./modules/tests'), 'TestsPage');
const TestsByLevel = lazyPage(
  () => import('./modules/tests/TestsByLevel'),
  'TestsByLevel',
);
const PlacementTest = lazyPage(
  () => import('./modules/tests/PlacementTest'),
  'PlacementTest',
);
const AboutSchool = lazyPage(
  () => import('./modules/about-school'),
  'AboutSchool',
);
const ForgotPassword = lazyPage(
  () => import('./modules/authentication/ForgotPassword'),
  'ForgotPassword',
);
const UpdatePassword = lazyPage(
  () => import('./modules/authentication/UpdatePassword'),
  'UpdatePassword',
);
const ProfilePage = lazyPage(() => import('./modules/profile'), 'ProfilePage');
const NotFoundPage = lazyPage(
  () => import('./modules/not-found'),
  'NotFoundPage',
);
const PrivacyPage = lazyPage(() => import('./modules/legal'), 'PrivacyPage');
const TermsPage = lazyPage(() => import('./modules/legal'), 'TermsPage');
const AdminRoutes = lazyPage(() => import('./modules/admin'), 'AdminRoutes');

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
                <Route path={ROUTES.terms} element={<TermsPage />} />
                <Route path={ROUTES.privacy} element={<PrivacyPage />} />
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
                  <Route
                    path={ROUTES.awaitingApproval}
                    element={<AwaitingApproval />}
                  />
                  <Route path={ROUTES.profile} element={<ProfilePage />} />

                  <Route element={<ApprovedRoute />}>
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
                  </Route>

                  <Route element={<AdminRoute />}>
                    <Route
                      path={ROUTES.adminWildcard}
                      element={<AdminRoutes />}
                    />
                  </Route>
                </Route>

                <Route path={ROUTES.notFound} element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </main>

        <SpeedInsights />
        <Analytics />
        <Footer />
      </div>
    </BrowserRouter>
  );
};
