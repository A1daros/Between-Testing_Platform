import { BrowserRouter, Route, Routes } from 'react-router-dom';
// import { HomePage } from './modules/home/HomePage';
import { QuizPage } from './modules/quiz';
import { ResultPage } from './modules/results';
import './App.css';
import { AdminPage } from './modules/admin';
import { UserAnswersDetails } from './modules/admin/components';
import { HomePage } from './modules/home';
import { Login } from './modules/authentication/components/login';
import { Register } from './modules/authentication/components/register';

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/' element={<HomePage />} />
        <Route path='/tests/:testId' element={<QuizPage />} />
        <Route path='/tests/:testId/results' element={<ResultPage />} />
        <Route path='/admin/results/:testId' element={<AdminPage />} />
        <Route
          path='/admin/result-details/:resultId'
          element={<UserAnswersDetails />}
        />
      </Routes>
    </BrowserRouter>
  );
};
