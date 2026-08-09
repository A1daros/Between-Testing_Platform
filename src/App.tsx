import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { HomePage } from './modules/home/HomePage';
import { QuizPage } from './modules/quiz';
import { ResultPage } from './modules/results';
import './App.css';

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/tests/:testId' element={<QuizPage />} />
        <Route path='/tests/:testId/results' element={<ResultPage />} />
      </Routes>
    </BrowserRouter>
  );
};
