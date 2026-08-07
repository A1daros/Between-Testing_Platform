import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import { HomePage } from './modules/home/HomePage';
import { QuizPage } from './modules/quiz';

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/tests/:testId' element={<QuizPage />} />
      </Routes>
    </BrowserRouter>
  );
};
