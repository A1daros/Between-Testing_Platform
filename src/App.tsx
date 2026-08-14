import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QuizPage } from './modules/quiz';
import { ResultPage } from './modules/results';
import './App.css';
import { AdminPage } from './modules/admin';
import { UserAnswersDetails } from './modules/admin/components';
import { Login } from './modules/authentication/components/login';
import { Register } from './modules/authentication/components/register';
import { MyResults } from './modules/results/myResults';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { HomePage } from './modules/home';

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route path='/' element={<HomePage />} />
          <Route path='/tests/:testId' element={<QuizPage />} />
          <Route path='/my-results' element={<MyResults />} />

          <Route path='/tests/:testId/results' element={<ResultPage />} />
          <Route path='/admin/results/:testId' element={<AdminPage />} />
          <Route
            path='/admin/result-details/:resultId'
            element={<UserAnswersDetails />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
