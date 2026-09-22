import type { Program } from '../types/landing';

export const programsData: Program[] = [
  {
    id: 'kids',
    ageGroup: '7-9 років',
    title: 'First Steps',
    description:
      'Легкий старт без зубріння. Формуємо базовий словниковий запас через гру та живе спілкування.',
    formats: [
      {
        type: 'Групові заняття (4-5 учнів)',
        countPerLesson: '',
        lessonsCount: '8 занять / міс',
        duration: '60 хв',
        price: '2 400 грн',
      },
      {
        type: 'Парні заняття',
        countPerLesson: '',
        lessonsCount: '8 занять / міс',
        duration: '60 хв',
        price: '2 800 грн',
        isPopular: true,
      },
      {
        type: 'Індивідуальні',
        countPerLesson: '',
        lessonsCount: '8 занять / міс',
        duration: '50 хв',
        price: '3 600 грн',
      },
    ],
  },
  {
    id: 'juniors',
    ageGroup: '10-12 років',
    title: 'Speaking Confidence',
    description:
      'Подолання мовного бар’єру, розвиток сприйняття на слух та робота над правильної вимовою.',
    formats: [
      {
        type: 'Групові заняття (4-5 учнів)',
        countPerLesson: '',
        lessonsCount: '8 занять / міс',
        duration: '60 хв',
        price: '2 400 грн',
        isPopular: true,
      },
      {
        type: 'Парні заняття',
        countPerLesson: '',
        lessonsCount: '8 занять / міс',
        duration: '60 хв',
        price: '2 800 грн',
      },
      {
        type: 'Індивідуальні',
        countPerLesson: '',
        lessonsCount: '8 занять / міс',
        duration: '50 хв',
        price: '3 600 грн',
      },
    ],
  },
  {
    id: 'teens',
    ageGroup: '13-15 років',
    title: 'Global Mindset',
    description:
      'Вільне висловлення власної думки, розбір сучасного контенту та підготовка до міжнародного спілкування.',
    formats: [
      {
        type: 'Групові заняття (4-5 учнів)',
        countPerLesson: '',
        lessonsCount: '8 занять / міс',
        duration: '60 хв',
        price: '2 400 грн',
      },
      {
        type: 'Парні заняття',
        countPerLesson: '',
        lessonsCount: '8 занять / міс',
        duration: '60 хв',
        price: '2 800 грн',
        isPopular: true,
      },
      {
        type: 'Індивідуальні',
        countPerLesson: '',
        lessonsCount: '8 занять / міс',
        duration: '50 хв',
        price: '3 600 грн',
      },
    ],
  },
  {
    id: 'highschool',
    ageGroup: '16-17 років',
    title: 'NMT & Future Prep',
    description:
      'Інтенсивна підготовка до складання НМТ, вступу до ЗВО та впевненої англійської для життя.',
    formats: [
      {
        type: 'Групові заняття (4-5 учнів)',
        countPerLesson: '',
        lessonsCount: '8 занять / міс',
        duration: '60 хв',
        price: '2 400 грн',
      },
      {
        type: 'Парні заняття',
        countPerLesson: '',
        lessonsCount: '8 занять / міс',
        duration: '60 хв',
        price: '2 800 грн',
      },
      {
        type: 'Індивідуальні',
        countPerLesson: '',
        lessonsCount: '8 занять / міс',
        duration: '50 хв',
        price: '3 600 грн',
        isPopular: true,
      },
    ],
  },
];
