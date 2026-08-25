import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QuizPage } from './modules/quiz';
import { ResultPage } from './modules/results';
import './App.css';
import { AdminPage } from './modules/admin';
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

export const App = () => {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route path='/' element={<HomePage />} />
          <Route path='/tests' element={<TestsPage />} />
          <Route path='/tests/level/:levelId' element={<TestsByLevel />} />
          <Route path='/levels/:testId' element={<QuizPage />} />
          <Route path='/my-results' element={<MyResults />} />
          <Route path='/my-results/:resultId' element={<ResultDetailsPage />} />

          <Route element={<AdminRoute />}>
            <Route path='/admin/results/:testId' element={<AdminPage />} />
            <Route
              path='/admin/result-details/:resultId'
              element={<ResultDetailsPage />}
            />
          </Route>

          <Route path='/tests/:testId/results' element={<ResultPage />} />
        </Route>
      </Routes>
      <Footer />
    </BrowserRouter>
  );
};
